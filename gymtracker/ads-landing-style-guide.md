# VT Gym Tracker Ads — Style Guide

Full reference for design tokens and component classes used on the `/ads` landing page.

---

## Design Tokens

All tokens are defined as CSS custom properties on `:root`.

### Color

| Token | Value | Usage |
|---|---|---|
| `--maroon` | `#861F41` | Primary brand color, links, accents |
| `--maroon-dark` | `#5c1530` | Hover state for maroon elements |
| `--maroon-deep` | `#3a0d1e` | Hero/nav/footer backgrounds |
| `--orange` | `#E87722` | CTAs, highlights, eyebrows |
| `--orange-dark` | `#c4611a` | Hover state for orange elements |
| `--bg` | `#f8f5f2` | Page background, alternating sections |
| `--surface` | `#ffffff` | Cards, inputs, elevated surfaces |
| `--border` | `#e8e3de` | Default borders |
| `--border-strong` | `#d0c9c3` | Form inputs, emphasized borders |
| `--text` | `#1a1614` | Primary body text |
| `--text-mid` | `#4a4240` | Secondary text, form labels |
| `--muted` | `#7a7270` | Captions, hints, placeholders |

### Typography

| Token | Value |
|---|---|
| `--font-display` | `'Bebas Neue', sans-serif` |
| `--font-body` | `'Plus Jakarta Sans', system-ui, sans-serif` |

Both fonts load from Google Fonts. Always declare `font-family: var(--font-body)` on `body` and apply `var(--font-display)` only to headings and stat values.

### Type Scale

| Role | Size | Weight | Font |
|---|---|---|---|
| Hero h1 | `clamp(3rem, 8vw, 6rem)` | 400 (Bebas) | Display |
| Section title | `2.75rem` | 400 (Bebas) | Display |
| Format card name | `1.5rem` | 400 (Bebas) | Display |
| Tier button label | `1.1rem` | 400 (Bebas) | Display |
| Hero stat value | `2.5rem` | 400 (Bebas) | Display |
| Body / base | `16px` | 400 | Body |
| Section sub | `1rem` | 400 | Body |
| Feature title | `0.9375rem` | 700 | Body |
| Form label | `0.8125rem` | 600 | Body |
| Caption / hint / muted | `0.8rem–0.875rem` | 400–500 | Body |
| Eyebrow / section label | `0.75rem` | 700 | Body |

Eyebrow labels are always `text-transform: uppercase` with `letter-spacing: 0.14em`.

### Spacing

Vertical section padding is `72px 0`. Internal component gaps use `8px`, `12px`, `16px`, `20px`, or `24px`. Use `rem` for vertical rhythm between components and `px` for internal element gaps.

### Border Radius

The app and admin use squared-off surfaces. All borders use `border-radius: 0` — no rounding on buttons, inputs, cards, or badges.

---

## Layout

### `.container`

```css
max-width: 1080px;
margin: 0 auto;
padding: 0 24px;
```

The single layout wrapper. Use on every section's direct child.

### `.section`

```css
padding: 72px 0;
```

Base section class. Combine with modifiers:

| Class | Effect |
|---|---|
| `.section` | Transparent background (shows `--bg`) |
| `.section-alt` | `background: var(--surface)` — white |
| `.section-dark` | `background: var(--maroon-deep)` — dark maroon |

Sections alternate `.section` → `.section-alt` → `.section` → `.section-alt` → `.section-dark` down the page.

### `.section-header`

```css
margin-bottom: 44px;
```

Wraps `.section-label` + `.section-title` + `.section-sub` at the top of each section.

---

## Typography Components

### `.section-label`

Eyebrow text above section titles.

```css
font-size: 0.75rem;
font-weight: 700;
letter-spacing: 0.14em;
text-transform: uppercase;
color: var(--orange);
margin-bottom: 10px;
```

### `.section-title`

```css
font-family: var(--font-display);
font-size: 2.75rem;
letter-spacing: 0.03em;
color: var(--text);
line-height: 1;
margin-bottom: 12px;
```

Modifier `.on-dark` overrides color to `#fff` for use on dark backgrounds.

### `.section-sub`

```css
font-size: 1rem;
color: var(--muted);
max-width: 520px;
line-height: 1.7;
```

---

## Navigation

### `.nav`

```css
position: sticky;
top: 0;
z-index: 100;
background: var(--maroon-deep);
border-bottom: 1px solid rgba(255,255,255,0.08);
```

### `.nav-inner`

```css
display: flex;
align-items: center;
justify-content: space-between;
padding: 14px 0;
```

