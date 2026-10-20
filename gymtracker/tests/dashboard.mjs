// Browser regression for the admin app. Run against `npm run dev` (port 8788); fixtures are local and removed afterwards.
// Set PLAYWRIGHT_MODULE_PATH or install playwright locally.
import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const BASE='http://localhost:8788';
const api=(path,init={})=>fetch(BASE+path,{...init,headers:{'Content-Type':'application/json'}});
const id='qa-dashboard-'+Math.random().toString(36).slice(2,8);
const fixture={id,active:true,sponsor:'QA Dashboard <Sponsor>',headline:'Fixture headline',cta:'Visit',destination_url:'https://example.com',tier:'text',start_at:new Date(Date.now()-3600e3).toISOString()};
assert.equal((await api('/api/admin/ads',{method:'PUT',body:JSON.stringify(fixture)})).status,200);

const browser=await chromium.launch();
const errors=[];
const open=async(viewport={width:1440,height:1000})=>{const page=await browser.newPage({viewport});page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!m.text().includes('favicon'))errors.push(m.text())});return page;};
const settle=page=>page.waitForLoadState('networkidle').then(()=>page.waitForTimeout(250));
try {
  // Mobile-by-default guarantee: no page scrolls sideways at any width.
  const routes=['/admin','/admin/campaigns','/admin/campaigns/'+id,'/admin/events','/admin/data'];
  const page=await open();
  for(const width of [1440,1024,768,390,320]) {
    await page.setViewportSize({width,height:900});
    for(const route of routes) {
      await page.goto(BASE+route);await settle(page);
      await page.locator('h1').first().waitFor();
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
      assert.ok(overflow<=1,`${route} scrolls sideways by ${overflow}px at ${width}px`);
    }
  }
  await page.setViewportSize({width:1440,height:1000});

  // Overview: app health only; KPI cards drive the trend chart.
  await page.goto(BASE+'/admin');await settle(page);
  const overview=await page.locator('#page').innerText();
  for(const label of ['Active installs','New installs','App visits','Returning installs','Campus ID reach','When people open the app','Visit frequency','Feature usage','Siri requests answered','Platform']) assert.ok(overview.includes(label),'Overview is missing '+label);
  for(const label of ['Tap rate','Ad views']) assert.ok(!overview.includes(label),'Ad metrics belong in Campaigns, not Overview');
  await page.getByRole('button',{name:/App visits/}).click();
  assert.equal(await page.getByRole('button',{name:/App visits/}).getAttribute('aria-pressed'),'true');
  assert.equal(await page.locator('#chartMetric').innerText(),'App visits');

  // Global filters live in the URL, reach the API, and are remembered.
  const stats=page.waitForRequest(r=>r.url().includes('/api/admin/stats?days=30'));
  await page.getByRole('combobox',{name:'Reporting period'}).click();await page.getByRole('option',{name:'Last 30 days'}).click();
  await stats;assert.ok(page.url().includes('days=30'));
  const internal=page.waitForRequest(r=>r.url().includes('internal=include'));
  await page.locator('#excludeInternal').click();await internal;assert.ok(page.url().includes('internal=include'));
  await page.goto(BASE+'/admin/events');await settle(page);
  assert.equal(await page.getByRole('combobox',{name:'Reporting period'}).innerText(),'Last 30 days','Period is remembered across visits');
  assert.equal(await page.locator('#excludeInternal').getAttribute('data-state'),'unchecked');
  await page.locator('#excludeInternal').click();await settle(page);

  // Events: table and CSV export.
  await page.locator('#eventTable tbody tr').first().waitFor();
  const download=page.waitForEvent('download');await page.locator('#exportEvents').click();
  const file=await (await download).createReadStream();let csv='';for await(const chunk of file) csv+=chunk;
  assert.ok(csv.startsWith('"Event","Label","Category","Times recorded"'),csv.slice(0,80));

  // Campaigns: list → detail → report share one preview renderer.
  await page.goto(BASE+'/admin/campaigns');await settle(page);
  await page.getByRole('link',{name:'QA Dashboard <Sponsor> '+id}).click();await settle(page);
  assert.ok(page.url().includes('/admin/campaigns/'+id));
  assert.equal((await page.locator('#page .creative-sponsor').first().innerText()).toLowerCase(),'qa dashboard <sponsor>','Preview text is escaped, not interpreted');
  const reportHref=await page.getByRole('link',{name:/Sponsor report/}).getAttribute('href');
  assert.ok(reportHref.includes('id='+id));
  const report=await open();await report.goto(BASE+reportHref);
  assert.equal(await report.locator('.creative-sponsor').innerText(),await page.locator('#page .creative-sponsor').first().innerText());
  await report.close();

  // Editor: validation, save, and labels.
  await page.getByRole('button',{name:'Edit'}).click();
  const sheet=page.getByRole('dialog');
  assert.equal(await sheet.getByLabel('Link button text').inputValue(),'Visit');
  await sheet.getByLabel('Headline').fill('');await sheet.getByRole('button',{name:'Save'}).click();
  await sheet.getByText('Required').first().waitFor();
  await sheet.getByLabel('Headline').fill('Edited headline');await sheet.getByRole('button',{name:'Save'}).click();
  await sheet.waitFor({state:'hidden'});
  assert.equal((await (await api('/api/admin/ads')).json()).ads.find(a=>a.id===id).headline,'Edited headline');

  // New campaign from the list, then delete it from its editor.
  await page.goto(BASE+'/admin/campaigns');await settle(page);
  await page.getByRole('button',{name:'New campaign'}).click();
  const created=id+'-new';
  for(const [label,value] of [['Campaign ID',created],['Sponsor','QA New'],['Headline','New'],['Link button text','Go'],['Destination URL','https://example.com'],['Image URL','https://example.com/a.png']]) await page.getByRole('dialog').getByLabel(label).fill(value);
  await page.getByRole('dialog').getByRole('button',{name:'Save'}).click();
  await page.getByRole('dialog').waitFor({state:'hidden'});
  await page.getByRole('link',{name:'QA New '+created}).click();await settle(page);
  await page.getByRole('button',{name:'Edit'}).click();
  await page.getByRole('dialog').getByRole('button',{name:'Delete'}).click();
  await page.getByRole('alertdialog').getByRole('button',{name:'Delete'}).click();
  await page.waitForTimeout(400);
  assert.ok(!(await (await api('/api/admin/ads')).json()).ads.some(a=>a.id===created));

  // Data quality.
  await page.goto(BASE+'/admin/data');await settle(page);
  const data=await page.locator('#page').innerText();
  for(const label of ['Collecting since','Latest event','Internal installs','Suggested internal installs']) assert.ok(data.includes(label),'Data quality is missing '+label);

  // Phone: navigation lives in a sheet behind the sidebar trigger.
  const phone=await open({width:390,height:844});
  await phone.goto(BASE+'/admin');await settle(phone);
  await phone.getByRole('button',{name:'Toggle Sidebar'}).click();
  await phone.getByRole('link',{name:'Campaigns'}).click();await settle(phone);
  assert.equal(await phone.locator('h1').innerText(),'Campaigns');
  await phone.close();

  assert.deepEqual(errors,[]);
  console.log('PASS: no sideways scrolling on any page at 320–1440px, KPI-driven chart, URL filters, events CSV, campaign list/detail/report, editor validation/save/create/delete, data quality, phone navigation');
} finally {
  await browser.close();
  await api('/api/admin/ads?id='+encodeURIComponent(id),{method:'DELETE'});
}
