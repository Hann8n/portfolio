import { navMarkup } from "./views";

/** Workspace layout, KPI, chart, and table styles layered over BASE_STYLES. */
export const DASHBOARD_STYLES = `
  .visually-hidden { position:absolute; width:1px; height:1px; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; }
  [hidden] { display: none !important; }
  :root { --muted: #949494; --up: #6bd2bb; --down: #f2a07b; }
  .main { padding: 24px 32px 0; overflow: hidden; }
  .schedule-page { display: flex; flex-direction: column; min-height: 0; height: 100%; width: 100%; max-width: 1440px; margin: 0 auto; }
  .workspace-heading, .dashboard-nav { flex-shrink: 0; }
  .dashboard-content { flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; scrollbar-gutter: stable; padding: 0 8px 28px 0; }
  .workspace-heading { display: flex; justify-content: space-between; gap: 24px; align-items: center; margin-bottom: 16px; }
  .workspace-heading h1 { font-size: 24px; font-weight: 600; letter-spacing: -.025em; line-height: 1.2; margin-bottom: 8px; }
  .workspace-sub { color: var(--muted); font-size: 13px; }
  .workspace-controls { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
  .filter-row { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 10px 18px; align-items: center; }
  .period-control { display: flex; gap: 10px; align-items: center; flex-shrink: 0; }
  .period-control label { color: var(--muted); font-size: 12px; }
  .period-control select { width: auto; font-family: var(--font); font-size: 13px; padding: 8px 28px 8px 12px; }
  .audience-toggle { display: inline-flex; align-items: center; gap: 8px; color: var(--muted); font-size: 12px; cursor: pointer; min-height: 40px; }
  .audience-toggle input { width: 16px; min-height: 16px; height: 16px; margin: 0; accent-color: var(--accent); }
  #metricsStatus { margin: 0; min-height: 18px; font-size: 11px; line-height: 18px; text-align: right; }
  .dashboard-nav { display: flex; gap: 28px; border-bottom: 1px solid var(--border); margin-bottom: 12px; overflow-x: auto; scrollbar-width: none; }
  .dashboard-nav button { border: 0; border-bottom: 2px solid transparent; padding: 0; min-height: 30px; display:inline-flex; align-items:flex-end; line-height:18px; color: var(--muted); font-size: 13px; white-space: nowrap; flex-shrink: 0; }
  .dashboard-nav button[aria-selected=true] { color: var(--text); border-bottom-color: var(--accent); }
  .metric-help { display:block; color:var(--muted); font-size:12px; line-height:1.5; margin-top:6px; }
  .analytics-note { color: var(--muted); font-size: 12px; line-height: 1.6; }
  .analytics-note strong { color: var(--text); font-weight: 600; }
  .analytics-note.insight { margin-top: 14px; }
  .subhead { font-size: 12px; font-weight: 500; color: #bbb; margin: 16px 0 10px; }
  .subhead:first-of-type { margin-top: 4px; }

  .kpi-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; margin-bottom: 8px; }
  .kpi-card { display: flex; flex-direction: column; align-items: flex-start; gap: 6px; text-align: left; padding: 14px 16px; border: 1px solid var(--border); background: var(--surface); color: var(--text); font: inherit; min-width: 0; }
  button.kpi-card { cursor: pointer; }
  button.kpi-card:hover:not(:disabled) { border-color: #3a3a3a; color: var(--text); }
  .kpi-card.is-selected { border-color: var(--accent); box-shadow: inset 0 2px 0 var(--accent); }
  .kpi-label { color: #aaa; font-size: 12px; }
  .kpi-value-row { display: flex; align-items: flex-end; justify-content: space-between; gap: 8px; width: 100%; }
  .kpi-value { font: 600 28px/1.15 var(--font); font-variant-numeric: tabular-nums; letter-spacing: -.025em; }
  .sparkline { width: 72px; height: 22px; flex-shrink: 0; overflow: visible; }
  .sparkline polyline { fill: none; stroke: var(--accent); stroke-width: 1.5; vector-effect: non-scaling-stroke; opacity: .8; }
  .delta { font-size: 11px; font-weight: 500; padding: 1px 6px; border: 1px solid transparent; font-variant-numeric: tabular-nums; }
  .delta.up { color: var(--up); background: rgba(107,210,187,.1); }
  .delta.down { color: var(--down); background: rgba(242,160,123,.1); }
  .delta.neutral { color: var(--muted); border-color: var(--border); }
  .kpi-help { color: var(--muted); font-size: 11px; line-height: 1.45; }
  .kpi-note { margin: 4px 0 0; font-size: 11px; }
  #appMetrics { margin-bottom: 20px; }

  .analytics-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 20px; margin-bottom: 20px; }
  .analytics-card { border: 1px solid var(--border); background: var(--surface); padding: 20px; min-width: 0; }
  .analytics-card + .analytics-card, .analytics-card + .analytics-grid, .analytics-grid + .analytics-card { margin-top: 0; }
  .trend-card, .feature-usage, #dataQuality .analytics-card { margin-bottom: 20px; }
  .analytics-card h2 { font-size: 14px; font-weight: 600; letter-spacing: -.01em; margin: 0 0 4px; }
  .analytics-card-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 18px; }
  .analytics-card-header select { width: auto; min-height: 34px; font: 12px var(--font); padding: 6px 10px; }
  .chart-host { width: 100%; min-width: 0; }
  .chart { display: block; width: 100%; height: auto; overflow: visible; }
  .chart-grid { stroke: var(--border); stroke-width: 1; }
  .chart-axis { fill: #949494; font: 11px var(--font); }
  .chart-value { fill: #bbb; font: 500 10px var(--font); }
  .chart-bar { fill: var(--accent); opacity: .6; }
  .chart-bar.is-highlight, .chart-bar:hover { opacity: 1; }
  .chart-compare { fill: none; stroke: #8a8a8a; stroke-width: 1; stroke-dasharray: 3 2; }

  .heatmap-wrap { overflow-x: auto; }
  .heatmap { width: 100%; min-width: 520px; border-collapse: separate; border-spacing: 2px; table-layout: fixed; font-size: 10px; }
  .heatmap th { color: var(--muted); font-weight: 400; text-align: left; white-space: nowrap; }
  .heatmap thead th { text-align: left; height: 16px; overflow: visible; }
  .heatmap tbody th { width: 34px; padding-right: 4px; font-size: 11px; }
  .heatmap td { height: 18px; background: rgba(20,184,166, calc(.12 + var(--v, 0) * .88)); }
  .heatmap td.empty { background: rgba(255,255,255,.035); }

  .share-bars { display: grid; gap: 10px; font-size: 12px; }
  .share-row { display: grid; grid-template-columns: minmax(80px, 34%) minmax(0, 1fr) 84px; gap: 12px; align-items: center; }
  .share-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .share-track { height: 8px; background: rgba(255,255,255,.06); }
  .share-fill { display: block; height: 100%; background: var(--accent); opacity: .75; }
  .share-value { text-align: right; color: #bbb; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .feature-layout { display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 3fr); gap: 28px; align-items: start; }

  .overview-kpis { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); margin: 0 0 24px; }
  .overview-kpi { padding: 0 24px; border-left: 1px solid var(--border); min-width: 0; }
  .overview-kpi:first-child { padding-left: 0; border: 0; }
  .overview-kpi-label { color: #aaa; font-size: 12px; }
  .overview-kpi-value { display: block; font: 600 30px/1.3 var(--font); font-variant-numeric: tabular-nums; letter-spacing: -.025em; margin: 7px 0; overflow-wrap: anywhere; }

  .analytics-table-wrap { overflow-x: auto; }
  .analytics-table { width: 100%; border-collapse: collapse; text-align: right; font-size: 12px; font-variant-numeric: tabular-nums; }
  .analytics-table th, .analytics-table td { padding: 12px 10px; border-top: 1px solid var(--border); vertical-align: middle; }
  .analytics-table th { color: #aaa; font-weight: 400; white-space: nowrap; }
  .analytics-table th:first-child, .analytics-table td:first-child { text-align: left; padding-left: 0; }
  .analytics-table td:last-child, .analytics-table th:last-child { padding-right: 0; }
  .analytics-table tbody th { color: var(--text); font-weight: 500; white-space: normal; }
  .analytics-table .secondary { display: block; color: var(--muted); font: 11px/1.6 var(--font-mono); margin-top: 3px; }
  .audience-table td.signals, .audience-table thead th:nth-child(2) { text-align: left; white-space: normal; }
  .signal { display: inline-block; margin: 2px 6px 2px 0; padding: 1px 6px; font-size: 11px; color: var(--yellow); background: rgba(234,179,8,.1); border: 1px solid rgba(234,179,8,.25); }
  .audience-table button { white-space: nowrap; }

  .campaign-workspace { margin-bottom:28px; }
  .campaign-workspace .analytics-card-header { flex-wrap:wrap; gap:12px; margin-bottom:18px; }
  .campaign-workspace .analytics-card-header label { flex:0 1 420px; min-width:0; max-width:100%; }
  .campaign-workspace select { width:100%; min-width:0; max-width:100%; }
  .campaign-context { display:grid; grid-template-columns:minmax(0,320px) minmax(0,1fr); gap:28px; align-items:start; }
  .campaign-context .creative-preview { max-width:320px; }
  .campaign-context .overview-kpis { margin-bottom:20px; }
  .campaign-context .overview-kpi { padding:0 16px; }
  .campaign-context .overview-kpi:first-child { padding-left:0; }
  .campaign-context .overview-kpi-value { font-size:26px; }
  .campaign-delivery { margin-bottom: 20px; }
  .campaign-delivery:empty { display: none; }
  .campaign-delivery .share-bars { max-width: 420px; }
  .campaign-delivery .analytics-note { margin-top: 10px; }
  .campaign-facts { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:14px 24px; margin:0; font-size:12px; }
  .campaign-facts dt { color:var(--muted); margin-bottom:4px; }
  .campaign-facts dd { margin:0; overflow-wrap:anywhere; line-height:1.5; }
  .campaign-facts .wide { grid-column:1/-1; }
  .campaign-detail-actions { display:flex; flex-wrap:wrap; align-items:center; gap:16px; margin-top:20px; border-top:1px solid var(--border); padding-top:16px; }
  .campaign-detail-actions button { padding:8px 12px; min-height:36px; }
  .campaign-detail-actions a { color:var(--accent); text-decoration:none; font-size:12px; }
  .campaign-section-heading { margin-bottom:16px; }
  .campaign-section-heading h2 { font-size:16px; font-weight:600; margin:0 0 6px; }
  @media(max-width:1100px) { .campaign-facts { grid-template-columns:repeat(2,minmax(0,1fr)); } .campaign-context .overview-kpis { grid-template-columns:repeat(2,minmax(0,1fr)); row-gap:18px; } .campaign-context .overview-kpi:nth-child(3) { padding-left:0; border:0; } }
  @media(max-width:760px) { .campaign-context { grid-template-columns:minmax(0,1fr); gap:24px; } .campaign-context .creative-preview { max-width:390px; } }

  .analytics-footer { margin-top: 18px; color: var(--muted); font-size: 11px; }
  .analytics-empty { padding: 36px 16px; text-align: center; color: var(--muted); font-size: 13px; }
  .metric-definitions summary { cursor:pointer; font-size:12px; color:var(--muted); }
  .metric-definitions dl { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px 24px; font-size:12px; margin:14px 0 0; }
  .metric-definitions dt { font-weight:600; margin-bottom:3px; }
  .metric-definitions dd { color:var(--muted); margin:0; line-height:1.6; }
  .analytics-card.events-card { padding: 0; }
  .events-heading { padding: 20px 20px 16px; }
  .events-heading h2 { margin-bottom: 5px; }
  .event-toolbar { display: grid; grid-template-columns: minmax(220px,360px) minmax(160px,220px) auto; align-items: end; gap: 16px; padding: 0 20px 20px; border-bottom: 1px solid var(--border); }
  .event-filter { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
  .event-filter label { color: #aaa; font-size: 12px; }
  .event-filter select { width: 100%; min-width: 0; height: 40px; font: 13px var(--font); }
  .event-toolbar button { justify-self: end; min-height: 40px; height: 40px; padding: 8px 16px; color: var(--text); }
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
  button:focus-visible, a:focus-visible, summary:focus-visible, select:focus-visible, input:focus-visible { outline: 2px solid var(--accent); outline-offset: 4px; }
  @media(max-width: 1200px) { .kpi-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
  @media(max-width: 900px) { .analytics-grid, .feature-layout { grid-template-columns: 1fr; } .main { padding: 24px 24px 0; } }
  @media(max-width: 600px) {
    .main { padding: 20px 16px 0; } .workspace-heading { align-items: start; gap: 12px; flex-direction: column; }
    .workspace-heading h1 { font-size: 22px; } .workspace-controls { width:100%; align-items:stretch; } .filter-row { justify-content: space-between; } .metric-definitions dl { grid-template-columns:1fr; }
    .period-control { width: 100%; justify-content: space-between; } #metricsStatus { text-align: left; }
    .dashboard-nav { gap: 22px; margin-bottom: 12px; } .overview-kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); row-gap: 24px; }
    .overview-kpi { padding: 0 16px; } .overview-kpi:nth-child(3) { padding-left: 0; border: 0; }
    .overview-kpi-value { font-size: 26px; } .analytics-card { padding: 16px; }
    .kpi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; } .kpi-card { padding: 12px; } .kpi-value { font-size: 24px; } .sparkline { display: none; }
    .share-row { grid-template-columns: minmax(70px, 38%) minmax(0, 1fr) 72px; gap: 8px; }
    .events-heading { padding: 16px 16px 14px; } .event-toolbar { gap: 12px; padding: 0 16px 16px; }
    #eventReadout { padding: 0 16px; } .event-definitions { padding: 16px; }
    .analytics-table { min-width: 440px; } .analytics-card-header { flex-direction: column; align-items: stretch; }
  }
`;

