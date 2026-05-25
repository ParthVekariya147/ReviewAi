/**
 * E2E test data seeding helpers.
 *
 * Requires a real Supabase project pointed at by .env.test.
 * Uses the service-role key so RLS is bypassed — NEVER call from the browser.
 *
 * Usage (inside a Playwright test file):
 *   import { seedFunnelToken, cleanupFunnelToken } from './helpers/seed';
 *
 *   let token: string;
 *   test.beforeAll(async () => { token = await seedFunnelToken(); });
 *   test.afterAll(async  () => { await cleanupFunnelToken(token); });
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('23456789abcdefghjkmnpqrstuvwxyz', 8);

function db(): SupabaseClient {
  const url   = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const token = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !token) {
    throw new Error(
      '[seed] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. ' +
      'Fill in .env.test before running E2E tests.'
    );
  }
  return createClient(url, token, { auth: { persistSession: false } });
}

export interface SeedResult {
  token:      string;
  businessId: string;
  qrId:       string;
  /** Call cleanup() in afterAll to remove test rows */
  cleanup:    () => Promise<void>;
}

/**
 * Insert a minimal business + live QR code and return the public token.
 * Caller must invoke cleanup() after the test run.
 */
export async function seedFunnelToken(options?: {
  minRating?: number;
  platforms?: { id: string; url: string; enabled: boolean }[];
}): Promise<SeedResult> {
  const supabase = db();
  const qrToken  = `e2e-${nanoid(6)}`;

  // Create a synthetic owner UUID that won't conflict with real users
  const ownerId = '00000000-0000-0000-0000-000000000e2e';

  // Upsert a placeholder auth user so the FK is satisfied
  // (only works with service-role; ignored if user already exists)
  await supabase.auth.admin.createUser({
    email:    `e2e-seed@test.invalid`,
    password: nanoid(12),
    user_metadata: { e2e: true },
  }).catch(() => { /* user may already exist from a previous run */ });

  const platforms = options?.platforms ?? [
    { id: 'google', url: 'https://g.page/r/test-review-link', enabled: true },
  ];

  const { data: biz, error: bizErr } = await supabase
    .from('businesses')
    .insert({
      owner_id:             ownerId,
      name:                 'E2E Test Cafe',
      tagline:              'Testing coffee since 2024',
      google_link:          platforms[0]?.url ?? '',
      brand_color:          '#6E5BFF',
      logo_initials:        'EC',
      min_rating_for_google: options?.minRating ?? 4,
      language:             'en',
      review_platforms:     platforms,
      plan:                 'pro',
    })
    .select('id')
    .single();

  if (bizErr || !biz) throw new Error(`[seed] business insert failed: ${bizErr?.message}`);

  const { data: qr, error: qrErr } = await supabase
    .from('qr_codes')
    .insert({
      business_id:   biz.id,
      token:         qrToken,
      campaign_name: 'E2E Test Campaign',
      status:        'live',
      dynamic:       true,
    })
    .select('id')
    .single();

  if (qrErr || !qr) throw new Error(`[seed] qr_code insert failed: ${qrErr?.message}`);

  const cleanup = async () => {
    await supabase.from('qr_codes').delete().eq('id', qr.id);
    await supabase.from('businesses').delete().eq('id', biz.id);
  };

  return { token: qrToken, businessId: biz.id, qrId: qr.id, cleanup };
}

/** Remove all test rows created by seedFunnelToken by token prefix */
export async function cleanupByPrefix(prefix = 'e2e-'): Promise<void> {
  const supabase = db();
  await supabase.from('qr_codes').delete().like('token', `${prefix}%`);
}
