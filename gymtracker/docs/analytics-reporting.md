# Analytics and advertiser reporting

The admin dashboard (`admin/`, React + shadcn/ui) has four pages, listed in `admin/src/lib/nav.ts`:

- **Overview** — five KPI cards (active installs, new installs, app visits, returning installs, Campus ID reach), each with a change badge against the previous period and a sparkline. Clicking a card drives the trend chart, which shows the previous period as faded bars once enough history exists. Below: a weekday × hour heatmap of app visits, visit frequency, feature usage, Siri reliability, and platform (each install counted once on its latest app and iOS version). Ad metrics stay in Campaigns.
- **Campaigns** — campaign cards with status, dates, and delivery for the selected period, a status filter, search, and a month calendar. Each campaign has a detail page: views, unique reach, frequency, taps, tap rate, hourly or daily delivery, views per reached install, creative, details, pause/resume, and the sponsor report. The editor opens as a side sheet (full screen on phones) with a live preview.
- **Events** — occurrences, unique installs, and last receipt per event with campaign/category filters and CSV export (the CSV records the period and whether internal installs were excluded).
- **Data quality** — collection coverage, the internal-install list, and suggested internal installs ranked by test-device signals (several app builds, a build seen on three or fewer installs, beta iOS, unusually frequent visits, frequent Settings opens, repeated ad taps).

Global controls in the top bar apply to every page and to exported reports: reporting period and **Exclude internal installs** (on by default). They are kept in the URL (`?days=30&internal=include`) and remembered as the next visit's default.

## Campus time and comparison windows

Storage stays UTC. Every day and hour breakdown uses America/New_York, because Gym Tracker serves Virginia Tech and most use happens in the evening, when UTC dates roll over. D1 has no time zone database, so `src/analytics/time.ts` converts DST transitions inside a window into SQL `CASE` boundaries. "Last N days" means today plus the previous N−1 local calendar days. The comparison window has the same length and elapsed time, so a partial today is compared with a partial day. Comparisons appear only when recorded history covers the previous window.

## Internal installs

Developer, TestFlight, and demo devices skew small datasets. On launch data, one developer install produced 6 of 7 ad taps, which inflated tap rate from 0.68% to 4.49%. Installs marked in Data quality are stored in KV (`analytics_internal_installations`) and excluded with a bound JSON list in every dashboard and report query. Raw events are kept, so an exclusion can be reversed. Sponsor reports disclose how many views and taps were excluded.

## Sponsor report

`src/report/campaign-report.ts` renders an A4, print-first document. It is always light, on screen and in print, with neutral grays and VT maroon as the only accent (the busiest day's bar and the masthead rule). Each figure appears once, and copy is kept to labels.

1. **Page 1, summary:** a slim masthead (Gym Tracker · Campaign report); the sponsor as the title with the headline beneath (house campaigns use the headline as the title, so the brand isn't repeated); dates, placement, and prepared date; one results row (ad views, reach, frequency, link taps, tap rate); delivery (per hour when activity spans four days or less, otherwise per day), time of day with its peak window, and views per install.
2. **Page 2, detail:** daily table with totals (only when more than one day has activity), version comparison when more than one version ran, the creative with its button and destination, and short notes defining each metric and disclosing excluded internal traffic.

Footers carry "Gym Tracker · Campaign report · sponsor" and page numbers. Reports with no delivery stay on one page. Charts come from `src/charts.ts`.

## Measurement and design references

- [Google Ads: reach and frequency](https://support.google.com/google-ads/answer/2472714) establishes unique reach and average frequency as separate measures. Our reach counts anonymous installations, not modeled people across devices.
- [Google Ads: dashboards](https://support.google.com/google-ads/answer/6379084) separates headline scorecards, visual reports, and notes. The Overview uses four headline advertising metrics; operational details live in Events.
- [IAB: viewable display impressions](https://www.iab.com/news/viewability-has-arrived-what-you-need-to-know-to-see-through-this-sea-change/) defines the familiar 50% pixel / one continuous second threshold. Our first-party implementation checks visible card area in the scroll viewport, foreground state, known covering app sheets, and continuous exposure. It additionally caps one impression per campaign creative per app session; it is not an MRC-accredited viewability system.
- The local `ads-landing-style-guide.md` governs the report: system typography, one centered column, hairlines, restrained maroon actions, automatic dark mode. The admin uses shadcn/ui's neutral theme (light and dark) with brand colors in charts.

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
npm run typecheck
npx wrangler d1 migrations apply METRICS --local
npm run dev
# In another terminal; local fixtures only:
python3 tests/integration.py
node --experimental-strip-types tests/access-auth.mjs
for t in report analytics; do npx esbuild tests/$t.mjs --bundle --platform=node --format=esm --outfile=/tmp/$t.mjs && node /tmp/$t.mjs; done
node tests/dashboard.mjs   # Playwright: every page at 320–1440px, editor flows, filters, CSV
# Production schema, then Worker:
npx wrangler d1 migrations apply METRICS --remote
npm run deploy
```

Production campaigns are not seeded or modified by the tests. Local QA fixtures are identified by `qa-campaign-*` IDs. Do not publish screenshots containing QA fixture counts as actual advertiser results.

Dashboard and campaign reports use the same ad preview renderer. Reports show the current saved creative (not a historical creative snapshot). Ad views are qualified impressions, audience reached counts distinct anonymous app installs with a view, link taps count button interactions, and tap rate is taps divided by views. A rate is unavailable when there are no recorded views.

## Dashboard contexts and feature adoption

Editing contains fields and a live preview. Campaign metrics and the report links live on each campaign's page. The report viewer owns its period selector, including Campaign dates; downloaded HTML omits dashboard controls and retains print/PDF. Fields already visible in the ad preview are not repeated beside it.

Pages and campaigns have their own URLs (`/admin/campaigns/<id>`), so the back button and shared links work. The browser remembers the period, internal-install filter, chart metric, and theme; invalid values fall back to defaults, and blocked storage does not prevent use. Edit-form values are not saved as drafts; closing the editor with unsaved changes asks first.

Feature usage aggregates Events detail opens, Campus ID display opens and Settings screen opens. Each row shows total opens, distinct anonymous app installs, share of all active installs, repeat installs (at least two opens in the period), and opens per install that used the feature. Shares overlap across features and include background-only active installs in their denominator. The Trend chart can show these opens by Eastern Time day. This measures event-detail use, not merely seeing the Events feed.

Siri has separate per-action requests, answered requests and distinct app installs. Crowd recommendations share the existing crowds event. Only actions invoked in the app can be measured; speech Siri never matched is not reported as a failed intent. All counts remain best effort and anonymous. No campus ID contents or event text are collected.
