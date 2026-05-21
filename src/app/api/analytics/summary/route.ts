import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/* GET /api/analytics/summary?days=30
   Returns aggregate stats for the authenticated business owner's dashboard. */
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const days = Math.min(parseInt(req.nextUrl.searchParams.get('days') ?? '30', 10), 365);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { data: biz } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .single();

  if (!biz) return NextResponse.json({ error: 'No business found' }, { status: 404 });

  /* all events for this business in the window */
  const { data: events } = await supabase
    .from('analytics_events')
    .select('event_type, device, country, created_at')
    .eq('business_id', biz.id)
    .gte('created_at', since);

  if (!events) return NextResponse.json({ error: 'Query failed' }, { status: 500 });

  /* aggregate totals */
  const counts: Record<string, number> = {};
  const byDay: Record<string, Record<string, number>> = {};
  const byDevice: Record<string, number>  = {};
  const byCountry: Record<string, number> = {};
  const byHour: number[] = Array(24).fill(0);
  const byDOW: number[]  = Array(7).fill(0);

  for (const e of events) {
    counts[e.event_type] = (counts[e.event_type] ?? 0) + 1;

    const day = e.created_at.slice(0, 10);
    byDay[day] = byDay[day] ?? {};
    byDay[day][e.event_type] = (byDay[day][e.event_type] ?? 0) + 1;

    if (e.device)  byDevice[e.device]   = (byDevice[e.device]   ?? 0) + 1;
    if (e.country) byCountry[e.country] = (byCountry[e.country] ?? 0) + 1;

    const d = new Date(e.created_at);
    byHour[d.getUTCHours()]++;
    byDOW[d.getUTCDay()]++;
  }

  /* build sorted daily series */
  const dailySeries = Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({ date, ...v }));

  /* top countries */
  const topCountries = Object.entries(byCountry)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([country, count]) => ({ country, count }));

  const scans     = counts['scan']     ?? 0;
  const generates = counts['generate'] ?? 0;
  const copies    = counts['copy']     ?? 0;
  const redirects = counts['redirect'] ?? 0;
  const completes = counts['complete'] ?? 0;

  return NextResponse.json({
    window_days:   days,
    totals: {
      scans, generates, copies, redirects, completes,
      refreshes:    counts['refresh'] ?? 0,
      private_feedback: counts['private_feedback'] ?? 0,
    },
    conversion: {
      scan_to_generate: scans     ? generates / scans     : 0,
      generate_to_copy: generates ? copies    / generates : 0,
      copy_to_redirect: copies    ? redirects / copies    : 0,
      funnel_overall:   scans     ? completes / scans     : 0,
    },
    daily_series:  dailySeries,
    by_device:     byDevice,
    by_country:    topCountries,
    by_hour:       byHour,
    by_dow:        byDOW,
  });
}
