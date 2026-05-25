# Code Issues Found — Bug Sweep
**Date:** 2026-05-24  
**Scope:** All admin routes, non-admin API routes, middleware, lib/admin  
**Status:** Priority fixes applied 2026-05-24 — see below

---

## Build Baselines (before any Phase 2A fixes)

| Route | First Load JS |
|---|---|
| `/admin/dashboard` | **356 kB** ← recharts pulled in eagerly |
| `/admin/analytics` | **348 kB** ← recharts pulled in eagerly |
| `/admin/businesses` | 234 kB |
| `/admin/subscriptions` | 234 kB |
| `/admin/analytics/abuse` | 231 kB |
| `/admin/analytics/audit-logs` | 231 kB |
| Shared JS baseline | 223 kB |
| Middleware bundle | **121 kB** ← Upstash always imported |

---

## Category 1 — Logic Bugs

- [x] **BUG-1 — Partial state on plan change (no rollback)** ✅ FIXED  
  `src/app/api/admin/businesses/[id]/route.ts:110,117`  
  When changing plan, subscriptions is updated on line 110 **before** businesses is updated on line 117. If the businesses update fails (line 118), subscriptions.plan is already changed but businesses.plan is not. The two tables diverge with no rollback. The error is returned to the client but the DB is in an inconsistent state.

- [x] **BUG-2 — QR admin route allows statuses it shouldn't** ✅ FIXED  
  `src/app/api/admin/qr/[id]/route.ts:15,19`  
  The valid status list is `['draft', 'live', 'paused']`, which lets an admin set a QR back to `'draft'` or `'live'` via this route. But line 19 maps the non-paused path to `'qr.archive'` capability — so setting `status='live'` requires the `qr.archive` permission, not a `qr.activate` permission. The capability name is wrong for non-paused transitions.  
  Also: `'archived'` is a valid DB status (defined in `015_constraints.sql`) but is not included in the allowed list — admins cannot archive QRs from this route.

- [x] **BUG-3 — `abuse/page.tsx` fetch hangs loading state on error** ✅ FIXED  
  `src/app/admin/analytics/abuse/page.tsx:13-15`  
  ```ts
  fetch('/api/admin/abuse')
    .then(r => r.json())
    .then(d => { setRows(d.data ?? []); setLoading(false); });
  ```
  No `.catch()`. If the request fails (network error, 500, 429), the Promise rejects silently and `setLoading(false)` is never called. Page stays in infinite skeleton state.

- [x] **BUG-4 — `analytics/page.tsx` fetch hangs loading state on network error** ✅ FIXED  
  `src/app/admin/analytics/page.tsx:24-26`  
  ```ts
  fetch(`/api/admin/analytics?days=${days}`)
    .then(r => r.ok ? r.json() : null)
    .then(d => { setData(d); setLoading(false); });
  ```
  Has a partial error check (`r.ok ? r.json() : null`) but no `.catch()`. A network-level failure (offline, timeout) still never calls `setLoading(false)`. `setData(null)` on the happy path also produces a broken render (all KPIs show 0 with no error message).

---

## Category 2 — Security / Architecture

- [x] **SEC-1 — `notifications/route.ts` uses service-role client for a user-facing route** ✅ FIXED  
  `src/app/api/notifications/route.ts:32,149`  
  Both GET and PATCH handlers call `createAdminClient()` (service role key), bypassing RLS entirely. All `generated_reviews`, `qr_codes`, and `notification_reads` queries rely on application-level `businessId` filtering rather than RLS. If `getCurrentBusinessId()` ever returns the wrong ID (bug, injection, future refactor), rows from other businesses leak. The cookie-based `supabase` client is already available — it should be used for tenant-scoped queries instead.

