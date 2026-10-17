/** Dashboard additions retain the existing dark operations-tool design. */
export const ANALYTICS_STYLES = `
  .visually-hidden { position:absolute; width:1px; height:1px; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; }
  [hidden] { display: none !important; }
  :root { --muted: #949494; }
  .main { padding: 24px 32px 0; overflow: hidden; }
  .schedule-page { display: flex; flex-direction: column; min-height: 0; height: 100%; }
  .workspace-heading, .dashboard-nav { flex-shrink: 0; }
  .dashboard-content { flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; scrollbar-gutter: stable; padding: 0 8px 28px 0; }
  .workspace-controls { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
  #metricsStatus { margin: 0; min-height: 18px; font-size: 11px; line-height: 18px; }
  .metric-help { display:block; color:var(--muted); font-size:12px; line-height:1.5; margin-top:6px; }
  .overview-kpi-detail { display:block; margin-top:8px; }
  .metric-definitions { margin-top:16px; }
  .metric-definitions summary { cursor:pointer; font-size:12px; color:var(--muted); }
  .metric-definitions dl { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px 24px; font-size:12px; margin:14px 0 0; }
  .metric-definitions dt { font-weight:600; margin-bottom:3px; }
  .metric-definitions dd { color:var(--muted); margin:0; line-height:1.6; }
  .schedule-page { width: 100%; max-width: 1440px; margin: 0 auto; }
  .workspace-heading { display: flex; justify-content: space-between; gap: 24px; align-items: center; margin-bottom: 16px; }
  .workspace-heading h1 { font-size: 24px; font-weight: 600; letter-spacing: -.025em; line-height: 1.2; margin-bottom: 8px; }
  .workspace-sub { color: var(--muted); font-size: 13px; }
  .period-control { display: flex; gap: 10px; align-items: center; flex-shrink: 0; }
  .period-control label { color: var(--muted); font-size: 12px; }
  .period-control select { width: auto; font-family: var(--font); font-size: 13px; padding: 8px 28px 8px 12px; }
  .dashboard-nav { display: flex; gap: 28px; border-bottom: 1px solid var(--border); margin-bottom: 12px; }
  .dashboard-nav button { border: 0; border-bottom: 2px solid transparent; padding: 0; min-height: 30px; display:inline-flex; align-items:flex-end; line-height:18px; color: var(--muted); font-size: 13px; }
  .dashboard-nav button[aria-selected=true] { color: var(--text); border-bottom-color: var(--accent); }
  .overview-kpis { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); margin: 0 0 24px; }
  .overview-kpi { padding: 0 24px; border-left: 1px solid var(--border); }
  .overview-kpi:first-child { padding-left: 0; border: 0; }
  .overview-kpi-label { color: #aaa; font-size: 12px; }
  .overview-kpi-value { display: block; font: 600 32px/1.3 var(--font); font-variant-numeric: tabular-nums; letter-spacing: -.025em; margin: 7px 0; }
  .overview-kpi-detail { color: var(--muted); font-size: 12px; }
  .overview-kpi-detail.positive { color: #6bd2bb; }
  .analytics-grid { display: grid; grid-template-columns: minmax(0, 2fr) minmax(260px, 1fr); gap: 20px; margin-bottom: 20px; }
  .analytics-card { border: 1px solid var(--border); background: var(--surface); padding: 20px; min-width: 0; }
  .analytics-card h2 { font-size: 14px; font-weight: 600; letter-spacing: -.01em; margin: 0; }
  .analytics-card-header { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 20px; }
  .analytics-card-header select { width: auto; min-height: 34px; font: 12px var(--font); padding: 6px 10px; }
  .analytics-note { color: var(--muted); font-size: 12px; line-height: 1.6; }
  .analytics-note + .analytics-note { margin-top: 6px; }
  .analytics-chart { width: 100%; height: 210px; display: block; overflow: visible; }
  .analytics-chart text { fill: #949494; font: 11px var(--font); }
  .analytics-chart .grid-line { stroke: var(--border); stroke-width: 1; }
  .analytics-chart .bar { fill: var(--accent); opacity: .65; }
  .analytics-chart .bar:hover { opacity: 1; }
  .engagement-row { display: flex; justify-content: space-between; gap: 16px; padding: 14px 0; border-bottom: 1px solid var(--border); font-size: 13px; }
  .engagement-row:first-of-type { padding-top: 0; }
  .engagement-row strong { font-variant-numeric: tabular-nums; font-weight: 600; }
  .engagement-row:last-of-type { border: 0; }
  .product-strip { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
  .product-strip strong { font-size: 22px; font-variant-numeric: tabular-nums; display: block; margin-top: 6px; font-weight: 600; }
  .product-health { border-top: 1px solid var(--border); padding-top: 16px; margin-top: 20px; }
  .analytics-table-wrap { overflow-x: auto; }
  .analytics-table { width: 100%; border-collapse: collapse; text-align: right; font-size: 12px; font-variant-numeric: tabular-nums; }
  .analytics-table th, .analytics-table td { padding: 13px 10px; border-top: 1px solid var(--border); vertical-align: middle; }
  .analytics-table th { color: #aaa; font-weight: 400; white-space: nowrap; }
  .analytics-table th:first-child, .analytics-table td:first-child { text-align: left; padding-left: 0; }
  .analytics-table td:last-child, .analytics-table th:last-child { padding-right: 0; }
  .analytics-table tbody th { color: var(--text); font-weight: 500; white-space: normal; }
  .analytics-table .secondary { display: block; color: var(--muted); font: 11px/1.6 var(--font-mono); margin-top: 3px; }
  .analytics-link { color: var(--accent); font-size: 12px; text-decoration: none; }
  .analytics-link:hover { text-decoration: underline; }
  .campaign-workspace { margin-bottom:28px; }
  .campaign-workspace .analytics-card-header { flex-wrap:wrap; gap:12px; margin-bottom:18px; }
  .campaign-workspace .analytics-card-header label { flex:0 1 380px; min-width:0; max-width:100%; }
  .campaign-workspace select { width:100%; min-width:0; max-width:100%; }
  .campaign-context { display:grid; grid-template-columns:minmax(0,320px) minmax(0,1fr); gap:28px; align-items:start; }
  .campaign-context .creative-preview { max-width:320px; }
  .campaign-context .overview-kpis { margin-bottom:20px; }
  .campaign-context .overview-kpi { padding:0 16px; }
  .campaign-context .overview-kpi:first-child { padding-left:0; }
  .campaign-context .overview-kpi-value { font-size:26px; }
  .campaign-facts { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:14px 24px; margin:0; font-size:12px; }
  .campaign-facts dt { color:var(--muted); margin-bottom:4px; }
  .campaign-facts dd { margin:0; overflow-wrap:anywhere; line-height:1.5; }
  .campaign-facts .wide { grid-column:1/-1; }
  .campaign-detail-actions { display:flex; flex-wrap:wrap; align-items:center; gap:16px; margin-top:20px; border-top:1px solid var(--border); padding-top:16px; }
  .campaign-detail-actions button { padding:8px 12px; min-height:36px; }
  .campaign-detail-actions a { color:var(--accent); text-decoration:none; font-size:12px; }
  .campaign-section-heading { margin-bottom:16px; }
  .campaign-section-heading h2 { font-size:16px; font-weight:600; margin:0 0 6px; }
  .overview-section-heading { margin:0 0 16px; }
  .overview-section-heading h2 { font-size:16px; font-weight:600; margin:0 0 5px; }
  @media(max-width:1100px) { .campaign-facts { grid-template-columns:repeat(2,minmax(0,1fr)); } .campaign-context .overview-kpis { grid-template-columns:repeat(2,minmax(0,1fr)); row-gap:18px; } .campaign-context .overview-kpi:nth-child(3) { padding-left:0; border:0; } }
  @media(max-width:760px) { .campaign-context { grid-template-columns:minmax(0,1fr); gap:24px; } .campaign-context .creative-preview { max-width:390px; } }
  .feature-usage { margin-bottom:20px; }
  .feature-share { display:block; width:100%; max-width:100px; height:3px; background:var(--border); margin:6px 0 0 auto; }
  .feature-share > span { display:block; height:100%; background:var(--accent); }
  .analytics-footer { margin-top: 18px; color: var(--muted); font-size: 11px; }
  .analytics-details { margin-top: 20px; }
  .analytics-details summary { color: #bbb; font-size: 12px; cursor: pointer; padding: 12px 0; }
  .analytics-empty { padding: 36px 16px; text-align: center; color: var(--muted); font-size: 13px; }
  .analytics-card.events-card { padding: 0; }
  .events-heading { padding: 20px 20px 16px; }
  .events-heading h2 { margin-bottom: 5px; }
  .event-toolbar { display: grid; grid-template-columns: minmax(220px,360px) minmax(160px,220px) auto; align-items: end; gap: 16px; padding: 0 20px 20px; border-bottom: 1px solid var(--border); }
  .event-filter { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
  .event-filter label { color: #aaa; font-size: 12px; }
  .event-filter select { width: 100%; min-width: 0; height: 40px; font: 13px var(--font); }
  .event-toolbar button { justify-self: end; min-height: 40px; padding: 8px 16px; color: var(--text); }
  #eventsStatus { margin: 0; }
  #eventReadout { padding: 0 20px; }
  .event-table { table-layout: fixed; }
  .event-table col:first-child { width: 44%; }
  .event-table col:nth-child(2), .event-table col:nth-child(3) { width: 17%; }
  .event-table col:last-child { width: 22%; }
  .event-table thead th { border-top: 0; padding-top: 14px; padding-bottom: 14px; }
  .event-table .event-group th { text-align: left; padding: 18px 0 10px; color: #aaa; font-size: 10px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; }
  .event-table tbody:first-of-type .event-group th { border-top: 0; padding-top: 6px; }
  .event-table .event-row > * { padding-top: 12px; padding-bottom: 12px; }
  .event-table .event-row th { font-size: 13px; line-height: 1.5; }
  .event-table .event-description { display: block; margin-top: 3px; color: var(--muted); font-size: 12px; font-weight: 400; }
  .event-table .event-number { font-size: 14px; font-weight: 500; }
  .event-table .event-time { display: block; margin-top: 4px; color: var(--muted); font-size: 11px; }
  .event-mobile-label { display: none; }
  .event-definitions { padding: 16px 20px; border-top: 1px solid var(--border); margin: 0; }
  .event-definitions dl { margin-bottom: 0; }
  @media (max-width: 760px) {
    .event-toolbar { grid-template-columns: minmax(0,1fr) minmax(0,1fr); }
    .event-toolbar .event-filter:first-child { grid-column: 1/-1; }
    .event-toolbar button { width: 100%; padding: 8px 10px; font-size: 12px; white-space: nowrap; }
    .event-table { min-width: 0 !important; }
    .event-table, .event-table tbody { display: block; width: 100%; }
    .event-table colgroup, .event-table thead { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); }
    .event-table .event-group { display: block; }
    .event-table .event-group th { display: block; border-top: 0; padding: 20px 0 10px; }
    .event-table tbody:first-of-type .event-group th { padding-top: 20px; }
    .event-table .event-row { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 14px 20px; padding: 16px 0; border-top: 1px solid var(--border); }
    .event-table .event-row > * { display: block; border: 0; padding: 0; text-align: left; min-width: 0; }
    .event-table .event-row th, .event-table .event-last { grid-column: 1/-1; }
    .event-mobile-label { display: block; color: var(--muted); font-size: 11px; font-weight: 400; margin-bottom: 5px; }
    .event-table .event-last { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 8px; font-size: 11px; color: var(--muted); }
    .event-last .event-mobile-label, .event-table .event-time { display: inline; margin: 0; }
  }
  .field-label { font-size: 12px; color: #aaa; }
  .admin-form input:not(#id):not(#creative_version):not(#start_at):not(#end_at), .admin-form select { font-family: var(--font); }
  button:focus-visible, a:focus-visible, summary:focus-visible { outline: 2px solid var(--accent); outline-offset: 4px; }
  @media(max-width: 900px) { .analytics-grid { grid-template-columns: 1fr; } .main { padding: 24px 24px 0; } }
  @media(max-width: 600px) {
    .main { padding: 20px 16px 0; } .workspace-heading { align-items: start; gap: 16px; flex-direction: column; }
    .workspace-heading h1 { font-size: 22px; } .workspace-controls { width:100%; align-items:stretch; } .metric-definitions dl { grid-template-columns:1fr; } .period-control { width: 100%; justify-content: space-between; }
    .dashboard-nav { gap: 24px; margin-bottom: 12px; } .overview-kpis { grid-template-columns: repeat(2, 1fr); row-gap: 24px; }
    .overview-kpi { padding: 0 16px; } .overview-kpi:nth-child(3) { padding-left: 0; border: 0; }
    .overview-kpi-value { font-size: 28px; } .analytics-card { padding: 16px; }
    .product-strip { gap: 14px; } .product-strip strong { font-size: 20px; }
    .events-heading { padding: 16px 16px 14px; } .event-toolbar { gap: 12px; padding: 0 16px 16px; }
    #eventReadout { padding: 0 16px; } .event-definitions { padding: 16px; }
    .analytics-table { min-width: 480px; } .analytics-card-header { align-items: start; }
  }
`;

