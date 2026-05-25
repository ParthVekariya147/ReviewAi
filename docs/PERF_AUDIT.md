# Performance Audit — Reevo
**Date:** 2026-05-24  
**Auditor:** Claude Code (automated scan)  
**Status:** SCAN COMPLETE — no fixes applied yet

---

## 1. Summary

### Current state

| Area | Status | Notes |
|------|--------|-------|
| Bundle (shared) | 🔴 223 kB shared JS | Industry target: ≤ 100 kB |
| Admin pages | 🔴 348–356 kB First Load | 3 admin routes above 300 kB |
| Auth pages | 🟡 290–293 kB First Load | Above 200 kB but explainable |
| Middleware | 🔴 121 kB edge bundle | Very large for edge; runs on all routes |
| Funnel (customer) | 🔴 AI blocks response | 1–3 s visible wait per generation |
| Dashboard overview | 🟢 Single RPC call | Well designed |
| Admin DB queries | 🔴 N+1 + triple auth overhead | Up to 25 parallel auth API calls |
| Indexes | 🟢 Comprehensive | Good coverage in 001 + 002 migrations |
| Realtime | 🟢 None found | No cleanup risk |
| Images | 🟡 One raw `<img>` tag | LCP risk in dashboard |

### Estimated page load times (p50, cold server)

| Page | p50 est. | Bottleneck |
|------|----------|-----------|
| `/r/[token]` (customer funnel — AI step) | 2–4 s | 2× parallel AI completions block response |
| `/admin/businesses` | 1.2–2 s | N+1 getUserById (up to 25 calls) + large bundle |
| `/admin/dashboard` | 800 ms–1.5 s | 3 API fetches in useEffect + recharts parse |
| `/admin/analytics` | 700 ms–1.2 s | recharts bundle + 10 parallel DB queries |
| `/app/business_dashboard` | 400–700 ms | getCurrentBusiness() + dashboard_overview RPC |
| `/app/business_dashboard/settings` | 400–600 ms | 305 kB bundle, single auth query |

### Estimated concurrent capacity risk
- `/api/funnel/generate` holds a long-lived AI connection (1–3 s). At 100 concurrent users the function pool will be saturated on a free/starter Vercel plan, causing cold starts and queue time on top of AI latency. The fix (queue + immediate 202) is in "Big fixes".

---

## 2. Top 10 Bottlenecks (ranked)

| Rank | Bottleneck | Where | Est. impact | Effort |
|------|-----------|-------|-------------|--------|
| 1 | **AI calls block HTTP response** — `funnel/generate` does 2 parallel LLM calls and only responds after both complete | `src/app/api/funnel/generate/route.ts:77–84` | **2–4 s per funnel customer** | Big (async queue) |
| 2 | **N+1 auth.admin.getUserById** — admin businesses list calls `getUserById` once per business on every page load (up to 25 parallel Supabase Auth API calls) | `src/app/api/admin/businesses/route.ts:92–95` | **500–1000 ms per admin page view** | Low (batch call or SQL join) |
| 3 | **Triple auth + admin_users lookup per admin request** — middleware, layout, AND `requireAdmin()` each independently call `auth.getUser()` + query `admin_users` table = 3 auth calls + 3 DB queries per admin page | `src/middleware.ts:78,126`, `src/app/admin/layout.tsx:17–25`, `src/lib/admin/auth.ts:28–43` | **~60 ms wasted overhead per admin request** | Medium (header/context pass-through) |
| 4 | **Middleware runs on all routes including public funnel** — `auth.getUser()` is called for `/r/[token]`, `/api/analytics/event`, `/api/funnel/*` even though they require no auth | `src/middleware.ts:78` + `config.matcher` | **~20–40 ms on every request** | Low (extend matcher exclusions) |
| 5 | **Unbounded qr_scans SELECT with no LIMIT** — admin fetches ALL scan rows in JS to count them; `SELECT qr_id FROM qr_scans WHERE qr_id IN (...)` returns every row ever | `src/app/api/admin/businesses/route.ts:72–77`, `src/app/api/admin/businesses/[id]/route.ts:40` | **100 ms → seconds as data grows; will OOM at scale** | Low (replace with COUNT aggregate) |
| 6 | **recharts eagerly bundled into admin pages** — 4 chart components + `chart.tsx` import recharts at module level with no `next/dynamic`. Responsible for ~125 kB of the 348–356 kB admin page bundles | `src/app/admin/_components/charts/`, `src/components/ui/chart.tsx:4` | **~130 kB extra JS; ~150 ms extra parse on mobile** | Low (next/dynamic wrapping) |
| 7 | **Middleware bundle is 121 kB** — Upstash Redis client bundled into edge runtime. Edge functions have a 1 MB limit; 121 kB is significant and adds cold-start time | `src/middleware.ts` (Upstash imports) | **~50–100 ms cold start overhead** | Medium (decouple rate limiter) |
| 8 | **getCurrentBusiness() uncached — DB hit on every authenticated request** — called by dashboard/overview, notifications, billing/usage, qr/[id]/image, reviews. Fetches from `businesses` table with no caching layer | `src/lib/businesses/current.ts:153–192` | **~15–25 ms per authenticated API call; multiplies across all endpoints** | Medium (short-lived cache) |
| 9 | **Notifications: 3 sequential DB queries that could be parallel** — `notification_reads` must resolve before the `generated_reviews` queries start; queries 2/3/4 are independent | `src/app/api/notifications/route.ts:45–114` | **~60–80 ms added latency per notification fetch** | Low (Promise.all) |
| 10 | **analytics/event: two sequential DB inserts** — `analytics_events` INSERT then conditional `qr_scans` INSERT run sequentially; both can be fired concurrently | `src/app/api/analytics/event/route.ts:67–82` | **~20–40 ms per scan event** | Low (Promise.all) |

