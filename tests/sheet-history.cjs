const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:8895';
const gym = '/work/gym-tracker/';
const orbyt = '/work/orbyt/';
const results = [];

(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.CHROMIUM_EXECUTABLE ? { executablePath: process.env.CHROMIUM_EXECUTABLE } : {}),
  });
  async function check(name, width, scenario) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    page.setDefaultTimeout(5000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    try {
      await scenario(page);
      assert.deepEqual(errors, [], 'no page errors');
      results.push({ name, width, passed: true });
    } catch (error) {
      results.push({ name, width, passed: false, message: error.message.split('\n')[0], url: page.url() });
    } finally {
      await context.close();
    }
  }
  async function project(page, direct) {
    await page.goto(base + (direct ? gym : '/'));
    if (!direct) await page.locator(`.work-item[href="${gym}"]`).click();
    await page.locator('dialog[open]').waitFor();
    await page.waitForTimeout(650);
  }
  async function next(page) {
    await page.locator(`.sheet-content a[href="${orbyt}"]`).click();
    await page.waitForFunction(() => document.querySelector('.sheet-content').shadowRoot.querySelector('h1')?.textContent === 'Orbyt');
  }
  async function home(page) {
    await page.waitForURL(base + '/', { timeout: 2000 });
    await page.waitForFunction(() => !document.querySelector('dialog')?.open, null, { timeout: 2000 });
    assert.equal(await page.title(), 'Jack Hannon');
    assert.equal(await page.locator('.sheet-content h1').count(), 0);
  }
  async function delayedNext(page, outcome, reopen = false) {
    let release;
    let started;
    let finished;
    const loading = new Promise(resolve => { started = resolve; });
    const complete = new Promise(resolve => { finished = resolve; });
    const gate = new Promise(resolve => { release = resolve; });
    await page.route('**/work/orbyt/?sheet', async route => {
      const response = outcome === 'success' ? await route.fetch() : null;
      started();
      await gate;
      try {
        if (response) await route.fulfill({ response });
        else await route.abort();
      } finally { finished(); }
    });
    await project(page, false);
    await page.locator(`.sheet-content a[href="${orbyt}"]`).click();
    await Promise.race([loading, new Promise((_, reject) => setTimeout(() => reject(new Error('Next request did not start')), 2000))]);
    await page.locator('.sheet-close').click();
    await home(page);
    if (reopen) {
      await page.locator(`.work-item[href="${gym}"]`).click();
      await page.waitForURL(base + gym);
      await page.waitForTimeout(650);
    }
    release();
    await complete;
    await page.waitForTimeout(700);
    if (reopen) {
      assert.equal(new URL(page.url()).pathname, gym);
      assert.equal(await page.locator('.sheet-content h1').textContent(), 'Gym Tracker');
    } else {
      await home(page);
      assert.equal(await page.evaluate(() => history.state), null);
    }
  }
  try {
    for (const width of [1440, 390]) {
      for (const control of ['close', 'Escape']) {
        await check(`direct → Next → ${control} returns home`, width, async page => {
          await page.goto('data:text/html,<title>Previous site</title>');
          await project(page, true);
          await next(page);
          if (control === 'close') await page.locator('.sheet-close').click();
          else await page.keyboard.press('Escape');
          await home(page);
        });
      }
      await check('home → Next → Close preserves Back/Forward', width, async page => {
        await project(page, false);
        await next(page);
        await page.locator('.sheet-close').click();
        await home(page);
        await page.goForward();
        await page.waitForURL(base + orbyt);
        await page.waitForFunction(() => document.querySelector('dialog').open);
        assert.equal(await page.locator('.sheet-content h1').textContent(), 'Orbyt');
      });
      await check('rapid Back/Forward keeps the restored sheet open', width, async page => {
        await project(page, false);
        await page.evaluate(() => {
          history.back();
          setTimeout(() => history.forward(), 25);
        });
        await page.waitForTimeout(1000);
        assert.equal(new URL(page.url()).pathname, gym);
        assert.ok(await page.locator('dialog').evaluate(dialog => dialog.open));
        assert.equal(await page.locator('.sheet-content h1').textContent(), 'Gym Tracker');
      });
      await check('repeated close controls finish dismissal', width, async page => {
        await project(page, false);
        await page.locator('.sheet-close').click();
        await page.waitForTimeout(20);
        await page.keyboard.press('Escape');
        await home(page);
      });
      await check('persisted pageshow retains a direct project with null state', width, async page => {
        await project(page, true);
        assert.equal(await page.evaluate(() => history.state), null);
        await page.evaluate(() => dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })));
        assert.equal(new URL(page.url()).pathname, gym);
        assert.ok(await page.locator('dialog').evaluate(dialog => dialog.open));
        assert.equal(await page.locator('.sheet-content h1').textContent(), 'Gym Tracker');
      });
      await check('persisted pageshow clears a stale sheet on the home URL', width, async page => {
        await project(page, true);
        await page.evaluate(() => {
          history.replaceState(null, '', '/');
          dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
        });
        await home(page);
      });
      for (const outcome of ['success', 'failure']) {
        await check(`pending Next ${outcome} cannot change a closed sheet`, width, page => delayedNext(page, outcome));
      }
      await check('pending Next cannot overwrite a reopened project', width, page => delayedNext(page, 'success', true));
    }
  } finally {
    await browser.close();
  }
  console.log(JSON.stringify({ base, results, passed: results.every(result => result.passed) }, null, 2));
  if (results.some(result => !result.passed)) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
