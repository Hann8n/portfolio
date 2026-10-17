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
  .dashboard-preview { margin:20px 0; }
  .dashboard-preview .analytics-card-header { flex-wrap:wrap; }
  .dashboard-preview select { max-width:100%; }
  .dashboard-preview-layout { display:grid; grid-template-columns:minmax(0,390px) minmax(0,1fr); gap:24px; align-items:center; }
  @media(max-width:700px) { .dashboard-preview-layout { grid-template-columns:minmax(0,1fr); gap:12px; } }
  .analytics-footer { margin-top: 18px; color: var(--muted); font-size: 11px; }
  .analytics-details { margin-top: 20px; }
  .analytics-details summary { color: #bbb; font-size: 12px; cursor: pointer; padding: 12px 0; }
  .analytics-empty { padding: 36px 16px; text-align: center; color: var(--muted); font-size: 13px; }
  .event-toolbar { display: flex; align-items: end; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
  .event-filter { display: flex; flex-direction: column; gap: 6px; min-width: 160px; }
  .event-filter label { color: #aaa; font-size: 12px; }
  .event-filter select { font: 13px var(--font); }
  .event-toolbar button { margin-left: auto; min-height: 40px; padding: 8px 16px; color: var(--text); }
  #eventsStatus { margin: 0 0 16px; }
  .report-actions { border-top: 1px solid var(--border); margin-top: 20px; padding-top: 18px; }
  .report-actions label { color: var(--text); font-size: 13px; font-weight: 500; }
  .report-actions select { font-family: var(--font); font-size: 13px; }
  .report-export { color: var(--accent); border: 1px solid var(--accent); text-align: center; padding: 10px 12px; min-height: 40px; text-decoration: none; font: 500 13px var(--font); }
  .report-export:hover { background: var(--accent-filled); color: white; }
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
    .event-filter { min-width: 0; flex: 1; } .event-toolbar button { width: 100%; }
    .analytics-table { min-width: 480px; } .analytics-card-header { align-items: start; }
  }
`;

export const ANALYTICS_MARKUP = `
  <header class="workspace-heading">
    <div><h1 id="workspaceTitle">Dashboard</h1><p class="workspace-sub" id="workspaceDescription">Campaign performance and product activity.</p></div>
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
    <div class="event-toolbar">
      <div class="event-filter"><label for="eventCampaign">Campaign</label><select id="eventCampaign"><option value="">All campaigns & product events</option></select></div>
      <div class="event-filter"><label for="eventCategory">Event category</label><select id="eventCategory"><option value="all">All events</option><option value="ads">Advertising</option><option value="product">Product usage</option><option value="siri">Siri</option></select></div>
      <button type="button" id="exportEvents">Export CSV ↓</button>
    </div>
    <p id="eventsStatus" class="analytics-note" role="status">Loading events…</p>
    <div class="analytics-card"><div class="analytics-table-wrap" id="eventReadout"></div></div>
    <p class="analytics-footer">Aggregated interactions only. Unique app installs means separate copies of the app, not new downloads or verified people. The same app can appear in several event rows, so these audience counts cannot be added together.</p>
  </section>
`;

export const ANALYTICS_SCRIPT = String.raw`
  let analyticsSnapshot = null;
  let trackedEvents = [];
  let eventRequest = 0;
  const eventLabels = {
    ad_impression: 'Ad viewed', ad_tap: 'Ad link tapped', app_session: 'App opened',
    event_open: 'Recreation event opened', passport_open: 'Campus ID opened', settings_open: 'Settings opened',
    siri_crowds: 'Siri · Current crowds', siri_events: 'Siri · Find events', siri_event_details: 'Siri · Event details'
  };
  const analyticsNumber = value => (Number(value) || 0).toLocaleString('en-US');
  const analyticsPercent = (part, whole) => whole ? (part / whole * 100).toFixed(1) + '%' : '—';
  function showDashboardView(view) {
    const titles = {overview: ['Overview', 'Campaign performance and product activity.'], campaigns: ['Campaigns', 'Manage creative, scheduling, and advertiser reports.'], events: ['Events', 'Explore delivery and engagement with detailed statistical readouts.']};
    if (!titles[view]) view = 'overview';
    document.getElementById('dashboardContent').scrollTop = 0;
    ['overview', 'campaigns', 'events'].forEach(name => { document.getElementById(name + 'Panel').hidden = name !== view; });
    document.querySelectorAll('[data-view]').forEach(btn => { const active = btn.dataset.view === view; btn.setAttribute('aria-selected', String(active)); btn.tabIndex = active ? 0 : -1; });
    if (view === 'events') loadTrackedEvents();
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
  function analyticsDelta(current, previous) {
    if (!analyticsSnapshot?.comparison_available) return 'Comparison unavailable';
    if (!previous) return 'No prior activity';
    const change = (current - previous) / previous * 100;
    return (change > 0 ? '+' : '') + change.toFixed(1) + '% vs prior period';
  }
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
    const label = {impressions:'Recorded ad views', sessions:'App visits', active:'Active app installs'}[metric];
    let svg = '<svg class="analytics-chart" viewBox="0 0 ' + width + ' 205" role="img" aria-label="' + label + ' per UTC day. ' + points.map(p => p.date + ': ' + (p.value == null ? 'no recorded events' : p.value)).join('; ') + '">';
    [0, .5, 1].forEach(r => { const y = baseline - r * (baseline - top); svg += '<line class="grid-line" x1="44" x2="' + (width - 8) + '" y1="' + y + '" y2="' + y + '"/><text x="34" y="' + (y + 4) + '" text-anchor="end">' + analyticsNumber(Math.ceil(r * max)) + '</text>'; });
    points.forEach((p, i) => { const h = (p.value || 0) / max * (baseline - top); svg += '<rect class="bar" x="' + (left + i * slot + (slot - barWidth) / 2) + '" y="' + (baseline - h) + '" width="' + barWidth + '" height="' + h + '"><title>' + p.date + ': ' + (p.value == null ? 'No recorded events' : analyticsNumber(p.value)) + '</title></rect>'; if (i === 0 || i === points.length - 1 || i === Math.floor(points.length / 2)) svg += '<text x="' + (left + (i + .5) * slot) + '" y="192" text-anchor="middle">' + new Date(p.date + 'T12:00:00Z').toLocaleDateString('en-US', {month:'short',day:'numeric',timeZone:'UTC'}) + '</text>'; });
    document.getElementById('activityChart').innerHTML = svg + '</svg>';
  }
  function renderAnalytics(data, ads) {
    analyticsSnapshot = data;
    const previous = data.previous || {};
    const ctr = analyticsPercent(data.clicks, data.impressions);
    const kpis = [
      ['Ad views', data.impressions, 'Recorded after half the ad is visible for a second.', analyticsDelta(data.impressions, Number(previous.impressions))],
      ['Audience reached', data.reach, 'Unique app installs with a recorded ad view.', analyticsDelta(data.reach, Number(previous.reach))],
      ['Link taps', data.clicks, 'Times an ad’s link button was tapped.', analyticsDelta(data.clicks, Number(previous.clicks))],
      ['Tap rate', ctr, analyticsNumber(data.clicks) + (Number(data.clicks) === 1 ? ' link tap ÷ ' : ' link taps ÷ ') + analyticsNumber(data.impressions) + ' recorded ad views.', ''],
    ];
    document.getElementById('appMetrics').innerHTML = '<div class="overview-kpis">' + kpis.map(([label,value,help,note]) => '<div class="overview-kpi"><span class="overview-kpi-label">' + label + '</span><strong class="overview-kpi-value">' + (typeof value === 'string' ? value : analyticsNumber(value)) + '</strong><span class="metric-help">' + help + '</span>' + (data.comparison_available && note ? '<span class="overview-kpi-detail">' + note + '</span>' : '') + '</div>').join('') + '</div>';
    const campaigns = (data.per_ad || []).slice(0, 6);
    const frequency = data.reach ? (data.impressions / data.reach).toFixed(2) : '—';
    const availableSiri = Number(data.siri_actions) - Number(data.siri_unavailable);
    let html = '<div class="analytics-grid"><section class="analytics-card"><div class="analytics-card-header"><h2>Activity over time</h2><label><span class="visually-hidden">Chart metric</span><select id="chartMetric"><option value="impressions">Ad views</option><option value="sessions">App visits</option><option value="active">Active app installs</option></select></label></div><div id="activityChart"></div><p class="analytics-note">Recorded activity by day · UTC. Empty dates have no recorded events; activity before collection began is unknown.</p></section>';
    html += '<section class="analytics-card"><div class="analytics-card-header"><h2>Responses to your ads</h2></div><div class="engagement-row"><span>App installs that tapped a link</span><strong>' + analyticsNumber(data.unique_clickers) + '</strong></div><div class="engagement-row"><span>Views per reached app install</span><strong>' + frequency + '</strong></div><p class="analytics-note">An app install is one copy of the app. It is not a new download or a verified person. A person using two devices may count twice.</p><p class="analytics-note">Link taps show interest. They do not confirm that someone visited the website, signed up, or made a purchase.</p></section></div>';
    html += '<div class="analytics-grid"><section class="analytics-card"><div class="analytics-card-header"><h2>Campaign performance</h2><a href="#" class="analytics-link" id="viewCampaigns">Manage campaigns ↗</a></div>';
    html += campaigns.length ? '<div class="analytics-table-wrap"><table class="analytics-table"><thead><tr><th scope="col">Campaign</th><th scope="col">Ad views</th><th scope="col">Link taps</th><th scope="col">Tap rate</th><th scope="col">Report</th></tr></thead><tbody>' + campaigns.map(row => { const ad = ads.find(a => a.id === row.ad_id); return '<tr><th scope="row">' + escapeHtml(ad?.sponsor || row.ad_id) + '<span class="secondary">' + escapeHtml(row.ad_id) + '</span></th><td>' + analyticsNumber(row.impressions) + '</td><td>' + analyticsNumber(row.clicks) + '</td><td>' + analyticsPercent(row.clicks, row.impressions) + '</td><td><a class="analytics-link" target="_blank" rel="noopener" href="/api/admin/campaign-report?id=' + encodeURIComponent(row.ad_id) + '&days=' + data.days + '">Export ↗</a></td></tr>'; }).join('') + '</tbody></table></div>' : '<p class="analytics-empty">Campaign activity will appear as the updated app is used.</p>';
    html += '</section><section class="analytics-card"><div class="analytics-card-header"><h2>Product health</h2></div><div class="product-strip"><div><span class="analytics-note">Active · 24h</span><strong>' + analyticsNumber(data.active_24h) + '</strong></div><div><span class="analytics-note">Active · ' + data.days + 'd</span><strong>' + analyticsNumber(data.active_period) + '</strong></div><div><span class="analytics-note">App visits</span><strong>' + analyticsNumber(data.sessions) + '</strong></div></div><div class="product-health"><div class="engagement-row"><span>App installs opening events</span><strong>' + analyticsNumber(data.event_users) + '</strong></div><div class="engagement-row"><span>App installs opening Campus ID</span><strong>' + analyticsNumber(data.passport_users) + '</strong></div><div class="engagement-row"><span>Siri requests answered</span><strong>' + analyticsNumber(availableSiri) + ' / ' + analyticsNumber(data.siri_actions) + '</strong></div></div><p class="analytics-note">Active counts app installs with a recorded event. Visits start on launch or after 30 minutes away. Answered Siri requests returned live or cached data.</p></section></div>';
    if (data.versions?.length) html += '<details class="analytics-details"><summary>Release adoption & Siri reliability</summary><div class="analytics-table-wrap"><table class="analytics-table"><thead><tr><th scope="col">Version (build)</th><th scope="col">Active app installs</th><th scope="col">App visits</th><th scope="col">Siri actions</th><th scope="col">Unavailable / invalid</th></tr></thead><tbody>' + data.versions.map(row => '<tr><th scope="row">' + escapeHtml(row.app_version) + ' (' + escapeHtml(row.build) + ')</th><td>' + analyticsNumber(row.active) + '</td><td>' + analyticsNumber(row.sessions) + '</td><td>' + analyticsNumber(row.siri_actions) + '</td><td>' + analyticsNumber(row.siri_unavailable) + '</td></tr>').join('') + '</tbody></table></div></details>';
    html += '<details class="metric-definitions"><summary>How these numbers are counted</summary><dl><div><dt>Ad views (impressions)</dt><dd>At least half the ad must be visible for one continuous second. Each ad version counts once per app visit.</dd></div><div><dt>Audience reached</dt><dd>Each anonymous app install counts once for the period, even if it sees the ad several times. It is not a count of people or new downloads.</dd></div><div><dt>Link taps & tap rate</dt><dd>Link taps are button interactions. Tap rate = taps ÷ ad views × 100. Repeat taps can produce a rate above 100%; this is not a conversion rate.</dd></div><div><dt>Coverage</dt><dd>Older app versions, analytics opt-outs, and events that fail to upload are missing. An empty period does not prove that no one saw an ad.</dd></div></dl></details>';

    if (ads.length) html += '<section class="analytics-card dashboard-preview"><div class="analytics-card-header"><h2>Ad preview</h2><label><span class="visually-hidden">Preview campaign</span><select id="creativeCampaign">' + ads.map(ad => '<option value="' + escapeHtml(ad.id) + '">' + escapeHtml(ad.sponsor + ' · ' + ad.id) + '</option>').join('') + '</select></label></div><div class="dashboard-preview-layout"><div id="dashboardAdPreview"></div><p class="analytics-note">Current saved creative, including its artwork, label, and link button. The same preview appears in the campaign report. It may differ from older versions included in the reporting period.</p></div></section>';
    const previousPreview = document.getElementById('creativeCampaign')?.value;
    document.getElementById('dailyMetrics').innerHTML = html;
    const previewSelect = document.getElementById('creativeCampaign');
    if (previewSelect) {
      if (ads.some(ad => ad.id === previousPreview)) previewSelect.value = previousPreview;
      const update = () => { document.getElementById('dashboardAdPreview').innerHTML = renderAdPreview(ads.find(ad => ad.id === previewSelect.value) || {}); };
      previewSelect.addEventListener('change', update); update();
    }
    document.getElementById('dailyMetrics').hidden = false;
    document.getElementById('appMetrics').hidden = false;
    document.getElementById('chartMetric').addEventListener('change', e => renderActivityChart(e.target.value));
    document.getElementById('viewCampaigns').addEventListener('click', e => { e.preventDefault(); showDashboardView('campaigns'); });
    renderActivityChart('impressions');
    const selected = document.getElementById('eventCampaign').value;
    document.getElementById('eventCampaign').innerHTML = '<option value="">All campaigns & product events</option>' + ads.map(a => '<option value="' + escapeHtml(a.id) + '">' + escapeHtml(a.sponsor + ' · ' + a.id) + '</option>').join('');
    document.getElementById('eventCampaign').value = selected;
  }
  async function loadTrackedEvents() {
    const currentRequest = ++eventRequest;
    const status = document.getElementById('eventsStatus');
    status.textContent = 'Loading events…';
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
      renderTrackedEvents();
    } catch (error) { if (currentRequest !== eventRequest) return; trackedEvents = []; document.getElementById('eventReadout').innerHTML = ''; status.textContent = error.message; }
  }
  function filteredTrackedEvents() {
    const category = document.getElementById('eventCategory').value;
    return trackedEvents.filter(row => category === 'all' || (category === 'ads' ? row.event.startsWith('ad_') : category === 'siri' ? row.event.startsWith('siri_') : !row.event.startsWith('ad_') && !row.event.startsWith('siri_')));
  }
  function renderTrackedEvents() {
    const rows = filteredTrackedEvents();
    document.getElementById('eventReadout').innerHTML = rows.length ? '<table class="analytics-table"><thead><tr><th scope="col">Event</th><th scope="col">Times recorded</th><th scope="col">Unique app installs</th><th scope="col">Last recorded · UTC</th></tr></thead><tbody>' + rows.map(row => '<tr><th scope="row">' + escapeHtml(eventLabels[row.event] || row.event) + '</th><td>' + analyticsNumber(row.occurrences) + '</td><td>' + analyticsNumber(row.installations) + '</td><td>' + escapeHtml(new Date(row.last_received).toLocaleString('en-US', {month:'short',day:'numeric',hour:'numeric',minute:'2-digit',timeZone:'UTC'})) + '</td></tr>').join('') + '</tbody></table>' : '<p class="analytics-empty">No events recorded for these filters yet.</p>';
    document.getElementById('exportEvents').disabled = !rows.length;
  }
  window.addEventListener('resize', () => { const metric = document.getElementById('chartMetric'); if (metric) renderActivityChart(metric.value); });
  document.getElementById('eventCategory').addEventListener('change', renderTrackedEvents);
  document.getElementById('eventCampaign').addEventListener('change', loadTrackedEvents);
  document.getElementById('exportEvents').addEventListener('click', () => {
    const csvCell = value => '"' + String(value ?? '').replace(/"/g, '""') + '"';
    const lines = [['Event','Times recorded','Unique app installs','Session IDs','Last recorded (UTC)'], ...filteredTrackedEvents().map(r => [r.event,r.occurrences,r.installations,r.sessions,r.last_received])];
    const blob = new Blob([lines.map(r => r.map(csvCell).join(',')).join('\r\n')], {type:'text/csv;charset=utf-8'});
    const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'gymtracker-events-' + document.getElementById('analyticsPeriod').value + 'd.csv'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
`;