---

## 3. Quick Wins (< 1 hour each)

### QW-1 — Exclude public routes from middleware auth check  
**File:** `src/middleware.ts`  
**Change:** Extend the `matcher` and add early-return logic so `/r/[token]`, `/api/funnel/*`, `/api/analytics/*`, and `/api/qr/[id]` (public, token-auth routes) skip the `auth.getUser()` call entirely.  
**Current matcher:**
```ts
// line 176
"/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"
```
**Fix:** Add `r/|api/funnel/|api/analytics/|api/qr/` to the negative lookahead, OR add an early-return before line 78:
```ts
const PUBLIC_PREFIXES = ['/r/', '/api/funnel/', '/api/analytics/', '/api/qr/'];
if (PUBLIC_PREFIXES.some(p => pathname.startsWith(p))) {
  return supabaseResponse;
}
```
**Impact:** ~20–40 ms shaved off every funnel page request.

---

### QW-2 — Fix N+1: replace per-user getUserById with listUsers batch call  
**File:** `src/app/api/admin/businesses/route.ts:89–96`  
**Change:** Replace the `Promise.all(ownerIds.map(getUserById))` with a single admin list query:
```ts
// BEFORE (25 API calls):
await Promise.all(ownerIds.map(async ownerId => {
  const { data } = await db.auth.admin.getUserById(ownerId);
  if (data?.user?.email) emailMap[ownerId] = data.user.email;
}));

// AFTER (1 API call):
const { data: { users } } = await db.auth.admin.listUsers({ perPage: PAGE_SIZE });
users.forEach(u => { if (ownerIds.includes(u.id)) emailMap[u.id] = u.email ?? ''; });
```
Note: `listUsers` returns up to 1000 users per call — safe for current scale.  
**Impact:** 25 parallel HTTP calls → 1 call. Est. 400–800 ms reduction on admin businesses page.

---

### QW-3 — Replace unbounded scan count with COUNT aggregate  
**File:** `src/app/api/admin/businesses/route.ts:66–84`  
**Change:** Replace full row fetch with count query:
```ts
// BEFORE: fetches every scan row, counts in JS
const { data: scans } = await db.from('qr_scans').select('qr_id').in('qr_id', qrIdList);
scans?.forEach(s => { ... });

// AFTER: one aggregated count
const { count: totalScans } = await db
  .from('qr_scans')
  .select('id', { count: 'exact', head: true })
  .in('qr_id', qrIdList);
```
Also fix `src/app/api/admin/businesses/[id]/route.ts:40`:
```ts
// BEFORE
const { data: scans } = await db.from('qr_scans').select('qr_id').in('qr_id', qrIds);
// AFTER
const { count: totalScans } = await db.from('qr_scans').select('id', { count: 'exact', head: true }).in('qr_id', qrIds);
```
**Impact:** Eliminates unbounded memory growth. For businesses with 10k+ scans, this saves hundreds of ms and prevents OOM.

