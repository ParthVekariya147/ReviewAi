# Admin Panel Design Brief
## Reevo AI Review SaaS — Super-Admin Surface

---

## 1. Product Context

Reevo is a multi-tenant SaaS platform that helps local businesses collect genuine Google reviews. Customers scan a QR code, get an AI-generated review suggestion, copy it, and are redirected to Google. The platform has three surfaces:

1. **Marketing website** — public, `/(marketing)/` routes
2. **Business dashboard** — authenticated business owners, `/app/business_dashboard/`
3. **Admin panel** — this brief, internal only, `/admin/`, super-admin role required

The admin panel exists to let platform operators monitor all businesses, subscriptions, scan activity, and abuse patterns — without touching the business-owner UI.

---

## 2. Brand Tokens (extracted from code)

### Source files
- `src/app/globals.css` — CSS custom properties (primary token source)
- `tailwind.config.ts` — Tailwind color + spacing + typography scale

### Color Tokens

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--accent` | `#6E5BFF` | `#6E5BFF` | Primary CTAs, active states |
| `--accent-2` | `#2F7DFB` | `#2F7DFB` | Gradient endpoint, charts |
| `--accent-soft` | `#EDE9FF` | `#1B1A3C` | Chip backgrounds, tag fills |
| `--accent-ink` | `#2A1F8F` | `#C8C1FF` | Text on accent-soft |
| `--bg` | `#FFFFFF` | `#07080F` | Page background |
| `--bg-tint` | `#F7F7FB` | `#0B0C16` | Sidebar background |
| `--bg-soft` | `#FAFAFC` | `#0E0F1B` | Row hover, card fill |
| `--surface` | `#FFFFFF` | `#11121F` | Cards, panels |
| `--surface-2` | `#F4F4F8` | `#181A2A` | Nested surfaces, table rows |
| `--border` | `#ECECF1` | `#20223A` | Default borders |
| `--border-strong` | `#E1E1EA` | `#2A2D48` | Table separators |
| `--ink` | `#0A0A14` | `#F4F5FB` | Primary text |
| `--ink-2` | `#2A2A38` | `#C9CAD8` | Secondary text |
| `--muted` | `#6A6A7B` | `#8B8CA0` | Placeholder, captions |
| `--muted-2` | `#9494A4` | `#5F6178` | Disabled states |

### Tailwind Semantic Colors (tailwind.config.ts)

| Name | Value | Usage |
|------|-------|-------|
| `primary` | `#630ed4` | Tailwind primary class |
| `primary-container` | `#7c3aed` | Filled button bg |
| `secondary` | `#0051d5` | Tailwind secondary |
| `secondary-container` | `#316bf3` | Secondary button bg |
| `surface` | `#faf8ff` | Tailwind surface |
| `background` | `#faf8ff` | Page bg |
| `error` | `#ba1a1a` | Destructive actions |
| `on-primary` | `#ffffff` | Text on primary |
| `outline` | `#7b7487` | Form borders |

### Typography

| Token | Family | Size | Weight | Line-height |
|-------|--------|------|--------|-------------|
| `--font-sans` | Geist | — | — | — |
| `--font-mono` | Geist Mono | — | — | — |
| `display-lg` | Inter (Tailwind) | 48px | 700 | 1.1 |
| `headline-lg` | Inter (Tailwind) | 32px | 600 | 1.2 |
| `headline-md` | Inter (Tailwind) | 24px | 600 | 1.3 |
| `body-lg` | Inter (Tailwind) | 18px | 400 | 1.6 |
| `body-md` | Inter (Tailwind) | 16px | 400 | 1.6 |
| `label-md` | Inter (Tailwind) | 14px | 500 | 1.4 |
| `label-sm` | Inter (Tailwind) | 12px | 600 | 1.2 |

> Note: `globals.css` uses Geist as the runtime font via `--font-sans`. Tailwind config declares Inter. Design should use **Geist** to match the live app.

### Radius Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-xs` | 6px | Badges, chips, tags |
| `--radius-sm` | 8px | Inputs, small cards |
| `--radius-md` | 12px | Cards, panels |
| `--radius-lg` | 18px | Modals, drawers |
| `--radius-xl` | 24px | Large surfaces |
| `--radius-2xl` | 32px | Hero-level containers |

### Shadow Scale

