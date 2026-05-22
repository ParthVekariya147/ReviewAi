import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateReview } from '@/lib/ai/generate';
import { rateLimit, getClientIp } from '@/lib/security/rateLimit';
import type { ReviewPlatformEntry } from '@/lib/platforms';

/* POST /api/funnel/generate
   Called from the customer funnel (no auth required).
   Generates an AI review draft and saves it to generated_reviews.
   Body: { token: string; rating: number }
   Returns: { text: string; review_id: string }            */
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

  const token  = typeof body.token  === 'string'  ? body.token.trim()      : '';
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

  /* Generate the review text via multi-provider AI */
  let aiText: string;
  try {
    aiText = await generateReview({
      businessName:   biz.name,
      tagline:        biz.tagline        ?? '',
      businessType:   biz.business_type  ?? '',
      reviewKeywords: biz.review_keywords ?? '',
      rating,
      language:       biz.language ?? 'en',
    });
  } catch (e) {
    console.error('[funnel/generate] AI error:', e);
    return NextResponse.json({ error: 'Generation failed' }, { status: 503 });
  }

  /* Save to generated_reviews — use admin client to bypass RLS (public funnel, no user session) */
  const db = createAdminClient();
  const { data: review, error: dbError } = await db
    .from('generated_reviews')
    .insert({
      qr_id:       qr.id,
      business_id: qr.business_id,
      rating,
      ai_text:     aiText,
      status:      'generated',
    })
    .select('id')
    .single();

  if (dbError || !review) {
    console.error('[funnel/generate] DB error:', dbError);
    return NextResponse.json({ error: 'Failed to save your review. Please try again.' }, { status: 503 });
  }

  return NextResponse.json({ text: aiText, review_id: review.id });
}
