import{c as be,a as ye,b as Ne,d as ve,r as U,j as e,L as de,F as W,P as xe,S as re,R as we,g as J,t as $e,T as Ce}from"./index-CcHLLxJz.js";import{g as Ie,c as ke,f as k,E as me,A as he,a as ze,b as Te}from"./TaxFilingService-DSr6EupS.js";import{P as le,r as x,f as Se}from"./fontkit.es-CGEnoF_r.js";import{A as ue}from"./arrow-left-C-Wb4jFX.js";import{C as De}from"./calculator-CBUkG7Cb.js";import{D as fe}from"./download-BR1n4Plg.js";import{A as Re}from"./arrow-right-6MioNp_-.js";import{C as pe}from"./circle-check-big-BvidIMhZ.js";import{C as G}from"./copy-CEkoh_jj.js";import{C as ge}from"./circle-alert-FSOuOC9o.js";import{R as Fe}from"./refresh-cw-DZOE5pUV.js";/**
 * @license lucide-react v0.540.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ae=[["path",{d:"M10 12.5 8 15l2 2.5",key:"1tg20x"}],["path",{d:"m14 12.5 2 2.5-2 2.5",key:"yinavb"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z",key:"1mlx9k"}]],Ee=be("file-code",Ae);/**
 * @license lucide-react v0.540.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Pe=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 16v-4",key:"1dtifu"}],["path",{d:"M12 8h.01",key:"e9boi3"}]],Le=be("info",Pe);function Me(a){const c=new Date,b=c.toISOString().replace(/[-:]/g,"").split(".")[0],h={売上高:"AA100",仕入高:"AB100",消耗品費:"AC100",旅費交通費:"AC110",通信費:"AC120",広告宣伝費:"AC130",接待交際費:"AC140",水道光熱費:"AC150",地代家賃:"AC160",外注費:"AC170",減価償却費:"AC180",雑費:"AC190"},n=a.expensesByCategory.map((N,l)=>{const s=h[N.category]||`AC${200+l}`;return`    <${s}>${N.amount}</${s}>`}).join(`
`);return`<?xml version="1.0" encoding="UTF-8"?>
<!--
  Ainance e-Tax Export File
  生成日時: ${c.toLocaleString("ja-JP")}
  対象年度: ${a.fiscalYear}年度
  申告区分: ${a.filingType==="blue"?"青色申告":"白色申告"}
-->
<申告書等送信票等>
  <作成日時>${b}</作成日時>
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
${n}
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
${a.deductions.map(N=>`      <${N.type}>${N.amount}</${N.type}>`).join(`
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
</申告書等送信票等>`}function _e(a){return`<?xml version="1.0" encoding="UTF-8"?>
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
${a.expensesByCategory.map(h=>`    <${h.category.replace(/\s/g,"")}>${h.amount}</${h.category.replace(/\s/g,"")}>`).join(`
`)}
    <経費合計>${a.expenses}</経費合計>
  </必要経費>
  
  <差引金額>${a.netIncome}</差引金額>
</収支内訳書>`}function Be(a,c){const b=new Blob(["\uFEFF"+a],{type:"application/xml;charset=utf-8"}),h=URL.createObjectURL(b),n=document.createElement("a");n.href=h,n.download=c,document.body.appendChild(n),n.click(),document.body.removeChild(n),setTimeout(()=>URL.revokeObjectURL(h),1e3)}function se(a,c){const b=new Blob([new Uint8Array(a)],{type:"application/pdf"}),h=URL.createObjectURL(b),n=document.createElement("a");n.href=h,n.download=c,document.body.appendChild(n),n.click(),document.body.removeChild(n),setTimeout(()=>URL.revokeObjectURL(h),1e3)}function ae(a){const c=new Blob([new Uint8Array(a)],{type:"application/pdf"}),b=URL.createObjectURL(c);window.open(b,"_blank")}const Ue={交通費:"旅費交通費",旅費交通費:"旅費交通費",通信費:"通信費",水道光熱費:"水道光熱費",消耗品費:"消耗品費",接待交際費:"接待交際費",広告宣伝費:"広告宣伝費",地代家賃:"地代家賃",外注費:"外注工賃",給与:"給料賃金",雑費:"雑費",減価償却費:"減価償却費",修繕費:"修繕費",保険料:"損害保険料",福利厚生費:"福利厚生費",支払利息:"支払利息",租税公課:"租税公課",荷造運賃:"荷造運賃",その他:"雑費",未分類:"雑費","Travel & Transportation":"旅費交通費",Communication:"通信費",Utilities:"水道光熱費",Supplies:"消耗品費",Entertainment:"接待交際費",Advertising:"広告宣伝費",Rent:"地代家賃",Outsourcing:"外注工賃",Salaries:"給料賃金",Miscellaneous:"雑費",Depreciation:"減価償却費",Repairs:"修繕費",Insurance:"損害保険料",Benefits:"福利厚生費",Interest:"支払利息","Taxes & Dues":"租税公課",Shipping:"荷造運賃",Other:"雑費",Uncategorized:"雑費"};async function ie(a){a.registerFontkit(Se);try{const c=await fetch("/fonts/NotoSansCJKjp-Regular.otf").then(F=>F.arrayBuffer()),b=await fetch("/fonts/NotoSansCJKjp-Bold.otf").then(F=>F.arrayBuffer()),h=await a.embedFont(c),n=await a.embedFont(b);return{regular:h,bold:n}}catch(c){throw console.error("日本語フォントのロードに失敗:",c),new Error("日本語フォントのロードに失敗しました。public/fonts/にフォントファイルを配置してください。")}}function j(a){return a===0?"0":a.toLocaleString("ja-JP")}function oe(a){return`令和${a-2018}年`}async function Ye(a){const c=await le.create(),b=c.addPage([595.28,841.89]),{regular:h,bold:n}=await ie(c),{width:F,height:N}=b.getSize(),l={primary:x(.4,.2,.6),text:x(.1,.1,.1),muted:x(.4,.4,.4),line:x(.7,.7,.7),highlight:x(.95,.95,1),red:x(.8,.2,.2)},s=(z,A,L,M={})=>{b.drawText(z,{x:A,y:L,size:M.size||10,font:M.font||h,color:M.color||l.text})},d=(z,A,L,M,Y=.5)=>{b.drawLine({start:{x:z,y:A},end:{x:L,y:M},thickness:Y,color:l.line})},u=(z,A,L,M,Y)=>{b.drawRectangle({x:z,y:A,width:L,height:M,color:Y})};u(0,N-60,F,60,l.primary),s("法人税申告書",50,N-40,{size:18,font:n,color:x(1,1,1)}),s("（参考資料）",180,N-40,{size:12,font:h,color:x(.9,.9,.9)});let t=N-85;s(`会社名: ${a.companyName||"―"}`,50,t,{size:12,font:n}),t-=20,s(`事業年度: ${a.fiscalYear}年度（${oe(a.fiscalYear)}度）`,50,t,{size:10}),s(`作成日: ${new Date().toLocaleDateString("ja-JP")}`,400,t,{size:9,color:l.muted}),t-=30,d(50,t,545,t,1),t-=25,s("第1部　法人情報",50,t,{size:12,font:n,color:l.primary}),t-=25,[["会社名（商号）",a.companyName||"―"],["代表者氏名",a.representativeName||"―"],["法人番号",a.corporateNumber||"―"],["本店所在地",a.address||"―"],["資本金",a.capital?`${j(a.capital)}円`:"―"]].forEach(([z,A])=>{d(50,t-5,545,t-5),s(z,60,t),s(A,200,t),t-=20}),t-=15,s("第2部　損益の計算",50,t,{size:12,font:n,color:l.primary}),t-=25,u(50,t-5,495,20,l.highlight),d(50,t-5,545,t-5),s("売上高",60,t),s(`${j(a.revenue)}円`,450,t),t-=20,d(50,t-5,545,t-5),s("売上原価・経費合計",60,t),s(`${j(a.expenses)}円`,450,t),t-=20,u(50,t-5,495,20,x(.95,1,.95)),d(50,t-5,545,t-5),s("当期純利益",60,t,{font:n}),s(`${j(a.netIncome)}円`,450,t,{font:n}),t-=35,s("第3部　税額の計算",50,t,{size:12,font:n,color:l.primary}),t-=25;const v=a.taxableIncome,T=v<=8e6?.15:.232,S=Math.floor(v*T),C=Math.floor(S*.103),D=Math.floor(v*.07),o=S+C+D;return[["課税所得金額",`${j(v)}円`],[`法人税額（税率${(T*100).toFixed(1)}%）`,`${j(S)}円`],["地方法人税（10.3%）",`${j(C)}円`],["事業税（概算7%）",`${j(D)}円`]].forEach(([z,A])=>{d(50,t-5,545,t-5),s(z,60,t),s(A,450,t),t-=20}),u(50,t-8,495,28,x(1,.95,.95)),d(50,t-8,545,t-8,1),d(50,t+20,545,t+20,1),s("税額合計（概算）",60,t+3,{font:n}),s(`${j(o)}円`,450,t+3,{font:n,color:l.red}),d(50,60,545,60),s("※ この書類はAinanceで作成した参考資料です。",50,45,{size:8,color:l.muted}),s("※ 正式な申告には税理士への相談またはe-Taxをご利用ください。",50,33,{size:8,color:l.muted}),c.save()}async function He(a){const c=await le.create(),b=c.addPage([595.28,841.89]),{regular:h,bold:n}=await ie(c),{width:F,height:N}=b.getSize(),l={primary:x(.3,.2,.5),secondary:x(.2,.35,.55),text:x(.1,.1,.1),muted:x(.45,.45,.45),line:x(.6,.6,.6),headerBg:x(.92,.92,.96),highlight:x(.94,.96,1),green:x(.15,.55,.25),red:x(.75,.2,.2),lightGreen:x(.88,.96,.88),lightBlue:x(.88,.93,1)},s=16,d=20,u=22,t={text:(m,p,$,I={})=>{b.drawText(m,{x:p,y:$,size:I.size||9,font:I.font||h,color:I.color||l.text})},line:(m,p,$,I,X=.5)=>{b.drawLine({start:{x:m,y:p},end:{x:$,y:I},thickness:X,color:l.line})},rect:(m,p,$,I,X)=>{b.drawRectangle({x:m,y:p,width:$,height:I,color:X})}};t.rect(0,N-55,F,55,l.primary),t.text("決 算 報 告 書",210,N-35,{size:22,font:n,color:x(1,1,1)}),t.text("（財務三表）",360,N-35,{size:14,color:x(.85,.85,.9)});let i=N-72;t.text(`${a.companyName||"会社名"}`,50,i,{size:12,font:n}),t.text(`${a.fiscalYear}年度（${oe(a.fiscalYear)}度）`,280,i,{size:10}),t.text(`作成日: ${new Date().toLocaleDateString("ja-JP")}`,450,i,{size:9,color:l.muted}),i-=18,t.line(40,i,555,i,1.5),i-=12;const v=a.revenue-a.expenses,T=a.revenue-Math.floor(a.expenses*.4),S=v+Math.floor(a.revenue*.01)-Math.floor(a.expenses*.02),C=Math.floor(a.revenue*.2),D=Math.floor(a.revenue*.15),o=Math.floor(a.revenue*.1),E=Math.floor(a.revenue*.2),z=C+D+o+E,A=Math.floor(a.expenses*.2),L=Math.floor(a.expenses*.15),M=A+L,Y=a.capital||1e6,Z=z-M-Y,Q=Math.floor(a.expenses*.1),ee=a.netIncome+Q,K=-Math.floor(a.revenue*.05),V=-Math.floor(L*.1),q=ee+K+V,_=40,H=250,ce=i;t.rect(_,i-u,H,u,l.secondary),t.text("損益計算書（P/L）",_+70,i-15,{size:11,font:n,color:x(1,1,1)}),i-=u+4,[{label:"売上高",value:a.revenue,isHighlight:!0},{label:"売上原価",value:Math.floor(a.expenses*.4)},{label:"売上総利益",value:T,isSubtotal:!0},{label:"販売費及び一般管理費",value:Math.floor(a.expenses*.6)},{label:"営業利益",value:v,isSubtotal:!0,color:v>=0?l.green:l.red},{label:"営業外収益",value:Math.floor(a.revenue*.01)},{label:"営業外費用",value:Math.floor(a.expenses*.02)},{label:"経常利益",value:S,isSubtotal:!0},{label:"当期純利益",value:a.netIncome,isTotal:!0,color:a.netIncome>=0?l.green:l.red}].forEach(m=>{const p=m.isTotal?s+4:s;m.isTotal?t.rect(_,i-p,H,p,l.lightGreen):m.isSubtotal?t.rect(_,i-p,H,p,l.headerBg):m.isHighlight&&t.rect(_,i-p,H,p,l.highlight),t.line(_,i-p,_+H,i-p),t.text(m.label,_+8,i-p+5,{size:m.isTotal?10:9,font:m.isSubtotal||m.isTotal?n:h}),t.text(`${j(m.value)}`,_+H-60,i-p+5,{size:m.isTotal?10:9,font:m.isSubtotal||m.isTotal?n:h,color:m.color||l.text}),i-=p});const y=i;i=ce;const f=305,w=250,g=122;t.rect(f,i-u,w,u,l.secondary),t.text("貸借対照表（B/S）",f+70,i-15,{size:11,font:n,color:x(1,1,1)}),i-=u+4,t.rect(f,i-d,g,d,x(.85,.9,.95)),t.text("資産の部",f+35,i-14,{size:10,font:n}),t.rect(f+g+6,i-d,g,d,x(.95,.9,.88)),t.text("負債・純資産の部",f+g+15,i-14,{size:10,font:n}),i-=d+2;const R=[{label:"流動資産",isSection:!0},{label:"　現金預金",value:C},{label:"　売掛金",value:D},{label:"　棚卸資産",value:o},{label:"固定資産",isSection:!0},{label:"　有形固定資産",value:E},{label:"資産合計",value:z,isTotal:!0}],te=[{label:"流動負債",isSection:!0},{label:"　買掛金",value:A},{label:"　短期借入金",value:L},{label:"純資産の部",isSection:!0},{label:"　資本金",value:Y},{label:"　利益剰余金",value:Z},{label:"負債純資産合計",value:z,isTotal:!0}];let B=i,P=i;R.forEach(m=>{const p=m.isTotal?s+2:s-1;m.isTotal?t.rect(f,B-p,g,p,l.lightGreen):m.isSection&&t.rect(f,B-p,g,p,l.highlight),t.line(f,B-p,f+g,B-p),t.text(m.label,f+4,B-p+4,{size:8,font:m.isSection||m.isTotal?n:h}),m.value!==void 0&&t.text(j(m.value),f+g-45,B-p+4,{size:8,font:m.isTotal?n:h}),B-=p}),te.forEach(m=>{const p=m.isTotal?s+2:s-1,$=f+g+6;m.isTotal?t.rect($,P-p,g,p,l.lightGreen):m.isSection&&t.rect($,P-p,g,p,l.highlight),t.line($,P-p,$+g,P-p),t.text(m.label,$+4,P-p+4,{size:8,font:m.isSection||m.isTotal?n:h}),m.value!==void 0&&t.text(j(m.value),$+g-48,P-p+4,{size:8,font:m.isTotal?n:h}),P-=p}),i=Math.min(y,B,P)-20,t.rect(40,i-u,F-80,u,l.secondary),t.text("キャッシュ・フロー計算書（C/F）",200,i-15,{size:11,font:n,color:x(1,1,1)}),i-=u+6;const O=165,je=10;return[{title:"営業活動によるCF",items:[{label:"税引前当期純利益",value:a.netIncome},{label:"減価償却費",value:Q},{label:"売上債権の増減",value:-Math.floor(D*.1)},{label:"仕入債務の増減",value:Math.floor(A*.1)}],total:ee},{title:"投資活動によるCF",items:[{label:"固定資産の取得",value:K},{label:"投資有価証券の取得",value:0}],total:K},{title:"財務活動によるCF",items:[{label:"借入金の返済",value:V},{label:"配当金の支払",value:0}],total:V}].forEach((m,p)=>{const $=40+p*(O+je);let I=i;t.rect($,I-d,O,d,l.headerBg),t.line($,I-d,$+O,I-d),t.text(m.title,$+25,I-14,{size:9,font:n}),I-=d+2,m.items.forEach(X=>{t.line($,I-s,$+O,I-s),t.text(X.label,$+6,I-s+5,{size:8}),t.text(j(X.value),$+O-50,I-s+5,{size:8}),I-=s}),t.rect($,I-s-2,O,s+2,l.lightBlue),t.line($,I-s-2,$+O,I-s-2,1),t.text("小計",$+6,I-s+3,{size:9,font:n}),t.text(j(m.total),$+O-50,I-s+3,{size:9,font:n,color:m.total>=0?l.green:l.red})}),i=i-(d+s*4+s+2+15),t.rect(40,i-d,F-80,d,l.lightGreen),t.line(40,i-d,555,i-d,1.5),t.line(40,i,555,i,1.5),t.text("現金及び現金同等物の増減額",50,i-14,{size:11,font:n}),t.text(`${j(q)}円`,440,i-14,{size:11,font:n,color:q>=0?l.green:l.red}),i-=d+5,t.line(40,i-s,555,i-s),t.text("現金及び現金同等物の期末残高",50,i-s+5,{size:10}),t.text(`${j(C+q)}円`,440,i-s+5,{size:10,font:n}),t.line(40,70,555,70),t.text("※ この決算報告書はAinanceで作成した参考資料です。",45,55,{size:8,color:l.muted}),t.text("※ 貸借対照表・キャッシュフロー計算書は売上・経費データからの概算です。正確な作成には税理士へご相談ください。",45,43,{size:8,color:l.muted}),c.save()}async function Oe(a){var v,T,S;const c=await le.create(),b=c.addPage([595.28,841.89]),{regular:h,bold:n}=await ie(c),{width:F,height:N}=b.getSize(),l={primary:x(.2,.4,.8),text:x(.1,.1,.1),muted:x(.4,.4,.4),line:x(.5,.5,.5),highlight:x(.95,.95,1),red:x(.8,.2,.2)},s=(C,D,o,E={})=>{b.drawText(C,{x:D,y:o,size:E.size||10,font:E.font||h,color:E.color||l.text})},d=(C,D,o,E,z=.5)=>{b.drawLine({start:{x:C,y:D},end:{x:o,y:E},thickness:z,color:l.line})},u=(C,D,o,E,z)=>{b.drawRectangle({x:C,y:D,width:o,height:E,color:z})};u(0,N-60,F,60,l.primary),s("確 定 申 告 書 B",200,N-40,{size:20,font:n,color:x(1,1,1)});let t=N-85;s(`${oe(a.fiscalYear)}分の所得税及び復興特別所得税の申告書`,50,t,{size:11,font:n}),s(`作成日: ${new Date().toLocaleDateString("ja-JP")}`,400,t,{size:9,color:l.muted}),t-=30,d(50,t,545,t,1),t-=25,s("第1部　収入金額等",50,t,{size:12,font:n,color:l.primary}),t-=25,u(50,t-5,495,20,l.highlight),d(50,t-5,545,t-5),s("事業所得（営業等）　ア",60,t),s(`${j(a.revenue)}円`,450,t),t-=30,s("第2部　所得金額等",50,t,{size:12,font:n,color:l.primary}),t-=25,d(50,t-5,545,t-5),s("事業所得　①",60,t),s(`${j(a.netIncome)}円`,450,t),t-=20,u(50,t-5,495,20,l.highlight),d(50,t-5,545,t-5),s("合計（総所得金額）　⑫",60,t,{font:n}),s(`${j(a.netIncome)}円`,450,t,{font:n}),t-=35,s("第3部　所得から差し引かれる金額",50,t,{size:12,font:n,color:l.primary}),t-=25;let i=0;return(v=a.deductions)!=null&&v.basic&&(d(50,t-5,545,t-5),s("基礎控除　㉔",60,t),s(`${j(a.deductions.basic)}円`,450,t),i+=a.deductions.basic,t-=20),(T=a.deductions)!=null&&T.blueReturn&&(d(50,t-5,545,t-5),s("青色申告特別控除",60,t),s(`${j(a.deductions.blueReturn)}円`,450,t),i+=a.deductions.blueReturn,t-=20),(S=a.deductions)!=null&&S.socialInsurance&&(d(50,t-5,545,t-5),s("社会保険料控除　⑬",60,t),s(`${j(a.deductions.socialInsurance)}円`,450,t),i+=a.deductions.socialInsurance,t-=20),u(50,t-5,495,20,l.highlight),d(50,t-5,545,t-5),s("所得控除合計　㉕",60,t,{font:n}),s(`${j(i)}円`,450,t,{font:n}),t-=35,s("第4部　税額の計算",50,t,{size:12,font:n,color:l.primary}),t-=25,d(50,t-5,545,t-5),s("課税される所得金額　㉖",60,t),s(`${j(a.taxableIncome)}円`,450,t),t-=25,u(50,t-8,495,28,x(1,.95,.95)),d(50,t-8,545,t-8,1),d(50,t+20,545,t+20,1),s("所得税額（概算）　㉗",60,t+3,{font:n,size:11}),s(`${j(a.estimatedTax)}円`,440,t+3,{font:n,size:11,color:l.red}),d(50,60,545,60),s("※ この書類はAinanceで作成した参考資料です。",50,45,{size:8,color:l.muted}),s("※ 正式な申告には国税庁「確定申告書等作成コーナー」をご利用ください。",50,33,{size:8,color:l.muted}),c.save()}async function Je(a){var i;const c=await le.create(),b=c.addPage([595.28,841.89]),{regular:h,bold:n}=await ie(c),{width:F,height:N}=b.getSize(),l={primary:x(.2,.4,.8),text:x(.1,.1,.1),muted:x(.4,.4,.4),line:x(.5,.5,.5),highlight:x(.95,.95,1),green:x(.2,.6,.3)},s=(v,T,S,C={})=>{b.drawText(v,{x:T,y:S,size:C.size||10,font:C.font||h,color:C.color||l.text})},d=(v,T,S,C,D=.5)=>{b.drawLine({start:{x:v,y:T},end:{x:S,y:C},thickness:D,color:l.line})},u=(v,T,S,C,D)=>{b.drawRectangle({x:v,y:T,width:S,height:C,color:D})};u(0,N-60,F,60,l.primary),s("青色申告決算書",200,N-40,{size:20,font:n,color:x(1,1,1)}),s("（一般用）",340,N-40,{size:12,color:x(.9,.9,.9)});let t=N-85;if(s(`${oe(a.fiscalYear)}分　所得税青色申告決算書`,50,t,{size:11,font:n}),a.tradeName&&s(`屋号: ${a.tradeName}`,350,t,{size:10}),s(`作成日: ${new Date().toLocaleDateString("ja-JP")}`,450,t,{size:9,color:l.muted}),t-=30,d(50,t,545,t,1),t-=25,s("損益計算書",50,t,{size:12,font:n,color:l.primary}),t-=20,u(50,t-5,495,20,l.highlight),d(50,t-5,545,t-5),s("売上（収入）金額　①",60,t,{font:n}),s(`${j(a.revenue)}円`,450,t,{font:n}),t-=30,s("経費",50,t,{size:11,font:n}),t-=20,u(50,t-15,495,15,x(.9,.9,.9)),d(50,t,545,t),d(50,t-15,545,t-15),s("勘定科目",60,t-11,{font:n,size:9}),s("金額",470,t-11,{font:n,size:9}),t-=18,a.expensesByCategory.forEach((v,T)=>{const S=Ue[v.category]||v.category||"雑費";T%2===0&&u(50,t-15,495,15,x(.98,.98,.98)),d(50,t-15,545,t-15),s(S,60,t-11,{size:9}),s(j(v.amount),450,t-11,{size:9}),t-=15,t<200}),u(50,t-18,495,18,x(.95,.95,.95)),d(50,t-18,545,t-18),s("経費合計　㉑",60,t-13,{font:n}),s(`${j(a.expenses)}円`,445,t-13,{font:n}),t-=30,d(50,t-5,545,t-5),s("差引金額　① - ㉑",60,t),s(`${j(a.netIncome)}円`,450,t),t-=25,(i=a.deductions)!=null&&i.blueReturn){d(50,t-5,545,t-5),s("青色申告特別控除額",60,t),s(`${j(a.deductions.blueReturn)}円`,450,t),t-=25;const v=Math.max(0,a.netIncome-a.deductions.blueReturn);u(50,t-8,495,25,x(.95,1,.95)),d(50,t-8,545,t-8,1),d(50,t+17,545,t+17,1),s("所得金額　㊸",60,t+2,{font:n,size:11}),s(`${j(v)}円`,440,t+2,{font:n,size:11,color:l.green})}return d(50,60,545,60),s("※ この書類はAinanceで作成した参考資料です。",50,45,{size:8,color:l.muted}),s("※ 正式な申告には国税庁「確定申告書等作成コーナー」をご利用ください。",50,33,{size:8,color:l.muted}),c.save()}const ne=[{id:1,title:"基本情報",icon:W,description:"確定申告の基本設定"},{id:2,title:"収支確認",icon:De,description:"売上・経費の確認"},{id:3,title:"控除入力",icon:xe,description:"各種控除の入力"},{id:4,title:"AI診断",icon:re,description:"AIによる節税アドバイス"},{id:5,title:"申告書作成",icon:fe,description:"PDFダウンロード"}],nt=()=>{const{user:a}=ye(),{currentBusinessType:c}=Ne(),{transactions:b}=ve(a==null?void 0:a.id,c==null?void 0:c.business_type),[h,n]=U.useState(1),[F,N]=U.useState(!1),l=new Date().getFullYear(),[s,d]=U.useState(l-1),[u,t]=U.useState(!0),[i,v]=U.useState([]),[T,S]=U.useState([]),[C,D]=U.useState(0);U.useEffect(()=>{v(Ie(u))},[u]);const o=U.useMemo(()=>ke(b,s,(c==null?void 0:c.business_type)||"individual",i),[b,s,c,i]),E=()=>{h<ne.length&&n(h+1)},z=()=>{h>1&&n(h-1)},A=r=>{const y=he.find(f=>f.type===r);y&&!i.find(f=>f.type===r)&&v([...i,{id:Date.now().toString(),...y,amount:0,isApplicable:!0}])},L=r=>{v(i.filter(y=>y.id!==r))},M=(r,y)=>{v(i.map(f=>f.id===r?{...f,amount:y}:f))},Y=async()=>{N(!0);try{const r=await Te(o,{});S(r.suggestions),D(r.estimatedSavings)}catch(r){console.error("AI診断エラー:",r)}finally{N(!1)}},Z=()=>{const r=`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
           確定申告書（${s}年度）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

申告方法: ${u?"青色申告":"白色申告"}
作成日時: ${new Date().toLocaleString("ja-JP")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【収支内訳】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
売上高:     ${k(o.totalRevenue)}
経費合計:   ${k(o.totalExpenses)}
──────────────────────────────────────────────────
事業所得:   ${k(o.netIncome)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【控除内訳】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${i.filter(R=>R.isApplicable).map(R=>`${R.name.padEnd(20,"　")}: ${k(R.amount)}`).join(`
`)}
──────────────────────────────────────────────────
控除合計:   ${k(o.totalDeductions)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【税額計算】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
課税所得:   ${k(o.taxableIncome)}
──────────────────────────────────────────────────
所得税額:   ${k(o.estimatedTax)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
※この書類はAinanceで生成された概算資料です。
  正式な確定申告は国税庁のe-Taxでお手続きください。
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`.trim(),y=new Blob(["\uFEFF"+r],{type:"text/plain;charset=utf-8"}),f=URL.createObjectURL(y),w=document.createElement("a");w.href=f,w.download=`確定申告書_${s}年度.txt`,document.body.appendChild(w),w.click(),document.body.removeChild(w);const g=window.open("","_blank");g&&(g.document.write(`
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
            `),g.document.close()),setTimeout(()=>URL.revokeObjectURL(f),1e3)},Q=()=>e.jsx("div",{className:"mb-8",children:e.jsx("div",{className:"flex items-center justify-between",children:ne.map((r,y)=>e.jsxs(we.Fragment,{children:[e.jsxs("div",{className:"flex flex-col items-center",children:[e.jsx("div",{className:`w-10 h-10 rounded-full flex items-center justify-center transition-all ${h>r.id?"bg-success text-white":h===r.id?"bg-primary text-white":"bg-surface-highlight text-text-muted"}`,children:h>r.id?e.jsx(J,{className:"w-5 h-5"}):e.jsx(r.icon,{className:"w-5 h-5"})}),e.jsx("span",{className:`text-xs mt-2 hidden sm:block ${h>=r.id?"text-text-main font-medium":"text-text-muted"}`,children:r.title})]}),y<ne.length-1&&e.jsx("div",{className:`flex-1 h-1 mx-2 rounded ${h>r.id?"bg-success":"bg-surface-highlight"}`})]},r.id))})}),ee=()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold text-text-main mb-4",children:"確定申告の基本設定"}),e.jsx("p",{className:"text-text-muted mb-6",children:"確定申告を行う年度と申告方法を選択してください。"})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-text-main mb-2",children:"申告年度"}),e.jsx("select",{value:s,onChange:r=>d(Number(r.target.value)),className:"input-base",children:[l,...Array.from({length:4},(r,y)=>l-1-y)].map(r=>e.jsxs("option",{value:r,children:[r,"年度（",r,"年1月〜12月）",r===l&&" ※進行中"]},r))})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-text-main mb-2",children:"申告方法"}),e.jsxs("div",{className:"space-y-3",children:[e.jsxs("label",{className:"flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-surface-highlight transition-colors",children:[e.jsx("input",{type:"radio",checked:u,onChange:()=>t(!0),className:"w-4 h-4 text-primary"}),e.jsxs("div",{className:"ml-3",children:[e.jsx("span",{className:"font-medium text-text-main",children:"青色申告"}),e.jsx("span",{className:"ml-2 text-xs text-success",children:"最大65万円控除"}),e.jsx("p",{className:"text-sm text-text-muted mt-1",children:"複式簿記で最大65万円の控除が受けられます"})]})]}),e.jsxs("label",{className:"flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-surface-highlight transition-colors",children:[e.jsx("input",{type:"radio",checked:!u,onChange:()=>t(!1),className:"w-4 h-4 text-primary"}),e.jsxs("div",{className:"ml-3",children:[e.jsx("span",{className:"font-medium text-text-main",children:"白色申告"}),e.jsx("p",{className:"text-sm text-text-muted mt-1",children:"簡易的な帳簿で申告できます"})]})]})]})]})]}),e.jsxs("div",{className:"bg-info-light border border-info/20 rounded-lg p-4 flex items-start gap-3",children:[e.jsx(Le,{className:"w-5 h-5 text-info flex-shrink-0 mt-0.5"}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-text-main font-medium",children:"青色申告がおすすめ！"}),e.jsx("p",{className:"text-sm text-text-muted mt-1",children:"Ainanceで取引を記録していれば、複式簿記の要件を満たしています。 65万円の控除で税金がお得になります。"})]})]})]}),K=()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold text-text-main mb-4",children:"収支の確認"}),e.jsxs("p",{className:"text-text-muted mb-6",children:[s,"年度の取引データから自動集計した結果です。"]})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4",children:[e.jsxs("div",{className:"bg-success-light border border-success/20 rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-success font-medium",children:"売上高"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:k(o.totalRevenue)})]}),e.jsxs("div",{className:"bg-error-light border border-error/20 rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-error font-medium",children:"経費合計"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:k(o.totalExpenses)})]}),e.jsxs("div",{className:"bg-primary-light border border-primary/20 rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-primary font-medium",children:"事業所得"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:k(o.netIncome)})]})]}),e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-5",children:[e.jsx("h4",{className:"font-medium text-text-main mb-4",children:"経費内訳（上位5件）"}),o.expensesByCategory.length>0?e.jsx("div",{className:"space-y-3",children:o.expensesByCategory.slice(0,5).map((r,y)=>e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"w-8 h-8 bg-surface-highlight rounded-lg flex items-center justify-center text-sm font-medium text-text-muted",children:y+1}),e.jsx("span",{className:"text-text-main",children:r.category})]}),e.jsxs("div",{className:"text-right",children:[e.jsx("span",{className:"font-medium text-text-main",children:k(r.amount)}),e.jsxs("span",{className:"text-text-muted text-sm ml-2",children:["(",ze(r.percentage),")"]})]})]},y))}):e.jsxs("p",{className:"text-text-muted text-center py-4",children:[s,"年度の経費データがありません"]})]}),o.totalRevenue===0&&o.totalExpenses===0&&e.jsxs("div",{className:"bg-warning-light border border-warning/20 rounded-lg p-4 flex items-start gap-3",children:[e.jsx(ge,{className:"w-5 h-5 text-warning flex-shrink-0 mt-0.5"}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-text-main font-medium",children:"取引データがありません"}),e.jsxs("p",{className:"text-sm text-text-muted mt-1",children:[s,"年度の取引を登録してから確定申告を行ってください。",e.jsx(de,{to:"/transactions",className:"text-primary hover:underline ml-1",children:"取引を登録する →"})]})]})]})]}),V=()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold text-text-main mb-4",children:"各種控除の入力"}),e.jsx("p",{className:"text-text-muted mb-6",children:"該当する控除を追加して金額を入力してください。控除が多いほど税金が安くなります。"})]}),e.jsx("div",{className:"space-y-4",children:i.map(r=>e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4",children:[e.jsxs("div",{className:"flex-1",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(pe,{className:"w-5 h-5 text-success"}),e.jsx("span",{className:"font-medium text-text-main",children:r.name})]}),e.jsx("p",{className:"text-sm text-text-muted mt-1 ml-7",children:r.description})]}),e.jsxs("div",{className:"flex items-center gap-3 ml-7 sm:ml-0",children:[e.jsxs("div",{className:"relative",children:[e.jsx("span",{className:"absolute left-3 top-1/2 -translate-y-1/2 text-text-muted",children:"¥"}),e.jsx("input",{type:"number",value:r.amount,onChange:y=>M(r.id,Number(y.target.value)),className:"input-base pl-8 w-40",placeholder:"金額",disabled:r.type==="basic"||r.type==="blue_return"})]}),r.type!=="basic"&&r.type!=="blue_return"&&e.jsx("button",{onClick:()=>L(r.id),className:"p-2 text-error hover:bg-error-light rounded-lg transition-colors",children:e.jsx(Ce,{className:"w-5 h-5"})})]})]},r.id))}),e.jsxs("div",{className:"bg-surface-highlight border border-border rounded-xl p-5",children:[e.jsxs("h4",{className:"font-medium text-text-main mb-4 flex items-center gap-2",children:[e.jsx(xe,{className:"w-5 h-5"}),"控除を追加"]}),e.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-3",children:he.filter(r=>!i.find(y=>y.type===r.type)).map(r=>e.jsxs("button",{onClick:()=>A(r.type),className:"flex items-center gap-3 p-3 bg-surface border border-border rounded-lg hover:border-primary hover:bg-primary-light transition-colors text-left",children:[e.jsx("div",{className:"w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center",children:e.jsx(xe,{className:"w-4 h-4 text-primary"})}),e.jsxs("div",{children:[e.jsx("p",{className:"font-medium text-text-main text-sm",children:r.name}),e.jsx("p",{className:"text-xs text-text-muted",children:r.description})]})]},r.type))})]}),e.jsxs("div",{className:"bg-success-light border border-success/20 rounded-xl p-5 flex items-center justify-between",children:[e.jsx("span",{className:"font-medium text-text-main",children:"控除合計"}),e.jsx("span",{className:"text-2xl font-bold text-success",children:k(o.totalDeductions)})]})]}),q=()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsxs("h3",{className:"text-lg font-semibold text-text-main mb-4 flex items-center gap-2",children:[e.jsx(re,{className:"w-5 h-5 text-primary"}),"AIによる節税アドバイス"]}),e.jsx("p",{className:"text-text-muted mb-6",children:"AIがあなたの収支データを分析し、節税のアドバイスを提供します。"})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-text-muted",children:"課税所得"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:k(o.taxableIncome)}),e.jsx("p",{className:"text-xs text-text-muted mt-2",children:"事業所得 - 各種控除"})]}),e.jsxs("div",{className:"bg-primary-light border border-primary/20 rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-primary font-medium",children:"予想所得税額"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:k(o.estimatedTax)}),e.jsx("p",{className:"text-xs text-text-muted mt-2",children:"※概算です。実際の税額とは異なる場合があります"})]})]}),T.length===0?e.jsx("button",{onClick:Y,disabled:F,className:"btn-primary w-full py-4",children:F?e.jsxs(e.Fragment,{children:[e.jsx(Fe,{className:"w-5 h-5 animate-spin"}),"AI分析中..."]}):e.jsxs(e.Fragment,{children:[e.jsx(re,{className:"w-5 h-5"}),"AIアドバイスを受ける"]})}):e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-5 space-y-4",children:[e.jsxs("div",{className:"flex items-center gap-2 text-primary",children:[e.jsx(re,{className:"w-5 h-5"}),e.jsx("span",{className:"font-medium",children:"AIからのアドバイス"})]}),e.jsx("ul",{className:"space-y-3",children:T.map((r,y)=>e.jsxs("li",{className:"flex items-start gap-3",children:[e.jsx($e,{className:"w-5 h-5 text-primary flex-shrink-0 mt-0.5"}),e.jsx("span",{className:"text-text-main",children:r})]},y))}),C>0&&e.jsx("div",{className:"bg-success-light border border-success/20 rounded-lg p-4 mt-4",children:e.jsxs("p",{className:"text-sm text-success font-medium",children:["推定節税可能額: ",k(C)]})})]})]}),_=()=>{const r={fiscalYear:s,filingType:u?"blue":"white",revenue:o.totalRevenue,expenses:o.totalExpenses,netIncome:o.netIncome,expensesByCategory:o.expensesByCategory,deductions:i.filter(g=>g.isApplicable).map(g=>({type:g.type,name:g.name,amount:g.amount})),totalDeductions:o.totalDeductions,taxableIncome:o.taxableIncome,estimatedTax:o.estimatedTax},y=u?Me(r):_e(r),f=u?`青色申告決算書_${s}年度.xtx`:`収支内訳書_${s}年度.xml`;Be(y,f);const w=window.open("","_blank");w&&(w.document.write(`
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
        <pre>${y.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</pre>
        <div class="actions">
            <button class="secondary" onclick="window.close()">✕ 閉じる</button>
        </div>
    </div>
</body>
</html>
            `),w.document.close())},H=()=>{const[r,y]=U.useState(null),f=async(w,g)=>{try{await navigator.clipboard.writeText(String(w).replace(/[¥,]/g,"")),y(g),setTimeout(()=>y(null),2e3)}catch(R){console.error("コピーに失敗しました:",R)}};return e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsxs("h3",{className:"text-lg font-semibold text-text-main mb-4 flex items-center gap-2",children:[e.jsx(W,{className:"w-5 h-5 text-primary"}),"確定申告書の作成"]}),e.jsx("p",{className:"text-text-muted mb-2",children:"入力内容を確認して、書類を作成してください。"}),e.jsx("p",{className:"text-xs text-text-muted",children:"💡 各項目の右側のコピーボタンで、e-Tax入力時にそのまま貼り付けできます"})]}),e.jsxs("div",{className:"bg-surface border border-border rounded-xl divide-y divide-border",children:[e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"申告年度"}),e.jsx("div",{className:"flex items-center gap-2",children:e.jsxs("span",{className:"font-medium text-text-main",children:[s,"年度"]})})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"申告方法"}),e.jsx("span",{className:"font-medium text-text-main",children:u?"青色申告":"白色申告"})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"売上高"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-success",children:k(o.totalRevenue)}),e.jsx("button",{onClick:()=>f(o.totalRevenue,"revenue"),className:`p-1.5 rounded transition-colors ${r==="revenue"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:r==="revenue"?e.jsx(J,{className:"w-4 h-4"}):e.jsx(G,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"経費合計"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-error",children:k(o.totalExpenses)}),e.jsx("button",{onClick:()=>f(o.totalExpenses,"expenses"),className:`p-1.5 rounded transition-colors ${r==="expenses"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:r==="expenses"?e.jsx(J,{className:"w-4 h-4"}):e.jsx(G,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"事業所得"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-text-main",children:k(o.netIncome)}),e.jsx("button",{onClick:()=>f(o.netIncome,"netIncome"),className:`p-1.5 rounded transition-colors ${r==="netIncome"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:r==="netIncome"?e.jsx(J,{className:"w-4 h-4"}):e.jsx(G,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"控除合計"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-primary",children:k(o.totalDeductions)}),e.jsx("button",{onClick:()=>f(o.totalDeductions,"deductions"),className:`p-1.5 rounded transition-colors ${r==="deductions"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:r==="deductions"?e.jsx(J,{className:"w-4 h-4"}):e.jsx(G,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"課税所得"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-text-main",children:k(o.taxableIncome)}),e.jsx("button",{onClick:()=>f(o.taxableIncome,"taxableIncome"),className:`p-1.5 rounded transition-colors ${r==="taxableIncome"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:r==="taxableIncome"?e.jsx(J,{className:"w-4 h-4"}):e.jsx(G,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center bg-primary-light",children:[e.jsx("span",{className:"font-medium text-text-main",children:"予想所得税額"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-bold text-primary text-lg",children:k(o.estimatedTax)}),e.jsx("button",{onClick:()=>f(o.estimatedTax,"tax"),className:`p-1.5 rounded transition-colors ${r==="tax"?"bg-success text-white":"hover:bg-primary/20 text-primary"}`,title:"コピー",children:r==="tax"?e.jsx(J,{className:"w-4 h-4"}):e.jsx(G,{className:"w-4 h-4"})})]})]})]}),e.jsxs("div",{className:"space-y-4",children:[e.jsx("h4",{className:"text-md font-medium text-text-main",children:"📥 ダウンロード"}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-4",children:[e.jsxs("button",{onClick:Z,className:"btn-primary py-4 flex items-center justify-center gap-2",children:[e.jsx(fe,{className:"w-5 h-5"}),"申告書プレビュー"]}),e.jsxs("button",{onClick:_,className:"btn-outline py-4 flex items-center justify-center gap-2 border-2 border-blue-500 text-blue-500 hover:bg-blue-500/10",children:[e.jsx(Ee,{className:"w-5 h-5"}),"e-Tax用XMLファイル"]})]}),e.jsxs("div",{className:"bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4",children:[e.jsx("h5",{className:"text-sm font-medium text-text-main mb-3 flex items-center gap-2",children:"✨ 日本語PDF自動生成（NEW!）"}),e.jsx("p",{className:"text-xs text-text-muted mb-3",children:(c==null?void 0:c.business_type)==="corporation"?"法人税申告書・決算報告書（損益計算書+貸借対照表）を日本語PDFで生成":"確定申告書B・青色申告決算書を日本語PDFで生成します"}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-3",children:[(c==null?void 0:c.business_type)!=="corporation"&&e.jsxs(e.Fragment,{children:[e.jsxs("button",{onClick:async()=>{var w,g;try{const R={revenue:o.totalRevenue,expenses:o.totalExpenses,netIncome:o.netIncome,expensesByCategory:o.expensesByCategory,deductions:{basic:((w=i.find(P=>P.type==="basic"))==null?void 0:w.amount)||48e4,blueReturn:u?65e4:0,socialInsurance:(g=i.find(P=>P.type==="socialInsurance"))==null?void 0:g.amount},taxableIncome:o.taxableIncome,estimatedTax:o.estimatedTax,fiscalYear:s,isBlueReturn:u},te=await Oe(R),B=`確定申告書B_${s}年度.pdf`;se(te,B),ae(te)}catch(R){console.error("PDF生成エラー:",R),alert("PDF生成に失敗しました。フォントファイルを確認してください。")}},className:"px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium flex items-center justify-center gap-2",children:[e.jsx(W,{className:"w-4 h-4"}),"確定申告書B"]}),u&&e.jsxs("button",{onClick:async()=>{try{const w={revenue:o.totalRevenue,expenses:o.totalExpenses,netIncome:o.netIncome,expensesByCategory:o.expensesByCategory,deductions:{blueReturn:65e4},taxableIncome:o.taxableIncome,estimatedTax:o.estimatedTax,fiscalYear:s,isBlueReturn:!0},g=await Je(w),R=`青色申告決算書_${s}年度.pdf`;se(g,R),ae(g)}catch(w){console.error("PDF生成エラー:",w),alert("PDF生成に失敗しました。フォントファイルを確認してください。")}},className:"px-4 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium flex items-center justify-center gap-2",children:[e.jsx(W,{className:"w-4 h-4"}),"青色申告決算書"]})]}),(c==null?void 0:c.business_type)==="corporation"&&e.jsxs(e.Fragment,{children:[e.jsxs("button",{onClick:async()=>{try{const w={revenue:o.totalRevenue,expenses:o.totalExpenses,netIncome:o.netIncome,expensesByCategory:o.expensesByCategory,taxableIncome:o.taxableIncome,estimatedTax:o.estimatedTax,fiscalYear:s,businessType:"corporation",companyName:(c==null?void 0:c.company_name)||"会社名",representativeName:(c==null?void 0:c.representative_name)||"",address:(c==null?void 0:c.address)||""},g=await Ye(w),R=`法人税申告書_${s}年度.pdf`;se(g,R),ae(g)}catch(w){console.error("PDF生成エラー:",w),alert("PDF生成に失敗しました。フォントファイルを確認してください。")}},className:"px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium flex items-center justify-center gap-2",children:[e.jsx(W,{className:"w-4 h-4"}),"法人税申告書"]}),e.jsxs("button",{onClick:async()=>{try{const w={revenue:o.totalRevenue,expenses:o.totalExpenses,netIncome:o.netIncome,expensesByCategory:o.expensesByCategory,taxableIncome:o.taxableIncome,estimatedTax:o.estimatedTax,fiscalYear:s,businessType:"corporation",companyName:(c==null?void 0:c.company_name)||"会社名",representativeName:(c==null?void 0:c.representative_name)||"",capital:1e6},g=await He(w),R=`決算報告書_${s}年度.pdf`;se(g,R),ae(g)}catch(w){console.error("PDF生成エラー:",w),alert("PDF生成に失敗しました。フォントファイルを確認してください。")}},className:"px-4 py-3 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors text-sm font-medium flex items-center justify-center gap-2",children:[e.jsx(W,{className:"w-4 h-4"}),"決算報告書"]})]})]})]})]}),e.jsxs("div",{className:"bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-xl p-5",children:[e.jsxs("h4",{className:"text-md font-medium text-text-main mb-3 flex items-center gap-2",children:[e.jsx(me,{className:"w-5 h-5 text-blue-500"}),"e-Taxで直接申告する"]}),e.jsxs("ol",{className:"text-sm text-text-muted space-y-2 mb-4",children:[e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx("span",{className:"flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs",children:"1"}),"上のコピーボタンで各数値をコピー"]}),e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx("span",{className:"flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs",children:"2"}),"確定申告書等作成コーナーにアクセス"]}),e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx("span",{className:"flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs",children:"3"}),"コピーした数値を貼り付けて入力"]}),e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx("span",{className:"flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs",children:"4"}),"マイナンバーカードで電子署名 → 送信完了！"]})]}),e.jsxs("a",{href:"https://www.keisan.nta.go.jp/kyoutu/ky/smsp/top",target:"_blank",rel:"noopener noreferrer",className:"inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm",children:[e.jsx(me,{className:"w-4 h-4"}),"確定申告書等作成コーナーを開く"]}),e.jsx(de,{to:"/tax-filing-guide",className:"inline-flex items-center gap-2 px-4 py-2 ml-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm",children:"📖 詳しい申告ガイドを見る"})]}),e.jsxs("div",{className:"bg-warning-light border border-warning/20 rounded-lg p-4 flex items-start gap-3",children:[e.jsx(ge,{className:"w-5 h-5 text-warning flex-shrink-0 mt-0.5"}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-text-main font-medium",children:"ご注意ください"}),e.jsxs("ul",{className:"text-sm text-text-muted mt-2 space-y-1 list-disc list-inside",children:[e.jsx("li",{children:"この計算は概算です。正確な税額は税務署にご確認ください"}),e.jsx("li",{children:"確定申告の期限は翌年3月15日です（例：2025年度分は2026年3月15日まで）"}),e.jsx("li",{children:"青色申告特別控除65万円の適用には電子申告が必要です"})]})]})]})]})},ce=()=>{switch(h){case 1:return e.jsx(ee,{});case 2:return e.jsx(K,{});case 3:return e.jsx(V,{});case 4:return e.jsx(q,{});case 5:return e.jsx(H,{});default:return null}};return e.jsx("div",{className:"min-h-screen bg-background",children:e.jsxs("div",{className:"max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8",children:[e.jsxs("div",{className:"mb-8",children:[e.jsxs(de,{to:"/dashboard",className:"flex items-center text-primary hover:text-primary-hover mb-4",children:[e.jsx(ue,{className:"h-5 w-5 mr-2"}),"ダッシュボードに戻る"]}),e.jsx("h1",{className:"text-3xl font-bold text-text-main mb-2",children:"確定申告サポート"}),e.jsx("p",{className:"text-text-muted",children:"5つのステップで簡単に確定申告を完了できます"})]}),e.jsx(Q,{}),e.jsx("div",{className:"bg-surface border border-border rounded-xl p-6 mb-6",children:ce()}),e.jsxs("div",{className:"flex justify-between",children:[e.jsxs("button",{onClick:z,disabled:h===1,className:`btn-ghost ${h===1?"opacity-50 cursor-not-allowed":""}`,children:[e.jsx(ue,{className:"w-5 h-5"}),"戻る"]}),h<ne.length?e.jsxs("button",{onClick:E,className:"btn-primary",children:["次へ",e.jsx(Re,{className:"w-5 h-5"})]}):e.jsxs("button",{onClick:Z,className:"btn-success",children:[e.jsx(pe,{className:"w-5 h-5"}),"完了"]})]})]})})};export{nt as default};
