/**
 * Gym Tracker Ads API
 * GET /api/ads — return active ad config from KV
 * PUT /api/ads — update config (requires X-API-Key)
 * OPTIONS /api/ads — CORS preflight
 */

const KV_KEY = "active_ad";

const ALLOWED_ORIGINS = [
  "https://jackhannon.net",
  "https://www.jackhannon.net",
  "https://jackhannon.me",
  "https://www.jackhannon.me",
];

function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("Origin");
  const allowOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
    "Access-Control-Max-Age": "86400",
  };
}

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
  "Pragma": "no-cache",
};

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

function jsonResponse(
  body: object,
  status = 200,
  headers: Record<string, string> = {},
  request?: Request
): Response {
  const cors = request ? corsHeaders(request) : corsHeaders(new Request("https://jackhannon.net"));
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...NO_CACHE_HEADERS,
      ...cors,
      ...headers,
    },
  });
}

function corsPreflight(request: Request): Response {
  return new Response(null, {
    status: 204,
    headers: {
      ...corsHeaders(request),
      "Content-Length": "0",
    },
  });
}

function isValidUrl(s: string): boolean {
  try {
    const u = new URL(s);
    return u.protocol === "https:";
  } catch {
    return false;
  }
}

function validateAdConfig(obj: unknown): { valid: true; config: AdConfig } | { valid: false; error: string } {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
    return { valid: false, error: "Invalid JSON: expected object" };
  }

  const o = obj as Record<string, unknown>;

  const id = o.id;
  if (typeof id !== "string" || !id.trim()) {
    return { valid: false, error: "Missing or invalid required field: id" };
  }

  if (typeof o.active !== "boolean") {
    return { valid: false, error: "Missing or invalid required field: active (must be boolean)" };
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
    return { valid: false, error: "Missing or invalid required field: destination_url" };
  }
  if (!isValidUrl(destination_url)) {
    return { valid: false, error: "destination_url must be a valid HTTPS URL" };
  }

  const tier = typeof o.tier === "string" ? o.tier.toLowerCase() : "banner";
  if (tier !== "text" && tier !== "banner" && tier !== "feature") {
    return { valid: false, error: "tier must be 'text', 'banner', or 'feature'" };
  }

  if (tier === "banner" || tier === "feature") {
    const image_url = o.image_url;
    if (image_url != null && typeof image_url !== "string") {
      return { valid: false, error: "image_url must be string or null for banner/feature tier" };
    }
    if (typeof image_url !== "string" || !image_url.trim()) {
      return { valid: false, error: `tier '${tier}' requires image_url` };
    }
    if (!isValidUrl(image_url)) {
      return { valid: false, error: "image_url must be a valid HTTPS URL" };
    }
  }

  if (o.logo_url != null && typeof o.logo_url === "string" && o.logo_url.trim() && !isValidUrl(o.logo_url)) {
    return { valid: false, error: "logo_url must be a valid HTTPS URL or empty" };
  }

  const config: AdConfig = {
    id: String(id).trim(),
    active: Boolean(o.active),
    sponsor: String(sponsor).trim(),
    headline: String(headline).trim(),
    subline: o.subline != null && o.subline !== "" ? String(o.subline).trim() : null,
    cta: String(cta).trim(),
    destination_url: String(destination_url).trim(),
    image_url: o.image_url != null && o.image_url !== "" ? String(o.image_url).trim() : null,
    logo_url: o.logo_url != null && o.logo_url !== "" ? String(o.logo_url).trim() : null,
    creative_version: typeof o.creative_version === "string" ? o.creative_version : "",
    placement: typeof o.placement === "string" && o.placement.trim() ? o.placement.trim() : "home_feed",
    start_at: typeof o.start_at === "string" && o.start_at.trim() ? o.start_at.trim() : undefined,
    end_at: typeof o.end_at === "string" && o.end_at.trim() ? o.end_at.trim() : undefined,
    tier,
  };

  return { valid: true, config };
}

export default {
  async fetch(request: Request, env: { AD_CONFIG: KVNamespace; ADMIN_API_KEY?: string }): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname !== "/api/ads") {
      return jsonResponse({ error: "Not found" }, 404, {}, request);
    }

    if (request.method === "OPTIONS") {
      return corsPreflight(request);
    }

    if (request.method === "GET") {
      const value = await env.AD_CONFIG.get(KV_KEY);
      if (!value) {
        return jsonResponse({ error: "No ad config found" }, 404, {}, request);
      }
      try {
        const config = JSON.parse(value) as AdConfig;
        return jsonResponse(config, 200, {}, request);
      } catch {
        return jsonResponse({ error: "Invalid stored config" }, 500, {}, request);
      }
    }

    if (request.method === "PUT") {
      const apiKey = request.headers.get("X-API-Key");
      const expectedKey = env.ADMIN_API_KEY;
      if (!expectedKey || apiKey !== expectedKey) {
        return jsonResponse({ error: "Unauthorized" }, 401, {}, request);
      }

      let body: unknown;
      try {
        body = await request.json();
      } catch {
        return jsonResponse({ error: "Invalid JSON body" }, 400, {}, request);
      }

      const result = validateAdConfig(body);
      if (!result.valid) {
        return jsonResponse({ error: result.error }, 400, {}, request);
      }

      await env.AD_CONFIG.put(KV_KEY, JSON.stringify(result.config));
      return jsonResponse(result.config, 200, {}, request);
    }

    return jsonResponse({ error: "Method not allowed" }, 405, {}, request);
  },
};
