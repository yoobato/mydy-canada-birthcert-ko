import './style.css';
import {mountBanners} from './ads.js';
import {createAnalytics} from './analytics.js';
const analytics=createAnalytics(window,document,!__IS_LOCAL_DEV__);
import {fieldsFor,validate,helpFor} from './data.js';
let region=new URLSearchParams(location.search).get('region')==='ab'?'ab':'bc';
analytics.track('page_view',region);
const drafts={};
const isBc=()=>region==='bc';
const field=([key,label,en,type,placeholder])=>{const hint=helpFor(region)[key];return `<div class="field certificate-field field-${key}"><div class="field-label"><label for="${key}">${en}<small>${label}</small></label>${hint?`<button type="button" class="help-trigger" tabindex="-1" aria-label="${label} 도움말" aria-describedby="help-${key}">?<span class="field-tooltip" role="tooltip" id="help-${key}">${hint}</span></button>`:''}</div>${type==='select'?`<select ${hint?`aria-describedby="help-${key}"`:''} id="${key}" name="${key}" required><option value="">선택하세요</option><option value="M">남 (${isBc()?'MALE':'M'})</option><option value="F">여 (${isBc()?'FEMALE':'F'})</option><option value="OTHER">기타</option></select><div class="sex-other" hidden><label for="sexOther">성별 표기 직접 입력</label><input id="sexOther" name="sexOther" type="text" maxlength="30" placeholder="원본 표기 입력 (예. X)" aria-describedby="sexOtherHelp" disabled><small id="sexOtherHelp">원본의 표기를 입력해 주세요. 입력한 내용이 번역문에 그대로 표시됩니다.</small></div>`:`<input ${hint?`aria-describedby="help-${key}"`:''} id="${key}" name="${key}" type="${type}" ${type==='date'?'min="1000-01-01" max="9999-12-31"':'maxlength="80"'} placeholder="${placeholder}" required>`}</div>`;};
const bcSampleRoot='https://www2.gov.bc.ca/assets/gov/birth-adoption-death-marriage-and-divorce/births/images/';
const albertaSample='https://www.alberta.ca/system/files/custom_downloaded_images/vt-birth-certificate-personal-information-parentage-sample.pdf';
const specimenLinks=()=>`<div class="specimen-links"><strong>${isBc()?'BC주':'알버타주'} 출생증명서 공식 견본</strong><div>${isBc()?`<a href="${bcSampleRoot}parental-birth-cert-sex-displayed.jpg" target="_blank" rel="noopener noreferrer">부모 정보 포함 · 성별 표시 ↗</a>`:`<a href="${albertaSample}" target="_blank" rel="noopener noreferrer">부모 정보 포함 출생증명서 (PDF) ↗</a>`}</div></div>`;
const certificate=()=>`${isBc()?'<div class="bc-corner" aria-hidden="true"></div>':''}<div class="ribbon"><span>${isBc()?'BIRTH CERTIFICATE':'BIRTH · NAISSANCE'}</span></div><div class="paper-heading"><div>${isBc()?'<div class="bc-province">BRITISH COLUMBIA</div>':`<div class="official-wordmarks" role="img" aria-label="Alberta Canada 공식 로고"><span class="alberta-wordmark"><img src="${import.meta.env.BASE_URL}alberta-canada.png" alt=""></span><span class="canada-wordmark"><img src="${import.meta.env.BASE_URL}alberta-canada.png" alt=""></span></div>`}</div></div><h2 class="doc-title">BIRTH CERTIFICATE${isBc()?'':'<br>CERTIFICAT DE NAISSANCE'}</h2><div class="registrar"><div class="form-code"><div class="field-label"><label for="formCode">서식 번호</label><button type="button" class="help-trigger" tabindex="-1" aria-label="서식 번호 도움말" aria-describedby="help-formCode">?<span class="field-tooltip" role="tooltip" id="help-formCode">${isBc()?'가지고 있는 출생증명서의 서식 번호와 다르면 수정하고, 원본에 없으면 비워 두세요.':'가지고 있는 출생증명서의 서식 번호와 다른 경우에만 수정해 주세요.'}</span></button></div><input id="formCode" name="formCode" value="${isBc()?'VSA 434 (24/04)':'DVS 3413 (2026/01)'}" placeholder="${isBc()?'원본에 있는 경우 입력':''}" maxlength="60"></div><div class="registrar-input"><div class="field-label"><label for="registrarKo">${isBc()?'인구동태통계 총등록관':'인구동태통계 등록관'}<small>${isBc()?'Registrar General of Vital Statistics':'Registrar of Vital Statistics'}</small></label><button type="button" class="help-trigger" tabindex="-1" aria-label="인구동태통계 등록관 도움말" aria-describedby="registrarHelp">?<span class="field-tooltip" role="tooltip" id="registrarHelp">출생증명서의 서명 아래에 적힌 등록관 이름을 한국어 발음대로 직접 입력해 주세요. 예: ${isBc()?'David Seitz → 데이비드 사이츠':'Trevor Bergen → 트레버 버겐'}</span></button></div><input id="registrarKo" name="registrarKo" placeholder="${isBc()?'예. 데이비드 사이츠':'예. 트레버 버겐'}" required maxlength="80" aria-describedby="registrarHelp" style="margin-top:8px"></div><div class="certified"><img class="certificate-emblem" src="${import.meta.env.BASE_URL}${isBc()?'registrar-bc.svg':'registrar.svg'}" alt="${isBc()?'VITAL STATISTICS ACT · BRITISH COLUMBIA':'Registrar of Vital Statistics'}">Certified extract from<br>Registration of Birth filed at<br>${isBc()?'Victoria, British Columbia, Canada.':'Edmonton, Alberta, Canada.'}</div></div><div class="fields">${fieldsFor(region).map(field).join('')}</div><div class="serial"><div class="field"><label for="serial">Certificate No.<small>원본 하단 바코드 아래 영문·숫자를 그대로 입력해 주세요.</small></label><input id="serial" name="serial" maxlength="40" placeholder="${isBc()?'원본의 증명서 번호':'예. AB00000000'}"></div></div>${specimenLinks()}`;
document.querySelector('#app').innerHTML=`<header><div class="brand"><a class="home-link" href="${import.meta.env.BASE_URL}" aria-label="홈으로 이동하여 입력 화면 초기화"><img class="nav-logo" src="${import.meta.env.BASE_URL}logo.svg" alt=""></a><div>Translate Canadian Birth Certificates to Korean<small>캐나다 출생증명서 한글 번역문 생성</small></div></div><a class="github-link" href="https://github.com/yoobato/mydy-canada-birthcert-ko" target="_blank" rel="noreferrer" aria-label="GitHub 저장소 열기"><svg class="button-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor"><path d="M12 .75a11.25 11.25 0 0 0-3.56 21.92c.56.1.77-.24.77-.54v-2.1c-3.13.68-3.79-1.33-3.79-1.33-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.73 1.16 1.73 1.16 1 1.72 2.63 1.22 3.27.93.1-.73.39-1.22.71-1.5-2.5-.28-5.13-1.25-5.13-5.57 0-1.23.44-2.23 1.16-3.01-.12-.29-.5-1.43.11-2.98 0 0 .95-.3 3.09 1.15a10.76 10.76 0 0 1 5.62 0c2.15-1.45 3.09-1.15 3.09-1.15.61 1.55.23 2.69.11 2.98.72.78 1.16 1.78 1.16 3.01 0 4.33-2.63 5.28-5.14 5.56.4.35.76 1.03.76 2.08v3.11c0 .3.2.65.78.54A11.25 11.25 0 0 0 12 .75Z"/></svg><span class="github-caption"><span>GitHub</span><small class="build-version">${__BUILD_COMMIT__ ? '#' + __BUILD_COMMIT__.slice(0,7) : '커밋 정보 없음'}${__IS_LOCAL_DEV__ ? ' · 개발' : ''}</small></span></a></header><main><section class="intro consulate-intro"><div><p><a href="https://vancouver.mofa.go.kr/ca-vancouver-ko/index.do" target="_blank" rel="noreferrer">주밴쿠버 대한민국 총영사관</a>에 출생신고(가족관계등록)할 때 제출하는 캐나다(브리티시컬럼비아·알버타주) 출생증명서의 한글 번역문을 생성합니다.<br>발급지역을 선택하고 아래의 양식에 출생증명서의 내용을 입력한 뒤, PDF로 저장하고 출력해 주세요.</p><ul><li>번역공증 없이 신고인이 직접 작성할 수 있습니다.</li><li>아이와 부모의 성명·출생지, 등록관 이름을 한글로 입력해 주세요.</li><li>출력 후 하단 번역자 이름 옆의 (인) 위치에 직접 서명해 주세요.</li></ul><a href="https://www.mofa.go.kr/ca-vancouver-ko/brd/m_4576/view.do?seq=611226" target="_blank" rel="noreferrer">주밴쿠버 대한민국 총영사관 출생신고 안내 ↗</a></div></section><section class="region-picker" aria-label="출생증명서 발급지역"><div><strong>출생증명서 발급지역</strong><p>원본 증명서를 발급한 주를 선택해 주세요.</p></div><div class="region-options"><button type="button" data-region="bc">British Columbia<span>브리티시컬럼비아</span></button><button type="button" data-region="ab">Alberta<span>알버타</span></button></div><p class="region-availability">* 다른 주는 아직 서비스 준비 중입니다.</p></section><form id="form" autocomplete="off" novalidate><div class="workspace"><section class="paper" aria-label="출생증명서 입력">${certificate()}</section><aside class="sidebar"><section class="card"><h2>번역문 준비하기</h2><div class="progress-top"><span>필수 항목</span><span id="count">0 / 14</span></div><div class="progress"><span id="bar" style="width:0%"></span></div><label for="translator">번역자 이름<span class="field-help">번역문을 작성한 사람의 성과 이름을 한글로 적어 주세요.</span></label><input id="translator" name="translator" placeholder="한글 성명" maxlength="80" required style="margin-top:9px"><p>Letter (8.5 × 11 in) 크기로 출력됩니다.<br>번역자 이름 옆 (인)에 직접 서명해 주세요.</p><button class="btn" type="button" id="preview"><svg class="button-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg><span>번역문 미리보기</span></button><button class="btn primary" type="submit" id="download"><svg class="button-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8Z"/><path d="M14 3v5h5M8 13h8M8 17h6"/></svg><span>PDF 다운로드</span></button><button class="support-link" id="support" type="button" aria-haspopup="dialog" aria-controls="supportDialog"><span aria-hidden="true">☕</span><span>개발자에게 커피 한 잔</span></button><div id="status" class="status" role="status"></div></section><div class="note"><strong>입력 정보는 이 브라우저 안에서만 처리됩니다.</strong><br>성명·날짜·등록번호 등 양식 입력값은 서버로 보내거나 자동 저장하지 않습니다. 새로고침하면 입력 내용이 사라집니다.<p>방문 및 미리보기·다운로드·후원 버튼 클릭 통계를 발급지역(BC·AB)별로 집계하기 위해 Google Analytics를 사용합니다. 쿠키와 기본 접속 정보가 수집될 수 있으며, 양식 입력값과 PDF 내용은 통계에 포함하지 않습니다.</p><p>광고 제공을 위해 Adsterra를 사용하며, 광고 제공업체가 쿠키 및 접속 정보를 사용할 수 있습니다. 양식 입력값과 PDF 내용은 광고 매개변수로 보내지 않습니다. <a href="https://adsterra.com/privacy-policy/" target="_blank" rel="noopener noreferrer">Adsterra 개인정보 안내</a></p><p>정부·영사관이 운영하는 서비스가 아닙니다. 제출 전 원본과 번역문을 대조해 주세요.</p><p>이 서비스는 AI의 도움을 받아 디자인하고 개발했습니다.</p><p class="copyright">© <a href="https://yoobato.com" target="_blank" rel="noopener noreferrer">Daeyeol Ryu</a>. All rights reserved.</p></div></aside></div></form></main><dialog class="preview-dialog" id="dialog"><div class="dialog-head"><strong>출생증명서 한글 번역문</strong><div><a id="previewLink" download="출생증명서_한글번역문.pdf">PDF 저장</a><button type="button" class="close" id="close" aria-label="미리보기 닫기">×</button></div></div><iframe title="생성된 한글 번역문 PDF" id="pdfFrame"></iframe></dialog><dialog class="support-dialog" id="supportDialog" aria-labelledby="supportTitle"><div class="support-dialog-head"><strong id="supportTitle">☕ 개발자에게 커피 한 잔</strong><button type="button" class="close" id="supportClose" aria-label="후원 창 닫기">×</button></div><div class="support-panel" id="supportPanel"></div><div class="support-dialog-footer"><span>후원 창이 보이지 않나요?</span><a href="https://ko-fi.com/yoobato" target="_blank" rel="noopener noreferrer">Ko-fi에서 열기 ↗</a></div></dialog>`;
mountBanners(!__IS_LOCAL_DEV__);
const form=document.querySelector('#form'),status=document.querySelector('#status');
const required=()=>[...form.querySelectorAll('input[required],select[required]')];
function update(){const n=required().filter(el=>el.value.trim()).length;document.querySelector('#count').textContent=`${n} / ${required().length}`;document.querySelector('#bar').style.width=`${n/required().length*100}%`;status.textContent='';}
function clearFieldError(input){
 document.getElementById(`error-${input.name}`)?.remove();
 input.removeAttribute('aria-invalid');
 const ids=(input.getAttribute('aria-describedby')||'').split(' ').filter(id=>id&&id!==`error-${input.name}`);
 if(ids.length)input.setAttribute('aria-describedby',ids.join(' '));else input.removeAttribute('aria-describedby');
}
function clearErrors(){form.querySelectorAll('[aria-invalid]').forEach(clearFieldError);}
function showFieldErrors(errors){
 for(const [key,message]of Object.entries(errors)){
  const input=form.elements.namedItem(key);if(!input)continue;
  input.setAttribute('aria-invalid','true');
  input.setAttribute('aria-describedby',`${input.getAttribute('aria-describedby')||''} error-${key}`.trim());
  const error=document.createElement('p');error.id=`error-${key}`;error.className='field-error';error.textContent=message;
  input.insertAdjacentElement('afterend',error);
 }
 const first=form.querySelector('[aria-invalid="true"]');first?.focus();
}
form.addEventListener('input',event=>{if(event.target.matches('input,select'))clearFieldError(event.target);update();});
function syncSexOther(){
 const other=form.elements.sex.value==='OTHER';
 const input=form.elements.sexOther;
 input.closest('.sex-other').hidden=!other;
 input.disabled=!other;
 input.required=other;
 if(!other)clearFieldError(input);
}
form.addEventListener('change',event=>{if(event.target.id==='sex'){syncSexOther();update();}});
let pdfUrl;
async function generate(preview){clearErrors();let data;try{data=validate({...Object.fromEntries(new FormData(form)),region});}catch(e){if(e.errors)showFieldErrors(e.errors);status.textContent=e.message;return;}
const buttons=[...document.querySelectorAll('[data-region],#download,#preview')];buttons.forEach(b=>b.disabled=true);status.textContent='한글 번역문을 만들고 있습니다…';try{const {createPdf}=await import('./pdf.js');const bytes=await createPdf(data);if(pdfUrl)URL.revokeObjectURL(pdfUrl);pdfUrl=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));if(preview){document.querySelector('#pdfFrame').src=pdfUrl;document.querySelector('#previewLink').href=pdfUrl;document.querySelector('#previewLink').download=`${isBc()?'BC':'알버타'}_출생증명서_한글번역문.pdf`;document.querySelector('#dialog').showModal();analytics.track('translation_preview',data.region);}else{const a=document.createElement('a');a.href=pdfUrl;a.download=`${isBc()?'BC':'알버타'}_출생증명서_한글번역문.pdf`;a.click();analytics.track('pdf_download',data.region);}status.textContent='번역문이 완성되었습니다. 출력 후 서명해 주세요.';}catch(error){console.error(error);status.textContent='PDF를 만들지 못했습니다. 연결 상태와 입력 내용을 확인한 뒤 다시 시도해 주세요.';}finally{buttons.forEach(b=>b.disabled=false);}}
form.addEventListener('submit',e=>{e.preventDefault();generate(false);});document.querySelector('#preview').addEventListener('click',()=>generate(true));document.querySelector('#previewLink').addEventListener('click',()=>analytics.track('preview_pdf_download',region));document.querySelector('#close').addEventListener('click',()=>document.querySelector('#dialog').close());
function renderCertificate(values={}) {
 clearErrors();
 const paper=document.querySelector('.paper');
 paper.classList.toggle('paper-bc',isBc());
 paper.innerHTML=certificate();
 for(const [key,value]of Object.entries(values)){const input=form.elements.namedItem(key);if(input)input.value=value;}
 syncSexOther();
 document.querySelectorAll('[data-region]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.region===region)));
 if(pdfUrl){URL.revokeObjectURL(pdfUrl);pdfUrl=undefined;document.querySelector('#pdfFrame').removeAttribute('src');document.querySelector('#previewLink').removeAttribute('href');}
 update();
}
document.querySelectorAll('[data-region]').forEach(button=>button.addEventListener('click',()=>{
 if(button.dataset.region===region)return;
 drafts[region]={values:Object.fromEntries(new FormData(form))};
 region=button.dataset.region;
 renderCertificate(drafts[region]?.values);
}));
renderCertificate();

// Keep Ko-fi's official Tip Panel in a cross-origin frame, loaded only on request.
const supportDialog=document.querySelector('#supportDialog');
const supportPanel=document.querySelector('#supportPanel');
document.querySelector('#support').addEventListener('click',()=>{
 const frame=document.createElement('iframe');
 frame.title='Ko-fi 개발자 후원';
 frame.referrerPolicy='no-referrer';
 frame.src='https://ko-fi.com/yoobato/?hidefeed=true&widget=true&embed=true&preview=true';
 supportPanel.replaceChildren(frame);
 supportDialog.showModal();
 analytics.track('support_click',region);
});
document.querySelector('#supportClose').addEventListener('click',()=>supportDialog.close());
supportDialog.addEventListener('close',()=>supportPanel.replaceChildren());
supportDialog.addEventListener('click',event=>{
 if(event.target!==supportDialog)return;
 const rect=supportDialog.getBoundingClientRect();
 if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)supportDialog.close();
});
