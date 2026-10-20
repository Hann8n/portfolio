# Analytics and advertiser reporting

The admin dashboard has four workspaces, registered in `src/admin/views.ts`:

- **Overview** — five KPI cards (active installs, new installs, app visits, returning installs, Campus ID reach), each with a change chip against the previous period and a sparkline. Clicking a card drives the **Trend** chart, which overlays the previous period as dashed outlines once enough history exists. Below: a weekday × hour heatmap of app visits, visit frequency, feature usage, Siri reliability, and platform (each install counted once on its latest app and iOS version). Ad metrics stay in Campaigns.
- **Campaigns** — selected campaign's saved creative beside views, unique reach, taps, tap rate, daily delivery, views per reached install, schedule, and links to the sponsor report (selected period or full flight). The schedule calendar and editor follow below.
- **Events** — aggregated occurrences, unique installs, and last receipt per event with category/campaign filters and CSV export (the CSV records the period and whether internal installs were excluded).
- **Data quality** — collection coverage, the internal-install list, and suggested internal installs ranked by test-device signals (several app builds, a build seen on three or fewer installs, beta iOS, unusually frequent visits, frequent Settings opens, repeated ad taps).

Global controls apply to every workspace and to exported reports: reporting period and **Exclude internal installs** (on by default).

## Campus time and comparison windows

Storage stays UTC. Every day and hour breakdown uses America/New_York, because Gym Tracker serves Virginia Tech and most use happens in the evening, when UTC dates roll over. D1 has no time zone database, so `src/analytics/time.ts` converts DST transitions inside a window into SQL `CASE` boundaries. "Last N days" means today plus the previous N−1 local calendar days. The comparison window has the same length and elapsed time, so a partial today is compared with a partial day. Comparisons appear only when recorded history covers the previous window.

## Internal installs

Developer, TestFlight, and demo devices skew small datasets. On launch data, one developer install produced 6 of 7 ad taps, which inflated tap rate from 0.68% to 4.49%. Installs marked in Data quality are stored in KV (`analytics_internal_installations`) and excluded with a bound JSON list in every dashboard and report query. Raw events are kept, so an exclusion can be reversed. Sponsor reports disclose how many views and taps were excluded.

## Sponsor report

`src/report/campaign-report.ts` renders an A4, print-first document: a masthead, a facts strip (period, recorded activity, flight, placement and format), summary highlights, a KPI band (views, unique reach, taps, tap rate) with average frequency, delivery days and peak hours, daily delivery and time-of-day charts, views-per-install distribution, a daily table with totals, version comparison when more than one version ran, the creative with its details, and methodology. Page footers carry the sponsor, campaign ID, and "Page X of Y". Charts come from `src/charts.ts`, which the dashboard also uses.

## Measurement and design references

