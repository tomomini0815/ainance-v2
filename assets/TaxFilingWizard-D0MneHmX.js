import{c as ce,a as pe,b as ge,d as be,r as R,j as e,L as Z,F as Y,P as Q,S as X,R as fe,g as E,t as je,T as ye}from"./index-CwJpG1DX.js";import{g as Ne,c as we,f as k,E as se,A as ne,a as ve,b as ke}from"./TaxFilingService-Ck3qqRK0.js";import{P as te,S as G,r as I}from"./PDFButton-Bc6v3tp2.js";import{A as ae}from"./arrow-left-JGVQciG4.js";import{C as Ie}from"./calculator-CIDQvdKC.js";import{D as le}from"./download-pGCxi4h4.js";import{A as Ce}from"./arrow-right-g6sO2ENK.js";import{C as ie}from"./circle-check-big-DAzANGx7.js";import{C as F}from"./copy-lGGTPYwU.js";import{C as re}from"./circle-alert-DPD7FdA-.js";import{R as Te}from"./refresh-cw-BnyMmnNK.js";/**
 * @license lucide-react v0.540.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Se=[["path",{d:"M10 12.5 8 15l2 2.5",key:"1tg20x"}],["path",{d:"m14 12.5 2 2.5-2 2.5",key:"yinavb"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z",key:"1mlx9k"}]],$e=ce("file-code",Se);/**
 * @license lucide-react v0.540.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ae=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 16v-4",key:"1dtifu"}],["path",{d:"M12 8h.01",key:"e9boi3"}]],_e=ce("info",Ae);function Pe(a){const s=new Date,j=s.toISOString().replace(/[-:]/g,"").split(".")[0],x={売上高:"AA100",仕入高:"AB100",消耗品費:"AC100",旅費交通費:"AC110",通信費:"AC120",広告宣伝費:"AC130",接待交際費:"AC140",水道光熱費:"AC150",地代家賃:"AC160",外注費:"AC170",減価償却費:"AC180",雑費:"AC190"},N=a.expensesByCategory.map((m,d)=>{const r=x[m.category]||`AC${200+d}`;return`    <${r}>${m.amount}</${r}>`}).join(`
`);return`<?xml version="1.0" encoding="UTF-8"?>
<!--
  Ainance e-Tax Export File
  生成日時: ${s.toLocaleString("ja-JP")}
  対象年度: ${a.fiscalYear}年度
  申告区分: ${a.filingType==="blue"?"青色申告":"白色申告"}
-->
<申告書等送信票等>
  <作成日時>${j}</作成日時>
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
${N}
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
${a.deductions.map(m=>`      <${m.type}>${m.amount}</${m.type}>`).join(`
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
</申告書等送信票等>`}function Re(a){return`<?xml version="1.0" encoding="UTF-8"?>
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
</収支内訳書>`}function Ee(a,s){const j=new Blob(["\uFEFF"+a],{type:"application/xml;charset=utf-8"}),x=URL.createObjectURL(j),N=document.createElement("a");N.href=x,N.download=s,document.body.appendChild(N),N.click(),document.body.removeChild(N),setTimeout(()=>URL.revokeObjectURL(x),1e3)}const b={事業_営業等:{x:475,y:648},事業所得_営業等:{x:475,y:458},総所得金額:{x:475,y:318},社会保険料控除:{x:475,y:268},小規模企業共済等掛金控除:{x:475,y:248},生命保険料控除:{x:475,y:228},地震保険料控除:{x:475,y:208},配偶者控除:{x:475,y:168},扶養控除:{x:475,y:148},基礎控除:{x:475,y:128},所得控除合計:{x:475,y:88},住所:{x:120,y:780},氏名:{x:120,y:755},電話番号:{x:350,y:755}},S={売上金額:{x:430,y:680,width:100},売上原価:{x:430,y:640,width:100},差引金額:{x:430,y:600,width:100},租税公課:{x:430,y:540,width:80},荷造運賃:{x:430,y:520,width:80},水道光熱費:{x:430,y:500,width:80},旅費交通費:{x:430,y:480,width:80},通信費:{x:430,y:460,width:80},広告宣伝費:{x:430,y:440,width:80},接待交際費:{x:430,y:420,width:80},損害保険料:{x:430,y:400,width:80},修繕費:{x:430,y:380,width:80},消耗品費:{x:430,y:360,width:80},減価償却費:{x:430,y:340,width:80},福利厚生費:{x:430,y:320,width:80},給料賃金:{x:430,y:300,width:80},外注工賃:{x:430,y:280,width:80},地代家賃:{x:430,y:260,width:80},支払利息:{x:430,y:240,width:80},雑費:{x:430,y:220,width:80},経費計:{x:430,y:180,width:100},青色申告特別控除前の所得金額:{x:430,y:140,width:100},青色申告特別控除額:{x:430,y:120,width:100},所得金額:{x:430,y:80,width:100},屋号:{x:100,y:750,width:150},住所:{x:100,y:720,width:200},氏名:{x:100,y:690,width:150}},ee={交通費:"旅費交通費",旅費交通費:"旅費交通費",通信費:"通信費",水道光熱費:"水道光熱費",消耗品費:"消耗品費",接待交際費:"接待交際費",広告宣伝費:"広告宣伝費",地代家賃:"地代家賃",外注費:"外注工賃",給与:"給料賃金",雑費:"雑費",減価償却費:"減価償却費",修繕費:"修繕費",保険料:"損害保険料",福利厚生費:"福利厚生費",支払利息:"支払利息",租税公課:"租税公課",荷造運賃:"荷造運賃",その他:"雑費",未分類:"雑費"};async function De(a,s){const j=await te.load(a,{ignoreEncryption:!0}),N=j.getPages()[0],c=await j.embedFont(G.Helvetica),m=h=>h.toLocaleString("ja-JP"),d=(h,u,o,l=9)=>{N.drawText(h,{x:u,y:o,size:l,font:c,color:I(0,0,0)})};d(m(s.revenue),b.事業_営業等.x,b.事業_営業等.y),d(m(s.netIncome),b.事業所得_営業等.x,b.事業所得_営業等.y),d(m(s.netIncome),b.総所得金額.x,b.総所得金額.y),s.deductions.socialInsurance&&d(m(s.deductions.socialInsurance),b.社会保険料控除.x,b.社会保険料控除.y),s.deductions.smallBusinessMutual&&d(m(s.deductions.smallBusinessMutual),b.小規模企業共済等掛金控除.x,b.小規模企業共済等掛金控除.y),s.deductions.lifeInsurance&&d(m(s.deductions.lifeInsurance),b.生命保険料控除.x,b.生命保険料控除.y),s.deductions.earthquakeInsurance&&d(m(s.deductions.earthquakeInsurance),b.地震保険料控除.x,b.地震保険料控除.y),s.deductions.spouse&&d(m(s.deductions.spouse),b.配偶者控除.x,b.配偶者控除.y),s.deductions.dependents&&d(m(s.deductions.dependents),b.扶養控除.x,b.扶養控除.y),s.deductions.basic&&d(m(s.deductions.basic),b.基礎控除.x,b.基礎控除.y);const r=Object.values(s.deductions).reduce((h,u)=>h+(u||0),0);return d(m(r),b.所得控除合計.x,b.所得控除合計.y),s.address&&d(s.address,b.住所.x,b.住所.y,8),s.name&&d(s.name,b.氏名.x,b.氏名.y),s.phone&&d(s.phone,b.電話番号.x,b.電話番号.y),j.save()}async function Fe(a,s){const j=await te.load(a,{ignoreEncryption:!0}),N=j.getPages()[0],c=await j.embedFont(G.Helvetica),m=u=>u.toLocaleString("ja-JP"),d=(u,o,l,A=9)=>{N.drawText(u,{x:o,y:l,size:A,font:c,color:I(0,0,0)})};d(m(s.revenue),S.売上金額.x,S.売上金額.y);const r={};s.expensesByCategory.forEach(u=>{const o=ee[u.category]||"雑費";r[o]=(r[o]||0)+u.amount}),Object.entries(r).forEach(([u,o])=>{const l=S[u];l&&d(m(o),l.x,l.y)}),d(m(s.expenses),S.経費計.x,S.経費計.y),d(m(s.revenue-s.expenses),S.差引金額.x,S.差引金額.y),d(m(s.netIncome),S.青色申告特別控除前の所得金額.x,S.青色申告特別控除前の所得金額.y),s.isBlueReturn&&s.deductions.blueReturn&&d(m(s.deductions.blueReturn),S.青色申告特別控除額.x,S.青色申告特別控除額.y);const h=s.netIncome-(s.deductions.blueReturn||0);return d(m(Math.max(0,h)),S.所得金額.x,S.所得金額.y),s.tradeName&&d(s.tradeName,S.屋号.x,S.屋号.y),s.address&&d(s.address,S.住所.x,S.住所.y,8),s.name&&d(s.name,S.氏名.x,S.氏名.y),j.save()}async function U(a,s){if(a==="corporate_tax"||a==="financial_statement"){const c=await oe(a,s),m=a==="corporate_tax"?`法人税申告書_${s.fiscalYear}年度_入力済み.pdf`:`決算報告書_${s.fiscalYear}年度_入力済み.pdf`;return{pdfBytes:c,filename:m}}const j=a==="tax_return_b"?"/templates/tax_return_r05.pdf":"/templates/blue_return_r05.pdf";let x;try{const c=await fetch(j);if(!c.ok)throw new Error(`テンプレートの読み込みに失敗: ${c.statusText}`);const m=await c.arrayBuffer();x=a==="tax_return_b"?await De(m,s):await Fe(m,s)}catch(c){console.warn("テンプレート読み込み失敗、白紙から生成します:",c),x=await oe(a,s)}const N=a==="tax_return_b"?`確定申告書B_${s.fiscalYear}年度_入力済み.pdf`:`青色申告決算書_${s.fiscalYear}年度_入力済み.pdf`;return{pdfBytes:x,filename:N}}async function oe(a,s){var z,i,B,J,L;const j=await te.create(),x=j.addPage([595.28,841.89]),N=await j.embedFont(G.Helvetica),c=await j.embedFont(G.HelveticaBold),{width:m,height:d}=x.getSize(),r=g=>g===0?"0":g.toLocaleString("ja-JP"),h={primary:I(.2,.4,.8),corporate:I(.4,.2,.6),header:I(.15,.15,.15),text:I(.1,.1,.1),muted:I(.4,.4,.4),line:I(.7,.7,.7),highlight:I(.95,.95,1),red:I(.8,.2,.2),green:I(.2,.6,.3)},u=a==="corporate_tax"||a==="financial_statement"?h.corporate:h.primary,o=(g,C,v,$={})=>{const P=$.size||10,D=$.font||N,q=$.color||h.text;let O=C;if($.align==="right"){const V=D.widthOfTextAtSize(g,P);O=C-V}x.drawText(g,{x:O,y:v,size:P,font:D,color:q})},l=(g,C,v,$,P=.5)=>{x.drawLine({start:{x:g,y:C},end:{x:v,y:$},thickness:P,color:h.line})},A=(g,C,v,$,P)=>{x.drawRectangle({x:g,y:C,width:v,height:$,color:P})},p=(g,C,v,$=!1)=>{$&&A(50,v-5,495,20,h.highlight),l(50,v-5,545,v-5),o(g,60,v),o(C,530,v,{align:"right"})},W={tax_return_b:"Kakutei Shinkokusho B (Tax Return Form B)",blue_return:"Aoiro Shinkoku Kessansho (Blue Return Statement)",corporate_tax:"Houjinzei Shinkokusho (Corporate Tax Return)",financial_statement:"Kessan Houkokusho (Financial Statement)"};A(0,d-60,m,60,u),o(W[a],50,d-40,{size:14,font:c,color:I(1,1,1)});let t=d-85;if(a==="corporate_tax"||a==="financial_statement"?(s.companyName&&o(`Company: ${s.companyName}`,50,t,{size:11,font:c}),t-=20,o(`Fiscal Year: ${s.fiscalYear}`,50,t,{size:10}),s.representativeName&&o(`Representative: ${s.representativeName}`,300,t,{size:10})):o(`Fiscal Year: ${s.fiscalYear} (Reiwa ${s.fiscalYear-2018})`,50,t,{size:11}),o(`Generated: ${new Date().toLocaleDateString("ja-JP")}`,400,t,{size:9,color:h.muted}),t-=30,l(50,t,545,t,1),t-=25,a==="corporate_tax"){o("SECTION 1: Houjin Joho (Corporate Information)",50,t,{size:12,font:c,color:u}),t-=25,s.companyName&&p("Company Name (Kaisha Mei)",s.companyName,t),t-=20,s.corporateNumber&&p("Corporate Number (Houjin Bangou)",s.corporateNumber,t),t-=20,s.capital&&p("Capital (Shihonkin)",r(s.capital)+" JPY",t),t-=20,s.address&&p("Address (Juusho)",s.address,t),t-=30,o("SECTION 2: Son'eki Keisan (Profit & Loss)",50,t,{size:12,font:c,color:u}),t-=25,p("Revenue (Uriage)",r(s.revenue)+" JPY",t,!0),t-=20,p("Expenses (Keihi)",r(s.expenses)+" JPY",t),t-=20,p("Net Income (Junrieki)",r(s.netIncome)+" JPY",t,!0),t-=35,o("SECTION 3: Zeigaku Keisan (Tax Calculation)",50,t,{size:12,font:c,color:u}),t-=25;const g=((z=s.corporateTax)==null?void 0:z.taxableIncome)||s.taxableIncome;p("Taxable Income (Kazei Shotoku)",r(g)+" JPY",t),t-=20;const C=g<=8e6?.15:.232,v=((i=s.corporateTax)==null?void 0:i.corporateTaxAmount)||Math.floor(g*C);p("Corporate Tax Rate",`${(C*100).toFixed(1)}%`,t),t-=20,p("Corporate Tax (Houjinzei)",r(v)+" JPY",t),t-=20;const $=((B=s.corporateTax)==null?void 0:B.localCorporateTax)||Math.floor(v*.103);p("Local Corporate Tax (Chihou Houjinzei)",r($)+" JPY",t),t-=20;const P=((J=s.corporateTax)==null?void 0:J.businessTax)||Math.floor(g*.07);p("Business Tax (Jigyouzei)",r(P)+" JPY",t),t-=25;const D=((L=s.corporateTax)==null?void 0:L.totalTax)||v+$+P;A(50,t-8,495,30,I(1,.95,.95)),l(50,t-8,545,t-8,1),l(50,t+22,545,t+22,1),o("Total Tax (Zeigaku Goukei) - ESTIMATED",60,t+5,{font:c}),o(r(D)+" JPY",530,t+5,{align:"right",font:c,color:h.red})}else if(a==="financial_statement")o("SECTION 1: Son'eki Keisansho (P/L Statement)",50,t,{size:12,font:c,color:u}),t-=25,A(50,t-5,495,18,I(.9,.9,.9)),l(50,t-5,545,t-5),l(50,t+13,545,t+13),o("Item",60,t,{font:c,size:9}),o("Amount",530,t,{align:"right",font:c,size:9}),t-=22,p("Sales Revenue (Uriage Takadaka)",r(s.revenue)+" JPY",t,!0),t-=20,s.expensesByCategory.forEach((g,C)=>{const v=ee[g.category]||g.category;C%2===0&&A(50,t-5,495,18,I(.98,.98,.98)),l(50,t-5,545,t-5),o(v,70,t,{size:9}),o(r(g.amount)+" JPY",530,t,{align:"right",size:9}),t-=18}),t-=5,p("Total Expenses (Keihi Goukei)",r(s.expenses)+" JPY",t),t-=25,A(50,t-8,495,26,I(.95,1,.95)),l(50,t-8,545,t-8,1),l(50,t+18,545,t+18,1),o("Operating Income (Eigyo Rieki)",60,t+2,{font:c}),o(r(s.netIncome)+" JPY",530,t+2,{align:"right",font:c,color:s.netIncome>=0?h.green:h.red}),t-=45,o("SECTION 2: Taisyaku Taishouhyo (Balance Sheet Summary)",50,t,{size:12,font:c,color:u}),t-=25,p("Assets (Shisan) - Estimated",r(s.revenue*.4)+" JPY",t),t-=20,p("Liabilities (Fusai) - Estimated",r(s.expenses*.3)+" JPY",t),t-=20,p("Equity (Junshisan) - Estimated",r(s.revenue*.4-s.expenses*.3)+" JPY",t,!0);else if(a==="tax_return_b"){o("SECTION 1: Shuunyu Kingaku (Income)",50,t,{size:12,font:c,color:h.primary}),t-=25,p("A. Jigyo (Business) - Eigyo (Sales/Services)",r(s.revenue)+" JPY",t,!0),t-=25,t-=15,o("SECTION 2: Shotoku Kingaku (Net Income)",50,t,{size:12,font:c,color:h.primary}),t-=25,p("A. Jigyo Shotoku (Business Income)",r(s.netIncome)+" JPY",t),t-=20,p("Total Income",r(s.netIncome)+" JPY",t,!0),t-=30,t-=15,o("SECTION 3: Shotoku Koujo (Deductions)",50,t,{size:12,font:c,color:h.primary}),t-=25,s.deductions.basic&&(p("Kiso Koujo (Basic Deduction)",r(s.deductions.basic)+" JPY",t),t-=20),s.deductions.blueReturn&&s.deductions.blueReturn>0&&(p("Aoiro Shinkoku Tokubetsu Koujo (Blue Return Special)",r(s.deductions.blueReturn)+" JPY",t),t-=20),s.deductions.socialInsurance&&(p("Shakai Hoken (Social Insurance)",r(s.deductions.socialInsurance)+" JPY",t),t-=20),s.deductions.lifeInsurance&&(p("Seimei Hoken (Life Insurance)",r(s.deductions.lifeInsurance)+" JPY",t),t-=20);const g=Object.values(s.deductions).reduce((C,v)=>C+(v||0),0);p("Total Deductions",r(g)+" JPY",t,!0),t-=35,t-=15,o("SECTION 4: Zeigaku Keisan (Tax Calculation)",50,t,{size:12,font:c,color:h.primary}),t-=25,p("Kazei Shotoku (Taxable Income)",r(s.taxableIncome)+" JPY",t),t-=25,A(50,t-8,495,30,I(1,.95,.95)),l(50,t-8,545,t-8,1),l(50,t+22,545,t+22,1),o("Shotokuzei (Income Tax) - ESTIMATED",60,t+5,{font:c}),o(r(s.estimatedTax)+" JPY",530,t+5,{align:"right",font:c,color:h.red})}else if(o("SECTION 1: Uriage (Revenue)",50,t,{size:12,font:c,color:h.primary}),t-=25,p("A. Uriage (Sales Revenue)",r(s.revenue)+" JPY",t,!0),t-=30,t-=15,o("SECTION 2: Keihi (Expenses)",50,t,{size:12,font:c,color:h.primary}),t-=25,A(50,t-5,495,18,I(.9,.9,.9)),l(50,t-5,545,t-5),l(50,t+13,545,t+13),o("Category",60,t,{font:c,size:9}),o("Amount",530,t,{align:"right",font:c,size:9}),t-=22,s.expensesByCategory.forEach((g,C)=>{const v=ee[g.category]||g.category;C%2===0&&A(50,t-5,495,18,I(.98,.98,.98)),l(50,t-5,545,t-5),o(v,60,t,{size:9}),o(r(g.amount)+" JPY",530,t,{align:"right",size:9}),t-=18}),t-=5,p("Total Expenses",r(s.expenses)+" JPY",t,!0),t-=35,t-=15,o("SECTION 3: Shotoku Keisan (Income Calculation)",50,t,{size:12,font:c,color:h.primary}),t-=25,p("Uriage - Keihi (Gross Profit)",r(s.netIncome)+" JPY",t),t-=20,s.isBlueReturn&&s.deductions.blueReturn){p("Aoiro Tokubetsu Koujo (Blue Return Deduction)","-"+r(s.deductions.blueReturn)+" JPY",t),t-=25;const g=Math.max(0,s.netIncome-s.deductions.blueReturn);A(50,t-8,495,30,I(.95,1,.95)),l(50,t-8,545,t-8,1),l(50,t+22,545,t+22,1),o("Final Business Income (Shotoku Kingaku)",60,t+5,{font:c}),o(r(g)+" JPY",530,t+5,{align:"right",font:c,color:h.green})}return l(50,60,545,60),a==="corporate_tax"||a==="financial_statement"?(o("* This document is generated by Ainance for reference purposes only.",50,45,{size:7,color:h.muted}),o("* For official corporate tax filing, please consult a certified tax accountant or use e-Tax.",50,35,{size:7,color:h.muted}),o("* Visit: https://www.e-tax.nta.go.jp/",50,25,{size:7,color:u})):(o("* This document is generated by Ainance for reference purposes only.",50,45,{size:7,color:h.muted}),o("* For official tax filing, please use the National Tax Agency e-Tax system.",50,35,{size:7,color:h.muted}),o("* Visit: https://www.keisan.nta.go.jp/",50,25,{size:7,color:h.primary})),j.save()}function K(a,s){const j=new Blob([new Uint8Array(a)],{type:"application/pdf"}),x=URL.createObjectURL(j),N=document.createElement("a");N.href=x,N.download=s,document.body.appendChild(N),N.click(),document.body.removeChild(N),setTimeout(()=>URL.revokeObjectURL(x),1e3)}function M(a){const s=new Blob([new Uint8Array(a)],{type:"application/pdf"}),j=URL.createObjectURL(s);window.open(j,"_blank")}const H=[{id:1,title:"基本情報",icon:Y,description:"確定申告の基本設定"},{id:2,title:"収支確認",icon:Ie,description:"売上・経費の確認"},{id:3,title:"控除入力",icon:Q,description:"各種控除の入力"},{id:4,title:"AI診断",icon:X,description:"AIによる節税アドバイス"},{id:5,title:"申告書作成",icon:le,description:"PDFダウンロード"}],Ge=()=>{const{user:a}=pe(),{currentBusinessType:s}=ge(),{transactions:j}=be(a==null?void 0:a.id,s==null?void 0:s.business_type),[x,N]=R.useState(1),[c,m]=R.useState(!1),d=new Date().getFullYear(),[r,h]=R.useState(d-1),[u,o]=R.useState(!0),[l,A]=R.useState([]),[p,W]=R.useState([]),[t,z]=R.useState(0);R.useEffect(()=>{A(Ne(u))},[u]);const i=R.useMemo(()=>we(j,r,(s==null?void 0:s.business_type)||"individual",l),[j,r,s,l]),B=()=>{x<H.length&&N(x+1)},J=()=>{x>1&&N(x-1)},L=n=>{const f=ne.find(T=>T.type===n);f&&!l.find(T=>T.type===n)&&A([...l,{id:Date.now().toString(),...f,amount:0,isApplicable:!0}])},g=n=>{A(l.filter(f=>f.id!==n))},C=(n,f)=>{A(l.map(T=>T.id===n?{...T,amount:f}:T))},v=async()=>{m(!0);try{const n=await ke(i,{});W(n.suggestions),z(n.estimatedSavings)}catch(n){console.error("AI診断エラー:",n)}finally{m(!1)}},$=()=>{const n=`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
           確定申告書（${r}年度）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

申告方法: ${u?"青色申告":"白色申告"}
作成日時: ${new Date().toLocaleString("ja-JP")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【収支内訳】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
売上高:     ${k(i.totalRevenue)}
経費合計:   ${k(i.totalExpenses)}
──────────────────────────────────────────────────
事業所得:   ${k(i.netIncome)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【控除内訳】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${l.filter(_=>_.isApplicable).map(_=>`${_.name.padEnd(20,"　")}: ${k(_.amount)}`).join(`
`)}
──────────────────────────────────────────────────
控除合計:   ${k(i.totalDeductions)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【税額計算】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
課税所得:   ${k(i.taxableIncome)}
──────────────────────────────────────────────────
所得税額:   ${k(i.estimatedTax)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
※この書類はAinanceで生成された概算資料です。
  正式な確定申告は国税庁のe-Taxでお手続きください。
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`.trim(),f=new Blob(["\uFEFF"+n],{type:"text/plain;charset=utf-8"}),T=URL.createObjectURL(f),y=document.createElement("a");y.href=T,y.download=`確定申告書_${r}年度.txt`,document.body.appendChild(y),y.click(),document.body.removeChild(y);const w=window.open("","_blank");w&&(w.document.write(`
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>確定申告書プレビュー - ${r}年度</title>
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
        <p class="subtitle">${r}年度 | ${u?"青色申告":"白色申告"} | 作成日: ${new Date().toLocaleDateString("ja-JP")}</p>
        <pre>${n}</pre>
        <div class="actions">
            <button class="print-btn" onclick="window.print()">🖨️ 印刷する</button>
            <button class="close-btn" onclick="window.close()">✕ 閉じる</button>
        </div>
    </div>
</body>
</html>
            `),w.document.close()),setTimeout(()=>URL.revokeObjectURL(T),1e3)},P=()=>e.jsx("div",{className:"mb-8",children:e.jsx("div",{className:"flex items-center justify-between",children:H.map((n,f)=>e.jsxs(fe.Fragment,{children:[e.jsxs("div",{className:"flex flex-col items-center",children:[e.jsx("div",{className:`w-10 h-10 rounded-full flex items-center justify-center transition-all ${x>n.id?"bg-success text-white":x===n.id?"bg-primary text-white":"bg-surface-highlight text-text-muted"}`,children:x>n.id?e.jsx(E,{className:"w-5 h-5"}):e.jsx(n.icon,{className:"w-5 h-5"})}),e.jsx("span",{className:`text-xs mt-2 hidden sm:block ${x>=n.id?"text-text-main font-medium":"text-text-muted"}`,children:n.title})]}),f<H.length-1&&e.jsx("div",{className:`flex-1 h-1 mx-2 rounded ${x>n.id?"bg-success":"bg-surface-highlight"}`})]},n.id))})}),D=()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold text-text-main mb-4",children:"確定申告の基本設定"}),e.jsx("p",{className:"text-text-muted mb-6",children:"確定申告を行う年度と申告方法を選択してください。"})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-text-main mb-2",children:"申告年度"}),e.jsx("select",{value:r,onChange:n=>h(Number(n.target.value)),className:"input-base",children:[d,...Array.from({length:4},(n,f)=>d-1-f)].map(n=>e.jsxs("option",{value:n,children:[n,"年度（",n,"年1月〜12月）",n===d&&" ※進行中"]},n))})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-text-main mb-2",children:"申告方法"}),e.jsxs("div",{className:"space-y-3",children:[e.jsxs("label",{className:"flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-surface-highlight transition-colors",children:[e.jsx("input",{type:"radio",checked:u,onChange:()=>o(!0),className:"w-4 h-4 text-primary"}),e.jsxs("div",{className:"ml-3",children:[e.jsx("span",{className:"font-medium text-text-main",children:"青色申告"}),e.jsx("span",{className:"ml-2 text-xs text-success",children:"最大65万円控除"}),e.jsx("p",{className:"text-sm text-text-muted mt-1",children:"複式簿記で最大65万円の控除が受けられます"})]})]}),e.jsxs("label",{className:"flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-surface-highlight transition-colors",children:[e.jsx("input",{type:"radio",checked:!u,onChange:()=>o(!1),className:"w-4 h-4 text-primary"}),e.jsxs("div",{className:"ml-3",children:[e.jsx("span",{className:"font-medium text-text-main",children:"白色申告"}),e.jsx("p",{className:"text-sm text-text-muted mt-1",children:"簡易的な帳簿で申告できます"})]})]})]})]})]}),e.jsxs("div",{className:"bg-info-light border border-info/20 rounded-lg p-4 flex items-start gap-3",children:[e.jsx(_e,{className:"w-5 h-5 text-info flex-shrink-0 mt-0.5"}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-text-main font-medium",children:"青色申告がおすすめ！"}),e.jsx("p",{className:"text-sm text-text-muted mt-1",children:"Ainanceで取引を記録していれば、複式簿記の要件を満たしています。 65万円の控除で税金がお得になります。"})]})]})]}),q=()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold text-text-main mb-4",children:"収支の確認"}),e.jsxs("p",{className:"text-text-muted mb-6",children:[r,"年度の取引データから自動集計した結果です。"]})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4",children:[e.jsxs("div",{className:"bg-success-light border border-success/20 rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-success font-medium",children:"売上高"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:k(i.totalRevenue)})]}),e.jsxs("div",{className:"bg-error-light border border-error/20 rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-error font-medium",children:"経費合計"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:k(i.totalExpenses)})]}),e.jsxs("div",{className:"bg-primary-light border border-primary/20 rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-primary font-medium",children:"事業所得"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:k(i.netIncome)})]})]}),e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-5",children:[e.jsx("h4",{className:"font-medium text-text-main mb-4",children:"経費内訳（上位5件）"}),i.expensesByCategory.length>0?e.jsx("div",{className:"space-y-3",children:i.expensesByCategory.slice(0,5).map((n,f)=>e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"w-8 h-8 bg-surface-highlight rounded-lg flex items-center justify-center text-sm font-medium text-text-muted",children:f+1}),e.jsx("span",{className:"text-text-main",children:n.category})]}),e.jsxs("div",{className:"text-right",children:[e.jsx("span",{className:"font-medium text-text-main",children:k(n.amount)}),e.jsxs("span",{className:"text-text-muted text-sm ml-2",children:["(",ve(n.percentage),")"]})]})]},f))}):e.jsxs("p",{className:"text-text-muted text-center py-4",children:[r,"年度の経費データがありません"]})]}),i.totalRevenue===0&&i.totalExpenses===0&&e.jsxs("div",{className:"bg-warning-light border border-warning/20 rounded-lg p-4 flex items-start gap-3",children:[e.jsx(re,{className:"w-5 h-5 text-warning flex-shrink-0 mt-0.5"}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-text-main font-medium",children:"取引データがありません"}),e.jsxs("p",{className:"text-sm text-text-muted mt-1",children:[r,"年度の取引を登録してから確定申告を行ってください。",e.jsx(Z,{to:"/transactions",className:"text-primary hover:underline ml-1",children:"取引を登録する →"})]})]})]})]}),O=()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold text-text-main mb-4",children:"各種控除の入力"}),e.jsx("p",{className:"text-text-muted mb-6",children:"該当する控除を追加して金額を入力してください。控除が多いほど税金が安くなります。"})]}),e.jsx("div",{className:"space-y-4",children:l.map(n=>e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4",children:[e.jsxs("div",{className:"flex-1",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(ie,{className:"w-5 h-5 text-success"}),e.jsx("span",{className:"font-medium text-text-main",children:n.name})]}),e.jsx("p",{className:"text-sm text-text-muted mt-1 ml-7",children:n.description})]}),e.jsxs("div",{className:"flex items-center gap-3 ml-7 sm:ml-0",children:[e.jsxs("div",{className:"relative",children:[e.jsx("span",{className:"absolute left-3 top-1/2 -translate-y-1/2 text-text-muted",children:"¥"}),e.jsx("input",{type:"number",value:n.amount,onChange:f=>C(n.id,Number(f.target.value)),className:"input-base pl-8 w-40",placeholder:"金額",disabled:n.type==="basic"||n.type==="blue_return"})]}),n.type!=="basic"&&n.type!=="blue_return"&&e.jsx("button",{onClick:()=>g(n.id),className:"p-2 text-error hover:bg-error-light rounded-lg transition-colors",children:e.jsx(ye,{className:"w-5 h-5"})})]})]},n.id))}),e.jsxs("div",{className:"bg-surface-highlight border border-border rounded-xl p-5",children:[e.jsxs("h4",{className:"font-medium text-text-main mb-4 flex items-center gap-2",children:[e.jsx(Q,{className:"w-5 h-5"}),"控除を追加"]}),e.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-3",children:ne.filter(n=>!l.find(f=>f.type===n.type)).map(n=>e.jsxs("button",{onClick:()=>L(n.type),className:"flex items-center gap-3 p-3 bg-surface border border-border rounded-lg hover:border-primary hover:bg-primary-light transition-colors text-left",children:[e.jsx("div",{className:"w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center",children:e.jsx(Q,{className:"w-4 h-4 text-primary"})}),e.jsxs("div",{children:[e.jsx("p",{className:"font-medium text-text-main text-sm",children:n.name}),e.jsx("p",{className:"text-xs text-text-muted",children:n.description})]})]},n.type))})]}),e.jsxs("div",{className:"bg-success-light border border-success/20 rounded-xl p-5 flex items-center justify-between",children:[e.jsx("span",{className:"font-medium text-text-main",children:"控除合計"}),e.jsx("span",{className:"text-2xl font-bold text-success",children:k(i.totalDeductions)})]})]}),V=()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsxs("h3",{className:"text-lg font-semibold text-text-main mb-4 flex items-center gap-2",children:[e.jsx(X,{className:"w-5 h-5 text-primary"}),"AIによる節税アドバイス"]}),e.jsx("p",{className:"text-text-muted mb-6",children:"AIがあなたの収支データを分析し、節税のアドバイスを提供します。"})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-text-muted",children:"課税所得"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:k(i.taxableIncome)}),e.jsx("p",{className:"text-xs text-text-muted mt-2",children:"事業所得 - 各種控除"})]}),e.jsxs("div",{className:"bg-primary-light border border-primary/20 rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-primary font-medium",children:"予想所得税額"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:k(i.estimatedTax)}),e.jsx("p",{className:"text-xs text-text-muted mt-2",children:"※概算です。実際の税額とは異なる場合があります"})]})]}),p.length===0?e.jsx("button",{onClick:v,disabled:c,className:"btn-primary w-full py-4",children:c?e.jsxs(e.Fragment,{children:[e.jsx(Te,{className:"w-5 h-5 animate-spin"}),"AI分析中..."]}):e.jsxs(e.Fragment,{children:[e.jsx(X,{className:"w-5 h-5"}),"AIアドバイスを受ける"]})}):e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-5 space-y-4",children:[e.jsxs("div",{className:"flex items-center gap-2 text-primary",children:[e.jsx(X,{className:"w-5 h-5"}),e.jsx("span",{className:"font-medium",children:"AIからのアドバイス"})]}),e.jsx("ul",{className:"space-y-3",children:p.map((n,f)=>e.jsxs("li",{className:"flex items-start gap-3",children:[e.jsx(je,{className:"w-5 h-5 text-primary flex-shrink-0 mt-0.5"}),e.jsx("span",{className:"text-text-main",children:n})]},f))}),t>0&&e.jsx("div",{className:"bg-success-light border border-success/20 rounded-lg p-4 mt-4",children:e.jsxs("p",{className:"text-sm text-success font-medium",children:["推定節税可能額: ",k(t)]})})]})]}),xe=()=>{const n={fiscalYear:r,filingType:u?"blue":"white",revenue:i.totalRevenue,expenses:i.totalExpenses,netIncome:i.netIncome,expensesByCategory:i.expensesByCategory,deductions:l.filter(w=>w.isApplicable).map(w=>({type:w.type,name:w.name,amount:w.amount})),totalDeductions:i.totalDeductions,taxableIncome:i.taxableIncome,estimatedTax:i.estimatedTax},f=u?Pe(n):Re(n),T=u?`青色申告決算書_${r}年度.xtx`:`収支内訳書_${r}年度.xml`;Ee(f,T);const y=window.open("","_blank");y&&(y.document.write(`
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>e-Tax用ファイルプレビュー - ${r}年度</title>
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
        <h1>📄 ${u?"青色申告決算書":"収支内訳書"}（${r}年度）</h1>
        <div class="info">
            <p>⚠️ <strong>このXMLファイルは参考資料です。</strong></p>
            <p>正式な確定申告は、国税庁の確定申告書等作成コーナーをご利用ください。XMLデータは入力の参考にお使いいただけます。</p>
        </div>
        <pre>${f.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</pre>
        <div class="actions">
            <button class="secondary" onclick="window.close()">✕ 閉じる</button>
        </div>
    </div>
</body>
</html>
            `),y.document.close())},me=()=>{const[n,f]=R.useState(null),T=async(y,w)=>{try{await navigator.clipboard.writeText(String(y).replace(/[¥,]/g,"")),f(w),setTimeout(()=>f(null),2e3)}catch(_){console.error("コピーに失敗しました:",_)}};return e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsxs("h3",{className:"text-lg font-semibold text-text-main mb-4 flex items-center gap-2",children:[e.jsx(Y,{className:"w-5 h-5 text-primary"}),"確定申告書の作成"]}),e.jsx("p",{className:"text-text-muted mb-2",children:"入力内容を確認して、書類を作成してください。"}),e.jsx("p",{className:"text-xs text-text-muted",children:"💡 各項目の右側のコピーボタンで、e-Tax入力時にそのまま貼り付けできます"})]}),e.jsxs("div",{className:"bg-surface border border-border rounded-xl divide-y divide-border",children:[e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"申告年度"}),e.jsx("div",{className:"flex items-center gap-2",children:e.jsxs("span",{className:"font-medium text-text-main",children:[r,"年度"]})})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"申告方法"}),e.jsx("span",{className:"font-medium text-text-main",children:u?"青色申告":"白色申告"})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"売上高"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-success",children:k(i.totalRevenue)}),e.jsx("button",{onClick:()=>T(i.totalRevenue,"revenue"),className:`p-1.5 rounded transition-colors ${n==="revenue"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:n==="revenue"?e.jsx(E,{className:"w-4 h-4"}):e.jsx(F,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"経費合計"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-error",children:k(i.totalExpenses)}),e.jsx("button",{onClick:()=>T(i.totalExpenses,"expenses"),className:`p-1.5 rounded transition-colors ${n==="expenses"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:n==="expenses"?e.jsx(E,{className:"w-4 h-4"}):e.jsx(F,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"事業所得"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-text-main",children:k(i.netIncome)}),e.jsx("button",{onClick:()=>T(i.netIncome,"netIncome"),className:`p-1.5 rounded transition-colors ${n==="netIncome"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:n==="netIncome"?e.jsx(E,{className:"w-4 h-4"}):e.jsx(F,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"控除合計"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-primary",children:k(i.totalDeductions)}),e.jsx("button",{onClick:()=>T(i.totalDeductions,"deductions"),className:`p-1.5 rounded transition-colors ${n==="deductions"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:n==="deductions"?e.jsx(E,{className:"w-4 h-4"}):e.jsx(F,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"課税所得"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-text-main",children:k(i.taxableIncome)}),e.jsx("button",{onClick:()=>T(i.taxableIncome,"taxableIncome"),className:`p-1.5 rounded transition-colors ${n==="taxableIncome"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:n==="taxableIncome"?e.jsx(E,{className:"w-4 h-4"}):e.jsx(F,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center bg-primary-light",children:[e.jsx("span",{className:"font-medium text-text-main",children:"予想所得税額"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-bold text-primary text-lg",children:k(i.estimatedTax)}),e.jsx("button",{onClick:()=>T(i.estimatedTax,"tax"),className:`p-1.5 rounded transition-colors ${n==="tax"?"bg-success text-white":"hover:bg-primary/20 text-primary"}`,title:"コピー",children:n==="tax"?e.jsx(E,{className:"w-4 h-4"}):e.jsx(F,{className:"w-4 h-4"})})]})]})]}),e.jsxs("div",{className:"space-y-4",children:[e.jsx("h4",{className:"text-md font-medium text-text-main",children:"📥 ダウンロード"}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-4",children:[e.jsxs("button",{onClick:$,className:"btn-primary py-4 flex items-center justify-center gap-2",children:[e.jsx(le,{className:"w-5 h-5"}),"申告書プレビュー"]}),e.jsxs("button",{onClick:xe,className:"btn-outline py-4 flex items-center justify-center gap-2 border-2 border-blue-500 text-blue-500 hover:bg-blue-500/10",children:[e.jsx($e,{className:"w-5 h-5"}),"e-Tax用XMLファイル"]})]}),e.jsxs("div",{className:"bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4",children:[e.jsx("h5",{className:"text-sm font-medium text-text-main mb-3 flex items-center gap-2",children:"✨ テンプレート自動転記（NEW!）"}),e.jsx("p",{className:"text-xs text-text-muted mb-3",children:(s==null?void 0:s.business_type)==="corporation"?"法人税申告書・決算報告書にAinanceのデータを自動入力したPDFを生成します":"国税庁の申告書テンプレートにAinanceのデータを自動入力したPDFを生成します"}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-3",children:[(s==null?void 0:s.business_type)!=="corporation"&&e.jsxs(e.Fragment,{children:[e.jsxs("button",{onClick:async()=>{var y;try{const w={revenue:i.totalRevenue,expenses:i.totalExpenses,netIncome:i.netIncome,expensesByCategory:i.expensesByCategory,deductions:{basic:((y=l.find(he=>he.type==="basic"))==null?void 0:y.amount)||48e4,blueReturn:u?65e4:0},taxableIncome:i.taxableIncome,estimatedTax:i.estimatedTax,fiscalYear:r,isBlueReturn:u},{pdfBytes:_,filename:ue}=await U("tax_return_b",w);K(_,ue),M(_)}catch(w){console.error("PDF生成エラー:",w),alert("PDF生成に失敗しました。テンプレートファイルを確認してください。")}},className:"px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium flex items-center justify-center gap-2",children:[e.jsx(Y,{className:"w-4 h-4"}),"確定申告書B"]}),u&&e.jsxs("button",{onClick:async()=>{try{const y={revenue:i.totalRevenue,expenses:i.totalExpenses,netIncome:i.netIncome,expensesByCategory:i.expensesByCategory,deductions:{blueReturn:65e4},taxableIncome:i.taxableIncome,estimatedTax:i.estimatedTax,fiscalYear:r,isBlueReturn:!0},{pdfBytes:w,filename:_}=await U("blue_return",y);K(w,_),M(w)}catch(y){console.error("PDF生成エラー:",y),alert("PDF生成に失敗しました。テンプレートファイルを確認してください。")}},className:"px-4 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium flex items-center justify-center gap-2",children:[e.jsx(Y,{className:"w-4 h-4"}),"青色申告決算書"]})]}),(s==null?void 0:s.business_type)==="corporation"&&e.jsxs(e.Fragment,{children:[e.jsxs("button",{onClick:async()=>{try{const y={revenue:i.totalRevenue,expenses:i.totalExpenses,netIncome:i.netIncome,expensesByCategory:i.expensesByCategory,deductions:{},taxableIncome:i.taxableIncome,estimatedTax:i.estimatedTax,fiscalYear:r,isBlueReturn:!1,businessType:"corporation",companyName:(s==null?void 0:s.company_name)||"株式会社",representativeName:(s==null?void 0:s.representative_name)||""},{pdfBytes:w,filename:_}=await U("corporate_tax",y);K(w,_),M(w)}catch(y){console.error("PDF生成エラー:",y),alert("PDF生成に失敗しました。")}},className:"px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium flex items-center justify-center gap-2",children:[e.jsx(Y,{className:"w-4 h-4"}),"法人税申告書"]}),e.jsxs("button",{onClick:async()=>{try{const y={revenue:i.totalRevenue,expenses:i.totalExpenses,netIncome:i.netIncome,expensesByCategory:i.expensesByCategory,deductions:{},taxableIncome:i.taxableIncome,estimatedTax:i.estimatedTax,fiscalYear:r,isBlueReturn:!1,businessType:"corporation",companyName:(s==null?void 0:s.company_name)||"株式会社",representativeName:(s==null?void 0:s.representative_name)||""},{pdfBytes:w,filename:_}=await U("financial_statement",y);K(w,_),M(w)}catch(y){console.error("PDF生成エラー:",y),alert("PDF生成に失敗しました。")}},className:"px-4 py-3 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors text-sm font-medium flex items-center justify-center gap-2",children:[e.jsx(Y,{className:"w-4 h-4"}),"決算報告書"]})]})]})]})]}),e.jsxs("div",{className:"bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-xl p-5",children:[e.jsxs("h4",{className:"text-md font-medium text-text-main mb-3 flex items-center gap-2",children:[e.jsx(se,{className:"w-5 h-5 text-blue-500"}),"e-Taxで直接申告する"]}),e.jsxs("ol",{className:"text-sm text-text-muted space-y-2 mb-4",children:[e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx("span",{className:"flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs",children:"1"}),"上のコピーボタンで各数値をコピー"]}),e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx("span",{className:"flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs",children:"2"}),"確定申告書等作成コーナーにアクセス"]}),e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx("span",{className:"flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs",children:"3"}),"コピーした数値を貼り付けて入力"]}),e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx("span",{className:"flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs",children:"4"}),"マイナンバーカードで電子署名 → 送信完了！"]})]}),e.jsxs("a",{href:"https://www.keisan.nta.go.jp/kyoutu/ky/smsp/top",target:"_blank",rel:"noopener noreferrer",className:"inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm",children:[e.jsx(se,{className:"w-4 h-4"}),"確定申告書等作成コーナーを開く"]}),e.jsx(Z,{to:"/tax-filing-guide",className:"inline-flex items-center gap-2 px-4 py-2 ml-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm",children:"📖 詳しい申告ガイドを見る"})]}),e.jsxs("div",{className:"bg-warning-light border border-warning/20 rounded-lg p-4 flex items-start gap-3",children:[e.jsx(re,{className:"w-5 h-5 text-warning flex-shrink-0 mt-0.5"}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-text-main font-medium",children:"ご注意ください"}),e.jsxs("ul",{className:"text-sm text-text-muted mt-2 space-y-1 list-disc list-inside",children:[e.jsx("li",{children:"この計算は概算です。正確な税額は税務署にご確認ください"}),e.jsx("li",{children:"確定申告の期限は翌年3月15日です（例：2025年度分は2026年3月15日まで）"}),e.jsx("li",{children:"青色申告特別控除65万円の適用には電子申告が必要です"})]})]})]})]})},de=()=>{switch(x){case 1:return e.jsx(D,{});case 2:return e.jsx(q,{});case 3:return e.jsx(O,{});case 4:return e.jsx(V,{});case 5:return e.jsx(me,{});default:return null}};return e.jsx("div",{className:"min-h-screen bg-background",children:e.jsxs("div",{className:"max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8",children:[e.jsxs("div",{className:"mb-8",children:[e.jsxs(Z,{to:"/dashboard",className:"flex items-center text-primary hover:text-primary-hover mb-4",children:[e.jsx(ae,{className:"h-5 w-5 mr-2"}),"ダッシュボードに戻る"]}),e.jsx("h1",{className:"text-3xl font-bold text-text-main mb-2",children:"確定申告サポート"}),e.jsx("p",{className:"text-text-muted",children:"5つのステップで簡単に確定申告を完了できます"})]}),e.jsx(P,{}),e.jsx("div",{className:"bg-surface border border-border rounded-xl p-6 mb-6",children:de()}),e.jsxs("div",{className:"flex justify-between",children:[e.jsxs("button",{onClick:J,disabled:x===1,className:`btn-ghost ${x===1?"opacity-50 cursor-not-allowed":""}`,children:[e.jsx(ae,{className:"w-5 h-5"}),"戻る"]}),x<H.length?e.jsxs("button",{onClick:B,className:"btn-primary",children:["次へ",e.jsx(Ce,{className:"w-5 h-5"})]}):e.jsxs("button",{onClick:$,className:"btn-success",children:[e.jsx(ie,{className:"w-5 h-5"}),"完了"]})]})]})})};export{Ge as default};
