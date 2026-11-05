# 개발·운영 안내

## 검증과 배포

**현재 SK 지원 변경은 로컬 검토 중이며 아직 배포하지 않습니다.** 사용자 승인 전에는 `origin/main`에 push하지 않습니다. 현재 코드는 BC·AB·SK 세 지역을 지원합니다.

일반 배포 시에는 수정 후 관련 검증을 수행하고 `main`에 커밋한 뒤 `origin/main`으로 푸시합니다. GitHub Actions가 단위 테스트와 빌드를 실행하고 `dist/`를 GitHub Pages에 배포합니다. 브라우저 검증은 로컬에서 별도 실행합니다. 배포 산출물 이름에는 실행 ID와 재시도 번호를 포함해 재실행 시 중복을 방지합니다. 게시 단계에서 시간 초과가 발생하면 Actions 로그를 확인하고, 실제 사이트 반영 여부까지 확인합니다.

```sh
npm test
npm run build
# 개발 서버 실행 후
npm run test:browser
node tests/regions-browser.mjs
```

브라우저 검증에는 가상 데이터만 사용합니다. 결과는 Git에서 제외되는 `tmp/`에 저장되며 Google 태그는 가짜 응답으로 대체해 실제 통계 전송을 막습니다. 배포본 확인에는 `TEST_URL=https://canada-birthcert-ko.mydy.kr/ npm run test:browser`를 사용할 수 있습니다.

배포 커밋은 내비게이션 GitHub 버튼에 `#`와 짧은 SHA로 표시합니다. Actions의 `GITHUB_SHA`를 우선 사용하고 로컬에서는 Git HEAD를 읽습니다. 개발 서버의 SHA를 갱신하려면 서버를 재시작합니다.

## 도메인과 HTTPS

- 서비스: `https://canada-birthcert-ko.mydy.kr/`
- DNS: `canada-birthcert-ko`의 CNAME을 `yoobato.github.io`로 설정
- GitHub 저장소 Settings → Pages: Source는 GitHub Actions, Custom domain은 `canada-birthcert-ko.mydy.kr`, Enforce HTTPS 활성화
- 인증서는 GitHub Pages가 관리합니다. 도메인을 변경한 뒤에는 DNS·인증서·HTTP → HTTPS 리디렉션을 확인합니다.

도메인을 바꾸면 `index.html`, `public/robots.txt`, `public/sitemap.xml`, `src/analytics.js`의 고정 URL과 공유 이미지·문서도 함께 갱신합니다. Actions 배포에서는 저장소의 CNAME 파일이 필요하지 않습니다.

기존 `ab-birthcert-ko.mydy.kr`은 GoDaddy의 301 포워딩으로 현재 주소에 연결합니다. 다른 서브도메인 DNS는 변경하지 않습니다. 도메인 변경 시 기존 주소의 HTTP·HTTPS 리디렉션도 확인합니다.

## Google Analytics

측정 ID는 `G-2TXN5Z7X2G`입니다. 프로덕션 빌드에서만 실행하며 로컬 개발 서버에서는 비활성화됩니다. 프로덕션 빌드를 로컬에서 미리 보는 경우에는 GA가 실행되므로 자동 확인 시 태그를 차단해야 합니다.

| 이벤트 | 발생 시점 |
| --- | --- |
| `page_view` | 페이지 방문 |
| `translation_preview` | PDF 생성에 성공하고 미리보기를 연 경우 |
| `pdf_download` | 메인 PDF 다운로드 버튼으로 PDF 생성 후 다운로드 시작 |
| `preview_pdf_download` | 미리보기 안의 PDF 저장 링크 클릭 |
| `support_click` | 커피 후원 버튼을 눌러 Ko-fi 창을 연 경우 (결제 완료 아님) |

모든 이벤트는 `certificate_region` 매개변수에 `bc`, `ab`, `sk`만 보냅니다. 방문 이벤트는 최초 선택 지역, 나머지는 동작 당시 선택 지역을 기록합니다. 지역 변경 자체는 별도 이벤트를 보내지 않습니다. GA 관리에서 이벤트 범위 맞춤 측정기준을 만들고 이벤트 매개변수를 `certificate_region`으로 지정해야 일반 보고서·탐색에서 지역별 분석을 할 수 있습니다.

GA 페이지 제목은 `캐나다 출생증명서 번역 | BC·알버타·SK 한글 번역문 PDF`입니다.

광고 클릭은 별도 출처의 격리된 iframe 내부에서 발생하므로 GA에서 감지하거나 추정하지 않습니다. Adsterra 통계를 사용합니다.

다운로드 이벤트는 운영체제의 파일 저장 완료를 보장하지 않습니다. GA 관리의 웹 데이터 스트림에서 **향상된 측정은 꺼둡니다**. 자동 폼·클릭 이벤트 대신 명시된 이벤트만 사용합니다.

