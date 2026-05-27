-- Add review length preference to businesses table.
-- Stored as a JSONB array of one or more: "short" | "medium" | "long".
-- Default: both short and medium selected, matching the product spec.

alter table public.businesses
  add column if not exists review_length_preference jsonb not null default '["short","medium"]'::jsonb;
