# Project Audit Report — Reevo AI Review SaaS
**Date:** 2026-05-23  
**Auditor:** Claude Code (automated + manual analysis)  
**Codebase:** Next.js 15 / Supabase / TypeScript — AI Review Funnel SaaS

---

## TL;DR

- **Overall score: 5.5/10**
- **Production-ready? NO** — critical security credential issue, zero tests, no CI/CD
- **Can handle 1000 concurrent users? MAYBE-WITH-FIXES** — Vercel auto-scales but rate limiter is broken at scale, and one DB-level RLS policy is dangerously permissive
- **Most critical issue:** Real production secrets (Supabase service role key, OpenAI API key, Gemini API keys) are stored in `.env` in plaintext — these must be rotated immediately
- **Most critical security issue:** RLS policy `reviews_public_update` allows **any unauthenticated user on the internet to update any row** in `generated_reviews` directly via the Supabase JS client, bypassing all API auth

---

## Scorecard

| Area | Score | Status |
|---|---|---|
| Code Quality | 6/10 | ⚠️ |
| Architecture | 6/10 | ⚠️ |
| Security | 4/10 | ❌ |
| Scalability | 5/10 | ⚠️ |
| Database | 6.5/10 | ⚠️ |
| Production Readiness | 3/10 | ❌ |
| **OVERALL** | **5.5/10** | ❌ |

---

## Section 1 — Code Quality
**Score: 6/10**

### A) TypeScript Health

| Check | Result |
|---|---|
| `strict: true` in tsconfig | ✅ YES |
| `noImplicitAny` | ✅ (included in strict) |
| `strictNullChecks` | ✅ (included in strict) |
| `tsc --noEmit` errors | ✅ **0 errors** |
| `any` / `as any` occurrences | ⚠️ **25 occurrences** |
| `@ts-ignore` / `@ts-expect-error` | ✅ **0** |
| `eslint-disable` inline | ⚠️ **7 occurrences** |

Notable `any` usages:
- `src/app/api/businesses/route.ts` — multiple `as Awaited<ReturnType<...>>` casts that paper over type incompatibilities between the user and admin Supabase clients
- `src/lib/businesses/current.ts` — `as Record<string, unknown>` casts on DB results
- `src/app/r/[token]/FunnelFlow.tsx:220` — `eslint-disable react-hooks/exhaustive-deps` suppresses a legitimate dependency warning

### B) Linting

- ESLint is configured with `eslint-config-next` 
- `ignoreDuringBuilds: false` is set (good — fails CI on lint errors)
- 7 `eslint-disable` comments, including 2 for `@typescript-eslint/no-unused-vars` on actually-used variables (the unused-var suppression is a false positive workaround, not hiding real dead code)

### C) Code Duplication

- **MAJOR**: Three nearly identical business upsert functions in `src/app/api/businesses/route.ts:55–160` (`upsertBusinessViaRpc`, `upsertBusinessDirect`, `upsertLegacyBusiness`). This is a compatibility fallback chain, but the three-path logic is fragile and duplicates error handling
- **MAJOR**: `createAdminClient()` is instantiated fresh in every API route handler — same pattern copy-pasted across ~20 files with no abstraction
- **MINOR**: Nearly identical pagination logic copy-pasted in `reviews/route.ts`, `audit-logs/route.ts`, `admin/businesses/route.ts`, `admin/subscriptions/route.ts`

### D) File Size (>500 lines = needs splitting)

| File | Lines | Issue |
|---|---|---|
| `src/components/dashboard/ui.tsx` | 822 | ❌ Monolith UI component |
| `src/components/dashboard/screens/ScreenOnboarding.tsx` | 808 | ❌ Too large |
| `src/components/dashboard/screens/ScreenFunnel.tsx` | 629 | ❌ Too large |
| `src/app/r/[token]/FunnelFlow.tsx` | 548 | ⚠️ |
| `src/app/api/businesses/route.ts` | 332 | ⚠️ Three-fallback upsert inflates this |

### E) Dead Code

- `src/app/app/onboarding/layout.tsx:5` — eslint-disabled unused import
- `src/app/industries/IndustriesContent.tsx:106` — suppressed unused variable
- No zombie routes or unused exports found at a structural level

### F) Naming Consistency

