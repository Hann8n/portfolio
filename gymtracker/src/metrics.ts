/** First-party analytics: bounded explicit events, no IP addresses or user content. */
const events = new Set([
  "app_session", "event_open", "passport_open", "settings_open",
  "siri_crowds", "siri_events", "siri_event_details", "ad_impression", "ad_tap",
]);
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const statuses = new Set(["live", "cached", "unavailable", "not_found", "invalid_request"]);
const day = 86400000;

export async function captureMetric(request: Request, env: Env): Promise<Response> {
  const reply = (status: number) => new Response(null, { status, headers: { "Cache-Control": "no-store" } });
  if (!env.METRICS) return reply(503);
  if (!request.headers.get("Content-Type")?.toLowerCase().startsWith("application/json")) return reply(415);
  // Use the IP only as an ephemeral rate-limit key. Never persist or forward it.
  const ip = request.headers.get("CF-Connecting-IP");
  if (ip && env.METRICS_RATE_LIMITER && !(await env.METRICS_RATE_LIMITER.limit({ key: ip })).success) return reply(429);
  const reader = request.body?.getReader();
  if (!reader) return reply(400);
  let size = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 4096) { await reader.cancel(); return reply(413); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  let body;
  try { body = JSON.parse(new TextDecoder().decode(bytes)); } catch { return reply(400); }
  if (!body || !events.has(body.event) || typeof body.distinct_id !== "string" || !uuid.test(body.distinct_id) ||
      typeof body.event_id !== "string" || !uuid.test(body.event_id)) return reply(400);
  if (body.schema_version !== undefined && body.schema_version !== 1) return reply(422);
  const input = body.properties;
  if (!input || typeof input !== "object" || Array.isArray(input)) return reply(400);
  if (typeof input.session_id !== "string" || !uuid.test(input.session_id)) return reply(400);
  const properties: Record<string, string> = {};
  for (const key of ["app_version", "build", "os_version", "ad_id", "creative_version", "placement"]) {
    const value = input[key];
    if (value !== undefined) {
      if (typeof value !== "string" || value.length > 128) return reply(400);
      properties[key] = value;
    }
  }
  if (input.status !== undefined) {
    if (!statuses.has(input.status)) return reply(400);
    properties.status = input.status;
  }
  if (body.event.startsWith("ad_") && (!properties.ad_id || properties.ad_id.startsWith("dev_") || properties.placement !== "home_feed")) return reply(400);
  if (body.event.startsWith("siri_") && !properties.status) return reply(400);
  try {
    await env.METRICS.prepare(`INSERT OR IGNORE INTO metric_events
      (event_id, event, installation_id, session_id, received_at, app_version, build, os_version, ad_id, creative_version, placement, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(body.event_id, body.event, body.distinct_id, input.session_id, new Date().toISOString(),
        properties.app_version || "unknown", properties.build || "unknown", properties.os_version || "unknown",
        properties.ad_id || null, properties.creative_version || "", properties.placement || null, properties.status || null).run();
    return reply(204);
  } catch { return reply(503); }
}

export async function fetchAppStats(env: Env, now = new Date(), days = 7) {
  if (!env.METRICS) return { configured: false, capture_configured: false };
  const from = new Date(now.getTime() - days * day).toISOString();
  const since24h = new Date(now.getTime() - day).toISOString();
  const before = now.toISOString();
  const results = await env.METRICS.batch<Record<string, string | number | null>>([
    env.METRICS.prepare(`SELECT
      COUNT(DISTINCT CASE WHEN received_at >= ? THEN installation_id END) AS active_24h,
      COUNT(DISTINCT installation_id) AS active_period,
      COUNT(DISTINCT CASE WHEN event = 'ad_impression' THEN installation_id END) AS reach,
      COUNT(DISTINCT CASE WHEN event = 'ad_tap' THEN installation_id END) AS unique_clickers,
      SUM(event = 'app_session') AS sessions,
      SUM(event = 'event_open') AS event_opens, SUM(event = 'passport_open') AS passport_opens,
      COUNT(DISTINCT CASE WHEN event = 'event_open' THEN installation_id END) AS event_users,
      COUNT(DISTINCT CASE WHEN event = 'passport_open' THEN installation_id END) AS passport_users,
      SUM(event LIKE 'siri_%') AS siri_actions,
      SUM(event LIKE 'siri_%' AND status IN ('unavailable', 'not_found', 'invalid_request')) AS siri_unavailable,
      SUM(event = 'ad_impression') AS impressions, SUM(event = 'ad_tap') AS clicks
      FROM metric_events WHERE received_at >= ? AND received_at < ?`).bind(since24h, from, before),
    env.METRICS.prepare(`SELECT ad_id, SUM(event = 'ad_impression') AS impressions, SUM(event = 'ad_tap') AS clicks,
      COUNT(DISTINCT CASE WHEN event = 'ad_impression' THEN installation_id END) AS reach
      FROM metric_events WHERE received_at >= ? AND received_at < ? AND event IN ('ad_impression', 'ad_tap') AND placement = 'home_feed'
      GROUP BY ad_id ORDER BY impressions DESC LIMIT 200`).bind(from, before),
    env.METRICS.prepare(`SELECT substr(received_at, 1, 10) AS date, COUNT(DISTINCT installation_id) AS active,
      SUM(event = 'app_session') AS sessions, SUM(event LIKE 'siri_%') AS siri_actions,
      SUM(event = 'ad_impression') AS impressions, SUM(event = 'ad_tap') AS clicks
      FROM metric_events WHERE received_at >= ? AND received_at < ? GROUP BY date ORDER BY date`).bind(from, before),
    env.METRICS.prepare(`SELECT app_version, build, COUNT(DISTINCT installation_id) AS active,
      SUM(event = 'app_session') AS sessions, SUM(event LIKE 'siri_%') AS siri_actions,
      SUM(event LIKE 'siri_%' AND status IN ('unavailable', 'not_found', 'invalid_request')) AS siri_unavailable
      FROM metric_events WHERE received_at >= ? AND received_at < ? GROUP BY app_version, build ORDER BY active DESC LIMIT 30`).bind(from, before),
    env.METRICS.prepare(`SELECT event, status, COUNT(*) AS count FROM metric_events
      WHERE received_at >= ? AND received_at < ? AND event LIKE 'siri_%' GROUP BY event, status ORDER BY event, status`).bind(from, before),
    env.METRICS.prepare(`SELECT SUM(event = 'ad_impression') AS impressions, SUM(event = 'ad_tap') AS clicks,
      COUNT(DISTINCT CASE WHEN event = 'ad_impression' THEN installation_id END) AS reach,
      SUM(event = 'app_session') AS sessions FROM metric_events WHERE received_at >= ? AND received_at < ?`)
      .bind(new Date(now.getTime() - days * 2 * day).toISOString(), from),
  ]);
  if (results.some(r => !r.success)) throw new Error("Analytics query failed");
  const coverage = await env.METRICS.prepare("SELECT MIN(received_at) AS since FROM metric_events").first<{ since: string | null }>();
  const previousStart = new Date(now.getTime() - days * 2 * day).toISOString();
  const comparison_available = !!coverage?.since && coverage.since <= previousStart && days * 2 <= 366;
  const summary = results[0].results[0] || {};
  const metrics = Object.fromEntries(Object.entries(summary).map(([key, value]) => [key, Number(value) || 0]));
  return {
    configured: true, capture_configured: true, schema_version: 1, days, comparison_available, ...metrics,
    ctr_percent: ctr(metrics.impressions, metrics.clicks),
    per_ad: results[1].results.map(row => ({ ...row, ctr_percent: ctr(Number(row.impressions), Number(row.clicks)) })),
    daily: results[2].results, versions: results[3].results, siri: results[4].results,
    previous: results[5].results[0],
  };
}

export function ctr(impressions: number, clicks: number) { return impressions > 0 ? clicks / impressions * 100 : 0; }

export async function campaignStats(env: Env, id: string, from: Date, before: Date) {
  if (!env.METRICS) throw new Error("Analytics not configured");
  const range = [id, from.toISOString(), before.toISOString()];
  const results = await env.METRICS.batch<Record<string, string | number | null>>([
    env.METRICS.prepare(`SELECT SUM(event = 'ad_impression') AS impressions, SUM(event = 'ad_tap') AS clicks,
      COUNT(DISTINCT CASE WHEN event = 'ad_impression' THEN installation_id END) AS reach,
      COUNT(DISTINCT CASE WHEN event = 'ad_tap' THEN installation_id END) AS unique_clickers,
      MIN(received_at) AS first_event, MAX(received_at) AS last_event
      FROM metric_events WHERE ad_id = ? AND received_at >= ? AND received_at < ? AND event IN ('ad_impression', 'ad_tap')`).bind(...range),
    env.METRICS.prepare(`SELECT substr(received_at, 1, 10) AS date, SUM(event = 'ad_impression') AS impressions,
      SUM(event = 'ad_tap') AS clicks, COUNT(DISTINCT CASE WHEN event = 'ad_impression' THEN installation_id END) AS reach
      FROM metric_events WHERE ad_id = ? AND received_at >= ? AND received_at < ? AND event IN ('ad_impression', 'ad_tap')
      GROUP BY date ORDER BY date`).bind(...range),
    env.METRICS.prepare(`SELECT creative_version, SUM(event = 'ad_impression') AS impressions, SUM(event = 'ad_tap') AS clicks
      FROM metric_events WHERE ad_id = ? AND received_at >= ? AND received_at < ? AND event IN ('ad_impression', 'ad_tap')
      GROUP BY creative_version ORDER BY impressions DESC`).bind(...range),
  ]);
  if (results.some(r => !r.success)) throw new Error("Campaign query failed");
  const row = results[0].results[0];
  return {
    impressions: Number(row.impressions) || 0, clicks: Number(row.clicks) || 0,
    reach: Number(row.reach) || 0, unique_clickers: Number(row.unique_clickers) || 0,
    first_event: row.first_event as string | null, last_event: row.last_event as string | null,
    daily: results[1].results, creatives: results[2].results,
  };
}

export async function fetchEventStats(env: Env, days: number, campaign: string | null, now = new Date()) {
  if (!env.METRICS) throw new Error("Analytics not configured");
  const query = env.METRICS.prepare(`SELECT event, COUNT(*) AS occurrences,
    COUNT(DISTINCT installation_id) AS installations, COUNT(DISTINCT session_id) AS sessions,
    MAX(received_at) AS last_received FROM metric_events
    WHERE received_at >= ? AND received_at < ? ${campaign ? "AND ad_id = ? AND event IN ('ad_impression', 'ad_tap')" : ""}
    GROUP BY event ORDER BY occurrences DESC`);
  const args = [new Date(now.getTime() - days * day).toISOString(), now.toISOString(), ...(campaign ? [campaign] : [])];
  const result = await query.bind(...args).all<Record<string, string | number>>();
  if (!result.success) throw new Error("Event query failed");
  return { days, campaign, events: result.results };
}