export const DASHBOARD_HEADER_MARKUP = `
  <header class="workspace-heading">
    <div><h1 id="workspaceTitle">Dashboard</h1><p class="workspace-sub" id="workspaceDescription">App health, campaign delivery, tracked events, and data quality.</p></div>
    <div class="workspace-controls">
      <div class="filter-row">
        <label class="audience-toggle" title="Developer, TestFlight, and demo installs managed in Data quality"><input type="checkbox" id="excludeInternal" checked> Exclude internal installs <span id="internalCount"></span></label>
        <div class="period-control"><label for="analyticsPeriod">Reporting period</label><select id="analyticsPeriod"><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option><option value="180">Last 180 days</option><option value="365">Last 365 days</option></select></div>
      </div>
      <p id="metricsStatus" class="analytics-note" role="status">Loading data…</p>
    </div>
  </header>
  ${navMarkup()}
`;

export const OVERVIEW_MARKUP = `
  <section id="overviewPanel" role="tabpanel" aria-labelledby="tabOverview">
    <div id="appMetrics" hidden></div>
    <div id="dailyMetrics" hidden></div>
  </section>`;

export const EVENTS_MARKUP = `
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
  </section>`;

export const DATA_QUALITY_MARKUP = `
  <section id="dataPanel" role="tabpanel" aria-labelledby="tabData" hidden>
    <div id="dataQuality" aria-busy="true"><p class="analytics-empty">Loading data quality…</p></div>
  </section>`;
