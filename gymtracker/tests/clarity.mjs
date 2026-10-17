// Run after integration.py with Playwright available; all fixture data stays local.
import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
try {
  await page.goto('http://localhost:8788/admin');
  await page.waitForFunction(()=>document.querySelector('#appMetrics')?.hidden===false);
  assert.ok(await page.locator('#dashboardAdPreview .creative-preview').count());
  const campaign=await page.locator('#creativeCampaign').inputValue();
  const sponsor=await page.locator('#dashboardAdPreview .creative-sponsor').innerText();
  const report=await browser.newPage();
  await report.goto('http://localhost:8788/api/admin/campaign-report?id='+encodeURIComponent(campaign)+'&days=30');
  assert.equal(await report.locator('.creative-sponsor').innerText(),sponsor);
  assert.equal(await report.locator('.creative-preview').count(),1);
  await report.close();
  const metricText=await page.locator('#appMetrics').innerText();
  for(const label of ['Ad views','Audience reached','Link taps','Tap rate','Unique app installs']) assert.ok(metricText.includes(label));
  assert.ok(!metricText.includes('CTA')&&!metricText.includes('CTR'));
  for(const width of [1440,390]) {
    await page.setViewportSize({width,height:1000});
    const spacing=await page.evaluate(()=>{
      const nav=document.querySelector('.dashboard-nav'),tab=nav.children[0],range=document.createRange();range.selectNodeContents(tab);
      return {belowText:nav.getBoundingClientRect().bottom-range.getBoundingClientRect().bottom,afterBar:document.querySelector('#dashboardContent').getBoundingClientRect().top-nav.getBoundingClientRect().bottom};
    });
    assert.ok(spacing.belowText<=7,JSON.stringify(spacing));
    assert.ok(spacing.afterBar<=12,JSON.stringify(spacing));
  }
  await page.getByRole('tab',{name:'Events',exact:true}).click();
  await page.waitForSelector('#eventReadout table');
  assert.equal(await page.locator('#eventReadout thead th').count(),4);
  assert.equal(await page.locator('#eventReadout tbody tr').first().locator('th,td').count(),4);
  await page.getByRole('tab',{name:'Campaigns',exact:true}).click();
  await page.locator('.ad-card').first().click();
  assert.equal(await page.locator('label[for=cta]').innerText(),'Link button text');
  const before=await page.evaluate(()=>formatCtrPct({impressions:0,clicks:3,ctr_percent:0}));
  assert.equal(before,'Not available');
  assert.equal(await page.evaluate(()=>formatCtrPct({impressions:100,clicks:3})), '3.0%');
  assert.deepEqual(errors,[]);
  console.log('PASS: compact tab spacing, metric explanations, aligned event columns, and zero-view rates');
} finally {await browser.close();}
