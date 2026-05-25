import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentBusinessId } from '@/lib/businesses/current';

export type NotifItem = {
  id:     string;
  icon:   string;
  tone:   string;
  title:  string;
  body:   string;
  time:   string;
  unread: boolean;
  cat:    'reviews' | 'alerts' | 'system';
};

function relTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60_000)       return 'Just now';
  if (ms < 3_600_000)    return `${Math.floor(ms / 60_000)}m ago`;
  if (ms < 86_400_000)   return `${Math.floor(ms / 3_600_000)}h ago`;
  if (ms < 172_800_000)  return 'Yesterday';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/* GET /api/notifications
   Returns real activity-based notifications. Unread state is backed by notification_reads table.
   Pass ?summary=1 to return only { unreadCount } for lightweight polling (e.g. Topbar). */
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { businessId, error: bizError } = await getCurrentBusinessId(supabase, user.id);
  if (bizError || !businessId) {
    return NextResponse.json({ notifications: [], unreadCount: 0 });
  }

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  /* ── Fetch read-state + all data sources in parallel ─────── */
  const [
    { data: reads },
    { data: reviews },
    { data: lowRatings },
    { data: qrCodes },
  ] = await Promise.all([
    supabase.from('notification_reads').select('notif_id').eq('business_id', businessId),
    supabase.from('generated_reviews')
      .select('id, rating, status, created_at')
      .eq('business_id', businessId)
      .in('status', ['generated', 'copied', 'redirected'])
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase.from('generated_reviews')
      .select('id, rating, created_at')
      .eq('business_id', businessId)
      .eq('status', 'private_feedback')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('qr_codes')
      .select('id, campaign_name, status, created_at')
      .eq('business_id', businessId)
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const readSet = new Set((reads ?? []).map((r: { notif_id: string }) => r.notif_id));
  const items: NotifItem[] = [];

  for (const r of reviews ?? []) {
    const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
    const statusLabel = r.status === 'redirected' ? 'posted to platform' :
                        r.status === 'copied'     ? 'copied by customer' :
                                                    'generated';
    const id = `review-${r.id}`;
    items.push({
      id,
      icon:   'star',
      tone:   r.rating >= 4 ? 'success' : 'primary',
      title:  `New ${stars} review ${statusLabel}`,
      body:   `A customer submitted a ${r.rating}-star review via your QR funnel.`,
      time:   relTime(r.created_at),
      unread: !readSet.has(id),
      cat:    'reviews',
    });
  }

  /* ── Private / low-rating feedback ──────────────────────── */
  for (const r of lowRatings ?? []) {
    const id = `private-${r.id}`;
    items.push({
      id,
      icon:   'flag',
      tone:   'warning',
      title:  `${r.rating}★ rating captured privately`,
      body:   `A low rating was held back from your public review page and saved for your review.`,
      time:   relTime(r.created_at),
      unread: !readSet.has(id),
      cat:    'alerts',
    });
  }

  /* ── Recently created QR campaigns ──────────────────────── */
  for (const qr of qrCodes ?? []) {
    const id = `qr-${qr.id}`;
    items.push({
      id,
      icon:   'qr',
      tone:   qr.status === 'live' ? 'violet' : 'neutral',
      title:  `QR campaign "${qr.campaign_name ?? 'Untitled'}" ${qr.status === 'live' ? 'is live' : 'created'}`,
      body:   qr.status === 'live'
        ? 'Your campaign is accepting scans and collecting reviews.'
        : `Campaign is in ${qr.status} status.`,
      time:   relTime(qr.created_at),
      unread: !readSet.has(id),
      cat:    'system',
    });
  }

  /* ── Sort: unread first, then by insertion order (newest-first) ── */
  items.sort((a, b) => (b.unread ? 1 : 0) - (a.unread ? 1 : 0));

  const result = items.slice(0, 20);
  const unreadCount = result.filter(n => n.unread).length;

  if (new URL(req.url).searchParams.get('summary') === '1') {
    return NextResponse.json({ unreadCount });
  }

  return NextResponse.json({ notifications: result, unreadCount });
}

/* PATCH /api/notifications
   Body: { ids: string[] } — marks the given notification IDs as read. */
export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { businessId, error: bizError } = await getCurrentBusinessId(supabase, user.id);
  if (bizError || !businessId) return NextResponse.json({ error: 'Business not found' }, { status: 404 });

  const body = await req.json().catch(() => null) as { ids?: unknown } | null;
  const ids: string[] = Array.isArray(body?.ids)
    ? (body.ids as unknown[]).filter((x): x is string => typeof x === 'string')
    : [];

  if (ids.length === 0) return NextResponse.json({ ok: true });

  const rows = ids.map(notif_id => ({ business_id: businessId, notif_id }));
  await supabase
    .from('notification_reads')
    .upsert(rows, { onConflict: 'business_id,notif_id', ignoreDuplicates: true });

  return NextResponse.json({ ok: true });
}