---

### QW-4 — Combine duplicate qr_codes queries in admin/businesses  
**File:** `src/app/api/admin/businesses/route.ts:56–84`  
**Change:** Lines 57–60 and 68–71 both query `qr_codes` with the same `in('business_id', bizIds)`. Combine into one query that fetches `id, business_id`:
```ts
const { data: allQrData } = await db
  .from('qr_codes')
  .select('id, business_id')
  .in('business_id', bizIds);

// derive both qrCounts and qrIds from allQrData
```
**Impact:** 1 fewer DB round trip per admin businesses page load (~15–25 ms).

---

### QW-5 — Parallelize notifications DB queries  
**File:** `src/app/api/notifications/route.ts:44–114`  
**Change:** Move `notification_reads` fetch before the `since` calculation and fire all 3 content queries in parallel after it resolves:
```ts
const [{ data: reads }, { data: reviews }, { data: lowRatings }, { data: qrCodes }] =
  await Promise.all([
    db.from('notification_reads').select('notif_id').eq('business_id', businessId),
    db.from('generated_reviews').select(...)...,
    db.from('generated_reviews').select(...)...,
    db.from('qr_codes').select(...)...,
  ]);
```
Actually `reads` is needed to build `readSet` before constructing items, so at minimum parallelize queries 2+3+4:
```ts
const { data: reads } = await db.from('notification_reads')...;
const readSet = new Set(...);
const [{ data: reviews }, { data: lowRatings }, { data: qrCodes }] = await Promise.all([
  db.from('generated_reviews').select(...).in('status', [...]),
  db.from('generated_reviews').select(...).eq('status', 'private_feedback'),
  db.from('qr_codes').select(...),
]);
```
**Impact:** ~60–80 ms removed from every notifications request.

---

### QW-6 — Parallelize analytics/event inserts  
**File:** `src/app/api/analytics/event/route.ts:67–82`  
**Change:**
```ts
// BEFORE (sequential):
await supabase.from('analytics_events').insert({...});
if (eventType === 'scan') {
  await supabase.from('qr_scans').insert({...});
}

// AFTER (parallel):
const inserts: Promise<unknown>[] = [
  supabase.from('analytics_events').insert({...}),
];
if (eventType === 'scan') {
  inserts.push(supabase.from('qr_scans').insert({...}));
}
await Promise.all(inserts);
```
**Impact:** ~20–40 ms per scan event (reduced on the critical path of the customer funnel).

---

### QW-7 — Lazy-load recharts with next/dynamic  
**Files:** `src/app/admin/_components/charts/bar-chart.tsx`, `donut-chart.tsx`, `line-chart.tsx`, `funnel-chart.tsx`  
**Change:** Wrap each chart component at the import site in `admin/dashboard/page.tsx` and `admin/analytics/page.tsx`:
```ts
// Example in dashboard/page.tsx:
import dynamic from 'next/dynamic';
const LineChart  = dynamic(() => import('../_components/charts/line-chart'),  { ssr: false });
const DonutChart = dynamic(() => import('../_components/charts/donut-chart'), { ssr: false });
const FunnelChart= dynamic(() => import('../_components/charts/funnel-chart'),{ ssr: false });
```
Since charts render client-side after a `loading` state anyway, `ssr: false` is safe.  
**Impact:** ~125–130 kB removed from initial admin page bundles. Admin dashboard 356 kB → ~225 kB.

---

### QW-8 — Fix raw `<img>` tag  
**File:** `src/components/dashboard/ui.tsx:202`  
**Change:** Replace `<img src={src} ...>` with `<Image src={src} ... width={size} height={size} />` from `next/image`.  
**Impact:** Eliminates LCP warning; enables lazy loading and automatic WebP/AVIF conversion.

---

