"""Run against an isolated local `wrangler dev --port 8788` with migrations applied."""
import json,uuid,urllib.request,urllib.error
from datetime import datetime,timezone,timedelta
from pathlib import Path
BASE='http://localhost:8788'
def request(path, body=None, method='GET', headers=None):
    h={'Content-Type':'application/json'};h.update(headers or {})
    req=urllib.request.Request(BASE+path,data=json.dumps(body).encode() if body is not None else None,method=method,headers=h)
    try:
        with urllib.request.urlopen(req) as r:return r.status,r.read().decode(),dict(r.headers)
    except urllib.error.HTTPError as r:return r.code,r.read().decode(),dict(r.headers)
def data(path):
    status,body,_=request(path);assert status==200,(status,body);return json.loads(body)

campaign='qa-campaign-'+uuid.uuid4().hex[:8]
ad={'id':campaign,'active':True,'sponsor':'Campus Partners <Sample>','headline':'A test campaign','cta':'Learn more','destination_url':'https://example.com','tier':'text','start_at':(datetime.now(timezone.utc)-timedelta(seconds=1)).isoformat()}
for label in [None,'Partner','Student Organization','']:
    payload=dict(ad)
    if label is not None:payload['sponsored_label']=label
    status,body,_=request('/api/admin/ads',payload,'PUT');assert status==200,body
    assert json.loads(body)['sponsored_label']==('Sponsored' if label is None else label)
    assert data('/api/ads')['sponsored_label']==('Sponsored' if label is None else label)
assert request('/api/admin/ads',{**ad,'sponsored_label':5},'PUT')[0]==400
assert request('/api/admin/ads',{**ad,'sponsored_label':'Anything'},'PUT')[0]==400
baseline=data('/api/admin/stats')
installations=[str(uuid.uuid4()),str(uuid.uuid4())]
session=str(uuid.uuid4())
def event(name,which=0,**extra):
    return {'event_id':str(uuid.uuid4()),'event':name,'distinct_id':installations[which], 'properties':{'session_id':session,'app_version':'1.5.3','build':'20','os_version':'QA','ad_id':campaign,'creative_version':'v1','placement':'home_feed',**extra}}
for name,which in [('app_session',0),('ad_impression',0),('ad_impression',1),('ad_tap',0),('event_open',0),('passport_open',0)]:
    payload=event(name,which)
    assert request('/api/events',payload,'POST')[0]==204
    assert request('/api/events',payload,'POST')[0]==204 # same event ID is idempotent
assert request('/api/events',event('siri_crowds',status='cached'),'POST')[0]==204
assert request('/api/events',event('siri_events',status='unavailable'),'POST')[0]==204
assert request('/api/events',event('siri_events',status='invented'),'POST')[0]==400
assert request('/api/events',event('unexpected'),'POST')[0]==400
assert request('/api/events',{**event('app_session'),'distinct_id':'email@example.com'},'POST')[0]==400
assert request('/api/events',event('ad_impression',ad_id='dev_test'),'POST')[0]==400
assert request('/api/events',event('app_session',extra='x'*6000),'POST')[0]==413
stats=data('/api/admin/stats')
assert stats['sessions']==baseline['sessions']+1,stats
assert stats['siri_actions']==baseline['siri_actions']+2,stats
assert stats['siri_unavailable']==baseline['siri_unavailable']+1,stats
per=next(x for x in stats['per_ad'] if x['ad_id']==campaign)
assert per['impressions']==2 and per['clicks']==1 and per['ctr_percent']==50,per
events=data('/api/admin/events?campaign='+campaign+'&days=30')['events']
assert len(events)==2 and sum(e['occurrences'] for e in events)==3,events
assert data('/api/admin/events?campaign=%27%20OR%201%3D1')['events']==[]
assert request('/api/admin/events?days=-1')[0]==400
for days in [7,30,90,180,365]:
    overview=data('/api/admin/stats?days='+str(days))
    assert overview['days']==days and overview['schema_version']==1
    assert overview['comparison_available'] is False
    assert request('/api/admin/events?days='+str(days))[0]==200
    assert request('/api/admin/campaign-report?id='+campaign+'&days='+str(days))[0]==200
assert request('/api/events',{**event('app_session'),'schema_version':999},'POST')[0]==422
assert request('/api/admin/ads',{**ad,'start_at':'bad date'},'PUT')[0]==400
assert request('/api/admin/ads',{**ad,'start_at':'2026-11-02T00:00:00Z','end_at':'2026-11-01T00:00:00Z'},'PUT')[0]==400
report=data('/api/admin/campaign-report?id='+campaign+'&days=30&format=json')
assert (report['impressions'],report['clicks'],report['reach'],report['unique_clickers'])==(2,1,2,1),report
period_start=datetime.fromisoformat(report['period']['from'].replace('Z','+00:00'))
period_end=datetime.fromisoformat(report['period']['before'].replace('Z','+00:00'))
assert abs((period_end-period_start).total_seconds()-30*86400)<1,report['period']
assert report['period']['label']=='Last 30 days'
# Editing the current schedule must not erase recorded historical activity in a preset window.
assert request('/api/admin/ads',{**ad,'start_at':'2030-01-01T00:00:00Z'},'PUT')[0]==200
assert data('/api/admin/campaign-report?id='+campaign+'&days=30&format=json')['impressions']==2
future=data('/api/admin/campaign-report?id='+campaign+'&days=campaign&format=json')
assert future['period']['not_started'] is True and future['impressions']==0
assert request('/api/admin/ads',ad,'PUT')[0]==200
status,html,headers=request('/api/admin/campaign-report?id='+campaign+'&days=30')
assert status==200 and 'Campus Partners &lt;Sample&gt;' in html and '50.00%' in html
assert 'Save as PDF / Print' in html and 'Cache-Control' in headers
assert 'unique app' in html and 'What happened' in html
assert 'break-before:page' not in html
assert 'Link button text' in html
assert request('/api/admin/campaign-report?id='+campaign+'&days=-1')[0]==400
assert request('/api/admin/campaign-report?id=missing')[0]==404
assert request('/api/admin/campaign-report?id='+campaign+'&download=1')[2]['Content-Disposition'].startswith('attachment')
assert request('/privacy')[0]==200
Path('/tmp/gymtracker-qa-campaign.txt').write_text(campaign)
Path('/tmp/gymtracker-report-sample.html').write_text(html)
print('PASS: labels, backwards compatibility, validation, event idempotency, metrics, reach/CTR, campaign export, and privacy route')
