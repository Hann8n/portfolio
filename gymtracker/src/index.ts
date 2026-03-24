/**
 * Gym Tracker Ads API
 *
 * Public:
 *   GET /api/ads — return current active ad (filtered by start_at/end_at)
 *
 * Admin (Cloudflare Access protected — Cf-Access-Jwt-Assertion required):
 *   GET /api/admin/ads — return all scheduled ads
 *   PUT /api/admin/ads — upsert ad by id
 *   DELETE /api/admin/ads?id=... — delete ad by id
 *
 * Legacy (API key, for backward compat):
 *   GET /api/ads?schedule=1 — return all ads (X-API-Key)
 *   PUT /api/ads — upsert ad (X-API-Key)
 *
 * Admin UI:
 *   GET /admin — serve admin page (Access protected)
 */

interface AdConfig {
  id: string;
  active: boolean;
  sponsor: string;
  headline: string;
  subline?: string | null;
  cta: string;
  destination_url: string;
  image_url?: string | null;
  logo_url?: string | null;
  creative_version?: string;
  placement?: string;
  start_at?: string;
  end_at?: string;
  tier?: string;
}

const KV_KEY_LEGACY = "active_ad";
const KV_KEY_ADS = "ads";

const ALLOWED_ORIGINS = [
  "https://gymtracker.jackhannon.net",
  "https://jackhannon.net",
  "https://www.jackhannon.net",
  "https://jackhannon.me",
  "https://www.jackhannon.me",
  "http://localhost:8788",
  "http://127.0.0.1:8788",
];

const NO_CACHE_HEADERS: Record<string, string> = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
  Pragma: "no-cache",
};

function corsHeaders(origin: string | null): Record<string, string> {
  const allow =
    origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
    "Access-Control-Max-Age": "86400",
  };
}

function jsonResponse(
  body: object,
  status: number,
  request: Request,
  extraHeaders: Record<string, string> = {}
): Response {
  const origin = request.headers.get("Origin");
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...NO_CACHE_HEADERS,
      ...corsHeaders(origin),
      ...extraHeaders,
    },
  });
}

function isValidUrl(s: string): boolean {
  try {
    return new URL(s).protocol === "https:";
  } catch {
    return false;
  }
}

function validateAdConfig(
  obj: unknown
): { valid: true; config: AdConfig } | { valid: false; error: string } {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
    return { valid: false, error: "Invalid JSON: expected object" };
  }

  const o = obj as Record<string, unknown>;

  const id = o.id;
  if (typeof id !== "string" || !id.trim()) {
    return { valid: false, error: "Missing or invalid required field: id" };
  }

  if (typeof o.active !== "boolean") {
    return {
      valid: false,
      error: "Missing or invalid required field: active (must be boolean)",
    };
  }

  const sponsor = o.sponsor;
  if (typeof sponsor !== "string" || !sponsor.trim()) {
    return { valid: false, error: "Missing or invalid required field: sponsor" };
  }

  const headline = o.headline;
  if (typeof headline !== "string" || !headline.trim()) {
    return { valid: false, error: "Missing or invalid required field: headline" };
  }

  const cta = o.cta;
  if (typeof cta !== "string" || !cta.trim()) {
    return { valid: false, error: "Missing or invalid required field: cta" };
  }

  const destination_url = o.destination_url;
  if (typeof destination_url !== "string" || !destination_url.trim()) {
    return {
      valid: false,
      error: "Missing or invalid required field: destination_url",
    };
  }
  if (!isValidUrl(destination_url)) {
    return { valid: false, error: "destination_url must be a valid HTTPS URL" };
  }

  const tier =
    typeof o.tier === "string" ? o.tier.toLowerCase() : "banner";
  if (tier !== "text" && tier !== "banner" && tier !== "feature") {
    return {
      valid: false,
      error: "tier must be 'text', 'banner', or 'feature'",
    };
  }

  if (tier === "banner" || tier === "feature") {
    const image_url = o.image_url;
    if (image_url != null && typeof image_url !== "string") {
      return {
        valid: false,
        error: "image_url must be string or null for banner/feature tier",
      };
    }
    if (typeof image_url !== "string" || !image_url.trim()) {
      return { valid: false, error: `tier '${tier}' requires image_url` };
    }
    if (!isValidUrl(image_url)) {
      return { valid: false, error: "image_url must be a valid HTTPS URL" };
    }
  }

  if (
    o.logo_url != null &&
    typeof o.logo_url === "string" &&
    o.logo_url.trim() &&
    !isValidUrl(o.logo_url)
  ) {
    return {
      valid: false,
      error: "logo_url must be a valid HTTPS URL or empty",
    };
  }

  const config: AdConfig = {
    id: String(id).trim(),
    active: Boolean(o.active),
    sponsor: String(sponsor).trim(),
    headline: String(headline).trim(),
    subline:
      o.subline != null && o.subline !== ""
        ? String(o.subline).trim()
        : null,
    cta: String(cta).trim(),
    destination_url: String(destination_url).trim(),
    image_url:
      o.image_url != null && o.image_url !== ""
        ? String(o.image_url).trim()
        : null,
    logo_url:
      o.logo_url != null && o.logo_url !== ""
        ? String(o.logo_url).trim()
        : null,
    creative_version:
      typeof o.creative_version === "string" ? o.creative_version : "",
    placement:
      typeof o.placement === "string" && o.placement.trim()
        ? o.placement.trim()
        : "home_feed",
    start_at:
      typeof o.start_at === "string" && o.start_at.trim()
        ? o.start_at.trim()
        : undefined,
    end_at:
      typeof o.end_at === "string" && o.end_at.trim()
        ? o.end_at.trim()
        : undefined,
    tier,
  };

  return { valid: true, config };
}

