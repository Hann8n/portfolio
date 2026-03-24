/** Ads landing page — served at /ads. Public sales page with metrics and mockup wizard. */
export const ADS_LANDING_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
  <meta http-equiv="Pragma" content="no-cache">
  <title>Advertise on Gym Tracker | A small app. A specific audience. One ad slot.</title>
  <meta name="description" content="A few hundred Virginia Tech students use Gym Tracker to check McComas and War Memorial before they go. One ad slot in the main feed. If VT students are who you're trying to reach, it's a direct line.">
  <link rel="icon" href="/favicon/favicon.ico" sizes="any">
  <link rel="icon" href="/favicon/favicon-32x32.png" type="image/png" sizes="32x32">
  <link rel="icon" href="/favicon/favicon-16x16.png" type="image/png" sizes="16x16">
  <link rel="apple-touch-icon" href="/favicon/apple-touch-icon.png" sizes="180x180">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --maroon: #861F41;
      --maroon-dark: #5c1530;
      --maroon-deep: #3a0d1e;
      --orange: #E87722;
      --orange-dark: #c4611a;
      --bg: #f8f5f2;
      --surface: #ffffff;
      --border: #e8e3de;
      --border-strong: #d0c9c3;
      --text: #1a1614;
      --text-mid: #4a4240;
      --muted: #7a7270;
      --ad-cta-fill: rgba(134, 31, 65, 0.072);
      --font: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      --font-display: var(--font);
      --font-body: var(--font);
      --bp-narrow: 480px;
      --bp-mobile: 640px;
      --bp-tablet: 900px;
    }
    html { scroll-behavior: smooth; }
    body {
      font-family: var(--font-body);
      font-size: 16px;
      line-height: 1.65;
      color: var(--text);
      background: var(--bg);
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }
    a { color: var(--maroon); text-decoration: none; }
    a:hover { text-decoration: underline; }
    .container { max-width: 1080px; margin: 0 auto; padding: 0 clamp(16px, 5vw, 24px); }

    /* ── Nav ──────────────────────────────── */
    .nav {
      position: sticky; top: 0; z-index: 100;
      background: var(--maroon-deep);
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .nav-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      padding: 14px clamp(16px, 5vw, 24px);
    }
    .nav-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      font-family: var(--font-display);
      font-weight: 700;
      font-size: 1.25rem;
      letter-spacing: 0.08em;
      color: #fff;
    }
    .nav-logo:hover { text-decoration: none; opacity: 0.85; }
    .nav-logo-img {
      width: 40px;
      height: 40px;
      object-fit: contain;
    }
    .nav-links { display: flex; gap: 28px; }
    .nav-links a { font-size: 0.875rem; font-weight: 500; color: rgba(255,255,255,0.6); transition: color 0.15s; }
    .nav-links a:hover { color: #fff; text-decoration: none; }
    .nav-toggle {
      display: none;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      padding: 0;
      border: none;
      background: transparent;
      color: rgba(255,255,255,0.9);
      cursor: pointer;
      border-radius: 0;
      -webkit-tap-highlight-color: transparent;
    }
    .nav-toggle:hover { background: rgba(255,255,255,0.1); color: #fff; }
    .nav-toggle-icon {
      display: flex;
      flex-direction: column;
      gap: 6px;
      width: 20px;
    }
    .nav-toggle-icon span {
      display: block;
      height: 2px;
      background: currentColor;
      border-radius: 0;
      transition: transform 0.2s, opacity 0.2s;
    }
    .nav-toggle[aria-expanded="true"] .nav-toggle-icon span:nth-child(1) {
      transform: translateY(8px) rotate(45deg);
    }
    .nav-toggle[aria-expanded="true"] .nav-toggle-icon span:nth-child(2) {
      opacity: 0;
    }
    .nav-toggle[aria-expanded="true"] .nav-toggle-icon span:nth-child(3) {
      transform: translateY(-8px) rotate(-45deg);
    }
    @media (max-width: 640px) {
      .nav-toggle { display: flex; }
      .nav-links {
        display: none;
        flex-direction: column;
        width: 100%;
        gap: 0;
        padding-top: 8px;
        border-top: 1px solid rgba(255,255,255,0.1);
        margin-top: 8px;
        order: 10;
      }
      .nav-links a {
        padding: 14px 0;
        border-bottom: 1px solid rgba(255,255,255,0.06);
        font-size: 1rem;
      }
      .nav-links a:last-child { border-bottom: none; }
      .nav.nav-open .nav-links { display: flex; }
    }

    /* ── Hero ─────────────────────────────── */
    .hero {
      background: var(--maroon-deep);
      padding: clamp(40px, 8vw, 72px) 0 0;
      overflow: hidden;
      position: relative;
    }
    .hero::before {
      content: '';
      position: absolute;
      top: -80px; right: -120px;
      width: 480px; height: 480px;
      background: radial-gradient(circle, rgba(134,31,65,0.5) 0%, transparent 70%);
      pointer-events: none;
    }
    .hero-content { position: relative; z-index: 1; }
    .hero-eyebrow {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--orange);
      margin-bottom: 16px;
    }
    .hero h1 {
      font-family: var(--font-display);
      font-weight: 700;
      font-size: clamp(3rem, 8vw, 6rem);
      line-height: 0.95;
      letter-spacing: 0.02em;
      color: #fff;
      max-width: 680px;
      margin-bottom: 24px;
      overflow-wrap: break-word;
    }
    .hero h1 em { color: var(--orange); font-style: normal; }
    .hero-sub {
      font-size: 1.0625rem;
      color: rgba(255,255,255,0.65);
      max-width: 480px;
      margin-bottom: 36px;
      line-height: 1.7;
    }
    .hero-actions { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
    .btn-primary {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 13px 26px;
      background: var(--orange);
      color: #fff;
      font-weight: 700;
      font-size: 0.9375rem;
      border-radius: 0;
      border: none; cursor: pointer;
      text-decoration: none;
      transition: background 0.15s, transform 0.1s;
    }
    .btn-primary:hover { background: var(--orange-dark); text-decoration: none; transform: translateY(-1px); }
    .btn-ghost {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 13px 22px;
      color: rgba(255,255,255,0.7);
      font-weight: 500;
      font-size: 0.9375rem;
      border-radius: 0;
      border: 1px solid rgba(255,255,255,0.2);
      text-decoration: none;
      transition: all 0.15s;
    }
    .btn-ghost:hover { color: #fff; border-color: rgba(255,255,255,0.5); text-decoration: none; }
    .hero-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      border-top: 1px solid rgba(255,255,255,0.1);
      margin-top: 56px;
    }
    @media (max-width: 640px) { .hero-stats { grid-template-columns: repeat(2, 1fr); } }
    .hero-stat {
      padding: clamp(16px, 4vw, 28px) clamp(16px, 4vw, 20px);
      border-right: 1px solid rgba(255,255,255,0.1);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    .hero-stat:nth-child(2n) { border-right: none; }
    @media (min-width: 641px) {
      .hero-stat:nth-child(2) { border-right: 1px solid rgba(255,255,255,0.1); }
      .hero-stat:nth-child(3) { border-right: none; }
    }
    .hero-stat-val {
      font-family: var(--font-display);
      font-weight: 700;
      font-size: 2.5rem;
      letter-spacing: 0.02em;
      color: #fff;
      line-height: 1;
      margin-bottom: 6px;
    }
    .hero-stat-label {
      font-size: 0.8125rem;
      color: rgba(255,255,255,0.5);
      font-weight: 500;
      line-height: 1.3;
      max-width: 10em;
      overflow-wrap: break-word;
    }
    .hero-stat-note {
      grid-column: 1 / -1;
      font-size: 0.75rem;
      color: rgba(255,255,255,0.4);
      margin: 0;
      padding: 16px 20px 0;
      border-top: 1px solid rgba(255,255,255,0.06);
      text-align: center;
      line-height: 1.5;
    }

    /* ── Sections ─────────────────────────── */
    .section { padding: clamp(48px, 10vw, 72px) 0; }
    .section-alt { background: var(--surface); }
    .section-dark { background: var(--maroon-deep); }
    .section-label {
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--orange);
      margin-bottom: 10px;
    }
    .section-title {
      font-family: var(--font-display);
      font-weight: 700;
      font-size: 2.75rem;
      letter-spacing: 0.03em;
      color: var(--text);
      line-height: 1;
      margin-bottom: 12px;
      overflow-wrap: break-word;
    }
    .section-title.on-dark { color: #fff; }
    .section-sub {
      font-size: 1rem;
      color: var(--muted);
      max-width: 520px;
      line-height: 1.7;
    }
    .section-header { margin-bottom: clamp(32px, 6vw, 44px); }

    /* ── Formats ──────────────────────────── */
    .formats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    @media (max-width: 640px) {
      .formats-grid { grid-template-columns: 1fr; gap: 16px; }
      .format-card-preview { min-height: 100px; padding: 16px; }
    }
    .format-card {
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 0;
      overflow: hidden;
    }
    .format-card-preview {
      padding: 20px;
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      min-height: 120px;
      display: flex;
      align-items: stretch;
    }
    .format-preview-text {
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 6px;
      padding: 12px;
      border-radius: 0;
      border: 1px solid var(--border);
      background: var(--bg);
    }
    .format-preview-banner {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 0;
      border-radius: 0;
      border: 1px solid var(--border);
      overflow: hidden;
      background: var(--bg);
    }
    .format-preview-img {
      height: 70px;
      background: linear-gradient(135deg, var(--border) 0%, var(--border-strong) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .format-preview-img span { font-size: 11px; color: var(--muted); font-weight: 500; }
    .format-preview-body { padding: 10px 12px; display: flex; flex-direction: column; gap: 4px; }
    .fph { width: 60%; height: 8px; background: var(--border-strong); border-radius: 0; }
    .fps { width: 45%; height: 6px; background: var(--border); border-radius: 0; }
    .fpc { width: 32%; height: 6px; background: var(--orange); border-radius: 0; opacity: 0.6; margin-top: 4px; }
    .format-preview-feature .format-preview-img { height: 110px; }
    .format-card-info { padding: 18px 20px; }
    .format-card-name {
      font-family: var(--font-display);
      font-weight: 700;
      font-size: 1.5rem;
      letter-spacing: 0.04em;
      color: var(--maroon);
      margin-bottom: 4px;
    }
    .format-card-desc { font-size: 0.875rem; color: var(--muted); line-height: 1.6; }
    .format-specs {
      margin-top: 14px;
      padding-top: 12px;
      border-top: 1px solid var(--border);
      font-size: 0.8125rem;
      color: var(--text-mid);
      line-height: 1.65;
    }
    .format-specs dt {
      font-weight: 600;
      color: var(--text);
      margin-top: 8px;
    }
    .format-specs dt:first-child { margin-top: 0; }
    .format-specs dd { margin: 2px 0 0; }

    /* ── Exclusive callout ─────────────────────────────────── */
    .exclusive-callout {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 24px;
      align-items: center;
      padding: 32px;
      background: var(--maroon-deep);
      border-radius: 0;
      margin-bottom: 16px;
    }
    @media (max-width: 640px) {
      .exclusive-callout {
        grid-template-columns: 1fr;
        padding: 24px;
        gap: 20px;
      }
    }
    @media (max-width: 480px) {
      .exclusive-callout { padding: 20px; gap: 16px; }
    }
    .exclusive-tag {
      display: inline-block;
      font-size: 0.6875rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--orange);
      margin-bottom: 12px;
    }
    .exclusive-headline {
      font-family: var(--font-display);
      font-weight: 700;
      font-size: 2.25rem;
      letter-spacing: 0.03em;
      color: #fff;
      line-height: 1;
      margin-bottom: 12px;
      overflow-wrap: break-word;
    }
    .exclusive-desc {
      font-size: 0.9375rem;
      color: rgba(255,255,255,0.6);
      line-height: 1.65;
      max-width: 420px;
    }
    .exclusive-right { flex-shrink: 0; }
    .exclusive-stat-row {
      display: flex;
      align-items: stretch;
      gap: 0;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 0;
      overflow: hidden;
    }
    @media (max-width: 480px) {
      .exclusive-stat-row { flex-direction: column; }
      .exclusive-stat-divider { width: 100%; height: 1px; background: rgba(255,255,255,0.1); }
    }
    .exclusive-stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 20px 28px;
      background: rgba(255,255,255,0.04);
    }
    @media (max-width: 480px) {
      .exclusive-stat { padding: 16px 20px; }
      .exclusive-stat-num { font-size: 2rem; }
    }
    .exclusive-stat-divider {
      width: 1px;
      background: rgba(255,255,255,0.1);
    }
    .exclusive-stat-num {
      font-family: var(--font-display);
      font-weight: 700;
      font-size: 2.5rem;
      color: #fff;
      letter-spacing: 0.04em;
      line-height: 1;
    }
    .exclusive-stat-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: rgba(255,255,255,0.45);
      text-align: center;
      white-space: nowrap;
    }

    /* ── Feature cards ─────────────────────────────────────── */
    .features-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 16px;
    }
    @media (max-width: 640px) { .features-grid { grid-template-columns: 1fr; } }
    .feature-card {
      padding: 24px;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 0;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .feature-card-tag {
      display: inline-block;
      align-self: flex-start;
      font-size: 0.6875rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--text-mid);
      background: rgba(74,66,64,0.08);
      padding: 4px 10px;
      border-radius: 0;
    }
    .feature-title {
      font-weight: 700;
      font-size: 1rem;
      color: var(--text);
      line-height: 1.35;
      overflow-wrap: break-word;
    }
    .feature-desc {
      font-size: 0.875rem;
      font-weight: 400;
      color: var(--muted);
      line-height: 1.65;
    }

    /* ── Peaks timeline ────────────────────────────────────── */
    .peaks-card {
      padding: 24px;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 0;
      margin-bottom: 16px;
    }
    @media (max-width: 480px) {
      .peaks-card { padding: 16px; }
    }
    .peaks-header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      flex-wrap: wrap;
      margin-bottom: 20px;
      gap: 12px;
    }
    .peaks-title {
      font-weight: 700;
      font-size: 0.9375rem;
      color: var(--text);
    }
    .peaks-note {
      font-size: 0.8rem;
      color: var(--muted);
    }
    .peaks-track-wrap {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      margin-bottom: 8px;
    }
    .peaks-track {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      gap: 4px;
      min-width: 320px;
    }
    .peaks-bar-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }
    .peaks-bar {
      width: 100%;
      border-radius: 0;
      background: var(--border);
      transition: background 0.2s;
    }
    .peaks-bar.peak { background: var(--maroon); }
    .peaks-bar.off-peak { background: var(--border-strong); opacity: 0.6; }
    .peaks-bar.summer { background: var(--border); opacity: 0.4; }
    .peaks-month {
      font-size: 0.625rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--muted);
    }
    .peaks-legend {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-top: 12px;
    }
    .peaks-legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem;
      color: var(--muted);
    }
    .peaks-legend-dot {
      width: 10px;
      height: 10px;
      border-radius: 0;
    }

    /* ── Social proof ──────────────────────────────────────── */
    .social-proof {
      margin-bottom: 16px;
    }
    .social-proof-label {
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--muted);
      margin-bottom: 12px;
    }
    .social-quotes {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }
    @media (max-width: 640px) { .social-quotes { grid-template-columns: 1fr; } }
    .social-quote {
      padding: 16px 18px;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 0;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .social-quote-text {
      font-size: 0.9375rem;
      color: var(--text);
      line-height: 1.5;
      font-style: italic;
      overflow-wrap: break-word;
    }
    .social-quote-text::before { content: '\\201C'; color: var(--maroon); font-style: normal; font-weight: 700; margin-right: 1px; }
    .social-quote-text::after  { content: '\\201D'; color: var(--maroon); font-style: normal; font-weight: 700; margin-left: 1px; }
    .social-quote-source {
      font-size: 0.75rem;
      color: var(--muted);
      font-weight: 600;
    }

    /* ── Proof strip ───────────────────────────────────────── */
    .proof-strip {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }
    @media (max-width: 640px) { .proof-strip { grid-template-columns: 1fr; } }
    .proof-item {
      padding: 20px;
      border: 1px solid var(--border);
      border-radius: 0;
      background: var(--bg);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .proof-icon {
      width: 32px;
      height: 32px;
      border-radius: 0;
      background: rgba(134,31,65,0.07);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .proof-icon svg { width: 15px; height: 15px; }
    .proof-title {
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--text);
    }
    .proof-desc {
      font-size: 0.8125rem;
      color: var(--muted);
      line-height: 1.55;
    }

    /* ── Wizard (matches admin editor grid) ───────────────────────────── */
    .wizard-grid { display: grid; grid-template-columns: 1fr minmax(280px, 393px); gap: 20px; align-items: start; min-width: 0; }
    .admin-form { display: flex; flex-direction: column; gap: 0; }
    .admin-form .form-group { margin-bottom: 18px; }
    @media (max-width: 900px) {
      .wizard-grid { grid-template-columns: 1fr; }
      .preview-pane { position: static; }
    }
    .form-group { margin-bottom: 18px; }
    .form-label {
      display: block;
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--text-mid);
      margin-bottom: 7px;
      letter-spacing: 0.01em;
    }
    .form-input {
      width: 100%;
      padding: 10px 14px;
      border: 1px solid var(--border-strong);
      border-radius: 0;
      font-size: 0.9375rem;
      font-family: var(--font-body);
      color: var(--text);
      background: var(--surface);
      transition: border-color 0.15s, box-shadow 0.15s;
      appearance: none;
    }
    .form-input:focus {
      outline: none;
      border-color: var(--maroon);
      box-shadow: 0 0 0 3px rgba(134,31,65,0.1);
    }
    .form-input::placeholder { color: #b5afaa; }
    .form-hint { font-size: 0.8rem; color: var(--muted); margin-top: 5px; }
    .form-file-row { display: flex; flex-direction: column; gap: 8px; }
    .form-file-input {
      font-size: 0.875rem; font-family: var(--font-body); color: var(--text);
      padding: 6px 0; border: none; background: transparent;
    }
    #imageFieldWrap {
      overflow: hidden;
      max-height: 160px;
      opacity: 1;
      transition: opacity 0.2s ease, max-height 0.25s ease;
    }
    #imageFieldWrap.image-field-hidden {
      opacity: 0;
      max-height: 0;
      margin-bottom: 0;
      pointer-events: none;
    }

    .tier-toggle {
      display: flex;
      width: 100%;
      min-width: 0;
      margin-top: 12px;
      border: 1px solid var(--border);
      border-radius: 0;
      overflow: hidden;
    }
    .tier-btn {
      flex: 1;
      padding: 10px 16px;
      font-size: 0.875rem;
      font-weight: 500;
      border: none;
      background: transparent;
      color: var(--muted);
      cursor: pointer;
      transition: all 0.15s;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
    }
    .tier-btn:not(:last-child) { border-right: 1px solid var(--border); }
    .tier-btn:hover { color: var(--text); }
    .tier-btn.active { background: rgba(134,31,65,0.12); color: var(--maroon); font-weight: 600; }

    /* ── Preview Pane (matches in-app AdView) ─────────────────────── */
    .preview-pane { position: sticky; top: 84px; min-width: 0; }
    .ad-preview { padding: 0; background: transparent; min-height: 8rem; overflow: visible; }
    .preview {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      text-align: left;
      width: 100%;
      max-width: 100%;
      background: rgba(255, 255, 255, 0.82);
      border: 1px solid var(--border);
      border-radius: 0;
      overflow: hidden;
      backdrop-filter: blur(24px) saturate(160%);
      -webkit-backdrop-filter: blur(24px) saturate(160%);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
    }
    .preview-text-inner {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 18px 16px;
      width: 100%;
    }
    .preview-body {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 12px 16px 18px;
      width: 100%;
    }
    .preview-copy-stack {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      width: 100%;
    }
    .preview-sponsor-row {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
    }
    .preview-sponsor-logo {
      width: 32px;
      height: 32px;
      object-fit: contain;
      border-radius: 0;
      flex-shrink: 0;
    }
    .preview-sponsor-name {
      font-size: 0.875rem;
      font-weight: 600;
      letter-spacing: 0.065em;
      text-transform: uppercase;
      color: var(--muted);
      line-height: 1.3;
      flex: 1;
      min-width: 0;
    }
    .preview-headline {
      font-size: 1.0625rem;
      font-weight: 700;
      color: var(--text);
      line-height: 1.25;
      margin-top: 8px;
    }
    .preview-subline {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--muted);
      line-height: 1.4;
      margin-top: 6px;
    }
    .preview-img-divider {
      height: 1px;
      width: 100%;
      background: var(--border);
      flex-shrink: 0;
    }
    .preview-img-wrap {
      width: 100%;
      overflow: hidden;
      position: relative;
      background: var(--border);
    }
    .preview-img-wrap.preview-img-error { background: var(--border); }
    .preview-img-wrap.preview-img-error .preview-img { display: none; }
    .preview-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .preview-img-placeholder {
      width: 100%;
      background: var(--border);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
      color: var(--muted);
    }
    .preview-cta-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      width: 100%;
      padding: 10px;
      color: var(--maroon);
      background: var(--ad-cta-fill);
      font-size: 0.875rem;
      font-weight: 600;
      border-radius: 0;
      box-sizing: border-box;
    }
    .preview-cta-arrow { font-size: 12px; opacity: 0.95; line-height: 1; }
    .preview-label {
      font-size: 0.75rem;
      color: var(--muted);
      text-align: center;
      margin-top: 10px;
      font-weight: 500;
    }

    .wizard-cta-box {
      margin-top: 32px;
      padding: 22px;
      background: rgba(134,31,65,0.05);
      border: 1px solid rgba(134,31,65,0.15);
      border-radius: 0;
    }
    .wizard-cta-box p { font-size: 0.9rem; color: var(--text-mid); margin-bottom: 14px; line-height: 1.65; }
    .btn-contact {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background: var(--maroon);
      color: #fff;
      font-weight: 700;
      font-size: 0.9375rem;
      border-radius: 0;
      text-decoration: none;
      transition: background 0.15s, transform 0.1s;
    }
    .btn-contact:hover { background: var(--maroon-dark); text-decoration: none; transform: translateY(-1px); }

    /* ── Contact ──────────────────────────── */
    .contact-inner { max-width: 860px; margin: 0 auto; }
    .contact-inner .section-title { color: #fff; text-align: center; }
    .contact-inner .section-sub { color: rgba(255,255,255,0.55); margin: 0 auto 28px; text-align: center; max-width: 620px; }
    .contact-card {
      display: grid;
      grid-template-columns: 1.15fr 1fr;
      gap: 24px;
      align-items: stretch;
      padding: 24px;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 0;
      background: rgba(255,255,255,0.04);
    }
    @media (max-width: 640px) {
      .contact-card {
        grid-template-columns: 1fr;
        padding: 20px;
        gap: 20px;
      }
    }
    .contact-col-title {
      font-family: var(--font-display);
      font-weight: 700;
      font-size: 1.5rem;
      letter-spacing: 0.04em;
      color: #fff;
      margin-bottom: 8px;
      line-height: 1;
    }
    .contact-col-sub {
      font-size: 0.875rem;
      color: rgba(255,255,255,0.58);
      line-height: 1.65;
      margin-bottom: 16px;
    }
    .contact-points {
      list-style: none;
      display: grid;
      gap: 12px;
      margin: 0;
      padding: 0;
    }
    .contact-points li {
      font-size: 0.875rem;
      color: rgba(255,255,255,0.78);
      line-height: 1.55;
      padding-left: 16px;
      position: relative;
    }
    .contact-points li::before {
      content: "";
      width: 6px;
      height: 6px;
      border-radius: 0;
      background: var(--orange);
      position: absolute;
      left: 0;
      top: 0.55em;
    }
    .contact-cta-col {
      border-left: 4px solid var(--orange);
      padding: 24px 24px 24px 28px;
      background: rgba(255,255,255,0.03);
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 16px;
    }
    .contact-cta-label {
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--orange);
      margin: 0;
    }
    .btn-email {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      padding: 14px 24px;
      background: var(--orange);
      color: #fff;
      font-weight: 700;
      font-size: 1rem;
      border-radius: 0;
      text-decoration: none;
      border: none;
      transition: background 0.15s, transform 0.1s;
    }
    .btn-email:hover { background: var(--orange-dark); text-decoration: none; transform: translateY(-1px); }
    .contact-note { margin: 0; font-size: 0.8125rem; color: rgba(255,255,255,0.45); line-height: 1.55; }

    /* ── Footer ───────────────────────────── */
    .footer {
      padding: clamp(20px, 4vw, 28px) 0;
      border-top: 1px solid rgba(255,255,255,0.08);
      background: var(--maroon-deep);
    }
    .footer-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }
    .footer-copy { font-size: 0.8125rem; color: rgba(255,255,255,0.35); }
    .footer-links { display: flex; gap: 20px; }
    .footer-links a { font-size: 0.8125rem; color: rgba(255,255,255,0.45); }
    .footer-links a:hover { color: rgba(255,255,255,0.8); text-decoration: none; }
  </style>
