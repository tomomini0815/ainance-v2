import{c as xe,a as me,e as pe,k as he,r as g,j as e,L as I,F as v,P as T,S,l as ue,d as N,C as be,o as ge}from"./index-DAuN3Ip0.js";import{D as je}from"./DepreciationCalculator-BNU8dxc9.js";import{g as fe,c as Ne,f as d,A as M,a as ye,b as ve}from"./TaxFilingService-DDB1LB_S.js";import{a as we,b as ke,c as Ce,d as $e}from"./pdfJapaneseService-DsXZ9Z1B.js";import{A as O}from"./arrow-left-BvEYQp4A.js";import{C as X}from"./calculator-Di1FVpKm.js";import{D as w}from"./download-DZbDHtKh.js";import{A as Ie}from"./arrow-right-sWgVXiPG.js";import{C as Y}from"./circle-check-big-CjPMfbFK.js";import{C as y}from"./copy-DSZ7KR2R.js";import{E}from"./external-link-CukSeLur.js";import{C as H}from"./circle-alert-C64QL4oE.js";import{R as De}from"./refresh-cw-jlSYWK-s.js";import{I as Ae}from"./info-BaAXa5dN.js";import"./CorporateTaxService-CXv67kaZ.js";import"./circle-question-mark-BaLiktJo.js";/**
 * @license lucide-react v0.540.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Fe=[["path",{d:"M10 12.5 8 15l2 2.5",key:"1tg20x"}],["path",{d:"m14 12.5 2 2.5-2 2.5",key:"yinavb"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z",key:"1mlx9k"}]],Se=xe("file-code",Fe);function Re(n){const a=new Date,u=a.toISOString().replace(/[-:]/g,"").split(".")[0],p={売上高:"AA100",仕入高:"AB100",消耗品費:"AC100",旅費交通費:"AC110",通信費:"AC120",広告宣伝費:"AC130",接待交際費:"AC140",水道光熱費:"AC150",地代家賃:"AC160",外注費:"AC170",減価償却費:"AC180",雑費:"AC190"},r=n.expensesByCategory.map((j,k)=>{const f=p[j.category]||`AC${200+k}`;return`    <${f}>${j.amount}</${f}>`}).join(`
`);return`<?xml version="1.0" encoding="UTF-8"?>
<!--
  Ainance e-Tax Export File
  生成日時: ${a.toLocaleString("ja-JP")}
  対象年度: ${n.fiscalYear}年度
  申告区分: ${n.filingType==="blue"?"青色申告":"白色申告"}
-->
<申告書等送信票等>
  <作成日時>${u}</作成日時>
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
${n.deductions.map(j=>`      <${j.type}>${j.amount}</${j.type}>`).join(`
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
</申告書等送信票等>`}function _e(n){return`<?xml version="1.0" encoding="UTF-8"?>
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
${n.expensesByCategory.map(p=>`    <${p.category.replace(/\s/g,"")}>${p.amount}</${p.category.replace(/\s/g,"")}>`).join(`
`)}
    <経費合計>${n.expenses}</経費合計>
  </必要経費>
  
  <差引金額>${n.netIncome}</差引金額>
</収支内訳書>`}function Ee(n,a){const u=new Blob(["\uFEFF"+n],{type:"application/xml;charset=utf-8"}),p=URL.createObjectURL(u),r=document.createElement("a");r.href=p,r.download=a,document.body.appendChild(r),r.click(),document.body.removeChild(r),setTimeout(()=>URL.revokeObjectURL(p),1e3)}function D(n,a){const u=new Blob([new Uint8Array(n)],{type:"application/pdf"}),p=URL.createObjectURL(u),r=document.createElement("a");r.href=p,r.download=a,document.body.appendChild(r),r.click(),document.body.removeChild(r),setTimeout(()=>URL.revokeObjectURL(p),1e3)}function A(n){const a=new Blob([new Uint8Array(n)],{type:"application/pdf"}),u=URL.createObjectURL(a);window.open(u,"_blank")}const F=[{id:1,title:"基本情報",icon:v,description:"申告の基本設定"},{id:2,title:"収支確認",icon:X,description:"売上・経費の確認"},{id:3,title:"減価償却",icon:X,description:"固定資産の償却計算"},{id:4,title:"控除入力",icon:T,description:"各種控除の入力"},{id:5,title:"AI診断",icon:S,description:"AIによる節税アドバイス"},{id:6,title:"申告書作成",icon:w,description:"PDFダウンロード"}],Ke=()=>{const{user:n}=me(),{currentBusinessType:a}=pe(),u=(a==null?void 0:a.business_type)==="corporation",{transactions:p}=he(n==null?void 0:n.id,a==null?void 0:a.business_type),[r,R]=g.useState(1),[j,k]=g.useState(!1),f=new Date().getFullYear(),[c,J]=g.useState(f-1),[h,P]=g.useState(!0),[b,C]=g.useState([]),[L,W]=g.useState([]),[U,V]=g.useState(0),[$,q]=g.useState(0);g.useEffect(()=>{C(fe(h))},[h]);const s=g.useMemo(()=>{const t=Ne(p,c,(a==null?void 0:a.business_type)||"individual",b);return{...t,totalExpenses:t.totalExpenses+$,netIncome:t.netIncome-$,taxableIncome:Math.max(0,t.taxableIncome-$)}},[p,c,a,b,$]),G=()=>{r<F.length&&R(r+1)},K=()=>{r>1&&R(r-1)},Z=t=>{const l=M.find(x=>x.type===t);l&&!b.find(x=>x.type===t)&&C([...b,{id:Date.now().toString(),...l,amount:0,isApplicable:!0}])},Q=t=>{C(b.filter(l=>l.id!==t))},ee=(t,l)=>{C(b.map(x=>x.id===t?{...x,amount:l}:x))},te=async()=>{k(!0);try{const t=await ve(s,{});W(t.suggestions),V(t.estimatedSavings)}catch(t){console.error("AI診断エラー:",t)}finally{k(!1)}},B=()=>{const t=`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
           ${u?"法人税申告書":"確定申告書"}（${c}年度）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

申告方法: ${h?"青色申告":"白色申告"}
作成日時: ${new Date().toLocaleString("ja-JP")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【収支内訳】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
売上高:     ${d(s.totalRevenue)}
経費合計:   ${d(s.totalExpenses)}
──────────────────────────────────────────────────
事業所得:   ${d(s.netIncome)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【控除内訳】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${b.filter(m=>m.isApplicable).map(m=>`${m.name.padEnd(20,"　")}: ${d(m.amount)}`).join(`
`)}
──────────────────────────────────────────────────
控除合計:   ${d(s.totalDeductions)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【税額計算】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
課税所得:   ${d(s.taxableIncome)}
──────────────────────────────────────────────────
所得税額:   ${d(s.estimatedTax)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
※この書類はAinanceで生成された概算資料です。
  正式な確定申告は国税庁のe-Taxでお手続きください。
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`.trim(),l=new Blob(["\uFEFF"+t],{type:"text/plain;charset=utf-8"}),x=URL.createObjectURL(l),i=document.createElement("a");i.href=x,i.download=`確定申告書_${c}年度.txt`,document.body.appendChild(i),i.click(),document.body.removeChild(i);const o=window.open("","_blank");o&&(o.document.write(`
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
        <p class="subtitle">${c}年度 | ${h?"青色申告":"白色申告"} | 作成日: ${new Date().toLocaleDateString("ja-JP")}</p>
        <pre>${t}</pre>
        <div class="actions">
            <button class="print-btn" onclick="window.print()">🖨️ 印刷する</button>
            <button class="close-btn" onclick="window.close()">✕ 閉じる</button>
        </div>
    </div>
</body>
</html>
            `),o.document.close()),setTimeout(()=>URL.revokeObjectURL(x),1e3)},se=()=>e.jsx("div",{className:"mb-8",children:e.jsx("div",{className:"flex items-center justify-between",children:F.map((t,l)=>e.jsxs(ue.Fragment,{children:[e.jsxs("div",{className:"flex flex-col items-center",children:[e.jsx("div",{className:`w-8 h-8 rounded-full flex items-center justify-center transition-all ${r>t.id?"bg-success text-white":r===t.id?"bg-primary text-white":"bg-surface-highlight text-text-muted"}`,children:r>t.id?e.jsx(N,{className:"w-4 h-4"}):e.jsx(t.icon,{className:"w-4 h-4"})}),e.jsx("span",{className:`text-xs mt-2 hidden sm:block ${r>=t.id?"text-text-main font-medium":"text-text-muted"}`,children:t.title})]}),l<F.length-1&&e.jsx("div",{className:`flex-1 h-1 mx-2 rounded ${r>t.id?"bg-success":"bg-surface-highlight"}`})]},t.id))})}),ae=()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsxs("h3",{className:"text-lg font-semibold text-text-main mb-4",children:[u?"法人税申告":"確定申告","の基本設定"]}),e.jsxs("p",{className:"text-text-muted mb-6",children:[u?"法人税申告":"確定申告","を行う年度と申告方法を選択してください。"]})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-text-main mb-2",children:"申告年度"}),e.jsx("select",{value:c,onChange:t=>J(Number(t.target.value)),className:"input-base",children:[f,...Array.from({length:4},(t,l)=>f-1-l)].map(t=>e.jsxs("option",{value:t,children:[t,"年度（",t,"年1月〜12月）",t===f&&" ※進行中"]},t))})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-text-main mb-2",children:"申告方法"}),e.jsxs("div",{className:"space-y-3",children:[e.jsxs("label",{className:"flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-surface-highlight transition-colors",children:[e.jsx("input",{type:"radio",checked:h,onChange:()=>P(!0),className:"w-4 h-4 text-primary"}),e.jsxs("div",{className:"ml-3",children:[e.jsx("span",{className:"font-medium text-text-main",children:"青色申告"}),e.jsx("span",{className:"ml-2 text-xs text-success",children:"最大65万円控除"}),e.jsx("p",{className:"text-sm text-text-muted mt-1",children:"複式簿記で最大65万円の控除が受けられます"})]})]}),e.jsxs("label",{className:"flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-surface-highlight transition-colors",children:[e.jsx("input",{type:"radio",checked:!h,onChange:()=>P(!1),className:"w-4 h-4 text-primary"}),e.jsxs("div",{className:"ml-3",children:[e.jsx("span",{className:"font-medium text-text-main",children:"白色申告"}),e.jsx("p",{className:"text-sm text-text-muted mt-1",children:"簡易的な帳簿で申告できます"})]})]})]})]})]}),e.jsxs("div",{className:"bg-info-light border border-info/20 rounded-lg p-4 flex items-start gap-3",children:[e.jsx(Ae,{className:"w-5 h-5 text-info flex-shrink-0 mt-0.5"}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-text-main font-medium",children:"青色申告がおすすめ！"}),e.jsx("p",{className:"text-sm text-text-muted mt-1",children:"Ainanceで取引を記録していれば、複式簿記の要件を満たしています。 65万円の控除で税金がお得になります。"})]})]})]}),ne=()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold text-text-main mb-4",children:"収支の確認"}),e.jsxs("p",{className:"text-text-muted mb-6",children:[c,"年度の取引データから自動集計した結果です。"]})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4",children:[e.jsxs("div",{className:"bg-success-light border border-success/20 rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-success font-medium",children:"売上高"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:d(s.totalRevenue)})]}),e.jsxs("div",{className:"bg-error-light border border-error/20 rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-error font-medium",children:"経費合計"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:d(s.totalExpenses)})]}),e.jsxs("div",{className:"bg-primary-light border border-primary/20 rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-primary font-medium",children:"事業所得"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:d(s.netIncome)})]})]}),e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-5",children:[e.jsx("h4",{className:"font-medium text-text-main mb-4",children:"経費内訳（上位5件）"}),s.expensesByCategory.length>0?e.jsx("div",{className:"space-y-3",children:s.expensesByCategory.slice(0,5).map((t,l)=>e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"w-8 h-8 bg-surface-highlight rounded-lg flex items-center justify-center text-sm font-medium text-text-muted",children:l+1}),e.jsx("span",{className:"text-text-main",children:t.category})]}),e.jsxs("div",{className:"text-right",children:[e.jsx("span",{className:"font-medium text-text-main",children:d(t.amount)}),e.jsxs("span",{className:"text-text-muted text-sm ml-2",children:["(",ye(t.percentage),")"]})]})]},l))}):e.jsxs("p",{className:"text-text-muted text-center py-4",children:[c,"年度の経費データがありません"]})]}),s.totalRevenue===0&&s.totalExpenses===0&&e.jsxs("div",{className:"bg-warning-light border border-warning/20 rounded-lg p-4 flex items-start gap-3",children:[e.jsx(H,{className:"w-5 h-5 text-warning flex-shrink-0 mt-0.5"}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-text-main font-medium",children:"取引データがありません"}),e.jsxs("p",{className:"text-sm text-text-muted mt-1",children:[c,"年度の取引を登録してから確定申告を行ってください。",e.jsx(I,{to:"/transactions",className:"text-primary hover:underline ml-1",children:"取引を登録する →"})]})]})]})]}),re=()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold text-text-main mb-4",children:"各種控除の入力"}),e.jsx("p",{className:"text-text-muted mb-6",children:"該当する控除を追加して金額を入力してください。控除が多いほど税金が安くなります。"})]}),e.jsx("div",{className:"space-y-4",children:b.map(t=>e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4",children:[e.jsxs("div",{className:"flex-1",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(Y,{className:"w-5 h-5 text-success"}),e.jsx("span",{className:"font-medium text-text-main",children:t.name})]}),e.jsx("p",{className:"text-sm text-text-muted mt-1 ml-7",children:t.description})]}),e.jsxs("div",{className:"flex items-center gap-3 ml-7 sm:ml-0",children:[e.jsxs("div",{className:"relative",children:[e.jsx("input",{type:"number",value:t.amount,onChange:l=>ee(t.id,Number(l.target.value)),className:"input-base pr-8 w-40",placeholder:"金額",disabled:t.type==="basic"||t.type==="blue_return"}),e.jsx("span",{className:"absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none",children:"円"})]}),t.type!=="basic"&&t.type!=="blue_return"&&e.jsx("button",{onClick:()=>Q(t.id),className:"p-2 text-error hover:bg-error-light rounded-lg transition-colors",children:e.jsx(ge,{className:"w-5 h-5"})})]})]},t.id))}),e.jsxs("div",{className:"bg-surface-highlight border border-border rounded-xl p-5",children:[e.jsxs("h4",{className:"font-medium text-text-main mb-4 flex items-center gap-2",children:[e.jsx(T,{className:"w-5 h-5"}),"控除を追加"]}),e.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-3",children:M.filter(t=>!b.find(l=>l.type===t.type)).map(t=>e.jsxs("button",{onClick:()=>Z(t.type),className:"flex items-center gap-3 p-3 bg-surface border border-border rounded-lg hover:border-primary hover:bg-primary-light transition-colors text-left",children:[e.jsx("div",{className:"w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center",children:e.jsx(T,{className:"w-4 h-4 text-primary"})}),e.jsxs("div",{children:[e.jsx("p",{className:"font-medium text-text-main text-sm",children:t.name}),e.jsx("p",{className:"text-xs text-text-muted",children:t.description})]})]},t.type))})]}),e.jsxs("div",{className:"bg-success-light border border-success/20 rounded-xl p-5 flex items-center justify-between",children:[e.jsx("span",{className:"font-medium text-text-main",children:"控除合計"}),e.jsx("span",{className:"text-2xl font-bold text-success",children:d(s.totalDeductions)})]})]}),le=()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsxs("h3",{className:"text-lg font-semibold text-text-main mb-4 flex items-center gap-2",children:[e.jsx(S,{className:"w-5 h-5 text-primary"}),"AIによる節税アドバイス"]}),e.jsx("p",{className:"text-text-muted mb-6",children:"AIがあなたの収支データを分析し、節税のアドバイスを提供します。"})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-text-muted",children:"課税所得"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:d(s.taxableIncome)}),e.jsx("p",{className:"text-xs text-text-muted mt-2",children:"事業所得 - 各種控除"})]}),e.jsxs("div",{className:"bg-primary-light border border-primary/20 rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-primary font-medium",children:"予想所得税額"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:d(s.estimatedTax)}),e.jsx("p",{className:"text-xs text-text-muted mt-2",children:"※概算です。実際の税額とは異なる場合があります"})]})]}),L.length===0?e.jsx("button",{onClick:te,disabled:j,className:"btn-primary w-full py-4",children:j?e.jsxs(e.Fragment,{children:[e.jsx(De,{className:"w-5 h-5 animate-spin"}),"AI分析中..."]}):e.jsxs(e.Fragment,{children:[e.jsx(S,{className:"w-5 h-5"}),"AIアドバイスを受ける"]})}):e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-5 space-y-4",children:[e.jsxs("div",{className:"flex items-center gap-2 text-primary",children:[e.jsx(S,{className:"w-5 h-5"}),e.jsx("span",{className:"font-medium",children:"AIからのアドバイス"})]}),e.jsx("ul",{className:"space-y-3",children:L.map((t,l)=>e.jsxs("li",{className:"flex items-start gap-3",children:[e.jsx(be,{className:"w-5 h-5 text-primary flex-shrink-0 mt-0.5"}),e.jsx("span",{className:"text-text-main",children:t})]},l))}),U>0&&e.jsx("div",{className:"bg-success-light border border-success/20 rounded-lg p-4 mt-4",children:e.jsxs("p",{className:"text-sm text-success font-medium",children:["推定節税可能額: ",d(U)]})})]})]}),ie=()=>{const t={fiscalYear:c,filingType:h?"blue":"white",revenue:s.totalRevenue,expenses:s.totalExpenses,netIncome:s.netIncome,expensesByCategory:s.expensesByCategory,deductions:b.filter(o=>o.isApplicable).map(o=>({type:o.type,name:o.name,amount:o.amount})),totalDeductions:s.totalDeductions,taxableIncome:s.taxableIncome,estimatedTax:s.estimatedTax},l=h?Re(t):_e(t),x=h?`青色申告決算書_${c}年度.xtx`:`収支内訳書_${c}年度.xml`;Ee(l,x);const i=window.open("","_blank");i&&(i.document.write(`
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
        <h1>📄 ${h?"青色申告決算書":"収支内訳書"}（${c}年度）</h1>
        <div class="info">
            <p>⚠️ <strong>このXMLファイルは参考資料です。</strong></p>
            <p>正式な確定申告は、国税庁の確定申告書等作成コーナーをご利用ください。XMLデータは入力の参考にお使いいただけます。</p>
        </div>
        <pre>${l.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</pre>
        <div class="actions">
            <button class="secondary" onclick="window.close()">✕ 閉じる</button>
        </div>
    </div>
</body>
</html>
            `),i.document.close())},ce=()=>{const[t,l]=g.useState(null),x=async(i,o)=>{try{await navigator.clipboard.writeText(String(i).replace(/[¥,]/g,"")),l(o),setTimeout(()=>l(null),2e3)}catch(m){console.error("コピーに失敗しました:",m)}};return e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsxs("h3",{className:"text-lg font-semibold text-text-main mb-4 flex items-center gap-2",children:[e.jsx(v,{className:"w-5 h-5 text-primary"}),u?"法人税申告書":"確定申告書","の作成"]}),e.jsx("p",{className:"text-text-muted mb-2",children:"入力内容を確認して、書類を作成してください。"}),e.jsx("p",{className:"text-xs text-text-muted",children:"💡 各項目の右側のコピーボタンで、e-Tax入力時にそのまま貼り付けできます"})]}),e.jsxs("div",{className:"bg-surface border border-border rounded-xl divide-y divide-border",children:[e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"申告年度"}),e.jsx("div",{className:"flex items-center gap-2",children:e.jsxs("span",{className:"font-medium text-text-main",children:[c,"年度"]})})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"申告方法"}),e.jsx("span",{className:"font-medium text-text-main",children:h?"青色申告":"白色申告"})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"売上高"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-success",children:d(s.totalRevenue)}),e.jsx("button",{onClick:()=>x(s.totalRevenue,"revenue"),className:`p-1.5 rounded transition-colors ${t==="revenue"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:t==="revenue"?e.jsx(N,{className:"w-4 h-4"}):e.jsx(y,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"経費合計"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-error",children:d(s.totalExpenses)}),e.jsx("button",{onClick:()=>x(s.totalExpenses,"expenses"),className:`p-1.5 rounded transition-colors ${t==="expenses"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:t==="expenses"?e.jsx(N,{className:"w-4 h-4"}):e.jsx(y,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"事業所得"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-text-main",children:d(s.netIncome)}),e.jsx("button",{onClick:()=>x(s.netIncome,"netIncome"),className:`p-1.5 rounded transition-colors ${t==="netIncome"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:t==="netIncome"?e.jsx(N,{className:"w-4 h-4"}):e.jsx(y,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"控除合計"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-primary",children:d(s.totalDeductions)}),e.jsx("button",{onClick:()=>x(s.totalDeductions,"deductions"),className:`p-1.5 rounded transition-colors ${t==="deductions"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:t==="deductions"?e.jsx(N,{className:"w-4 h-4"}):e.jsx(y,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"課税所得"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-text-main",children:d(s.taxableIncome)}),e.jsx("button",{onClick:()=>x(s.taxableIncome,"taxableIncome"),className:`p-1.5 rounded transition-colors ${t==="taxableIncome"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:t==="taxableIncome"?e.jsx(N,{className:"w-4 h-4"}):e.jsx(y,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center bg-primary-light",children:[e.jsx("span",{className:"font-medium text-text-main",children:"予想所得税額"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-bold text-primary text-lg",children:d(s.estimatedTax)}),e.jsx("button",{onClick:()=>x(s.estimatedTax,"tax"),className:`p-1.5 rounded transition-colors ${t==="tax"?"bg-success text-white":"hover:bg-primary/20 text-primary"}`,title:"コピー",children:t==="tax"?e.jsx(N,{className:"w-4 h-4"}):e.jsx(y,{className:"w-4 h-4"})})]})]})]}),e.jsxs("div",{className:"space-y-6",children:[e.jsxs("h4",{className:"text-md font-semibold text-text-main flex items-center gap-2",children:[e.jsx(w,{className:"w-5 h-5 text-slate-400"}),"ダウンロード・申告"]}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-3",children:[e.jsxs("button",{onClick:B,className:"px-4 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors text-sm font-medium flex items-center justify-center gap-2",children:[e.jsx(w,{className:"w-4 h-4"}),"申告書プレビュー"]}),e.jsxs("button",{onClick:ie,className:"px-4 py-3 border border-slate-500 text-slate-300 rounded-lg hover:bg-slate-700/50 transition-colors text-sm font-medium flex items-center justify-center gap-2",children:[e.jsx(Se,{className:"w-4 h-4"}),"e-Tax用XMLファイル"]})]}),e.jsxs("div",{className:"bg-slate-800/50 border border-slate-600/50 rounded-xl p-5",children:[e.jsxs("div",{className:"flex items-center gap-2 mb-1",children:[e.jsx("span",{className:"bg-blue-500/20 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full",children:"NEW"}),e.jsx("h5",{className:"text-sm font-semibold text-text-main",children:"日本語PDF自動生成"})]}),e.jsx("p",{className:"text-xs text-slate-400 mb-4",children:(a==null?void 0:a.business_type)==="corporation"?"法人税申告書・決算報告書（財務三表）を日本語PDFで生成":"確定申告書B・青色申告決算書を日本語PDFで生成"}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-3",children:[(a==null?void 0:a.business_type)!=="corporation"&&e.jsxs(e.Fragment,{children:[e.jsxs("button",{onClick:async()=>{var i,o;try{const m={revenue:s.totalRevenue,expenses:s.totalExpenses,netIncome:s.netIncome,expensesByCategory:s.expensesByCategory,deductions:{basic:((i=b.find(_=>_.type==="basic"))==null?void 0:i.amount)||48e4,blueReturn:h?65e4:0,socialInsurance:(o=b.find(_=>_.type==="socialInsurance"))==null?void 0:o.amount},taxableIncome:s.taxableIncome,estimatedTax:s.estimatedTax,fiscalYear:c,isBlueReturn:h},z=await we(m),de=`確定申告書B_${c}年度.pdf`;D(z,de),A(z)}catch(m){console.error("PDF生成エラー:",m),alert("PDF生成に失敗しました。フォントファイルを確認してください。")}},className:"px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm font-medium flex items-center justify-center gap-2",children:[e.jsx(v,{className:"w-4 h-4"}),"確定申告書B"]}),h&&e.jsxs("button",{onClick:async()=>{try{const i={revenue:s.totalRevenue,expenses:s.totalExpenses,netIncome:s.netIncome,expensesByCategory:s.expensesByCategory,deductions:{blueReturn:65e4},taxableIncome:s.taxableIncome,estimatedTax:s.estimatedTax,fiscalYear:c,isBlueReturn:!0},o=await ke(i),m=`青色申告決算書_${c}年度.pdf`;D(o,m),A(o)}catch(i){console.error("PDF生成エラー:",i),alert("PDF生成に失敗しました。フォントファイルを確認してください。")}},className:"px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm font-medium flex items-center justify-center gap-2",children:[e.jsx(v,{className:"w-4 h-4"}),"青色申告決算書"]})]}),(a==null?void 0:a.business_type)==="corporation"&&e.jsxs(e.Fragment,{children:[e.jsxs("button",{onClick:async()=>{try{const i={revenue:s.totalRevenue,expenses:s.totalExpenses,netIncome:s.netIncome,expensesByCategory:s.expensesByCategory,taxableIncome:s.taxableIncome,estimatedTax:s.estimatedTax,fiscalYear:c,businessType:"corporation",companyName:(a==null?void 0:a.company_name)||"会社名",representativeName:(a==null?void 0:a.representative_name)||"",address:(a==null?void 0:a.address)||""},o=await Ce(i),m=`法人税申告書_${c}年度.pdf`;D(o,m),A(o)}catch(i){console.error("PDF生成エラー:",i),alert("PDF生成に失敗しました。フォントファイルを確認してください。")}},className:"px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm font-medium flex items-center justify-center gap-2",children:[e.jsx(v,{className:"w-4 h-4"}),"法人税申告書"]}),e.jsxs("button",{onClick:async()=>{try{const i={revenue:s.totalRevenue,expenses:s.totalExpenses,netIncome:s.netIncome,expensesByCategory:s.expensesByCategory,taxableIncome:s.taxableIncome,estimatedTax:s.estimatedTax,fiscalYear:c,businessType:"corporation",companyName:(a==null?void 0:a.company_name)||"会社名",representativeName:(a==null?void 0:a.representative_name)||"",capital:1e6},o=await $e(i),m=`決算報告書_${c}年度.pdf`;D(o,m),A(o)}catch(i){console.error("PDF生成エラー:",i),alert("PDF生成に失敗しました。フォントファイルを確認してください。")}},className:"px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm font-medium flex items-center justify-center gap-2",children:[e.jsx(v,{className:"w-4 h-4"}),"決算報告書（財務三表）"]})]})]})]}),(a==null?void 0:a.business_type)==="corporation"&&e.jsxs("div",{className:"bg-slate-800/30 border border-slate-600/30 rounded-xl p-5",children:[e.jsx("h5",{className:"text-sm font-semibold text-text-main mb-1",children:"公式テンプレート"}),e.jsx("p",{className:"text-xs text-slate-400 mb-4",children:"国税庁の法人税申告書テンプレート（令和6年4月1日以後終了事業年度分）"}),e.jsxs("div",{className:"grid grid-cols-2 sm:grid-cols-4 gap-2",children:[e.jsxs("a",{href:"https://www.nta.go.jp/taxes/tetsuzuki/shinsei/annai/hojin/shinkoku/itiran2024/pdf/01_01.pdf",target:"_blank",rel:"noopener noreferrer",className:"px-3 py-2.5 border border-slate-500/50 text-slate-300 rounded-lg hover:bg-slate-700/50 hover:border-slate-400 transition-all text-xs font-medium flex items-center justify-center gap-1.5",children:[e.jsx(w,{className:"w-3.5 h-3.5"}),"別表一（一）"]}),e.jsxs("a",{href:"https://www.nta.go.jp/taxes/tetsuzuki/shinsei/annai/hojin/shinkoku/itiran2024/pdf/01_02.pdf",target:"_blank",rel:"noopener noreferrer",className:"px-3 py-2.5 border border-slate-500/50 text-slate-300 rounded-lg hover:bg-slate-700/50 hover:border-slate-400 transition-all text-xs font-medium flex items-center justify-center gap-1.5",children:[e.jsx(w,{className:"w-3.5 h-3.5"}),"別表一（二）"]}),e.jsxs("a",{href:"https://www.nta.go.jp/taxes/tetsuzuki/shinsei/annai/hojin/shinkoku/itiran2024/pdf/04.pdf",target:"_blank",rel:"noopener noreferrer",className:"px-3 py-2.5 border border-slate-500/50 text-slate-300 rounded-lg hover:bg-slate-700/50 hover:border-slate-400 transition-all text-xs font-medium flex items-center justify-center gap-1.5",children:[e.jsx(w,{className:"w-3.5 h-3.5"}),"別表四"]}),e.jsxs("a",{href:"https://www.nta.go.jp/taxes/tetsuzuki/shinsei/annai/hojin/shinkoku/itiran2024/01.htm",target:"_blank",rel:"noopener noreferrer",className:"px-3 py-2.5 border border-slate-500/50 text-slate-300 rounded-lg hover:bg-slate-700/50 hover:border-slate-400 transition-all text-xs font-medium flex items-center justify-center gap-1.5",children:[e.jsx(E,{className:"w-3.5 h-3.5"}),"全別表一覧"]})]})]})]}),e.jsxs("div",{className:"bg-slate-800/30 border border-slate-600/30 rounded-xl p-5",children:[e.jsxs("h4",{className:"text-sm font-semibold text-text-main mb-3 flex items-center gap-2",children:[e.jsx(E,{className:"w-4 h-4 text-slate-400"}),"e-Taxで直接申告する"]}),e.jsxs("ol",{className:"text-xs text-slate-400 space-y-2 mb-4",children:[e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx("span",{className:"flex-shrink-0 w-5 h-5 bg-slate-600 text-slate-200 rounded-full flex items-center justify-center text-[10px] font-medium",children:"1"}),"上のコピーボタンで各数値をコピー"]}),e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx("span",{className:"flex-shrink-0 w-5 h-5 bg-slate-600 text-slate-200 rounded-full flex items-center justify-center text-[10px] font-medium",children:"2"}),"確定申告書等作成コーナーにアクセス"]}),e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx("span",{className:"flex-shrink-0 w-5 h-5 bg-slate-600 text-slate-200 rounded-full flex items-center justify-center text-[10px] font-medium",children:"3"}),"コピーした数値を貼り付けて入力"]}),e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx("span",{className:"flex-shrink-0 w-5 h-5 bg-slate-600 text-slate-200 rounded-full flex items-center justify-center text-[10px] font-medium",children:"4"}),"マイナンバーカードで電子署名 → 送信完了！"]})]}),e.jsxs("div",{className:"flex flex-wrap gap-3",children:[e.jsxs("a",{href:"https://www.keisan.nta.go.jp/kyoutu/ky/smsp/top",target:"_blank",rel:"noopener noreferrer",className:"inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm font-medium",children:[e.jsx(E,{className:"w-4 h-4"}),"確定申告書等作成コーナー"]}),e.jsx(I,{to:"/tax-filing-guide",className:"inline-flex items-center gap-2 px-4 py-2.5 border border-slate-500 text-slate-300 rounded-lg hover:bg-slate-700/50 transition-colors text-sm font-medium",children:"📖 詳しい申告ガイド"})]})]}),e.jsxs("div",{className:"bg-slate-800/30 border border-slate-600/30 rounded-xl p-4 flex items-start gap-3",children:[e.jsx(H,{className:"w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5"}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-slate-300 font-medium",children:"ご注意ください"}),e.jsxs("ul",{className:"text-xs text-slate-400 mt-2 space-y-1 list-disc list-inside",children:[e.jsx("li",{children:"この計算は概算です。正確な税額は税務署にご確認ください"}),e.jsx("li",{children:"確定申告の期限は翌年3月15日です（例：2025年度分は2026年3月15日まで）"}),e.jsx("li",{children:"青色申告特別控除65万円の適用には電子申告が必要です"})]})]})]})]})},oe=()=>{switch(r){case 1:return e.jsx(ae,{});case 2:return e.jsx(ne,{});case 3:return e.jsx(je,{onCalculate:t=>q(t),initialAssets:[]});case 4:return e.jsx(re,{});case 5:return e.jsx(le,{});case 6:return e.jsx(ce,{});default:return null}};return e.jsx("div",{className:"min-h-screen bg-background",children:e.jsxs("div",{className:"max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6",children:[e.jsxs("div",{className:"mb-4",children:[e.jsxs("div",{className:"flex items-center justify-between mb-3",children:[e.jsxs(I,{to:"/dashboard",className:"flex items-center text-xs text-primary hover:text-primary-hover",children:[e.jsx(O,{className:"h-4 w-4 mr-1.5"}),"ダッシュボードに戻る"]}),e.jsx(I,{to:"/tax-filing-guide",className:"inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-xs font-medium",children:"📖 申告ガイド"})]}),e.jsx("h1",{className:"text-xl font-bold text-text-main mb-1",children:"確定申告サポート"}),e.jsx("p",{className:"text-xs text-text-muted",children:"6つのステップで簡単に確定申告を完了できます"})]}),e.jsx(se,{}),e.jsx("div",{className:"bg-surface border border-border rounded-xl p-3 mb-6",children:oe()}),e.jsxs("div",{className:"flex justify-between",children:[e.jsxs("button",{onClick:K,disabled:r===1,className:`btn-ghost ${r===1?"opacity-50 cursor-not-allowed":""}`,children:[e.jsx(O,{className:"w-5 h-5"}),"戻る"]}),r<F.length?e.jsxs("button",{onClick:G,className:"btn-primary",children:["次へ",e.jsx(Ie,{className:"w-5 h-5"})]}):e.jsxs("button",{onClick:B,className:"btn-success",children:[e.jsx(Y,{className:"w-5 h-5"}),"完了"]})]})]})})};export{Ke as default};
