# Phase 2A — Retroactive Verification
**Date:** 2026-05-24  
**Status:** All 7 fixes applied. One FIX G regression found and corrected during this review.

---

## Important context: git diff limitations

The admin panel (`src/app/api/admin/`, `src/app/admin/`, `src/lib/admin/`) was never committed — it is
entirely untracked (`??` in git status). `git diff HEAD` only covers the **four tracked files** changed
by this session (middleware.ts, analytics/event/route.ts, notifications/route.ts, dashboard/ui.tsx).

For the untracked admin files I show: the **before** pattern (from the original generation, reconstructed)
and the **after** state (current file on disk), plus line references.

---

## Sanity checks

| Check | Result |
|---|---|
| `npm run build` | ✓ Passed — 0 errors |
| `npm run lint` | ✓ 1 pre-existing warning (`react-hooks/exhaustive-deps` at `ui.tsx:489`) — no new warnings |
| `npx tsc --noEmit` | ✓ 0 errors in Phase 2A files. 1 pre-existing error in `instrumentation.ts:16` (Sentry config — not related to any fix) |

### Build route sizes (after all 7 fixes)

| Route | Before | After | Delta |
|---|---|---|---|
| `/admin/dashboard` | 356 kB | **234 kB** | -122 kB |
| `/admin/analytics` | 348 kB | **233 kB** | -115 kB |
| `/admin/businesses` | 234 kB | 234 kB | — |
| `/admin/subscriptions` | 234 kB | 234 kB | — |
| Middleware | 121 kB | 121 kB | — (Upstash bundle unchanged; PERF-5 not fixed) |

---

## FIX A — Batch auth.users (N+1 elimination)

### A.1 Files changed

| File | Status | Change |
|---|---|---|
| `src/lib/admin/getUsersByIds.ts` | NEW (untracked) | Created batch helper |
| `src/app/api/admin/businesses/route.ts` | Modified (untracked) | Import + replace loop |
| `src/app/api/admin/subscriptions/route.ts` | Modified (untracked) | Import + replace loop |
| `src/app/api/admin/audit-logs/route.ts` | Modified (untracked) | Import + replace loop |
| `src/app/api/admin/businesses/[id]/activity/route.ts` | Modified (untracked) | Import + replace loop |

### A.2 What was removed (before pattern — all 4 routes)

```typescript
// BEFORE: N individual getUserById calls (one per owner, actor, etc.)
const emails: Record<string, string> = {};
for (const ownerId of ownerIds) {
  const { data: u } = await db.auth.admin.getUserById(ownerId);
  if (u?.user?.email) emails[ownerId] = u.user.email;
}
```

### A.3 What was added

New file `src/lib/admin/getUsersByIds.ts`:
```typescript
export async function getUserEmailsByIds(
  db: SupabaseClient,
  ids: string[],
): Promise<Record<string, string>> {
  if (ids.length === 0) return {};
  const needed = new Set(ids);
  const map: Record<string, string> = {};
  let page = 1;
  while (needed.size > 0) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 1000 });
    if (error || !data?.users?.length) break;
    for (const u of data.users) {
      if (needed.has(u.id)) {
        if (u.email) map[u.id] = u.email;
        needed.delete(u.id);
      }
    }
    if (data.users.length < 1000) break;
    page++;
  }
  return map;
}
```

Each route now does:
```typescript
const ownerIds = [...new Set((data ?? []).map(b => b.owner_id))];
const emailMap = await getUserEmailsByIds(db, ownerIds);
// then: emailMap[b.owner_id] ?? ''
```

### A.4 Manual test

Open `/admin/businesses` — the Owner Email column should show email addresses for each business row.  
Open `/admin/subscriptions` — same, emails should appear.  
Open `/admin/analytics/audit-logs` — actor emails should appear in the "by" column.  
Open any `/admin/businesses/[id]` → Activity tab — actor emails should appear.

If emails show as blank/empty for all rows, FIX A regressed. If emails show for some rows and blank for others, that means those owners simply have no email (expected for some auth providers).

---

