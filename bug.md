═══════════════════════════════════════
PHASE-WISE BUG FIX LIST (Agent Tasking)
═══════════════════════════════════════

🚨 PHASE 1 — CRITICAL BLOCKERS (Day 1)
Goal: Stop data loss + security breach. Ship before next deploy.
───────────────────────────────────────

[ ] TASK 1.1 — Fix private_feedback status constraint
    File: src/app/api/funnel/private/route.ts:48
    Migration: database/018_*.sql (new)
    Action: Add 'private_feedback' to CHECK constraint OR change inserted 
            status to 'generated' + add is_private boolean.
    Test: Submit low-rating → row inserted, no 500.

[ ] TASK 1.2 — Fix open redirect on login
    File: src/components/auth/LoginForm.tsx:42
    Action: Validate nextPath. Reject if not starts with '/' or starts with '//'.
    Fallback: '/app/business_dashboard'
    Test: /login?next=https://evil.com → goes to dashboard, not evil.com.

[ ] TASK 1.3 — Enforce billing quotas on generate
    File: src/app/api/funnel/generate/route.ts
    Action: After resolving qr.business_id → fetch plan limits → count 
            current period generates → return 402 if exceeded.
    Test: Free plan user generates >limit → blocked with 402.

───────────────────────────────────────
🔴 PHASE 2 — HIGH SECURITY (Day 2)
Goal: Close auth + privilege escalation holes.
───────────────────────────────────────

[ ] TASK 2.1 — Admin header verification
    File: src/lib/admin/auth.ts:28-44
    Action: Add check `if (adminId !== user.id) return 403`

[ ] TASK 2.2 — QR status whitelist
    File: src/app/api/qr/route.ts:64
    Action: Force status='draft' on creation. Reject client-supplied status.

[ ] TASK 2.3 — Remove unsafe-inline CSP
    File: next.config.ts:21
    Action: Remove 'unsafe-inline' from script-src. Add nonce-based CSP 
            via middleware. Pass nonce to <Script nonce={...}>.

[ ] TASK 2.4 — Fix silent partial-success on plan change
    File: src/app/api/admin/businesses/[id]/route.ts:140-158
    Action: Return HTTP 500 or 207 on partial failure. Never ok:true.

[ ] TASK 2.5 — Fix service role fallback to empty string
    File: src/middleware.ts:7-9
    Action: Throw at startup if SUPABASE_SERVICE_ROLE_KEY missing. 
            Use env.ts everywhere.

[ ] TASK 2.6 — Fix bypass of env.ts
    Files: src/app/auth/callback/route.ts:14-15
           src/app/api/admin/settings/admin-users/route.ts:36-44
    Action: Replace process.env.* direct access with env.ts imports.

───────────────────────────────────────
🟠 PHASE 3 — HIGH IMPACT BUGS (Day 3)
Goal: Fix OOM bombs + data integrity.
───────────────────────────────────────

[ ] TASK 3.1 — Admin analytics OOM fix
    File: src/app/api/admin/analytics/route.ts:33-35
    Migration: database/018_*.sql
    Action: Create RPC functions: count_by_country, count_by_device, 
            count_events_by_type. Replace .limit(10000) loops with RPCs.

[ ] TASK 3.2 — Billing usage OOM fix
    File: src/app/api/billing/usage/route.ts:54-76
    Action: Use SQL aggregation RPC. Remove unbounded fetch.

[ ] TASK 3.3 — Admin businesses N+1 fix
    File: src/app/api/admin/businesses/route.ts:56-80
    Action: Single JOIN query OR RPC. Eliminate 3 round-trips.

[ ] TASK 3.4 — Business detail scan count fix
    File: src/app/api/admin/businesses/[id]/route.ts:39-41
    Action: Use COUNT(*) query, not fetch-then-count.

[ ] TASK 3.5 — Fix draft_index JSONB comparison
    File: src/app/api/admin/analytics/route.ts:36-37
    Action: Cast properly: (meta->>'draft_index')::int = 0

───────────────────────────────────────
🟡 PHASE 4 — MEDIUM ISSUES (Day 4)
Goal: Harden rate limiting + validation.
───────────────────────────────────────

[ ] TASK 4.1 — Unify rate limiters
    Files: src/lib/admin/auth.ts:16-18, src/middleware.ts:56-61
    Action: Single namespace. One key per IP across both layers.

[ ] TASK 4.2 — Cap search input length
    File: src/app/api/admin/businesses/route.ts:32
    Action: Reject search > 100 chars. Add trigram index (see 5.2).

[ ] TASK 4.3 — Document/warn in-memory rate limiter
    File: src/lib/security/rateLimit.ts:52-58
    Action: Throw at startup if NODE_ENV=production && Upstash not set.

[ ] TASK 4.4 — Fix admin login DB connection on every page load
    File: src/middleware.ts:172-185
    Action: Skip createSupabaseAdmin for unauthenticated /admin/login GETs.

───────────────────────────────────────
🟢 PHASE 5 — PERFORMANCE / INDEXES (Day 5)
Goal: DB indexes + AI key distribution.
───────────────────────────────────────

