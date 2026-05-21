# Backend Implementation Plan — Business Dashboard Wire-Up

> **Goal:** Replace all mock/generated data in the business dashboard with real Supabase data.  
> Design for large user scale, sub-200ms API responses, and zero data leakage between tenants.

---

## 1. Current State Audit

### Real APIs (already built)
| Route | Method | Status |
|-------|--------|--------|
| `/api/businesses` | GET / POST / PATCH | ✅ Real DB |
| `/api/qr` | GET / POST | ✅ Real DB |
| `/api/qr/[id]` | GET | ✅ Real DB |
| `/api/qr/[id]/image` | GET | ✅ Real DB |
| `/api/analytics/event` | POST | ✅ Real DB |
| `/api/analytics/summary` | GET | ✅ Real DB (in-memory aggregation) |

### Dashboard Screens — Mock Data Inventory
| Screen | Mock usage | APIs needed |
|--------|-----------|------------|
| `ScreenDashboard` | `genSeries()`, hardcoded campaigns + activity | `/api/dashboard/overview` |
| `ScreenAnalytics` | All stats + chart series are generated | `/api/analytics/summary` (already exists — needs wiring) |
| `ScreenQR` | Hardcoded campaigns list | `/api/qr` (exists — needs wiring) + PATCH + DELETE |
| `ScreenFunnel` | Hardcoded funnel config | `/api/funnel` (new) |
| `ScreenHistory` | Hardcoded review list | `/api/reviews` (new) |
| `ScreenUsage` | Hardcoded plan limits | `/api/billing/usage` (new) |
| `ScreenBilling` | Hardcoded invoice list | Skip — Module 7 later |
| `ScreenSettings` | Hardcoded business profile | `/api/businesses` (exists — needs wiring) |
| `ScreenProfile` | Hardcoded user info | Supabase `auth.getUser()` direct |

---

## 2. API Design — Full Inventory

### 2.1 Dashboard Overview (New — Priority 1)

**Why a combined endpoint?** The main dashboard page needs 4 data sets (KPIs, campaigns, activity, usage) in one paint. A single combined fetch avoids 4 waterfalls and halves perceived load time.

```
GET /api/dashboard/overview
Authorization: Bearer <session>
Cache: s-maxage=30, stale-while-revalidate=60
```

**Response shape:**
```json
{
  "business": { "id": "...", "name": "...", "plan": "pro" },
  "kpis": {
    "scans": 6204, "scans_delta": 12.4,
    "generates": 1840, "generates_delta": 8.2,
    "redirects": 1102, "redirects_delta": 5.7,
    "conversion": 0.177, "conversion_delta": 2.1
  },
  "chart_series": [{ "date": "2026-04-21", "scans": 214, "generates": 62, "redirects": 39 }],
  "active_campaigns": [
    { "id": "...", "name": "Front Counter", "token": "fc-2k4", "scans": 1284, "conversion": 0.412, "status": "live" }
  ],
  "recent_activity": [
    { "type": "complete", "label": "Customer #4821 submitted a 5★ review", "ts": "2026-05-21T10:02:00Z" }
  ],
  "usage": { "reviews_used": 1284, "reviews_limit": 2500, "scans_used": 3050, "scans_limit": 10000, "campaigns_used": 4, "campaigns_limit": 10 }
}
```

**Implementation — `src/app/api/dashboard/overview/route.ts`:**
- Run 3 Supabase queries in parallel via `Promise.all()`:
  1. `businesses` row (plan + config)
  2. Last 30d `analytics_events` grouped by day (DB-side `group by date_trunc('day', created_at)`)
  3. `qr_codes` list with per-code scan counts

---

### 2.2 Analytics Summary (Exists — Needs DB-side Aggregation)

**Problem:** Current implementation pulls ALL events into JS memory and loops in Node. At 100k events/month per business this is a 50ms+ Node loop burning lambda time.

**Fix:** Move aggregation to Postgres.

```sql
-- Add to Supabase as an RPC function
create or replace function analytics_summary(
  p_business_id uuid,
  p_since timestamptz
) returns json language sql stable security definer as $$
  select json_build_object(
    'totals', (
      select json_object_agg(event_type, cnt)
      from (select event_type, count(*) as cnt from analytics_events
            where business_id = p_business_id and created_at >= p_since
            group by event_type) t
    ),
    'daily_series', (
      select json_agg(row to json order by day)
      from (select date_trunc('day', created_at)::date as day,
                   event_type, count(*) as cnt
            from analytics_events
            where business_id = p_business_id and created_at >= p_since
            group by 1, 2) t
    ),
    'by_device', (
      select json_object_agg(device, cnt)
      from (select device, count(*) as cnt from analytics_events
            where business_id = p_business_id and created_at >= p_since and device is not null
            group by device) t
    )
  );
$$;
```