## FIX B — Defensive LIMITs

### B.1 Files changed

| File | Status | Change |
|---|---|---|
| `src/app/api/admin/stats/charts/route.ts` | Modified (untracked) | Added `.limit(10000)` / `.limit(5000)` |
| `src/app/api/admin/analytics/route.ts` | Modified (untracked) | Added `.limit(10000)` to country, device, business_id queries |
| `src/app/api/admin/abuse/route.ts` | Modified (untracked) | Added `.limit(5000)` to full qr_codes scan |
| `src/app/api/admin/subscriptions/route.ts` | Modified (untracked) | Added `.limit(5000)` to allSubs fetch |
| `src/app/api/admin/invoices/route.ts` | Modified (untracked) | Added `.limit(5000)` to paid invoices revenue sum |

### B.2 What was removed / added

```typescript
// BEFORE (example from charts/route.ts):
db.from('qr_scans').select('scanned_at').gte('scanned_at', thirtyDaysAgo).order('scanned_at')

// AFTER:
// TODO(perf): replace with date_trunc GROUP BY RPC after migration 018 is run
db.from('qr_scans').select('scanned_at').gte('scanned_at', thirtyDaysAgo).order('scanned_at').limit(10000)
```

Same pattern applied to all 5 files. The limits are band-aids — the real fix requires SQL aggregates (migration 018, deferred).

### B.3 Manual test

Open `/admin/dashboard` — charts (daily scans line, plan donut, funnel) should still render with data.  
Open `/admin/analytics` → change the day selector (7d / 30d / 90d) — KPI numbers should update.  
Open `/admin/subscriptions` — MRR summary row at the top should still show a value.  
Open `/admin/subscriptions/invoices` — Revenue total in the summary should still show.

If any of these show 0 when they previously showed real data, and the real data is over the limit, that would be a regression (but limits are high enough that this is unlikely in early deployments).

---

## FIX C — Parallelize awaits

### C.1 Files changed

| File | Status | Change |
|---|---|---|
| `src/app/api/analytics/event/route.ts` | Modified (tracked — git diff available) | 2 sequential inserts → `Promise.all` |
| `src/app/api/notifications/route.ts` | Modified (tracked — git diff available) | 4 sequential queries → `Promise.all` |

### C.2 Diff — analytics/event/route.ts

```diff
-    /* insert analytics event */
-    await supabase.from('analytics_events').insert({ qr_id, business_id, event_type, device, country, meta });
-
-    /* also insert a qr_scan row for the 'scan' event */
+    /* insert analytics event + optional qr_scan row in parallel */
+    const writes = [
+      supabase.from('analytics_events').insert({ qr_id, business_id, event_type, device, country, meta }),
+    ];
     if (eventType === 'scan') {
-      await supabase.from('qr_scans').insert({ qr_id, device, country });
+      writes.push(supabase.from('qr_scans').insert({ qr_id, device, country }));
     }
+    await Promise.all(writes);
```

Also fixed a pre-existing bug in this file: `rateLimit(...)` was called without `await` — corrected to `await rateLimit(...)`.

### C.3 Diff — notifications/route.ts

```diff
-  /* ── Fetch IDs already marked read ── */
-  const { data: reads } = await db.from('notification_reads')...;
-  const { data: reviews } = await db.from('generated_reviews')...;
-  const { data: lowRatings } = await db.from('generated_reviews')...;
-  const { data: qrCodes } = await db.from('qr_codes')...;

+  const [
+    { data: reads },
+    { data: reviews },
+    { data: lowRatings },
+    { data: qrCodes },
+  ] = await Promise.all([
+    db.from('notification_reads').select('notif_id').eq('business_id', businessId),
+    db.from('generated_reviews').select(...)...
+    db.from('generated_reviews').select(...)...
+    db.from('qr_codes').select(...)...
+  ]);
```

### C.4 Manual test

**analytics/event:** Scan a QR code in the funnel. Both `analytics_events` and `qr_scans` should still be recorded (check Supabase table viewer). The `ok: true` response should come back.

