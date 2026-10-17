# Gym Tracker Ads API

Cloudflare Worker serving ad config at `gymtracker.jackhannon.net/api/ads`.

## Setup

1. **Install dependencies:** `npm install`

2. **Set admin API key** (required for PUT and schedule GET):
   ```bash
   npx wrangler secret put ADMIN_API_KEY
   ```
   Generate a key: `openssl rand -hex 24`

3. **Deploy:** `npm run deploy`

4. **First-party analytics** — Apply the D1 migration before deploying the Worker:
   ```bash
   npx wrangler d1 migrations apply METRICS --remote
   ```
   No external analytics account or SDK is required. See [analytics-reporting.md](docs/analytics-reporting.md) for definitions, privacy, retention, validation, and reporting conventions.

## Initial KV State

Before any ad has been PUT, GET returns `404` with `{ "error": "No active ad" }`. The app handles this gracefully (shows nothing). After deploy, use the Admin UI or `curl` to add your first ad.

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/ads | None | Return current active ad (filtered by start_at/end_at) |
| GET | /api/ads?schedule=1 | X-API-Key header | Return all scheduled ads (for admin) |
| PUT | /api/ads | X-API-Key header | Upsert ad config (by id) |
| OPTIONS | /api/ads | None | CORS preflight |
| POST | /api/events | Public, rate limited | Allowlisted first-party events |
| GET | /api/admin/stats?days=7 | Cloudflare Access | Overview statistics (7, 30, 90, 180, or 365 days) |
| GET | /api/admin/events?days=7&campaign=ID | Cloudflare Access | Aggregated event readouts |
| GET | /api/admin/campaign-report?id=ID&days=30 | Cloudflare Access | Print-ready campaign report; optional download=1 or format=json |

The API filters ads by `start_at` and `end_at` on the server. Multiple ads can be scheduled; the public GET returns the one active "now". Legacy single-ad config is auto-migrated on first request.

## Schema (AdConfig)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | yes | Unique; e.g. `sponsor-2025-q1` |
| `active` | boolean | yes | Whether ad can be shown |
| `sponsor` | string | yes | Non-empty |
| `sponsored_label` | `"Sponsored" \| "Partner" \| "Student Organization" \| ""` | no | Missing/null defaults to Sponsored; empty hides label |
| `headline` | string | yes | Non-empty |
| `subline` | string \| null | no | Optional |
| `cta` | string | yes | Call-to-action text |
| `destination_url` | string | yes | Must be HTTPS |
| `image_url` | string \| null | tier-dependent | Required for `banner` and `feature`; must be HTTPS |
| `logo_url` | string \| null | no | Optional; if set, must be HTTPS |
| `creative_version` | string | no | Defaults to `""` |
| `placement` | string | no | Defaults to `"home_feed"` |
| `start_at` | string | no | ISO date string; start of active window |
| `end_at` | string | no | ISO date string; end of active window |
| `tier` | `"text" \| "banner" \| "feature"` | no | Defaults to `"banner"` (normalized to lowercase) |

**Tier rules:** `text` — `image_url` optional. `banner` / `feature` — `image_url` required, valid HTTPS.

**Active logic:** An ad is active only if `active` is true, `now >= start_at` (if set), and `now <= end_at` (if set). If multiple ads are active, the one with the latest `start_at` is returned.

Also see [ad-config-schema.md](https://github.com/Hann8n/VTGymTracker/blob/main/docs/ad-config-schema.md) in the Gym Tracker repo.

## Seed First Config

After deploy, add your first ad via Admin UI or `curl`. Run from the `gymtracker/` directory:

```bash
# Replace YOUR_ADMIN_API_KEY with the secret from step 2

# Placeholder (inactive) — GET returns 404 until you activate
curl -X PUT https://gymtracker.jackhannon.net/api/ads \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_ADMIN_API_KEY" \
  -d @seed-ad.json

# Test ad (active) — use for end-to-end verification
curl -X PUT https://gymtracker.jackhannon.net/api/ads \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_ADMIN_API_KEY" \
  -d @seed-ad-active.json
```

For local dev (with `npx wrangler dev` running), use `http://localhost:8787` instead of the production URL.

**Admin UI:** Visit [https://gymtracker.jackhannon.net/admin](https://gymtracker.jackhannon.net/admin) — sign in with Cloudflare Access (Google or your configured provider). See [ACCESS_SETUP.md](ACCESS_SETUP.md) to configure.

**Ads landing page:** Public sales page with mockup wizard at [/ads](https://gymtracker.jackhannon.net/ads). Local dev: run `npx wrangler dev` from this directory, then open http://localhost:8787/ads (port may vary — check wrangler output).
