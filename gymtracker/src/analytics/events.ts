import { audienceFilter, type Audience } from "./audience";
import { prepare, sql } from "./sql";
import { DAY } from "./time";
import { overviewWindows } from "./windows";

/** Aggregated event readout for the Events workspace and its CSV export. */
export async function fetchEventStats(env: Env, audience: Audience, days: number, campaign: string | null, now = Date.now()) {
  if (!env.METRICS) throw new Error("Analytics not configured");
  const { current } = overviewWindows(days, now);
  const campaignScope = campaign ? sql`AND ad_id = ${campaign} AND event IN ('ad_impression', 'ad_tap')` : sql``;
  const result = await prepare(env.METRICS, sql`SELECT event, COUNT(*) AS occurrences,
    COUNT(DISTINCT installation_id) AS installations, COUNT(DISTINCT session_id) AS sessions,
    MAX(received_at) AS last_received FROM metric_events
    WHERE received_at >= ${new Date(current.from).toISOString()} AND received_at < ${new Date(now).toISOString()}
    ${campaignScope} AND ${audienceFilter(audience)}
    GROUP BY event ORDER BY occurrences DESC`).all<Record<string, string | number>>();
  if (!result.success) throw new Error("Event query failed");
  return { days, campaign, period: { from: new Date(current.from).toISOString(), before: new Date(now).toISOString() }, internal_excluded: audience.excludeInternal, events: result.results };
}

/** Installations that look like development or test devices, ranked for review. Flags are hints, not verdicts. */
export async function fetchAudienceReview(env: Env, audience: Audience, now = Date.now()) {
  if (!env.METRICS) throw new Error("Analytics not configured");
  const db = env.METRICS;
  const since = new Date(now - 30 * DAY).toISOString();
  const ids = JSON.stringify(audience.internal.map(row => row.id));
  const [candidates, internal, coverage, builds] = await db.batch<Record<string, string | number | null>>([
    sql`SELECT installation_id, COUNT(*) AS events, SUM(event = 'app_session') AS sessions,
      COUNT(DISTINCT build) AS builds, GROUP_CONCAT(DISTINCT build) AS build_list, MAX(os_version) AS os_version,
      SUM(event = 'settings_open') AS settings_opens, SUM(event = 'ad_tap') AS ad_taps, SUM(event LIKE 'siri_%') AS siri_actions,
      MIN(received_at) AS first_seen, MAX(received_at) AS last_seen
      FROM metric_events WHERE received_at >= ${since} AND installation_id NOT IN (SELECT value FROM json_each(${ids}))
      GROUP BY installation_id ORDER BY events DESC LIMIT 60`,
    sql`SELECT installation_id, COUNT(*) AS events, SUM(event = 'app_session') AS sessions, MAX(received_at) AS last_seen
      FROM metric_events WHERE installation_id IN (SELECT value FROM json_each(${ids})) GROUP BY installation_id`,
    sql`SELECT MIN(received_at) AS since, MAX(received_at) AS latest, COUNT(*) AS events,
      SUM(received_at >= ${new Date(now - DAY).toISOString()}) AS events_24h FROM metric_events`,
    sql`SELECT build, COUNT(DISTINCT installation_id) AS installs FROM metric_events GROUP BY build`,
  ].map(query => prepare(db, query)));
  if (![candidates, internal, coverage, builds].every(result => result.success)) throw new Error("Audience query failed");
  // A build only a handful of installs ever ran is almost always a development or TestFlight build.
  const buildReach = new Map(builds.results.map(row => [String(row.build), Number(row.installs) || 0]));
  const isRare = (build: string) => (buildReach.get(build) || 0) <= 3;
  const typical = median(candidates.results.map(row => Number(row.sessions) || 0));
  const flagged = candidates.results.map(row => {
    const flags: string[] = [];
    const builds = String(row.build_list || "").split(",").filter(Boolean);
    if (builds.length > 1) flags.push(`Ran ${builds.length} app builds`);
    if (builds.some(isRare)) flags.push("Used a build seen on 3 or fewer installs");
    if (/\(Build \d+[A-Z]\d{4}[a-z]\)$/.test(String(row.os_version))) flags.push("Beta iOS");
    if (Number(row.sessions) >= Math.max(15, typical * 5)) flags.push("Unusually frequent visits");
    if (Number(row.settings_opens) >= 10) flags.push("Frequent Settings opens");
    if (Number(row.ad_taps) >= 3) flags.push("Repeated ad taps");
    return { ...row, events: Number(row.events) || 0, flags };
  }).filter(row => row.flags.length).sort((a, b) => b.flags.length - a.flags.length || b.events - a.events).slice(0, 10);
  const activity = new Map(internal.results.map(row => [row.installation_id, row]));
  return {
    internal_excluded: audience.excludeInternal,
    internal: audience.internal.map(row => ({ ...row, ...(activity.get(row.id) || { events: 0, sessions: 0, last_seen: null }) })),
    candidates: flagged,
    coverage: coverage.results[0] || {},
  };
}

function median(values: number[]) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}
