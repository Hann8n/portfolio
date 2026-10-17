import { campaignStats, ctr } from "./metrics";

interface Campaign {
  id: string; sponsor: string; headline: string; cta: string; destination_url: string;
  start_at?: string; end_at?: string; tier?: string; sponsored_label?: string;
}
export function escapeHtml(value: unknown): string {
  return String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
export function campaignRange(ad: Campaign, days: string | null, now = new Date()) {
  if (days !== null && !["7", "30", "90", "180", "365", "campaign"].includes(days)) throw new Error("Invalid report period");
  const earliest = now.getTime() - 366 * 86400000;
  const campaignStart = ad.start_at ? Date.parse(ad.start_at) : NaN;
  const campaignEnd = ad.end_at ? Date.parse(ad.end_at) : NaN;
  const end = Math.min(now.getTime(), Number.isFinite(campaignEnd) ? campaignEnd : now.getTime());
  const requested = days === "campaign" && Number.isFinite(campaignStart)
    ? campaignStart : now.getTime() - Number(days && days !== "campaign" ? days : 30) * 86400000;
  const start = Math.max(earliest, requested, Number.isFinite(campaignStart) ? campaignStart : earliest);
  // Future/scheduled and already-ended campaigns can have an empty selected window.
  return { from: new Date(Math.min(start, end)), before: new Date(end), truncated: requested < earliest };
}

export async function buildCampaignReport(env: Env, ad: Campaign, days: string | null, now = new Date()) {
  const range = campaignRange(ad, days, now);
  const stats = await campaignStats(env, ad.id, range.from, range.before);
  const coverage = await env.METRICS!.prepare("SELECT MIN(received_at) AS since FROM metric_events").first<{ since: string | null }>();
  return { campaign: ad, period: { from: range.from.toISOString(), before: range.before.toISOString(), truncated: range.truncated }, generated_at: now.toISOString(), collection_since: coverage?.since ?? null, ...stats };
}

type Report = Awaited<ReturnType<typeof buildCampaignReport>>;
export function campaignReportHtml(report: Report, downloadUrl: string): string {
  const e = escapeHtml;
  const n = (value: unknown) => (Number(value) || 0).toLocaleString("en-US");
  const pct = (impressions: number, clicks: number) => impressions ? ctr(impressions, clicks).toFixed(2) + "%" : "—";
  const date = (value: string) => new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
  const campaign = report.campaign;
  const hasData = report.impressions > 0 || report.clicks > 0;
  const frequency = report.reach ? (report.impressions / report.reach).toFixed(2) : "—";
  const peak = Math.max(1, ...report.daily.map(d => Number(d.impressions)));
  const dailyRows = report.daily.map(d => `<tr><th scope="row">${e(d.date)}</th><td><span class="bar" style="width:${Math.max(0, Number(d.impressions) / peak * 80).toFixed(2)}px"></span>${n(d.impressions)}</td><td>${n(d.clicks)}</td><td>${n(d.reach)}</td><td>${pct(Number(d.impressions), Number(d.clicks))}</td></tr>`).join("");
  const creativeRows = report.creatives.map(c => `<tr><th scope="row">${e(c.creative_version || "Unversioned")}</th><td>${n(c.impressions)}</td><td>${n(c.clicks)}</td><td>${pct(Number(c.impressions), Number(c.clicks))}</td></tr>`).join("");
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${e(campaign.sponsor)} · Campaign report</title>
<script>if(localStorage.getItem('theme')==='dark'||(!localStorage.getItem('theme')&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark-theme');}</script>
<style>
  :root { color-scheme: light dark; --bg-color:#fff; --text-color:#333; --text-mid:#555; --muted:#767676; --border:#e5e5e5; --surface:#fff; --link-color:#c95a7a; --vt-maroon:#861f41; --maroon-dark:#6d1936; }
  .dark-theme { --bg-color:#1a1a1a; --text-color:#e0e0e0; --text-mid:#b3b3b3; --muted:#8a8a8a; --border:#2e2e2e; --surface:#242424; --maroon-dark:#9d3a58; }
  @media(prefers-color-scheme:dark) { :root:not(.light-theme):not(.dark-theme) { --bg-color:#1a1a1a; --text-color:#e0e0e0; --text-mid:#b3b3b3; --muted:#8a8a8a; --border:#2e2e2e; --surface:#242424; --maroon-dark:#9d3a58; } }
  * { box-sizing:border-box; }
  body { margin:0; background:var(--bg-color); color:var(--text-color); font:16px/1.65 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif; -webkit-font-smoothing:antialiased; }
  a { color:var(--link-color); text-decoration:none; } a:hover { color:#E5751F; }
  .actions { max-width:840px; margin:0 auto; padding:24px 20px; display:flex; justify-content:space-between; align-items:center; gap:16px; border-bottom:1px solid var(--border); }
  .actions-group { display:flex; gap:10px; align-items:center; }
  .actions button,.actions a.download { display:inline-flex; align-items:center; justify-content:center; min-height:44px; border-radius:8px; padding:10px 16px; font-size:14px; font-weight:500; line-height:1.4; font-family:inherit; cursor:pointer; }
  .actions button { background:var(--vt-maroon); color:white; border:1px solid var(--vt-maroon); font-weight:600; } .actions button:hover { background:var(--maroon-dark); }
  .actions a.download { border:1px solid var(--border); color:var(--text-color); } .back-link { color:var(--muted); font-size:13px; }
  button:focus-visible,a:focus-visible { outline:2px solid var(--link-color); outline-offset:4px; }
  .sheet { max-width:840px; margin:0 auto; padding:44px 20px 28px; }
  .report-brand { font-size:14px; color:var(--muted); margin-bottom:28px; }
  h1 { font-size:clamp(2rem,5vw,2.5rem); font-weight:700; letter-spacing:-.02em; line-height:1.2; margin:0 0 12px; overflow-wrap:anywhere; }
  .report-subtitle { color:var(--text-mid); margin:0 0 4px; }
  .period { color:var(--muted); font-size:13px; margin:0; }
  section { padding:28px 0; } section + section { border-top:1px solid var(--border); }
  .summary { color:var(--text-mid); font-size:16px; margin:24px 0 0; max-width:680px; }
  .hero-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:32px; padding:28px 0 24px; }
  .hero-stat strong { display:block; font-size:32px; font-weight:700; line-height:1.2; letter-spacing:-.02em; font-variant-numeric:tabular-nums; margin-bottom:6px; }
  .hero-stat span,.secondary-stat span { font-size:13px; color:var(--muted); }
  .secondary-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:32px; padding-top:20px; border-top:1px solid var(--border); }
  .secondary-stat strong { display:block; font-size:20px; font-weight:600; font-variant-numeric:tabular-nums; margin-bottom:3px; }
  h2 { font-size:18px; font-weight:600; letter-spacing:-.01em; margin:0 0 16px; line-height:1.3; break-after:avoid; }
  .details { display:grid; grid-template-columns:1fr 1fr; gap:16px 32px; margin:0; font-size:13px; }
  .details dt { color:var(--muted); margin-bottom:3px; } .details dd { margin:0; overflow-wrap:anywhere; color:var(--text-color); }
  .table-wrap { overflow-x:auto; }
  table { border-collapse:collapse; width:100%; font-size:13px; font-variant-numeric:tabular-nums; }
  th,td { text-align:right; padding:10px 8px; border-bottom:1px solid var(--border); }
  th:first-child,td:first-child { text-align:left; padding-left:0; } th:last-child,td:last-child { padding-right:0; }
  thead th { color:var(--muted); font-weight:500; white-space:nowrap; } tbody th { font-weight:500; }
  tr { break-inside:avoid; } .bar { display:inline-block; height:4px; background:#c95a7a; margin-right:12px; vertical-align:middle; }
  .notes { color:var(--text-mid); font-size:12px; line-height:1.65; } .notes p { margin:0 0 10px; } .notes strong { font-weight:600; color:var(--text-color); }
  .empty { color:var(--muted); padding:16px 0; font-size:14px; }
  .footer { display:flex; justify-content:space-between; gap:16px; border-top:1px solid var(--border); padding-top:16px; color:var(--muted); font-size:11px; }
  .hero-stats,.secondary-stats,.summary { break-inside:avoid; }
  @page { size:A4; margin:15mm 17mm; }
  @media print {
    :root,.dark-theme { color-scheme:light; --bg-color:white; --text-color:#333; --text-mid:#555; --muted:#666; --border:#ddd; --surface:white; }
    body { font-size:10pt; } .actions { display:none; } .sheet { max-width:none; padding:0; }
    .report-brand { margin-bottom:18px; font-size:11px; } h1 { font-size:28px; } .report-subtitle { font-size:12px; } .period { font-size:10px; }
    section { padding:18px 0; } .summary { font-size:12px; margin-top:16px; } .hero-stats { padding:18px 0; gap:24px; }
    .hero-stat strong { font-size:26px; } .hero-stat span,.secondary-stat span { font-size:9pt; } .secondary-stat strong { font-size:17px; }
    .secondary-stats { padding-top:14px; gap:24px; } .details { font-size:9pt; gap:10px 24px; } h2 { font-size:13px; margin-bottom:10px; }
    table { font-size:9pt; } th,td { padding:7px 6px; } thead { display:table-header-group; } .bar { print-color-adjust:exact; }
    .notes { font-size:9pt; line-height:1.55; } .notes p { margin-bottom:7px; } .footer { font-size:8pt; padding-top:12px; }
    .table-wrap { overflow:visible; } .methodology { break-before:page; border-top:0; padding-top:0; }
  }
  @media(max-width:600px) { .sheet { padding-top:28px; } .actions { align-items:start; flex-direction:column; } .actions-group { width:100%; } .actions-group>* { flex:1; } .hero-stats,.secondary-stats { gap:16px; } .hero-stat strong { font-size:27px; } .hero-stat span,.secondary-stat span { font-size:12px; } .details { grid-template-columns:1fr; } .bar { display:none; } table { min-width:390px; } .footer { flex-direction:column; gap:4px; } }
</style></head><body>
<nav class="actions" aria-label="Report export"><a class="back-link" href="/admin">← Dashboard</a><div class="actions-group"><a class="download" href="${e(downloadUrl)}">Download HTML</a><button onclick="window.print()">Save as PDF / Print</button></div></nav>
<main class="sheet">
  <header><div class="report-brand">Gym Tracker</div><h1>${e(campaign.sponsor)}</h1><p class="report-subtitle">Campaign performance report</p><p class="period">${e(date(report.period.from))} – ${e(date(report.period.before))} · UTC</p></header>
  <section aria-label="Performance summary">
    <div class="hero-stats"><div class="hero-stat"><strong>${n(report.impressions)}</strong><span>Qualified impressions</span></div><div class="hero-stat"><strong>${n(report.reach)}</strong><span>Installations reached</span></div><div class="hero-stat"><strong>${n(report.clicks)}</strong><span>Call-to-action taps</span></div></div>
    <div class="secondary-stats"><div class="secondary-stat"><strong>${pct(report.impressions, report.clicks)}</strong><span>Tap-through rate</span></div><div class="secondary-stat"><strong>${n(report.unique_clickers)}</strong><span>Unique installations tapping</span></div><div class="secondary-stat"><strong>${frequency}</strong><span>Average frequency</span></div></div>
    <p class="summary">${hasData ? `${n(report.impressions)} measured impressions reached ${n(report.reach)} anonymous installations and generated ${n(report.clicks)} call-to-action taps.` : "No measured activity is available for this campaign in the selected period. Collection begins when the updated app is used; missing data does not establish that an ad failed to render."}</p>
  </section>
  <section><h2>Campaign details</h2><dl class="details"><div><dt>Campaign</dt><dd>${e(campaign.id)}</dd></div><div><dt>Placement & format</dt><dd>Home feed · ${e(campaign.tier || "banner")}</dd></div><div><dt>Headline</dt><dd>${e(campaign.headline)}</dd></div><div><dt>Call to action</dt><dd>${e(campaign.cta)}</dd></div><div><dt>Destination</dt><dd>${e(campaign.destination_url)}</dd></div><div><dt>Content label</dt><dd>${e(campaign.sponsored_label ?? "Sponsored") || "None"}</dd></div></dl></section>
  <section><h2>Daily performance</h2>${dailyRows ? `<div class="table-wrap"><table><thead><tr><th scope="col">Date · UTC</th><th scope="col">Impressions</th><th scope="col">Taps</th><th scope="col">Reach</th><th scope="col">CTR</th></tr></thead><tbody>${dailyRows}</tbody></table></div>` : '<p class="empty">No impressions or taps recorded in this period.</p>'}</section>
  ${creativeRows ? `<section><h2>Creative performance</h2><div class="table-wrap"><table><thead><tr><th scope="col">Creative version</th><th scope="col">Impressions</th><th scope="col">Taps</th><th scope="col">CTR</th></tr></thead><tbody>${creativeRows}</tbody></table></div></section>` : ""}
  <section class="methodology"><h2>Measurement notes</h2><div class="notes">
    <p><strong>Impressions & taps.</strong> An impression requires at least 50% of the card to be visible for one continuous second in the active app. Each creative is counted once per session; sessions reset after 30 minutes in background or app restart. Taps are call-to-action interactions, not confirmed visits. CTR = taps ÷ impressions × 100. Repeated taps can exceed impressions.</p>
    <p><strong>Reach & frequency.</strong> Reach counts random installation IDs, not verified people. Reinstalls, multiple devices, and opting out and back in can change IDs. Daily reach is not additive. Average frequency = impressions ÷ reached installations.</p>
    <p><strong>Coverage.</strong> Best-effort collection excludes opt-outs, offline or failed delivery, development builds, and older app versions. First retained database event: ${report.collection_since ? e(new Date(report.collection_since).toISOString().slice(0,10)) : "not yet available"}. Days without events are omitted. Period: ${e(report.period.from)} to ${e(report.period.before)} (end exclusive). Raw data is retained for 366 days plus daily cleanup. ${report.period.truncated ? "This report is limited to the retained window." : ""}</p>
    <p><strong>Interpretation.</strong> Measures exposure and interest; conversions, revenue, spend, and ROI are not tracked. Details reflect the current campaign configuration. Use a new campaign ID for a new booking and a new creative version when changing content.</p>
  </div></section>
  <footer class="footer"><span>Gym Tracker · Campaign report</span><span>Generated ${e(date(report.generated_at))}</span></footer>
</main></body></html>`;
}
