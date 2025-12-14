import{c as xe,a as he,b as ue,d as pe,r as _,j as e,L as ae,F as O,P as ne,S as V,R as ge,g as Y,t as be,T as fe}from"./index-CbMuQAlH.js";import{g as je,c as ye,f as $,E as le,A as ie,a as Ne,b as ve}from"./TaxFilingService-B0OltPu_.js";import{P as q,r as x,f as we}from"./fontkit.es-9zeASWDv.js";import{A as oe}from"./arrow-left-BXKIQtQH.js";import{C as $e}from"./calculator-DFcUPSSk.js";import{D as me}from"./download-gCEYKq6t.js";import{A as Ce}from"./arrow-right-DGyNu4Fn.js";import{C as ce}from"./circle-check-big-CbBLr7ZG.js";import{C as X}from"./copy-BPMoAsds.js";import{C as de}from"./circle-alert-Duxt4-d4.js";import{R as Ie}from"./refresh-cw-CwG6TG47.js";/**
 * @license lucide-react v0.540.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ke=[["path",{d:"M10 12.5 8 15l2 2.5",key:"1tg20x"}],["path",{d:"m14 12.5 2 2.5-2 2.5",key:"yinavb"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z",key:"1mlx9k"}]],ze=xe("file-code",ke);/**
 * @license lucide-react v0.540.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const De=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 16v-4",key:"1dtifu"}],["path",{d:"M12 8h.01",key:"e9boi3"}]],Re=xe("info",De);function Te(a){const d=new Date,g=d.toISOString().replace(/[-:]/g,"").split(".")[0],m={売上高:"AA100",仕入高:"AB100",消耗品費:"AC100",旅費交通費:"AC110",通信費:"AC120",広告宣伝費:"AC130",接待交際費:"AC140",水道光熱費:"AC150",地代家賃:"AC160",外注費:"AC170",減価償却費:"AC180",雑費:"AC190"},i=a.expensesByCategory.map((j,l)=>{const s=m[j.category]||`AC${200+l}`;return`    <${s}>${j.amount}</${s}>`}).join(`
`);return`<?xml version="1.0" encoding="UTF-8"?>
<!--
  Ainance e-Tax Export File
  生成日時: ${d.toLocaleString("ja-JP")}
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
${a.deductions.map(j=>`      <${j.type}>${j.amount}</${j.type}>`).join(`
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
</申告書等送信票等>`}function Fe(a){return`<?xml version="1.0" encoding="UTF-8"?>
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
${a.expensesByCategory.map(m=>`    <${m.category.replace(/\s/g,"")}>${m.amount}</${m.category.replace(/\s/g,"")}>`).join(`
`)}
    <経費合計>${a.expenses}</経費合計>
  </必要経費>
  
  <差引金額>${a.netIncome}</差引金額>
</収支内訳書>`}function Ae(a,d){const g=new Blob(["\uFEFF"+a],{type:"application/xml;charset=utf-8"}),m=URL.createObjectURL(g),i=document.createElement("a");i.href=m,i.download=d,document.body.appendChild(i),i.click(),document.body.removeChild(i),setTimeout(()=>URL.revokeObjectURL(m),1e3)}function G(a,d){const g=new Blob([new Uint8Array(a)],{type:"application/pdf"}),m=URL.createObjectURL(g),i=document.createElement("a");i.href=m,i.download=d,document.body.appendChild(i),i.click(),document.body.removeChild(i),setTimeout(()=>URL.revokeObjectURL(m),1e3)}function W(a){const d=new Blob([new Uint8Array(a)],{type:"application/pdf"}),g=URL.createObjectURL(d);window.open(g,"_blank")}const Se={交通費:"旅費交通費",旅費交通費:"旅費交通費",通信費:"通信費",水道光熱費:"水道光熱費",消耗品費:"消耗品費",接待交際費:"接待交際費",広告宣伝費:"広告宣伝費",地代家賃:"地代家賃",外注費:"外注工賃",給与:"給料賃金",雑費:"雑費",減価償却費:"減価償却費",修繕費:"修繕費",保険料:"損害保険料",福利厚生費:"福利厚生費",支払利息:"支払利息",租税公課:"租税公課",荷造運賃:"荷造運賃",その他:"雑費",未分類:"雑費","Travel & Transportation":"旅費交通費",Communication:"通信費",Utilities:"水道光熱費",Supplies:"消耗品費",Entertainment:"接待交際費",Advertising:"広告宣伝費",Rent:"地代家賃",Outsourcing:"外注工賃",Salaries:"給料賃金",Miscellaneous:"雑費",Depreciation:"減価償却費",Repairs:"修繕費",Insurance:"損害保険料",Benefits:"福利厚生費",Interest:"支払利息","Taxes & Dues":"租税公課",Shipping:"荷造運賃",Other:"雑費",Uncategorized:"雑費"};async function Z(a){a.registerFontkit(we);try{const d=await fetch("/fonts/NotoSansCJKjp-Regular.otf").then(D=>D.arrayBuffer()),g=await fetch("/fonts/NotoSansCJKjp-Bold.otf").then(D=>D.arrayBuffer()),m=await a.embedFont(d),i=await a.embedFont(g);return{regular:m,bold:i}}catch(d){throw console.error("日本語フォントのロードに失敗:",d),new Error("日本語フォントのロードに失敗しました。public/fonts/にフォントファイルを配置してください。")}}function f(a){return a===0?"0":a.toLocaleString("ja-JP")}function Q(a){return`令和${a-2018}年`}async function Ee(a){const d=await q.create(),g=d.addPage([595.28,841.89]),{regular:m,bold:i}=await Z(d),{width:D,height:j}=g.getSize(),l={primary:x(.4,.2,.6),text:x(.1,.1,.1),muted:x(.4,.4,.4),line:x(.7,.7,.7),highlight:x(.95,.95,1),red:x(.8,.2,.2)},s=(R,T,S,F={})=>{g.drawText(R,{x:T,y:S,size:F.size||10,font:F.font||m,color:F.color||l.text})},n=(R,T,S,F,B=.5)=>{g.drawLine({start:{x:R,y:T},end:{x:S,y:F},thickness:B,color:l.line})},h=(R,T,S,F,B)=>{g.drawRectangle({x:R,y:T,width:S,height:F,color:B})};h(0,j-60,D,60,l.primary),s("法人税申告書",50,j-40,{size:18,font:i,color:x(1,1,1)}),s("（参考資料）",180,j-40,{size:12,font:m,color:x(.9,.9,.9)});let t=j-85;s(`会社名: ${a.companyName||"―"}`,50,t,{size:12,font:i}),t-=20,s(`事業年度: ${a.fiscalYear}年度（${Q(a.fiscalYear)}度）`,50,t,{size:10}),s(`作成日: ${new Date().toLocaleDateString("ja-JP")}`,400,t,{size:9,color:l.muted}),t-=30,n(50,t,545,t,1),t-=25,s("第1部　法人情報",50,t,{size:12,font:i,color:l.primary}),t-=25,[["会社名（商号）",a.companyName||"―"],["代表者氏名",a.representativeName||"―"],["法人番号",a.corporateNumber||"―"],["本店所在地",a.address||"―"],["資本金",a.capital?`${f(a.capital)}円`:"―"]].forEach(([R,T])=>{n(50,t-5,545,t-5),s(R,60,t),s(T,200,t),t-=20}),t-=15,s("第2部　損益の計算",50,t,{size:12,font:i,color:l.primary}),t-=25,h(50,t-5,495,20,l.highlight),n(50,t-5,545,t-5),s("売上高",60,t),s(`${f(a.revenue)}円`,450,t),t-=20,n(50,t-5,545,t-5),s("売上原価・経費合計",60,t),s(`${f(a.expenses)}円`,450,t),t-=20,h(50,t-5,495,20,x(.95,1,.95)),n(50,t-5,545,t-5),s("当期純利益",60,t,{font:i}),s(`${f(a.netIncome)}円`,450,t,{font:i}),t-=35,s("第3部　税額の計算",50,t,{size:12,font:i,color:l.primary}),t-=25;const y=a.taxableIncome,k=y<=8e6?.15:.232,C=Math.floor(y*k),w=Math.floor(C*.103),z=Math.floor(y*.07),o=C+w+z;return[["課税所得金額",`${f(y)}円`],[`法人税額（税率${(k*100).toFixed(1)}%）`,`${f(C)}円`],["地方法人税（10.3%）",`${f(w)}円`],["事業税（概算7%）",`${f(z)}円`]].forEach(([R,T])=>{n(50,t-5,545,t-5),s(R,60,t),s(T,450,t),t-=20}),h(50,t-8,495,28,x(1,.95,.95)),n(50,t-8,545,t-8,1),n(50,t+20,545,t+20,1),s("税額合計（概算）",60,t+3,{font:i}),s(`${f(o)}円`,450,t+3,{font:i,color:l.red}),n(50,60,545,60),s("※ この書類はAinanceで作成した参考資料です。",50,45,{size:8,color:l.muted}),s("※ 正式な申告には税理士への相談またはe-Taxをご利用ください。",50,33,{size:8,color:l.muted}),d.save()}async function Pe(a){const d=await q.create(),g=d.addPage([595.28,841.89]),{regular:m,bold:i}=await Z(d),{width:D,height:j}=g.getSize(),l={primary:x(.4,.2,.6),secondary:x(.2,.4,.6),text:x(.1,.1,.1),muted:x(.4,.4,.4),line:x(.5,.5,.5),highlight:x(.95,.95,1),green:x(.2,.6,.3),red:x(.8,.2,.2),lightGreen:x(.9,1,.9),lightRed:x(1,.95,.95),lightBlue:x(.9,.95,1)},s={text:(c,b,u,N={})=>{g.drawText(c,{x:b,y:u,size:N.size||8,font:N.font||m,color:N.color||l.text})},line:(c,b,u,N,U=.5)=>{g.drawLine({start:{x:c,y:b},end:{x:u,y:N},thickness:U,color:l.line})},rect:(c,b,u,N,U)=>{g.drawRectangle({x:c,y:b,width:u,height:N,color:U})}};s.rect(0,j-45,D,45,l.primary),s.text("決 算 報 告 書（財務三表）",180,j-30,{size:16,font:i,color:x(1,1,1)});let n=j-60;s.text(`${a.companyName||"会社名"}`,50,n,{size:10,font:i}),s.text(`${a.fiscalYear}年度（${Q(a.fiscalYear)}度）`,300,n,{size:9}),s.text(`作成日: ${new Date().toLocaleDateString("ja-JP")}`,450,n,{size:7,color:l.muted}),n-=15,s.line(50,n,545,n,1),n-=10;const h=a.revenue-a.expenses,t=Math.floor(a.revenue*.2),v=Math.floor(a.revenue*.15),y=Math.floor(a.revenue*.1),k=Math.floor(a.revenue*.2),C=t+v+y+k,w=Math.floor(a.expenses*.2),z=Math.floor(a.expenses*.15),o=w+z,A=a.capital||1e6,R=C-o-A,T=a.netIncome+Math.floor(a.expenses*.1),S=-Math.floor(a.revenue*.05),F=-Math.floor(z*.1),B=T+S+F,H=n;s.rect(50,n-12,200,12,l.secondary),s.text("損益計算書（P/L）",55,n-9,{size:9,font:i,color:x(1,1,1)}),n-=18,[{label:"売上高",value:a.revenue,highlight:!0},{label:"売上原価",value:Math.floor(a.expenses*.4),highlight:!1},{label:"売上総利益",value:a.revenue-Math.floor(a.expenses*.4),highlight:!1},{label:"販売費及び一般管理費",value:Math.floor(a.expenses*.6),highlight:!1},{label:"営業利益",value:h,highlight:!0,color:h>=0?l.green:l.red},{label:"営業外収益",value:Math.floor(a.revenue*.01),highlight:!1},{label:"営業外費用",value:Math.floor(a.expenses*.02),highlight:!1},{label:"経常利益",value:h+Math.floor(a.revenue*.01)-Math.floor(a.expenses*.02),highlight:!1},{label:"当期純利益",value:a.netIncome,highlight:!0,bold:!0,color:a.netIncome>=0?l.green:l.red}].forEach(c=>{c.highlight&&s.rect(50,n-11,200,11,c.bold?l.lightGreen:l.highlight),s.line(50,n-11,250,n-11),s.text(c.label,55,n-8,{size:7,font:c.bold?i:m}),s.text(`${f(c.value)}`,190,n-8,{size:7,font:c.bold?i:m,color:c.color||l.text}),n-=11}),n=H;const J=265;s.rect(J,n-12,280,12,l.secondary),s.text("貸借対照表（B/S）",J+5,n-9,{size:9,font:i,color:x(1,1,1)}),n-=18;const E=J,P=J+140,L=135;s.rect(E,n-10,L,10,x(.85,.9,.95)),s.text("【資産の部】",E+3,n-8,{size:7,font:i}),s.rect(P,n-10,L+5,10,x(.95,.9,.85)),s.text("【負債・純資産の部】",P+3,n-8,{size:7,font:i}),n-=12;const ee=[{label:"流動資産",isHeader:!0},{label:"　現金及び預金",value:t},{label:"　売掛金",value:v},{label:"　棚卸資産",value:y},{label:"固定資産",isHeader:!0},{label:"　有形固定資産",value:k},{label:"資産合計",value:C,isTotal:!0}],te=[{label:"流動負債",isHeader:!0},{label:"　買掛金",value:w},{label:"　短期借入金",value:z},{label:"純資産の部",isHeader:!0},{label:"　資本金",value:A},{label:"　繰越利益剰余金",value:R},{label:"負債・純資産合計",value:C,isTotal:!0}];let M=n,r=n;ee.forEach(c=>{c.isTotal?s.rect(E,M-10,L,10,l.lightGreen):c.isHeader&&s.rect(E,M-10,L,10,l.highlight),s.line(E,M-10,E+L,M-10),s.text(c.label,E+3,M-8,{size:6,font:c.isHeader||c.isTotal?i:m}),c.value!==void 0&&s.text(f(c.value),E+85,M-8,{size:6,font:c.isTotal?i:m}),M-=10}),te.forEach(c=>{c.isTotal?s.rect(P,r-10,L+5,10,l.lightGreen):c.isHeader&&s.rect(P,r-10,L+5,10,l.highlight),s.line(P,r-10,P+L+5,r-10),s.text(c.label,P+3,r-8,{size:6,font:c.isHeader||c.isTotal?i:m}),c.value!==void 0&&s.text(f(c.value),P+90,r-8,{size:6,font:c.isTotal?i:m}),r-=10}),n=Math.min(M,r)-15,s.rect(50,n-12,D-100,12,l.secondary),s.text("キャッシュ・フロー計算書（C/F）",55,n-9,{size:9,font:i,color:x(1,1,1)}),n-=18;const p=160;return[{title:"営業活動によるCF",items:[{label:"税引前当期純利益",value:a.netIncome},{label:"減価償却費",value:Math.floor(a.expenses*.1)},{label:"売上債権の増減",value:-Math.floor(v*.1)},{label:"仕入債務の増減",value:Math.floor(w*.1)}],total:T,color:T>=0?l.green:l.red},{title:"投資活動によるCF",items:[{label:"固定資産の取得",value:S}],total:S,color:S>=0?l.green:l.red},{title:"財務活動によるCF",items:[{label:"借入金の返済",value:F}],total:F,color:F>=0?l.green:l.red}].forEach((c,b)=>{const u=50+b*p+b*10;let N=n;s.rect(u,N-10,p,10,l.highlight),s.line(u,N-10,u+p,N-10),s.text(c.title,u+3,N-8,{size:7,font:i}),N-=12,c.items.forEach(U=>{s.line(u,N-9,u+p,N-9),s.text(U.label,u+3,N-7,{size:6}),s.text(f(U.value),u+105,N-7,{size:6}),N-=9}),s.rect(u,N-10,p,10,l.lightBlue),s.line(u,N-10,u+p,N-10,1),s.text("小計",u+3,N-8,{size:7,font:i}),s.text(f(c.total),u+105,N-8,{size:7,font:i,color:c.color})}),n=n-60,s.rect(50,n-14,D-100,14,l.lightGreen),s.line(50,n-14,545,n-14,1),s.line(50,n,545,n,1),s.text("現金及び現金同等物の増減額",55,n-10,{size:9,font:i}),s.text(`${f(B)}円`,430,n-10,{size:9,font:i,color:B>=0?l.green:l.red}),n-=18,s.line(50,n-5,545,n-5),s.text("現金及び現金同等物の期末残高",55,n-2,{size:8}),s.text(`${f(t+B)}円`,430,n-2,{size:8,font:i}),s.line(50,60,545,60),s.text("※ この決算報告書はAinanceで作成した参考資料です。",50,48,{size:7,color:l.muted}),s.text("※ 貸借対照表・キャッシュフロー計算書は売上・経費データから概算で作成しています。",50,38,{size:7,color:l.muted}),s.text("※ 正確な財務諸表の作成には、税理士への相談をお勧めします。",50,28,{size:7,color:l.muted}),d.save()}async function Le(a){var y,k,C;const d=await q.create(),g=d.addPage([595.28,841.89]),{regular:m,bold:i}=await Z(d),{width:D,height:j}=g.getSize(),l={primary:x(.2,.4,.8),text:x(.1,.1,.1),muted:x(.4,.4,.4),line:x(.5,.5,.5),highlight:x(.95,.95,1),red:x(.8,.2,.2)},s=(w,z,o,A={})=>{g.drawText(w,{x:z,y:o,size:A.size||10,font:A.font||m,color:A.color||l.text})},n=(w,z,o,A,R=.5)=>{g.drawLine({start:{x:w,y:z},end:{x:o,y:A},thickness:R,color:l.line})},h=(w,z,o,A,R)=>{g.drawRectangle({x:w,y:z,width:o,height:A,color:R})};h(0,j-60,D,60,l.primary),s("確 定 申 告 書 B",200,j-40,{size:20,font:i,color:x(1,1,1)});let t=j-85;s(`${Q(a.fiscalYear)}分の所得税及び復興特別所得税の申告書`,50,t,{size:11,font:i}),s(`作成日: ${new Date().toLocaleDateString("ja-JP")}`,400,t,{size:9,color:l.muted}),t-=30,n(50,t,545,t,1),t-=25,s("第1部　収入金額等",50,t,{size:12,font:i,color:l.primary}),t-=25,h(50,t-5,495,20,l.highlight),n(50,t-5,545,t-5),s("事業所得（営業等）　ア",60,t),s(`${f(a.revenue)}円`,450,t),t-=30,s("第2部　所得金額等",50,t,{size:12,font:i,color:l.primary}),t-=25,n(50,t-5,545,t-5),s("事業所得　①",60,t),s(`${f(a.netIncome)}円`,450,t),t-=20,h(50,t-5,495,20,l.highlight),n(50,t-5,545,t-5),s("合計（総所得金額）　⑫",60,t,{font:i}),s(`${f(a.netIncome)}円`,450,t,{font:i}),t-=35,s("第3部　所得から差し引かれる金額",50,t,{size:12,font:i,color:l.primary}),t-=25;let v=0;return(y=a.deductions)!=null&&y.basic&&(n(50,t-5,545,t-5),s("基礎控除　㉔",60,t),s(`${f(a.deductions.basic)}円`,450,t),v+=a.deductions.basic,t-=20),(k=a.deductions)!=null&&k.blueReturn&&(n(50,t-5,545,t-5),s("青色申告特別控除",60,t),s(`${f(a.deductions.blueReturn)}円`,450,t),v+=a.deductions.blueReturn,t-=20),(C=a.deductions)!=null&&C.socialInsurance&&(n(50,t-5,545,t-5),s("社会保険料控除　⑬",60,t),s(`${f(a.deductions.socialInsurance)}円`,450,t),v+=a.deductions.socialInsurance,t-=20),h(50,t-5,495,20,l.highlight),n(50,t-5,545,t-5),s("所得控除合計　㉕",60,t,{font:i}),s(`${f(v)}円`,450,t,{font:i}),t-=35,s("第4部　税額の計算",50,t,{size:12,font:i,color:l.primary}),t-=25,n(50,t-5,545,t-5),s("課税される所得金額　㉖",60,t),s(`${f(a.taxableIncome)}円`,450,t),t-=25,h(50,t-8,495,28,x(1,.95,.95)),n(50,t-8,545,t-8,1),n(50,t+20,545,t+20,1),s("所得税額（概算）　㉗",60,t+3,{font:i,size:11}),s(`${f(a.estimatedTax)}円`,440,t+3,{font:i,size:11,color:l.red}),n(50,60,545,60),s("※ この書類はAinanceで作成した参考資料です。",50,45,{size:8,color:l.muted}),s("※ 正式な申告には国税庁「確定申告書等作成コーナー」をご利用ください。",50,33,{size:8,color:l.muted}),d.save()}async function Me(a){var v;const d=await q.create(),g=d.addPage([595.28,841.89]),{regular:m,bold:i}=await Z(d),{width:D,height:j}=g.getSize(),l={primary:x(.2,.4,.8),text:x(.1,.1,.1),muted:x(.4,.4,.4),line:x(.5,.5,.5),highlight:x(.95,.95,1),green:x(.2,.6,.3)},s=(y,k,C,w={})=>{g.drawText(y,{x:k,y:C,size:w.size||10,font:w.font||m,color:w.color||l.text})},n=(y,k,C,w,z=.5)=>{g.drawLine({start:{x:y,y:k},end:{x:C,y:w},thickness:z,color:l.line})},h=(y,k,C,w,z)=>{g.drawRectangle({x:y,y:k,width:C,height:w,color:z})};h(0,j-60,D,60,l.primary),s("青色申告決算書",200,j-40,{size:20,font:i,color:x(1,1,1)}),s("（一般用）",340,j-40,{size:12,color:x(.9,.9,.9)});let t=j-85;if(s(`${Q(a.fiscalYear)}分　所得税青色申告決算書`,50,t,{size:11,font:i}),a.tradeName&&s(`屋号: ${a.tradeName}`,350,t,{size:10}),s(`作成日: ${new Date().toLocaleDateString("ja-JP")}`,450,t,{size:9,color:l.muted}),t-=30,n(50,t,545,t,1),t-=25,s("損益計算書",50,t,{size:12,font:i,color:l.primary}),t-=20,h(50,t-5,495,20,l.highlight),n(50,t-5,545,t-5),s("売上（収入）金額　①",60,t,{font:i}),s(`${f(a.revenue)}円`,450,t,{font:i}),t-=30,s("経費",50,t,{size:11,font:i}),t-=20,h(50,t-15,495,15,x(.9,.9,.9)),n(50,t,545,t),n(50,t-15,545,t-15),s("勘定科目",60,t-11,{font:i,size:9}),s("金額",470,t-11,{font:i,size:9}),t-=18,a.expensesByCategory.forEach((y,k)=>{const C=Se[y.category]||y.category||"雑費";k%2===0&&h(50,t-15,495,15,x(.98,.98,.98)),n(50,t-15,545,t-15),s(C,60,t-11,{size:9}),s(f(y.amount),450,t-11,{size:9}),t-=15,t<200}),h(50,t-18,495,18,x(.95,.95,.95)),n(50,t-18,545,t-18),s("経費合計　㉑",60,t-13,{font:i}),s(`${f(a.expenses)}円`,445,t-13,{font:i}),t-=30,n(50,t-5,545,t-5),s("差引金額　① - ㉑",60,t),s(`${f(a.netIncome)}円`,450,t),t-=25,(v=a.deductions)!=null&&v.blueReturn){n(50,t-5,545,t-5),s("青色申告特別控除額",60,t),s(`${f(a.deductions.blueReturn)}円`,450,t),t-=25;const y=Math.max(0,a.netIncome-a.deductions.blueReturn);h(50,t-8,495,25,x(.95,1,.95)),n(50,t-8,545,t-8,1),n(50,t+17,545,t+17,1),s("所得金額　㊸",60,t+2,{font:i,size:11}),s(`${f(y)}円`,440,t+2,{font:i,size:11,color:l.green})}return n(50,60,545,60),s("※ この書類はAinanceで作成した参考資料です。",50,45,{size:8,color:l.muted}),s("※ 正式な申告には国税庁「確定申告書等作成コーナー」をご利用ください。",50,33,{size:8,color:l.muted}),d.save()}const K=[{id:1,title:"基本情報",icon:O,description:"確定申告の基本設定"},{id:2,title:"収支確認",icon:$e,description:"売上・経費の確認"},{id:3,title:"控除入力",icon:ne,description:"各種控除の入力"},{id:4,title:"AI診断",icon:V,description:"AIによる節税アドバイス"},{id:5,title:"申告書作成",icon:me,description:"PDFダウンロード"}],Ve=()=>{const{user:a}=he(),{currentBusinessType:d}=ue(),{transactions:g}=pe(a==null?void 0:a.id,d==null?void 0:d.business_type),[m,i]=_.useState(1),[D,j]=_.useState(!1),l=new Date().getFullYear(),[s,n]=_.useState(l-1),[h,t]=_.useState(!0),[v,y]=_.useState([]),[k,C]=_.useState([]),[w,z]=_.useState(0);_.useEffect(()=>{y(je(h))},[h]);const o=_.useMemo(()=>ye(g,s,(d==null?void 0:d.business_type)||"individual",v),[g,s,d,v]),A=()=>{m<K.length&&i(m+1)},R=()=>{m>1&&i(m-1)},T=r=>{const p=ie.find(I=>I.type===r);p&&!v.find(I=>I.type===r)&&y([...v,{id:Date.now().toString(),...p,amount:0,isApplicable:!0}])},S=r=>{y(v.filter(p=>p.id!==r))},F=(r,p)=>{y(v.map(I=>I.id===r?{...I,amount:p}:I))},B=async()=>{j(!0);try{const r=await ve(o,{});C(r.suggestions),z(r.estimatedSavings)}catch(r){console.error("AI診断エラー:",r)}finally{j(!1)}},H=()=>{const r=`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
           確定申告書（${s}年度）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

申告方法: ${h?"青色申告":"白色申告"}
作成日時: ${new Date().toLocaleString("ja-JP")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【収支内訳】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
売上高:     ${$(o.totalRevenue)}
経費合計:   ${$(o.totalExpenses)}
──────────────────────────────────────────────────
事業所得:   ${$(o.netIncome)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【控除内訳】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${v.filter(u=>u.isApplicable).map(u=>`${u.name.padEnd(20,"　")}: ${$(u.amount)}`).join(`
`)}
──────────────────────────────────────────────────
控除合計:   ${$(o.totalDeductions)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【税額計算】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
課税所得:   ${$(o.taxableIncome)}
──────────────────────────────────────────────────
所得税額:   ${$(o.estimatedTax)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
※この書類はAinanceで生成された概算資料です。
  正式な確定申告は国税庁のe-Taxでお手続きください。
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`.trim(),p=new Blob(["\uFEFF"+r],{type:"text/plain;charset=utf-8"}),I=URL.createObjectURL(p),c=document.createElement("a");c.href=I,c.download=`確定申告書_${s}年度.txt`,document.body.appendChild(c),c.click(),document.body.removeChild(c);const b=window.open("","_blank");b&&(b.document.write(`
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
        <p class="subtitle">${s}年度 | ${h?"青色申告":"白色申告"} | 作成日: ${new Date().toLocaleDateString("ja-JP")}</p>
        <pre>${r}</pre>
        <div class="actions">
            <button class="print-btn" onclick="window.print()">🖨️ 印刷する</button>
            <button class="close-btn" onclick="window.close()">✕ 閉じる</button>
        </div>
    </div>
</body>
</html>
            `),b.document.close()),setTimeout(()=>URL.revokeObjectURL(I),1e3)},re=()=>e.jsx("div",{className:"mb-8",children:e.jsx("div",{className:"flex items-center justify-between",children:K.map((r,p)=>e.jsxs(ge.Fragment,{children:[e.jsxs("div",{className:"flex flex-col items-center",children:[e.jsx("div",{className:`w-10 h-10 rounded-full flex items-center justify-center transition-all ${m>r.id?"bg-success text-white":m===r.id?"bg-primary text-white":"bg-surface-highlight text-text-muted"}`,children:m>r.id?e.jsx(Y,{className:"w-5 h-5"}):e.jsx(r.icon,{className:"w-5 h-5"})}),e.jsx("span",{className:`text-xs mt-2 hidden sm:block ${m>=r.id?"text-text-main font-medium":"text-text-muted"}`,children:r.title})]}),p<K.length-1&&e.jsx("div",{className:`flex-1 h-1 mx-2 rounded ${m>r.id?"bg-success":"bg-surface-highlight"}`})]},r.id))})}),J=()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold text-text-main mb-4",children:"確定申告の基本設定"}),e.jsx("p",{className:"text-text-muted mb-6",children:"確定申告を行う年度と申告方法を選択してください。"})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-text-main mb-2",children:"申告年度"}),e.jsx("select",{value:s,onChange:r=>n(Number(r.target.value)),className:"input-base",children:[l,...Array.from({length:4},(r,p)=>l-1-p)].map(r=>e.jsxs("option",{value:r,children:[r,"年度（",r,"年1月〜12月）",r===l&&" ※進行中"]},r))})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-text-main mb-2",children:"申告方法"}),e.jsxs("div",{className:"space-y-3",children:[e.jsxs("label",{className:"flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-surface-highlight transition-colors",children:[e.jsx("input",{type:"radio",checked:h,onChange:()=>t(!0),className:"w-4 h-4 text-primary"}),e.jsxs("div",{className:"ml-3",children:[e.jsx("span",{className:"font-medium text-text-main",children:"青色申告"}),e.jsx("span",{className:"ml-2 text-xs text-success",children:"最大65万円控除"}),e.jsx("p",{className:"text-sm text-text-muted mt-1",children:"複式簿記で最大65万円の控除が受けられます"})]})]}),e.jsxs("label",{className:"flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-surface-highlight transition-colors",children:[e.jsx("input",{type:"radio",checked:!h,onChange:()=>t(!1),className:"w-4 h-4 text-primary"}),e.jsxs("div",{className:"ml-3",children:[e.jsx("span",{className:"font-medium text-text-main",children:"白色申告"}),e.jsx("p",{className:"text-sm text-text-muted mt-1",children:"簡易的な帳簿で申告できます"})]})]})]})]})]}),e.jsxs("div",{className:"bg-info-light border border-info/20 rounded-lg p-4 flex items-start gap-3",children:[e.jsx(Re,{className:"w-5 h-5 text-info flex-shrink-0 mt-0.5"}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-text-main font-medium",children:"青色申告がおすすめ！"}),e.jsx("p",{className:"text-sm text-text-muted mt-1",children:"Ainanceで取引を記録していれば、複式簿記の要件を満たしています。 65万円の控除で税金がお得になります。"})]})]})]}),E=()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold text-text-main mb-4",children:"収支の確認"}),e.jsxs("p",{className:"text-text-muted mb-6",children:[s,"年度の取引データから自動集計した結果です。"]})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4",children:[e.jsxs("div",{className:"bg-success-light border border-success/20 rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-success font-medium",children:"売上高"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:$(o.totalRevenue)})]}),e.jsxs("div",{className:"bg-error-light border border-error/20 rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-error font-medium",children:"経費合計"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:$(o.totalExpenses)})]}),e.jsxs("div",{className:"bg-primary-light border border-primary/20 rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-primary font-medium",children:"事業所得"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:$(o.netIncome)})]})]}),e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-5",children:[e.jsx("h4",{className:"font-medium text-text-main mb-4",children:"経費内訳（上位5件）"}),o.expensesByCategory.length>0?e.jsx("div",{className:"space-y-3",children:o.expensesByCategory.slice(0,5).map((r,p)=>e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"w-8 h-8 bg-surface-highlight rounded-lg flex items-center justify-center text-sm font-medium text-text-muted",children:p+1}),e.jsx("span",{className:"text-text-main",children:r.category})]}),e.jsxs("div",{className:"text-right",children:[e.jsx("span",{className:"font-medium text-text-main",children:$(r.amount)}),e.jsxs("span",{className:"text-text-muted text-sm ml-2",children:["(",Ne(r.percentage),")"]})]})]},p))}):e.jsxs("p",{className:"text-text-muted text-center py-4",children:[s,"年度の経費データがありません"]})]}),o.totalRevenue===0&&o.totalExpenses===0&&e.jsxs("div",{className:"bg-warning-light border border-warning/20 rounded-lg p-4 flex items-start gap-3",children:[e.jsx(de,{className:"w-5 h-5 text-warning flex-shrink-0 mt-0.5"}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-text-main font-medium",children:"取引データがありません"}),e.jsxs("p",{className:"text-sm text-text-muted mt-1",children:[s,"年度の取引を登録してから確定申告を行ってください。",e.jsx(ae,{to:"/transactions",className:"text-primary hover:underline ml-1",children:"取引を登録する →"})]})]})]})]}),P=()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold text-text-main mb-4",children:"各種控除の入力"}),e.jsx("p",{className:"text-text-muted mb-6",children:"該当する控除を追加して金額を入力してください。控除が多いほど税金が安くなります。"})]}),e.jsx("div",{className:"space-y-4",children:v.map(r=>e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4",children:[e.jsxs("div",{className:"flex-1",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(ce,{className:"w-5 h-5 text-success"}),e.jsx("span",{className:"font-medium text-text-main",children:r.name})]}),e.jsx("p",{className:"text-sm text-text-muted mt-1 ml-7",children:r.description})]}),e.jsxs("div",{className:"flex items-center gap-3 ml-7 sm:ml-0",children:[e.jsxs("div",{className:"relative",children:[e.jsx("span",{className:"absolute left-3 top-1/2 -translate-y-1/2 text-text-muted",children:"¥"}),e.jsx("input",{type:"number",value:r.amount,onChange:p=>F(r.id,Number(p.target.value)),className:"input-base pl-8 w-40",placeholder:"金額",disabled:r.type==="basic"||r.type==="blue_return"})]}),r.type!=="basic"&&r.type!=="blue_return"&&e.jsx("button",{onClick:()=>S(r.id),className:"p-2 text-error hover:bg-error-light rounded-lg transition-colors",children:e.jsx(fe,{className:"w-5 h-5"})})]})]},r.id))}),e.jsxs("div",{className:"bg-surface-highlight border border-border rounded-xl p-5",children:[e.jsxs("h4",{className:"font-medium text-text-main mb-4 flex items-center gap-2",children:[e.jsx(ne,{className:"w-5 h-5"}),"控除を追加"]}),e.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-3",children:ie.filter(r=>!v.find(p=>p.type===r.type)).map(r=>e.jsxs("button",{onClick:()=>T(r.type),className:"flex items-center gap-3 p-3 bg-surface border border-border rounded-lg hover:border-primary hover:bg-primary-light transition-colors text-left",children:[e.jsx("div",{className:"w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center",children:e.jsx(ne,{className:"w-4 h-4 text-primary"})}),e.jsxs("div",{children:[e.jsx("p",{className:"font-medium text-text-main text-sm",children:r.name}),e.jsx("p",{className:"text-xs text-text-muted",children:r.description})]})]},r.type))})]}),e.jsxs("div",{className:"bg-success-light border border-success/20 rounded-xl p-5 flex items-center justify-between",children:[e.jsx("span",{className:"font-medium text-text-main",children:"控除合計"}),e.jsx("span",{className:"text-2xl font-bold text-success",children:$(o.totalDeductions)})]})]}),L=()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsxs("h3",{className:"text-lg font-semibold text-text-main mb-4 flex items-center gap-2",children:[e.jsx(V,{className:"w-5 h-5 text-primary"}),"AIによる節税アドバイス"]}),e.jsx("p",{className:"text-text-muted mb-6",children:"AIがあなたの収支データを分析し、節税のアドバイスを提供します。"})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-text-muted",children:"課税所得"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:$(o.taxableIncome)}),e.jsx("p",{className:"text-xs text-text-muted mt-2",children:"事業所得 - 各種控除"})]}),e.jsxs("div",{className:"bg-primary-light border border-primary/20 rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-primary font-medium",children:"予想所得税額"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:$(o.estimatedTax)}),e.jsx("p",{className:"text-xs text-text-muted mt-2",children:"※概算です。実際の税額とは異なる場合があります"})]})]}),k.length===0?e.jsx("button",{onClick:B,disabled:D,className:"btn-primary w-full py-4",children:D?e.jsxs(e.Fragment,{children:[e.jsx(Ie,{className:"w-5 h-5 animate-spin"}),"AI分析中..."]}):e.jsxs(e.Fragment,{children:[e.jsx(V,{className:"w-5 h-5"}),"AIアドバイスを受ける"]})}):e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-5 space-y-4",children:[e.jsxs("div",{className:"flex items-center gap-2 text-primary",children:[e.jsx(V,{className:"w-5 h-5"}),e.jsx("span",{className:"font-medium",children:"AIからのアドバイス"})]}),e.jsx("ul",{className:"space-y-3",children:k.map((r,p)=>e.jsxs("li",{className:"flex items-start gap-3",children:[e.jsx(be,{className:"w-5 h-5 text-primary flex-shrink-0 mt-0.5"}),e.jsx("span",{className:"text-text-main",children:r})]},p))}),w>0&&e.jsx("div",{className:"bg-success-light border border-success/20 rounded-lg p-4 mt-4",children:e.jsxs("p",{className:"text-sm text-success font-medium",children:["推定節税可能額: ",$(w)]})})]})]}),ee=()=>{const r={fiscalYear:s,filingType:h?"blue":"white",revenue:o.totalRevenue,expenses:o.totalExpenses,netIncome:o.netIncome,expensesByCategory:o.expensesByCategory,deductions:v.filter(b=>b.isApplicable).map(b=>({type:b.type,name:b.name,amount:b.amount})),totalDeductions:o.totalDeductions,taxableIncome:o.taxableIncome,estimatedTax:o.estimatedTax},p=h?Te(r):Fe(r),I=h?`青色申告決算書_${s}年度.xtx`:`収支内訳書_${s}年度.xml`;Ae(p,I);const c=window.open("","_blank");c&&(c.document.write(`
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
        <h1>📄 ${h?"青色申告決算書":"収支内訳書"}（${s}年度）</h1>
        <div class="info">
            <p>⚠️ <strong>このXMLファイルは参考資料です。</strong></p>
            <p>正式な確定申告は、国税庁の確定申告書等作成コーナーをご利用ください。XMLデータは入力の参考にお使いいただけます。</p>
        </div>
        <pre>${p.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</pre>
        <div class="actions">
            <button class="secondary" onclick="window.close()">✕ 閉じる</button>
        </div>
    </div>
</body>
</html>
            `),c.document.close())},te=()=>{const[r,p]=_.useState(null),I=async(c,b)=>{try{await navigator.clipboard.writeText(String(c).replace(/[¥,]/g,"")),p(b),setTimeout(()=>p(null),2e3)}catch(u){console.error("コピーに失敗しました:",u)}};return e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsxs("h3",{className:"text-lg font-semibold text-text-main mb-4 flex items-center gap-2",children:[e.jsx(O,{className:"w-5 h-5 text-primary"}),"確定申告書の作成"]}),e.jsx("p",{className:"text-text-muted mb-2",children:"入力内容を確認して、書類を作成してください。"}),e.jsx("p",{className:"text-xs text-text-muted",children:"💡 各項目の右側のコピーボタンで、e-Tax入力時にそのまま貼り付けできます"})]}),e.jsxs("div",{className:"bg-surface border border-border rounded-xl divide-y divide-border",children:[e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"申告年度"}),e.jsx("div",{className:"flex items-center gap-2",children:e.jsxs("span",{className:"font-medium text-text-main",children:[s,"年度"]})})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"申告方法"}),e.jsx("span",{className:"font-medium text-text-main",children:h?"青色申告":"白色申告"})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"売上高"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-success",children:$(o.totalRevenue)}),e.jsx("button",{onClick:()=>I(o.totalRevenue,"revenue"),className:`p-1.5 rounded transition-colors ${r==="revenue"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:r==="revenue"?e.jsx(Y,{className:"w-4 h-4"}):e.jsx(X,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"経費合計"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-error",children:$(o.totalExpenses)}),e.jsx("button",{onClick:()=>I(o.totalExpenses,"expenses"),className:`p-1.5 rounded transition-colors ${r==="expenses"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:r==="expenses"?e.jsx(Y,{className:"w-4 h-4"}):e.jsx(X,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"事業所得"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-text-main",children:$(o.netIncome)}),e.jsx("button",{onClick:()=>I(o.netIncome,"netIncome"),className:`p-1.5 rounded transition-colors ${r==="netIncome"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:r==="netIncome"?e.jsx(Y,{className:"w-4 h-4"}):e.jsx(X,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"控除合計"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-primary",children:$(o.totalDeductions)}),e.jsx("button",{onClick:()=>I(o.totalDeductions,"deductions"),className:`p-1.5 rounded transition-colors ${r==="deductions"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:r==="deductions"?e.jsx(Y,{className:"w-4 h-4"}):e.jsx(X,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"課税所得"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-text-main",children:$(o.taxableIncome)}),e.jsx("button",{onClick:()=>I(o.taxableIncome,"taxableIncome"),className:`p-1.5 rounded transition-colors ${r==="taxableIncome"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:r==="taxableIncome"?e.jsx(Y,{className:"w-4 h-4"}):e.jsx(X,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center bg-primary-light",children:[e.jsx("span",{className:"font-medium text-text-main",children:"予想所得税額"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-bold text-primary text-lg",children:$(o.estimatedTax)}),e.jsx("button",{onClick:()=>I(o.estimatedTax,"tax"),className:`p-1.5 rounded transition-colors ${r==="tax"?"bg-success text-white":"hover:bg-primary/20 text-primary"}`,title:"コピー",children:r==="tax"?e.jsx(Y,{className:"w-4 h-4"}):e.jsx(X,{className:"w-4 h-4"})})]})]})]}),e.jsxs("div",{className:"space-y-4",children:[e.jsx("h4",{className:"text-md font-medium text-text-main",children:"📥 ダウンロード"}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-4",children:[e.jsxs("button",{onClick:H,className:"btn-primary py-4 flex items-center justify-center gap-2",children:[e.jsx(me,{className:"w-5 h-5"}),"申告書プレビュー"]}),e.jsxs("button",{onClick:ee,className:"btn-outline py-4 flex items-center justify-center gap-2 border-2 border-blue-500 text-blue-500 hover:bg-blue-500/10",children:[e.jsx(ze,{className:"w-5 h-5"}),"e-Tax用XMLファイル"]})]}),e.jsxs("div",{className:"bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4",children:[e.jsx("h5",{className:"text-sm font-medium text-text-main mb-3 flex items-center gap-2",children:"✨ 日本語PDF自動生成（NEW!）"}),e.jsx("p",{className:"text-xs text-text-muted mb-3",children:(d==null?void 0:d.business_type)==="corporation"?"法人税申告書・決算報告書（損益計算書+貸借対照表）を日本語PDFで生成":"確定申告書B・青色申告決算書を日本語PDFで生成します"}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-3",children:[(d==null?void 0:d.business_type)!=="corporation"&&e.jsxs(e.Fragment,{children:[e.jsxs("button",{onClick:async()=>{var c,b;try{const u={revenue:o.totalRevenue,expenses:o.totalExpenses,netIncome:o.netIncome,expensesByCategory:o.expensesByCategory,deductions:{basic:((c=v.find(se=>se.type==="basic"))==null?void 0:c.amount)||48e4,blueReturn:h?65e4:0,socialInsurance:(b=v.find(se=>se.type==="socialInsurance"))==null?void 0:b.amount},taxableIncome:o.taxableIncome,estimatedTax:o.estimatedTax,fiscalYear:s,isBlueReturn:h},N=await Le(u),U=`確定申告書B_${s}年度.pdf`;G(N,U),W(N)}catch(u){console.error("PDF生成エラー:",u),alert("PDF生成に失敗しました。フォントファイルを確認してください。")}},className:"px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium flex items-center justify-center gap-2",children:[e.jsx(O,{className:"w-4 h-4"}),"確定申告書B"]}),h&&e.jsxs("button",{onClick:async()=>{try{const c={revenue:o.totalRevenue,expenses:o.totalExpenses,netIncome:o.netIncome,expensesByCategory:o.expensesByCategory,deductions:{blueReturn:65e4},taxableIncome:o.taxableIncome,estimatedTax:o.estimatedTax,fiscalYear:s,isBlueReturn:!0},b=await Me(c),u=`青色申告決算書_${s}年度.pdf`;G(b,u),W(b)}catch(c){console.error("PDF生成エラー:",c),alert("PDF生成に失敗しました。フォントファイルを確認してください。")}},className:"px-4 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium flex items-center justify-center gap-2",children:[e.jsx(O,{className:"w-4 h-4"}),"青色申告決算書"]})]}),(d==null?void 0:d.business_type)==="corporation"&&e.jsxs(e.Fragment,{children:[e.jsxs("button",{onClick:async()=>{try{const c={revenue:o.totalRevenue,expenses:o.totalExpenses,netIncome:o.netIncome,expensesByCategory:o.expensesByCategory,taxableIncome:o.taxableIncome,estimatedTax:o.estimatedTax,fiscalYear:s,businessType:"corporation",companyName:(d==null?void 0:d.company_name)||"会社名",representativeName:(d==null?void 0:d.representative_name)||"",address:(d==null?void 0:d.address)||""},b=await Ee(c),u=`法人税申告書_${s}年度.pdf`;G(b,u),W(b)}catch(c){console.error("PDF生成エラー:",c),alert("PDF生成に失敗しました。フォントファイルを確認してください。")}},className:"px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium flex items-center justify-center gap-2",children:[e.jsx(O,{className:"w-4 h-4"}),"法人税申告書"]}),e.jsxs("button",{onClick:async()=>{try{const c={revenue:o.totalRevenue,expenses:o.totalExpenses,netIncome:o.netIncome,expensesByCategory:o.expensesByCategory,taxableIncome:o.taxableIncome,estimatedTax:o.estimatedTax,fiscalYear:s,businessType:"corporation",companyName:(d==null?void 0:d.company_name)||"会社名",representativeName:(d==null?void 0:d.representative_name)||"",capital:1e6},b=await Pe(c),u=`決算報告書_${s}年度.pdf`;G(b,u),W(b)}catch(c){console.error("PDF生成エラー:",c),alert("PDF生成に失敗しました。フォントファイルを確認してください。")}},className:"px-4 py-3 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors text-sm font-medium flex items-center justify-center gap-2",children:[e.jsx(O,{className:"w-4 h-4"}),"決算報告書"]})]})]})]})]}),e.jsxs("div",{className:"bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-xl p-5",children:[e.jsxs("h4",{className:"text-md font-medium text-text-main mb-3 flex items-center gap-2",children:[e.jsx(le,{className:"w-5 h-5 text-blue-500"}),"e-Taxで直接申告する"]}),e.jsxs("ol",{className:"text-sm text-text-muted space-y-2 mb-4",children:[e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx("span",{className:"flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs",children:"1"}),"上のコピーボタンで各数値をコピー"]}),e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx("span",{className:"flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs",children:"2"}),"確定申告書等作成コーナーにアクセス"]}),e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx("span",{className:"flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs",children:"3"}),"コピーした数値を貼り付けて入力"]}),e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx("span",{className:"flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs",children:"4"}),"マイナンバーカードで電子署名 → 送信完了！"]})]}),e.jsxs("a",{href:"https://www.keisan.nta.go.jp/kyoutu/ky/smsp/top",target:"_blank",rel:"noopener noreferrer",className:"inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm",children:[e.jsx(le,{className:"w-4 h-4"}),"確定申告書等作成コーナーを開く"]}),e.jsx(ae,{to:"/tax-filing-guide",className:"inline-flex items-center gap-2 px-4 py-2 ml-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm",children:"📖 詳しい申告ガイドを見る"})]}),e.jsxs("div",{className:"bg-warning-light border border-warning/20 rounded-lg p-4 flex items-start gap-3",children:[e.jsx(de,{className:"w-5 h-5 text-warning flex-shrink-0 mt-0.5"}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-text-main font-medium",children:"ご注意ください"}),e.jsxs("ul",{className:"text-sm text-text-muted mt-2 space-y-1 list-disc list-inside",children:[e.jsx("li",{children:"この計算は概算です。正確な税額は税務署にご確認ください"}),e.jsx("li",{children:"確定申告の期限は翌年3月15日です（例：2025年度分は2026年3月15日まで）"}),e.jsx("li",{children:"青色申告特別控除65万円の適用には電子申告が必要です"})]})]})]})]})},M=()=>{switch(m){case 1:return e.jsx(J,{});case 2:return e.jsx(E,{});case 3:return e.jsx(P,{});case 4:return e.jsx(L,{});case 5:return e.jsx(te,{});default:return null}};return e.jsx("div",{className:"min-h-screen bg-background",children:e.jsxs("div",{className:"max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8",children:[e.jsxs("div",{className:"mb-8",children:[e.jsxs(ae,{to:"/dashboard",className:"flex items-center text-primary hover:text-primary-hover mb-4",children:[e.jsx(oe,{className:"h-5 w-5 mr-2"}),"ダッシュボードに戻る"]}),e.jsx("h1",{className:"text-3xl font-bold text-text-main mb-2",children:"確定申告サポート"}),e.jsx("p",{className:"text-text-muted",children:"5つのステップで簡単に確定申告を完了できます"})]}),e.jsx(re,{}),e.jsx("div",{className:"bg-surface border border-border rounded-xl p-6 mb-6",children:M()}),e.jsxs("div",{className:"flex justify-between",children:[e.jsxs("button",{onClick:R,disabled:m===1,className:`btn-ghost ${m===1?"opacity-50 cursor-not-allowed":""}`,children:[e.jsx(oe,{className:"w-5 h-5"}),"戻る"]}),m<K.length?e.jsxs("button",{onClick:A,className:"btn-primary",children:["次へ",e.jsx(Ce,{className:"w-5 h-5"})]}):e.jsxs("button",{onClick:H,className:"btn-success",children:[e.jsx(ce,{className:"w-5 h-5"}),"完了"]})]})]})})};export{Ve as default};
