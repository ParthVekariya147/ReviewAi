-- Update upsert_business RPC to accept p_business_type and p_review_keywords.
-- Columns were added in 009_business_ai_fields.sql; this migration wires them
-- into the RPC so the PGRST202 fallback path is no longer needed for these fields.
--
-- DROP the old 10-param overload first. CREATE OR REPLACE only replaces a
-- function with the exact same signature; adding two new params creates a
-- second overload instead, which causes "function name is not unique" (42725).
drop function if exists public.upsert_business(
  uuid, text, text, text, text, text, int, text, jsonb, boolean
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
  p_review_keywords       text    default null
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
    business_type, review_keywords
  ) values (
    p_owner_id, p_name, p_tagline, p_google_link, p_brand_color, p_logo_initials,
    p_min_rating_for_google, p_language, p_review_platforms, p_onboarding_complete,
    p_business_type, p_review_keywords
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
    updated_at            = now()
  returning to_json(businesses.*) into result;

  return result;
end;
$$;

grant execute on function public.upsert_business to authenticated;
notify pgrst, 'reload schema';
