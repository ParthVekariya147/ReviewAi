-- ============================================================
-- Reevo — RPC helpers for aggregated scan counts
-- Migration: 016_scan_count_rpc.sql
-- Run AFTER 015_constraints.sql
-- Safe to re-run (CREATE OR REPLACE).
-- ============================================================
--
-- ROLLBACK INSTRUCTIONS (if counts diverge or build breaks)
-- ─────────────────────────────────────────────────────────
-- 1. git revert <commit-sha>   (reverts businesses/route.ts + [id]/route.ts)
-- 2. In Supabase SQL Editor run:
--      drop function if exists public.scan_counts_by_business(uuid[]);
--      drop function if exists public.scan_counts_by_qr(uuid[]);
-- 3. Verify /admin/businesses loads and scan counts match baseline.
-- ─────────────────────────────────────────────────────────

-- Per-business total scan count
-- Used by: GET /api/admin/businesses (list page)
-- Replaces: unbounded SELECT qr_id FROM qr_scans WHERE qr_id IN (...)
--           counted in JavaScript across all scans ever recorded.
create or replace function public.scan_counts_by_business(biz_ids uuid[])
returns table(business_id uuid, scan_count bigint)
language sql
stable
security definer
set search_path = public
as $$
  select q.business_id, count(s.id)::bigint as scan_count
  from public.qr_codes q
  left join public.qr_scans s on s.qr_id = q.id
  where q.business_id = any(biz_ids)
  group by q.business_id;
$$;

grant execute on function public.scan_counts_by_business(uuid[]) to service_role;

-- Per-QR scan count
-- Used by: GET /api/admin/businesses/[id] (detail page, per-QR breakdown)
-- Replaces: unbounded SELECT qr_id FROM qr_scans WHERE qr_id IN (...)
--           counted per qr_id in JavaScript.
create or replace function public.scan_counts_by_qr(qr_ids_in uuid[])
returns table(qr_id uuid, scan_count bigint)
language sql
stable
security definer
set search_path = public
as $$
  select qr_id, count(id)::bigint as scan_count
  from public.qr_scans
  where qr_id = any(qr_ids_in)
  group by qr_id;
$$;

grant execute on function public.scan_counts_by_qr(uuid[]) to service_role;
