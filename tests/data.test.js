import test from 'node:test';import assert from 'node:assert/strict';
import {koreanDate,validate,sexLabel,fieldsFor} from '../src/data.js';
const sample={surname:'김',given:'하늘',birth:'2024-02-29',sex:'F',place:'에드먼턴',registration:'TEST-0000',registered:'2024-03-01',issued:'2024-03-05',parent1:'이예시',parent1Place:'대한민국',parent2:'김예시',parent2Place:'대한민국',registrarKo:'트레버 버겐',translator:'김번역'};
test('dates remain local calendar dates, including leap day',()=>{assert.equal(koreanDate('2024-02-29'),'2024년 2월 29일');assert.throws(()=>koreanDate('2023-02-29'));assert.throws(()=>koreanDate('2024-13-01'));});
test('reject incomplete, English, and reversed dates',()=>{assert.equal(validate(sample),sample);for(const override of [{registrarKo:''},{registrarKo:'Trevor Bergen'},{birth:'2024-03-03'},{issued:'2024-02-01'},{surname:'Kim'},{sex:'X'},{translator:''}])assert.throws(()=>validate({...sample,...override}));});
test('BC parental certificate requires sex and supports explicit other text',()=>{
 const bc={...sample,region:'bc',formCode:'',place:'밴쿠버, 브리티시컬럼비아주'};
 assert.equal(validate(bc),bc);
 assert.throws(()=>validate({...bc,sex:''}));
 assert.throws(()=>validate({...bc,sex:'',sexDisplayed:false}));
 assert.throws(()=>validate({...bc,parent2:''}));
 assert.throws(()=>validate({...bc,region:'unknown'}));
 for(const region of ['bc','ab']){
  for(const value of ['X','기타 표기']){const custom={...bc,region,sex:'OTHER',sexOther:value};validate(custom);assert.equal(sexLabel(custom),value);}
  for(const sexOther of ['', '   ', 'X'.repeat(31), 'X\nY'])assert.throws(()=>validate({...bc,region,sex:'OTHER',sexOther}));
 }
 assert.equal(sexLabel({...bc,sex:'F',sexOther:'X'}),'여');
});

test('Hangul syllables, compatibility jamo and decomposed jamo are accepted per field',()=>{
 for(const name of ['ㅁㄴㅇㄹ','김','김하늘']){
  assert.equal(validate({...sample,registrarKo:name,translator:name}).translator,name);
 }
});
test('invalid fields have independent messages and date errors belong to their field',()=>{
 try{validate({...sample,registrarKo:'Trevor',translator:'Kim',place:'Calgary'});assert.fail('Expected validation errors');}
 catch(error){assert.deepEqual(Object.keys(error.errors).sort(),['place','registrarKo','translator']);assert.match(error.errors.registrarKo,/등록관 이름/);assert.ok(!error.errors.registrarKo.includes('번역자'));assert.match(error.errors.translator,/번역자 이름/);}
 for(const [key,override]of [['registered',{registered:'2024-02-28'}],['issued',{issued:'2024-02-29'}],['birth',{birth:'2024-02-30'}]])assert.throws(()=>validate({...sample,...override}),error=>Boolean(error.errors[key]));
});


test('SK long form uses one full-name field and independent parent birthplaces',()=>{
 const sk={...sample,region:'sk',name:'홍길동',surname:undefined,given:undefined,place:'새스커툰'};
 assert.equal(validate(sk),sk);
 const keys=fieldsFor('sk').map(f=>f[0]);
 assert.ok(keys.includes('name'));assert.ok(!keys.includes('surname'));assert.ok(!keys.includes('given'));
 for(const key of ['name','parent1','parent1Place','parent2','parent2Place','registrarKo'])assert.throws(()=>validate({...sk,[key]:''}),e=>Boolean(e.errors[key]));
 assert.throws(()=>validate({...sk,name:'Hong'}),e=>Boolean(e.errors.name));
 validate({...sk,sex:'OTHER',sexOther:'X'});
});
