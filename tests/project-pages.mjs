import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import worker from '../src/index.ts';

const root = new URL('../', import.meta.url);
const home = await readFile(new URL('index.html', root), 'utf8');
const paths = ['/work/gym-tracker/', '/work/orbyt/', '/work/yik-yak/'];
const ctx = { waitUntil() {} };
assert.doesNotMatch(home, /sheet\.js|<dialog\b|shadowrootmode|history\.(pushState|replaceState)/);

for (const path of paths) {
  const source = await readFile(new URL(`${path.slice(1)}index.html`, root), 'utf8');
  assert.ok(home.includes(`href="${path}"`), `${path}: ordinary homepage anchor`);
  assert.match(source, /<a class="case-back" href="\/">← Work<\/a>/);
  assert.equal((source.match(/<h1\b/g) ?? []).length, 1);
  assert.equal((source.match(/<link rel="canonical"/g) ?? []).length, 1);
  assert.ok(source.includes(`href="https://jackhannon.net${path}"`));
  assert.doesNotMatch(source, /<dialog\b|shadowrootmode|sheet\.js/);
  for (const query of ['', '?sheet']) {
    for (const method of ['GET', 'HEAD']) {
      let requests = 0;
      const result = await worker.fetch(new Request(`https://portfolio.test${path}${query}`, { method }), {
        ASSETS: { fetch(request) {
          requests++;
          assert.equal(new URL(request.url).pathname, path, 'project request never fetches the homepage');
          return new Response(method === 'HEAD' ? null : source, {
            headers: { 'content-type': 'text/html; charset=utf-8', etag: 'project-document' },
          });
        } },
      }, ctx);
      assert.equal(requests, 1);
      assert.equal(result.status, 200);
      assert.equal(result.headers.get('etag'), 'project-document');
      assert.equal(await result.text(), method === 'HEAD' ? '' : source);
    }
  }
}
console.log('PASS native project documents, anchors, metadata and GET/HEAD asset passthrough');
