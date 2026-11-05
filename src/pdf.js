import {PDFDocument,rgb} from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import {koreanDate,validate,sexLabel} from './data.js';
export async function createPdf(data,fontBytes,{sample=false}={}){
 validate(data);
 const bc=data.region==='bc',sk=data.region==='sk';
 if(!fontBytes){const response=await fetch(`${import.meta.env.BASE_URL}fonts/NanumGothic-Regular.ttf`);if(!response.ok)throw new Error('한글 글꼴을 불러오지 못했습니다.');fontBytes=await response.arrayBuffer();}
 const pdf=await PDFDocument.create();pdf.registerFontkit(fontkit);const font=await pdf.embedFont(fontBytes,{subset:false});pdf.setTitle('출생증명서 한글 번역문');pdf.setCreator('Canadian Birth Certificate KO');
 const page=pdf.addPage([612,792]);const ink=rgb(.12,.16,.18),line=rgb(.75,.78,.77),wash=rgb(.95,.96,.95);
 const text=(value,x,y,size=11,maxWidth=500)=>{value=String(value||'');const needed=font.widthOfTextAtSize(value,size);if(needed>maxWidth)size=Math.max(7,size*maxWidth/needed);if(font.widthOfTextAtSize(value,size)>maxWidth)throw new Error('입력 내용이 너무 깁니다.');page.drawText(value,{x,y,size,font,color:ink});};
 const rule=(x1,y1,x2,y2)=>page.drawLine({start:{x:x1,y:y1},end:{x:x2,y:y2},thickness:.5,color:line});
 page.drawRectangle({x:180,y:720,width:394,height:40,borderColor:ink,borderWidth:1});
 text(bc?'출생증명서':'출 생',bc?300:344,732,22);
 if(sk){text('서스캐처원',190,676,26,384);}else if(bc){text('브리티시컬럼비아',190,676,26,384);}else{text('알버타',260-font.widthOfTextAtSize('알버타',29),676,29);text('캐나다',260-font.widthOfTextAtSize('캐나다',15),651,15);}
 text('출생증명서',38,604,20);
 text(data.formCode,38,554,9,150);
 const centered=(value,left,width,y,size)=>{const fit=Math.min(size,width/font.widthOfTextAtSize(value,1));text(value,left+(width-font.widthOfTextAtSize(value,fit))/2,y,fit,width);};
 centered(data.registrarKo,210,170,564,11);centered(sk?'등록관':bc?'인구동태통계 총등록관':'인구동태통계 등록관',210,170,545,10);
 if(!sk)centered(bc?'캐나다 브리티시컬럼비아주':'캐나다 알버타주 에드먼턴에',399,175,568,9);if(!sk)centered(bc?'빅토리아에 등록된 출생기록에서':'등록된 출생기록에서',399,175,553,9);if(!sk)centered('추출된 증명서',399,175,538,9);
 const heading=(value,left,cellWidth,y)=>{const chars=[...value.replace(/ /g,'')];const size=10,span=45;const start=left+(cellWidth-span)/2;if(chars.length===1){centered(value,left,cellWidth,y,size);return;}const gap=(span-font.widthOfTextAtSize(chars.join(''),size))/(chars.length-1);let x=start;for(const c of chars){text(c,x,y,size);x+=font.widthOfTextAtSize(c,size)+gap;}};
 const rows=sk?[['성명',data.name],['생년월일',koreanDate(data.birth),'성별',sexLabel(data)],['출생지',data.place,'등록일',koreanDate(data.registered)],['부모 1 성명',data.parent1,'출생지',data.parent1Place],['부모 2 성명',data.parent2,'출생지',data.parent2Place],['등록번호',data.registration,'발급일',koreanDate(data.issued)]]:[['성',data.surname],['이름',data.given],['생년월일',koreanDate(data.birth),'성별',sexLabel(data)],['출생지',data.place],['등록번호',data.registration],['등록일',koreanDate(data.registered),'발급일',koreanDate(data.issued)],[bc?'부모 1 성명':'모 성명',data.parent1],['출생지',data.parent1Place],[bc?'부모 2 성명':'부 성명',data.parent2],['출생지',data.parent2Place]];
 const xs=[38,129,333,402,557],rowHeight=35,top=512;
 rows.forEach((r,i)=>{const y=sk?(i===5?232:top-i*48):top-i*rowHeight;const end=r.length===4?557:333;page.drawRectangle({x:38,y:y-rowHeight,width:91,height:rowHeight,color:wash});if(r.length===4)page.drawRectangle({x:333,y:y-rowHeight,width:69,height:rowHeight,color:wash});rule(38,y,end,y);rule(38,y-rowHeight,end,y-rowHeight);for(const x of (r.length===4?xs:xs.slice(0,3)))rule(x,y,x,y-rowHeight);heading(r[0],38,91,y-23);text(r[1],139,y-23,12,184);if(r.length===4){heading(r[2],333,69,y-23);text(r[3],412,y-23,11,135);}});
 const serial=String(data.serial||'');let letterSize=10;const spacing=6;const width=font.widthOfTextAtSize(serial,letterSize)+Math.max(0,serial.length-1)*spacing;
 // Keep tracking visible while fitting long document numbers within the page.
 const scale=Math.min(1,220/Math.max(1,width));let x=445-width*scale/2;
 for(const char of serial){text(char,x,140,letterSize*scale,220);x+=(font.widthOfTextAtSize(char,letterSize)+spacing)*scale;}
 const y=55,height=38;page.drawRectangle({x:38,y,width:91,height,color:wash});
 for(const edge of [[38,y,333,y],[38,y+height,333,y+height],[38,y,38,y+height],[129,y,129,y+height],[333,y,333,y+height]])rule(...edge);
 heading('번역자',38,91,y+13);text(data.translator,139,y+13,12,115);
 page.drawText('(인)',{x:265,y:y+13,size:12,font,color:rgb(.65,.65,.65)});
 if(sample){
  const label='샘플 · 가상 정보 · 실제 제출용이 아닙니다';
  const size=9;
  page.drawText(label,{x:(612-font.widthOfTextAtSize(label,size))/2,y:777,size,font,color:rgb(.55,.24,.2)});
  page.drawText('아이·부모·번역자 정보와 날짜·번호는 예시입니다. 등록관 이름은 원본을 확인하세요.',{x:38,y:22,size:8,font,color:rgb(.45,.45,.45)});
 }
 return pdf.save();
}
