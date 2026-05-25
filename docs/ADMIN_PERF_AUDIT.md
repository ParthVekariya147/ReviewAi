# Admin Panel Performance Audit
**Date:** 2026-05-24  
**Status:** Phase 1 complete — awaiting approval to proceed with fixes

---

## Route Inventory

| Route | File | Rendering | DB queries | External calls |
|---|---|---|---|---|
| `/admin/dashboard` | `dashboard/page.tsx` | Client (`'use client'`) | via 3 API routes | none |
| `/admin/businesses` | `businesses/page.tsx` | Client | via API route | none |
| `/admin/businesses/[id]` | `businesses/[id]/page.tsx` | Client | via API route | none |
| `/admin/subscriptions` | `subscriptions/page.tsx` | Client | via API route | none |
| `/admin/subscriptions/invoices` | `subscriptions/invoices/page.tsx` | Client | via API route | none |
| `/admin/subscriptions/plans` | `settings/page.tsx` | Client | via API route | none |
| `/admin/analytics` | `analytics/page.tsx` | Client | via API route | none |
| `/admin/analytics/audit-logs` | `analytics/audit-logs/page.tsx` | Client | via API route | none |
| `/admin/analytics/abuse` | `analytics/abuse/page.tsx` | Client | via API route | none |
| `/admin/settings/admin-users` | `settings/admin-users/page.tsx` | Client | via API route | none |

**Finding:** Every admin page is `'use client'` fetching data in `useEffect`. Zero server-rendered data.

---

## API Route Inventory

| Route | Tables queried | Special |
|---|---|---|
| `GET /api/admin/stats` | businesses, subscriptions ×4, qr_scans ×2, generated_reviews ×2, analytics_events ×4 | 14 parallel COUNT queries |
| `GET /api/admin/stats/charts` | qr_scans (all rows, 30d), generated_reviews (all rows, 30d), subscriptions (all rows), analytics_events (all rows, 30d) | NO LIMIT on 4 full scans |
| `GET /api/admin/analytics` | qr_scans (all rows, country), qr_scans (all rows, device), analytics_events (all rows, scan), analytics_events ×4 count, businesses | NO LIMIT on 3 large scans |
| `GET /api/admin/businesses` | businesses + subscriptions join, qr_codes ×2, qr_scans, auth.users ×N | N getUserById per page |
| `GET /api/admin/businesses/[id]` | businesses, qr_codes, qr_scans, audit_logs, auth.users | 1 getUserById |
| `GET /api/admin/subscriptions` | subscriptions + businesses join, subscriptions (ALL rows), auth.users ×N | N getUserById + full table scan |
| `GET /api/admin/invoices` | invoices, invoices ×2 count, invoices (all paid rows) | All paid rows for revenue |
| `GET /api/admin/abuse` | qr_codes (ALL rows), qr_scans (all in window), analytics_events (all in window) | No LIMIT on qr_codes |
| `GET /api/admin/audit-logs` | audit_logs, auth.users ×N | N getUserById per page |
| `GET /api/admin/analytics` | see above | |
| `GET /api/admin/plans` | plan_prices, businesses (ALL rows) | All businesses fetched |
| `GET /api/admin/settings/admin-users` | admin_users | Fine |

---

## Top 10 Bottlenecks (ranked by impact)

---

### #1 — Unbounded full-table scan in `/api/admin/stats/charts`
**File:** `src/app/api/admin/stats/charts/route.ts:19-23`  
**Impact:** p50 ~2–8 s, memory spike, will OOM at scale  
**Problem:**
```ts
db.from('qr_scans').select('scanned_at').gte('scanned_at', thirtyDaysAgo).order('scanned_at'),
db.from('generated_reviews').select('created_at').gte('created_at', thirtyDaysAgo).order('created_at'),
db.from('analytics_events').select('event_type').gte('created_at', thirtyDaysAgo),
```
All three queries have **no LIMIT**. With 100k scans and 200k analytics events in 30 days, all rows are downloaded to the serverless function to be aggregated in JavaScript. This is the highest-cost query in the codebase.  
**Fix:** Replace with a Postgres `date_trunc('day', ...) GROUP BY` RPC. One DB call, returns 30 rows instead of 300k.  
**Effort:** Medium — 1 SQL function + route rewrite

---

