-- Unique constraint required for ON CONFLICT (owner_id)
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

-- RPC function for upsert — bypasses PostgREST schema cache entirely
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