function isAdActive(config: AdConfig, now: Date): boolean {
  if (!config.active) return false;
  if (config.start_at) {
    const start = new Date(config.start_at);
    if (Number.isNaN(start.getTime()) || now < start) return false;
  }
  if (config.end_at) {
    const end = new Date(config.end_at);
    if (Number.isNaN(end.getTime()) || now > end) return false;
  }
  return true;
}

async function getAdsArray(kv: KVNamespace): Promise<AdConfig[]> {
  const legacy = await kv.get(KV_KEY_LEGACY);
  if (legacy) {
    try {
      const migrated = [JSON.parse(legacy) as AdConfig];
      await kv.put(KV_KEY_ADS, JSON.stringify(migrated));
      await kv.delete(KV_KEY_LEGACY);
      return migrated;
    } catch (err) {
      console.error("Migration failed:", err);
      return [];
    }
  }
  const value = await kv.get(KV_KEY_ADS);
  if (!value) return [];
  try {
    return JSON.parse(value) as AdConfig[];
  } catch (err) {
    console.error("Failed to parse ads:", err);
    return [];
  }
}

import { getAdminHtml } from "./admin-html";
import { getAdsLandingHtml } from "./ads-landing-html";
import { getMainLandingHtml } from "./main-landing-html";

interface PerAdStats {
  ad_id: string;
  impressions: number;
  clicks: number;
  ctr_percent: number;
}

async function fetchPostHogStats(env: Env): Promise<
  | {
      configured: true;
      impressions: number;
      clicks: number;
      ctr_percent: number;
      per_ad: PerAdStats[];
    }
  | { configured: false }
