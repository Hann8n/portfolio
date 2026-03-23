/** Admin UI HTML — served at /admin, uses Cloudflare Access for auth. */
export const ADMIN_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Gym Tracker Ads Admin</title>
  <style>@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&display=swap');</style>
</head>
<body>
  <div class="dashboard-wrap">
  <div class="topbar">
    <span class="topbar-title">Gym Tracker</span>
    <span class="topbar-sep">/</span>
    <span class="topbar-sub">ads admin</span>
    <div class="status">
      <div class="dot" id="statusDot"></div>
      <span class="status-text" id="fetchStatus">—</span>
    </div>
  </div>
  <div class="sidebar">
    <div class="group">
      <div class="group-label">status</div>
      <div class="kv"><span class="kv-k">total</span><span class="kv-v" id="sidebarTotal">0</span></div>
      <div class="kv"><span class="kv-k">live</span><span class="kv-v" id="sidebarLive">0</span></div>
      <div class="kv"><span class="kv-k">scheduled</span><span class="kv-v" id="sidebarScheduled">0</span></div>
      <div class="kv"><span class="kv-k">ended</span><span class="kv-v" id="sidebarEnded">0</span></div>
    </div>
    <button type="button" id="refreshBtn" class="primary">Refresh</button>
    <button type="button" id="newAdBtn" class="primary">New ad</button>
  </div>
  <div class="main">
    <div class="tabs">
      <button type="button" class="tab active" id="tabBtnOverview">overview</button>
      <button type="button" class="tab" id="tabBtnSchedule">schedule <span class="badge" id="tabScheduleBadge">0</span></button>
    </div>
    <div class="panel active" id="tab-overview">
      <div class="overview-status-banner" id="overviewStatusBanner">
        <div class="status-banner-dot pending" id="overviewStatusDot"></div>
        <div>
          <div class="status-banner-text" id="overviewStatusText">Loading…</div>
          <div class="status-banner-sub" id="overviewStatusSub">Fetching ads</div>
        </div>
      </div>
      <div id="calendarWrap" class="calendar-wrap" hidden>
        <div class="calendar-header">
          <button type="button" id="calPrev" class="cal-nav" title="Previous month">◀</button>
          <h3 class="cal-month-label" id="calMonthLabel"></h3>
          <button type="button" id="calNext" class="cal-nav" title="Next month">▶</button>
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
      <div class="overview-actions">
        <button type="button" id="overviewRefreshBtn">Refresh</button>
        <button type="button" id="overviewNewAdBtn" class="btn-as-link">New ad</button>
      </div>
    </div>
    <div class="panel" id="tab-schedule">
      <section class="admin-section">
        <div class="group-label" id="adsHeader">Ads</div>
        <div id="adCards" class="ad-cards"></div>
      </section>

      <div class="admin-editor-grid">
        <form id="adForm" class="admin-form">
          <div class="group">
            <div class="group-label">Identity</div>
            <div class="field-label">ID (unique, e.g. sponsor-2025-q1)</div>
            <input type="text" id="id" name="id" required>
            <div class="field-label">Tier</div>
            <select id="tier" name="tier">
              <option value="text">text</option>
              <option value="banner">banner</option>
              <option value="feature">feature</option>
            </select>
            <label class="checkbox-label"><input type="checkbox" id="active" name="active" checked> Active</label>
          </div>
          <div class="group">
            <div class="group-label">Creative</div>
            <div class="field-label">Sponsor</div>
            <input type="text" id="sponsor" name="sponsor" required>
            <div class="field-label">Headline</div>
            <input type="text" id="headline" name="headline" required>
            <div class="field-label">Subline (optional)</div>
            <input type="text" id="subline" name="subline">
            <div class="field-label">CTA</div>
            <input type="text" id="cta" name="cta" required>
            <div class="field-label">Image URL (required for banner/feature)</div>
            <input type="url" id="image_url" name="image_url" placeholder="https://">
            <div class="field-label">Logo URL (optional)</div>
            <input type="url" id="logo_url" name="logo_url" placeholder="https://">
          </div>
          <div class="group">
            <div class="group-label">Schedule</div>
            <div class="date-presets">
              <button type="button" data-preset="7d">Next 7 days</button>
              <button type="button" data-preset="30d">Next 30 days</button>
            </div>
            <div class="field-label">Start at (optional)</div>
            <input type="datetime-local" id="start_at" name="start_at">
            <div class="field-label">End at (optional)</div>
            <input type="datetime-local" id="end_at" name="end_at">
            <div id="clearDatesWrap" class="clear-dates-wrap" hidden>
              <button type="button" id="clearDatesBtn" class="clear-dates-btn">Clear</button>
            </div>
          </div>
          <div class="group">
            <div class="group-label">Advanced</div>
            <div class="field-label">Destination URL (HTTPS)</div>
            <input type="url" id="destination_url" name="destination_url" required placeholder="https://">
            <div class="field-label">Placement</div>
            <input type="text" id="placement" name="placement" value="home_feed">
            <div class="field-label">Creative version (optional)</div>
            <input type="text" id="creative_version" name="creative_version">
          </div>
          <div class="form-actions">
            <button type="submit" id="saveBtn" class="primary">Save</button>
            <button type="button" id="cloneBtn">Clone</button>
            <button type="button" id="deleteBtn" class="delete-btn" disabled>Delete</button>
            <span id="saveStatus" class="save-status"></span>
          </div>
        </form>
        <aside class="preview-pane">
          <div id="adKpiBox" class="ad-kpi-box" hidden>
            <div class="group-label">KPI (last 7d)</div>
            <div class="kpi-grid" id="adKpiGrid"></div>
          </div>
          <div class="group-label">Preview</div>
          <div id="adPreview" class="ad-preview"></div>
        </aside>
      </div>

      <p class="footer"><a href="https://jackhannon.net/">Back to jackhannon.net</a></p>
    </div>
  </div>
  </div>

  <script>
    const API_URL = '/api/admin/ads';

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

    let scheduledAds = [];
    let selectedIndex = -1;
    let formDirty = false;
    let previewDebounce = null;
    let perAdStats = [];

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
      const c = countByStatus();
      const totalEl = document.getElementById('sidebarTotal');
      const liveEl = document.getElementById('sidebarLive');
      const scheduledEl = document.getElementById('sidebarScheduled');
      const endedEl = document.getElementById('sidebarEnded');
      if (totalEl) totalEl.textContent = String(c.total);
      if (liveEl) liveEl.textContent = String(c.live);
      if (scheduledEl) scheduledEl.textContent = String(c.scheduled);
      if (endedEl) endedEl.textContent = String(c.ended);
      const badge = document.getElementById('tabScheduleBadge');
      if (badge) badge.textContent = String(c.total);
      const banner = document.getElementById('overviewStatusBanner');
      const bannerText = document.getElementById('overviewStatusText');
      const bannerSub = document.getElementById('overviewStatusSub');
      const bannerDot = document.getElementById('overviewStatusDot');
      if (banner && bannerText && bannerSub && bannerDot) {
        banner.className = 'overview-status-banner operational';
        bannerText.textContent = formatStatusSummary(c);
        bannerSub.textContent = '';
        bannerSub.hidden = true;
        bannerDot.className = 'status-banner-dot ok';
      }
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
      const bannerText = document.getElementById('overviewStatusText');
      const bannerSub = document.getElementById('overviewStatusSub');
      if (!bannerText || !bannerSub) return;
      try {
        const res = await fetch('/api/admin/stats', { credentials: 'include' });
        const data = await res.json();
        perAdStats = Array.isArray(data.per_ad) ? data.per_ad : [];
        if (data.configured && typeof data.impressions === 'number' && typeof data.clicks === 'number') {
          const ctr = typeof data.ctr_percent === 'number' ? data.ctr_percent.toFixed(1) : '0';
          bannerText.textContent = 'Last 7d: ' + data.impressions + ' impressions · ' + data.clicks + ' clicks · ' + ctr + '% CTR';
          bannerSub.textContent = '';
          bannerSub.hidden = true;
        }
        renderAdCards();
        updateAdKpiBox();
      } catch (_) {
        perAdStats = [];
        bannerSub.textContent = 'Analytics unavailable';
        bannerSub.hidden = false;
      }
    }

    function switchTab(name, btn) {
      document.querySelectorAll('.tabs > .tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.main > .panel').forEach(p => p.classList.remove('active'));
      if (btn) btn.classList.add('active');
      const panel = document.getElementById('tab-' + name);
      if (panel) panel.classList.add('active');
    }

    function goToNewAd() {
      if (formDirty && !confirm('Discard unsaved changes?')) return;
      selectAd(-1);
      switchTab('schedule', document.getElementById('tabBtnSchedule'));
    }

    function renderAdCards() {
      const adsHeader = document.getElementById('adsHeader');
      if (adsHeader) adsHeader.hidden = scheduledAds.length === 0;
      adCards.innerHTML = '';
      scheduledAds.forEach((ad, i) => {
        const status = adStatus(ad);
        const stats = getAdStats(ad.id);
        const statsLine = stats
          ? '<span class="ad-card-stats">' + formatCompact(stats.impressions) + ' imp · ' + formatCompact(stats.clicks) + ' clk · ' + stats.ctr_percent.toFixed(1) + '% CTR</span>'
          : '';
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'ad-card' + (selectedIndex === i ? ' selected' : '');
        card.innerHTML = '<span class="ad-card-head">' + escapeHtml(ad.sponsor) + ' — ' + escapeHtml(ad.id) + '</span>' +
          '<span class="chip ' + statusClass(status) + '">' + status + '</span>' +
          '<span class="ad-card-dates">' + formatDateRange(ad) + '</span>' +
          (statsLine ? statsLine : '') +
          '<span class="ad-card-tier">' + (ad.tier || 'banner') + '</span>';
        card.addEventListener('click', () => selectAd(i));
        adCards.appendChild(card);
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
        const cellClass = 'cal-cell' + (isCurrentMonth ? '' : ' other-month') + (isToday ? ' today' : '');

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
          selectAd(parseInt(btn.dataset.adIndex, 10));
          switchTab('schedule', document.getElementById('tabBtnSchedule'));
        });
      });
    }

    function selectAd(index) {
      if (formDirty && !confirm('Discard unsaved changes?')) return;
      formDirty = false;
      selectedIndex = index;
      renderAdCards();
      renderCalendar();
      if (index === -1) {
        clearForm();
        setStatus(saveStatus, '', undefined);
      } else {
        populateForm(scheduledAds[index]);
      }
      updateClearDatesVisibility();
      updateDeleteButton();
      updatePreview();
      updateAdKpiBox();
    }

    function markDirty() { formDirty = true; }

    function clearForm() {
      document.getElementById('id').value = '';
      document.getElementById('tier').value = 'banner';
      document.getElementById('active').checked = true;
      document.getElementById('sponsor').value = '';
      document.getElementById('headline').value = '';
      document.getElementById('subline').value = '';
      document.getElementById('cta').value = '';
      document.getElementById('destination_url').value = '';
      document.getElementById('image_url').value = '';
      document.getElementById('logo_url').value = '';
      document.getElementById('placement').value = 'home_feed';
      document.getElementById('creative_version').value = '';
      document.getElementById('start_at').value = '';
      document.getElementById('end_at').value = '';
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
      document.getElementById('id').value = data.id || '';
      document.getElementById('tier').value = (data.tier || 'banner').toLowerCase();
      document.getElementById('active').checked = !!data.active;
      document.getElementById('sponsor').value = data.sponsor || '';
      document.getElementById('headline').value = data.headline || '';
      document.getElementById('subline').value = data.subline || '';
      document.getElementById('cta').value = data.cta || '';
      document.getElementById('destination_url').value = data.destination_url || '';
      document.getElementById('image_url').value = data.image_url || '';
      document.getElementById('logo_url').value = data.logo_url || '';
      document.getElementById('placement').value = data.placement || 'home_feed';
      document.getElementById('creative_version').value = data.creative_version || '';
      document.getElementById('start_at').value = isoToDatetimeLocal(data.start_at);
      document.getElementById('end_at').value = isoToDatetimeLocal(data.end_at);
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

    function updatePreview() {
      const d = getFormData();
      const tier = d.tier || 'banner';
      let html = '<div class="preview preview-' + tier + '">';
      if (tier === 'text') {
        html += '<span class="preview-sponsor">' + escapeHtml(d.sponsor) + '</span>';
        html += '<strong class="preview-headline">' + escapeHtml(d.headline) + '</strong>';
        if (d.subline) html += '<span class="preview-subline">' + escapeHtml(d.subline) + '</span>';
        html += '<button type="button" class="preview-cta" disabled>' + escapeHtml(d.cta || 'CTA') + '</button>';
      } else if (tier === 'banner') {
        if (d.image_url) html += '<img src="' + escapeHtml(d.image_url) + '" alt="" class="preview-img" onerror="this.style.display=\\'none\\'">';
        else html += '<div class="preview-img-placeholder">Image</div>';
        html += '<div class="preview-content"><strong>' + escapeHtml(d.headline) + '</strong><button type="button" class="preview-cta preview-cta-sm" disabled>' + escapeHtml(d.cta || 'CTA') + '</button></div>';
      } else {
        if (d.image_url) html += '<img src="' + escapeHtml(d.image_url) + '" alt="" class="preview-img preview-img-lg" onerror="this.style.display=\\'none\\'">';
        else html += '<div class="preview-img-placeholder preview-img-placeholder-lg">Image</div>';
        if (d.logo_url) html += '<img src="' + escapeHtml(d.logo_url) + '" alt="" class="preview-logo" onerror="this.style.display=\\'none\\'">';
        html += '<span class="preview-sponsor">' + escapeHtml(d.sponsor) + '</span>';
        html += '<strong class="preview-headline">' + escapeHtml(d.headline) + '</strong>';
        if (d.subline) html += '<span class="preview-subline">' + escapeHtml(d.subline) + '</span>';
        html += '<button type="button" class="preview-cta" disabled>' + escapeHtml(d.cta || 'CTA') + '</button>';
      }
      html += '</div>';
      adPreview.innerHTML = html;
    }

    function debouncePreview() {
      clearTimeout(previewDebounce);
      previewDebounce = setTimeout(updatePreview, 300);
    }

    function updateClearDatesVisibility() {
      const startVal = document.getElementById('start_at').value;
      const endVal = document.getElementById('end_at').value;
      const wrap = document.getElementById('clearDatesWrap');
      wrap.hidden = !startVal && !endVal;
    }

    function updateDeleteButton() {
      deleteBtn.disabled = selectedIndex === -1;
    }

    function clearDates() {
      document.getElementById('start_at').value = '';
      document.getElementById('end_at').value = '';
      updateClearDatesVisibility();
      markDirty();
      updatePreview();
    }

    document.querySelectorAll('[data-preset]').forEach(btn => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset;
        const now = new Date();
        if (preset === '7d') {
          document.getElementById('start_at').value = isoToDatetimeLocal(now.toISOString());
          const end = new Date(now);
          end.setDate(end.getDate() + 7);
          document.getElementById('end_at').value = isoToDatetimeLocal(end.toISOString());
        } else if (preset === '30d') {
          document.getElementById('start_at').value = isoToDatetimeLocal(now.toISOString());
          const end = new Date(now);
          end.setDate(end.getDate() + 30);
          document.getElementById('end_at').value = isoToDatetimeLocal(end.toISOString());
        }
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
      document.getElementById('start_at').value = isoToDatetimeLocal(start.toISOString());
      document.getElementById('end_at').value = isoToDatetimeLocal(end.toISOString());
      document.getElementById('active').checked = false;
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
      try {
        const res = await fetch(API_URL + '?id=' + encodeURIComponent(ad.id), {
          method: 'DELETE',
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) {
          setStatus(saveStatus, data.error || res.statusText, false);
          return;
        }
        setStatus(saveStatus, 'Deleted', true);
        formDirty = false;
        selectedIndex = -1;
        loadSchedule();
      } catch (err) {
        setStatus(saveStatus, err.message || 'Network error', false);
      }
    });

    form.querySelectorAll('input, select').forEach(el => {
      el.addEventListener('input', () => { markDirty(); debouncePreview(); });
      el.addEventListener('change', () => { markDirty(); debouncePreview(); });
    });

    window.addEventListener('beforeunload', (e) => { if (formDirty) e.preventDefault(); });

    refreshBtn.addEventListener('click', loadSchedule);
    document.getElementById('overviewRefreshBtn').addEventListener('click', loadSchedule);
    document.getElementById('newAdBtn').addEventListener('click', goToNewAd);
    document.getElementById('overviewNewAdBtn').addEventListener('click', goToNewAd);
    document.getElementById('tabBtnOverview').addEventListener('click', () => switchTab('overview', document.getElementById('tabBtnOverview')));
    document.getElementById('tabBtnSchedule').addEventListener('click', () => switchTab('schedule', document.getElementById('tabBtnSchedule')));

    document.getElementById('calPrev').addEventListener('click', () => {
      if (calViewMonth === 0) { calViewMonth = 11; calViewYear--; } else calViewMonth--;
      renderCalendar();
    });
    document.getElementById('calNext').addEventListener('click', () => {
      if (calViewMonth === 11) { calViewMonth = 0; calViewYear++; } else calViewMonth++;
      renderCalendar();
    });

    async function loadSchedule() {
      setStatus(fetchStatus, 'Connecting…', true);
      const banner = document.getElementById('overviewStatusBanner');
      const bannerText = document.getElementById('overviewStatusText');
      const bannerSub = document.getElementById('overviewStatusSub');
      const bannerDot = document.getElementById('overviewStatusDot');
      if (banner && bannerText && bannerSub && bannerDot) {
        banner.className = 'overview-status-banner loading';
        bannerText.textContent = 'Loading…';
        bannerSub.textContent = 'Fetching ads';
        bannerDot.className = 'status-banner-dot pending';
      }
      try {
        const res = await fetch(API_URL, { credentials: 'include' });
        const data = await res.json();
        if (!res.ok) {
          setStatus(fetchStatus, 'Not connected', false);
          return;
        }
        scheduledAds = Array.isArray(data.ads) ? data.ads : data.id != null ? [data] : [];
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
        const banner = document.getElementById('overviewStatusBanner');
        const bannerText = document.getElementById('overviewStatusText');
        const bannerSub = document.getElementById('overviewStatusSub');
        const bannerDot = document.getElementById('overviewStatusDot');
        if (banner && bannerText && bannerSub && bannerDot) {
          banner.className = 'overview-status-banner error';
          bannerText.textContent = 'Failed to load';
          bannerSub.textContent = err.message || 'Network error';
          bannerDot.className = 'status-banner-dot err';
        }
      }
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const tier = document.getElementById('tier').value;
      const payload = {
        id: document.getElementById('id').value.trim(),
        tier,
        active: document.getElementById('active').checked,
        sponsor: document.getElementById('sponsor').value.trim(),
        headline: document.getElementById('headline').value.trim(),
        subline: document.getElementById('subline').value.trim() || null,
        cta: document.getElementById('cta').value.trim(),
        destination_url: document.getElementById('destination_url').value.trim(),
        image_url: document.getElementById('image_url').value.trim() || null,
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
      try {
        const res = await fetch(API_URL, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) {
          setStatus(saveStatus, data.error || res.statusText, false);
          return;
        }
        setStatus(saveStatus, 'Saved', true);
        formDirty = false;
        loadSchedule();
      } catch (err) {
        setStatus(saveStatus, err.message || 'Network error', false);
      }
    });

    loadSchedule();
  </script>

  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #0f0f0f;
      --surface: #161616;
      --border: #2a2a2a;
      --text: #e0e0e0;
      --muted: #666;
      --accent: #7c6bff;
      --green: #4ade80;
      --red: #f87171;
      --yellow: #fbbf24;
      --font: 'IBM Plex Mono', monospace;
    }
    html { background: var(--bg); color: var(--text); font-family: var(--font); font-size: 12px; line-height: 1.5; -webkit-text-size-adjust: 100%; }
    body { height: 100vh; margin: 0; overflow: hidden; min-width: 0; }

    .dashboard-wrap {
      display: grid;
      grid-template-columns: minmax(0, 240px) 1fr;
      grid-template-rows: 40px 1fr;
      height: 100vh;
      min-height: 0;
    }
    .topbar {
      grid-column: 1 / -1;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0 12px;
      min-height: 40px;
      height: 40px;
      border-bottom: 1px solid var(--border);
      background: var(--surface);
      min-width: 0;
    }
    .topbar-title { font-size: 13px; font-weight: 500; white-space: nowrap; }
    .topbar-sep { color: var(--border); flex-shrink: 0; }
    .topbar-sub { color: var(--muted); font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .status { display: flex; align-items: center; gap: 6px; margin-left: auto; flex-shrink: 0; }
    .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--border); flex-shrink: 0; }
    .dot.on { background: var(--green); }
    .dot.err { background: var(--red); }
    .status-text { color: var(--muted); font-size: 11px; }
    .status-text.status-ok { color: var(--green); }
    .status-text.status-err { color: var(--red); }

    .sidebar {
      border-right: 1px solid var(--border);
      overflow-y: auto;
      overflow-x: hidden;
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: var(--surface);
      min-width: 0;
    }
    .sidebar button { width: 100%; min-height: 36px; }
    .kv { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
    .kv-k { color: var(--muted); white-space: nowrap; }
    .kv-v { color: var(--accent); font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: right; }

    .main { display: grid; grid-template-rows: auto 1fr; overflow: hidden; min-width: 0; min-height: 0; }
    .tabs {
      display: flex;
      border-bottom: 1px solid var(--border);
      background: var(--surface);
      padding: 0 12px;
      gap: 2px;
      align-items: stretch;
    }
    .tab {
      padding: 10px 14px;
      font-family: var(--font);
      font-size: 11px;
      color: var(--muted);
      cursor: pointer;
      border: none;
      background: none;
      border-bottom: 2px solid transparent;
      margin-bottom: -1px;
      width: auto;
      transition: color 0.1s, border-color 0.1s;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .tab:hover:not(:disabled) { color: var(--text); }
    .tab.active { color: var(--text); border-bottom-color: var(--accent); }
    .badge {
      background: var(--border);
      color: var(--muted);
      font-size: 9px;
      padding: 1px 5px;
      min-width: 16px;
      text-align: center;
    }
    .panel { display: none; overflow-y: auto; overflow-x: hidden; height: 100%; padding: 16px 20px; min-width: 0; }
    .panel.active { display: block; }

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
    .status-banner-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .status-banner-dot.ok { background: var(--green); }
    .status-banner-dot.pending { background: var(--muted); }
    .status-banner-dot.err { background: var(--red); }
    .status-banner-text { font-size: 13px; font-weight: 500; }
    .status-banner-sub { color: var(--muted); font-size: 11px; margin-top: 2px; }
    .overview-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
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
    .btn-as-link:hover { background: var(--accent); color: #fff; }

    .admin-section { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; min-width: 0; }

    .group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
    .group-label { font-size: 10px; color: var(--muted); letter-spacing: 0.08em; text-transform: uppercase; }
    .field-label { color: var(--muted); font-size: 10px; margin-bottom: 3px; }
    .checkbox-label { display: flex; align-items: center; gap: 8px; color: var(--text); font-size: 12px; cursor: pointer; }
    .checkbox-label input { width: auto; margin: 0; }

    input, select {
      width: 100%;
      min-width: 0;
      background: var(--bg);
      border: 1px solid var(--border);
      color: var(--text);
      font-family: var(--font);
      font-size: 12px;
      padding: 7px 10px;
      outline: none;
      transition: border-color 0.15s;
      margin-bottom: 4px;
    }
    input:focus, select:focus { border-color: var(--accent); }

    button {
      font-family: var(--font);
      font-size: 12px;
      padding: 7px 12px;
      cursor: pointer;
      border: 1px solid var(--border);
      background: transparent;
      color: var(--muted);
      transition: color 0.1s, border-color 0.1s, background 0.1s;
    }
    button:hover:not(:disabled) { color: var(--text); border-color: var(--text); }
    button.primary { border-color: var(--accent); color: var(--accent); }
    button.primary:hover:not(:disabled) { background: var(--accent); color: #fff; }
    button.delete-btn { border-color: var(--red); color: var(--red); margin-left: auto; }
    button.delete-btn:hover:not(:disabled) { background: var(--red); color: #fff; }
    .date-presets { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 6px; }
    .date-presets button { width: auto; }
    .clear-dates-wrap { margin-top: 6px; }
    .clear-dates-btn { padding: 2px 0; font-size: 10px; color: var(--muted); border: none; background: none; cursor: pointer; text-decoration: underline; }
    .clear-dates-btn:hover { color: var(--text); }

    .form-actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border); }
    .save-status { font-size: 11px; color: var(--muted); }
    .save-status.status-ok { color: var(--green); }
    .save-status.status-err { color: var(--red); }

    .ad-cards { display: flex; flex-wrap: wrap; gap: 8px; min-width: 0; }
    .ad-card {
      display: flex; flex-direction: column; align-items: flex-start; gap: 4px;
      padding: 10px 12px; border: 1px solid var(--border); background: var(--surface);
      color: var(--text); font: inherit; text-align: left; cursor: pointer;
      transition: border-color 0.1s, background 0.1s;
    }
    .ad-card:hover { border-color: var(--text); }
    .ad-card.selected { border-color: var(--accent); background: rgba(124,107,255,0.08); }
    .ad-card-head { font-weight: 500; font-size: 11px; }
    .ad-card-dates { font-size: 10px; color: var(--muted); }
    .ad-card-stats { font-size: 10px; color: var(--green); display: block; margin-top: 2px; }
    .ad-card-tier { font-size: 9px; color: var(--muted); text-transform: uppercase; }
    .ad-kpi-box { margin-bottom: 16px; padding: 10px 12px; background: var(--bg); border: 1px solid var(--border); border-radius: 6px; }
    .ad-kpi-box .group-label { margin-bottom: 8px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px 16px; }
    .kpi-item { display: flex; flex-direction: column; gap: 2px; }
    .kpi-label { font-size: 9px; color: var(--muted); text-transform: uppercase; }
    .kpi-value { font-size: 13px; font-weight: 500; color: var(--green); }
    .chip { font-size: 9px; padding: 1px 5px; border: 1px solid var(--border); color: var(--muted); line-height: 1.6; }
    .chip-live { color: var(--green); border-color: rgba(74,222,128,0.4); }
    .chip-scheduled { color: var(--accent); border-color: rgba(124,107,255,0.4); }
    .chip-ended { color: var(--muted); opacity: 0.8; }
    .chip-paused { color: var(--yellow); border-color: rgba(251,191,36,0.4); }

    .calendar-wrap { margin-top: 16px; border: 1px solid var(--border); background: var(--surface); padding: 12px 16px; width: 100%; max-width: 420px; }
    .calendar-header { display: flex; align-items: center; justify-content: center; gap: 16px; margin-bottom: 12px; }
    .cal-month-label { font-size: 13px; font-weight: 500; color: var(--text); margin: 0; }
    .cal-nav { padding: 4px 10px; font-size: 11px; background: transparent; border: 1px solid var(--border); color: var(--muted); cursor: pointer; }
    .cal-nav:hover { color: var(--text); border-color: var(--text); }
    .calendar-grid { display: flex; flex-direction: column; gap: 0; }
    .cal-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); font-size: 9px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; padding-bottom: 6px; border-bottom: 1px solid var(--border); }
    .cal-weekdays span { text-align: center; }
    .cal-days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 1px; background: var(--border); }
    .cal-cell { height: 52px; min-height: 52px; padding: 4px; background: var(--surface); display: flex; flex-direction: column; font-size: 10px; }
    .cal-cell.other-month { background: var(--bg); }
    .cal-cell.other-month .cal-cell-num { color: var(--muted); opacity: 0.6; }
    .cal-cell.today { outline: 1px solid var(--accent); outline-offset: -1px; z-index: 1; }
    .cal-cell.today .cal-cell-num { color: var(--accent); font-weight: 500; }
    .cal-cell-num { font-size: 11px; color: var(--text); margin-bottom: 4px; }
    .cal-cell-ads { display: flex; flex-wrap: wrap; gap: 2px; align-content: flex-start; overflow: hidden; }
    .cal-ad-pill { font-size: 9px; padding: 1px 4px; border: none; border-radius: 2px; cursor: pointer; font-family: var(--font); text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
    .cal-ad-pill.chip-live { background: rgba(74,222,128,0.2); color: var(--green); }
    .cal-ad-pill.chip-scheduled { background: rgba(124,107,255,0.2); color: var(--accent); }
    .cal-ad-pill.chip-ended { background: rgba(102,102,102,0.2); color: var(--muted); }
    .cal-ad-pill.chip-paused { background: rgba(251,191,36,0.2); color: var(--yellow); }
    .cal-ad-pill:hover { opacity: 0.9; }
    .cal-ad-pill.selected { outline: 1px solid var(--text); outline-offset: 1px; }
    .cal-legend { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border); font-size: 10px; color: var(--muted); }
    .cal-legend-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; margin-right: 4px; vertical-align: middle; }
    .cal-legend-dot.live { background: var(--green); }
    .cal-legend-dot.scheduled { background: var(--accent); }
    .cal-legend-dot.ended { background: var(--muted); }
    .cal-legend-dot.paused { background: var(--yellow); }

    .admin-editor-grid { display: grid; grid-template-columns: 1fr minmax(200px, 18rem); gap: 20px; min-width: 0; }
    .preview-pane { position: sticky; top: 20px; align-self: start; }
    .ad-preview { border: 1px solid var(--border); padding: 12px; background: var(--surface); min-height: 8rem; }
    .preview { display: flex; flex-direction: column; gap: 6px; font-size: 11px; }
    .preview-sponsor { font-size: 9px; text-transform: uppercase; color: var(--muted); }
    .preview-headline { font-weight: 500; }
    .preview-subline { font-size: 10px; color: var(--muted); }
    .preview-cta { padding: 4px 8px; background: var(--accent); color: #fff; border: none; font-size: 10px; cursor: default; width: auto; }
    .preview-cta-sm { padding: 2px 6px; font-size: 9px; }
    .preview-img { max-width: 100%; height: auto; max-height: 4rem; object-fit: cover; }
    .preview-img-lg { max-height: 6rem; }
    .preview-img-placeholder { width: 100%; height: 3rem; background: var(--border); display: flex; align-items: center; justify-content: center; font-size: 10px; color: var(--muted); }
    .preview-img-placeholder-lg { height: 5rem; }
    .preview-logo { width: 24px; height: 24px; object-fit: contain; }
    .preview-content { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; }

    .footer { margin-top: 20px; font-size: 11px; color: var(--muted); }
    .footer a { color: var(--accent); text-decoration: none; }
    .footer a:hover { text-decoration: underline; }

    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-thumb { background: var(--border); }

    @media (min-width: 900px) {
      .dashboard-wrap { grid-template-columns: 260px 1fr; }
    }
    @media (min-width: 1200px) {
      .dashboard-wrap { grid-template-columns: 280px 1fr; }
      .calendar-wrap { max-width: 480px; }
    }

    @media (max-width: 768px) {
      .admin-editor-grid { grid-template-columns: 1fr; }
      .preview-pane { position: static; }
      .calendar-wrap { max-width: 100%; padding: 10px 12px; }
      .cal-cell { height: 48px; min-height: 48px; padding: 3px; }
      .cal-cell-num { font-size: 10px; }
      .cal-ad-pill { font-size: 8px; padding: 0 3px; }
    }
    @media (max-width: 640px) {
      .dashboard-wrap { grid-template-columns: 1fr; grid-template-rows: 40px auto 1fr; }
      .sidebar {
        border-right: none;
        border-bottom: 1px solid var(--border);
        flex-direction: column;
        gap: 10px;
        padding: 10px 12px;
      }
      .sidebar .group { min-width: 0; }
      .sidebar .kv { font-size: 11px; }
      .sidebar button { width: 100%; }
      .panel { padding: 12px 16px; }
      .tabs { padding: 0 8px; overflow-x: auto; }
      .tab { padding: 8px 10px; font-size: 11px; }
      .overview-status-banner { padding: 10px 12px; margin-bottom: 12px; }
      .status-banner-text { font-size: 12px; }
      .status-banner-sub { font-size: 10px; }
      .calendar-wrap { margin-top: 12px; }
      .cal-cell { height: 44px; min-height: 44px; padding: 2px; font-size: 9px; }
      .cal-legend { margin-top: 10px; padding-top: 10px; gap: 8px; font-size: 9px; }
      .ad-card { padding: 8px 10px; min-width: 0; }
      .ad-card-head { font-size: 10px; }
      .form-actions { margin-top: 16px; padding-top: 16px; gap: 8px; }
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
