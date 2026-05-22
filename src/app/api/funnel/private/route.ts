import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { rateLimit, getClientIp } from '@/lib/security/rateLimit';

/* POST /api/funnel/private
   Saves a private (low-rating) feedback entry.
   No auth required — public endpoint from the customer funnel.
   Body: { token: string; rating: number; feedback: string }   */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = rateLimit(`funnel-private:${ip}`, 10, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, {
      status: 429,
      headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
    });
  }

  let body: { token?: string; rating?: number; feedback?: string };
  try { body = await req.json(); } catch { body = {}; }

  const MAX_FEEDBACK_LEN = 2000;
  const token    = typeof body.token    === 'string' ? body.token.trim()                              : '';
  const feedback = typeof body.feedback === 'string' ? body.feedback.trim().slice(0, MAX_FEEDBACK_LEN) : '';
  const rating   = typeof body.rating   === 'number' ? Math.round(body.rating)                        : 0;

  if (!token || !feedback || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const supabase = await createClient();

  // CRIT-3: only accept tokens for live campaigns
  const { data: qr } = await supabase
    .from('qr_codes')
    .select('id, business_id')
    .eq('token', token)
    .eq('status', 'live')
    .single();

  if (!qr) return NextResponse.json({ ok: false, reason: 'unknown token' }, { status: 404 });

  const { error: insertError } = await supabase.from('generated_reviews').insert({
    qr_id:       qr.id,
    business_id: qr.business_id,
    rating,
    ai_text:     feedback,
    status:      'private_feedback',
  });

  if (insertError) {
    console.error('[funnel/private] DB error:', insertError);
    return NextResponse.json({ ok: false, reason: 'save_failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
