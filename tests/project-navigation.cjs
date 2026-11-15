const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:8895';
const evidence = process.env.EVIDENCE_DIR;
const projects = [
  ['/work/gym-tracker/', 'Gym Tracker'],
  ['/work/orbyt/', 'Orbyt'],
  ['/work/yik-yak/', 'Yik Yak, Virginia Tech'],
];
if (evidence) fs.mkdirSync(evidence, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE ? { executablePath: process.env.CHROMIUM_EXECUTABLE } : {}) });
  const results = [];
  const errors = [];
  const documentRequests = [];
  const removedRequests = [];
  async function clickDocument(page, locator, expected, keyboard = false) {
    const before = await page.evaluate(() => window.__navigationDocument);
    const request = page.waitForRequest(r => r.isNavigationRequest() && new URL(r.url()).pathname === expected);
    if (keyboard) { await locator.focus(); await page.keyboard.press('Enter'); }
    else await locator.click();
    await request;
    await page.waitForURL(base + expected);
    await page.waitForLoadState('domcontentloaded');
    assert.notEqual(await page.evaluate(() => window.__navigationDocument), before, 'anchor loads a new document');
  }
  async function screenshot(page, name) {
    if (evidence) await page.screenshot({ path: path.join(evidence, name), fullPage: false });
  }
  try {
    for (const mode of [
      { width: 1440, height: 1000, colorScheme: 'light' },
      { width: 390, height: 844, colorScheme: 'light', isMobile: true, hasTouch: true },
      { width: 320, height: 720, colorScheme: 'dark', isMobile: true, hasTouch: true, reducedMotion: 'reduce' },
    ]) {
      const context = await browser.newContext({ viewport: { width: mode.width, height: mode.height }, ...mode });
      await context.addInitScript(() => { window.__navigationDocument = `${Date.now()}:${Math.random()}`; });
      const page = await context.newPage();
      page.setDefaultTimeout(10000);
      page.on('pageerror', error => errors.push(error.message));
      page.on('request', r => {
        if (r.isNavigationRequest()) documentRequests.push(new URL(r.url()).pathname);
        if (/\/sheet\.js|\?sheet(?:&|$)/.test(r.url())) removedRequests.push(r.url());
      });
      await page.goto(base, { waitUntil: 'domcontentloaded' });
      await page.evaluate(() => document.fonts.ready);
      await screenshot(page, `home-${mode.width}.png`);
      for (const [route, title] of projects) {
        await clickDocument(page, page.locator(`.work-item[href="${route}"]`), route);
        assert.equal(await page.locator('h1').textContent(), title);
        assert.equal(await page.locator('dialog, .sheet, .sheet-scroll').count(), 0);
        assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://jackhannon.net' + route);
        const state = await page.evaluate(async () => {
          for (let y = 0; y < document.documentElement.scrollHeight; y += 600) {
            scrollTo(0, y);
            await new Promise(resolve => setTimeout(resolve, 20));
          }
          await Promise.all([...document.images].map(image => image.decode().catch(() => {})));
          await document.fonts.ready;
          scrollTo(0, 0);
          return {
            overflow: document.documentElement.scrollWidth > innerWidth,
            broken: [...document.images].filter(image => !image.naturalWidth).map(image => image.src),
            links: [...document.querySelectorAll('a[href]')].map(a => a.href).filter(href => href.startsWith(location.origin)),
          };
        });
        assert.equal(state.overflow, false);
        assert.deepEqual(state.broken, []);
        for (const href of state.links) assert.equal((await page.request.get(href)).status(), 200, href);
        await screenshot(page, `${route.split('/')[2]}-${mode.width}.png`);
        await page.keyboard.press('Tab');
        assert.ok(await page.locator('.case-back').evaluate(a => a === document.activeElement && a.matches(':focus-visible') && getComputedStyle(a).outlineStyle !== 'none'));
        await page.keyboard.press('PageDown');
        await page.waitForTimeout(250);
        assert.ok(await page.evaluate(() => scrollY > 0), 'native keyboard scrolling works');
        if (route.includes('yik-yak')) {
          const van = page.locator('img[src="/images/work/yy-van.webp"]');
          await van.scrollIntoViewIfNeeded();
          assert.deepEqual(await van.evaluate(i => [i.naturalWidth, i.naturalHeight]), [640,685]);
          await screenshot(page, `yik-yak-van-${mode.width}.png`);
          await page.evaluate(() => scrollTo(0, 0));
          await page.mouse.move(mode.width / 2, mode.height / 2);
          await page.mouse.wheel(0, 500);
          await page.waitForTimeout(200);
          assert.ok(await page.evaluate(() => scrollY > 0), 'native wheel scrolling works');
          if (mode.hasTouch) {
            await page.evaluate(() => scrollTo(0, 0));
            const cdp = await context.newCDPSession(page);
            const x = mode.width / 2, y = mode.height * 0.7;
            await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 0 }] });
            for (let i = 1; i <= 6; i++) {
              await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y - 40 * i, id: 0 }] });
              await page.waitForTimeout(30);
            }
            await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
            await page.waitForTimeout(200);
            assert.ok(await page.evaluate(() => scrollY > 0), 'native touch scrolling works');
            await cdp.detach();
          }
        }
        await page.goBack({ waitUntil: 'domcontentloaded' });
        assert.equal(new URL(page.url()).pathname, '/');
        await page.goForward({ waitUntil: 'domcontentloaded' });
        assert.equal(await page.locator('h1').textContent(), title);
        await clickDocument(page, page.locator('.case-back'), '/');
        results.push({ width: mode.width, route, nativeDocument: true, backForward: true, keyboard: true, images: 'loaded', overflow: false });
      }
      await clickDocument(page, page.locator('.work-item').first(), projects[0][0], true);
      await clickDocument(page, page.locator(`a[href="${projects[1][0]}"]`), projects[1][0]);
      await page.goBack({ waitUntil: 'domcontentloaded' });
      assert.equal(new URL(page.url()).pathname, projects[0][0]);
      await page.goForward({ waitUntil: 'domcontentloaded' });
      assert.equal(new URL(page.url()).pathname, projects[1][0]);
      for (const [route, title] of projects) {
        await page.goto(base + route, { waitUntil: 'domcontentloaded' });
        assert.equal(await page.locator('h1').textContent(), title);
        await page.reload({ waitUntil: 'domcontentloaded' });
        assert.equal(await page.locator('h1').textContent(), title);
      }
      await page.goto('data:text/html,<title>Previous site</title>');
      await page.goto(base + projects[0][0], { waitUntil: 'domcontentloaded' });
      await clickDocument(page, page.locator(`a[href="${projects[1][0]}"]`), projects[1][0]);
      await page.goBack({ waitUntil: 'domcontentloaded' });
      assert.equal(new URL(page.url()).pathname, projects[0][0]);
      await page.goBack({ waitUntil: 'domcontentloaded' });
      assert.equal(await page.title(), 'Previous site');
      await context.close();
    }
    const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const page = await nojs.newPage();
    for (const [route, title] of projects) {
      await page.goto(base);
      await page.locator(`.work-item[href="${route}"]`).click();
      await page.waitForURL(base + route);
      assert.equal(await page.locator('h1').textContent(), title);
      await page.locator('.case-back').click();
      await page.waitForURL(base + '/');
    }
    await nojs.close();
    assert.deepEqual(errors, []);
    assert.deepEqual(removedRequests, []);
    const report = { base, results, directEntry: 'passed', repeatedLinks: 'passed', keyboardLinks: 'passed', noJavaScript: 'passed', pageErrors: errors, documentNavigationRequests: documentRequests.length, overlayRequests: removedRequests };
    if (evidence) fs.writeFileSync(path.join(evidence, 'checks.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify({ base, passed: true, projectViewportPairs: results.length, documentNavigationRequests: documentRequests.length, widths: [1440,390,320], noJavaScript: 'passed', pageErrors: errors }));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
