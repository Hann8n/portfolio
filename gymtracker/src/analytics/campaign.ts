import { audienceFilter, internalOnlyFilter, type Audience } from "./audience";
import { prepare, sql } from "./sql";
import { localDateSql, localTimeSql } from "./time";

type Row = Record<string, string | number | null>;
const num = (value: unknown) => Number(value) || 0;
const iso = (at: Date) => at.toISOString();

/** Delivery for one campaign. Unique counts are distinct within the window and are never summed across rows. */
export async function campaignStats(env: Env, id: string, from: Date, before: Date, audience: Audience) {
  if (!env.METRICS) throw new Error("Analytics not configured");
  const db = env.METRICS;
  const filter = audienceFilter(audience);
  const scope = sql`ad_id = ${id} AND received_at >= ${iso(from)} AND received_at < ${iso(before)} AND event IN ('ad_impression', 'ad_tap')`;
  const localDate = localDateSql("received_at", from.getTime(), before.getTime());
  const localTime = localTimeSql("received_at", from.getTime(), before.getTime());
  const results = await db.batch<Row>([
    sql`SELECT SUM(event = 'ad_impression') AS impressions, SUM(event = 'ad_tap') AS clicks,
      COUNT(DISTINCT CASE WHEN event = 'ad_impression' THEN installation_id END) AS reach,
      COUNT(DISTINCT CASE WHEN event = 'ad_tap' THEN installation_id END) AS unique_clickers,
      MIN(received_at) AS first_event, MAX(received_at) AS last_event FROM metric_events WHERE ${scope} AND ${filter}`,
    sql`SELECT ${localDate} AS date, SUM(event = 'ad_impression') AS impressions, SUM(event = 'ad_tap') AS clicks,
      COUNT(DISTINCT CASE WHEN event = 'ad_impression' THEN installation_id END) AS reach
      FROM metric_events WHERE ${scope} AND ${filter} GROUP BY date ORDER BY date`,
    sql`SELECT CAST(strftime('%H', ${localTime}) AS INTEGER) AS hour, SUM(event = 'ad_impression') AS impressions, SUM(event = 'ad_tap') AS clicks
      FROM metric_events WHERE ${scope} AND ${filter} GROUP BY hour ORDER BY hour`,
    sql`SELECT MIN(views, 5) AS views, COUNT(*) AS installs FROM (
        SELECT installation_id, COUNT(*) AS views FROM metric_events WHERE ${scope} AND event = 'ad_impression' AND ${filter} GROUP BY installation_id)
      GROUP BY MIN(views, 5) ORDER BY views`,
    sql`SELECT creative_version, SUM(event = 'ad_impression') AS impressions, SUM(event = 'ad_tap') AS clicks
      FROM metric_events WHERE ${scope} AND ${filter} GROUP BY creative_version ORDER BY impressions DESC`,
    sql`SELECT COUNT(DISTINCT installation_id) AS installations, SUM(event = 'ad_impression') AS impressions, SUM(event = 'ad_tap') AS clicks
      FROM metric_events WHERE ${scope} AND ${internalOnlyFilter(audience)}`,
  ].map(query => prepare(db, query)));
  if (results.some(result => !result.success)) throw new Error("Campaign query failed");
  const [summary, daily, hourly, frequency, creatives, internal] = results.map(result => result.results);
  const row = summary[0] || {};
  return {
    impressions: num(row.impressions), clicks: num(row.clicks), reach: num(row.reach), unique_clickers: num(row.unique_clickers),
    first_event: (row.first_event as string | null) ?? null, last_event: (row.last_event as string | null) ?? null,
    daily: daily.map(r => ({ date: String(r.date), impressions: num(r.impressions), clicks: num(r.clicks), reach: num(r.reach) })),
    hourly: hourly.map(r => ({ hour: num(r.hour), impressions: num(r.impressions), clicks: num(r.clicks) })),
    frequency: frequency.map(r => ({ views: num(r.views), installs: num(r.installs) })),
    creatives: creatives.map(r => ({ creative_version: String(r.creative_version ?? ""), impressions: num(r.impressions), clicks: num(r.clicks) })),
    excluded: { internal_excluded: audience.excludeInternal, installations: num(internal[0]?.installations), impressions: num(internal[0]?.impressions), clicks: num(internal[0]?.clicks) },
  };
}