### #2 — Unbounded full-table scans in `/api/admin/analytics`
**File:** `src/app/api/admin/analytics/route.ts:32-34`  
**Impact:** p50 ~1–4 s  
**Problem:**
```ts
db.from('qr_scans').select('country').gte('scanned_at', since).not('country', 'is', null),
db.from('qr_scans').select('device').gte('scanned_at', since).not('device', 'is', null),
db.from('analytics_events').select('business_id').eq('event_type', 'scan').gte('created_at', since),
```
All unbounded. Country distribution with 100k rows means downloading 100k `country` strings to JS.  
**Fix:** `SELECT country, COUNT(*) FROM qr_scans WHERE scanned_at > $1 GROUP BY country ORDER BY 2 DESC LIMIT 10` — single DB call, returns 10 rows.  
**Effort:** Low — replace 3 queries with aggregating SQL

---

### #3 — All QR codes fetched (no filter) in `/api/admin/abuse`
**File:** `src/app/api/admin/abuse/route.ts:15`  
**Impact:** p50 ~500–2000 ms  
**Problem:**
```ts
const { data: qrCodes } = await db.from('qr_codes').select('id, campaign_name, business_id, businesses(name)');
```
**No WHERE clause, no LIMIT.** Fetches every QR code on the platform. With 10k QR codes this is 10k rows. The abuse logic then joins scan/copy counts in JS.  
**Fix:** Push the filtering to DB: `WHERE EXISTS (SELECT 1 FROM qr_scans WHERE qr_id = qr_codes.id AND scanned_at > $1 HAVING COUNT(*) > 100)`. Reduces result set to only candidate QR codes.  
**Effort:** Medium — needs a CTE or subquery

---

### #4 — N+1 `getUserById` on businesses list (up to 25 HTTP calls per page)
**File:** `src/app/api/admin/businesses/route.ts:92-95`  
**Impact:** p50 ~500–2500 ms (25 × 50–100 ms per Auth API call)  
**Problem:**
```ts
await Promise.all(ownerIds.map(async ownerId => {
  const { data } = await db.auth.admin.getUserById(ownerId);
  ...
}));
```
Each call is a separate HTTP request to Supabase's Auth service. 25 parallel HTTP calls from a Vercel edge function is not free — connections compete, DNS resolves, TLS handshakes.  
**Fix:** Query `auth.users` directly via service role: `SELECT id, email FROM auth.users WHERE id = ANY($1::uuid[])`. One SQL call replaces N Auth API calls. Supabase allows this via the admin client.  
**Effort:** Low

---

### #5 — N+1 `getUserById` on subscriptions list
**File:** `src/app/api/admin/subscriptions/route.ts:51-55`  
**Impact:** p50 ~500–2500 ms  
**Problem:** Same pattern as #4, on a different route. Up to 25 getUserById calls per page.  
**Fix:** Same as #4 — batch query `auth.users` by ID array.  
**Effort:** Low

---

### #6 — N+1 `getUserById` on audit-logs list
**File:** `src/app/api/admin/audit-logs/route.ts:33-37`  
**Impact:** p50 ~500–2500 ms  
**Problem:** Same pattern. `Promise.all` over actor IDs from current page.  
**Fix:** Same batch query approach.  
**Effort:** Low

---

### #7 — Full `subscriptions` table fetched for MRR summary on every page load
**File:** `src/app/api/admin/subscriptions/route.ts:74`  
**Impact:** p50 ~200–800 ms (grows linearly with subscriber count)  
**Problem:**
```ts
const { data: allSubs } = await db.from('subscriptions').select('plan, status, cancel_at_end');
```
No LIMIT. Fetches the entire subscriptions table to compute 3 summary numbers in JS.  
**Fix:** Replace with a single SQL aggregate: `SELECT plan, status, cancel_at_end, COUNT(*) FROM subscriptions GROUP BY 1,2,3`. Returns a handful of rows.  
**Effort:** Low

---

### #8 — All paid invoice rows fetched to sum revenue
**File:** `src/app/api/admin/invoices/route.ts:54`  
**Impact:** p50 ~100–500 ms  
**Problem:**
```ts
db.from('invoices').select('amount_cents').eq('status', 'paid'),
```
No LIMIT. Downloads every paid invoice `amount_cents` to sum in JS.  
**Fix:** `SELECT SUM(amount_cents) FROM invoices WHERE status = 'paid'` — single scalar, one row back.  
**Effort:** Low

---

### #9 — 14 separate COUNT queries for dashboard stats
**File:** `src/app/api/admin/stats/route.ts`  
**Impact:** p50 ~400–700 ms (14 Supabase HTTP calls even with Promise.all)  
**Problem:** 12 parallel + 2 serial COUNT queries — each is a separate round trip to Supabase even when batched with `Promise.all`. Network latency adds up: 14 × 30 ms = ~420 ms baseline.  
**Fix:** Consolidate into 1–2 RPC functions that return all stats in one DB call. Also fixes the serial follow-up queries (lines 51–54) that currently run _after_ the first batch.  
**Effort:** Medium — requires a SQL function

