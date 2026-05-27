-- ============================================================
-- 031 — is_popular flag on plan_prices
--
-- Allows admin to mark one plan as "Most Popular" without a
-- code deploy. The flag drives the badge on the marketing
-- pricing page and the admin Plan Config cards.
-- Safe to re-run: uses IF NOT EXISTS / idempotent UPDATE.
-- ============================================================

alter table public.plan_prices
  add column if not exists is_popular boolean not null default false;

-- Default: pro is popular (matches previous hardcoded behaviour)
update public.plan_prices set is_popular = true  where plan = 'pro';
update public.plan_prices set is_popular = false where plan <> 'pro';

-- ── ROLLBACK ─────────────────────────────────────────────────
-- alter table public.plan_prices drop column if exists is_popular;
-- ─────────────────────────────────────────────────────────────