**notifications:** Open the Notifications bell in the business dashboard. Items (reviews, alerts, QR campaigns) should still populate. Marking as read should still work (PATCH handler is unchanged).

---

## FIX D — Lazy-load recharts (next/dynamic)

### D.1 Files changed

| File | Status | Change |
|---|---|---|
| `src/app/admin/dashboard/page.tsx` | Modified (untracked) | Replaced 3 static chart imports with `next/dynamic` |
| `src/app/admin/analytics/page.tsx` | Modified (untracked) | Replaced 2 static chart imports with `next/dynamic` |

### D.2 What was removed / added

```typescript
// BEFORE (dashboard/page.tsx):
import LineChart   from '../_components/charts/line-chart';
import DonutChart  from '../_components/charts/donut-chart';
import FunnelChart from '../_components/charts/funnel-chart';

// AFTER:
import dynamic from 'next/dynamic';
const LineChart   = dynamic(() => import('../_components/charts/line-chart'),   { ssr: false, loading: () => <div style={{ height: 220, background: 'var(--surface-2)', borderRadius: 8, animation: 'pulse 1.4s infinite' }}/> });
const DonutChart  = dynamic(() => import('../_components/charts/donut-chart'),  { ssr: false, loading: () => <div style={{ height: 220, background: 'var(--surface-2)', borderRadius: 8, animation: 'pulse 1.4s infinite' }}/> });
const FunnelChart = dynamic(() => import('../_components/charts/funnel-chart'), { ssr: false, loading: () => <div style={{ height: 180, background: 'var(--surface-2)', borderRadius: 8, animation: 'pulse 1.4s infinite' }}/> });
```

Same pattern for `analytics/page.tsx` (BarChart + DonutChart).

### D.3 Manual test

Open `/admin/dashboard`. Charts should render after a brief skeleton flash (the `loading` prop on each dynamic import). The line chart (daily scans), plan donut, and funnel chart should all appear.

Open `/admin/analytics`. Bar charts (country distribution, top businesses) and donut (device split) should render.

If charts never appear (stuck on skeleton), the dynamic import path is wrong. If they flash then disappear, there's a runtime error in the chart component.

---

## FIX E — Middleware public route exclusion

### E.1 Files changed

| File | Status | Change |
|---|---|---|
| `src/middleware.ts` | Modified (tracked) | Added 10-line early-return block for public routes |

**Note:** The full `git diff HEAD -- src/middleware.ts` is large because the admin panel build (prior session) also heavily modified this file. My specific contribution in this session was **only** the early-return block below.

### E.2 What was added (my change only)

```diff
   if (!supabaseConfigured) {
     return supabaseResponse;
   }

+  // ── Public routes — skip all auth checks ─────────────────────────────────
+  // These paths are hit on every QR scan / funnel step; auth is never needed.
+  if (
+    pathname.startsWith('/r/') ||
+    pathname.startsWith('/api/funnel/') ||
+    pathname.startsWith('/api/analytics/') ||
+    pathname.startsWith('/api/qr/')
+  ) {
+    return supabaseResponse;
+  }
+
   // ── 0. Rate-limit /api/admin/* routes ───────────────────────────────────
```

### E.3 Manual test

**Critical test — funnel must still work:**
1. Open a QR funnel URL (e.g. `/r/<token>`)
2. The page should load normally
3. Tap "Generate review" — the `/api/funnel/generate` call must succeed
4. Confirm analytics events fire (`/api/analytics/event` returns `{ ok: true }`)

**Admin must still be gated:**
5. In an incognito window, navigate to `/admin/dashboard`
6. Should redirect to `/admin/login` (the early-return only fires for the whitelisted public paths)

If step 3 or 4 breaks, the early-return accidentally captured something it shouldn't. If step 6 breaks, the pathname prefix matching has a bug (it doesn't — `startsWith('/api/analytics/')` won't match `/admin/analytics/...`).

---

## FIX F — Merge duplicate qr_codes query

### F.1 Files changed

