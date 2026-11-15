# portfolio

my website :)

[Live site](https://jackhannon.net)

## Structure

- **/** — Main site (Cloudflare Pages)
- Gym Tracker (`gymtracker.jackhannon.net`: landing page, ads API, admin UI) moved to the `Hann8n/gym-tracker` monorepo (`backend/`)

## Deployment

- **Platform:** Cloudflare Pages
- **Config:** [wrangler.jsonc](wrangler.jsonc)

## Attributions

- **Mozilla Text** by Mozilla — [SIL Open Font License 1.1](https://openfontlicense.org)

## License (MIT)

See [LICENSE](LICENSE) for the full license.

## Regression checks

Run `node tests/not-found.mjs` with Node 24+ for source and Worker routing contracts.
Run `node tests/project-pages.mjs` for standalone project documents and links.

With a local Worker running, `node tests/project-navigation.cjs` checks native
project links, browser Back/Forward, direct entry and keyboard navigation.
It uses an existing Playwright installation; set `PLAYWRIGHT_MODULE` and
`CHROMIUM_EXECUTABLE` when those are outside the checkout, and `PREVIEW_URL` for
a server other than `http://127.0.0.1:8895`. Set `EVIDENCE_DIR` to retain screenshots.

The asset adapter in the Node routing checks is mocked; it is not a Cloudflare runtime test.
With `wrangler dev --local --port 8797` running, use
`PREVIEW_URL=http://127.0.0.1:8797 node tests/not-found.mjs` to also check actual
GET/HEAD 404 responses, nested missing pages, existing assets/work pages, and JSON API errors.
The Worker Assets configuration explicitly uses `404-page`, never SPA fallback.
