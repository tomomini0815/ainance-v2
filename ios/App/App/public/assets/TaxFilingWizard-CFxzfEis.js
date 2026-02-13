import{c as ie,a as ce,b as oe,d as de,r as b,j as e,L as S,F as v,P as T,S as D,R as xe,g as f,t as me,T as pe}from"./index-ANsWalRW.js";import{g as he,c as ue,f as d,A as U,a as be,b as ge}from"./TaxFilingService-DDB1LB_S.js";import{g as je,d as C,p as $,a as fe,b as Ne,c as ye}from"./pdfAutoFillService-Cx6bfSiv.js";import{A as z}from"./arrow-left-CzwRZ0lz.js";import{C as ve}from"./calculator-CeXj6_6n.js";import{D as w}from"./download-B8WM_aIE.js";import{A as we}from"./arrow-right-BPx4dRpm.js";import{C as M}from"./circle-check-big-7dW2Outk.js";import{C as y}from"./copy-Bs9DRCaW.js";import{E as R}from"./external-link-BXzu8vk7.js";import{C as X}from"./circle-alert-MEFdEpQ1.js";import{R as ke}from"./refresh-cw-bL0maMJz.js";import{I as Ce}from"./info-VDCyy0ci.js";/**
 * @license lucide-react v0.540.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $e=[["path",{d:"M10 12.5 8 15l2 2.5",key:"1tg20x"}],["path",{d:"m14 12.5 2 2.5-2 2.5",key:"yinavb"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z",key:"1mlx9k"}]],Ie=ie("file-code",$e);function De(n){const a=new Date,j=a.toISOString().replace(/[-:]/g,"").split(".")[0],o={売上高:"AA100",仕入高:"AB100",消耗品費:"AC100",旅費交通費:"AC110",通信費:"AC120",広告宣伝費:"AC130",接待交際費:"AC140",水道光熱費:"AC150",地代家賃:"AC160",外注費:"AC170",減価償却費:"AC180",雑費:"AC190"},u=n.expensesByCategory.map((g,N)=>{const r=o[g.category]||`AC${200+N}`;return`    <${r}>${g.amount}</${r}>`}).join(`
`);return`<?xml version="1.0" encoding="UTF-8"?>
<!--
  Ainance e-Tax Export File
  生成日時: ${a.toLocaleString("ja-JP")}
  対象年度: ${n.fiscalYear}年度
  申告区分: ${n.filingType==="blue"?"青色申告":"白色申告"}
-->
<申告書等送信票等>
  <作成日時>${j}</作成日時>
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
${u}
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
${n.deductions.map(g=>`      <${g.type}>${g.amount}</${g.type}>`).join(`
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
</申告書等送信票等>`}function Ae(n){return`<?xml version="1.0" encoding="UTF-8"?>
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
${n.expensesByCategory.map(o=>`    <${o.category.replace(/\s/g,"")}>${o.amount}</${o.category.replace(/\s/g,"")}>`).join(`
`)}
    <経費合計>${n.expenses}</経費合計>
  </必要経費>
  
  <差引金額>${n.netIncome}</差引金額>
</収支内訳書>`}function Fe(n,a){const j=new Blob(["\uFEFF"+n],{type:"application/xml;charset=utf-8"}),o=URL.createObjectURL(j),u=document.createElement("a");u.href=o,u.download=a,document.body.appendChild(u),u.click(),document.body.removeChild(u),setTimeout(()=>URL.revokeObjectURL(o),1e3)}const I=[{id:1,title:"基本情報",icon:v,description:"確定申告の基本設定"},{id:2,title:"収支確認",icon:ve,description:"売上・経費の確認"},{id:3,title:"控除入力",icon:T,description:"各種控除の入力"},{id:4,title:"AI診断",icon:D,description:"AIによる節税アドバイス"},{id:5,title:"申告書作成",icon:w,description:"PDFダウンロード"}],Oe=()=>{const{user:n}=ce(),{currentBusinessType:a}=oe(),{transactions:j}=de(n==null?void 0:n.id,a==null?void 0:a.business_type),[o,u]=b.useState(1),[A,g]=b.useState(!1),N=new Date().getFullYear(),[r,Y]=b.useState(N-1),[p,P]=b.useState(!0),[h,k]=b.useState([]),[_,O]=b.useState([]),[E,H]=b.useState(0);b.useEffect(()=>{k(he(p))},[p]);const s=b.useMemo(()=>ue(j,r,(a==null?void 0:a.business_type)||"individual",h),[j,r,a,h]),J=()=>{o<I.length&&u(o+1)},W=()=>{o>1&&u(o-1)},V=t=>{const l=U.find(x=>x.type===t);l&&!h.find(x=>x.type===t)&&k([...h,{id:Date.now().toString(),...l,amount:0,isApplicable:!0}])},q=t=>{k(h.filter(l=>l.id!==t))},G=(t,l)=>{k(h.map(x=>x.id===t?{...x,amount:l}:x))},K=async()=>{g(!0);try{const t=await ge(s,{});O(t.suggestions),H(t.estimatedSavings)}catch(t){console.error("AI診断エラー:",t)}finally{g(!1)}},L=()=>{const t=`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
           確定申告書（${r}年度）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

申告方法: ${p?"青色申告":"白色申告"}
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
${h.filter(m=>m.isApplicable).map(m=>`${m.name.padEnd(20,"　")}: ${d(m.amount)}`).join(`
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
`.trim(),l=new Blob(["\uFEFF"+t],{type:"text/plain;charset=utf-8"}),x=URL.createObjectURL(l),i=document.createElement("a");i.href=x,i.download=`確定申告書_${r}年度.txt`,document.body.appendChild(i),i.click(),document.body.removeChild(i);const c=window.open("","_blank");c&&(c.document.write(`
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
        <p class="subtitle">${r}年度 | ${p?"青色申告":"白色申告"} | 作成日: ${new Date().toLocaleDateString("ja-JP")}</p>
        <pre>${t}</pre>
        <div class="actions">
            <button class="print-btn" onclick="window.print()">🖨️ 印刷する</button>
            <button class="close-btn" onclick="window.close()">✕ 閉じる</button>
        </div>
    </div>
</body>
</html>
            `),c.document.close()),setTimeout(()=>URL.revokeObjectURL(x),1e3)},Z=()=>e.jsx("div",{className:"mb-8",children:e.jsx("div",{className:"flex items-center justify-between",children:I.map((t,l)=>e.jsxs(xe.Fragment,{children:[e.jsxs("div",{className:"flex flex-col items-center",children:[e.jsx("div",{className:`w-10 h-10 rounded-full flex items-center justify-center transition-all ${o>t.id?"bg-success text-white":o===t.id?"bg-primary text-white":"bg-surface-highlight text-text-muted"}`,children:o>t.id?e.jsx(f,{className:"w-5 h-5"}):e.jsx(t.icon,{className:"w-5 h-5"})}),e.jsx("span",{className:`text-xs mt-2 hidden sm:block ${o>=t.id?"text-text-main font-medium":"text-text-muted"}`,children:t.title})]}),l<I.length-1&&e.jsx("div",{className:`flex-1 h-1 mx-2 rounded ${o>t.id?"bg-success":"bg-surface-highlight"}`})]},t.id))})}),Q=()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold text-text-main mb-4",children:"確定申告の基本設定"}),e.jsx("p",{className:"text-text-muted mb-6",children:"確定申告を行う年度と申告方法を選択してください。"})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-text-main mb-2",children:"申告年度"}),e.jsx("select",{value:r,onChange:t=>Y(Number(t.target.value)),className:"input-base",children:[N,...Array.from({length:4},(t,l)=>N-1-l)].map(t=>e.jsxs("option",{value:t,children:[t,"年度（",t,"年1月〜12月）",t===N&&" ※進行中"]},t))})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-text-main mb-2",children:"申告方法"}),e.jsxs("div",{className:"space-y-3",children:[e.jsxs("label",{className:"flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-surface-highlight transition-colors",children:[e.jsx("input",{type:"radio",checked:p,onChange:()=>P(!0),className:"w-4 h-4 text-primary"}),e.jsxs("div",{className:"ml-3",children:[e.jsx("span",{className:"font-medium text-text-main",children:"青色申告"}),e.jsx("span",{className:"ml-2 text-xs text-success",children:"最大65万円控除"}),e.jsx("p",{className:"text-sm text-text-muted mt-1",children:"複式簿記で最大65万円の控除が受けられます"})]})]}),e.jsxs("label",{className:"flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-surface-highlight transition-colors",children:[e.jsx("input",{type:"radio",checked:!p,onChange:()=>P(!1),className:"w-4 h-4 text-primary"}),e.jsxs("div",{className:"ml-3",children:[e.jsx("span",{className:"font-medium text-text-main",children:"白色申告"}),e.jsx("p",{className:"text-sm text-text-muted mt-1",children:"簡易的な帳簿で申告できます"})]})]})]})]})]}),e.jsxs("div",{className:"bg-info-light border border-info/20 rounded-lg p-4 flex items-start gap-3",children:[e.jsx(Ce,{className:"w-5 h-5 text-info flex-shrink-0 mt-0.5"}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-text-main font-medium",children:"青色申告がおすすめ！"}),e.jsx("p",{className:"text-sm text-text-muted mt-1",children:"Ainanceで取引を記録していれば、複式簿記の要件を満たしています。 65万円の控除で税金がお得になります。"})]})]})]}),ee=()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold text-text-main mb-4",children:"収支の確認"}),e.jsxs("p",{className:"text-text-muted mb-6",children:[r,"年度の取引データから自動集計した結果です。"]})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4",children:[e.jsxs("div",{className:"bg-success-light border border-success/20 rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-success font-medium",children:"売上高"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:d(s.totalRevenue)})]}),e.jsxs("div",{className:"bg-error-light border border-error/20 rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-error font-medium",children:"経費合計"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:d(s.totalExpenses)})]}),e.jsxs("div",{className:"bg-primary-light border border-primary/20 rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-primary font-medium",children:"事業所得"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:d(s.netIncome)})]})]}),e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-5",children:[e.jsx("h4",{className:"font-medium text-text-main mb-4",children:"経費内訳（上位5件）"}),s.expensesByCategory.length>0?e.jsx("div",{className:"space-y-3",children:s.expensesByCategory.slice(0,5).map((t,l)=>e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"w-8 h-8 bg-surface-highlight rounded-lg flex items-center justify-center text-sm font-medium text-text-muted",children:l+1}),e.jsx("span",{className:"text-text-main",children:t.category})]}),e.jsxs("div",{className:"text-right",children:[e.jsx("span",{className:"font-medium text-text-main",children:d(t.amount)}),e.jsxs("span",{className:"text-text-muted text-sm ml-2",children:["(",be(t.percentage),")"]})]})]},l))}):e.jsxs("p",{className:"text-text-muted text-center py-4",children:[r,"年度の経費データがありません"]})]}),s.totalRevenue===0&&s.totalExpenses===0&&e.jsxs("div",{className:"bg-warning-light border border-warning/20 rounded-lg p-4 flex items-start gap-3",children:[e.jsx(X,{className:"w-5 h-5 text-warning flex-shrink-0 mt-0.5"}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-text-main font-medium",children:"取引データがありません"}),e.jsxs("p",{className:"text-sm text-text-muted mt-1",children:[r,"年度の取引を登録してから確定申告を行ってください。",e.jsx(S,{to:"/transactions",className:"text-primary hover:underline ml-1",children:"取引を登録する →"})]})]})]})]}),te=()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold text-text-main mb-4",children:"各種控除の入力"}),e.jsx("p",{className:"text-text-muted mb-6",children:"該当する控除を追加して金額を入力してください。控除が多いほど税金が安くなります。"})]}),e.jsx("div",{className:"space-y-4",children:h.map(t=>e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4",children:[e.jsxs("div",{className:"flex-1",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(M,{className:"w-5 h-5 text-success"}),e.jsx("span",{className:"font-medium text-text-main",children:t.name})]}),e.jsx("p",{className:"text-sm text-text-muted mt-1 ml-7",children:t.description})]}),e.jsxs("div",{className:"flex items-center gap-3 ml-7 sm:ml-0",children:[e.jsxs("div",{className:"relative",children:[e.jsx("span",{className:"absolute left-3 top-1/2 -translate-y-1/2 text-text-muted",children:"¥"}),e.jsx("input",{type:"number",value:t.amount,onChange:l=>G(t.id,Number(l.target.value)),className:"input-base pl-8 w-40",placeholder:"金額",disabled:t.type==="basic"||t.type==="blue_return"})]}),t.type!=="basic"&&t.type!=="blue_return"&&e.jsx("button",{onClick:()=>q(t.id),className:"p-2 text-error hover:bg-error-light rounded-lg transition-colors",children:e.jsx(pe,{className:"w-5 h-5"})})]})]},t.id))}),e.jsxs("div",{className:"bg-surface-highlight border border-border rounded-xl p-5",children:[e.jsxs("h4",{className:"font-medium text-text-main mb-4 flex items-center gap-2",children:[e.jsx(T,{className:"w-5 h-5"}),"控除を追加"]}),e.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-3",children:U.filter(t=>!h.find(l=>l.type===t.type)).map(t=>e.jsxs("button",{onClick:()=>V(t.type),className:"flex items-center gap-3 p-3 bg-surface border border-border rounded-lg hover:border-primary hover:bg-primary-light transition-colors text-left",children:[e.jsx("div",{className:"w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center",children:e.jsx(T,{className:"w-4 h-4 text-primary"})}),e.jsxs("div",{children:[e.jsx("p",{className:"font-medium text-text-main text-sm",children:t.name}),e.jsx("p",{className:"text-xs text-text-muted",children:t.description})]})]},t.type))})]}),e.jsxs("div",{className:"bg-success-light border border-success/20 rounded-xl p-5 flex items-center justify-between",children:[e.jsx("span",{className:"font-medium text-text-main",children:"控除合計"}),e.jsx("span",{className:"text-2xl font-bold text-success",children:d(s.totalDeductions)})]})]}),se=()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsxs("h3",{className:"text-lg font-semibold text-text-main mb-4 flex items-center gap-2",children:[e.jsx(D,{className:"w-5 h-5 text-primary"}),"AIによる節税アドバイス"]}),e.jsx("p",{className:"text-text-muted mb-6",children:"AIがあなたの収支データを分析し、節税のアドバイスを提供します。"})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-text-muted",children:"課税所得"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:d(s.taxableIncome)}),e.jsx("p",{className:"text-xs text-text-muted mt-2",children:"事業所得 - 各種控除"})]}),e.jsxs("div",{className:"bg-primary-light border border-primary/20 rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-primary font-medium",children:"予想所得税額"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:d(s.estimatedTax)}),e.jsx("p",{className:"text-xs text-text-muted mt-2",children:"※概算です。実際の税額とは異なる場合があります"})]})]}),_.length===0?e.jsx("button",{onClick:K,disabled:A,className:"btn-primary w-full py-4",children:A?e.jsxs(e.Fragment,{children:[e.jsx(ke,{className:"w-5 h-5 animate-spin"}),"AI分析中..."]}):e.jsxs(e.Fragment,{children:[e.jsx(D,{className:"w-5 h-5"}),"AIアドバイスを受ける"]})}):e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-5 space-y-4",children:[e.jsxs("div",{className:"flex items-center gap-2 text-primary",children:[e.jsx(D,{className:"w-5 h-5"}),e.jsx("span",{className:"font-medium",children:"AIからのアドバイス"})]}),e.jsx("ul",{className:"space-y-3",children:_.map((t,l)=>e.jsxs("li",{className:"flex items-start gap-3",children:[e.jsx(me,{className:"w-5 h-5 text-primary flex-shrink-0 mt-0.5"}),e.jsx("span",{className:"text-text-main",children:t})]},l))}),E>0&&e.jsx("div",{className:"bg-success-light border border-success/20 rounded-lg p-4 mt-4",children:e.jsxs("p",{className:"text-sm text-success font-medium",children:["推定節税可能額: ",d(E)]})})]})]}),ae=()=>{const t={fiscalYear:r,filingType:p?"blue":"white",revenue:s.totalRevenue,expenses:s.totalExpenses,netIncome:s.netIncome,expensesByCategory:s.expensesByCategory,deductions:h.filter(c=>c.isApplicable).map(c=>({type:c.type,name:c.name,amount:c.amount})),totalDeductions:s.totalDeductions,taxableIncome:s.taxableIncome,estimatedTax:s.estimatedTax},l=p?De(t):Ae(t),x=p?`青色申告決算書_${r}年度.xtx`:`収支内訳書_${r}年度.xml`;Fe(l,x);const i=window.open("","_blank");i&&(i.document.write(`
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
        <h1>📄 ${p?"青色申告決算書":"収支内訳書"}（${r}年度）</h1>
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
            `),i.document.close())},ne=()=>{const[t,l]=b.useState(null),x=async(i,c)=>{try{await navigator.clipboard.writeText(String(i).replace(/[¥,]/g,"")),l(c),setTimeout(()=>l(null),2e3)}catch(m){console.error("コピーに失敗しました:",m)}};return e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsxs("h3",{className:"text-lg font-semibold text-text-main mb-4 flex items-center gap-2",children:[e.jsx(v,{className:"w-5 h-5 text-primary"}),"確定申告書の作成"]}),e.jsx("p",{className:"text-text-muted mb-2",children:"入力内容を確認して、書類を作成してください。"}),e.jsx("p",{className:"text-xs text-text-muted",children:"💡 各項目の右側のコピーボタンで、e-Tax入力時にそのまま貼り付けできます"})]}),e.jsxs("div",{className:"bg-surface border border-border rounded-xl divide-y divide-border",children:[e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"申告年度"}),e.jsx("div",{className:"flex items-center gap-2",children:e.jsxs("span",{className:"font-medium text-text-main",children:[r,"年度"]})})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"申告方法"}),e.jsx("span",{className:"font-medium text-text-main",children:p?"青色申告":"白色申告"})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"売上高"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-success",children:d(s.totalRevenue)}),e.jsx("button",{onClick:()=>x(s.totalRevenue,"revenue"),className:`p-1.5 rounded transition-colors ${t==="revenue"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:t==="revenue"?e.jsx(f,{className:"w-4 h-4"}):e.jsx(y,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"経費合計"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-error",children:d(s.totalExpenses)}),e.jsx("button",{onClick:()=>x(s.totalExpenses,"expenses"),className:`p-1.5 rounded transition-colors ${t==="expenses"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:t==="expenses"?e.jsx(f,{className:"w-4 h-4"}):e.jsx(y,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"事業所得"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-text-main",children:d(s.netIncome)}),e.jsx("button",{onClick:()=>x(s.netIncome,"netIncome"),className:`p-1.5 rounded transition-colors ${t==="netIncome"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:t==="netIncome"?e.jsx(f,{className:"w-4 h-4"}):e.jsx(y,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"控除合計"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-primary",children:d(s.totalDeductions)}),e.jsx("button",{onClick:()=>x(s.totalDeductions,"deductions"),className:`p-1.5 rounded transition-colors ${t==="deductions"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:t==="deductions"?e.jsx(f,{className:"w-4 h-4"}):e.jsx(y,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"課税所得"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-text-main",children:d(s.taxableIncome)}),e.jsx("button",{onClick:()=>x(s.taxableIncome,"taxableIncome"),className:`p-1.5 rounded transition-colors ${t==="taxableIncome"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:t==="taxableIncome"?e.jsx(f,{className:"w-4 h-4"}):e.jsx(y,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center bg-primary-light",children:[e.jsx("span",{className:"font-medium text-text-main",children:"予想所得税額"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-bold text-primary text-lg",children:d(s.estimatedTax)}),e.jsx("button",{onClick:()=>x(s.estimatedTax,"tax"),className:`p-1.5 rounded transition-colors ${t==="tax"?"bg-success text-white":"hover:bg-primary/20 text-primary"}`,title:"コピー",children:t==="tax"?e.jsx(f,{className:"w-4 h-4"}):e.jsx(y,{className:"w-4 h-4"})})]})]})]}),e.jsxs("div",{className:"space-y-6",children:[e.jsxs("h4",{className:"text-md font-semibold text-text-main flex items-center gap-2",children:[e.jsx(w,{className:"w-5 h-5 text-slate-400"}),"ダウンロード・申告"]}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-3",children:[e.jsxs("button",{onClick:L,className:"px-4 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors text-sm font-medium flex items-center justify-center gap-2",children:[e.jsx(w,{className:"w-4 h-4"}),"申告書プレビュー"]}),e.jsxs("button",{onClick:ae,className:"px-4 py-3 border border-slate-500 text-slate-300 rounded-lg hover:bg-slate-700/50 transition-colors text-sm font-medium flex items-center justify-center gap-2",children:[e.jsx(Ie,{className:"w-4 h-4"}),"e-Tax用XMLファイル"]})]}),e.jsxs("div",{className:"bg-slate-800/50 border border-slate-600/50 rounded-xl p-5",children:[e.jsxs("div",{className:"flex items-center gap-2 mb-1",children:[e.jsx("span",{className:"bg-blue-500/20 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full",children:"NEW"}),e.jsx("h5",{className:"text-sm font-semibold text-text-main",children:"日本語PDF自動生成"})]}),e.jsx("p",{className:"text-xs text-slate-400 mb-4",children:(a==null?void 0:a.business_type)==="corporation"?"法人税申告書・決算報告書（財務三表）を日本語PDFで生成":"確定申告書B・青色申告決算書を日本語PDFで生成"}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-3",children:[(a==null?void 0:a.business_type)!=="corporation"&&e.jsxs(e.Fragment,{children:[e.jsxs("button",{onClick:async()=>{var i,c;try{const m={revenue:s.totalRevenue,expenses:s.totalExpenses,netIncome:s.netIncome,expensesByCategory:s.expensesByCategory,deductions:{basic:((i=h.find(F=>F.type==="basic"))==null?void 0:i.amount)||48e4,blueReturn:p?65e4:0,socialInsurance:(c=h.find(F=>F.type==="socialInsurance"))==null?void 0:c.amount},taxableIncome:s.taxableIncome,estimatedTax:s.estimatedTax,fiscalYear:r,isBlueReturn:p},B=await je(m),le=`確定申告書B_${r}年度.pdf`;C(B,le),$(B)}catch(m){console.error("PDF生成エラー:",m),alert("PDF生成に失敗しました。フォントファイルを確認してください。")}},className:"px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm font-medium flex items-center justify-center gap-2",children:[e.jsx(v,{className:"w-4 h-4"}),"確定申告書B"]}),p&&e.jsxs("button",{onClick:async()=>{try{const i={revenue:s.totalRevenue,expenses:s.totalExpenses,netIncome:s.netIncome,expensesByCategory:s.expensesByCategory,deductions:{blueReturn:65e4},taxableIncome:s.taxableIncome,estimatedTax:s.estimatedTax,fiscalYear:r,isBlueReturn:!0},c=await fe(i),m=`青色申告決算書_${r}年度.pdf`;C(c,m),$(c)}catch(i){console.error("PDF生成エラー:",i),alert("PDF生成に失敗しました。フォントファイルを確認してください。")}},className:"px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm font-medium flex items-center justify-center gap-2",children:[e.jsx(v,{className:"w-4 h-4"}),"青色申告決算書"]})]}),(a==null?void 0:a.business_type)==="corporation"&&e.jsxs(e.Fragment,{children:[e.jsxs("button",{onClick:async()=>{try{const i={revenue:s.totalRevenue,expenses:s.totalExpenses,netIncome:s.netIncome,expensesByCategory:s.expensesByCategory,taxableIncome:s.taxableIncome,estimatedTax:s.estimatedTax,fiscalYear:r,businessType:"corporation",companyName:(a==null?void 0:a.company_name)||"会社名",representativeName:(a==null?void 0:a.representative_name)||"",address:(a==null?void 0:a.address)||""},c=await Ne(i),m=`法人税申告書_${r}年度.pdf`;C(c,m),$(c)}catch(i){console.error("PDF生成エラー:",i),alert("PDF生成に失敗しました。フォントファイルを確認してください。")}},className:"px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm font-medium flex items-center justify-center gap-2",children:[e.jsx(v,{className:"w-4 h-4"}),"法人税申告書"]}),e.jsxs("button",{onClick:async()=>{try{const i={revenue:s.totalRevenue,expenses:s.totalExpenses,netIncome:s.netIncome,expensesByCategory:s.expensesByCategory,taxableIncome:s.taxableIncome,estimatedTax:s.estimatedTax,fiscalYear:r,businessType:"corporation",companyName:(a==null?void 0:a.company_name)||"会社名",representativeName:(a==null?void 0:a.representative_name)||"",capital:1e6},c=await ye(i),m=`決算報告書_${r}年度.pdf`;C(c,m),$(c)}catch(i){console.error("PDF生成エラー:",i),alert("PDF生成に失敗しました。フォントファイルを確認してください。")}},className:"px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm font-medium flex items-center justify-center gap-2",children:[e.jsx(v,{className:"w-4 h-4"}),"決算報告書（財務三表）"]})]})]})]}),(a==null?void 0:a.business_type)==="corporation"&&e.jsxs("div",{className:"bg-slate-800/30 border border-slate-600/30 rounded-xl p-5",children:[e.jsx("h5",{className:"text-sm font-semibold text-text-main mb-1",children:"公式テンプレート"}),e.jsx("p",{className:"text-xs text-slate-400 mb-4",children:"国税庁の法人税申告書テンプレート（令和6年4月1日以後終了事業年度分）"}),e.jsxs("div",{className:"grid grid-cols-2 sm:grid-cols-4 gap-2",children:[e.jsxs("a",{href:"https://www.nta.go.jp/taxes/tetsuzuki/shinsei/annai/hojin/shinkoku/itiran2024/pdf/01_01.pdf",target:"_blank",rel:"noopener noreferrer",className:"px-3 py-2.5 border border-slate-500/50 text-slate-300 rounded-lg hover:bg-slate-700/50 hover:border-slate-400 transition-all text-xs font-medium flex items-center justify-center gap-1.5",children:[e.jsx(w,{className:"w-3.5 h-3.5"}),"別表一（一）"]}),e.jsxs("a",{href:"https://www.nta.go.jp/taxes/tetsuzuki/shinsei/annai/hojin/shinkoku/itiran2024/pdf/01_02.pdf",target:"_blank",rel:"noopener noreferrer",className:"px-3 py-2.5 border border-slate-500/50 text-slate-300 rounded-lg hover:bg-slate-700/50 hover:border-slate-400 transition-all text-xs font-medium flex items-center justify-center gap-1.5",children:[e.jsx(w,{className:"w-3.5 h-3.5"}),"別表一（二）"]}),e.jsxs("a",{href:"https://www.nta.go.jp/taxes/tetsuzuki/shinsei/annai/hojin/shinkoku/itiran2024/pdf/04.pdf",target:"_blank",rel:"noopener noreferrer",className:"px-3 py-2.5 border border-slate-500/50 text-slate-300 rounded-lg hover:bg-slate-700/50 hover:border-slate-400 transition-all text-xs font-medium flex items-center justify-center gap-1.5",children:[e.jsx(w,{className:"w-3.5 h-3.5"}),"別表四"]}),e.jsxs("a",{href:"https://www.nta.go.jp/taxes/tetsuzuki/shinsei/annai/hojin/shinkoku/itiran2024/01.htm",target:"_blank",rel:"noopener noreferrer",className:"px-3 py-2.5 border border-slate-500/50 text-slate-300 rounded-lg hover:bg-slate-700/50 hover:border-slate-400 transition-all text-xs font-medium flex items-center justify-center gap-1.5",children:[e.jsx(R,{className:"w-3.5 h-3.5"}),"全別表一覧"]})]})]})]}),e.jsxs("div",{className:"bg-slate-800/30 border border-slate-600/30 rounded-xl p-5",children:[e.jsxs("h4",{className:"text-sm font-semibold text-text-main mb-3 flex items-center gap-2",children:[e.jsx(R,{className:"w-4 h-4 text-slate-400"}),"e-Taxで直接申告する"]}),e.jsxs("ol",{className:"text-xs text-slate-400 space-y-2 mb-4",children:[e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx("span",{className:"flex-shrink-0 w-5 h-5 bg-slate-600 text-slate-200 rounded-full flex items-center justify-center text-[10px] font-medium",children:"1"}),"上のコピーボタンで各数値をコピー"]}),e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx("span",{className:"flex-shrink-0 w-5 h-5 bg-slate-600 text-slate-200 rounded-full flex items-center justify-center text-[10px] font-medium",children:"2"}),"確定申告書等作成コーナーにアクセス"]}),e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx("span",{className:"flex-shrink-0 w-5 h-5 bg-slate-600 text-slate-200 rounded-full flex items-center justify-center text-[10px] font-medium",children:"3"}),"コピーした数値を貼り付けて入力"]}),e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx("span",{className:"flex-shrink-0 w-5 h-5 bg-slate-600 text-slate-200 rounded-full flex items-center justify-center text-[10px] font-medium",children:"4"}),"マイナンバーカードで電子署名 → 送信完了！"]})]}),e.jsxs("div",{className:"flex flex-wrap gap-3",children:[e.jsxs("a",{href:"https://www.keisan.nta.go.jp/kyoutu/ky/smsp/top",target:"_blank",rel:"noopener noreferrer",className:"inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm font-medium",children:[e.jsx(R,{className:"w-4 h-4"}),"確定申告書等作成コーナー"]}),e.jsx(S,{to:"/tax-filing-guide",className:"inline-flex items-center gap-2 px-4 py-2.5 border border-slate-500 text-slate-300 rounded-lg hover:bg-slate-700/50 transition-colors text-sm font-medium",children:"📖 詳しい申告ガイド"})]})]}),e.jsxs("div",{className:"bg-slate-800/30 border border-slate-600/30 rounded-xl p-4 flex items-start gap-3",children:[e.jsx(X,{className:"w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5"}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-slate-300 font-medium",children:"ご注意ください"}),e.jsxs("ul",{className:"text-xs text-slate-400 mt-2 space-y-1 list-disc list-inside",children:[e.jsx("li",{children:"この計算は概算です。正確な税額は税務署にご確認ください"}),e.jsx("li",{children:"確定申告の期限は翌年3月15日です（例：2025年度分は2026年3月15日まで）"}),e.jsx("li",{children:"青色申告特別控除65万円の適用には電子申告が必要です"})]})]})]})]})},re=()=>{switch(o){case 1:return e.jsx(Q,{});case 2:return e.jsx(ee,{});case 3:return e.jsx(te,{});case 4:return e.jsx(se,{});case 5:return e.jsx(ne,{});default:return null}};return e.jsx("div",{className:"min-h-screen bg-background",children:e.jsxs("div",{className:"max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8",children:[e.jsxs("div",{className:"mb-8",children:[e.jsxs(S,{to:"/dashboard",className:"flex items-center text-primary hover:text-primary-hover mb-4",children:[e.jsx(z,{className:"h-5 w-5 mr-2"}),"ダッシュボードに戻る"]}),e.jsx("h1",{className:"text-3xl font-bold text-text-main mb-2",children:"確定申告サポート"}),e.jsx("p",{className:"text-text-muted",children:"5つのステップで簡単に確定申告を完了できます"})]}),e.jsx(Z,{}),e.jsx("div",{className:"bg-surface border border-border rounded-xl p-6 mb-6",children:re()}),e.jsxs("div",{className:"flex justify-between",children:[e.jsxs("button",{onClick:W,disabled:o===1,className:`btn-ghost ${o===1?"opacity-50 cursor-not-allowed":""}`,children:[e.jsx(z,{className:"w-5 h-5"}),"戻る"]}),o<I.length?e.jsxs("button",{onClick:J,className:"btn-primary",children:["次へ",e.jsx(we,{className:"w-5 h-5"})]}):e.jsxs("button",{onClick:L,className:"btn-success",children:[e.jsx(M,{className:"w-5 h-5"}),"完了"]})]})]})})};export{Oe as default};
