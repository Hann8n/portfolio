/** Ads landing page — served at /ads. Public sales page with metrics and mockup wizard. */
export const ADS_LANDING_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
  <meta http-equiv="Pragma" content="no-cache">
  <title>Advertise on Gym Tracker | Reach VT gym-goers in one placement</title>
  <meta name="description" content="Gym Tracker is used by Virginia Tech students checking McComas and War Memorial. There is one sponsored placement in the main feed.">
  <link rel="icon" href="/favicon/favicon.ico" sizes="any">
  <link rel="icon" href="/favicon/favicon-32x32.png" type="image/png" sizes="32x32">
  <link rel="icon" href="/favicon/favicon-16x16.png" type="image/png" sizes="16x16">
  <link rel="apple-touch-icon" href="/favicon/apple-touch-icon.png" sizes="180x180">
  <script>
    if (localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark-theme');
    }
  </script>
  <style>
    :root {
      color-scheme: light dark;
      --bg-color: #ffffff;
      --text-color: #333333;
      --text-mid: #555555;
      --muted: #767676;
      --link-color: #c95a7a;
      --link-hover-color: #E5751F;
      --vt-maroon: #861F41;
      --maroon-dark: #6d1936;
      --maroon-tint: rgba(134, 31, 65, 0.08);
      --cta-fg: var(--vt-maroon);
      --border: #e5e5e5;
      --border-strong: #d4d4d4;
      --surface: #ffffff;
    }
    .dark-theme {
      --bg-color: #1a1a1a;
      --text-color: #e0e0e0;
      --text-mid: #b3b3b3;
      --muted: #8a8a8a;
      --maroon-dark: #9d3a58;
      --maroon-tint: rgba(201, 90, 122, 0.16);
      --cta-fg: #c95a7a;
      --border: #2e2e2e;
      --border-strong: #3a3a3a;
      --surface: #242424;
    }
    @media (prefers-color-scheme: dark) {
      :root:not(.light-theme):not(.dark-theme) {
        --bg-color: #1a1a1a;
        --text-color: #e0e0e0;
        --text-mid: #b3b3b3;
        --muted: #8a8a8a;
        --maroon-dark: #9d3a58;
        --maroon-tint: rgba(201, 90, 122, 0.16);
        --cta-fg: #c95a7a;
        --border: #2e2e2e;
        --border-strong: #3a3a3a;
        --surface: #242424;
      }
    }
    *, *::before, *::after { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
      background: var(--bg-color);
      color: var(--text-color);
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 16px;
      line-height: 1.65;
      -webkit-font-smoothing: antialiased;
    }
    a { color: var(--link-color); text-decoration: none; transition: color 0.2s ease; }
    a:hover { color: var(--link-hover-color); }
    .container { max-width: 840px; margin: 0 auto; padding: 0 20px; }

    /* ── Back link ────────────────────────── */
    .back-link {
      display: inline-block;
      font-size: 0.875rem;
      color: var(--muted);
      margin-bottom: 24px;
    }

    /* ── Sections ─────────────────────────── */
    main > section { padding: 36px 0; }
    main > section + section { border-top: 1px solid var(--border); }
    h1 {
      font-size: clamp(2rem, 5vw, 2.5rem);
      font-weight: 700;
      letter-spacing: -0.02em;
      line-height: 1.2;
      margin: 0 0 12px;
    }
    h2 {
      font-size: clamp(1.4rem, 4vw, 1.8rem);
      font-weight: 600;
      letter-spacing: -0.01em;
      margin: 0 0 12px;
    }
    p { margin: 0 0 1rem; }
    .section-sub { color: var(--muted); max-width: 520px; }

    /* ── Hero ─────────────────────────────── */
    .hero { padding-top: clamp(32px, 6vw, 48px); }
    .hero-sub { font-size: 1.0625rem; color: var(--text-mid); max-width: 540px; margin-bottom: 20px; }
    .hero-actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 28px; }
    .hero-stats { display: flex; gap: 40px; flex-wrap: wrap; }
    .hero-stat { display: flex; flex-direction: column; }
    .hero-stat-val { font-size: 1.5rem; font-weight: 700; line-height: 1.2; }
    .hero-stat-label { font-size: 0.8125rem; color: var(--muted); }

    /* ── Buttons ──────────────────────────── */
    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 22px;
      background: var(--vt-maroon);
      color: #fff;
      font-weight: 600;
      font-size: 0.9375rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.15s ease;
    }
    .btn-primary:hover { background: var(--maroon-dark); color: #fff; }
    .btn-ghost {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 12px 18px;
      color: var(--text-color);
      font-weight: 500;
      font-size: 0.9375rem;
      border: 1px solid var(--border-strong);
      border-radius: 8px;
      transition: border-color 0.15s ease;
    }
    .btn-ghost:hover { border-color: var(--muted); color: var(--text-color); }

    /* ── Formats ──────────────────────────── */
    .formats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 20px; }
    .format-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 18px;
    }
    .format-card h3 { font-size: 1.05rem; font-weight: 700; margin: 0 0 6px; }
    .format-card > p { font-size: 0.875rem; color: var(--muted); margin-bottom: 14px; }
    .format-specs { font-size: 0.8125rem; color: var(--text-mid); margin: 0; }
    .format-specs dt { font-weight: 600; color: var(--text-color); margin-top: 8px; }
    .format-specs dt:first-child { margin-top: 0; }
    .format-specs dd { margin: 2px 0 0; }

    /* ── Wizard ───────────────────────────── */
    .wizard-grid { display: grid; grid-template-columns: 1fr 300px; gap: 24px; align-items: start; margin-top: 20px; }
    .form-group { margin-bottom: 16px; }
    .form-group:last-child { margin-bottom: 0; }
    .form-label {
      display: block;
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--text-color);
      margin-bottom: 6px;
    }
    .form-label .opt { font-weight: 400; color: var(--muted); }
    .form-input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid var(--border-strong);
      border-radius: 8px;
      font-size: 0.9375rem;
      font-family: inherit;
      color: var(--text-color);
      background: var(--bg-color);
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }
    .form-input:focus {
      outline: none;
      border-color: var(--link-color);
      box-shadow: 0 0 0 3px rgba(201, 90, 122, 0.15);
    }
    .form-input::placeholder { color: var(--muted); opacity: 0.7; }
    .form-hint { font-size: 0.8rem; color: var(--muted); margin: 5px 0 0; }
    .form-file-row { display: flex; flex-direction: column; gap: 8px; }
    .form-file-input {
      font-size: 0.875rem;
      font-family: inherit;
      color: var(--text-color);
      padding: 4px 0;
      border: none;
      background: transparent;
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

    /* ── Preview pane ─────────────────────── */
    .preview-pane { position: sticky; top: 24px; min-width: 0; }
    .ad-preview { min-height: 8rem; }
    .preview {
      display: flex;
      flex-direction: column;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
    }
    .preview-section-header {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      padding: 12px 16px 10px;
      border-bottom: 1px solid var(--border);
    }
    .preview-section-header-logo {
      width: 24px;
      height: 24px;
      object-fit: contain;
      border-radius: 4px;
      flex-shrink: 0;
    }
    .preview-section-header-title {
      font-size: 0.8125rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--text-color);
      line-height: 1.2;
      flex: 1;
      min-width: 0;
    }
    .preview-section-sponsored {
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--muted);
      flex-shrink: 0;
    }
    .preview-img-wrap { width: 100%; overflow: hidden; position: relative; background: var(--border); }
    .preview-img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .preview-img-wrap.preview-img-error { background: var(--border); }
    .preview-img-wrap.preview-img-error .preview-img { display: none; }
    .preview-img-placeholder {
      width: 100%;
      background: var(--border);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
      color: var(--muted);
    }
    .preview-img-divider { height: 1px; width: 100%; background: var(--border); flex-shrink: 0; }
    .preview-body {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 14px 16px 16px;
      width: 100%;
    }
    .preview-text-inner {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 14px 16px;
      width: 100%;
    }
    .preview-section-header + .preview-text-inner { padding-top: 12px; }
    .preview-copy-stack { display: flex; flex-direction: column; align-items: flex-start; width: 100%; }
    .preview-headline { font-size: 1rem; font-weight: 700; color: var(--text-color); line-height: 1.3; }
    .preview-subline { font-size: 0.8125rem; color: var(--muted); line-height: 1.45; margin-top: 4px; }
    .preview-cta-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      width: 100%;
      padding: 10px;
      color: var(--cta-fg);
      background: var(--maroon-tint);
      font-size: 0.875rem;
      font-weight: 600;
      border-radius: 8px;
    }
    .preview-cta-arrow { font-size: 12px; opacity: 0.95; line-height: 1; }
    .tier-toggle {
      display: flex;
      width: 100%;
      margin-top: 12px;
      border: 1px solid var(--border-strong);
      border-radius: 8px;
      overflow: hidden;
    }
    .tier-btn {
      flex: 1;
      padding: 10px 16px;
      font-size: 0.875rem;
      font-weight: 500;
      font-family: inherit;
      border: none;
      background: transparent;
      color: var(--muted);
      cursor: pointer;
      transition: color 0.15s ease, background 0.15s ease;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
    }
    .tier-btn:not(:last-child) { border-right: 1px solid var(--border); }
    .tier-btn:hover { color: var(--text-color); }
    .tier-btn.active { background: var(--maroon-tint); color: var(--cta-fg); font-weight: 600; }

    /* ── Contact ──────────────────────────── */
    .contact-cols { display: grid; grid-template-columns: 1fr; gap: 16px; }
    .contact-cols p { margin: 0; }

    /* ── Footer ───────────────────────────── */
    .footer { border-top: 1px solid var(--border); padding: 20px 0; }
    .footer-inner {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
      padding: 0 20px;
    }
    .footer-social { display: flex; gap: 12px; }
    .footer-social a {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      color: var(--muted);
      border-radius: 50%;
      transition: color 0.2s ease, transform 0.2s ease;
    }
    .footer-social a:hover {
      color: var(--link-hover-color);
      transform: translateY(-2px);
    }
    .footer-social svg { width: 18px; height: 18px; fill: currentColor; }
    .footer-links {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 8px 20px;
    }
    .footer-links a {
      font-size: 0.875rem;
      color: var(--muted);
      text-decoration: none;
      transition: color 0.2s ease;
    }
    .footer-links a:hover { color: var(--link-hover-color); }

    /* ── Responsive ───────────────────────── */
    @media (max-width: 800px) {
      .wizard-grid { grid-template-columns: 1fr; }
      .preview-pane { position: static; }
    }
    @media (max-width: 640px) {
      .formats-grid { grid-template-columns: 1fr; }
      .hero-stats { gap: 24px; }
    }
    @media (min-width: 1024px) {
      .container { max-width: 1060px; }
      .hero-stats { gap: 64px; }
      .wizard-grid { grid-template-columns: minmax(0, 1fr) 340px; gap: 32px; max-width: 940px; }
      .contact-inner { max-width: none; }
      .contact-cols { grid-template-columns: minmax(0, 1fr) auto; gap: 48px; align-items: center; }
      .footer-inner { flex-direction: row; justify-content: space-between; }
    }
  </style>
