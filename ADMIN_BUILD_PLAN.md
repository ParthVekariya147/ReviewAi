# Reevo Admin Panel — Build Plan

> **Stack:** Next.js 15 App Router · TypeScript strict · Tailwind + CSS vars · Supabase (SSR + service role) · react-icons · SVG charts (no external lib)
> **Isolation rule:** zero admin imports leak into business-user app.
> **Audit rule:** every mutating admin API action writes to `audit_logs`.

---

## STEP 1 — Foundation ✅ DONE

**Goal:** Admin role system + middleware + server-side helpers.

### Files

| File | Purpose | Status |
|------|---------|--------|
| `database/012_admin_panel.sql` | admin_users table, suspension fields, plan_prices, indexes | ✅ Created |
| `src/middleware.ts` | Add admin_users table check for `/admin/**` routes | ⬜ |
| `src/lib/admin/auth.ts` | `requireAdmin()` — guards every admin API route | ⬜ |
| `src/lib/admin/audit.ts` | `writeAuditLog()` — called by every mutating endpoint | ⬜ |
| `src/lib/admin/permissions.ts` | Role capability map (super_admin / admin / support) | ⬜ |
| `src/types/admin.ts` | All admin-specific TypeScript types | ⬜ |

### Seed instruction (run after migration)
```sql
insert into public.admin_users (id, email, role)
select id, email, 'super_admin'
from auth.users where email = 'your-admin@email.com'
on conflict (id) do nothing;
```

---

## STEP 2 — Shell & Layout ⬜

**Goal:** Sidebar + topbar + admin login. Business-user app untouched.

### Files

| File | Purpose |
|------|---------|
| `src/app/admin/layout.tsx` | Root admin layout — renders sidebar + topbar |
| `src/app/admin/page.tsx` | Redirect → `/admin/dashboard` |
| `src/app/admin/(auth)/login/page.tsx` | Admin-only login (email + password, no Google) |
| `src/app/admin/_components/shell/sidebar.tsx` | 240px / 64px collapsed, nav items, logout |
| `src/app/admin/_components/shell/topbar.tsx` | Breadcrumbs, ⌘K search, theme toggle, avatar |
| `src/app/admin/_components/shell/breadcrumbs.tsx` | Breadcrumb trail component |

### Sidebar nav items
```
Dashboard       /admin/dashboard
Businesses      /admin/businesses
Subscriptions   /admin/subscriptions
Analytics       /admin/analytics
Abuse           /admin/analytics?tab=abuse
Audit Logs      /admin/analytics?tab=audit
Settings        /admin/settings
```

---

## STEP 3 — Dashboard (vertical slice) ⬜

**Goal:** Real data end-to-end. Stat cards + charts + activity feed.

### API routes

| Route | Returns |
|-------|---------|
| `GET /api/admin/stats` | 6 KPI cards with 7-day deltas |
| `GET /api/admin/stats/charts` | daily scans 30d, plan distribution, event funnel |

### UI files

| File | Purpose |
|------|---------|
| `src/app/admin/dashboard/page.tsx` | Dashboard page — fetches stats + charts |
| `src/app/admin/_components/cards/stat-card.tsx` | Icon, value, label, delta badge |
| `src/app/admin/_components/cards/chart-card.tsx` | Card wrapper for charts |
| `src/app/admin/_components/charts/line-chart.tsx` | Daily scans SVG line chart |
| `src/app/admin/_components/charts/donut-chart.tsx` | Plan distribution |
| `src/app/admin/_components/charts/bar-chart.tsx` | Top businesses, country breakdown |
| `src/app/admin/_components/charts/funnel-chart.tsx` | Horizontal funnel drop-off bars |

### KPI cards
| Card | Query |
|------|-------|
| Total Businesses | `COUNT(businesses)` |
| Active Subscriptions | `COUNT(subscriptions WHERE status='active')` |
| Paid Businesses | `COUNT(subscriptions WHERE plan != 'free')` |
| Scans Today | `COUNT(qr_scans WHERE scanned_at >= today)` |
| Reviews Generated Today | `COUNT(generated_reviews WHERE created_at >= today)` |
| Avg Copy Rate | `copy events / generate events %` |

---

## STEP 4 — Businesses Module ⬜

**Goal:** Full list + detail tabs. Every action logged.

### API routes

| Route | Purpose |
|-------|---------|
| `GET /api/admin/businesses` | Paginated list, search, filters |
| `GET /api/admin/businesses/[id]` | Detail + related counts |
| `PATCH /api/admin/businesses/[id]` | Suspend / change plan / add note |
| `GET /api/admin/businesses/[id]/activity` | Audit logs for this business |

### UI files

