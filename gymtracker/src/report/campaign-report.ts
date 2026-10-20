import { AD_PREVIEW_STYLES, renderAdPreview, type PreviewAd } from "../ad-preview";
import { barChartSvg, shareBarsHtml } from "../charts";
import type { Audience } from "../analytics/audience";
import { TIMELINE_MAX_DAYS, campaignStats } from "../analytics/campaign";
import { ctr } from "../analytics/overview";
import { DAY, REPORT_TIME_ZONE, REPORT_TIME_ZONE_LABEL, localDates } from "../analytics/time";

export interface Campaign extends PreviewAd {
  id: string; sponsor: string; headline: string; cta: string; destination_url: string;
  start_at?: string; end_at?: string; tier?: string; sponsored_label?: string; placement?: string;
}
export const REPORT_PERIODS = ["7", "30", "90", "180", "365", "campaign"];

export function escapeHtml(value: unknown): string {
  return String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
/** Safe inside a CSS string literal inside a <style> element. */
function cssString(value: string) {
  return '"' + value.replace(/[\\"]/g, "\\$&").replace(/[\n\r]/g, " ").replace(/</g, "\\3C ") + '"';
}

/** Preset windows always describe the requested period, independent of today's campaign settings. */
export function campaignRange(ad: Campaign, days: string | null, now = new Date()) {
  if (days !== null && !REPORT_PERIODS.includes(days)) throw new Error("Invalid report period");
  const selection = days || "30";
  const earliest = now.getTime() - 366 * DAY;
  const start = ad.start_at ? Date.parse(ad.start_at) : NaN;
  const end = ad.end_at ? Date.parse(ad.end_at) : NaN;
  const requestedStart = selection === "campaign" && Number.isFinite(start) ? start : now.getTime() - Number(selection === "campaign" ? 30 : selection) * DAY;
  // Configured campaign end dates are inclusive; queries use an exclusive upper bound.
  const before = selection === "campaign" && Number.isFinite(end) ? Math.min(now.getTime(), end + 1) : now.getTime();
  return {
    from: new Date(Math.min(Math.max(earliest, requestedStart), before)), before: new Date(before),
    truncated: requestedStart < earliest, not_started: selection === "campaign" && start > now.getTime(),
    label: selection === "campaign" ? "Campaign dates" : `Last ${selection} days`,
  };
}

export async function buildCampaignReport(env: Env, ad: Campaign, days: string | null, audience: Audience, now = new Date()) {
  if (!env.METRICS) throw new Error("Analytics not configured");
  const history = await env.METRICS.prepare(`SELECT MIN(received_at) AS first_recorded
    FROM metric_events WHERE ad_id = ? AND event IN ('ad_impression', 'ad_tap')`).bind(ad.id).first<{ first_recorded: string | null }>();
  const historicalStart = !ad.start_at && history?.first_recorded ? { ...ad, start_at: history.first_recorded } : ad;
  const range = campaignRange(historicalStart, days, now);
  const stats = await campaignStats(env, ad.id, range.from, range.before, audience);
  return {
    campaign: ad, period: { ...range, from: range.from.toISOString(), before: range.before.toISOString() },
    generated_at: now.toISOString(), time_zone: REPORT_TIME_ZONE, campaign_first_recorded_at: history?.first_recorded ?? null, ...stats,
  };
}

type Stats = Awaited<ReturnType<typeof campaignStats>>;
export type Report = Omit<Awaited<ReturnType<typeof buildCampaignReport>>, keyof Stats> & Partial<Stats> &
  Pick<Stats, "impressions" | "clicks" | "reach" | "unique_clickers" | "first_event" | "last_event" | "daily" | "creatives">;

const zone = REPORT_TIME_ZONE;
const BRAND = "Gym Tracker";
const n = (value: unknown) => (Number(value) || 0).toLocaleString("en-US");
const percent = (views: number, taps: number) => views ? ctr(views, taps).toFixed(2) + "%" : "–";
const share = (part: number, whole: number) => whole ? Math.round(part / whole * 100) + "%" : "0%";
const dateOnly = (value: string | number, options: Intl.DateTimeFormatOptions = {}) =>
  new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: zone, ...options });
const dayKey = (key: string, options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }) => new Date(key + "T12:00:00Z").toLocaleDateString("en-US", { ...options, timeZone: "UTC" });
const dateTime = (value: string) => new Date(value).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: zone, timeZoneName: "short" });
const hourLabel = (hour: number) => `${hour % 12 || 12} ${hour < 12 ? "AM" : "PM"}`;