| Token | Value |
|-------|-------|
| `--shadow-xs` | `0 1px 2px rgba(15,15,30,0.04)` |
| `--shadow-sm` | `0 1px 2px rgba(15,15,30,0.05), 0 2px 6px rgba(15,15,30,0.04)` |
| `--shadow-md` | `0 6px 16px -6px rgba(15,15,30,0.10), 0 2px 6px rgba(15,15,30,0.05)` |
| `--shadow-lg` | `0 28px 60px -24px rgba(40,30,120,0.20), 0 12px 28px -16px rgba(15,15,30,0.10)` |

### Accent Gradient
```css
background: linear-gradient(135deg, #6E5BFF 0%, #2F7DFB 100%);
```
Use on stat card highlights, active sidebar item backgrounds, chart fills.

### Dark Mode
Activated via `data-theme="dark"` on `<html>`. Design both modes — dark is supported by the token system already.

---

## 3. Data Model Summary

Source: `database/001_initial_schema.sql`

### Tables

#### `public.businesses`
| Field | Type | Notes |
|-------|------|-------|
| `id` | uuid PK | |
| `owner_id` | uuid FK → auth.users | Supabase auth user |
| `name` | text NOT NULL | Business display name |
| `tagline` | text | Optional tagline |
| `google_link` | text | Google review URL |
| `brand_color` | text | Default `#6E5BFF` |
| `logo_initials` | text | 2-char initials, default `BZ` |
| `min_rating_for_google` | int | 1–5, default 4 |
| `language` | text | Default `en` |
| `plan` | text | `free` \| `starter` \| `pro` \| `enterprise` |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | Auto-updated via trigger |

Also has runtime fields from `src/app/api/businesses/route.ts`:
- `business_type` (text)
- `review_keywords` (text)
- `review_platforms` (jsonb array)
- `onboarding_complete` (boolean)

#### `public.qr_codes`
| Field | Type | Notes |
|-------|------|-------|
| `id` | uuid PK | |
| `business_id` | uuid FK → businesses | |
| `token` | text UNIQUE | URL-safe token for `/r/[token]` |
| `campaign_name` | text | |
| `status` | text | `draft` \| `live` \| `paused` |
| `dynamic` | boolean | Default true |
| `ab_testing` | boolean | Default false |
| `pause_fallback` | boolean | Default false |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

#### `public.qr_scans`
| Field | Type | Notes |
|-------|------|-------|
| `id` | uuid PK | |
| `qr_id` | uuid FK → qr_codes | |
| `device` | text | `mobile` \| `tablet` \| `desktop` |
| `country` | text | ISO country code |
| `scanned_at` | timestamptz | |

#### `public.generated_reviews`
| Field | Type | Notes |
|-------|------|-------|
| `id` | uuid PK | |
| `qr_id` | uuid FK → qr_codes | |
| `rating` | int | 1–5 CHECK constraint |
| `ai_text` | text | AI-generated review content |
| `refreshes` | int | Times user refreshed draft |
| `copies` | int | Times user copied text |
| `status` | text | `generated` (default) |
| `created_at` | timestamptz | |

#### `public.analytics_events`
| Field | Type | Notes |
|-------|------|-------|
| `id` | uuid PK | |
| `qr_id` | uuid FK → qr_codes (nullable) | |
| `business_id` | uuid FK → businesses (nullable) | |
| `event_type` | text | See event funnel below |
| `device` | text | |
| `country` | text | |
| `meta` | jsonb | Flexible payload (e.g. `draft_index`) |
| `created_at` | timestamptz | |

**Event funnel:** `scan → generate → refresh → copy → redirect → complete`
`meta.draft_index` on `copy` events = 0 (first draft) or 1 (second draft)

#### `public.subscriptions`
| Field | Type | Notes |
|-------|------|-------|
| `id` | uuid PK | |
| `business_id` | uuid FK → businesses UNIQUE | One subscription per business |
| `plan` | text | `free` \| `starter` \| `pro` \| `enterprise` |
| `status` | text | `active` \| `canceled` \| `past_due` \| `trialing` |
| `provider` | text | e.g. `paddle`, `stripe` (not yet wired) |
| `provider_id` | text | External subscription ID |
| `current_period_end` | timestamptz | Billing period end |
| `cancel_at_end` | boolean | Scheduled to cancel |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

