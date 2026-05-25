import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { rateLimit, getClientIp } from '@/lib/security/rateLimit';

/* PATCH /api/funnel/status
   Called from the customer funnel (no auth required).
   Updates a generated_review row when the customer copies or redirects.
   Body: { token: string; review_id: string; action: 'copy' | 'redirect'; platform?: string }

   Security: token is used to verify that review_id belongs to the QR code
   that was actually scanned — prevents arbitrary review manipulation. */
export async function PATCH(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = await rateLimit(`funnel-status:${ip}`, 30, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, {
      status: 429,
      headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
    });
  }

  let body: { token?: string; review_id?: string; action?: string; platform?: string };
  try { body = await req.json(); } catch { body = {}; }

  const token    = typeof body.token     === 'string' ? body.token.trim()     : '';
  const reviewId = typeof body.review_id === 'string' ? body.review_id.trim() : '';
  const action   = typeof body.action    === 'string' ? body.action.trim()    : '';

  if (!token || !reviewId || !['copy', 'redirect'].includes(action)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  try {
    const supabase = await createClient();

    // Verify the review_id belongs to the QR code identified by token.
    // This prevents any unauthenticated user from manipulating reviews
    // that belong to a different scan session or a different business.
    const { data: review } = await supabase
      .from('generated_reviews')
      .select('id, copies, qr_codes!inner(token, status)')
      .eq('id', reviewId)
      .eq('qr_codes.token', token)
      .eq('qr_codes.status', 'live')
      .single();

    if (!review) {
      // Either review doesn't exist, token mismatch, or QR not live.
      // Return 404 to avoid confirming whether the review_id exists.
      return NextResponse.json({ ok: false }, { status: 404 });
    }

    // Use service-role client for the write — the public update RLS policy has
    // been removed (migration 018). Ownership was verified via token above.
    const adminDb = createAdminClient();

    if (action === 'copy') {
      await adminDb
        .from('generated_reviews')
        .update({
          copies: ((review as { copies?: number }).copies ?? 0) + 1,
          status: 'copied',
        })
        .eq('id', reviewId);
    } else {
      await adminDb
        .from('generated_reviews')
        .update({ status: 'redirected' })
        .eq('id', reviewId);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
