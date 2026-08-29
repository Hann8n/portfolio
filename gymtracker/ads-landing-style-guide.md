# Gym Tracker Web — Style Guide

Design reference for the public Gym Tracker pages: the app landing page (`/`) and the ads landing page (`/ads`). Both share one design language, derived from the privacy policy page (`public/docs/privacy-policy.html`).

> The `/admin` dashboard is intentionally exempt — it keeps its own dark tool aesthetic.

---

## Design Principles

1. **Typography-first.** No display fonts. System-ui everywhere, generous whitespace, plain bold headings.
2. **Document-like simplicity.** A single centered column, hairline dividers between sections, no alternating background blocks.
3. **Restrained color.** Neutral text on white; maroon/orange VT accents only for links, CTAs, and small highlights.
4. **Light and dark, always.** Every page supports automatic dark mode. Never hardcode light-only colors.

---

## Design Tokens

All tokens are CSS custom properties on `:root`, overridden by `.dark-theme` and by the `prefers-color-scheme: dark` media query (see Dark Mode below).

### Color

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--bg-color` | `#ffffff` | `#1a1a1a` | Page background, inputs |
| `--text-color` | `#333333` | `#e0e0e0` | Primary text |
| `--text-mid` | `#555555` | `#b3b3b3` | Secondary text |
| `--muted` | `#767676` | `#8a8a8a` | Captions, hints, placeholders, footer links |
| `--link-color` | `#c95a7a` | `#c95a7a` | Inline links (VT maroon-light) |
| `--link-hover-color` | `#E5751F` | `#E5751F` | Link/button hover (VT burnt orange) |
| `--vt-maroon` | `#861F41` | `#861F41` | Primary CTA fill |
| `--maroon-dark` | `#6d1936` | `#9d3a58` | CTA hover |
| `--maroon-tint` | `rgba(134,31,65,0.08)` | `rgba(201,90,122,0.16)` | Tier active state, ad CTA strip fill |
| `--cta-fg` | `var(--vt-maroon)` | `#c95a7a` | Foreground on tinted surfaces |
| `--border` | `#e5e5e5` | `#2e2e2e` | Hairlines, card borders |
| `--border-strong` | `#d4d4d4` | `#3a3a3a` | Inputs, ghost buttons, toggles |
| `--surface` | `#ffffff` | `#242424` | Cards, callouts, ad preview |

### Typography

Single stack, no webfonts:

```css
font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

| Role | Size | Weight | Letter-spacing |
|---|---|---|---|
| `h1` | `clamp(2rem, 5vw, 2.5rem)` | 700 | `-0.02em` |
| `h2` | `clamp(1.4rem, 4vw, 1.8rem)` | 600 | `-0.01em` |
| Card `h3` | `1.05rem` | 700 | — |
| Body | `16px`, line-height `1.65` | 400 | — |
| Small / muted notes | `0.8125–0.875rem` | 400 | — |
| Form labels | `0.8125rem` | 600 | — |
| Stat values | `1.5rem` | 700 | — |

Do not use uppercase eyebrows, letter-spaced display type, or `text-transform` on headings.

### Border Radius

Rounded to match the privacy page's softer feel:

| Element | Radius |
|---|---|
| Cards, callouts, ad preview | `12px` |
| Buttons, inputs, tier toggle | `8px` |
| Small logos inside preview header | `4px` |

---

## Dark Mode

Copy this mechanism exactly on every page. Inline script in `<head>`, before any CSS:

```html
<script>
  if (localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark-theme');
  }
</script>
```

CSS: define light values on `:root`, then override twice — once for the explicit class, once for the OS preference:

```css
.dark-theme { /* dark token values */ }
@media (prefers-color-scheme: dark) {
  :root:not(.light-theme):not(.dark-theme) { /* same dark token values */ }
}
```

Also set `color-scheme: light dark` on `:root` so native controls (file inputs, scrollbars) follow the theme. There is no visible toggle; a `localStorage.theme` value (`'dark'`) acts as a manual override.

---

## Layout

### `.container`

```css
max-width: 840px;   /* 1060px at ≥ 1024px */
margin: 0 auto;
padding: 0 20px;
```

The home page uses a narrower leading-edge column instead (max-width `560px`, edge padding `clamp(24px, 6vw, 64px)`).

### Sections

```css
main > section { padding: 44px 0; }
main > section + section { border-top: 1px solid var(--border); }
```

Sections are separated by hairlines, not background swaps. The hero is the first section and gets extra top padding: `padding-top: clamp(40px, 8vw, 64px)`.

### Back link (`.back-link`)

No page chrome — the privacy page has no header, and neither do these pages. Sub-pages start with a quiet back link above the `h1`:

```html
<a href="/" class="back-link">&larr; Back</a>
```

`display: inline-block`, `0.875rem`, `color: var(--muted)`, `margin-bottom: 24px`; hover follows the global link rule (`--link-hover-color`).

### Footer (`.footer`)

Identical markup on every page. `border-top: 1px solid var(--border)`, `padding: 20px 0`, with a `.footer-inner` wrapper (centered column, `14px` gap; edge padding matches each page's content). Two rows:

- `.footer-social` — four icon links (Website, LinkedIn, GitHub, Bluesky), same SVGs as the privacy page. `40px` circular hit areas, `18px` icons with `fill: currentColor`, `color: var(--muted)`, hover `--link-hover-color` + `translateY(-2px)`.
- `.footer-links` — text links (`Advertise`, `Privacy`): `0.875rem`, `var(--muted)`, hover `--link-hover-color`.

On desktop (≥ 1024px) `.footer-inner` becomes a row: social left, text links right.

---

## Components

### Buttons

**`.btn-primary`** — solid maroon, white text:

```css
background: var(--vt-maroon);
color: #fff;
font-weight: 600;
font-size: 0.9375rem;
padding: 12px 22px;
border-radius: 8px;
```

Hover: `background: var(--maroon-dark)` (color stays `#fff`).

