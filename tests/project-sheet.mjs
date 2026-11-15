import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import worker from '../src/index.ts';

const root = new URL('../', import.meta.url);
const home = await readFile(new URL('index.html', root), 'utf8');
const paths = ['/work/gym-tracker/', '/work/orbyt/', '/work/yik-yak/'];
const pages = new Map(await Promise.all(paths.map(async path => [
  path, await readFile(new URL(`${path.slice(1)}index.html`, root), 'utf8'),
])));
const ctx = { waitUntil() {} };
const env = { ASSETS: { fetch(request) {
  const path = new URL(request.url).pathname;
  const html = path === '/' ? home : pages.get(path);
  return new Response(html ?? 'missing', {
    status: html ? 200 : 404,
    headers: { 'content-type': 'text/html; charset=utf-8', etag: 'raw-asset' },
  });
} } };

for (const path of paths) {
  const source = pages.get(path);
  const result = await worker.fetch(new Request(`https://portfolio.test${path}`), env, ctx);
  const html = await result.text();
  const title = source.match(/<title>(.*?)<\/title>/)[1];
  assert.equal(result.status, 200);
  assert.ok(html.includes(`<title>${title}</title>`), `${path}: project title`);
  assert.equal((html.match(/<link rel="canonical"/g) ?? []).length, 1);
  assert.ok(html.includes(`href="https://jackhannon.net${path}"`), `${path}: canonical URL`);
  assert.match(html, /<dialog open /);
  assert.match(html, /<template shadowrootmode="open">/);
  assert.match(html, /<a class="case-back" href="\/">← Work<\/a>/);
  assert.ok(html.includes('href="/Jack_Hannon__Resume_Web.pdf"'), `${path}: root-relative resume`);
  assert.ok(!html.includes('href="style.css'), `${path}: root-relative CSS`);
  assert.equal(result.headers.get('etag'), null, `${path}: composed response has no raw asset validator`);

  const raw = await worker.fetch(new Request(`https://portfolio.test${path}?sheet`), env, ctx);
  assert.equal(await raw.text(), source, `${path}: client fetch receives standalone content`);
  const fallback = await worker.fetch(new Request(`https://portfolio.test${path}`), {
    ASSETS: { fetch: request => new URL(request.url).pathname === '/'
      ? new Response('home unavailable', { status: 503 })
      : new Response(source, { headers: { 'content-type': 'text/html' } }) },
  }, ctx);
  assert.equal(await fallback.text(), source, `${path}: homepage failure preserves the case study`);
}

const missing = await worker.fetch(new Request('https://portfolio.test/work/missing/'), env, ctx);
assert.equal(missing.status, 404);
assert.equal(await missing.text(), 'missing');
console.log('PASS project sheet metadata, direct links, raw content, failure fallback and missing routes');
