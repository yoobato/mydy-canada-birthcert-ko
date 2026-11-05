import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createPdf} from '../src/pdf.js';
const root=new URL('../',import.meta.url);
const font=await readFile(new URL('public/fonts/NanumGothic-Regular.ttf',root));
// Fictional family/date/number examples. Registrar names are examples from known records,
// not a verified live officeholder list; real submissions must follow the original certificate.
const shared={surname:'홍',given:'길동',birth:'2026-03-27',sex:'M',registered:'2026-03-30',issued:'2026-04-02',parent1:'춘섬',parent1Place:'대한민국',parent2:'홍문',parent2Place:'대한민국',translator:'홍문'};
await mkdir(new URL('public/samples/',root),{recursive:true});
for(const [filename,values]of [
 ['bc-sample.pdf',{region:'bc',place:'밴쿠버',formCode:'VSA 434 (24/04)',registration:'2026-03-123456',serial:'BC12345678',registrarKo:'데이비드 사이츠'}],
 ['sk-sample.pdf',{region:'sk',name:'홍길동',place:'새스커툰',formCode:'V.S. 15 2008/09',registration:'2026-03-123456',serial:'SK12345678',registrarKo:'제니퍼 린덴바흐'}],
 ['alberta-sample.pdf',{region:'ab',place:'캘거리',formCode:'DVS 3413 (2026/01)',registration:'2026-03-123456',serial:'AB12345678',registrarKo:'트레버 버겐'}],
]){
 if(process.argv[2]&&process.argv[2]!==filename)continue;
 const bytes=await createPdf({...shared,...values},font,{sample:true});
 await writeFile(new URL('public/samples/'+filename,root),bytes);
 console.log('Generated fictional sample:',filename);
}
