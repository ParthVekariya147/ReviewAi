-- Reconcile the businesses table for onboarding/profile saves and
-- force PostgREST to reload its schema cache.

alter table public.businesses add column if not exists tagline               text;
alter table public.businesses add column if not exists google_link           text;
alter table public.businesses add column if not exists brand_color           text not null default '#6E5BFF';
alter table public.businesses add column if not exists logo_initials         text not null default 'BZ';
alter table public.businesses add column if not exists min_rating_for_google int  not null default 4;
alter table public.businesses add column if not exists language              text not null default 'en';
alter table public.businesses add column if not exists review_platforms      jsonb not null default '[]'::jsonb;
alter table public.businesses add column if not exists onboarding_complete   boolean not null default false;
alter table public.businesses add column if not exists updated_at            timestamptz not null default now();
alter table public.businesses add column if not exists owner_id              uuid references auth.users(id) on delete cascade;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'businesses'
      and column_name = 'brand_tagline'
  ) then
    execute $sql$
      update public.businesses
         set tagline = coalesce(tagline, brand_tagline, description)
       where tagline is null
    $sql$;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'businesses'
      and column_name = 'google_review_link'
  ) then
    execute $sql$
      update public.businesses
         set google_link = coalesce(google_link, google_review_link)
       where google_link is null
    $sql$;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'businesses'
      and column_name = 'brand_primary_color'
  ) then
    execute $sql$
      update public.businesses
         set brand_color = coalesce(nullif(brand_color, '#6E5BFF'), brand_primary_color, '#6E5BFF')
       where brand_color is null
          or brand_color = '#6E5BFF'
    $sql$;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'businesses'
      and column_name = 'onboarding_completed'
  ) then
    execute $sql$
      update public.businesses
         set onboarding_complete = onboarding_complete or coalesce(onboarding_completed, false)
    $sql$;
  end if;
end;
$$;

update public.businesses
   set logo_initials = upper(left(regexp_replace(coalesce(name, ''), '\s+', '', 'g'), 2))
 where coalesce(logo_initials, '') in ('', 'BZ')
   and coalesce(name, '') <> '';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'businesses_owner_id_key'
      and conrelid = 'public.businesses'::regclass
  ) then
    alter table public.businesses add constraint businesses_owner_id_key unique (owner_id);
  end if;
end;
$$;

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
  p_onboarding_complete   boolean default false
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
    min_rating_for_google, language, review_platforms, onboarding_complete
  ) values (
    p_owner_id, p_name, p_tagline, p_google_link, p_brand_color, p_logo_initials,
    p_min_rating_for_google, p_language, p_review_platforms, p_onboarding_complete
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
    updated_at            = now()
  returning to_json(businesses.*) into result;

  return result;
end;
$$;

grant execute on function public.upsert_business to authenticated;
notify pgrst, 'reload schema';
