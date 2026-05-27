-- Add funnel presentation columns to businesses table
alter table public.businesses
  add column if not exists funnel_style   text not null default 'elegant',
  add column if not exists funnel_heading text default null,
  add column if not exists funnel_sub     text default null;