- [x] **SEC-2 — Double rate-limiting with shared key on `/api/admin/*`** ✅ FIXED (key namespaced: `admin:mw:` vs `admin:fn:`)  
  `src/middleware.ts:45` + `src/lib/admin/auth.ts:16`  
  Both use Redis key `admin:${ip}`. The middleware uses `Ratelimit` directly (100 req/min); `requireAdmin()` uses the `rateLimit()` wrapper (60 req/min). When Upstash is configured, both write to the same Redis key pattern. Depending on Upstash's key namespace implementation, they may share or compete on the same sliding-window counter — effectively making the actual limit unpredictable and lower than intended. At minimum, the two limiters are redundant and both consume Upstash quota per request.

---

## Category 3 — Unhandled Error Paths

- [x] **ERR-1 — `abuse/page.tsx` — see BUG-3 above** ✅ FIXED (already applied with BUG-3)

- [x] **ERR-2 — `analytics/page.tsx` — see BUG-4 above** ✅ FIXED (already applied with BUG-4)

- [x] **ERR-3 — `businesses/[id]/route.ts:110` subscription update error ignored** ✅ FIXED  
  `src/app/api/admin/businesses/[id]/route.ts:110`  
  ```ts
  await db.from('subscriptions').update({ plan: body.plan }).eq('business_id', id);
  ```
  The result is not destructured — `error` is thrown away. If this update fails silently, the subscriptions table is not updated but the code continues and updates businesses anyway, creating the inverse of BUG-1.

- [x] **ERR-4 — Sequential `for...of` in `activity/route.ts` — no error handling** ✅ FIXED  
  `src/app/api/admin/businesses/[id]/activity/route.ts:29-31`  
  Refactored to use `getUserEmailsByIds` helper (Promise.all internally) — sequential loop removed.
  Fixed: Refactored to use getUserEmailsByIds helper with Promise.all

---

## Category 4 — Performance (code-level, no migration needed)

- [x] **PERF-1 — Middleware queries `admin_users` AND `requireAdmin()` queries `admin_users` on every admin API call** ✅ FIXED  
  `src/middleware.ts:126-130` + `src/lib/admin/auth.ts:38-43`  
  Every `/api/admin/*` request hits the `admin_users` table **twice** — once in middleware (returns `id` only) and once in `requireAdmin()` (returns `id, email, role, created_at`). The middleware result is discarded. Consolidating to one query would save ~30 ms per admin API call.

- [x] **PERF-2 — `notifications/route.ts`: 4 sequential queries that can be parallelized** ✅ FIXED  
  `src/app/api/notifications/route.ts:45,56,84,108`  
  All 4 queries now run inside `Promise.all([...])` — ~60–90 ms saving per request.
  Fixed: Parallelized all 4 queries with Promise.all

- [x] **PERF-3 — `analytics/event/route.ts`: 2 sequential inserts for 'scan' events** ✅ FIXED  
  `src/app/api/analytics/event/route.ts:67,78`  
  Both inserts now run via `Promise.all(writes)` — ~30–50 ms saving per scan.
  Fixed: Parallelized analytics_events + qr_scans inserts with Promise.all

- [x] **PERF-4 — `subscriptions/[id]/route.ts` re-queries subscription after update to get `business_id`** ✅ FIXED  
  `src/app/api/admin/subscriptions/[id]/route.ts:91`  
  Now pre-fetches `business_id` before the update and runs both subscription + businesses updates in parallel with `Promise.all`.
  Fixed: Pre-fetch business_id, then parallel updates with Promise.all

- [ ] **PERF-5 — Middleware bundle is 121 kB because Upstash is unconditionally imported** SKIPPED  
  `src/middleware.ts:3-4`  
  SKIPPED: Next.js Edge Runtime does not support `require()` or `dynamic import()` at module level for side-effect imports. `adminRateLimiter` is instantiated at module scope (required for connection reuse across requests). Fixing this requires refactoring to lazy init inside the handler or switching to a different bundling approach — non-trivial without risk of breaking Edge compatibility.

---

## Category 5 — Type Safety Suppressions

- [x] **TYPE-1 — `as unknown as BodyInit` cast in QR image route** ✅ FIXED  
  `src/app/api/qr/[id]/image/route.ts:77`  
  `generateQRPng` returns `Buffer`. Changed to `png.buffer as ArrayBuffer` — valid `BodyInit` via `BufferSource`, no double cast needed.
  Fixed: Replaced `png as unknown as BodyInit` with `png.buffer as ArrayBuffer`

