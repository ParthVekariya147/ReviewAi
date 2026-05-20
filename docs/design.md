# ReviewAI — Marketing Website Design System

Design system for the **marketing website** (Module 1) only.
Not to be used for the business owner dashboard or admin panel.

---

## Brand Identity

- **Product name:** ReviewAI
- **Tagline:** AI-powered reputation management for local businesses
- **Personality:** Professional, modern, trustworthy, energetic
- **Logo mark:** `MdStars` icon inside a `bg-gradient-primary` rounded square (32×32px, `rounded-lg`)
- **Wordmark:** `Review` in `text-on-surface` + `AI` in `text-primary` (violet)

---

## Colors

All colors are defined in `tailwind.config.ts` and referenced via CSS utility classes.

### Core Palette

| Token | Hex | Usage |
|---|---|---|
| `primary` | `#630ed4` | Links, active states, badges, icon accents |
| `primary-container` | `#7c3aed` | Gradient start, icon backgrounds |
| `secondary` | `#0051d5` | Gradient end, secondary accents |
| `secondary-container` | `#316bf3` | Hover states |
| `background` | `#faf8ff` | Page background |
| `surface` | `#faf8ff` | Card/panel background |
| `surface-container-lowest` | `#ffffff` | Pure white — footer, card fills |
| `surface-container-low` | `#f2f3ff` | Input fields, subtle fills |
| `surface-container` | `#eaedff` | Hover backgrounds on nav items |
| `on-surface` | `#131b2e` | Primary text (headings, body) |
| `on-surface-variant` | `#4a4455` | Secondary text (subheadings, captions) |
| `outline` | `#7b7487` | Borders, dividers |
| `outline-variant` | `#ccc3d8` | Subtle borders, input outlines |
| `error` | `#ba1a1a` | Error states |
| `error-container` | `#ffdad6` | Error banners |
| `on-error-container` | `#93000a` | Error text on banners |

### Gradient

```css
/* bg-gradient-primary — primary CTA buttons, hero CTA block, logo bg */
background-image: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%);

/* text-gradient-primary — hero headline accent word */
background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```

**Use gradient on:**
- Primary CTA buttons (`Get Started`, `Sign Up`)
- CTA section background
- Logo mark background
- Dashboard preview card header accents

**Never use gradient on:** body text, nav links, secondary buttons, icons.

---

## Typography

Font family: **Inter** (Google Fonts, weights 400/500/600/700/900).

All type tokens are defined in `tailwind.config.ts` under `fontSize` and `fontFamily`.
Usage pattern: always pair `font-{token}` + `text-{token}` together.

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `display-lg` | 48px | 700 | 1.1 | -0.04em | Desktop hero headline |
| `display-lg-mobile` | 36px | 700 | 1.2 | -0.03em | Mobile hero, section titles |
| `headline-lg` | 32px | 600 | 1.2 | -0.02em | Section headings |
| `headline-md` | 24px | 600 | 1.3 | -0.01em | Card titles, feature names |
| `body-lg` | 18px | 400 | 1.6 | 0 | Hero subheading, section descriptions |
| `body-md` | 16px | 400 | 1.6 | 0 | Card body text, nav links |
| `label-md` | 14px | 500 | 1.4 | +0.01em | Buttons, nav links, form labels |
| `label-sm` | 12px | 600 | 1.2 | +0.05em | Badges, chips, captions |

### Usage Examples

```tsx
// Hero headline
<h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface">

// Section heading
<h2 className="font-headline-lg text-headline-lg text-on-surface">

// Card title
<h3 className="font-headline-md text-headline-md text-on-surface">

// Body paragraph
<p className="font-body-lg text-body-lg text-on-surface-variant">

// Button / Nav link
<span className="font-label-md text-label-md">

// Badge / Chip
<span className="font-label-sm text-label-sm">
```

---

## Spacing Scale

Defined in `tailwind.config.ts` under `spacing`. Use these tokens — avoid raw pixel values.