/** "Oct 18 – 19, 2026", "Sep 30 – Oct 6, 2026", or "Dec 28, 2026 – Jan 3, 2027". */
function dateRange(from: string | number, toInclusive: string | number) {
  const a = new Date(from), b = new Date(toInclusive);
  const part = (d: Date, o: Intl.DateTimeFormatOptions) => d.toLocaleDateString("en-US", { ...o, timeZone: zone });
  const sameYear = part(a, { year: "numeric" }) === part(b, { year: "numeric" });
  if (part(a, { year: "numeric", month: "short", day: "numeric" }) === part(b, { year: "numeric", month: "short", day: "numeric" })) return dateOnly(from);
  if (sameYear && part(a, { month: "short" }) === part(b, { month: "short" })) return `${part(a, { month: "short", day: "numeric" })} – ${part(b, { day: "numeric" })}, ${part(b, { year: "numeric" })}`;
  return sameYear ? `${part(a, { month: "short", day: "numeric" })} – ${dateOnly(toInclusive)}` : `${dateOnly(from)} – ${dateOnly(toInclusive)}`;
}

/** Three-hour window holding the largest share of views, when there is enough data to say so. */
function peakHours(hourly: { hour: number; impressions: number }[], total: number) {
  if (total < 20) return null;
  const byHour = Array.from({ length: 24 }, (_, h) => hourly.find(r => r.hour === h)?.impressions || 0);
  let best = { start: 0, views: -1 };
  for (let start = 0; start <= 21; start++) {
    const views = byHour[start] + byHour[start + 1] + byHour[start + 2];
    if (views > best.views) best = { start, views };
  }
  const start = hourLabel(best.start), end = hourLabel((best.start + 3) % 24);
  return { start, end, label: `${start}–${end}`, share: best.views / total };
}

/** Continuous hourly series between the first and last active hour (local wall clock). */
function hourlySeries(timeline: { slot: string; impressions: number }[]) {
  if (!timeline.length) return [];
  const toMs = (slot: string) => Date.parse(slot.replace(" ", "T") + ":00:00Z");
  const bySlot = new Map(timeline.map(r => [r.slot, r.impressions]));
  const start = toMs(timeline[0].slot), end = toMs(timeline[timeline.length - 1].slot);
  const points: { slot: string; hour: number; date: string; value: number }[] = [];
  for (let t = start; t <= end; t += 3600000) {
    const iso = new Date(t).toISOString();
    const slot = iso.slice(0, 10) + " " + iso.slice(11, 13);
    const hour = new Date(t).getUTCHours();
    points.push({ slot, hour, date: iso.slice(0, 10), value: bySlot.get(slot) || 0 });
  }
  const labelEvery = points.length <= 30 ? 6 : 12;
  return points.map(p => ({
    label: p.hour === 0 || p === points[0] ? dayKey(p.date) : p.hour % labelEvery === 0 ? hourLabel(p.hour) : "",
    value: p.value, title: `${dayKey(p.date, { weekday: "short", month: "short", day: "numeric" })}, ${hourLabel(p.hour)}: ${n(p.value)} views`,
  }));
}


