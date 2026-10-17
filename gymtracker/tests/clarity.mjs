// Run after integration.py with Playwright available; all fixture data stays local.
import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
try {
  await page.goto('http://localhost:8788/admin');
  await page.waitForFunction(()=>document.querySelector('#appMetrics')?.hidden===false);
  const overviewText=await page.locator('#overviewPanel').innerText();
  for(const label of ['Active · 24 hours','App visits','Siri requests answered','Feature usage']) assert.ok(overviewText.includes(label));
  for(const label of ['Ad views','Tap rate','Ad preview','Campaign reporting']) assert.ok(!overviewText.includes(label));
  assert.equal(await page.locator('#overviewPanel .creative-preview').count(),0);
  await page.getByRole('tab',{name:'Campaigns',exact:true}).click();
  assert.equal(await page.locator('#campaignsPanel .creative-preview').count(),1);
  const campaign=await page.locator('#creativeCampaign').inputValue();
  const sponsor=await page.locator('#dashboardAdPreview .creative-sponsor').innerText();
  const metricText=await page.locator('#campaignContextDetails').innerText();
  for(const label of ['Ad views','Audience reached','Link taps','Tap rate','Ad format','Starts','Ends','Link destination','Campaign ID']) assert.ok(metricText.includes(label));
  assert.ok(!metricText.includes('CTA')&&!metricText.includes('CTR'));
  const report=await browser.newPage();
  await report.goto('http://localhost:8788/api/admin/campaign-report?id='+encodeURIComponent(campaign)+'&days=30');
  assert.equal(await report.locator('.creative-sponsor').innerText(),sponsor);
  assert.equal(await report.locator('.creative-preview').count(),1);
  await report.close();
  await page.locator('#editReportingCampaign').click();
  assert.equal(await page.locator('#id').inputValue(),campaign);
  await page.locator('#formOverlayClose').click();
  for(const width of [1440,390,320]) {
    await page.setViewportSize({width,height:1000});
    const spacing=await page.evaluate(()=>{
      const nav=document.querySelector('.dashboard-nav'),tab=nav.children[0],range=document.createRange();range.selectNodeContents(tab);
      return {belowText:nav.getBoundingClientRect().bottom-range.getBoundingClientRect().bottom,afterBar:document.querySelector('#dashboardContent').getBoundingClientRect().top-nav.getBoundingClientRect().bottom};
    });
    assert.ok(spacing.belowText<=7,JSON.stringify(spacing));
    assert.ok(spacing.afterBar<=12,JSON.stringify(spacing));
    assert.ok(await page.locator('.campaign-workspace').evaluate(el=>el.scrollWidth<=el.clientWidth+1),'Campaign content overflow at '+width);
    assert.ok(await page.locator('.campaign-context').evaluate(el=>el.scrollWidth<=el.clientWidth+1),'Campaign detail overflow at '+width);
  }
  await page.getByRole('tab',{name:'Events',exact:true}).click();
  await page.waitForSelector('#eventReadout table');
  assert.equal(await page.locator('#eventReadout thead th').count(),4);
  assert.equal(await page.locator('#eventReadout .event-row').first().locator('th,td').count(),4);
  for (const width of [1440,1024,768,760,390,320]) {
    await page.setViewportSize({width,height:1000});
    const layout=await page.locator('#eventsPanel').evaluate(panel=>{
      const readout=panel.querySelector('#eventReadout');
      const rows=[...readout.querySelectorAll('.event-row')];
      const bounds=readout.getBoundingClientRect();
      return {
        fits:readout.scrollWidth<=readout.clientWidth+1,
        cellsFit:rows.every(row=>[...row.children].every(cell=>{const r=cell.getBoundingClientRect();return r.left>=bounds.left-1&&r.right<=bounds.right+1;})),
        numericColumns:rows.map(row=>[row.children[1].getBoundingClientRect().right,row.children[2].getBoundingClientRect().right]),
        controls:[...panel.querySelectorAll('.event-toolbar select,.event-toolbar button')].map(el=>el.getBoundingClientRect().height),
        labelsVisible:rows.every(row=>row.querySelector('.event-mobile-label').getBoundingClientRect().height>0)
      };
    });
    assert.ok(layout.fits&&layout.cellsFit,'Every event value must fit at '+width);
    assert.ok(layout.numericColumns.every(cols=>cols.every((x,i)=>Math.abs(x-layout.numericColumns[0][i])<1)),'Event columns must align at '+width);
    assert.ok(layout.controls.every(h=>h===40),'Filter/export controls must align at '+width);
    if(width<=760) assert.ok(layout.labelsVisible,'Mobile values need visible labels');
    assert.ok(await page.locator('.topbar').evaluate(el=>{const home=el.querySelector('.topbar-home').getBoundingClientRect(),center=el.querySelector('.topbar-center').getBoundingClientRect(),right=el.querySelector('.topbar-right').getBoundingClientRect();return home.right<=center.left&&center.right<=right.left;}),'Header items must not collide at '+width);
  }
  await page.getByRole('tab',{name:'Campaigns',exact:true}).click();
  await page.locator('.ad-card').first().click();
  assert.equal(await page.locator('label[for=cta]').innerText(),'Link button text');
  assert.equal(await page.locator('#formOverlay a[href*="campaign-report"]').count(),0);
  assert.equal(await page.locator('#adKpiBox').count(),0);
  assert.equal(await page.locator('#reportPeriod').count(),0);
  assert.deepEqual(errors,[]);
  console.log('PASS: app/campaign separation, preview beside metrics/settings, report consistency, editor context, compact tabs, event columns and zero-view rates');
} finally {await browser.close();}