| Token | Value | Use |
|---|---|---|
| `base` | 4px | Micro gaps (icon padding) |
| `xs` | 8px | Tight gaps between inline elements |
| `sm` | 16px | Internal card padding, stack gaps |
| `md` | 24px | Section inner padding, card padding |
| `lg` | 40px | Section vertical rhythm |
| `xl` | 64px | Section padding top/bottom |
| `gutter` | 24px | Column gap in grids |
| `margin-mobile` | 16px | Horizontal page margin on mobile |
| `margin-desktop` | 48px | Horizontal page margin on desktop |
| `max-width` | 1280px | Max content container width |

### Page Layout Pattern

```tsx
<section className="py-xl px-margin-mobile md:px-margin-desktop">
  <div className="max-w-max-width mx-auto">
    {/* content */}
  </div>
</section>
```

---

## Border Radius

| Class | Value | Use |
|---|---|---|
| `rounded` | 4px | Small badges, input checkboxes |
| `rounded-lg` | 8px | Buttons, nav items, small cards |
| `rounded-xl` | 12px | Icon containers, feature card inner elements |
| `rounded-2xl` | 16px | Cards, panels |
| `rounded-3xl` | 24px | CTA section, large hero containers |
| `rounded-full` | 9999px | Badge pills, avatar circles |

---

## Components

### Navbar

```tsx
// Sticky glassmorphism header
<header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-[rgba(99,14,212,0.08)] shadow-[0_1px_0_0_rgba(15,23,42,0.06)]">
```

- Height: auto (~56px with `py-3.5`)
- Logo: gradient square icon + wordmark
- Nav links: `text-on-surface-variant` → `text-on-surface` on hover, `bg-surface-container` hover bg
- Active link: `text-primary` + `bg-primary-container/10` + `font-semibold`
- Primary CTA: `bg-gradient-primary` button with hover lift
- Mobile: hamburger collapses to full-width vertical menu

### Buttons

**Primary (gradient)**
```tsx
className="font-label-md text-label-md bg-gradient-primary text-white px-8 py-4 rounded-lg shadow-sm hover:shadow-md transition-all transform hover:-translate-y-0.5 font-semibold"
```

**Secondary (ghost/outline)**
```tsx
className="font-label-md text-label-md bg-white border border-outline/40 text-on-surface px-8 py-4 rounded-lg hover:border-primary/30 hover:bg-primary-container/5 transition-colors"
```

**Inverse (white on gradient bg)**
```tsx
className="font-label-md text-label-md bg-white text-primary px-8 py-4 rounded-lg hover:shadow-md transition-all transform hover:-translate-y-0.5 font-semibold"
```

- Minimum height: 52px (`py-4`)
- Always `transition-all` for smooth hover
- Hover lift: `hover:-translate-y-0.5`

### Cards (glass-card)

Defined as a utility class in `globals.css`:

```css
.glass-card {
  background-color: #ffffff;
  border: 1px solid rgba(99, 14, 212, 0.08);
  box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 4px 16px -4px rgba(99, 14, 212, 0.08);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}
.glass-card:hover {
  box-shadow: 0 4px 12px 0 rgba(15, 23, 42, 0.08), 0 8px 24px -8px rgba(99, 14, 212, 0.12);
  transform: translateY(-1px);
}
```

Usage:
```tsx
<div className="glass-card rounded-xl p-md">
```

### Section Badges / Chips

Small pill badges used above section headings:

```tsx
<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container/10 text-primary font-label-sm text-label-sm border border-primary/20">
  <MdBolt className="text-[14px]" />
  <span>Core Capabilities</span>
</div>
```

### Icon Containers

Square rounded containers used in feature cards:

```tsx
// Standard (violet tint)
<div className="w-12 h-12 rounded-xl bg-primary-container/10 flex items-center justify-center">
  <Icon className="text-primary text-[24px]" />
</div>

// Small (for settings/list items)
<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
  <Icon className="text-[20px] text-primary" />
</div>
```

### Bento Grid (Features)

