// Bundle with esbuild (provided by Wrangler) before running; exercises report logic, not browser snapshots.
import assert from 'node:assert/strict';
import {renderAdPreview} from '../src/ad-preview.ts';
import {campaignRange,campaignReportHtml} from '../src/campaign-report.ts';
const now=new Date('2026-10-17T18:00:00Z');
const ad={id:'test',sponsor:'Campus Partners <Sample>',headline:'Community offer',cta:'See offer',destination_url:'https://example.com',tier:'text',start_at:'2026-10-17T17:59:00Z'};
for (const days of [7,30,90,180,365]) {
  for(const campaign of [ad,{...ad,start_at:'2027-01-01T00:00:00Z'},{...ad,start_at:'2025-01-01T00:00:00Z',end_at:'2025-02-01T00:00:00Z'}]) {
    const range=campaignRange(campaign,String(days),now);
    assert.equal(range.before-range.from,days*86400000,'Preset period was changed by the current campaign schedule');
  }
}
assert.equal(campaignRange({...ad,start_at:'2027-01-01T00:00:00Z'},'campaign',now).not_started,true);
assert.equal(campaignRange({...ad,start_at:'2024-01-01T00:00:00Z'},'campaign',now).truncated,true);
assert.throws(()=>campaignRange(ad,'-1',now));
const base={campaign:ad,period:{from:'2026-09-17T18:00:00Z',before:now.toISOString(),label:'Last 30 days',truncated:false,not_started:false},generated_at:now.toISOString(),campaign_first_recorded_at:'2026-10-17T17:00:00Z',first_event:'2026-10-17T17:00:00Z',last_event:'2026-10-17T17:59:00Z',impressions:1000,reach:200,clicks:30,unique_clickers:24,daily:[{date:'2026-10-17',impressions:1000,reach:200,clicks:30}],creatives:[{creative_version:'v1',impressions:1000,clicks:30}]};
const html=campaignReportHtml(base,'?download=1');
assert.ok(html.includes('3.00%')&&html.includes('30 taps ÷ 1,000 ad views × 100'));
assert.ok(html.includes('5.00'));
assert.ok(html.includes('Last 30 days')&&html.includes('Dates with recorded activity'));
assert.ok(html.includes('Campus Partners &lt;Sample&gt;'));
assert.ok(!html.includes('Ad versions compared'),'Single-version table duplicated the summary');
assert.ok(!html.includes('break-before:page'),'Small reports should not force a second page');
const tapsOnly=campaignReportHtml({...base,impressions:0,reach:0,clicks:3,daily:[],creatives:[]},'?download=1');
assert.ok(tapsOnly.includes('Not available')&&tapsOnly.includes('a tap rate cannot be calculated'));
assert.ok(!tapsOnly.includes('NaN')&&!tapsOnly.includes('Infinity'));
const empty=campaignReportHtml({...base,impressions:0,reach:0,clicks:0,unique_clickers:0,daily:[],creatives:[],first_event:null,last_event:null},'?download=1');
assert.ok(empty.includes('No campaign activity was recorded')&&!empty.includes('0.00%'));
assert.ok(!empty.includes('class="metrics"'),'Empty reports should explain missing data instead of presenting performance KPIs');
assert.ok(campaignReportHtml({...base,creatives:[...base.creatives,{creative_version:'v2',impressions:10,clicks:1}]},'?download=1').includes('Ad versions compared'));
console.log('PASS: exact preset periods, scheduled/retained windows, rate/frequency math, empty/taps-only reports, escaping, and nonduplicated content');

assert.ok(html.includes('aria-label="Ad creative preview"')&&html.includes('Current saved creative'));
for (const tier of ['text','banner','feature']) {
  const preview=renderAdPreview({...ad,tier,subline:'Bring <friends>',sponsored_label:'Student Organization',image_url:'https://example.com/art.jpg',logo_url:'https://example.com/logo.png'});
  assert.ok(preview.includes('Student Organization')&&preview.includes('Bring &lt;friends&gt;'));
  assert.equal(preview.includes('class="creative-image"'),tier!=='text');
}
assert.ok(!renderAdPreview({...ad,sponsored_label:''}).includes('class="creative-label"'));
assert.ok(renderAdPreview(ad).includes('Sponsored'));
assert.ok(!renderAdPreview({...ad,image_url:'javascript:alert(1)',logo_url:'data:image/svg+xml,test'}).includes('src='));
console.log('PASS: shared previews, all ad formats and labels, escaping and HTTPS-only artwork');

assert.ok(html.includes('id="reportPeriod"')&&html.includes('value="campaign"'));
const standalone=campaignReportHtml(base,'?download=1',true);
assert.ok(!standalone.includes('id="reportPeriod"')&&!standalone.includes('class="download"'));
assert.ok(standalone.includes('window.print()')&&standalone.includes('aria-label="Ad creative preview"'));
console.log('PASS: report viewer owns period controls; downloaded document has only print controls');
