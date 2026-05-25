-- ============================================================
-- Reevo Admin Panel — Foundation Migration (idempotent)
-- Run this in Supabase SQL editor before starting admin build.
-- Safe to re-run: uses IF NOT EXISTS + ON CONFLICT DO NOTHING.
-- ============================================================

-- ── 1. admin_users ──────────────────────────────────────────
-- Stores which auth.users have admin access.
-- No user-level RLS policy — only service role (createAdminClient)
-- can read/write this table. That prevents privilege escalation.
create table if not exists public.admin_users (
  id         uuid        primary key references auth.users(id) on delete cascade,
  email      text        not null,
  role       text        not null default 'admin',
  -- role values: 'super_admin' | 'admin' | 'support'
  created_at timestamptz not null default now()
);

alter table public.admin_users add column if not exists role text not null default 'admin';

alter table public.admin_users enable row level security;
-- Intentionally NO select/insert/update/delete policy for normal users.
-- All admin_users access goes through service role key only.

-- ── 2. businesses — suspension fields ───────────────────────
alter table public.businesses add column if not exists suspended_at     timestamptz;
alter table public.businesses add column if not exists suspended_reason text;

-- ── 3. plan_prices — for MRR calculation ────────────────────
create table if not exists public.plan_prices (
  plan        text primary key,
  price_cents int  not null default 0,
  label       text not null default ''
);

alter table public.plan_prices add column if not exists label text not null default '';

insert into public.plan_prices (plan, price_cents, label) values
  ('free',       0,     'Free'),
  ('starter',    2900,  'Starter'),
  ('pro',        7900,  'Pro'),
  ('enterprise', 19900, 'Enterprise')
on conflict (plan) do nothing;

-- ── 4. audit_logs — indexes for admin queries ───────────────
-- Table already exists from 001_initial_schema.sql.
-- Add indexes needed for admin filter queries.
create index if not exists audit_logs_actor_idx      on public.audit_logs(actor_id);
create index if not exists audit_logs_action_idx     on public.audit_logs(action);
create index if not exists audit_logs_target_idx     on public.audit_logs(target_id);
create index if not exists audit_logs_created_idx    on public.audit_logs(created_at desc);
create index if not exists audit_logs_target_type_idx on public.audit_logs(target_type);

-- ── 5. businesses — indexes for admin list queries ──────────
create index if not exists businesses_plan_idx       on public.businesses(plan);
create index if not exists businesses_created_idx    on public.businesses(created_at desc);
create index if not exists businesses_suspended_idx  on public.businesses(suspended_at);

-- ── 6. subscriptions — indexes for admin queries ────────────
create index if not exists subscriptions_plan_idx    on public.subscriptions(plan);
create index if not exists subscriptions_status_idx  on public.subscriptions(status);

-- ── 7. Seed: promote first admin user ───────────────────────
-- After running this migration, manually insert your admin user:
--
--   insert into public.admin_users (id, email, role)
--   select id, email, 'super_admin'
--   from auth.users
--   where email = 'your-admin@email.com'
--   on conflict (id) do nothing;
--
-- ============================================================
