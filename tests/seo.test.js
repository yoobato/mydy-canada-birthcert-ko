import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const origin='https://canada-birthcert-ko.mydy.kr';
const documents=[['index.html','/']];
test('public search pages have distinct canonical metadata, readable content and valid linked data',()=>{
 const titles=new Set();
 for(const [file,path] of documents){
  const html=readFileSync(file,'utf8');
  assert.ok(html.includes(`rel="canonical" href="${origin}${path}"`));
  assert.ok(!html.includes('ab-birthcert-ko.mydy.kr'));
  assert.ok(!html.includes('noindex'));
  const title=html.match(/<title>(.*?)<\/title>/)[1];assert.ok(!titles.has(title));titles.add(title);
  assert.match(html,/<h1[^>]*>[^<]+/);
  for(const key of ['description','og:description','twitter:description']){const meta=html.match(new RegExp('<meta (?:name|property)=\"'+key+'\" content=\"([^\"]+)\"'));assert.ok(meta);assert.match(meta[1],/서스캐처원\(SK\)/);}
  assert.match(html,/SK주 샘플 번역문 보기/);
  assert.match(html,/<h2 id="faq-title">자주 묻는 질문<\/h2>/);
  assert.equal((html.match(/<details>/g)||[]).length,8);
  assert.ok(!html.includes('<details open'));
  assert.ok(!html.includes('service-guide'));
  assert.ok(!html.includes('href="/bc/"'));
  assert.ok(!html.includes('href="/alberta/"'));
  for(const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g))assert.equal(JSON.parse(match[1])['@context'],'https://schema.org');
  for(const match of html.matchAll(/href="(\/[^"?#]*)(?:[?#][^"]*)?"/g)){
   const target=match[1];if(target==='/')continue;
   assert.ok(existsSync('public'+target+(target.endsWith('/')?'index.html':'')),`${file}: broken link ${target}`);
  }
 }
});
test('sitemap lists canonical pages and search crawlers are allowed',()=>{
 const sitemap=readFileSync('public/sitemap.xml','utf8');
 for(const [,path] of documents)assert.ok(sitemap.includes(`<loc>${origin}${path}</loc>`));
 assert.equal((sitemap.match(/<url>/g)||[]).length,1);
 const robots=readFileSync('public/robots.txt','utf8');
 assert.match(robots,/User-agent: \*\nAllow: \//);
 assert.match(robots,/User-agent: OAI-SearchBot\nAllow: \//);
 assert.ok(robots.includes(origin+'/sitemap.xml'));
});