#### `public.invoices`
| Field | Type | Notes |
|-------|------|-------|
| `id` | uuid PK | |
| `subscription_id` | uuid FK → subscriptions | |
| `business_id` | uuid FK → businesses | |
| `amount_cents` | int | Amount in cents |
| `currency` | text | Default `usd` |
| `status` | text | `paid` \| `open` \| `void` \| `uncollectible` |
| `provider_inv_id` | text | External invoice ID |
| `pdf_url` | text | PDF download link |
| `created_at` | timestamptz | |

#### `public.audit_logs`
| Field | Type | Notes |
|-------|------|-------|
| `id` | uuid PK | |
| `actor_id` | uuid FK → auth.users (nullable) | Who did the action |
| `action` | text | e.g. `business.suspended`, `plan.changed` |
| `target_type` | text | e.g. `business`, `subscription` |
| `target_id` | uuid | ID of the affected row |
| `meta` | jsonb | Additional context |
| `created_at` | timestamptz | |

### Relationships
```
auth.users (Supabase)
  └── 1:1 businesses (owner_id)
        ├── 1:N qr_codes
        │     ├── 1:N qr_scans
        │     └── 1:N generated_reviews
        ├── 1:N analytics_events (business_id)
        ├── 1:1 subscriptions
        │     └── 1:N invoices
        └── audit_logs (target_id → business.id)
```

### Plan Limits (src/lib/billing/plans.ts)
| Plan | Reviews/mo | Scans/mo | Campaigns |
|------|-----------|---------|-----------|
| `free` | 100 | 500 | 2 |
| `starter` | 500 | 2,000 | 5 |
| `pro` | 2,500 | 10,000 | 10 |
| `enterprise` | unlimited | unlimited | unlimited |

---

## 4. Module Specs

### Module 1 — Dashboard (Overview)

**Purpose:** Platform-wide health at a glance. First screen admin sees after login.

**Data sources:** Aggregate queries across `businesses`, `subscriptions`, `analytics_events`, `qr_scans`, `generated_reviews`

#### Stat Cards (top row)
| Card | Metric | Source |
|------|--------|--------|
| Total Businesses | COUNT(businesses) | businesses |
| Active Subscriptions | COUNT(subscriptions WHERE status='active') | subscriptions |
| Paid Businesses | COUNT(subscriptions WHERE plan != 'free') | subscriptions |
| Scans Today | COUNT(qr_scans WHERE scanned_at >= today) | qr_scans |
| Reviews Generated Today | COUNT(generated_reviews WHERE created_at >= today) | generated_reviews |
| Copy Rate | COUNT(copy events) / COUNT(generate events) % | analytics_events |

Each card shows: current value + 7-day delta (↑/↓ + %).

#### Charts
- **Daily scans (30d)** — line chart, `qr_scans.scanned_at` grouped by day
- **Plan distribution** — donut chart, businesses grouped by `subscriptions.plan`
- **Event funnel** — horizontal bar chart, scan→generate→copy→complete counts

#### Recent Activity Feed
- Last 20 `audit_logs` entries: actor email, action, target, timestamp
- Inline badges for action type: `suspended` (red), `plan.changed` (purple), `business.created` (green)

#### Filters
- Date range selector (7d / 30d / 90d)

---

### Module 2 — Businesses Management

**Purpose:** Full list of all registered businesses. View, suspend, change plan, inspect QR campaigns.

**Data source:** `businesses` JOIN `subscriptions` JOIN `auth.users`

#### List View

| Column | Source field | Sortable | Filterable |
|--------|-------------|---------|-----------|
| Business Name | `businesses.name` | ✓ | Text search |
| Owner Email | `auth.users.email` | ✓ | Text search |
| Plan | `subscriptions.plan` | ✓ | free / starter / pro / enterprise |
| Status | `subscriptions.status` | ✓ | active / canceled / past_due |
| QR Campaigns | COUNT(qr_codes) | ✓ | — |
| Total Scans | SUM(qr_scans) | ✓ | — |
| Created | `businesses.created_at` | ✓ | Date range |
| Actions | — | — | View / Suspend / Change Plan |

- **Search:** business name + owner email (single search box)
- **Bulk actions:** Export CSV, Bulk suspend
- **Pagination:** 25 rows/page
- **Empty state:** "No businesses match your filters"

#### Detail View (Business Profile)