**API route calls:** `supabase.rpc('analytics_summary', { p_business_id, p_since })` — single round-trip, no JS aggregation.

---

### 2.3 QR Campaigns — Missing Methods

```
PATCH  /api/qr/[id]          — update campaign (name, status, pause_fallback, ab_testing)
DELETE /api/qr/[id]          — soft-delete (set status='deleted')
POST   /api/qr/[id]/duplicate — clone a campaign with a new token
```

**Security rule:** Each handler must verify `qr_codes.business_id = user's business_id` before any mutation. Never trust the `id` param alone.

---

### 2.4 Funnel Config (New)

The funnel screen lets business owners customize the AI prompt tone, min rating for Google redirect, logo, and brand color.

```
GET   /api/funnel    — returns funnel settings (merged from businesses table)
PATCH /api/funnel    — update: min_rating_for_google, language, brand_color, tagline
```

These fields already exist on the `businesses` table. No new table needed — `PATCH /api/businesses` already works. The funnel screen just needs to call it.

---

### 2.5 Review History (New)

```
GET /api/reviews?page=1&per_page=25&qr_id=<optional>
Authorization: Bearer <session>
```

**Response:**
```json
{
  "reviews": [
    { "id": "...", "qr_id": "...", "campaign_name": "Front Counter",
      "rating": 5, "ai_text": "...", "refreshed": 1, "created_at": "..." }
  ],
  "total": 1284,
  "page": 1,
  "per_page": 25
}
```

**Pagination:** Use cursor-based pagination via `created_at + id` (faster than OFFSET at scale).

---

### 2.6 Usage Tracking (New)

```
GET /api/billing/usage
Authorization: Bearer <session>
```

**Response:**
```json
{
  "plan": "pro",
  "period_start": "2026-05-01",
  "period_end": "2026-06-01",
  "reviews_used": 1284,
  "reviews_limit": 2500,
  "scans_used": 3050,
  "scans_limit": 10000,
  "campaigns_used": 4,
  "campaigns_limit": 10
}
```

Pull limits from a static `PLAN_LIMITS` constant (keyed by plan name) so they're not round-tripped from DB:

```typescript
// src/lib/billing/plans.ts
export const PLAN_LIMITS = {
  free:       { reviews: 100,  scans: 500,   campaigns: 2  },
  starter:    { reviews: 500,  scans: 2000,  campaigns: 5  },
  pro:        { reviews: 2500, scans: 10000, campaigns: 10 },
  enterprise: { reviews: -1,   scans: -1,    campaigns: -1 }, // unlimited
} as const;
```

---

## 3. Database Indexes (Critical for Scale)

Add these in a new migration `database/002_performance_indexes.sql`:

```sql
-- analytics_events: the hottest read path
create index if not exists idx_ae_business_created
  on analytics_events (business_id, created_at desc);

create index if not exists idx_ae_qr_created
  on analytics_events (qr_id, created_at desc);

-- qr_codes: dashboard list + token lookup
create index if not exists idx_qr_business_status
  on qr_codes (business_id, status);

create index if not exists idx_qr_token
  on qr_codes (token);   -- already unique but make sure it's indexed

-- generated_reviews: history page pagination
create index if not exists idx_reviews_business_created
  on generated_reviews (business_id, created_at desc);

-- qr_scans: quick count per QR
create index if not exists idx_scans_qr_created
  on qr_scans (qr_id, created_at desc);
```

**Expected impact:** Analytics summary query drops from full-table-scan (~500ms) to index-seek (~10ms) at 1M rows.

---

## 4. Performance Architecture

### 4.1 Parallel Queries (Not Sequential)

Current pattern in every API route:
```typescript
// BAD — sequential, 3 round trips
const user = await supabase.auth.getUser();       // 40ms
const biz  = await supabase.from('businesses')... // 30ms
const data = await supabase.from('qr_codes')...   // 30ms
// total: ~100ms
```

Fix with parallel where possible:
```typescript
// GOOD — parallel where auth result is needed but biz+data can race
const { data: { user } } = await supabase.auth.getUser();
if (!user) return unauthorized();
const [bizResult, dataResult] = await Promise.all([
  supabase.from('businesses').select('id').eq('owner_id', user.id).single(),
  supabase.from('qr_codes').select('*').eq('business_id', knownBizId)...
]);
```

For the dashboard overview: all 3 sub-queries run in `Promise.all()` after resolving `business_id` (one sequential lookup, then parallel fan-out).

### 4.2 Response Caching

