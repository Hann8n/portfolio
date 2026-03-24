/** Main landing page — served at /. Simple app promo with App Store badge. */
export function getMainLandingHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>Gym Tracker | Check McComas and War Memorial before you go</title>
  <meta name="description" content="Gym Tracker lets Virginia Tech students check McComas and War Memorial gym occupancy before they go.">
  <link rel="icon" href="/favicon/favicon.ico" sizes="any">
  <link rel="icon" href="/favicon/favicon-32x32.png" type="image/png" sizes="32x32">
  <link rel="icon" href="/favicon/favicon-16x16.png" type="image/png" sizes="16x16">
  <link rel="apple-touch-icon" href="/favicon/apple-touch-icon.png" sizes="180x180">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Plus+Jakarta+Sans:wght@400;500&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --maroon: #861F41;
      --maroon-deep: #3a0d1e;
      --orange: #E87722;
      --text: #1a1614;
      --muted: #7a7270;
      --font-display: 'Bebas Neue', sans-serif;
      --font-body: 'Plus Jakarta Sans', system-ui, sans-serif;
    }
    html { scroll-behavior: smooth; }
    body {
      font-family: var(--font-body);
      font-size: 16px;
      line-height: 1.65;
      color: var(--text);
      background: var(--maroon-deep);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }
    .main {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: clamp(32px, 8vw, 72px) clamp(24px, 5vw, 48px);
      max-width: 480px;
      margin: 0 auto;
    }
    .logo {
      width: 72px;
      height: 72px;
      object-fit: contain;
      margin-bottom: 20px;
    }
    h1 {
      font-family: var(--font-display);
      font-size: clamp(2.5rem, 8vw, 4rem);
      font-weight: 400;
      letter-spacing: 0.06em;
      color: #fff;
      line-height: 1;
      margin-bottom: 12px;
    }
    .tagline {
      font-size: 1rem;
      color: rgba(255,255,255,0.7);
      margin-bottom: 28px;
      line-height: 1.6;
    }
    .store-link {
      display: inline-block;
      cursor: pointer;
    }
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
      padding: 20px 24px;
      border-top: 1px solid rgba(255,255,255,0.1);
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 8px 20px;
    }
    .footer a {
      font-size: 0.8125rem;
      color: rgba(255,255,255,0.5);
      text-decoration: none;
    }
    .footer a:hover {
      color: var(--orange);
    }
  </style>
</head>
<body>
  <main class="main">
    <img src="/logo.png" alt="" class="logo" width="72" height="72">
    <h1>GYM TRACKER</h1>
    <p class="tagline">Check McComas and War Memorial before you go.</p>
    <a href="https://apps.apple.com/us/app/vt-gym-tracker/id6736409867?itscg=30200&itsct=apps_box_badge&mttnsubad=6736409867" class="store-link" target="_blank" rel="noopener noreferrer">
      <img src="https://toolbox.marketingtools.apple.com/api/v2/badges/download-on-the-app-store/black/en-us?releaseDate=1737590400" alt="Download on the App Store">
    </a>
  </main>
  <footer class="footer">
      <a href="/ads">Advertise</a>
      <a href="https://tangled.org/jack.orbyt.video/VTGymTracker" target="_blank" rel="noopener noreferrer">Tangled</a>
      <a href="https://github.com/Hann8n/VTGymTracker" target="_blank" rel="noopener noreferrer">GitHub</a>
      <a href="/privacy">Privacy</a>
      <a href="https://jackhannon.net" target="_blank" rel="noopener noreferrer">jackhannon.net</a>
  </footer>
</body>
</html>`;
}
