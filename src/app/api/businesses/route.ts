import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  BUSINESS_COOKIE,
  getCurrentBusiness,
  normalizeBusiness,
  normalizeLegacyBusiness,
  shouldUseLegacyBusinessFallback,
} from '@/lib/businesses/current';
import {
  sanitizeString, sanitizeColor, sanitizeLang,
  sanitizeRating, sanitizeUrl, sanitizePlatforms,
} from '@/lib/security/sanitize';

const VALID_LENGTHS = new Set(['short', 'medium', 'long']);

function sanitizeReviewLengths(raw: unknown): string[] {
  if (!Array.isArray(raw)) return ['short', 'medium'];
  const filtered = raw.filter((v): v is string => typeof v === 'string' && VALID_LENGTHS.has(v));
  return filtered.length > 0 ? filtered : ['short', 'medium'];
}

type ApiError = { code?: string | null; message?: string | null } | null;

type BusinessPayload = {
  owner_id: string;
  name: string;
  tagline: string | null;
  google_link: string | null;
  brand_color: string;
  logo_initials: string;
  min_rating_for_google: number;
  language: string;
  review_platforms: { id: string; url: string; enabled: boolean }[];
  onboarding_complete: boolean;
  business_type: string | null;
  review_keywords: string | null;
};

function isMissingUpsertRpcError(error: ApiError) {
  if (!error?.message) return false;
  return error.code === 'PGRST202'
    || (error.message.includes('upsert_business') && error.message.toLowerCase().includes('function'));
}

function buildPayload(body: Record<string, unknown> | null, userId: string): BusinessPayload {
  const name = sanitizeString(body?.name, 120);

  return {
    owner_id:              userId,
    name,
    tagline:               sanitizeString(body?.tagline, 200) || null,
    google_link:           sanitizeUrl(body?.google_link) || null,
    brand_color:           sanitizeColor(body?.brand_color) ?? '#6E5BFF',
    logo_initials:         sanitizeString(body?.logo_initials, 2).toUpperCase() || name.slice(0, 2).toUpperCase(),
    min_rating_for_google: sanitizeRating(body?.min_rating_for_google, 1, 5),
    language:              sanitizeLang(body?.language),
    review_platforms:      sanitizePlatforms(body?.review_platforms),
    onboarding_complete:   Boolean(body?.onboarding_complete),
    business_type:         sanitizeString(body?.business_type, 60) || null,
    review_keywords:       sanitizeString(body?.review_keywords, 300) || null,
  };
}

async function upsertBusinessViaRpc(
  supabase: Awaited<ReturnType<typeof createClient>>,
  payload: BusinessPayload,
) {
  const { data, error } = await supabase.rpc('upsert_business', {
    p_owner_id: payload.owner_id,
    p_name: payload.name,
    p_tagline: payload.tagline,
    p_google_link: payload.google_link,
    p_brand_color: payload.brand_color,
    p_logo_initials: payload.logo_initials,
    p_min_rating_for_google: payload.min_rating_for_google,
    p_language: payload.language,
    p_review_platforms: payload.review_platforms,
    p_onboarding_complete: payload.onboarding_complete,
    p_business_type: payload.business_type,
    p_review_keywords: payload.review_keywords,
  });

  return {
    business: normalizeBusiness((data ?? null) as Record<string, unknown> | null),
    error,
  };
}

async function upsertBusinessDirect(
  supabase: Awaited<ReturnType<typeof createClient>>,
  ownerId: string,
  payload: BusinessPayload,
) {
  const { data: existing, error: existingError } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', ownerId)
    .maybeSingle();

  if (existingError) {
    return { business: null, error: existingError };
  }

  let data;
  let error;

  if (existing) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { owner_id: _, ...updatePayload } = payload;
    ({ data, error } = await supabase
      .from('businesses')
      .update({ ...updatePayload, updated_at: new Date().toISOString() })
      .eq('owner_id', ownerId)
      .select()
      .single());
  } else {
    ({ data, error } = await supabase
      .from('businesses')
      .insert(payload)
      .select()
      .single());
  }

  return {
    business: normalizeBusiness((data ?? null) as Record<string, unknown> | null),
    error,
  };
}

