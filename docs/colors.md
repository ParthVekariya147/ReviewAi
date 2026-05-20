# ReviewAI — Color Reference

All colors used in the marketing website. Defined in `tailwind.config.ts`.

---

## Primary Colors

| Token | Hex | Use |
|---|---|---|
| `primary` | `#630ed4` | Nav active link, badge text, icon accent, "AI" in logo, link hover |
| `primary-container` | `#7c3aed` | Gradient start, icon container tint background |
| `primary-fixed` | `#eaddff` | Light tint surfaces |
| `primary-fixed-dim` | `#d2bbff` | Dimmed primary-fixed |
| `on-primary` | `#ffffff` | Text and icons on primary buttons |
| `on-primary-container` | `#ede0ff` | Text on primary-container backgrounds |
| `on-primary-fixed` | `#25005a` | Dark text on primary-fixed |
| `on-primary-fixed-variant` | `#5a00c6` | Variant text on primary-fixed |
| `inverse-primary` | `#d2bbff` | Inverted primary for dark mode prep |

---

## Secondary Colors

| Token | Hex | Use |
|---|---|---|
| `secondary` | `#0051d5` | Gradient end point, analytics icons, secondary accents |
| `secondary-container` | `#316bf3` | Hover states, active secondary elements |
| `secondary-fixed` | `#dbe1ff` | Light secondary background |
| `secondary-fixed-dim` | `#b4c5ff` | Dimmed secondary light |
| `on-secondary` | `#ffffff` | Text on secondary buttons |
| `on-secondary-container` | `#fefcff` | Text on secondary-container |
| `on-secondary-fixed` | `#00174b` | Dark text on secondary-fixed |
| `on-secondary-fixed-variant` | `#003ea8` | Variant dark on secondary-fixed |

---

## Tertiary Colors

| Token | Hex | Use |
|---|---|---|
| `tertiary` | `#7d3d00` | Warm accent (rarely used) |
| `tertiary-container` | `#a15100` | Tertiary container background |
| `tertiary-fixed` | `#ffdcc6` | Light warm background |
| `tertiary-fixed-dim` | `#ffb784` | Dimmed warm background |
| `on-tertiary` | `#ffffff` | Text on tertiary |
| `on-tertiary-container` | `#ffe0cd` | Text on tertiary-container |
| `on-tertiary-fixed` | `#301400` | Dark text on tertiary-fixed |
| `on-tertiary-fixed-variant` | `#713700` | Variant dark on tertiary-fixed |

---

## Surface & Background

| Token | Hex | Use |
|---|---|---|
| `background` | `#faf8ff` | Main page background (html + body) |
| `surface` | `#faf8ff` | Card base, same as background |
| `surface-bright` | `#faf8ff` | Brightest surface variant |
| `surface-container-lowest` | `#ffffff` | Pure white — footer, card fills |
| `surface-container-low` | `#f2f3ff` | Input field background, subtle panels |
| `surface-container` | `#eaedff` | Nav hover bg, chip fills |
| `surface-container-high` | `#e2e7ff` | Slightly darker container |
| `surface-container-highest` | `#dae2fd` | Strongest container shade |
| `surface-dim` | `#d2d9f4` | Dimmed surface for overlays |
| `surface-variant` | `#dae2fd` | Variant surface, dividers |
| `surface-tint` | `#732ee4` | Tint layer over surfaces |
| `inverse-surface` | `#283044` | Dark surface (dark mode prep) |
| `inverse-on-surface` | `#eef0ff` | Light text on inverse surface |

---

## Text Colors

| Token | Hex | Use |
|---|---|---|
| `on-surface` | `#131b2e` | Primary text — headings, body, labels |
| `on-surface-variant` | `#4a4455` | Secondary text — subheadings, captions, nav links |
| `on-background` | `#131b2e` | Text on page background (same as on-surface) |

---

## Outline & Border

| Token | Hex | Use |
|---|---|---|
| `outline` | `#7b7487` | Button borders, strong dividers |
| `outline-variant` | `#ccc3d8` | Subtle borders, input outlines, card borders |

---

## Error & Status

| Token | Hex | Use |
|---|---|---|
| `error` | `#ba1a1a` | Error text, error icon color |
| `error-container` | `#ffdad6` | Error banner background |
| `on-error` | `#ffffff` | Text on error-colored buttons |
| `on-error-container` | `#93000a` | Error message text inside banners |

---

## Gradients

Defined as custom utilities in `globals.css`.

### `bg-gradient-primary`
```css
background-image: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%);
```
**Used on:** Primary CTA buttons, logo mark background, CTA section block, dashboard header accents.

### `text-gradient-primary`
```css
background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
background-clip: text;
```
**Used on:** One accent word in the hero headline only. Never on full paragraphs.

---

## Glass Card

Custom utility class in `globals.css`. Used on all content cards.

```css
background-color: #ffffff;
border: 1px solid rgba(99, 14, 212, 0.08);   /* violet at 8% */
box-shadow:
  0 1px 3px 0 rgba(15, 23, 42, 0.06),
  0 4px 16px -4px rgba(99, 14, 212, 0.08);
```

Hover state:
```css
box-shadow:
  0 4px 12px 0 rgba(15, 23, 42, 0.08),
  0 8px 24px -8px rgba(99, 14, 212, 0.12);
transform: translateY(-1px);
```

---

## Quick Reference

| What | Token | Hex |
|---|---|---|
| Page background | `bg-background` | `#faf8ff` |
| Main heading text | `text-on-surface` | `#131b2e` |
| Subheading / muted text | `text-on-surface-variant` | `#4a4455` |
| Brand violet | `text-primary` | `#630ed4` |
| Primary CTA button | `bg-gradient-primary` | `#7c3aed → #2563eb` |
| Card background | `glass-card` | `#ffffff` + violet border |
| Input field background | `bg-surface-container-low` | `#f2f3ff` |
| Input focus border | `border-primary` | `#630ed4` |
| Nav hover background | `bg-surface-container` | `#eaedff` |
| Active nav link text | `text-primary` | `#630ed4` |
| Active nav link bg | `bg-primary-container/10` | `#7c3aed` at 10% |
| Error banner bg | `bg-error-container` | `#ffdad6` |
| Error banner text | `text-on-error-container` | `#93000a` |
| Footer background | `bg-surface-container-lowest` | `#ffffff` |
| Card / section border | `border-outline-variant` | `#ccc3d8` |
| Button border | `border-outline` | `#7b7487` |
