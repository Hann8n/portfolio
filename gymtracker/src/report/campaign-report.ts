import { AD_PREVIEW_STYLES, renderAdPreview, type PreviewAd } from "../ad-preview";
import { barChartSvg, shareBarsHtml } from "../charts";
import type { Audience } from "../analytics/audience";
import { campaignStats } from "../analytics/campaign";
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
const n = (value: unknown) => (Number(value) || 0).toLocaleString("en-US");
const plural = (count: number, one: string, many: string) => `${n(count)} ${count === 1 ? one : many}`;
const percent = (views: number, taps: number) => views ? ctr(views, taps).toFixed(2) + "%" : "Not available";
const longDate = (value: string | number) => new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: zone });
const dayKey = (key: string, options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }) => new Date(key + "T12:00:00Z").toLocaleDateString("en-US", { ...options, timeZone: "UTC" });
const dateTime = (value: string) => new Date(value).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: zone, timeZoneName: "short" });
const hourLabel = (hour: number) => `${hour % 12 || 12} ${hour < 12 ? "AM" : "PM"}`;

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

export function campaignReportHtml(report: Report, downloadUrl: string, standalone = false, origin = "https://gymtracker.jackhannon.net"): string {
  const e = escapeHtml;
  const campaign = report.campaign;
  const hasData = report.impressions > 0 || report.clicks > 0;
  const frequency = report.reach ? (report.impressions / report.reach).toFixed(2) : "Not available";
  const tapRate = percent(report.impressions, report.clicks);
  const first = report.first_event, last = report.last_event;
  const activity = first && last ? (longDate(first) === longDate(last) ? longDate(first) : `${longDate(first)} – ${longDate(last)}`) : "No recorded activity in this period";
  const excluded = report.excluded;
  const hourly = report.hourly || [];
  const peak = peakHours(hourly, report.impressions);
  const daily = report.daily;
  const busiest = daily.reduce<typeof daily[number] | null>((best, row) => !best || row.impressions > best.impressions ? row : best, null);

  // Chart days span the overlap of the reporting window and the configured flight, so idle days stay visible.
  const flightStart = campaign.start_at ? Math.max(Date.parse(report.period.from), Date.parse(campaign.start_at)) : first ? Date.parse(first) : Date.parse(report.period.from);
  const flightEnd = campaign.end_at ? Math.min(Date.parse(report.period.before), Date.parse(campaign.end_at) + 1) : Date.parse(report.period.before);
  const chartDates = hasData && flightEnd > flightStart ? localDates(flightStart, flightEnd) : [];
  const byDate = new Map(daily.map(row => [row.date, row]));
  const dailyChart = chartDates.length >= 2 ? barChartSvg(chartDates.map(date => {
    const row = byDate.get(date);
    return { label: dayKey(date), value: row?.impressions || 0, title: `${dayKey(date, { weekday: "short", month: "short", day: "numeric" })}: ${n(row?.impressions || 0)} views, ${n(row?.clicks || 0)} taps` };
  }), { ariaLabel: "Ad views per day, " + REPORT_TIME_ZONE_LABEL, width: 680, height: 190, valueLabels: chartDates.length <= 14 }) : "";
  const hourChart = report.impressions >= 10 ? barChartSvg(Array.from({ length: 24 }, (_, hour) => {
    const row = hourly.find(r => r.hour === hour);
    return { label: hour % 6 === 0 ? hourLabel(hour) : "", value: row?.impressions || 0, title: `${hourLabel(hour)}: ${n(row?.impressions || 0)} views` };
  }), { ariaLabel: "Ad views by hour of day, " + REPORT_TIME_ZONE_LABEL, width: 330, height: 150 }) : "";
  const frequencyBars = report.reach > 0 && report.frequency?.length ? shareBarsHtml([1, 2, 3, 4, 5].map(views => {
    const installs = report.frequency!.find(r => r.views === views)?.installs || 0;
    return { label: views === 5 ? "5+ views" : plural(views, "view", "views"), value: installs, display: `${n(installs)} · ${(installs / report.reach * 100).toFixed(0)}%` };
  }), "Reached installs by number of views") : "";

  const highlights = hasData ? [
    `Delivered <strong>${plural(report.impressions, "qualified view", "qualified views")}</strong> to <strong>${plural(report.reach, "unique app install", "unique app installs")}</strong>${report.reach ? `, an average of ${frequency} views each` : ""}.`,
    report.clicks ? `Recorded <strong>${plural(report.clicks, "link tap", "link taps")}</strong> from ${plural(report.unique_clickers, "install", "installs")}${report.impressions ? `, a <strong>${tapRate}</strong> tap rate` : ""}.` : "No link taps were recorded in this period.",
    busiest && daily.length > 1 ? `Busiest day: ${e(dayKey(busiest.date, { weekday: "long", month: "short", day: "numeric" }))} with ${plural(busiest.impressions, "view", "views")} (${(busiest.impressions / Math.max(1, report.impressions) * 100).toFixed(0)}% of delivery).` : "",
    peak ? `${(peak.share * 100).toFixed(0)}% of views happened between ${peak.start} and ${peak.end} ${REPORT_TIME_ZONE_LABEL}.` : "",
  ].filter(Boolean) : [];
  const summary = hasData
    ? `<ul class="highlights">${highlights.map(item => `<li>${item}</li>`).join("")}</ul>`
    : `<p class="summary">${report.period.not_started ? "This campaign has not started yet." : "No campaign activity was recorded in the selected period."}</p>`;

  const metrics = hasData ? `<div class="metrics">
    <div><span>Ad views</span><strong>${n(report.impressions)}</strong><small>Half the ad visible for one second</small></div>
    <div><span>Unique reach</span><strong>${n(report.reach)}</strong><small>App installs with a view</small></div>
    <div><span>Link taps</span><strong>${n(report.clicks)}</strong><small>${plural(report.unique_clickers, "unique install", "unique installs")}</small></div>
    <div><span>Tap rate</span><strong>${tapRate}</strong><small>${plural(report.clicks, "tap", "taps")} ÷ ${n(report.impressions)} ad views × 100</small></div>
  </div><dl class="secondary-metrics"><div><dt>Average frequency</dt><dd>${frequency}</dd></div><div><dt>Days with delivery</dt><dd>${n(daily.filter(r => r.impressions > 0).length)}</dd></div><div><dt>Peak hours · ${REPORT_TIME_ZONE_LABEL}</dt><dd>${peak ? e(peak.label) : "Not enough data"}</dd></div></dl>`
    : `<p class="empty">There is no measured result to assess yet. Older app versions, analytics opt-outs, and failed uploads are not represented. This does not establish that nobody saw the campaign.</p>`;

  const dailyRows = daily.map(row => `<tr><th scope="row">${e(dayKey(row.date, { weekday: "short", month: "short", day: "numeric", year: "numeric" }))}</th><td>${n(row.impressions)}</td><td>${n(row.reach)}</td><td>${n(row.clicks)}</td><td>${percent(row.impressions, row.clicks)}</td></tr>`).join("");
  const totalRow = daily.length > 1 ? `<tfoot><tr><th scope="row">Total</th><td>${n(report.impressions)}</td><td>${n(report.reach)}<sup>*</sup></td><td>${n(report.clicks)}</td><td>${tapRate}</td></tr></tfoot>` : "";
  const creativeRows = report.creatives.length > 1 ? report.creatives.map(row => `<tr><th scope="row">${e(row.creative_version || "No version set")}</th><td>${n(row.impressions)}</td><td>${n(row.clicks)}</td><td>${percent(row.impressions, row.clicks)}</td></tr>`).join("") : "";
  const selectedPeriod = report.period.label === "Campaign dates" ? "campaign" : report.period.label.match(/Last (\d+) days/)?.[1] || "30";
  const periodOptions = REPORT_PERIODS.map(value => `<option value="${value}"${value === selectedPeriod ? " selected" : ""}>${value === "campaign" ? "Campaign dates" : `Last ${value} days`}</option>`).join("");
  const flight = campaign.start_at || campaign.end_at ? `${campaign.start_at ? dateTime(campaign.start_at) : "Open start"} – ${campaign.end_at ? dateTime(campaign.end_at) : "open end"}` : "Not scheduled";
  const exclusionNote = excluded?.internal_excluded && excluded.installations
    ? `Activity from ${plural(excluded.installations, "internal test install", "internal test installs")} (${plural(excluded.impressions, "view", "views")}, ${plural(excluded.clicks, "tap", "taps")}) is excluded from every figure.`
    : "";
  const footerLeft = `Gym Tracker · ${campaign.sponsor} · ${campaign.id}`;

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${e(campaign.sponsor)} · Campaign report · ${e(report.period.label)}</title>
<script>try{if(localStorage.getItem('theme')==='dark'||(!localStorage.getItem('theme')&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark-theme');}catch{}</script>
<style>
  ${AD_PREVIEW_STYLES}
  :root { color-scheme:light dark; --bg:#fff; --surface:#fafafa; --text:#222; --secondary:#555; --muted:#767676; --line:#e5e5e5; --strong-line:#cfcfcf; --link:#c95a7a; --maroon:#861f41; --orange:#e5751f; --bar:#861f41; --bar-soft:#e9d3db; }
  .dark-theme { --bg:#1a1a1a; --surface:#222; --text:#e6e6e6; --secondary:#b3b3b3; --muted:#969696; --line:#333; --strong-line:#444; --ad-maroon:#e59ab4; --bar:#d27b99; --bar-soft:#4a2a35; }
  @media(prefers-color-scheme:dark) { :root:not(.light-theme):not(.dark-theme) { --bg:#1a1a1a; --surface:#222; --text:#e6e6e6; --secondary:#b3b3b3; --muted:#969696; --line:#333; --strong-line:#444; --ad-maroon:#e59ab4; --bar:#d27b99; --bar-soft:#4a2a35; } }
  * { box-sizing:border-box; } body { margin:0; background:var(--bg); color:var(--text); font:14px/1.55 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  a { color:var(--link); text-decoration:none; } a:hover { text-decoration:underline; }
  a:focus-visible,button:focus-visible,select:focus-visible { outline:2px solid var(--link); outline-offset:3px; }
  .actions { max-width:860px; margin:auto; padding:14px 24px; display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:12px 16px; border-bottom:1px solid var(--line); font-size:13px; }
  .report-period { display:flex; align-items:center; gap:8px; } .report-period select { border:1px solid var(--strong-line); border-radius:8px; padding:8px; color:var(--text); background:var(--bg); font:inherit; }
  .actions-group { display:flex; gap:8px; } .actions-group>* { font:500 13px/1.4 system-ui,sans-serif; padding:9px 14px; min-height:40px; border-radius:8px; cursor:pointer; display:inline-flex; align-items:center; }
  .download { border:1px solid var(--strong-line); color:var(--text); } .actions button { border:1px solid var(--maroon); background:var(--maroon); color:#fff; }
  .sheet { max-width:860px; margin:auto; padding:28px 24px 40px; }
  .masthead { display:flex; justify-content:space-between; align-items:center; gap:16px; padding-bottom:14px; border-bottom:2px solid var(--maroon); }
  .brand { display:flex; align-items:center; gap:10px; font-weight:700; letter-spacing:-.01em; } .brand img { width:28px; height:28px; border-radius:7px; }
  .doc-type { text-align:right; color:var(--secondary); font-size:12px; line-height:1.4; } .doc-type strong { display:block; color:var(--text); font-size:13px; }
  .title { padding:22px 0 18px; } h1 { font-size:30px; line-height:1.15; letter-spacing:-.02em; margin:0 0 6px; overflow-wrap:anywhere; } .headline { color:var(--secondary); margin:0; font-size:15px; overflow-wrap:anywhere; }
  .facts { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:14px 20px; margin:0; padding:14px 0; border-top:1px solid var(--line); border-bottom:1px solid var(--line); font-size:12px; }
  .facts dt, .secondary-metrics dt { color:var(--muted); font-size:11px; } .facts dd, .secondary-metrics dd { margin:2px 0 0; overflow-wrap:anywhere; font-weight:500; }
  section { margin-top:24px; break-inside:avoid; } h2 { font-size:15px; font-weight:650; letter-spacing:-.01em; margin:0 0 12px; break-after:avoid; }
  .metrics { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); border:1px solid var(--line); border-radius:12px; overflow:hidden; break-inside:avoid; }
  .metrics > div { padding:14px 16px; border-left:1px solid var(--line); } .metrics > div:first-child { border-left:0; border-top:3px solid var(--maroon); }
  .metrics span { display:block; font-size:12px; font-weight:600; color:var(--secondary); } .metrics strong { display:block; font-size:28px; line-height:1.2; margin:4px 0 2px; font-variant-numeric:tabular-nums; letter-spacing:-.02em; }
  .metrics small { display:block; color:var(--muted); font-size:11px; line-height:1.4; }
  .secondary-metrics { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px 20px; margin:14px 0 0; font-size:13px; }
  .highlights { margin:0 0 16px; padding-left:18px; color:var(--secondary); } .highlights li { margin:3px 0; } .highlights strong { color:var(--text); font-weight:600; }
  .summary, .empty { margin:0 0 4px; color:var(--secondary); }
  .chart { display:block; width:100%; height:auto; overflow:visible; } .chart-grid { stroke:var(--line); } .chart-axis { fill:var(--muted); font:10px system-ui,sans-serif; }
  .chart-bar { fill:var(--bar); } .chart-compare { fill:none; stroke:var(--muted); stroke-dasharray:2 2; } .chart-value { fill:var(--secondary); font:600 10px system-ui,sans-serif; }
  .two-up { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:28px; }
  .share-bars { display:grid; gap:9px; font-size:12px; } .share-row { display:grid; grid-template-columns:62px minmax(0,1fr) 72px; gap:10px; align-items:center; }
  .share-track { height:10px; background:var(--bar-soft); border-radius:3px; overflow:hidden; } .share-fill { display:block; height:100%; background:var(--bar); }
  .share-value { text-align:right; font-variant-numeric:tabular-nums; color:var(--secondary); }
  .table-wrap { overflow-x:auto; } table { width:100%; border-collapse:collapse; font-size:12px; font-variant-numeric:tabular-nums; }
  th,td { padding:7px 6px; border-bottom:1px solid var(--line); text-align:right; } th:first-child { text-align:left; padding-left:0; } th:last-child,td:last-child { padding-right:0; }
  thead th { color:var(--muted); font-weight:500; white-space:nowrap; border-bottom-color:var(--strong-line); } tbody th { font-weight:500; } tfoot th, tfoot td { font-weight:650; border-bottom:0; border-top:1px solid var(--strong-line); }
  tr { break-inside:avoid; } .caption { color:var(--muted); font-size:11px; margin:8px 0 0; }
  .creative-details { display:grid; grid-template-columns:minmax(0,300px) minmax(0,1fr); gap:24px; align-items:start; }
  .campaign-details { display:grid; grid-template-columns:1fr 1fr; gap:12px 24px; font-size:12px; margin:0; } .campaign-details dt { color:var(--muted); font-size:11px; } .campaign-details dd { margin:2px 0 0; overflow-wrap:anywhere; } .campaign-details .wide { grid-column:1/-1; }
  .definitions { display:grid; grid-template-columns:150px minmax(0,1fr); gap:6px 16px; margin:0; font-size:11px; line-height:1.5; } .definitions dt { font-weight:600; } .definitions dd { margin:0; color:var(--secondary); }
  .notes { color:var(--secondary); font-size:11px; line-height:1.55; margin:12px 0 0; padding:10px 12px; background:var(--surface); border:1px solid var(--line); border-radius:8px; }
  .screen-footer { display:flex; justify-content:space-between; gap:16px; border-top:1px solid var(--line); margin-top:28px; padding-top:10px; font-size:11px; color:var(--muted); }
  @page { size:A4; margin:14mm 15mm 16mm;
    @bottom-left { content:${cssString(footerLeft)}; font:8pt system-ui,sans-serif; color:#777; }
    @bottom-right { content:"Page " counter(page) " of " counter(pages); font:8pt system-ui,sans-serif; color:#777; } }
  @media print {
    :root,.dark-theme { color-scheme:light; --bg:#fff; --surface:#f7f7f7; --text:#222; --secondary:#555; --muted:#6b6b6b; --line:#e2e2e2; --strong-line:#c8c8c8; --ad-maroon:#861f41; --bar:#861f41; --bar-soft:#eddde3; }
    .actions,.screen-footer { display:none; } .sheet { max-width:none; padding:0; } body { font-size:9.5pt; }
    h1 { font-size:21pt; } .headline { font-size:10pt; } .title { padding:14px 0 12px; } section { margin-top:16px; } h2 { font-size:11pt; margin-bottom:8px; }
    .metrics strong { font-size:19pt; } .metrics > div { padding:10px 12px; } .facts { padding:10px 0; font-size:8.5pt; }
    .highlights { margin-bottom:12px; } .table-wrap { overflow:visible; } thead { display:table-header-group; }
    .creative-details { grid-template-columns:minmax(0,250px) minmax(0,1fr); gap:20px; } .creative-copy h3 { font-size:13pt; } .creative-copy p,.creative-button { font-size:9pt; }
    .creative-preview-feature .creative-image-wrap { height:150px; } .creative-preview-banner .creative-image-wrap { height:100px; }
    .appendix { break-before:auto; }
  }
  @media screen and (max-width:640px) {
    .actions { padding:12px 16px; } .actions-group { width:100%; } .actions-group>* { flex:1; justify-content:center; } .sheet { padding:20px 16px 32px; }
    h1 { font-size:25px; } .facts { grid-template-columns:1fr 1fr; } .metrics { grid-template-columns:1fr 1fr; } .metrics > div:nth-child(3) { border-left:0; } .metrics > div:nth-child(n+3) { border-top:1px solid var(--line); }
    .two-up, .creative-details, .campaign-details { grid-template-columns:1fr; } .secondary-metrics { grid-template-columns:1fr 1fr; } .definitions { grid-template-columns:1fr; } .definitions dd { margin-bottom:6px; }
    table { min-width:420px; } .screen-footer { flex-direction:column; gap:4px; }
  }
</style></head><body>
<nav class="actions" aria-label="Report export">${standalone ? "<span>Campaign report</span>" : `<a href="/admin">← Dashboard</a><form class="report-period" action="/api/admin/campaign-report" method="get"><input type="hidden" name="id" value="${e(campaign.id)}"><label for="reportPeriod">Period</label><select id="reportPeriod" name="days" onchange="this.form.requestSubmit()">${periodOptions}</select><noscript><button type="submit">Apply</button></noscript></form>`}<div class="actions-group">${standalone ? "" : `<a class="download" href="${e(downloadUrl)}">Download HTML</a>`}<button type="button" onclick="window.print()">Save as PDF / Print</button></div></nav>
<main class="sheet">
  <header>
    <div class="masthead"><div class="brand"><img src="${e((standalone ? origin : "") + "/favicon/apple-touch-icon.png")}" alt="" onerror="this.remove()">Gym Tracker</div><div class="doc-type"><strong>Campaign performance report</strong>Generated ${e(dateTime(report.generated_at))}</div></div>
    <div class="title"><h1>${e(campaign.sponsor)}</h1><p class="headline">${e(campaign.headline)}</p></div>
    <dl class="facts">
      <div><dt>Reporting period · ${e(report.period.label)}</dt><dd>${e(longDate(report.period.from))} – ${e(longDate(Date.parse(report.period.before) - 1))}</dd></div>
      <div><dt>Dates with recorded activity</dt><dd>${e(activity)}</dd></div>
      <div><dt>Flight</dt><dd>${e(flight)}</dd></div>
      <div><dt>Placement · format</dt><dd>${campaign.placement === "home_feed" || !campaign.placement ? "Home feed" : e(campaign.placement)} · ${e((campaign.tier || "banner").replace(/^./, c => c.toUpperCase()))}</dd></div>
    </dl>
  </header>
  <section aria-labelledby="summaryHeading"><h2 id="summaryHeading">Summary</h2>${summary}${metrics}</section>
  ${dailyChart ? `<section><h2>Daily delivery · ${REPORT_TIME_ZONE_LABEL}</h2>${dailyChart}<p class="caption">Qualified ad views per calendar day in Eastern Time across the campaign flight.</p></section>` : ""}
  ${hourChart || frequencyBars ? `<section class="two-up">${hourChart ? `<div><h2>Time of day · ${REPORT_TIME_ZONE_LABEL}</h2>${hourChart}<p class="caption">Ad views by hour across all days.</p></div>` : ""}${frequencyBars ? `<div><h2>Views per reached install</h2>${frequencyBars}<p class="caption">How often each reached install saw the ad.</p></div>` : ""}</section>` : ""}
  ${dailyRows ? `<section><h2>Daily breakdown</h2><div class="table-wrap"><table><thead><tr><th scope="col">Date · ${REPORT_TIME_ZONE_LABEL}</th><th scope="col">Ad views</th><th scope="col">Unique reach</th><th scope="col">Link taps</th><th scope="col">Tap rate</th></tr></thead><tbody>${dailyRows}</tbody>${totalRow}</table></div><p class="caption">Only days with recorded activity are listed.${totalRow ? " <sup>*</sup>Total reach counts each install once; daily reach overlaps and does not add up." : ""}</p></section>` : ""}
  ${creativeRows ? `<section><h2>Ad versions compared</h2><div class="table-wrap"><table><thead><tr><th scope="col">Ad version</th><th scope="col">Ad views</th><th scope="col">Link taps</th><th scope="col">Tap rate</th></tr></thead><tbody>${creativeRows}</tbody></table></div></section>` : ""}
  <section><h2>Creative & campaign details</h2><div class="creative-details"><div>${renderAdPreview(campaign)}<p class="caption">Current saved creative. Earlier versions may differ.</p></div><dl class="campaign-details"><div><dt>Campaign ID</dt><dd>${e(campaign.id)}</dd></div><div><dt>Label</dt><dd>${e(campaign.sponsored_label ?? "Sponsored") || "No label"}</dd></div><div><dt>Link button text</dt><dd>${e(campaign.cta)}</dd></div><div><dt>Ad version</dt><dd>${report.creatives.length === 1 ? e(report.creatives[0].creative_version || "No version set") : report.creatives.length ? `${report.creatives.length} recorded versions` : "No activity recorded"}</dd></div><div class="wide"><dt>Link destination</dt><dd>${e(campaign.destination_url)}</dd></div></dl></div></section>
  <section class="appendix" aria-labelledby="methodHeading"><h2 id="methodHeading">Methodology</h2>
    <dl class="definitions">
      <dt>Ad view</dt><dd>Recorded once at least half the ad is visible for one continuous second while the app is active, at most once per ad version per app visit. An app visit resets after 30 minutes away or an app restart.</dd>
      <dt>Unique reach</dt><dd>Anonymous app installs with at least one view. Not verified people or new downloads; one person can have more than one install.</dd>
      <dt>Link tap · tap rate</dt><dd>Taps on the ad’s link button, not confirmed website visits or sales. Tap rate (CTR) = link taps ÷ ad views × 100. Repeat taps can exceed views.${report.clicks > 0 && report.impressions === 0 ? " Taps were recorded without a qualified view, so a tap rate cannot be calculated." : ""}</dd>
      <dt>Average frequency</dt><dd>Ad views ÷ unique reach.</dd>
    </dl>
    <p class="notes"><strong>Coverage.</strong> Counts use server receipt time, shown in Eastern Time. Older app versions, analytics opt-outs, and failed uploads are not represented, so empty dates are not evidence of zero delivery. ${exclusionNote ? e(exclusionNote) + " " : ""}${report.period.truncated ? "This report is limited to the retained 366-day window. " : ""}Campaign details reflect current settings. Revenue, conversions, campaign cost, and return on investment are not measured.</p>
  </section>
  <footer class="screen-footer"><span>${e(footerLeft)}</span><span>Generated ${e(dateTime(report.generated_at))}</span></footer>
</main></body></html>`;
}
