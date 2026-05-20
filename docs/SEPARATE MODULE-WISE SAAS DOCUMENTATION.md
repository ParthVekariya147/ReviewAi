SEPARATE MODULE-WISE SAAS DOCUMENTATION
# AI Review Generator SaaS

---

# MODULE 1 — MARKETING WEBSITE DOCUMENTATION

# Purpose
Public SaaS marketing website for:
- Product branding
- SEO
- User acquisition
- Pricing showcase
- Signup/login

---

# Main Routes

```txt
/
/features
/pricing
/about
/contact
/login
/signup
/privacy
/terms
/faq
```

---

# Main Components

- Navbar
- HeroSection
- FeaturesGrid
- PricingCards
- Testimonials
- FAQAccordion
- Footer
- AuthForms

---

# Tech Requirements

## Frontend
- Next.js App Router
- Tailwind CSS
- shadcn/ui

---

# SEO Requirements

- Metadata API
- OpenGraph tags
- Structured schema
- Sitemap
- Robots.txt

---

# Performance Rules

- Use server components
- Lazy load sections
- Optimize images
- CDN assets

---

# APIs

```txt
POST /api/auth/login
POST /api/auth/signup
POST /api/contact
```

---

# Main Goal
Convert visitors into business-owner users.

================================================================================

# MODULE 2 — BUSINESS OWNER DASHBOARD DOCUMENTATION

# Purpose
Dashboard for local business owners.

---

# Main Routes

```txt
/dashboard
/dashboard/reviews
/dashboard/reviews/history
/dashboard/qr
/dashboard/analytics
/dashboard/billing
/dashboard/settings
/dashboard/notifications
```

---

# Main Features

- AI review generation
- QR management
- Analytics dashboard
- Subscription management
- Usage tracking

---

# Dashboard Widgets

- QR scans
- Generated reviews
- Refresh count
- Copy count
- Redirect count
- Usage limit

---

# APIs

```txt
GET /api/dashboard/stats
POST /api/reviews/generate
POST /api/reviews/refresh
POST /api/reviews/copy
GET /api/qr/list
GET /api/analytics
POST /api/billing/checkout
```

---

# Database Tables

- businesses
- generated_reviews
- qr_codes
- qr_scans
- analytics_events
- subscriptions

---

# Main UI Components

- Sidebar
- DashboardCards
- AnalyticsCharts
- ReviewCards
- QRPreview
- BillingCards

---

# Security Rules

- Business-owner auth required
- Tenant isolation
- Protected APIs

---

# Main Goal
Help businesses manage reviews and analytics.

================================================================================

# MODULE 3 — ADMIN PANEL DOCUMENTATION

# Purpose
Platform management system.

---

# Main Routes

```txt
/admin
/admin/businesses
/admin/qr
/admin/revenue
/admin/analytics
/admin/ai
/admin/logs
/admin/settings
```

---

# Main Features

- Manage businesses
- Manage subscriptions
- Revenue analytics
- AI usage monitoring
- QR management
- Abuse monitoring

---

# Dashboard Metrics

- Total businesses
- Active subscriptions
- Monthly revenue
- QR scans
- AI requests
- Platform growth

---

# APIs

```txt
GET /api/admin/dashboard
GET /api/admin/businesses
PUT /api/admin/business/suspend
GET /api/admin/revenue
GET /api/admin/ai-usage
```

---

# Database Tables

- businesses
- users
- subscriptions
- invoices
- analytics_events
- audit_logs

---

# Admin Security

- Admin-only middleware
- Role validation
- Audit logging

---

# Main Goal
Operate and monitor the full SaaS platform.

================================================================================

# MODULE 4 — CUSTOMER QR REVIEW FUNNEL DOCUMENTATION

# Purpose
Public review generation flow.

NO LOGIN REQUIRED.

---

# Main Routes

```txt
/r/[token]
/r/[token]/reviews
/r/[token]/success
```

---

# Funnel Flow

QR Scan
↓
Landing Page
↓
Rating Selection
↓
AI Review Suggestions
↓
Copy Review
↓
Google Redirect
↓
Thank You Page

---

# Main Features

- Mobile-first UI
- 3 AI-generated reviews
- Copy review
- Refresh review
- Google redirect

---

# APIs

```txt
POST /api/public/scan
POST /api/public/generate
POST /api/public/refresh
POST /api/public/copy
POST /api/public/redirect
```

---

# Analytics Events

- qr_scan
- review_generate
- review_refresh
- review_copy
- google_redirect

---

# Main Goal
Generate maximum Google reviews with minimum friction.

================================================================================

# MODULE 5 — BACKEND & DATABASE DOCUMENTATION

# Purpose
Core SaaS backend system.

---

# Backend Stack

- Next.js API Routes
- Supabase
- PostgreSQL
- Gemini API

---

# Main Systems

- Authentication
- Subscription system
- QR system
- Analytics engine
- AI review engine
- Admin permissions

---

# Main Database Tables

```txt
users
businesses
subscriptions
payments
invoices
qr_codes
qr_scans
generated_reviews
analytics_events
audit_logs
```

---

# Important Rule

Every tenant table must contain:

```txt
business_id
```

---

# Authentication System

## Roles
- admin
- business_owner

---

# Security Requirements

- JWT auth
- Row Level Security
- API validation
- Rate limiting
- CSRF protection
- Abuse detection

---

# Payment Gateway

## Recommended
- Lemon Squeezy
OR
- Paddle

---

# Analytics Engine

Track everything:

- QR scans
- Review generation
- Refresh count
- Copy count
- Redirect count
- Subscription events
- AI usage

---

# Main Goal
Provide scalable production-ready SaaS infrastructure.

================================================================================

# RECOMMENDED DEVELOPMENT ORDER

# Phase 1
Marketing Website

---

# Phase 2
Authentication System

---

# Phase 3
Business Dashboard

---

# Phase 4
Customer Review Funnel

---

# Phase 5
QR System

---

# Phase 6
Analytics Engine

---

# Phase 7
Subscription & Billing

---

# Phase 8
Admin Panel

---

# Phase 9
Security + Optimization

================================================================================

# FINAL ARCHITECTURE GOAL

Build a:
- Multi-tenant
- AI-powered
- Subscription-based
- QR analytics-driven
- Enterprise-scalable SaaS platform
for US + Europe markets.