</head>
<body>

  <main class="container">

    <section class="hero">
      <a href="/" class="back-link">&larr; Back</a>
      <h1>Advertise on Gym Tracker</h1>
      <p class="hero-sub">Gym Tracker is used by Virginia Tech students checking McComas and War Memorial occupancy before they go. Your placement is the one sponsored card in that feed.</p>
      <div class="hero-actions">
        <a href="#contact" class="btn-primary">Get in touch</a>
        <a href="https://apps.apple.com/us/app/vt-gym-tracker/id6736409867?itscg=30200&itsct=apps_box_badge&mttnsubad=6736409867" class="btn-ghost" target="_blank" rel="noopener noreferrer">View on the App Store</a>
      </div>
      <div class="hero-stats">
        <div class="hero-stat">
          <span class="hero-stat-val">3K+</span>
          <span class="hero-stat-label">Total installs</span>
        </div>
        <div class="hero-stat">
          <span class="hero-stat-val">11K+</span>
          <span class="hero-stat-label">Monthly impressions</span>
        </div>
        <div class="hero-stat">
          <span class="hero-stat-val">360+</span>
          <span class="hero-stat-label">Daily active users</span>
        </div>
      </div>
    </section>

    <section id="formats">
      <h2>Three formats</h2>
      <p class="section-sub">Text-only, banner, or feature. All appear in the main feed.</p>
      <div class="formats-grid">
        <div class="format-card">
          <h3>Text</h3>
          <p>Copy only &mdash; no image needed.</p>
          <dl class="format-specs">
            <dt>Assets</dt>
            <dd>Sponsor name, headline, subline (optional), CTA. Optional logo in the section header.</dd>
            <dt>Image</dt>
            <dd>None required.</dd>
          </dl>
        </div>
        <div class="format-card">
          <h3>Banner</h3>
          <p>An image plus a short block of copy.</p>
          <dl class="format-specs">
            <dt>Banner image</dt>
            <dd>1200&times;628px (landscape). JPG or PNG.</dd>
            <dt>Copy</dt>
            <dd>Headline, subline (optional), CTA. Optional logo in the section header.</dd>
          </dl>
        </div>
        <div class="format-card">
          <h3>Feature</h3>
          <p>Taller image with more room for copy.</p>
          <dl class="format-specs">
            <dt>Feature image</dt>
            <dd>1080&times;1350px (4:5 portrait). JPG or PNG.</dd>
            <dt>Copy</dt>
            <dd>Headline, subline (optional), CTA. Optional logo. More room for subline.</dd>
          </dl>
        </div>
      </div>
    </section>

    <section id="wizard">
      <h2>Preview the placement</h2>
      <p class="section-sub">Enter sample details and switch formats to see how each option appears in-feed.</p>
      <div class="wizard-grid">
        <form id="mockupForm" class="wizard-form">
          <div class="form-group">
            <label class="form-label" for="sponsor">Business / Sponsor Name</label>
            <input class="form-input" type="text" id="sponsor" name="sponsor" placeholder="e.g. Benny&rsquo;s Coffee" autocomplete="off">
          </div>
          <div class="form-group">
            <label class="form-label" for="headline">Headline</label>
            <input class="form-input" type="text" id="headline" name="headline" placeholder="e.g. Fuel your workout" autocomplete="off">
          </div>
          <div class="form-group">
            <label class="form-label" for="subline">Subline <span class="opt">(optional)</span></label>
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
            <label class="form-label" for="logo_file">Logo <span class="opt">(optional)</span></label>
            <div class="form-file-row">
              <input class="form-file-input" type="file" id="logo_file" name="logo_file" accept="image/*" aria-label="Choose logo file">
              <input class="form-input" type="url" id="logo_url" name="logo_url" placeholder="Or paste logo URL (https://)" autocomplete="off">
            </div>
          </div>
          <input type="hidden" id="tier" name="tier" value="banner">
        </form>

        <aside class="preview-pane">
          <div id="adPreview" class="ad-preview">
            <div class="preview preview-banner">
              <div class="preview-section-header">
                <span class="preview-section-header-title">BENNY&rsquo;S COFFEE</span>
                <span class="preview-section-sponsored">Sponsored</span>
              </div>
              <div class="preview-img-placeholder" style="height:140px">Image</div>
              <div class="preview-img-divider"></div>
              <div class="preview-body">
                <div class="preview-copy-stack">
                  <strong class="preview-headline">Fuel your workout</strong>
                  <span class="preview-subline">310 N Main St &middot; Open 7am&ndash;9pm</span>
                </div>
                <div class="preview-cta-wrap"><span class="preview-cta-text">View menu</span><span class="preview-cta-arrow">&nearr;</span></div>
              </div>
            </div>
          </div>
          <div class="tier-toggle">
            <button type="button" class="tier-btn" data-tier="text">Text</button>
            <button type="button" class="tier-btn active" data-tier="banner">Banner</button>
            <button type="button" class="tier-btn" data-tier="feature">Feature</button>
          </div>
        </aside>
      </div>
    </section>

    <section id="contact">
      <div class="contact-inner">
        <h2>Contact</h2>
        <div class="contact-cols">
          <p>Send your business name, target dates, and campaign goal, and you&rsquo;ll get a follow-up with format recommendations and availability.</p>
          <a href="mailto:hello@jackhannon.net?subject=Gym%20Tracker%20Advertising%20Inquiry" class="btn-primary">Email me</a>
        </div>
      </div>
    </section>

  </main>

  <footer class="footer">
    <div class="container footer-inner">
    <div class="footer-social">
      <a href="https://jackhannon.net" target="_blank" rel="noopener noreferrer" aria-label="Website">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="M16.5 24c0 1.9.085 3.742.243 5.5h14.514c.158-1.758.243-3.6.243-5.5s-.085-3.742-.244-5.5H16.745c-.16 1.758-.245 3.6-.245 5.5m-2.767-5.5A64 64 0 0 0 13.5 24c0 1.886.08 3.727.232 5.5H2.177C1.735 27.74 1.5 25.897 1.5 24s.235-3.74.677-5.5zm3.366-3H30.9c-.444-3.027-1.116-5.726-1.949-7.943c-.779-2.073-1.669-3.648-2.58-4.676C25.458 1.849 24.652 1.5 24 1.5s-1.458.35-2.372 1.38c-.911 1.03-1.801 2.604-2.58 4.677c-.833 2.217-1.505 4.916-1.95 7.943m17.169 3c.153 1.773.233 3.614.233 5.5s-.08 3.727-.232 5.5h11.555c.442-1.76.677-3.603.677-5.5s-.235-3.74-.677-5.5zm10.573-3H33.931c-.47-3.388-1.214-6.45-2.171-8.998c-.611-1.626-1.323-3.082-2.134-4.293c6.92 1.782 12.55 6.773 15.212 13.291m-30.77 0H3.161C5.822 8.982 11.453 3.991 18.373 2.21c-.81 1.21-1.523 2.666-2.134 4.292c-.957 2.548-1.7 5.61-2.17 8.998m-.003 17H3.161c2.66 6.515 8.286 11.504 15.2 13.288c-.81-1.21-1.52-2.666-2.13-4.29c-.955-2.55-1.697-5.61-2.165-8.998m14.894 7.944c.83-2.217 1.5-4.916 1.944-7.944H17.096c.443 3.028 1.113 5.727 1.944 7.944c.778 2.073 1.667 3.647 2.58 4.675c.912 1.03 1.72 1.381 2.38 1.381s1.468-.351 2.38-1.381c.913-1.028 1.802-2.602 2.58-4.675m2.809 1.053c.955-2.548 1.697-5.61 2.165-8.997h10.905c-2.66 6.515-8.286 11.504-15.2 13.288c.81-1.21 1.52-2.666 2.13-4.29"/></svg>
      </a>
      <a href="https://www.linkedin.com/in/jackphannon/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z"/></svg>
      </a>
      <a href="https://github.com/Hann8n" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512"><path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3 .3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5 .3-6.2 2.3zm44.2-1.7c-2.9 .7-4.9 2.6-4.6 4.9 .3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3 .7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3 .3 2.9 2.3 3.9 1.6 1 3.6 .7 4.3-.7 .7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3 .7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3 .7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"/></svg>
      </a>
      <a href="https://bsky.app/profile/did:plc:tjio2pnbsuc6ps77kocywwmc" target="_blank" rel="noopener noreferrer" aria-label="Bluesky">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M111.8 62.2C170.2 105.9 233 194.7 256 242.4c23-47.6 85.8-136.4 144.2-180.2c42.1-31.6 110.3-56 110.3 21.8c0 15.5-8.9 130.5-14.1 149.2C478.2 298 412 314.6 353.1 304.5c102.9 17.5 129.1 75.5 72.5 133.5c-107.4 110.2-154.3-27.6-166.3-62.9l0 0c-1.7-4.9-2.6-7.8-3.3-7.8s-1.6 3-3.3 7.8l0 0c-12 35.3-59 173.1-166.3 62.9c-56.5-58-30.4-116 72.5-133.5C100 314.6 33.8 298 15.7 233.1C10.4 214.4 1.5 99.4 1.5 83.9c0-77.8 68.2-53.4 110.3-21.8z"/></svg>
      </a>
    </div>
    <div class="footer-links">
      <a href="/ads">Advertise</a>
      <a href="/privacy">Privacy</a>
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
        return p.replace(/^e\\.g\\.\\s*/i, '');
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
        var sectionHeader = '<div class="preview-section-header">' +
          (logo_src ? '<img src="' + escapeHtml(logo_src) + '" alt="" class="preview-section-header-logo" onerror="this.style.display=\\'none\\'">' : '') +
          '<span class="preview-section-header-title">' + escapeHtml(sponsor) + '</span>' +
          '<span class="preview-section-sponsored">Sponsored</span></div>';
        var copyStack = '<div class="preview-copy-stack">' +
          '<strong class="preview-headline">' + escapeHtml(headline) + '</strong>' +
          (subline ? '<span class="preview-subline">' + escapeHtml(subline) + '</span>' : '') +
          '</div>';
        var ctaBtn = '<div class="preview-cta-wrap"><span class="preview-cta-text">' + escapeHtml(cta) + '</span><span class="preview-cta-arrow">&nearr;</span></div>';
        var html;
        if (usesImageLayout) {
          var imgHeight = tier === 'feature' ? 220 : 140;
          html = '<div class="preview preview-' + tier + '">' + sectionHeader;
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
          html = '<div class="preview preview-text">' + sectionHeader + '<div class="preview-text-inner">' + copyStack + ctaBtn + '</div></div>';
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
