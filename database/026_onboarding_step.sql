-- Add onboarding_step to businesses for mid-wizard resume
-- Safe to re-run (idempotent)
alter table public.businesses
  add column if not exists onboarding_step int not null default 0;
