import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateReview } from '@/lib/ai/generate';
import { rateLimit, getClientIp } from '@/lib/security/rateLimit';
import type { ReviewPlatformEntry } from '@/lib/platforms';

/* POST /api/funnel/generate
   Called from the customer funnel (no auth required).
   Generates 2 AI drafts in parallel and saves both to generated_reviews.
   Body: { token: string; rating: number }
   Returns: { drafts: [{ text: string; review_id: string }] }  */
export async function POST(req: NextRequest) {
  /* Rate limit: 20 generations / minute per IP */
  const ip = getClientIp(req);
  const rl = rateLimit(`funnel-gen:${ip}`, 20, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, {
      status: 429,
      headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
    });
  }

  let body: { token?: string; rating?: number };
  try { body = await req.json(); } catch { body = {}; }

  const token  = typeof body.token  === 'string'  ? body.token.trim()       : '';
  const rating = typeof body.rating === 'number'  ? Math.round(body.rating) : 0;

  if (!token || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const supabase = await createClient();

  /* Resolve QR token → qr_id + business details */
  const { data: qr, error: qrError } = await supabase
    .from('qr_codes')
    .select(`
      id, business_id,
      businesses (
        name, tagline, language, review_platforms,
        business_type, review_keywords
      )
    `)
    .eq('token', token)
    .eq('status', 'live')
    .single();

  if (qrError) {
    console.error('[funnel/generate] QR lookup error:', qrError);
    return NextResponse.json({ error: 'Unknown token' }, { status: 404 });
  }
  if (!qr || !qr.businesses) {
    return NextResponse.json({ error: 'Unknown token' }, { status: 404 });
  }

  const biz = (Array.isArray(qr.businesses) ? qr.businesses[0] : qr.businesses) as {
    name: string;
    tagline: string | null;
    language: string;
    review_platforms: ReviewPlatformEntry[] | null;
    business_type: string | null;
    review_keywords: string | null;
  };

  const reviewReq = {
    businessName:   biz.name,
    tagline:        biz.tagline        ?? '',
    businessType:   biz.business_type  ?? '',
    reviewKeywords: biz.review_keywords ?? '',
    rating,
    language:       biz.language ?? 'en',
  };

  /* Generate 2 drafts in parallel */
  const [r1, r2] = await Promise.allSettled([
    generateReview(reviewReq),
    generateReview(reviewReq),
  ]);

  const texts: string[] = [];
  if (r1.status === 'fulfilled') texts.push(r1.value);
  if (r2.status === 'fulfilled') texts.push(r2.value);

  if (texts.length === 0) {
    console.error('[funnel/generate] Both AI generations failed');
    return NextResponse.json({ error: 'Generation failed' }, { status: 503 });
  }

  /* Save all successful drafts to generated_reviews */
  const db = createAdminClient();
  const inserts = texts.map(ai_text => ({
    qr_id:       qr.id,
    business_id: qr.business_id,
    rating,
    ai_text,
    status: 'generated',
  }));

  // Do NOT chain .order() after .insert().select() — some PostgREST versions
  // return an empty array when ORDER BY is applied to a mutation response,
  // causing a false-positive "no rows saved" error even when the insert succeeded.
  const { data: saved, error: dbError } = await db
    .from('generated_reviews')
    .insert(inserts)
    .select('id, ai_text');

  if (dbError || !saved?.length) {
    console.error('[funnel/generate] DB error:', dbError);
    console.error('[funnel/generate] Insert payload:', JSON.stringify(inserts));
    // Expose actual DB error in development so it is visible in the browser
    return NextResponse.json({
      error: 'Failed to save your review. Please try again.',
      ...(process.env.NODE_ENV === 'development' && {
        debug: {
          message:  dbError?.message  ?? null,
          code:     dbError?.code     ?? null,
          details:  dbError?.details  ?? null,
          hint:     dbError?.hint     ?? null,
          rowCount: saved?.length     ?? 0,
        },
      }),
    }, { status: 503 });
  }

  const drafts = saved.map(r => ({ text: r.ai_text as string, review_id: r.id as string }));
  return NextResponse.json({ drafts });
}
