// Optional browser regression check. Set PLAYWRIGHT_MODULE_PATH or install playwright locally.
import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const browser=await chromium.launch();
const page=await browser.newPage();
try {
  await page.goto('http://localhost:8788/admin');
  await page.waitForFunction(()=>document.querySelector('#appMetrics')?.hidden === false);
  const ribbon = await page.locator('.dashboard-nav').boundingBox();
  const heading = await page.locator('.workspace-heading').boundingBox();
  for (const view of ['Campaigns','Events','Overview','Campaigns']) {
    await page.getByRole('tab',{name:view,exact:true}).click();
    assert.deepEqual(await page.locator('.dashboard-nav').boundingBox(),ribbon,'Ribbon shifted on '+view);
    assert.deepEqual(await page.locator('.workspace-heading').boundingBox(),heading,'Heading shifted on '+view);
    assert.equal(await page.locator('h1').innerText(),'Dashboard');
  }
  for(const width of [1440,1100,1000,900,800,768,640,500,390,320]) {
    await page.setViewportSize({width,height:1000});
    const result=await page.evaluate(()=>{
      const main=document.querySelector('.main'),calendar=document.querySelector('.calendar-wrap'),grid=document.querySelector('.cal-days');
      const bounds=grid.getBoundingClientRect();
      return {mainFits:main.scrollWidth<=main.clientWidth+1,calendarFits:calendar.scrollWidth<=calendar.clientWidth+1,
        cellsFit:[...grid.children].every(cell=>{const r=cell.getBoundingClientRect();return r.left>=bounds.left-1&&r.right<=bounds.right+1;})};
    });
    assert.deepEqual(result,{mainFits:true,calendarFits:true,cellsFit:true},'Overflow at viewport '+width);
  }
  await page.getByRole('tab',{name:'Overview',exact:true}).click();
  for(const period of ['90','180','365']) {
    const response=page.waitForResponse(r=>r.url().includes('/api/admin/stats?days='+period));
    await page.locator('#analyticsPeriod').selectOption(period);
    assert.equal((await response).status(),200);
  }
  console.log('PASS: calendar remains contained at 10 widths (320–1440px); extended report controls load');
} finally { await browser.close(); }