async function upsertLegacyBusiness(
  supabase: Awaited<ReturnType<typeof createClient>>,
  legacyBusinessId: string | null,
  payload: BusinessPayload,
) {
  const legacyPayload = {
    name:                 payload.name,
    category:             'General',
    services:             [],
    google_review_link:   payload.google_link,
    logo_url:             null,
    description:          payload.tagline,
    brand_primary_color:  payload.brand_color,
    brand_tagline:        payload.tagline,
    onboarding_completed: payload.onboarding_complete,
    qr_request_status:    'not_requested',
    updated_at:           new Date().toISOString(),
  };

  let data;
  let error;

  if (legacyBusinessId) {
    ({ data, error } = await supabase
      .from('businesses')
      .update(legacyPayload)
      .eq('id', legacyBusinessId)
      .select()
      .single());
  } else {
    ({ data, error } = await supabase
      .from('businesses')
      .insert(legacyPayload)
      .select()
      .single());
  }

  return {
    business: normalizeLegacyBusiness((data ?? null) as Record<string, unknown> | null),
    error,
  };
}

function attachBusinessCookie(response: NextResponse, businessId: unknown) {
  if (typeof businessId !== 'string' || !businessId) return;

  response.cookies.set(BUSINESS_COOKIE, businessId, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
  });
}

/* GET /api/businesses */
export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { business, error } = await getCurrentBusiness(supabase, user.id);
  if (error) {
    console.error('[GET /api/businesses]', error);
    return NextResponse.json({ error: 'Failed to load business' }, { status: 500 });
  }

  // LOW-1: omit ownerEmail from response — fetch from supabase.auth on client if needed
  return NextResponse.json({ business });
}

/* POST /api/businesses - upsert (used by onboarding to progressively save) */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const db = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const payload = buildPayload(body as Record<string, unknown> | null, user.id);
  if (!payload.name) return NextResponse.json({ error: 'name is required' }, { status: 400 });

  let result = await upsertBusinessViaRpc(db as Awaited<ReturnType<typeof createClient>>, payload);

  if (result.error && isMissingUpsertRpcError(result.error)) {
    result = await upsertBusinessDirect(db as Awaited<ReturnType<typeof createClient>>, user.id, payload);
  }

  if (result.error && shouldUseLegacyBusinessFallback(result.error)) {
    result = await upsertLegacyBusiness(
      db as Awaited<ReturnType<typeof createClient>>,
      req.cookies.get(BUSINESS_COOKIE)?.value ?? null,
      payload,
    );
  }

  if (result.error) {
    console.error('[POST /api/businesses]', result.error);
    return NextResponse.json(
      { error: result.error.message, code: result.error.code },
      { status: 500 },
    );
  }

  // Persist the wizard step for mid-onboarding resume
  const rawStep = (body as Record<string, unknown> | null)?.onboarding_step;
  if (typeof rawStep === 'number' && Number.isInteger(rawStep) && rawStep >= 0) {
    await db.from('businesses').update({ onboarding_step: rawStep }).eq('owner_id', user.id);
  }

  const response = NextResponse.json({ business: result.business }, { status: 200 });
  attachBusinessCookie(response, result.business?.id);
  return response;
}