### QW-9 — Remove redundant admin_users check from AdminLayout  
**File:** `src/app/admin/layout.tsx`  
**Change:** The middleware already verified admin access before the layout renders. The layout re-queries `admin_users` just to read `email` and `role` for the sidebar. Pass this data via a request header or read the cookie-encoded session claim instead of a second DB query.  
Simplest fix: store `email` + `role` in a signed cookie after login (similar to how Supabase stores the JWT), or use `x-admin-role` header set by middleware.  
**Impact:** 1 fewer `auth.getUser()` + 1 fewer `admin_users` DB query per admin page load (~30–50 ms).

---

## 4. Medium Fixes (1–4 hours each)

### MED-1 — Cache `getCurrentBusiness()` with short TTL  
**File:** `src/lib/businesses/current.ts:153–192`  
**Problem:** Every authenticated API endpoint calls `getCurrentBusiness()` which does a fresh DB query to `businesses`. This is called by: `dashboard/overview`, `notifications`, `billing/usage`, `qr/[id]`, `qr/[id]/image`, `reviews`.  
**Approach:** Use Next.js `unstable_cache` with a `business-${userId}` tag and 60 s TTL:
```ts
import { unstable_cache } from 'next/cache';

export const getCurrentBusiness = unstable_cache(
  async (supabase, userId) => { /* existing logic */ },
  ['business'],
  { revalidate: 60, tags: ['business'] }
);
```
On profile update, call `revalidateTag('business')`.  
**Impact:** Removes 1 DB query per authenticated API call. At 10 req/s this saves ~1.5 DB connections continuously.

---

### MED-2 — Consolidate admin auth: pass verified admin context via header  
**File:** `src/middleware.ts`, `src/lib/admin/auth.ts`, `src/app/admin/layout.tsx`  
**Problem:** Admin routes do `auth.getUser()` + `admin_users` lookup 3 times per page (middleware, layout, requireAdmin).  
**Approach:** After middleware verifies admin status, encode `{ role, email }` into an `x-admin-ctx` header (HMAC-signed with `ADMIN_JWT_SECRET`). Layout and `requireAdmin()` trust the header value instead of re-querying.  
**Impact:** 2 fewer `auth.getUser()` calls + 2 fewer `admin_users` DB queries per admin request (~60 ms).

---

### MED-3 — Add GIN index on `analytics_events.meta` for event_type JSONB filter  
**File:** `database/015_constraints.sql:77` already creates `analytics_events_meta_gin` — **verify this migration has been run**. The admin analytics route at line 35–36 filters by `meta->>draft_index` which needs this index to avoid a full table scan.  
**Also add:** Composite index for `qr_scans(scanned_at DESC)` without `qr_id` for admin-wide scan queries in `admin/stats/route.ts:36–38`.
```sql
create index if not exists idx_qr_scans_time_global
  on public.qr_scans (scanned_at desc);
```
**Impact:** Admin analytics and stats queries that filter only by time (no qr_id) drop from seq scan → index scan.

---

### MED-4 — Cache QR token → business config at edge  
**File:** `src/app/api/funnel/generate/route.ts:37–48`  
**Problem:** Every single funnel scan does a DB lookup to resolve `token → qr_id + business details`. This data changes almost never (business edits their profile rarely).  
**Approach:** Use Vercel's `unstable_cache` or a Redis cache with `qr-token:${token}` key and 5-minute TTL.  
```ts
const qr = await getCachedQR(token); // wraps the .from('qr_codes') query
```
On QR config change, invalidate the key.  
**Impact:** Removes 1 DB query from the hot path of every customer funnel visit. At 100 scans/min this saves 100 DB connections/min.

---

### MED-5 — Make admin dashboard a server component with parallel data fetching  
**File:** `src/app/admin/dashboard/page.tsx`  
**Problem:** The entire admin dashboard is `"use client"`. Data is fetched in `useEffect`, adding a full client-side waterfall: HTML → JS parse → fetch → render.  
**Approach:** Convert to an async server component. Use `Promise.all` to fetch stats, charts, and audit logs in parallel on the server:
```ts
// Remove "use client", make it async:
export default async function DashboardPage() {
  const [stats, charts, logs] = await Promise.all([
    fetch('/api/admin/stats', { next: { revalidate: 30 } }).then(r => r.json()),
    ...
  ]);
```
Charts still need client wrapper — use `next/dynamic` for chart-only components.  
**Impact:** Removes client-side waterfall (~100–200 ms). Enables ISR (30 s revalidate on stats).

