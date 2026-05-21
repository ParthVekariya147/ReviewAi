-- Add review_platforms JSONB column to businesses.
-- Stores an ordered list of { id, url, enabled } entries.
-- Falls back to google_link for businesses that haven't configured platforms yet.
alter table public.businesses
  add column if not exists review_platforms jsonb not null default '[]'::jsonb;