/* PATCH /api/businesses - partial update */
export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const db = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const updates: Record<string, unknown> = {};

  if ('name'                  in body) updates.name                  = sanitizeString(body.name, 120) || undefined;
  if ('tagline'               in body) updates.tagline               = sanitizeString(body.tagline, 200) || null;
  if ('google_link'           in body) updates.google_link           = sanitizeUrl(body.google_link) || null;
  if ('brand_color'           in body) updates.brand_color           = sanitizeColor(body.brand_color) ?? undefined;
  if ('logo_initials'         in body) updates.logo_initials         = sanitizeString(body.logo_initials, 2).toUpperCase() || undefined;
  if ('min_rating_for_google' in body) updates.min_rating_for_google = sanitizeRating(body.min_rating_for_google, 1, 5);
  if ('language'              in body) updates.language              = sanitizeLang(body.language);
  if ('review_platforms'      in body) updates.review_platforms      = sanitizePlatforms(body.review_platforms);
  if ('onboarding_complete'   in body) updates.onboarding_complete   = Boolean(body.onboarding_complete);
  if ('business_type'             in body) updates.business_type             = sanitizeString(body.business_type, 60) || null;
  if ('review_keywords'           in body) updates.review_keywords           = sanitizeString(body.review_keywords, 300) || null;
  if ('review_length_preference'  in body) updates.review_length_preference  = sanitizeReviewLengths(body.review_length_preference);

  for (const key of Object.keys(updates)) {
    if (updates[key] === undefined) delete updates[key];
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  const current = await getCurrentBusiness(supabase, user.id);
  if (current.error) {
    return NextResponse.json({ error: current.error.message, code: current.error.code }, { status: 500 });
  }
  if (!current.business) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 });
  }

  const payload: BusinessPayload = {
    owner_id: user.id,
    name: typeof updates.name === 'string' ? updates.name : String(current.business.name ?? ''),
    tagline: 'tagline' in updates
      ? (updates.tagline as string | null)
      : (current.business.tagline as string | null),
    google_link: 'google_link' in updates
      ? (updates.google_link as string | null)
      : (current.business.google_link as string | null),
    brand_color: typeof updates.brand_color === 'string'
      ? updates.brand_color
      : String(current.business.brand_color ?? '#6E5BFF'),
    logo_initials: typeof updates.logo_initials === 'string'
      ? updates.logo_initials
      : String(current.business.logo_initials ?? 'BZ'),
    min_rating_for_google: typeof updates.min_rating_for_google === 'number'
      ? updates.min_rating_for_google
      : Number(current.business.min_rating_for_google ?? 4),
    language: typeof updates.language === 'string'
      ? updates.language
      : String(current.business.language ?? 'en'),
    review_platforms: Array.isArray(updates.review_platforms)
      ? updates.review_platforms as { id: string; url: string; enabled: boolean }[]
      : (
        Array.isArray(current.business.review_platforms)
          ? current.business.review_platforms as { id: string; url: string; enabled: boolean }[]
          : []
      ),
    onboarding_complete: typeof updates.onboarding_complete === 'boolean'
      ? updates.onboarding_complete
      : Boolean(current.business.onboarding_complete),
    business_type: 'business_type' in updates
      ? (updates.business_type as string | null)
      : ((current.business.business_type as string | null) ?? null),
    review_keywords: 'review_keywords' in updates
      ? (updates.review_keywords as string | null)
      : ((current.business.review_keywords as string | null) ?? null),
  };

  let result = current.schema === 'legacy'
    ? await upsertLegacyBusiness(db as Awaited<ReturnType<typeof createClient>>, String(current.business.id), payload)
    : await upsertBusinessViaRpc(db as Awaited<ReturnType<typeof createClient>>, payload);

  if (current.schema !== 'legacy' && result.error && isMissingUpsertRpcError(result.error)) {
    result = await upsertBusinessDirect(db as Awaited<ReturnType<typeof createClient>>, user.id, payload);
  }

  if (result.error && shouldUseLegacyBusinessFallback(result.error)) {
    result = await upsertLegacyBusiness(
      db as Awaited<ReturnType<typeof createClient>>,
      req.cookies.get(BUSINESS_COOKIE)?.value ?? String(current.business.id),
      payload,
    );
  }

  if (result.error) {
    return NextResponse.json({ error: result.error.message, code: result.error.code }, { status: 500 });
  }

  // review_length_preference is not in the upsert_business RPC, so save it directly.
  if ('review_length_preference' in updates) {
    await db
      .from('businesses')
      .update({ review_length_preference: updates.review_length_preference })
      .eq('owner_id', user.id);
    if (result.business) {
      result.business.review_length_preference = updates.review_length_preference;
    }
  }

  const response = NextResponse.json({ business: result.business });
  attachBusinessCookie(response, result.business?.id);
  return response;
}
