-- Migration 025: Admin chart aggregation RPCs + QR count by business
-- Replaces application-layer row fetching (up to 35 000 rows) with
-- server-side GROUP BY aggregations. Each RPC returns at most ~30–100 rows.

-- Daily scan counts for the last N days
CREATE OR REPLACE FUNCTION admin_daily_scan_counts(since timestamptz)
RETURNS TABLE (date date, scans bigint)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DATE(scanned_at) AS date, COUNT(*) AS scans
  FROM public.qr_scans
  WHERE scanned_at >= since
  GROUP BY DATE(scanned_at)
  ORDER BY date;
$$;

-- Daily generated-review counts for the last N days
CREATE OR REPLACE FUNCTION admin_daily_review_counts(since timestamptz)
RETURNS TABLE (date date, reviews bigint)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DATE(created_at) AS date, COUNT(*) AS reviews
  FROM public.generated_reviews
  WHERE created_at >= since
  GROUP BY DATE(created_at)
  ORDER BY date;
$$;

-- Subscription plan distribution
CREATE OR REPLACE FUNCTION admin_plan_distribution()
RETURNS TABLE (plan text, count bigint)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT plan, COUNT(*) AS count
  FROM public.subscriptions
  WHERE plan IS NOT NULL
  GROUP BY plan;
$$;

-- Event funnel counts for the last N days
CREATE OR REPLACE FUNCTION admin_event_funnel(since timestamptz)
RETURNS TABLE (event_type text, count bigint)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT event_type, COUNT(*) AS count
  FROM public.analytics_events
  WHERE created_at >= since
  GROUP BY event_type;
$$;

-- QR code count per business (companion to admin_scan_counts_by_business in 023)
CREATE OR REPLACE FUNCTION admin_qr_counts_by_business(business_ids uuid[])
RETURNS TABLE (business_id uuid, count bigint)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT business_id, COUNT(*) AS count
  FROM public.qr_codes
  WHERE business_id = ANY(business_ids)
  GROUP BY business_id;
$$;

-- Supporting indexes (safe to re-run)
CREATE INDEX IF NOT EXISTS qr_scans_scanned_at_idx     ON public.qr_scans(scanned_at);
CREATE INDEX IF NOT EXISTS analytics_events_created_at  ON public.analytics_events(created_at);
CREATE INDEX IF NOT EXISTS analytics_events_type_idx    ON public.analytics_events(event_type, created_at);