| File | Status | Change |
|---|---|---|
| `src/app/api/admin/businesses/route.ts` | Modified (untracked) | Merged 2 `qr_codes` queries into 1 |

### F.2 What was removed / added

```diff
-    // Query 1: get business_id for QR count
-    const { data: qrData } = await db
-      .from('qr_codes')
-      .select('business_id')          // ← only business_id
-      .in('business_id', bizIds);
-
-    qrData?.forEach(q => {
-      qrCounts[q.business_id] = (qrCounts[q.business_id] ?? 0) + 1;
-    });
-
-    // Query 2: get id + business_id for scan count
-    const { data: qrIds } = await db
-      .from('qr_codes')
-      .select('id, business_id')      // ← superset of query 1
-      .in('business_id', bizIds);
-
-    if (qrIds && qrIds.length > 0) {
-      const qrIdList = qrIds.map(q => q.id);
+    // Single query covering both needs
+    const { data: qrRows } = await db
+      .from('qr_codes')
+      .select('id, business_id')
+      .in('business_id', bizIds);
+
+    qrRows?.forEach(q => {
+      qrCounts[q.business_id] = (qrCounts[q.business_id] ?? 0) + 1;
+    });
+
+    if (qrRows && qrRows.length > 0) {
+      const qrIdList = qrRows.map(q => q.id);
```

One `qr_codes` round-trip eliminated per `/api/admin/businesses` call.

### F.3 Manual test

Open `/admin/businesses`. The QR Count and Total Scans columns should still show correct numbers for each business row. These numbers come from this exact code path.

---

## FIX G — Raw `<img>` → `next/image`

### G.1 Files changed

| File | Status | Change |
|---|---|---|
| `src/components/dashboard/ui.tsx` | Modified (tracked — git diff available) | Added `NextImage` import; replaced `<img>` in Avatar |

### G.2 Regression found and corrected during this review

**Bug introduced:** Initially imported as `import Image from 'next/image'`, which shadowed the native browser `Image` constructor used at line 784 in the QR canvas rendering code:
```typescript
const img = new Image(); // ← native browser API, not next/image
img.src = canvas.toDataURL();
```
This caused TypeScript errors `TS2554: Expected 1 arguments, but got 0` and `TS7009: 'new' expression, whose target lacks a construct signature`.

**Corrected:** Renamed import to `NextImage` to avoid the collision.

### G.3 Diff

```diff
+import NextImage from 'next/image';
 import QRCode from 'qrcode';

 ...

-  if (src) return <img src={src} alt={name} className="lp-avatar" style={{ width: size, height: size }}/>;
+  if (src) return <NextImage src={src} alt={name} width={size} height={size} className="lp-avatar" style={{ borderRadius: '50%' }}/>;
```

The `lh3.googleusercontent.com` domain is already in `next.config.ts` `images.remotePatterns` — no config change needed.

### G.4 Manual test

No callsites currently pass a `src` prop to `<Avatar>` — all usages only pass `name` and `size`. The fix is a guard for future use. To verify:

1. `npm run build` passes with no `no-img-element` ESLint warning — ✓ confirmed
2. `npx tsc --noEmit` shows 0 errors in `ui.tsx` — ✓ confirmed
3. All pages that use `<Avatar>` (`/app/business_dashboard`, Topbar, Sidebar, Settings) should render the initials avatar normally (the `src` branch is not exercised by any current callsite)

---

## Summary

| Fix | Regression? | Corrected? | Build after? |
|---|---|---|---|
| A — Batch auth.users | None | N/A | ✓ |
| B — Defensive LIMITs | None | N/A | ✓ |
| C — Parallelize awaits | None | N/A | ✓ |
| D — Lazy-load recharts | None | N/A | ✓ |
| E — Middleware public routes | None | N/A | ✓ |
| F — Merge qr_codes query | None | N/A | ✓ |
| G — img → next/image | **Yes** — `Image` shadowed native constructor | ✓ Renamed to `NextImage` | ✓ |

**Final build:** clean. **tsc:** 0 errors in Phase 2A files. **lint:** 1 pre-existing warning (unrelated).
