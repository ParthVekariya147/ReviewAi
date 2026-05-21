-- ============================================================
-- Reevo — Dashboard Overview RPC
-- Run AFTER 003_analytics_rpc.sql
-- Returns all data the main dashboard page needs in one call:
-- KPIs + deltas, daily chart series, campaign list with stats,
-- and recent activity feed.
-- ============================================================

create or replace function public.dashboard_overview(
  p_business_id uuid,
  p_days        int default 30
)
returns json
language sql
stable
set search_path = public
as $$
  with

  -- Current period analytics events
  curr_evts as (
    select event_type, qr_id, device, country, created_at,
           date_trunc('day', created_at at time zone 'utc')::date as day
    from public.analytics_events
    where business_id = p_business_id
      and created_at >= now() - (p_days * interval '1 day')
  ),

  -- Previous period (same window length) — used for delta %
  prev_evts as (
    select event_type
    from public.analytics_events
    where business_id = p_business_id
      and created_at >= now() - (p_days * 2 * interval '1 day')
      and created_at <  now() - (p_days * interval '1 day')
  ),

  -- Aggregate current period totals
  curr_agg as (
    select
      count(*) filter (where event_type = 'scan')     as scans,
      count(*) filter (where event_type = 'generate') as generates,
      count(*) filter (where event_type = 'redirect') as redirects,
      count(*) filter (where event_type = 'complete') as completes,
      count(*) filter (where event_type = 'refresh')  as refreshes,
      count(*) filter (where event_type = 'copy')     as copies
    from curr_evts
  ),

  -- Aggregate previous period totals
  prev_agg as (
    select
      count(*) filter (where event_type = 'scan')     as scans,
      count(*) filter (where event_type = 'generate') as generates,
      count(*) filter (where event_type = 'redirect') as redirects,
      count(*) filter (where event_type = 'complete') as completes
    from prev_evts
  ),

  -- Daily series for the trend chart
  daily as (
    select coalesce(
      json_agg(
        json_build_object(
          'date',      d.date,
          'scans',     d.scans,
          'generates', d.generates,
          'redirects', d.redirects
        ) order by d.date
      ),
      '[]'::json
    ) as data
    from (
      select
        to_char(day, 'YYYY-MM-DD')                              as date,
        count(*) filter (where event_type = 'scan')             as scans,
        count(*) filter (where event_type = 'generate')         as generates,
        count(*) filter (where event_type = 'redirect')         as redirects
      from curr_evts
      group by day
    ) d
  ),

  -- Campaign list joined with per-campaign analytics
  campaigns as (
    select coalesce(
      json_agg(
        json_build_object(
          'id',         q.id,
          'name',       q.campaign_name,
          'token',      q.token,
          'status',     q.status,
          'scans',      coalesce(cs.scans, 0),
          'completes',  coalesce(cs.completes, 0),
          'conversion', case
                          when coalesce(cs.scans, 0) > 0
                          then round((coalesce(cs.completes, 0)::numeric / cs.scans) * 100, 1)
                          else 0
                        end
        ) order by coalesce(cs.scans, 0) desc
      ),
      '[]'::json
    ) as data
    from public.qr_codes q
    left join (
      select
        qr_id,
        count(*) filter (where event_type = 'scan')     as scans,
        count(*) filter (where event_type = 'complete') as completes
      from curr_evts
      where qr_id is not null
      group by qr_id
    ) cs on cs.qr_id = q.id
    where q.business_id = p_business_id
      and q.status != 'archived'
  ),

  -- 15 most recent events for the activity feed
  recent as (
    select coalesce(
      json_agg(
        json_build_object(
          'event_type', r.event_type,
          'qr_id',      r.qr_id,
          'device',     r.device,
          'country',    r.country,
          'created_at', r.created_at
        ) order by r.created_at desc
      ),
      '[]'::json
    ) as data
    from (
      select event_type, qr_id, device, country, created_at
      from public.analytics_events
      where business_id = p_business_id
      order by created_at desc
      limit 15
    ) r
  )

  select json_build_object(
    'kpis', json_build_object(
      'scans',           c.scans,
      'generates',       c.generates,
      'redirects',       c.redirects,
      'completes',       c.completes,
      'refreshes',       c.refreshes,
      'copies',          c.copies,
      'conversion',
        case when c.scans > 0
             then round((c.completes::numeric / c.scans) * 100, 1)
             else 0 end,
      'scans_delta',
        case when p.scans > 0
             then round(((c.scans - p.scans)::numeric / p.scans) * 100, 1)
             else null end,
      'generates_delta',
        case when p.generates > 0
             then round(((c.generates - p.generates)::numeric / p.generates) * 100, 1)
             else null end,
      'redirects_delta',
        case when p.redirects > 0
             then round(((c.redirects - p.redirects)::numeric / p.redirects) * 100, 1)
             else null end,
      'completes_delta',
        case when p.completes > 0
             then round(((c.completes - p.completes)::numeric / p.completes) * 100, 1)
             else null end
    ),
    'daily_series',    daily.data,
    'campaigns',       campaigns.data,
    'recent_activity', recent.data
  )
  from curr_agg c, prev_agg p, daily, campaigns, recent
$$;

grant execute on function public.dashboard_overview(uuid, int) to authenticated;
