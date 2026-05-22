/**
 * Simple sliding-window in-memory rate limiter.
 * Works for single-instance Node.js (API routes).
 * Swap the store for Upstash Redis when scaling horizontally.
 */

interface Window {
  count:    number;
  resetAt:  number;
}

const store = new Map<string, Window>();

/* Prune expired windows every 5 minutes to prevent unbounded growth */
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, win] of store) {
      if (win.resetAt < now) store.delete(key);
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitResult {
  allowed:    boolean;
  remaining:  number;
  resetAt:    number;
}

/**
 * @param key       Unique identifier (IP + route, or user ID)
 * @param limit     Max requests per window
 * @param windowMs  Window duration in milliseconds
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  let win = store.get(key);

  if (!win || win.resetAt < now) {
    win = { count: 0, resetAt: now + windowMs };
    store.set(key, win);
  }

  win.count++;
  const remaining = Math.max(0, limit - win.count);
  const allowed   = win.count <= limit;

  return { allowed, remaining, resetAt: win.resetAt };
}

/** Extract a best-effort client IP from a Next.js Request */
export function getClientIp(req: Request): string {
  // Trust platform-set headers (cannot be spoofed by clients)
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