---

### #10 — All admin pages are client-side only (extra RTT on every navigation)
**Files:** All `page.tsx` files under `src/app/admin/`  
**Impact:** p50 +150–300 ms perceived extra latency on first navigation  
**Problem:** Every page is `'use client'` fetching data in `useEffect`. This means:
1. Browser receives HTML shell
2. JS bundle hydrates
3. `useEffect` fires → fetch to API route
4. API route makes DB calls
5. Data renders

Steps 3–5 could be eliminated for initial renders by using React Server Components with server-side data fetching.  
**Fix:** Convert list pages (businesses, subscriptions, invoices, audit-logs) to server components. Fetch data on the server, pass as props. Client components only for interactive parts (search, sort, modals).  
**Effort:** High — requires restructuring each page

---

## Additional Issues Found

### Duplicate `qr_codes` query in businesses route
**File:** `src/app/api/admin/businesses/route.ts:57–70`  
Two nearly identical queries to `qr_codes` in the same handler — one for count, one for IDs. Merge into one.

### Sequential `for...of` loop in activity route
**File:** `src/app/api/admin/businesses/[id]/activity/route.ts:29–31`  
```ts
for (const aid of actorIds) {
  const { data: u } = await db.auth.admin.getUserById(aid);
```
Serial loop — each call waits for the prior one. Should be `Promise.all` at minimum, or batch query.

### Missing standalone index on `qr_scans.scanned_at`
The existing index is `idx_qr_scans_qr_time (qr_id, scanned_at desc)`. Queries that filter only by `scanned_at` (e.g. dashboard stats) cannot use this index efficiently without `qr_id` in the WHERE clause. A standalone `(scanned_at desc)` index would help COUNT queries.

### Missing standalone index on `analytics_events.event_type`
Existing index: `idx_ae_business_type_time (business_id, event_type, created_at)`. Stats queries filter only by `event_type + created_at` without `business_id`. A `(event_type, created_at desc)` index would serve these queries.

### `plan_prices` column name mismatch
`database/012_admin_panel.sql` creates column `price_cents`, but `src/app/api/admin/plans/route.ts:14` queries `amount_cents`. If the plans page is broken in production, this is why.

---

## Estimated p50 Load Times (current, before any fixes)

| Page | Dominant bottleneck | Estimated p50 |
|---|---|---|
| Dashboard | 14 COUNT queries + 3 API calls + client hydration | **1.5–3.5 s** |
| Businesses list | N+1 getUserById (×25) + 2× qr_codes query | **1.5–3 s** |
| Business detail | getUserById + 3 Supabase calls | **300–600 ms** |
| Subscriptions | N+1 getUserById (×25) + full subscriptions scan | **1.5–3 s** |
| Invoices | Full paid-invoices fetch + summary | **400–800 ms** |
| Analytics | Unbounded country/device/scan downloads | **1.5–5 s** |
| Audit logs | N+1 getUserById (×25) | **1.5–3 s** |
| Abuse | Full qr_codes scan + join | **500–2000 ms** |
| Dashboard charts | Unbounded qr_scans + reviews + analytics_events | **2–8 s** |

> These are estimates based on code analysis assuming a mid-size deployment (10k businesses, 100k scans/month, 200k events/month). Real p95s will be 3–5× higher under concurrent load.

---

## Fix Priority Order

| # | Fix | Impact | Effort | Risk |
|---|---|---|---|---|
| 1 | Batch `auth.users` query (replaces N+1 getUserById) — buses, subs, audit-logs | HIGH | Low | Low |
| 2 | Aggregate `qr_scans` country/device in SQL (analytics route) | HIGH | Low | Low |
| 3 | Aggregate subscriptions for MRR in SQL | HIGH | Low | Low |
| 4 | `SUM(amount_cents)` for invoice revenue | MEDIUM | Low | Low |
| 5 | Add missing indexes (`qr_scans.scanned_at`, `analytics_events.event_type, created_at`) | HIGH | Low | Low |
| 6 | Charts route: replace unbounded downloads with `date_trunc GROUP BY` RPC | HIGH | Medium | Low |
| 7 | Consolidate 14 COUNT queries into 1-2 RPCs for stats | MEDIUM | Medium | Low |
| 8 | Abuse route: push filter to DB | MEDIUM | Medium | Low |
| 9 | Fix sequential for..of in activity route → Promise.all | LOW | Low | Low |
| 10 | Merge duplicate qr_codes query in businesses route | LOW | Low | Low |
| 11 | Server-component refactor for list pages | MEDIUM | High | Medium |

---

*Phase 2 (fixes) can begin once you approve this report.*
