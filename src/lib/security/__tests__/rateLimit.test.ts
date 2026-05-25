import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock env before any import that pulls in rateLimit.ts, so:
//   - required() vars don't throw (no real Supabase creds in CI)
//   - UPSTASH_URL / UPSTASH_TOKEN are undefined → in-memory path
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

import { rateLimit, getClientIp } from '../rateLimit';

// Each test gets its own key so module-level store doesn't bleed between tests.
let seq = 0;
const key = () => `test-rl-${++seq}`;

// ── in-memory rate limiter ────────────────────────────────────

describe('rateLimit — in-memory fallback (no Upstash)', () => {
  it('allows the first request and returns correct remaining count', async () => {
    const r = await rateLimit(key(), 5, 60_000);
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(4);
  });

  it('decrements remaining on each call', async () => {
    const k = key();
    const r1 = await rateLimit(k, 3, 60_000);
    const r2 = await rateLimit(k, 3, 60_000);
    expect(r1.remaining).toBe(2);
    expect(r2.remaining).toBe(1);
  });

  it('allows the request at the exact limit (remaining = 0)', async () => {
    const k = key();
    await rateLimit(k, 3, 60_000);
    await rateLimit(k, 3, 60_000);
    const r = await rateLimit(k, 3, 60_000); // 3rd of 3
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(0);
  });

  it('blocks the request over the limit (allowed = false, remaining = 0)', async () => {
    const k = key();
    for (let i = 0; i < 3; i++) await rateLimit(k, 3, 60_000);
    const r = await rateLimit(k, 3, 60_000); // 4th of 3
    expect(r.allowed).toBe(false);
    expect(r.remaining).toBe(0);
  });

  it('keeps blocking on further requests beyond the limit', async () => {
    const k = key();
    for (let i = 0; i < 5; i++) await rateLimit(k, 2, 60_000);
    const r = await rateLimit(k, 2, 60_000); // 6th of 2
    expect(r.allowed).toBe(false);
    expect(r.remaining).toBe(0);
  });

  it('different keys are tracked independently', async () => {
    const k1 = key();
    const k2 = key();
    // Fill k1 to its limit
    await rateLimit(k1, 1, 60_000);
    const blocked = await rateLimit(k1, 1, 60_000);
    expect(blocked.allowed).toBe(false);
    // k2 has its own counter — untouched
    const ok = await rateLimit(k2, 1, 60_000);
    expect(ok.allowed).toBe(true);
  });

  it('resetAt is always in the future relative to now', async () => {
    const before = Date.now();
    const r = await rateLimit(key(), 5, 60_000);
    expect(r.resetAt).toBeGreaterThan(before);
  });

  it('resetAt is in the future even when blocked', async () => {
    const k = key();
    for (let i = 0; i < 2; i++) await rateLimit(k, 2, 60_000);
    const r = await rateLimit(k, 2, 60_000); // over limit
    expect(r.allowed).toBe(false);
    expect(r.resetAt).toBeGreaterThan(Date.now());
  });
});

// ── window expiry ─────────────────────────────────────────────

describe('rateLimit — window expiry', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('resets the counter after the window expires', async () => {
    const k = key();
    // Fill limit
    await rateLimit(k, 2, 5_000);
    await rateLimit(k, 2, 5_000);
    const blocked = await rateLimit(k, 2, 5_000);
    expect(blocked.allowed).toBe(false);

    // Advance past the window
    vi.advanceTimersByTime(6_000);

    const reset = await rateLimit(k, 2, 5_000);
    expect(reset.allowed).toBe(true);
    expect(reset.remaining).toBe(1); // 1 of 2 used in fresh window
  });

  it('starts a fresh window with correct resetAt after expiry', async () => {
    const k = key();
    await rateLimit(k, 1, 5_000);
    vi.advanceTimersByTime(6_000);
    const nowAfterAdvance = Date.now(); // fake time
    const r = await rateLimit(k, 1, 5_000);
    // resetAt should be ~5 seconds after the advanced "now"
    expect(r.resetAt).toBeGreaterThanOrEqual(nowAfterAdvance + 4_000);
    expect(r.resetAt).toBeLessThanOrEqual(nowAfterAdvance + 6_000);
  });

  it('does NOT reset before the window expires', async () => {
    const k = key();
    await rateLimit(k, 2, 5_000);
    await rateLimit(k, 2, 5_000);
    const blocked = await rateLimit(k, 2, 5_000);
    expect(blocked.allowed).toBe(false);

    // Only advance partially — window still active
    vi.advanceTimersByTime(2_000);

    const stillBlocked = await rateLimit(k, 2, 5_000);
    expect(stillBlocked.allowed).toBe(false);
  });
});

// ── getClientIp ───────────────────────────────────────────────

function makeReq(headers: Record<string, string> = {}): Request {
  return new Request('http://localhost/', { headers });
}

describe('getClientIp', () => {
  it('prefers x-vercel-forwarded-for (trusted Vercel edge header)', () => {
    const req = makeReq({ 'x-vercel-forwarded-for': '1.2.3.4, 5.6.7.8' });
    expect(getClientIp(req)).toBe('1.2.3.4');
  });

  it('strips extra IPs from x-vercel-forwarded-for', () => {
    const req = makeReq({ 'x-vercel-forwarded-for': '  10.0.0.1 , 10.0.0.2' });
    expect(getClientIp(req)).toBe('10.0.0.1');
  });

  it('falls back to cf-connecting-ip when Vercel header is absent', () => {
    const req = makeReq({ 'cf-connecting-ip': '203.0.113.5' });
    expect(getClientIp(req)).toBe('203.0.113.5');
  });

  it('returns unknown in non-development when no trusted header is present', () => {
    const original = process.env.NODE_ENV;
    (process.env as Record<string, string>).NODE_ENV = 'production';
    expect(getClientIp(makeReq())).toBe('unknown');
    (process.env as Record<string, string>).NODE_ENV = original;
  });

  it('uses x-forwarded-for in development mode', () => {
    const original = process.env.NODE_ENV;
    (process.env as Record<string, string>).NODE_ENV = 'development';
    const req = makeReq({ 'x-forwarded-for': '192.168.1.1, 10.0.0.1' });
    expect(getClientIp(req)).toBe('192.168.1.1');
    (process.env as Record<string, string>).NODE_ENV = original;
  });

  it('returns unknown in development with no headers', () => {
    const original = process.env.NODE_ENV;
    (process.env as Record<string, string>).NODE_ENV = 'development';
    expect(getClientIp(makeReq())).toBe('unknown');
    (process.env as Record<string, string>).NODE_ENV = original;
  });
});
