import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Static mocks (hoisted before imports) ─────────────────────

vi.mock('@/lib/env', () => ({
  env: {
    UPSTASH_URL:           undefined,
    UPSTASH_TOKEN:         undefined,
    SUPABASE_URL:          'http://localhost:54321',
    SUPABASE_ANON_KEY:     'test-anon-key',
    SUPABASE_SERVICE_ROLE: 'test-service-role',
    APP_URL:               'http://localhost:3000',
  },
}));

// rateLimit always allows — tested separately in rateLimit.test.ts
vi.mock('@/lib/security/rateLimit', () => ({
  rateLimit: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}));

// ── Imports (after mocks) ─────────────────────────────────────

import { requireAdmin } from '../auth';
import { headers }      from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { rateLimit }    from '@/lib/security/rateLimit';

// ── Helpers ───────────────────────────────────────────────────

/** Build a headers mock that returns the given key→value map */
function mockHeaders(entries: Record<string, string> = {}) {
  vi.mocked(headers).mockResolvedValue({
    get: (name: string) => entries[name] ?? null,
  } as Awaited<ReturnType<typeof headers>>);
}

/** Build a supabase client mock with a fixed getUser result */
function mockSupabase(userId: string | null, email = 'user@test.com') {
  const user = userId ? { id: userId, email } : null;
  vi.mocked(createClient).mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user },
        error: userId ? null : { message: 'No session' },
      }),
    },
  } as unknown as Awaited<ReturnType<typeof createClient>>);
}

/** Build an admin DB mock returning a specific adminUser row (or null) */
function mockAdminDb(row: Record<string, string> | null) {
  const maybeSingle = vi.fn().mockResolvedValue({ data: row, error: row ? null : { message: 'Not found' } });
  const eq          = vi.fn().mockReturnValue({ maybeSingle });
  const select      = vi.fn().mockReturnValue({ eq });
  const from        = vi.fn().mockReturnValue({ select });
  vi.mocked(createAdminClient).mockReturnValue({ from } as unknown as ReturnType<typeof createAdminClient>);
}

const ALLOW = { allowed: true, remaining: 59, resetAt: Date.now() + 60_000 };
const BLOCK  = { allowed: false, remaining: 0,  resetAt: Date.now() + 60_000 };

// ── Tests ─────────────────────────────────────────────────────

describe('requireAdmin — rate limiting', () => {
  beforeEach(() => {
    mockHeaders({ 'x-vercel-forwarded-for': '1.2.3.4' });
    vi.mocked(rateLimit).mockResolvedValue(ALLOW);
  });

  it('returns 429 when the rate limit is exceeded', async () => {
    vi.mocked(rateLimit).mockResolvedValue(BLOCK);
    mockSupabase(null);

    const result = await requireAdmin();

    expect('error' in result).toBe(true);
    if ('error' in result) expect(result.error.status).toBe(429);
  });
});

describe('requireAdmin — fast path (middleware headers present)', () => {
  const ADMIN_ID = 'admin-abc';

  beforeEach(() => {
    vi.mocked(rateLimit).mockResolvedValue(ALLOW);
  });

  it('returns AdminContext when JWT user.id matches x-admin-id', async () => {
    mockHeaders({
      'x-admin-id':         ADMIN_ID,
      'x-admin-email':      'admin@test.com',
      'x-admin-role':       'super_admin',
      'x-admin-created-at': '2024-01-01T00:00:00Z',
    });
    mockSupabase(ADMIN_ID, 'admin@test.com');

    const result = await requireAdmin();

    expect('ctx' in result).toBe(true);
    if ('ctx' in result) {
      expect(result.ctx.user.id).toBe(ADMIN_ID);
      expect(result.ctx.adminUser.role).toBe('super_admin');
    }
  });

  it('returns 403 when JWT user.id differs from x-admin-id (header spoof attempt)', async () => {
    mockHeaders({
      'x-admin-id':         ADMIN_ID,
      'x-admin-email':      'admin@test.com',
      'x-admin-role':       'super_admin',
      'x-admin-created-at': '2024-01-01T00:00:00Z',
    });
    // JWT belongs to a different user — spoof attempt
    mockSupabase('different-user-id', 'other@test.com');

    const result = await requireAdmin();

    expect('error' in result).toBe(true);
    if ('error' in result) expect(result.error.status).toBe(403);
  });

  it('returns 401 when session is invalid even with valid admin headers', async () => {
    mockHeaders({
      'x-admin-id':         ADMIN_ID,
      'x-admin-email':      'admin@test.com',
      'x-admin-role':       'super_admin',
      'x-admin-created-at': '2024-01-01T00:00:00Z',
    });
    // getUser returns null — session expired / revoked
    mockSupabase(null);

    const result = await requireAdmin();

    expect('error' in result).toBe(true);
    if ('error' in result) expect(result.error.status).toBe(401);
  });
});

describe('requireAdmin — slow path (no middleware headers, DB fallback)', () => {
  beforeEach(() => {
    vi.mocked(rateLimit).mockResolvedValue(ALLOW);
    // No x-admin-* headers — triggers DB lookup
    mockHeaders({});
  });

  it('returns AdminContext when JWT is valid and user is in admin_users', async () => {
    const userId = 'db-admin-xyz';
    mockSupabase(userId, 'admin@test.com');
    mockAdminDb({ id: userId, email: 'admin@test.com', role: 'admin', created_at: '2024-01-01' });

    const result = await requireAdmin();

    expect('ctx' in result).toBe(true);
    if ('ctx' in result) {
      expect(result.ctx.user.id).toBe(userId);
      expect(result.ctx.adminUser.role).toBe('admin');
    }
  });

  it('returns 401 when there is no valid session', async () => {
    mockSupabase(null);
    mockAdminDb(null);

    const result = await requireAdmin();

    expect('error' in result).toBe(true);
    if ('error' in result) expect(result.error.status).toBe(401);
  });

  it('returns 403 when JWT is valid but user is not in admin_users', async () => {
    mockSupabase('regular-user-id', 'user@test.com');
    mockAdminDb(null); // not in admin_users table

    const result = await requireAdmin();

    expect('error' in result).toBe(true);
    if ('error' in result) expect(result.error.status).toBe(403);
  });
});
