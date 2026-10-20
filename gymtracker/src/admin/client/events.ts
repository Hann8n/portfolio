import { EVENT_CATALOG } from "../../analytics/catalog";

/** Events workspace: aggregated readout of every tracked event, grouped by category, with CSV export. */
export const EVENTS_SCRIPT = `const EVENT_CATALOG = ${JSON.stringify(EVENT_CATALOG)};` + String.raw`
  let trackedEvents = [];
  let trackedEventsPeriod = null;
  let eventRequest = 0;
  const eventGroups = [{key:'product', label:'Product usage'}, {key:'ads', label:'Advertising'}, {key:'siri', label:'Siri'}];
  const trackedEventCategory = event => EVENT_CATALOG[event]?.category || 'product';
  async function loadTrackedEvents() {
    const currentRequest = ++eventRequest;
    const status = document.getElementById('eventsStatus');
    status.textContent = 'Loading events…';
    document.getElementById('eventReadout').setAttribute('aria-busy', 'true');
    document.getElementById('exportEvents').disabled = true;
    try {
      const campaign = document.getElementById('eventCampaign').value;
      const res = await fetch('/api/admin/events?' + analyticsParams(campaign ? {campaign} : {}), {credentials:'include'});
      if (!res.ok) throw new Error('Events unavailable. Refresh to try again.');
      const data = await res.json();
      if (currentRequest !== eventRequest) return;
      trackedEvents = Array.isArray(data.events) ? data.events : [];
      trackedEventsPeriod = data.period || null;
      status.textContent = 'Last ' + data.days + ' days · Eastern Time · ' + (data.internal_excluded ? 'internal installs excluded' : 'all installs');
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
        const date = validDate ? recorded.toLocaleDateString('en-US', {month:'short',day:'numeric',year:'numeric',timeZone:REPORT_TIME_ZONE}) : 'Unavailable';
        const time = validDate ? recorded.toLocaleTimeString('en-US', {hour:'numeric',minute:'2-digit',timeZone:REPORT_TIME_ZONE,timeZoneName:'short'}) : '';
        const info = EVENT_CATALOG[row.event] || {label: row.event, description: 'Recorded app interaction'};
        return '<tr class="event-row" role="row"><th scope="row" role="rowheader">' + escapeHtml(info.label.replace(/^Siri · /, '')) + '<span class="event-description">' + escapeHtml(info.description) + '</span></th><td role="cell"><span class="event-mobile-label" aria-hidden="true">Times recorded</span><span class="event-number">' + analyticsNumber(row.occurrences) + '</span></td><td role="cell"><span class="event-mobile-label" aria-hidden="true">Unique app installs</span><span class="event-number">' + analyticsNumber(row.installations) + '</span></td><td class="event-last" role="cell"><span class="event-mobile-label" aria-hidden="true">Last recorded</span>' + escapeHtml(date) + '<span class="event-time">' + escapeHtml(time) + '</span></td></tr>';
      }).join('') + '</tbody>';
    }).join('');
    document.getElementById('eventReadout').innerHTML = rows.length ? '<table class="analytics-table event-table" role="table"><caption class="visually-hidden">Tracked activity by event, grouped by category</caption><colgroup><col><col><col><col></colgroup><thead role="rowgroup"><tr role="row"><th scope="col" role="columnheader">Event</th><th scope="col" role="columnheader">Times recorded</th><th scope="col" role="columnheader">App installs<span class="event-time">Unique</span></th><th scope="col" role="columnheader">Last recorded<span class="event-time">Eastern Time</span></th></tr></thead>' + groups + '</table>' : '<p class="analytics-empty">No events recorded for these filters yet.</p>';
    document.getElementById('exportEvents').disabled = !rows.length || document.getElementById('eventReadout').getAttribute('aria-busy') === 'true';
  }
  document.getElementById('eventCategory').addEventListener('change', event => { saveDashboardPrefs({eventCategory:event.target.value}); renderTrackedEvents(); });
  document.getElementById('eventCampaign').addEventListener('change', event => { saveDashboardPrefs({eventCampaign:event.target.value}); loadTrackedEvents(); });
  document.getElementById('exportEvents').addEventListener('click', () => {
    const csvCell = value => '"' + String(value ?? '').replace(/"/g, '""') + '"';
    const period = trackedEventsPeriod ? [trackedEventsPeriod.from, trackedEventsPeriod.before] : ['', ''];
    const lines = [['Event','Label','Category','Times recorded','Unique app installs','Unique sessions','Last recorded (UTC)','Period start (UTC)','Period end (UTC)','Internal installs excluded'], ...filteredTrackedEvents().map(r => [r.event, EVENT_CATALOG[r.event]?.label || r.event, trackedEventCategory(r.event), r.occurrences, r.installations, r.sessions, r.last_received, period[0], period[1], internalToggle.checked ? 'yes' : 'no'])];
    const blob = new Blob([lines.map(r => r.map(csvCell).join(',')).join('\r\n')], {type:'text/csv;charset=utf-8'});
    const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'gymtracker-events-' + periodSelect.value + 'd.csv'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  if (['all','ads','product','siri'].includes(dashboardPrefs.eventCategory)) document.getElementById('eventCategory').value = dashboardPrefs.eventCategory;
  registerView('events', {
    onData(data) {
      const ads = typeof scheduledAds === 'undefined' ? [] : scheduledAds;
      const selected = typeof dashboardPrefs.eventCampaign === 'string' ? dashboardPrefs.eventCampaign : document.getElementById('eventCampaign').value;
      document.getElementById('eventCampaign').innerHTML = '<option value="">All campaigns & product events</option>' + ads.map(a => '<option value="' + escapeHtml(a.id) + '">' + escapeHtml(a.sponsor + ' · ' + a.id) + '</option>').join('');
      document.getElementById('eventCampaign').value = ads.some(ad => ad.id === selected) ? selected : '';
    },
    onShow() { if (analyticsSnapshot) loadTrackedEvents(); },
  });
`;