</head>
<body data-ads-version="2024-03-preview-placeholder">

  <nav class="nav" id="mainNav">
    <div class="container nav-inner">
      <a href="https://gymtracker.jackhannon.net/" class="nav-logo"><img src="/logo.png" alt="" class="nav-logo-img" width="40" height="40">GYM TRACKER</a>
      <button type="button" class="nav-toggle" id="navToggle" aria-expanded="false" aria-controls="navLinks" aria-label="Toggle menu">
        <span class="nav-toggle-icon">
          <span></span><span></span><span></span>
        </span>
      </button>
      <div class="nav-links" id="navLinks">
        <a href="#metrics">How it works</a>
        <a href="#formats">Formats</a>
        <a href="#wizard">Preview</a>
        <a href="#contact">Contact</a>
      </div>
    </div>
  </nav>

  <section class="hero">
    <div class="container hero-content">
      <p class="hero-eyebrow">Advertise on Gym Tracker</p>
      <h1>A small app.<br><em>A specific audience.</em><br>One ad slot.</h1>
      <p class="hero-sub">VT students check McComas and War Memorial before they go. Six times a week, on average. One ad slot in the feed. If Hokies are your audience, this is it.</p>
      <div class="hero-actions">
        <a href="#wizard" class="btn-primary">Build a mockup &rarr;</a>
        <a href="https://apps.apple.com/us/app/vt-gym-tracker/id6736409867?itscg=30200&itsct=apps_box_badge&mttnsubad=6736409867" class="btn-ghost" target="_blank" rel="noopener noreferrer">View on the App Store</a>
      </div>
      <div class="hero-stats">
        <div class="hero-stat">
          <div class="hero-stat-val">3K+</div>
          <div class="hero-stat-label">Total installs</div>
        </div>
        <div class="hero-stat">
          <div class="hero-stat-val">11K+</div>
          <div class="hero-stat-label">Monthly impressions</div>
        </div>
        <div class="hero-stat">
          <div class="hero-stat-val">360+</div>
          <div class="hero-stat-label">Daily active users</div>
        </div>
      </div>
    </div>
  </section>

  <section id="metrics" class="section section-alt">
    <div class="container">
      <div class="section-header">
        <p class="section-label">How it works</p>
        <h2 class="section-title">It's part of their routine</h2>
        <p class="section-sub">Students check occupancy before they go, sometimes more than once a day. The ad is in that same view&mdash;not a separate tab or a notification they opted out of.</p>
      </div>

      <div class="exclusive-callout">
        <div class="exclusive-left">
          <span class="exclusive-tag">One sponsor at a time</span>
          <p class="exclusive-headline">One ad in the app.<br>Every open. Every user.</p>
          <p class="exclusive-desc">There&rsquo;s no rotation or bidding system. While you&rsquo;re running, every person who opens the app sees your ad.</p>
        </div>
        <div class="exclusive-right">
          <div class="exclusive-stat-row">
            <div class="exclusive-stat">
              <span class="exclusive-stat-num">100%</span>
              <span class="exclusive-stat-label">Share of voice</span>
            </div>
            <div class="exclusive-stat-divider"></div>
            <div class="exclusive-stat">
              <span class="exclusive-stat-num">0</span>
              <span class="exclusive-stat-label">Competing ads</span>
            </div>
          </div>
        </div>
      </div>

      <div class="features-grid">
        <div class="feature-card">
          <span class="feature-card-tag">Placement</span>
          <div class="feature-title">Same view as the gym data</div>
          <div class="feature-desc">The ad sits in the feed where users check occupancy. It&rsquo;s not a banner in a corner&mdash;it&rsquo;s in the same place they&rsquo;re already looking.</div>
        </div>

        <div class="feature-card">
          <span class="feature-card-tag">Audience</span>
          <div class="feature-title">That&rsquo;s the whole audience</div>
          <div class="feature-desc">Everyone who has this app goes to Virginia Tech and uses the campus gyms. There&rsquo;s no broader regional audience to filter out.</div>
        </div>

        <div class="feature-card">
          <span class="feature-card-tag">Scheduling</span>
          <div class="feature-title">Pick your dates</div>
          <div class="feature-desc">Set a start and end date. Works for a single event, a semester push, or just a specific week. No long-term commitment.</div>
        </div>

        <div class="feature-card">
          <span class="feature-card-tag">Reporting</span>
          <div class="feature-title">Impressions and clicks, tracked directly</div>
          <div class="feature-desc">No third-party tools or estimates. You&rsquo;ll see exactly how many times the ad was shown and how many people tapped it.</div>
        </div>
      </div>

      <div class="peaks-card">
        <div class="peaks-header">
          <span class="peaks-title">When students are most active</span>
          <span class="peaks-note">Follows the semester schedule</span>
        </div>
        <div class="peaks-track-wrap">
        <div class="peaks-track">
          <div class="peaks-bar-wrap">
            <div class="peaks-bar peak" style="height:48px"></div>
            <span class="peaks-month">Jan</span>
          </div>
          <div class="peaks-bar-wrap">
            <div class="peaks-bar peak" style="height:44px"></div>
            <span class="peaks-month">Feb</span>
          </div>
          <div class="peaks-bar-wrap">
            <div class="peaks-bar peak" style="height:40px"></div>
            <span class="peaks-month">Mar</span>
          </div>
          <div class="peaks-bar-wrap">
            <div class="peaks-bar peak" style="height:42px"></div>
            <span class="peaks-month">Apr</span>
          </div>
          <div class="peaks-bar-wrap">
            <div class="peaks-bar off-peak" style="height:24px"></div>
            <span class="peaks-month">May</span>
          </div>
          <div class="peaks-bar-wrap">
            <div class="peaks-bar summer" style="height:14px"></div>
            <span class="peaks-month">Jun</span>
          </div>
          <div class="peaks-bar-wrap">
            <div class="peaks-bar summer" style="height:12px"></div>
            <span class="peaks-month">Jul</span>
          </div>
          <div class="peaks-bar-wrap">
            <div class="peaks-bar peak" style="height:46px"></div>
            <span class="peaks-month">Aug</span>
          </div>
          <div class="peaks-bar-wrap">
            <div class="peaks-bar peak" style="height:44px"></div>
            <span class="peaks-month">Sep</span>
          </div>
          <div class="peaks-bar-wrap">
            <div class="peaks-bar peak" style="height:42px"></div>
            <span class="peaks-month">Oct</span>
          </div>
          <div class="peaks-bar-wrap">
            <div class="peaks-bar peak" style="height:38px"></div>
            <span class="peaks-month">Nov</span>
          </div>
          <div class="peaks-bar-wrap">
            <div class="peaks-bar off-peak" style="height:18px"></div>
            <span class="peaks-month">Dec</span>
          </div>
        </div>
        </div>
        <div class="peaks-legend">
          <div class="peaks-legend-item">
            <div class="peaks-legend-dot" style="background:var(--maroon)"></div>
            <span>Peak semester traffic</span>
          </div>
          <div class="peaks-legend-item">
            <div class="peaks-legend-dot" style="background:var(--border-strong)"></div>
            <span>Moderate</span>
          </div>
          <div class="peaks-legend-item">
            <div class="peaks-legend-dot" style="background:var(--border)"></div>
            <span>Summer low</span>
          </div>
        </div>
      </div>

      <div class="social-proof">
        <p class="social-proof-label">A few things students have said</p>
        <div class="social-quotes">
          <div class="social-quote">
            <span class="social-quote-text">I be using this all the time ngl. It helped me make an actual good schedule with the gym.</span>
            <span class="social-quote-source">VT student</span>
          </div>
          <div class="social-quote">
            <span class="social-quote-text">I got this first semester it's so good!</span>
            <span class="social-quote-source">VT student</span>
          </div>
          <div class="social-quote">
            <span class="social-quote-text">use this app daily bro keep up the good work</span>
            <span class="social-quote-source">VT student</span>
          </div>
          <div class="social-quote">
            <span class="social-quote-text">wait this is actually so cool, just downloaded</span>
            <span class="social-quote-source">VT student</span>
          </div>
          <div class="social-quote">
            <span class="social-quote-text">Peak app</span>
            <span class="social-quote-source">VT student</span>
          </div>
          <div class="social-quote">
            <span class="social-quote-text">this is rad actually</span>
            <span class="social-quote-source">VT student</span>
          </div>
        </div>
      </div>

      <div class="proof-strip" aria-label="Sponsor confidence points">
        <div class="proof-item">
          <div class="proof-icon">
            <svg viewBox="0 0 15 15" fill="none" stroke="#861F41" stroke-width="1.5" stroke-linecap="round">
              <path d="M7.5 1a6.5 6.5 0 1 0 0 13A6.5 6.5 0 0 0 7.5 1z"/>
              <path d="M5 7.5l2 2 3.5-3.5"/>
            </svg>
          </div>
          <div class="proof-title">It&rsquo;s a real app, live on the App Store</div>
          <div class="proof-desc">iPhone, iPad, Apple Watch, and home screen widget. It&rsquo;s been in the App Store since 2022.</div>
        </div>
        <div class="proof-item">
          <div class="proof-icon">
            <svg viewBox="0 0 15 15" fill="none" stroke="#861F41" stroke-width="1.5" stroke-linecap="round">
              <rect x="1" y="3" width="13" height="9" rx="1.5"/>
              <path d="M4 6.5h7M4 9h4"/>
            </svg>
          </div>
          <div class="proof-title">Ads are labeled as sponsored</div>
          <div class="proof-desc">Clearly marked. No tricks.</div>
        </div>
        <div class="proof-item">
          <div class="proof-icon">
            <svg viewBox="0 0 15 15" fill="none" stroke="#861F41" stroke-width="1.5" stroke-linecap="round">
              <path d="M2 11l3.5-4.5 2.5 2.5 2-2.5 3 4"/>
              <path d="M2 13h11"/>
            </svg>
          </div>
          <div class="proof-title">Simple to get started</div>
          <div class="proof-desc">Send your dates and what you&rsquo;d like to say. I handle setup and scheduling.</div>
        </div>
      </div>
    </div>
  </section>

  <section id="formats" class="section">
    <div class="container">
      <div class="section-header">
        <p class="section-label">Formats</p>
        <h2 class="section-title">Three formats</h2>
        <p class="section-sub">Text-only, banner, or feature. All appear in the main feed.</p>
      </div>
      <div class="formats-grid">
        <div class="format-card">
          <div class="format-card-preview">
            <div class="format-preview-text">
              <div class="fph"></div>
              <div class="fps"></div>
              <div class="fpc"></div>
            </div>
          </div>
          <div class="format-card-info">
            <div class="format-card-name">Text</div>
            <div class="format-card-desc">Sponsor name, headline, subline, and a CTA. No image needed.</div>
            <dl class="format-specs">
              <dt>Assets</dt>
              <dd>Sponsor name, headline, subline (optional), CTA. Optional logo (20×20px).</dd>
              <dt>Image</dt>
              <dd>None required.</dd>
            </dl>
          </div>
        </div>
        <div class="format-card">
          <div class="format-card-preview">
            <div class="format-preview-banner">
              <div class="format-preview-img"><span>Banner image</span></div>
              <div class="format-preview-body">
                <div class="fph"></div>
                <div class="fps"></div>
                <div class="fpc"></div>
              </div>
            </div>
          </div>
          <div class="format-card-info">
            <div class="format-card-name">Banner</div>
            <div class="format-card-desc">An image plus a short block of copy. Standard placement in the feed.</div>
            <dl class="format-specs">
              <dt>Banner image</dt>
              <dd>1200×628px (landscape). JPG or PNG, max 2MB.</dd>
              <dt>Copy</dt>
              <dd>Headline, subline (optional), CTA. Optional logo (20×20px).</dd>
            </dl>
          </div>
        </div>
        <div class="format-card">
          <div class="format-card-preview">
            <div class="format-preview-banner format-preview-feature">
              <div class="format-preview-img"><span>Feature image</span></div>
              <div class="format-preview-body">
                <div class="fph"></div>
                <div class="fps"></div>
                <div class="fpc"></div>
              </div>
            </div>
          </div>
          <div class="format-card-info">
            <div class="format-card-name">Feature</div>
            <div class="format-card-desc">Taller image and more room for copy. The largest format available.</div>
            <dl class="format-specs">
              <dt>Feature image</dt>
              <dd>1080×1350px (4:5 portrait). JPG or PNG, max 2MB.</dd>
              <dt>Copy</dt>
              <dd>Headline, subline (optional), CTA. Optional logo (20×20px). More room for subline.</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section id="wizard" class="section section-alt">
    <div class="container">
      <div class="section-header">
        <p class="section-label">Ad Preview</p>
        <h2 class="section-title">See what it looks like</h2>
        <p class="section-sub">Fill in your details and switch between formats. Good for getting a concrete idea before you reach out.</p>
      </div>
      <div class="wizard-grid">
        <form id="mockupForm" class="admin-form">
          <div class="form-group">
            <label class="form-label" for="sponsor">Business / Sponsor Name</label>
            <input class="form-input" type="text" id="sponsor" name="sponsor" placeholder="e.g. Benny&rsquo;s Coffee" autocomplete="off">
          </div>
          <div class="form-group">
            <label class="form-label" for="headline">Headline</label>
            <input class="form-input" type="text" id="headline" name="headline" placeholder="e.g. Fuel your workout" autocomplete="off">
          </div>
          <div class="form-group">
            <label class="form-label" for="subline">Subline <span style="font-weight:400;color:var(--muted)">(optional)</span></label>
            <input class="form-input" type="text" id="subline" name="subline" placeholder="e.g. 310 N Main St &middot; Open 7am&ndash;9pm" autocomplete="off">
          </div>
          <div class="form-group">
            <label class="form-label" for="cta">Call to Action</label>
            <input class="form-input" type="text" id="cta" name="cta" placeholder="e.g. View menu" autocomplete="off">
          </div>
          <div class="form-group" id="imageFieldWrap">
            <label class="form-label" for="image_file">Image</label>
            <div class="form-file-row">
              <input class="form-file-input" type="file" id="image_file" name="image_file" accept="image/*" aria-label="Choose image file">
              <input class="form-input" type="url" id="image_url" name="image_url" placeholder="Or paste image URL (https://)" autocomplete="off">
            </div>
            <p class="form-hint">Required for Banner and Feature formats. Upload or paste URL.</p>
          </div>
          <div class="form-group">
            <label class="form-label" for="logo_file">Logo <span style="font-weight:400;color:var(--muted)">(optional)</span></label>
            <div class="form-file-row">
              <input class="form-file-input" type="file" id="logo_file" name="logo_file" accept="image/*" aria-label="Choose logo file">
              <input class="form-input" type="url" id="logo_url" name="logo_url" placeholder="Or paste logo URL (https://)" autocomplete="off">
            </div>
          </div>
          <input type="hidden" id="tier" name="tier" value="banner">
          <div class="wizard-cta-box">
            <p>Ready to move forward? Send your target dates and what you want to say. I&rsquo;ll handle the rest.</p>
            <a href="#contact" class="btn-contact">Get in touch &rarr;</a>
          </div>
        </form>

        <aside class="preview-pane">
          <div id="adPreview" class="ad-preview"><div class="preview preview-banner">
            <div class="preview-img-placeholder" style="height:140px">Image</div>
            <div class="preview-img-divider"></div>
            <div class="preview-body">
              <div class="preview-copy-stack">
                <div class="preview-sponsor-row"><span class="preview-sponsor-name">BENNY&rsquo;S COFFEE</span></div>
                <strong class="preview-headline">Fuel your workout</strong>
                <span class="preview-subline">310 N Main St &middot; Open 7am&ndash;9pm</span>
              </div>
              <div class="preview-cta-wrap"><span class="preview-cta-text">View menu</span><span class="preview-cta-arrow">↗</span></div>
            </div>
          </div></div>
          <div class="tier-toggle">
            <button type="button" class="tier-btn" data-tier="text">Text</button>
            <button type="button" class="tier-btn active" data-tier="banner">Banner</button>
            <button type="button" class="tier-btn" data-tier="feature">Feature</button>
          </div>
        </aside>
      </div>
    </div>
  </section>

  <section id="contact" class="section section-dark">
    <div class="container">
      <div class="contact-inner">
        <h2 class="section-title on-dark">Get in touch</h2>
        <p class="section-sub">Send a few details and I&rsquo;ll follow up with format suggestions and next steps.</p>
        <div class="contact-card">
          <div>
            <h3 class="contact-col-title">What to include</h3>
            <p class="contact-col-sub">Enough to give you a quick turnaround.</p>
            <ul class="contact-points">
              <li>Your business name and website</li>
              <li>Target dates or general campaign window</li>
              <li>What you&rsquo;re trying to accomplish (awareness, event, foot traffic)</li>
              <li>Format preference, if you have one&mdash;or just ask</li>
            </ul>
          </div>
          <div class="contact-cta-col">
            <p class="contact-cta-label">Direct line</p>
            <a href="mailto:hello@jackhannon.net?subject=Gym%20Tracker%20Advertising%20Inquiry" class="btn-email">Email me &rarr;</a>
            <p class="contact-note">I typically reply within a day. Highest traffic windows are January&ndash;May and August&ndash;December.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <footer class="footer">
    <div class="container footer-inner">
      <span class="footer-copy">&copy; Jack Hannon</span>
      <div class="footer-links">
        <a href="/privacy">Privacy</a>
        <a href="https://jackhannon.net/">jackhannon.net</a>
      </div>
    </div>
  </footer>

  <script>
    (function () {
      var adPreview = document.getElementById('adPreview');
      var form = document.getElementById('mockupForm');
      var previewDebounce = null;
      var cachedImageFile = null;
      var cachedImageObjUrl = null;
      var cachedLogoFile = null;
      var cachedLogoObjUrl = null;

      function escapeHtml(s) {
        var d = document.createElement('div');
        d.textContent = s || '';
        return d.innerHTML;
      }

      function getEffectiveImageSrc() {
        var fileInput = document.getElementById('image_file');
        var file = (fileInput && fileInput.files && fileInput.files[0]) ? fileInput.files[0] : null;
        if (file && file.type && file.type.indexOf('image/') === 0) {
          if (cachedImageFile === file && cachedImageObjUrl) return cachedImageObjUrl;
          if (cachedImageObjUrl) URL.revokeObjectURL(cachedImageObjUrl);
          cachedImageFile = file;
          cachedImageObjUrl = URL.createObjectURL(file);
          return cachedImageObjUrl;
        }
        if (cachedImageObjUrl) {
          URL.revokeObjectURL(cachedImageObjUrl);
          cachedImageObjUrl = null;
          cachedImageFile = null;
        }
        var urlInput = document.getElementById('image_url');
        var url = urlInput ? urlInput.value.trim() : '';
        return (url && url !== 'https://') ? url : null;
      }

      function getEffectiveLogoSrc() {
        var fileInput = document.getElementById('logo_file');
        var file = (fileInput && fileInput.files && fileInput.files[0]) ? fileInput.files[0] : null;
        if (file && file.type && file.type.indexOf('image/') === 0) {
          if (cachedLogoFile === file && cachedLogoObjUrl) return cachedLogoObjUrl;
          if (cachedLogoObjUrl) URL.revokeObjectURL(cachedLogoObjUrl);
          cachedLogoFile = file;
          cachedLogoObjUrl = URL.createObjectURL(file);
          return cachedLogoObjUrl;
        }
        if (cachedLogoObjUrl) {
          URL.revokeObjectURL(cachedLogoObjUrl);
          cachedLogoObjUrl = null;
          cachedLogoFile = null;
        }
        var urlInput = document.getElementById('logo_url');
        var url = urlInput ? urlInput.value.trim() : '';
        return (url && url !== 'https://') ? url : null;
      }

      function getFormData() {
        return {
          sponsor: document.getElementById('sponsor').value.trim(),
          headline: document.getElementById('headline').value.trim(),
          subline: document.getElementById('subline').value.trim() || null,
          cta: document.getElementById('cta').value.trim(),
          tier: document.getElementById('tier').value,
          image_src: getEffectiveImageSrc(),
          logo_src: getEffectiveLogoSrc()
        };
      }

      function getPlaceholder(id) {
        var el = document.getElementById(id);
        var p = (el && el.placeholder) || '';
        return p.replace(/^e\.g\.\s*/i, '');
      }

      function updatePreview() {
        var d = getFormData();
        var tier = d.tier || 'banner';
        var sponsor = (d.sponsor || getPlaceholder('sponsor')).toUpperCase();
        var headline = d.headline || getPlaceholder('headline');
        var subline = d.subline || getPlaceholder('subline');
        var cta = d.cta || getPlaceholder('cta');
        var image_src = d.image_src || null;
        var logo_src = d.logo_src || null;
        var usesImageLayout = tier !== 'text';
        var sponsorRow = '<div class="preview-sponsor-row">' +
          (logo_src ? '<img src="' + escapeHtml(logo_src) + '" alt="" class="preview-sponsor-logo" onerror="this.style.display=\\'none\\'">' : '') +
          '<span class="preview-sponsor-name">' + escapeHtml(sponsor) + '</span></div>';
        var copyStack = '<div class="preview-copy-stack">' + sponsorRow +
          '<strong class="preview-headline">' + escapeHtml(headline) + '</strong>' +
          (subline ? '<span class="preview-subline">' + escapeHtml(subline) + '</span>' : '') +
          '</div>';
        var ctaBtn = '<div class="preview-cta-wrap"><span class="preview-cta-text">' + escapeHtml(cta) + '</span><span class="preview-cta-arrow">↗</span></div>';
        var html;
        if (usesImageLayout) {
          var imgHeight = tier === 'feature' ? 220 : 140;
          html = '<div class="preview preview-' + tier + '">';
          if (image_src) {
            html += '<div class="preview-img-wrap" style="height:' + imgHeight + 'px">';
            html += '<img src="' + escapeHtml(image_src) + '" alt="" class="preview-img" onerror="this.parentElement.classList.add(\\'preview-img-error\\')">';
            html += '</div>';
          } else {
            html += '<div class="preview-img-placeholder" style="height:' + imgHeight + 'px">Image</div>';
          }
          html += '<div class="preview-img-divider"></div>';
          html += '<div class="preview-body">' + copyStack + ctaBtn + '</div></div>';
        } else {
          html = '<div class="preview preview-text"><div class="preview-text-inner">' + copyStack + ctaBtn + '</div></div>';
        }
        adPreview.innerHTML = html;
      }

      function debouncePreview() {
        clearTimeout(previewDebounce);
        previewDebounce = setTimeout(updatePreview, 50);
      }

      function updateTierButtons() {
        var tier = document.getElementById('tier').value;
        document.querySelectorAll('.tier-btn').forEach(function (btn) {
          btn.classList.toggle('active', btn.dataset.tier === tier);
        });
        updateImageFieldVisibility();
      }

      function updateImageFieldVisibility() {
        var tier = document.getElementById('tier').value;
        var wrap = document.getElementById('imageFieldWrap');
        if (wrap) wrap.classList.toggle('image-field-hidden', tier === 'text');
      }

      function run() {
        var navToggle = document.getElementById('navToggle');
        var mainNav = document.getElementById('mainNav');
        var navLinks = document.getElementById('navLinks');
        if (navToggle && mainNav && navLinks) {
          function closeNav() {
            mainNav.classList.remove('nav-open');
            navToggle.setAttribute('aria-expanded', 'false');
          }
          navToggle.addEventListener('click', function () {
            var open = mainNav.classList.toggle('nav-open');
            navToggle.setAttribute('aria-expanded', open);
          });
          navLinks.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', closeNav);
          });
          document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && mainNav.classList.contains('nav-open')) closeNav();
          });
        }

        form.querySelectorAll('input').forEach(function (el) {
          el.addEventListener('input', debouncePreview);
          el.addEventListener('change', debouncePreview);
        });

        document.querySelectorAll('.tier-btn').forEach(function (btn) {
          btn.addEventListener('click', function () {
            document.getElementById('tier').value = btn.dataset.tier;
            updateTierButtons();
            debouncePreview();
          });
        });

        form.addEventListener('submit', function (e) { e.preventDefault(); });
        form.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            var inputs = Array.from(form.querySelectorAll('input:not([type="hidden"])'));
            var idx = inputs.indexOf(e.target);
            if (idx >= 0 && idx < inputs.length - 1) {
              inputs[idx + 1].focus();
            }
          }
        });

        updateTierButtons();
        updatePreview();
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run);
      } else {
        run();
      }
    }());
  </script>
</body>
</html>`;

export function getAdsLandingHtml(): string {
  return ADS_LANDING_HTML;
}
