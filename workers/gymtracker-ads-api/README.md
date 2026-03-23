# Gym Tracker Ads API

Cloudflare Worker serving ad config at `gymtracker.jackhannon.net/api/ads`.

## Setup

1. **Install dependencies:** `npm install`

2. **Set admin API key** (required for PUT):
   ```bash
   npx wrangler secret put ADMIN_API_KEY
   ```
   Generate a key: `openssl rand -hex 24`

3. **Deploy:** `npm run deploy`

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/ads | None | Return current active ad (filtered by start_at/end_at) |
| GET | /api/ads?schedule=1 | X-API-Key header | Return all scheduled ads (for admin) |
| PUT | /api/ads | X-API-Key header | Upsert ad config (by id) |
| OPTIONS | /api/ads | None | CORS preflight |

## Scheduling

- Use `start_at` and `end_at` (ISO8601) to schedule when an ad is live.
- Multiple ads can be scheduled; the API returns the one active "now" on public GET.
- Ads without dates are always eligible (if active). Overlapping windows: most recently started wins.

## Admin UI

Manage ads at https://jackhannon.net/gymtracker-ads-admin.html
