import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import type { DashboardCharts } from '@/types/admin';

export async function GET() {
  const result = await requireAdmin();
  if ('error' in result) return result.error;

  const db = createAdminClient();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();

  // All four queries run in parallel; each returns aggregated rows (migration 025)
  // instead of the previous approach that fetched up to 35 000 raw rows.
  const [
    { data: dailyScanRows },
    { data: dailyReviewRows },
    { data: planDistRows },
    { data: funnelRows },
    { count: totalScans },
  ] = await Promise.all([
    db.rpc('admin_daily_scan_counts',   { since: thirtyDaysAgo }),
    db.rpc('admin_daily_review_counts', { since: thirtyDaysAgo }),
    db.rpc('admin_plan_distribution'),
    db.rpc('admin_event_funnel',        { since: thirtyDaysAgo }),
    db.from('qr_scans').select('id', { count: 'exact', head: true }).gte('scanned_at', thirtyDaysAgo),
  ]);

  // Build daily scans & reviews map (last 30 days, fill zeros for missing days)
  const dailyMap = new Map<string, { scans: number; reviews: number }>();
  for (let i = 29; i >= 0; i--) {
    const key = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
    dailyMap.set(key, { scans: 0, reviews: 0 });
  }
  (dailyScanRows ?? []).forEach((r: { date: string; scans: number }) => {
    const entry = dailyMap.get(r.date);
    if (entry) entry.scans = Number(r.scans);
  });
  (dailyReviewRows ?? []).forEach((r: { date: string; reviews: number }) => {
    const entry = dailyMap.get(r.date);
    if (entry) entry.reviews = Number(r.reviews);
  });
  const daily_scans = Array.from(dailyMap.entries()).map(([date, v]) => ({ date, ...v }));

  // Plan distribution
  const plan_distribution = (planDistRows ?? []).map((r: { plan: string; count: number }) => ({
    plan: r.plan as 'free' | 'starter' | 'pro' | 'enterprise',
    count: Number(r.count),
  }));

  // Event funnel — use qr_scans count for 'scan' entry accuracy
  const funnelOrder = ['scan', 'generate', 'refresh', 'copy', 'redirect', 'complete'];
  const funnelCount: Record<string, number> = {};
  (funnelRows ?? []).forEach((r: { event_type: string; count: number }) => {
    funnelCount[r.event_type] = Number(r.count);
  });
  if (totalScans) funnelCount['scan'] = totalScans;

  const event_funnel = funnelOrder
    .filter(ev => funnelCount[ev] !== undefined && funnelCount[ev] > 0)
    .map(ev => ({ event: ev, count: funnelCount[ev] }));

  const charts: DashboardCharts = { daily_scans, plan_distribution, event_funnel };
  return NextResponse.json(charts);
}
