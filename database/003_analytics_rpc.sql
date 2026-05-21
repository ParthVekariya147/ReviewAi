-- ============================================================
-- Reevo — Analytics Summary RPC
-- Run AFTER 002_performance_indexes.sql
-- ============================================================

create or replace function public.analytics_summary(
  p_business_id uuid,
  p_days        int default 30
)
returns json
language sql
stable
set search_path = public
as $$
  with
  evts as (
    select
      event_type,
      device,
      country,
      created_at,
      date_trunc('day', created_at at time zone 'utc')::date as day,
      extract(hour from created_at at time zone 'utc')::int   as hr,
      extract(dow  from created_at at time zone 'utc')::int   as dow
    from public.analytics_events
    where business_id = p_business_id
      and created_at  >= now() - (p_days * interval '1 day')
  ),

  -- { "scan": 420, "generate": 310, ... }
  totals as (
    select coalesce(
      json_object_agg(event_type, cnt),
      '{}'::json
    ) as data
    from (
      select event_type, count(*) as cnt
      from evts
      group by event_type
    ) t
  ),

  -- Pre-aggregate counts per day first, then build JSON.
  -- Avoids nested aggregate error (json_agg wrapping sum/count).
  daily as (
    select coalesce(
      json_agg(
        json_build_object(
          'date',             d.date,
          'scan',             d.scan,
          'generate',         d.generate,
          'refresh',          d.refresh,
          'copy',             d.copy,
          'redirect',         d.redirect,
          'complete',         d.complete,
          'private_feedback', d.private_feedback
        ) order by d.date
      ),
      '[]'::json
    ) as data
    from (
      select
        to_char(day, 'YYYY-MM-DD')                              as date,
        count(*) filter (where event_type = 'scan')             as scan,
        count(*) filter (where event_type = 'generate')         as generate,
        count(*) filter (where event_type = 'refresh')          as refresh,
        count(*) filter (where event_type = 'copy')             as copy,
        count(*) filter (where event_type = 'redirect')         as redirect,
        count(*) filter (where event_type = 'complete')         as complete,
        count(*) filter (where event_type = 'private_feedback') as private_feedback
      from evts
      group by day
    ) d
  ),

  -- { "mobile": 310, "desktop": 88 }
  by_device as (
    select coalesce(
      json_object_agg(device, cnt),
      '{}'::json
    ) as data
    from (
      select device, count(*) as cnt
      from evts
      where device is not null
      group by device
    ) t
  ),

  -- [{ "country": "US", "count": 210 }, ...]  top 8
  by_country as (
    select coalesce(
      json_agg(json_build_object('country', country, 'count', cnt) order by cnt desc),
      '[]'::json
    ) as data
    from (
      select country, count(*) as cnt
      from evts
      where country is not null
      group by country
      order by cnt desc
      limit 8
    ) t
  ),

  -- 24-element array, one count per UTC hour; zeros for empty hours
  by_hour as (
    select json_agg(cnt order by hr) as data
    from (
      select gs.hr, coalesce(e.cnt, 0) as cnt
      from generate_series(0, 23) as gs(hr)
      left join (
        select hr, count(*) as cnt from evts group by hr
      ) e on e.hr = gs.hr
    ) t
  ),

  -- 7-element array, 0=Sun … 6=Sat; zeros for empty days
  by_dow as (
    select json_agg(cnt order by dow) as data
    from (
      select gs.dow, coalesce(e.cnt, 0) as cnt
      from generate_series(0, 6) as gs(dow)
      left join (
        select dow, count(*) as cnt from evts group by dow
      ) e on e.dow = gs.dow
    ) t
  )

  select json_build_object(
    'window_days',  p_days,
    'totals',       totals.data,
    'daily_series', daily.data,
    'by_device',    by_device.data,
    'by_country',   by_country.data,
    'by_hour',      by_hour.data,
    'by_dow',       by_dow.data
  )
  from totals, daily, by_device, by_country, by_hour, by_dow
$$;

grant execute on function public.analytics_summary(uuid, int) to authenticated;
