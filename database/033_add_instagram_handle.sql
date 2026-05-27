-- Add instagram_handle to businesses table
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS instagram_handle TEXT NULL;

ALTER TABLE businesses
  ADD CONSTRAINT chk_instagram_handle
  CHECK (instagram_handle IS NULL OR instagram_handle ~ '^[a-zA-Z0-9._]{1,30}$');
