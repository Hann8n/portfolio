import { PLATFORMS, UUID as uuid } from "./audience";
import { EVENT_NAMES, SIRI_ANSWERED, SIRI_FAILED } from "./catalog";

/** First-party analytics: bounded explicit events, no IP addresses or user content. */
const events = new Set<string>(EVENT_NAMES);
const statuses = new Set<string>([...SIRI_ANSWERED, ...SIRI_FAILED]);

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
  // Builds before the platform property are iOS; Android always reports "Android <release>" as its OS.
  const platform = input.platform ?? (properties.os_version?.startsWith("Android") ? "android" : "ios");
  if (!PLATFORMS.includes(platform)) return reply(400);
  if (input.status !== undefined) {
    if (!statuses.has(input.status)) return reply(400);
    properties.status = input.status;
  }
  if (body.event.startsWith("ad_") && (!properties.ad_id || properties.ad_id.startsWith("dev_") || properties.placement !== "home_feed")) return reply(400);
  if (body.event.startsWith("siri_") && !properties.status) return reply(400);
  try {
    await env.METRICS.prepare(`INSERT OR IGNORE INTO metric_events
      (event_id, event, installation_id, session_id, received_at, app_version, build, os_version, ad_id, creative_version, placement, status, platform)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(body.event_id, body.event, body.distinct_id, input.session_id, new Date().toISOString(),
        properties.app_version || "unknown", properties.build || "unknown", properties.os_version || "unknown",
        properties.ad_id || null, properties.creative_version || "", properties.placement || null, properties.status || null, platform).run();
    return reply(204);
  } catch { return reply(503); }
}
