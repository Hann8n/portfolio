import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import worker from '../src/index.ts';

const root = new URL('../', import.meta.url);
const html = await readFile(new URL('404.html', root), 'utf8');
const css = await readFile(new URL('style.css', root), 'utf8');
const config = JSON.parse(await readFile(new URL('wrangler.jsonc', root), 'utf8'));
assert.equal(config.assets.not_found_handling, '404-page');
assert.equal(config.assets.run_worker_first, true);
assert.match(html, /<h1[^>]*>404 · Page not found<\/h1>/);
assert.match(html, /href="\/"/);
assert.match(html, /href="\/style.css\?v=404-20261028"/);
assert.match(html, /class="profile not-found"/);
assert.match(css, /\.not-found-home:focus-visible/);
assert.match(css, /prefers-reduced-motion: reduce/);
assert.match(css, /prefers-color-scheme: dark/);
assert.match(html, /name="robots" content="noindex"/);
assert.ok(!html.includes('<script'));

// Worker routing contract. Asset adapter deliberately returns 404: this checks
// preservation, not Cloudflare's runtime asset-resolution implementation.
const ctx = { waitUntil() {} };
for (const path of ['/api', '/api/missing', '/api/missing/nested']) {
  const result = await worker.fetch(new Request(`https://portfolio.test${path}`), {
    ASSETS: { fetch() { throw new Error('API must not fall through to HTML'); } },
  }, ctx);
  assert.equal(result.status, 404);
  assert.match(result.headers.get('content-type'), /application\/json/);
  assert.deepEqual(await result.json(), { error: 'Not found' });
}
for (const path of ['/missing', '/missing/nested', '/images/missing.png']) {
  const result = await worker.fetch(new Request(`https://portfolio.test${path}`), {
    ASSETS: { fetch: () => new Response(html, { status: 404 }) },
  }, ctx);
  assert.equal(result.status, 404);
}
for (const path of ['/', '/style.css', '/work/gym-tracker/']) {
  const result = await worker.fetch(new Request(`https://portfolio.test${path}`), {
    ASSETS: { fetch: request => {
      assert.equal(new URL(request.url).pathname, path);
      return new Response('existing asset', { status: 200 });
    } },
  }, ctx);
  assert.equal(result.status, 200);
}
console.log('PASS source/config and Worker routing contracts (mock assets)');

// Optional real HTTP verification against `wrangler dev --local --port 8797`.
if (process.env.PREVIEW_URL) {
  const base = process.env.PREVIEW_URL;
  for (const path of ['/missing-404-test', '/missing-404-test/nested', '/work/missing-404-test/']) {
    for (const method of ['GET', 'HEAD']) {
      const result = await fetch(new URL(path, base), { method });
      assert.equal(result.status, 404, `${method} ${path}`);
      if (method === 'GET') assert.match(await result.text(), /404 · Page not found/);
    }
  }
  for (const path of ['/', '/style.css', '/fonts/mozilla-text-400.woff2', '/work/gym-tracker/', '/work/orbyt/']) {
    assert.equal((await fetch(new URL(path, base))).status, 200, path);
  }
  for (const path of ['/api', '/api/missing-404-test/nested']) {
    const result = await fetch(new URL(path, base));
    assert.equal(result.status, 404);
    assert.match(result.headers.get('content-type'), /application\/json/);
  }
  console.log('PASS real HTTP GET/HEAD 404, valid routes/assets and JSON API checks');
}