| Route | Strategy | Rationale |
|-------|----------|-----------|
| `GET /api/dashboard/overview` | `Cache-Control: s-maxage=30, stale-while-revalidate=60` | Fresh enough for dashboard; CDN serves stale while revalidating |
| `GET /api/analytics/summary` | `Cache-Control: s-maxage=60, stale-while-revalidate=300` | Analytics lag is acceptable |
| `GET /api/qr/[id]/image` | `Cache-Control: public, max-age=86400` | QR image is deterministic; 24h CDN cache |
| `GET /api/qr` | `Cache-Control: s-maxage=10, stale-while-revalidate=30` | Campaign list changes rarely |
| `POST /api/analytics/event` | No cache | Write path |

Add `next: { revalidate: 30 }` to server-side data fetches in page components that render on the server.

### 4.3 Rate Limiting — Redis Upgrade

Current in-memory `Map` limiter breaks when running more than one serverless instance (Vercel scales horizontally). Upgrade path:

```typescript
// src/lib/security/rateLimit.ts — add Upstash Redis adapter
// Keep the existing Map-based fallback when UPSTASH_REDIS_REST_URL is not set
// This makes local dev work without Redis config

import { Redis } from '@upstash/redis';

const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN! })
  : null;

export async function rateLimitRedis(key: string, limit: number, windowSec: number) {
  if (!redis) return rateLimit(key, limit, windowSec * 1000); // local fallback
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, windowSec);
  return { allowed: count <= limit, remaining: Math.max(0, limit - count) };
}
```

**Environment variables to add:**
```
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

### 4.4 Supabase Connection Pooling

For serverless deployments, always use the **pooler** connection string (port 6543, PgBouncer in transaction mode) — not the direct DB connection (port 5432). Already handled by the Supabase JS client; confirm in Supabase dashboard → Project Settings → Database → Connection string → "Transaction" mode.

---

## 5. Security Architecture

### 5.1 Multi-Tenant Data Isolation (Row Level Security)

Every table must have RLS enabled and a policy that enforces `business_id` ownership. Verify these are in `database/001_initial_schema.sql`:

```sql
-- businesses: owner can only see own row
alter table businesses enable row level security;
create policy "owner_select" on businesses for select using (owner_id = auth.uid());
create policy "owner_update" on businesses for update using (owner_id = auth.uid());

-- qr_codes: must belong to user's business
create policy "owner_qr_select" on qr_codes for select using (
  business_id in (select id from businesses where owner_id = auth.uid())
);

-- analytics_events: read own events only
create policy "owner_ae_select" on analytics_events for select using (
  business_id in (select id from businesses where owner_id = auth.uid())
);

-- generated_reviews: read own reviews only
create policy "owner_reviews_select" on generated_reviews for select using (
  business_id in (select id from businesses where owner_id = auth.uid())
);
```

**Critical:** The `POST /api/analytics/event` route is public (no auth). It resolves `business_id` from the QR token — so the token is the only identity signal. This is correct; customers have no session.

### 5.2 Input Sanitization

All string inputs at API boundaries must be sanitized before DB write:

```typescript
// src/lib/security/sanitize.ts
export function sanitizeString(s: unknown, maxLen = 255): string {
  if (typeof s !== 'string') return '';
  return s.trim().slice(0, maxLen).replace(/[<>]/g, ''); // strip HTML angle brackets
}
```

Apply to: `business.name`, `campaign_name`, `tagline`, any free-text field.

### 5.3 Auth Validation Pattern

Every authenticated route must follow this pattern — never skip the user check:

```typescript
const { data: { user }, error } = await supabase.auth.getUser();
if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
```

Never use `supabase.auth.getSession()` server-side — it trusts the cookie without re-validating with the auth server. `getUser()` makes a network call that validates the JWT, which prevents token replay attacks.

### 5.4 Audit Logging (Admin Actions)

All admin mutations must write to `audit_logs`:

```typescript
await supabase.from('audit_logs').insert({
  actor_id:    adminUser.id,
  action:      'suspend_business',
  target_type: 'business',
  target_id:   businessId,
  meta:        { reason },
});
```

### 5.5 Environment Secrets Checklist

```
NEXT_PUBLIC_SUPABASE_URL          — safe to expose (public client)
NEXT_PUBLIC_SUPABASE_ANON_KEY     — safe to expose (RLS enforces access)
SUPABASE_SERVICE_ROLE_KEY         — NEVER in client code; admin routes only
GEMINI_API_KEY                    — server-only
UPSTASH_REDIS_REST_URL            — server-only
UPSTASH_REDIS_REST_TOKEN          — server-only
```

Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local` but **never** to `NEXT_PUBLIC_*`.

---

## 6. Implementation Order

### Phase A — Dashboard Wire-Up (All Screens Get Real Data)

