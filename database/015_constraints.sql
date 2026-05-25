-- ============================================================
-- 015 — Enum CHECK constraints + GIN index
-- Safe to re-run: uses IF NOT EXISTS / DO $$ guards.
--
-- NOTE: UNIQUE(owner_id) on businesses is intentionally omitted.
-- The app supports multiple businesses per user — adding that
-- constraint would break existing multi-business accounts.
-- ============================================================

-- ── businesses.plan ─────────────────────────────────────────
do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'businesses_plan_check'
      and conrelid = 'public.businesses'::regclass
  ) then
    alter table public.businesses
      add constraint businesses_plan_check
      check (plan in ('free', 'starter', 'pro', 'enterprise'));
  end if;
end $$;

-- ── qr_codes.status ─────────────────────────────────────────
do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'qr_codes_status_check'
      and conrelid = 'public.qr_codes'::regclass
  ) then
    alter table public.qr_codes
      add constraint qr_codes_status_check
      check (status in ('draft', 'live', 'paused', 'archived'));
  end if;
end $$;

-- ── generated_reviews.status ────────────────────────────────
do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'generated_reviews_status_check'
      and conrelid = 'public.generated_reviews'::regclass
  ) then
    alter table public.generated_reviews
      add constraint generated_reviews_status_check
      check (status in ('generated', 'copied', 'redirected', 'submitted', 'abandoned'));
  end if;
end $$;

-- ── subscriptions.plan ──────────────────────────────────────
do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'subscriptions_plan_check'
      and conrelid = 'public.subscriptions'::regclass
  ) then
    alter table public.subscriptions
      add constraint subscriptions_plan_check
      check (plan in ('free', 'starter', 'pro', 'enterprise'));
  end if;
end $$;

-- ── subscriptions.status ────────────────────────────────────
do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'subscriptions_status_check'
      and conrelid = 'public.subscriptions'::regclass
  ) then
    alter table public.subscriptions
      add constraint subscriptions_status_check
      check (status in ('active', 'trialing', 'past_due', 'cancelled'));
  end if;
end $$;

-- ── GIN index on analytics_events.meta (MED-3) ──────────────
-- Enables efficient JSONB containment queries (@>, ?, ?|, ?&).
create index if not exists analytics_events_meta_gin
  on public.analytics_events using gin (meta);
