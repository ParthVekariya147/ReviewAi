import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { detectDevice } from '@/lib/analytics/events';
import type { EventType } from '@/types/database';

const VALID_EVENTS: EventType[] = [
  'scan', 'generate', 'refresh', 'copy', 'redirect', 'complete', 'private_feedback',
];

/* POST /api/analytics/event
   Called from the customer funnel (no auth required).
   Resolves business_id from the token before inserting.   */
export async function POST(req: NextRequest) {
  let body: { token?: string; event?: string; meta?: Record<string, unknown> };
  try { body = await req.json(); } catch { body = {}; }

  const token     = typeof body.token === 'string' ? body.token.trim() : '';
  const eventType = body.event as EventType | undefined;

  if (!token || !eventType || !VALID_EVENTS.includes(eventType)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const ua      = req.headers.get('user-agent') ?? '';
  const device  = detectDevice(ua);
  const country = req.headers.get('x-vercel-ip-country') ??
                  req.headers.get('cf-ipcountry')        ??
                  null;

  try {
    const supabase = await createClient();

    /* resolve qr_id + business_id from token */
    const { data: qr } = await supabase
      .from('qr_codes')
      .select('id, business_id')
      .eq('token', token)
      .single();

    if (!qr) return NextResponse.json({ ok: false, reason: 'unknown token' });

    /* insert analytics event */
    await supabase.from('analytics_events').insert({
      qr_id:       qr.id,
      business_id: qr.business_id,
      event_type:  eventType,
      device,
      country,
      meta:        body.meta ?? null,
    });

    /* also insert a qr_scan row for the 'scan' event for quick count queries */
    if (eventType === 'scan') {
      await supabase.from('qr_scans').insert({
        qr_id:   qr.id,
        device,
        country,
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    /* fail silently — analytics must not break the funnel */
    return NextResponse.json({ ok: false });
  }
}
