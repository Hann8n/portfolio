import { audienceFilter, internalOnlyFilter, type Audience } from "./audience";
import { SIRI_FAILED } from "./catalog";
import { prepare, raw, sql, type Fragment } from "./sql";
import { DAY, REPORT_TIME_ZONE, localDateSql, localTimeSql } from "./time";
import { RETENTION_DAYS, overviewWindows } from "./windows";

type Row = Record<string, string | number | null>;
const iso = (at: number) => new Date(at).toISOString();
const num = (value: unknown) => Number(value) || 0;
const failed = raw(SIRI_FAILED.map(status => `'${status}'`).join(", "));

/** "iOS 26" from "Version 26.0 (Build …)", "Android 15" from "Android 15". */
export function osMajor(platform: string, osVersion: string) {
  const major = platform === "android" ? /^Android (\d+)/.exec(osVersion)?.[1] : /^Version (\d+)/.exec(osVersion)?.[1];
  return major ? (platform === "android" ? "Android " : "iOS ") + major : "Other";
}

export function ctr(impressions: number, clicks: number) { return impressions > 0 ? clicks / impressions * 100 : 0; }

/** Headline totals for one window. Every unique count is distinct within that window only. */
function totalsQuery(from: number, before: number, filter: Fragment): Fragment {
  return sql`SELECT
    COUNT(DISTINCT installation_id) AS active_period,
    COUNT(DISTINCT CASE WHEN received_at >= ${iso(before - DAY)} THEN installation_id END) AS active_24h,
    SUM(event = 'app_session') AS sessions,
    COUNT(DISTINCT CASE WHEN event = 'app_session' THEN installation_id END) AS visitors,
    SUM(event = 'passport_open') AS passport_opens,
    COUNT(DISTINCT CASE WHEN event = 'passport_open' THEN installation_id END) AS passport_users,
    SUM(event = 'event_open') AS event_opens,
    COUNT(DISTINCT CASE WHEN event = 'event_open' THEN installation_id END) AS event_users,
    SUM(event = 'settings_open') AS settings_opens,
    SUM(event LIKE 'siri_%') AS siri_actions,
    SUM(event LIKE 'siri_%' AND status IN (${failed})) AS siri_unavailable,
    COUNT(DISTINCT CASE WHEN event LIKE 'siri_%' THEN installation_id END) AS siri_users,
    SUM(event = 'ad_impression') AS impressions, SUM(event = 'ad_tap') AS clicks,
    COUNT(DISTINCT CASE WHEN event = 'ad_impression' THEN installation_id END) AS reach,
    COUNT(DISTINCT CASE WHEN event = 'ad_tap' THEN installation_id END) AS unique_clickers
    FROM metric_events WHERE received_at >= ${iso(from)} AND received_at < ${iso(before)} AND ${filter}`;
}

function totals(row: Row | undefined) {
  const t = Object.fromEntries(Object.entries(row || {}).map(([key, value]) => [key, num(value)])) as Record<string, number>;
  return { ...t, ctr_percent: ctr(t.impressions, t.clicks), visits_per_visitor: t.visitors ? t.sessions / t.visitors : 0 };
}