| Step | Task | Files |
|------|------|-------|
| A1 | Add DB indexes migration | `database/002_performance_indexes.sql` |
| A2 | Add Postgres RPC for analytics aggregation | `database/003_analytics_rpc.sql` |
| A3 | Build `GET /api/dashboard/overview` | `src/app/api/dashboard/overview/route.ts` |
| A4 | Wire `ScreenDashboard` — replace `genSeries()` with `useSWR('/api/dashboard/overview')` | `src/components/dashboard/screens/ScreenDashboard.tsx` |
| A5 | Wire `ScreenAnalytics` — call `/api/analytics/summary?days=30` | `src/components/dashboard/screens/ScreenAnalytics.tsx` |
| A6 | Wire `ScreenQR` — call `/api/qr` for campaign list | `src/components/dashboard/screens/ScreenQR.tsx` |
| A7 | Add PATCH + DELETE to `/api/qr/[id]` | `src/app/api/qr/[id]/route.ts` |
| A8 | Build `GET /api/reviews` (paginated history) | `src/app/api/reviews/route.ts` |
| A9 | Wire `ScreenHistory` with real reviews | `src/components/dashboard/screens/ScreenHistory.tsx` |
| A10 | Build `GET /api/billing/usage` with `PLAN_LIMITS` | `src/app/api/billing/usage/route.ts` + `src/lib/billing/plans.ts` |
| A11 | Wire `ScreenUsage` with real limits | `src/components/dashboard/screens/ScreenUsage.tsx` |
| A12 | Wire `ScreenSettings` + `ScreenProfile` via `/api/businesses` + `auth.getUser()` | Both screen files |
| A13 | Wire `ScreenFunnel` — read/write via `PATCH /api/businesses` | `src/components/dashboard/screens/ScreenFunnel.tsx` |

### Phase B — Performance & Security Hardening

| Step | Task |
|------|------|
| B1 | Add `Cache-Control` headers to all GET routes |
| B2 | Replace all sequential queries with `Promise.all()` fan-out |
| B3 | Add `src/lib/security/sanitize.ts` and apply to all POST/PATCH inputs |
| B4 | Verify all RLS policies in Supabase dashboard |
| B5 | Upgrade rate limiter to Redis (Upstash adapter with local fallback) |
| B6 | Add `Content-Security-Policy` header to `next.config.ts` |

### Phase C — Module 7: Billing (Later)
Lemon Squeezy checkout → webhook → `subscriptions` table → billing screen. Not started.

### Phase D — Module 8: Admin Panel (Later)
Admin-only routes with service role key. Not started.

---

## 7. Dashboard Data Fetching Pattern

All dashboard screens should use this consistent client-side pattern:

```typescript
// src/hooks/useDashboardData.ts
import useSWR from 'swr';

const fetcher = (url: string) =>
  fetch(url).then(r => { if (!r.ok) throw new Error('API error'); return r.json(); });

export function useOverview() {
  return useSWR('/api/dashboard/overview', fetcher, {
    refreshInterval: 30_000,      // auto-refresh every 30s
    revalidateOnFocus: true,
    dedupingInterval: 10_000,
  });
}

export function useAnalytics(days: 7 | 30 | 90 = 30) {
  return useSWR(`/api/analytics/summary?days=${days}`, fetcher, {
    refreshInterval: 60_000,
  });
}

export function useQRCodes() {
  return useSWR('/api/qr', fetcher, {
    revalidateOnFocus: true,
  });
}
```

Loading state in screens:
```typescript
const { data, isLoading, error } = useOverview();
if (isLoading) return <SkeletonDashboard />;
if (error)     return <ErrorState message="Failed to load data" />;
```

---

## 8. API Response Time Targets

| Route | Target p95 | Technique |
|-------|-----------|-----------|
| `GET /api/dashboard/overview` | < 150ms | Parallel queries + edge cache |
| `GET /api/analytics/summary` | < 100ms | Postgres RPC + DB indexes |
| `GET /api/qr` | < 80ms | Simple select + index |
| `POST /api/analytics/event` | < 60ms | Fire-and-forget pattern; fail silently |
| `GET /api/qr/[id]/image` | < 30ms | CDN cache hit |

---

## 9. File Map — New Files to Create

```
src/app/api/
  dashboard/
    overview/
      route.ts          ← Phase A3 (combined dashboard data)
  reviews/
    route.ts            ← Phase A8 (paginated review history)
  billing/
    usage/
      route.ts          ← Phase A10 (plan limits + usage)

src/lib/
  billing/
    plans.ts            ← Phase A10 (PLAN_LIMITS constant)
  security/
    sanitize.ts         ← Phase B3 (input sanitization)

src/hooks/
  useDashboardData.ts   ← Phase A4+ (SWR hooks for all screens)

database/
  002_performance_indexes.sql   ← Phase A1
  003_analytics_rpc.sql         ← Phase A2
```

---

*Plan version: 2026-05-21. Next action: Start Phase A1 — create the DB indexes migration.*