export function campaignReportHtml(report: Report, downloadUrl: string, standalone = false, origin = "https://gymtracker.jackhannon.net"): string {
  const e = escapeHtml;
  const campaign = report.campaign;
  const hasData = report.impressions > 0 || report.clicks > 0;
  const frequency = report.reach ? (report.impressions / report.reach).toFixed(2) : "–";
  const tapRate = percent(report.impressions, report.clicks);
  const excluded = report.excluded;
  const hourly = report.hourly || [];
  const peak = peakHours(hourly, report.impressions);
  const daily = report.daily;
  const isFlight = report.period.label === "Campaign dates";
  const periodEnd = Date.parse(report.period.before) - 1;
  const periodText = dateRange(report.period.from, periodEnd);
  const flightText = campaign.start_at && campaign.end_at ? dateRange(campaign.start_at, campaign.end_at)
    : campaign.start_at ? `From ${dateOnly(campaign.start_at)}` : campaign.end_at ? `Until ${dateOnly(campaign.end_at)}` : "Not scheduled";
  const format = (campaign.tier || "banner").replace(/^./, c => c.toUpperCase());
  const placement = campaign.placement === "home_feed" || !campaign.placement ? "Home feed" : campaign.placement;
  // A house campaign's sponsor is the brand itself; title it by its headline so the masthead and title don't repeat.
  const isHouse = campaign.sponsor.trim() === BRAND;
  const title = isHouse ? campaign.headline : campaign.sponsor;
  const subtitle = isHouse ? "" : campaign.headline;

  // Delivery: hour by hour for short bursts of activity, otherwise one bar per calendar day of the flight.
  const first = report.first_event, last = report.last_event;
  const spanDays = first && last ? (Date.parse(last) - Date.parse(first)) / DAY : 0;
  const hourlyPoints = hasData && report.timeline && spanDays <= TIMELINE_MAX_DAYS ? hourlySeries(report.timeline) : [];
  const flightStart = campaign.start_at ? Math.max(Date.parse(report.period.from), Date.parse(campaign.start_at)) : first ? Date.parse(first) : Date.parse(report.period.from);
  const flightEnd = campaign.end_at ? Math.min(Date.parse(report.period.before), Date.parse(campaign.end_at) + 1) : Date.parse(report.period.before);
  const byDate = new Map(daily.map(row => [row.date, row]));
  const chartDates = hasData && !hourlyPoints.length && flightEnd > flightStart ? localDates(flightStart, flightEnd) : [];
  const busiest = chartDates.reduce((best, date, i) => (byDate.get(date)?.impressions || 0) > (byDate.get(chartDates[best])?.impressions || 0) ? i : best, 0);
  const deliveryChart = hourlyPoints.length >= 6
    ? barChartSvg(hourlyPoints, { ariaLabel: "Ad views per hour, " + REPORT_TIME_ZONE_LABEL, width: 720, height: 170, explicitLabels: true })
    : chartDates.length >= 2 ? barChartSvg(chartDates.map(date => {
      const row = byDate.get(date);
      return { label: dayKey(date), value: row?.impressions || 0, title: `${dayKey(date, { weekday: "short", month: "short", day: "numeric" })}: ${n(row?.impressions || 0)} views, ${n(row?.clicks || 0)} taps` };
    }), { ariaLabel: "Ad views per day, " + REPORT_TIME_ZONE_LABEL, width: 720, height: 170, valueLabels: chartDates.length <= 14, highlight: busiest }) : "";
  const deliveryTitle = hourlyPoints.length >= 6 ? "Views per hour" : "Views per day";
  const hourChart = !hourlyPoints.length && report.impressions >= 20 ? barChartSvg(Array.from({ length: 24 }, (_, hour) => {
    const row = hourly.find(r => r.hour === hour);
    return { label: hour % 6 === 0 ? hourLabel(hour) : "", value: row?.impressions || 0, title: `${hourLabel(hour)}: ${n(row?.impressions || 0)} views` };
  }), { ariaLabel: "Ad views by hour of day, " + REPORT_TIME_ZONE_LABEL, width: 340, height: 140, explicitLabels: true }) : "";
  const frequencyBars = report.reach > 0 && report.frequency?.length ? shareBarsHtml([1, 2, 3, 4, 5].map(views => {
    const installs = report.frequency!.find(r => r.views === views)?.installs || 0;
    return { label: views === 5 ? "5+" : String(views), value: installs, display: share(installs, report.reach) };
  }), "Share of reach by number of views") : "";

  const stat = (value: string, label: string) => `<div class="stat"><span class="stat-value">${value}</span><span class="stat-label">${label}</span></div>`;
  const results = hasData
    ? `<div class="stats">${stat(n(report.impressions), "Ad views")}${stat(n(report.reach), "Reach")}${stat(frequency, "Frequency")}${stat(n(report.clicks), "Link taps")}${stat(tapRate, "Tap rate")}</div>`
    : `<p class="empty">${report.period.not_started ? "This campaign has not started." : "No activity recorded in this period."}</p>`;

  const multiDay = daily.length > 1;
  const dailyRows = multiDay ? daily.map(row => `<tr><th scope="row">${e(dayKey(row.date, { weekday: "short", month: "short", day: "numeric" }))}</th><td>${n(row.impressions)}</td><td>${n(row.reach)}</td><td>${n(row.clicks)}</td><td>${percent(row.impressions, row.clicks)}</td></tr>`).join("") : "";
  const totalRow = `<tfoot><tr><th scope="row">Total</th><td>${n(report.impressions)}</td><td>${n(report.reach)}<sup>*</sup></td><td>${n(report.clicks)}</td><td>${tapRate}</td></tr></tfoot>`;
  const creativeRows = report.creatives.length > 1 ? report.creatives.map(row => `<tr><th scope="row">${e(row.creative_version || "Unversioned")}</th><td>${n(row.impressions)}</td><td>${n(row.clicks)}</td><td>${percent(row.impressions, row.clicks)}</td></tr>`).join("") : "";
  const selectedPeriod = isFlight ? "campaign" : report.period.label.match(/Last (\d+) days/)?.[1] || "30";
  const periodOptions = REPORT_PERIODS.map(value => `<option value="${value}"${value === selectedPeriod ? " selected" : ""}>${value === "campaign" ? "Campaign dates" : `Last ${value} days`}</option>`).join("");
  const filtration = !excluded?.internal_excluded ? "Includes internal test traffic."
    : excluded.installations ? `Excludes ${n(excluded.installations)} internal test ${excluded.installations === 1 ? "install" : "installs"} (${n(excluded.impressions)} views, ${n(excluded.clicks)} taps).`
    : "Internal test traffic excluded.";
  const footerLeft = isHouse ? `${BRAND} · Campaign report` : `${BRAND} · Campaign report · ${campaign.sponsor}`;

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${e(title)} · Campaign report · ${e(periodText)}</title>
<style>
  ${AD_PREVIEW_STYLES}
  /* A document, not an app screen: one light palette on screen and in print, with maroon as the only accent. */
  :root { color-scheme:light; --bg-color:#fff; --text-color:#1c1c1e; --text-mid:#48484a; --muted:#6e6e73; --accent:#861f41; --accent-dark:#6d1936;
    --accent-soft:#f3e9ed; --border:#e5e5ea; --border-strong:#d1d1d6; --surface:#fafafa; --bar:#c9a3b0; --bar-strong:#861f41; --ad-maroon:#861f41; }
  * { box-sizing:border-box; }
  body { margin:0; background:var(--bg-color); color:var(--text-color); font:15px/1.55 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  a { color:inherit; } a:focus-visible,button:focus-visible,select:focus-visible { outline:2px solid var(--accent); outline-offset:3px; }
  .container { max-width:820px; margin:0 auto; padding:0 20px; }
  .toolbar { border-bottom:1px solid var(--border); background:var(--surface); } .toolbar .container { display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:12px 16px; padding-top:10px; padding-bottom:10px; font-size:.875rem; }
  .toolbar.standalone .container { justify-content:flex-end; }
  .back-link { color:var(--muted); text-decoration:none; } .back-link:hover { color:var(--text-color); }
  .report-period { display:flex; align-items:center; gap:8px; color:var(--text-mid); }
  .report-period select { padding:7px 10px; border:1px solid var(--border-strong); border-radius:8px; font:inherit; color:var(--text-color); background:var(--bg-color); }
  .toolbar-actions { display:flex; gap:8px; }
  .btn-primary, .btn-ghost { display:inline-flex; align-items:center; justify-content:center; font:600 .875rem/1.4 inherit; padding:8px 14px; border-radius:8px; cursor:pointer; text-decoration:none; }
  .btn-primary { background:var(--accent); color:#fff; border:0; } .btn-primary:hover { background:var(--accent-dark); }
  .btn-ghost { color:var(--text-color); background:var(--bg-color); border:1px solid var(--border-strong); font-weight:500; } .btn-ghost:hover { border-color:var(--muted); }
  .masthead { display:flex; justify-content:space-between; align-items:center; gap:16px; padding:24px 0 14px; border-bottom:2px solid var(--accent); font-size:.75rem; letter-spacing:.06em; text-transform:uppercase; color:var(--muted); }
  .brand { display:flex; align-items:center; gap:8px; color:var(--text-color); font-weight:600; } .brand img { width:20px; height:20px; border-radius:5px; }
  main > section { padding:26px 0; } main > section + section { border-top:1px solid var(--border); }
  .hero { padding-top:28px !important; }
  h1 { font-size:clamp(1.75rem,4.5vw,2.25rem); line-height:1.15; font-weight:700; letter-spacing:-.02em; margin:0; overflow-wrap:anywhere; }
  .subline { margin:6px 0 0; color:var(--text-mid); font-size:1.0625rem; overflow-wrap:anywhere; }
  .meta { display:flex; flex-wrap:wrap; gap:8px 32px; margin:18px 0 0; font-size:.875rem; }
  .meta dt { color:var(--muted); font-size:.75rem; } .meta dd { margin:1px 0 0; font-weight:600; }
  h2 { font-size:.75rem; line-height:1.3; font-weight:600; letter-spacing:.06em; text-transform:uppercase; color:var(--muted); margin:0 0 14px; break-after:avoid; }
  h3 { font-size:.875rem; font-weight:600; margin:0 0 10px; }
  .stats { display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); border:1px solid var(--border); border-radius:10px; break-inside:avoid; }
  .stat { display:flex; flex-direction:column; min-width:0; padding:16px 18px; } .stat + .stat { border-left:1px solid var(--border); }
  .stat-value { font-size:1.5rem; font-weight:700; line-height:1.2; letter-spacing:-.01em; font-variant-numeric:tabular-nums; }
  .stat-label { font-size:.8125rem; color:var(--muted); margin-top:2px; }
  .empty { margin:0; color:var(--text-mid); }
  .figure { margin:0; break-inside:avoid; } .figure + .grid-2 { margin-top:26px; }
  .chart { display:block; width:100%; height:auto; overflow:visible; } .chart-grid { stroke:var(--border); } .chart-axis { fill:var(--muted); font:11px system-ui,sans-serif; }
  .chart-bar { fill:var(--bar); } .chart-bar.is-highlight { fill:var(--bar-strong); } .chart-value { fill:var(--text-mid); font:600 11px system-ui,sans-serif; }
  .caption { color:var(--muted); font-size:.75rem; margin:6px 0 0; }
  .grid-2 { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:32px; break-inside:avoid; }
  .share-bars { display:grid; gap:9px; font-size:.8125rem; } .share-row { display:grid; grid-template-columns:28px minmax(0,1fr) 40px; gap:10px; align-items:center; }
  .share-label { color:var(--text-mid); font-variant-numeric:tabular-nums; }
  .share-track { height:8px; background:var(--accent-soft); border-radius:4px; overflow:hidden; } .share-fill { display:block; height:100%; background:var(--bar-strong); border-radius:4px; }
  .share-value { text-align:right; color:var(--text-mid); font-variant-numeric:tabular-nums; }
  .table-wrap { overflow-x:auto; } table { width:100%; border-collapse:collapse; font-size:.8125rem; font-variant-numeric:tabular-nums; }
  th, td { padding:8px; border-bottom:1px solid var(--border); text-align:right; } th:first-child { text-align:left; padding-left:0; } th:last-child, td:last-child { padding-right:0; }
  thead th { color:var(--muted); font-weight:500; font-size:.75rem; white-space:nowrap; border-bottom-color:var(--border-strong); } tbody th { font-weight:500; }
  tfoot th, tfoot td { font-weight:600; border-bottom:0; border-top:1px solid var(--border-strong); } tr { break-inside:avoid; }
  .creative { display:grid; grid-template-columns:minmax(0,300px) minmax(0,1fr); gap:32px; align-items:start; break-inside:avoid; }
  .creative .creative-preview { border-radius:10px; max-width:300px; } .creative .creative-button { border-radius:6px; }
  .details { display:grid; gap:12px; margin:0; font-size:.875rem; } .details dt { color:var(--muted); font-size:.75rem; } .details dd { margin:1px 0 0; overflow-wrap:anywhere; }
  .notes { margin:0; padding:0; list-style:none; display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:6px 32px; font-size:.75rem; color:var(--muted); }
  .notes strong { color:var(--text-mid); font-weight:600; }
  .footer { border-top:1px solid var(--border); padding:16px 0 28px; font-size:.75rem; color:var(--muted); display:flex; justify-content:space-between; gap:16px; }
  @page { size:A4; margin:16mm 16mm 18mm;
    @bottom-left { content:${cssString(footerLeft)}; font:7.5pt system-ui,sans-serif; color:#6e6e73; }
    @bottom-right { content:counter(page) " / " counter(pages); font:7.5pt system-ui,sans-serif; color:#6e6e73; } }
  @media print {
    body { font-size:9.5pt; line-height:1.5; } .toolbar, .footer { display:none; } .container { max-width:none; padding:0; }
    .masthead { padding-top:0; font-size:7.5pt; } .hero { padding-top:16pt !important; } main > section { padding:14pt 0; }
    h1 { font-size:21pt; } .subline { font-size:10.5pt; } .meta { margin-top:10pt; font-size:9pt; } .meta dt, .details dt { font-size:7.5pt; }
    h2 { font-size:7.5pt; margin-bottom:9pt; } h3 { font-size:9pt; margin-bottom:7pt; }
    .stat { padding:10pt 12pt; } .stat-value { font-size:15pt; } .stat-label { font-size:8pt; }
    .caption, .notes { font-size:7.5pt; } table, .share-bars, .details { font-size:8.5pt; }
    th, td { padding:4.5pt 6pt; } thead { display:table-header-group; } .table-wrap { overflow:visible; }
    .creative { grid-template-columns:minmax(0,230px) minmax(0,1fr); gap:20pt; } .creative-copy h3 { font-size:12pt; } .creative-copy p, .creative-button { font-size:8.5pt; }
    .creative-preview-feature .creative-image-wrap { height:140px; } .creative-preview-banner .creative-image-wrap { height:96px; }
    .grid-2 { gap:20pt; } .figure + .grid-2 { margin-top:14pt; }
    /* Page 1 is the summary; detail starts on page 2 when there is delivery to summarize. */
    .has-summary .detail-start { break-before:page; border-top:0; padding-top:0; }
  }
  @media screen and (max-width:640px) {
    .toolbar-actions { width:100%; } .toolbar-actions > * { flex:1; }
    .stats { grid-template-columns:repeat(2,minmax(0,1fr)); } .stat + .stat { border-left:0; } .stat { border-top:1px solid var(--border); } .stat:nth-child(-n+2) { border-top:0; } .stat:nth-child(even) { border-left:1px solid var(--border); } .stat:last-child { grid-column:1/-1; }
    .grid-2, .creative, .notes { grid-template-columns:1fr; } table { min-width:420px; } .footer { flex-direction:column; gap:4px; }
  }
</style></head><body${hasData ? ' class="has-summary"' : ""}>
<nav class="toolbar${standalone ? " standalone" : ""}" aria-label="Report export"><div class="container">${standalone ? "" : `<a class="back-link" href="/admin">&larr; Dashboard</a><form class="report-period" action="/api/admin/campaign-report" method="get"><input type="hidden" name="id" value="${e(campaign.id)}"><label for="reportPeriod">Period</label><select id="reportPeriod" name="days" onchange="this.form.requestSubmit()">${periodOptions}</select><noscript><button type="submit" class="btn-ghost">Apply</button></noscript></form>`}<div class="toolbar-actions">${standalone ? "" : `<a class="btn-ghost download" href="${e(downloadUrl)}">Download HTML</a>`}<button type="button" class="btn-primary" onclick="window.print()">Save as PDF</button></div></div></nav>
<div class="container">
  <header class="masthead"><div class="brand"><img src="${e((standalone ? origin : "") + "/favicon/apple-touch-icon.png")}" alt="" onerror="this.remove()">${BRAND}</div><div>Campaign report</div></header>
  <main>
    <section class="hero" aria-labelledby="reportTitle">
      <h1 id="reportTitle">${e(title)}</h1>
      ${subtitle ? `<p class="subline">${e(subtitle)}</p>` : ""}
      <dl class="meta">
        <div><dt>${isFlight ? "Campaign dates" : e(report.period.label)}</dt><dd>${e(periodText)}</dd></div>
        ${isFlight ? "" : `<div><dt>Campaign dates</dt><dd>${e(flightText)}</dd></div>`}
        <div><dt>Placement</dt><dd>${e(placement)} · ${e(format)}</dd></div>
        <div><dt>Prepared</dt><dd>${e(dateOnly(report.generated_at))}</dd></div>
      </dl>
    </section>
    <section aria-labelledby="resultsHeading"><h2 id="resultsHeading">Results</h2>${results}</section>
    ${deliveryChart || hourChart || frequencyBars ? `<section aria-labelledby="deliveryHeading"><h2 id="deliveryHeading">Delivery</h2>
      ${deliveryChart ? `<figure class="figure"><h3>${deliveryTitle}</h3>${deliveryChart}</figure>` : ""}
      ${hourChart || frequencyBars ? `<div class="grid-2">${hourChart ? `<figure class="figure"><h3>Time of day</h3>${hourChart}${peak ? `<figcaption class="caption">Peak ${peak.label}</figcaption>` : ""}</figure>` : ""}${frequencyBars ? `<figure class="figure"><h3>Views per install</h3>${frequencyBars}<figcaption class="caption">Share of reach</figcaption></figure>` : ""}</div>` : ""}
    </section>` : ""}
    ${dailyRows ? `<section class="detail-start" aria-labelledby="dailyHeading"><h2 id="dailyHeading">By day</h2><div class="table-wrap"><table><thead><tr><th scope="col">Date</th><th scope="col">Ad views</th><th scope="col">Reach</th><th scope="col">Link taps</th><th scope="col">Tap rate</th></tr></thead><tbody>${dailyRows}</tbody>${totalRow}</table></div><p class="caption"><sup>*</sup>Each install counted once.</p></section>` : ""}
    ${creativeRows ? `<section${dailyRows ? "" : ' class="detail-start"'} aria-labelledby="versionsHeading"><h2 id="versionsHeading">By ad version</h2><div class="table-wrap"><table><thead><tr><th scope="col">Version</th><th scope="col">Ad views</th><th scope="col">Link taps</th><th scope="col">Tap rate</th></tr></thead><tbody>${creativeRows}</tbody></table></div></section>` : ""}
    <section${dailyRows || creativeRows ? "" : ' class="detail-start"'} aria-labelledby="creativeHeading"><h2 id="creativeHeading">Creative</h2><div class="creative"><div>${renderAdPreview(campaign)}</div><dl class="details">
      <div><dt>Button</dt><dd>${e(campaign.cta)}</dd></div>
      <div><dt>Destination</dt><dd>${e(campaign.destination_url)}</dd></div>
      ${isFlight ? "" : `<div><dt>Campaign dates</dt><dd>${e(flightText)}</dd></div>`}</dl></div></section>
    <section aria-labelledby="notesHeading"><h2 id="notesHeading">Notes</h2><ul class="notes">
      <li><strong>Ad view</strong> · at least half the ad on screen for one second</li>
      <li><strong>Reach</strong> · unique app installs that viewed the ad</li>
      <li><strong>Frequency</strong> · ad views per install</li>
      <li><strong>Tap rate</strong> · link taps ÷ ad views${report.clicks > 0 && report.impressions === 0 ? " (needs at least one view)" : ""}</li>
      <li>${e(filtration)} Times in ${REPORT_TIME_ZONE_LABEL}.${report.period.truncated ? " Limited to the last 366 days." : ""}</li>
    </ul></section>
  </main>
  <footer class="footer"><span>${e(footerLeft)}</span><span>${e(campaign.id)} · ${e(dateTime(report.generated_at))}</span></footer>
</div></body></html>`;
}