> {
  const apiKey = env.POSTHOG_PERSONAL_API_KEY;
  const projectId = env.POSTHOG_PROJECT_ID;
  const host = (env.POSTHOG_HOST || "https://us.posthog.com").replace(/\/$/, "");

  if (!apiKey || !projectId) {
    return { configured: false };
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };

  const runQuery = async (query: string, name: string): Promise<number> => {
    const res = await fetch(`${host}/api/projects/${projectId}/query/`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query: { kind: "HogQLQuery", query },
        name,
      }),
    });
    if (!res.ok) return 0;
    const data = (await res.json()) as { results?: unknown[][] };
    const rows = data.results;
    if (!Array.isArray(rows) || rows.length === 0) return 0;
    const first = rows[0];
    if (!Array.isArray(first) || first.length === 0) return 0;
    const val = first[0];
    return typeof val === "number" ? val : parseInt(String(val), 10) || 0;
  };

  const runQueryRows = async (
    query: string,
    name: string
  ): Promise<PerAdStats[]> => {
    try {
      const res = await fetch(`${host}/api/projects/${projectId}/query/`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          query: { kind: "HogQLQuery", query },
          name,
        }),
      });
      if (!res.ok) return [];
      const data = (await res.json()) as {
        results?: unknown[][];
        columns?: string[];
      };
      const rows = data.results;
      if (!Array.isArray(rows) || rows.length === 0) return [];
      const parsed: PerAdStats[] = [];
      for (const row of rows) {
        if (!Array.isArray(row) || row.length < 3) continue;
        const adId = String(row[0] ?? "").trim();
        if (!adId) continue;
        const imp = typeof row[1] === "number" ? row[1] : parseInt(String(row[1]), 10) || 0;
        const clk = typeof row[2] === "number" ? row[2] : parseInt(String(row[2]), 10) || 0;
        const ctr = imp > 0 ? (clk / imp) * 100 : 0;
        parsed.push({ ad_id: adId, impressions: imp, clicks: clk, ctr_percent: ctr });
      }
      return parsed;
    } catch {
      return [];
    }
  };

  const perAdQuery = `
    SELECT
      coalesce(properties.ad_id, '') AS ad_id,
      countIf(event = 'ad_impression') AS impressions,
      countIf(event = 'ad_tap') AS clicks
    FROM events
    WHERE event IN ('ad_impression', 'ad_tap')
      AND timestamp >= now() - INTERVAL 7 DAY
      AND coalesce(properties.placement, 'home_feed') = 'home_feed'
    GROUP BY properties.ad_id
    HAVING ad_id != ''
    ORDER BY impressions DESC
  `.trim();

  const [aggResult, perAd] = await Promise.all([
    Promise.all([
      runQuery(
        "SELECT count() FROM events WHERE event = 'ad_impression' AND timestamp >= now() - INTERVAL 7 DAY",
        "ads-impressions-7d"
      ),
      runQuery(
        "SELECT count() FROM events WHERE event = 'ad_tap' AND timestamp >= now() - INTERVAL 7 DAY",
        "ads-clicks-7d"
      ),
    ]),
    runQueryRows(perAdQuery, "ads-per-ad-7d"),
  ]);

  const [impressions, clicks] = aggResult;
  const ctr_percent = impressions > 0 ? (clicks / impressions) * 100 : 0;

  return {
    configured: true,
    impressions,
    clicks,
    ctr_percent,
    per_ad: perAd,
  };
}

/** True if request is from local dev (host=localhost; prod uses gymtracker.jackhannon.net). */
function isLocalRequest(request: Request): boolean {
  try {
    const h = new URL(request.url).hostname.toLowerCase();
    return h === "localhost" || h === "127.0.0.1";
  } catch {
    return false;
  }
}

/** True if request passed Cloudflare Access (JWT header present) or is localhost. */
function hasAccessAuth(request: Request): boolean {
  return isLocalRequest(request) || !!request.headers.get("Cf-Access-Jwt-Assertion");
}

