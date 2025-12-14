import{c as te,a as he,b as pe,d as ge,r as A,j as e,L as O,F as L,P as M,S as Y,R as be,g as D,t as fe,T as je}from"./index-EJBxMMBW.js";import{g as ye,c as Ne,f as y,E as X,A as W,a as we,b as ve}from"./TaxFilingService-DGZJKm0V.js";import{P as K,S as z,r as C}from"./PDFButton-SqBVA2Sx.js";import{A as G}from"./arrow-left-BlJWmRHv.js";import{C as ke}from"./calculator-CKP0sJz2.js";import{D as se}from"./download-BDYSc3tA.js";import{A as Ie}from"./arrow-right-Cl5t0WTm.js";import{C as q}from"./circle-check-big-XiyFQM_g.js";import{C as F}from"./copy-BTyFSc4E.js";import{C as V}from"./circle-alert-DRI-b2yW.js";import{R as Ce}from"./refresh-cw-CYHReA07.js";/**
 * @license lucide-react v0.540.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Te=[["path",{d:"M10 12.5 8 15l2 2.5",key:"1tg20x"}],["path",{d:"m14 12.5 2 2.5-2 2.5",key:"yinavb"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z",key:"1mlx9k"}]],$e=te("file-code",Te);/**
 * @license lucide-react v0.540.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Se=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 16v-4",key:"1dtifu"}],["path",{d:"M12 8h.01",key:"e9boi3"}]],Ae=te("info",Se);function Re(i){const t=new Date,p=t.toISOString().replace(/[-:]/g,"").split(".")[0],l={売上高:"AA100",仕入高:"AB100",消耗品費:"AC100",旅費交通費:"AC110",通信費:"AC120",広告宣伝費:"AC130",接待交際費:"AC140",水道光熱費:"AC150",地代家賃:"AC160",外注費:"AC170",減価償却費:"AC180",雑費:"AC190"},b=i.expensesByCategory.map((d,o)=>{const c=l[d.category]||`AC${200+o}`;return`    <${c}>${d.amount}</${c}>`}).join(`
`);return`<?xml version="1.0" encoding="UTF-8"?>
<!--
  Ainance e-Tax Export File
  生成日時: ${t.toLocaleString("ja-JP")}
  対象年度: ${i.fiscalYear}年度
  申告区分: ${i.filingType==="blue"?"青色申告":"白色申告"}
-->
<申告書等送信票等>
  <作成日時>${p}</作成日時>
  <ファイル種別>青色申告決算書</ファイル種別>
  
  <申告者情報>
    <氏名>${i.name||"（要入力）"}</氏名>
    <フリガナ>${i.furigana||"（要入力）"}</フリガナ>
    <郵便番号>${i.postalCode||""}</郵便番号>
    <住所>${i.address||"（要入力）"}</住所>
    <電話番号>${i.phoneNumber||""}</電話番号>
    <生年月日>${i.birthDate||""}</生年月日>
  </申告者情報>
  
  <青色申告決算書>
    <対象年度>${i.fiscalYear}</対象年度>
    <申告区分>${i.filingType==="blue"?"1":"2"}</申告区分>
    
    <!-- 損益計算書 -->
    <損益計算書>
      <売上金額>
        <AA100>${i.revenue}</AA100>
      </売上金額>
      
      <必要経費>
${b}
        <経費合計>${i.expenses}</経費合計>
      </必要経費>
      
      <差引金額>${i.netIncome}</差引金額>
      
      <各種引当金>
        <繰戻額>0</繰戻額>
        <繰入額>0</繰入額>
      </各種引当金>
      
      <青色申告特別控除前所得>${i.netIncome}</青色申告特別控除前所得>
      <青色申告特別控除額>${i.filingType==="blue"?65e4:0}</青色申告特別控除額>
      <所得金額>${i.netIncome-(i.filingType==="blue"?65e4:0)}</所得金額>
    </損益計算書>
    
    <!-- 控除情報 -->
    <所得控除>
${i.deductions.map(d=>`      <${d.type}>${d.amount}</${d.type}>`).join(`
`)}
      <控除合計>${i.totalDeductions}</控除合計>
    </所得控除>
    
    <!-- 税額計算 -->
    <税額計算>
      <課税所得金額>${i.taxableIncome}</課税所得金額>
      <算出税額>${i.estimatedTax}</算出税額>
    </税額計算>
  </青色申告決算書>
  
  <備考>
    このファイルはAinanceで生成されました。
    正式な申告にはe-Tax確定申告書等作成コーナーでの確認・修正が必要な場合があります。
  </備考>
</申告書等送信票等>`}function De(i){return`<?xml version="1.0" encoding="UTF-8"?>
<!--
  Ainance e-Tax Export File - 収支内訳書
  生成日時: ${new Date().toLocaleString("ja-JP")}
  対象年度: ${i.fiscalYear}年度
-->
<収支内訳書>
  <対象年度>${i.fiscalYear}</対象年度>
  
  <収入金額>
    <売上金額>${i.revenue}</売上金額>
  </収入金額>
  
  <必要経費>
${i.expensesByCategory.map(l=>`    <${l.category.replace(/\s/g,"")}>${l.amount}</${l.category.replace(/\s/g,"")}>`).join(`
`)}
    <経費合計>${i.expenses}</経費合計>
  </必要経費>
  
  <差引金額>${i.netIncome}</差引金額>
</収支内訳書>`}function Fe(i,t){const p=new Blob(["\uFEFF"+i],{type:"application/xml;charset=utf-8"}),l=URL.createObjectURL(p),b=document.createElement("a");b.href=l,b.download=t,document.body.appendChild(b),b.click(),document.body.removeChild(b),setTimeout(()=>URL.revokeObjectURL(l),1e3)}const m={事業_営業等:{x:475,y:648},事業所得_営業等:{x:475,y:458},総所得金額:{x:475,y:318},社会保険料控除:{x:475,y:268},小規模企業共済等掛金控除:{x:475,y:248},生命保険料控除:{x:475,y:228},地震保険料控除:{x:475,y:208},配偶者控除:{x:475,y:168},扶養控除:{x:475,y:148},基礎控除:{x:475,y:128},所得控除合計:{x:475,y:88},住所:{x:120,y:780},氏名:{x:120,y:755},電話番号:{x:350,y:755}},v={売上金額:{x:430,y:680,width:100},売上原価:{x:430,y:640,width:100},差引金額:{x:430,y:600,width:100},租税公課:{x:430,y:540,width:80},荷造運賃:{x:430,y:520,width:80},水道光熱費:{x:430,y:500,width:80},旅費交通費:{x:430,y:480,width:80},通信費:{x:430,y:460,width:80},広告宣伝費:{x:430,y:440,width:80},接待交際費:{x:430,y:420,width:80},損害保険料:{x:430,y:400,width:80},修繕費:{x:430,y:380,width:80},消耗品費:{x:430,y:360,width:80},減価償却費:{x:430,y:340,width:80},福利厚生費:{x:430,y:320,width:80},給料賃金:{x:430,y:300,width:80},外注工賃:{x:430,y:280,width:80},地代家賃:{x:430,y:260,width:80},支払利息:{x:430,y:240,width:80},雑費:{x:430,y:220,width:80},経費計:{x:430,y:180,width:100},青色申告特別控除前の所得金額:{x:430,y:140,width:100},青色申告特別控除額:{x:430,y:120,width:100},所得金額:{x:430,y:80,width:100},屋号:{x:100,y:750,width:150},住所:{x:100,y:720,width:200},氏名:{x:100,y:690,width:150}},ne={交通費:"旅費交通費",旅費交通費:"旅費交通費",通信費:"通信費",水道光熱費:"水道光熱費",消耗品費:"消耗品費",接待交際費:"接待交際費",広告宣伝費:"広告宣伝費",地代家賃:"地代家賃",外注費:"外注工賃",給与:"給料賃金",雑費:"雑費",減価償却費:"減価償却費",修繕費:"修繕費",保険料:"損害保険料",福利厚生費:"福利厚生費",支払利息:"支払利息",租税公課:"租税公課",荷造運賃:"荷造運賃",その他:"雑費",未分類:"雑費"};async function Pe(i,t){const p=await K.load(i,{ignoreEncryption:!0}),b=p.getPages()[0],x=await p.embedFont(z.Helvetica),d=u=>u.toLocaleString("ja-JP"),o=(u,r,f,g=9)=>{b.drawText(u,{x:r,y:f,size:g,font:x,color:C(0,0,0)})};o(d(t.revenue),m.事業_営業等.x,m.事業_営業等.y),o(d(t.netIncome),m.事業所得_営業等.x,m.事業所得_営業等.y),o(d(t.netIncome),m.総所得金額.x,m.総所得金額.y),t.deductions.socialInsurance&&o(d(t.deductions.socialInsurance),m.社会保険料控除.x,m.社会保険料控除.y),t.deductions.smallBusinessMutual&&o(d(t.deductions.smallBusinessMutual),m.小規模企業共済等掛金控除.x,m.小規模企業共済等掛金控除.y),t.deductions.lifeInsurance&&o(d(t.deductions.lifeInsurance),m.生命保険料控除.x,m.生命保険料控除.y),t.deductions.earthquakeInsurance&&o(d(t.deductions.earthquakeInsurance),m.地震保険料控除.x,m.地震保険料控除.y),t.deductions.spouse&&o(d(t.deductions.spouse),m.配偶者控除.x,m.配偶者控除.y),t.deductions.dependents&&o(d(t.deductions.dependents),m.扶養控除.x,m.扶養控除.y),t.deductions.basic&&o(d(t.deductions.basic),m.基礎控除.x,m.基礎控除.y);const c=Object.values(t.deductions).reduce((u,r)=>u+(r||0),0);return o(d(c),m.所得控除合計.x,m.所得控除合計.y),t.address&&o(t.address,m.住所.x,m.住所.y,8),t.name&&o(t.name,m.氏名.x,m.氏名.y),t.phone&&o(t.phone,m.電話番号.x,m.電話番号.y),p.save()}async function Ee(i,t){const p=await K.load(i,{ignoreEncryption:!0}),b=p.getPages()[0],x=await p.embedFont(z.Helvetica),d=r=>r.toLocaleString("ja-JP"),o=(r,f,g,N=9)=>{b.drawText(r,{x:f,y:g,size:N,font:x,color:C(0,0,0)})};o(d(t.revenue),v.売上金額.x,v.売上金額.y);const c={};t.expensesByCategory.forEach(r=>{const f=ne[r.category]||"雑費";c[f]=(c[f]||0)+r.amount}),Object.entries(c).forEach(([r,f])=>{const g=v[r];g&&o(d(f),g.x,g.y)}),o(d(t.expenses),v.経費計.x,v.経費計.y),o(d(t.revenue-t.expenses),v.差引金額.x,v.差引金額.y),o(d(t.netIncome),v.青色申告特別控除前の所得金額.x,v.青色申告特別控除前の所得金額.y),t.isBlueReturn&&t.deductions.blueReturn&&o(d(t.deductions.blueReturn),v.青色申告特別控除額.x,v.青色申告特別控除額.y);const u=t.netIncome-(t.deductions.blueReturn||0);return o(d(Math.max(0,u)),v.所得金額.x,v.所得金額.y),t.tradeName&&o(t.tradeName,v.屋号.x,v.屋号.y),t.address&&o(t.address,v.住所.x,v.住所.y,8),t.name&&o(t.name,v.氏名.x,v.氏名.y),p.save()}async function Z(i,t){const p=i==="tax_return_b"?"/templates/tax_return_r05.pdf":"/templates/blue_return_r05.pdf";let l;try{const x=await fetch(p);if(!x.ok)throw new Error(`テンプレートの読み込みに失敗: ${x.statusText}`);const d=await x.arrayBuffer();l=i==="tax_return_b"?await Pe(d,t):await Ee(d,t)}catch(x){console.warn("テンプレート読み込み失敗、白紙から生成します:",x),l=await _e(i,t)}const b=i==="tax_return_b"?`確定申告書B_${t.fiscalYear}年度_入力済み.pdf`:`青色申告決算書_${t.fiscalYear}年度_入力済み.pdf`;return{pdfBytes:l,filename:b}}async function _e(i,t){const p=await K.create(),l=p.addPage([595.28,841.89]),b=await p.embedFont(z.Helvetica),x=await p.embedFont(z.HelveticaBold),{width:d,height:o}=l.getSize(),c=j=>j===0?"0":j.toLocaleString("ja-JP"),u={primary:C(.2,.4,.8),header:C(.15,.15,.15),text:C(.1,.1,.1),muted:C(.4,.4,.4),line:C(.7,.7,.7),highlight:C(.95,.95,1),red:C(.8,.2,.2),green:C(.2,.6,.3)},r=(j,T,a,$={})=>{const R=$.size||10,E=$.font||b,U=$.color||u.text;let _=T;if($.align==="right"){const J=E.widthOfTextAtSize(j,R);_=T-J}l.drawText(j,{x:_,y:a,size:R,font:E,color:U})},f=(j,T,a,$,R=.5)=>{l.drawLine({start:{x:j,y:T},end:{x:a,y:$},thickness:R,color:u.line})},g=(j,T,a,$,R)=>{l.drawRectangle({x:j,y:T,width:a,height:$,color:R})},N=(j,T,a,$=!1)=>{$&&g(50,a-5,495,20,u.highlight),f(50,a-5,545,a-5),r(j,60,a),r(T,530,a,{align:"right"})},P=i==="tax_return_b"?"Kakutei Shinkokusho B (Tax Return Form B)":"Aoiro Shinkoku Kessansho (Blue Return Statement)";g(0,o-60,d,60,u.primary),r(P,50,o-40,{size:14,font:x,color:C(1,1,1)});let s=o-85;if(r(`Fiscal Year: ${t.fiscalYear} (Reiwa ${t.fiscalYear-2018})`,50,s,{size:11}),r(`Generated: ${new Date().toLocaleDateString("ja-JP")}`,400,s,{size:9,color:u.muted}),s-=30,f(50,s,545,s,1),s-=25,i==="tax_return_b"){r("SECTION 1: Shuunyu Kingaku (Income)",50,s,{size:12,font:x,color:u.primary}),s-=25,N("A. Jigyo (Business) - Eigyo (Sales/Services)",c(t.revenue)+" JPY",s,!0),s-=25,s-=15,r("SECTION 2: Shotoku Kingaku (Net Income)",50,s,{size:12,font:x,color:u.primary}),s-=25,N("A. Jigyo Shotoku (Business Income)",c(t.netIncome)+" JPY",s),s-=20,N("Total Income",c(t.netIncome)+" JPY",s,!0),s-=30,s-=15,r("SECTION 3: Shotoku Koujo (Deductions)",50,s,{size:12,font:x,color:u.primary}),s-=25,t.deductions.basic&&(N("Kiso Koujo (Basic Deduction)",c(t.deductions.basic)+" JPY",s),s-=20),t.deductions.blueReturn&&t.deductions.blueReturn>0&&(N("Aoiro Shinkoku Tokubetsu Koujo (Blue Return Special)",c(t.deductions.blueReturn)+" JPY",s),s-=20),t.deductions.socialInsurance&&(N("Shakai Hoken (Social Insurance)",c(t.deductions.socialInsurance)+" JPY",s),s-=20),t.deductions.lifeInsurance&&(N("Seimei Hoken (Life Insurance)",c(t.deductions.lifeInsurance)+" JPY",s),s-=20);const j=Object.values(t.deductions).reduce((T,a)=>T+(a||0),0);N("Total Deductions",c(j)+" JPY",s,!0),s-=35,s-=15,r("SECTION 4: Zeigaku Keisan (Tax Calculation)",50,s,{size:12,font:x,color:u.primary}),s-=25,N("Kazei Shotoku (Taxable Income)",c(t.taxableIncome)+" JPY",s),s-=25,g(50,s-8,495,30,C(1,.95,.95)),f(50,s-8,545,s-8,1),f(50,s+22,545,s+22,1),r("Shotokuzei (Income Tax) - ESTIMATED",60,s+5,{font:x}),r(c(t.estimatedTax)+" JPY",530,s+5,{align:"right",font:x,color:u.red})}else if(r("SECTION 1: Uriage (Revenue)",50,s,{size:12,font:x,color:u.primary}),s-=25,N("A. Uriage (Sales Revenue)",c(t.revenue)+" JPY",s,!0),s-=30,s-=15,r("SECTION 2: Keihi (Expenses)",50,s,{size:12,font:x,color:u.primary}),s-=25,g(50,s-5,495,18,C(.9,.9,.9)),f(50,s-5,545,s-5),f(50,s+13,545,s+13),r("Category",60,s,{font:x,size:9}),r("Amount",530,s,{align:"right",font:x,size:9}),s-=22,t.expensesByCategory.forEach((j,T)=>{const a=ne[j.category]||j.category;T%2===0&&g(50,s-5,495,18,C(.98,.98,.98)),f(50,s-5,545,s-5),r(a,60,s,{size:9}),r(c(j.amount)+" JPY",530,s,{align:"right",size:9}),s-=18}),s-=5,N("Total Expenses",c(t.expenses)+" JPY",s,!0),s-=35,s-=15,r("SECTION 3: Shotoku Keisan (Income Calculation)",50,s,{size:12,font:x,color:u.primary}),s-=25,N("Uriage - Keihi (Gross Profit)",c(t.netIncome)+" JPY",s),s-=20,t.isBlueReturn&&t.deductions.blueReturn){N("Aoiro Tokubetsu Koujo (Blue Return Deduction)","-"+c(t.deductions.blueReturn)+" JPY",s),s-=25;const j=Math.max(0,t.netIncome-t.deductions.blueReturn);g(50,s-8,495,30,C(.95,1,.95)),f(50,s-8,545,s-8,1),f(50,s+22,545,s+22,1),r("Final Business Income (Shotoku Kingaku)",60,s+5,{font:x}),r(c(j)+" JPY",530,s+5,{align:"right",font:x,color:u.green})}return f(50,60,545,60),r("* This document is generated by Ainance for reference purposes only.",50,45,{size:7,color:u.muted}),r("* For official tax filing, please use the National Tax Agency e-Tax system.",50,35,{size:7,color:u.muted}),r("* Visit: https://www.keisan.nta.go.jp/",50,25,{size:7,color:u.primary}),p.save()}function Q(i,t){const p=new Blob([new Uint8Array(i)],{type:"application/pdf"}),l=URL.createObjectURL(p),b=document.createElement("a");b.href=l,b.download=t,document.body.appendChild(b),b.click(),document.body.removeChild(b),setTimeout(()=>URL.revokeObjectURL(l),1e3)}function ee(i){const t=new Blob([new Uint8Array(i)],{type:"application/pdf"}),p=URL.createObjectURL(t);window.open(p,"_blank")}const B=[{id:1,title:"基本情報",icon:L,description:"確定申告の基本設定"},{id:2,title:"収支確認",icon:ke,description:"売上・経費の確認"},{id:3,title:"控除入力",icon:M,description:"各種控除の入力"},{id:4,title:"AI診断",icon:Y,description:"AIによる節税アドバイス"},{id:5,title:"申告書作成",icon:se,description:"PDFダウンロード"}],We=()=>{const{user:i}=he(),{currentBusinessType:t}=pe(),{transactions:p}=ge(i==null?void 0:i.id,t==null?void 0:t.business_type),[l,b]=A.useState(1),[x,d]=A.useState(!1),o=new Date().getFullYear(),[c,u]=A.useState(o-1),[r,f]=A.useState(!0),[g,N]=A.useState([]),[P,s]=A.useState([]),[j,T]=A.useState(0);A.useEffect(()=>{N(ye(r))},[r]);const a=A.useMemo(()=>Ne(p,c,(t==null?void 0:t.business_type)||"individual",g),[p,c,t,g]),$=()=>{l<B.length&&b(l+1)},R=()=>{l>1&&b(l-1)},E=n=>{const h=W.find(w=>w.type===n);h&&!g.find(w=>w.type===n)&&N([...g,{id:Date.now().toString(),...h,amount:0,isApplicable:!0}])},U=n=>{N(g.filter(h=>h.id!==n))},_=(n,h)=>{N(g.map(w=>w.id===n?{...w,amount:h}:w))},J=async()=>{d(!0);try{const n=await ve(a,{});s(n.suggestions),T(n.estimatedSavings)}catch(n){console.error("AI診断エラー:",n)}finally{d(!1)}},H=()=>{const n=`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
           確定申告書（${c}年度）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

申告方法: ${r?"青色申告":"白色申告"}
作成日時: ${new Date().toLocaleString("ja-JP")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【収支内訳】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
売上高:     ${y(a.totalRevenue)}
経費合計:   ${y(a.totalExpenses)}
──────────────────────────────────────────────────
事業所得:   ${y(a.netIncome)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【控除内訳】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${g.filter(S=>S.isApplicable).map(S=>`${S.name.padEnd(20,"　")}: ${y(S.amount)}`).join(`
`)}
──────────────────────────────────────────────────
控除合計:   ${y(a.totalDeductions)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【税額計算】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
課税所得:   ${y(a.taxableIncome)}
──────────────────────────────────────────────────
所得税額:   ${y(a.estimatedTax)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
※この書類はAinanceで生成された概算資料です。
  正式な確定申告は国税庁のe-Taxでお手続きください。
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`.trim(),h=new Blob(["\uFEFF"+n],{type:"text/plain;charset=utf-8"}),w=URL.createObjectURL(h),k=document.createElement("a");k.href=w,k.download=`確定申告書_${c}年度.txt`,document.body.appendChild(k),k.click(),document.body.removeChild(k);const I=window.open("","_blank");I&&(I.document.write(`
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>確定申告書プレビュー - ${c}年度</title>
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
        <p class="subtitle">${c}年度 | ${r?"青色申告":"白色申告"} | 作成日: ${new Date().toLocaleDateString("ja-JP")}</p>
        <pre>${n}</pre>
        <div class="actions">
            <button class="print-btn" onclick="window.print()">🖨️ 印刷する</button>
            <button class="close-btn" onclick="window.close()">✕ 閉じる</button>
        </div>
    </div>
</body>
</html>
            `),I.document.close()),setTimeout(()=>URL.revokeObjectURL(w),1e3)},ae=()=>e.jsx("div",{className:"mb-8",children:e.jsx("div",{className:"flex items-center justify-between",children:B.map((n,h)=>e.jsxs(be.Fragment,{children:[e.jsxs("div",{className:"flex flex-col items-center",children:[e.jsx("div",{className:`w-10 h-10 rounded-full flex items-center justify-center transition-all ${l>n.id?"bg-success text-white":l===n.id?"bg-primary text-white":"bg-surface-highlight text-text-muted"}`,children:l>n.id?e.jsx(D,{className:"w-5 h-5"}):e.jsx(n.icon,{className:"w-5 h-5"})}),e.jsx("span",{className:`text-xs mt-2 hidden sm:block ${l>=n.id?"text-text-main font-medium":"text-text-muted"}`,children:n.title})]}),h<B.length-1&&e.jsx("div",{className:`flex-1 h-1 mx-2 rounded ${l>n.id?"bg-success":"bg-surface-highlight"}`})]},n.id))})}),ie=()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold text-text-main mb-4",children:"確定申告の基本設定"}),e.jsx("p",{className:"text-text-muted mb-6",children:"確定申告を行う年度と申告方法を選択してください。"})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-text-main mb-2",children:"申告年度"}),e.jsx("select",{value:c,onChange:n=>u(Number(n.target.value)),className:"input-base",children:[o,...Array.from({length:4},(n,h)=>o-1-h)].map(n=>e.jsxs("option",{value:n,children:[n,"年度（",n,"年1月〜12月）",n===o&&" ※進行中"]},n))})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-text-main mb-2",children:"申告方法"}),e.jsxs("div",{className:"space-y-3",children:[e.jsxs("label",{className:"flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-surface-highlight transition-colors",children:[e.jsx("input",{type:"radio",checked:r,onChange:()=>f(!0),className:"w-4 h-4 text-primary"}),e.jsxs("div",{className:"ml-3",children:[e.jsx("span",{className:"font-medium text-text-main",children:"青色申告"}),e.jsx("span",{className:"ml-2 text-xs text-success",children:"最大65万円控除"}),e.jsx("p",{className:"text-sm text-text-muted mt-1",children:"複式簿記で最大65万円の控除が受けられます"})]})]}),e.jsxs("label",{className:"flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-surface-highlight transition-colors",children:[e.jsx("input",{type:"radio",checked:!r,onChange:()=>f(!1),className:"w-4 h-4 text-primary"}),e.jsxs("div",{className:"ml-3",children:[e.jsx("span",{className:"font-medium text-text-main",children:"白色申告"}),e.jsx("p",{className:"text-sm text-text-muted mt-1",children:"簡易的な帳簿で申告できます"})]})]})]})]})]}),e.jsxs("div",{className:"bg-info-light border border-info/20 rounded-lg p-4 flex items-start gap-3",children:[e.jsx(Ae,{className:"w-5 h-5 text-info flex-shrink-0 mt-0.5"}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-text-main font-medium",children:"青色申告がおすすめ！"}),e.jsx("p",{className:"text-sm text-text-muted mt-1",children:"Ainanceで取引を記録していれば、複式簿記の要件を満たしています。 65万円の控除で税金がお得になります。"})]})]})]}),re=()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold text-text-main mb-4",children:"収支の確認"}),e.jsxs("p",{className:"text-text-muted mb-6",children:[c,"年度の取引データから自動集計した結果です。"]})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4",children:[e.jsxs("div",{className:"bg-success-light border border-success/20 rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-success font-medium",children:"売上高"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:y(a.totalRevenue)})]}),e.jsxs("div",{className:"bg-error-light border border-error/20 rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-error font-medium",children:"経費合計"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:y(a.totalExpenses)})]}),e.jsxs("div",{className:"bg-primary-light border border-primary/20 rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-primary font-medium",children:"事業所得"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:y(a.netIncome)})]})]}),e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-5",children:[e.jsx("h4",{className:"font-medium text-text-main mb-4",children:"経費内訳（上位5件）"}),a.expensesByCategory.length>0?e.jsx("div",{className:"space-y-3",children:a.expensesByCategory.slice(0,5).map((n,h)=>e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"w-8 h-8 bg-surface-highlight rounded-lg flex items-center justify-center text-sm font-medium text-text-muted",children:h+1}),e.jsx("span",{className:"text-text-main",children:n.category})]}),e.jsxs("div",{className:"text-right",children:[e.jsx("span",{className:"font-medium text-text-main",children:y(n.amount)}),e.jsxs("span",{className:"text-text-muted text-sm ml-2",children:["(",we(n.percentage),")"]})]})]},h))}):e.jsxs("p",{className:"text-text-muted text-center py-4",children:[c,"年度の経費データがありません"]})]}),a.totalRevenue===0&&a.totalExpenses===0&&e.jsxs("div",{className:"bg-warning-light border border-warning/20 rounded-lg p-4 flex items-start gap-3",children:[e.jsx(V,{className:"w-5 h-5 text-warning flex-shrink-0 mt-0.5"}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-text-main font-medium",children:"取引データがありません"}),e.jsxs("p",{className:"text-sm text-text-muted mt-1",children:[c,"年度の取引を登録してから確定申告を行ってください。",e.jsx(O,{to:"/transactions",className:"text-primary hover:underline ml-1",children:"取引を登録する →"})]})]})]})]}),ce=()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold text-text-main mb-4",children:"各種控除の入力"}),e.jsx("p",{className:"text-text-muted mb-6",children:"該当する控除を追加して金額を入力してください。控除が多いほど税金が安くなります。"})]}),e.jsx("div",{className:"space-y-4",children:g.map(n=>e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4",children:[e.jsxs("div",{className:"flex-1",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(q,{className:"w-5 h-5 text-success"}),e.jsx("span",{className:"font-medium text-text-main",children:n.name})]}),e.jsx("p",{className:"text-sm text-text-muted mt-1 ml-7",children:n.description})]}),e.jsxs("div",{className:"flex items-center gap-3 ml-7 sm:ml-0",children:[e.jsxs("div",{className:"relative",children:[e.jsx("span",{className:"absolute left-3 top-1/2 -translate-y-1/2 text-text-muted",children:"¥"}),e.jsx("input",{type:"number",value:n.amount,onChange:h=>_(n.id,Number(h.target.value)),className:"input-base pl-8 w-40",placeholder:"金額",disabled:n.type==="basic"||n.type==="blue_return"})]}),n.type!=="basic"&&n.type!=="blue_return"&&e.jsx("button",{onClick:()=>U(n.id),className:"p-2 text-error hover:bg-error-light rounded-lg transition-colors",children:e.jsx(je,{className:"w-5 h-5"})})]})]},n.id))}),e.jsxs("div",{className:"bg-surface-highlight border border-border rounded-xl p-5",children:[e.jsxs("h4",{className:"font-medium text-text-main mb-4 flex items-center gap-2",children:[e.jsx(M,{className:"w-5 h-5"}),"控除を追加"]}),e.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-3",children:W.filter(n=>!g.find(h=>h.type===n.type)).map(n=>e.jsxs("button",{onClick:()=>E(n.type),className:"flex items-center gap-3 p-3 bg-surface border border-border rounded-lg hover:border-primary hover:bg-primary-light transition-colors text-left",children:[e.jsx("div",{className:"w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center",children:e.jsx(M,{className:"w-4 h-4 text-primary"})}),e.jsxs("div",{children:[e.jsx("p",{className:"font-medium text-text-main text-sm",children:n.name}),e.jsx("p",{className:"text-xs text-text-muted",children:n.description})]})]},n.type))})]}),e.jsxs("div",{className:"bg-success-light border border-success/20 rounded-xl p-5 flex items-center justify-between",children:[e.jsx("span",{className:"font-medium text-text-main",children:"控除合計"}),e.jsx("span",{className:"text-2xl font-bold text-success",children:y(a.totalDeductions)})]})]}),le=()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsxs("h3",{className:"text-lg font-semibold text-text-main mb-4 flex items-center gap-2",children:[e.jsx(Y,{className:"w-5 h-5 text-primary"}),"AIによる節税アドバイス"]}),e.jsx("p",{className:"text-text-muted mb-6",children:"AIがあなたの収支データを分析し、節税のアドバイスを提供します。"})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-text-muted",children:"課税所得"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:y(a.taxableIncome)}),e.jsx("p",{className:"text-xs text-text-muted mt-2",children:"事業所得 - 各種控除"})]}),e.jsxs("div",{className:"bg-primary-light border border-primary/20 rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-primary font-medium",children:"予想所得税額"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:y(a.estimatedTax)}),e.jsx("p",{className:"text-xs text-text-muted mt-2",children:"※概算です。実際の税額とは異なる場合があります"})]})]}),P.length===0?e.jsx("button",{onClick:J,disabled:x,className:"btn-primary w-full py-4",children:x?e.jsxs(e.Fragment,{children:[e.jsx(Ce,{className:"w-5 h-5 animate-spin"}),"AI分析中..."]}):e.jsxs(e.Fragment,{children:[e.jsx(Y,{className:"w-5 h-5"}),"AIアドバイスを受ける"]})}):e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-5 space-y-4",children:[e.jsxs("div",{className:"flex items-center gap-2 text-primary",children:[e.jsx(Y,{className:"w-5 h-5"}),e.jsx("span",{className:"font-medium",children:"AIからのアドバイス"})]}),e.jsx("ul",{className:"space-y-3",children:P.map((n,h)=>e.jsxs("li",{className:"flex items-start gap-3",children:[e.jsx(fe,{className:"w-5 h-5 text-primary flex-shrink-0 mt-0.5"}),e.jsx("span",{className:"text-text-main",children:n})]},h))}),j>0&&e.jsx("div",{className:"bg-success-light border border-success/20 rounded-lg p-4 mt-4",children:e.jsxs("p",{className:"text-sm text-success font-medium",children:["推定節税可能額: ",y(j)]})})]})]}),oe=()=>{const n={fiscalYear:c,filingType:r?"blue":"white",revenue:a.totalRevenue,expenses:a.totalExpenses,netIncome:a.netIncome,expensesByCategory:a.expensesByCategory,deductions:g.filter(I=>I.isApplicable).map(I=>({type:I.type,name:I.name,amount:I.amount})),totalDeductions:a.totalDeductions,taxableIncome:a.taxableIncome,estimatedTax:a.estimatedTax},h=r?Re(n):De(n),w=r?`青色申告決算書_${c}年度.xtx`:`収支内訳書_${c}年度.xml`;Fe(h,w);const k=window.open("","_blank");k&&(k.document.write(`
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>e-Tax用ファイルプレビュー - ${c}年度</title>
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
        <h1>📄 ${r?"青色申告決算書":"収支内訳書"}（${c}年度）</h1>
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
            `),k.document.close())},de=()=>{const[n,h]=A.useState(null),w=async(k,I)=>{try{await navigator.clipboard.writeText(String(k).replace(/[¥,]/g,"")),h(I),setTimeout(()=>h(null),2e3)}catch(S){console.error("コピーに失敗しました:",S)}};return e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsxs("h3",{className:"text-lg font-semibold text-text-main mb-4 flex items-center gap-2",children:[e.jsx(L,{className:"w-5 h-5 text-primary"}),"確定申告書の作成"]}),e.jsx("p",{className:"text-text-muted mb-2",children:"入力内容を確認して、書類を作成してください。"}),e.jsx("p",{className:"text-xs text-text-muted",children:"💡 各項目の右側のコピーボタンで、e-Tax入力時にそのまま貼り付けできます"})]}),e.jsxs("div",{className:"bg-surface border border-border rounded-xl divide-y divide-border",children:[e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"申告年度"}),e.jsx("div",{className:"flex items-center gap-2",children:e.jsxs("span",{className:"font-medium text-text-main",children:[c,"年度"]})})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"申告方法"}),e.jsx("span",{className:"font-medium text-text-main",children:r?"青色申告":"白色申告"})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"売上高"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-success",children:y(a.totalRevenue)}),e.jsx("button",{onClick:()=>w(a.totalRevenue,"revenue"),className:`p-1.5 rounded transition-colors ${n==="revenue"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:n==="revenue"?e.jsx(D,{className:"w-4 h-4"}):e.jsx(F,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"経費合計"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-error",children:y(a.totalExpenses)}),e.jsx("button",{onClick:()=>w(a.totalExpenses,"expenses"),className:`p-1.5 rounded transition-colors ${n==="expenses"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:n==="expenses"?e.jsx(D,{className:"w-4 h-4"}):e.jsx(F,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"事業所得"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-text-main",children:y(a.netIncome)}),e.jsx("button",{onClick:()=>w(a.netIncome,"netIncome"),className:`p-1.5 rounded transition-colors ${n==="netIncome"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:n==="netIncome"?e.jsx(D,{className:"w-4 h-4"}):e.jsx(F,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"控除合計"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-primary",children:y(a.totalDeductions)}),e.jsx("button",{onClick:()=>w(a.totalDeductions,"deductions"),className:`p-1.5 rounded transition-colors ${n==="deductions"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:n==="deductions"?e.jsx(D,{className:"w-4 h-4"}):e.jsx(F,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"課税所得"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-text-main",children:y(a.taxableIncome)}),e.jsx("button",{onClick:()=>w(a.taxableIncome,"taxableIncome"),className:`p-1.5 rounded transition-colors ${n==="taxableIncome"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:n==="taxableIncome"?e.jsx(D,{className:"w-4 h-4"}):e.jsx(F,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center bg-primary-light",children:[e.jsx("span",{className:"font-medium text-text-main",children:"予想所得税額"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-bold text-primary text-lg",children:y(a.estimatedTax)}),e.jsx("button",{onClick:()=>w(a.estimatedTax,"tax"),className:`p-1.5 rounded transition-colors ${n==="tax"?"bg-success text-white":"hover:bg-primary/20 text-primary"}`,title:"コピー",children:n==="tax"?e.jsx(D,{className:"w-4 h-4"}):e.jsx(F,{className:"w-4 h-4"})})]})]})]}),e.jsxs("div",{className:"space-y-4",children:[e.jsx("h4",{className:"text-md font-medium text-text-main",children:"📥 ダウンロード"}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-4",children:[e.jsxs("button",{onClick:H,className:"btn-primary py-4 flex items-center justify-center gap-2",children:[e.jsx(se,{className:"w-5 h-5"}),"申告書プレビュー"]}),e.jsxs("button",{onClick:oe,className:"btn-outline py-4 flex items-center justify-center gap-2 border-2 border-blue-500 text-blue-500 hover:bg-blue-500/10",children:[e.jsx($e,{className:"w-5 h-5"}),"e-Tax用XMLファイル"]})]}),e.jsxs("div",{className:"bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4",children:[e.jsx("h5",{className:"text-sm font-medium text-text-main mb-3 flex items-center gap-2",children:"✨ テンプレート自動転記（NEW!）"}),e.jsx("p",{className:"text-xs text-text-muted mb-3",children:"国税庁の申告書テンプレートにAinanceのデータを自動入力したPDFを生成します"}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-3",children:[e.jsxs("button",{onClick:async()=>{var k;try{const I={revenue:a.totalRevenue,expenses:a.totalExpenses,netIncome:a.netIncome,expensesByCategory:a.expensesByCategory,deductions:{basic:((k=g.find(ue=>ue.type==="basic"))==null?void 0:k.amount)||48e4,blueReturn:r?65e4:0},taxableIncome:a.taxableIncome,estimatedTax:a.estimatedTax,fiscalYear:c,isBlueReturn:r},{pdfBytes:S,filename:me}=await Z("tax_return_b",I);Q(S,me),ee(S)}catch(I){console.error("PDF生成エラー:",I),alert("PDF生成に失敗しました。テンプレートファイルを確認してください。")}},className:"px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium flex items-center justify-center gap-2",children:[e.jsx(L,{className:"w-4 h-4"}),"確定申告書B"]}),r&&e.jsxs("button",{onClick:async()=>{try{const k={revenue:a.totalRevenue,expenses:a.totalExpenses,netIncome:a.netIncome,expensesByCategory:a.expensesByCategory,deductions:{blueReturn:65e4},taxableIncome:a.taxableIncome,estimatedTax:a.estimatedTax,fiscalYear:c,isBlueReturn:!0},{pdfBytes:I,filename:S}=await Z("blue_return",k);Q(I,S),ee(I)}catch(k){console.error("PDF生成エラー:",k),alert("PDF生成に失敗しました。テンプレートファイルを確認してください。")}},className:"px-4 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium flex items-center justify-center gap-2",children:[e.jsx(L,{className:"w-4 h-4"}),"青色申告決算書"]})]})]})]}),e.jsxs("div",{className:"bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-xl p-5",children:[e.jsxs("h4",{className:"text-md font-medium text-text-main mb-3 flex items-center gap-2",children:[e.jsx(X,{className:"w-5 h-5 text-blue-500"}),"e-Taxで直接申告する"]}),e.jsxs("ol",{className:"text-sm text-text-muted space-y-2 mb-4",children:[e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx("span",{className:"flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs",children:"1"}),"上のコピーボタンで各数値をコピー"]}),e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx("span",{className:"flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs",children:"2"}),"確定申告書等作成コーナーにアクセス"]}),e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx("span",{className:"flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs",children:"3"}),"コピーした数値を貼り付けて入力"]}),e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx("span",{className:"flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs",children:"4"}),"マイナンバーカードで電子署名 → 送信完了！"]})]}),e.jsxs("a",{href:"https://www.keisan.nta.go.jp/kyoutu/ky/smsp/top",target:"_blank",rel:"noopener noreferrer",className:"inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm",children:[e.jsx(X,{className:"w-4 h-4"}),"確定申告書等作成コーナーを開く"]}),e.jsx(O,{to:"/tax-filing-guide",className:"inline-flex items-center gap-2 px-4 py-2 ml-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm",children:"📖 詳しい申告ガイドを見る"})]}),e.jsxs("div",{className:"bg-warning-light border border-warning/20 rounded-lg p-4 flex items-start gap-3",children:[e.jsx(V,{className:"w-5 h-5 text-warning flex-shrink-0 mt-0.5"}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-text-main font-medium",children:"ご注意ください"}),e.jsxs("ul",{className:"text-sm text-text-muted mt-2 space-y-1 list-disc list-inside",children:[e.jsx("li",{children:"この計算は概算です。正確な税額は税務署にご確認ください"}),e.jsx("li",{children:"確定申告の期限は翌年3月15日です（例：2025年度分は2026年3月15日まで）"}),e.jsx("li",{children:"青色申告特別控除65万円の適用には電子申告が必要です"})]})]})]})]})},xe=()=>{switch(l){case 1:return e.jsx(ie,{});case 2:return e.jsx(re,{});case 3:return e.jsx(ce,{});case 4:return e.jsx(le,{});case 5:return e.jsx(de,{});default:return null}};return e.jsx("div",{className:"min-h-screen bg-background",children:e.jsxs("div",{className:"max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8",children:[e.jsxs("div",{className:"mb-8",children:[e.jsxs(O,{to:"/dashboard",className:"flex items-center text-primary hover:text-primary-hover mb-4",children:[e.jsx(G,{className:"h-5 w-5 mr-2"}),"ダッシュボードに戻る"]}),e.jsx("h1",{className:"text-3xl font-bold text-text-main mb-2",children:"確定申告サポート"}),e.jsx("p",{className:"text-text-muted",children:"5つのステップで簡単に確定申告を完了できます"})]}),e.jsx(ae,{}),e.jsx("div",{className:"bg-surface border border-border rounded-xl p-6 mb-6",children:xe()}),e.jsxs("div",{className:"flex justify-between",children:[e.jsxs("button",{onClick:R,disabled:l===1,className:`btn-ghost ${l===1?"opacity-50 cursor-not-allowed":""}`,children:[e.jsx(G,{className:"w-5 h-5"}),"戻る"]}),l<B.length?e.jsxs("button",{onClick:$,className:"btn-primary",children:["次へ",e.jsx(Ie,{className:"w-5 h-5"})]}):e.jsxs("button",{onClick:H,className:"btn-success",children:[e.jsx(q,{className:"w-5 h-5"}),"完了"]})]})]})})};export{We as default};