Tabs:
1. **Overview** — stat cards: total scans, reviews generated, copy rate, active campaigns
2. **QR Campaigns** — table of `qr_codes`: campaign_name, token, status (draft/live/paused), scans count, created_at. Actions: View live, Pause, Archive
3. **Analytics** — line chart of scans over 30 days, event funnel breakdown, top countries (from `qr_scans.country`), device split (from `qr_scans.device`)
4. **Subscription** — current plan, `subscriptions.status`, `current_period_end`, `cancel_at_end` flag, `provider`/`provider_id`, invoice history table
5. **Audit Log** — `audit_logs` filtered by `target_id = business.id`

**Actions available:**
- Change plan (dropdown → confirm modal) — needs new API
- Suspend business (toggle → confirm modal) — needs new API
- Add admin note (stored in `audit_logs.meta`) — needs new API
- Impersonate / view as business owner — stretch goal, out of scope for v1

---

### Module 3 — Subscriptions & Billing

**Purpose:** Platform-wide subscription health, MRR tracking, plan change history.

**Data source:** `subscriptions` JOIN `businesses` JOIN `invoices`

#### List View

| Column | Source field | Sortable | Filterable |
|--------|-------------|---------|-----------|
| Business | `businesses.name` | ✓ | Text search |
| Plan | `subscriptions.plan` | ✓ | free / starter / pro / enterprise |
| Status | `subscriptions.status` | ✓ | active / canceled / past_due / trialing |
| Provider | `subscriptions.provider` | — | — |
| Provider ID | `subscriptions.provider_id` | — | — |
| Period End | `subscriptions.current_period_end` | ✓ | Date range |
| Cancel at End | `subscriptions.cancel_at_end` | — | boolean filter |
| Created | `subscriptions.created_at` | ✓ | — |

- **Search:** business name
- **Bulk actions:** Export CSV
- **Pagination:** 25 rows/page

#### Summary Bar (above table)
- MRR card: SUM of active paid subscriptions (estimated, needs pricing config — not in DB yet)
- Plan breakdown: count per plan tier
- Churn risk: count of `cancel_at_end = true`
- Past due: count of `status = 'past_due'`

#### Detail View (Subscription)
- Business info (name, owner email, plan)
- Subscription fields: status, provider, period end, cancel flag
- **Invoice History table:** `invoices` — amount_cents (formatted as $), currency, status, provider_inv_id, pdf_url (link), created_at
- **Actions:** Change plan (dropdown + confirm), Cancel subscription, Mark as paid (for manual overrides)

---

### Module 4 — Analytics & Abuse Monitoring

**Purpose:** Platform-wide scan patterns, funnel health, and abuse detection (bot scans, spam).

**Data source:** `analytics_events`, `qr_scans`, `generated_reviews`

#### Analytics Tab

**KPI Cards:**
| Card | Metric |
|------|--------|
| Total Scans (30d) | COUNT(qr_scans) |
| Total Reviews Generated (30d) | COUNT(generated_reviews) |
| Average Copy Rate (30d) | copy events / generate events |
| Average Completion Rate | complete events / scan events |
| Draft 1 vs Draft 2 acceptance | meta.draft_index breakdown |

**Charts:**
- Platform-wide scans over time (30d line chart)
- Country distribution (world heatmap or bar chart, `qr_scans.country`)
- Device split (donut: mobile / tablet / desktop, `qr_scans.device`)
- Event funnel (scan → generate → copy → redirect → complete, drop-off %)
- Top businesses by scan volume (bar chart, top 10)

**Filters:** Date range (7d / 30d / 90d), country, device

#### Abuse Monitoring Tab

**What to flag:**
- QR codes with >500 scans/hour (bot pattern)
- Businesses with >80% refresh rate (users refreshing without copying — low quality)
- QR codes with 0 copy events but >100 scans (engagement failure)
- Multiple scans from same IP in <1 min (needs `qr_scans` IP field — not in schema yet, call out in Section 8)

**Abuse Table:**
| Column | Source |
|--------|--------|
| Business Name | businesses.name |
| QR Campaign | qr_codes.campaign_name |
| Flag Type | derived (bot / low-quality / dead-funnel) |
| Scan Count | COUNT(qr_scans) |
| Copy Rate | % |
| Detected At | derived |
| Actions | Pause QR / Suspend Business / Dismiss |

**Audit Logs Tab:**
- Full `audit_logs` table: actor email, action, target_type + target_id (linked), meta preview, created_at
- Filters: action type, date range, actor
- Sortable by created_at desc

