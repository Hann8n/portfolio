import { AD_PREVIEW_SCRIPT, AD_PREVIEW_STYLES } from "../ad-preview";
import { CHART_SCRIPT } from "../charts";
import { CAMPAIGN_REPORTING_SCRIPT } from "./client/campaign-reporting";
import { CORE_SCRIPT, START_SCRIPT } from "./client/core";
import { DATA_QUALITY_SCRIPT } from "./client/data-quality";
import { EVENTS_SCRIPT } from "./client/events";
import { OVERVIEW_SCRIPT } from "./client/overview";
import { EDITOR_OVERLAY_MARKUP, EDITOR_SCRIPT, SCHEDULE_MARKUP } from "./campaign-editor";
import { DASHBOARD_HEADER_MARKUP, DASHBOARD_STYLES, DATA_QUALITY_MARKUP, EVENTS_MARKUP, OVERVIEW_MARKUP } from "./dashboard";
import { BASE_STYLES } from "./styles";
import { VIEWS_SCRIPT } from "./views";

/**
 * Admin UI — served at /admin behind Cloudflare Access. Composed from:
 * styles.ts (tool chrome), dashboard.ts (workspace layout), views.ts (workspace registry),
 * client/* (one module per workspace), and campaign-editor.ts (ads CRUD).
 */
export const ADMIN_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="Cache-Control" content="no-store, no-cache, must-revalidate, max-age=0">
  <meta http-equiv="Pragma" content="no-cache">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <!-- admin-build: 20261020-workspaces -->
  <title>Gym Tracker Dashboard</title>
  <link rel="icon" href="/favicon/favicon.ico" sizes="any">
  <link rel="icon" href="/favicon/favicon-32x32.png" type="image/png" sizes="32x32">
  <link rel="icon" href="/favicon/favicon-16x16.png" type="image/png" sizes="16x16">
  <link rel="apple-touch-icon" href="/favicon/apple-touch-icon.png" sizes="180x180">
  <link rel="stylesheet" href="/vendor/flatpickr/flatpickr.min.css">
  <link rel="stylesheet" href="/vendor/flatpickr/dark.css">
  <style>
${BASE_STYLES}
${DASHBOARD_STYLES}
${AD_PREVIEW_STYLES}
  </style>
</head>
<body>
  <div class="dashboard-wrap">
  <div class="topbar">
    <a href="https://jackhannon.net/" class="topbar-home" title="Back to jackhannon.net">← jackhannon.net</a>
    <div class="topbar-center">
      <span class="topbar-title">Gym Tracker</span>
      <span class="topbar-sep">/</span>
      <span class="topbar-sub">dashboard</span>
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
      ${DASHBOARD_HEADER_MARKUP}
      <div id="dashboardContent" class="dashboard-content">
      ${OVERVIEW_MARKUP}
      <section id="campaignsPanel" role="tabpanel" aria-labelledby="tabCampaigns" hidden>
        <div id="campaignReporting"></div>
${SCHEDULE_MARKUP}
      </section>
      ${EVENTS_MARKUP}
      ${DATA_QUALITY_MARKUP}
      </div>
    </div>
  </div>
  </div>

${EDITOR_OVERLAY_MARKUP}
  <script>${AD_PREVIEW_SCRIPT}
${CHART_SCRIPT}
${VIEWS_SCRIPT}
${CORE_SCRIPT}
${OVERVIEW_SCRIPT}
${CAMPAIGN_REPORTING_SCRIPT}
${EVENTS_SCRIPT}
${DATA_QUALITY_SCRIPT}
${START_SCRIPT}</script>
  <script src="/vendor/flatpickr/flatpickr.min.js"></script>
  <script src="/vendor/flatpickr/plugins/rangePlugin.js"></script>
  <script>
${EDITOR_SCRIPT}
  </script>
</body>
</html>`;

export function getAdminHtml(): string {
  return ADMIN_HTML;
}
