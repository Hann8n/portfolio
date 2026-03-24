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

4. **(Optional) PostHog analytics** — To show ad impressions, clicks, and CTR in the Overview:
   - Create a [Personal API key](https://us.posthog.com/settings/user-api-keys#personal-api-keys) with `query:read` scope
   - `npx wrangler secret put POSTHOG_PERSONAL_API_KEY`
   - Project ID and host are in `wrangler.jsonc` vars; override via `POSTHOG_PROJECT_ID` / `POSTHOG_HOST` if needed
   - The app must send `ad_impression` and `ad_tap` events to PostHog

## Initial KV State

Before any ad has been PUT, GET returns `404` with `{ "error": "No active ad" }`. The app handles this gracefully (shows nothing). After deploy, use the Admin UI or `curl` to add your first ad.

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/ads | None | Return current active ad (filtered by start_at/end_at) |
| GET | /api/ads?schedule=1 | X-API-Key header | Return all scheduled ads (for admin) |
| PUT | /api/ads | X-API-Key header | Upsert ad config (by id) |
| OPTIONS | /api/ads | None | CORS preflight |

The API filters ads by `start_at` and `end_at` on the server. Multiple ads can be scheduled; the public GET returns the one active "now". Legacy single-ad config is auto-migrated on first request.

## Schema (AdConfig)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | yes | Unique; e.g. `sponsor-2025-q1` |
| `active` | boolean | yes | Whether ad can be shown |
| `sponsor` | string | yes | Non-empty |
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