---

## 5. Layout & Shell

### Sidebar
- Width: 240px (expanded), 64px (collapsed)
- Toggle: collapse/expand button at bottom of sidebar
- Background: `--bg-tint`
- Border-right: `--border`

**Nav structure:**
```
[Logo + "Reevo Admin"]
─────────────────────
  Dashboard           /admin
  Businesses          /admin/businesses
  Subscriptions       /admin/subscriptions
  Analytics           /admin/analytics
  Abuse Monitoring    /admin/analytics?tab=abuse
  Audit Logs          /admin/analytics?tab=audit
─────────────────────
  [Admin user avatar]
  [Logout]
```

- Active item: accent-soft background (`--accent-soft`), left border `--accent` 2px
- Icons: react-icons (already installed), 20px
- Labels hidden in collapsed mode

### Topbar
- Height: 56px
- Background: `--surface`
- Border-bottom: `--border`
- Elements (left → right):
  - Breadcrumb: `Admin / Businesses / Acme Corp`
  - Spacer
  - Global search (keyboard shortcut ⌘K)
  - Dark/Light toggle
  - Notification bell (future)
  - Admin avatar + dropdown (Profile, Logout)

### Main Content Area
```
[Topbar — 56px]
[Breadcrumb + Page Title + Action Button(s)]
[Content]
```
- Padding: 32px
- Max-width: 1240px (--container)
- Background: `--bg`

### Footer
- Minimal: "Reevo Admin · v1.0 · Internal only"
- Height: 40px, `--muted` text, `--border-top`

---

## 6. Component Inventory

All components built with Tailwind + CSS variables. No shadcn/ui is currently installed — components built from scratch matching the existing app style.

| Component | Type | Notes |
|-----------|------|-------|
| StatCard | New | Icon, value, label, delta badge (↑↓%), accent gradient variant |
| DataTable | New | Sticky header, sortable columns, row hover, checkbox select, pagination |
| TablePagination | New | Previous/Next + page numbers |
| FilterBar | New | Search input + dropdown filters + active filter chips |
| BulkActionBar | New | Appears above table when rows selected: action buttons + count |
| Badge / StatusBadge | New | `active` (green), `canceled` (red), `past_due` (amber), `draft` (muted), `live` (green), `paused` (amber) |
| PlanBadge | New | `free` (muted), `starter` (blue), `pro` (purple), `enterprise` (gradient) |
| Modal | New | Centered, backdrop blur, radius-lg, shadow-lg, confirm/cancel actions |
| Drawer | New | Right-side slide-in, 480px wide, for detail views |
| Toast | New | Bottom-right, success (green) / error (red) / info (blue), auto-dismiss 4s |
| LineChart | New | Daily scans/reviews, uses CSS variables for colors, no external charting lib or use recharts |
| DonutChart | New | Plan distribution, copy rate |
| BarChart | New | Top businesses, country breakdown |
| FunnelChart | New | Horizontal bars for event funnel drop-off |
| AvatarInitials | Reuse | Already in app — initials + color |
| Skeleton | New | Loading states for tables and cards |
| EmptyState | New | Illustration + message + optional CTA |
| ErrorState | New | Error icon + message + retry button |
| ConfirmDialog | New | "Are you sure?" modal for destructive actions |
| Breadcrumb | New | Topbar navigation trail |
| Tabs | New | Module detail view tabs |
| SearchInput | New | Global search with ⌘K trigger |
| DateRangePicker | New | 7d / 30d / 90d presets + custom range |
| DropdownMenu | New | Admin actions, topbar profile menu |
| Tooltip | New | Column header help text, truncated values |
| ProgressBar | New | Quota usage display |

---

## 7. Pages to Design (Stitch Deliverables)

Numbered in priority order. Design desktop-first (1280px). Include dark mode variants for pages 1–4.