---

### MED-6 — Slim down middleware bundle  
**File:** `src/middleware.ts`  
**Problem:** Middleware is 121 kB because Upstash Redis client is bundled into the edge runtime. Edge functions have overhead that scales with bundle size.  
**Approach:** Move the admin rate limiter out of middleware into `requireAdmin()` (which already runs in Node.js runtime). Middleware only needs the Supabase session check. If Upstash is only used for admin routes, there is no reason to bundle it in every-route middleware.  
**Impact:** Estimated 40–60 kB reduction in middleware bundle → faster cold starts.

---

## 5. Big Fixes (> 4 hours each)

### BIG-1 — Async AI generation with immediate acknowledgment  
**File:** `src/app/api/funnel/generate/route.ts`  
**Problem:** This is the #1 user-visible bottleneck. The customer stares at a loading spinner for 1–3 seconds while two LLM completions run synchronously.  
**Approach (simplest — streaming):**  
Return a `text/event-stream` (SSE) response. Send the first draft as soon as draft 1 completes, then send draft 2 when it completes:
```ts
const encoder = new TextEncoder();
const stream = new ReadableStream({
  async start(controller) {
    const [r1, r2] = [generateReview(req), generateReview(req)];
    for (const promise of [r1, r2]) {
      const text = await promise;
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
    }
    controller.close();
  }
});
return new Response(stream, { headers: { 'Content-Type': 'text/event-stream' } });
```
Client in `FunnelFlow.tsx` reads the SSE and shows each draft as it arrives.  
**Approach (robust — queue):** Post a job to a Vercel background function / Upstash QStash. Return `202 Accepted` with a `job_id` immediately. Client polls `/api/funnel/status?job_id=...` at 500 ms intervals.  
**Impact:** Perceived wait drops from 1–3 s to ~100 ms (instant acknowledgment). Actual generation still takes the same time but the spinner-to-first-draft time collapses.

---

### BIG-2 — Replace admin businesses email lookup with a denormalized `owner_email` column  
**File:** `src/app/api/admin/businesses/route.ts`  
**Problem:** QW-2 (batch `listUsers`) is a quick fix, but `auth.admin.listUsers()` still has pagination limits and gets slower as the user base grows.  
**Approach:** Add a `owner_email text` column to the `businesses` table. Populate it via a Postgres trigger on `auth.users` insert/update or via the application on user creation. Admin queries then join nothing — the email is already in the row.  
**Migration:**
```sql
alter table public.businesses add column if not exists owner_email text;
-- backfill via admin API or trigger
```
**Impact:** Zero Supabase Auth API calls on the admin businesses list. Scales to any number of businesses.

---

### BIG-3 — Split the 223 kB shared bundle  
**Current:** `chunks/4969-6c17aee183f039e0.js` is 127 kB and shared by all routes. The shared chunk likely contains supabase-js, Sentry SDK, and/or other large libraries.  
**Approach:**  
1. Run `npx @next/bundle-analyzer` to identify exactly what is in the 127 kB chunk.  
2. Move Sentry to `afterInteractive` or ensure it is only imported in the edge/server instrumentation, not in client code.  
3. Evaluate whether `@supabase/supabase-js` can be replaced with a lighter alternative for client-side auth (supabase-js ships a lot of unused code).  
4. Consider `modularizeImports` in `next.config.ts` for react-icons to ensure tree-shaking works.  
**Impact:** Target shared bundle under 150 kB. Every page benefits.

---

### BIG-4 — Supabase connection pooling audit  
**Problem:** It is not visible from code whether Supabase is connecting via the pooler URL or the direct connection string. In serverless (Vercel), every function invocation opens a new connection. Without PgBouncer (Supabase Pooler URL), this can exhaust Postgres connections at scale.  
**Action:** Verify `.env.local` / Vercel env vars contain the `?pgbouncer=true` pooler URL (port 6543 or the `pooler.supabase.com` host) for `SUPABASE_DB_URL`, not the direct `db.*.supabase.co:5432`. If using the anon/service-role REST API only (no direct DB connection), this is a no-op.  
**Impact:** Prevents connection exhaustion at scale. No code change required if already using pooler; critical if not.

