import{c as be,a as ye,b as Ne,d as ve,r as U,j as e,L as de,F as W,P as xe,S as le,R as we,g as G,t as $e,T as Ce}from"./index-sy9EbMWS.js";import{g as Ie,c as ze,f as k,E as me,A as he,a as ke,b as Te}from"./TaxFilingService-BUNxDoDj.js";import{P as re,r as x,f as Se}from"./fontkit.es-Bz1lHbwK.js";import{A as ue}from"./arrow-left-BYOT-0pT.js";import{C as De}from"./calculator-BA4ekAFn.js";import{D as fe}from"./download-BFvqWcq7.js";import{A as Re}from"./arrow-right-BkNWTX7w.js";import{C as pe}from"./circle-check-big-Dckdmqep.js";import{C as X}from"./copy-DXrwVi-O.js";import{C as ge}from"./circle-alert-D0qDzj3U.js";import{R as Ae}from"./refresh-cw-BBgPoPXn.js";/**
 * @license lucide-react v0.540.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Fe=[["path",{d:"M10 12.5 8 15l2 2.5",key:"1tg20x"}],["path",{d:"m14 12.5 2 2.5-2 2.5",key:"yinavb"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z",key:"1mlx9k"}]],Ee=be("file-code",Fe);/**
 * @license lucide-react v0.540.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Pe=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 16v-4",key:"1dtifu"}],["path",{d:"M12 8h.01",key:"e9boi3"}]],Le=be("info",Pe);function _e(n){const d=new Date,b=d.toISOString().replace(/[-:]/g,"").split(".")[0],u={売上高:"AA100",仕入高:"AB100",消耗品費:"AC100",旅費交通費:"AC110",通信費:"AC120",広告宣伝費:"AC130",接待交際費:"AC140",水道光熱費:"AC150",地代家賃:"AC160",外注費:"AC170",減価償却費:"AC180",雑費:"AC190"},r=n.expensesByCategory.map((N,l)=>{const s=u[N.category]||`AC${200+l}`;return`    <${s}>${N.amount}</${s}>`}).join(`
`);return`<?xml version="1.0" encoding="UTF-8"?>
<!--
  Ainance e-Tax Export File
  生成日時: ${d.toLocaleString("ja-JP")}
  対象年度: ${n.fiscalYear}年度
  申告区分: ${n.filingType==="blue"?"青色申告":"白色申告"}
-->
<申告書等送信票等>
  <作成日時>${b}</作成日時>
  <ファイル種別>青色申告決算書</ファイル種別>
  
  <申告者情報>
    <氏名>${n.name||"（要入力）"}</氏名>
    <フリガナ>${n.furigana||"（要入力）"}</フリガナ>
    <郵便番号>${n.postalCode||""}</郵便番号>
    <住所>${n.address||"（要入力）"}</住所>
    <電話番号>${n.phoneNumber||""}</電話番号>
    <生年月日>${n.birthDate||""}</生年月日>
  </申告者情報>
  
  <青色申告決算書>
    <対象年度>${n.fiscalYear}</対象年度>
    <申告区分>${n.filingType==="blue"?"1":"2"}</申告区分>
    
    <!-- 損益計算書 -->
    <損益計算書>
      <売上金額>
        <AA100>${n.revenue}</AA100>
      </売上金額>
      
      <必要経費>
${r}
        <経費合計>${n.expenses}</経費合計>
      </必要経費>
      
      <差引金額>${n.netIncome}</差引金額>
      
      <各種引当金>
        <繰戻額>0</繰戻額>
        <繰入額>0</繰入額>
      </各種引当金>
      
      <青色申告特別控除前所得>${n.netIncome}</青色申告特別控除前所得>
      <青色申告特別控除額>${n.filingType==="blue"?65e4:0}</青色申告特別控除額>
      <所得金額>${n.netIncome-(n.filingType==="blue"?65e4:0)}</所得金額>
    </損益計算書>
    
    <!-- 控除情報 -->
    <所得控除>
${n.deductions.map(N=>`      <${N.type}>${N.amount}</${N.type}>`).join(`
`)}
      <控除合計>${n.totalDeductions}</控除合計>
    </所得控除>
    
    <!-- 税額計算 -->
    <税額計算>
      <課税所得金額>${n.taxableIncome}</課税所得金額>
      <算出税額>${n.estimatedTax}</算出税額>
    </税額計算>
  </青色申告決算書>
  
  <備考>
    このファイルはAinanceで生成されました。
    正式な申告にはe-Tax確定申告書等作成コーナーでの確認・修正が必要な場合があります。
  </備考>
</申告書等送信票等>`}function Me(n){return`<?xml version="1.0" encoding="UTF-8"?>
<!--
  Ainance e-Tax Export File - 収支内訳書
  生成日時: ${new Date().toLocaleString("ja-JP")}
  対象年度: ${n.fiscalYear}年度
-->
<収支内訳書>
  <対象年度>${n.fiscalYear}</対象年度>
  
  <収入金額>
    <売上金額>${n.revenue}</売上金額>
  </収入金額>
  
  <必要経費>
${n.expensesByCategory.map(u=>`    <${u.category.replace(/\s/g,"")}>${u.amount}</${u.category.replace(/\s/g,"")}>`).join(`
`)}
    <経費合計>${n.expenses}</経費合計>
  </必要経費>
  
  <差引金額>${n.netIncome}</差引金額>
</収支内訳書>`}function Be(n,d){const b=new Blob(["\uFEFF"+n],{type:"application/xml;charset=utf-8"}),u=URL.createObjectURL(b),r=document.createElement("a");r.href=u,r.download=d,document.body.appendChild(r),r.click(),document.body.removeChild(r),setTimeout(()=>URL.revokeObjectURL(u),1e3)}function se(n,d){const b=new Blob([new Uint8Array(n)],{type:"application/pdf"}),u=URL.createObjectURL(b),r=document.createElement("a");r.href=u,r.download=d,document.body.appendChild(r),r.click(),document.body.removeChild(r),setTimeout(()=>URL.revokeObjectURL(u),1e3)}function ne(n){const d=new Blob([new Uint8Array(n)],{type:"application/pdf"}),b=URL.createObjectURL(d);window.open(b,"_blank")}const Ue={交通費:"旅費交通費",旅費交通費:"旅費交通費",通信費:"通信費",水道光熱費:"水道光熱費",消耗品費:"消耗品費",接待交際費:"接待交際費",広告宣伝費:"広告宣伝費",地代家賃:"地代家賃",外注費:"外注工賃",給与:"給料賃金",雑費:"雑費",減価償却費:"減価償却費",修繕費:"修繕費",保険料:"損害保険料",福利厚生費:"福利厚生費",支払利息:"支払利息",租税公課:"租税公課",荷造運賃:"荷造運賃",その他:"雑費",未分類:"雑費","Travel & Transportation":"旅費交通費",Communication:"通信費",Utilities:"水道光熱費",Supplies:"消耗品費",Entertainment:"接待交際費",Advertising:"広告宣伝費",Rent:"地代家賃",Outsourcing:"外注工賃",Salaries:"給料賃金",Miscellaneous:"雑費",Depreciation:"減価償却費",Repairs:"修繕費",Insurance:"損害保険料",Benefits:"福利厚生費",Interest:"支払利息","Taxes & Dues":"租税公課",Shipping:"荷造運賃",Other:"雑費",Uncategorized:"雑費"};async function ie(n){n.registerFontkit(Se);try{const d=await fetch("/fonts/NotoSansCJKjp-Regular.otf").then(A=>A.arrayBuffer()),b=await fetch("/fonts/NotoSansCJKjp-Bold.otf").then(A=>A.arrayBuffer()),u=await n.embedFont(d),r=await n.embedFont(b);return{regular:u,bold:r}}catch(d){throw console.error("日本語フォントのロードに失敗:",d),new Error("日本語フォントのロードに失敗しました。public/fonts/にフォントファイルを配置してください。")}}function j(n){return n===0?"0":n.toLocaleString("ja-JP")}function oe(n){return`令和${n-2018}年`}async function He(n){const d=await re.create(),b=d.addPage([595.28,841.89]),{regular:u,bold:r}=await ie(d),{width:A,height:N}=b.getSize(),l={primary:x(.1,.2,.4),secondary:x(.15,.3,.5),text:x(.1,.1,.1),muted:x(.45,.45,.45),line:x(.6,.6,.6),headerBg:x(.92,.94,.98),highlight:x(.94,.96,1),green:x(.15,.55,.25),red:x(.75,.2,.2),lightGreen:x(.88,.96,.88),lightRed:x(1,.93,.93)},s=18,m=24,a={text:(z,F,P,L={})=>{b.drawText(z,{x:F,y:P,size:L.size||10,font:L.font||u,color:L.color||l.text})},line:(z,F,P,L,H=.5)=>{b.drawLine({start:{x:z,y:F},end:{x:P,y:L},thickness:H,color:l.line})},rect:(z,F,P,L,H)=>{b.drawRectangle({x:z,y:F,width:P,height:L,color:H})}};a.rect(0,N-60,A,60,l.primary),a.text("法 人 税 申 告 書",190,N-38,{size:24,font:r,color:x(1,1,1)}),a.text("（参考資料）",390,N-38,{size:12,color:x(.8,.85,.9)});let t=N-78;a.text(`${n.companyName||"会社名"}`,50,t,{size:13,font:r}),a.text(`${n.fiscalYear}年度（${oe(n.fiscalYear)}度）`,300,t,{size:11}),a.text(`作成日: ${new Date().toLocaleDateString("ja-JP")}`,450,t,{size:9,color:l.muted}),t-=20,a.line(40,t,555,t,1.5),t-=15,a.rect(40,t-m,515,m,l.secondary),a.text("第1部　法人情報",50,t-17,{size:12,font:r,color:x(1,1,1)}),t-=m+8,[["会社名（商号）",n.companyName||"―"],["代表者氏名",n.representativeName||"―"],["法人番号",n.corporateNumber||"―"],["本店所在地",n.address||"―"],["資本金",n.capital?`${j(n.capital)}円`:"―"]].forEach(([z,F],P)=>{P%2===0&&a.rect(40,t-s,515,s,l.highlight),a.line(40,t-s,555,t-s),a.text(z,55,t-s+5,{size:10}),a.text(F,200,t-s+5,{size:10}),t-=s}),t-=15,a.rect(40,t-m,515,m,l.secondary),a.text("第2部　損益の計算",50,t-17,{size:12,font:r,color:x(1,1,1)}),t-=m+8,a.rect(40,t-s-2,515,s+2,l.highlight),a.line(40,t-s-2,555,t-s-2),a.text("売上高",55,t-s+3,{size:11}),a.text(`${j(n.revenue)}円`,450,t-s+3,{size:11}),t-=s+4,a.line(40,t-s,555,t-s),a.text("売上原価・経費合計",55,t-s+5,{size:10}),a.text(`${j(n.expenses)}円`,450,t-s+5,{size:10}),t-=s+2,a.rect(40,t-s-4,515,s+4,l.lightGreen),a.line(40,t-s-4,555,t-s-4,1),a.line(40,t,555,t,1),a.text("当期純利益",55,t-s+1,{size:12,font:r}),a.text(`${j(n.netIncome)}円`,440,t-s+1,{size:12,font:r,color:n.netIncome>=0?l.green:l.red}),t-=s+20,a.rect(40,t-m,515,m,l.secondary),a.text("第3部　税額の計算",50,t-17,{size:12,font:r,color:x(1,1,1)}),t-=m+8;const v=n.taxableIncome,T=v<=8e6?.15:.232,S=Math.floor(v*T),C=Math.floor(S*.103),D=Math.floor(v*.07),c=S+C+D;return[{label:"課税所得金額",value:`${j(v)}円`,highlight:!0},{label:`法人税額（税率${(T*100).toFixed(1)}%）`,value:`${j(S)}円`},{label:"地方法人税（10.3%）",value:`${j(C)}円`},{label:"事業税（概算7%）",value:`${j(D)}円`}].forEach((z,F)=>{z.highlight?a.rect(40,t-s,515,s,l.highlight):F%2===1&&a.rect(40,t-s,515,s,x(.98,.98,.98)),a.line(40,t-s,555,t-s),a.text(z.label,55,t-s+5,{size:10}),a.text(z.value,450,t-s+5,{size:10}),t-=s}),t-=8,a.rect(40,t-s-8,515,s+8,l.lightRed),a.line(40,t-s-8,555,t-s-8,1.5),a.line(40,t,555,t,1.5),a.text("税額合計（概算）",55,t-s-1,{size:13,font:r}),a.text(`${j(c)}円`,430,t-s-1,{size:13,font:r,color:l.red}),a.line(40,75,555,75),a.text("※ この書類はAinanceで作成した参考資料です。",45,58,{size:9,color:l.muted}),a.text("※ 正式な申告には税理士への相談またはe-Taxをご利用ください。",45,44,{size:9,color:l.muted}),d.save()}async function Ye(n){const d=await re.create(),b=d.addPage([595.28,841.89]),{regular:u,bold:r}=await ie(d),{width:A,height:N}=b.getSize(),l={primary:x(.1,.2,.4),secondary:x(.15,.3,.5),text:x(.1,.1,.1),muted:x(.45,.45,.45),line:x(.6,.6,.6),headerBg:x(.92,.94,.98),highlight:x(.94,.96,1),green:x(.15,.55,.25),red:x(.75,.2,.2),lightGreen:x(.88,.96,.88),lightBlue:x(.88,.93,1)},s=16,m=20,a=22,t={text:(h,p,$,I={})=>{b.drawText(h,{x:p,y:$,size:I.size||9,font:I.font||u,color:I.color||l.text})},line:(h,p,$,I,J=.5)=>{b.drawLine({start:{x:h,y:p},end:{x:$,y:I},thickness:J,color:l.line})},rect:(h,p,$,I,J)=>{b.drawRectangle({x:h,y:p,width:$,height:I,color:J})}};t.rect(0,N-55,A,55,l.primary),t.text("決 算 報 告 書",210,N-35,{size:22,font:r,color:x(1,1,1)}),t.text("（財務三表）",360,N-35,{size:14,color:x(.85,.85,.9)});let o=N-72;t.text(`${n.companyName||"会社名"}`,50,o,{size:12,font:r}),t.text(`${n.fiscalYear}年度（${oe(n.fiscalYear)}度）`,280,o,{size:10}),t.text(`作成日: ${new Date().toLocaleDateString("ja-JP")}`,450,o,{size:9,color:l.muted}),o-=18,t.line(40,o,555,o,1.5),o-=12;const v=n.revenue-n.expenses,T=n.revenue-Math.floor(n.expenses*.4),S=v+Math.floor(n.revenue*.01)-Math.floor(n.expenses*.02),C=Math.floor(n.revenue*.2),D=Math.floor(n.revenue*.15),c=Math.floor(n.revenue*.1),E=Math.floor(n.revenue*.2),z=C+D+c+E,F=Math.floor(n.expenses*.2),P=Math.floor(n.expenses*.15),L=F+P,H=n.capital||1e6,Z=z-L-H,Q=Math.floor(n.expenses*.1),ee=n.netIncome+Q,K=-Math.floor(n.revenue*.05),V=-Math.floor(P*.1),q=ee+K+V,M=40,Y=250,ce=o;t.rect(M,o-a,Y,a,l.secondary),t.text("損益計算書（P/L）",M+70,o-15,{size:11,font:r,color:x(1,1,1)}),o-=a+4,[{label:"売上高",value:n.revenue,isHighlight:!0},{label:"売上原価",value:Math.floor(n.expenses*.4)},{label:"売上総利益",value:T,isSubtotal:!0},{label:"販売費及び一般管理費",value:Math.floor(n.expenses*.6)},{label:"営業利益",value:v,isSubtotal:!0,color:v>=0?l.green:l.red},{label:"営業外収益",value:Math.floor(n.revenue*.01)},{label:"営業外費用",value:Math.floor(n.expenses*.02)},{label:"経常利益",value:S,isSubtotal:!0},{label:"当期純利益",value:n.netIncome,isTotal:!0,color:n.netIncome>=0?l.green:l.red}].forEach(h=>{const p=h.isTotal?s+4:s;h.isTotal?t.rect(M,o-p,Y,p,l.lightGreen):h.isSubtotal?t.rect(M,o-p,Y,p,l.headerBg):h.isHighlight&&t.rect(M,o-p,Y,p,l.highlight),t.line(M,o-p,M+Y,o-p),t.text(h.label,M+8,o-p+5,{size:h.isTotal?10:9,font:h.isSubtotal||h.isTotal?r:u}),t.text(`${j(h.value)}`,M+Y-60,o-p+5,{size:h.isTotal?10:9,font:h.isSubtotal||h.isTotal?r:u,color:h.color||l.text}),o-=p});const y=o;o=ce;const f=305,w=250,g=122;t.rect(f,o-a,w,a,l.secondary),t.text("貸借対照表（B/S）",f+70,o-15,{size:11,font:r,color:x(1,1,1)}),o-=a+4,t.rect(f,o-m,g,m,x(.85,.9,.95)),t.text("資産の部",f+35,o-14,{size:10,font:r}),t.rect(f+g+6,o-m,g,m,x(.95,.9,.88)),t.text("負債・純資産の部",f+g+15,o-14,{size:10,font:r}),o-=m+2;const R=[{label:"流動資産",isSection:!0},{label:"　現金預金",value:C},{label:"　売掛金",value:D},{label:"　棚卸資産",value:c},{label:"固定資産",isSection:!0},{label:"　有形固定資産",value:E},{label:"資産合計",value:z,isTotal:!0}],te=[{label:"流動負債",isSection:!0},{label:"　買掛金",value:F},{label:"　短期借入金",value:P},{label:"純資産の部",isSection:!0},{label:"　資本金",value:H},{label:"　利益剰余金",value:Z},{label:"負債純資産合計",value:z,isTotal:!0}];let B=o,_=o;R.forEach(h=>{const p=h.isTotal?s+2:s-1;h.isTotal?t.rect(f,B-p,g,p,l.lightGreen):h.isSection&&t.rect(f,B-p,g,p,l.highlight),t.line(f,B-p,f+g,B-p),t.text(h.label,f+4,B-p+4,{size:8,font:h.isSection||h.isTotal?r:u}),h.value!==void 0&&t.text(j(h.value),f+g-45,B-p+4,{size:8,font:h.isTotal?r:u}),B-=p}),te.forEach(h=>{const p=h.isTotal?s+2:s-1,$=f+g+6;h.isTotal?t.rect($,_-p,g,p,l.lightGreen):h.isSection&&t.rect($,_-p,g,p,l.highlight),t.line($,_-p,$+g,_-p),t.text(h.label,$+4,_-p+4,{size:8,font:h.isSection||h.isTotal?r:u}),h.value!==void 0&&t.text(j(h.value),$+g-48,_-p+4,{size:8,font:h.isTotal?r:u}),_-=p}),o=Math.min(y,B,_)-20,t.rect(40,o-a,A-80,a,l.secondary),t.text("キャッシュ・フロー計算書（C/F）",200,o-15,{size:11,font:r,color:x(1,1,1)}),o-=a+6;const O=165,je=10;return[{title:"営業活動によるCF",items:[{label:"税引前当期純利益",value:n.netIncome},{label:"減価償却費",value:Q},{label:"売上債権の増減",value:-Math.floor(D*.1)},{label:"仕入債務の増減",value:Math.floor(F*.1)}],total:ee},{title:"投資活動によるCF",items:[{label:"固定資産の取得",value:K},{label:"投資有価証券の取得",value:0}],total:K},{title:"財務活動によるCF",items:[{label:"借入金の返済",value:V},{label:"配当金の支払",value:0}],total:V}].forEach((h,p)=>{const $=40+p*(O+je);let I=o;t.rect($,I-m,O,m,l.headerBg),t.line($,I-m,$+O,I-m),t.text(h.title,$+25,I-14,{size:9,font:r}),I-=m+2,h.items.forEach(J=>{t.line($,I-s,$+O,I-s),t.text(J.label,$+6,I-s+5,{size:8}),t.text(j(J.value),$+O-50,I-s+5,{size:8}),I-=s}),t.rect($,I-s-2,O,s+2,l.lightBlue),t.line($,I-s-2,$+O,I-s-2,1),t.text("小計",$+6,I-s+3,{size:9,font:r}),t.text(j(h.total),$+O-50,I-s+3,{size:9,font:r,color:h.total>=0?l.green:l.red})}),o=o-(m+s*4+s+2+15),t.rect(40,o-m,A-80,m,l.lightGreen),t.line(40,o-m,555,o-m,1.5),t.line(40,o,555,o,1.5),t.text("現金及び現金同等物の増減額",50,o-14,{size:11,font:r}),t.text(`${j(q)}円`,440,o-14,{size:11,font:r,color:q>=0?l.green:l.red}),o-=m+5,t.line(40,o-s,555,o-s),t.text("現金及び現金同等物の期末残高",50,o-s+5,{size:10}),t.text(`${j(C+q)}円`,440,o-s+5,{size:10,font:r}),t.line(40,70,555,70),t.text("※ この決算報告書はAinanceで作成した参考資料です。",45,55,{size:8,color:l.muted}),t.text("※ 貸借対照表・キャッシュフロー計算書は売上・経費データからの概算です。正確な作成には税理士へご相談ください。",45,43,{size:8,color:l.muted}),d.save()}async function Oe(n){var v,T,S;const d=await re.create(),b=d.addPage([595.28,841.89]),{regular:u,bold:r}=await ie(d),{width:A,height:N}=b.getSize(),l={primary:x(.2,.4,.8),text:x(.1,.1,.1),muted:x(.4,.4,.4),line:x(.5,.5,.5),highlight:x(.95,.95,1),red:x(.8,.2,.2)},s=(C,D,c,E={})=>{b.drawText(C,{x:D,y:c,size:E.size||10,font:E.font||u,color:E.color||l.text})},m=(C,D,c,E,z=.5)=>{b.drawLine({start:{x:C,y:D},end:{x:c,y:E},thickness:z,color:l.line})},a=(C,D,c,E,z)=>{b.drawRectangle({x:C,y:D,width:c,height:E,color:z})};a(0,N-60,A,60,l.primary),s("確 定 申 告 書 B",200,N-40,{size:20,font:r,color:x(1,1,1)});let t=N-85;s(`${oe(n.fiscalYear)}分の所得税及び復興特別所得税の申告書`,50,t,{size:11,font:r}),s(`作成日: ${new Date().toLocaleDateString("ja-JP")}`,400,t,{size:9,color:l.muted}),t-=30,m(50,t,545,t,1),t-=25,s("第1部　収入金額等",50,t,{size:12,font:r,color:l.primary}),t-=25,a(50,t-5,495,20,l.highlight),m(50,t-5,545,t-5),s("事業所得（営業等）　ア",60,t),s(`${j(n.revenue)}円`,450,t),t-=30,s("第2部　所得金額等",50,t,{size:12,font:r,color:l.primary}),t-=25,m(50,t-5,545,t-5),s("事業所得　①",60,t),s(`${j(n.netIncome)}円`,450,t),t-=20,a(50,t-5,495,20,l.highlight),m(50,t-5,545,t-5),s("合計（総所得金額）　⑫",60,t,{font:r}),s(`${j(n.netIncome)}円`,450,t,{font:r}),t-=35,s("第3部　所得から差し引かれる金額",50,t,{size:12,font:r,color:l.primary}),t-=25;let o=0;return(v=n.deductions)!=null&&v.basic&&(m(50,t-5,545,t-5),s("基礎控除　㉔",60,t),s(`${j(n.deductions.basic)}円`,450,t),o+=n.deductions.basic,t-=20),(T=n.deductions)!=null&&T.blueReturn&&(m(50,t-5,545,t-5),s("青色申告特別控除",60,t),s(`${j(n.deductions.blueReturn)}円`,450,t),o+=n.deductions.blueReturn,t-=20),(S=n.deductions)!=null&&S.socialInsurance&&(m(50,t-5,545,t-5),s("社会保険料控除　⑬",60,t),s(`${j(n.deductions.socialInsurance)}円`,450,t),o+=n.deductions.socialInsurance,t-=20),a(50,t-5,495,20,l.highlight),m(50,t-5,545,t-5),s("所得控除合計　㉕",60,t,{font:r}),s(`${j(o)}円`,450,t,{font:r}),t-=35,s("第4部　税額の計算",50,t,{size:12,font:r,color:l.primary}),t-=25,m(50,t-5,545,t-5),s("課税される所得金額　㉖",60,t),s(`${j(n.taxableIncome)}円`,450,t),t-=25,a(50,t-8,495,28,x(1,.95,.95)),m(50,t-8,545,t-8,1),m(50,t+20,545,t+20,1),s("所得税額（概算）　㉗",60,t+3,{font:r,size:11}),s(`${j(n.estimatedTax)}円`,440,t+3,{font:r,size:11,color:l.red}),m(50,60,545,60),s("※ この書類はAinanceで作成した参考資料です。",50,45,{size:8,color:l.muted}),s("※ 正式な申告には国税庁「確定申告書等作成コーナー」をご利用ください。",50,33,{size:8,color:l.muted}),d.save()}async function Ge(n){var o;const d=await re.create(),b=d.addPage([595.28,841.89]),{regular:u,bold:r}=await ie(d),{width:A,height:N}=b.getSize(),l={primary:x(.2,.4,.8),text:x(.1,.1,.1),muted:x(.4,.4,.4),line:x(.5,.5,.5),highlight:x(.95,.95,1),green:x(.2,.6,.3)},s=(v,T,S,C={})=>{b.drawText(v,{x:T,y:S,size:C.size||10,font:C.font||u,color:C.color||l.text})},m=(v,T,S,C,D=.5)=>{b.drawLine({start:{x:v,y:T},end:{x:S,y:C},thickness:D,color:l.line})},a=(v,T,S,C,D)=>{b.drawRectangle({x:v,y:T,width:S,height:C,color:D})};a(0,N-60,A,60,l.primary),s("青色申告決算書",200,N-40,{size:20,font:r,color:x(1,1,1)}),s("（一般用）",340,N-40,{size:12,color:x(.9,.9,.9)});let t=N-85;if(s(`${oe(n.fiscalYear)}分　所得税青色申告決算書`,50,t,{size:11,font:r}),n.tradeName&&s(`屋号: ${n.tradeName}`,350,t,{size:10}),s(`作成日: ${new Date().toLocaleDateString("ja-JP")}`,450,t,{size:9,color:l.muted}),t-=30,m(50,t,545,t,1),t-=25,s("損益計算書",50,t,{size:12,font:r,color:l.primary}),t-=20,a(50,t-5,495,20,l.highlight),m(50,t-5,545,t-5),s("売上（収入）金額　①",60,t,{font:r}),s(`${j(n.revenue)}円`,450,t,{font:r}),t-=30,s("経費",50,t,{size:11,font:r}),t-=20,a(50,t-15,495,15,x(.9,.9,.9)),m(50,t,545,t),m(50,t-15,545,t-15),s("勘定科目",60,t-11,{font:r,size:9}),s("金額",470,t-11,{font:r,size:9}),t-=18,n.expensesByCategory.forEach((v,T)=>{const S=Ue[v.category]||v.category||"雑費";T%2===0&&a(50,t-15,495,15,x(.98,.98,.98)),m(50,t-15,545,t-15),s(S,60,t-11,{size:9}),s(j(v.amount),450,t-11,{size:9}),t-=15,t<200}),a(50,t-18,495,18,x(.95,.95,.95)),m(50,t-18,545,t-18),s("経費合計　㉑",60,t-13,{font:r}),s(`${j(n.expenses)}円`,445,t-13,{font:r}),t-=30,m(50,t-5,545,t-5),s("差引金額　① - ㉑",60,t),s(`${j(n.netIncome)}円`,450,t),t-=25,(o=n.deductions)!=null&&o.blueReturn){m(50,t-5,545,t-5),s("青色申告特別控除額",60,t),s(`${j(n.deductions.blueReturn)}円`,450,t),t-=25;const v=Math.max(0,n.netIncome-n.deductions.blueReturn);a(50,t-8,495,25,x(.95,1,.95)),m(50,t-8,545,t-8,1),m(50,t+17,545,t+17,1),s("所得金額　㊸",60,t+2,{font:r,size:11}),s(`${j(v)}円`,440,t+2,{font:r,size:11,color:l.green})}return m(50,60,545,60),s("※ この書類はAinanceで作成した参考資料です。",50,45,{size:8,color:l.muted}),s("※ 正式な申告には国税庁「確定申告書等作成コーナー」をご利用ください。",50,33,{size:8,color:l.muted}),d.save()}const ae=[{id:1,title:"基本情報",icon:W,description:"確定申告の基本設定"},{id:2,title:"収支確認",icon:De,description:"売上・経費の確認"},{id:3,title:"控除入力",icon:xe,description:"各種控除の入力"},{id:4,title:"AI診断",icon:le,description:"AIによる節税アドバイス"},{id:5,title:"申告書作成",icon:fe,description:"PDFダウンロード"}],at=()=>{const{user:n}=ye(),{currentBusinessType:d}=Ne(),{transactions:b}=ve(n==null?void 0:n.id,d==null?void 0:d.business_type),[u,r]=U.useState(1),[A,N]=U.useState(!1),l=new Date().getFullYear(),[s,m]=U.useState(l-1),[a,t]=U.useState(!0),[o,v]=U.useState([]),[T,S]=U.useState([]),[C,D]=U.useState(0);U.useEffect(()=>{v(Ie(a))},[a]);const c=U.useMemo(()=>ze(b,s,(d==null?void 0:d.business_type)||"individual",o),[b,s,d,o]),E=()=>{u<ae.length&&r(u+1)},z=()=>{u>1&&r(u-1)},F=i=>{const y=he.find(f=>f.type===i);y&&!o.find(f=>f.type===i)&&v([...o,{id:Date.now().toString(),...y,amount:0,isApplicable:!0}])},P=i=>{v(o.filter(y=>y.id!==i))},L=(i,y)=>{v(o.map(f=>f.id===i?{...f,amount:y}:f))},H=async()=>{N(!0);try{const i=await Te(c,{});S(i.suggestions),D(i.estimatedSavings)}catch(i){console.error("AI診断エラー:",i)}finally{N(!1)}},Z=()=>{const i=`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
           確定申告書（${s}年度）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

申告方法: ${a?"青色申告":"白色申告"}
作成日時: ${new Date().toLocaleString("ja-JP")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【収支内訳】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
売上高:     ${k(c.totalRevenue)}
経費合計:   ${k(c.totalExpenses)}
──────────────────────────────────────────────────
事業所得:   ${k(c.netIncome)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【控除内訳】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${o.filter(R=>R.isApplicable).map(R=>`${R.name.padEnd(20,"　")}: ${k(R.amount)}`).join(`
`)}
──────────────────────────────────────────────────
控除合計:   ${k(c.totalDeductions)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【税額計算】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
課税所得:   ${k(c.taxableIncome)}
──────────────────────────────────────────────────
所得税額:   ${k(c.estimatedTax)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
※この書類はAinanceで生成された概算資料です。
  正式な確定申告は国税庁のe-Taxでお手続きください。
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`.trim(),y=new Blob(["\uFEFF"+i],{type:"text/plain;charset=utf-8"}),f=URL.createObjectURL(y),w=document.createElement("a");w.href=f,w.download=`確定申告書_${s}年度.txt`,document.body.appendChild(w),w.click(),document.body.removeChild(w);const g=window.open("","_blank");g&&(g.document.write(`
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
        <p class="subtitle">${s}年度 | ${a?"青色申告":"白色申告"} | 作成日: ${new Date().toLocaleDateString("ja-JP")}</p>
        <pre>${i}</pre>
        <div class="actions">
            <button class="print-btn" onclick="window.print()">🖨️ 印刷する</button>
            <button class="close-btn" onclick="window.close()">✕ 閉じる</button>
        </div>
    </div>
</body>
</html>
            `),g.document.close()),setTimeout(()=>URL.revokeObjectURL(f),1e3)},Q=()=>e.jsx("div",{className:"mb-8",children:e.jsx("div",{className:"flex items-center justify-between",children:ae.map((i,y)=>e.jsxs(we.Fragment,{children:[e.jsxs("div",{className:"flex flex-col items-center",children:[e.jsx("div",{className:`w-10 h-10 rounded-full flex items-center justify-center transition-all ${u>i.id?"bg-success text-white":u===i.id?"bg-primary text-white":"bg-surface-highlight text-text-muted"}`,children:u>i.id?e.jsx(G,{className:"w-5 h-5"}):e.jsx(i.icon,{className:"w-5 h-5"})}),e.jsx("span",{className:`text-xs mt-2 hidden sm:block ${u>=i.id?"text-text-main font-medium":"text-text-muted"}`,children:i.title})]}),y<ae.length-1&&e.jsx("div",{className:`flex-1 h-1 mx-2 rounded ${u>i.id?"bg-success":"bg-surface-highlight"}`})]},i.id))})}),ee=()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold text-text-main mb-4",children:"確定申告の基本設定"}),e.jsx("p",{className:"text-text-muted mb-6",children:"確定申告を行う年度と申告方法を選択してください。"})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-text-main mb-2",children:"申告年度"}),e.jsx("select",{value:s,onChange:i=>m(Number(i.target.value)),className:"input-base",children:[l,...Array.from({length:4},(i,y)=>l-1-y)].map(i=>e.jsxs("option",{value:i,children:[i,"年度（",i,"年1月〜12月）",i===l&&" ※進行中"]},i))})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-text-main mb-2",children:"申告方法"}),e.jsxs("div",{className:"space-y-3",children:[e.jsxs("label",{className:"flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-surface-highlight transition-colors",children:[e.jsx("input",{type:"radio",checked:a,onChange:()=>t(!0),className:"w-4 h-4 text-primary"}),e.jsxs("div",{className:"ml-3",children:[e.jsx("span",{className:"font-medium text-text-main",children:"青色申告"}),e.jsx("span",{className:"ml-2 text-xs text-success",children:"最大65万円控除"}),e.jsx("p",{className:"text-sm text-text-muted mt-1",children:"複式簿記で最大65万円の控除が受けられます"})]})]}),e.jsxs("label",{className:"flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-surface-highlight transition-colors",children:[e.jsx("input",{type:"radio",checked:!a,onChange:()=>t(!1),className:"w-4 h-4 text-primary"}),e.jsxs("div",{className:"ml-3",children:[e.jsx("span",{className:"font-medium text-text-main",children:"白色申告"}),e.jsx("p",{className:"text-sm text-text-muted mt-1",children:"簡易的な帳簿で申告できます"})]})]})]})]})]}),e.jsxs("div",{className:"bg-info-light border border-info/20 rounded-lg p-4 flex items-start gap-3",children:[e.jsx(Le,{className:"w-5 h-5 text-info flex-shrink-0 mt-0.5"}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-text-main font-medium",children:"青色申告がおすすめ！"}),e.jsx("p",{className:"text-sm text-text-muted mt-1",children:"Ainanceで取引を記録していれば、複式簿記の要件を満たしています。 65万円の控除で税金がお得になります。"})]})]})]}),K=()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold text-text-main mb-4",children:"収支の確認"}),e.jsxs("p",{className:"text-text-muted mb-6",children:[s,"年度の取引データから自動集計した結果です。"]})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4",children:[e.jsxs("div",{className:"bg-success-light border border-success/20 rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-success font-medium",children:"売上高"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:k(c.totalRevenue)})]}),e.jsxs("div",{className:"bg-error-light border border-error/20 rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-error font-medium",children:"経費合計"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:k(c.totalExpenses)})]}),e.jsxs("div",{className:"bg-primary-light border border-primary/20 rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-primary font-medium",children:"事業所得"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:k(c.netIncome)})]})]}),e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-5",children:[e.jsx("h4",{className:"font-medium text-text-main mb-4",children:"経費内訳（上位5件）"}),c.expensesByCategory.length>0?e.jsx("div",{className:"space-y-3",children:c.expensesByCategory.slice(0,5).map((i,y)=>e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"w-8 h-8 bg-surface-highlight rounded-lg flex items-center justify-center text-sm font-medium text-text-muted",children:y+1}),e.jsx("span",{className:"text-text-main",children:i.category})]}),e.jsxs("div",{className:"text-right",children:[e.jsx("span",{className:"font-medium text-text-main",children:k(i.amount)}),e.jsxs("span",{className:"text-text-muted text-sm ml-2",children:["(",ke(i.percentage),")"]})]})]},y))}):e.jsxs("p",{className:"text-text-muted text-center py-4",children:[s,"年度の経費データがありません"]})]}),c.totalRevenue===0&&c.totalExpenses===0&&e.jsxs("div",{className:"bg-warning-light border border-warning/20 rounded-lg p-4 flex items-start gap-3",children:[e.jsx(ge,{className:"w-5 h-5 text-warning flex-shrink-0 mt-0.5"}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-text-main font-medium",children:"取引データがありません"}),e.jsxs("p",{className:"text-sm text-text-muted mt-1",children:[s,"年度の取引を登録してから確定申告を行ってください。",e.jsx(de,{to:"/transactions",className:"text-primary hover:underline ml-1",children:"取引を登録する →"})]})]})]})]}),V=()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold text-text-main mb-4",children:"各種控除の入力"}),e.jsx("p",{className:"text-text-muted mb-6",children:"該当する控除を追加して金額を入力してください。控除が多いほど税金が安くなります。"})]}),e.jsx("div",{className:"space-y-4",children:o.map(i=>e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4",children:[e.jsxs("div",{className:"flex-1",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(pe,{className:"w-5 h-5 text-success"}),e.jsx("span",{className:"font-medium text-text-main",children:i.name})]}),e.jsx("p",{className:"text-sm text-text-muted mt-1 ml-7",children:i.description})]}),e.jsxs("div",{className:"flex items-center gap-3 ml-7 sm:ml-0",children:[e.jsxs("div",{className:"relative",children:[e.jsx("span",{className:"absolute left-3 top-1/2 -translate-y-1/2 text-text-muted",children:"¥"}),e.jsx("input",{type:"number",value:i.amount,onChange:y=>L(i.id,Number(y.target.value)),className:"input-base pl-8 w-40",placeholder:"金額",disabled:i.type==="basic"||i.type==="blue_return"})]}),i.type!=="basic"&&i.type!=="blue_return"&&e.jsx("button",{onClick:()=>P(i.id),className:"p-2 text-error hover:bg-error-light rounded-lg transition-colors",children:e.jsx(Ce,{className:"w-5 h-5"})})]})]},i.id))}),e.jsxs("div",{className:"bg-surface-highlight border border-border rounded-xl p-5",children:[e.jsxs("h4",{className:"font-medium text-text-main mb-4 flex items-center gap-2",children:[e.jsx(xe,{className:"w-5 h-5"}),"控除を追加"]}),e.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-3",children:he.filter(i=>!o.find(y=>y.type===i.type)).map(i=>e.jsxs("button",{onClick:()=>F(i.type),className:"flex items-center gap-3 p-3 bg-surface border border-border rounded-lg hover:border-primary hover:bg-primary-light transition-colors text-left",children:[e.jsx("div",{className:"w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center",children:e.jsx(xe,{className:"w-4 h-4 text-primary"})}),e.jsxs("div",{children:[e.jsx("p",{className:"font-medium text-text-main text-sm",children:i.name}),e.jsx("p",{className:"text-xs text-text-muted",children:i.description})]})]},i.type))})]}),e.jsxs("div",{className:"bg-success-light border border-success/20 rounded-xl p-5 flex items-center justify-between",children:[e.jsx("span",{className:"font-medium text-text-main",children:"控除合計"}),e.jsx("span",{className:"text-2xl font-bold text-success",children:k(c.totalDeductions)})]})]}),q=()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsxs("h3",{className:"text-lg font-semibold text-text-main mb-4 flex items-center gap-2",children:[e.jsx(le,{className:"w-5 h-5 text-primary"}),"AIによる節税アドバイス"]}),e.jsx("p",{className:"text-text-muted mb-6",children:"AIがあなたの収支データを分析し、節税のアドバイスを提供します。"})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-text-muted",children:"課税所得"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:k(c.taxableIncome)}),e.jsx("p",{className:"text-xs text-text-muted mt-2",children:"事業所得 - 各種控除"})]}),e.jsxs("div",{className:"bg-primary-light border border-primary/20 rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-primary font-medium",children:"予想所得税額"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:k(c.estimatedTax)}),e.jsx("p",{className:"text-xs text-text-muted mt-2",children:"※概算です。実際の税額とは異なる場合があります"})]})]}),T.length===0?e.jsx("button",{onClick:H,disabled:A,className:"btn-primary w-full py-4",children:A?e.jsxs(e.Fragment,{children:[e.jsx(Ae,{className:"w-5 h-5 animate-spin"}),"AI分析中..."]}):e.jsxs(e.Fragment,{children:[e.jsx(le,{className:"w-5 h-5"}),"AIアドバイスを受ける"]})}):e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-5 space-y-4",children:[e.jsxs("div",{className:"flex items-center gap-2 text-primary",children:[e.jsx(le,{className:"w-5 h-5"}),e.jsx("span",{className:"font-medium",children:"AIからのアドバイス"})]}),e.jsx("ul",{className:"space-y-3",children:T.map((i,y)=>e.jsxs("li",{className:"flex items-start gap-3",children:[e.jsx($e,{className:"w-5 h-5 text-primary flex-shrink-0 mt-0.5"}),e.jsx("span",{className:"text-text-main",children:i})]},y))}),C>0&&e.jsx("div",{className:"bg-success-light border border-success/20 rounded-lg p-4 mt-4",children:e.jsxs("p",{className:"text-sm text-success font-medium",children:["推定節税可能額: ",k(C)]})})]})]}),M=()=>{const i={fiscalYear:s,filingType:a?"blue":"white",revenue:c.totalRevenue,expenses:c.totalExpenses,netIncome:c.netIncome,expensesByCategory:c.expensesByCategory,deductions:o.filter(g=>g.isApplicable).map(g=>({type:g.type,name:g.name,amount:g.amount})),totalDeductions:c.totalDeductions,taxableIncome:c.taxableIncome,estimatedTax:c.estimatedTax},y=a?_e(i):Me(i),f=a?`青色申告決算書_${s}年度.xtx`:`収支内訳書_${s}年度.xml`;Be(y,f);const w=window.open("","_blank");w&&(w.document.write(`
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
        <h1>📄 ${a?"青色申告決算書":"収支内訳書"}（${s}年度）</h1>
        <div class="info">
            <p>⚠️ <strong>このXMLファイルは参考資料です。</strong></p>
            <p>正式な確定申告は、国税庁の確定申告書等作成コーナーをご利用ください。XMLデータは入力の参考にお使いいただけます。</p>
        </div>
        <pre>${y.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</pre>
        <div class="actions">
            <button class="secondary" onclick="window.close()">✕ 閉じる</button>
        </div>
    </div>
</body>
</html>
            `),w.document.close())},Y=()=>{const[i,y]=U.useState(null),f=async(w,g)=>{try{await navigator.clipboard.writeText(String(w).replace(/[¥,]/g,"")),y(g),setTimeout(()=>y(null),2e3)}catch(R){console.error("コピーに失敗しました:",R)}};return e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsxs("h3",{className:"text-lg font-semibold text-text-main mb-4 flex items-center gap-2",children:[e.jsx(W,{className:"w-5 h-5 text-primary"}),"確定申告書の作成"]}),e.jsx("p",{className:"text-text-muted mb-2",children:"入力内容を確認して、書類を作成してください。"}),e.jsx("p",{className:"text-xs text-text-muted",children:"💡 各項目の右側のコピーボタンで、e-Tax入力時にそのまま貼り付けできます"})]}),e.jsxs("div",{className:"bg-surface border border-border rounded-xl divide-y divide-border",children:[e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"申告年度"}),e.jsx("div",{className:"flex items-center gap-2",children:e.jsxs("span",{className:"font-medium text-text-main",children:[s,"年度"]})})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"申告方法"}),e.jsx("span",{className:"font-medium text-text-main",children:a?"青色申告":"白色申告"})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"売上高"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-success",children:k(c.totalRevenue)}),e.jsx("button",{onClick:()=>f(c.totalRevenue,"revenue"),className:`p-1.5 rounded transition-colors ${i==="revenue"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:i==="revenue"?e.jsx(G,{className:"w-4 h-4"}):e.jsx(X,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"経費合計"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-error",children:k(c.totalExpenses)}),e.jsx("button",{onClick:()=>f(c.totalExpenses,"expenses"),className:`p-1.5 rounded transition-colors ${i==="expenses"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:i==="expenses"?e.jsx(G,{className:"w-4 h-4"}):e.jsx(X,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"事業所得"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-text-main",children:k(c.netIncome)}),e.jsx("button",{onClick:()=>f(c.netIncome,"netIncome"),className:`p-1.5 rounded transition-colors ${i==="netIncome"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:i==="netIncome"?e.jsx(G,{className:"w-4 h-4"}):e.jsx(X,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"控除合計"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-primary",children:k(c.totalDeductions)}),e.jsx("button",{onClick:()=>f(c.totalDeductions,"deductions"),className:`p-1.5 rounded transition-colors ${i==="deductions"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:i==="deductions"?e.jsx(G,{className:"w-4 h-4"}):e.jsx(X,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"課税所得"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-text-main",children:k(c.taxableIncome)}),e.jsx("button",{onClick:()=>f(c.taxableIncome,"taxableIncome"),className:`p-1.5 rounded transition-colors ${i==="taxableIncome"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:i==="taxableIncome"?e.jsx(G,{className:"w-4 h-4"}):e.jsx(X,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center bg-primary-light",children:[e.jsx("span",{className:"font-medium text-text-main",children:"予想所得税額"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-bold text-primary text-lg",children:k(c.estimatedTax)}),e.jsx("button",{onClick:()=>f(c.estimatedTax,"tax"),className:`p-1.5 rounded transition-colors ${i==="tax"?"bg-success text-white":"hover:bg-primary/20 text-primary"}`,title:"コピー",children:i==="tax"?e.jsx(G,{className:"w-4 h-4"}):e.jsx(X,{className:"w-4 h-4"})})]})]})]}),e.jsxs("div",{className:"space-y-4",children:[e.jsx("h4",{className:"text-md font-medium text-text-main",children:"📥 ダウンロード"}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-4",children:[e.jsxs("button",{onClick:Z,className:"btn-primary py-4 flex items-center justify-center gap-2",children:[e.jsx(fe,{className:"w-5 h-5"}),"申告書プレビュー"]}),e.jsxs("button",{onClick:M,className:"btn-outline py-4 flex items-center justify-center gap-2 border-2 border-blue-500 text-blue-500 hover:bg-blue-500/10",children:[e.jsx(Ee,{className:"w-5 h-5"}),"e-Tax用XMLファイル"]})]}),e.jsxs("div",{className:"bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4",children:[e.jsx("h5",{className:"text-sm font-medium text-text-main mb-3 flex items-center gap-2",children:"✨ 日本語PDF自動生成（NEW!）"}),e.jsx("p",{className:"text-xs text-text-muted mb-3",children:(d==null?void 0:d.business_type)==="corporation"?"法人税申告書・決算報告書（損益計算書+貸借対照表）を日本語PDFで生成":"確定申告書B・青色申告決算書を日本語PDFで生成します"}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-3",children:[(d==null?void 0:d.business_type)!=="corporation"&&e.jsxs(e.Fragment,{children:[e.jsxs("button",{onClick:async()=>{var w,g;try{const R={revenue:c.totalRevenue,expenses:c.totalExpenses,netIncome:c.netIncome,expensesByCategory:c.expensesByCategory,deductions:{basic:((w=o.find(_=>_.type==="basic"))==null?void 0:w.amount)||48e4,blueReturn:a?65e4:0,socialInsurance:(g=o.find(_=>_.type==="socialInsurance"))==null?void 0:g.amount},taxableIncome:c.taxableIncome,estimatedTax:c.estimatedTax,fiscalYear:s,isBlueReturn:a},te=await Oe(R),B=`確定申告書B_${s}年度.pdf`;se(te,B),ne(te)}catch(R){console.error("PDF生成エラー:",R),alert("PDF生成に失敗しました。フォントファイルを確認してください。")}},className:"px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium flex items-center justify-center gap-2",children:[e.jsx(W,{className:"w-4 h-4"}),"確定申告書B"]}),a&&e.jsxs("button",{onClick:async()=>{try{const w={revenue:c.totalRevenue,expenses:c.totalExpenses,netIncome:c.netIncome,expensesByCategory:c.expensesByCategory,deductions:{blueReturn:65e4},taxableIncome:c.taxableIncome,estimatedTax:c.estimatedTax,fiscalYear:s,isBlueReturn:!0},g=await Ge(w),R=`青色申告決算書_${s}年度.pdf`;se(g,R),ne(g)}catch(w){console.error("PDF生成エラー:",w),alert("PDF生成に失敗しました。フォントファイルを確認してください。")}},className:"px-4 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium flex items-center justify-center gap-2",children:[e.jsx(W,{className:"w-4 h-4"}),"青色申告決算書"]})]}),(d==null?void 0:d.business_type)==="corporation"&&e.jsxs(e.Fragment,{children:[e.jsxs("button",{onClick:async()=>{try{const w={revenue:c.totalRevenue,expenses:c.totalExpenses,netIncome:c.netIncome,expensesByCategory:c.expensesByCategory,taxableIncome:c.taxableIncome,estimatedTax:c.estimatedTax,fiscalYear:s,businessType:"corporation",companyName:(d==null?void 0:d.company_name)||"会社名",representativeName:(d==null?void 0:d.representative_name)||"",address:(d==null?void 0:d.address)||""},g=await He(w),R=`法人税申告書_${s}年度.pdf`;se(g,R),ne(g)}catch(w){console.error("PDF生成エラー:",w),alert("PDF生成に失敗しました。フォントファイルを確認してください。")}},className:"px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium flex items-center justify-center gap-2",children:[e.jsx(W,{className:"w-4 h-4"}),"法人税申告書"]}),e.jsxs("button",{onClick:async()=>{try{const w={revenue:c.totalRevenue,expenses:c.totalExpenses,netIncome:c.netIncome,expensesByCategory:c.expensesByCategory,taxableIncome:c.taxableIncome,estimatedTax:c.estimatedTax,fiscalYear:s,businessType:"corporation",companyName:(d==null?void 0:d.company_name)||"会社名",representativeName:(d==null?void 0:d.representative_name)||"",capital:1e6},g=await Ye(w),R=`決算報告書_${s}年度.pdf`;se(g,R),ne(g)}catch(w){console.error("PDF生成エラー:",w),alert("PDF生成に失敗しました。フォントファイルを確認してください。")}},className:"px-4 py-3 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors text-sm font-medium flex items-center justify-center gap-2",children:[e.jsx(W,{className:"w-4 h-4"}),"決算報告書"]})]})]})]})]}),e.jsxs("div",{className:"bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-xl p-5",children:[e.jsxs("h4",{className:"text-md font-medium text-text-main mb-3 flex items-center gap-2",children:[e.jsx(me,{className:"w-5 h-5 text-blue-500"}),"e-Taxで直接申告する"]}),e.jsxs("ol",{className:"text-sm text-text-muted space-y-2 mb-4",children:[e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx("span",{className:"flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs",children:"1"}),"上のコピーボタンで各数値をコピー"]}),e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx("span",{className:"flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs",children:"2"}),"確定申告書等作成コーナーにアクセス"]}),e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx("span",{className:"flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs",children:"3"}),"コピーした数値を貼り付けて入力"]}),e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx("span",{className:"flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs",children:"4"}),"マイナンバーカードで電子署名 → 送信完了！"]})]}),e.jsxs("a",{href:"https://www.keisan.nta.go.jp/kyoutu/ky/smsp/top",target:"_blank",rel:"noopener noreferrer",className:"inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm",children:[e.jsx(me,{className:"w-4 h-4"}),"確定申告書等作成コーナーを開く"]}),e.jsx(de,{to:"/tax-filing-guide",className:"inline-flex items-center gap-2 px-4 py-2 ml-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm",children:"📖 詳しい申告ガイドを見る"})]}),e.jsxs("div",{className:"bg-warning-light border border-warning/20 rounded-lg p-4 flex items-start gap-3",children:[e.jsx(ge,{className:"w-5 h-5 text-warning flex-shrink-0 mt-0.5"}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-text-main font-medium",children:"ご注意ください"}),e.jsxs("ul",{className:"text-sm text-text-muted mt-2 space-y-1 list-disc list-inside",children:[e.jsx("li",{children:"この計算は概算です。正確な税額は税務署にご確認ください"}),e.jsx("li",{children:"確定申告の期限は翌年3月15日です（例：2025年度分は2026年3月15日まで）"}),e.jsx("li",{children:"青色申告特別控除65万円の適用には電子申告が必要です"})]})]})]})]})},ce=()=>{switch(u){case 1:return e.jsx(ee,{});case 2:return e.jsx(K,{});case 3:return e.jsx(V,{});case 4:return e.jsx(q,{});case 5:return e.jsx(Y,{});default:return null}};return e.jsx("div",{className:"min-h-screen bg-background",children:e.jsxs("div",{className:"max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8",children:[e.jsxs("div",{className:"mb-8",children:[e.jsxs(de,{to:"/dashboard",className:"flex items-center text-primary hover:text-primary-hover mb-4",children:[e.jsx(ue,{className:"h-5 w-5 mr-2"}),"ダッシュボードに戻る"]}),e.jsx("h1",{className:"text-3xl font-bold text-text-main mb-2",children:"確定申告サポート"}),e.jsx("p",{className:"text-text-muted",children:"5つのステップで簡単に確定申告を完了できます"})]}),e.jsx(Q,{}),e.jsx("div",{className:"bg-surface border border-border rounded-xl p-6 mb-6",children:ce()}),e.jsxs("div",{className:"flex justify-between",children:[e.jsxs("button",{onClick:z,disabled:u===1,className:`btn-ghost ${u===1?"opacity-50 cursor-not-allowed":""}`,children:[e.jsx(ue,{className:"w-5 h-5"}),"戻る"]}),u<ae.length?e.jsxs("button",{onClick:E,className:"btn-primary",children:["次へ",e.jsx(Re,{className:"w-5 h-5"})]}):e.jsxs("button",{onClick:Z,className:"btn-success",children:[e.jsx(pe,{className:"w-5 h-5"}),"完了"]})]})]})})};export{at as default};