이벤트 함수는 허용된 이름만 받습니다. 양식값·PDF·파일명·URL 원문과 해시·원본 리퍼러를 전달하지 않고 고정 페이지 정보와 허용된 발급지역 코드, 아래에 명시된 캠페인 상수만 사용합니다. Google signals와 광고 개인화는 비활성화합니다. 기본 접속 정보와 분석 쿠키는 사용될 수 있습니다.

실제 수집 확인은 배포 사이트 방문 후 GA 실시간 보고서에서 진행합니다. 광고 차단기나 브라우저 설정에 따라 수집이 차단될 수 있습니다. 서버의 전송 성공 응답과 GA 보고서 반영 여부는 구분해서 확인합니다.

### Threads 홍보 유입

짧은 공유 링크: https://canada-birthcert-ko.mydy.kr/?from=threads

기존 링크도 지원합니다: https://canada-birthcert-ko.mydy.kr/?utm_source=threads&utm_medium=social&utm_campaign=birthcert_launch

`from=threads`가 정확히 한 번 있거나 기존 UTM 세 매개변수가 위 값과 정확히 일치하고 중복되지 않을 때 GA의 `campaign_source=threads`, `campaign_medium=social`, `campaign_name=birthcert_launch`를 설정합니다. 두 링크는 리디렉션 없이 동일한 캠페인으로 처리합니다. 임의의 UTM 값, 추가 쿼리, 전체 URL은 전달하지 않습니다. 개발 환경에서는 이 기능도 비활성화됩니다.

GA 트래픽 획득 보고서의 세션 소스/매체에서 `threads / social`, 세션 캠페인에서 `birthcert_launch`를 확인합니다. 탐색 분석에서 세션 소스/매체를 필터로 쓰면 해당 세션의 버튼 이벤트를 BC·AB·SK별로 비교할 수 있습니다. 별도 맞춤 측정기준은 필요하지 않습니다. GA 보고서에서 실제 수집·귀속을 확인한 것과 코드/전송 설정 검증은 구분합니다. 새 세션이 시작되지 않은 기존 방문자는 세션 귀속이 다를 수 있습니다. 링크가 다른 곳으로 재공유돼도 동일 캠페인으로 표시되므로 사람의 실제 열람 출처를 증명하지는 않습니다. 이전 유입은 소급 분류할 수 없습니다.

## Adsterra

`src/ads.js`가 상단 안내 아래와 번역 준비 패널 아래에 각각 하나씩 배너를 표시합니다. 상단은 뷰포트가 800px 이상일 때 728×90, 그보다 좁을 때 320×50을 요청합니다. 경계 너비를 넘으면 기존 상단 프레임을 교체하며, 비활성 크기의 광고를 숨긴 채 중복 요청하지 않습니다. 같은 광고 코드는 한 페이지에 한 번만 사용합니다.

| 위치 | 크기 | 광고 키 |
| --- | --- | --- |
| 상단 PC | 728×90 | `8a7f9b407df1f0c06734b6d94816e9cd` |
| 상단 모바일 | 320×50 | `ff69865290a386d9a2b164b7a7e7f47d` |
| 번역 준비 아래 | 300×250 | `5ea85e7ac7dd2851f7c1125a6f55f978` |

스크립트 주소는 각 키의 `https://bauval.org/22/<key>`입니다. `atOptions.params`는 빈 객체로 유지하고 입력값·PDF·GA 데이터를 광고에 전달하지 않습니다.

광고는 `data:` URL의 iframe에서 실행합니다. `data:` 문서는 입력 화면과 다른 opaque origin을 가지므로 양식 DOM에 접근할 수 없습니다. sandbox의 `allow-same-origin`은 광고 제공업체가 내부 `about:blank` 프레임에 광고를 작성할 수 있도록 유지합니다. **`srcdoc`, `blob:` 또는 같은 사이트 URL로 바꾸면서 이 권한을 유지하면 입력값 격리가 깨질 수 있으므로 금지합니다.** 상위 페이지 이동·양식 제출 권한은 부여하지 않습니다. 광고 링크는 새 창에서 열 수 있습니다. 광고가 차단되거나 로드되지 않아도 입력·미리보기·다운로드를 이용할 수 있으며 광고는 PDF에 포함하지 않습니다.

개발 서버에서는 광고 프레임을 생성하지 않습니다. 프로덕션 빌드의 브라우저 테스트에서는 스크립트를 테스트 응답으로 대체해 실제 광고 요청을 막고, 프레임의 입력값 접근 차단과 레이아웃을 확인합니다. 프로덕션 빌드를 수동으로 미리 볼 때도 광고 스크립트를 차단해야 합니다.

