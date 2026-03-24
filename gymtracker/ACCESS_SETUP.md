# Cloudflare Access Setup for Gym Tracker Ads Admin

This guide configures Cloudflare Access so you sign in with Google (or another provider) instead of using an API key.

## Prerequisites

- Cloudflare Zero Trust (free tier is fine)
- Your domain `jackhannon.net` on Cloudflare with the zone active

## Step 1: Enable Zero Trust

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → **Zero Trust**
2. If prompted, create a team (e.g. `jackhannon` — you'll get a `*.cloudflareaccess.com` subdomain)

## Step 2: Create an Access Application for the Admin

**Important:** Both `/admin` and `/api/admin` must be protected. If only `/admin` is protected, unauthenticated requests can hit `/api/admin/ads` directly.

1. In Zero Trust: **Access** → **Applications** → **Add an application**
2. Choose **Self-hosted**
3. Configure:
   - **Application name**: `Gym Tracker Ads Admin`
   - **Session Duration**: 24 hours (or your preference)
   - **Application domain**:
     - **Subdomain**: `gymtracker`
     - **Domain**: `jackhannon.net`
     - **Path**: `/admin` (you will add `/api/admin` in Step 3)
   - Click **Next**

4. Add a **Policy**:
   - **Policy name**: `Require Google login`
   - **Action**: **Allow**
   - **Configure rules** → **Add include**:
     - **Selector**: Emails ending in → `@jackhannon.net` (or use "Emails" and add your email)
     - Or: **Login methods** → Add **Google**
   - Click **Next**

5. **Protect the API** — You must also protect `/api/admin` (required, not optional):
   - The admin UI at `/admin` fetches and saves ads via `/api/admin/ads`. If `/api/admin` is not protected, anyone can list and modify ads without signing in.

## Step 3: Protect `/api/admin` (required)

To protect the admin API so only signed-in users can fetch/save ads:

**Option A — Same application, broader path**

Edit the application you created. Change the **Path** to include both:
- Path: `/admin`
- Add another path: `/api/admin`

(Cloudflare Access lets you add multiple paths in one application.)

**Option B — Second application**

1. **Add an application** → Self-hosted
2. **Application domain**:
   - Subdomain: `gymtracker`
   - Domain: `jackhannon.net`
   - Path: `/api/admin`
3. Use the same policy as above (e.g. Google login).

## Step 4: Ensure Public API Stays Open

The public endpoint `GET https://gymtracker.jackhannon.net/api/ads` must **not** require Access. The Gym Tracker app fetches ads without auth.

- If you only protect `/admin` and `/api/admin`, `/api/ads` stays public.
- If you protect `/api/*`, add a **Bypass** policy that runs first:
  - Policy: **Bypass**
  - Include: **Everyone**
  - Path: `/api/ads` (exact)

## Step 5: Add an Identity Provider (Google)

1. Zero Trust → **Settings** → **Authentication**
2. **Login methods** → **Add new**
3. Choose **Google**
4. Follow the prompts (create OAuth credentials in Google Cloud Console if needed)

## Step 6: Verify Access Path Coverage

Before testing, confirm in Zero Trust that both paths are protected:

- [ ] `/admin` — Admin UI page
- [ ] `/api/admin` — Admin API (includes `/api/admin/ads`, `/api/admin/stats`)

If you use a single application with multiple paths, ensure both are included. If you use separate applications, ensure each has the correct path.

## Step 7: Test

1. Visit **https://gymtracker.jackhannon.net/admin**
2. You should see the Cloudflare Access login page
3. Sign in with Google
4. You should land on the admin UI with no API key needed
5. Click **Refresh** — it should load your ads
6. Edit and save — it should work without an API key

## Troubleshooting

- **Browser console: “Failed to load resource: You do not have permission to access the requested resource”** (Safari/WebKit especially):
  - Often a **subresource** blocked by **Cloudflare Access** because the Access application path is too broad (e.g. whole subdomain or `/*`). Narrow the app to only **`/admin`** and **`/api/admin`**, or add a **Bypass** for static paths such as **`/favicon/*`** and **`/vendor/*`** used by the admin page.
  - Less often: a **third‑party CDN** blocked by network or extensions. The admin now loads **Flatpickr from** `https://gymtracker.jackhannon.net/vendor/flatpickr/...` (same origin) so date pickers work without jsDelivr.
- **401 Unauthorized** on `/admin`: Access may not be protecting that path yet, or the JWT isn’t being sent. Confirm the Access application path matches `/admin` and `/api/admin`.
- **Admin loads but ad list is empty, status shows Connected**:
  - In DevTools → **Network**, open the request to `/api/admin/ads`. You should see **200** and a JSON body like `{ "ads": [ ... ] }`. If the response is HTML or a login page, `/api/admin` is not covered by Access or the request is going to the wrong host (open admin only at `https://gymtracker.jackhannon.net/admin`).
  - **Production KV is separate from preview**: ads you create in `wrangler dev` use the **preview** KV namespace. Production uses the namespace id in `wrangler.jsonc` (`kv_namespaces.id`). To backfill production data, use `wrangler kv key put` against the **production** namespace or create ads again after signing in on prod.
- **CORS errors**: The Worker allows `gymtracker.jackhannon.net`. If you use another origin, add it to `ALLOWED_ORIGINS` in the Worker.
- **Public API blocked**: Ensure `/api/ads` is not covered by a “Require” policy, or add a Bypass policy for it.

## Deploy After Setup

After configuring Access:

```bash
npm run deploy
```

The Worker serves `/admin` and `/api/admin/ads` and treats a request as authenticated when Cloudflare adds **`Cf-Access-Jwt-Assertion`** or **`Cf-Access-Authenticated-User-Email`** (after a successful Access login). No API key is required for the admin UI when Access is configured correctly.