[ ] TASK 5.1 — Add missing indexes
    Migration: database/019_*.sql
    Action:
      - CREATE EXTENSION IF NOT EXISTS pg_trgm
      - CREATE INDEX CONCURRENTLY businesses_name_trgm ON businesses 
        USING gin(name gin_trgm_ops)
      - CREATE INDEX ON generated_reviews(business_id)

[ ] TASK 5.2 — Fix AI round-robin in serverless
    File: src/lib/ai/generate.ts:43-48
    Action: Use Redis counter or pick random key per invocation. 
            Module memory does not work across cold starts.

[ ] TASK 5.3 — Fix chart.tsx XSS risk
    File: src/components/ui/chart.tsx:81-99
    Action: Sanitize brand_color before injection. Whitelist hex format only.

───────────────────────────────────────
🧹 PHASE 6 — CODE SMELLS / REFACTOR (Day 6-7)
Goal: Break down god classes + extract magic numbers.
───────────────────────────────────────

[ ] TASK 6.1 — Split FunnelFlow.tsx (549 lines)
    File: src/app/r/[token]/FunnelFlow.tsx
    Action: Extract per-step components, translations module, 
            platform metadata module, API hooks.

[ ] TASK 6.2 — Split dashboard ui.tsx god file
    File: src/components/dashboard/ui.tsx
    Action: One component per file. Icons → icons/, primitives → primitives/.

[ ] TASK 6.3 — Refactor businesses PATCH/POST
    File: src/app/api/businesses/route.ts:195-332
    Action: Extract triple-fallback to single helper. Reduce nesting.

[ ] TASK 6.4 — Centralize constants
    Files: across routes
    Action: Create src/lib/constants.ts. Move:
      - MAX_FEEDBACK_LEN
      - rate limit windows
      - 30-day milliseconds calc
      - QR token length + alphabet
      - retry-after helper

[ ] TASK 6.5 — Fix QR app URL fallback
    File: src/app/api/qr/[id]/image/route.ts:10
    Action: Throw at startup if APP_URL missing. No hardcoded prod fallback.

[ ] TASK 6.6 — Clean dead comments + legacy fallback
    Files: src/app/api/qr/route.ts:19, src/lib/businesses/current.ts:153-191
    Action: Remove stale BUG-13 comment. Add deprecation date to legacy path.

───────────────────────────────────────
🧪 PHASE 7 — TESTING (Week 2-3)
Goal: From 0% to baseline coverage.
───────────────────────────────────────

[ ] TASK 7.1 — Install test infra
    Action: pnpm add -D vitest @vitest/ui playwright @playwright/test
            Create vitest.config.ts, playwright.config.ts

[ ] TASK 7.2 — Unit tests: security primitives
    Targets:
      - src/lib/security/rateLimit.ts (Redis up/down/fallback)
      - src/lib/security/sanitize.ts (javascript:, >20 platforms, XSS)
      - src/lib/qr/tokens.ts (collision range)

[ ] TASK 7.3 — Integration tests: RLS
    Action: anon user cannot UPDATE another user's generated_reviews row.
            anon user cannot SELECT another business's data.

[ ] TASK 7.4 — Integration tests: auth flows
    Targets:
      - Login redirect validation
      - Admin header spoofing
      - Auth callback with invalid code

[ ] TASK 7.5 — Integration tests: billing
    Targets:
      - Free plan quota enforcement (after Phase 1.3)
      - Plan change atomicity

[ ] TASK 7.6 — E2E tests: critical funnel
    Action: Playwright — QR scan → rating → private feedback → DB row created.
            QR scan → high rating → redirect to platform.

[ ] TASK 7.7 — CI integration
    Action: GitHub Action — run vitest + playwright on PR. Block merge on fail.

───────────────────────────────────────
📋 AGENT PROMPT TEMPLATE
───────────────────────────────────────

For each task, give your agent this:

"""
TASK ID: [e.g., 1.1]
FILE: [exact path:line]
PROBLEM: [paste from audit]
FIX: [paste action]
TEST: 
  1. Read the file
  2. Apply the fix
  3. Verify no other file references the old behavior
  4. Write a test case in tests/[area]/[task-id].test.ts
  5. Run: pnpm test [task-id]
  6. Show me the diff

Do NOT touch unrelated files.
Do NOT add features.
Report blockers immediately.
"""

═══════════════════════════════════════
SUMMARY
═══════════════════════════════════════
Phase 1: 3 tasks  → Day 1   (BLOCKERS)
Phase 2: 6 tasks  → Day 2   (SECURITY)
Phase 3: 5 tasks  → Day 3   (OOM/DATA)
Phase 4: 4 tasks  → Day 4   (MEDIUM)
Phase 5: 3 tasks  → Day 5   (PERF)
Phase 6: 6 tasks  → Day 6-7 (REFACTOR)
Phase 7: 7 tasks  → Week 2-3 (TESTS)
───────────────────────────────────────
TOTAL: 34 tasks | ~3 weeks to production-ready
═══════════════════════════════════════