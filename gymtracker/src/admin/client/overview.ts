/** Overview workspace: headline app health with comparisons, trend, usage timing, engagement, features, platform. */
export const OVERVIEW_SCRIPT = String.raw`
  const OVERVIEW_SERIES = {
    active: {label:'Active installs', unit:'active installs'},
    new_installs: {label:'New installs', unit:'new installs'},
    sessions: {label:'App visits', unit:'visits'},
    passport_opens: {label:'Campus ID opens', unit:'Campus ID opens'},
    event_opens: {label:'Recreation event opens', unit:'event opens'},
    settings_opens: {label:'Settings opens', unit:'Settings opens'},
    siri_actions: {label:'Siri requests', unit:'Siri requests'},
  };
  const WEEKDAYS = [[1,'Mon'],[2,'Tue'],[3,'Wed'],[4,'Thu'],[5,'Fri'],[6,'Sat'],[0,'Sun']];
  const WEEKDAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  let chartMetric = Object.keys(OVERVIEW_SERIES).includes(dashboardPrefs.chartMetric) ? dashboardPrefs.chartMetric : 'active';

  function kpiCard(spec, data) {
    const prev = data.previous;
    const series = spec.series ? data.daily.map(d => Number(d[spec.series]) || 0) : [];
    const tag = spec.series ? 'button' : 'div';
    return '<' + tag + (spec.series ? ' type="button" data-series="' + spec.series + '" aria-pressed="' + (chartMetric === spec.series) + '"' : '') + ' class="kpi-card' + (spec.series && chartMetric === spec.series ? ' is-selected' : '') + '">' +
      '<span class="kpi-label">' + spec.label + '</span>' +
      '<span class="kpi-value-row"><strong class="kpi-value">' + spec.value(data) + '</strong>' + sparklineSvg(series) + '</span>' +
      deltaChip(spec.raw(data), prev ? spec.raw(prev) : null, data.days) +
      '<span class="kpi-help">' + spec.help(data) + '</span></' + tag + '>';
  }

  function renderKpis(data) {
    const specs = [
      {label:'Active installs', series:'active', raw:d => d.active_period, value:d => analyticsNumber(d.active_period), help:d => analyticsNumber(d.active_24h) + ' active · 24 hours'},
      {label:'New installs', series:'new_installs', raw:d => d.new_installs, value:d => analyticsNumber(d.new_installs), help:d => 'First seen this period · ' + analyticsPercent(d.new_installs, d.active_period, 0) + ' of active'},
      {label:'App visits', series:'sessions', raw:d => d.sessions, value:d => analyticsNumber(d.sessions), help:d => (d.visits_per_visitor || 0).toFixed(1) + ' per visiting install'},
      {label:'Returning installs', raw:d => d.returning_installs, value:d => analyticsPercent(d.returning_installs, d.active_period, 0), help:d => analyticsNumber(d.returning_installs) + ' used the app on 2+ days'},
      {label:'Campus ID reach', series:'passport_opens', raw:d => d.passport_users, value:d => analyticsPercent(d.passport_users, d.active_period, 0), help:d => analyticsNumber(d.passport_users) + ' installs · ' + analyticsNumber(d.passport_opens) + ' opens'},
    ];
    const host = document.getElementById('appMetrics');
    host.innerHTML = '<div class="kpi-grid">' + specs.map(spec => kpiCard(spec, data)).join('') + '</div>' +
      (data.comparison_available ? '' : '<p class="analytics-note kpi-note">Comparisons start once ' + data.days * 2 + ' days of history exist. Analytics began ' + (data.coverage_since ? formatLocalTime(data.coverage_since) : 'recently') + '.</p>');
    host.querySelectorAll('[data-series]').forEach(card => card.addEventListener('click', () => setChartMetric(card.dataset.series)));
  }

  function setChartMetric(metric) {
    chartMetric = metric;
    saveDashboardPrefs({chartMetric});
    const select = document.getElementById('chartMetric');
    if (select) select.value = metric;
    document.querySelectorAll('.kpi-card[data-series]').forEach(card => { const on = card.dataset.series === metric; card.classList.toggle('is-selected', on); card.setAttribute('aria-pressed', String(on)); });
    renderActivityChart();
  }

  function renderActivityChart() {
    const host = document.getElementById('activityChart');
    if (!host || !analyticsSnapshot) return;
    const data = analyticsSnapshot, spec = OVERVIEW_SERIES[chartMetric];
    const values = data.daily.map(d => Number(d[chartMetric]) || 0);
    const comparison = data.previous_daily.length ? data.previous_daily.map(d => Number(d[chartMetric]) || 0) : undefined;
    const points = data.daily.map((d, i) => ({label: formatLocalDay(d.date), value: values[i], title: formatLocalDay(d.date, {weekday:'short'}) + ': ' + analyticsNumber(values[i]) + ' ' + spec.unit + (comparison ? ' (previous: ' + analyticsNumber(comparison[i]) + ')' : '')}));
    const peakIndex = values.indexOf(Math.max(...values));
    host.innerHTML = barChartSvg(points, {ariaLabel: spec.label + ' per day, Eastern Time', width: Math.max(320, host.clientWidth), height: 220, comparison, highlight: values[peakIndex] > 0 ? peakIndex : undefined, valueLabels: points.length <= 10});
    const total = values.reduce((a, b) => a + b, 0);
    document.getElementById('activityInsight').innerHTML = total
      ? 'Peak: <strong>' + formatLocalDay(data.daily[peakIndex].date, {weekday:'long', month:'short', day:'numeric'}) + '</strong> with ' + analyticsNumber(values[peakIndex]) + ' ' + spec.unit + '.' + (comparison ? ' Dashed outlines show the previous ' + data.days + ' days.' : '')
      : 'No ' + spec.unit + ' recorded in this period.';
  }

  function heatmapHtml(rows) {
    const grid = Array.from({length:7}, () => Array(24).fill(0));
    rows.forEach(r => { grid[r.dow][r.hour] = r.sessions; });
    const max = Math.max(0, ...grid.flat());
    if (!max) return '<p class="analytics-empty">No app visits recorded in this period.</p>';
    let html = '<div class="heatmap-wrap"><table class="heatmap"><caption class="visually-hidden">App visits by weekday and hour, Eastern Time</caption><thead><tr><th scope="col"><span class="visually-hidden">Day</span></th>';
    for (let h = 0; h < 24; h++) html += '<th scope="col">' + (h % 3 === 0 ? hourLabel(h).replace(':00', '').replace(' ', '') : '<span class="visually-hidden">' + hourLabel(h) + '</span>') + '</th>';
    html += '</tr></thead><tbody>';
    WEEKDAYS.forEach(([dow, name]) => {
      html += '<tr><th scope="row">' + name + '</th>';
      for (let h = 0; h < 24; h++) {
        const v = grid[dow][h];
        html += '<td' + (v ? ' style="--v:' + (v / max).toFixed(3) + '"' : ' class="empty"') + ' title="' + WEEKDAY_NAMES[dow] + ' ' + hourLabel(h) + ': ' + analyticsNumber(v) + ' visits"><span class="visually-hidden">' + v + '</span></td>';
      }
      html += '</tr>';
    });
    return html + '</tbody></table></div>';
  }

  function timingInsight(rows) {
    const total = rows.reduce((sum, r) => sum + r.sessions, 0);
    if (!total) return '';
    const byHour = Array(24).fill(0), byDay = Array(7).fill(0);
    rows.forEach(r => { byHour[r.hour] += r.sessions; byDay[r.dow] += r.sessions; });
    let best = 0;
    for (let h = 0; h <= 21; h++) if (byHour[h] + byHour[h + 1] + byHour[h + 2] > byHour[best] + byHour[best + 1] + byHour[best + 2]) best = h;
    const share = (byHour[best] + byHour[best + 1] + byHour[best + 2]) / total;
    const topDay = byDay.indexOf(Math.max(...byDay));
    return '<strong>' + (share * 100).toFixed(0) + '%</strong> of visits happen between ' + hourLabel(best) + ' and ' + hourLabel((best + 3) % 24) + ' ET. Busiest day: <strong>' + WEEKDAY_NAMES[topDay] + '</strong>.';
  }

  function engagementHtml(data) {
    const buckets = [['Background only',[0]],['1 visit',[1]],['2 visits',[2]],['3–4 visits',[3,4]],['5–9 visits',[5,6,7,8,9]],['10+ visits',[10]]];
    const rows = buckets.map(([label, visits]) => {
      const installs = data.engagement.filter(r => visits.includes(r.visits)).reduce((sum, r) => sum + r.installs, 0);
      return {label, value: installs, display: analyticsPercent(installs, data.active_period, 0) + ' · ' + analyticsNumber(installs)};
    }).filter((row, i) => i > 0 || row.value > 0);
    return shareBarsHtml(rows, 'Active installs by number of app visits');
  }

  function featureRows(data) {
    const feature = event => (data.features || []).find(row => row.event === event) || {opens:0, installations:0, repeat_installations:0};
    return [['passport_open','Campus ID','Pass display opens'],['event_open','Recreation events','Event-detail opens'],['settings_open','Settings','Settings screen opens']].map(([event, label, detail]) => ({event, label, detail, ...feature(event)}));
  }

  function renderOverviewDetails(data) {
    const answered = Math.max(0, Number(data.siri_actions) - Number(data.siri_unavailable));
    const features = featureRows(data);
    const siriActions = [['siri_crowds','Crowds & gym choice'],['siri_events','Find events'],['siri_event_details','Event details']];
    const featureShare = shareBarsHtml(features.map(f => ({label: f.label, value: Number(f.installations), display: analyticsPercent(Number(f.installations), data.active_period, 0)})).concat([{label:'Siri', value:Number(data.siri_users), display: analyticsPercent(Number(data.siri_users), data.active_period, 0)}]), 'Share of active installs using each feature');
    let html = '<section class="analytics-card trend-card"><div class="analytics-card-header"><div><h2>Trend</h2><p class="analytics-note">Daily totals · Eastern Time</p></div><label><span class="visually-hidden">Chart metric</span><select id="chartMetric">' + Object.entries(OVERVIEW_SERIES).map(([key, spec]) => '<option value="' + key + '">' + spec.label + '</option>').join('') + '</select></label></div><div id="activityChart" class="chart-host"></div><p class="analytics-note" id="activityInsight"></p></section>';
    html += '<div class="analytics-grid"><section class="analytics-card"><div class="analytics-card-header"><div><h2>When people open the app</h2><p class="analytics-note">App visits by weekday and hour · Eastern Time</p></div></div>' + heatmapHtml(data.hourly) + '<p class="analytics-note insight">' + timingInsight(data.hourly) + '</p></section>';
    html += '<section class="analytics-card"><div class="analytics-card-header"><div><h2>Visit frequency</h2><p class="analytics-note">Active installs by app visits this period</p></div></div>' + engagementHtml(data) + '<p class="analytics-note insight">Background-only installs used Siri or widgets without opening the app.</p></section></div>';
    html += '<section class="analytics-card feature-usage"><div class="analytics-card-header"><div><h2>Feature usage</h2><p class="analytics-note">Share of active installs that used each feature</p></div></div><div class="feature-layout">' + featureShare + '<div class="analytics-table-wrap"><table class="analytics-table"><thead><tr><th scope="col">Feature</th><th scope="col">Opens</th><th scope="col">Installs</th><th scope="col">Repeat use</th><th scope="col">Opens per install</th></tr></thead><tbody>' + features.map(f => '<tr data-feature="' + f.event + '"><th scope="row">' + f.label + '<span class="metric-help">' + f.detail + '</span></th><td>' + analyticsNumber(f.opens) + '</td><td>' + analyticsNumber(f.installations) + '</td><td>' + analyticsNumber(f.repeat_installations) + '</td><td>' + (Number(f.installations) ? (Number(f.opens) / Number(f.installations)).toFixed(1) : '—') + '</td></tr>').join('') + '</tbody></table></div></div><p class="analytics-note" style="margin-top:14px">Repeat use counts installs with at least two opens. Shares use all active installs and overlap, so they do not add to 100%.</p></section>';
    html += '<div class="analytics-grid"><section class="analytics-card"><div class="analytics-card-header"><div><h2>Siri requests answered</h2><p class="analytics-note">' + analyticsNumber(answered) + ' of ' + analyticsNumber(data.siri_actions) + ' returned live or cached data</p></div></div><div class="analytics-table-wrap"><table class="analytics-table"><thead><tr><th scope="col">Action</th><th scope="col">Requests</th><th scope="col">Answered</th></tr></thead><tbody>' + siriActions.map(([event, label]) => {
      const rows = (data.siri || []).filter(row => row.event === event);
      const requests = rows.reduce((sum, row) => sum + Number(row.count), 0);
      const ok = rows.filter(row => ['live','cached'].includes(row.status)).reduce((sum, row) => sum + Number(row.count), 0);
      return '<tr><th scope="row">' + label + '</th><td>' + analyticsNumber(requests) + '</td><td>' + analyticsNumber(ok) + '</td></tr>';
    }).join('') + '</tbody></table></div><p class="analytics-note" style="margin-top:14px">Only actions that reached the app are recorded; phrases Siri did not match are missing.</p></section>';
    html += '<section class="analytics-card"><div class="analytics-card-header"><div><h2>Platform</h2><p class="analytics-note">Each install counted once, on its latest version</p></div></div><h3 class="subhead">App version</h3>' + shareBarsHtml((data.versions || []).slice(0, 5).map(v => ({label: escapeHtml(v.app_version) + ' (' + escapeHtml(v.build) + ')', value: v.installs, display: analyticsPercent(v.installs, data.active_period, 0)})), 'Installs by app version') + '<h3 class="subhead">iOS</h3>' + shareBarsHtml((data.os || []).slice(0, 5).map(v => ({label: v.name, value: v.installs, display: analyticsPercent(v.installs, data.active_period, 0)})), 'Installs by iOS version') + '</section></div>';
    html += '<p class="analytics-footer">Active installs include background Siri use; visits count foreground use only. Collection is best effort, and missing data does not establish zero usage.</p>';
    const host = document.getElementById('dailyMetrics');
    host.innerHTML = html;
    document.getElementById('chartMetric').value = chartMetric;
    document.getElementById('chartMetric').addEventListener('change', event => setChartMetric(event.target.value));
  }

  registerView('overview', {
    onLoading() { document.getElementById('appMetrics').hidden = true; document.getElementById('dailyMetrics').hidden = true; },
    onData(data) {
      renderKpis(data);
      renderOverviewDetails(data);
      document.getElementById('appMetrics').hidden = false;
      document.getElementById('dailyMetrics').hidden = false;
    },
    onShow() { requestAnimationFrame(renderActivityChart); },
    onResize() { renderActivityChart(); },
  });
`;
