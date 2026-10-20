/** Campaigns workspace (top): selected campaign's creative beside delivery, pacing, and the sponsor report export. */
export const CAMPAIGN_REPORTING_SCRIPT = String.raw`
  let reportingCampaignId = typeof dashboardPrefs.campaign === 'string' ? dashboardPrefs.campaign : '';
  let campaignDetailRequest = 0;
  function metricTiles(items) {
    return '<div class="overview-kpis">' + items.map(([label,value,help]) => '<div class="overview-kpi"><span class="overview-kpi-label">' + label + '</span><strong class="overview-kpi-value">' + value + '</strong><span class="metric-help">' + help + '</span></div>').join('') + '</div>';
  }
  function renderCampaignReporting(ads) {
    const host = document.getElementById('campaignReporting');
    if (!host) return;
    if (!ads.length) { host.innerHTML = '<section class="analytics-card campaign-workspace"><h2>Campaign reporting</h2><p class="analytics-note">Create a campaign below to see its creative, delivery, and sponsor report here.</p></section>'; return; }
    const ad = ads.find(a => a.id === reportingCampaignId) || ads.find(a => adStatus(a) === 'live') || ads[0];
    reportingCampaignId = ad.id;
    saveDashboardPrefs({campaign:ad.id});
    host.innerHTML = '<section class="analytics-card campaign-workspace"><div class="analytics-card-header"><div><h2>Campaign performance</h2></div><label><span class="visually-hidden">Select campaign</span><select id="creativeCampaign">' + ads.map(a => '<option value="' + escapeHtml(a.id) + '">' + escapeHtml(a.sponsor + ' · ' + a.id + ' · ' + adStatus(a)) + '</option>').join('') + '</select></label></div><div class="campaign-context"><div><div id="dashboardAdPreview">' + renderAdPreview(ad) + '</div><p class="analytics-note" style="margin-top:10px">Current saved creative</p></div><div id="campaignContextDetails"></div></div></section>';
    document.getElementById('creativeCampaign').value = ad.id;
    document.getElementById('creativeCampaign').addEventListener('change', event => { reportingCampaignId = event.target.value; saveDashboardPrefs({campaign:reportingCampaignId}); updateCampaignContext(ads.find(a => a.id === reportingCampaignId)); });
    updateCampaignContext(ad);
  }
  function updateCampaignContext(ad) {
    if (!ad) return;
    document.getElementById('dashboardAdPreview').innerHTML = renderAdPreview(ad);
    const data = analyticsSnapshot;
    const stats = data?.per_ad?.find(row => row.ad_id === ad.id) || {};
    const views = Number(stats.impressions) || 0, taps = Number(stats.clicks) || 0, reach = Number(stats.reach) || 0;
    const days = periodSelect.value;
    let html = '<p class="analytics-note" style="margin-bottom:14px">Performance · last ' + days + ' days' + (internalToggle.checked ? ' · internal installs excluded' : '') + '</p>';
    html += data ? metricTiles([
      ['Ad views',analyticsNumber(views),'Half the ad visible for a second.'],
      ['Unique reach',analyticsNumber(reach),'App installs with a view · ' + (reach ? (views / reach).toFixed(2) + ' views each' : 'no views yet') + '.'],
      ['Link taps',analyticsNumber(taps),'Link button interactions.'],
      ['Tap rate',analyticsPercent(taps,views,2),analyticsNumber(taps) + (taps === 1 ? ' tap ÷ ' : ' taps ÷ ') + analyticsNumber(views) + ' views × 100.']
    ]) : '<p class="analytics-note" style="margin-bottom:18px">Metrics are not available. The saved creative and settings are shown below.</p>';
    html += '<div id="campaignDelivery" class="campaign-delivery" aria-live="polite"></div>';
    const date = value => value ? new Date(value).toLocaleString('en-US', {month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit',timeZone:REPORT_TIME_ZONE,timeZoneName:'short'}) : 'Not set';
    const facts = [
      ['Status',adStatus(ad)],['Starts',date(ad.start_at)],['Ends',date(ad.end_at)],
      ['Ad format',ad.tier || 'banner'],['Creative version',ad.creative_version || 'Not set'],
      ['Campaign ID',ad.id],['Link destination',ad.destination_url]
    ];
    html += '<dl class="campaign-facts">' + facts.map(([label,value]) => '<div' + (label === 'Link destination' ? ' class="wide"' : '') + '><dt>' + label + '</dt><dd>' + escapeHtml(value || 'Not set') + '</dd></div>').join('') + '</dl>';
    const reportParams = new URLSearchParams({id: ad.id, days});
    if (!internalToggle.checked) reportParams.set('internal', 'include');
    html += '<div class="campaign-detail-actions"><button type="button" id="editReportingCampaign">Edit campaign</button><a id="dashboardCampaignExport" target="_blank" rel="noopener" href="/api/admin/campaign-report?' + reportParams + '">Open sponsor report ↗</a><a target="_blank" rel="noopener" href="/api/admin/campaign-report?' + new URLSearchParams(Object.assign(Object.fromEntries(reportParams), {days:'campaign'})) + '">Full flight ↗</a></div><p class="analytics-note" style="margin-top:12px">Link taps do not confirm website visits or sales. The report includes the current saved creative; earlier versions may differ.</p>';
    document.getElementById('campaignContextDetails').innerHTML = html;
    document.getElementById('editReportingCampaign').addEventListener('click', () => { const index = scheduledAds.findIndex(a => a.id === ad.id); if (index >= 0) { selectAd(index); openFormOverlay('Edit: ' + (ad.sponsor || ad.id)); } });
    if (data && views) loadCampaignDelivery(ad, reportParams);
  }
  async function loadCampaignDelivery(ad, params) {
    const request = ++campaignDetailRequest;
    const host = document.getElementById('campaignDelivery');
    try {
      const res = await fetch('/api/admin/campaign-report?' + params + '&format=json', {credentials:'include'});
      if (!res.ok || request !== campaignDetailRequest) return;
      const report = await res.json();
      const daily = report.daily || [];
      let html = '';
      if (daily.length > 1) html += '<h3 class="subhead">Daily views · ET</h3><div class="chart-host">' + barChartSvg(daily.map(d => ({label: formatLocalDay(d.date), value: d.impressions, title: formatLocalDay(d.date, {weekday:'short'}) + ': ' + analyticsNumber(d.impressions) + ' views, ' + analyticsNumber(d.clicks) + ' taps'})), {ariaLabel: 'Daily ad views', width: Math.max(280, document.getElementById('campaignContextDetails').clientWidth), height: 160, valueLabels: daily.length <= 10}) + '</div>';
      if (report.reach && report.frequency?.length) html += '<h3 class="subhead">Views per reached install</h3>' + shareBarsHtml([1,2,3,4,5].map(v => { const installs = report.frequency.find(r => r.views === v)?.installs || 0; return {label: v === 5 ? '5+' : String(v), value: installs, display: analyticsPercent(installs, report.reach, 0)}; }), 'Reached installs by number of views');
      if (report.excluded?.installations) html += '<p class="analytics-note">Excludes ' + analyticsNumber(report.excluded.impressions) + ' views and ' + analyticsNumber(report.excluded.clicks) + ' taps from ' + analyticsNumber(report.excluded.installations) + ' internal install' + (report.excluded.installations === 1 ? '' : 's') + '.</p>';
      host.innerHTML = html;
    } catch {}
  }
  registerView('campaigns', {
    onLoading() { renderCampaignReporting(typeof scheduledAds === 'undefined' ? [] : scheduledAds); },
    onData() { renderCampaignReporting(scheduledAds); },
    onError() { renderCampaignReporting(scheduledAds); },
  });
`;