export const ANALYTICS_MARKUP = `
  <header class="workspace-heading">
    <div><h1 id="workspaceTitle">Dashboard</h1><p class="workspace-sub" id="workspaceDescription">App activity, campaign reporting, and tracked events.</p></div>
    <div class="workspace-controls"><div class="period-control"><label for="analyticsPeriod">Reporting period</label><select id="analyticsPeriod"><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option><option value="180">Last 180 days</option><option value="365">Last 365 days</option></select></div><p id="metricsStatus" class="analytics-note" role="status">Loading data…</p></div>
  </header>
  <nav class="dashboard-nav" role="tablist" aria-label="Dashboard sections">
    <button type="button" role="tab" id="tabOverview" aria-selected="true" aria-controls="overviewPanel" data-view="overview">Overview</button>
    <button type="button" role="tab" id="tabCampaigns" aria-selected="false" aria-controls="campaignsPanel" data-view="campaigns" tabindex="-1">Campaigns</button>
    <button type="button" role="tab" id="tabEvents" aria-selected="false" aria-controls="eventsPanel" data-view="events" tabindex="-1">Events</button>
  </nav>
  <div id="dashboardContent" class="dashboard-content">
  <section id="overviewPanel" role="tabpanel" aria-labelledby="tabOverview">
    <div id="appMetrics" hidden></div>
    <div id="dailyMetrics" hidden></div>
  </section>
  <section id="eventsPanel" role="tabpanel" aria-labelledby="tabEvents" hidden>
    <div class="analytics-card events-card">
    <header class="events-heading"><h2>Tracked activity</h2><p id="eventsStatus" class="analytics-note" role="status">Loading events…</p></header>
    <div class="event-toolbar">
      <div class="event-filter"><label for="eventCampaign">Campaign</label><select id="eventCampaign"><option value="">All campaigns & product events</option></select></div>
      <div class="event-filter"><label for="eventCategory">Event category</label><select id="eventCategory"><option value="all">All events</option><option value="ads">Advertising</option><option value="product">Product usage</option><option value="siri">Siri</option></select></div>
      <button type="button" id="exportEvents" disabled>Export CSV ↓</button>
    </div>
    <div id="eventReadout" aria-busy="true"></div>
    <details class="metric-definitions event-definitions"><summary>How to read these numbers</summary><dl><div><dt>Times recorded</dt><dd>Total recorded actions in the reporting period, including repeat use.</dd></div><div><dt>App installs</dt><dd>Separate copies of the app that recorded each action, not new downloads or verified people. One install can appear in several rows; do not add these counts together.</dd></div></dl></details>
    </div>
  </section>
`;