배너의 실제 공급·광고 분류·지역별 동의 설정은 Adsterra 계정에서 관리합니다.

## 검색과 링크 공유

`index.html`에 title·description·canonical·robots·Open Graph·X 카드 정보와 WebApplication JSON-LD가 있습니다. 메타데이터는 JavaScript 실행 전 HTML에서 읽을 수 있습니다. 초기 안내는 앱 실행 후 입력 화면으로 교체되고, JavaScript가 꺼져 있으면 사용 안내가 남습니다.

- 대표 URL: `https://canada-birthcert-ko.mydy.kr/`
- 사이트맵: `https://canada-birthcert-ko.mydy.kr/sitemap.xml`
- 공유 이미지: `https://canada-birthcert-ko.mydy.kr/og-image.png?v=20261105` (1200 × 630 PNG)

공유 이미지는 개인정보와 공식 관인 없이 구성합니다. 문구나 디자인 수정 후 다음 명령으로 다시 생성하고 PNG도 함께 커밋합니다.

```sh
node scripts/generate-og-image.mjs
```

Google Search Console에 사이트 소유권을 인증하고 사이트맵을 제출하면 색인 상태를 확인할 수 있습니다. 현재 저장소 설정만으로 Search Console 인증·제출이 완료되는 것은 아닙니다. 검색 노출과 공유 카드 표시는 각 플랫폼이 결정하며, 기존 공유 URL은 플랫폼 캐시 때문에 갱신이 늦을 수 있습니다.

## 참고 문서

