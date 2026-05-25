-- Migration 021: Analytics aggregate RPCs to replace .limit(10000) in-memory loops
-- These replace the pattern: select all rows → group in JS → slice top 10

-- Country distribution for qr_scans
CREATE OR REPLACE FUNCTION admin_count_by_country(since_ts timestamptz)
RETURNS TABLE (country text, count bigint)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT country, COUNT(*) AS count
  FROM public.qr_scans
  WHERE scanned_at >= since_ts
    AND country IS NOT NULL
  GROUP BY country
  ORDER BY count DESC
  LIMIT 10;
$$;

-- Device distribution for qr_scans
CREATE OR REPLACE FUNCTION admin_count_by_device(since_ts timestamptz)
RETURNS TABLE (device text, count bigint)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT device, COUNT(*) AS count
  FROM public.qr_scans
  WHERE scanned_at >= since_ts
    AND device IS NOT NULL
  GROUP BY device
  ORDER BY count DESC;
$$;

-- Top businesses by scan event count
CREATE OR REPLACE FUNCTION admin_top_businesses_by_scans(since_ts timestamptz, top_n int DEFAULT 10)
RETURNS TABLE (business_id uuid, scans bigint)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT business_id, COUNT(*) AS scans
  FROM public.analytics_events
  WHERE event_type = 'scan'
    AND created_at >= since_ts
    AND business_id IS NOT NULL
  GROUP BY business_id
  ORDER BY scans DESC
  LIMIT top_n;
$$;

-- Draft pick rate: count copy events by draft_index (stored as int in JSONB meta)
CREATE OR REPLACE FUNCTION admin_count_draft_copies(since_ts timestamptz, draft_idx int)
RETURNS bigint
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT COUNT(*)
  FROM public.analytics_events
  WHERE event_type = 'copy'
    AND created_at >= since_ts
    AND (meta->>'draft_index')::int = draft_idx;
$$;
