-- ============================================================
-- Reevo AI Review SaaS — Initial Schema (idempotent)
-- Safe to re-run: uses IF NOT EXISTS + ADD COLUMN IF NOT EXISTS
-- + DROP POLICY IF EXISTS so duplicate errors never occur.
-- ============================================================

-- ── Extensions ──────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ── businesses ──────────────────────────────────────────────
create table if not exists public.businesses (
  id                    uuid primary key default gen_random_uuid(),
  owner_id              uuid not null references auth.users(id) on delete cascade,
  name                  text not null,
  tagline               text,
  google_link           text,
  brand_color           text not null default '#6E5BFF',
  logo_initials         text not null default 'BZ',
  min_rating_for_google int  not null default 4,
  language              text not null default 'en',
  plan                  text not null default 'free',
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- Guard: add any columns that may be missing from older table versions
alter table public.businesses add column if not exists tagline               text;
alter table public.businesses add column if not exists google_link           text;
alter table public.businesses add column if not exists brand_color           text not null default '#6E5BFF';
alter table public.businesses add column if not exists logo_initials         text not null default 'BZ';
alter table public.businesses add column if not exists min_rating_for_google int  not null default 4;
alter table public.businesses add column if not exists language              text not null default 'en';
alter table public.businesses add column if not exists plan                  text not null default 'free';
alter table public.businesses add column if not exists updated_at            timestamptz not null default now();

-- ── qr_codes ────────────────────────────────────────────────
create table if not exists public.qr_codes (
  id              uuid primary key default gen_random_uuid(),
  business_id     uuid not null references public.businesses(id) on delete cascade,
  token           text not null unique,
  campaign_name   text not null,
  status          text not null default 'draft',
  dynamic         boolean not null default true,
  ab_testing      boolean not null default false,
  pause_fallback  boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Guard: add any columns that may be missing from older table versions
alter table public.qr_codes add column if not exists token          text;
alter table public.qr_codes add column if not exists campaign_name  text;
alter table public.qr_codes add column if not exists status         text not null default 'draft';
alter table public.qr_codes add column if not exists dynamic        boolean not null default true;
alter table public.qr_codes add column if not exists ab_testing     boolean not null default false;
alter table public.qr_codes add column if not exists pause_fallback boolean not null default false;
alter table public.qr_codes add column if not exists updated_at     timestamptz not null default now();

-- Ensure token has a unique constraint (safe if it already exists)
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'qr_codes_token_key'
      and conrelid = 'public.qr_codes'::regclass
  ) then
    alter table public.qr_codes add constraint qr_codes_token_key unique (token);
  end if;
end;
$$;

create index if not exists qr_codes_token_idx    on public.qr_codes(token);
create index if not exists qr_codes_business_idx on public.qr_codes(business_id);

-- ── qr_scans ────────────────────────────────────────────────
create table if not exists public.qr_scans (
  id          uuid primary key default gen_random_uuid(),
  qr_id       uuid not null references public.qr_codes(id) on delete cascade,
  device      text,
  country     text,
  scanned_at  timestamptz not null default now()
);

alter table public.qr_scans add column if not exists device     text;
alter table public.qr_scans add column if not exists country    text;
alter table public.qr_scans add column if not exists scanned_at timestamptz not null default now();

create index if not exists qr_scans_qr_id_idx on public.qr_scans(qr_id);
create index if not exists qr_scans_at_idx    on public.qr_scans(scanned_at);

-- ── generated_reviews ───────────────────────────────────────
create table if not exists public.generated_reviews (
  id          uuid primary key default gen_random_uuid(),
  qr_id       uuid not null references public.qr_codes(id) on delete cascade,
  rating      int  not null check (rating between 1 and 5),
  ai_text     text not null,
  refreshes   int  not null default 0,
  copies      int  not null default 0,
  status      text not null default 'generated',
  created_at  timestamptz not null default now()
);

alter table public.generated_reviews add column if not exists refreshes int  not null default 0;
alter table public.generated_reviews add column if not exists copies    int  not null default 0;
alter table public.generated_reviews add column if not exists status    text not null default 'generated';

create index if not exists generated_reviews_qr_id_idx on public.generated_reviews(qr_id);

-- ── analytics_events ────────────────────────────────────────
create table if not exists public.analytics_events (
  id          uuid primary key default gen_random_uuid(),
  qr_id       uuid references public.qr_codes(id) on delete set null,
  business_id uuid references public.businesses(id) on delete set null,
  event_type  text not null,
  device      text,
  country     text,
  meta        jsonb,
  created_at  timestamptz not null default now()
);

alter table public.analytics_events add column if not exists business_id uuid references public.businesses(id) on delete set null;
alter table public.analytics_events add column if not exists device      text;
alter table public.analytics_events add column if not exists country     text;
alter table public.analytics_events add column if not exists meta        jsonb;

create index if not exists analytics_events_qr_id_idx   on public.analytics_events(qr_id);
create index if not exists analytics_events_biz_idx     on public.analytics_events(business_id);
create index if not exists analytics_events_type_idx    on public.analytics_events(event_type);
create index if not exists analytics_events_created_idx on public.analytics_events(created_at);

-- ── subscriptions ───────────────────────────────────────────
create table if not exists public.subscriptions (
  id                  uuid primary key default gen_random_uuid(),
  business_id         uuid not null references public.businesses(id) on delete cascade,
  plan                text not null default 'free',
  status              text not null default 'active',
  provider            text,
  provider_id         text,
  current_period_end  timestamptz,
  cancel_at_end       boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table public.subscriptions add column if not exists provider           text;
alter table public.subscriptions add column if not exists provider_id        text;
alter table public.subscriptions add column if not exists current_period_end timestamptz;
alter table public.subscriptions add column if not exists cancel_at_end      boolean not null default false;
alter table public.subscriptions add column if not exists updated_at         timestamptz not null default now();

create unique index if not exists subscriptions_business_unique on public.subscriptions(business_id);

-- ── invoices ────────────────────────────────────────────────
create table if not exists public.invoices (
  id              uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  business_id     uuid not null references public.businesses(id) on delete cascade,
  amount_cents    int  not null,
  currency        text not null default 'usd',
  status          text not null default 'paid',
  provider_inv_id text,
  pdf_url         text,
  created_at      timestamptz not null default now()
);

alter table public.invoices add column if not exists provider_inv_id text;
alter table public.invoices add column if not exists pdf_url         text;
alter table public.invoices add column if not exists currency        text not null default 'usd';

create index if not exists invoices_business_idx on public.invoices(business_id);

-- ── audit_logs ──────────────────────────────────────────────
create table if not exists public.audit_logs (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references auth.users(id) on delete set null,
  action      text not null,
  target_type text,
  target_id   uuid,
  meta        jsonb,
  created_at  timestamptz not null default now()
);

alter table public.audit_logs add column if not exists target_type text;
alter table public.audit_logs add column if not exists target_id   uuid;
alter table public.audit_logs add column if not exists meta        jsonb;

-- ── updated_at trigger ──────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists businesses_updated_at    on public.businesses;
drop trigger if exists qr_codes_updated_at      on public.qr_codes;
drop trigger if exists subscriptions_updated_at on public.subscriptions;

create trigger businesses_updated_at
  before update on public.businesses
  for each row execute function public.set_updated_at();

create trigger qr_codes_updated_at
  before update on public.qr_codes
  for each row execute function public.set_updated_at();

create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- ── Row Level Security ──────────────────────────────────────
alter table public.businesses        enable row level security;
alter table public.qr_codes          enable row level security;
alter table public.qr_scans          enable row level security;
alter table public.generated_reviews enable row level security;
alter table public.analytics_events  enable row level security;
alter table public.subscriptions     enable row level security;
alter table public.invoices          enable row level security;
alter table public.audit_logs        enable row level security;

-- Drop all policies before recreating so re-runs never throw "already exists"
drop policy if exists "businesses_owner"              on public.businesses;
drop policy if exists "businesses_public_read"        on public.businesses;
drop policy if exists "qr_codes_owner"                on public.qr_codes;
drop policy if exists "qr_codes_public_token_read"    on public.qr_codes;
drop policy if exists "qr_scans_owner_read"           on public.qr_scans;
drop policy if exists "qr_scans_public_insert"        on public.qr_scans;
drop policy if exists "reviews_owner_read"            on public.generated_reviews;
drop policy if exists "reviews_public_insert"         on public.generated_reviews;
drop policy if exists "reviews_public_update"         on public.generated_reviews;
drop policy if exists "analytics_owner_read"          on public.analytics_events;
drop policy if exists "analytics_public_insert"       on public.analytics_events;
drop policy if exists "subscriptions_owner"           on public.subscriptions;
drop policy if exists "invoices_owner"                on public.invoices;

-- businesses
create policy "businesses_owner" on public.businesses
  for all using (owner_id = auth.uid());

create policy "businesses_public_read" on public.businesses
  for select using (
    id in (select business_id from public.qr_codes where status = 'live')
  );

-- qr_codes
create policy "qr_codes_owner" on public.qr_codes
  for all using (
    business_id in (select id from public.businesses where owner_id = auth.uid())
  );

create policy "qr_codes_public_token_read" on public.qr_codes
  for select using (status = 'live');

-- qr_scans
create policy "qr_scans_owner_read" on public.qr_scans
  for select using (
    qr_id in (
      select q.id from public.qr_codes q
      join public.businesses b on b.id = q.business_id
      where b.owner_id = auth.uid()
    )
  );

create policy "qr_scans_public_insert" on public.qr_scans
  for insert with check (true);

-- generated_reviews
create policy "reviews_owner_read" on public.generated_reviews
  for select using (
    qr_id in (
      select q.id from public.qr_codes q
      join public.businesses b on b.id = q.business_id
      where b.owner_id = auth.uid()
    )
  );

create policy "reviews_public_insert" on public.generated_reviews
  for insert with check (true);

create policy "reviews_public_update" on public.generated_reviews
  for update using (true);

-- analytics_events
create policy "analytics_owner_read" on public.analytics_events
  for select using (
    business_id in (select id from public.businesses where owner_id = auth.uid())
  );

create policy "analytics_public_insert" on public.analytics_events
  for insert with check (true);

-- subscriptions / invoices
create policy "subscriptions_owner" on public.subscriptions
  for all using (
    business_id in (select id from public.businesses where owner_id = auth.uid())
  );

create policy "invoices_owner" on public.invoices
  for all using (
    business_id in (select id from public.businesses where owner_id = auth.uid())
  );