| # | Page | Route | Notes |
|---|------|-------|-------|
| 1 | Login | `/admin/login` | Separate from business login. Email + password only. No Google OAuth. |
| 2 | Dashboard | `/admin` | Stat cards + 3 charts + activity feed |
| 3 | Businesses List | `/admin/businesses` | Full data table with filters, bulk actions |
| 4 | Business Detail | `/admin/businesses/[id]` | 5-tab detail view with Overview, Campaigns, Analytics, Subscription, Audit |
| 5 | Subscriptions List | `/admin/subscriptions` | Table with MRR summary bar above |
| 6 | Subscription Detail | `/admin/subscriptions/[id]` | Invoice history + plan + status |
| 7 | Analytics Overview | `/admin/analytics` | KPIs + charts grid |
| 8 | Abuse Monitoring | `/admin/analytics?tab=abuse` | Abuse flag table + rules |
| 9 | Audit Logs | `/admin/analytics?tab=audit` | Full audit log table with filters |
| 10 | 404 / Error | `/admin/404` | Error state page |

**Responsive variants needed:** Pages 1, 2, 3 (tablet 768px — sidebar collapses to icon-only)

**Dark mode variants needed:** Pages 1, 2, 3, 4

---

## 8. New Backend Work Required

Everything below must be built **before** the admin UI can be wired up. None of these exist in the current codebase.

### 8.1 Admin Role System (CRITICAL — nothing works without this)

**Missing:** No `role` field exists in any table. No admin gating in middleware.

**Required:**
- Add `role` field to `auth.users` via Supabase custom claims OR add an `admin_users` table:
  ```sql
  create table public.admin_users (
    id        uuid primary key references auth.users(id) on delete cascade,
    email     text not null,
    created_at timestamptz not null default now()
  );
  ```
- Update `src/middleware.ts` to protect `/admin/**` routes — check admin claim or admin_users membership
- Admin client (`createAdminClient`) bypasses RLS via service role key — already exists at `src/lib/supabase/admin.ts`

### 8.2 Admin API Routes (all new — none exist)

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/admin/stats` | Dashboard KPIs + charts data |
| GET | `/api/admin/businesses` | Paginated list with filters |
| GET | `/api/admin/businesses/[id]` | Single business detail + related data |
| PATCH | `/api/admin/businesses/[id]` | Change plan, suspend, add note |
| GET | `/api/admin/subscriptions` | Paginated subscription list |
| GET | `/api/admin/subscriptions/[id]` | Subscription + invoice history |
| PATCH | `/api/admin/subscriptions/[id]` | Override plan, cancel |
| GET | `/api/admin/analytics` | Platform-wide analytics aggregates |
| GET | `/api/admin/abuse` | Flagged QR codes / businesses |
| PATCH | `/api/admin/qr/[id]` | Pause/archive QR code |
| GET | `/api/admin/audit-logs` | Paginated audit log with filters |

All routes must:
1. Verify caller is in `admin_users` table (or has admin custom claim)
2. Use `createAdminClient()` (service role, bypasses RLS)
3. Write to `audit_logs` for all mutating actions

### 8.3 Missing Schema Fields

| Table | Missing Field | Needed For |
|-------|--------------|-----------|
| `qr_scans` | `ip_address` (text, hashed) | Abuse detection — bot scan patterns |
| `businesses` | `suspended_at` (timestamptz) | Suspension state |
| `businesses` | `suspended_reason` (text) | Admin suspension note |
| `subscriptions` | `mrr_cents` (int) | MRR calculation (or derive from plan + pricing config) |
| New table needed | `plan_prices` | Map plan name → price in cents for MRR |

### 8.4 Missing `audit_log` Writer

Currently `audit_logs` table exists but nothing writes to it. Need a server-side utility:
```ts
// src/lib/audit/log.ts
writeAuditLog(actorId, action, targetType, targetId, meta?)
```
Called by every admin API mutating endpoint.

### 8.5 No Billing Provider

`subscriptions.provider` + `provider_id` fields exist but are empty — Module 7 (Billing) is not started. Admin subscription management will be read-only until Module 7 is complete. Design the billing detail view but wire actions as disabled with a "Billing provider not configured" tooltip.

---

## 9. Out of Scope

The following are explicitly **not** part of this admin panel design:

- Marketing website pages (`/`, `/features`, `/pricing`, etc.)
- Business-owner dashboard (`/app/business_dashboard/**`)
- Customer QR funnel (`/r/[token]`)
- Onboarding flows
- Mobile-first / app-style layouts (admin is desktop-primary)
- Business owner self-service billing (that's Module 7, business dashboard)
- Multi-admin role hierarchy (just one admin level for v1)
- Real-time live dashboard (polling every 30s is sufficient for v1)
- Email notifications to admins
- CSV/PDF export (listed in brief template but not in scope for initial mockups)
