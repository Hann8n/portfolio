/** Data quality workspace: collection coverage and the internal-install list that keeps test devices out of reports. */
export const DATA_QUALITY_SCRIPT = String.raw`
  let audienceRequest = 0;
  async function loadAudienceReview() {
    const request = ++audienceRequest;
    const host = document.getElementById('dataQuality');
    host.setAttribute('aria-busy', 'true');
    try {
      const res = await fetch('/api/admin/audience', {credentials:'include'});
      if (!res.ok) throw new Error('Data quality details are unavailable.');
      const data = await res.json();
      if (request !== audienceRequest) return;
      renderAudienceReview(data);
    } catch (error) { host.innerHTML = '<p class="analytics-empty">' + escapeHtml(error.message) + '</p>'; }
    finally { host.setAttribute('aria-busy', 'false'); }
  }
  function shortId(id) { return String(id).slice(0, 8); }
  function renderAudienceReview(data) {
    const c = data.coverage || {};
    let html = '<div class="overview-kpis">' + [
      ['Collecting since', c.since ? formatLocalTime(c.since) : '—', 'First recorded event (ET).'],
      ['Latest event', c.latest ? relativeTime(c.latest) : '—', c.latest ? formatLocalTime(c.latest) + ' ET' : 'Nothing recorded yet.'],
      ['Events · 24 hours', analyticsNumber(c.events_24h), analyticsNumber(c.events) + ' retained in total.'],
      ['Internal installs', analyticsNumber(data.internal.length), data.internal_excluded ? 'Excluded from dashboards and reports.' : 'Currently included.'],
    ].map(([label, value, help]) => '<div class="overview-kpi"><span class="overview-kpi-label">' + label + '</span><strong class="overview-kpi-value">' + escapeHtml(value) + '</strong><span class="metric-help">' + escapeHtml(help) + '</span></div>').join('') + '</div>';
    html += '<section class="analytics-card"><div class="analytics-card-header"><div><h2>Internal installs</h2><p class="analytics-note">Developer, TestFlight, and demo devices. Their raw events are kept, but every dashboard figure and sponsor report excludes them unless “Exclude internal installs” is turned off.</p></div></div>';
    html += data.internal.length ? '<div class="analytics-table-wrap"><table class="analytics-table audience-table"><thead><tr><th scope="col">Install</th><th scope="col">Events</th><th scope="col">Visits</th><th scope="col">Last seen</th><th scope="col"><span class="visually-hidden">Action</span></th></tr></thead><tbody>' + data.internal.map(row => '<tr><th scope="row">' + escapeHtml(row.label || 'Internal install') + '<span class="secondary" title="' + escapeHtml(row.id) + '">' + escapeHtml(shortId(row.id)) + '</span></th><td>' + analyticsNumber(row.events) + '</td><td>' + analyticsNumber(row.sessions) + '</td><td>' + (row.last_seen ? escapeHtml(relativeTime(row.last_seen)) : '—') + '</td><td><button type="button" data-include="' + escapeHtml(row.id) + '">Include again</button></td></tr>').join('') + '</tbody></table></div>' : '<p class="analytics-empty">No installs are marked internal yet. Review the suggestions below.</p>';
    html += '</section><section class="analytics-card"><div class="analytics-card-header"><div><h2>Suggested internal installs</h2><p class="analytics-note">Last 30 days, ranked by test-device signals. Signals are hints; confirm before excluding.</p></div></div>';
    html += data.candidates.length ? '<div class="analytics-table-wrap"><table class="analytics-table audience-table"><thead><tr><th scope="col">Install</th><th scope="col">Signals</th><th scope="col">Events</th><th scope="col">Visits</th><th scope="col">Builds</th><th scope="col"><span class="visually-hidden">Action</span></th></tr></thead><tbody>' + data.candidates.map(row => '<tr><th scope="row"><span title="' + escapeHtml(row.installation_id) + '">' + escapeHtml(shortId(row.installation_id)) + '</span><span class="secondary">' + escapeHtml(String(row.os_version || '').replace(/^Version /, 'iOS ')) + '</span></th><td class="signals">' + row.flags.map(f => '<span class="signal">' + escapeHtml(f) + '</span>').join('') + '</td><td>' + analyticsNumber(row.events) + '</td><td>' + analyticsNumber(row.sessions) + '</td><td>' + escapeHtml(row.build_list || '') + '</td><td><button type="button" class="primary" data-exclude="' + escapeHtml(row.installation_id) + '">Mark internal</button></td></tr>').join('') + '</tbody></table></div>' : '<p class="analytics-empty">No installs show test-device signals in the last 30 days.</p>';
    html += '</section>';
    const host = document.getElementById('dataQuality');
    host.innerHTML = html;
    host.querySelectorAll('[data-exclude]').forEach(btn => btn.addEventListener('click', () => {
      const label = prompt('Label for this install (e.g. “Developer iPhone · TestFlight”)', 'Internal device');
      if (label !== null) updateInternalInstall(btn.dataset.exclude, label, true, btn);
    }));
    host.querySelectorAll('[data-include]').forEach(btn => btn.addEventListener('click', () => updateInternalInstall(btn.dataset.include, '', false, btn)));
  }
  async function updateInternalInstall(id, label, internal, button) {
    button.disabled = true;
    try {
      const res = await fetch('/api/admin/audience', {method:'PUT', credentials:'include', headers:{'Content-Type':'application/json'}, body: JSON.stringify({id, label, internal})});
      if (res.status === 401) { show401Banner(); return; }
      if (!res.ok) throw new Error();
      await loadAudienceReview();
      loadAnalyticsStats();
    } catch { button.disabled = false; alert('Could not save. Check your connection and try again.'); }
  }
  registerView('data', { onShow: loadAudienceReview });
`;
