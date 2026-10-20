/** Base admin tool styles: dark operations aesthetic shared by every workspace and the campaign editor. */
export const BASE_STYLES = `
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
      --font: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      --font-mono: ui-monospace, 'Cascadia Code', 'SF Mono', Menlo, Consolas, monospace;
      --cta-orange: #E87722;
      --ad-maroon: #e59ab4;
      --ad-cta-fill: rgba(134, 31, 65, 0.18);
      --text-xs: 11px;
      --text-sm: 12px;
      --text-base: 14px;
      --text-md: 15px;
      --text-lg: 16px;
      --text-xl: 17px;
    }
    html { background: var(--bg); color: var(--text); font-family: var(--font); font-size: var(--text-base); line-height: 1.5; -webkit-text-size-adjust: 100%; }
    body { height: 100vh; margin: 0; overflow: hidden; min-width: 0; -webkit-tap-highlight-color: transparent; }

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
      font-size: var(--text-sm); font-weight: 600; color: var(--muted); text-decoration: none; white-space: nowrap;
      touch-action: manipulation;
    }
    .topbar-home:hover { color: var(--accent); }
    .topbar-center { display: flex; align-items: center; gap: 6px; flex: 1; justify-content: center; min-width: 0; }
    .topbar-title { font-size: var(--text-sm); font-weight: 500; white-space: nowrap; }
    .topbar-sep { color: var(--border); flex-shrink: 0; opacity: 0.7; }
    .topbar-sub { color: var(--muted); font-size: var(--text-xs); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
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
    .status-text { color: var(--muted); font-size: var(--text-xs); }
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
    .status-banner-text { font-size: var(--text-sm); font-weight: 500; }
    .status-banner-sub { color: var(--muted); font-size: var(--text-xs); margin-top: 2px; }
    .btn-as-link {
      padding: 7px 12px;
      font-size: var(--text-sm);
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
    .form-overlay-header h2 { font-size: var(--text-md); font-weight: 500; margin: 0; min-width: 0; }
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
    .group-toggle-icon { font-size: var(--text-xs); color: var(--muted); }
    .group-label { font-size: var(--text-xs); color: var(--muted); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 0; }
    .field { display: flex; flex-direction: column; gap: 4px; }
    .field-label { color: var(--muted); font-size: var(--text-xs); margin: 0; }
    .field-error { display: block; font-size: var(--text-xs); color: var(--red); margin: 0; min-height: 0; }
    .checkbox-label { display: flex; align-items: center; gap: 8px; color: var(--text); font-size: var(--text-sm); cursor: pointer; }
    .checkbox-label input { width: auto; margin: 0; }

    input, select {
      width: 100%;
      min-width: 0;
      min-height: 40px;
      background: var(--bg);
      border: 1px solid var(--border);
      color: var(--text);
      font-family: var(--font-mono);
      font-size: var(--text-base);
      padding: 10px 12px;
      outline: none;
      transition: border-color 0.15s;
      margin-bottom: 0;
    }
    input:focus, select:focus { border-color: var(--accent); }
    input.input-error { border-color: var(--red); }

    button {
      font-family: var(--font);
      font-size: var(--text-sm);
      transition: color 0.15s, border-color 0.15s, background 0.15s;
      padding: 7px 12px;
      cursor: pointer;
      border: 1px solid var(--border);
      background: transparent;
      color: var(--muted);
      transition: color 0.1s, border-color 0.1s, background 0.1s;
      touch-action: manipulation;
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
    .clear-dates-btn { padding: 2px 0; font-size: var(--text-xs); color: var(--muted); border: none; background: none; cursor: pointer; text-decoration: underline; }
    .clear-dates-btn:hover { color: var(--text); }

    .form-actions { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin: 0; padding: 0; position: relative; }
    .form-actions .delete-btn { margin-left: 0; }
    .form-actions-right { display: flex; align-items: center; gap: 12px; margin-left: auto; }
    .active-inactive-toggle {
      display: flex; width: 100%; margin-top: 12px; border: 1px solid var(--border);
    }
    .active-inactive-btn {
      flex: 1; padding: 10px 16px; font-size: var(--text-sm); font-weight: 500;
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
      flex: 1; padding: 10px 16px; font-size: var(--text-sm); font-weight: 500;
      border: none; background: transparent; color: var(--muted);
      cursor: pointer; transition: color 0.15s, background 0.15s;
    }
    .tier-btn:not(:last-child) { border-right: none; }
    .tier-btn:hover { color: var(--text); }
    .tier-btn.active { background: rgba(20,184,166,0.12); color: var(--accent); }
    .unsaved-indicator { font-size: var(--text-xs); color: var(--yellow); position: absolute; left: 50%; transform: translateX(-50%); pointer-events: none; }
    .save-status { font-size: var(--text-xs); color: var(--muted); position: absolute; left: 50%; transform: translateX(-50%); pointer-events: none; }
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
    .new-ad-label { font-size: var(--text-xs); font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; }
    .ads-status-filters { display: flex; flex-wrap: wrap; gap: 4px; }
    .status-filter { padding: 4px 8px; font-size: var(--text-xs); }
    .status-filter.active { border-color: var(--accent); color: var(--accent); }
    .ad-cards-group:last-child { margin-bottom: 0; }
    .ad-cards-group-label { font-size: var(--text-xs); color: var(--muted); letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 2px; }
    .ad-card-wrap { position: relative; min-width: 0; height: 100%; }
    .ad-card-wrap .ad-card { position: relative; min-width: 0; min-height: 80px; width: 100%; height: 100%; }
    .ad-card-action {
      position: absolute; top: 8px; right: 8px;
      padding: 8px; display: flex; align-items: center; justify-content: center;
      z-index: 1; flex-shrink: 0;
    }
    .ad-card-action-icon-wrap {
      position: relative; display: inline-flex; width: 18px; height: 18px;
      align-items: center; justify-content: center; flex-shrink: 0;
    }
    .ad-card-action-icon {
      font-size: 16px; line-height: 1; transition: opacity 0.15s;
      display: flex; align-items: center; justify-content: center;
      width: 18px; height: 18px;
    }
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
      padding: clamp(10px, 2.5vw, 14px) clamp(12px, 3vw, 16px);
      padding-right: 56px; border: 1px solid var(--border); background: var(--surface);
      color: var(--text); font: inherit; text-align: left; cursor: pointer;
      transition: border-color 0.15s, background 0.15s; box-sizing: border-box;
      min-height: clamp(72px, 18vw, 88px);
    }
    .ad-card:hover { border-color: var(--text); }
    .ad-card.selected { border-color: var(--accent); background: rgba(20,184,166,0.08); }
    .ad-card-head { font-weight: 500; font-size: var(--text-sm); line-height: 1.4; word-break: break-word; }
    .ad-card-dates { font-size: var(--text-xs); color: var(--muted); line-height: 1.4; }
    .ad-card-tier { font-size: var(--text-xs); color: var(--muted); text-transform: uppercase; line-height: 1.4; }
    .chip { font-size: var(--text-xs); font-weight: 500; padding: 2px 6px; border: 1px solid transparent; line-height: 1.5; }
    .chip-live { color: var(--green); background: rgba(34,197,94,0.15); border-color: rgba(34,197,94,0.3); }
    .chip-scheduled { color: var(--accent); background: rgba(20,184,166,0.15); border-color: rgba(20,184,166,0.3); }
    .chip-ended { color: var(--muted); background: rgba(115,115,115,0.1); opacity: 0.9; }
    .chip-paused { color: var(--yellow); background: rgba(234,179,8,0.15); border-color: rgba(234,179,8,0.3); }

    #adCards.loading, #calendarWrap.loading { opacity: 0.6; pointer-events: none; }
    .calendar-empty { margin-top: 16px; padding: 24px; border: 1px dashed var(--border); background: var(--surface); text-align: center; max-width: 240px; }
    .calendar-empty-text { color: var(--muted); font-size: var(--text-sm); margin: 0; }
    .calendar-wrap { margin-top: 16px; border: 1px solid var(--border); background: var(--surface); padding: 18px 22px; width: 100%; min-width: 0; max-width: 100%; }
    .calendar-header { display: grid; grid-template-columns: 44px minmax(0, 1fr) 44px auto; align-items: center; gap: 8px; margin-bottom: 14px; }
    .cal-month-label { min-width: 0; text-align: center; overflow-wrap: anywhere; font-size: var(--text-md); font-weight: 500; color: var(--text); margin: 0; }
    .cal-nav { padding: 4px 10px; font-size: var(--text-xs); background: transparent; border: 1px solid var(--border); color: var(--muted); cursor: pointer; }
    .cal-nav.cal-today { margin-left: 0; }
    .cal-nav:hover { color: var(--text); border-color: var(--text); }
    .calendar-grid { display: flex; flex-direction: column; gap: 0; }
    .cal-weekdays { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); font-size: var(--text-xs); color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; padding-bottom: 8px; border-bottom: 1px solid var(--border); }
    .cal-weekdays span { text-align: center; }
    .cal-days { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 1px; background: var(--border); width: 100%; }
    .cal-cell { min-width: 0; min-height: 80px; height: auto; padding: 10px; background: var(--surface); display: flex; flex-direction: column; font-size: var(--text-xs); }
    .cal-cell.other-month { background: var(--bg); }
    .cal-cell.other-month .cal-cell-num { color: var(--muted); opacity: 0.6; }
    .cal-cell.today { outline: 1px solid var(--accent); outline-offset: -1px; z-index: 1; }
    .cal-cell.today .cal-cell-num { color: var(--accent); font-weight: 500; }
    .cal-cell.has-conflict { outline: 1px dashed var(--yellow); outline-offset: -1px; }
    .cal-cell-num { font-size: var(--text-sm); color: var(--text); margin-bottom: 4px; }
    .cal-cell-ads { min-width: 0; width: 100%; display: flex; flex-wrap: wrap; gap: 2px; align-content: flex-start; overflow: hidden; }
    .cal-ad-pill { min-width: 0; width: 100%; font-size: var(--text-xs); padding: 5px 8px; min-height: 28px; border: none; cursor: pointer; font-family: var(--font); text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
    .cal-ad-pill.chip-live { background: rgba(34,197,94,0.2); color: var(--green); }
    .cal-ad-pill.chip-scheduled { background: rgba(20,184,166,0.2); color: var(--accent); }
    .cal-ad-pill.chip-ended { background: rgba(102,102,102,0.2); color: var(--muted); }
    .cal-ad-pill.chip-paused { background: rgba(251,191,36,0.2); color: var(--yellow); }
    .cal-ad-pill:hover { opacity: 0.9; }
    .cal-ad-pill.selected { outline: 1px solid var(--text); outline-offset: 1px; }
    .cal-legend { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border); font-size: var(--text-xs); color: var(--muted); }
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
    .id-version-header input { min-height: 36px; padding: 6px 10px; font-size: var(--text-sm); }
    .ad-preview { border: none; padding: 0; background: transparent; min-height: 8rem; overflow: visible; }
    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-thumb { background: var(--border); }

    .flatpickr-calendar { z-index: 99999; }
    .flatpickr-day.selected, .flatpickr-day.startRange, .flatpickr-day.endRange { background: var(--accent) !important; border-color: var(--accent) !important; }
    .flatpickr-day:hover { background: var(--border) !important; border-color: var(--border) !important; }
    #start_at[readonly], #end_at[readonly] { cursor: pointer; }

    @media (min-width: 900px) {
      .schedule-grid { grid-template-columns: minmax(0, 1fr) minmax(420px, 560px); }
    }
    @media (min-width: 1200px) {
      .schedule-grid { grid-template-columns: minmax(0, 1fr) minmax(480px, 640px); }
      .cal-cell { min-height: 88px; }
      .cal-ad-pill { font-size: var(--text-xs); min-height: 30px; }
    }

    @media (max-width: 768px) {
      .form-overlay { padding: 0; align-items: stretch; justify-content: stretch; }
      .form-overlay-backdrop { display: none; }
      .form-overlay-panel {
        width: 100%; height: 100%; max-width: none; max-height: none;
        border: none; border-radius: 0;
      }
      .admin-editor-grid { grid-template-columns: 1fr; }
      .preview-pane { position: static; }
      .calendar-wrap { max-width: 100%; padding: 10px 12px; min-width: 0; }
      .cal-cell { min-height: 56px; padding: 6px; }
      .cal-cell-num { font-size: var(--text-xs); }
      .cal-ad-pill { font-size: var(--text-xs); padding: 4px 6px; min-height: 36px; }
      .topbar-refresh {
        min-width: 44px; min-height: 44px; padding: 0 12px;
        display: flex; align-items: center; justify-content: center;
        border: none; border-left: 1px solid var(--border); border-right: 1px solid var(--border);
        border-radius: 0;
      }
      .topbar-refresh:hover { border-left-color: var(--accent); border-right-color: var(--accent); }
      .status-filter { min-height: 44px; min-width: 44px; padding: 10px 12px; display: inline-flex; align-items: center; justify-content: center; }
      .cal-nav { min-height: 44px; min-width: 44px; padding: 10px; display: inline-flex; align-items: center; justify-content: center; }
      .cal-nav.cal-today { min-width: auto; padding: 10px 14px; }
      .form-overlay-header { grid-template-columns: 1fr auto; grid-template-rows: auto auto; gap: 12px; }
      .form-overlay-header h2 { grid-column: 1; grid-row: 1; }
      .form-overlay-header > button[aria-label="Close"] { grid-column: 2; grid-row: 1; min-width: 44px; min-height: 44px; padding: 10px; }
      .active-inactive-toggle.active-inactive-header { grid-column: 1 / -1; grid-row: 2; justify-self: stretch; margin-top: 0; }
      .form-overlay-header .active-inactive-btn { min-height: 44px; }
    }
    @media (max-width: 640px) {
      :root {
        --text-xs: 12px;
        --text-sm: 13px;
        --text-base: 15px;
        --text-md: 16px;
      }
      .dashboard-wrap { grid-template-rows: 40px 1fr; }
      .main { padding: 12px 16px; }
      .overview-status-banner { padding: 10px 12px; margin-bottom: 12px; }
      .status-banner-text { font-size: var(--text-sm); }
      .status-banner-sub { font-size: var(--text-xs); }
      .calendar-wrap { margin-top: 12px; min-width: 0; }
      .cal-cell { min-height: 50px; padding: 5px; font-size: var(--text-xs); }
      .cal-legend { margin-top: 10px; padding-top: 10px; gap: 8px; font-size: var(--text-xs); }
      .ad-card { padding: 10px 12px; min-width: 0; padding-right: 52px; }
      .ad-card-action { min-width: 44px; min-height: 44px; padding: 10px; }
      .ad-card-action-icon-wrap { width: 20px; height: 20px; }
      .ad-card-action-icon { font-size: 18px; width: 20px; height: 20px; }
      .form-actions, .form-actions-right { gap: 8px; }
      .date-presets button { min-height: 44px; min-width: 44px; padding: 10px 14px; }
      .tier-btn, .active-inactive-btn { min-height: 44px; }
      .btn-as-link { min-height: 44px; padding: 10px 16px; }
    }
    @media (max-width: 400px) {
      .topbar { padding: 0 8px; gap: 8px; }
      .topbar-sub { display: none; }
      .topbar-sep { display: none; }
      .topbar-title { font-size: var(--text-sm); }
      .topbar-home { font-size: var(--text-sm); min-width: 0; overflow: hidden; text-overflow: ellipsis; }
      .topbar-center { min-width: max-content; }
      .main-toolbar { flex-direction: column; align-items: stretch; }
      .toolbar-search { max-width: none; }
      .form-actions { flex-direction: column; align-items: stretch; }
      .form-actions-right { margin-left: 0; flex-wrap: wrap; }
      .form-actions-right button { flex: 1; min-height: 44px; }
      .delete-btn { min-height: 44px; }
      .new-ad-card { min-height: 88px; }
      .ad-cards { grid-template-columns: 1fr; }
    }
`;
