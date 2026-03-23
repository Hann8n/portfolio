/** Admin UI HTML — served at /admin, uses Cloudflare Access for auth. */
export const ADMIN_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Gym Tracker Ads Admin</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr@4.6.13/dist/flatpickr.min.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr@4.6.13/dist/themes/dark.css">
  <style>@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=JetBrains+Mono:wght@400;500&display=swap');</style>
</head>
<body>
  <div class="dashboard-wrap">
  <div class="topbar">
    <a href="https://jackhannon.net/" class="topbar-home" title="Back to jackhannon.net">← jackhannon.net</a>
    <div class="topbar-center">
      <span class="topbar-title">Gym Tracker</span>
      <span class="topbar-sep">/</span>
      <span class="topbar-sub">ads admin</span>
    </div>
    <div class="topbar-right">
      <button type="button" id="refreshBtn" class="topbar-refresh" title="Refresh">↻</button>
      <div class="status">
        <div class="dot" id="statusDot"></div>
        <span class="status-text" id="fetchStatus">—</span>
      </div>
    </div>
  </div>
  <div class="main">
    <div class="schedule-page">
      <div class="schedule-grid">
        <div class="schedule-ads">
          <div class="main-toolbar" id="mainToolbar">
            <input type="text" id="adsSearch" placeholder="Search sponsor or ID" class="toolbar-search">
            <div class="toolbar-filters">
              <button type="button" class="status-filter active" data-filter="all">All</button>
              <button type="button" class="status-filter" data-filter="live">Live</button>
              <button type="button" class="status-filter" data-filter="scheduled">Scheduled</button>
              <button type="button" class="status-filter" data-filter="paused">Paused</button>
              <button type="button" class="status-filter" data-filter="ended">Ended</button>
            </div>
          </div>
          <div class="group-label" id="adsHeader">Ads</div>
          <div id="adCards" class="ad-cards"></div>
        </div>
        <div class="schedule-calendar">
          <div id="calendarEmpty" class="calendar-empty" hidden>
            <p class="calendar-empty-text">Use New ad to create one</p>
          </div>
          <div id="calendarWrap" class="calendar-wrap" hidden>
            <div class="calendar-header">
              <button type="button" id="calPrev" class="cal-nav" title="Previous month">◀</button>
              <h3 class="cal-month-label" id="calMonthLabel"></h3>
              <button type="button" id="calNext" class="cal-nav" title="Next month">▶</button>
              <button type="button" id="calToday" class="cal-nav cal-today" title="Go to today">Today</button>
            </div>
            <div class="calendar-grid">
              <div class="cal-weekdays">
                <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
              </div>
              <div id="calDays" class="cal-days"></div>
            </div>
            <div class="cal-legend">
              <span class="cal-legend-item"><span class="cal-legend-dot live"></span> live</span>
              <span class="cal-legend-item"><span class="cal-legend-dot scheduled"></span> scheduled</span>
              <span class="cal-legend-item"><span class="cal-legend-dot ended"></span> ended</span>
              <span class="cal-legend-item"><span class="cal-legend-dot paused"></span> paused</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  </div>

  <div id="formOverlay" class="form-overlay" hidden aria-modal="true" role="dialog" aria-labelledby="formOverlayTitle">
    <div class="form-overlay-backdrop"></div>
    <div class="form-overlay-panel">
      <header class="form-overlay-header">
        <h2 id="formOverlayTitle">New ad</h2>
        <div class="active-inactive-toggle active-inactive-header">
          <input type="hidden" id="active" name="active" form="adForm" value="true">
          <button type="button" class="active-inactive-btn active" id="activeBtn" data-value="true">Active</button>
          <button type="button" class="active-inactive-btn" id="inactiveBtn" data-value="false">Inactive</button>
        </div>
        <button type="button" id="formOverlayClose" aria-label="Close">×</button>
      </header>
      <div class="form-overlay-body">
        <div class="admin-editor-grid">
          <form id="adForm" class="admin-form">
            <div class="group">
              <div class="id-version-row">
                <input type="text" id="id" name="id" required placeholder="ID (e.g. sponsor-2025-q1)">
                <input type="text" id="creative_version" name="creative_version" placeholder="v1" class="version-input">
              </div>
              <span class="field-error" id="err-id"></span>
            </div>
            <div class="group schedule-group">
              <div class="group-label">Schedule</div>
              <div class="field-label">Start at (optional)</div>
              <input type="text" id="start_at" name="start_at" placeholder="Pick date & time" readonly>
              <div id="endAtWrap" class="end-at-wrap" hidden>
                <div class="field-label">End at (optional)</div>
                <input type="text" id="end_at" name="end_at" placeholder="Pick date & time" readonly>
              </div>
              <div class="date-presets">
                <button type="button" data-preset="today">Today</button>
                <button type="button" data-preset="week">This week</button>
                <button type="button" data-preset="7d">Next 7 days</button>
                <button type="button" data-preset="30d">Next 30 days</button>
              </div>
              <div id="clearDatesWrap" class="clear-dates-wrap" hidden>
                <button type="button" id="clearDatesBtn" class="clear-dates-btn">Clear</button>
              </div>
            </div>
            <div class="group">
              <div class="group-label">Creative</div>
              <div class="field">
                <div class="field-label">Sponsor</div>
                <input type="text" id="sponsor" name="sponsor" required placeholder="e.g. Acme Corp">
                <span class="field-error" id="err-sponsor"></span>
              </div>
              <div class="field">
                <div class="field-label">Headline</div>
                <input type="text" id="headline" name="headline" required placeholder="e.g. Your headline here">
                <span class="field-error" id="err-headline"></span>
              </div>
              <div class="field">
                <div class="field-label">Subline (optional)</div>
                <input type="text" id="subline" name="subline" placeholder="e.g. 123 Main St · Open 7am–10pm">
              </div>
              <div class="field">
                <div class="field-label">CTA</div>
                <input type="text" id="cta" name="cta" required placeholder="e.g. Learn more">
                <span class="field-error" id="err-cta"></span>
              </div>
              <div class="field">
                <div class="field-label">Destination URL (HTTPS)</div>
                <input type="url" id="destination_url" name="destination_url" required placeholder="https://">
                <span class="field-error" id="err-destination_url"></span>
              </div>
              <div class="field" id="imageUrlWrap">
                <div class="field-label">Image URL (required for banner/feature)</div>
                <input type="url" id="image_url" name="image_url" placeholder="https://">
                <span class="field-error" id="err-image_url"></span>
              </div>
              <div class="field">
                <div class="field-label">Logo URL (optional)</div>
                <input type="url" id="logo_url" name="logo_url" placeholder="https://">
              </div>
              <div id="placementWrap" class="placement-wrap" hidden>
                <div class="field-label">Placement</div>
                <select id="placement" name="placement">
                  <option value="home_feed">Main feed</option>
                </select>
              </div>
              <input type="hidden" id="tier" name="tier" value="banner">
            </div>
          </form>
          <aside class="preview-pane">
            <div id="adKpiBox" class="ad-kpi-box" hidden>
              <div class="group-label">KPI (last 7d)</div>
              <div class="kpi-grid" id="adKpiGrid"></div>
            </div>
            <div id="adPreview" class="ad-preview"></div>
            <div class="tier-toggle">
              <button type="button" class="tier-btn" data-tier="text">Text</button>
              <button type="button" class="tier-btn active" data-tier="banner">Banner</button>
              <button type="button" class="tier-btn" data-tier="feature">Feature</button>
            </div>
          </aside>
        </div>
      </div>
      <footer class="form-overlay-footer">
        <div class="form-actions">
          <button type="button" id="deleteBtn" class="delete-btn" disabled>Delete</button>
          <span id="unsavedIndicator" class="unsaved-indicator" hidden>Unsaved changes</span>
          <span id="saveStatus" class="save-status"></span>
          <div class="form-actions-right">
            <button type="button" id="cloneBtn">Clone</button>
            <button type="submit" id="saveBtn" class="primary" form="adForm">Save</button>
          </div>
        </div>
      </footer>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/flatpickr@4.6.13/dist/flatpickr.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/flatpickr@4.6.13/dist/plugins/rangePlugin.js"></script>
  <script>
    const API_URL = '/api/admin/ads';

    const fpDefaults = {
      enableTime: true,
      time_24hr: true,
      dateFormat: 'Y-m-d\\TH:i',
      minuteIncrement: 5,
      plugins: [rangePlugin({ input: '#end_at' })],
      onChange: () => { updateClearDatesVisibility(); markDirty(); debouncePreview(); },
    };
    let fpRange;

    function mapErrorToField(errorStr) {
      if (!errorStr || typeof errorStr !== 'string') return null;
      const s = errorStr.toLowerCase();
      if (s.includes('id')) return 'id';
      if (s.includes('sponsor')) return 'sponsor';
      if (s.includes('headline')) return 'headline';
      if (s.includes('cta')) return 'cta';
      if (s.includes('destination_url') || s.includes('destination url')) return 'destination_url';
      if (s.includes('image_url') || s.includes('image url')) return 'image_url';
      if (s.includes('logo_url') || s.includes('logo url')) return 'logo_url';
      return null;
    }

    async function fetchWithRetry(url, opts, retries = 1) {
      const timeout = 15000;
      const ctrl = new AbortController();
      const to = setTimeout(() => ctrl.abort(), timeout);
      const merged = { ...opts, signal: ctrl.signal };
      try {
        const res = await fetch(url, merged);
        clearTimeout(to);
        return res;
      } catch (err) {
        clearTimeout(to);
        if (retries > 0) {
          await new Promise(r => setTimeout(r, 500));
          return fetchWithRetry(url, opts, retries - 1);
        }
        throw err;
      }
    }

    function parseAdsResponse(data) {
      let raw = [];
      if (Array.isArray(data.ads)) raw = data.ads;
      else if (data.id != null) raw = [data];
      const result = [];
      raw.forEach((item, i) => {
        if (!item || typeof item !== 'object') { console.warn('Admin: skipping malformed ad at index', i); return; }
        const id = item.id;
        if (!id || typeof id !== 'string') { console.warn('Admin: skipping ad without valid id at index', i); return; }
        if (typeof item.sponsor !== 'string' || typeof item.headline !== 'string' || typeof item.cta !== 'string') {
          console.warn('Admin: skipping ad with missing required fields at index', i);
          return;
        }
        result.push(item);
      });
      return result;
    }

    function clearErrorBanner() {
      const existing = document.getElementById('errorBanner');
      if (existing) existing.remove();
    }

    function showErrorBanner(title, subHtml) {
      clearErrorBanner();
      const main = document.querySelector('.main');
      if (!main) return;
      const banner = document.createElement('div');
      banner.id = 'errorBanner';
      banner.className = 'overview-status-banner error';
      banner.innerHTML = '<div class="status-banner-dot err"></div><div><div class="status-banner-text"></div><div class="status-banner-sub"' + (subHtml ? '' : ' hidden') + '></div></div>';
      const textEl = banner.querySelector('.status-banner-text');
      const sub = banner.querySelector('.status-banner-sub');
      if (textEl) textEl.textContent = title || '';
      if (sub && subHtml) { sub.innerHTML = subHtml; sub.hidden = false; }
      main.insertBefore(banner, main.firstChild);
    }

    function show401Banner() {
      showErrorBanner('Session expired', '<a href="#" id="reauthLink">Refresh to sign in</a>');
      document.getElementById('reauthLink')?.addEventListener('click', (e) => { e.preventDefault(); location.reload(); });
      setStatus(fetchStatus, 'Session expired', false);
    }

    const refreshBtn = document.getElementById('refreshBtn');
    const fetchStatus = document.getElementById('fetchStatus');
    const adCards = document.getElementById('adCards');
    const calendarWrap = document.getElementById('calendarWrap');
    const calDays = document.getElementById('calDays');
    const calMonthLabel = document.getElementById('calMonthLabel');

    let calViewYear = new Date().getFullYear();
    let calViewMonth = new Date().getMonth();
    const saveBtn = document.getElementById('saveBtn');
    const saveStatus = document.getElementById('saveStatus');
    const cloneBtn = document.getElementById('cloneBtn');
    const deleteBtn = document.getElementById('deleteBtn');
    const form = document.getElementById('adForm');
    const adPreview = document.getElementById('adPreview');

    fpRange = flatpickr(document.getElementById('start_at'), { ...fpDefaults });

    let scheduledAds = [];
    let selectedIndex = -1;
    let formDirty = false;
    let suppressDirty = false;
    let previewDebounce = null;
    let perAdStats = [];
    let adsFilterStatus = 'all';
    let adsSearchQuery = '';

    function setStatus(el, msg, ok) {
      el.textContent = msg;
      const base = el.id === 'saveStatus' ? 'save-status' : 'status-text';
      el.className = base + (ok === false ? ' status-err' : ok === true ? ' status-ok' : '');
      if (el.id === 'fetchStatus') {
        const dot = document.getElementById('statusDot');
        if (dot) dot.className = 'dot' + (ok === true ? ' on' : ok === false ? ' err' : '');
      }
    }

    function adStatus(ad) {
      const now = new Date();
      const start = ad.start_at ? new Date(ad.start_at) : null;
      const end = ad.end_at ? new Date(ad.end_at) : null;
      if (!ad.active) return 'paused';
      if (start && now < start) return 'scheduled';
      if (end && now > end) return 'ended';
      return 'live';
    }

    function statusClass(status) {
      return { live: 'chip-live', scheduled: 'chip-scheduled', ended: 'chip-ended', paused: 'chip-paused' }[status] || '';
    }

    function formatDateRange(ad) {
      const startStr = ad.start_at ? new Date(ad.start_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : null;
      const endStr = ad.end_at ? new Date(ad.end_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : null;
      if (startStr && endStr) return startStr + ' – ' + endStr;
      if (startStr) return 'From ' + startStr;
      if (endStr) return 'Until ' + endStr;
      return 'No dates';
    }

    function countByStatus() {
      let live = 0, scheduled = 0, ended = 0, paused = 0;
      scheduledAds.forEach(ad => {
        const s = adStatus(ad);
        if (s === 'live') live++;
        else if (s === 'scheduled') scheduled++;
        else if (s === 'ended') ended++;
        else paused++;
      });
      return { total: scheduledAds.length, live, scheduled, ended, paused };
    }

    function formatStatusSummary(c) {
      if (c.total === 0) return 'No ads';
      const parts = [];
      if (c.live) parts.push(c.live + ' live');
      if (c.scheduled) parts.push(c.scheduled + ' scheduled');
      if (c.ended) parts.push(c.ended + ' ended');
      if (c.paused) parts.push(c.paused + ' paused');
      return parts.join(' · ') || 'No ads';
    }

    function renderOverview() {
      updateFilterChips(countByStatus());
      clearErrorBanner();
    }

    function updateFilterChips(c) {
      const labels = { all: 'All', live: 'Live', scheduled: 'Scheduled', paused: 'Paused', ended: 'Ended' };
      const counts = { all: c.total, live: c.live, scheduled: c.scheduled, paused: c.paused, ended: c.ended };
      document.querySelectorAll('.status-filter').forEach(btn => {
        const key = btn.dataset.filter || 'all';
        const n = counts[key] || 0;
        btn.textContent = n > 1 ? labels[key] + ' ' + n : labels[key];
      });
    }

    function formatCompact(n) {
      if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
      if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
      return String(n);
    }

    function getAdStats(adId) {
      return perAdStats.find((s) => s.ad_id === adId) || null;
    }

    function updateAdKpiBox() {
      const box = document.getElementById('adKpiBox');
      const grid = document.getElementById('adKpiGrid');
      if (!box || !grid) return;
      if (selectedIndex < 0 || selectedIndex >= scheduledAds.length) {
        box.hidden = true;
        return;
      }
      const ad = scheduledAds[selectedIndex];
      const stats = getAdStats(ad.id);
      if (!stats) {
        box.hidden = true;
        return;
      }
      box.hidden = false;
      grid.innerHTML = '<div class="kpi-item"><span class="kpi-label">Impressions</span><span class="kpi-value">' + formatCompact(stats.impressions) + '</span></div>' +
        '<div class="kpi-item"><span class="kpi-label">Clicks</span><span class="kpi-value">' + formatCompact(stats.clicks) + '</span></div>' +
        '<div class="kpi-item"><span class="kpi-label">CTR</span><span class="kpi-value">' + stats.ctr_percent.toFixed(1) + '%</span></div>';
    }

    async function loadPostHogStats() {
      try {
        const res = await fetchWithRetry('/api/admin/stats', { credentials: 'include' });
        if (res.status === 401) { show401Banner(); return; }
        const data = await res.json();
        perAdStats = Array.isArray(data.per_ad) ? data.per_ad : [];
        renderAdCards();
        updateAdKpiBox();
      } catch (_) {
        perAdStats = [];
      }
    }

    let lastOverlayTrigger = null;

    function openFormOverlay(title) {
      const overlay = document.getElementById('formOverlay');
      const titleEl = document.getElementById('formOverlayTitle');
      if (titleEl) titleEl.textContent = title;
      overlay.hidden = false;
      lastOverlayTrigger = document.activeElement;
      const closeBtn = document.getElementById('formOverlayClose');
      const firstInput = document.querySelector('#formOverlay input, #formOverlay select');
      (firstInput || closeBtn)?.focus();
      document.body.style.overflow = 'hidden';
    }

    function closeFormOverlay() {
      if (formDirty && !confirm('Discard unsaved changes?')) return;
      const overlay = document.getElementById('formOverlay');
      overlay.hidden = true;
      document.body.style.overflow = '';
      lastOverlayTrigger?.focus();
      lastOverlayTrigger = null;
    }

    async function toggleAdActive(idx) {
      if (idx < 0 || idx >= scheduledAds.length) return;
      const ad = scheduledAds[idx];
      const nextActive = !ad.active;
      try {
        const payload = { ...ad, active: nextActive };
        const res = await fetchWithRetry(API_URL, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.status === 401) { show401Banner(); return; }
        if (!res.ok) return;
        scheduledAds[idx] = { ...ad, active: nextActive };
        renderAdCards();
        renderCalendar();
        renderOverview();
        if (selectedIndex === idx) populateForm(scheduledAds[idx]);
      } catch (_) {}
    }

    function goToNewAd() {
      if (formDirty && !confirm('Discard unsaved changes?')) return;
      selectAd(-1);
      openFormOverlay('New ad');
    }

    function sortKeyForGroup(ad, status) {
      const start = ad.start_at ? new Date(ad.start_at).getTime() : 0;
      const end = ad.end_at ? new Date(ad.end_at).getTime() : 0;
      if (status === 'ended') return -end;
      return start || end || 0;
    }

    function filterAdsForDisplay() {
      return scheduledAds.map((ad, i) => ({ ad, i })).filter(({ ad }) => {
        const status = adStatus(ad);
        if (adsFilterStatus !== 'all' && status !== adsFilterStatus) return false;
        if (adsSearchQuery) {
          const q = adsSearchQuery.toLowerCase().trim();
          const sponsor = (ad.sponsor || '').toLowerCase();
          const id = (ad.id || '').toLowerCase();
          if (!sponsor.includes(q) && !id.includes(q)) return false;
        }
        return true;
      });
    }

    function renderAdCards() {
      const adsHeader = document.getElementById('adsHeader');
      if (adsHeader) adsHeader.hidden = scheduledAds.length === 0;
      adCards.innerHTML = '';

      const newAdGroup = document.createElement('div');
      newAdGroup.className = 'ad-cards-group ad-cards-group-new';
      const newAdWrap = document.createElement('div');
      newAdWrap.className = 'ad-cards';
      const newAdCardWrap = document.createElement('div');
      newAdCardWrap.className = 'ad-card-wrap';
      const newAdBtn = document.createElement('button');
      newAdBtn.type = 'button';
      newAdBtn.id = 'newAdBtn';
      newAdBtn.className = 'ad-card new-ad-card';
      newAdBtn.innerHTML = '<span class="new-ad-plus">+</span><span class="new-ad-label">New ad</span>';
      newAdBtn.addEventListener('click', goToNewAd);
      newAdCardWrap.appendChild(newAdBtn);
      newAdWrap.appendChild(newAdCardWrap);
      newAdGroup.appendChild(newAdWrap);
      adCards.appendChild(newAdGroup);

      const filtered = filterAdsForDisplay();
      const groups = { live: [], scheduled: [], paused: [], ended: [] };
      filtered.forEach(({ ad, i }) => {
        const status = adStatus(ad);
        if (groups[status]) groups[status].push({ ad, i });
      });

      const order = ['live', 'scheduled', 'paused', 'ended'];
      order.forEach((status) => {
        const list = groups[status];
        if (list.length === 0) return;
        list.sort((a, b) => sortKeyForGroup(a.ad, status) - sortKeyForGroup(b.ad, status));
        const section = document.createElement('div');
        section.className = 'ad-cards-group';
        section.innerHTML = '<div class="ad-cards-group-label">' + status + '</div>';
        const cardWrap = document.createElement('div');
        cardWrap.className = 'ad-cards';
        list.forEach(({ ad, i }) => {
          const s = adStatus(ad);
          const stats = getAdStats(ad.id);
          const statsLine = stats
            ? '<span class="ad-card-stats">' + formatCompact(stats.impressions) + ' imp · ' + formatCompact(stats.clicks) + ' clk · ' + stats.ctr_percent.toFixed(1) + '% CTR</span>'
            : '';
          const card = document.createElement('div');
          card.className = 'ad-card-wrap';
          const canToggle = s === 'live' || s === 'paused';
          const stateLabel = s === 'paused' ? 'Paused' : 'Live';
          const stateIcon = s === 'paused' ? '⏸' : '▶';
          const actionIcon = s === 'paused' ? '▶' : '⏸';
          const actionHtml = canToggle ? '<button type="button" class="ad-card-action ad-card-action-' + s + '" data-ad-idx="' + i + '" data-action="toggle" title="' + stateLabel + ' — click to ' + (s === 'paused' ? 'resume' : 'pause') + '" aria-label="' + stateLabel + '"><span class="ad-card-action-icon-wrap"><span class="ad-card-action-icon ad-card-action-icon-state">' + stateIcon + '</span><span class="ad-card-action-icon ad-card-action-icon-action">' + actionIcon + '</span></span></button>' : '';
          const chipHtml = (s === 'live' || s === 'paused') ? '' : '<span class="chip ' + statusClass(s) + '">' + s + '</span>';
          card.innerHTML = '<div role="button" tabindex="0" class="ad-card' + (selectedIndex === i ? ' selected' : '') + '" data-ad-idx="' + i + '">' +
            actionHtml +
            '<span class="ad-card-head">' + escapeHtml(ad.sponsor) + ' — ' + escapeHtml(ad.id) + '</span>' +
            chipHtml +
            '<span class="ad-card-dates">' + formatDateRange(ad) + '</span>' +
            (statsLine ? statsLine : '') +
            '<span class="ad-card-tier">' + (ad.tier || 'banner') + '</span>' +
            '</div>';
          const cardEl = card.querySelector('.ad-card');
          cardEl.addEventListener('click', (e) => {
            if (e.target.closest('.ad-card-action')) return;
            selectAd(i);
            openFormOverlay('Edit: ' + (ad.sponsor || ad.id));
          });
          cardEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cardEl.click(); }
          });
          const actionBtn = card.querySelector('.ad-card-action');
          if (actionBtn) actionBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); toggleAdActive(parseInt(actionBtn.dataset.adIdx, 10)); });
          cardWrap.appendChild(card);
        });
        section.appendChild(cardWrap);
        adCards.appendChild(section);
      });
    }

    function escapeHtml(s) {
      const div = document.createElement('div');
      div.textContent = s || '';
      return div.innerHTML;
    }

    function getAdsForDay(year, month, day) {
      const dayStart = new Date(year, month, day, 0, 0, 0);
      const dayEnd = new Date(year, month, day, 23, 59, 59);
      return scheduledAds.filter(ad => {
        const start = ad.start_at ? new Date(ad.start_at) : null;
        const end = ad.end_at ? new Date(ad.end_at) : null;
        if (!start && !end) return false;
        const adStart = start || new Date(0);
        const adEnd = end || new Date(9999, 11, 31);
        return dayStart <= adEnd && dayEnd >= adStart;
      });
    }

    function renderCalendar() {
      const empty = document.getElementById('calendarEmpty');
      if (empty) empty.hidden = true;
      calendarWrap.hidden = false;
      calMonthLabel.textContent = new Date(calViewYear, calViewMonth).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

      const first = new Date(calViewYear, calViewMonth, 1);
      const daysInMonth = new Date(calViewYear, calViewMonth + 1, 0).getDate();
      let startDow = first.getDay();

      const prevMonth = calViewMonth === 0 ? 11 : calViewMonth - 1;
      const prevYear = calViewMonth === 0 ? calViewYear - 1 : calViewYear;
      const prevMonthDays = new Date(prevYear, prevMonth + 1, 0).getDate();

      const now = new Date();
      const todayStr = now.getFullYear() + '-' + now.getMonth() + '-' + now.getDate();

      let html = '';
      const totalCells = Math.ceil((startDow + daysInMonth) / 7) * 7;

      for (let i = 0; i < totalCells; i++) {
        let dayNum, y, m;
        if (i < startDow) {
          dayNum = prevMonthDays - startDow + i + 1;
          y = prevYear;
          m = prevMonth;
        } else if (i < startDow + daysInMonth) {
          dayNum = i - startDow + 1;
          y = calViewYear;
          m = calViewMonth;
        } else {
          dayNum = i - startDow - daysInMonth + 1;
          y = calViewMonth === 11 ? calViewYear + 1 : calViewYear;
          m = calViewMonth === 11 ? 0 : calViewMonth + 1;
        }

        const isCurrentMonth = (y === calViewYear && m === calViewMonth);
        const isToday = (y === now.getFullYear() && m === now.getMonth() && dayNum === now.getDate());

        const ads = getAdsForDay(y, m, dayNum);
        const hasConflict = ads.length > 1;
        const cellClass = 'cal-cell' + (isCurrentMonth ? '' : ' other-month') + (isToday ? ' today' : '') + (hasConflict ? ' has-conflict' : '');

        html += '<div class="' + cellClass + '" data-year="' + y + '" data-month="' + m + '" data-day="' + dayNum + '">';
        html += '<div class="cal-cell-num">' + dayNum + '</div>';
        html += '<div class="cal-cell-ads">';
        ads.forEach((ad) => {
          const status = adStatus(ad);
          const idxInList = scheduledAds.findIndex(a => a.id === ad.id);
          if (idxInList >= 0) {
            const sel = selectedIndex === idxInList ? ' selected' : '';
            html += '<button type="button" class="cal-ad-pill ' + statusClass(status) + sel + '" data-ad-index="' + idxInList + '" title="' + escapeHtml(ad.sponsor + ' – ' + ad.id + ' (' + formatDateRange(ad) + ')') + '">' + escapeHtml(ad.sponsor) + '</button>';
          }
        });
        html += '</div></div>';
      }

      calDays.innerHTML = html;

      calDays.querySelectorAll('.cal-ad-pill').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const idx = parseInt(btn.dataset.adIndex, 10);
          const ad = scheduledAds[idx];
          selectAd(idx);
          if (ad) openFormOverlay('Edit: ' + (ad.sponsor || ad.id));
        });
      });
    }

    function selectAd(index) {
      if (formDirty && !confirm('Discard unsaved changes?')) return;
      formDirty = false;
      selectedIndex = index;
      setStatus(saveStatus, '', undefined);
      renderAdCards();
      renderCalendar();
      if (index === -1) {
        clearForm();
        clearFieldErrors();
        const ind = document.getElementById('unsavedIndicator');
        if (ind) ind.hidden = true;
      } else {
        populateForm(scheduledAds[index]);
        const ind = document.getElementById('unsavedIndicator');
        if (ind) ind.hidden = !formDirty;
      }
      updateClearDatesVisibility();
      updateImageUrlVisibility();
      updateDeleteButton();
      updatePreview();
      updateAdKpiBox();
    }

    function markDirty() {
      if (suppressDirty) return;
      formDirty = true;
      const ind = document.getElementById('unsavedIndicator');
      if (ind) ind.hidden = false;
    }

    function clearFieldErrors() {
      ['id', 'sponsor', 'headline', 'cta', 'destination_url', 'image_url', 'logo_url'].forEach(f => {
        const errEl = document.getElementById('err-' + f);
        const input = document.getElementById(f);
        if (errEl) errEl.textContent = '';
        if (input) input.classList.remove('input-error');
      });
    }

    function setFieldError(fieldId, msg) {
      const el = document.getElementById('err-' + fieldId);
      const input = document.getElementById(fieldId);
      if (el) el.textContent = msg || '';
      if (input) input.classList.toggle('input-error', !!msg);
    }

    function isValidHttpsUrl(s) {
      if (!s || !s.trim()) return false;
      try { return new URL(s.trim()).protocol === 'https:'; } catch { return false; }
    }

    function validateForm() {
      clearFieldErrors();
      const id = document.getElementById('id').value.trim();
      const sponsor = document.getElementById('sponsor').value.trim();
      const headline = document.getElementById('headline').value.trim();
      const cta = document.getElementById('cta').value.trim();
      const destination_url = document.getElementById('destination_url').value.trim();
      const tier = document.getElementById('tier').value;
      const image_url = document.getElementById('image_url').value.trim();
      const logo_url = document.getElementById('logo_url').value.trim();

      if (!id) { setFieldError('id', 'ID is required'); return false; }
      if (!sponsor) { setFieldError('sponsor', 'Sponsor is required'); return false; }
      if (!headline) { setFieldError('headline', 'Headline is required'); return false; }
      if (!cta) { setFieldError('cta', 'CTA is required'); return false; }
      if (!destination_url) { setFieldError('destination_url', 'Destination URL is required'); return false; }
      if (!isValidHttpsUrl(destination_url)) { setFieldError('destination_url', 'Must be a valid HTTPS URL'); return false; }

      if (tier === 'banner' || tier === 'feature') {
        if (!image_url) { setFieldError('image_url', 'Image URL is required for banner/feature tier'); return false; }
        if (!isValidHttpsUrl(image_url)) { setFieldError('image_url', 'Must be a valid HTTPS URL'); return false; }
      }
      if (logo_url && !isValidHttpsUrl(logo_url)) { setFieldError('logo_url', 'Must be a valid HTTPS URL or empty'); return false; }

      return true;
    }

    function clearForm() {
      suppressDirty = true;
      try {
        document.getElementById('id').value = '';
        document.getElementById('tier').value = 'banner';
        updateTierButtons();
        document.getElementById('active').value = 'true';
        updateActiveInactiveButtons();
        document.getElementById('sponsor').value = '';
        document.getElementById('headline').value = '';
        document.getElementById('subline').value = '';
        document.getElementById('cta').value = '';
        document.getElementById('destination_url').value = '';
        document.getElementById('image_url').value = '';
        document.getElementById('logo_url').value = '';
        document.getElementById('placement').value = 'home_feed';
        document.getElementById('creative_version').value = '';
        if (fpRange) fpRange.clear();
      } finally {
        suppressDirty = false;
      }
    }

    function isoToDatetimeLocal(iso) {
      if (!iso) return '';
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return '';
      const pad = (n) => String(n).padStart(2, '0');
      return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes());
    }

    function datetimeLocalToIso(value) {
      if (!value) return undefined;
      const d = new Date(value);
      return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
    }

    function populateForm(data) {
      suppressDirty = true;
      try {
        document.getElementById('id').value = data.id || '';
        document.getElementById('tier').value = (data.tier || 'banner').toLowerCase();
        updateTierButtons();
        document.getElementById('active').value = data.active ? 'true' : 'false';
        updateActiveInactiveButtons();
        document.getElementById('sponsor').value = data.sponsor || '';
        document.getElementById('headline').value = data.headline || '';
        document.getElementById('subline').value = data.subline || '';
        document.getElementById('cta').value = data.cta || '';
        document.getElementById('destination_url').value = data.destination_url || '';
        document.getElementById('image_url').value = data.image_url || '';
        document.getElementById('logo_url').value = data.logo_url || '';
        document.getElementById('placement').value = data.placement || 'home_feed';
        document.getElementById('creative_version').value = data.creative_version || '';
        if (fpRange) {
          const start = data.start_at ? new Date(data.start_at) : null;
          const end = data.end_at ? new Date(data.end_at) : null;
          fpRange.setDate(start && end ? [start, end] : start ? [start] : []);
        }
      } finally {
        suppressDirty = false;
      }
    }

    function getFormData() {
      return {
        sponsor: document.getElementById('sponsor').value.trim(),
        headline: document.getElementById('headline').value.trim(),
        subline: document.getElementById('subline').value.trim() || null,
        cta: document.getElementById('cta').value.trim(),
        tier: document.getElementById('tier').value,
        image_url: document.getElementById('image_url').value.trim() || null,
        logo_url: document.getElementById('logo_url').value.trim() || null,
      };
    }

    function getPlaceholder(id) {
      const el = document.getElementById(id);
      const p = (el && el.placeholder) || '';
      return p.replace(/^e\.g\.\s*/i, '');
    }

    function updatePreview() {
      const d = getFormData();
      const tier = d.tier || 'banner';
      const sponsor = d.sponsor || getPlaceholder('sponsor');
      const headline = d.headline || getPlaceholder('headline');
      const subline = d.subline || getPlaceholder('subline');
      const cta = d.cta || getPlaceholder('cta');
      const image_url = d.image_url || null;
      const logo_url = d.logo_url || null;
      const usesImageLayout = tier !== 'text';
      const sponsorLine = '<div class="preview-sponsor-line">' +
        (logo_url ? '<img src="' + escapeHtml(logo_url) + '" alt="" class="preview-logo" onerror="this.style.display=\\'none\\'">' : '') +
        '<span class="preview-sponsor">' + escapeHtml(sponsor) + '</span></div>';
      const copyContent = '<div class="preview-copy">' +
        sponsorLine +
        '<strong class="preview-headline">' + escapeHtml(headline) + '</strong>' +
        '<span class="preview-subline">' + escapeHtml(subline) + '</span>' +
        '</div>';
      const ctaBtn = '<div class="preview-cta-wrap"><span class="preview-cta-text">' + escapeHtml(cta) + '</span><span class="preview-cta-arrow">↗</span></div>';
      let html = '<div class="preview preview-' + tier + '">';
      if (usesImageLayout) {
        const imgHeight = tier === 'feature' ? 220 : 140;
        if (image_url) {
          html += '<div class="preview-img-wrap" style="height:' + imgHeight + 'px">';
          html += '<img src="' + escapeHtml(image_url) + '" alt="" class="preview-img" onerror="this.parentElement.classList.add(\\'preview-img-error\\')">';
          html += '</div>';
        } else {
          html += '<div class="preview-img-placeholder" style="height:' + imgHeight + 'px">Image</div>';
        }
        html += '<div class="preview-copy-block">' + copyContent + ctaBtn + '</div>';
      } else {
        html += copyContent + ctaBtn;
      }
      html += '</div>';
      adPreview.innerHTML = html;
    }

    function debouncePreview() {
      clearTimeout(previewDebounce);
      previewDebounce = setTimeout(updatePreview, 50);
    }

    function updateClearDatesVisibility() {
      const startVal = document.getElementById('start_at').value;
      const endVal = document.getElementById('end_at').value;
      const endAtWrap = document.getElementById('endAtWrap');
      const wrap = document.getElementById('clearDatesWrap');
      endAtWrap.hidden = !startVal;
      wrap.hidden = !startVal && !endVal;
    }

    function updateDeleteButton() {
      deleteBtn.disabled = selectedIndex === -1;
    }

    function clearDates() {
      if (fpRange) fpRange.clear();
      updateClearDatesVisibility();
      markDirty();
      updatePreview();
    }

    document.querySelectorAll('[data-preset]').forEach(btn => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset;
        const now = new Date();
        let start, end;
        if (preset === 'today') {
          start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes());
          end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59);
        } else if (preset === 'week') {
          start = new Date(now);
          end = new Date(now);
          end.setDate(end.getDate() + (7 - now.getDay()));
          end.setHours(23, 59, 0, 0);
        } else if (preset === '7d') {
          start = new Date(now);
          end = new Date(now);
          end.setDate(end.getDate() + 7);
        } else if (preset === '30d') {
          start = new Date(now);
          end = new Date(now);
          end.setDate(end.getDate() + 30);
        }
        if (start && end && fpRange) fpRange.setDate([start, end]);
        updateClearDatesVisibility();
        markDirty();
        updatePreview();
      });
    });

    document.getElementById('clearDatesBtn').addEventListener('click', clearDates);

    document.getElementById('start_at').addEventListener('input', updateClearDatesVisibility);
    document.getElementById('start_at').addEventListener('change', updateClearDatesVisibility);
    document.getElementById('end_at').addEventListener('input', updateClearDatesVisibility);
    document.getElementById('end_at').addEventListener('change', updateClearDatesVisibility);

    cloneBtn.addEventListener('click', () => {
      const idEl = document.getElementById('id');
      const base = idEl.value.trim() || 'ad';
      const match = base.match(/-(\d+)$/);
      const next = match ? base.replace(/-(\d+)$/, '-' + (parseInt(match[1], 10) + 1)) : base + '-copy';
      idEl.value = next;
      const now = new Date();
      const start = new Date(now);
      start.setMonth(start.getMonth() + 1);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      if (fpRange) fpRange.setDate([start, end]);
      document.getElementById('active').value = 'false';
      updateActiveInactiveButtons();
      selectedIndex = -1;
      renderAdCards();
      updateClearDatesVisibility();
      updateDeleteButton();
      formDirty = true;
      updatePreview();
    });

    deleteBtn.addEventListener('click', async () => {
      if (selectedIndex < 0) return;
      const ad = scheduledAds[selectedIndex];
      if (!ad || !confirm('Delete ad "' + (ad.sponsor || ad.id) + '"?')) return;
      setStatus(saveStatus, 'Deleting…', true);
      deleteBtn.disabled = true;
      try {
        const res = await fetchWithRetry(API_URL + '?id=' + encodeURIComponent(ad.id), {
          method: 'DELETE',
          credentials: 'include',
        });
        let data = {};
        try { data = await res.json(); } catch (_) {}
        if (res.status === 401) { show401Banner(); setStatus(saveStatus, 'Session expired', false); return; }
        if (!res.ok) {
          setStatus(saveStatus, data.error || res.statusText, false);
          return;
        }
        setStatus(saveStatus, 'Deleted', true);
        formDirty = false;
        selectedIndex = -1;
        loadSchedule();
        closeFormOverlay();
        document.getElementById('newAdBtn')?.focus();
      } catch (err) {
        setStatus(saveStatus, 'Check connection, then Refresh', false);
      } finally {
        deleteBtn.disabled = selectedIndex < 0;
      }
    });

    function suggestIdFromSponsor() {
      if (selectedIndex >= 0) return;
      const sponsor = document.getElementById('sponsor').value.trim();
      const idEl = document.getElementById('id');
      if (!sponsor || idEl.value.trim()) return;
      const slug = sponsor.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      if (!slug) return;
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const suggested = slug + '-' + now.getFullYear() + '-' + pad(now.getMonth() + 1);
      idEl.placeholder = 'e.g. ' + suggested;
    }

    form.querySelectorAll('input, select').forEach(el => {
      el.addEventListener('input', () => { markDirty(); debouncePreview(); if (el.id === 'sponsor') suggestIdFromSponsor(); });
      el.addEventListener('change', () => { markDirty(); debouncePreview(); if (el.id === 'sponsor') suggestIdFromSponsor(); });
    });
    [document.getElementById('id'), document.getElementById('creative_version')].forEach(el => {
      if (el) {
        el.addEventListener('input', () => { markDirty(); debouncePreview(); });
        el.addEventListener('change', () => { markDirty(); debouncePreview(); });
      }
    });
    function updateActiveInactiveButtons() {
      const isActive = document.getElementById('active').value === 'true';
      document.getElementById('activeBtn').classList.toggle('active', isActive);
      document.getElementById('inactiveBtn').classList.toggle('active', !isActive);
    }
    document.getElementById('activeBtn').addEventListener('click', () => {
      document.getElementById('active').value = 'true';
      updateActiveInactiveButtons();
      markDirty();
      debouncePreview();
    });
    document.getElementById('inactiveBtn').addEventListener('click', () => {
      document.getElementById('active').value = 'false';
      updateActiveInactiveButtons();
      markDirty();
      debouncePreview();
    });

    function updateTierButtons() {
      const tier = document.getElementById('tier').value;
      document.querySelectorAll('.tier-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tier === tier);
      });
      updateImageUrlVisibility();
    }
    function updateImageUrlVisibility() {
      const tier = document.getElementById('tier').value;
      const wrap = document.getElementById('imageUrlWrap');
      wrap.classList.toggle('image-url-hidden', tier === 'text');
    }
    document.querySelectorAll('.tier-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('tier').value = btn.dataset.tier;
        updateTierButtons();
        markDirty();
        debouncePreview();
      });
    });

    window.addEventListener('beforeunload', (e) => { if (formDirty) e.preventDefault(); });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const overlay = document.getElementById('formOverlay');
        if (overlay && !overlay.hidden) {
          e.preventDefault();
          closeFormOverlay();
        }
      }
    });

    document.getElementById('formOverlayClose').addEventListener('click', closeFormOverlay);
    document.querySelector('.form-overlay-backdrop').addEventListener('click', closeFormOverlay);

    refreshBtn.addEventListener('click', loadSchedule);

    document.getElementById('adsSearch').addEventListener('input', (e) => {
      adsSearchQuery = (e.target.value || '').trim();
      renderAdCards();
    });
    document.querySelectorAll('.status-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.status-filter').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        adsFilterStatus = btn.dataset.filter || 'all';
        renderAdCards();
      });
    });

    document.getElementById('calPrev').addEventListener('click', () => {
      if (calViewMonth === 0) { calViewMonth = 11; calViewYear--; } else calViewMonth--;
      renderCalendar();
    });
    document.getElementById('calNext').addEventListener('click', () => {
      if (calViewMonth === 11) { calViewMonth = 0; calViewYear++; } else calViewMonth++;
      renderCalendar();
    });
    document.getElementById('calToday').addEventListener('click', () => {
      const now = new Date();
      calViewYear = now.getFullYear();
      calViewMonth = now.getMonth();
      renderCalendar();
    });

    async function loadSchedule() {
      setStatus(fetchStatus, 'Connecting…', true);
      document.getElementById('adCards').classList.add('loading');
      document.getElementById('calendarWrap').classList.add('loading');
      try {
        const res = await fetchWithRetry(API_URL, { credentials: 'include' });
        let data;
        try { data = await res.json(); } catch (_) { data = {}; }
        if (res.status === 401) {
          document.getElementById('adCards').classList.remove('loading');
          document.getElementById('calendarWrap').classList.remove('loading');
          show401Banner();
          return;
        }
        if (!res.ok) {
          document.getElementById('adCards').classList.remove('loading');
          document.getElementById('calendarWrap').classList.remove('loading');
          setStatus(fetchStatus, 'Not connected', false);
          showErrorBanner('Failed to load', (data.error || res.statusText || 'Unknown error'));
          return;
        }
        scheduledAds = parseAdsResponse(data);
        document.getElementById('adCards').classList.remove('loading');
        document.getElementById('calendarWrap').classList.remove('loading');
        renderAdCards();
        renderCalendar();
        renderOverview();
        if (scheduledAds.length > 0 && selectedIndex >= 0 && selectedIndex < scheduledAds.length) {
          populateForm(scheduledAds[selectedIndex]);
        } else {
          selectAd(-1);
        }
        setStatus(fetchStatus, 'Connected', true);
        loadPostHogStats();
      } catch (err) {
        setStatus(fetchStatus, 'Not connected', false);
        document.getElementById('adCards').classList.remove('loading');
        document.getElementById('calendarWrap').classList.remove('loading');
        showErrorBanner('Failed to load', 'Check connection, then <button type="button" class="btn-as-link" id="retryAfterError">Refresh</button>');
        document.getElementById('retryAfterError')?.addEventListener('click', loadSchedule);
      }
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validateForm()) {
        const firstErr = form.querySelector('.input-error');
        if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      const tier = document.getElementById('tier').value;
      const payload = {
        id: document.getElementById('id').value.trim(),
        tier,
        active: document.getElementById('active').value === 'true',
        sponsor: document.getElementById('sponsor').value.trim(),
        headline: document.getElementById('headline').value.trim(),
        subline: document.getElementById('subline').value.trim() || null,
        cta: document.getElementById('cta').value.trim(),
        destination_url: document.getElementById('destination_url').value.trim(),
        image_url: (tier === 'banner' || tier === 'feature') ? (document.getElementById('image_url').value.trim() || null) : null,
        logo_url: document.getElementById('logo_url').value.trim() || null,
        placement: document.getElementById('placement').value.trim() || 'home_feed',
        creative_version: document.getElementById('creative_version').value.trim() || '',
        start_at: datetimeLocalToIso(document.getElementById('start_at').value.trim()),
        end_at: datetimeLocalToIso(document.getElementById('end_at').value.trim()),
      };
      if ((tier === 'banner' || tier === 'feature') && !payload.image_url) {
        setStatus(saveStatus, 'Banner/feature tier requires image_url', false);
        return;
      }
      setStatus(saveStatus, 'Saving…', true);
      saveBtn.disabled = true;
      try {
        const res = await fetchWithRetry(API_URL, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        let data = {};
        try { data = await res.json(); } catch (_) {}
        if (res.status === 401) { show401Banner(); setStatus(saveStatus, 'Session expired', false); return; }
        if (res.status === 400) {
          const field = mapErrorToField(data.error);
          if (field) { clearFieldErrors(); setFieldError(field, data.error); document.getElementById(field)?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
          setStatus(saveStatus, data.error || res.statusText, false);
          return;
        }
        if (!res.ok) {
          setStatus(saveStatus, data.error || res.statusText, false);
          return;
        }
        setStatus(saveStatus, '', undefined);
        formDirty = false;
        const ind = document.getElementById('unsavedIndicator');
        if (ind) ind.hidden = true;
        loadSchedule();
        closeFormOverlay();
        saveBtn.focus();
      } catch (err) {
        setStatus(saveStatus, 'Check connection, then Refresh', false);
      } finally {
        saveBtn.disabled = false;
      }
    });

    updateFilterChips(countByStatus());
    loadSchedule();
  </script>

  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #0d0d0d;
      --surface: #141414;
      --border: #262626;
      --text: #e5e5e5;
      --muted: #737373;
      --accent: #14b8a6;
      --accent-filled: #0d9488;
      --green: #22c55e;
      --red: #ef4444;
      --yellow: #eab308;
      --font: 'DM Sans', system-ui, sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
      --cta-orange: #E87722;
    }
    html { background: var(--bg); color: var(--text); font-family: var(--font); font-size: 13px; line-height: 1.5; -webkit-text-size-adjust: 100%; }
    body { height: 100vh; margin: 0; overflow: hidden; min-width: 0; }

    .dashboard-wrap {
      display: grid;
      grid-template-rows: 40px 1fr;
      height: 100vh;
      min-height: 0;
    }
    .topbar {
      grid-column: 1 / -1;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0 12px;
      min-height: 40px;
      height: 40px;
      border-bottom: 1px solid var(--border);
      background: var(--surface);
      min-width: 0;
    }
    .topbar-home {
      font-size: 13px; font-weight: 600; color: var(--muted); text-decoration: none; white-space: nowrap;
    }
    .topbar-home:hover { color: var(--accent); }
    .topbar-center { display: flex; align-items: center; gap: 6px; flex: 1; justify-content: center; min-width: 0; }
    .topbar-title { font-size: 13px; font-weight: 500; white-space: nowrap; }
    .topbar-sep { color: var(--border); flex-shrink: 0; opacity: 0.7; }
    .topbar-sub { color: var(--muted); font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .topbar-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
    .topbar-refresh {
      padding: 4px 8px; font-size: 14px; line-height: 1;
      border: 1px solid var(--border); background: transparent; color: var(--muted);
      cursor: pointer;
    }
    .topbar-refresh:hover { color: var(--accent); border-color: var(--accent); }
    .status { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
    .dot { width: 6px; height: 6px; background: var(--border); flex-shrink: 0; }
    .dot.on { background: var(--green); }
    .dot.err { background: var(--red); }
    .status-text { color: var(--muted); font-size: 11px; }
    .status-text.status-ok { color: var(--green); }
    .status-text.status-err { color: var(--red); }

    .kv { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
    .kv-k { color: var(--muted); white-space: nowrap; }
    .kv-v { color: var(--accent); font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: right; }

    .main { display: flex; flex-direction: column; overflow-y: auto; overflow-x: hidden; min-width: 0; padding: 16px 20px; }
    .schedule-page { flex: 1; min-height: 0; }
    .schedule-grid { display: grid; grid-template-columns: 1fr; gap: 20px; }
    .schedule-calendar { min-width: 0; }
    .schedule-ads { min-width: 0; display: flex; flex-direction: column; gap: 12px; }

    .overview-status-banner {
      padding: 12px 16px;
      margin: 0 0 16px;
      border: 1px solid var(--border);
      display: flex;
      align-items: center;
      gap: 12px;
      background: var(--surface);
    }
    .overview-status-banner.operational { border-left: 4px solid var(--green); }
    .overview-status-banner.loading { border-left: 4px solid var(--muted); }
    .overview-status-banner.error { border-left: 4px solid var(--red); }
    .status-banner-dot { width: 8px; height: 8px; flex-shrink: 0; }
    .status-banner-dot.ok { background: var(--green); }
    .status-banner-dot.pending { background: var(--muted); }
    .status-banner-dot.err { background: var(--red); }
    .status-banner-text { font-size: 13px; font-weight: 500; }
    .status-banner-sub { color: var(--muted); font-size: 11px; margin-top: 2px; }
    .btn-as-link {
      padding: 7px 12px;
      font-size: 12px;
      font-family: var(--font);
      border: 1px solid var(--accent);
      color: var(--accent);
      background: transparent;
      cursor: pointer;
      width: auto;
      transition: color 0.1s, border-color 0.1s, background 0.1s;
    }
    .btn-as-link:hover { background: var(--accent-filled); color: #fff; }

    .form-overlay {
      position: fixed; inset: 0; z-index: 100;
      display: flex; align-items: center; justify-content: center;
      padding: 16px;
    }
    .form-overlay[hidden] { display: none; }
    .form-overlay-backdrop {
      position: absolute; inset: 0;
      background: rgba(0,0,0,0.6);
      cursor: pointer;
    }
    .form-overlay-panel {
      position: relative;
      background: var(--surface);
      border: 1px solid var(--border);
      max-width: 900px;
      width: 100%;
      max-height: 90vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .form-overlay-header {
      display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 16px;
      padding: 12px 16px;
      border-bottom: 1px solid var(--border);
      flex-shrink: 0;
    }
    .form-overlay-header h2 { font-size: 14px; font-weight: 500; margin: 0; min-width: 0; }
    .active-inactive-toggle.active-inactive-header { justify-self: center; width: auto; min-width: 180px; margin-top: 0; }
    .form-overlay-header > button {
      padding: 4px 8px;
      font-size: 18px;
      line-height: 1;
      border: none;
      background: none;
      color: var(--muted);
      cursor: pointer;
      justify-self: end;
    }
    .form-overlay-header > button:hover { color: var(--text); }
    .form-overlay-body {
      overflow-y: auto;
      scrollbar-gutter: stable;
      padding: 16px 12px;
      flex: 1;
      min-height: 0;
    }
    .form-overlay-footer {
      flex-shrink: 0;
      padding: 16px 12px;
      border-top: 1px solid var(--border);
      background: var(--surface);
    }

    .admin-section { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; min-width: 0; }

    .admin-form { display: flex; flex-direction: column; gap: 24px; }
    .admin-form .group { margin-bottom: 0; }
    .group { display: flex; flex-direction: column; gap: 12px; margin-bottom: 12px; }
    .group-toggle { display: flex; align-items: center; justify-content: space-between; width: 100%; background: none; border: none; padding: 0 0 6px; cursor: pointer; color: inherit; font: inherit; }
    .group-toggle .group-label { margin-bottom: 0; }
    .group-toggle-icon { font-size: 10px; color: var(--muted); }
    .group-label { font-size: 11px; color: var(--muted); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 0; }
    .field { display: flex; flex-direction: column; gap: 4px; }
    .field-label { color: var(--muted); font-size: 11px; margin: 0; }
    .field-error { display: block; font-size: 11px; color: var(--red); margin: 0; min-height: 0; }
    .checkbox-label { display: flex; align-items: center; gap: 8px; color: var(--text); font-size: 12px; cursor: pointer; }
    .checkbox-label input { width: auto; margin: 0; }

    input, select {
      width: 100%;
      min-width: 0;
      min-height: 40px;
      background: var(--bg);
      border: 1px solid var(--border);
      color: var(--text);
      font-family: var(--font-mono);
      font-size: 14px;
      padding: 10px 12px;
      outline: none;
      transition: border-color 0.15s;
      margin-bottom: 0;
    }
    input:focus, select:focus { border-color: var(--accent); }
    input.input-error { border-color: var(--red); }

    button {
      font-family: var(--font);
      font-size: 12px;
      transition: color 0.15s, border-color 0.15s, background 0.15s;
      padding: 7px 12px;
      cursor: pointer;
      border: 1px solid var(--border);
      background: transparent;
      color: var(--muted);
      transition: color 0.1s, border-color 0.1s, background 0.1s;
    }
    button:hover:not(:disabled) { color: var(--text); border-color: var(--text); }
    button.primary { border-color: var(--accent); color: var(--accent); }
    button.primary:hover:not(:disabled) { background: var(--accent-filled); color: #fff; }
    button.delete-btn { border-color: var(--red); color: var(--red); margin-left: auto; }
    button.delete-btn:hover:not(:disabled) { background: var(--red); color: #fff; }
    .date-presets { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 6px; }
    .date-presets button { width: auto; }
    .end-at-wrap { margin-top: 6px; }
    #imageUrlWrap {
      overflow: hidden;
      max-height: 100px;
      opacity: 1;
      transition: opacity 0.2s ease, max-height 0.25s ease;
    }
    #imageUrlWrap.image-url-hidden {
      opacity: 0;
      max-height: 0;
      pointer-events: none;
    }
    .clear-dates-wrap { margin-top: 6px; }
    .clear-dates-btn { padding: 2px 0; font-size: 10px; color: var(--muted); border: none; background: none; cursor: pointer; text-decoration: underline; }
    .clear-dates-btn:hover { color: var(--text); }

    .form-actions { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin: 0; padding: 0; position: relative; }
    .form-actions .delete-btn { margin-left: 0; }
    .form-actions-right { display: flex; align-items: center; gap: 12px; margin-left: auto; }
    .active-inactive-toggle {
      display: flex; width: 100%; margin-top: 12px; border: 1px solid var(--border);
    }
    .active-inactive-btn {
      flex: 1; padding: 10px 16px; font-size: 13px; font-weight: 500;
      border: none; background: transparent; color: var(--muted);
      cursor: pointer; transition: color 0.15s, background 0.15s;
    }
    .active-inactive-btn:first-child { border-right: none; }
    .active-inactive-btn:hover { color: var(--text); }
    .active-inactive-btn.active { background: rgba(34,197,94,0.12); color: var(--green); }
    .active-inactive-btn:last-child.active { background: rgba(115,115,115,0.15); color: var(--muted); }

    .tier-toggle {
      display: flex; width: 100%; margin-top: 12px; border: 1px solid var(--border);
    }
    .schedule-group { gap: 8px; }
    .schedule-group .date-presets { margin-top: 8px; margin-bottom: 0; }
    .tier-btn {
      flex: 1; padding: 10px 16px; font-size: 13px; font-weight: 500;
      border: none; background: transparent; color: var(--muted);
      cursor: pointer; transition: color 0.15s, background 0.15s;
    }
    .tier-btn:not(:last-child) { border-right: none; }
    .tier-btn:hover { color: var(--text); }
    .tier-btn.active { background: rgba(20,184,166,0.12); color: var(--accent); }
    .unsaved-indicator { font-size: 11px; color: var(--yellow); position: absolute; left: 50%; transform: translateX(-50%); pointer-events: none; }
    .save-status { font-size: 11px; color: var(--muted); position: absolute; left: 50%; transform: translateX(-50%); pointer-events: none; }
    .save-status.status-ok { color: var(--green); }
    .save-status.status-err { color: var(--red); }

    #adCards { display: flex; flex-direction: column; gap: 4px; }
    .ad-cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 10px;
      min-width: 0;
    }
    .ad-cards-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
    .main-toolbar {
      display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
      margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--border);
    }
    .toolbar-search { flex: 1; min-width: 180px; max-width: 360px; margin: 0; }
    .toolbar-filters { display: flex; flex-wrap: wrap; gap: 4px; }
    .ad-cards-group-new .ad-card-wrap { max-width: 160px; }
    .new-ad-card { justify-content: center; align-items: center; text-align: center; color: var(--muted); min-height: 80px; padding-right: 12px; }
    .new-ad-card:hover { border-color: var(--accent); color: var(--accent); background: rgba(20,184,166,0.08); }
    .new-ad-plus { font-size: 20px; line-height: 1; }
    .new-ad-label { font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; }
    .ads-status-filters { display: flex; flex-wrap: wrap; gap: 4px; }
    .status-filter { padding: 4px 8px; font-size: 10px; }
    .status-filter.active { border-color: var(--accent); color: var(--accent); }
    .ad-cards-group:last-child { margin-bottom: 0; }
    .ad-cards-group-label { font-size: 10px; color: var(--muted); letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 2px; }
    .ad-card-wrap { position: relative; min-width: 0; height: 100%; }
    .ad-card-wrap .ad-card { position: relative; min-width: 0; min-height: 80px; width: 100%; height: 100%; }
    .ad-card-action {
      position: absolute; top: 8px; right: 8px;
      padding: 6px 10px; font-size: 12px;
      display: flex; align-items: center; gap: 6px;
 z-index: 1; flex-shrink: 0;
    }
    .ad-card-action-icon-wrap { position: relative; display: inline-flex; width: 14px; height: 14px; align-items: center; justify-content: center; }
    .ad-card-action-icon { font-size: 14px; line-height: 1; transition: opacity 0.15s; }
    .ad-card-action-icon-action { position: absolute; opacity: 0; }
    .ad-card-action:hover .ad-card-action-icon-state { opacity: 0; }
    .ad-card-action:hover .ad-card-action-icon-action { opacity: 1; }
    .ad-card-action-live { color: var(--green); background: rgba(34,197,94,0.15); border-color: rgba(34,197,94,0.4); }
    .ad-card-action-paused { color: var(--yellow); background: rgba(234,179,8,0.15); border-color: rgba(234,179,8,0.4); }
    .ad-card-action-live:hover,
    .ad-card-action-live:focus-visible {
      background: rgba(234,179,8,0.2) !important; border-color: var(--yellow) !important; color: var(--yellow) !important;
    }
    .ad-card-action-paused:hover,
    .ad-card-action-paused:focus-visible {
      background: rgba(34,197,94,0.2) !important; border-color: var(--green) !important; color: var(--green) !important;
    }
    .ad-card {
      display: flex; flex-direction: column; align-items: flex-start; gap: 4px;
      padding: 10px 12px; padding-right: 56px; border: 1px solid var(--border); background: var(--surface);
      color: var(--text); font: inherit; text-align: left; cursor: pointer;
      transition: border-color 0.15s, background 0.15s; box-sizing: border-box;
    }
    .ad-card:hover { border-color: var(--text); }
    .ad-card.selected { border-color: var(--accent); background: rgba(20,184,166,0.08); }
    .ad-card-head { font-weight: 500; font-size: 11px; }
    .ad-card-dates { font-size: 10px; color: var(--muted); }
    .ad-card-stats { font-size: 10px; color: var(--green); display: block; margin-top: 2px; }
    .ad-card-tier { font-size: 9px; color: var(--muted); text-transform: uppercase; }
    .ad-kpi-box { margin-bottom: 16px; padding: 10px 12px; background: var(--bg); border: 1px solid var(--border); }
    .ad-kpi-box .group-label { margin-bottom: 8px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px 16px; }
    .kpi-item { display: flex; flex-direction: column; gap: 2px; }
    .kpi-label { font-size: 9px; color: var(--muted); text-transform: uppercase; }
    .kpi-value { font-size: 13px; font-weight: 500; color: var(--green); }
    .chip { font-size: 10px; font-weight: 500; padding: 2px 6px; border: 1px solid transparent; line-height: 1.5; }
    .chip-live { color: var(--green); background: rgba(34,197,94,0.15); border-color: rgba(34,197,94,0.3); }
    .chip-scheduled { color: var(--accent); background: rgba(20,184,166,0.15); border-color: rgba(20,184,166,0.3); }
    .chip-ended { color: var(--muted); background: rgba(115,115,115,0.1); opacity: 0.9; }
    .chip-paused { color: var(--yellow); background: rgba(234,179,8,0.15); border-color: rgba(234,179,8,0.3); }

    #adCards.loading, #calendarWrap.loading { opacity: 0.6; pointer-events: none; }
    .calendar-empty { margin-top: 16px; padding: 24px; border: 1px dashed var(--border); background: var(--surface); text-align: center; max-width: 240px; }
    .calendar-empty-text { color: var(--muted); font-size: 13px; margin: 0; }
    .calendar-wrap { margin-top: 16px; border: 1px solid var(--border); background: var(--surface); padding: 18px 22px; width: 100%; min-width: 340px; max-width: 100%; }
    .calendar-header { display: flex; align-items: center; justify-content: center; gap: 20px; margin-bottom: 14px; }
    .cal-month-label { font-size: 15px; font-weight: 500; color: var(--text); margin: 0; }
    .cal-nav { padding: 4px 10px; font-size: 11px; background: transparent; border: 1px solid var(--border); color: var(--muted); cursor: pointer; }
    .cal-nav.cal-today { margin-left: 8px; }
    .cal-nav:hover { color: var(--text); border-color: var(--text); }
    .calendar-grid { display: flex; flex-direction: column; gap: 0; }
    .cal-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); font-size: 10px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; padding-bottom: 8px; border-bottom: 1px solid var(--border); }
    .cal-weekdays span { text-align: center; }
    .cal-days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 1px; background: var(--border); width: 100%; }
    .cal-cell { min-height: 80px; height: auto; padding: 10px; background: var(--surface); display: flex; flex-direction: column; font-size: 11px; }
    .cal-cell.other-month { background: var(--bg); }
    .cal-cell.other-month .cal-cell-num { color: var(--muted); opacity: 0.6; }
    .cal-cell.today { outline: 1px solid var(--accent); outline-offset: -1px; z-index: 1; }
    .cal-cell.today .cal-cell-num { color: var(--accent); font-weight: 500; }
    .cal-cell.has-conflict { outline: 1px dashed var(--yellow); outline-offset: -1px; }
    .cal-cell-num { font-size: 12px; color: var(--text); margin-bottom: 4px; }
    .cal-cell-ads { display: flex; flex-wrap: wrap; gap: 2px; align-content: flex-start; overflow: hidden; }
    .cal-ad-pill { font-size: 10px; padding: 5px 8px; min-height: 28px; border: none; cursor: pointer; font-family: var(--font); text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
    .cal-ad-pill.chip-live { background: rgba(34,197,94,0.2); color: var(--green); }
    .cal-ad-pill.chip-scheduled { background: rgba(20,184,166,0.2); color: var(--accent); }
    .cal-ad-pill.chip-ended { background: rgba(102,102,102,0.2); color: var(--muted); }
    .cal-ad-pill.chip-paused { background: rgba(251,191,36,0.2); color: var(--yellow); }
    .cal-ad-pill:hover { opacity: 0.9; }
    .cal-ad-pill.selected { outline: 1px solid var(--text); outline-offset: 1px; }
    .cal-legend { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border); font-size: 10px; color: var(--muted); }
    .cal-legend-dot { display: inline-block; width: 6px; height: 6px; margin-right: 4px; vertical-align: middle; }
    .cal-legend-dot.live { background: var(--green); }
    .cal-legend-dot.scheduled { background: var(--accent); }
    .cal-legend-dot.ended { background: var(--muted); }
    .cal-legend-dot.paused { background: var(--yellow); }

    .admin-editor-grid { display: grid; grid-template-columns: 1fr minmax(280px, 393px); gap: 20px; min-width: 0; }
    .preview-pane { position: sticky; top: 0; align-self: start; padding-top: 0; }
    .preview-pane > :first-child { margin-top: 0; }
    .id-version-row { display: flex; flex-direction: row; gap: 8px; }
    .id-version-row input:first-child { flex: 1; min-width: 0; }
    .id-version-row .version-input { width: 64px; min-width: 64px; flex-shrink: 0; }
    .id-version-header { min-width: 0; max-width: 320px; justify-self: center; }
    .id-version-header input { min-height: 36px; padding: 6px 10px; font-size: 13px; }
    .ad-preview { border: 1px solid var(--border); padding: 0; background: var(--surface); min-height: 8rem; overflow: hidden; }
    .preview { display: flex; flex-direction: column; align-items: flex-start; gap: 12px; font-size: 14px; text-align: left; width: 100%; max-width: 100%; }
    .preview.preview-text { padding: 16px; }
    .preview.preview-banner .preview-copy-block,
    .preview.preview-feature .preview-copy-block { padding: 14px 16px; display: flex; flex-direction: column; gap: 12px; width: 100%; }
    .preview-sponsor-line { display: flex; align-items: center; gap: 8px; }
    .preview-sponsor { font-size: 13px; color: var(--muted); }
    .preview-logo { width: 24px; height: 24px; object-fit: contain; flex-shrink: 0; }
    .preview-copy { display: flex; flex-direction: column; gap: 10px; width: 100%; }
    .preview-headline { font-size: 17px; font-weight: 600; line-height: 1.3; }
    .preview-subline { font-size: 14px; color: var(--muted); line-height: 1.4; }
    .preview-cta-wrap {
      display: flex; align-items: center; justify-content: center; gap: 6px;
      width: 100%; padding: 10px 0;
      color: var(--cta-orange); background: rgba(232, 119, 34, 0.12);
      font-size: 14px; font-weight: 500; cursor: default; border: none;
    }
    .preview-cta-arrow { font-size: 12px; opacity: 0.9; }
    .preview-img-wrap { width: 100%; overflow: hidden; position: relative; background: var(--border); }
    .preview-img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .preview-img-wrap.preview-img-error { background: var(--border); }
    .preview-img-wrap.preview-img-error .preview-img { display: none; }
    .preview-img-placeholder { width: 100%; background: var(--border); display: flex; align-items: center; justify-content: center; font-size: 12px; color: var(--muted); }

    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-thumb { background: var(--border); }

    .flatpickr-calendar { z-index: 99999; }
    .flatpickr-day.selected, .flatpickr-day.startRange, .flatpickr-day.endRange { background: var(--accent) !important; border-color: var(--accent) !important; }
    .flatpickr-day:hover { background: var(--border) !important; border-color: var(--border) !important; }
    #start_at[readonly], #end_at[readonly] { cursor: pointer; }

    @media (min-width: 900px) {
      .schedule-grid { grid-template-columns: 1fr minmax(420px, 560px); }
    }
    @media (min-width: 1200px) {
      .schedule-grid { grid-template-columns: 1fr minmax(480px, 640px); }
      .cal-cell { min-height: 88px; }
      .cal-ad-pill { font-size: 11px; min-height: 30px; }
    }

    @media (max-width: 768px) {
      .admin-editor-grid { grid-template-columns: 1fr; }
      .preview-pane { position: static; }
      .calendar-wrap { max-width: 100%; padding: 10px 12px; min-width: 300px; }
      .cal-cell { min-height: 56px; padding: 6px; }
      .cal-cell-num { font-size: 10px; }
      .cal-ad-pill { font-size: 8px; padding: 0 3px; }
    }
    @media (max-width: 640px) {
      .dashboard-wrap { grid-template-rows: 40px 1fr; }
      .main { padding: 12px 16px; }
      .overview-status-banner { padding: 10px 12px; margin-bottom: 12px; }
      .status-banner-text { font-size: 12px; }
      .status-banner-sub { font-size: 10px; }
      .calendar-wrap { margin-top: 12px; min-width: 260px; }
      .cal-cell { min-height: 50px; padding: 5px; font-size: 9px; }
      .cal-legend { margin-top: 10px; padding-top: 10px; gap: 8px; font-size: 9px; }
      .ad-card { padding: 8px 10px; min-width: 0; }
      .ad-card-head { font-size: 10px; }
      .form-actions, .form-actions-right { gap: 8px; }
    }
    @media (max-width: 400px) {
      .topbar { padding: 0 8px; gap: 6px; }
      .topbar-sub { display: none; }
      .topbar-sep { display: none; }
    }
  </style>
</body>
</html>`;

export function getAdminHtml(): string {
  return ADMIN_HTML;
}
