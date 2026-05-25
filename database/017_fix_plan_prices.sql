-- ============================================================
-- 017 — Fix plan_prices schema to match application code
--
-- Problem: 012_admin_panel.sql created column `price_cents`
-- but all application code queries `amount_cents`, `currency`,
-- and `updated_at`. The /admin/subscriptions/plans page was
-- returning empty data silently.
--
-- Note: public.set_updated_at() already exists (created in
-- 001_initial_schema.sql, shared with businesses/qr_codes/
-- subscriptions/notification_preferences). Only the trigger
-- is created here — the function is not re-defined.
--
-- Safe to re-run: rename guarded by IF EXISTS; columns use
-- IF NOT EXISTS; trigger uses DROP IF EXISTS before CREATE.
-- ============================================================

-- 1. Rename price_cents → amount_cents
--    (consistent with invoices.amount_cents naming)
do $$ begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'plan_prices'
      and column_name  = 'price_cents'
  ) then
    alter table public.plan_prices rename column price_cents to amount_cents;
  end if;
end $$;

-- 2. Add currency column (all existing plans default to USD)
alter table public.plan_prices
  add column if not exists currency text not null default 'usd';

-- 3. Add updated_at column (shown as "Last updated" on plans page)
alter table public.plan_prices
  add column if not exists updated_at timestamptz not null default now();

-- 4. Auto-update trigger for updated_at
--    Fires on every UPDATE, sets updated_at = now().
--    Function public.set_updated_at() already exists from 001_initial_schema.sql.
drop trigger if exists trg_plan_prices_updated_at on public.plan_prices;

create trigger trg_plan_prices_updated_at
  before update on public.plan_prices
  for each row execute function public.set_updated_at();

-- ── ROLLBACK ─────────────────────────────────────────────────
-- drop trigger if exists trg_plan_prices_updated_at on public.plan_prices;
--
-- do $$ begin
--   if exists (
--     select 1 from information_schema.columns
--     where table_schema = 'public'
--       and table_name   = 'plan_prices'
--       and column_name  = 'amount_cents'
--   ) then
--     alter table public.plan_prices rename column amount_cents to price_cents;
--   end if;
-- end $$;
--
-- alter table public.plan_prices drop column if exists currency;
-- alter table public.plan_prices drop column if exists updated_at;
--
-- Note: do NOT drop public.set_updated_at() — it is shared with
-- businesses, qr_codes, subscriptions, and notification_preferences.
-- ─────────────────────────────────────────────────────────────
