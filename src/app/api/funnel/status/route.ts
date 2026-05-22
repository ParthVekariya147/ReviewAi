import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { rateLimit, getClientIp } from '@/lib/security/rateLimit';

/* PATCH /api/funnel/status
   Called from the customer funnel (no auth required).
   Updates a generated_review row when the customer copies or redirects.
   Body: { review_id: string; action: 'copy' | 'redirect'; platform?: string } */
export async function PATCH(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = rateLimit(`funnel-status:${ip}`, 30, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, {
      status: 429,
      headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
    });
  }

  let body: { review_id?: string; action?: string; platform?: string };
  try { body = await req.json(); } catch { body = {}; }

  const reviewId = typeof body.review_id === 'string' ? body.review_id.trim() : '';
  const action   = typeof body.action   === 'string' ? body.action.trim()   : '';

  if (!reviewId || !['copy', 'redirect'].includes(action)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  try {
    const supabase = await createClient();

    if (action === 'copy') {
      const { data: current } = await supabase
        .from('generated_reviews')
        .select('copies')
        .eq('id', reviewId)
        .single();

      await supabase
        .from('generated_reviews')
        .update({
          copies: (current?.copies ?? 0) + 1,
          status: 'copied',
        })
        .eq('id', reviewId);
    } else {
      await supabase
        .from('generated_reviews')
        .update({ status: 'redirected' })
        .eq('id', reviewId);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
