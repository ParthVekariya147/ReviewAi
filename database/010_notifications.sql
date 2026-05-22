-- ── notification_reads ────────────────────────────────────────────────────────
-- Tracks which derived notification IDs have been marked read per business.
create table if not exists public.notification_reads (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  notif_id    text not null,
  read_at     timestamptz not null default now()
);

create unique index if not exists notification_reads_biz_notif
  on public.notification_reads(business_id, notif_id);

create index if not exists notification_reads_biz_idx
  on public.notification_reads(business_id);

-- ── notification_preferences ──────────────────────────────────────────────────
-- Per-business notification preference toggles.
create table if not exists public.notification_preferences (
  business_id         uuid primary key references public.businesses(id) on delete cascade,
  new_5star           boolean not null default true,
  low_ratings         boolean not null default true,
  quota_alerts        boolean not null default true,
  funnel_performance  boolean not null default false,
  team_activity       boolean not null default false,
  billing_invoices    boolean not null default true,
  product_updates     boolean not null default false,
  updated_at          timestamptz not null default now()
);

drop trigger if exists notification_preferences_updated_at on public.notification_preferences;
create trigger notification_preferences_updated_at
  before update on public.notification_preferences
  for each row execute function public.set_updated_at();

-- ── RLS ──────────────────────────────────────────────────────────────────────
alter table public.notification_reads       enable row level security;
alter table public.notification_preferences enable row level security;

drop policy if exists "notif_reads_owner"  on public.notification_reads;
drop policy if exists "notif_prefs_owner"  on public.notification_preferences;

create policy "notif_reads_owner" on public.notification_reads
  for all using (
    business_id in (select id from public.businesses where owner_id = auth.uid())
  );

create policy "notif_prefs_owner" on public.notification_preferences
  for all using (
    business_id in (select id from public.businesses where owner_id = auth.uid())
  );