export const ANALYTICS_SCRIPT = String.raw`
  const dashboardStorageKey = 'gymtracker.dashboard.v1';
  const dashboardPrefs = (() => { try { const value = JSON.parse(localStorage.getItem(dashboardStorageKey) || '{}'); return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; } catch { return {}; } })();
  function saveDashboardPrefs(patch) { Object.assign(dashboardPrefs, patch); try { localStorage.setItem(dashboardStorageKey, JSON.stringify(dashboardPrefs)); } catch {} }
  let dashboardReady = false;
  let restoringScroll = false;
  function restoreDashboardScroll() {
    dashboardReady = true;
    requestAnimationFrame(() => { restoringScroll = true; document.getElementById('dashboardContent').scrollTop = Number(dashboardPrefs.scroll) || 0; requestAnimationFrame(() => { restoringScroll = false; }); });
  }
  let analyticsSnapshot = null;
  let trackedEvents = [];
  let eventRequest = 0;
  const eventLabels = {
    ad_impression: 'Ad viewed', ad_tap: 'Ad link tapped', app_session: 'App opened',
    event_open: 'Recreation event opened', passport_open: 'Campus ID opened', settings_open: 'Settings opened',
    siri_crowds: 'Siri · Current crowds', siri_events: 'Siri · Find events', siri_event_details: 'Siri · Event details'
  };
  const eventDescriptions = {
    ad_impression: 'Ad displayed in the home feed', ad_tap: 'Ad link button tapped',
    app_session: 'A visit to the app', event_open: 'Recreation event details viewed',
    passport_open: 'Campus ID screen viewed', settings_open: 'Settings screen viewed',
    siri_crowds: 'Crowd checks and gym recommendations', siri_events: 'Requests to find recreation events',
    siri_event_details: 'Requests for a specific event’s details'
  };
  const eventGroups = [{key:'product', label:'Product usage'}, {key:'ads', label:'Advertising'}, {key:'siri', label:'Siri'}];
  function trackedEventCategory(event) { return event.startsWith('ad_') ? 'ads' : event.startsWith('siri_') ? 'siri' : 'product'; }
  const analyticsNumber = value => (Number(value) || 0).toLocaleString('en-US');
  const analyticsPercent = (part, whole) => whole ? (part / whole * 100).toFixed(1) + '%' : '—';
  function showDashboardView(view, restoring = false) {
    if (!['overview', 'campaigns', 'events'].includes(view)) view = 'overview';
    if (!restoring) saveDashboardPrefs({view, scroll:0});
    document.getElementById('dashboardContent').scrollTop = 0;
    ['overview', 'campaigns', 'events'].forEach(name => { document.getElementById(name + 'Panel').hidden = name !== view; });
    document.querySelectorAll('[data-view]').forEach(btn => { const active = btn.dataset.view === view; btn.setAttribute('aria-selected', String(active)); btn.tabIndex = active ? 0 : -1; });
    if (view === 'events' && analyticsSnapshot) loadTrackedEvents();
    if (view === 'overview') requestAnimationFrame(() => { const metric = document.getElementById('chartMetric'); if (metric && analyticsSnapshot) renderActivityChart(metric.value); });
  }
  document.querySelectorAll('[data-view]').forEach((btn, index, buttons) => {
    btn.addEventListener('click', () => showDashboardView(btn.dataset.view));
    btn.addEventListener('keydown', e => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
      e.preventDefault();
      const next = e.key === 'Home' ? 0 : e.key === 'End' ? buttons.length - 1 : (index + (e.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
      buttons[next].focus(); showDashboardView(buttons[next].dataset.view);
    });
  });
  function renderActivityChart(metric) {
    if (!analyticsSnapshot) return;
    const rows = analyticsSnapshot.daily || [];
    const days = analyticsSnapshot.days;
    const now = new Date();
    const dates = Array.from({length: days + 1}, (_, i) => new Date(now.getTime() - (days - i) * 86400000).toISOString().slice(0, 10));
    const points = dates.map(date => { const row = rows.find(r => r.date === date); return {date, value: row ? Number(row[metric]) || 0 : null}; });
    const max = Math.max(2, Math.ceil(Math.max(0, ...points.map(p => p.value || 0)) / 2) * 2);
    const width = Math.max(300, document.getElementById('activityChart').clientWidth), left = 44, top = 14, baseline = 168, usable = width - left - 8;
    const slot = usable / points.length, barWidth = Math.min(34, slot * .55);
    const label = {impressions:'Recorded ad views', sessions:'App visits', active:'Active app installs', siri_actions:'Siri requests',event_opens:'Recreation event opens',passport_opens:'Campus ID opens',settings_opens:'Settings opens'}[metric];
    let svg = '<svg class="analytics-chart" viewBox="0 0 ' + width + ' 205" role="img" aria-label="' + label + ' per UTC day. ' + points.map(p => p.date + ': ' + (p.value == null ? 'no recorded events' : p.value)).join('; ') + '">';
    [0, .5, 1].forEach(r => { const y = baseline - r * (baseline - top); svg += '<line class="grid-line" x1="44" x2="' + (width - 8) + '" y1="' + y + '" y2="' + y + '"/><text x="34" y="' + (y + 4) + '" text-anchor="end">' + analyticsNumber(Math.ceil(r * max)) + '</text>'; });
    points.forEach((p, i) => { const h = (p.value || 0) / max * (baseline - top); svg += '<rect class="bar" x="' + (left + i * slot + (slot - barWidth) / 2) + '" y="' + (baseline - h) + '" width="' + barWidth + '" height="' + h + '"><title>' + p.date + ': ' + (p.value == null ? 'No recorded events' : analyticsNumber(p.value)) + '</title></rect>'; if (i === 0 || i === points.length - 1 || i === Math.floor(points.length / 2)) svg += '<text x="' + (left + (i + .5) * slot) + '" y="192" text-anchor="middle">' + new Date(p.date + 'T12:00:00Z').toLocaleDateString('en-US', {month:'short',day:'numeric',timeZone:'UTC'}) + '</text>'; });
    document.getElementById('activityChart').innerHTML = svg + '</svg>';
  }
  let reportingCampaignId = typeof dashboardPrefs.campaign === 'string' ? dashboardPrefs.campaign : '';
  function metricTiles(items) {
    return '<div class="overview-kpis">' + items.map(([label,value,help]) => '<div class="overview-kpi"><span class="overview-kpi-label">' + label + '</span><strong class="overview-kpi-value">' + value + '</strong><span class="metric-help">' + help + '</span></div>').join('') + '</div>';
  }
  function renderCampaignReporting(ads) {
    const host = document.getElementById('campaignReporting');
    if (!host) return;
    if (!ads.length) { host.innerHTML = '<section class="analytics-card campaign-workspace"><h2>Campaign reporting</h2><p class="analytics-note">Create a campaign below to see its creative, delivery, and advertiser report here.</p></section>'; return; }
    const ad = ads.find(a => a.id === reportingCampaignId) || ads.find(a => adStatus(a) === 'live') || ads[0];
    reportingCampaignId = ad.id;
    saveDashboardPrefs({campaign:ad.id});
    host.innerHTML = '<section class="analytics-card campaign-workspace"><div class="analytics-card-header"><div><h2>Campaign performance</h2></div><label><span class="visually-hidden">Select campaign</span><select id="creativeCampaign">' + ads.map(a => '<option value="' + escapeHtml(a.id) + '">' + escapeHtml(a.sponsor + ' · ' + a.id) + '</option>').join('') + '</select></label></div><div class="campaign-context"><div><div id="dashboardAdPreview">' + renderAdPreview(ad) + '</div><p class="analytics-note" style="margin-top:10px">Current saved creative</p></div><div id="campaignContextDetails"></div></div></section>';
    document.getElementById('creativeCampaign').value = ad.id;
    document.getElementById('creativeCampaign').addEventListener('change', event => { reportingCampaignId = event.target.value; saveDashboardPrefs({campaign:reportingCampaignId}); updateCampaignContext(ads.find(a => a.id === reportingCampaignId)); });
    updateCampaignContext(ad);
  }
  function updateCampaignContext(ad) {
    if (!ad) return;
    document.getElementById('dashboardAdPreview').innerHTML = renderAdPreview(ad);
    const data = analyticsSnapshot;
    const stats = data?.per_ad?.find(row => row.ad_id === ad.id) || {};
    const views = Number(stats.impressions) || 0, taps = Number(stats.clicks) || 0;
    const reach = Number(stats.reach) || 0;
    const days = document.getElementById('analyticsPeriod').value;
    let html = '<p class="analytics-note" style="margin-bottom:14px">Performance · last ' + days + ' days</p>';
    html += data ? metricTiles([
      ['Ad views',analyticsNumber(views),'Half the ad visible for a second.'],
      ['Audience reached',analyticsNumber(reach),'Unique app installs with a view.'],
      ['Link taps',analyticsNumber(taps),'Link button interactions.'],
      ['Tap rate',analyticsPercent(taps,views),analyticsNumber(taps) + (taps === 1 ? ' tap ÷ ' : ' taps ÷ ') + analyticsNumber(views) + ' views × 100.']
    ]) : '<p class="analytics-note" style="margin-bottom:18px">Metrics are not available. The saved creative and settings are shown below.</p>';
    const date = value => value ? new Date(value).toLocaleString([], {month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'}) : 'Not set';
    const facts = [
      ['Status',adStatus(ad)],['Starts',date(ad.start_at)],['Ends',date(ad.end_at)],
      ['Ad format',ad.tier || 'banner'],['Creative version',ad.creative_version || 'Not set'],
      ['Campaign ID',ad.id],['Link destination',ad.destination_url]
    ];
    html += '<dl class="campaign-facts">' + facts.map(([label,value]) => '<div' + (label === 'Link destination' ? ' class="wide"' : '') + '><dt>' + label + '</dt><dd>' + escapeHtml(value || 'Not set') + '</dd></div>').join('') + '</dl>';
    html += '<div class="campaign-detail-actions"><button type="button" id="editReportingCampaign">Edit campaign</button><a id="dashboardCampaignExport" target="_blank" rel="noopener" href="/api/admin/campaign-report?id=' + encodeURIComponent(ad.id) + '&days=' + days + '">Export campaign report ↗</a></div><p class="analytics-note" style="margin-top:12px">Link taps do not confirm website visits or sales. The report includes the current saved creative; earlier versions may differ.</p>';
    document.getElementById('campaignContextDetails').innerHTML = html;
    document.getElementById('editReportingCampaign').addEventListener('click', () => { const index = scheduledAds.findIndex(a => a.id === ad.id); if (index >= 0) { selectAd(index); openFormOverlay('Edit: ' + (ad.sponsor || ad.id)); } });
  }
  function renderAnalytics(data, ads) {
    analyticsSnapshot = data;
    const answered = Math.max(0, Number(data.siri_actions) - Number(data.siri_unavailable));
    document.getElementById('appMetrics').innerHTML = '<div class="overview-section-heading"><h2>App overview</h2><p class="analytics-note">How people use Gym Tracker · last ' + data.days + ' days</p></div>' + metricTiles([
      ['Active · 24 hours',analyticsNumber(data.active_24h),'App installs with a recorded event.'],
      ['Active · ' + data.days + ' days',analyticsNumber(data.active_period),'Unique app installs in this period.'],
      ['App visits',analyticsNumber(data.sessions),'Launches or returns after 30 minutes away.'],
      ['Siri requests answered',analyticsNumber(answered) + ' / ' + analyticsNumber(data.siri_actions),'Requests that returned live or cached data.']
    ]);
    let html = '<div class="analytics-grid"><section class="analytics-card"><div class="analytics-card-header"><h2>App activity over time</h2><label><span class="visually-hidden">Chart metric</span><select id="chartMetric"><option value="sessions">App visits</option><option value="active">Active app installs</option><option value="siri_actions">Siri requests</option><option value="event_opens">Recreation event opens</option><option value="passport_opens">Campus ID opens</option><option value="settings_opens">Settings opens</option></select></label></div><div id="activityChart"></div><p class="analytics-note">Recorded events by UTC day. Empty dates have no recorded activity; older versions and opt-outs are not represented.</p></section>';
    const featureRows = data.features || [];
    const feature = event => featureRows.find(row => row.event === event) || {opens:0,installations:0,repeat_installations:0};
    const siriActions = [['siri_crowds','Crowds & gym choice'],['siri_events','Find events'],['siri_event_details','Event details']];
    html += '<section class="analytics-card"><div class="analytics-card-header"><h2>Siri actions</h2></div><div class="analytics-table-wrap"><table class="analytics-table"><thead><tr><th scope="col">Action</th><th scope="col">Requests</th><th scope="col">Answered</th><th scope="col">App installs</th></tr></thead><tbody>' + siriActions.map(([event,label]) => {
      const rows = (data.siri || []).filter(row => row.event === event);
      const requests = rows.reduce((sum,row) => sum + Number(row.count),0);
      const answered = rows.filter(row => ['live','cached'].includes(row.status)).reduce((sum,row) => sum + Number(row.count),0);
      return '<tr><th scope="row">' + label + '</th><td>' + analyticsNumber(requests) + '</td><td>' + analyticsNumber(answered) + '</td><td>' + analyticsNumber(feature(event).installations) + '</td></tr>';
    }).join('') + '</tbody></table></div><p class="analytics-note" style="margin-top:14px">Answered requests returned live or cached data. Only actions that reached the app are recorded; phrases Siri did not match are missing.</p></section></div>';
    html += '<section class="analytics-card feature-usage"><div class="analytics-card-header"><div><h2>Feature usage</h2><p class="analytics-note">Recorded use during the selected reporting period.</p></div></div><div class="analytics-table-wrap"><table class="analytics-table"><thead><tr><th scope="col">Feature</th><th scope="col">Opens</th><th scope="col">App installs</th><th scope="col">Share of active installs</th><th scope="col">Repeat use</th><th scope="col">Opens per install</th></tr></thead><tbody>' + [['event_open','Recreation events','Event-detail opens'],['passport_open','Campus ID','Pass display opens'],['settings_open','Settings','Settings screen opens']].map(([event,label,detail]) => {
      const row = feature(event), share = data.active_period ? Number(row.installations) / Number(data.active_period) * 100 : 0;
      return '<tr data-feature="' + event + '"><th scope="row">' + label + '<span class="metric-help">' + detail + '</span></th><td>' + analyticsNumber(row.opens) + '</td><td>' + analyticsNumber(row.installations) + '</td><td><span>' + analyticsPercent(Number(row.installations),Number(data.active_period)) + '</span><span class="feature-share" aria-hidden="true"><span style="width:' + Math.min(100,Math.max(0,share)) + '%"></span></span></td><td>' + analyticsNumber(row.repeat_installations) + '</td><td>' + (Number(row.installations) ? (Number(row.opens) / Number(row.installations)).toFixed(1) : '—') + '</td></tr>';
    }).join('') + '</tbody></table></div><p class="analytics-note" style="margin-top:14px">Repeat use counts app installs with at least two opens in this period. Opens per install uses only installs that opened the feature. Shares use all active app installs, including Siri use; the same install can use several features, so shares do not add to 100%.</p></section>';
    if (data.versions?.length) html += '<section class="analytics-card"><div class="analytics-card-header"><h2>Release adoption & Siri reliability</h2></div><div class="analytics-table-wrap"><table class="analytics-table"><thead><tr><th scope="col">Version (build)</th><th scope="col">Active app installs</th><th scope="col">App visits</th><th scope="col">Siri requests</th><th scope="col">Unable to return data</th></tr></thead><tbody>' + data.versions.map(row => '<tr><th scope="row">' + escapeHtml(row.app_version) + ' (' + escapeHtml(row.build) + ')</th><td>' + analyticsNumber(row.active) + '</td><td>' + analyticsNumber(row.sessions) + '</td><td>' + analyticsNumber(row.siri_actions) + '</td><td>' + analyticsNumber(row.siri_unavailable) + '</td></tr>').join('') + '</tbody></table></div></section>';
    html += '<p class="analytics-footer">Active app installs can include background Siri use. Visits count foreground use only. Collection is best effort; missing data does not establish zero usage.</p>';
    document.getElementById('dailyMetrics').innerHTML = html;
    document.getElementById('dailyMetrics').hidden = false;
    document.getElementById('appMetrics').hidden = false;
    const chartMetric = ['sessions','active','siri_actions','event_opens','passport_opens','settings_opens'].includes(dashboardPrefs.chartMetric) ? dashboardPrefs.chartMetric : 'sessions';
    document.getElementById('chartMetric').value = chartMetric;
    document.getElementById('chartMetric').addEventListener('change', event => { saveDashboardPrefs({chartMetric:event.target.value}); renderActivityChart(event.target.value); });
    renderActivityChart(chartMetric);
    renderCampaignReporting(ads);
    const selected = typeof dashboardPrefs.eventCampaign === 'string' ? dashboardPrefs.eventCampaign : document.getElementById('eventCampaign').value;
    document.getElementById('eventCampaign').innerHTML = '<option value="">All campaigns & product events</option>' + ads.map(a => '<option value="' + escapeHtml(a.id) + '">' + escapeHtml(a.sponsor + ' · ' + a.id) + '</option>').join('');
    document.getElementById('eventCampaign').value = ads.some(ad => ad.id === selected) ? selected : '';
    if (dashboardPrefs.view !== 'events') restoreDashboardScroll();
  }
  async function loadTrackedEvents() {
    const currentRequest = ++eventRequest;
    const status = document.getElementById('eventsStatus');
    status.textContent = 'Loading events…';
    document.getElementById('eventReadout').setAttribute('aria-busy', 'true');
    document.getElementById('exportEvents').disabled = true;
    try {
      const query = new URLSearchParams({days: document.getElementById('analyticsPeriod').value});
      const campaign = document.getElementById('eventCampaign').value;
      if (campaign) query.set('campaign', campaign);
      const res = await fetch('/api/admin/events?' + query, {credentials:'include'});
      if (!res.ok) throw new Error('Events unavailable. Refresh to try again.');
      const data = await res.json();
      if (currentRequest !== eventRequest) return;
      trackedEvents = Array.isArray(data.events) ? data.events : [];
      status.textContent = 'Last ' + data.days + ' days · UTC · Aggregated first-party events';
      document.getElementById('eventReadout').setAttribute('aria-busy', 'false');
      renderTrackedEvents();
      if (!dashboardReady) restoreDashboardScroll();
    } catch (error) { if (currentRequest !== eventRequest) return; trackedEvents = []; const readout = document.getElementById('eventReadout'); readout.setAttribute('aria-busy', 'false'); readout.innerHTML = '<p class="analytics-empty">Tracked activity could not be loaded.</p>'; document.getElementById('exportEvents').disabled = true; status.textContent = error.message; if (!dashboardReady) restoreDashboardScroll(); }
  }
  function filteredTrackedEvents() {
    const category = document.getElementById('eventCategory').value;
    return trackedEvents.filter(row => category === 'all' || trackedEventCategory(row.event) === category);
  }
  function renderTrackedEvents() {
    const rows = filteredTrackedEvents();
    const groups = eventGroups.map(group => {
      const items = rows.filter(row => trackedEventCategory(row.event) === group.key);
      if (!items.length) return '';
      return '<tbody role="rowgroup" aria-label="' + group.label + '"><tr class="event-group" role="row"><th colspan="4" scope="rowgroup" role="rowheader">' + group.label + '</th></tr>' + items.map(row => {
        const recorded = new Date(row.last_received);
        const validDate = Number.isFinite(recorded.getTime());
        const date = validDate ? recorded.toLocaleDateString('en-US', {month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}) : 'Unavailable';
        const time = validDate ? recorded.toLocaleTimeString('en-US', {hour:'numeric',minute:'2-digit',timeZone:'UTC'}) + ' UTC' : '';
        return '<tr class="event-row" role="row"><th scope="row" role="rowheader">' + escapeHtml((eventLabels[row.event] || row.event).replace(/^Siri · /, '')) + '<span class="event-description">' + escapeHtml(eventDescriptions[row.event] || 'Recorded app interaction') + '</span></th><td role="cell"><span class="event-mobile-label" aria-hidden="true">Times recorded</span><span class="event-number">' + analyticsNumber(row.occurrences) + '</span></td><td role="cell"><span class="event-mobile-label" aria-hidden="true">Unique app installs</span><span class="event-number">' + analyticsNumber(row.installations) + '</span></td><td class="event-last" role="cell"><span class="event-mobile-label" aria-hidden="true">Last recorded</span>' + escapeHtml(date) + '<span class="event-time">' + escapeHtml(time) + '</span></td></tr>';
      }).join('') + '</tbody>';
    }).join('');
    document.getElementById('eventReadout').innerHTML = rows.length ? '<table class="analytics-table event-table" role="table"><caption class="visually-hidden">Tracked activity by event, grouped by category</caption><colgroup><col><col><col><col></colgroup><thead role="rowgroup"><tr role="row"><th scope="col" role="columnheader">Event</th><th scope="col" role="columnheader">Times recorded</th><th scope="col" role="columnheader">App installs<span class="event-time">Unique</span></th><th scope="col" role="columnheader">Last recorded<span class="event-time">UTC</span></th></tr></thead>' + groups + '</table>' : '<p class="analytics-empty">No events recorded for these filters yet.</p>';
    document.getElementById('exportEvents').disabled = !rows.length || document.getElementById('eventReadout').getAttribute('aria-busy') === 'true';
  }
  window.addEventListener('resize', () => { const metric = document.getElementById('chartMetric'); if (metric) renderActivityChart(metric.value); });
  document.getElementById('eventCategory').addEventListener('change', event => { saveDashboardPrefs({eventCategory:event.target.value}); renderTrackedEvents(); });
  document.getElementById('eventCampaign').addEventListener('change', event => { saveDashboardPrefs({eventCampaign:event.target.value}); loadTrackedEvents(); });
  document.getElementById('exportEvents').addEventListener('click', () => {
    const csvCell = value => '"' + String(value ?? '').replace(/"/g, '""') + '"';
    const lines = [['Event','Times recorded','Unique app installs','Session IDs','Last recorded (UTC)'], ...filteredTrackedEvents().map(r => [r.event,r.occurrences,r.installations,r.sessions,r.last_received])];
    const blob = new Blob([lines.map(r => r.map(csvCell).join(',')).join('\r\n')], {type:'text/csv;charset=utf-8'});
    const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'gymtracker-events-' + document.getElementById('analyticsPeriod').value + 'd.csv'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  if (['7','30','90','180','365'].includes(dashboardPrefs.period)) document.getElementById('analyticsPeriod').value = dashboardPrefs.period;
  if (['all','ads','product','siri'].includes(dashboardPrefs.eventCategory)) document.getElementById('eventCategory').value = dashboardPrefs.eventCategory;
  document.getElementById('analyticsPeriod').addEventListener('change', event => saveDashboardPrefs({period:event.target.value}));
  showDashboardView(dashboardPrefs.view || 'overview', true);
  let scrollSaveTimer;
  document.getElementById('dashboardContent').addEventListener('scroll', event => {
    if (!dashboardReady || restoringScroll) return;
    clearTimeout(scrollSaveTimer);
    scrollSaveTimer = setTimeout(() => saveDashboardPrefs({scroll:event.target.scrollTop}), 150);
  });
  window.addEventListener('pagehide', () => { if (dashboardReady && !restoringScroll) saveDashboardPrefs({scroll:document.getElementById('dashboardContent').scrollTop}); });

`;
