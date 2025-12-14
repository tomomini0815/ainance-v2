import{c as le,a as pe,b as ge,d as be,r as D,j as e,L as Q,F as Y,P as ee,S as W,R as fe,g as E,t as je,T as ye}from"./index-C2AHQuqb.js";import{g as Ne,c as we,f as k,E as ne,A as ae,a as ve,b as ke}from"./TaxFilingService-BGiTCoXS.js";import{P as se,S as q,r as I}from"./PDFButton-D5AJvHIN.js";import{A as ie}from"./arrow-left-BMWM9D8K.js";import{C as Ie}from"./calculator-HRz-bOph.js";import{D as xe}from"./download-D7LiLmqD.js";import{A as Ce}from"./arrow-right-CPbQ7xe8.js";import{C as re}from"./circle-check-big-BPEw27Gb.js";import{C as z}from"./copy-B-dnDMHB.js";import{C as oe}from"./circle-alert-C2B9Sy0N.js";import{R as Te}from"./refresh-cw-D6aV69_L.js";/**
 * @license lucide-react v0.540.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Se=[["path",{d:"M10 12.5 8 15l2 2.5",key:"1tg20x"}],["path",{d:"m14 12.5 2 2.5-2 2.5",key:"yinavb"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z",key:"1mlx9k"}]],$e=le("file-code",Se);/**
 * @license lucide-react v0.540.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ae=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 16v-4",key:"1dtifu"}],["path",{d:"M12 8h.01",key:"e9boi3"}]],_e=le("info",Ae);function Re(a){const s=new Date,f=s.toISOString().replace(/[-:]/g,"").split(".")[0],x={売上高:"AA100",仕入高:"AB100",消耗品費:"AC100",旅費交通費:"AC110",通信費:"AC120",広告宣伝費:"AC130",接待交際費:"AC140",水道光熱費:"AC150",地代家賃:"AC160",外注費:"AC170",減価償却費:"AC180",雑費:"AC190"},y=a.expensesByCategory.map((m,d)=>{const u=x[m.category]||`AC${200+d}`;return`    <${u}>${m.amount}</${u}>`}).join(`
`);return`<?xml version="1.0" encoding="UTF-8"?>
<!--
  Ainance e-Tax Export File
  生成日時: ${s.toLocaleString("ja-JP")}
  対象年度: ${a.fiscalYear}年度
  申告区分: ${a.filingType==="blue"?"青色申告":"白色申告"}
-->
<申告書等送信票等>
  <作成日時>${f}</作成日時>
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
${y}
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
</申告書等送信票等>`}function Pe(a){return`<?xml version="1.0" encoding="UTF-8"?>
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
</収支内訳書>`}function De(a,s){const f=new Blob(["\uFEFF"+a],{type:"application/xml;charset=utf-8"}),x=URL.createObjectURL(f),y=document.createElement("a");y.href=x,y.download=s,document.body.appendChild(y),y.click(),document.body.removeChild(y),setTimeout(()=>URL.revokeObjectURL(x),1e3)}const g={事業_営業等:{x:475,y:648},事業所得_営業等:{x:475,y:458},総所得金額:{x:475,y:318},社会保険料控除:{x:475,y:268},小規模企業共済等掛金控除:{x:475,y:248},生命保険料控除:{x:475,y:228},地震保険料控除:{x:475,y:208},配偶者控除:{x:475,y:168},扶養控除:{x:475,y:148},基礎控除:{x:475,y:128},所得控除合計:{x:475,y:88},住所:{x:120,y:780},氏名:{x:120,y:755},電話番号:{x:350,y:755}},$={売上金額:{x:430,y:680,width:100},売上原価:{x:430,y:640,width:100},差引金額:{x:430,y:600,width:100},租税公課:{x:430,y:540,width:80},荷造運賃:{x:430,y:520,width:80},水道光熱費:{x:430,y:500,width:80},旅費交通費:{x:430,y:480,width:80},通信費:{x:430,y:460,width:80},広告宣伝費:{x:430,y:440,width:80},接待交際費:{x:430,y:420,width:80},損害保険料:{x:430,y:400,width:80},修繕費:{x:430,y:380,width:80},消耗品費:{x:430,y:360,width:80},減価償却費:{x:430,y:340,width:80},福利厚生費:{x:430,y:320,width:80},給料賃金:{x:430,y:300,width:80},外注工賃:{x:430,y:280,width:80},地代家賃:{x:430,y:260,width:80},支払利息:{x:430,y:240,width:80},雑費:{x:430,y:220,width:80},経費計:{x:430,y:180,width:100},青色申告特別控除前の所得金額:{x:430,y:140,width:100},青色申告特別控除額:{x:430,y:120,width:100},所得金額:{x:430,y:80,width:100},屋号:{x:100,y:750,width:150},住所:{x:100,y:720,width:200},氏名:{x:100,y:690,width:150}},te={交通費:"Travel & Transportation",旅費交通費:"Travel & Transportation",通信費:"Communication",水道光熱費:"Utilities",消耗品費:"Supplies",接待交際費:"Entertainment",広告宣伝費:"Advertising",地代家賃:"Rent",外注費:"Outsourcing",給与:"Salaries",雑費:"Miscellaneous",減価償却費:"Depreciation",修繕費:"Repairs",保険料:"Insurance",福利厚生費:"Benefits",支払利息:"Interest",租税公課:"Taxes & Dues",荷造運賃:"Shipping",その他:"Other",未分類:"Uncategorized"};async function Ee(a,s){const f=await se.load(a,{ignoreEncryption:!0}),y=f.getPages()[0],c=await f.embedFont(q.Helvetica),m=l=>l.toLocaleString("ja-JP"),d=(l,o,C,r=9)=>{y.drawText(l,{x:o,y:C,size:r,font:c,color:I(0,0,0)})};d(m(s.revenue),g.事業_営業等.x,g.事業_営業等.y),d(m(s.netIncome),g.事業所得_営業等.x,g.事業所得_営業等.y),d(m(s.netIncome),g.総所得金額.x,g.総所得金額.y),s.deductions.socialInsurance&&d(m(s.deductions.socialInsurance),g.社会保険料控除.x,g.社会保険料控除.y),s.deductions.smallBusinessMutual&&d(m(s.deductions.smallBusinessMutual),g.小規模企業共済等掛金控除.x,g.小規模企業共済等掛金控除.y),s.deductions.lifeInsurance&&d(m(s.deductions.lifeInsurance),g.生命保険料控除.x,g.生命保険料控除.y),s.deductions.earthquakeInsurance&&d(m(s.deductions.earthquakeInsurance),g.地震保険料控除.x,g.地震保険料控除.y),s.deductions.spouse&&d(m(s.deductions.spouse),g.配偶者控除.x,g.配偶者控除.y),s.deductions.dependents&&d(m(s.deductions.dependents),g.扶養控除.x,g.扶養控除.y),s.deductions.basic&&d(m(s.deductions.basic),g.基礎控除.x,g.基礎控除.y);const u=Object.values(s.deductions).reduce((l,o)=>l+(o||0),0);return d(m(u),g.所得控除合計.x,g.所得控除合計.y),s.address&&d(s.address,g.住所.x,g.住所.y,8),s.name&&d(s.name,g.氏名.x,g.氏名.y),s.phone&&d(s.phone,g.電話番号.x,g.電話番号.y),f.save()}async function Fe(a,s){const f=await se.load(a,{ignoreEncryption:!0}),y=f.getPages()[0],c=await f.embedFont(q.Helvetica),m=o=>o.toLocaleString("ja-JP"),d=(o,C,r,N=9)=>{y.drawText(o,{x:C,y:r,size:N,font:c,color:I(0,0,0)})};d(m(s.revenue),$.売上金額.x,$.売上金額.y);const u={};s.expensesByCategory.forEach(o=>{const C=te[o.category]||"雑費";u[C]=(u[C]||0)+o.amount}),Object.entries(u).forEach(([o,C])=>{const r=$[o];r&&d(m(C),r.x,r.y)}),d(m(s.expenses),$.経費計.x,$.経費計.y),d(m(s.revenue-s.expenses),$.差引金額.x,$.差引金額.y),d(m(s.netIncome),$.青色申告特別控除前の所得金額.x,$.青色申告特別控除前の所得金額.y),s.isBlueReturn&&s.deductions.blueReturn&&d(m(s.deductions.blueReturn),$.青色申告特別控除額.x,$.青色申告特別控除額.y);const l=s.netIncome-(s.deductions.blueReturn||0);return d(m(Math.max(0,l)),$.所得金額.x,$.所得金額.y),s.tradeName&&d(s.tradeName,$.屋号.x,$.屋号.y),s.address&&d(s.address,$.住所.x,$.住所.y,8),s.name&&d(s.name,$.氏名.x,$.氏名.y),f.save()}async function M(a,s){if(a==="corporate_tax"||a==="financial_statement"){const c=await ce(a,s),m=a==="corporate_tax"?`法人税申告書_${s.fiscalYear}年度_入力済み.pdf`:`決算報告書_${s.fiscalYear}年度_入力済み.pdf`;return{pdfBytes:c,filename:m}}const f=a==="tax_return_b"?"/templates/tax_return_r05.pdf":"/templates/blue_return_r05.pdf";let x;try{const c=await fetch(f);if(!c.ok)throw new Error(`テンプレートの読み込みに失敗: ${c.statusText}`);const m=await c.arrayBuffer();x=a==="tax_return_b"?await Ee(m,s):await Fe(m,s)}catch(c){console.warn("テンプレート読み込み失敗、白紙から生成します:",c),x=await ce(a,s)}const y=a==="tax_return_b"?`確定申告書B_${s.fiscalYear}年度_入力済み.pdf`:`青色申告決算書_${s.fiscalYear}年度_入力済み.pdf`;return{pdfBytes:x,filename:y}}async function ce(a,s){var i,J,L,O,U;const f=await se.create(),x=f.addPage([595.28,841.89]),y=await f.embedFont(q.Helvetica),c=await f.embedFont(q.HelveticaBold),{width:m,height:d}=x.getSize(),u=h=>h?/[^\x00-\x7F]/.test(h)?h.includes("株式会社")||h.includes("合同会社")?"[Corporation]":"[See Ainance App]":h:"",l=h=>h===0?"0":h.toLocaleString("en-US"),o={primary:I(.2,.4,.8),corporate:I(.4,.2,.6),header:I(.15,.15,.15),text:I(.1,.1,.1),muted:I(.4,.4,.4),line:I(.7,.7,.7),highlight:I(.95,.95,1),red:I(.8,.2,.2),green:I(.2,.6,.3)},C=a==="corporate_tax"||a==="financial_statement"?o.corporate:o.primary,r=(h,T,w,A={})=>{const P=A.size||10,F=A.font||y,V=A.color||o.text;let K=T;if(A.align==="right"){const Z=F.widthOfTextAtSize(h,P);K=T-Z}x.drawText(h,{x:K,y:w,size:P,font:F,color:V})},N=(h,T,w,A,P=.5)=>{x.drawLine({start:{x:h,y:T},end:{x:w,y:A},thickness:P,color:o.line})},R=(h,T,w,A,P)=>{x.drawRectangle({x:h,y:T,width:w,height:A,color:P})},p=(h,T,w,A=!1)=>{A&&R(50,w-5,495,20,o.highlight),N(50,w-5,545,w-5),r(h,60,w),r(T,530,w,{align:"right"})},B={tax_return_b:"Kakutei Shinkokusho B (Tax Return Form B)",blue_return:"Aoiro Shinkoku Kessansho (Blue Return Statement)",corporate_tax:"Houjinzei Shinkokusho (Corporate Tax Return)",financial_statement:"Kessan Houkokusho (Financial Statement)"};R(0,d-60,m,60,C),r(B[a],50,d-40,{size:14,font:c,color:I(1,1,1)});let t=d-85;if(a==="corporate_tax"||a==="financial_statement"?(s.companyName&&r(`Company: ${u(s.companyName)}`,50,t,{size:11,font:c}),t-=20,r(`Fiscal Year: ${s.fiscalYear}`,50,t,{size:10}),s.representativeName&&r(`Representative: ${u(s.representativeName)}`,300,t,{size:10})):r(`Fiscal Year: ${s.fiscalYear} (Reiwa ${s.fiscalYear-2018})`,50,t,{size:11}),r(`Generated: ${new Date().toLocaleDateString("ja-JP")}`,400,t,{size:9,color:o.muted}),t-=30,N(50,t,545,t,1),t-=25,a==="corporate_tax"){r("SECTION 1: Houjin Joho (Corporate Information)",50,t,{size:12,font:c,color:C}),t-=25,s.companyName&&p("Company Name (Kaisha Mei)",u(s.companyName),t),t-=20,s.corporateNumber&&p("Corporate Number (Houjin Bangou)",u(s.corporateNumber),t),t-=20,s.capital&&p("Capital (Shihonkin)",l(s.capital)+" JPY",t),t-=20,s.address&&p("Address (Juusho)",u(s.address),t),t-=30,r("SECTION 2: Son'eki Keisan (Profit & Loss)",50,t,{size:12,font:c,color:C}),t-=25,p("Revenue (Uriage)",l(s.revenue)+" JPY",t,!0),t-=20,p("Expenses (Keihi)",l(s.expenses)+" JPY",t),t-=20,p("Net Income (Junrieki)",l(s.netIncome)+" JPY",t,!0),t-=35,r("SECTION 3: Zeigaku Keisan (Tax Calculation)",50,t,{size:12,font:c,color:C}),t-=25;const h=((i=s.corporateTax)==null?void 0:i.taxableIncome)||s.taxableIncome;p("Taxable Income (Kazei Shotoku)",l(h)+" JPY",t),t-=20;const T=h<=8e6?.15:.232,w=((J=s.corporateTax)==null?void 0:J.corporateTaxAmount)||Math.floor(h*T);p("Corporate Tax Rate",`${(T*100).toFixed(1)}%`,t),t-=20,p("Corporate Tax (Houjinzei)",l(w)+" JPY",t),t-=20;const A=((L=s.corporateTax)==null?void 0:L.localCorporateTax)||Math.floor(w*.103);p("Local Corporate Tax (Chihou Houjinzei)",l(A)+" JPY",t),t-=20;const P=((O=s.corporateTax)==null?void 0:O.businessTax)||Math.floor(h*.07);p("Business Tax (Jigyouzei)",l(P)+" JPY",t),t-=25;const F=((U=s.corporateTax)==null?void 0:U.totalTax)||w+A+P;R(50,t-8,495,30,I(1,.95,.95)),N(50,t-8,545,t-8,1),N(50,t+22,545,t+22,1),r("Total Tax (Zeigaku Goukei) - ESTIMATED",60,t+5,{font:c}),r(l(F)+" JPY",530,t+5,{align:"right",font:c,color:o.red})}else if(a==="financial_statement")r("SECTION 1: Son'eki Keisansho (P/L Statement)",50,t,{size:12,font:c,color:C}),t-=25,R(50,t-5,495,18,I(.9,.9,.9)),N(50,t-5,545,t-5),N(50,t+13,545,t+13),r("Item",60,t,{font:c,size:9}),r("Amount",530,t,{align:"right",font:c,size:9}),t-=22,p("Sales Revenue (Uriage Takadaka)",l(s.revenue)+" JPY",t,!0),t-=20,s.expensesByCategory.forEach((h,T)=>{const w=te[h.category]||"Other";T%2===0&&R(50,t-5,495,18,I(.98,.98,.98)),N(50,t-5,545,t-5),r(w,70,t,{size:9}),r(l(h.amount)+" JPY",530,t,{align:"right",size:9}),t-=18}),t-=5,p("Total Expenses (Keihi Goukei)",l(s.expenses)+" JPY",t),t-=25,R(50,t-8,495,26,I(.95,1,.95)),N(50,t-8,545,t-8,1),N(50,t+18,545,t+18,1),r("Operating Income (Eigyo Rieki)",60,t+2,{font:c}),r(l(s.netIncome)+" JPY",530,t+2,{align:"right",font:c,color:s.netIncome>=0?o.green:o.red}),t-=45,r("SECTION 2: Taisyaku Taishouhyo (Balance Sheet Summary)",50,t,{size:12,font:c,color:C}),t-=25,p("Assets (Shisan) - Estimated",l(s.revenue*.4)+" JPY",t),t-=20,p("Liabilities (Fusai) - Estimated",l(s.expenses*.3)+" JPY",t),t-=20,p("Equity (Junshisan) - Estimated",l(s.revenue*.4-s.expenses*.3)+" JPY",t,!0);else if(a==="tax_return_b"){r("SECTION 1: Shuunyu Kingaku (Income)",50,t,{size:12,font:c,color:o.primary}),t-=25,p("A. Jigyo (Business) - Eigyo (Sales/Services)",l(s.revenue)+" JPY",t,!0),t-=25,t-=15,r("SECTION 2: Shotoku Kingaku (Net Income)",50,t,{size:12,font:c,color:o.primary}),t-=25,p("A. Jigyo Shotoku (Business Income)",l(s.netIncome)+" JPY",t),t-=20,p("Total Income",l(s.netIncome)+" JPY",t,!0),t-=30,t-=15,r("SECTION 3: Shotoku Koujo (Deductions)",50,t,{size:12,font:c,color:o.primary}),t-=25,s.deductions.basic&&(p("Kiso Koujo (Basic Deduction)",l(s.deductions.basic)+" JPY",t),t-=20),s.deductions.blueReturn&&s.deductions.blueReturn>0&&(p("Aoiro Shinkoku Tokubetsu Koujo (Blue Return Special)",l(s.deductions.blueReturn)+" JPY",t),t-=20),s.deductions.socialInsurance&&(p("Shakai Hoken (Social Insurance)",l(s.deductions.socialInsurance)+" JPY",t),t-=20),s.deductions.lifeInsurance&&(p("Seimei Hoken (Life Insurance)",l(s.deductions.lifeInsurance)+" JPY",t),t-=20);const h=Object.values(s.deductions).reduce((T,w)=>T+(w||0),0);p("Total Deductions",l(h)+" JPY",t,!0),t-=35,t-=15,r("SECTION 4: Zeigaku Keisan (Tax Calculation)",50,t,{size:12,font:c,color:o.primary}),t-=25,p("Kazei Shotoku (Taxable Income)",l(s.taxableIncome)+" JPY",t),t-=25,R(50,t-8,495,30,I(1,.95,.95)),N(50,t-8,545,t-8,1),N(50,t+22,545,t+22,1),r("Shotokuzei (Income Tax) - ESTIMATED",60,t+5,{font:c}),r(l(s.estimatedTax)+" JPY",530,t+5,{align:"right",font:c,color:o.red})}else if(r("SECTION 1: Uriage (Revenue)",50,t,{size:12,font:c,color:o.primary}),t-=25,p("A. Uriage (Sales Revenue)",l(s.revenue)+" JPY",t,!0),t-=30,t-=15,r("SECTION 2: Keihi (Expenses)",50,t,{size:12,font:c,color:o.primary}),t-=25,R(50,t-5,495,18,I(.9,.9,.9)),N(50,t-5,545,t-5),N(50,t+13,545,t+13),r("Category",60,t,{font:c,size:9}),r("Amount",530,t,{align:"right",font:c,size:9}),t-=22,s.expensesByCategory.forEach((h,T)=>{const w=te[h.category]||"Other";T%2===0&&R(50,t-5,495,18,I(.98,.98,.98)),N(50,t-5,545,t-5),r(w,60,t,{size:9}),r(l(h.amount)+" JPY",530,t,{align:"right",size:9}),t-=18}),t-=5,p("Total Expenses",l(s.expenses)+" JPY",t,!0),t-=35,t-=15,r("SECTION 3: Shotoku Keisan (Income Calculation)",50,t,{size:12,font:c,color:o.primary}),t-=25,p("Uriage - Keihi (Gross Profit)",l(s.netIncome)+" JPY",t),t-=20,s.isBlueReturn&&s.deductions.blueReturn){p("Aoiro Tokubetsu Koujo (Blue Return Deduction)","-"+l(s.deductions.blueReturn)+" JPY",t),t-=25;const h=Math.max(0,s.netIncome-s.deductions.blueReturn);R(50,t-8,495,30,I(.95,1,.95)),N(50,t-8,545,t-8,1),N(50,t+22,545,t+22,1),r("Final Business Income (Shotoku Kingaku)",60,t+5,{font:c}),r(l(h)+" JPY",530,t+5,{align:"right",font:c,color:o.green})}return N(50,60,545,60),a==="corporate_tax"||a==="financial_statement"?(r("* This document is generated by Ainance for reference purposes only.",50,45,{size:7,color:o.muted}),r("* For official corporate tax filing, please consult a certified tax accountant or use e-Tax.",50,35,{size:7,color:o.muted}),r("* Visit: https://www.e-tax.nta.go.jp/",50,25,{size:7,color:C})):(r("* This document is generated by Ainance for reference purposes only.",50,45,{size:7,color:o.muted}),r("* For official tax filing, please use the National Tax Agency e-Tax system.",50,35,{size:7,color:o.muted}),r("* Visit: https://www.keisan.nta.go.jp/",50,25,{size:7,color:o.primary})),f.save()}function H(a,s){const f=new Blob([new Uint8Array(a)],{type:"application/pdf"}),x=URL.createObjectURL(f),y=document.createElement("a");y.href=x,y.download=s,document.body.appendChild(y),y.click(),document.body.removeChild(y),setTimeout(()=>URL.revokeObjectURL(x),1e3)}function X(a){const s=new Blob([new Uint8Array(a)],{type:"application/pdf"}),f=URL.createObjectURL(s);window.open(f,"_blank")}const G=[{id:1,title:"基本情報",icon:Y,description:"確定申告の基本設定"},{id:2,title:"収支確認",icon:Ie,description:"売上・経費の確認"},{id:3,title:"控除入力",icon:ee,description:"各種控除の入力"},{id:4,title:"AI診断",icon:W,description:"AIによる節税アドバイス"},{id:5,title:"申告書作成",icon:xe,description:"PDFダウンロード"}],Ge=()=>{const{user:a}=pe(),{currentBusinessType:s}=ge(),{transactions:f}=be(a==null?void 0:a.id,s==null?void 0:s.business_type),[x,y]=D.useState(1),[c,m]=D.useState(!1),d=new Date().getFullYear(),[u,l]=D.useState(d-1),[o,C]=D.useState(!0),[r,N]=D.useState([]),[R,p]=D.useState([]),[B,t]=D.useState(0);D.useEffect(()=>{N(Ne(o))},[o]);const i=D.useMemo(()=>we(f,u,(s==null?void 0:s.business_type)||"individual",r),[f,u,s,r]),J=()=>{x<G.length&&y(x+1)},L=()=>{x>1&&y(x-1)},O=n=>{const b=ae.find(S=>S.type===n);b&&!r.find(S=>S.type===n)&&N([...r,{id:Date.now().toString(),...b,amount:0,isApplicable:!0}])},U=n=>{N(r.filter(b=>b.id!==n))},h=(n,b)=>{N(r.map(S=>S.id===n?{...S,amount:b}:S))},T=async()=>{m(!0);try{const n=await ke(i,{});p(n.suggestions),t(n.estimatedSavings)}catch(n){console.error("AI診断エラー:",n)}finally{m(!1)}},w=()=>{const n=`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
           確定申告書（${u}年度）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

申告方法: ${o?"青色申告":"白色申告"}
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
${r.filter(_=>_.isApplicable).map(_=>`${_.name.padEnd(20,"　")}: ${k(_.amount)}`).join(`
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
`.trim(),b=new Blob(["\uFEFF"+n],{type:"text/plain;charset=utf-8"}),S=URL.createObjectURL(b),j=document.createElement("a");j.href=S,j.download=`確定申告書_${u}年度.txt`,document.body.appendChild(j),j.click(),document.body.removeChild(j);const v=window.open("","_blank");v&&(v.document.write(`
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>確定申告書プレビュー - ${u}年度</title>
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
        <p class="subtitle">${u}年度 | ${o?"青色申告":"白色申告"} | 作成日: ${new Date().toLocaleDateString("ja-JP")}</p>
        <pre>${n}</pre>
        <div class="actions">
            <button class="print-btn" onclick="window.print()">🖨️ 印刷する</button>
            <button class="close-btn" onclick="window.close()">✕ 閉じる</button>
        </div>
    </div>
</body>
</html>
            `),v.document.close()),setTimeout(()=>URL.revokeObjectURL(S),1e3)},A=()=>e.jsx("div",{className:"mb-8",children:e.jsx("div",{className:"flex items-center justify-between",children:G.map((n,b)=>e.jsxs(fe.Fragment,{children:[e.jsxs("div",{className:"flex flex-col items-center",children:[e.jsx("div",{className:`w-10 h-10 rounded-full flex items-center justify-center transition-all ${x>n.id?"bg-success text-white":x===n.id?"bg-primary text-white":"bg-surface-highlight text-text-muted"}`,children:x>n.id?e.jsx(E,{className:"w-5 h-5"}):e.jsx(n.icon,{className:"w-5 h-5"})}),e.jsx("span",{className:`text-xs mt-2 hidden sm:block ${x>=n.id?"text-text-main font-medium":"text-text-muted"}`,children:n.title})]}),b<G.length-1&&e.jsx("div",{className:`flex-1 h-1 mx-2 rounded ${x>n.id?"bg-success":"bg-surface-highlight"}`})]},n.id))})}),P=()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold text-text-main mb-4",children:"確定申告の基本設定"}),e.jsx("p",{className:"text-text-muted mb-6",children:"確定申告を行う年度と申告方法を選択してください。"})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-text-main mb-2",children:"申告年度"}),e.jsx("select",{value:u,onChange:n=>l(Number(n.target.value)),className:"input-base",children:[d,...Array.from({length:4},(n,b)=>d-1-b)].map(n=>e.jsxs("option",{value:n,children:[n,"年度（",n,"年1月〜12月）",n===d&&" ※進行中"]},n))})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-text-main mb-2",children:"申告方法"}),e.jsxs("div",{className:"space-y-3",children:[e.jsxs("label",{className:"flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-surface-highlight transition-colors",children:[e.jsx("input",{type:"radio",checked:o,onChange:()=>C(!0),className:"w-4 h-4 text-primary"}),e.jsxs("div",{className:"ml-3",children:[e.jsx("span",{className:"font-medium text-text-main",children:"青色申告"}),e.jsx("span",{className:"ml-2 text-xs text-success",children:"最大65万円控除"}),e.jsx("p",{className:"text-sm text-text-muted mt-1",children:"複式簿記で最大65万円の控除が受けられます"})]})]}),e.jsxs("label",{className:"flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-surface-highlight transition-colors",children:[e.jsx("input",{type:"radio",checked:!o,onChange:()=>C(!1),className:"w-4 h-4 text-primary"}),e.jsxs("div",{className:"ml-3",children:[e.jsx("span",{className:"font-medium text-text-main",children:"白色申告"}),e.jsx("p",{className:"text-sm text-text-muted mt-1",children:"簡易的な帳簿で申告できます"})]})]})]})]})]}),e.jsxs("div",{className:"bg-info-light border border-info/20 rounded-lg p-4 flex items-start gap-3",children:[e.jsx(_e,{className:"w-5 h-5 text-info flex-shrink-0 mt-0.5"}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-text-main font-medium",children:"青色申告がおすすめ！"}),e.jsx("p",{className:"text-sm text-text-muted mt-1",children:"Ainanceで取引を記録していれば、複式簿記の要件を満たしています。 65万円の控除で税金がお得になります。"})]})]})]}),F=()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold text-text-main mb-4",children:"収支の確認"}),e.jsxs("p",{className:"text-text-muted mb-6",children:[u,"年度の取引データから自動集計した結果です。"]})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4",children:[e.jsxs("div",{className:"bg-success-light border border-success/20 rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-success font-medium",children:"売上高"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:k(i.totalRevenue)})]}),e.jsxs("div",{className:"bg-error-light border border-error/20 rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-error font-medium",children:"経費合計"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:k(i.totalExpenses)})]}),e.jsxs("div",{className:"bg-primary-light border border-primary/20 rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-primary font-medium",children:"事業所得"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:k(i.netIncome)})]})]}),e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-5",children:[e.jsx("h4",{className:"font-medium text-text-main mb-4",children:"経費内訳（上位5件）"}),i.expensesByCategory.length>0?e.jsx("div",{className:"space-y-3",children:i.expensesByCategory.slice(0,5).map((n,b)=>e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"w-8 h-8 bg-surface-highlight rounded-lg flex items-center justify-center text-sm font-medium text-text-muted",children:b+1}),e.jsx("span",{className:"text-text-main",children:n.category})]}),e.jsxs("div",{className:"text-right",children:[e.jsx("span",{className:"font-medium text-text-main",children:k(n.amount)}),e.jsxs("span",{className:"text-text-muted text-sm ml-2",children:["(",ve(n.percentage),")"]})]})]},b))}):e.jsxs("p",{className:"text-text-muted text-center py-4",children:[u,"年度の経費データがありません"]})]}),i.totalRevenue===0&&i.totalExpenses===0&&e.jsxs("div",{className:"bg-warning-light border border-warning/20 rounded-lg p-4 flex items-start gap-3",children:[e.jsx(oe,{className:"w-5 h-5 text-warning flex-shrink-0 mt-0.5"}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-text-main font-medium",children:"取引データがありません"}),e.jsxs("p",{className:"text-sm text-text-muted mt-1",children:[u,"年度の取引を登録してから確定申告を行ってください。",e.jsx(Q,{to:"/transactions",className:"text-primary hover:underline ml-1",children:"取引を登録する →"})]})]})]})]}),V=()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold text-text-main mb-4",children:"各種控除の入力"}),e.jsx("p",{className:"text-text-muted mb-6",children:"該当する控除を追加して金額を入力してください。控除が多いほど税金が安くなります。"})]}),e.jsx("div",{className:"space-y-4",children:r.map(n=>e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4",children:[e.jsxs("div",{className:"flex-1",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(re,{className:"w-5 h-5 text-success"}),e.jsx("span",{className:"font-medium text-text-main",children:n.name})]}),e.jsx("p",{className:"text-sm text-text-muted mt-1 ml-7",children:n.description})]}),e.jsxs("div",{className:"flex items-center gap-3 ml-7 sm:ml-0",children:[e.jsxs("div",{className:"relative",children:[e.jsx("span",{className:"absolute left-3 top-1/2 -translate-y-1/2 text-text-muted",children:"¥"}),e.jsx("input",{type:"number",value:n.amount,onChange:b=>h(n.id,Number(b.target.value)),className:"input-base pl-8 w-40",placeholder:"金額",disabled:n.type==="basic"||n.type==="blue_return"})]}),n.type!=="basic"&&n.type!=="blue_return"&&e.jsx("button",{onClick:()=>U(n.id),className:"p-2 text-error hover:bg-error-light rounded-lg transition-colors",children:e.jsx(ye,{className:"w-5 h-5"})})]})]},n.id))}),e.jsxs("div",{className:"bg-surface-highlight border border-border rounded-xl p-5",children:[e.jsxs("h4",{className:"font-medium text-text-main mb-4 flex items-center gap-2",children:[e.jsx(ee,{className:"w-5 h-5"}),"控除を追加"]}),e.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-3",children:ae.filter(n=>!r.find(b=>b.type===n.type)).map(n=>e.jsxs("button",{onClick:()=>O(n.type),className:"flex items-center gap-3 p-3 bg-surface border border-border rounded-lg hover:border-primary hover:bg-primary-light transition-colors text-left",children:[e.jsx("div",{className:"w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center",children:e.jsx(ee,{className:"w-4 h-4 text-primary"})}),e.jsxs("div",{children:[e.jsx("p",{className:"font-medium text-text-main text-sm",children:n.name}),e.jsx("p",{className:"text-xs text-text-muted",children:n.description})]})]},n.type))})]}),e.jsxs("div",{className:"bg-success-light border border-success/20 rounded-xl p-5 flex items-center justify-between",children:[e.jsx("span",{className:"font-medium text-text-main",children:"控除合計"}),e.jsx("span",{className:"text-2xl font-bold text-success",children:k(i.totalDeductions)})]})]}),K=()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsxs("h3",{className:"text-lg font-semibold text-text-main mb-4 flex items-center gap-2",children:[e.jsx(W,{className:"w-5 h-5 text-primary"}),"AIによる節税アドバイス"]}),e.jsx("p",{className:"text-text-muted mb-6",children:"AIがあなたの収支データを分析し、節税のアドバイスを提供します。"})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-text-muted",children:"課税所得"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:k(i.taxableIncome)}),e.jsx("p",{className:"text-xs text-text-muted mt-2",children:"事業所得 - 各種控除"})]}),e.jsxs("div",{className:"bg-primary-light border border-primary/20 rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-primary font-medium",children:"予想所得税額"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:k(i.estimatedTax)}),e.jsx("p",{className:"text-xs text-text-muted mt-2",children:"※概算です。実際の税額とは異なる場合があります"})]})]}),R.length===0?e.jsx("button",{onClick:T,disabled:c,className:"btn-primary w-full py-4",children:c?e.jsxs(e.Fragment,{children:[e.jsx(Te,{className:"w-5 h-5 animate-spin"}),"AI分析中..."]}):e.jsxs(e.Fragment,{children:[e.jsx(W,{className:"w-5 h-5"}),"AIアドバイスを受ける"]})}):e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-5 space-y-4",children:[e.jsxs("div",{className:"flex items-center gap-2 text-primary",children:[e.jsx(W,{className:"w-5 h-5"}),e.jsx("span",{className:"font-medium",children:"AIからのアドバイス"})]}),e.jsx("ul",{className:"space-y-3",children:R.map((n,b)=>e.jsxs("li",{className:"flex items-start gap-3",children:[e.jsx(je,{className:"w-5 h-5 text-primary flex-shrink-0 mt-0.5"}),e.jsx("span",{className:"text-text-main",children:n})]},b))}),B>0&&e.jsx("div",{className:"bg-success-light border border-success/20 rounded-lg p-4 mt-4",children:e.jsxs("p",{className:"text-sm text-success font-medium",children:["推定節税可能額: ",k(B)]})})]})]}),Z=()=>{const n={fiscalYear:u,filingType:o?"blue":"white",revenue:i.totalRevenue,expenses:i.totalExpenses,netIncome:i.netIncome,expensesByCategory:i.expensesByCategory,deductions:r.filter(v=>v.isApplicable).map(v=>({type:v.type,name:v.name,amount:v.amount})),totalDeductions:i.totalDeductions,taxableIncome:i.taxableIncome,estimatedTax:i.estimatedTax},b=o?Re(n):Pe(n),S=o?`青色申告決算書_${u}年度.xtx`:`収支内訳書_${u}年度.xml`;De(b,S);const j=window.open("","_blank");j&&(j.document.write(`
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>e-Tax用ファイルプレビュー - ${u}年度</title>
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
        <h1>📄 ${o?"青色申告決算書":"収支内訳書"}（${u}年度）</h1>
        <div class="info">
            <p>⚠️ <strong>このXMLファイルは参考資料です。</strong></p>
            <p>正式な確定申告は、国税庁の確定申告書等作成コーナーをご利用ください。XMLデータは入力の参考にお使いいただけます。</p>
        </div>
        <pre>${b.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</pre>
        <div class="actions">
            <button class="secondary" onclick="window.close()">✕ 閉じる</button>
        </div>
    </div>
</body>
</html>
            `),j.document.close())},me=()=>{const[n,b]=D.useState(null),S=async(j,v)=>{try{await navigator.clipboard.writeText(String(j).replace(/[¥,]/g,"")),b(v),setTimeout(()=>b(null),2e3)}catch(_){console.error("コピーに失敗しました:",_)}};return e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsxs("h3",{className:"text-lg font-semibold text-text-main mb-4 flex items-center gap-2",children:[e.jsx(Y,{className:"w-5 h-5 text-primary"}),"確定申告書の作成"]}),e.jsx("p",{className:"text-text-muted mb-2",children:"入力内容を確認して、書類を作成してください。"}),e.jsx("p",{className:"text-xs text-text-muted",children:"💡 各項目の右側のコピーボタンで、e-Tax入力時にそのまま貼り付けできます"})]}),e.jsxs("div",{className:"bg-surface border border-border rounded-xl divide-y divide-border",children:[e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"申告年度"}),e.jsx("div",{className:"flex items-center gap-2",children:e.jsxs("span",{className:"font-medium text-text-main",children:[u,"年度"]})})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"申告方法"}),e.jsx("span",{className:"font-medium text-text-main",children:o?"青色申告":"白色申告"})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"売上高"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-success",children:k(i.totalRevenue)}),e.jsx("button",{onClick:()=>S(i.totalRevenue,"revenue"),className:`p-1.5 rounded transition-colors ${n==="revenue"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:n==="revenue"?e.jsx(E,{className:"w-4 h-4"}):e.jsx(z,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"経費合計"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-error",children:k(i.totalExpenses)}),e.jsx("button",{onClick:()=>S(i.totalExpenses,"expenses"),className:`p-1.5 rounded transition-colors ${n==="expenses"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:n==="expenses"?e.jsx(E,{className:"w-4 h-4"}):e.jsx(z,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"事業所得"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-text-main",children:k(i.netIncome)}),e.jsx("button",{onClick:()=>S(i.netIncome,"netIncome"),className:`p-1.5 rounded transition-colors ${n==="netIncome"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:n==="netIncome"?e.jsx(E,{className:"w-4 h-4"}):e.jsx(z,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"控除合計"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-primary",children:k(i.totalDeductions)}),e.jsx("button",{onClick:()=>S(i.totalDeductions,"deductions"),className:`p-1.5 rounded transition-colors ${n==="deductions"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:n==="deductions"?e.jsx(E,{className:"w-4 h-4"}):e.jsx(z,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"課税所得"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-text-main",children:k(i.taxableIncome)}),e.jsx("button",{onClick:()=>S(i.taxableIncome,"taxableIncome"),className:`p-1.5 rounded transition-colors ${n==="taxableIncome"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:n==="taxableIncome"?e.jsx(E,{className:"w-4 h-4"}):e.jsx(z,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center bg-primary-light",children:[e.jsx("span",{className:"font-medium text-text-main",children:"予想所得税額"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-bold text-primary text-lg",children:k(i.estimatedTax)}),e.jsx("button",{onClick:()=>S(i.estimatedTax,"tax"),className:`p-1.5 rounded transition-colors ${n==="tax"?"bg-success text-white":"hover:bg-primary/20 text-primary"}`,title:"コピー",children:n==="tax"?e.jsx(E,{className:"w-4 h-4"}):e.jsx(z,{className:"w-4 h-4"})})]})]})]}),e.jsxs("div",{className:"space-y-4",children:[e.jsx("h4",{className:"text-md font-medium text-text-main",children:"📥 ダウンロード"}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-4",children:[e.jsxs("button",{onClick:w,className:"btn-primary py-4 flex items-center justify-center gap-2",children:[e.jsx(xe,{className:"w-5 h-5"}),"申告書プレビュー"]}),e.jsxs("button",{onClick:Z,className:"btn-outline py-4 flex items-center justify-center gap-2 border-2 border-blue-500 text-blue-500 hover:bg-blue-500/10",children:[e.jsx($e,{className:"w-5 h-5"}),"e-Tax用XMLファイル"]})]}),e.jsxs("div",{className:"bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4",children:[e.jsx("h5",{className:"text-sm font-medium text-text-main mb-3 flex items-center gap-2",children:"✨ テンプレート自動転記（NEW!）"}),e.jsx("p",{className:"text-xs text-text-muted mb-3",children:(s==null?void 0:s.business_type)==="corporation"?"法人税申告書・決算報告書にAinanceのデータを自動入力したPDFを生成します":"国税庁の申告書テンプレートにAinanceのデータを自動入力したPDFを生成します"}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-3",children:[(s==null?void 0:s.business_type)!=="corporation"&&e.jsxs(e.Fragment,{children:[e.jsxs("button",{onClick:async()=>{var j;try{const v={revenue:i.totalRevenue,expenses:i.totalExpenses,netIncome:i.netIncome,expensesByCategory:i.expensesByCategory,deductions:{basic:((j=r.find(he=>he.type==="basic"))==null?void 0:j.amount)||48e4,blueReturn:o?65e4:0},taxableIncome:i.taxableIncome,estimatedTax:i.estimatedTax,fiscalYear:u,isBlueReturn:o},{pdfBytes:_,filename:ue}=await M("tax_return_b",v);H(_,ue),X(_)}catch(v){console.error("PDF生成エラー:",v),alert("PDF生成に失敗しました。テンプレートファイルを確認してください。")}},className:"px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium flex items-center justify-center gap-2",children:[e.jsx(Y,{className:"w-4 h-4"}),"確定申告書B"]}),o&&e.jsxs("button",{onClick:async()=>{try{const j={revenue:i.totalRevenue,expenses:i.totalExpenses,netIncome:i.netIncome,expensesByCategory:i.expensesByCategory,deductions:{blueReturn:65e4},taxableIncome:i.taxableIncome,estimatedTax:i.estimatedTax,fiscalYear:u,isBlueReturn:!0},{pdfBytes:v,filename:_}=await M("blue_return",j);H(v,_),X(v)}catch(j){console.error("PDF生成エラー:",j),alert("PDF生成に失敗しました。テンプレートファイルを確認してください。")}},className:"px-4 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium flex items-center justify-center gap-2",children:[e.jsx(Y,{className:"w-4 h-4"}),"青色申告決算書"]})]}),(s==null?void 0:s.business_type)==="corporation"&&e.jsxs(e.Fragment,{children:[e.jsxs("button",{onClick:async()=>{try{const j={revenue:i.totalRevenue,expenses:i.totalExpenses,netIncome:i.netIncome,expensesByCategory:i.expensesByCategory,deductions:{},taxableIncome:i.taxableIncome,estimatedTax:i.estimatedTax,fiscalYear:u,isBlueReturn:!1,businessType:"corporation",companyName:(s==null?void 0:s.company_name)||"株式会社",representativeName:(s==null?void 0:s.representative_name)||""},{pdfBytes:v,filename:_}=await M("corporate_tax",j);H(v,_),X(v)}catch(j){console.error("PDF生成エラー:",j),alert("PDF生成に失敗しました。")}},className:"px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium flex items-center justify-center gap-2",children:[e.jsx(Y,{className:"w-4 h-4"}),"法人税申告書"]}),e.jsxs("button",{onClick:async()=>{try{const j={revenue:i.totalRevenue,expenses:i.totalExpenses,netIncome:i.netIncome,expensesByCategory:i.expensesByCategory,deductions:{},taxableIncome:i.taxableIncome,estimatedTax:i.estimatedTax,fiscalYear:u,isBlueReturn:!1,businessType:"corporation",companyName:(s==null?void 0:s.company_name)||"株式会社",representativeName:(s==null?void 0:s.representative_name)||""},{pdfBytes:v,filename:_}=await M("financial_statement",j);H(v,_),X(v)}catch(j){console.error("PDF生成エラー:",j),alert("PDF生成に失敗しました。")}},className:"px-4 py-3 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors text-sm font-medium flex items-center justify-center gap-2",children:[e.jsx(Y,{className:"w-4 h-4"}),"決算報告書"]})]})]})]})]}),e.jsxs("div",{className:"bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-xl p-5",children:[e.jsxs("h4",{className:"text-md font-medium text-text-main mb-3 flex items-center gap-2",children:[e.jsx(ne,{className:"w-5 h-5 text-blue-500"}),"e-Taxで直接申告する"]}),e.jsxs("ol",{className:"text-sm text-text-muted space-y-2 mb-4",children:[e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx("span",{className:"flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs",children:"1"}),"上のコピーボタンで各数値をコピー"]}),e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx("span",{className:"flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs",children:"2"}),"確定申告書等作成コーナーにアクセス"]}),e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx("span",{className:"flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs",children:"3"}),"コピーした数値を貼り付けて入力"]}),e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx("span",{className:"flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs",children:"4"}),"マイナンバーカードで電子署名 → 送信完了！"]})]}),e.jsxs("a",{href:"https://www.keisan.nta.go.jp/kyoutu/ky/smsp/top",target:"_blank",rel:"noopener noreferrer",className:"inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm",children:[e.jsx(ne,{className:"w-4 h-4"}),"確定申告書等作成コーナーを開く"]}),e.jsx(Q,{to:"/tax-filing-guide",className:"inline-flex items-center gap-2 px-4 py-2 ml-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm",children:"📖 詳しい申告ガイドを見る"})]}),e.jsxs("div",{className:"bg-warning-light border border-warning/20 rounded-lg p-4 flex items-start gap-3",children:[e.jsx(oe,{className:"w-5 h-5 text-warning flex-shrink-0 mt-0.5"}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-text-main font-medium",children:"ご注意ください"}),e.jsxs("ul",{className:"text-sm text-text-muted mt-2 space-y-1 list-disc list-inside",children:[e.jsx("li",{children:"この計算は概算です。正確な税額は税務署にご確認ください"}),e.jsx("li",{children:"確定申告の期限は翌年3月15日です（例：2025年度分は2026年3月15日まで）"}),e.jsx("li",{children:"青色申告特別控除65万円の適用には電子申告が必要です"})]})]})]})]})},de=()=>{switch(x){case 1:return e.jsx(P,{});case 2:return e.jsx(F,{});case 3:return e.jsx(V,{});case 4:return e.jsx(K,{});case 5:return e.jsx(me,{});default:return null}};return e.jsx("div",{className:"min-h-screen bg-background",children:e.jsxs("div",{className:"max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8",children:[e.jsxs("div",{className:"mb-8",children:[e.jsxs(Q,{to:"/dashboard",className:"flex items-center text-primary hover:text-primary-hover mb-4",children:[e.jsx(ie,{className:"h-5 w-5 mr-2"}),"ダッシュボードに戻る"]}),e.jsx("h1",{className:"text-3xl font-bold text-text-main mb-2",children:"確定申告サポート"}),e.jsx("p",{className:"text-text-muted",children:"5つのステップで簡単に確定申告を完了できます"})]}),e.jsx(A,{}),e.jsx("div",{className:"bg-surface border border-border rounded-xl p-6 mb-6",children:de()}),e.jsxs("div",{className:"flex justify-between",children:[e.jsxs("button",{onClick:L,disabled:x===1,className:`btn-ghost ${x===1?"opacity-50 cursor-not-allowed":""}`,children:[e.jsx(ie,{className:"w-5 h-5"}),"戻る"]}),x<G.length?e.jsxs("button",{onClick:J,className:"btn-primary",children:["次へ",e.jsx(Ce,{className:"w-5 h-5"})]}):e.jsxs("button",{onClick:w,className:"btn-success",children:[e.jsx(re,{className:"w-5 h-5"}),"完了"]})]})]})})};export{Ge as default};
