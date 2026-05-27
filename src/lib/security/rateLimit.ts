/**
 * Distributed sliding-window rate limiter.
 *
 * When UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN are set (production),
 * rate limits are enforced across all serverless instances via Upstash Redis.
 *
 * When those vars are absent (local dev / CI), falls back to an in-memory
 * sliding window — same interface, single-instance only.
 *
 * All callers must await rateLimit(...).
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis }     from '@upstash/redis';
import { env }       from '@/lib/env';

// ── Upstash path ────────────────────────────────────────────

let redis: Redis | null = null;

function getRedis(): Redis {
  if (!redis) {
    redis = new Redis({
      url:   env.UPSTASH_URL!,
      token: env.UPSTASH_TOKEN!,
    });
  }
  return redis;
}

// Cache one Ratelimit instance per unique (limit, windowMs) pair so we
// don't construct a new object on every request.
const limiterCache = new Map<string, Ratelimit>();

function getLimiter(limit: number, windowMs: number): Ratelimit {
  const k = `${limit}:${windowMs}`;
  if (!limiterCache.has(k)) {
    limiterCache.set(k, new Ratelimit({
      redis:    getRedis(),
      limiter:  Ratelimit.slidingWindow(limit, `${windowMs} ms`),
      analytics: false,
    }));
  }
  return limiterCache.get(k)!;
}

// ── In-memory fallback (dev / single-instance) ───────────────

// Throw at startup in production if Upstash is not configured — in-memory rate limits
// are per-instance and give zero protection against distributed abuse on Vercel serverless.
if (
  typeof process !== 'undefined' &&
  process.env.NODE_ENV === 'production' &&
  process.env.NEXT_PHASE !== 'phase-production-build'
) {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    throw new Error(
      '[rateLimit] UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set in production. ' +
      'In-memory rate limiting is not safe on multi-instance Vercel deployments. ' +
      'Create a free Upstash Redis database at upstash.com and add the credentials to your environment variables.',
    );
  }
}

interface Window { count: number; resetAt: number }
const store = new Map<string, Window>();

if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, win] of store) {
      if (win.resetAt < now) store.delete(key);
    }
  }, 5 * 60 * 1000);
}

// ── Public interface ─────────────────────────────────────────

export interface RateLimitResult {
  allowed:   boolean;
  remaining: number;
  resetAt:   number;
}

/**
 * @param key       Unique identifier — e.g. `"funnel-gen:1.2.3.4"`
 * @param limit     Max requests allowed per window
 * @param windowMs  Window duration in milliseconds
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  if (env.UPSTASH_URL && env.UPSTASH_TOKEN) {
    const { success, remaining, reset } = await getLimiter(limit, windowMs).limit(key);
    return { allowed: success, remaining, resetAt: Number(reset) };
  }

  // In-memory fallback
  const now = Date.now();
  let win = store.get(key);
  if (!win || win.resetAt < now) {
    win = { count: 0, resetAt: now + windowMs };
    store.set(key, win);
  }
  win.count++;
  return {
    allowed:   win.count <= limit,
    remaining: Math.max(0, limit - win.count),
    resetAt:   win.resetAt,
  };
}

/** Extract a best-effort client IP from a Next.js Request */
export function getClientIp(req: Request): string {
  // Vercel sets x-vercel-forwarded-for from its trusted edge network
  const vercelIp = req.headers.get('x-vercel-forwarded-for');
  if (vercelIp) return vercelIp.split(',')[0].trim();

  // Cloudflare sets cf-connecting-ip at the CDN layer
  const cfIp = req.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp;

  // x-forwarded-for is client-controlled — only use in development
  if (process.env.NODE_ENV === 'development') {
    return req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
  }

  return 'unknown';
}
