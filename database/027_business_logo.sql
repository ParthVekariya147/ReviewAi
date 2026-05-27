-- Migration 027: business logo URL column + Supabase Storage bucket + RLS

-- 1. Add logo_url column to businesses
alter table public.businesses
  add column if not exists logo_url text default null;

-- 2. Create the storage bucket (safe to re-run)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'business-logos',
  'business-logos',
  true,
  2097152,   -- 2 MB
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do nothing;

-- 3. RLS: public read (logos embedded in QR codes must be publicly fetchable)
drop policy if exists "business-logos: public read" on storage.objects;
create policy "business-logos: public read"
  on storage.objects for select
  to public
  using (bucket_id = 'business-logos');

-- 4. RLS: authenticated owners can upload/overwrite their own folder
--    Folder path is:  {business_id}/logo.{ext}
--    We use service-role key on the API side, so these policies are
--    a belt-and-suspenders guard against direct client calls.
drop policy if exists "business-logos: owner insert" on storage.objects;
create policy "business-logos: owner insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'business-logos'
    and exists (
      select 1 from public.businesses b
       where b.owner_id = auth.uid()
         and (storage.foldername(name))[1] = b.id::text
    )
  );

drop policy if exists "business-logos: owner delete" on storage.objects;
create policy "business-logos: owner delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'business-logos'
    and exists (
      select 1 from public.businesses b
       where b.owner_id = auth.uid()
         and (storage.foldername(name))[1] = b.id::text
    )
  );
