/**
 * Dashboard runtime shared by every workspace: preferences, view registry, formatting, and data loading.
 * Client code is plain browser JavaScript in String.raw; avoid backticks and template interpolation.
 */
export const CORE_SCRIPT = String.raw`
  var __name = function (target) { return target; }; // esbuild keepNames helper used by shared renderers
  const REPORT_TIME_ZONE = 'America/New_York';
  const dashboardStorageKey = 'gymtracker.dashboard.v1';
  const dashboardPrefs = (() => { try { const value = JSON.parse(localStorage.getItem(dashboardStorageKey) || '{}'); return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; } catch { return {}; } })();
  function saveDashboardPrefs(patch) { Object.assign(dashboardPrefs, patch); try { localStorage.setItem(dashboardStorageKey, JSON.stringify(dashboardPrefs)); } catch {} }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  const analyticsNumber = value => (Number(value) || 0).toLocaleString('en-US');
  const analyticsPercent = (part, whole, digits = 1) => whole ? (part / whole * 100).toFixed(digits) + '%' : '—';
  const formatLocalDay = (key, options) => new Date(key + 'T12:00:00Z').toLocaleDateString('en-US', Object.assign({month:'short', day:'numeric', timeZone:'UTC'}, options || {}));
  const formatLocalTime = value => new Date(value).toLocaleString('en-US', {month:'short', day:'numeric', hour:'numeric', minute:'2-digit', timeZone:REPORT_TIME_ZONE});
  const hourLabel = hour => (hour % 12 || 12) + (hour < 12 ? ' AM' : ' PM');
  function relativeTime(value) {
    const ms = Date.now() - new Date(value).getTime();
    if (!Number.isFinite(ms)) return 'Unavailable';
    if (ms < 90000) return 'just now';
    if (ms < 5400000) return Math.round(ms / 60000) + ' min ago';
    if (ms < 129600000) return Math.round(ms / 3600000) + ' hr ago';
    return Math.round(ms / 86400000) + ' days ago';
  }
  /** Change versus the comparison window. Returns markup for a small chip. */
  function deltaChip(current, previous, periodDays) {
    if (previous == null) return '<span class="delta neutral" title="Comparison needs ' + periodDays * 2 + ' days of recorded history">No prior period yet</span>';
    const title = ' title="' + analyticsNumber(previous) + ' in the previous ' + periodDays + ' days"';
    if (!previous) return current ? '<span class="delta up"' + title + '>New</span>' : '<span class="delta neutral"' + title + '>No change</span>';
    const change = (current - previous) / previous * 100;
    if (Math.abs(change) < 0.5) return '<span class="delta neutral"' + title + '>No change</span>';
    return '<span class="delta ' + (change > 0 ? 'up' : 'down') + '"' + title + '>' + (change > 0 ? '▲ ' : '▼ ') + Math.abs(change).toFixed(change < 10 && change > -10 ? 1 : 0) + '%</span>';
  }
  function sparklineSvg(values) {
    if (!values.length) return '';
    const max = Math.max(1, ...values), w = 96, h = 24, step = values.length > 1 ? w / (values.length - 1) : 0;
    const points = values.map((v, i) => (i * step).toFixed(1) + ',' + (h - 2 - v / max * (h - 4)).toFixed(1)).join(' ');
    return '<svg class="sparkline" viewBox="0 0 ' + w + ' ' + h + '" aria-hidden="true"><polyline points="' + points + '"/></svg>';
  }

  let dashboardReady = false;
  let restoringScroll = false;
  function restoreDashboardScroll() {
    dashboardReady = true;
    requestAnimationFrame(() => { restoringScroll = true; document.getElementById('dashboardContent').scrollTop = Number(dashboardPrefs.scroll) || 0; requestAnimationFrame(() => { restoringScroll = false; }); });
  }

  // View registry: each workspace registers handlers; showDashboardView only toggles panels and dispatches.
  const viewHandlers = {};
  function registerView(id, handlers) { viewHandlers[id] = handlers; }
  function currentView() { return document.querySelector('[data-view][aria-selected=true]')?.dataset.view || 'overview'; }
  function showDashboardView(view, restoring = false) {
    if (!DASHBOARD_VIEWS.some(v => v.id === view)) view = 'overview';
    if (!restoring) saveDashboardPrefs({view, scroll:0});
    document.getElementById('dashboardContent').scrollTop = 0;
    DASHBOARD_VIEWS.forEach(v => { document.getElementById(v.id + 'Panel').hidden = v.id !== view; });
    document.querySelectorAll('[data-view]').forEach(btn => { const active = btn.dataset.view === view; btn.setAttribute('aria-selected', String(active)); btn.tabIndex = active ? 0 : -1; });
    viewHandlers[view]?.onShow?.();
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

  // Global filters apply to every workspace and to exported reports.
  const periodSelect = document.getElementById('analyticsPeriod');
  const internalToggle = document.getElementById('excludeInternal');
  if (['7','30','90','180','365'].includes(dashboardPrefs.period)) periodSelect.value = dashboardPrefs.period;
  internalToggle.checked = dashboardPrefs.excludeInternal !== false;
  function analyticsParams(extra) {
    const params = new URLSearchParams(Object.assign({days: periodSelect.value}, extra || {}));
    if (!internalToggle.checked) params.set('internal', 'include');
    return params;
  }
  function periodDays() { return Number(periodSelect.value) || 7; }

  let analyticsSnapshot = null;
  let statsRequest = 0;
  async function loadAnalyticsStats() {
    const currentRequest = ++statsRequest;
    const status = document.getElementById('metricsStatus');
    if (dashboardReady) saveDashboardPrefs({scroll:document.getElementById('dashboardContent').scrollTop});
    dashboardReady = false;
    analyticsSnapshot = null;
    Object.values(viewHandlers).forEach(h => h.onLoading?.());
    status.textContent = 'Loading analytics…';
    try {
      const res = await fetchWithRetry('/api/admin/stats?' + analyticsParams(), { credentials: 'include' });
      if (res.status === 401) { show401Banner(); throw new Error('Sign in to view analytics.'); }
      if (!res.ok) throw new Error('Analytics unavailable. Refresh to try again.');
      const data = await res.json();
      if (currentRequest !== statsRequest) return;
      if (!data.configured) throw new Error('Analytics reporting is not configured yet.');
      analyticsSnapshot = data;
      const excluded = data.audience?.internal_excluded && data.audience.internal_installations;
      document.getElementById('internalCount').textContent = data.audience?.internal_installations ? '(' + data.audience.internal_installations + ')' : '';
      status.textContent = (Number(data.active_period) ? 'Updated ' + new Date().toLocaleTimeString([], {hour:'numeric',minute:'2-digit'}) : 'Waiting for recorded activity') + ' · Eastern Time' + (excluded ? ' · internal installs excluded' : '');
      Object.values(viewHandlers).forEach(h => h.onData?.(data));
      viewHandlers[currentView()]?.onShow?.();
      if (currentView() !== 'events') restoreDashboardScroll();
    } catch (error) {
      if (currentRequest !== statsRequest) return;
      analyticsSnapshot = null;
      Object.values(viewHandlers).forEach(h => h.onError?.(error));
      status.textContent = error.message || 'Analytics unavailable.';
      restoreDashboardScroll();
    }
  }
  periodSelect.addEventListener('change', () => { saveDashboardPrefs({period: periodSelect.value}); loadAnalyticsStats(); });
  internalToggle.addEventListener('change', () => { saveDashboardPrefs({excludeInternal: internalToggle.checked}); loadAnalyticsStats(); });

  let scrollSaveTimer;
  document.getElementById('dashboardContent').addEventListener('scroll', event => {
    if (!dashboardReady || restoringScroll) return;
    clearTimeout(scrollSaveTimer);
    scrollSaveTimer = setTimeout(() => saveDashboardPrefs({scroll:event.target.scrollTop}), 150);
  });
  window.addEventListener('pagehide', () => { if (dashboardReady && !restoringScroll) saveDashboardPrefs({scroll:document.getElementById('dashboardContent').scrollTop}); });
  let resizeTimer;
  window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => viewHandlers[currentView()]?.onResize?.(), 80); });
`;

/** Runs after every workspace module has registered. */
export const START_SCRIPT = String.raw`
  showDashboardView(dashboardPrefs.view || 'overview', true);
`;
