import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentBusiness } from '@/lib/businesses/current';
import { getPlanLimits } from '@/lib/billing/plans';

/* GET /api/billing/usage
   Returns current-period quota consumption for the authenticated
   business. Period defaults to calendar month; uses
   subscription.current_period_end when a billing record exists. */
export async function GET() {
  const supabase = await createClient();
  const db = createAdminClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { business: biz, error: businessError } = await getCurrentBusiness(db as Awaited<ReturnType<typeof createClient>>, user.id);
  if (businessError) {
    return NextResponse.json({ error: businessError.message, code: businessError.code }, { status: 500 });
  }
  if (!biz) return NextResponse.json({ error: 'No business found' }, { status: 404 });

  const { data: sub } = await db
    .from('subscriptions')
    .select('current_period_end, plan, status')
    .eq('business_id', biz.id as string)
    .maybeSingle();

  // Determine billing period
  const now = new Date();
  let periodStart: Date;
  let periodEnd: Date;

  if (sub?.current_period_end) {
    periodEnd   = new Date(sub.current_period_end);
    periodStart = new Date(periodEnd);
    periodStart.setMonth(periodStart.getMonth() - 1);
  } else {
    periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    periodEnd   = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  }

  const daysRemaining  = Math.max(0, Math.ceil((periodEnd.getTime() - now.getTime()) / 86_400_000));
  const daysElapsed    = Math.max(1, Math.ceil((now.getTime() - periodStart.getTime()) / 86_400_000));
  const totalDays      = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / 86_400_000);

  const sinceIso = periodStart.toISOString();
  const plan     = sub?.plan ?? biz.plan ?? 'free';
  const limits   = getPlanLimits(plan);

  // Run all DB reads in parallel
  const [eventsResult, campaignsResult, campaignBreakdownResult] = await Promise.all([
    // Aggregated event counts for current period
    db
      .from('analytics_events')
      .select('event_type, qr_id, created_at')
      .eq('business_id', biz.id)
      .gte('created_at', sinceIso),

    // Active campaign count
    db
      .from('qr_codes')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', biz.id)
      .neq('status', 'archived'),

    // Per-campaign generate counts (for "by campaign" breakdown)
    db
      .from('analytics_events')
      .select('qr_id')
      .eq('business_id', biz.id)
      .eq('event_type', 'generate')
      .gte('created_at', sinceIso),
  ]);

  const events = eventsResult.data ?? [];

  // Tally used counts
  let reviewsUsed = 0;
  let scansUsed   = 0;
  const byDay: Record<string, number> = {};

  for (const e of events) {
    if (e.event_type === 'generate') {
      reviewsUsed++;
      const day = (e.created_at as string).slice(0, 10);
      byDay[day] = (byDay[day] ?? 0) + 1;
    }
    if (e.event_type === 'scan') scansUsed++;
  }

  // Daily series for the chart
  const dailySeries = Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));

  // Per-campaign breakdown
  const campaignCounts: Record<string, number> = {};
  for (const e of (campaignBreakdownResult.data ?? [])) {
    const qid = e.qr_id as string | null;
    if (qid) campaignCounts[qid] = (campaignCounts[qid] ?? 0) + 1;
  }

  // Fetch campaign names for the top 5 by usage
  const topQrIds = Object.entries(campaignCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([id]) => id);

  const { data: topCampaigns } = topQrIds.length
    ? await db.from('qr_codes').select('id, campaign_name').in('id', topQrIds)
    : { data: [] };

  const byCampaign = (topCampaigns ?? []).map(q => ({
    qr_id:         q.id,
    campaign_name: q.campaign_name,
    count:         campaignCounts[q.id] ?? 0,
  })).sort((a, b) => b.count - a.count);

  // Projected total (linear extrapolation)
  const projectedTotal = Math.round(reviewsUsed / daysElapsed * totalDays);

  return NextResponse.json({
    plan,
    period_start:    periodStart.toISOString().slice(0, 10),
    period_end:      periodEnd.toISOString().slice(0, 10),
    days_remaining:  daysRemaining,
    days_elapsed:    daysElapsed,
    projected_total: projectedTotal,
    avg_per_day:     Math.round(reviewsUsed / daysElapsed),
    limits: {
      reviews:   limits.reviews,
      scans:     limits.scans,
      campaigns: limits.campaigns,
    },
    used: {
      reviews:   reviewsUsed,
      scans:     scansUsed,
      campaigns: campaignsResult.count ?? 0,
    },
    daily_series: dailySeries,
    by_campaign:  byCampaign,
  });
}
