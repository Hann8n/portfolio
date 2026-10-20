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
const plural = (count: number, one: string, many: string) => `${n(count)} ${count === 1 ? one : many}`;
const percent = (views: number, taps: number) => views ? ctr(views, taps).toFixed(2) + "%" : "Not available";
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
  const frequency = report.reach ? (report.impressions / report.reach).toFixed(2) : "Not available";
  const tapRate = percent(report.impressions, report.clicks);
  const first = report.first_event, last = report.last_event;
  const excluded = report.excluded;
  const hourly = report.hourly || [];
  const peak = peakHours(hourly, report.impressions);
  const daily = report.daily;
  const busiest = daily.reduce<typeof daily[number] | null>((best, row) => !best || row.impressions > best.impressions ? row : best, null);
  const isFlight = report.period.label === "Campaign dates";
  const periodEnd = Date.parse(report.period.before) - 1;
  const periodText = dateRange(report.period.from, periodEnd);
  const flightText = campaign.start_at && campaign.end_at ? dateRange(campaign.start_at, campaign.end_at)
    : campaign.start_at ? `From ${dateOnly(campaign.start_at)}` : campaign.end_at ? `Until ${dateOnly(campaign.end_at)}` : "Not scheduled";
  const format = (campaign.tier || "banner").replace(/^./, c => c.toUpperCase());
  const placement = campaign.placement === "home_feed" || !campaign.placement ? "Home feed" : campaign.placement;

  // Delivery: hour by hour for short bursts of activity, otherwise one bar per calendar day of the flight.
  const spanDays = first && last ? (Date.parse(last) - Date.parse(first)) / DAY : 0;
  const hourlyPoints = hasData && report.timeline && spanDays <= TIMELINE_MAX_DAYS ? hourlySeries(report.timeline) : [];
  const flightStart = campaign.start_at ? Math.max(Date.parse(report.period.from), Date.parse(campaign.start_at)) : first ? Date.parse(first) : Date.parse(report.period.from);
  const flightEnd = campaign.end_at ? Math.min(Date.parse(report.period.before), Date.parse(campaign.end_at) + 1) : Date.parse(report.period.before);
  const byDate = new Map(daily.map(row => [row.date, row]));
  const chartDates = hasData && !hourlyPoints.length && flightEnd > flightStart ? localDates(flightStart, flightEnd) : [];
  const deliveryChart = hourlyPoints.length >= 6
    ? barChartSvg(hourlyPoints, { ariaLabel: "Ad views per hour, " + REPORT_TIME_ZONE_LABEL, width: 720, height: 180, explicitLabels: true })
    : chartDates.length >= 2 ? barChartSvg(chartDates.map(date => {
      const row = byDate.get(date);
      return { label: dayKey(date), value: row?.impressions || 0, title: `${dayKey(date, { weekday: "short", month: "short", day: "numeric" })}: ${n(row?.impressions || 0)} views, ${n(row?.clicks || 0)} taps` };
    }), { ariaLabel: "Ad views per day, " + REPORT_TIME_ZONE_LABEL, width: 720, height: 180, valueLabels: chartDates.length <= 14 }) : "";
  const deliveryCaption = hourlyPoints.length >= 6 ? `Ad views per hour, ${REPORT_TIME_ZONE_LABEL}.` : `Ad views per day across the flight, ${REPORT_TIME_ZONE_LABEL}.`;
  const hourChart = !hourlyPoints.length && report.impressions >= 20 ? barChartSvg(Array.from({ length: 24 }, (_, hour) => {
    const row = hourly.find(r => r.hour === hour);
    return { label: hour % 6 === 0 ? hourLabel(hour) : "", value: row?.impressions || 0, title: `${hourLabel(hour)}: ${n(row?.impressions || 0)} views` };
  }), { ariaLabel: "Ad views by hour of day, " + REPORT_TIME_ZONE_LABEL, width: 340, height: 150, explicitLabels: true }) : "";
  const frequencyBars = report.reach > 0 && report.frequency?.length ? shareBarsHtml([1, 2, 3, 4, 5].map(views => {
    const installs = report.frequency!.find(r => r.views === views)?.installs || 0;
    return { label: views === 5 ? "5 or more" : plural(views, "view", "views"), value: installs, display: share(installs, report.reach) };
  }), "Reached installs by number of views") : "";

  const sentences = hasData ? [
    `${isFlight ? "Over the campaign flight" : `In the ${report.period.label.toLowerCase()}`} (${e(periodText)}), the campaign earned <strong>${plural(report.impressions, "ad view", "ad views")}</strong> from <strong>${plural(report.reach, "unique app install", "unique app installs")}</strong>${report.reach ? `, an average frequency of ${frequency}` : ""}.`,
    report.clicks ? `It drove <strong>${plural(report.clicks, "link tap", "link taps")}</strong>${report.impressions ? `, a <strong>${tapRate}</strong> tap rate` : ""}.` : "No link taps were recorded.",
    busiest && daily.length > 1 ? `Delivery peaked on ${e(dayKey(busiest.date, { weekday: "long", month: "long", day: "numeric" }))} with ${share(busiest.impressions, report.impressions)} of views${peak ? `, and ${Math.round(peak.share * 100)}% of all views came between ${peak.start} and ${peak.end} ${REPORT_TIME_ZONE_LABEL}` : ""}.`
      : peak ? `${Math.round(peak.share * 100)}% of views came between ${peak.start} and ${peak.end} ${REPORT_TIME_ZONE_LABEL}.` : "",
  ].filter(Boolean).join(" ") : "";
  const results = hasData ? `<div class="stat-card">
      <div class="stat"><span class="stat-value">${n(report.impressions)}</span><span class="stat-label">Ad views</span></div>
      <div class="stat"><span class="stat-value">${n(report.reach)}</span><span class="stat-label">Unique reach</span></div>
      <div class="stat"><span class="stat-value">${frequency}</span><span class="stat-label">Avg. frequency</span></div>
      <div class="stat"><span class="stat-value">${n(report.clicks)}</span><span class="stat-label">Link taps</span></div>
      <div class="stat"><span class="stat-value">${tapRate}</span><span class="stat-label">Tap rate</span></div>
    </div><p class="summary">${sentences}</p>`
    : `<p class="summary">${report.period.not_started ? "This campaign has not started yet." : "No campaign activity was recorded in the selected period."} Older app versions, analytics opt-outs, and failed uploads are not represented, so this does not establish that nobody saw the campaign.</p>`;

  const dailyRows = daily.map(row => `<tr><th scope="row">${e(dayKey(row.date, { weekday: "short", month: "short", day: "numeric", year: "numeric" }))}</th><td>${n(row.impressions)}</td><td>${n(row.reach)}</td><td>${n(row.clicks)}</td><td>${percent(row.impressions, row.clicks)}</td></tr>`).join("");
  const totalRow = daily.length > 1 ? `<tfoot><tr><th scope="row">Total</th><td>${n(report.impressions)}</td><td>${n(report.reach)}<sup>*</sup></td><td>${n(report.clicks)}</td><td>${tapRate}</td></tr></tfoot>` : "";
  const creativeRows = report.creatives.length > 1 ? report.creatives.map(row => `<tr><th scope="row">${e(row.creative_version || "No version set")}</th><td>${n(row.impressions)}</td><td>${n(row.clicks)}</td><td>${percent(row.impressions, row.clicks)}</td></tr>`).join("") : "";
  const selectedPeriod = isFlight ? "campaign" : report.period.label.match(/Last (\d+) days/)?.[1] || "30";
  const periodOptions = REPORT_PERIODS.map(value => `<option value="${value}"${value === selectedPeriod ? " selected" : ""}>${value === "campaign" ? "Campaign dates" : `Last ${value} days`}</option>`).join("");
  const filtration = excluded?.internal_excluded
    ? excluded.installations
      ? `Activity from ${plural(excluded.installations, "internal test install", "internal test installs")} (${plural(excluded.impressions, "view", "views")}, ${plural(excluded.clicks, "tap", "taps")}) is excluded from every figure.`
      : "No internal test activity was recorded for this campaign."
    : "Internal test installs are included in these figures.";
  const recorded = first && last ? dateRange(first, last) : "No recorded activity";
  const footerLeft = campaign.sponsor.trim() === BRAND ? `${BRAND} campaign report` : `${BRAND} campaign report · ${campaign.sponsor}`;

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${e(campaign.sponsor)} · Campaign report · ${e(periodText)}</title>
<script>try{if(localStorage.getItem('theme')==='dark'||(!localStorage.getItem('theme')&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark-theme');}catch{}</script>
<style>
  ${AD_PREVIEW_STYLES}
  /* Tokens follow ads-landing-style-guide.md. */
  :root { color-scheme:light dark; --bg-color:#fff; --text-color:#333; --text-mid:#555; --muted:#767676; --link-color:#c95a7a; --link-hover-color:#e5751f; --vt-maroon:#861f41; --maroon-dark:#6d1936; --maroon-tint:rgba(134,31,65,.08); --cta-fg:var(--vt-maroon); --border:#e5e5e5; --border-strong:#d4d4d4; --surface:#fff; --bar:#861f41; --ad-maroon:#861f41; }
  .dark-theme { --bg-color:#1a1a1a; --text-color:#e0e0e0; --text-mid:#b3b3b3; --muted:#8a8a8a; --maroon-dark:#9d3a58; --maroon-tint:rgba(201,90,122,.16); --cta-fg:#c95a7a; --border:#2e2e2e; --border-strong:#3a3a3a; --surface:#242424; --bar:#c95a7a; --ad-maroon:#e59ab4; }
  @media (prefers-color-scheme:dark) { :root:not(.light-theme):not(.dark-theme) { --bg-color:#1a1a1a; --text-color:#e0e0e0; --text-mid:#b3b3b3; --muted:#8a8a8a; --maroon-dark:#9d3a58; --maroon-tint:rgba(201,90,122,.16); --cta-fg:#c95a7a; --border:#2e2e2e; --border-strong:#3a3a3a; --surface:#242424; --bar:#c95a7a; --ad-maroon:#e59ab4; } }
  * { box-sizing:border-box; }
  body { margin:0; background:var(--bg-color); color:var(--text-color); font:16px/1.65 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  a { color:var(--link-color); text-decoration:none; } a:hover { color:var(--link-hover-color); }
  a:focus-visible,button:focus-visible,select:focus-visible { outline:2px solid var(--link-color); outline-offset:3px; }
  .container { max-width:840px; margin:0 auto; padding:0 20px; }
  .toolbar { border-bottom:1px solid var(--border); } .toolbar .container { display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:12px 16px; padding-top:12px; padding-bottom:12px; font-size:.875rem; }
  .back-link { color:var(--muted); } .report-period { display:flex; align-items:center; gap:8px; color:var(--text-mid); }
  .report-period select { padding:8px 10px; border:1px solid var(--border-strong); border-radius:8px; font:inherit; color:var(--text-color); background:var(--bg-color); }
  .toolbar-actions { display:flex; gap:8px; }
  .btn-primary, .btn-ghost { display:inline-flex; align-items:center; justify-content:center; font:600 .875rem/1.4 inherit; padding:9px 16px; border-radius:8px; cursor:pointer; }
  .btn-primary { background:var(--vt-maroon); color:#fff; border:0; } .btn-primary:hover { background:var(--maroon-dark); }
  .btn-ghost { color:var(--text-color); border:1px solid var(--border-strong); font-weight:500; } .btn-ghost:hover { color:var(--text-color); border-color:var(--muted); }
  .report-header { display:flex; justify-content:space-between; align-items:center; gap:16px; padding:28px 0 0; font-size:.8125rem; color:var(--muted); }
  .brand { display:flex; align-items:center; gap:10px; color:var(--text-color); font-weight:600; font-size:.9375rem; } .brand img { width:28px; height:28px; border-radius:7px; }
  .doc-meta { text-align:right; line-height:1.45; } .doc-meta strong { display:block; color:var(--text-color); font-weight:600; }
  main > section { padding:28px 0; } main > section + section { border-top:1px solid var(--border); }
  .hero { padding-top:32px !important; }
  h1 { font-size:clamp(2rem,5vw,2.5rem); line-height:1.15; font-weight:700; letter-spacing:-.02em; margin:0 0 6px; overflow-wrap:anywhere; }
  .subline { margin:0; color:var(--text-mid); font-size:1.0625rem; overflow-wrap:anywhere; }
  .meta { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:16px 24px; margin:24px 0 0; font-size:.875rem; }
  .meta dt, .details dt { color:var(--muted); font-size:.8125rem; } .meta dd, .details dd { margin:2px 0 0; font-weight:600; overflow-wrap:anywhere; }
  h2 { font-size:1.25rem; line-height:1.3; font-weight:600; letter-spacing:-.01em; margin:0 0 16px; break-after:avoid; }
  h3 { font-size:.9375rem; font-weight:600; margin:0 0 12px; }
  .stat-card { display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); gap:20px; background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:20px; break-inside:avoid; }
  .stat { display:flex; flex-direction:column; min-width:0; } .stat-value { font-size:1.5rem; font-weight:700; line-height:1.25; letter-spacing:-.01em; font-variant-numeric:tabular-nums; }
  .stat-label { font-size:.8125rem; color:var(--muted); margin-top:2px; }
  .summary { margin:20px 0 0; color:var(--text-mid); max-width:68ch; } .summary strong { color:var(--text-color); font-weight:600; }
  .figure { margin:0; break-inside:avoid; } .figure + .grid-2 { margin-top:28px; }
  .chart { display:block; width:100%; height:auto; overflow:visible; } .chart-grid { stroke:var(--border); } .chart-axis { fill:var(--muted); font:11px system-ui,sans-serif; }
  .chart-bar { fill:var(--bar); } .chart-value { fill:var(--text-mid); font:600 11px system-ui,sans-serif; }
  .caption { color:var(--muted); font-size:.8125rem; margin:8px 0 0; }
  .grid-2 { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:32px; break-inside:avoid; }
  .share-bars { display:grid; gap:10px; font-size:.875rem; } .share-row { display:grid; grid-template-columns:84px minmax(0,1fr) 44px; gap:12px; align-items:center; }
  .share-track { height:8px; background:var(--maroon-tint); border-radius:4px; overflow:hidden; } .share-fill { display:block; height:100%; background:var(--bar); border-radius:4px; }
  .share-value { text-align:right; color:var(--text-mid); font-variant-numeric:tabular-nums; }
  .table-wrap { overflow-x:auto; } table { width:100%; border-collapse:collapse; font-size:.875rem; font-variant-numeric:tabular-nums; }
  th, td { padding:9px 8px; border-bottom:1px solid var(--border); text-align:right; } th:first-child { text-align:left; padding-left:0; } th:last-child, td:last-child { padding-right:0; }
  thead th { color:var(--muted); font-weight:500; font-size:.8125rem; white-space:nowrap; border-bottom-color:var(--border-strong); } tbody th { font-weight:500; }
  tfoot th, tfoot td { font-weight:600; border-bottom:0; } tr { break-inside:avoid; }
  .creative { display:grid; grid-template-columns:minmax(0,320px) minmax(0,1fr); gap:32px; align-items:start; break-inside:avoid; }
  .creative .creative-preview { border-radius:12px; max-width:320px; } .creative .creative-button { border-radius:8px; }
  .details { display:grid; grid-template-columns:1fr 1fr; gap:14px 24px; margin:0; font-size:.875rem; } .details .wide { grid-column:1/-1; } .details dd { font-weight:500; }
  .definitions { margin:0; display:grid; grid-template-columns:160px minmax(0,1fr); gap:10px 24px; font-size:.8125rem; } .definitions dt { font-weight:600; } .definitions dd { margin:0; color:var(--text-mid); }
  .note { margin:20px 0 0; padding:16px 20px; background:var(--surface); border:1px solid var(--border); border-radius:12px; font-size:.8125rem; color:var(--text-mid); break-inside:avoid; }
  .note p { margin:0; } .note p + p { margin-top:6px; } .note strong { color:var(--text-color); }
  .footer { border-top:1px solid var(--border); padding:20px 0 32px; font-size:.8125rem; color:var(--muted); display:flex; justify-content:space-between; gap:16px; }
  @page { size:A4; margin:16mm 16mm 18mm;
    @bottom-left { content:${cssString(footerLeft)}; font:8pt system-ui,sans-serif; color:#767676; }
    @bottom-right { content:"Page " counter(page) " of " counter(pages); font:8pt system-ui,sans-serif; color:#767676; } }
  @media print {
    :root, .dark-theme { color-scheme:light; --bg-color:#fff; --text-color:#333; --text-mid:#555; --muted:#767676; --maroon-tint:rgba(134,31,65,.08); --border:#e5e5e5; --border-strong:#d4d4d4; --surface:#fff; --bar:#861f41; --ad-maroon:#861f41; --cta-fg:#861f41; }
    body { font-size:9.5pt; line-height:1.55; } .toolbar, .footer { display:none; } .container { max-width:none; padding:0; }
    .report-header { padding-top:0; font-size:8pt; } .hero { padding-top:14pt !important; } main > section { padding:14pt 0; }
    h1 { font-size:22pt; } .subline { font-size:10.5pt; } .meta { margin-top:12pt; font-size:9pt; gap:10pt 18pt; } .meta dt, .details dt { font-size:8pt; }
    h2 { font-size:12pt; margin-bottom:9pt; } h3 { font-size:9.5pt; margin-bottom:7pt; }
    .stat-card { padding:12pt 14pt; gap:12pt; } .stat-value { font-size:15pt; } .stat-label { font-size:8pt; }
    .summary { margin-top:11pt; } .caption { font-size:8pt; } table, .share-bars, .details { font-size:8.5pt; } .definitions, .note { font-size:8pt; }
    th, td { padding:5pt 6pt; } thead { display:table-header-group; } .table-wrap { overflow:visible; } .note { padding:9pt 12pt; margin-top:11pt; }
    .creative { grid-template-columns:minmax(0,240px) minmax(0,1fr); gap:20pt; } .creative-copy h3 { font-size:12pt; } .creative-copy p, .creative-button { font-size:8.5pt; }
    .creative-preview-feature .creative-image-wrap { height:140px; } .creative-preview-banner .creative-image-wrap { height:96px; }
    .grid-2 { gap:20pt; } .figure + .grid-2 { margin-top:14pt; }
    /* Page 1 is the executive summary; detail starts on page 2 when there is delivery to summarize. */
    .has-summary .detail-start { break-before:page; border-top:0; padding-top:0; }
  }
  @media screen and (max-width:640px) {
    .toolbar-actions { width:100%; } .toolbar-actions > * { flex:1; }
    .meta { grid-template-columns:1fr 1fr; } .stat-card { grid-template-columns:repeat(2,minmax(0,1fr)); } .stat:last-child { grid-column:1/-1; }
    .grid-2, .creative, .details { grid-template-columns:1fr; } .definitions { grid-template-columns:1fr; gap:2px; } .definitions dd { margin-bottom:10px; }
    table { min-width:440px; } .doc-meta span { display:none; } .footer { flex-direction:column; gap:4px; }
  }
</style></head><body${hasData ? ' class="has-summary"' : ""}>
<nav class="toolbar" aria-label="Report export"><div class="container">${standalone ? `<span class="back-link">${BRAND} campaign report</span>` : `<a class="back-link" href="/admin">&larr; Dashboard</a><form class="report-period" action="/api/admin/campaign-report" method="get"><input type="hidden" name="id" value="${e(campaign.id)}"><label for="reportPeriod">Period</label><select id="reportPeriod" name="days" onchange="this.form.requestSubmit()">${periodOptions}</select><noscript><button type="submit" class="btn-ghost">Apply</button></noscript></form>`}<div class="toolbar-actions">${standalone ? "" : `<a class="btn-ghost download" href="${e(downloadUrl)}">Download HTML</a>`}<button type="button" class="btn-primary" onclick="window.print()">Save as PDF / Print</button></div></div></nav>
<div class="container">
  <header class="report-header"><div class="brand"><img src="${e((standalone ? origin : "") + "/favicon/apple-touch-icon.png")}" alt="" onerror="this.remove()">${BRAND}</div><div class="doc-meta"><strong>Campaign report</strong><span>Prepared ${e(dateOnly(report.generated_at))}</span></div></header>
  <main>
    <section class="hero" aria-labelledby="reportTitle">
      <h1 id="reportTitle">${e(campaign.sponsor)}</h1>
      <p class="subline">${e(campaign.headline)}</p>
      <dl class="meta">
        <div><dt>Flight</dt><dd>${e(flightText)}</dd></div>
        <div><dt>Reporting period</dt><dd>${isFlight ? "Campaign flight" : e(report.period.label)} · ${e(periodText)}</dd></div>
        <div><dt>Placement</dt><dd>${e(placement)} · ${e(format)} ad</dd></div>
      </dl>
    </section>
    <section aria-labelledby="resultsHeading"><h2 id="resultsHeading">Results</h2>${results}</section>
    ${deliveryChart || hourChart || frequencyBars ? `<section aria-labelledby="deliveryHeading"><h2 id="deliveryHeading">Delivery</h2>
      ${deliveryChart ? `<figure class="figure">${deliveryChart}<figcaption class="caption">${deliveryCaption}</figcaption></figure>` : ""}
      ${hourChart || frequencyBars ? `<div class="grid-2">${hourChart ? `<figure class="figure"><h3>Time of day</h3>${hourChart}<figcaption class="caption">Ad views by hour across all days, ${REPORT_TIME_ZONE_LABEL}.</figcaption></figure>` : ""}${frequencyBars ? `<figure class="figure"><h3>Views per reached install</h3>${frequencyBars}<figcaption class="caption">Share of the ${plural(report.reach, "reached install", "reached installs")} by number of views.</figcaption></figure>` : ""}</div>` : ""}
    </section>` : ""}
    ${dailyRows ? `<section class="detail-start" aria-labelledby="dailyHeading"><h2 id="dailyHeading">Daily breakdown</h2><div class="table-wrap"><table><thead><tr><th scope="col">Date (${REPORT_TIME_ZONE_LABEL})</th><th scope="col">Ad views</th><th scope="col">Unique reach</th><th scope="col">Link taps</th><th scope="col">Tap rate</th></tr></thead><tbody>${dailyRows}</tbody>${totalRow}</table></div><p class="caption">Days with recorded activity.${totalRow ? " <sup>*</sup>Total reach counts each install once, so daily reach does not add up to it." : ""}</p></section>` : ""}
    ${creativeRows ? `<section aria-labelledby="versionsHeading"><h2 id="versionsHeading">Ad versions compared</h2><div class="table-wrap"><table><thead><tr><th scope="col">Ad version</th><th scope="col">Ad views</th><th scope="col">Link taps</th><th scope="col">Tap rate</th></tr></thead><tbody>${creativeRows}</tbody></table></div></section>` : ""}
    <section aria-labelledby="creativeHeading"><h2 id="creativeHeading">Creative</h2><div class="creative"><div>${renderAdPreview(campaign)}<p class="caption">Current saved creative. Earlier versions may differ.</p></div><dl class="details">
      <div><dt>Campaign ID</dt><dd>${e(campaign.id)}</dd></div><div><dt>Label</dt><dd>${e(campaign.sponsored_label ?? "Sponsored") || "No label"}</dd></div>
      <div><dt>Link button text</dt><dd>${e(campaign.cta)}</dd></div><div><dt>Ad version</dt><dd>${report.creatives.length === 1 ? e(report.creatives[0].creative_version || "No version set") : report.creatives.length ? `${report.creatives.length} recorded versions` : "No activity recorded"}</dd></div>
      <div><dt>Starts</dt><dd>${campaign.start_at ? e(dateTime(campaign.start_at)) : "Not set"}</dd></div><div><dt>Ends</dt><dd>${campaign.end_at ? e(dateTime(campaign.end_at)) : "Not set"}</dd></div>
      <div class="wide"><dt>Link destination</dt><dd>${e(campaign.destination_url)}</dd></div></dl></div></section>
    <section aria-labelledby="methodHeading"><h2 id="methodHeading">Methodology</h2>
      <dl class="definitions">
        <dt>Ad view</dt><dd>Recorded once at least half the ad is on screen for one continuous second while the app is active, at most once per ad version per app visit. A visit resets after 30 minutes away or an app restart.</dd>
        <dt>Unique reach</dt><dd>Anonymous app installs with at least one ad view. Not verified people or new downloads; one person can have more than one install.</dd>
        <dt>Avg. frequency</dt><dd>Ad views ÷ unique reach.</dd>
        <dt>Link tap · tap rate</dt><dd>Taps on the ad’s link button, not confirmed website visits or sales. Tap rate = link taps ÷ ad views × 100.${report.clicks > 0 && report.impressions === 0 ? " Taps were recorded without a qualified view, so a tap rate cannot be calculated." : ""}</dd>
      </dl>
      <div class="note">
        <p><strong>Traffic filtration.</strong> ${e(filtration)}</p>
        <p><strong>Coverage.</strong> Recorded activity: ${e(recorded)}. Times are server receipt times in Eastern Time. Older app versions, analytics opt-outs, and failed uploads are not represented. ${report.period.truncated ? "This report is limited to the retained 366-day window. " : ""}Campaign details reflect current settings. Revenue, conversions, cost, and return on investment are not measured.</p>
      </div>
    </section>
  </main>
  <footer class="footer"><span>${e(footerLeft)} · ${e(campaign.id)}</span><span>Prepared ${e(dateTime(report.generated_at))}</span></footer>
</div></body></html>`;
}
