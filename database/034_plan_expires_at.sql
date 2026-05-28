-- 034 — plan_expires_at on businesses
-- Lets admins grant a plan for a fixed period (e.g. free-trial upgrade).
-- NULL = permanent (standard Stripe-managed plan, no admin expiry).
-- When set and in the past, funnel enforce treats the business as 'free'.
-- Safe to re-run (IF NOT EXISTS).

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ NULL;

-- ── ROLLBACK ───────────────────────────────────────────────────────────
-- ALTER TABLE businesses DROP COLUMN IF EXISTS plan_expires_at;
-- ──────────────────────────────────────────────────────────────────────
