/** Campaign schedule, calendar, and creative editor (ads CRUD against /api/admin/ads). */
export const SCHEDULE_MARKUP = `
        <div class="campaign-section-heading"><h2>Schedule & creative</h2><p class="analytics-note">Create and edit campaigns, or review their scheduled dates.</p></div>
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
`;

export const EDITOR_OVERLAY_MARKUP = `
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
              <label class="field-label" for="start_at">Start at (optional)</label>
              <input type="text" id="start_at" name="start_at" placeholder="Pick date & time" readonly>
              <div id="endAtWrap" class="end-at-wrap" hidden>
                <label class="field-label" for="end_at">End at (optional)</label>
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
                <label class="field-label" for="sponsor">Sponsor</label>
                <input type="text" id="sponsor" name="sponsor" required placeholder="e.g. Acme Corp">
                <span class="field-error" id="err-sponsor"></span>
              </div>
              <div class="field">
                <label class="field-label" for="sponsored_label">Content label</label>
                <select id="sponsored_label" name="sponsored_label">
                  <option value="Sponsored">Sponsored</option>
                  <option value="Partner">Partner</option>
                  <option value="Student Organization">Student Organization</option>
                  <option value="">None</option>
                </select>
              </div>
              <div class="field">
                <label class="field-label" for="headline">Headline</label>
                <input type="text" id="headline" name="headline" required placeholder="e.g. Your headline here">
                <span class="field-error" id="err-headline"></span>
              </div>
              <div class="field">
                <label class="field-label" for="subline">Subline (optional)</label>
                <input type="text" id="subline" name="subline" placeholder="e.g. 123 Main St · Open 7am–10pm">
              </div>
              <div class="field">
                <label class="field-label" for="cta">Link button text</label>
                <input type="text" id="cta" name="cta" required placeholder="e.g. Learn more">
                <span class="field-error" id="err-cta"></span>
              </div>
              <div class="field">
                <label class="field-label" for="destination_url">Destination URL (HTTPS)</label>
                <input type="url" id="destination_url" name="destination_url" required placeholder="https://">
                <span class="field-error" id="err-destination_url"></span>
              </div>
              <div class="field" id="imageUrlWrap">
                <label class="field-label" for="image_url">Image URL (required for banner/feature)</label>
                <input type="url" id="image_url" name="image_url" placeholder="https://">
                <span class="field-error" id="err-image_url"></span>
              </div>
              <div class="field">
                <label class="field-label" for="logo_url">Logo URL (optional)</label>
                <input type="url" id="logo_url" name="logo_url" placeholder="https://">
              </div>
              <div id="placementWrap" class="placement-wrap" hidden>
                <label class="field-label" for="placement">Placement</label>
                <select id="placement" name="placement">
                  <option value="home_feed">Main feed</option>
                </select>
              </div>
              <input type="hidden" id="tier" name="tier" value="banner">
            </div>
          </form>
          <aside class="preview-pane">
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

`;