---

## 6. Won't Fix

| Item | Reason |
|------|--------|
| **RLS policies with subquery joins** (`qr_scans_owner_read`, `reviews_owner_read`) | Nearly all routes use `createAdminClient()` which bypasses RLS. The policies only fire for the anon-client routes (`funnel/generate`, `funnel/status`) where the tables queried (`qr_codes`, `generated_reviews`) already have proper `idx_qr_codes_live_token` and `idx_gr_business_created` indexes. Rewriting the policies would require migrating auth patterns app-wide. |
| **Auth pages (login/signup) at 290–293 kB** | These are over 200 kB due to the 223 kB shared baseline, not page-specific code. The 3–5 kB page-specific JS is negligible. Will improve automatically when BIG-3 is done. |
| **`/r/[token]` FunnelFlow.tsx (549 lines, "use client")** | The funnel is inherently interactive (rating selection, copy button). Server component conversion is not meaningful here. First Load JS is already only 228 kB which is acceptable. |
| **QR image `Cache-Control: no-store`** | QR download is an intentional download action, not a hot-path request. Users download their QR once, not repeatedly. Caching would not meaningfully impact p50. |
| **`generated_reviews.status` not indexed** | All queries on `generated_reviews.status` are also filtered by `business_id` (which has a composite index `idx_gr_business_created`). Postgres will use the composite index; a standalone `status` index would not be chosen. |

---

## Appendix: Step 1 raw data

### Build output — routes above 200 kB First Load JS

| Route | First Load JS | Route size |
|-------|--------------|-----------|
| `/admin/dashboard` | **356 kB** | 9.38 kB |
| `/admin/analytics` | **348 kB** | 2.05 kB |
| `/app/business_dashboard/settings` | **305 kB** | 3.57 kB |
| `/admin/login` | **292 kB** | 2.92 kB |
| `/signup` | **293 kB** | 5.03 kB |
| `/login` | **291 kB** | 3.07 kB |
| `/forgot-password` | **290 kB** | 2.29 kB |
| `/reset-password` | **290 kB** | 2.85 kB |
| `/` (home) | **238 kB** | 13.5 kB |
| `/app/business_dashboard/*` | 246–250 kB | 2–7 kB |

Shared baseline: **223 kB** (`chunks/4969`: 127 kB + `4bd1b696`: 54.4 kB + `52774a7f`: 37.9 kB)  
Middleware: **121 kB**

### Heaviest dependencies (estimated from imports, no bundle analyzer run)

| Dep | Est. gzipped | Used in |
|-----|-------------|---------|
| recharts | ~50–60 kB | 4 admin chart files + `components/ui/chart.tsx` |
| @supabase/supabase-js + @supabase/ssr | ~40–50 kB | everywhere |
| @sentry/nextjs (client) | ~25–35 kB | shared via instrumentation |
| @upstash/ratelimit + @upstash/redis | ~15–20 kB | middleware only |
| react-icons/md | ~5–10 kB | admin dashboard |

> **Note:** Run `npx @next/bundle-analyzer` (set `ANALYZE=true` in `.env.local` then `npm run build`) to get exact sizes per chunk. The values above are estimates based on import scanning.

### DB queries without LIMIT (risk of full-table scan)

| File | Query | Risk |
|------|-------|------|
| `api/admin/businesses/route.ts:72–77` | `qr_scans.select('qr_id').in('qr_id', qrIdList)` | High — no LIMIT, returns all scans ever |
| `api/admin/businesses/[id]/route.ts:40` | `qr_scans.select('qr_id').in('qr_id', qrIds)` | High — same issue |
| `api/admin/plans/route.ts:15` | `businesses.select('plan')` | Medium — returns all businesses; acceptable for plan distribution counting |
| `api/admin/stats/charts/route.ts:19–22` | Multiple `.select()` for 30-day windows | Low — time-bounded, indexed |
