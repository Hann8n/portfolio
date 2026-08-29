/** Main landing page — served at /. Simple app promo with App Store badge. */
export function getMainLandingHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>Gym Tracker | Crowd tracking for VT gyms</title>
  <meta name="description" content="Gym Tracker gives Virginia Tech students live crowd tracking for McComas and War Memorial gyms.">
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
      --muted: #767676;
      --link-color: #c95a7a;
      --link-hover-color: #E5751F;
      --border: #e5e5e5;
    }
    .dark-theme {
      --bg-color: #1a1a1a;
      --text-color: #e0e0e0;
      --muted: #8a8a8a;
      --border: #2e2e2e;
    }
    @media (prefers-color-scheme: dark) {
      :root:not(.light-theme):not(.dark-theme) {
        --bg-color: #1a1a1a;
        --text-color: #e0e0e0;
        --muted: #8a8a8a;
        --border: #2e2e2e;
      }
    }
    *, *::before, *::after { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    body {
      background: var(--bg-color);
      color: var(--text-color);
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 16px;
      line-height: 1.65;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      -webkit-font-smoothing: antialiased;
    }
    .main {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
      text-align: left;
      padding: clamp(32px, 8vw, 72px) clamp(24px, 6vw, 64px);
      max-width: 560px;
    }
    .logo {
      width: 72px;
      height: 72px;
      object-fit: contain;
      margin-bottom: 16px;
    }
    h1 {
      font-size: clamp(2rem, 5vw, 2.5rem);
      font-weight: 700;
      letter-spacing: -0.02em;
      margin: 0 0 12px;
    }
    .tagline {
      color: var(--muted);
      margin: 0 0 24px;
    }
    .store-link { display: inline-block; }
    .store-link img {
      width: 165px;
      height: 55px;
      vertical-align: middle;
      object-fit: contain;
      pointer-events: none;
      user-select: none;
      -webkit-user-drag: none;
    }
    .footer {
      border-top: 1px solid var(--border);
      padding: 20px 0;
    }
    .footer-inner {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
      padding: 0 clamp(24px, 6vw, 64px);
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

    @media (min-width: 1024px) {
      .footer-inner { flex-direction: row; justify-content: space-between; }
    }
  </style>
</head>
<body>
  <main class="main">
    <img src="/logo.png" alt="" class="logo" width="72" height="72">
    <h1>Gym Tracker</h1>
    <p class="tagline">Crowd tracking for VT gyms.</p>
    <a href="https://apps.apple.com/us/app/vt-gym-tracker/id6736409867?itscg=30200&itsct=apps_box_badge&mttnsubad=6736409867" class="store-link" target="_blank" rel="noopener noreferrer">
      <img src="https://toolbox.marketingtools.apple.com/api/v2/badges/download-on-the-app-store/black/en-us?releaseDate=1737590400" alt="Download on the App Store">
    </a>
  </main>
  <footer class="footer">
    <div class="footer-inner">
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
</body>
</html>`;
}