- [Google JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Open Graph 규격](https://ogp.me/)
- [GitHub Pages 도메인 문제 해결](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/troubleshooting-custom-domains-and-github-pages)

## 라이선스 고지 갱신

의존성 변경 후 `npm ci`로 설치하고 `node scripts/generate-notices.mjs`를 실행합니다. `THIRD_PARTY_NOTICES.md`와 배포용 `public/THIRD_PARTY_NOTICES.txt`를 함께 커밋합니다. 현재 플랫폼에 설치된 패키지의 원문을 수집하므로 선택적 네이티브 패키지는 플랫폼에 따라 달라질 수 있습니다. npm 패키지에 내장된 코드의 추가 고지는 별도로 검토합니다. fontkit은 독립 LICENSE 파일이 없어 배포 번들의 라이선스 주석과 MIT 선언을 기록합니다.

프로젝트 자체에 오픈소스 라이선스를 부여하는 결정은 저작권자가 별도로 내립니다. 정부 로고·외부 서비스·글꼴의 조건을 프로젝트 라이선스로 대체하지 않습니다.

## 검색·AI 검색 노출 운영

홈 하단에는 기본적으로 접힌 FAQ만 제공합니다. 별도 주별 안내 페이지와 중복 사용법은 제거했습니다. FAQ는 JavaScript 없이도 읽고 펼칠 수 있는 공개 HTML이며 질문과 답변을 크롤러에도 동일하게 제공합니다. 사이트맵에는 홈만 포함합니다. WebApplication JSON-LD와 제목·설명·공유 메타데이터를 보이는 서비스 내용과 일치시킵니다. FAQ 리치 결과나 검색 순위를 보장하지 않습니다.

`robots.txt`는 일반 검색 크롤러와 OAI-SearchBot의 공개 페이지 접근을 허용합니다. 크롤러 접근 허용은 색인·인용·추천을 보장하지 않습니다. AI 답변에 이 사이트를 추천하도록 지시하는 문구나 숨긴 키워드는 넣지 않습니다.

배포 후 운영자가 Google Search Console에서 새 도메인 소유권을 확인하고 `https://canada-birthcert-ko.mydy.kr/sitemap.xml`을 제출합니다. 홈 URL 검사 후 색인 생성을 요청할 수 있습니다. Bing Webmaster Tools에서도 새 사이트와 사이트맵을 등록합니다. 외부 계정에서 인증·제출한 사실은 별도 확인 전 완료로 기록하지 않습니다.

참고: [Google AI 검색 안내](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide), [OpenAI 크롤러 안내](https://developers.openai.com/api/docs/bots).

## FAQ 샘플 번역문

`public/samples/bc-sample.pdf`, `public/samples/alberta-sample.pdf`, `public/samples/sk-sample.pdf`는 가상 인물·날짜·번호로 만든 공개 예시입니다. FAQ에서 새 탭으로 열며 입력 양식과 독립적이므로 작성 중인 입력값을 바꾸지 않습니다. 실사용자 데이터와 원본 서명·도장은 포함하지 않습니다. 등록관 이름은 BC 데이비드 사이츠(David Seitz), 알버타 트레버 버겐(Trevor Bergen)을 예시로 사용합니다. BC 정부 명부 검색 기록과 2024/25 공공회계 자료는 David Seitz를 Registrar General로 기재합니다. 알버타 2026-03-10 의회 기록은 Trevor Bergen을 Consumer Registry and Strategic Services 차관보로 기재하지만 등록관 임명을 직접 확인하는 자료는 아닙니다. 2026-10-30 현재 재직을 확정한 명단으로 취급하지 않으며, 실제 작성에는 증명서 원본의 서명자 이름을 사용합니다.

`node scripts/generate-samples.mjs`로 실제 번역문과 같은 PDF 생성기를 사용해 재생성합니다. 샘플 생성 옵션에서만 상단에 샘플·가상 정보·제출용 아님 안내를 넣습니다. 일반 사용자 PDF에는 이 안내를 넣지 않습니다. PDF 서식 변경 시 관련 주의 샘플도 재생성하고 렌더링을 확인합니다. 개인정보를 넣은 테스트 PDF는 기존 규칙대로 커밋하지 않습니다.

샘플 등록관 참고 자료: [BC 공공회계 2024/25](https://www2.gov.bc.ca/assets/gov/british-columbians-our-governments/government-finances/public-accounts/2024-25/pa-2024-25-crf-detailed-schedules-of-payments.pdf), [알버타 의회 2026-03-10 기록](https://docs.assembly.ab.ca/LADDAR_files/docs/committees/ef/legislature_31/session_2/20260310_1530_01_ef.pdf).

## 커피 후원 위젯

PDF 다운로드 버튼 아래의 ‘☕ 개발자에게 커피 한 잔’은 페이지 내 dialog에서 Ko-fi 공식 Tip Panel을 엽니다. 버튼을 누를 때만 `https://ko-fi.com/yoobato/?hidefeed=true&widget=true&embed=true&preview=true` iframe을 만들고, 닫으면 제거합니다. 외부 스크립트를 부모 페이지에 삽입하지 않습니다. cross-origin iframe과 no-referrer 정책을 유지하고 양식 입력값·PDF 내용을 전달하지 않습니다. 닫기·Esc·바깥 영역 클릭을 지원하며 창 안에는 Ko-fi 페이지로 직접 이동하는 대체 링크도 제공합니다. 후원은 선택 사항이며 PDF 생성·다운로드와 독립적입니다. `support_click`은 후원 창 열기만 기록하며 결제 완료를 추적하지 않습니다. 후원 창을 열면 Ko-fi 및 결제 제공업체로 접속이 발생하며 해당 업체의 개인정보 처리방침이 적용됩니다. 결제·본인 인증·정산은 Ko-fi 및 연결된 결제 서비스에서 처리합니다. 공식 위젯 안내상 Apple Pay·Google Pay는 위젯에서 지원하지 않으므로 필요한 경우 대체 링크를 이용합니다. 참고: https://help.ko-fi.com/hc/en-us/articles/360018381678-Ko-fi-tip-widget

## SK 서식과 샘플

SK는 공식 관보 FORM V.S. 15A와 공개 발급본을 참고합니다. 참고 링크는 개발 기록용이며 개인 문서 이미지는 저장소에 포함하지 않습니다.

- [공식 관보, PDF 74쪽](https://pubsaskdev.blob.core.windows.net/pubsask-prod/38226/G2201040.pdf#page=74)
- [가림 처리된 공개 발급본](https://www.reddit.com/r/Canadiancitizenship/comments/1ry8y4x/obtaining_saskatchewan_birth_certificate/)
- 서식 번호 기본값: 사용자가 공개 발급본에서 확인한 `V.S. 15 2019/08`. 원본에 따라 수정·삭제합니다.
- 등록관 예시: Jennifer Lindenbach(제니퍼 린덴바흐). [2026년 4월 공식 관보](https://publications.saskatchewan.ca/api/v1/products/128418/formats/154011/download)와 [주정부 명부](https://www.saskatchewan.ca/government/directory?p=4588e642-a590-4786-a6d2-c28810b3a841)를 참고했습니다. 실제 작성에는 원본의 이름을 사용합니다.
- 인증 문구: `Certified extract from Registration of Birth issued at Regina, Saskatchewan, Canada.`. 리자이나는 발급 장소이며 출생 도시와 별개입니다.
- 사망자 표시·원본 관인·서명·바코드는 아기용 번역문에 추가하지 않습니다.

가상 샘플은 홍길동(남), 2026-03-27 출생, 새스커툰, 등록일 2026-03-30, 발급일 2026-04-02, 등록번호 2026-03-123456, 증명서번호 SK12345678, 부모 춘섬·홍문(대한민국), 번역자 홍문을 사용합니다. `node scripts/generate-samples.mjs sk-sample.pdf`로 SK 샘플만 재생성할 수 있습니다.