- [Google Ads: reach and frequency](https://support.google.com/google-ads/answer/2472714) establishes unique reach and average frequency as separate measures. Our reach counts anonymous installations, not modeled people across devices.
- [Google Ads: dashboards](https://support.google.com/google-ads/answer/6379084) separates headline scorecards, visual reports, and notes. The Overview uses four headline advertising metrics; operational details live in Events.
- [IAB: viewable display impressions](https://www.iab.com/news/viewability-has-arrived-what-you-need-to-know-to-see-through-this-sea-change/) defines the familiar 50% pixel / one continuous second threshold. Our first-party implementation checks visible card area in the scroll viewport, foreground state, known covering app sheets, and continuous exposure. It additionally caps one impression per campaign creative per app session; it is not an MRC-accredited viewability system.
- The local `ads-landing-style-guide.md` governs the report: system typography, one centered column, hairlines, restrained maroon actions, automatic dark mode. The admin retains its documented dark tool aesthetic. Tables scroll within their panels on small screens; navigation supports keyboard tab/arrow interaction.

## Definitions

- **Qualified impression:** 50% of card area visible for one continuous second while active, with no known covering sheet, once per campaign creative per session. No `dev_*` creatives are counted.
- **Tap:** CTA interaction. A website visit or conversion is not inferred. Repeated taps can cause CTR over 100%.
- **Reach / unique tappers:** distinct random installation IDs for the respective event. Not verified people. Reinstalls and toggling analytics off/on may change IDs. Unique counts are not additive across days, campaigns, or event types.
- **CTR:** taps / qualified impressions × 100. Displayed as unavailable when no impressions exist in advertiser reports.
- **Frequency:** qualified impressions / reached installations.
- **Session:** a foreground launch, or return after 30 minutes in background. Siri-only sessions do not count as foreground app sessions.
- **Active installations:** distinct installation IDs with any recorded event in the period, including Siri activity. Feature users count installations that open that feature, without collecting its content.
- **Siri data returned:** live or cached responses; unavailable, missing event, and invalid requests are separate failures. Per-action statuses remain in the statistics API and release breakdowns are shown in Overview.
- Counts use server receipt time, shown in Eastern Time. Overview windows are aligned to local calendar days; campaign report presets are exact rolling 7/30/90/180/365-day windows. Preset reporting windows preserve the selected length even when campaign settings change. The Campaign dates option uses the configured schedule, limited to available retention. Campaign metadata is the current configuration, not a historical snapshot. Use new IDs for new bookings and increment creative versions when replacing content.
- No spend, CPM, CPC, sales, registrations, ROAS, conversion, or attribution figures are invented. These require actual billing or downstream conversion data before they can be reported accurately.

## First-party storage and deployment

`POST /api/events` accepts a bounded, allowlisted schema. A UUID event ID prevents duplicate delivery from inflating counts. Unknown user-content fields are discarded. Random installation/session IDs and coarse app/build/OS context are the only audience context retained. No IP addresses are persisted in D1; Cloudflare uses them transiently for rate limiting and may retain its own operational request logs.

D1 stores events with received-time and campaign indexes. The daily 07:23 UTC cron removes events older than 366 days. Collection is best effort; no on-device backlog is replayed after opt-out. A Settings toggle disables future events and deletes the local analytics installation ID. Only physical iOS Release builds emit production analytics.

Admin APIs verify Cloudflare Access JWT signatures, issuer, audience, expiration, and activation time. Production workers.dev and preview URLs are disabled; Cloudflare Access continues to gate the configured admin routes. Localhost is deliberately unauthenticated for isolated development.

Run from `gymtracker/`:

```sh
SHARP_IGNORE_GLOBAL_LIBVIPS=1 npm ci
npx tsc --noEmit
npx wrangler d1 migrations apply METRICS --local
npx wrangler dev --port 8788
# In another terminal; local fixtures only:
python3 tests/integration.py
node --experimental-strip-types tests/access-auth.mjs
for t in report analytics; do npx esbuild tests/$t.mjs --bundle --platform=node --format=esm --outfile=/tmp/$t.mjs && node /tmp/$t.mjs; done
# Browser checks (Playwright): tests/clarity.mjs, tests/dashboard-state.mjs, tests/responsive.mjs
# Production schema, then Worker:
npx wrangler d1 migrations apply METRICS --remote
npm run deploy
```

Production campaigns are not seeded or modified by the tests. Local QA fixtures are identified by `qa-campaign-*` IDs. Do not publish screenshots containing QA fixture counts as actual advertiser results.

Dashboard and campaign reports use the same ad preview renderer. Reports show the current saved creative (not a historical creative snapshot). Ad views are qualified impressions, audience reached counts distinct anonymous app installs with a view, link taps count button interactions, and tap rate is taps divided by views. A rate is unavailable when there are no recorded views.

## Dashboard contexts and feature adoption

Editing contains fields and a live preview. Campaign metrics and the export link live in Campaigns. The report viewer owns its period selector, including Campaign dates; downloaded HTML omits dashboard controls and retains print/PDF. Fields already visible in the ad preview are not repeated beside it.

The browser remembers the current workspace, period, campaign, event filters, chart metric, campaign search/status, calendar month and content scroll position. Invalid or deleted selections fall back safely, and blocked storage does not prevent use. This stores dashboard preferences only; edit-form values are not saved as drafts.

Feature usage aggregates Events detail opens, Campus ID display opens and Settings screen opens. Each row shows total opens, distinct anonymous app installs, share of all active installs, repeat installs (at least two opens in the period), and opens per install that used the feature. Shares overlap across features and include background-only active installs in their denominator. The Trend chart can show these opens by Eastern Time day. This measures event-detail use, not merely seeing the Events feed.

Siri has separate per-action requests, answered requests and distinct app installs. Crowd recommendations share the existing crowds event. Only actions invoked in the app can be measured; speech Siri never matched is not reported as a failed intent. All counts remain best effort and anonymous. No campus ID contents or event text are collected.
