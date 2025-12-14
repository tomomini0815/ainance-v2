import{c as z,a as ue,b as he,d as pe,r as w,j as e,L as R,F as A,P as _,S as D,R as be,g as $,t as ge,T as fe}from"./index-BkGgclA1.js";import{g as je,c as ye,f as u,E as B,A as L,a as Ne,b as we}from"./TaxFilingService-DSOYBCor.js";import{P as H,S as J,r as W}from"./PDFButton-Bre31vjT.js";import{A as P}from"./arrow-left-DQ7xz1E4.js";import{C as ve}from"./calculator-Da8DDACk.js";import{D as q}from"./download-yQuWCeYr.js";import{A as ke}from"./arrow-right-fyhh9MWk.js";import{C as U}from"./circle-check-big-Dd-w2ark.js";import{C as I}from"./copy-DJA6rvoQ.js";import{C as M}from"./circle-alert-Dt4eIDon.js";import{R as $e}from"./refresh-cw-WCkbmsL2.js";/**
 * @license lucide-react v0.540.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ce=[["path",{d:"M10 12.5 8 15l2 2.5",key:"1tg20x"}],["path",{d:"m14 12.5 2 2.5-2 2.5",key:"yinavb"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z",key:"1mlx9k"}]],Ie=z("file-code",Ce);/**
 * @license lucide-react v0.540.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Te=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 16v-4",key:"1dtifu"}],["path",{d:"M12 8h.01",key:"e9boi3"}]],Ae=z("info",Te);function De(a){const s=new Date,h=s.toISOString().replace(/[-:]/g,"").split(".")[0],r={売上高:"AA100",仕入高:"AB100",消耗品費:"AC100",旅費交通費:"AC110",通信費:"AC120",広告宣伝費:"AC130",接待交際費:"AC140",水道光熱費:"AC150",地代家賃:"AC160",外注費:"AC170",減価償却費:"AC180",雑費:"AC190"},m=a.expensesByCategory.map((c,i)=>{const o=r[c.category]||`AC${200+i}`;return`    <${o}>${c.amount}</${o}>`}).join(`
`);return`<?xml version="1.0" encoding="UTF-8"?>
<!--
  Ainance e-Tax Export File
  生成日時: ${s.toLocaleString("ja-JP")}
  対象年度: ${a.fiscalYear}年度
  申告区分: ${a.filingType==="blue"?"青色申告":"白色申告"}
-->
<申告書等送信票等>
  <作成日時>${h}</作成日時>
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
${m}
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
${a.deductions.map(c=>`      <${c.type}>${c.amount}</${c.type}>`).join(`
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
${a.expensesByCategory.map(r=>`    <${r.category.replace(/\s/g,"")}>${r.amount}</${r.category.replace(/\s/g,"")}>`).join(`
`)}
    <経費合計>${a.expenses}</経費合計>
  </必要経費>
  
  <差引金額>${a.netIncome}</差引金額>
</収支内訳書>`}function _e(a,s){const h=new Blob(["\uFEFF"+a],{type:"application/xml;charset=utf-8"}),r=URL.createObjectURL(h),m=document.createElement("a");m.href=r,m.download=s,document.body.appendChild(m),m.click(),document.body.removeChild(m),setTimeout(()=>URL.revokeObjectURL(r),1e3)}const l={事業_営業等:{x:475,y:648},事業所得_営業等:{x:475,y:458},総所得金額:{x:475,y:318},社会保険料控除:{x:475,y:268},小規模企業共済等掛金控除:{x:475,y:248},生命保険料控除:{x:475,y:228},地震保険料控除:{x:475,y:208},配偶者控除:{x:475,y:168},扶養控除:{x:475,y:148},基礎控除:{x:475,y:128},所得控除合計:{x:475,y:88},住所:{x:120,y:780},氏名:{x:120,y:755},電話番号:{x:350,y:755}},g={売上金額:{x:430,y:680,width:100},売上原価:{x:430,y:640,width:100},差引金額:{x:430,y:600,width:100},租税公課:{x:430,y:540,width:80},荷造運賃:{x:430,y:520,width:80},水道光熱費:{x:430,y:500,width:80},旅費交通費:{x:430,y:480,width:80},通信費:{x:430,y:460,width:80},広告宣伝費:{x:430,y:440,width:80},接待交際費:{x:430,y:420,width:80},損害保険料:{x:430,y:400,width:80},修繕費:{x:430,y:380,width:80},消耗品費:{x:430,y:360,width:80},減価償却費:{x:430,y:340,width:80},福利厚生費:{x:430,y:320,width:80},給料賃金:{x:430,y:300,width:80},外注工賃:{x:430,y:280,width:80},地代家賃:{x:430,y:260,width:80},支払利息:{x:430,y:240,width:80},雑費:{x:430,y:220,width:80},経費計:{x:430,y:180,width:100},青色申告特別控除前の所得金額:{x:430,y:140,width:100},青色申告特別控除額:{x:430,y:120,width:100},所得金額:{x:430,y:80,width:100},屋号:{x:100,y:750,width:150},住所:{x:100,y:720,width:200},氏名:{x:100,y:690,width:150}},Se={交通費:"旅費交通費",旅費交通費:"旅費交通費",通信費:"通信費",水道光熱費:"水道光熱費",消耗品費:"消耗品費",接待交際費:"接待交際費",広告宣伝費:"広告宣伝費",地代家賃:"地代家賃",外注費:"外注工賃",給与:"給料賃金",雑費:"雑費",減価償却費:"減価償却費",修繕費:"修繕費",保険料:"損害保険料",福利厚生費:"福利厚生費",支払利息:"支払利息",租税公課:"租税公課",荷造運賃:"荷造運賃",その他:"雑費",未分類:"雑費"};async function Fe(a,s){const h=await H.load(a,{ignoreEncryption:!0}),m=h.getPages()[0],v=await h.embedFont(J.Helvetica),c=k=>k.toLocaleString("ja-JP"),i=(k,d,y,p=9)=>{m.drawText(k,{x:d,y,size:p,font:v,color:W(0,0,0)})};i(c(s.revenue),l.事業_営業等.x,l.事業_営業等.y),i(c(s.netIncome),l.事業所得_営業等.x,l.事業所得_営業等.y),i(c(s.netIncome),l.総所得金額.x,l.総所得金額.y),s.deductions.socialInsurance&&i(c(s.deductions.socialInsurance),l.社会保険料控除.x,l.社会保険料控除.y),s.deductions.smallBusinessMutual&&i(c(s.deductions.smallBusinessMutual),l.小規模企業共済等掛金控除.x,l.小規模企業共済等掛金控除.y),s.deductions.lifeInsurance&&i(c(s.deductions.lifeInsurance),l.生命保険料控除.x,l.生命保険料控除.y),s.deductions.earthquakeInsurance&&i(c(s.deductions.earthquakeInsurance),l.地震保険料控除.x,l.地震保険料控除.y),s.deductions.spouse&&i(c(s.deductions.spouse),l.配偶者控除.x,l.配偶者控除.y),s.deductions.dependents&&i(c(s.deductions.dependents),l.扶養控除.x,l.扶養控除.y),s.deductions.basic&&i(c(s.deductions.basic),l.基礎控除.x,l.基礎控除.y);const o=Object.values(s.deductions).reduce((k,d)=>k+(d||0),0);return i(c(o),l.所得控除合計.x,l.所得控除合計.y),s.address&&i(s.address,l.住所.x,l.住所.y,8),s.name&&i(s.name,l.氏名.x,l.氏名.y),s.phone&&i(s.phone,l.電話番号.x,l.電話番号.y),h.save()}async function Ee(a,s){const h=await H.load(a,{ignoreEncryption:!0}),m=h.getPages()[0],v=await h.embedFont(J.Helvetica),c=d=>d.toLocaleString("ja-JP"),i=(d,y,p,C=9)=>{m.drawText(d,{x:y,y:p,size:C,font:v,color:W(0,0,0)})};i(c(s.revenue),g.売上金額.x,g.売上金額.y);const o={};s.expensesByCategory.forEach(d=>{const y=Se[d.category]||"雑費";o[y]=(o[y]||0)+d.amount}),Object.entries(o).forEach(([d,y])=>{const p=g[d];p&&i(c(y),p.x,p.y)}),i(c(s.expenses),g.経費計.x,g.経費計.y),i(c(s.revenue-s.expenses),g.差引金額.x,g.差引金額.y),i(c(s.netIncome),g.青色申告特別控除前の所得金額.x,g.青色申告特別控除前の所得金額.y),s.isBlueReturn&&s.deductions.blueReturn&&i(c(s.deductions.blueReturn),g.青色申告特別控除額.x,g.青色申告特別控除額.y);const k=s.netIncome-(s.deductions.blueReturn||0);return i(c(Math.max(0,k)),g.所得金額.x,g.所得金額.y),s.tradeName&&i(s.tradeName,g.屋号.x,g.屋号.y),s.address&&i(s.address,g.住所.x,g.住所.y,8),s.name&&i(s.name,g.氏名.x,g.氏名.y),h.save()}async function O(a,s){const r=await fetch(a==="tax_return_b"?"/templates/tax_return_r05.pdf":"/templates/blue_return_r05.pdf");if(!r.ok)throw new Error(`テンプレートの読み込みに失敗しました: ${r.statusText}`);const m=await r.arrayBuffer(),v=a==="tax_return_b"?await Fe(m,s):await Ee(m,s),c=a==="tax_return_b"?`確定申告書B_${s.fiscalYear}年度_入力済み.pdf`:`青色申告決算書_${s.fiscalYear}年度_入力済み.pdf`;return{pdfBytes:v,filename:c}}function Y(a,s){const h=new Blob([new Uint8Array(a)],{type:"application/pdf"}),r=URL.createObjectURL(h),m=document.createElement("a");m.href=r,m.download=s,document.body.appendChild(m),m.click(),document.body.removeChild(m),setTimeout(()=>URL.revokeObjectURL(r),1e3)}function X(a){const s=new Blob([new Uint8Array(a)],{type:"application/pdf"}),h=URL.createObjectURL(s);window.open(h,"_blank")}const T=[{id:1,title:"基本情報",icon:A,description:"確定申告の基本設定"},{id:2,title:"収支確認",icon:ve,description:"売上・経費の確認"},{id:3,title:"控除入力",icon:_,description:"各種控除の入力"},{id:4,title:"AI診断",icon:D,description:"AIによる節税アドバイス"},{id:5,title:"申告書作成",icon:q,description:"PDFダウンロード"}],We=()=>{const{user:a}=ue(),{currentBusinessType:s}=he(),{transactions:h}=pe(a==null?void 0:a.id,s==null?void 0:s.business_type),[r,m]=w.useState(1),[v,c]=w.useState(!1),i=new Date().getFullYear(),[o,k]=w.useState(i-1),[d,y]=w.useState(!0),[p,C]=w.useState([]),[S,G]=w.useState([]),[F,V]=w.useState(0);w.useEffect(()=>{C(je(d))},[d]);const n=w.useMemo(()=>ye(h,o,(s==null?void 0:s.business_type)||"individual",p),[h,o,s,p]),K=()=>{r<T.length&&m(r+1)},Z=()=>{r>1&&m(r-1)},Q=t=>{const x=L.find(b=>b.type===t);x&&!p.find(b=>b.type===t)&&C([...p,{id:Date.now().toString(),...x,amount:0,isApplicable:!0}])},ee=t=>{C(p.filter(x=>x.id!==t))},te=(t,x)=>{C(p.map(b=>b.id===t?{...b,amount:x}:b))},se=async()=>{c(!0);try{const t=await we(n,{});G(t.suggestions),V(t.estimatedSavings)}catch(t){console.error("AI診断エラー:",t)}finally{c(!1)}},E=()=>{const t=`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
           確定申告書（${o}年度）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

申告方法: ${d?"青色申告":"白色申告"}
作成日時: ${new Date().toLocaleString("ja-JP")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【収支内訳】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
売上高:     ${u(n.totalRevenue)}
経費合計:   ${u(n.totalExpenses)}
──────────────────────────────────────────────────
事業所得:   ${u(n.netIncome)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【控除内訳】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${p.filter(N=>N.isApplicable).map(N=>`${N.name.padEnd(20,"　")}: ${u(N.amount)}`).join(`
`)}
──────────────────────────────────────────────────
控除合計:   ${u(n.totalDeductions)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【税額計算】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
課税所得:   ${u(n.taxableIncome)}
──────────────────────────────────────────────────
所得税額:   ${u(n.estimatedTax)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
※この書類はAinanceで生成された概算資料です。
  正式な確定申告は国税庁のe-Taxでお手続きください。
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`.trim(),x=new Blob(["\uFEFF"+t],{type:"text/plain;charset=utf-8"}),b=URL.createObjectURL(x),f=document.createElement("a");f.href=b,f.download=`確定申告書_${o}年度.txt`,document.body.appendChild(f),f.click(),document.body.removeChild(f);const j=window.open("","_blank");j&&(j.document.write(`
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>確定申告書プレビュー - ${o}年度</title>
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
        <p class="subtitle">${o}年度 | ${d?"青色申告":"白色申告"} | 作成日: ${new Date().toLocaleDateString("ja-JP")}</p>
        <pre>${t}</pre>
        <div class="actions">
            <button class="print-btn" onclick="window.print()">🖨️ 印刷する</button>
            <button class="close-btn" onclick="window.close()">✕ 閉じる</button>
        </div>
    </div>
</body>
</html>
            `),j.document.close()),setTimeout(()=>URL.revokeObjectURL(b),1e3)},ne=()=>e.jsx("div",{className:"mb-8",children:e.jsx("div",{className:"flex items-center justify-between",children:T.map((t,x)=>e.jsxs(be.Fragment,{children:[e.jsxs("div",{className:"flex flex-col items-center",children:[e.jsx("div",{className:`w-10 h-10 rounded-full flex items-center justify-center transition-all ${r>t.id?"bg-success text-white":r===t.id?"bg-primary text-white":"bg-surface-highlight text-text-muted"}`,children:r>t.id?e.jsx($,{className:"w-5 h-5"}):e.jsx(t.icon,{className:"w-5 h-5"})}),e.jsx("span",{className:`text-xs mt-2 hidden sm:block ${r>=t.id?"text-text-main font-medium":"text-text-muted"}`,children:t.title})]}),x<T.length-1&&e.jsx("div",{className:`flex-1 h-1 mx-2 rounded ${r>t.id?"bg-success":"bg-surface-highlight"}`})]},t.id))})}),ae=()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold text-text-main mb-4",children:"確定申告の基本設定"}),e.jsx("p",{className:"text-text-muted mb-6",children:"確定申告を行う年度と申告方法を選択してください。"})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-text-main mb-2",children:"申告年度"}),e.jsx("select",{value:o,onChange:t=>k(Number(t.target.value)),className:"input-base",children:[i,...Array.from({length:4},(t,x)=>i-1-x)].map(t=>e.jsxs("option",{value:t,children:[t,"年度（",t,"年1月〜12月）",t===i&&" ※進行中"]},t))})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-text-main mb-2",children:"申告方法"}),e.jsxs("div",{className:"space-y-3",children:[e.jsxs("label",{className:"flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-surface-highlight transition-colors",children:[e.jsx("input",{type:"radio",checked:d,onChange:()=>y(!0),className:"w-4 h-4 text-primary"}),e.jsxs("div",{className:"ml-3",children:[e.jsx("span",{className:"font-medium text-text-main",children:"青色申告"}),e.jsx("span",{className:"ml-2 text-xs text-success",children:"最大65万円控除"}),e.jsx("p",{className:"text-sm text-text-muted mt-1",children:"複式簿記で最大65万円の控除が受けられます"})]})]}),e.jsxs("label",{className:"flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-surface-highlight transition-colors",children:[e.jsx("input",{type:"radio",checked:!d,onChange:()=>y(!1),className:"w-4 h-4 text-primary"}),e.jsxs("div",{className:"ml-3",children:[e.jsx("span",{className:"font-medium text-text-main",children:"白色申告"}),e.jsx("p",{className:"text-sm text-text-muted mt-1",children:"簡易的な帳簿で申告できます"})]})]})]})]})]}),e.jsxs("div",{className:"bg-info-light border border-info/20 rounded-lg p-4 flex items-start gap-3",children:[e.jsx(Ae,{className:"w-5 h-5 text-info flex-shrink-0 mt-0.5"}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-text-main font-medium",children:"青色申告がおすすめ！"}),e.jsx("p",{className:"text-sm text-text-muted mt-1",children:"Ainanceで取引を記録していれば、複式簿記の要件を満たしています。 65万円の控除で税金がお得になります。"})]})]})]}),ie=()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold text-text-main mb-4",children:"収支の確認"}),e.jsxs("p",{className:"text-text-muted mb-6",children:[o,"年度の取引データから自動集計した結果です。"]})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4",children:[e.jsxs("div",{className:"bg-success-light border border-success/20 rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-success font-medium",children:"売上高"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:u(n.totalRevenue)})]}),e.jsxs("div",{className:"bg-error-light border border-error/20 rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-error font-medium",children:"経費合計"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:u(n.totalExpenses)})]}),e.jsxs("div",{className:"bg-primary-light border border-primary/20 rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-primary font-medium",children:"事業所得"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:u(n.netIncome)})]})]}),e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-5",children:[e.jsx("h4",{className:"font-medium text-text-main mb-4",children:"経費内訳（上位5件）"}),n.expensesByCategory.length>0?e.jsx("div",{className:"space-y-3",children:n.expensesByCategory.slice(0,5).map((t,x)=>e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"w-8 h-8 bg-surface-highlight rounded-lg flex items-center justify-center text-sm font-medium text-text-muted",children:x+1}),e.jsx("span",{className:"text-text-main",children:t.category})]}),e.jsxs("div",{className:"text-right",children:[e.jsx("span",{className:"font-medium text-text-main",children:u(t.amount)}),e.jsxs("span",{className:"text-text-muted text-sm ml-2",children:["(",Ne(t.percentage),")"]})]})]},x))}):e.jsxs("p",{className:"text-text-muted text-center py-4",children:[o,"年度の経費データがありません"]})]}),n.totalRevenue===0&&n.totalExpenses===0&&e.jsxs("div",{className:"bg-warning-light border border-warning/20 rounded-lg p-4 flex items-start gap-3",children:[e.jsx(M,{className:"w-5 h-5 text-warning flex-shrink-0 mt-0.5"}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-text-main font-medium",children:"取引データがありません"}),e.jsxs("p",{className:"text-sm text-text-muted mt-1",children:[o,"年度の取引を登録してから確定申告を行ってください。",e.jsx(R,{to:"/transactions",className:"text-primary hover:underline ml-1",children:"取引を登録する →"})]})]})]})]}),re=()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold text-text-main mb-4",children:"各種控除の入力"}),e.jsx("p",{className:"text-text-muted mb-6",children:"該当する控除を追加して金額を入力してください。控除が多いほど税金が安くなります。"})]}),e.jsx("div",{className:"space-y-4",children:p.map(t=>e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4",children:[e.jsxs("div",{className:"flex-1",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(U,{className:"w-5 h-5 text-success"}),e.jsx("span",{className:"font-medium text-text-main",children:t.name})]}),e.jsx("p",{className:"text-sm text-text-muted mt-1 ml-7",children:t.description})]}),e.jsxs("div",{className:"flex items-center gap-3 ml-7 sm:ml-0",children:[e.jsxs("div",{className:"relative",children:[e.jsx("span",{className:"absolute left-3 top-1/2 -translate-y-1/2 text-text-muted",children:"¥"}),e.jsx("input",{type:"number",value:t.amount,onChange:x=>te(t.id,Number(x.target.value)),className:"input-base pl-8 w-40",placeholder:"金額",disabled:t.type==="basic"||t.type==="blue_return"})]}),t.type!=="basic"&&t.type!=="blue_return"&&e.jsx("button",{onClick:()=>ee(t.id),className:"p-2 text-error hover:bg-error-light rounded-lg transition-colors",children:e.jsx(fe,{className:"w-5 h-5"})})]})]},t.id))}),e.jsxs("div",{className:"bg-surface-highlight border border-border rounded-xl p-5",children:[e.jsxs("h4",{className:"font-medium text-text-main mb-4 flex items-center gap-2",children:[e.jsx(_,{className:"w-5 h-5"}),"控除を追加"]}),e.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-3",children:L.filter(t=>!p.find(x=>x.type===t.type)).map(t=>e.jsxs("button",{onClick:()=>Q(t.type),className:"flex items-center gap-3 p-3 bg-surface border border-border rounded-lg hover:border-primary hover:bg-primary-light transition-colors text-left",children:[e.jsx("div",{className:"w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center",children:e.jsx(_,{className:"w-4 h-4 text-primary"})}),e.jsxs("div",{children:[e.jsx("p",{className:"font-medium text-text-main text-sm",children:t.name}),e.jsx("p",{className:"text-xs text-text-muted",children:t.description})]})]},t.type))})]}),e.jsxs("div",{className:"bg-success-light border border-success/20 rounded-xl p-5 flex items-center justify-between",children:[e.jsx("span",{className:"font-medium text-text-main",children:"控除合計"}),e.jsx("span",{className:"text-2xl font-bold text-success",children:u(n.totalDeductions)})]})]}),ce=()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsxs("h3",{className:"text-lg font-semibold text-text-main mb-4 flex items-center gap-2",children:[e.jsx(D,{className:"w-5 h-5 text-primary"}),"AIによる節税アドバイス"]}),e.jsx("p",{className:"text-text-muted mb-6",children:"AIがあなたの収支データを分析し、節税のアドバイスを提供します。"})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-text-muted",children:"課税所得"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:u(n.taxableIncome)}),e.jsx("p",{className:"text-xs text-text-muted mt-2",children:"事業所得 - 各種控除"})]}),e.jsxs("div",{className:"bg-primary-light border border-primary/20 rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-primary font-medium",children:"予想所得税額"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:u(n.estimatedTax)}),e.jsx("p",{className:"text-xs text-text-muted mt-2",children:"※概算です。実際の税額とは異なる場合があります"})]})]}),S.length===0?e.jsx("button",{onClick:se,disabled:v,className:"btn-primary w-full py-4",children:v?e.jsxs(e.Fragment,{children:[e.jsx($e,{className:"w-5 h-5 animate-spin"}),"AI分析中..."]}):e.jsxs(e.Fragment,{children:[e.jsx(D,{className:"w-5 h-5"}),"AIアドバイスを受ける"]})}):e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-5 space-y-4",children:[e.jsxs("div",{className:"flex items-center gap-2 text-primary",children:[e.jsx(D,{className:"w-5 h-5"}),e.jsx("span",{className:"font-medium",children:"AIからのアドバイス"})]}),e.jsx("ul",{className:"space-y-3",children:S.map((t,x)=>e.jsxs("li",{className:"flex items-start gap-3",children:[e.jsx(ge,{className:"w-5 h-5 text-primary flex-shrink-0 mt-0.5"}),e.jsx("span",{className:"text-text-main",children:t})]},x))}),F>0&&e.jsx("div",{className:"bg-success-light border border-success/20 rounded-lg p-4 mt-4",children:e.jsxs("p",{className:"text-sm text-success font-medium",children:["推定節税可能額: ",u(F)]})})]})]}),le=()=>{const t={fiscalYear:o,filingType:d?"blue":"white",revenue:n.totalRevenue,expenses:n.totalExpenses,netIncome:n.netIncome,expensesByCategory:n.expensesByCategory,deductions:p.filter(j=>j.isApplicable).map(j=>({type:j.type,name:j.name,amount:j.amount})),totalDeductions:n.totalDeductions,taxableIncome:n.taxableIncome,estimatedTax:n.estimatedTax},x=d?De(t):Re(t),b=d?`青色申告決算書_${o}年度.xtx`:`収支内訳書_${o}年度.xml`;_e(x,b);const f=window.open("","_blank");f&&(f.document.write(`
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>e-Tax用ファイルプレビュー - ${o}年度</title>
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
        <h1>📄 ${d?"青色申告決算書":"収支内訳書"}（${o}年度）</h1>
        <div class="info">
            <p>⚠️ <strong>このXMLファイルは参考資料です。</strong></p>
            <p>正式な確定申告は、国税庁の確定申告書等作成コーナーをご利用ください。XMLデータは入力の参考にお使いいただけます。</p>
        </div>
        <pre>${x.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</pre>
        <div class="actions">
            <button class="secondary" onclick="window.close()">✕ 閉じる</button>
        </div>
    </div>
</body>
</html>
            `),f.document.close())},oe=()=>{const[t,x]=w.useState(null),b=async(f,j)=>{try{await navigator.clipboard.writeText(String(f).replace(/[¥,]/g,"")),x(j),setTimeout(()=>x(null),2e3)}catch(N){console.error("コピーに失敗しました:",N)}};return e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsxs("h3",{className:"text-lg font-semibold text-text-main mb-4 flex items-center gap-2",children:[e.jsx(A,{className:"w-5 h-5 text-primary"}),"確定申告書の作成"]}),e.jsx("p",{className:"text-text-muted mb-2",children:"入力内容を確認して、書類を作成してください。"}),e.jsx("p",{className:"text-xs text-text-muted",children:"💡 各項目の右側のコピーボタンで、e-Tax入力時にそのまま貼り付けできます"})]}),e.jsxs("div",{className:"bg-surface border border-border rounded-xl divide-y divide-border",children:[e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"申告年度"}),e.jsx("div",{className:"flex items-center gap-2",children:e.jsxs("span",{className:"font-medium text-text-main",children:[o,"年度"]})})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"申告方法"}),e.jsx("span",{className:"font-medium text-text-main",children:d?"青色申告":"白色申告"})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"売上高"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-success",children:u(n.totalRevenue)}),e.jsx("button",{onClick:()=>b(n.totalRevenue,"revenue"),className:`p-1.5 rounded transition-colors ${t==="revenue"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:t==="revenue"?e.jsx($,{className:"w-4 h-4"}):e.jsx(I,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"経費合計"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-error",children:u(n.totalExpenses)}),e.jsx("button",{onClick:()=>b(n.totalExpenses,"expenses"),className:`p-1.5 rounded transition-colors ${t==="expenses"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:t==="expenses"?e.jsx($,{className:"w-4 h-4"}):e.jsx(I,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"事業所得"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-text-main",children:u(n.netIncome)}),e.jsx("button",{onClick:()=>b(n.netIncome,"netIncome"),className:`p-1.5 rounded transition-colors ${t==="netIncome"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:t==="netIncome"?e.jsx($,{className:"w-4 h-4"}):e.jsx(I,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"控除合計"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-primary",children:u(n.totalDeductions)}),e.jsx("button",{onClick:()=>b(n.totalDeductions,"deductions"),className:`p-1.5 rounded transition-colors ${t==="deductions"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:t==="deductions"?e.jsx($,{className:"w-4 h-4"}):e.jsx(I,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"課税所得"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-text-main",children:u(n.taxableIncome)}),e.jsx("button",{onClick:()=>b(n.taxableIncome,"taxableIncome"),className:`p-1.5 rounded transition-colors ${t==="taxableIncome"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:t==="taxableIncome"?e.jsx($,{className:"w-4 h-4"}):e.jsx(I,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center bg-primary-light",children:[e.jsx("span",{className:"font-medium text-text-main",children:"予想所得税額"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-bold text-primary text-lg",children:u(n.estimatedTax)}),e.jsx("button",{onClick:()=>b(n.estimatedTax,"tax"),className:`p-1.5 rounded transition-colors ${t==="tax"?"bg-success text-white":"hover:bg-primary/20 text-primary"}`,title:"コピー",children:t==="tax"?e.jsx($,{className:"w-4 h-4"}):e.jsx(I,{className:"w-4 h-4"})})]})]})]}),e.jsxs("div",{className:"space-y-4",children:[e.jsx("h4",{className:"text-md font-medium text-text-main",children:"📥 ダウンロード"}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-4",children:[e.jsxs("button",{onClick:E,className:"btn-primary py-4 flex items-center justify-center gap-2",children:[e.jsx(q,{className:"w-5 h-5"}),"申告書プレビュー"]}),e.jsxs("button",{onClick:le,className:"btn-outline py-4 flex items-center justify-center gap-2 border-2 border-blue-500 text-blue-500 hover:bg-blue-500/10",children:[e.jsx(Ie,{className:"w-5 h-5"}),"e-Tax用XMLファイル"]})]}),e.jsxs("div",{className:"bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4",children:[e.jsx("h5",{className:"text-sm font-medium text-text-main mb-3 flex items-center gap-2",children:"✨ テンプレート自動転記（NEW!）"}),e.jsx("p",{className:"text-xs text-text-muted mb-3",children:"国税庁の申告書テンプレートにAinanceのデータを自動入力したPDFを生成します"}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-3",children:[e.jsxs("button",{onClick:async()=>{var f;try{const j={revenue:n.totalRevenue,expenses:n.totalExpenses,netIncome:n.netIncome,expensesByCategory:n.expensesByCategory,deductions:{basic:((f=p.find(me=>me.type==="basic"))==null?void 0:f.amount)||48e4,blueReturn:d?65e4:0},taxableIncome:n.taxableIncome,estimatedTax:n.estimatedTax,fiscalYear:o,isBlueReturn:d},{pdfBytes:N,filename:xe}=await O("tax_return_b",j);Y(N,xe),X(N)}catch(j){console.error("PDF生成エラー:",j),alert("PDF生成に失敗しました。テンプレートファイルを確認してください。")}},className:"px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium flex items-center justify-center gap-2",children:[e.jsx(A,{className:"w-4 h-4"}),"確定申告書B"]}),d&&e.jsxs("button",{onClick:async()=>{try{const f={revenue:n.totalRevenue,expenses:n.totalExpenses,netIncome:n.netIncome,expensesByCategory:n.expensesByCategory,deductions:{blueReturn:65e4},taxableIncome:n.taxableIncome,estimatedTax:n.estimatedTax,fiscalYear:o,isBlueReturn:!0},{pdfBytes:j,filename:N}=await O("blue_return",f);Y(j,N),X(j)}catch(f){console.error("PDF生成エラー:",f),alert("PDF生成に失敗しました。テンプレートファイルを確認してください。")}},className:"px-4 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium flex items-center justify-center gap-2",children:[e.jsx(A,{className:"w-4 h-4"}),"青色申告決算書"]})]})]})]}),e.jsxs("div",{className:"bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-xl p-5",children:[e.jsxs("h4",{className:"text-md font-medium text-text-main mb-3 flex items-center gap-2",children:[e.jsx(B,{className:"w-5 h-5 text-blue-500"}),"e-Taxで直接申告する"]}),e.jsxs("ol",{className:"text-sm text-text-muted space-y-2 mb-4",children:[e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx("span",{className:"flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs",children:"1"}),"上のコピーボタンで各数値をコピー"]}),e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx("span",{className:"flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs",children:"2"}),"確定申告書等作成コーナーにアクセス"]}),e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx("span",{className:"flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs",children:"3"}),"コピーした数値を貼り付けて入力"]}),e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx("span",{className:"flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs",children:"4"}),"マイナンバーカードで電子署名 → 送信完了！"]})]}),e.jsxs("a",{href:"https://www.keisan.nta.go.jp/kyoutu/ky/smsp/top",target:"_blank",rel:"noopener noreferrer",className:"inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm",children:[e.jsx(B,{className:"w-4 h-4"}),"確定申告書等作成コーナーを開く"]}),e.jsx(R,{to:"/tax-filing-guide",className:"inline-flex items-center gap-2 px-4 py-2 ml-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm",children:"📖 詳しい申告ガイドを見る"})]}),e.jsxs("div",{className:"bg-warning-light border border-warning/20 rounded-lg p-4 flex items-start gap-3",children:[e.jsx(M,{className:"w-5 h-5 text-warning flex-shrink-0 mt-0.5"}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-text-main font-medium",children:"ご注意ください"}),e.jsxs("ul",{className:"text-sm text-text-muted mt-2 space-y-1 list-disc list-inside",children:[e.jsx("li",{children:"この計算は概算です。正確な税額は税務署にご確認ください"}),e.jsx("li",{children:"確定申告の期限は翌年3月15日です（例：2025年度分は2026年3月15日まで）"}),e.jsx("li",{children:"青色申告特別控除65万円の適用には電子申告が必要です"})]})]})]})]})},de=()=>{switch(r){case 1:return e.jsx(ae,{});case 2:return e.jsx(ie,{});case 3:return e.jsx(re,{});case 4:return e.jsx(ce,{});case 5:return e.jsx(oe,{});default:return null}};return e.jsx("div",{className:"min-h-screen bg-background",children:e.jsxs("div",{className:"max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8",children:[e.jsxs("div",{className:"mb-8",children:[e.jsxs(R,{to:"/dashboard",className:"flex items-center text-primary hover:text-primary-hover mb-4",children:[e.jsx(P,{className:"h-5 w-5 mr-2"}),"ダッシュボードに戻る"]}),e.jsx("h1",{className:"text-3xl font-bold text-text-main mb-2",children:"確定申告サポート"}),e.jsx("p",{className:"text-text-muted",children:"5つのステップで簡単に確定申告を完了できます"})]}),e.jsx(ne,{}),e.jsx("div",{className:"bg-surface border border-border rounded-xl p-6 mb-6",children:de()}),e.jsxs("div",{className:"flex justify-between",children:[e.jsxs("button",{onClick:Z,disabled:r===1,className:`btn-ghost ${r===1?"opacity-50 cursor-not-allowed":""}`,children:[e.jsx(P,{className:"w-5 h-5"}),"戻る"]}),r<T.length?e.jsxs("button",{onClick:K,className:"btn-primary",children:["次へ",e.jsx(ke,{className:"w-5 h-5"})]}):e.jsxs("button",{onClick:E,className:"btn-success",children:[e.jsx(U,{className:"w-5 h-5"}),"完了"]})]})]})})};export{We as default};
