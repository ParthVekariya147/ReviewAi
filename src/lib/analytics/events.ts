import type { EventType } from '@/types/database';

export interface TrackPayload {
  token:      string;
  event:      EventType;
  device?:    string;
  country?:   string;
  meta?:      Record<string, unknown>;
}

/* Client-side fire-and-forget tracker — used in FunnelFlow.tsx */
export async function trackEvent(payload: TrackPayload): Promise<void> {
  try {
    await fetch('/api/analytics/event', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    /* analytics must never break the funnel */
  }
}

/* Detect device type from user-agent string */
export function detectDevice(ua: string): string {
  if (/iPad|Tablet/i.test(ua))  return 'tablet';
  if (/Mobile|Android|iPhone/i.test(ua)) return 'mobile';
  return 'desktop';
}
