import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import type { DashboardStats } from '@/types/admin';

export async function GET() {
  const result = await requireAdmin();
  if ('error' in result) return result.error;

  const db = createAdminClient();
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const fourteenDaysAgo = new Date(Date.now() - 14 * 86400000).toISOString();

  const [
    { count: totalBiz },
    { count: totalBizPrev },
    { count: activeSubs },
    { count: activeSubsPrev },
    { count: paidBiz },
    { count: paidBizPrev },
    { count: scansToday },
    { count: scansPrevToday },
    { count: reviewsToday },
    { count: reviewsPrevToday },
    { count: copyCount },
    { count: genCount },
  ] = await Promise.all([
    db.from('businesses').select('id', { count: 'exact', head: true }),
    db.from('businesses').select('id', { count: 'exact', head: true }).lt('created_at', sevenDaysAgo),
    db.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    db.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active').lt('created_at', sevenDaysAgo),
    db.from('subscriptions').select('id', { count: 'exact', head: true }).neq('plan', 'free'),
    db.from('subscriptions').select('id', { count: 'exact', head: true }).neq('plan', 'free').lt('created_at', sevenDaysAgo),
    db.from('qr_scans').select('id', { count: 'exact', head: true }).gte('scanned_at', todayStart),
    db.from('qr_scans').select('id', { count: 'exact', head: true })
      .gte('scanned_at', new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0] + 'T00:00:00.000Z')
      .lt('scanned_at', todayStart),
    db.from('generated_reviews').select('id', { count: 'exact', head: true }).gte('created_at', todayStart),
    db.from('generated_reviews').select('id', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0] + 'T00:00:00.000Z')
      .lt('created_at', todayStart),
    db.from('analytics_events').select('id', { count: 'exact', head: true }).eq('event_type', 'copy').gte('created_at', sevenDaysAgo),
    db.from('analytics_events').select('id', { count: 'exact', head: true }).eq('event_type', 'generate').gte('created_at', sevenDaysAgo),
  ]);

  const copyRate = (genCount ?? 0) > 0 ? ((copyCount ?? 0) / (genCount ?? 1)) * 100 : 0;

  // Previous period copy rate for delta
  const [{ count: copyPrevCount }, { count: genPrevCount }] = await Promise.all([
    db.from('analytics_events').select('id', { count: 'exact', head: true }).eq('event_type', 'copy').gte('created_at', fourteenDaysAgo).lt('created_at', sevenDaysAgo),
    db.from('analytics_events').select('id', { count: 'exact', head: true }).eq('event_type', 'generate').gte('created_at', fourteenDaysAgo).lt('created_at', sevenDaysAgo),
  ]);
  const copyRatePrev = (genPrevCount ?? 0) > 0
    ? ((copyPrevCount ?? 0) / (genPrevCount ?? 1)) * 100
    : 0;

  function delta(current: number, previous: number): number {
    if (previous === 0) return 0;
    return parseFloat(((current - previous) / previous * 100).toFixed(1));
  }

  const stats: DashboardStats = {
    total_businesses:           totalBiz ?? 0,
    total_businesses_delta:     delta(totalBiz ?? 0, totalBizPrev ?? 0),
    active_subscriptions:       activeSubs ?? 0,
    active_subscriptions_delta: delta(activeSubs ?? 0, activeSubsPrev ?? 0),
    paid_businesses:            paidBiz ?? 0,
    paid_businesses_delta:      delta(paidBiz ?? 0, paidBizPrev ?? 0),
    scans_today:                scansToday ?? 0,
    scans_today_delta:          delta(scansToday ?? 0, scansPrevToday ?? 0),
    reviews_today:              reviewsToday ?? 0,
    reviews_today_delta:        delta(reviewsToday ?? 0, reviewsPrevToday ?? 0),
    avg_copy_rate:              parseFloat(copyRate.toFixed(1)),
    avg_copy_rate_delta:        parseFloat((copyRate - copyRatePrev).toFixed(1)),
  };

  return NextResponse.json(stats);
}