```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
  {/* wide card */}
  <div className="glass-card rounded-xl p-md md:col-span-2">
  {/* normal card */}
  <div className="glass-card rounded-xl p-md">
```

### CTA Section

Full-width gradient block at page bottom:

```tsx
<section className="px-margin-mobile md:px-margin-desktop py-xl">
  <div className="relative bg-gradient-primary rounded-3xl p-xl text-center overflow-hidden">
    {/* Decorative blobs */}
    <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
    <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
    {/* Content */}
  </div>
</section>
```

### Hero Background Effect

Blurred radial gradient blobs behind hero content:

```tsx
<div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-primary-container/20 blur-3xl opacity-50" />
<div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-secondary-container/20 blur-3xl opacity-30" />
```

### Footer

```tsx
<footer className="bg-surface-container-lowest border-t border-outline-variant/30 mt-auto">
  <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter px-margin-mobile md:px-margin-desktop py-xl max-w-max-width mx-auto">
```

- 4-column grid: Brand (col-span-2 on mobile) + 3 link groups
- Link color: `text-on-surface-variant` → `text-primary` hover

---

## Page-level Patterns

### Section Heading Block

Used at the top of every section:

```tsx
<div className="text-center mb-lg">
  {/* Badge */}
  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container/10 text-primary font-label-sm text-label-sm mb-4 border border-primary/20">
    <MdIcon className="text-[14px]" />
    <span>Section Label</span>
  </div>
  {/* Heading */}
  <h2 className="font-headline-lg text-headline-lg md:font-display-lg-mobile md:text-display-lg-mobile text-on-surface mb-sm">
    Section headline.
  </h2>
  {/* Subheading */}
  <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
    Supporting description text.
  </p>
</div>
```

### Auth Forms

Container pattern used on `/login` and `/signup`:

```tsx
<main className="min-h-screen bg-background flex items-center justify-center px-margin-mobile">
  <div className="w-full max-w-md glass-card rounded-2xl p-md md:p-lg">
    {/* Form content */}
  </div>
</main>
```

Input fields:
```tsx
className="w-full px-4 py-3 rounded-lg bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/50 transition-all"
```

---

## Icons

Library: `react-icons/md` (Material Design icons) throughout the marketing site.

Common icons:
- `MdStars` — logo mark
- `MdAutoAwesome` — AI/generation features
- `MdQrCodeScanner` / `MdQrCode2` — QR features
- `MdInsights` / `MdBarChart` — analytics
- `MdBolt` — speed/core capabilities badge
- `MdRocketLaunch` — CTA badge
- `MdPlayCircle` — Watch Demo button
- `MdMenu` / `MdClose` — mobile nav toggle
- `MdError` — error states in forms

Icon sizes: `text-[14px]` (badge), `text-[20px]` (button), `text-[24px]` (feature card), `text-[22px]` (nav)

---

## Responsive Breakpoints

Tailwind default breakpoints apply. Key patterns:

| Breakpoint | Behaviour |
|---|---|
| Mobile (default) | Single column, `px-margin-mobile` (16px), `text-display-lg-mobile` |
| `md` (768px+) | Multi-column grid, `px-margin-desktop` (48px), `text-display-lg` |

Never use `sm:` or `lg:` breakpoints — only `md:` for the two-state layout.

---

## Do / Don't

| Do | Don't |
|---|---|
| Use `bg-gradient-primary` for primary CTAs | Use solid `bg-primary` for primary buttons |
| Use `glass-card` for all content cards | Use custom box-shadow values |
| Use `text-gradient-primary` for one accent word in a headline | Apply gradient to full paragraphs |
| Keep section padding `py-xl` consistent | Mix different section padding values |
| Use `max-w-max-width mx-auto` for all content containers | Let content stretch beyond 1280px |
| Pair `font-{token}` + `text-{token}` together | Use one without the other |
| Use `rounded-lg` (8px) for buttons | Use `rounded-full` for rectangular buttons |
| Use Inter font only | Import or use any other typeface |
| Use `hover:-translate-y-0.5` on primary CTAs | Skip hover feedback on interactive elements |
