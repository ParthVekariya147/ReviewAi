-- 029_onboarding_required_fields.sql
-- Add owner_name column to businesses and update upsert_business RPC.
-- Safe to re-run (idempotent ADD COLUMN IF NOT EXISTS + CREATE OR REPLACE).

-- ── 1. Add owner_name column ────────────────────────────────────────────────
alter table public.businesses
  add column if not exists owner_name text;

-- ── 2. Backfill existing rows from auth.users metadata ─────────────────────
-- Reads full_name → name → email prefix, in priority order.
-- Only runs for rows with a valid owner_id that have no owner_name yet.
update public.businesses b
set owner_name = (
  select coalesce(
    nullif(trim(u.raw_user_meta_data->>'full_name'), ''),
    nullif(trim(u.raw_user_meta_data->>'name'),      ''),
    split_part(u.email, '@', 1)
  )
  from auth.users u
  where u.id = b.owner_id
)
where b.owner_name is null
  and b.owner_id is not null;

-- ── 3. Drop old 12-param upsert_business, recreate with owner_name param ───
-- Must drop by exact signature because CREATE OR REPLACE won't replace a
-- function whose parameter list changed (would create a new overload instead).
drop function if exists public.upsert_business(
  uuid, text, text, text, text, text, int, text, jsonb, boolean, text, text
);

create or replace function public.upsert_business(
  p_owner_id              uuid,
  p_name                  text,
  p_tagline               text    default null,
  p_google_link           text    default null,
  p_brand_color           text    default '#6E5BFF',
  p_logo_initials         text    default 'BZ',
  p_min_rating_for_google int     default 4,
  p_language              text    default 'en',
  p_review_platforms      jsonb   default '[]'::jsonb,
  p_onboarding_complete   boolean default false,
  p_business_type         text    default null,
  p_review_keywords       text    default null,
  p_owner_name            text    default null
)
returns json
language plpgsql
security invoker
set search_path = public
as $$
declare
  result json;
begin
  insert into public.businesses (
    owner_id, name, tagline, google_link, brand_color, logo_initials,
    min_rating_for_google, language, review_platforms, onboarding_complete,
    business_type, review_keywords, owner_name
  ) values (
    p_owner_id, p_name, p_tagline, p_google_link, p_brand_color, p_logo_initials,
    p_min_rating_for_google, p_language, p_review_platforms, p_onboarding_complete,
    p_business_type, p_review_keywords, p_owner_name
  )
  on conflict (owner_id) do update set
    name                  = excluded.name,
    tagline               = excluded.tagline,
    google_link           = excluded.google_link,
    brand_color           = excluded.brand_color,
    logo_initials         = excluded.logo_initials,
    min_rating_for_google = excluded.min_rating_for_google,
    language              = excluded.language,
    review_platforms      = excluded.review_platforms,
    onboarding_complete   = excluded.onboarding_complete,
    business_type         = excluded.business_type,
    review_keywords       = excluded.review_keywords,
    owner_name            = excluded.owner_name,
    updated_at            = now()
  returning to_json(businesses.*) into result;

  return result;
end;
$$;

grant execute on function public.upsert_business to authenticated;
notify pgrst, 'reload schema';
