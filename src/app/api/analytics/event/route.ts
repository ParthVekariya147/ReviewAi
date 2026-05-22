import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { detectDevice } from '@/lib/analytics/events';
import { rateLimit, getClientIp } from '@/lib/security/rateLimit';
import type { EventType } from '@/types/database';

const VALID_EVENTS: EventType[] = [
  'scan', 'generate', 'refresh', 'copy', 'redirect', 'complete', 'private_feedback',
];

/* POST /api/analytics/event
   Called from the customer funnel (no auth required).
   Rate limited: 60 events / minute per IP.               */
export async function POST(req: NextRequest) {
  const ip  = getClientIp(req);
  const rl  = rateLimit(`analytics:${ip}`, 60, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, {
      status: 429,
      headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
    });
  }
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

    /* resolve qr_id + business_id from token — only live campaigns */
    const { data: qr } = await supabase
      .from('qr_codes')
      .select('id, business_id')
      .eq('token', token)
      .eq('status', 'live')
      .single();

    if (!qr) return NextResponse.json({ ok: false, reason: 'unknown token' }, { status: 404 });

    /* sanitize meta: max 2KB, max 20 keys, primitive values only */
    function sanitizeMeta(raw: unknown): Record<string, string | number | boolean> | null {
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
      const out: Record<string, string | number | boolean> = {};
      for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
        if (typeof k !== 'string' || k.length > 64) continue;
        if (typeof v === 'string') out[k] = v.slice(0, 256);
        else if (typeof v === 'number' || typeof v === 'boolean') out[k] = v;
        if (Object.keys(out).length >= 20) break;
      }
      if (JSON.stringify(out).length > 2048) return null;
      return out;
    }

    /* insert analytics event */
    await supabase.from('analytics_events').insert({
      qr_id:       qr.id,
      business_id: qr.business_id,
      event_type:  eventType,
      device,
      country,
      meta:        sanitizeMeta(body.meta),
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