export const EDITOR_SCRIPT = String.raw`
    const API_URL = '/api/admin/ads';

    const fpDefaults = {
      enableTime: true,
      time_24hr: true,
      dateFormat: 'Y-m-d\\TH:i',
      minuteIncrement: 5,
      disableMobile: true,
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
        const normalized = {
          ...item,
          id: id.trim(),
          sponsor: typeof item.sponsor === 'string' && item.sponsor.trim() ? item.sponsor : '(no sponsor)',
          headline: typeof item.headline === 'string' && item.headline.trim() ? item.headline : '(no headline)',
          cta: typeof item.cta === 'string' && item.cta.trim() ? item.cta : 'Learn more',
          active: typeof item.active === 'boolean' ? item.active : false,
          tier: typeof item.tier === 'string' && item.tier.trim() ? item.tier.toLowerCase() : 'banner',
        };
        result.push(normalized);
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

    let calViewYear = Number.isInteger(dashboardPrefs.calendarYear) && dashboardPrefs.calendarYear >= 1970 && dashboardPrefs.calendarYear <= 9999 ? dashboardPrefs.calendarYear : new Date().getFullYear();
    let calViewMonth = Number.isInteger(dashboardPrefs.calendarMonth) && dashboardPrefs.calendarMonth >= 0 && dashboardPrefs.calendarMonth <= 11 ? dashboardPrefs.calendarMonth : new Date().getMonth();
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
    let adsFilterStatus = ['all','live','scheduled','paused','ended'].includes(dashboardPrefs.adStatus) ? dashboardPrefs.adStatus : 'all';
    let adsSearchQuery = typeof dashboardPrefs.adSearch === 'string' ? dashboardPrefs.adSearch.slice(0,200) : '';
    document.getElementById('adsSearch').value = adsSearchQuery;
    document.querySelectorAll('.status-filter').forEach(button => button.classList.toggle('active',button.dataset.filter === adsFilterStatus));

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
            '<span class="ad-card-tier">' + (ad.tier || 'banner') + '</span>' +
            '</div>';
          const cardEl = card.querySelector('.ad-card');
          if (!cardEl) {
            console.warn('Admin: could not build card DOM for ad', ad.id);
            return;
          }
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
      if (index >= 0 && scheduledAds[index]) { reportingCampaignId = scheduledAds[index].id; saveDashboardPrefs({campaign:reportingCampaignId}); renderCampaignReporting(scheduledAds); }
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
      if (!cta) { setFieldError('cta', 'Link button text is required'); return false; }
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
        document.getElementById('sponsored_label').value = 'Sponsored';
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
        document.getElementById('sponsored_label').value = data.sponsored_label ?? 'Sponsored';
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
        sponsored_label: document.getElementById('sponsored_label').value,
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
      adPreview.innerHTML = renderAdPreview({ ...d,
        sponsor: d.sponsor || getPlaceholder('sponsor'),
        headline: d.headline || getPlaceholder('headline'),
        cta: d.cta || getPlaceholder('cta')
      });
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
      saveDashboardPrefs({adSearch:adsSearchQuery});
      renderAdCards();
    });
    document.querySelectorAll('.status-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.status-filter').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        adsFilterStatus = btn.dataset.filter || 'all';
        saveDashboardPrefs({adStatus:adsFilterStatus});
        renderAdCards();
      });
    });

    document.getElementById('calPrev').addEventListener('click', () => {
      if (calViewMonth === 0) { calViewMonth = 11; calViewYear--; } else calViewMonth--;
      saveDashboardPrefs({calendarYear:calViewYear,calendarMonth:calViewMonth});
      renderCalendar();
    });
    document.getElementById('calNext').addEventListener('click', () => {
      if (calViewMonth === 11) { calViewMonth = 0; calViewYear++; } else calViewMonth++;
      saveDashboardPrefs({calendarYear:calViewYear,calendarMonth:calViewMonth});
      renderCalendar();
    });
    document.getElementById('calToday').addEventListener('click', () => {
      const now = new Date();
      calViewYear = now.getFullYear();
      calViewMonth = now.getMonth();
      saveDashboardPrefs({calendarYear:calViewYear,calendarMonth:calViewMonth});
      renderCalendar();
    });

    async function loadSchedule() {
      setStatus(fetchStatus, 'Connecting…', true);
      document.getElementById('adCards').classList.add('loading');
      document.getElementById('calendarWrap').classList.add('loading');
      try {
        const res = await fetchWithRetry(API_URL, { credentials: 'include' });
        const contentType = (res.headers.get('content-type') || '').toLowerCase();
        const bodyText = await res.text();
        let data = {};
        let jsonParseOk = true;
        if (bodyText) {
          try {
            data = JSON.parse(bodyText);
          } catch (_) {
            jsonParseOk = false;
            data = {};
          }
        }
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
        const expectJson = contentType.includes('application/json');
        const looksLikeAdsApi =
          data && typeof data === 'object' &&
          (Array.isArray(data.ads) || data.id != null || data.error !== undefined);
        if (!jsonParseOk || (bodyText && !expectJson && !looksLikeAdsApi)) {
          document.getElementById('adCards').classList.remove('loading');
          document.getElementById('calendarWrap').classList.remove('loading');
          setStatus(fetchStatus, 'Not connected', false);
          showErrorBanner(
            'Ads API did not return JSON',
            'Open this page at <strong>https://gymtracker.jackhannon.net/admin</strong> (not another domain). In Zero Trust, include path <code>/api/admin</code> on the same Access app as <code>/admin</code>. Then hard-refresh.'
          );
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
        loadAnalyticsStats();
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
        sponsored_label: document.getElementById('sponsored_label').value,
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
`;
