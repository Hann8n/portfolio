import { AD_PREVIEW_STYLES, renderAdPreview, type PreviewAd } from "./ad-preview";
import { campaignStats, ctr } from "./metrics";

interface Campaign extends PreviewAd {
  id: string; sponsor: string; headline: string; cta: string; destination_url: string;
  start_at?: string; end_at?: string; tier?: string; sponsored_label?: string;
}
const day = 86400000;
const periods = ["7", "30", "90", "180", "365", "campaign"];
export function escapeHtml(value: unknown): string {
  return String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

/** Preset windows always describe the requested period, independent of today's campaign settings. */
export function campaignRange(ad: Campaign, days: string | null, now = new Date()) {
  if (days !== null && !periods.includes(days)) throw new Error("Invalid report period");
  const selection = days || "30";
  const earliest = now.getTime() - 366 * day;
  const start = ad.start_at ? Date.parse(ad.start_at) : NaN;
  const end = ad.end_at ? Date.parse(ad.end_at) : NaN;
  const requestedStart = selection === "campaign" && Number.isFinite(start) ? start : now.getTime() - Number(selection === "campaign" ? 30 : selection) * day;
  // Configured campaign end dates are inclusive; queries use an exclusive upper bound.
  const before = selection === "campaign" && Number.isFinite(end) ? Math.min(now.getTime(), end + 1) : now.getTime();
  return {
    from: new Date(Math.min(Math.max(earliest, requestedStart), before)), before: new Date(before),
    truncated: requestedStart < earliest, not_started: selection === "campaign" && start > now.getTime(),
    label: selection === "campaign" ? "Campaign dates" : `Last ${selection} days`,
  };
}

export async function buildCampaignReport(env: Env, ad: Campaign, days: string | null, now = new Date()) {
  if (!env.METRICS) throw new Error("Analytics not configured");
  const history = await env.METRICS.prepare(`SELECT MIN(received_at) AS first_recorded
    FROM metric_events WHERE ad_id = ? AND event IN ('ad_impression', 'ad_tap')`).bind(ad.id).first<{ first_recorded: string | null }>();
  const historicalStart = !ad.start_at && history?.first_recorded ? { ...ad, start_at: history.first_recorded } : ad;
  const range = campaignRange(historicalStart, days, now);
  const stats = await campaignStats(env, ad.id, range.from, range.before);
  return {
    campaign: ad, period: { ...range, from: range.from.toISOString(), before: range.before.toISOString() },
    generated_at: now.toISOString(), campaign_first_recorded_at: history?.first_recorded ?? null, ...stats,
  };
}

type Report = Awaited<ReturnType<typeof buildCampaignReport>>;
export function campaignReportHtml(report: Report, downloadUrl: string, standalone = false): string {
  const e = escapeHtml;
  const n = (value: unknown) => (Number(value) || 0).toLocaleString("en-US");
  const percent = (views: number, taps: number) => views ? ctr(views, taps).toFixed(2) + "%" : "Not available";
  const date = (value: string) => new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
  const time = (value: string) => new Date(value).toLocaleString("en-US", { month:"short",day:"numeric",year:"numeric",hour:"numeric",minute:"2-digit",timeZone:"UTC" });
  const campaign = report.campaign;
  const hasData = report.impressions > 0 || report.clicks > 0;
  const frequency = report.reach ? (report.impressions / report.reach).toFixed(2) : "Not available";
  const tapRate = percent(report.impressions, report.clicks);
  const first = report.first_event, last = report.last_event;
  const activity = first && last ? (date(first) === date(last) ? `${date(first)} · UTC` : `${date(first)} – ${date(last)} · UTC`) : "No recorded activity in this period";
  const dailyRows = report.daily.map(row => `<tr><th scope="row">${e(date(String(row.date) + "T12:00:00Z"))}</th><td>${n(row.impressions)}</td><td>${n(row.reach)}</td><td>${n(row.clicks)}</td><td>${percent(Number(row.impressions), Number(row.clicks))}</td></tr>`).join("");
  const creativeRows = report.creatives.length > 1 ? report.creatives.map(row => `<tr><th scope="row">${e(row.creative_version || "No version set")}</th><td>${n(row.impressions)}</td><td>${n(row.clicks)}</td><td>${percent(Number(row.impressions), Number(row.clicks))}</td></tr>`).join("") : "";
  const summary = hasData
    ? `The campaign recorded ${n(report.impressions)} ad ${report.impressions === 1 ? "view" : "views"} across ${n(report.reach)} unique app ${report.reach === 1 ? "install" : "installs"}. The link button was tapped ${n(report.clicks)} ${report.clicks === 1 ? "time" : "times"}.`
    : report.period.not_started ? "This campaign has not started yet." : "No campaign activity was recorded in the selected period.";
  const selectedPeriod = report.period.label === "Campaign dates" ? "campaign" : report.period.label.match(/Last (\d+) days/)?.[1] || "30";
  const periodOptions = periods.map(value => `<option value="${value}"${value === selectedPeriod ? " selected" : ""}>${value === "campaign" ? "Campaign dates" : `Last ${value} days`}</option>`).join("");
  const metrics = hasData ? `<div class="metrics">
    <div><strong>${n(report.impressions)}</strong><span>Ad views</span><small>Recorded after half the ad is visible for a second.</small></div>
    <div><strong>${n(report.reach)}</strong><span>Audience reached</span><small>Unique app installs with a recorded ad view.</small></div>
    <div><strong>${n(report.clicks)}</strong><span>Link taps</span><small>Times the ad’s link button was tapped.</small></div>
    <div><strong>${tapRate}</strong><span>Tap rate</span><small>${n(report.clicks)} ${report.clicks === 1 ? "tap" : "taps"} ÷ ${n(report.impressions)} ad views × 100.</small></div>
  </div><p class="engagement"><strong>${n(report.unique_clickers)}</strong> unique app ${report.unique_clickers === 1 ? "install tapped" : "installs tapped"} a link. Each reached app install recorded <strong>${frequency}</strong> ad views on average.</p>` : `<p class="empty">There is no measured result to assess yet. Older app versions, analytics opt-outs, and failed uploads are not represented. This does not establish that nobody saw the campaign.</p>`;
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${e(campaign.sponsor)} · Campaign report</title>
<script>try{if(localStorage.getItem('theme')==='dark'||(!localStorage.getItem('theme')&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark-theme');}catch{}</script>
<style>
  ${AD_PREVIEW_STYLES}
  .creative-details { display:grid; grid-template-columns:minmax(0,320px) minmax(0,1fr); gap:24px; align-items:start; }
  @media screen and (max-width:600px) { .creative-details { grid-template-columns:1fr; } }
  @media print { .creative-details { grid-template-columns:minmax(0,270px) minmax(0,1fr); gap:20px; } .creative-copy h3 { font-size:13pt; } .creative-copy p,.creative-button { font-size:9pt; } .creative-header { padding:10px; } .creative-copy { padding:10px; } .creative-preview-feature .creative-image-wrap { height:165px; } .creative-preview-banner .creative-image-wrap { height:105px; } }
  :root { color-scheme:light dark; --bg:#fff; --text:#333; --secondary:#555; --muted:#767676; --line:#e5e5e5; --link:#c95a7a; --maroon:#861f41; }
  .dark-theme { --bg:#1a1a1a; --text:#e0e0e0; --secondary:#b3b3b3; --muted:#969696; --line:#333; --ad-maroon:#e59ab4; }
  @media(prefers-color-scheme:dark) { :root:not(.light-theme):not(.dark-theme) { --bg:#1a1a1a; --text:#e0e0e0; --secondary:#b3b3b3; --muted:#969696; --line:#333; --ad-maroon:#e59ab4; } }
  * { box-sizing:border-box; } body { margin:0; background:var(--bg); color:var(--text); font:15px/1.6 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }
  a { color:var(--link); text-decoration:none; } a:hover { text-decoration:underline; }
  .actions { max-width:880px; margin:auto; padding:16px 24px; display:flex; align-items:center; justify-content:space-between; gap:16px; border-bottom:1px solid var(--line); }
  .report-period { display:flex; flex-wrap:wrap; align-items:center; gap:8px; font-size:12px; } .report-period select { max-width:100%; border:1px solid var(--line); border-radius:6px; padding:8px; color:var(--text); background:var(--bg); font:inherit; }
  .actions { flex-wrap:wrap; } .actions-group { display:flex; gap:8px; } .actions-group>* { font:500 13px/1.4 system-ui; padding:10px 14px; min-height:40px; border-radius:8px; cursor:pointer; }
  .download { border:1px solid var(--line); color:var(--text); } button { border:1px solid var(--maroon); background:var(--maroon); color:white; }
  a:focus-visible,button:focus-visible { outline:2px solid var(--link); outline-offset:3px; }
  .sheet { max-width:880px; margin:auto; padding:28px 24px; } .brand { color:var(--muted); font-size:13px; margin-bottom:16px; }
  h1 { font-size:30px; line-height:1.2; letter-spacing:-.02em; margin:0 0 8px; font-weight:700; overflow-wrap:anywhere; } .headline { color:var(--secondary); margin:0 0 18px; }
  .periods { display:grid; grid-template-columns:1fr 1fr; gap:16px; font-size:13px; margin:0; } dt { color:var(--muted); } dd { margin:3px 0 0; overflow-wrap:anywhere; }
  section { border-top:1px solid var(--line); margin-top:22px; padding-top:20px; } h2 { font-size:16px; font-weight:600; letter-spacing:-.01em; margin:0 0 12px; break-after:avoid; }
  .summary { margin:0 0 18px; color:var(--secondary); } .metrics { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:22px; break-inside:avoid; }
  .metrics strong { display:block; font-size:28px; line-height:1.2; margin-bottom:6px; font-variant-numeric:tabular-nums; } .metrics span { display:block; font-size:13px; font-weight:600; }
  .metrics small { display:block; color:var(--muted); font-size:11px; line-height:1.5; margin-top:4px; } .engagement { font-size:13px; color:var(--secondary); margin:18px 0 0; }
  .table-wrap { overflow-x:auto; } table { width:100%; border-collapse:collapse; font-size:12px; font-variant-numeric:tabular-nums; } th,td { padding:8px 6px; border-bottom:1px solid var(--line); text-align:right; }
  th:first-child { text-align:left; padding-left:0; } th:last-child,td:last-child { padding-right:0; } thead th { color:var(--muted); font-weight:500; white-space:nowrap; } tbody th { font-weight:500; }
  tr { break-inside:avoid; } .caption { color:var(--muted); font-size:11px; margin:8px 0 0; }
  .campaign-details { display:grid; grid-template-columns:1fr 1fr; gap:12px 24px; font-size:12px; margin:0; } .campaign-details .destination { grid-column:1/-1; }
  .notes { color:var(--secondary); font-size:11px; line-height:1.55; } .notes p { margin:0 0 8px; } .notes p:last-child { margin:0; } .notes strong { color:var(--text); }
  .empty { color:var(--secondary); margin:0; font-size:13px; } footer { display:flex; justify-content:space-between; gap:16px; border-top:1px solid var(--line); margin-top:20px; padding-top:12px; font-size:10px; color:var(--muted); }
  @page { size:A4; margin:14mm 16mm; }
  @media print {
    :root,.dark-theme { color-scheme:light; --bg:white; --text:#333; --secondary:#555; --muted:#666; --line:#ddd; --ad-maroon:#861f41; }
    .actions { display:none; } .sheet { max-width:none; padding:0; } body { font-size:10pt; } .brand { margin-bottom:12px; font-size:9pt; }
    h1 { font-size:22pt; } .headline { font-size:10pt; margin-bottom:14px; } .periods { font-size:9pt; gap:16px; }
    section { margin-top:12px; padding-top:10px; } h2 { font-size:11pt; margin-bottom:8px; } .summary { font-size:10pt; margin-bottom:14px; }
    .metrics { gap:16px; } .metrics strong { font-size:20pt; } .metrics span { font-size:9pt; } .metrics small { font-size:8pt; }
    .engagement { font-size:9pt; margin-top:12px; } table,.campaign-details { font-size:9pt; } th,td { padding:6px 5px; }
    thead { display:table-header-group; } .caption,.notes { font-size:8pt; line-height:1.5; } .notes p { margin-bottom:6px; } .table-wrap { overflow:visible; }
    footer { font-size:8pt; margin-top:10px; padding-top:6px; break-inside:avoid; }
  }
  @media screen and (max-width:600px) { .actions { align-items:start; flex-direction:column; padding:14px 20px; } .actions-group { width:100%; } .actions-group>* { flex:1; text-align:center; } .sheet { padding:24px 20px; } h1 { font-size:26px; } .periods,.campaign-details { grid-template-columns:1fr; } .metrics { grid-template-columns:repeat(2,minmax(0,1fr)); gap:20px; } .campaign-details .destination { grid-column:auto; } table { min-width:410px; } footer { flex-direction:column; gap:4px; } }
</style></head><body>
<nav class="actions" aria-label="Report export">${standalone ? '<span>Campaign report</span>' : `<a href="/admin">← Dashboard</a><form class="report-period" action="/api/admin/campaign-report" method="get"><input type="hidden" name="id" value="${e(campaign.id)}"><label for="reportPeriod">Period</label><select id="reportPeriod" name="days" onchange="this.form.requestSubmit()">${periodOptions}</select><noscript><button type="submit">Apply</button></noscript></form>`}<div class="actions-group">${standalone ? "" : `<a class="download" href="${e(downloadUrl)}">Download HTML</a>`}<button onclick="window.print()">Save as PDF / Print</button></div></nav>
<main class="sheet">
  <header><div class="brand">Gym Tracker · Campaign report</div><h1>${e(campaign.sponsor)}</h1><p class="headline">${e(campaign.headline)}</p>
    <dl class="periods"><div><dt>Reporting period · ${e(report.period.label)}</dt><dd>${e(date(report.period.from))} – ${e(date(report.period.before))} · UTC</dd></div><div><dt>Dates with recorded activity</dt><dd>${e(activity)}</dd></div></dl>
  </header>
  <section aria-label="Performance summary"><h2>What happened</h2><p class="summary">${summary}</p>${metrics}</section>
  ${dailyRows ? `<section><h2>Daily activity</h2><div class="table-wrap"><table><thead><tr><th scope="col">Date · UTC</th><th scope="col">Ad views</th><th scope="col">Audience reached</th><th scope="col">Link taps</th><th scope="col">Tap rate</th></tr></thead><tbody>${dailyRows}</tbody></table></div><p class="caption">Only days with recorded activity are shown. Daily audience counts overlap and cannot be added together.</p></section>` : ""}
  ${creativeRows ? `<section><h2>Ad versions compared</h2><div class="table-wrap"><table><thead><tr><th scope="col">Ad version</th><th scope="col">Ad views</th><th scope="col">Link taps</th><th scope="col">Tap rate</th></tr></thead><tbody>${creativeRows}</tbody></table></div></section>` : ""}
  <section><h2>Ad preview & campaign details</h2><div class="creative-details"><div>${renderAdPreview(campaign)}<p class="caption">Current saved creative. Earlier versions may differ.</p></div><dl class="campaign-details"><div><dt>Campaign ID</dt><dd>${e(campaign.id)}</dd></div><div><dt>Ad format · label</dt><dd>${e(campaign.tier || "banner")} · ${e(campaign.sponsored_label ?? "Sponsored") || "No label"}</dd></div><div><dt>Link button text</dt><dd>${e(campaign.cta)}</dd></div><div><dt>Ad version</dt><dd>${report.creatives.length === 1 ? e(report.creatives[0].creative_version || "No version set") : report.creatives.length ? `${report.creatives.length} recorded versions` : "No activity recorded"}</dd></div><div class="destination"><dt>Link destination</dt><dd>${e(campaign.destination_url)}</dd></div></dl></div></section>
  <section><h2>How to read this report</h2><div class="notes">
    <p><strong>Ad views & audience.</strong> A view is recorded after at least half the ad is visible for one continuous second, once per ad version per app visit. An app visit resets after 30 minutes away or an app restart. Audience counts anonymous app installs, not verified people or new downloads. One person can have multiple app installs.</p>
    <p><strong>Link taps & tap rate.</strong> Taps are button interactions, not confirmed website visits or sales. Tap rate (also called CTR) = link taps ÷ recorded ad views × 100. Repeat taps can exceed the number of views.${report.clicks > 0 && report.impressions === 0 ? " Taps were recorded without a qualified view, so a tap rate cannot be calculated." : ""}</p>
    <p><strong>Coverage.</strong> Older app versions, analytics opt-outs, and failed uploads are missing. Empty dates are not evidence of zero delivery. ${report.period.truncated ? "This campaign report is limited to the retained 366-day window. " : ""}Counts use server receipt time in UTC. Campaign details reflect current settings. Revenue, conversions, campaign costs, and return on investment are not measured.</p>
  </div></section>
  <footer><span>Gym Tracker · ${e(campaign.id)}</span><span>Generated ${e(time(report.generated_at))} UTC</span></footer>
</main></body></html>`;
}
