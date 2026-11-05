export const fields = [
 ['surname','성','Surname','text','예. 김'],['given','이름','Given Names','text','예. 하늘'],
 ['birth','생년월일','Date of Birth','date',''],['sex','성별','Sex','select',''],
 ['place','출생지','Place of Birth','text','예. 캘거리, 에드먼턴'],['registration','등록번호','Registration No.','text','등록번호'],
 ['registered','등록일','Registration Date','date',''],['issued','발급일','Date Issued','date',''],
 ['parent1','모 성명','Name of Parent','text','한글 성명'],['parent1Place','모 출생지','Place of Birth','text','예. 대한민국'],
 ['parent2','부 성명','Name of Parent','text','한글 성명'],['parent2Place','부 출생지','Place of Birth','text','예. 대한민국']
];
export function fieldsFor(region='ab') {
 if (!['ab','bc','sk'].includes(region)) throw new Error('지원하는 발급지역을 선택해 주세요.');
 if(region==='sk')return [
  ['name','성명','Name / Nom','text','예. 홍길동'],
  ['birth','생년월일','Date of Birth','date',''],['sex','성별','Sex','select',''],
  ['place','출생지','Place of Birth','text','예. 새스커툰, 리자이나'],
  ['registered','등록일','Registration Date','date',''],
  ['parent1','부모 1 성명','Parent(s)','text','한글 성명'],
  ['parent1Place','부모 1 출생지','Place of Birth','text','예. 대한민국'],
  ['parent2','부모 2 성명','Parent(s)','text','한글 성명'],
  ['parent2Place','부모 2 출생지','Place of Birth','text','예. 대한민국'],
  ['registration','등록번호','Registration No.','text','등록번호'],
  ['issued','발급일','Date Issued','date','']
 ];
 return fields.map(field=>{
  const copy=[...field];
  if(region==='bc'){
   const labels={parent1:'부모 1 성명',parent1Place:'부모 1 출생지',parent2:'부모 2 성명',parent2Place:'부모 2 출생지'};
   if(labels[copy[0]])copy[1]=labels[copy[0]];
   if(copy[0]==='registration')copy[2]='Registration Number';
   if(copy[0]==='registered')copy[2]='Date of Registration';
   if(copy[0]==='issued')copy[2]='Date of Issue';
   if(copy[0]==='place')copy[4]='예. 밴쿠버, 빅토리아';
   if(copy[0].endsWith('Place')){copy[2]='Birthplace of Parent';copy[4]='예. 대한민국';}
  }
  return copy;
 });
}
export function helpFor(region='ab') {
 if(region==='sk')return {...help,name:'원본 Name에 적힌 아기의 성과 이름 전체를 한글로 적어 주세요.',place:'아기가 태어난 도시를 한글로 적어 주세요. 예: 새스커툰, 리자이나',parent1:'원본의 첫 번째 부모 성명을 한글로 적어 주세요.',parent2:'원본의 두 번째 부모 성명을 한글로 적어 주세요.',parent1Place:'첫 번째 부모의 출생지를 원본에 적힌 범위대로 한글로 적어 주세요.',parent2Place:'두 번째 부모의 출생지를 원본에 적힌 범위대로 한글로 적어 주세요.'};
 return region==='bc'?{...help,place:'아기가 태어난 도시를 한글로 적어 주세요. 예: 밴쿠버, 빅토리아',sex:'원본의 MALE(남), FEMALE(여)를 선택하거나, 다른 표기는 기타를 선택해 직접 입력해 주세요.',parent1:'원본의 첫 번째 부모 성명을 한글로 적어 주세요.',parent2:'원본의 두 번째 부모 성명을 한글로 적어 주세요.',parent1Place:'첫 번째 부모의 출생지를 원본에 적힌 범위대로 한글로 적어 주세요.',parent2Place:'두 번째 부모의 출생지를 원본에 적힌 범위대로 한글로 적어 주세요.'}:help;
}
export function koreanDate(value){if(!/^\d{4}-\d{2}-\d{2}$/.test(value))throw new Error('날짜를 선택해 주세요.');const [y,m,d]=value.split('-').map(Number);const date=new Date(0);date.setUTCFullYear(y,m-1,d);if(y<1000||date.getUTCFullYear()!==y||date.getUTCMonth()!==m-1||date.getUTCDate()!==d)throw new Error('유효한 날짜를 선택해 주세요.');return `${y}년 ${m}월 ${d}일`;}
export class ValidationError extends Error {
 constructor(errors){super(Object.values(errors)[0]);this.name='ValidationError';this.errors=errors;}
}
export function validate(data){
 const region=data.region||'ab';
 const labels=Object.fromEntries(fieldsFor(region).map(([key,label])=>[key,label]));
 Object.assign(labels,{registrarKo:region==='sk'?'등록관 이름':region==='bc'?'인구동태통계 총등록관 이름':'인구동태통계 등록관 이름',translator:'번역자 이름',formCode:'서식 번호',serial:'증명서 번호',sexOther:'성별 직접 입력'});
 const errors={};
 const add=(key,message)=>{if(!errors[key])errors[key]=message;};
 const value=key=>typeof data[key]==='string'?data[key].trim():'';
 for(const key of [...fieldsFor(region).map(([key])=>key),'registrarKo','translator']){
  if(!value(key))add(key,`${labels[key]} 항목을 입력해 주세요.`);
 }
 const validDates={};
 for(const key of ['birth','registered','issued']){
  if(!value(key))continue;
  try{koreanDate(data[key]);validDates[key]=true;}catch{add(key,`${labels[key]}에 유효한 날짜를 선택해 주세요.`);}
 }
 if(value('sex')&&!['M','F','OTHER'].includes(data.sex))add('sex','성별을 선택해 주세요.');
 if(data.sex==='OTHER'&&(!value('sexOther')||value('sexOther').length>30||/[\u0000-\u001f\u007f]/.test(data.sexOther)))add('sexOther','원본의 성별 표기를 30자 이내로 직접 입력해 주세요.');
 if(validDates.birth&&validDates.registered&&data.birth>data.registered)add('registered','등록일은 생년월일과 같거나 이후여야 합니다. 날짜 순서를 확인해 주세요.');
 if(validDates.registered&&validDates.issued&&data.registered>data.issued)add('issued','발급일은 등록일과 같거나 이후여야 합니다. 날짜 순서를 확인해 주세요.');
 const koreanKeys=[...fieldsFor(region).filter(f=>f[3]==='text'&&f[0]!=='registration').map(([key])=>key),'registrarKo','translator'];
 for(const key of koreanKeys){
  if(value(key)&&(!/\p{Script=Hangul}/u.test(data[key])||/\p{Script=Latin}/u.test(data[key])))add(key,`${labels[key]}은(는) 한글로 입력해 주세요.`);
 }
 const limits={...Object.fromEntries(fieldsFor(region).filter(f=>f[3]==='text').map(([key])=>[key,80])),registrarKo:80,translator:80,formCode:60,serial:40};
 for(const [key,limit]of Object.entries(limits))if(value(key).length>limit)add(key,`${labels[key]} 항목은 ${limit}자 이내로 입력해 주세요.`);
 if(Object.keys(errors).length)throw new ValidationError(errors);
 return data;
}
export const help={surname:'출생신고할 아기의 성을 한글로 적어 주세요.',given:'성을 제외한 아기의 이름을 한글로 적어 주세요.',birth:'아기가 태어난 날짜를 선택해 주세요.',sex:'원본의 성별을 선택해 주세요. 남·여 이외의 표기는 기타를 선택해 직접 입력합니다.',place:'아기가 태어난 도시를 한글로 적어 주세요.',parent1:'어머니의 성과 이름을 한글로 적어 주세요.',parent1Place:'어머니가 태어난 국가를 한글로 적어 주세요.',parent2:'아버지의 성과 이름을 한글로 적어 주세요.',parent2Place:'아버지가 태어난 국가를 한글로 적어 주세요.'};

export function sexLabel(data){return data.sex==='M'?'남':data.sex==='F'?'여':data.sexOther.trim();}
