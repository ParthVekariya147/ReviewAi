-- Migration 023: Scan count aggregate RPCs
-- Replace full qr_scans table fetch (OOM risk) with COUNT aggregations in DB.

-- Returns scan count per QR code (for business detail page)
CREATE OR REPLACE FUNCTION admin_scan_counts_by_qr(qr_ids uuid[])
RETURNS TABLE (qr_id uuid, count bigint)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT qr_id, COUNT(*) AS count
  FROM public.qr_scans
  WHERE qr_id = ANY(qr_ids)
  GROUP BY qr_id;
$$;

-- Returns scan count per business (for business list page)
CREATE OR REPLACE FUNCTION admin_scan_counts_by_business(business_ids uuid[])
RETURNS TABLE (business_id uuid, count bigint)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT qc.business_id, COUNT(qs.id) AS count
  FROM public.qr_codes qc
  LEFT JOIN public.qr_scans qs ON qs.qr_id = qc.id
  WHERE qc.business_id = ANY(business_ids)
  GROUP BY qc.business_id;
$$;
