-- Migration 022: Billing usage aggregate RPCs
-- Replace unbounded analytics_events fetch (potential OOM at 100K+ events)
-- with DB-side aggregation.

-- Total generate + scan counts for the billing period
CREATE OR REPLACE FUNCTION billing_event_counts(p_business_id uuid, since_ts timestamptz)
RETURNS TABLE (event_type text, count bigint)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT event_type, COUNT(*) AS count
  FROM public.analytics_events
  WHERE business_id = p_business_id
    AND created_at >= since_ts
    AND event_type IN ('generate', 'scan')
  GROUP BY event_type;
$$;

-- Daily generate counts for billing usage chart
CREATE OR REPLACE FUNCTION billing_daily_generates(p_business_id uuid, since_ts timestamptz)
RETURNS TABLE (date date, count bigint)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT DATE(created_at) AS date, COUNT(*) AS count
  FROM public.analytics_events
  WHERE business_id = p_business_id
    AND created_at >= since_ts
    AND event_type = 'generate'
  GROUP BY DATE(created_at)
  ORDER BY date;
$$;

-- Top-N campaigns by generate count for billing breakdown
CREATE OR REPLACE FUNCTION billing_campaign_generates(
  p_business_id uuid,
  since_ts timestamptz,
  top_n int DEFAULT 5
)
RETURNS TABLE (qr_id uuid, count bigint)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT qr_id, COUNT(*) AS count
  FROM public.analytics_events
  WHERE business_id = p_business_id
    AND created_at >= since_ts
    AND event_type = 'generate'
    AND qr_id IS NOT NULL
  GROUP BY qr_id
  ORDER BY count DESC
  LIMIT top_n;
$$;