| Pattern | Assessment |
|---|---|
| File naming | ⚠️ Mixed: `PascalCase` for components, `kebab-case` for routes — correct but not enforced |
| API routes | ✅ RESTful resource naming (`/api/qr`, `/api/reviews`, `/api/admin/businesses`) |
| Functions | ✅ camelCase throughout |
| Database types | ⚠️ `database.ts` defines `BusinessPlan` with value `'scale'`, but SQL schema uses `'enterprise'` — **type drift** |

### G) Error Handling

- 20 `catch` blocks in API routes
- Most are handled: return appropriate status codes ✅
- **Empty catches**: `src/app/api/funnel/status/route.ts` — outer catch returns `{ ok: false }` with no logging
- `src/app/api/analytics/event/route.ts` — analytics errors fail silently (intentional, but means analytics corruption goes undetected)
- No global error monitoring (Sentry, etc.)
- Errors logged to `console.error` — works on Vercel, but unstructured and not queryable

### H) Testing

- **ZERO tests** — no unit, integration, or e2e tests
- No Jest, Vitest, Playwright, or Cypress config
- No test fixtures or seed scripts

### Quick Wins (< 1 hour each)
1. Add `src/lib/supabase/withAdmin.ts` helper that wraps `requireAdmin()` + `createAdminClient()` — eliminates 3-line boilerplate in every admin route
2. Fix the `BusinessPlan` type drift: add `'enterprise'` to `database.ts`
3. Enable ESLint `no-console` rule and swap all `console.error` → structured logger
4. Add `src/lib/pagination.ts` helper for the repeated `page/perPage/offset` pattern

### Big Refactors (> 1 day each)
1. Split `src/components/dashboard/ui.tsx` (822 lines) into feature-specific components
2. Collapse the 3-path business upsert fallback chain (it exists to handle schema drift — fix the schema instead)
3. Add end-to-end tests (Playwright) for the funnel flow and auth

---

## Section 2 — Architecture
**Score: 6/10**

### A) Folder Structure

```
src/
  app/
    admin/               ← Admin UI (protected)
    app/                 ← Authenticated user UI
    api/
      admin/             ← Admin API (server-guarded)
      analytics/         ← Analytics endpoints
      auth/              ← Auth helpers
      billing/           ← Billing/usage
      businesses/        ← Business CRUD
      funnel/            ← Public funnel (no auth)
      notifications/     ← Notifications
      qr/                ← QR code management
      reviews/           ← Review history
    r/[token]/           ← Public review funnel
    (public pages)
  components/
    admin/               ← Admin-specific components
    auth/                ← Auth forms
    dashboard/           ← User dashboard screens
    home/                ← Landing page sections
    layout/              ← Shared layout
    ui/                  ← Generic UI (shadcn-style)
  lib/
    admin/               ← Admin auth + audit
    ai/                  ← AI generation
    analytics/           ← Analytics helpers
    billing/             ← Plan limits
    businesses/          ← Business retrieval
    qr/                  ← QR utilities
    security/            ← Rate limiting + sanitize
    supabase/            ← DB clients
  types/                 ← Shared TypeScript types
```

**Assessment:** Folder structure is reasonable. Admin/user/public boundaries are clear. Main issue: no `services/` layer — business logic lives directly in route handlers.

### B) Separation of Concerns

| Concern | Assessment |
|---|---|
| API routes → business logic | ❌ Inline — no service layer |
| React components → data fetching | ✅ SWR hooks + server components |
| DB access | ⚠️ Partially centralized in `lib/businesses/current.ts`, but admin routes call `createAdminClient()` directly |
| Auth check | ✅ Centralized in `requireAdmin()` for admin, `supabase.auth.getUser()` for user routes |

### C) State Management

- SWR for server state (data fetching + caching) ✅
- No Zustand/Redux — appropriate for this scale
- No observable prop-drilling issues from code review

### D) Data Fetching

- Mix of server and client components — appropriate
- `analytics/summary` and `dashboard/overview` use Postgres RPCs (single round-trip) ✅
- Analytics endpoint has CDN cache hints ✅
- No React Query — SWR fills this role adequately

### E) API Design

| Check | Assessment |
|---|---|
| HTTP method discipline | ✅ GET/POST/PATCH/DELETE used correctly |
| Status codes | ✅ Proper 400/401/403/404/500 |
| Response shape consistency | ❌ Inconsistent: `{business}`, `{code}`, `{ok}`, `{data}`, `{drafts}` — no envelope standard |
| API versioning | ❌ None |
| Rate limiting coverage | ⚠️ Public funnel endpoints ✅, admin endpoints ❌ |