### `.nav-logo`

Bebas Neue, `1.25rem`, `letter-spacing: 0.08em`, white. No underline on hover — use `opacity: 0.85` instead.

### `.nav-links a`

`0.875rem`, weight 500, `rgba(255,255,255,0.6)`. On hover: `color: #fff`. Hidden below `600px`.

---

## Hero

### `.hero`

```css
background: var(--maroon-deep);
padding: 72px 0 0;
overflow: hidden;
position: relative;
```

The `::before` pseudo-element adds a radial glow in the top-right: `radial-gradient(circle, rgba(134,31,65,0.5) 0%, transparent 70%)`.

### `.hero-eyebrow`

Same rules as `.section-label` — orange, uppercase, tracked.

### `.hero h1`

```css
font-family: var(--font-display);
font-size: clamp(3rem, 8vw, 6rem);
line-height: 0.95;
letter-spacing: 0.02em;
color: #fff;
max-width: 680px;
margin-bottom: 24px;
```

Use `<em>` inside for orange accent text: `color: var(--orange); font-style: normal`.

### `.hero-sub`

```css
font-size: 1.0625rem;
color: rgba(255,255,255,0.65);
max-width: 480px;
margin-bottom: 36px;
line-height: 1.7;
```

### `.hero-stats`

Four-column grid pinned to the bottom of the hero, separated by a top border and thin column dividers. Collapses to two columns below `640px`.

```css
display: grid;
grid-template-columns: repeat(4, 1fr);
border-top: 1px solid rgba(255,255,255,0.1);
margin-top: 56px;
```

### `.hero-stat-val` / `.hero-stat-label`

Value: Bebas Neue, `2.5rem`, white. Label: `0.8125rem`, weight 500, `rgba(255,255,255,0.5)`.

---

## Buttons

### `.btn-primary`

Orange filled button. Used for the main hero CTA.

```css
background: var(--orange);
color: #fff;
font-weight: 700;
font-size: 0.9375rem;
padding: 13px 26px;
border-radius: 0;
```

Hover: `background: var(--orange-dark)`, `transform: translateY(-1px)`.

### `.btn-ghost`

Outlined, for use on dark backgrounds only.

```css
color: rgba(255,255,255,0.7);
border: 1px solid rgba(255,255,255,0.2);
font-weight: 500;
font-size: 0.9375rem;
padding: 13px 22px;
border-radius: 0;
```

Hover: `color: #fff`, `border-color: rgba(255,255,255,0.5)`.

### `.btn-contact`

Maroon filled. Used inside the wizard CTA box.

```css
background: var(--maroon);
color: #fff;
font-weight: 700;
font-size: 0.9375rem;
padding: 12px 24px;
border-radius: 0;
```

Hover: `background: var(--maroon-dark)`, `transform: translateY(-1px)`.

### `.btn-email`

Orange filled. Used in the contact section.

```css
background: var(--orange);
color: #fff;
font-weight: 700;
font-size: 1rem;
padding: 14px 28px;
border-radius: 0;
```

Hover: `background: var(--orange-dark)`.

---

## Cards

### `.format-card`

```css
background: var(--bg);
border: 1px solid var(--border);
border-radius: 0;
overflow: hidden;
```

Used in a three-column `auto-fit, minmax(260px, 1fr)` grid. Each card has a `.format-card-preview` (white background, border-bottom) and `.format-card-info` (padding `18px 20px`).

**`.format-card-name`** — Bebas Neue, `1.5rem`, `var(--maroon)`.

**`.format-card-desc`** — `0.875rem`, `var(--muted)`, `line-height: 1.6`.

### `.feature-card`

```css
background: var(--bg);
border: 1px solid var(--border);
border-radius: 0;
padding: 24px;
```

Used in a two-column grid. Each card contains a `.feature-icon`, `.feature-title`, and `.feature-desc`.

**`.feature-icon`** — `36×36px`, `border-radius: 0`, `background: rgba(134,31,65,0.1)`, flex-centered. SVG icons are `18×18px` with `stroke: #861F41`.

**`.feature-title`** — `0.9375rem`, weight 700, `var(--text)`.

**`.feature-desc`** — `0.875rem`, `var(--muted)`, `line-height: 1.65`.

---

## Wizard

### `.wizard-grid`

Two-column layout: form on the left, preview on the right.

```css
display: grid;
grid-template-columns: 1fr 300px;
gap: 40px;
align-items: start;
```

Collapses to single column below `800px`.

### Tier Buttons (`.tier-btn`)

Three-column grid with equal widths.

