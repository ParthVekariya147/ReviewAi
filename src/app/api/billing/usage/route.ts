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

  const [subResult, planPriceResult] = await Promise.all([
    db.from('subscriptions')
      .select('current_period_end, plan, status')
      .eq('business_id', biz.id as string)
      .maybeSingle(),
    db.from('plan_prices')
      .select('plan, review_limit, scan_limit, campaign_limit, trial_days')
      .order('amount_cents'),
  ]);

  const sub = subResult.data;

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

  // Prefer DB-stored limits; fall back to hardcoded constants if column missing
  const dbRow = (planPriceResult.data ?? []).find(r => r.plan === plan);
  const limits = dbRow && 'review_limit' in dbRow
    ? { reviews: dbRow.review_limit, scans: dbRow.scan_limit, campaigns: dbRow.campaign_limit }
    : getPlanLimits(plan);
  const trialDays = dbRow && 'trial_days' in dbRow ? dbRow.trial_days : null;

  // All aggregations run in DB — no unbounded row fetch into memory (migration 022)
  const [eventCountsResult, dailyResult, campaignResult, campaignsResult] = await Promise.all([
    db.rpc('billing_event_counts',      { p_business_id: biz.id, since_ts: sinceIso }),
    db.rpc('billing_daily_generates',   { p_business_id: biz.id, since_ts: sinceIso }),
    db.rpc('billing_campaign_generates', { p_business_id: biz.id, since_ts: sinceIso, top_n: 5 }),
    db.from('qr_codes').select('id', { count: 'exact', head: true }).eq('business_id', biz.id).neq('status', 'archived'),
  ]);

  const eventCounts = (eventCountsResult.data ?? []) as { event_type: string; count: number }[];
  const reviewsUsed = eventCounts.find(e => e.event_type === 'generate')?.count ?? 0;
  const scansUsed   = eventCounts.find(e => e.event_type === 'scan')?.count ?? 0;

  const dailySeries = ((dailyResult.data ?? []) as { date: string; count: number }[])
    .map(r => ({ date: String(r.date), count: Number(r.count) }));

  // Fetch campaign names for the top campaigns from RPC results
  const campaignRows = (campaignResult.data ?? []) as { qr_id: string; count: number }[];
  const topQrIds = campaignRows.map(r => r.qr_id);

  const { data: topCampaigns } = topQrIds.length
    ? await db.from('qr_codes').select('id, campaign_name').in('id', topQrIds)
    : { data: [] };

  const byCampaign = campaignRows.map(r => ({
    qr_id:         r.qr_id,
    campaign_name: (topCampaigns ?? []).find(q => q.id === r.qr_id)?.campaign_name ?? null,
    count:         Number(r.count),
  }));

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
    trial_days:      trialDays,
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