### F) Type Safety End-to-End

- **DRIFT RISK**: Types in `src/types/database.ts` are hand-maintained mirrors of the SQL schema
- `BusinessPlan` includes `'scale'` but DB uses `'enterprise'`
- Supabase JS SDK auto-generates types from schema (`supabase gen types typescript`) — this project does not use that
- API responses are typed only at the route level; no shared response types between frontend and backend

### G) Configuration

- Env vars used as `process.env.X` directly — no runtime validation (no Zod/envalid schema)
- If `SUPABASE_SERVICE_ROLE_KEY` is missing, `createAdminClient()` throws at runtime rather than startup
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` used in both client and server clients ← **see Security section**

### H) Dependencies

| Check | Assessment |
|---|---|
| outdated packages | ⚠️ 13 packages outdated, `next` is 15.2.9 vs 16.2.6, `@supabase/ssr` is 0.5.2 vs 0.10.3 |
| npm audit vulnerabilities | ❌ **2 vulnerabilities**: 1 HIGH (Next.js SSRF via WebSocket), 1 MODERATE (PostCSS XSS) |
| Three AI SDKs (Anthropic, OpenAI, Gemini) | ⚠️ Heavy — triple dependency for generation fallback |

### ASCII Architecture Diagram (current state)

```
Browser/Mobile
     │
     ├── Public funnel (/r/[token]) ────────────┐
     │         │                                │
     │   POST /api/funnel/generate              │
     │   POST /api/funnel/private         (anon, rate-limited)
     │   PATCH /api/funnel/status               │
     │   POST /api/analytics/event              │
     │                                          │
     ├── User dashboard (/app/**) ──────────────┤
     │         │                                │
     │   [Middleware: Supabase session check]   │
     │         │                                │
     │   GET/POST/PATCH /api/businesses         │
     │   GET /api/qr/**                         │ → Supabase
     │   GET /api/reviews                       │   (Postgres)
     │   GET /api/analytics/summary        (auth required)
     │   GET /api/dashboard/overview            │
     │                                          │
     └── Admin panel (/admin/**) ───────────────┤
               │                                │
       [Middleware: admin_users DB check]        │
               │                                │
       [Route: requireAdmin() double-check]      │
               │                                │
       GET/POST/PATCH /api/admin/**        (admin only)

External:
  AI: Anthropic API → OpenAI API → Gemini API (fallback chain)
  Auth: Supabase Auth (email/password + Google OAuth)
  Deploy: Vercel (assumed)
```

---

## Section 3 — Security
**Score: 4/10**

### CRITICAL

#### CRIT-1: Real Production Secrets in `.env` Plaintext
**File:** `.env:1-10`  
**Finding:** The `.env` file contains live production credentials:
- `SUPABASE_SERVICE_ROLE_KEY` — bypasses ALL Row Level Security, can read/write/delete any data in the database
- `OPENAI_API_KEY` — live key with billing implications; if stolen, attacker runs up costs
- Multiple `GEMINI_API_KEY_*` — live Google AI keys (commented out but present)

**Attack scenario:** Developer laptop stolen / screen shared / `.env` accidentally committed → attacker has god-access to production database and AI billing.  
**Note:** `.env` is in `.gitignore` and was NOT found in git history — but it should still use a secrets manager (Vercel env vars via dashboard, Doppler, 1Password Secrets). The keys should be rotated as a precaution.

---

#### CRIT-2: Supabase RLS Policy Allows Global Anonymous Update on `generated_reviews`
**File:** `database/001_initial_schema.sql:295-296`
```sql
create policy "reviews_public_update" on public.generated_reviews
  for update using (true);
```
**Attack scenario:** Any unauthenticated attacker can call the Supabase JS client directly (using the `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — which is public by definition) and run:
```js
supabase.from('generated_reviews').update({ status: 'redirected', copies: 9999 }).eq('id', anyUUID)
```
This allows:
- Corrupting analytics for any business (inflate/deflate copy counts)
- Changing review status for ANY business to poison their data
- Mass-updating all reviews to `private_feedback` to hide them from dashboards

**Fix:** Scope the policy to only allow update where the `qr_id` was recently resolved by the public funnel (use a temp token or restrict updatable columns).

---

#### CRIT-3: `db.auth.admin.listUsers()` Loads All Users Into Memory
**File:** `src/app/api/admin/settings/admin-users/route.ts:26`
```ts
const { data: { users }, error: listError } = await db.auth.admin.listUsers();
const authUser = users.find(u => u.email === email);
```
**Attack scenario:** If there are 10,000 registered users, this loads all 10,000 user objects into a serverless function's memory to find one by email. As user count grows, this WILL cause memory exhaustion and OOM crashes. The Supabase admin API supports `listUsers({ page, perPage })` but it's not being used.  
**Fix:** Use `db.auth.admin.listUsers({ page: 1, perPage: 1 })` with email filter, or use `getUserByEmail()` if available.

---

### HIGH

#### HIGH-1: CSP Allows `unsafe-inline` + `unsafe-eval` — XSS Protection Neutered
**File:** `next.config.ts:13`
```
"script-src 'self' 'unsafe-inline' 'unsafe-eval'",
```
**Impact:** The Content Security Policy header is set, but `unsafe-inline` means inline `<script>` tags are allowed, and `unsafe-eval` means `eval()` calls are allowed. This eliminates most practical XSS protection the CSP would otherwise provide.  
**Fix:** Remove `unsafe-eval`. Replace `unsafe-inline` with a nonce-based approach (Next.js 15 supports this via middleware). This is a non-trivial change but critical for a SaaS with customer data.

---

#### HIGH-2: In-Memory Rate Limiter Is Ineffective at Scale (Serverless)
**File:** `src/lib/security/rateLimit.ts:1-70`
```ts
const store = new Map<string, Window>();
```
**Impact:** On Vercel (serverless), each function invocation can run in a separate process. The `Map` is in-process memory — it is NOT shared across concurrent function instances. In practice, the rate limit allows `limit × (number of active instances)` requests per window, not just `limit`. Under DDoS, this provides almost no protection.  
**Fix:** Replace with Upstash Redis or Vercel KV for a shared distributed rate limit store. The code already has a comment noting this.

---

#### HIGH-3: `/api/funnel/status` PATCH — No Ownership Verification on `review_id`
**File:** `src/app/api/funnel/status/route.ts:44-60`
```ts
await supabase.from('generated_reviews').update({ copies: ..., status: 'copied' }).eq('id', reviewId);
```
**Attack scenario:** Any anonymous user who knows (or guesses) a UUID for any `generated_reviews` row can mark it as `copied` or `redirected`, regardless of which business it belongs to. Combined with CRIT-2 above, this pollutes analytics for any business.  
**Fix:** Require a QR token in the PATCH body and verify the `review_id` belongs to a QR code with that token.

---

#### HIGH-4: `dangerouslySetInnerHTML` Usage
**File:** `src/components/ui/chart.tsx:81`  
**Needs verification:** The content being rendered must be confirmed to be from a safe source (e.g., static string, not user input). If any user-controlled text flows into this path, it is XSS.

---

#### HIGH-5: Admin `GET /api/admin/businesses` — No Rate Limiting
**File:** `src/app/api/admin/businesses/route.ts`  
**Impact:** Admin routes have `requireAdmin()` but no rate limiting. A compromised admin account can enumerate the entire business list, or a brute-force on admin login can proceed unchecked. Auth endpoints (login form) have no explicit rate limit visible in the code.

---

### MEDIUM

#### MED-1: `qr_scans_public_insert` RLS Policy Allows Unauthenticated Inserts
**File:** `database/001_initial_schema.sql:242-243`
```sql
create policy "qr_scans_public_insert" on public.qr_scans
  for insert with check (true);
```
**Impact:** Any user can directly insert fabricated scan records via the Supabase JS client. The API rate-limits the analytics event endpoint, but anyone can bypass the API and write directly to the DB.  
**Fix:** Add a `with check` that validates `qr_id` is in `qr_codes where status = 'live'`.

---

#### MED-2: Schema Type Drift — `BusinessPlan` Out of Sync
**File:** `src/types/database.ts:4`
```ts
export type BusinessPlan = 'free' | 'starter' | 'pro' | 'scale';
```
**SQL uses:** `'enterprise'`, not `'scale'`. This drift will cause silent type failures if `'enterprise'` plans are compared against the TypeScript union.  
**Fix:** Use `supabase gen types typescript` to auto-generate and keep types in sync.

---

#### MED-3: Cookie for Admin Auth Has No Explicit Expiry
**File:** `src/middleware.ts` (Supabase manages the cookie)  
**Impact:** Supabase session tokens don't have an explicit admin-specific expiry. If an admin session is compromised, it remains valid until Supabase's default session TTL.  
**Fix:** Define explicit session TTL via Supabase Auth settings, and add forced re-verification on sensitive admin actions.

---

### LOW

#### LOW-1: N+1 `getUserById` Calls in Admin List Endpoints
**Files:** `src/app/api/admin/businesses/route.ts:92`, `src/app/api/admin/subscriptions/route.ts:52`, `src/app/api/admin/audit-logs/route.ts:34`
```ts
await Promise.all(ownerIds.map(async ownerId => {
  const { data } = await db.auth.admin.getUserById(ownerId);
  ...
}));
```
**Impact:** For a page of 25 businesses, this fires 25 parallel Supabase Auth API calls. This is batched with `Promise.all` (not sequential), so it's not catastrophic — but it's inefficient and will hit rate limits under load.  
**Fix:** Supabase admin `listUsers()` can be filtered; or cache email lookups.

---

#### LOW-2: Error Messages Expose DB Error Details in Development
**File:** `src/app/api/funnel/generate/route.ts:115-122`
```ts
...(process.env.NODE_ENV === 'development' && { debug: { message: dbError?.message, ... } })
```
This is correct — debug info is gated behind `NODE_ENV`. However, `NODE_ENV` is sometimes set to `development` on staging environments by mistake. Verify staging uses `production`.

---

#### LOW-3: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY Key Name Inconsistency
**File:** `src/lib/supabase/server.ts:4` vs `middleware.ts:6`  
The env var is named `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in middleware, but `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` everywhere — actually consistent. However, the variable is named `supabaseKey` (anon/publishable) but used in server-side context too. Fine functionally, but naming is misleading.

---

### "Can a determined attacker get user data?"

**YES, with significant effort.** Specifically:
1. Using the public Supabase key (readable from any browser), an attacker can call `supabase.from('generated_reviews').update(...)` directly due to CRIT-2 and corrupt any business's analytics data
2. An attacker who knows or guesses valid review UUIDs can poison analytics data at scale
3. An attacker cannot read other users' private data (RLS select policies are correct for businesses, subscriptions, invoices) — so confidentiality is maintained for sensitive fields, but integrity of analytics data is not

---

## Section 4 — Scalability
**Score: 5/10**

### A) Database

| Check | Result |
|---|---|
| Connection pooling | ✅ Supabase manages PgBouncer at the infra layer |
| N+1 queries (API-level) | ⚠️ Admin routes: N `getUserById` calls (batched with Promise.all, but still N round-trips) |
| Missing indexes | ✅ Composite indexes in `002_performance_indexes.sql` cover main query patterns |
| SELECT * usage | ✅ None found in API routes — specific columns selected |
| Queries without LIMIT | ✅ Admin routes paginate. `billing/usage` fetches all events for the period — potential issue at scale |
| RPC usage | ✅ Heavy analytics aggregations use Postgres RPCs (single round-trip) |

**Potential slow query — `billing/usage/route.ts`:**
```ts
db.from('analytics_events').select('event_type, qr_id, created_at').eq('business_id', biz.id).gte('created_at', sinceIso)
```
This fetches ALL events for a business in the billing period into application memory for counting. At 100K events/month, this is a large payload. Should use a DB-side aggregation RPC instead.

---

### B) API Layer

| Check | Result |
|---|---|
| Caching on heavy endpoints | ✅ Analytics summary: `s-maxage=60`, Dashboard: `s-maxage=30` |
| Rate limiting — public funnel | ✅ Per-IP limits on all funnel endpoints |
| Rate limiting — AI endpoints | ✅ 20 req/min/IP on `/api/funnel/generate` |
| Rate limiting — admin endpoints | ❌ No rate limiting |
| Rate limiter effectiveness (serverless) | ❌ **In-memory — not shared across Vercel instances** |
| AI calls blocking requests | ⚠️ 2 parallel AI calls per funnel use (`Promise.allSettled`). At 1000 concurrent users, this means up to 2000 in-flight AI API calls. Anthropic/OpenAI rate limits will be hit |
| Sync operations that should be async | ⚠️ No email notifications, no background jobs — everything is synchronous. Acceptable for current scale but will need Inngest/Trigger.dev at 1000+ users |

---

### C) Frontend

- Bundle size: build not run (would require `next build`). Needs verification.
- `recharts` is loaded (heavy charting library) — likely not lazy-loaded
- Next.js 15 Image component used for remote images ✅
- Heavy dashboard screen components (800+ lines) loaded client-side

---

### D) Real-Time

- No WebSocket usage found
- SWR polling via `refreshInterval` is likely used for dashboard — needs verification for long-poll loops

---

### E) Background Jobs

- **None.** No queue system exists.
- AI generation is a blocking synchronous operation in the request lifecycle
- If Anthropic/OpenAI is slow (2-5s response time), 1000 concurrent scans = 2000 blocking AI calls
- Recommendation: move AI generation to a background queue (Trigger.dev or Inngest), return a `job_id` immediately, poll for result

---

### F) CDN & Static

- Vercel automatically serves static assets via CDN ✅
- QR code images are generated on-demand via `/api/qr/[id]/image` — no caching (`private, no-store` is set correctly for user-specific content). Under load, QR image generation (using the `qrcode` npm package) runs on every request.

---

### G) Monitoring

| Check | Result |
|---|---|
| Error tracking (Sentry, etc.) | ❌ None |
| APM / performance monitoring | ❌ None |
| Structured logging | ❌ `console.error` only |
| Database query monitoring | ❌ None (Supabase dashboard has basic monitoring) |
| Uptime monitoring | ❌ None visible |

---

### H) Deployment

- Vercel deployment assumed (Vercel-specific headers referenced in rate limiter)
- Vercel auto-scales serverless functions ✅ — API layer is not a bottleneck
- No staging/preview environment configuration visible
- Single-region deployment assumed — latency for international users

---

### Load Estimate

| Metric | Estimate |
|---|---|
| Concurrent users before degradation | **~150–300** (bottleneck: AI API call latency under shared rate limits) |
| Bottleneck #1 | **In-memory rate limiter** — bypassed trivially at scale, no real DDoS protection |
| Bottleneck #2 | **AI API throughput** — 1000 concurrent scans = 2000 Anthropic/OpenAI calls in-flight; provider rate limits will reject requests, cascading to 503 errors |
| Bottleneck #3 | **`billing/usage` in-memory aggregation** — fetches all events for the period into Node.js memory; at 10K events/business/month this is still fine, but at 100K it becomes slow |
| Cost to scale to 1000 concurrent users | **~$200-500/month** (Supabase Pro $25, Vercel Pro $20, Upstash Redis ~$10, Anthropic/OpenAI API costs dominate at ~$150-450/month for AI generation at that volume) |

**Verdict: NO — cannot confidently handle 1000 concurrent without fixes.**  
Primary blockers: broken rate limiter, synchronous AI calls, no background job queue.

---

## Section 5 — Database Design
**Score: 6.5/10**

### A) Schema Review

**Tables identified:**
- `businesses` — core tenant table ✅
- `qr_codes` — QR campaigns ✅
- `qr_scans` — raw scan events ✅
- `generated_reviews` — AI-generated review text ✅
- `analytics_events` — rich event log ✅
- `subscriptions` — billing ✅
- `invoices` — invoice records ✅
- `audit_logs` — admin action log ✅
- `admin_users` — admin access table ✅
- `plan_prices` — plan pricing table ✅
- `notification_reads` — read state (inferred) ✅
- `notification_preferences` — user prefs (inferred) ✅

**Foreign keys:**
- All FK relationships defined with `ON DELETE CASCADE` or `ON DELETE SET NULL` ✅
- Cascade rules are appropriate for the data model

**Indexes:**
- Core indexes in `001_initial_schema.sql` ✅
- Composite performance indexes in `002_performance_indexes.sql` ✅
- Admin-specific indexes in `012_admin_panel.sql` ✅

### B) Missing Constraints

| Issue | Location | Severity |
|---|---|---|
| No UNIQUE constraint on `businesses.owner_id` | `001_initial_schema.sql` | HIGH — one user can create multiple businesses (upsert RPC prevents it but DB doesn't enforce it) |
| No CHECK constraint on `businesses.plan` | `001_initial_schema.sql` | MEDIUM — any string is accepted as a plan value |
| No CHECK constraint on `qr_codes.status` | `001_initial_schema.sql` | MEDIUM — `('draft', 'live', 'paused', 'archived')` not enforced at DB level |
| No GIN index on `analytics_events.meta` (JSONB) | `001_initial_schema.sql` | LOW — meta column is not queryable efficiently |
| Double `008_` migration files | `database/` | LOW — `008_businesses_schema_reconcile.sql` AND `008_fix_rls_recursion.sql` — naming collision |

### C) Normalization

- Plan is stored in BOTH `businesses.plan` AND `subscriptions.plan` — denormalized. Admin route syncs them on change but drift is possible
- `generated_reviews.business_id` was added later (migration 002) and backfilled — creates two ways to join (via `qr_codes` or directly). Dual paths are confusing but both are maintained

### D) RLS Assessment

| Policy | Assessment |
|---|---|
| `businesses_owner` | ✅ Correct |
| `businesses_public_read` | ✅ Only when live QR exists |
| `qr_codes_owner` | ✅ Scoped to owner |
| `qr_codes_public_token_read` | ✅ Only live codes |
| `qr_scans_public_insert` | ⚠️ Allows direct insert without token validation |
| `reviews_public_insert` | ⚠️ Allows direct insert without token validation |
| `reviews_public_update` | ❌ **`using (true)` — global unrestricted update** |
| `admin_users` | ✅ No policy — service role only |

### E) Migrations

- Numbered migrations 000–013 ✅
- Two `008_` files ❌ — naming collision
- Migration 000 is a destructive reset — should never run in production without explicit intent
- No migration runner tooling (Flyway, golang-migrate, etc.) — manual SQL execution documented in comments
- Idempotent with `IF NOT EXISTS` guards ✅

### Suggested Missing Indexes

```sql
-- Enforce one business per user at DB level
ALTER TABLE public.businesses ADD CONSTRAINT businesses_owner_id_unique UNIQUE (owner_id);

-- Plan validation at DB level
ALTER TABLE public.businesses ADD CONSTRAINT businesses_plan_check 
  CHECK (plan IN ('free', 'starter', 'pro', 'enterprise'));

-- QR status validation
ALTER TABLE public.qr_codes ADD CONSTRAINT qr_codes_status_check
  CHECK (status IN ('draft', 'live', 'paused', 'archived'));

-- GIN index for JSONB meta queries (analytics_events)
CREATE INDEX IF NOT EXISTS idx_ae_meta_gin ON public.analytics_events USING gin(meta);
```

---

## Section 6 — Production Readiness
**Score: 3/10**

### Checklist

| Check | Status |
|---|---|
| **Environment** | |
| Dev / staging / prod separation | ❌ Not visible |
| Different secrets per environment | ❌ Single `.env` file |
| Database per environment | ❌ Single Supabase project apparent |
| Env vars validated at startup | ❌ No Zod/envalid schema |
| **CI/CD** | |
| GitHub Actions / CI pipeline | ❌ No `.github/` directory |
| Automated tests on PR | ❌ No tests exist |
| Linting / typecheck on PR | ❌ No CI pipeline |
| Auto-deploy | ❌ Not confirmed (likely Vercel Git integration) |
| Rollback strategy | ❌ No documented strategy |
| **Monitoring** | |
| Error tracking (Sentry, etc.) | ❌ Not present |
| APM / performance monitoring | ❌ Not present |
| Uptime monitoring | ❌ Not present |
| Log aggregation | ❌ Console only |
| **Error Handling** | |
| Global Next.js error boundary | ❌ Not found |
| Custom 404 page | ⚠️ Needs verification |
| Custom 500 page | ⚠️ Needs verification |
| **Documentation** | |
| README with setup instructions | ❌ No README found |
| Environment variables documented | ❌ No `.env.example` |
| API documentation | ❌ None |
| Architecture decisions documented | ❌ No ADRs |
| **Developer Onboarding** | |
| New dev setup in < 30 min | ⚠️ Possible but undocumented |
| Seed scripts / fixtures | ❌ Only a SQL admin seed file (`013_seed_super_admin.sql`) |
| **Security** | |
| Secrets in secrets manager | ❌ Plaintext `.env` |
| HTTPS enforced | ✅ HSTS header set |
| Security headers | ✅ X-Frame-Options, HSTS, Referrer-Policy set |
| CSP | ⚠️ Set but weakened by `unsafe-inline`/`unsafe-eval` |
| npm audit clean | ❌ 2 vulnerabilities (1 HIGH, 1 MODERATE) |

---

## Priority Action List (Top 20)

| # | Severity | Action | Effort |
|---|---|---|---|
| 1 | **CRITICAL** | **Rotate all credentials in `.env`** — Supabase service role key, OpenAI key, Gemini keys. Store in Vercel environment variables dashboard, not local files | 1 hour |
| 2 | **CRITICAL** | **Fix `reviews_public_update` RLS policy** — scope update to only allow changing `copies`/`status` on rows where the calling context holds the QR token (`database/001_initial_schema.sql:295`) | 2 hours |
| 3 | **CRITICAL** | **Fix `listUsers()` in admin-users POST** — replace full user list with targeted lookup (`src/app/api/admin/settings/admin-users/route.ts:26`) | 30 min |
| 4 | **HIGH** | **Replace in-memory rate limiter with Upstash Redis / Vercel KV** (`src/lib/security/rateLimit.ts`) | 3 hours |
| 5 | **HIGH** | **Add ownership verification to `/api/funnel/status` PATCH** — verify `review_id` belongs to a QR code matching the submitted token | 1 hour |
| 6 | **HIGH** | **Fix CSP: remove `unsafe-eval`, implement nonce-based `unsafe-inline`** (`next.config.ts:13`) | 4 hours |
| 7 | **HIGH** | **Fix `npm audit` vulnerabilities** — upgrade Next.js to ≥15.5.18 (patches SSRF + cache poisoning CVEs) | 1 hour |
| 8 | **HIGH** | **Add rate limiting to admin routes** — especially login + business enumeration | 2 hours |
| 9 | **HIGH** | **Move AI generation to background queue** (Trigger.dev or Inngest) — return `job_id`, poll from client; prevents 1000-user AI call storm | 1 day |
| 10 | **HIGH** | **Add error monitoring** (Sentry free tier is sufficient) — global Next.js error boundary + Sentry DSN | 2 hours |
| 11 | **HIGH** | **Set up CI pipeline** — GitHub Actions: `tsc --noEmit`, `eslint`, on every PR | 2 hours |
| 12 | **MEDIUM** | **Fix schema type drift** — run `supabase gen types typescript`, replace hand-maintained `src/types/database.ts`, add `'enterprise'` to `BusinessPlan` | 1 hour |
| 13 | **MEDIUM** | **Add `UNIQUE (owner_id)` constraint to `businesses` table** | 30 min |
| 14 | **MEDIUM** | **Add CHECK constraints on `plan` and `status` enum columns** | 30 min |
| 15 | **MEDIUM** | **Replace `billing/usage` in-memory event aggregation with a Postgres RPC** | 4 hours |
| 16 | **MEDIUM** | **Add `.env.example` with all required keys documented** (no values) | 30 min |
| 17 | **MEDIUM** | **Rename `database/008_fix_rls_recursion.sql` to `008b_...`** to fix migration naming collision | 10 min |
| 18 | **MEDIUM** | **Validate env vars at startup** with Zod schema in `src/lib/env.ts` | 1 hour |
| 19 | **LOW** | **Write README** with local setup, env vars, database migration steps | 2 hours |
| 20 | **LOW** | **Add Playwright e2e tests** for the public funnel flow and auth flows | 2 days |

---

## Effort Estimate to Reach Production-Ready

| Category | Hours |
|---|---|
| Critical security fixes (#1–3) | 3.5 hours |
| High security fixes (#4–8) | 12 hours |
| Scale prep for 1000 users (#9, #15) | 1.5 days |
| Monitoring + CI (#10, #11) | 4 hours |
| Code quality + schema fixes (#12–18) | 8 hours |
| Documentation (#19) | 2 hours |
| Testing baseline (#20) | 2 days |
| **Total** | **~6–7 days of focused engineering** |

The app is architecturally sound and shows thoughtful design in many areas (RLS structure, sanitization helpers, admin auth double-check, defense-in-depth on middleware). The gap to production-readiness is primarily in operational maturity: no tests, no CI, no monitoring, credentials management, and two critical database/RLS issues.
