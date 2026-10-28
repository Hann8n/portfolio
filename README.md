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

## Not-found regression checks

Run `node tests/not-found.mjs` with Node 24+ for source and Worker routing contracts.
The asset adapter in these checks is mocked; it is not a Cloudflare runtime test.
With `wrangler dev --local --port 8797` running, use
`PREVIEW_URL=http://127.0.0.1:8797 node tests/not-found.mjs` to also check actual
GET/HEAD 404 responses, nested missing pages, existing assets/work pages, and JSON API errors.
The Worker Assets configuration explicitly uses `404-page`, never SPA fallback.