| File | Purpose |
|------|---------|
| `src/app/admin/businesses/page.tsx` | List — table, search, filters, bulk actions |
| `src/app/admin/businesses/[id]/page.tsx` | Detail — Overview tab |
| `src/app/admin/businesses/[id]/funnel/page.tsx` | QR campaigns tab |
| `src/app/admin/businesses/[id]/qr/page.tsx` | QR detail tab |
| `src/app/admin/businesses/[id]/activity/page.tsx` | Audit log tab |
| `src/app/admin/_components/tables/businesses-table.tsx` | Sortable, paginated table |
| `src/app/admin/_components/tables/data-table.tsx` | Generic reusable table |
| `src/app/admin/_components/badges/plan-badge.tsx` | free / starter / pro / enterprise chips |
| `src/app/admin/_components/badges/status-badge.tsx` | active / suspended / past_due chips |
| `src/app/admin/_components/modals/confirm-action-modal.tsx` | "Are you sure?" for suspend/plan change |

### List columns
Business name · Owner email · Plan · Status · QR campaigns · Total scans · Created · Actions

### Detail tabs
1. Overview — stat cards (scans, reviews, copy rate, campaigns)
2. QR Campaigns — table of qr_codes with pause/archive actions
3. Analytics — 30d scans chart + funnel + countries + devices
4. Subscription — plan, status, period end, invoice history
5. Audit Log — filtered audit_logs for this business

---

## STEP 5 — Subscriptions Module ⬜

**Goal:** Platform-wide billing health. MRR + plan breakdown.

### API routes

| Route | Purpose |
|-------|---------|
| `GET /api/admin/subscriptions` | Paginated list, filters |
| `GET /api/admin/subscriptions/[id]` | Detail + invoice history |
| `PATCH /api/admin/subscriptions/[id]` | Override plan / cancel (disabled if no billing provider) |

### UI files

| File | Purpose |
|------|---------|
| `src/app/admin/subscriptions/page.tsx` | List — MRR bar + table |
| `src/app/admin/subscriptions/invoices/page.tsx` | All invoices across platform |
| `src/app/admin/subscriptions/plans/page.tsx` | Plan config view |
| `src/app/admin/_components/tables/subscriptions-table.tsx` | Subscriptions table |

### MRR summary bar (above table)
MRR estimate · Plan breakdown · Churn risk count · Past due count

---

## STEP 6 — Analytics Module ⬜

**Goal:** Platform-wide scan patterns + abuse detection + audit log.

### API routes

| Route | Purpose |
|-------|---------|
| `GET /api/admin/analytics` | Platform KPIs + chart data |
| `GET /api/admin/abuse` | Flagged QR codes / businesses |
| `PATCH /api/admin/qr/[id]` | Pause or archive QR code |
| `GET /api/admin/audit-logs` | Paginated, filtered audit log |

### UI files

| File | Purpose |
|------|---------|
| `src/app/admin/analytics/page.tsx` | KPIs + charts (scans, countries, devices, funnel, top biz) |
| `src/app/admin/analytics/abuse/page.tsx` | Abuse flag table with actions |
| `src/app/admin/analytics/audit-logs/page.tsx` | Full audit log with filters |

### Abuse detection rules
| Flag | Condition |
|------|-----------|
| Bot pattern | QR code >500 scans/hour |
| Low quality | >80% refresh rate, low copy rate |
| Dead funnel | 0 copy events + >100 scans |

---

## STEP 7 — Settings Module ⬜

**Goal:** Admin user management + profile.

### API routes

| Route | Purpose |
|-------|---------|
| `GET/POST /api/admin/settings/admin-users` | List + invite admin users |
| `PATCH/DELETE /api/admin/settings/admin-users/[id]` | Update role / remove |

### UI files

| File | Purpose |
|------|---------|
| `src/app/admin/settings/page.tsx` | Settings index → redirect to admin-users |
| `src/app/admin/settings/admin-users/page.tsx` | Invite by email, set role, revoke |

---

## Shared component checklist

| Component | Used in |
|-----------|---------|
| `stat-card.tsx` | Dashboard, Business detail |
| `data-table.tsx` | All list views |
| `plan-badge.tsx` | Businesses, Subscriptions |
| `status-badge.tsx` | Businesses, Subscriptions, Audit |
| `confirm-action-modal.tsx` | Suspend, plan change, revoke |
| `line-chart.tsx` | Dashboard, Analytics, Business detail |
| `donut-chart.tsx` | Dashboard (plan dist), Analytics (device split) |
| `bar-chart.tsx` | Analytics (top biz, countries) |
| `funnel-chart.tsx` | Dashboard, Analytics, Business detail |
| Skeleton loaders | Every async page |
| Empty state | Every table with 0 rows |
| Error state | Every page on fetch failure |
| Toast | Every mutating action result |

---

## Rules (enforced on every file)

- `requireAdmin()` on every `/api/admin/**` route — no exceptions
- `writeAuditLog()` on every PATCH/POST/DELETE admin action
- `createAdminClient()` for all DB queries in admin routes (bypasses RLS)
- Pagination: `limit=25`, offset-based on list routes
- TypeScript: no `any` — use types from `src/types/admin.ts`
- Skeletons on every async UI — no raw loading spinners
- CSS variables only — no hardcoded hex colors
- Admin imports stay inside `src/app/admin/` and `src/app/api/admin/`