```css
padding: 10px 0;
text-align: center;
border: 1.5px solid var(--border-strong);
border-radius: 0;
background: var(--surface);
font-family: var(--font-display);
font-size: 1.1rem;
letter-spacing: 0.06em;
color: var(--muted);
```

Each button contains a `<span>` subtitle: body font, `0.75rem`, weight 500.

**Active state** (`.tier-btn.active`):
```css
border-color: var(--maroon);
background: var(--maroon);
color: #fff;
/* span color: rgba(255,255,255,0.75) */
```

### Form Elements

**`.form-label`**
```css
font-size: 0.8125rem;
font-weight: 600;
color: var(--text-mid);
margin-bottom: 7px;
letter-spacing: 0.01em;
```

**`.form-input`**
```css
width: 100%;
padding: 10px 14px;
border: 1px solid var(--border-strong);
border-radius: 0;
font-size: 0.9375rem;
background: var(--surface);
color: var(--text);
```

Focus ring: `border-color: var(--maroon)`, `box-shadow: 0 0 0 3px rgba(134,31,65,0.1)`.

Placeholder color: `#b5afaa`.

**`.form-hint`** — `0.8rem`, `var(--muted)`, `margin-top: 5px`.

**`.image-group-hidden`** — `display: none`. Applied to the image URL group when Text tier is active.

### `.wizard-cta-box`

```css
margin-top: 32px;
padding: 22px;
background: rgba(134,31,65,0.05);
border: 1px solid rgba(134,31,65,0.15);
border-radius: 0;
```

Inner `<p>`: `0.9rem`, `var(--text-mid)`, `line-height: 1.65`.

---

## Ad Preview

### `.preview-pane`

```css
position: sticky;
top: 84px;
```

Sticky offset accounts for the nav height (`~56px`) plus buffer.

### `.preview-device`

Simulates an app chrome frame.

```css
background: var(--bg);
border: 1px solid var(--border);
border-radius: 0;
padding: 16px;
overflow: hidden;
```

**`.preview-device-bar`** — flex row, `margin-bottom: 12px`. Contains `.preview-device-title` (weight 700, `0.8125rem`, `var(--text-mid)`) and three `.preview-device-dot` circles (`6×6px`, `var(--border-strong)`).

### `.preview-card`

```css
background: var(--surface);
border: 1px solid var(--border);
border-radius: 0;
overflow: hidden;
```

**Image wrap** — `.preview-card-img-wrap`: `overflow: hidden`, gradient placeholder background. Height is `80px` for Banner, `120px` for Feature.

**Body** — `.preview-card-body`: `padding: 14px 16px`.

**Sponsor row** — `.preview-sponsor-row`: flex, `gap: 7px`, `margin-bottom: 6px`. Contains optional `.preview-logo-img` (`20×20px`, `border-radius: 0`) and `.preview-sponsor-name` (`0.8125rem`, weight 500, `var(--muted)`).

**Headline** — `.preview-headline`: `1rem`, weight 700, `var(--text)`, `line-height: 1.3`.

**Subline** — `.preview-subline`: `0.8125rem`, `var(--muted)`, `margin-bottom: 10px`.

**CTA** — `.preview-cta`: `0.8125rem`, weight 700, `var(--orange)`. Always append `↗` character.

**Caption** — `.preview-label`: `0.75rem`, `var(--muted)`, centered, `margin-top: 10px`.

---

## Contact Section

Centered content inside `.contact-inner` (max-width `560px`, `margin: 0 auto`, `text-align: center`). Built on `.section-dark`.

`.contact-note` — `0.875rem`, `rgba(255,255,255,0.4)`, `margin-top: 16px`.

---

## Footer

### `.footer`

```css
padding: 28px 0;
border-top: 1px solid rgba(255,255,255,0.08);
background: var(--maroon-deep);
```

### `.footer-inner`

Flex row, `justify-content: space-between`, wraps at small sizes.

**`.footer-copy`** — `0.8125rem`, `rgba(255,255,255,0.35)`.

**`.footer-links a`** — `0.8125rem`, `rgba(255,255,255,0.45)`. Hover: `rgba(255,255,255,0.8)`, no underline.

---

## Responsive Breakpoints

| Breakpoint | Change |
|---|---|
| `≤ 800px` | `.wizard-grid` collapses to single column |
| `≤ 720px` | `.formats-grid` collapses to single column |
| `≤ 640px` | `.features-grid` collapses to single column; `.hero-stats` collapses to 2 columns |
| `≤ 600px` | `.nav-links` hidden |