export default {
  async fetch(
    request: Request,
    env: Env,
    _ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/admin" || url.pathname === "/admin/") {
      if (!hasAccessAuth(request)) {
        const helpHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Sign in required</title></head><body style="font-family:system-ui;max-width:32rem;margin:4rem auto;padding:2rem;">
          <h1>Sign in required</h1>
          <p>This admin is protected by <a href="https://developers.cloudflare.com/cloudflare-one/">Cloudflare Access</a>. Configure Access to protect <code>gymtracker.jackhannon.net/admin</code> and <code>/api/admin</code>.</p>
          <p>See <code>gymtracker/ACCESS_SETUP.md</code> for setup.</p>
          </body></html>`;
        return new Response(helpHtml, {
          status: 401,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      }
      return new Response(getAdminHtml(), {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store",
        },
      });
    }

    if (url.pathname === "/api/admin/stats") {
      if (!hasAccessAuth(request)) {
        return jsonResponse({ error: "Unauthorized" }, 401, request);
      }
      if (request.method !== "GET") {
        return jsonResponse({ error: "Method not allowed" }, 405, request);
      }
      const stats = await fetchPostHogStats(env);
      return jsonResponse(stats, 200, request);
    }

    if (url.pathname === "/api/admin/ads") {
      if (request.method === "OPTIONS") {
        const origin = request.headers.get("Origin");
        return new Response(null, {
          status: 204,
          headers: {
            ...corsHeaders(origin),
            "Content-Length": "0",
          },
        });
      }
      if (!hasAccessAuth(request)) {
        return jsonResponse({ error: "Unauthorized" }, 401, request);
      }
      if (request.method === "GET") {
        const ads = await getAdsArray(env.AD_CONFIG);
        return jsonResponse({ ads }, 200, request);
      }
      if (request.method === "PUT") {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return jsonResponse({ error: "Invalid JSON body" }, 400, request);
        }
        const result = validateAdConfig(body);
        if (!result.valid) {
          return jsonResponse({ error: result.error }, 400, request);
        }
        const ads = await getAdsArray(env.AD_CONFIG);
        const idx = ads.findIndex((a) => a.id === result.config.id);
        if (idx >= 0) ads[idx] = result.config;
        else ads.push(result.config);
        await env.AD_CONFIG.put(KV_KEY_ADS, JSON.stringify(ads));
        return jsonResponse(result.config, 200, request);
      }
      if (request.method === "DELETE") {
        const id = url.searchParams.get("id");
        if (!id || !id.trim()) {
          return jsonResponse({ error: "Missing required query param: id" }, 400, request);
        }
        const ads = await getAdsArray(env.AD_CONFIG);
        const filtered = ads.filter((a) => a.id !== id.trim());
        if (filtered.length === ads.length) {
          return jsonResponse({ error: "Ad not found" }, 404, request);
        }
        await env.AD_CONFIG.put(KV_KEY_ADS, JSON.stringify(filtered));
        return jsonResponse({ deleted: id.trim() }, 200, request);
      }
      return jsonResponse({ error: "Method not allowed" }, 405, request);
    }

    if (url.pathname === "/" || url.pathname === "/index.html") {
      return new Response(getMainLandingHtml(), {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": isLocalRequest(request)
            ? "no-store, no-cache, must-revalidate"
            : "public, max-age=3600",
        },
      });
    }

    if (url.pathname === "/ads" || url.pathname === "/ads/") {
      return new Response(getAdsLandingHtml(), {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": isLocalRequest(request)
            ? "no-store, no-cache, must-revalidate"
            : "public, max-age=3600",
        },
      });
    }

    if (url.pathname !== "/api/ads") {
      const assetResponse = await env.ASSETS.fetch(request);
      if (assetResponse.status !== 404) {
        return assetResponse;
      }
      return jsonResponse({ error: "Not found" }, 404, request);
    }

    if (request.method === "OPTIONS") {
      const origin = request.headers.get("Origin");
      return new Response(null, {
        status: 204,
        headers: {
          ...corsHeaders(origin),
          "Content-Length": "0",
        },
      });
    }

    if (request.method === "GET") {
      const schedule = url.searchParams.get("schedule") === "1";
      const apiKey = request.headers.get("X-API-Key");
      const hasAdminKey =
        !!env.ADMIN_API_KEY && apiKey === env.ADMIN_API_KEY;

      if (schedule) {
        if (!hasAdminKey) {
          return jsonResponse({ error: "Unauthorized" }, 401, request);
        }
        const ads = await getAdsArray(env.AD_CONFIG);
        return jsonResponse({ ads }, 200, request);
      }

      const ads = await getAdsArray(env.AD_CONFIG);
      const now = new Date();
      const active = ads
        .filter((a) => isAdActive(a, now))
        .sort((a, b) => {
          const aStart = a.start_at ? new Date(a.start_at).getTime() : 0;
          const bStart = b.start_at ? new Date(b.start_at).getTime() : 0;
          return bStart - aStart;
        })[0];

      if (!active) {
        return jsonResponse({ error: "No active ad" }, 404, request);
      }
      return jsonResponse(active, 200, request);
    }

    if (request.method === "PUT") {
      const apiKey = request.headers.get("X-API-Key");
      if (!env.ADMIN_API_KEY || apiKey !== env.ADMIN_API_KEY) {
        return jsonResponse({ error: "Unauthorized" }, 401, request);
      }

      let body: unknown;
      try {
        body = await request.json();
      } catch {
        return jsonResponse({ error: "Invalid JSON body" }, 400, request);
      }

      const result = validateAdConfig(body);
      if (!result.valid) {
        return jsonResponse({ error: result.error }, 400, request);
      }

      const ads = await getAdsArray(env.AD_CONFIG);
      const idx = ads.findIndex((a) => a.id === result.config.id);
      if (idx >= 0) {
        ads[idx] = result.config;
      } else {
        ads.push(result.config);
      }
      await env.AD_CONFIG.put(KV_KEY_ADS, JSON.stringify(ads));
      return jsonResponse(result.config, 200, request);
    }

    return jsonResponse({ error: "Method not allowed" }, 405, request);
  },
};
