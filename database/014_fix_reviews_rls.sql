-- ============================================================
-- Migration 014: Fix open RLS policies on generated_reviews
--                and qr_scans (audit finding CRIT-2 + MED-1)
--
-- WHAT THIS FIXES:
--   CRIT-2: reviews_public_update used (true) — any anon user
--           on the internet could UPDATE any row in the table.
--   MED-1:  qr_scans_public_insert used (true) — any anon user
--           could insert fabricated scan rows for any QR code.
--
-- HOW THE LEGITIMATE FUNNEL STILL WORKS:
--   The public funnel update path (/api/funnel/status) uses
--   createClient() which runs as the anon role and hits RLS.
--   After this migration:
--     - The RLS USING clause gates which rows can be updated
--       (only rows whose qr_id belongs to a live QR code).
--     - The column grant gates which columns can be changed
--       (only copies and status — not ai_text, rating, etc.).
--   createAdminClient() uses the service role which bypasses
--   RLS entirely, so no admin operations are affected.
--
-- Safe to re-run: uses DROP IF EXISTS + CREATE.
-- ============================================================

-- ── 1. generated_reviews: replace open update policy ────────

-- Drop the dangerous open policy
drop policy if exists "reviews_public_update" on public.generated_reviews;

-- Replace with a scoped policy:
--   USING: the row being updated must belong to a live QR code
--   WITH CHECK: the row after update must still belong to a live QR code
--   (WITH CHECK prevents moving a row to a different qr_id that is not live)
drop policy if exists "reviews_public_update_scoped" on public.generated_reviews;
create policy "reviews_public_update_scoped" on public.generated_reviews
  for update
  using (
    qr_id in (
      select id from public.qr_codes where status = 'live'
    )
  )
  with check (
    qr_id in (
      select id from public.qr_codes where status = 'live'
    )
  );

-- Column-level grant: even when the RLS policy above allows the
-- UPDATE, the anon role is restricted to only the copies and
-- status columns. An attacker cannot overwrite ai_text, rating,
-- qr_id, business_id, or created_at through the anon client.
revoke update on public.generated_reviews from anon;
grant  update (copies, status) on public.generated_reviews to anon;

-- ── 2. qr_scans: replace open insert policy ─────────────────

-- Drop the open insert policy that allowed inserting scan rows
-- for ANY qr_id without verifying it is a live campaign.
drop policy if exists "qr_scans_public_insert" on public.qr_scans;

-- Replace with a check that enforces the qr_id must reference
-- a live QR code. This mirrors the check the API already performs
-- but enforces it at the database level so the API cannot be bypassed.
drop policy if exists "qr_scans_public_insert_scoped" on public.qr_scans;
create policy "qr_scans_public_insert_scoped" on public.qr_scans
  for insert
  with check (
    qr_id in (
      select id from public.qr_codes where status = 'live'
    )
  );

-- ── 3. analytics_events: tighten open insert policy ─────────
-- Same pattern as qr_scans — prevents direct DB writes for
-- arbitrary qr_ids that bypass the API's token validation.
drop policy if exists "analytics_public_insert" on public.analytics_events;

drop policy if exists "analytics_public_insert_scoped" on public.analytics_events;
create policy "analytics_public_insert_scoped" on public.analytics_events
  for insert
  with check (
    qr_id in (
      select id from public.qr_codes where status = 'live'
    )
  );

-- ============================================================
-- VERIFY after running:
--   See database/tests/014_verify.sql for test queries.
-- ============================================================
