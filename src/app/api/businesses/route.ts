import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  sanitizeString, sanitizeColor, sanitizeLang,
  sanitizeRating, sanitizeUrl, sanitizePlatforms,
} from '@/lib/security/sanitize';

/* GET /api/businesses */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', user.id)
    .single();

  return NextResponse.json({ business: business ?? null });
}

/* POST /api/businesses — upsert (used by onboarding to progressively save) */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const name = sanitizeString(body?.name, 120);
  if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 });

  const payload = {
    owner_id:              user.id,
    name,
    tagline:               sanitizeString(body?.tagline, 200) || null,
    google_link:           sanitizeUrl(body?.google_link) || null,
    brand_color:           sanitizeColor(body?.brand_color) ?? '#6E5BFF',
    logo_initials:         sanitizeString(body?.logo_initials, 2).toUpperCase() || name.slice(0, 2).toUpperCase(),
    min_rating_for_google: sanitizeRating(body?.min_rating_for_google, 1, 5),
    language:              sanitizeLang(body?.language),
    review_platforms:      sanitizePlatforms(body?.review_platforms),
    onboarding_complete:   Boolean(body?.onboarding_complete),
  };

  // Check if a business already exists for this owner
  const { data: existing } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle();

  let business, error;
  if (existing) {
    const { owner_id: _omit, ...updatePayload } = payload;
    ({ data: business, error } = await supabase
      .from('businesses')
      .update({ ...updatePayload, updated_at: new Date().toISOString() })
      .eq('owner_id', user.id)
      .select()
      .single());
  } else {
    ({ data: business, error } = await supabase
      .from('businesses')
      .insert(payload)
      .select()
      .single());
  }

  if (error) {
    console.error('[POST /api/businesses]', error);
    return NextResponse.json({ error: error.message, code: error.code }, { status: 500 });
  }
  return NextResponse.json({ business }, { status: 201 });
}

/* PATCH /api/businesses — partial update */
export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
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

  for (const key of Object.keys(updates)) {
    if (updates[key] === undefined) delete updates[key];
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  const { data: business, error } = await supabase
    .from('businesses')
    .update(updates)
    .eq('owner_id', user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ business });
}
