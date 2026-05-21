-- Track whether the business owner has completed the onboarding wizard.
-- Dashboard layout redirects to /app/onboarding until this is true.
alter table public.businesses
  add column if not exists onboarding_complete boolean not null default false;
