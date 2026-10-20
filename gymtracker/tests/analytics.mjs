// Bundle with esbuild (provided by Wrangler) before running; exercises reporting math without a database.
import assert from 'node:assert/strict';
import {localDateKey,localDates,localTimeSql,offsetSegments,zoneOffsetMinutes} from '../src/analytics/time.ts';
import {localMidnight,overviewWindows} from '../src/analytics/windows.ts';
import {raw,sql} from '../src/analytics/sql.ts';
import {audienceFilter,internalOnlyFilter} from '../src/analytics/audience.ts';
import {barChartSvg,shareBarsHtml} from '../src/charts.ts';
import {campaignReportHtml} from '../src/report/campaign-report.ts';

// Campus time: EDT is UTC-4 and EST is UTC-5; DST ends 2026-11-01 at 06:00 UTC.
assert.equal(zoneOffsetMinutes(Date.parse('2026-10-20T12:00:00Z')),-240);
assert.equal(zoneOffsetMinutes(Date.parse('2026-12-01T12:00:00Z')),-300);
const segments=offsetSegments(Date.parse('2026-10-25T00:00:00Z'),Date.parse('2026-11-08T00:00:00Z'));
assert.deepEqual(segments.map(s=>[new Date(s.start).toISOString(),s.offset]),[['2026-10-25T00:00:00.000Z',-240],['2026-11-01T06:00:00.000Z',-300]]);
const expression=localTimeSql('received_at',Date.parse('2026-10-25T00:00:00Z'),Date.parse('2026-11-08T00:00:00Z'));
assert.ok(expression.sql.includes('CASE')&&expression.params.includes('2026-11-01T06:00:00.000Z'));
assert.ok(!localTimeSql('received_at',Date.parse('2026-10-13T00:00:00Z'),Date.parse('2026-10-20T00:00:00Z')).sql.includes('CASE'));
// An evening workout in Blacksburg belongs to that local day, not the next UTC day.
assert.equal(localDateKey(Date.parse('2026-10-20T01:30:00Z')),'2026-10-19');
assert.deepEqual(localDates(Date.parse('2026-10-17T04:00:00Z'),Date.parse('2026-10-20T01:30:00Z')),['2026-10-17','2026-10-18','2026-10-19']);
assert.equal(new Date(localMidnight('2026-11-02')).toISOString(),'2026-11-02T05:00:00.000Z');
assert.equal(new Date(localMidnight('2026-10-13')).toISOString(),'2026-10-13T04:00:00.000Z');

const now=Date.parse('2026-10-20T01:30:00Z');
const w=overviewWindows(7,now);
assert.equal(new Date(w.current.from).toISOString(),'2026-10-13T04:00:00.000Z');
assert.equal(w.current.dates.length,7);
assert.equal(w.current.dates.at(-1),'2026-10-19');
assert.equal(w.previous.before-w.previous.from,w.current.before-w.current.from,'Comparison windows must cover the same elapsed time');
assert.equal(w.previous.dates.length,7);
console.log('PASS: Eastern Time days and hours, DST boundaries, aligned comparison windows');

const nested=sql`a = ${1} AND ${sql`b = ${'two'} AND ${raw('c IS NULL')}`} AND d = ${3}`;
assert.equal(nested.sql,'a = ? AND b = ? AND c IS NULL AND d = ?');
assert.deepEqual(nested.params,[1,'two',3]);
const internal=[{id:'6292f3ef-e274-48b3-ac1d-db473463dd23',label:'Dev',added_at:''}];
assert.equal(audienceFilter({excludeInternal:true,internal:[]}).sql,'1 = 1');
assert.equal(audienceFilter({excludeInternal:false,internal}).sql,'1 = 1');
assert.ok(audienceFilter({excludeInternal:true,internal}).sql.includes('NOT IN')&&audienceFilter({excludeInternal:true,internal}).params[0].includes(internal[0].id));
assert.equal(internalOnlyFilter({excludeInternal:false,internal}).sql,'1 = 0');
console.log('PASS: parameterized SQL composition and internal-install filters');

const chart=barChartSvg([{label:'<Mon>',value:3},{label:'Tue',value:0}],{ariaLabel:'Views "daily"',comparison:[1,null]});
assert.ok(chart.includes('&lt;Mon&gt;')&&chart.includes('&quot;daily&quot;')&&chart.includes('chart-compare'));
assert.ok(!/NaN|Infinity|undefined/.test(chart));
assert.ok(!/NaN|Infinity/.test(barChartSvg([],{ariaLabel:'Empty'}))&&!/NaN/.test(barChartSvg([{label:'a',value:0}],{ariaLabel:'Zero'})));
assert.ok(shareBarsHtml([{label:'<1>',value:0}],'x').includes('width:0.0%'));
console.log('PASS: shared charts escape labels and stay finite for empty and zero data');

const ad={id:'acme-q4',sponsor:'Acme "Gym" </style>',headline:'Offer',cta:'Go',destination_url:'https://example.com',tier:'text',start_at:'2026-10-18T04:00:00Z',end_at:'2026-10-19T21:00:00Z'};
const report={campaign:ad,period:{from:'2026-10-18T04:00:00Z',before:'2026-10-19T21:00:01Z',label:'Campaign dates',truncated:false,not_started:false},generated_at:'2026-10-20T01:30:00Z',time_zone:'America/New_York',campaign_first_recorded_at:null,
  first_event:'2026-10-18T05:00:00Z',last_event:'2026-10-19T20:00:00Z',impressions:147,reach:89,clicks:1,unique_clickers:1,
  daily:[{date:'2026-10-18',impressions:9,clicks:0,reach:7},{date:'2026-10-19',impressions:138,clicks:1,reach:82}],
  hourly:[{hour:13,impressions:16,clicks:1},{hour:15,impressions:26,clicks:0},{hour:16,impressions:30,clicks:0}],
  frequency:[{views:1,installs:57},{views:2,installs:18},{views:5,installs:3}],timeline:[{slot:'2026-10-18 01',impressions:4,clicks:0},{slot:'2026-10-19 15',impressions:30,clicks:1}],creatives:[{creative_version:'',impressions:147,clicks:1}],
  excluded:{internal_excluded:true,installations:1,impressions:9,clicks:6}};
const html=campaignReportHtml(report,'?download=1');
assert.ok(html.includes('0.68%')&&html.includes('Excludes 1 internal test install (9 views, 6 taps).'));
assert.ok(html.includes('counter(pages)')&&!html.includes('</style> ·'),'Sponsor text must be escaped inside the CSS page footer');
assert.ok(html.includes('Delivery')&&html.includes('Views per install')&&!html.includes('Time of day'),'Short flights chart hourly delivery instead of a separate time-of-day chart');
assert.ok(html.includes('Mon, Oct 19')&&html.includes('<tfoot>'),'Daily rows use Eastern Time dates and a total row');
assert.ok(html.includes('src="/favicon/apple-touch-icon.png"')&&campaignReportHtml(report,'?download=1',true).includes('src="https://gymtracker.jackhannon.net/favicon/apple-touch-icon.png"'));
assert.ok(html.includes('Views per hour'),'Hourly delivery chart for a two-day flight');
assert.ok(campaignReportHtml({...report,first_event:'2026-09-01T00:00:00Z'},'?download=1').includes('Views per day'),'Long activity spans chart daily delivery');
assert.ok(html.includes('Oct 18 – 19, 2026'),'Compact flight dates');
assert.ok(!/NaN|Infinity|undefined/.test(html));
console.log('PASS: sponsor report discloses internal exclusions, paginates, charts delivery, and escapes the print footer');
