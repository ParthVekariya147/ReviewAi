-- Admin key/value settings table for site-wide configuration
CREATE TABLE IF NOT EXISTS admin_settings (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL DEFAULT '',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by  UUID REFERENCES admin_users(id) ON DELETE SET NULL
);

-- RLS: block direct client access — only service role (API routes) may read/write
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "deny_all_direct" ON admin_settings USING (false);

-- Seed defaults
INSERT INTO admin_settings (key, value) VALUES
  ('site_name',              'Reevo'),
  ('support_email',          'support@reevo.io'),
  ('maintenance_mode',       'false'),
  ('feature_flag_ai_v2',     'false'),
  ('feature_flag_new_funnel','false')
ON CONFLICT (key) DO NOTHING;