- [x] **TYPE-2 — `as unknown as { campaign_name: string }` in reviews route** ✅ FIXED  
  `src/app/api/reviews/route.ts:79`  
  Replaced double cast with `(Array.isArray(r.qr_codes) ? r.qr_codes[0] : r.qr_codes as {...} | null)` — handles both array and object Supabase join shapes correctly.
  Fixed: Removed as unknown cast, handle array/object join shape explicitly

- [x] **TYPE-3 — `db as unknown as SupabaseClient` in businesses/current.ts** ✅ FIXED  
  `src/lib/businesses/current.ts:180`  
  Added `AnyClient = SupabaseClient | AdminClient` union type. Updated `getLegacyBusinessById` parameter to `AnyClient` — no cast needed.
  Fixed: Added AnyClient union type, removed double cast

- [x] **TYPE-4 — `eslint-disable @typescript-eslint/no-unused-vars` in businesses API route** ✅ FIXED  
  `src/app/api/businesses/route.ts:102`  
  Removed the `// eslint-disable-next-line` comment. `_omit` starts with `_` so `next/typescript` preset's `varsIgnorePattern: "^_"` already ignores it — comment was redundant.
  Fixed: Removed redundant eslint-disable comment; _-prefix already suppressed by next/typescript preset

---

## Category 6 — Confirmed No TODOs/FIXMEs

A search of all admin routes, API routes, and lib files found **zero** `// TODO`, `// FIXME`, `// HACK`, or `// XXX` comments. This is clean — the issues above are all implicit.

---

## Category 7 — Admin Panel Specific: Double Admin Check

- [x] **ARCH-1 — Two admin_users lookups on every admin page load** ✅ FIXED  
  `src/middleware.ts:126` + `src/app/admin/layout.tsx:22-28`  
  For every admin page navigation: middleware queries `admin_users` to gate the route (service role), and then `layout.tsx` *also* queries `admin_users` to populate the sidebar email/role. That's 2 identical DB lookups per page render. The layout query could be eliminated if middleware passed the admin role via a request header.

---

## Summary Table

| ID | File | Category | Severity |
|---|---|---|---|
| BUG-1 | `api/admin/businesses/[id]/route.ts:110,117` | Logic bug | High |
| BUG-2 | `api/admin/qr/[id]/route.ts:15,19` | Logic bug | Medium |
| BUG-3 | `admin/analytics/abuse/page.tsx:13` | Unhandled error | Medium |
| BUG-4 | `admin/analytics/page.tsx:24` | Unhandled error | Medium |
| SEC-1 | `api/notifications/route.ts:32` | Security | Medium |
| SEC-2 | `middleware.ts:45` + `lib/admin/auth.ts:16` | Security/Arch | Low |
| ERR-3 | `api/admin/businesses/[id]/route.ts:110` | Unhandled error | Medium |
| ERR-4 | `api/admin/businesses/[id]/activity/route.ts:29` | Perf + Error | Low |
| PERF-1 | `middleware.ts` + `lib/admin/auth.ts` | Performance | Medium |
| PERF-2 | `api/notifications/route.ts:45,56,84,108` | Performance | Medium |
| PERF-3 | `api/analytics/event/route.ts:67,78` | Performance | Low |
| PERF-4 | `api/admin/subscriptions/[id]/route.ts:91` | Performance | Low |
| PERF-5 | `middleware.ts:3-4` | Bundle size | Low |
| TYPE-1 | `api/qr/[id]/image/route.ts:77` | Type safety | Low |
| TYPE-2 | `api/reviews/route.ts:79` | Type safety | Low |
| TYPE-3 | `lib/businesses/current.ts:180` | Type safety | Low |
| TYPE-4 | `api/businesses/route.ts:102` | Dead code | Low |
| ARCH-1 | `middleware.ts` + `admin/layout.tsx` | Architecture | Low |

*plan_prices column mismatch already tracked separately (migration 017 written).*
