import{c as me,a as ue,b as pe,d as ge,r as U,j as e,L as se,F as X,P as ne,S as q,R as be,g as J,t as fe,T as je}from"./index-CnC08pCZ.js";import{g as ye,c as Ne,f as C,E as re,A as ie,a as we,b as ve}from"./TaxFilingService-Caf5dxPS.js";import{P as G,r as d,f as $e}from"./fontkit.es-DMvh97Z8.js";import{A as oe}from"./arrow-left-BY5IELka.js";import{C as ze}from"./calculator-DQf33el4.js";import{D as de}from"./download-x_OZXsNh.js";import{A as Ce}from"./arrow-right-B6LR4_xd.js";import{C as le}from"./circle-check-big-B3_bMMf3.js";import{C as O}from"./copy-DVqitKNF.js";import{C as ce}from"./circle-alert-DgFyEyT6.js";import{R as ke}from"./refresh-cw-CW8N5Aqv.js";/**
 * @license lucide-react v0.540.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ie=[["path",{d:"M10 12.5 8 15l2 2.5",key:"1tg20x"}],["path",{d:"m14 12.5 2 2.5-2 2.5",key:"yinavb"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z",key:"1mlx9k"}]],De=me("file-code",Ie);/**
 * @license lucide-react v0.540.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Re=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 16v-4",key:"1dtifu"}],["path",{d:"M12 8h.01",key:"e9boi3"}]],Ae=me("info",Re);function Fe(a){const l=new Date,g=l.toISOString().replace(/[-:]/g,"").split(".")[0],x={売上高:"AA100",仕入高:"AB100",消耗品費:"AC100",旅費交通費:"AC110",通信費:"AC120",広告宣伝費:"AC130",接待交際費:"AC140",水道光熱費:"AC150",地代家賃:"AC160",外注費:"AC170",減価償却費:"AC180",雑費:"AC190"},i=a.expensesByCategory.map((b,c)=>{const s=x[b.category]||`AC${200+c}`;return`    <${s}>${b.amount}</${s}>`}).join(`
`);return`<?xml version="1.0" encoding="UTF-8"?>
<!--
  Ainance e-Tax Export File
  生成日時: ${l.toLocaleString("ja-JP")}
  対象年度: ${a.fiscalYear}年度
  申告区分: ${a.filingType==="blue"?"青色申告":"白色申告"}
-->
<申告書等送信票等>
  <作成日時>${g}</作成日時>
  <ファイル種別>青色申告決算書</ファイル種別>
  
  <申告者情報>
    <氏名>${a.name||"（要入力）"}</氏名>
    <フリガナ>${a.furigana||"（要入力）"}</フリガナ>
    <郵便番号>${a.postalCode||""}</郵便番号>
    <住所>${a.address||"（要入力）"}</住所>
    <電話番号>${a.phoneNumber||""}</電話番号>
    <生年月日>${a.birthDate||""}</生年月日>
  </申告者情報>
  
  <青色申告決算書>
    <対象年度>${a.fiscalYear}</対象年度>
    <申告区分>${a.filingType==="blue"?"1":"2"}</申告区分>
    
    <!-- 損益計算書 -->
    <損益計算書>
      <売上金額>
        <AA100>${a.revenue}</AA100>
      </売上金額>
      
      <必要経費>
${i}
        <経費合計>${a.expenses}</経費合計>
      </必要経費>
      
      <差引金額>${a.netIncome}</差引金額>
      
      <各種引当金>
        <繰戻額>0</繰戻額>
        <繰入額>0</繰入額>
      </各種引当金>
      
      <青色申告特別控除前所得>${a.netIncome}</青色申告特別控除前所得>
      <青色申告特別控除額>${a.filingType==="blue"?65e4:0}</青色申告特別控除額>
      <所得金額>${a.netIncome-(a.filingType==="blue"?65e4:0)}</所得金額>
    </損益計算書>
    
    <!-- 控除情報 -->
    <所得控除>
${a.deductions.map(b=>`      <${b.type}>${b.amount}</${b.type}>`).join(`
`)}
      <控除合計>${a.totalDeductions}</控除合計>
    </所得控除>
    
    <!-- 税額計算 -->
    <税額計算>
      <課税所得金額>${a.taxableIncome}</課税所得金額>
      <算出税額>${a.estimatedTax}</算出税額>
    </税額計算>
  </青色申告決算書>
  
  <備考>
    このファイルはAinanceで生成されました。
    正式な申告にはe-Tax確定申告書等作成コーナーでの確認・修正が必要な場合があります。
  </備考>
</申告書等送信票等>`}function Se(a){return`<?xml version="1.0" encoding="UTF-8"?>
<!--
  Ainance e-Tax Export File - 収支内訳書
  生成日時: ${new Date().toLocaleString("ja-JP")}
  対象年度: ${a.fiscalYear}年度
-->
<収支内訳書>
  <対象年度>${a.fiscalYear}</対象年度>
  
  <収入金額>
    <売上金額>${a.revenue}</売上金額>
  </収入金額>
  
  <必要経費>
${a.expensesByCategory.map(x=>`    <${x.category.replace(/\s/g,"")}>${x.amount}</${x.category.replace(/\s/g,"")}>`).join(`
`)}
    <経費合計>${a.expenses}</経費合計>
  </必要経費>
  
  <差引金額>${a.netIncome}</差引金額>
</収支内訳書>`}function Te(a,l){const g=new Blob(["\uFEFF"+a],{type:"application/xml;charset=utf-8"}),x=URL.createObjectURL(g),i=document.createElement("a");i.href=x,i.download=l,document.body.appendChild(i),i.click(),document.body.removeChild(i),setTimeout(()=>URL.revokeObjectURL(x),1e3)}function W(a,l){const g=new Blob([new Uint8Array(a)],{type:"application/pdf"}),x=URL.createObjectURL(g),i=document.createElement("a");i.href=x,i.download=l,document.body.appendChild(i),i.click(),document.body.removeChild(i),setTimeout(()=>URL.revokeObjectURL(x),1e3)}function H(a){const l=new Blob([new Uint8Array(a)],{type:"application/pdf"}),g=URL.createObjectURL(l);window.open(g,"_blank")}const xe={交通費:"旅費交通費",旅費交通費:"旅費交通費",通信費:"通信費",水道光熱費:"水道光熱費",消耗品費:"消耗品費",接待交際費:"接待交際費",広告宣伝費:"広告宣伝費",地代家賃:"地代家賃",外注費:"外注工賃",給与:"給料賃金",雑費:"雑費",減価償却費:"減価償却費",修繕費:"修繕費",保険料:"損害保険料",福利厚生費:"福利厚生費",支払利息:"支払利息",租税公課:"租税公課",荷造運賃:"荷造運賃",その他:"雑費",未分類:"雑費","Travel & Transportation":"旅費交通費",Communication:"通信費",Utilities:"水道光熱費",Supplies:"消耗品費",Entertainment:"接待交際費",Advertising:"広告宣伝費",Rent:"地代家賃",Outsourcing:"外注工賃",Salaries:"給料賃金",Miscellaneous:"雑費",Depreciation:"減価償却費",Repairs:"修繕費",Insurance:"損害保険料",Benefits:"福利厚生費",Interest:"支払利息","Taxes & Dues":"租税公課",Shipping:"荷造運賃",Other:"雑費",Uncategorized:"雑費"};async function V(a){a.registerFontkit($e);try{const l=await fetch("/fonts/NotoSansCJKjp-Regular.otf").then(T=>T.arrayBuffer()),g=await fetch("/fonts/NotoSansCJKjp-Bold.otf").then(T=>T.arrayBuffer()),x=await a.embedFont(l),i=await a.embedFont(g);return{regular:x,bold:i}}catch(l){throw console.error("日本語フォントのロードに失敗:",l),new Error("日本語フォントのロードに失敗しました。public/fonts/にフォントファイルを配置してください。")}}function p(a){return a===0?"0":a.toLocaleString("ja-JP")}function Z(a){return`令和${a-2018}年`}async function Ee(a){const l=await G.create(),g=l.addPage([595.28,841.89]),{regular:x,bold:i}=await V(l),{width:T,height:b}=g.getSize(),c={primary:d(.4,.2,.6),text:d(.1,.1,.1),muted:d(.4,.4,.4),line:d(.7,.7,.7),highlight:d(.95,.95,1),red:d(.8,.2,.2)},s=(A,_,Y,M={})=>{g.drawText(A,{x:_,y:Y,size:M.size||10,font:M.font||x,color:M.color||c.text})},n=(A,_,Y,M,y=.5)=>{g.drawLine({start:{x:A,y:_},end:{x:Y,y:M},thickness:y,color:c.line})},u=(A,_,Y,M,y)=>{g.drawRectangle({x:A,y:_,width:Y,height:M,color:y})};u(0,b-60,T,60,c.primary),s("法人税申告書",50,b-40,{size:18,font:i,color:d(1,1,1)}),s("（参考資料）",180,b-40,{size:12,font:x,color:d(.9,.9,.9)});let t=b-85;s(`会社名: ${a.companyName||"―"}`,50,t,{size:12,font:i}),t-=20,s(`事業年度: ${a.fiscalYear}年度（${Z(a.fiscalYear)}度）`,50,t,{size:10}),s(`作成日: ${new Date().toLocaleDateString("ja-JP")}`,400,t,{size:9,color:c.muted}),t-=30,n(50,t,545,t,1),t-=25,s("第1部　法人情報",50,t,{size:12,font:i,color:c.primary}),t-=25,[["会社名（商号）",a.companyName||"―"],["代表者氏名",a.representativeName||"―"],["法人番号",a.corporateNumber||"―"],["本店所在地",a.address||"―"],["資本金",a.capital?`${p(a.capital)}円`:"―"]].forEach(([A,_])=>{n(50,t-5,545,t-5),s(A,60,t),s(_,200,t),t-=20}),t-=15,s("第2部　損益の計算",50,t,{size:12,font:i,color:c.primary}),t-=25,u(50,t-5,495,20,c.highlight),n(50,t-5,545,t-5),s("売上高",60,t),s(`${p(a.revenue)}円`,450,t),t-=20,n(50,t-5,545,t-5),s("売上原価・経費合計",60,t),s(`${p(a.expenses)}円`,450,t),t-=20,u(50,t-5,495,20,d(.95,1,.95)),n(50,t-5,545,t-5),s("当期純利益",60,t,{font:i}),s(`${p(a.netIncome)}円`,450,t,{font:i}),t-=35,s("第3部　税額の計算",50,t,{size:12,font:i,color:c.primary}),t-=25;const m=a.taxableIncome,k=m<=8e6?.15:.232,D=Math.floor(m*k),v=Math.floor(D*.103),E=Math.floor(m*.07),o=D+v+E;return[["課税所得金額",`${p(m)}円`],[`法人税額（税率${(k*100).toFixed(1)}%）`,`${p(D)}円`],["地方法人税（10.3%）",`${p(v)}円`],["事業税（概算7%）",`${p(E)}円`]].forEach(([A,_])=>{n(50,t-5,545,t-5),s(A,60,t),s(_,450,t),t-=20}),u(50,t-8,495,28,d(1,.95,.95)),n(50,t-8,545,t-8,1),n(50,t+20,545,t+20,1),s("税額合計（概算）",60,t+3,{font:i}),s(`${p(o)}円`,450,t+3,{font:i,color:c.red}),n(50,60,545,60),s("※ この書類はAinanceで作成した参考資料です。",50,45,{size:8,color:c.muted}),s("※ 正式な申告には税理士への相談またはe-Taxをご利用ください。",50,33,{size:8,color:c.muted}),l.save()}async function Pe(a){const l=await G.create(),g=l.addPage([595.28,841.89]),{regular:x,bold:i}=await V(l),{width:T,height:b}=g.getSize(),c={primary:d(.4,.2,.6),text:d(.1,.1,.1),muted:d(.4,.4,.4),line:d(.5,.5,.5),highlight:d(.95,.95,1),green:d(.2,.6,.3),red:d(.8,.2,.2)},s={text:(N,z,L,r={})=>{g.drawText(N,{x:z,y:L,size:r.size||10,font:r.font||x,color:r.color||c.text})},line:(N,z,L,r,h=.5)=>{g.drawLine({start:{x:N,y:z},end:{x:L,y:r},thickness:h,color:c.line})},rect:(N,z,L,r,h)=>{g.drawRectangle({x:N,y:z,width:L,height:r,color:h})}};s.rect(0,b-60,T,60,c.primary),s.text("損 益 計 算 書",220,b-40,{size:20,font:i,color:d(1,1,1)});let n=b-85;s.text(`${a.companyName||"会社名"}`,50,n,{size:12,font:i}),s.text(`${a.fiscalYear}年度（${Z(a.fiscalYear)}度）`,350,n,{size:10}),n-=15,s.text(`自　${a.fiscalYear}年4月1日　至　${a.fiscalYear+1}年3月31日`,350,n,{size:9,color:c.muted}),n-=20,s.line(50,n,545,n,1),n-=5,s.rect(50,n-18,495,18,d(.9,.9,.9)),s.line(50,n,545,n),s.line(50,n-18,545,n-18),s.text("勘定科目",60,n-13,{font:i,size:9}),s.text("金額（円）",470,n-13,{font:i,size:9}),n-=23,s.rect(50,n-15,495,15,c.highlight),s.line(50,n-15,545,n-15),s.text("【売上高】",55,n-11,{font:i,size:10}),n-=18,s.line(50,n-15,545,n-15),s.text("　売上高",60,n-11),s.text(p(a.revenue),450,n-11),n-=18,s.rect(50,n-15,495,15,d(.98,.98,.98)),s.line(50,n-15,545,n-15),s.text("売上高合計",70,n-11,{font:i}),s.text(p(a.revenue),450,n-11,{font:i}),n-=23,s.rect(50,n-15,495,15,c.highlight),s.line(50,n-15,545,n-15),s.text("【販売費及び一般管理費】",55,n-11,{font:i,size:10}),n-=18;let u=0;a.expensesByCategory.forEach((N,z)=>{const L=xe[N.category]||N.category||"雑費";z%2===0&&s.rect(50,n-15,495,15,d(.98,.98,.98)),s.line(50,n-15,545,n-15),s.text(`　${L}`,60,n-11,{size:9}),s.text(p(N.amount),450,n-11,{size:9}),u+=N.amount,n-=15,n<150}),s.rect(50,n-15,495,15,d(.95,.95,.95)),s.line(50,n-15,545,n-15),s.text("販管費合計",70,n-11,{font:i}),s.text(p(a.expenses),450,n-11,{font:i}),n-=25;const t=a.revenue-a.expenses;s.rect(50,n-20,495,20,d(.95,1,.95)),s.line(50,n-20,545,n-20,1),s.line(50,n,545,n,1),s.text("営業利益",60,n-14,{font:i,size:11}),s.text(p(t),440,n-14,{font:i,size:11,color:t>=0?c.green:c.red}),n-=35,s.rect(50,n-22,495,22,d(.9,.95,1)),s.line(50,n-22,545,n-22,1.5),s.line(50,n,545,n,1.5),s.text("当期純利益",60,n-15,{font:i,size:12}),s.text(`${p(a.netIncome)}円`,430,n-15,{font:i,size:12,color:a.netIncome>=0?c.green:c.red}),s.line(50,55,545,55),s.text("※ この書類はAinanceで作成した参考資料です。",50,40,{size:8,color:c.muted});const j=l.addPage([595.28,841.89]),m={text:(N,z,L,r={})=>{j.drawText(N,{x:z,y:L,size:r.size||10,font:r.font||x,color:r.color||c.text})},line:(N,z,L,r,h=.5)=>{j.drawLine({start:{x:N,y:z},end:{x:L,y:r},thickness:h,color:c.line})},rect:(N,z,L,r,h)=>{j.drawRectangle({x:N,y:z,width:L,height:r,color:h})}};m.rect(0,b-60,T,60,c.primary),m.text("貸 借 対 照 表",220,b-40,{size:20,font:i,color:d(1,1,1)}),n=b-85,m.text(`${a.companyName||"会社名"}`,50,n,{size:12,font:i}),m.text(`${a.fiscalYear+1}年3月31日現在`,400,n,{size:10}),n-=25,m.line(50,n,545,n,1),n-=10;const k=Math.floor(a.revenue*.5),D=Math.floor(a.revenue*.2),v=Math.floor(a.revenue*.15),E=Math.floor(a.revenue*.15),o=Math.floor(a.expenses*.3),B=Math.floor(a.expenses*.2),A=Math.floor(a.expenses*.1),_=k-o,Y=a.capital||1e6,M=_-Y+a.netIncome,y=50,$=300,R=240;m.rect(y,n-18,R,18,d(.85,.9,.95)),m.line(y,n,y+R,n),m.line(y,n-18,y+R,n-18),m.text("【資産の部】",y+5,n-13,{font:i,size:10}),m.rect($,n-18,R+5,18,d(.95,.9,.85)),m.line($,n,$+R+5,n),m.line($,n-18,$+R+5,n-18),m.text("【負債・純資産の部】",$+5,n-13,{font:i,size:10}),n-=23;const Q=[{label:"流動資産",items:[{name:"現金及び預金",value:D},{name:"売掛金",value:v}]},{label:"固定資産",items:[{name:"有形固定資産",value:E}]}],ee=[{label:"流動負債",items:[{name:"買掛金",value:B},{name:"短期借入金",value:A}]},{label:"純資産",items:[{name:"資本金",value:Y},{name:"繰越利益剰余金",value:M}]}];let F=n,S=n;return Q.forEach(N=>{m.rect(y,F-15,R,15,c.highlight),m.line(y,F-15,y+R,F-15),m.text(N.label,y+5,F-11,{font:i,size:9}),F-=18,N.items.forEach(z=>{m.line(y,F-15,y+R,F-15),m.text(`　${z.name}`,y+5,F-11,{size:9}),m.text(p(z.value),y+160,F-11,{size:9}),F-=15})}),m.rect(y,F-18,R,18,d(.9,.95,.9)),m.line(y,F-18,y+R,F-18,1),m.text("資産合計",y+5,F-13,{font:i,size:10}),m.text(p(k),y+160,F-13,{font:i,size:10}),ee.forEach(N=>{m.rect($,S-15,R+5,15,c.highlight),m.line($,S-15,$+R+5,S-15),m.text(N.label,$+5,S-11,{font:i,size:9}),S-=18,N.items.forEach(z=>{m.line($,S-15,$+R+5,S-15),m.text(`　${z.name}`,$+5,S-11,{size:9}),m.text(p(z.value),$+165,S-11,{size:9}),S-=15})}),m.rect($,S-18,R+5,18,d(.9,.95,.9)),m.line($,S-18,$+R+5,S-18,1),m.text("負債・純資産合計",$+5,S-13,{font:i,size:10}),m.text(p(k),$+165,S-13,{font:i,size:10}),m.line(50,80,545,80),m.text("※ この貸借対照表は売上・経費データから概算で作成しています。",50,65,{size:8,color:c.muted}),m.text("※ 正確な財務諸表の作成には、実際の資産・負債データが必要です。",50,53,{size:8,color:c.muted}),l.save()}async function Le(a){var m,k,D;const l=await G.create(),g=l.addPage([595.28,841.89]),{regular:x,bold:i}=await V(l),{width:T,height:b}=g.getSize(),c={primary:d(.2,.4,.8),text:d(.1,.1,.1),muted:d(.4,.4,.4),line:d(.5,.5,.5),highlight:d(.95,.95,1),red:d(.8,.2,.2)},s=(v,E,o,B={})=>{g.drawText(v,{x:E,y:o,size:B.size||10,font:B.font||x,color:B.color||c.text})},n=(v,E,o,B,A=.5)=>{g.drawLine({start:{x:v,y:E},end:{x:o,y:B},thickness:A,color:c.line})},u=(v,E,o,B,A)=>{g.drawRectangle({x:v,y:E,width:o,height:B,color:A})};u(0,b-60,T,60,c.primary),s("確 定 申 告 書 B",200,b-40,{size:20,font:i,color:d(1,1,1)});let t=b-85;s(`${Z(a.fiscalYear)}分の所得税及び復興特別所得税の申告書`,50,t,{size:11,font:i}),s(`作成日: ${new Date().toLocaleDateString("ja-JP")}`,400,t,{size:9,color:c.muted}),t-=30,n(50,t,545,t,1),t-=25,s("第1部　収入金額等",50,t,{size:12,font:i,color:c.primary}),t-=25,u(50,t-5,495,20,c.highlight),n(50,t-5,545,t-5),s("事業所得（営業等）　ア",60,t),s(`${p(a.revenue)}円`,450,t),t-=30,s("第2部　所得金額等",50,t,{size:12,font:i,color:c.primary}),t-=25,n(50,t-5,545,t-5),s("事業所得　①",60,t),s(`${p(a.netIncome)}円`,450,t),t-=20,u(50,t-5,495,20,c.highlight),n(50,t-5,545,t-5),s("合計（総所得金額）　⑫",60,t,{font:i}),s(`${p(a.netIncome)}円`,450,t,{font:i}),t-=35,s("第3部　所得から差し引かれる金額",50,t,{size:12,font:i,color:c.primary}),t-=25;let j=0;return(m=a.deductions)!=null&&m.basic&&(n(50,t-5,545,t-5),s("基礎控除　㉔",60,t),s(`${p(a.deductions.basic)}円`,450,t),j+=a.deductions.basic,t-=20),(k=a.deductions)!=null&&k.blueReturn&&(n(50,t-5,545,t-5),s("青色申告特別控除",60,t),s(`${p(a.deductions.blueReturn)}円`,450,t),j+=a.deductions.blueReturn,t-=20),(D=a.deductions)!=null&&D.socialInsurance&&(n(50,t-5,545,t-5),s("社会保険料控除　⑬",60,t),s(`${p(a.deductions.socialInsurance)}円`,450,t),j+=a.deductions.socialInsurance,t-=20),u(50,t-5,495,20,c.highlight),n(50,t-5,545,t-5),s("所得控除合計　㉕",60,t,{font:i}),s(`${p(j)}円`,450,t,{font:i}),t-=35,s("第4部　税額の計算",50,t,{size:12,font:i,color:c.primary}),t-=25,n(50,t-5,545,t-5),s("課税される所得金額　㉖",60,t),s(`${p(a.taxableIncome)}円`,450,t),t-=25,u(50,t-8,495,28,d(1,.95,.95)),n(50,t-8,545,t-8,1),n(50,t+20,545,t+20,1),s("所得税額（概算）　㉗",60,t+3,{font:i,size:11}),s(`${p(a.estimatedTax)}円`,440,t+3,{font:i,size:11,color:c.red}),n(50,60,545,60),s("※ この書類はAinanceで作成した参考資料です。",50,45,{size:8,color:c.muted}),s("※ 正式な申告には国税庁「確定申告書等作成コーナー」をご利用ください。",50,33,{size:8,color:c.muted}),l.save()}async function _e(a){var j;const l=await G.create(),g=l.addPage([595.28,841.89]),{regular:x,bold:i}=await V(l),{width:T,height:b}=g.getSize(),c={primary:d(.2,.4,.8),text:d(.1,.1,.1),muted:d(.4,.4,.4),line:d(.5,.5,.5),highlight:d(.95,.95,1),green:d(.2,.6,.3)},s=(m,k,D,v={})=>{g.drawText(m,{x:k,y:D,size:v.size||10,font:v.font||x,color:v.color||c.text})},n=(m,k,D,v,E=.5)=>{g.drawLine({start:{x:m,y:k},end:{x:D,y:v},thickness:E,color:c.line})},u=(m,k,D,v,E)=>{g.drawRectangle({x:m,y:k,width:D,height:v,color:E})};u(0,b-60,T,60,c.primary),s("青色申告決算書",200,b-40,{size:20,font:i,color:d(1,1,1)}),s("（一般用）",340,b-40,{size:12,color:d(.9,.9,.9)});let t=b-85;if(s(`${Z(a.fiscalYear)}分　所得税青色申告決算書`,50,t,{size:11,font:i}),a.tradeName&&s(`屋号: ${a.tradeName}`,350,t,{size:10}),s(`作成日: ${new Date().toLocaleDateString("ja-JP")}`,450,t,{size:9,color:c.muted}),t-=30,n(50,t,545,t,1),t-=25,s("損益計算書",50,t,{size:12,font:i,color:c.primary}),t-=20,u(50,t-5,495,20,c.highlight),n(50,t-5,545,t-5),s("売上（収入）金額　①",60,t,{font:i}),s(`${p(a.revenue)}円`,450,t,{font:i}),t-=30,s("経費",50,t,{size:11,font:i}),t-=20,u(50,t-15,495,15,d(.9,.9,.9)),n(50,t,545,t),n(50,t-15,545,t-15),s("勘定科目",60,t-11,{font:i,size:9}),s("金額",470,t-11,{font:i,size:9}),t-=18,a.expensesByCategory.forEach((m,k)=>{const D=xe[m.category]||m.category||"雑費";k%2===0&&u(50,t-15,495,15,d(.98,.98,.98)),n(50,t-15,545,t-15),s(D,60,t-11,{size:9}),s(p(m.amount),450,t-11,{size:9}),t-=15,t<200}),u(50,t-18,495,18,d(.95,.95,.95)),n(50,t-18,545,t-18),s("経費合計　㉑",60,t-13,{font:i}),s(`${p(a.expenses)}円`,445,t-13,{font:i}),t-=30,n(50,t-5,545,t-5),s("差引金額　① - ㉑",60,t),s(`${p(a.netIncome)}円`,450,t),t-=25,(j=a.deductions)!=null&&j.blueReturn){n(50,t-5,545,t-5),s("青色申告特別控除額",60,t),s(`${p(a.deductions.blueReturn)}円`,450,t),t-=25;const m=Math.max(0,a.netIncome-a.deductions.blueReturn);u(50,t-8,495,25,d(.95,1,.95)),n(50,t-8,545,t-8,1),n(50,t+17,545,t+17,1),s("所得金額　㊸",60,t+2,{font:i,size:11}),s(`${p(m)}円`,440,t+2,{font:i,size:11,color:c.green})}return n(50,60,545,60),s("※ この書類はAinanceで作成した参考資料です。",50,45,{size:8,color:c.muted}),s("※ 正式な申告には国税庁「確定申告書等作成コーナー」をご利用ください。",50,33,{size:8,color:c.muted}),l.save()}const K=[{id:1,title:"基本情報",icon:X,description:"確定申告の基本設定"},{id:2,title:"収支確認",icon:ze,description:"売上・経費の確認"},{id:3,title:"控除入力",icon:ne,description:"各種控除の入力"},{id:4,title:"AI診断",icon:q,description:"AIによる節税アドバイス"},{id:5,title:"申告書作成",icon:de,description:"PDFダウンロード"}],Ge=()=>{const{user:a}=ue(),{currentBusinessType:l}=pe(),{transactions:g}=ge(a==null?void 0:a.id,l==null?void 0:l.business_type),[x,i]=U.useState(1),[T,b]=U.useState(!1),c=new Date().getFullYear(),[s,n]=U.useState(c-1),[u,t]=U.useState(!0),[j,m]=U.useState([]),[k,D]=U.useState([]),[v,E]=U.useState(0);U.useEffect(()=>{m(ye(u))},[u]);const o=U.useMemo(()=>Ne(g,s,(l==null?void 0:l.business_type)||"individual",j),[g,s,l,j]),B=()=>{x<K.length&&i(x+1)},A=()=>{x>1&&i(x-1)},_=r=>{const h=ie.find(I=>I.type===r);h&&!j.find(I=>I.type===r)&&m([...j,{id:Date.now().toString(),...h,amount:0,isApplicable:!0}])},Y=r=>{m(j.filter(h=>h.id!==r))},M=(r,h)=>{m(j.map(I=>I.id===r?{...I,amount:h}:I))},y=async()=>{b(!0);try{const r=await ve(o,{});D(r.suggestions),E(r.estimatedSavings)}catch(r){console.error("AI診断エラー:",r)}finally{b(!1)}},$=()=>{const r=`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
           確定申告書（${s}年度）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

申告方法: ${u?"青色申告":"白色申告"}
作成日時: ${new Date().toLocaleString("ja-JP")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【収支内訳】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
売上高:     ${C(o.totalRevenue)}
経費合計:   ${C(o.totalExpenses)}
──────────────────────────────────────────────────
事業所得:   ${C(o.netIncome)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【控除内訳】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${j.filter(P=>P.isApplicable).map(P=>`${P.name.padEnd(20,"　")}: ${C(P.amount)}`).join(`
`)}
──────────────────────────────────────────────────
控除合計:   ${C(o.totalDeductions)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【税額計算】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
課税所得:   ${C(o.taxableIncome)}
──────────────────────────────────────────────────
所得税額:   ${C(o.estimatedTax)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
※この書類はAinanceで生成された概算資料です。
  正式な確定申告は国税庁のe-Taxでお手続きください。
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`.trim(),h=new Blob(["\uFEFF"+r],{type:"text/plain;charset=utf-8"}),I=URL.createObjectURL(h),f=document.createElement("a");f.href=I,f.download=`確定申告書_${s}年度.txt`,document.body.appendChild(f),f.click(),document.body.removeChild(f);const w=window.open("","_blank");w&&(w.document.write(`
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>確定申告書プレビュー - ${s}年度</title>
    <style>
        body {
            font-family: 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: #e0e0e0;
            padding: 40px;
            min-height: 100vh;
            margin: 0;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: rgba(255,255,255,0.05);
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            backdrop-filter: blur(10px);
        }
        h1 {
            text-align: center;
            color: #60a5fa;
            margin-bottom: 8px;
            font-size: 24px;
        }
        .subtitle {
            text-align: center;
            color: #9ca3af;
            margin-bottom: 32px;
            font-size: 14px;
        }
        pre {
            background: rgba(0,0,0,0.3);
            padding: 24px;
            border-radius: 12px;
            font-family: 'SFMono-Regular', 'Consolas', 'Menlo', monospace;
            font-size: 14px;
            line-height: 1.8;
            overflow-x: auto;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        .actions {
            display: flex;
            gap: 16px;
            justify-content: center;
            margin-top: 32px;
        }
        button {
            padding: 12px 24px;
            border-radius: 8px;
            border: none;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.2s;
        }
        .print-btn {
            background: #3b82f6;
            color: white;
        }
        .print-btn:hover {
            background: #2563eb;
        }
        .close-btn {
            background: rgba(255,255,255,0.1);
            color: #e0e0e0;
            border: 1px solid rgba(255,255,255,0.2);
        }
        .close-btn:hover {
            background: rgba(255,255,255,0.2);
        }
        @media print {
            body {
                background: white;
                color: black;
            }
            .container {
                background: white;
                box-shadow: none;
            }
            pre {
                background: #f5f5f5;
            }
            .actions {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📄 確定申告書プレビュー</h1>
        <p class="subtitle">${s}年度 | ${u?"青色申告":"白色申告"} | 作成日: ${new Date().toLocaleDateString("ja-JP")}</p>
        <pre>${r}</pre>
        <div class="actions">
            <button class="print-btn" onclick="window.print()">🖨️ 印刷する</button>
            <button class="close-btn" onclick="window.close()">✕ 閉じる</button>
        </div>
    </div>
</body>
</html>
            `),w.document.close()),setTimeout(()=>URL.revokeObjectURL(I),1e3)},R=()=>e.jsx("div",{className:"mb-8",children:e.jsx("div",{className:"flex items-center justify-between",children:K.map((r,h)=>e.jsxs(be.Fragment,{children:[e.jsxs("div",{className:"flex flex-col items-center",children:[e.jsx("div",{className:`w-10 h-10 rounded-full flex items-center justify-center transition-all ${x>r.id?"bg-success text-white":x===r.id?"bg-primary text-white":"bg-surface-highlight text-text-muted"}`,children:x>r.id?e.jsx(J,{className:"w-5 h-5"}):e.jsx(r.icon,{className:"w-5 h-5"})}),e.jsx("span",{className:`text-xs mt-2 hidden sm:block ${x>=r.id?"text-text-main font-medium":"text-text-muted"}`,children:r.title})]}),h<K.length-1&&e.jsx("div",{className:`flex-1 h-1 mx-2 rounded ${x>r.id?"bg-success":"bg-surface-highlight"}`})]},r.id))})}),Q=()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold text-text-main mb-4",children:"確定申告の基本設定"}),e.jsx("p",{className:"text-text-muted mb-6",children:"確定申告を行う年度と申告方法を選択してください。"})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-text-main mb-2",children:"申告年度"}),e.jsx("select",{value:s,onChange:r=>n(Number(r.target.value)),className:"input-base",children:[c,...Array.from({length:4},(r,h)=>c-1-h)].map(r=>e.jsxs("option",{value:r,children:[r,"年度（",r,"年1月〜12月）",r===c&&" ※進行中"]},r))})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-text-main mb-2",children:"申告方法"}),e.jsxs("div",{className:"space-y-3",children:[e.jsxs("label",{className:"flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-surface-highlight transition-colors",children:[e.jsx("input",{type:"radio",checked:u,onChange:()=>t(!0),className:"w-4 h-4 text-primary"}),e.jsxs("div",{className:"ml-3",children:[e.jsx("span",{className:"font-medium text-text-main",children:"青色申告"}),e.jsx("span",{className:"ml-2 text-xs text-success",children:"最大65万円控除"}),e.jsx("p",{className:"text-sm text-text-muted mt-1",children:"複式簿記で最大65万円の控除が受けられます"})]})]}),e.jsxs("label",{className:"flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-surface-highlight transition-colors",children:[e.jsx("input",{type:"radio",checked:!u,onChange:()=>t(!1),className:"w-4 h-4 text-primary"}),e.jsxs("div",{className:"ml-3",children:[e.jsx("span",{className:"font-medium text-text-main",children:"白色申告"}),e.jsx("p",{className:"text-sm text-text-muted mt-1",children:"簡易的な帳簿で申告できます"})]})]})]})]})]}),e.jsxs("div",{className:"bg-info-light border border-info/20 rounded-lg p-4 flex items-start gap-3",children:[e.jsx(Ae,{className:"w-5 h-5 text-info flex-shrink-0 mt-0.5"}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-text-main font-medium",children:"青色申告がおすすめ！"}),e.jsx("p",{className:"text-sm text-text-muted mt-1",children:"Ainanceで取引を記録していれば、複式簿記の要件を満たしています。 65万円の控除で税金がお得になります。"})]})]})]}),ee=()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold text-text-main mb-4",children:"収支の確認"}),e.jsxs("p",{className:"text-text-muted mb-6",children:[s,"年度の取引データから自動集計した結果です。"]})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4",children:[e.jsxs("div",{className:"bg-success-light border border-success/20 rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-success font-medium",children:"売上高"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:C(o.totalRevenue)})]}),e.jsxs("div",{className:"bg-error-light border border-error/20 rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-error font-medium",children:"経費合計"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:C(o.totalExpenses)})]}),e.jsxs("div",{className:"bg-primary-light border border-primary/20 rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-primary font-medium",children:"事業所得"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:C(o.netIncome)})]})]}),e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-5",children:[e.jsx("h4",{className:"font-medium text-text-main mb-4",children:"経費内訳（上位5件）"}),o.expensesByCategory.length>0?e.jsx("div",{className:"space-y-3",children:o.expensesByCategory.slice(0,5).map((r,h)=>e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"w-8 h-8 bg-surface-highlight rounded-lg flex items-center justify-center text-sm font-medium text-text-muted",children:h+1}),e.jsx("span",{className:"text-text-main",children:r.category})]}),e.jsxs("div",{className:"text-right",children:[e.jsx("span",{className:"font-medium text-text-main",children:C(r.amount)}),e.jsxs("span",{className:"text-text-muted text-sm ml-2",children:["(",we(r.percentage),")"]})]})]},h))}):e.jsxs("p",{className:"text-text-muted text-center py-4",children:[s,"年度の経費データがありません"]})]}),o.totalRevenue===0&&o.totalExpenses===0&&e.jsxs("div",{className:"bg-warning-light border border-warning/20 rounded-lg p-4 flex items-start gap-3",children:[e.jsx(ce,{className:"w-5 h-5 text-warning flex-shrink-0 mt-0.5"}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-text-main font-medium",children:"取引データがありません"}),e.jsxs("p",{className:"text-sm text-text-muted mt-1",children:[s,"年度の取引を登録してから確定申告を行ってください。",e.jsx(se,{to:"/transactions",className:"text-primary hover:underline ml-1",children:"取引を登録する →"})]})]})]})]}),F=()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold text-text-main mb-4",children:"各種控除の入力"}),e.jsx("p",{className:"text-text-muted mb-6",children:"該当する控除を追加して金額を入力してください。控除が多いほど税金が安くなります。"})]}),e.jsx("div",{className:"space-y-4",children:j.map(r=>e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4",children:[e.jsxs("div",{className:"flex-1",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(le,{className:"w-5 h-5 text-success"}),e.jsx("span",{className:"font-medium text-text-main",children:r.name})]}),e.jsx("p",{className:"text-sm text-text-muted mt-1 ml-7",children:r.description})]}),e.jsxs("div",{className:"flex items-center gap-3 ml-7 sm:ml-0",children:[e.jsxs("div",{className:"relative",children:[e.jsx("span",{className:"absolute left-3 top-1/2 -translate-y-1/2 text-text-muted",children:"¥"}),e.jsx("input",{type:"number",value:r.amount,onChange:h=>M(r.id,Number(h.target.value)),className:"input-base pl-8 w-40",placeholder:"金額",disabled:r.type==="basic"||r.type==="blue_return"})]}),r.type!=="basic"&&r.type!=="blue_return"&&e.jsx("button",{onClick:()=>Y(r.id),className:"p-2 text-error hover:bg-error-light rounded-lg transition-colors",children:e.jsx(je,{className:"w-5 h-5"})})]})]},r.id))}),e.jsxs("div",{className:"bg-surface-highlight border border-border rounded-xl p-5",children:[e.jsxs("h4",{className:"font-medium text-text-main mb-4 flex items-center gap-2",children:[e.jsx(ne,{className:"w-5 h-5"}),"控除を追加"]}),e.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-3",children:ie.filter(r=>!j.find(h=>h.type===r.type)).map(r=>e.jsxs("button",{onClick:()=>_(r.type),className:"flex items-center gap-3 p-3 bg-surface border border-border rounded-lg hover:border-primary hover:bg-primary-light transition-colors text-left",children:[e.jsx("div",{className:"w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center",children:e.jsx(ne,{className:"w-4 h-4 text-primary"})}),e.jsxs("div",{children:[e.jsx("p",{className:"font-medium text-text-main text-sm",children:r.name}),e.jsx("p",{className:"text-xs text-text-muted",children:r.description})]})]},r.type))})]}),e.jsxs("div",{className:"bg-success-light border border-success/20 rounded-xl p-5 flex items-center justify-between",children:[e.jsx("span",{className:"font-medium text-text-main",children:"控除合計"}),e.jsx("span",{className:"text-2xl font-bold text-success",children:C(o.totalDeductions)})]})]}),S=()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsxs("h3",{className:"text-lg font-semibold text-text-main mb-4 flex items-center gap-2",children:[e.jsx(q,{className:"w-5 h-5 text-primary"}),"AIによる節税アドバイス"]}),e.jsx("p",{className:"text-text-muted mb-6",children:"AIがあなたの収支データを分析し、節税のアドバイスを提供します。"})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-text-muted",children:"課税所得"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:C(o.taxableIncome)}),e.jsx("p",{className:"text-xs text-text-muted mt-2",children:"事業所得 - 各種控除"})]}),e.jsxs("div",{className:"bg-primary-light border border-primary/20 rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-primary font-medium",children:"予想所得税額"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:C(o.estimatedTax)}),e.jsx("p",{className:"text-xs text-text-muted mt-2",children:"※概算です。実際の税額とは異なる場合があります"})]})]}),k.length===0?e.jsx("button",{onClick:y,disabled:T,className:"btn-primary w-full py-4",children:T?e.jsxs(e.Fragment,{children:[e.jsx(ke,{className:"w-5 h-5 animate-spin"}),"AI分析中..."]}):e.jsxs(e.Fragment,{children:[e.jsx(q,{className:"w-5 h-5"}),"AIアドバイスを受ける"]})}):e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-5 space-y-4",children:[e.jsxs("div",{className:"flex items-center gap-2 text-primary",children:[e.jsx(q,{className:"w-5 h-5"}),e.jsx("span",{className:"font-medium",children:"AIからのアドバイス"})]}),e.jsx("ul",{className:"space-y-3",children:k.map((r,h)=>e.jsxs("li",{className:"flex items-start gap-3",children:[e.jsx(fe,{className:"w-5 h-5 text-primary flex-shrink-0 mt-0.5"}),e.jsx("span",{className:"text-text-main",children:r})]},h))}),v>0&&e.jsx("div",{className:"bg-success-light border border-success/20 rounded-lg p-4 mt-4",children:e.jsxs("p",{className:"text-sm text-success font-medium",children:["推定節税可能額: ",C(v)]})})]})]}),N=()=>{const r={fiscalYear:s,filingType:u?"blue":"white",revenue:o.totalRevenue,expenses:o.totalExpenses,netIncome:o.netIncome,expensesByCategory:o.expensesByCategory,deductions:j.filter(w=>w.isApplicable).map(w=>({type:w.type,name:w.name,amount:w.amount})),totalDeductions:o.totalDeductions,taxableIncome:o.taxableIncome,estimatedTax:o.estimatedTax},h=u?Fe(r):Se(r),I=u?`青色申告決算書_${s}年度.xtx`:`収支内訳書_${s}年度.xml`;Te(h,I);const f=window.open("","_blank");f&&(f.document.write(`
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>e-Tax用ファイルプレビュー - ${s}年度</title>
    <style>
        body { font-family: 'Hiragino Sans', sans-serif; background: #1a1a2e; color: #e0e0e0; padding: 40px; margin: 0; }
        .container { max-width: 900px; margin: 0 auto; }
        h1 { color: #60a5fa; text-align: center; }
        .info { background: rgba(96,165,250,0.1); border: 1px solid rgba(96,165,250,0.3); padding: 16px; border-radius: 8px; margin-bottom: 24px; }
        pre { background: #0d1117; padding: 20px; border-radius: 8px; overflow-x: auto; font-size: 12px; line-height: 1.6; }
        .actions { display: flex; gap: 16px; justify-content: center; margin-top: 24px; }
        button { padding: 12px 24px; border-radius: 8px; border: none; cursor: pointer; font-size: 14px; font-weight: 600; }
        .primary { background: #3b82f6; color: white; }
        .secondary { background: rgba(255,255,255,0.1); color: #e0e0e0; border: 1px solid rgba(255,255,255,0.2); }
    </style>
</head>
<body>
    <div class="container">
        <h1>📄 ${u?"青色申告決算書":"収支内訳書"}（${s}年度）</h1>
        <div class="info">
            <p>⚠️ <strong>このXMLファイルは参考資料です。</strong></p>
            <p>正式な確定申告は、国税庁の確定申告書等作成コーナーをご利用ください。XMLデータは入力の参考にお使いいただけます。</p>
        </div>
        <pre>${h.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</pre>
        <div class="actions">
            <button class="secondary" onclick="window.close()">✕ 閉じる</button>
        </div>
    </div>
</body>
</html>
            `),f.document.close())},z=()=>{const[r,h]=U.useState(null),I=async(f,w)=>{try{await navigator.clipboard.writeText(String(f).replace(/[¥,]/g,"")),h(w),setTimeout(()=>h(null),2e3)}catch(P){console.error("コピーに失敗しました:",P)}};return e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsxs("h3",{className:"text-lg font-semibold text-text-main mb-4 flex items-center gap-2",children:[e.jsx(X,{className:"w-5 h-5 text-primary"}),"確定申告書の作成"]}),e.jsx("p",{className:"text-text-muted mb-2",children:"入力内容を確認して、書類を作成してください。"}),e.jsx("p",{className:"text-xs text-text-muted",children:"💡 各項目の右側のコピーボタンで、e-Tax入力時にそのまま貼り付けできます"})]}),e.jsxs("div",{className:"bg-surface border border-border rounded-xl divide-y divide-border",children:[e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"申告年度"}),e.jsx("div",{className:"flex items-center gap-2",children:e.jsxs("span",{className:"font-medium text-text-main",children:[s,"年度"]})})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"申告方法"}),e.jsx("span",{className:"font-medium text-text-main",children:u?"青色申告":"白色申告"})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"売上高"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-success",children:C(o.totalRevenue)}),e.jsx("button",{onClick:()=>I(o.totalRevenue,"revenue"),className:`p-1.5 rounded transition-colors ${r==="revenue"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:r==="revenue"?e.jsx(J,{className:"w-4 h-4"}):e.jsx(O,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"経費合計"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-error",children:C(o.totalExpenses)}),e.jsx("button",{onClick:()=>I(o.totalExpenses,"expenses"),className:`p-1.5 rounded transition-colors ${r==="expenses"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:r==="expenses"?e.jsx(J,{className:"w-4 h-4"}):e.jsx(O,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"事業所得"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-text-main",children:C(o.netIncome)}),e.jsx("button",{onClick:()=>I(o.netIncome,"netIncome"),className:`p-1.5 rounded transition-colors ${r==="netIncome"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:r==="netIncome"?e.jsx(J,{className:"w-4 h-4"}):e.jsx(O,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"控除合計"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-primary",children:C(o.totalDeductions)}),e.jsx("button",{onClick:()=>I(o.totalDeductions,"deductions"),className:`p-1.5 rounded transition-colors ${r==="deductions"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:r==="deductions"?e.jsx(J,{className:"w-4 h-4"}):e.jsx(O,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"課税所得"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-text-main",children:C(o.taxableIncome)}),e.jsx("button",{onClick:()=>I(o.taxableIncome,"taxableIncome"),className:`p-1.5 rounded transition-colors ${r==="taxableIncome"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:r==="taxableIncome"?e.jsx(J,{className:"w-4 h-4"}):e.jsx(O,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center bg-primary-light",children:[e.jsx("span",{className:"font-medium text-text-main",children:"予想所得税額"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-bold text-primary text-lg",children:C(o.estimatedTax)}),e.jsx("button",{onClick:()=>I(o.estimatedTax,"tax"),className:`p-1.5 rounded transition-colors ${r==="tax"?"bg-success text-white":"hover:bg-primary/20 text-primary"}`,title:"コピー",children:r==="tax"?e.jsx(J,{className:"w-4 h-4"}):e.jsx(O,{className:"w-4 h-4"})})]})]})]}),e.jsxs("div",{className:"space-y-4",children:[e.jsx("h4",{className:"text-md font-medium text-text-main",children:"📥 ダウンロード"}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-4",children:[e.jsxs("button",{onClick:$,className:"btn-primary py-4 flex items-center justify-center gap-2",children:[e.jsx(de,{className:"w-5 h-5"}),"申告書プレビュー"]}),e.jsxs("button",{onClick:N,className:"btn-outline py-4 flex items-center justify-center gap-2 border-2 border-blue-500 text-blue-500 hover:bg-blue-500/10",children:[e.jsx(De,{className:"w-5 h-5"}),"e-Tax用XMLファイル"]})]}),e.jsxs("div",{className:"bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4",children:[e.jsx("h5",{className:"text-sm font-medium text-text-main mb-3 flex items-center gap-2",children:"✨ 日本語PDF自動生成（NEW!）"}),e.jsx("p",{className:"text-xs text-text-muted mb-3",children:(l==null?void 0:l.business_type)==="corporation"?"法人税申告書・決算報告書（損益計算書+貸借対照表）を日本語PDFで生成":"確定申告書B・青色申告決算書を日本語PDFで生成します"}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-3",children:[(l==null?void 0:l.business_type)!=="corporation"&&e.jsxs(e.Fragment,{children:[e.jsxs("button",{onClick:async()=>{var f,w;try{const P={revenue:o.totalRevenue,expenses:o.totalExpenses,netIncome:o.netIncome,expensesByCategory:o.expensesByCategory,deductions:{basic:((f=j.find(te=>te.type==="basic"))==null?void 0:f.amount)||48e4,blueReturn:u?65e4:0,socialInsurance:(w=j.find(te=>te.type==="socialInsurance"))==null?void 0:w.amount},taxableIncome:o.taxableIncome,estimatedTax:o.estimatedTax,fiscalYear:s,isBlueReturn:u},ae=await Le(P),he=`確定申告書B_${s}年度.pdf`;W(ae,he),H(ae)}catch(P){console.error("PDF生成エラー:",P),alert("PDF生成に失敗しました。フォントファイルを確認してください。")}},className:"px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium flex items-center justify-center gap-2",children:[e.jsx(X,{className:"w-4 h-4"}),"確定申告書B"]}),u&&e.jsxs("button",{onClick:async()=>{try{const f={revenue:o.totalRevenue,expenses:o.totalExpenses,netIncome:o.netIncome,expensesByCategory:o.expensesByCategory,deductions:{blueReturn:65e4},taxableIncome:o.taxableIncome,estimatedTax:o.estimatedTax,fiscalYear:s,isBlueReturn:!0},w=await _e(f),P=`青色申告決算書_${s}年度.pdf`;W(w,P),H(w)}catch(f){console.error("PDF生成エラー:",f),alert("PDF生成に失敗しました。フォントファイルを確認してください。")}},className:"px-4 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium flex items-center justify-center gap-2",children:[e.jsx(X,{className:"w-4 h-4"}),"青色申告決算書"]})]}),(l==null?void 0:l.business_type)==="corporation"&&e.jsxs(e.Fragment,{children:[e.jsxs("button",{onClick:async()=>{try{const f={revenue:o.totalRevenue,expenses:o.totalExpenses,netIncome:o.netIncome,expensesByCategory:o.expensesByCategory,taxableIncome:o.taxableIncome,estimatedTax:o.estimatedTax,fiscalYear:s,businessType:"corporation",companyName:(l==null?void 0:l.company_name)||"会社名",representativeName:(l==null?void 0:l.representative_name)||"",address:(l==null?void 0:l.address)||""},w=await Ee(f),P=`法人税申告書_${s}年度.pdf`;W(w,P),H(w)}catch(f){console.error("PDF生成エラー:",f),alert("PDF生成に失敗しました。フォントファイルを確認してください。")}},className:"px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium flex items-center justify-center gap-2",children:[e.jsx(X,{className:"w-4 h-4"}),"法人税申告書"]}),e.jsxs("button",{onClick:async()=>{try{const f={revenue:o.totalRevenue,expenses:o.totalExpenses,netIncome:o.netIncome,expensesByCategory:o.expensesByCategory,taxableIncome:o.taxableIncome,estimatedTax:o.estimatedTax,fiscalYear:s,businessType:"corporation",companyName:(l==null?void 0:l.company_name)||"会社名",representativeName:(l==null?void 0:l.representative_name)||"",capital:1e6},w=await Pe(f),P=`決算報告書_${s}年度.pdf`;W(w,P),H(w)}catch(f){console.error("PDF生成エラー:",f),alert("PDF生成に失敗しました。フォントファイルを確認してください。")}},className:"px-4 py-3 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors text-sm font-medium flex items-center justify-center gap-2",children:[e.jsx(X,{className:"w-4 h-4"}),"決算報告書"]})]})]})]})]}),e.jsxs("div",{className:"bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-xl p-5",children:[e.jsxs("h4",{className:"text-md font-medium text-text-main mb-3 flex items-center gap-2",children:[e.jsx(re,{className:"w-5 h-5 text-blue-500"}),"e-Taxで直接申告する"]}),e.jsxs("ol",{className:"text-sm text-text-muted space-y-2 mb-4",children:[e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx("span",{className:"flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs",children:"1"}),"上のコピーボタンで各数値をコピー"]}),e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx("span",{className:"flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs",children:"2"}),"確定申告書等作成コーナーにアクセス"]}),e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx("span",{className:"flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs",children:"3"}),"コピーした数値を貼り付けて入力"]}),e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx("span",{className:"flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs",children:"4"}),"マイナンバーカードで電子署名 → 送信完了！"]})]}),e.jsxs("a",{href:"https://www.keisan.nta.go.jp/kyoutu/ky/smsp/top",target:"_blank",rel:"noopener noreferrer",className:"inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm",children:[e.jsx(re,{className:"w-4 h-4"}),"確定申告書等作成コーナーを開く"]}),e.jsx(se,{to:"/tax-filing-guide",className:"inline-flex items-center gap-2 px-4 py-2 ml-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm",children:"📖 詳しい申告ガイドを見る"})]}),e.jsxs("div",{className:"bg-warning-light border border-warning/20 rounded-lg p-4 flex items-start gap-3",children:[e.jsx(ce,{className:"w-5 h-5 text-warning flex-shrink-0 mt-0.5"}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-text-main font-medium",children:"ご注意ください"}),e.jsxs("ul",{className:"text-sm text-text-muted mt-2 space-y-1 list-disc list-inside",children:[e.jsx("li",{children:"この計算は概算です。正確な税額は税務署にご確認ください"}),e.jsx("li",{children:"確定申告の期限は翌年3月15日です（例：2025年度分は2026年3月15日まで）"}),e.jsx("li",{children:"青色申告特別控除65万円の適用には電子申告が必要です"})]})]})]})]})},L=()=>{switch(x){case 1:return e.jsx(Q,{});case 2:return e.jsx(ee,{});case 3:return e.jsx(F,{});case 4:return e.jsx(S,{});case 5:return e.jsx(z,{});default:return null}};return e.jsx("div",{className:"min-h-screen bg-background",children:e.jsxs("div",{className:"max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8",children:[e.jsxs("div",{className:"mb-8",children:[e.jsxs(se,{to:"/dashboard",className:"flex items-center text-primary hover:text-primary-hover mb-4",children:[e.jsx(oe,{className:"h-5 w-5 mr-2"}),"ダッシュボードに戻る"]}),e.jsx("h1",{className:"text-3xl font-bold text-text-main mb-2",children:"確定申告サポート"}),e.jsx("p",{className:"text-text-muted",children:"5つのステップで簡単に確定申告を完了できます"})]}),e.jsx(R,{}),e.jsx("div",{className:"bg-surface border border-border rounded-xl p-6 mb-6",children:L()}),e.jsxs("div",{className:"flex justify-between",children:[e.jsxs("button",{onClick:A,disabled:x===1,className:`btn-ghost ${x===1?"opacity-50 cursor-not-allowed":""}`,children:[e.jsx(oe,{className:"w-5 h-5"}),"戻る"]}),x<K.length?e.jsxs("button",{onClick:B,className:"btn-primary",children:["次へ",e.jsx(Ce,{className:"w-5 h-5"})]}):e.jsxs("button",{onClick:$,className:"btn-success",children:[e.jsx(le,{className:"w-5 h-5"}),"完了"]})]})]})})};export{Ge as default};
