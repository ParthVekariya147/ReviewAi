-- ============================================================
-- 030 — Plan limits columns on plan_prices
--
-- Adds per-plan usage limits and trial_days so admin panel
-- can control them without a code deploy.
-- Free plan: 5-day trial, 1 campaign, 10 reviews, 50 scans.
-- Paid plans: unlimited by default (-1).
-- Safe to re-run: all ALTER use IF NOT EXISTS.
-- ============================================================

-- trial_days: NULL = no expiry (paid plans), positive int = days from signup
alter table public.plan_prices
  add column if not exists trial_days    int          default null;

-- -1 means unlimited (enterprise, paid plans)
alter table public.plan_prices
  add column if not exists review_limit  int not null default -1;

alter table public.plan_prices
  add column if not exists scan_limit    int not null default -1;

alter table public.plan_prices
  add column if not exists campaign_limit int not null default -1;

-- ── Free plan: very restrictive to drive upgrades ────────────
update public.plan_prices set
  trial_days     = 5,
  review_limit   = 10,
  scan_limit     = 50,
  campaign_limit = 1
where plan = 'free';

-- ── Paid plans: unlimited ────────────────────────────────────
update public.plan_prices set
  trial_days     = null,
  review_limit   = -1,
  scan_limit     = -1,
  campaign_limit = -1
where plan in ('starter', 'pro', 'enterprise');

-- ── ROLLBACK ─────────────────────────────────────────────────
-- alter table public.plan_prices drop column if exists trial_days;
-- alter table public.plan_prices drop column if exists review_limit;
-- alter table public.plan_prices drop column if exists scan_limit;
-- alter table public.plan_prices drop column if exists campaign_limit;
-- ─────────────────────────────────────────────────────────────