export async function fetchOverview(env: Env, audience: Audience, days: number, now = Date.now()) {
  if (!env.METRICS) return { configured: false, capture_configured: false };
  const db = env.METRICS;
  const { current, previous } = overviewWindows(days, now);
  const filter = audienceFilter(audience);
  const span = sql`received_at >= ${iso(current.from)} AND received_at < ${iso(current.before)}`;
  const bothSpans = sql`received_at >= ${iso(previous.from)} AND received_at < ${iso(current.before)}`;
  const localDate = localDateSql("received_at", previous.from, current.before);
  const localTime = localTimeSql("received_at", current.from, current.before);
  const inCurrent = sql`received_at >= ${iso(current.from)}`;
  const inPrevious = sql`received_at < ${iso(previous.before)}`;

  const queries: Fragment[] = [
    totalsQuery(current.from, current.before, filter),
    totalsQuery(previous.from, previous.before, filter),
    sql`SELECT ${localDate} AS date, COUNT(DISTINCT installation_id) AS active,
      SUM(event = 'app_session') AS sessions,
      SUM(event = 'passport_open') AS passport_opens, SUM(event = 'event_open') AS event_opens,
      SUM(event = 'settings_open') AS settings_opens, SUM(event LIKE 'siri_%') AS siri_actions,
      SUM(event = 'ad_impression') AS impressions, SUM(event = 'ad_tap') AS clicks
      FROM metric_events WHERE ${bothSpans} AND ${filter} GROUP BY date ORDER BY date`,
    // First recorded event per installation; installations first seen before analytics existed cannot be identified.
    sql`SELECT ${localDateSql("first_seen", previous.from, current.before)} AS date,
      SUM(first_seen >= ${iso(current.from)}) AS current, SUM(first_seen < ${iso(previous.before)}) AS previous
      FROM (SELECT installation_id, MIN(received_at) AS first_seen FROM metric_events WHERE ${filter} GROUP BY installation_id)
      WHERE first_seen >= ${iso(previous.from)} AND first_seen < ${iso(current.before)} GROUP BY date ORDER BY date`,
    sql`SELECT period_key, MIN(visits, 10) AS visits, COUNT(*) AS installs, SUM(days >= 2) AS repeat_days
      FROM (SELECT installation_id, CASE WHEN ${inCurrent} THEN 'current' ELSE 'previous' END AS period_key,
        SUM(event = 'app_session') AS visits, COUNT(DISTINCT ${localDate}) AS days
        FROM metric_events WHERE ${bothSpans} AND (${inCurrent} OR ${inPrevious}) AND ${filter}
        GROUP BY installation_id, period_key)
      GROUP BY period_key, MIN(visits, 10) ORDER BY period_key, visits`,
    sql`SELECT CAST(strftime('%w', ${localTime}) AS INTEGER) AS dow, CAST(strftime('%H', ${localTime}) AS INTEGER) AS hour,
      COUNT(*) AS sessions, COUNT(DISTINCT installation_id) AS installs
      FROM metric_events WHERE ${span} AND event = 'app_session' AND ${filter} GROUP BY dow, hour`,
    sql`SELECT event, SUM(uses) AS opens, COUNT(*) AS installations, SUM(uses > 1) AS repeat_installations, MAX(last_received) AS last_received
      FROM (SELECT event, installation_id, COUNT(*) AS uses, MAX(received_at) AS last_received FROM metric_events
        WHERE ${span} AND ${filter} AND event IN ('event_open','passport_open','settings_open','class_schedule_open','siri_crowds','siri_events','siri_event_details')
        GROUP BY event, installation_id)
      GROUP BY event ORDER BY opens DESC`,
    sql`SELECT event, status, COUNT(*) AS count FROM metric_events WHERE ${span} AND ${filter} AND event LIKE 'siri_%'
      GROUP BY event, status ORDER BY event, status`,
    // Each installation counts once, on the version it most recently reported.
    sql`SELECT app_version, build, COUNT(*) AS installs FROM (
        SELECT installation_id, app_version, build, MAX(received_at) FROM metric_events WHERE ${span} AND ${filter} GROUP BY installation_id)
      GROUP BY app_version, build ORDER BY installs DESC LIMIT 30`,
    sql`SELECT platform, os_version, COUNT(*) AS installs FROM (
        SELECT installation_id, platform, os_version, MAX(received_at) FROM metric_events WHERE ${span} AND ${filter} GROUP BY installation_id)
      GROUP BY platform, os_version`,
    sql`SELECT ad_id, SUM(event = 'ad_impression') AS impressions, SUM(event = 'ad_tap') AS clicks,
      COUNT(DISTINCT CASE WHEN event = 'ad_impression' THEN installation_id END) AS reach
      FROM metric_events WHERE ${span} AND ${filter} AND event IN ('ad_impression', 'ad_tap') AND placement = 'home_feed'
      GROUP BY ad_id ORDER BY impressions DESC LIMIT 200`,
    sql`SELECT COUNT(*) AS events, COUNT(DISTINCT installation_id) AS installations, SUM(event = 'app_session') AS sessions,
      SUM(event = 'ad_impression') AS impressions, SUM(event = 'ad_tap') AS clicks
      FROM metric_events WHERE ${span} AND ${internalOnlyFilter(audience)}`,
    sql`SELECT MIN(received_at) AS since, MAX(received_at) AS latest FROM metric_events`,
  ];
  const results = await db.batch<Row>(queries.map(query => prepare(db, query)));
  if (results.some(result => !result.success)) throw new Error("Analytics query failed");
  const [cur, prev, daily, firstSeen, engagement, hourly, features, siri, versions, os, perAd, internal, coverage] = results.map(result => result.results);

  const since = coverage[0]?.since as string | null;
  const comparison_available = !!since && since <= iso(previous.from) && days * 2 <= RETENTION_DAYS;
  const byDate = new Map(daily.map(row => [String(row.date), row]));
  const newByDate = new Map(firstSeen.map(row => [String(row.date), num(row.current) + num(row.previous)]));
  const series = (dates: string[]) => dates.map(date => {
    const row = byDate.get(date) || {};
    return { date, new_installs: newByDate.get(date) || 0, ...Object.fromEntries(
      ["active", "sessions", "passport_opens", "event_opens", "settings_opens", "siri_actions", "impressions", "clicks"].map(key => [key, num(row[key])])) };
  });
  const sumWindow = (window: string, key: string) => engagement.filter(row => row.period_key === window).reduce((sum, row) => sum + num(row[key]), 0);

  const summary = { ...totals(cur[0]), new_installs: firstSeen.reduce((sum, row) => sum + num(row.current), 0), returning_installs: sumWindow("current", "repeat_days") };
  const prior = { ...totals(prev[0]), new_installs: firstSeen.reduce((sum, row) => sum + num(row.previous), 0), returning_installs: sumWindow("previous", "repeat_days") };
  const osMajors = new Map<string, number>();
  const platformInstalls = new Map<string, number>();
  for (const row of os) {
    const key = osMajor(String(row.platform), String(row.os_version));
    osMajors.set(key, (osMajors.get(key) || 0) + num(row.installs));
    platformInstalls.set(String(row.platform), (platformInstalls.get(String(row.platform)) || 0) + num(row.installs));
  }

  return {
    configured: true, capture_configured: true, schema_version: 2, days, time_zone: REPORT_TIME_ZONE,
    period: { from: iso(current.from), before: iso(current.before) },
    previous_period: { from: iso(previous.from), before: iso(previous.before) },
    comparison_available, coverage_since: since, latest_event: coverage[0]?.latest ?? null,
    audience: {
      internal_excluded: audience.excludeInternal, internal_installations: audience.internal.length, platform: audience.platform ?? "all",
      ...Object.fromEntries(Object.entries(internal[0] || {}).map(([key, value]) => ["internal_" + key, num(value)])),
    },
    ...summary,
    previous: comparison_available ? prior : null,
    daily: series(current.dates),
    previous_daily: comparison_available ? series(previous.dates) : [],
    hourly: hourly.map(row => ({ dow: num(row.dow), hour: num(row.hour), sessions: num(row.sessions), installs: num(row.installs) })),
    engagement: engagement.filter(row => row.period_key === "current").map(row => ({ visits: num(row.visits), installs: num(row.installs) })),
    features, siri,
    versions: versions.map(row => ({ app_version: row.app_version, build: row.build, installs: num(row.installs) })),
    platforms: [...platformInstalls].map(([platform, installs]) => ({ platform, installs })).sort((a, b) => b.installs - a.installs),
    os: [...osMajors].map(([name, installs]) => ({ name, installs })).sort((a, b) => b.installs - a.installs),
    per_ad: perAd.map(row => ({ ...row, ctr_percent: ctr(num(row.impressions), num(row.clicks)) })),
  };
}
