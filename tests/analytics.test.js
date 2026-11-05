import test from 'node:test';
import assert from 'node:assert/strict';
import {createAnalytics, MEASUREMENT_ID} from '../src/analytics.js';

test('only fixed telemetry is queued; user data and arbitrary event names are excluded',()=>{
  const scripts=[];const win={location:{href:'https://example.com/?name=PRIVATE#PRIVATE'},document:{referrer:'PRIVATE'}};
  const doc={createElement:()=>({}),head:{appendChild:s=>scripts.push(s)}};
  const analytics=createAnalytics(win,doc,true);
  analytics.track('page_view','bc');
  analytics.track('translation_preview','ab');
  analytics.track('pdf_download','ab');
  analytics.track('preview_pdf_download','bc');
  analytics.track('support_click','bc');
  analytics.track('pdf_download','sk');
  analytics.track('PRIVATE','bc');
  analytics.track('pdf_download',{name:'PRIVATE'});
  analytics.track('support_click','PRIVATE');
  analytics.track('page_view');
  const commands=win.dataLayer.map(a=>Array.from(a));
  assert.deepEqual(commands.filter(a=>a[0]==='event').map(a=>a[1]),['page_view','translation_preview','pdf_download','preview_pdf_download','support_click','pdf_download']);
  assert.deepEqual(commands.filter(a=>a[0]==='event').map(a=>a[2].certificate_region),['bc','ab','ab','bc','bc','sk']);
  assert.equal(commands.find(a=>a[0]==='config')[2].page_title,'캐나다 출생증명서 번역 | BC·알버타·SK 한글 번역문 PDF');
  assert.ok(!JSON.stringify(commands).includes('PRIVATE'));
  assert.equal(commands.find(a=>a[0]==='config')[2].send_page_view,false);
  assert.equal(commands.find(a=>a[0]==='config')[2].allow_google_signals,false);
  assert.equal(scripts[0].src,`https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`);
  assert.equal(scripts[0].referrerPolicy,'no-referrer');
});
test('development does not load Google or queue telemetry',()=>{
  const win={};const analytics=createAnalytics(win,{createElement(){throw Error('must not load')}},false);
  analytics.track('page_view');assert.equal(win.dataLayer,undefined);
});

test('Threads attribution accepts only the fixed campaign and excludes arbitrary URL data',()=>{
  function commands(query){
    const win={location:{href:'https://canada-birthcert-ko.mydy.kr/?'+query+'#PRIVATE'}};
    const doc={createElement:()=>({}),head:{appendChild(){}}};
    const analytics=createAnalytics(win,doc,true);
    analytics.track('page_view','bc');analytics.track('pdf_download','ab');
    return win.dataLayer.map(a=>Array.from(a));
  }
  const approved='utm_source=threads&utm_medium=social&utm_campaign=birthcert_launch';
  for(const query of [approved,'from=threads']){
    const accepted=commands(query+'&name=PRIVATE&utm_content=PRIVATE');
    for(const command of accepted.filter(a=>a[0]==='config'||a[0]==='event')){
      const payload=command[2];
      assert.equal(payload.campaign_source,'threads');
      assert.equal(payload.campaign_medium,'social');
      assert.equal(payload.campaign_name,'birthcert_launch');
      assert.equal(payload.page_location,'https://canada-birthcert-ko.mydy.kr/');
    }
    assert.ok(!JSON.stringify(accepted).includes('PRIVATE'));
  }
  for(const query of ['utm_source=PRIVATE&utm_medium=social&utm_campaign=birthcert_launch','utm_source=threads',approved+'&utm_source=PRIVATE','from=PRIVATE','from=threads&from=PRIVATE','from=Threads','from=threads-other']){
    const rejected=commands(query);
    assert.ok(!JSON.stringify(rejected).includes('PRIVATE'));
    assert.equal(rejected.find(a=>a[0]==='config')[2].campaign_source,undefined);
  }
});