**`.btn-ghost`** — outlined, for secondary actions:

```css
color: var(--text-color);
border: 1px solid var(--border-strong);
font-weight: 500;
font-size: 0.9375rem;
padding: 12px 18px;
border-radius: 8px;
```

Hover: `border-color: var(--muted)`.

### Stat row (`.hero-stats`)

Flex row (`gap: 40px`, wraps), borderless and muted. Each `.hero-stat` is a column: bold `1.5rem` value over a `0.8125rem` muted label.

### Format cards (`.formats-grid` / `.format-card`)

Three-column grid (`repeat(3, 1fr)`, gap `16px`, single column ≤ 640px). Card: `var(--surface)` bg, `1px solid var(--border)`, radius `12px`, `padding: 20px`. Contains `h3`, one muted `<p>`, and a `dl.format-specs` (`dt` weight 600 in `--text-color`, `dd` in `--text-mid`, `0.8125rem`). No image placeholders — the wizard below demonstrates formats live.

### Form elements

**`.form-label`** — `0.8125rem`, weight 600, `var(--text-color)`, `6px` bottom margin. Optional suffixes use `<span class="opt">` (weight 400, muted).

**`.form-input`**

```css
padding: 10px 12px;
border: 1px solid var(--border-strong);
border-radius: 8px;
font-size: 0.9375rem;
font-family: inherit;
background: var(--bg-color);
color: var(--text-color);
```

Focus: `border-color: var(--link-color)` + `box-shadow: 0 0 0 3px rgba(201,90,122,0.15)`. Placeholder: `var(--muted)` at 70% opacity.

**`.form-hint`** — `0.8rem`, muted, `5px` top margin.

**Hidden-able groups** (`#imageFieldWrap`) animate via `max-height` + `opacity` transitions; the `.image-field-hidden` class collapses to zero.

### Tier toggle (`.tier-toggle` / `.tier-btn`)

Flex row inside a `1px solid var(--border-strong)` container, radius `8px`, overflow hidden. Buttons: flex 1, `10px 16px`, weight 500, `var(--muted)`, separated by `1px solid var(--border)`. Active: `background: var(--maroon-tint)`, `color: var(--cta-fg)`, weight 600.

### Ad preview (`.preview`)

Simulates the in-feed sponsored card. Stack: `.preview-section-header` (logo + uppercase sponsor title + "Sponsored"), optional image (`.preview-img-wrap` with fixed inline height — `140px` banner, `220px` feature; `.preview-img-placeholder` when no image), `.preview-img-divider`, then `.preview-body` (or `.preview-text-inner` for the text tier) containing `.preview-copy-stack` (`.preview-headline` bold, `.preview-subline` muted) and `.preview-cta-wrap` (tinted strip: `background: var(--maroon-tint)`, `color: var(--cta-fg)`, radius `8px`, `↗` arrow suffix).

Card chrome: `var(--surface)`, `1px solid var(--border)`, radius `12px`, overflow hidden. The preview is rebuilt from JS on every input — keep the class names stable.

---

## Responsive Breakpoints

| Breakpoint | Change |
|---|---|
| `≤ 800px` | `.wizard-grid` collapses to one column; preview pane un-sticks |
| `≤ 640px` | `.formats-grid` single column; `.hero-stats` gap tightens to `24px` |
| `≥ 1024px` | `.container` widens to `1060px`; `.contact-cols` splits into two columns; wizard preview column grows to `340px`; footer becomes a row |

---

## Content Rules

- One `h1` per page, in `--text-color` (no dark hero blocks, no glows).
- Keep the hero to: h1, one subline, two actions, stat row.
- Metrics come from the operator (installs, impressions, DAU) — keep them in the hero stat row only, not repeated per section.
- Never fabricate data. Only real operator metrics appear (installs, impressions, DAU); anything unmeasured gets left out entirely.
