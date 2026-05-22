-- Add AI generation context fields to businesses table
-- business_type: e.g. "Restaurant", "Salon", "Hotel"
-- review_keywords: comma-separated highlights e.g. "wood-fired pizza, cozy patio, friendly staff"

alter table public.businesses
  add column if not exists business_type    text,
  add column if not exists review_keywords  text;
