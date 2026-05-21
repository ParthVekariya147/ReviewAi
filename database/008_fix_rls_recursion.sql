-- Fix: infinite recursion in businesses RLS policy
--
-- Root cause: businesses_public_read queried qr_codes, which triggered
-- qr_codes_owner, which queried businesses → infinite loop.
--
-- Fix: wrap the qr_codes lookup in a security definer function so it
-- runs as the function owner and bypasses RLS on qr_codes, breaking the cycle.

create or replace function public.business_has_live_qr(p_business_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.qr_codes
    where business_id = p_business_id
      and status = 'live'
  );
$$;

drop policy if exists "businesses_public_read" on public.businesses;

create policy "businesses_public_read" on public.businesses
  for select using (public.business_has_live_qr(id));
