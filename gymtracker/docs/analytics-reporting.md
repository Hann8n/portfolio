# Analytics and advertiser reporting

The admin dashboard has three workspaces: Overview, Campaigns, and Events. Overview shows active app installs, visits, feature usage, daily app activity, and release/Siri reliability. Campaigns contains a selected-campaign reporting workspace: the saved ad preview sits beside delivery, reach, link taps, tap rate, schedule, format, label, destination, version, editing, and export. Campaign metrics and creative are kept out of the app overview. The campaign schedule and creative manager follow below. Events provides aggregated occurrences, unique app installs, last receipt times, campaign/category filtering, and CSV export. Campaign reports support the last 7, 30, 90, 180, or 365 days, or campaign dates (retained up to 366 days), print-to-PDF, and downloadable HTML with inline styles (artwork still requires its source URL).

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
- Counts use server receipt time. Reporting windows are rolling 7/30/90/180/365 days; UTC daily charts have partial first and last days. Preset reporting windows preserve the selected length even when campaign settings change. The Campaign dates option uses the configured schedule, limited to available retention. Campaign metadata is the current configuration, not a historical snapshot. Use new IDs for new bookings and increment creative versions when replacing content.
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
# Production schema, then Worker:
npx wrangler d1 migrations apply METRICS --remote
npm run deploy
```

Production campaigns are not seeded or modified by the tests. Local QA fixtures are identified by `qa-campaign-*` IDs. Do not publish screenshots containing QA fixture counts as actual advertiser results.

Dashboard and campaign reports use the same ad preview renderer. Reports show the current saved creative (not a historical creative snapshot). Ad views are qualified impressions, audience reached counts distinct anonymous app installs with a view, link taps count button interactions, and tap rate is taps divided by views. A rate is unavailable when there are no recorded views.
