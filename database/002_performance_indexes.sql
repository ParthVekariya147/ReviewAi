-- ============================================================
-- Reevo — Performance Indexes + generated_reviews.business_id
-- Run AFTER 001_initial_schema.sql
-- Safe to re-run: all statements use IF NOT EXISTS / IF NOT EXISTS guards.
-- ============================================================

-- ── analytics_events ────────────────────────────────────────
-- Composite index: every dashboard analytics query filters by
-- business_id + a time window. Composite is far faster than the
-- two separate single-column indexes already in 001.
create index if not exists idx_ae_business_time
  on public.analytics_events (business_id, created_at desc);

-- Per-campaign drilldown (analytics screen campaign selector)
create index if not exists idx_ae_qr_time
  on public.analytics_events (qr_id, created_at desc);

-- Filter by event_type within a business+time window
create index if not exists idx_ae_business_type_time
  on public.analytics_events (business_id, event_type, created_at desc);

-- ── qr_scans ────────────────────────────────────────────────
-- Column is scanned_at (not created_at). Composite covers
-- per-QR date-range counts used in the dashboard overview.
create index if not exists idx_qr_scans_qr_time
  on public.qr_scans (qr_id, scanned_at desc);

-- ── qr_codes ────────────────────────────────────────────────
-- Dashboard campaign list filters by business_id AND status.
create index if not exists idx_qr_codes_business_status
  on public.qr_codes (business_id, status);

-- Partial index: public funnel token lookup only resolves live codes.
create index if not exists idx_qr_codes_live_token
  on public.qr_codes (token)
  where status = 'live';

-- ── businesses ──────────────────────────────────────────────
-- Every authenticated API route starts with WHERE owner_id = auth.uid().
create index if not exists idx_businesses_owner_id
  on public.businesses (owner_id);

-- ── generated_reviews — add business_id column ─────────────
-- Allows direct tenant filtering without joining through qr_codes.
-- Used by GET /api/reviews history pagination and RLS.
alter table public.generated_reviews
  add column if not exists business_id uuid
  references public.businesses(id) on delete set null;

-- Backfill business_id from parent qr_codes row.
-- No-op if already filled; safe to run repeatedly.
update public.generated_reviews gr
  set business_id = q.business_id
  from public.qr_codes q
  where q.id = gr.qr_id
    and gr.business_id is null;

-- History page pagination: business + newest-first cursor
create index if not exists idx_gr_business_created
  on public.generated_reviews (business_id, created_at desc);

-- Per-campaign review list
create index if not exists idx_gr_qr_created
  on public.generated_reviews (qr_id, created_at desc);

-- ── RLS update for generated_reviews ───────────────────────
-- Direct business_id policy — no join, faster than the existing
-- reviews_owner_read that joins through qr_codes.
drop policy if exists "reviews_owner_direct" on public.generated_reviews;
create policy "reviews_owner_direct" on public.generated_reviews
  for select using (
    business_id in (
      select id from public.businesses where owner_id = auth.uid()
    )
  );

-- ── subscriptions ───────────────────────────────────────────
create index if not exists idx_subscriptions_business_id
  on public.subscriptions (business_id);

-- ── audit_logs ──────────────────────────────────────────────
create index if not exists idx_audit_actor_time
  on public.audit_logs (actor_id, created_at desc);

create index if not exists idx_audit_target_time
  on public.audit_logs (target_type, target_id, created_at desc);
