import{e as xe,a as me,u as he,b as pe,r as p,j as e,L as k,F as f,P as _,S as F,R as ue,C as b,m as be,f as ge}from"./index-CbNxQ4z6.js";import{D as fe}from"./DepreciationCalculator-DtiVAjbH.js";import{g as je,c as Ne,f as c,A as U,a as ve,b as ye}from"./TaxFilingService-DDB1LB_S.js";import{g as we,a as ke,d as Ce}from"./eTaxExportService-DEuuuqQn.js";import{d as C,p as I}from"./pdfAutoFillService-C3cuSIgJ.js";import{g as Ie,a as De,b as Fe,c as Se}from"./pdfJapaneseService-Cm5f9R2S.js";import{A as Y}from"./arrow-left-BVJfEFsH.js";import{C as H}from"./calculator-CdA93bHR.js";import{D as j}from"./download-W0sa_D9m.js";import{A as $e}from"./arrow-right-CIt_XMXf.js";import{C as O}from"./circle-check-big-B0nl8WqE.js";import{C as g}from"./copy-o5pqRNA-.js";import{E as $}from"./external-link-D9aSmc0V.js";import{C as W}from"./circle-alert-DCmOiDHC.js";import{R as _e}from"./refresh-cw-Bsb00wdp.js";import{I as Ae}from"./info-0lxvfyYt.js";import"./CorporateTaxService-BJ2xCYBe.js";import"./circle-question-mark-CfDL3DX_.js";/**
 * @license lucide-react v0.540.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Re=[["path",{d:"M10 12.5 8 15l2 2.5",key:"1tg20x"}],["path",{d:"m14 12.5 2 2.5-2 2.5",key:"yinavb"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z",key:"1mlx9k"}]],Pe=xe("file-code",Re),D=[{id:1,title:"基本情報",icon:f,description:"申告の基本設定"},{id:2,title:"収支確認",icon:H,description:"売上・経費の確認"},{id:3,title:"減価償却",icon:H,description:"固定資産の償却計算"},{id:4,title:"控除入力",icon:_,description:"各種控除の入力"},{id:5,title:"AI診断",icon:F,description:"AIによる節税アドバイス"},{id:6,title:"申告書作成",icon:j,description:"PDFダウンロード"}],Be=()=>{const{user:u}=me(),{currentBusinessType:a}=he(),N=(a==null?void 0:a.business_type)==="corporation",{transactions:A}=pe(u==null?void 0:u.id,a==null?void 0:a.business_type),[x,R]=p.useState(1),[P,E]=p.useState(!1),v=new Date().getFullYear(),[i,J]=p.useState(v-1),[m,L]=p.useState(!0),[h,y]=p.useState([]),[z,V]=p.useState([]),[M,q]=p.useState(0),[w,G]=p.useState(0);p.useEffect(()=>{y(je(m))},[m]);const s=p.useMemo(()=>{const t=Ne(A,i,(a==null?void 0:a.business_type)||"individual",h);return{...t,totalExpenses:t.totalExpenses+w,netIncome:t.netIncome-w,taxableIncome:Math.max(0,t.taxableIncome-w)}},[A,i,a,h,w]),K=()=>{x<D.length&&R(x+1)},Z=()=>{x>1&&R(x-1)},Q=t=>{const n=U.find(o=>o.type===t);n&&!h.find(o=>o.type===t)&&y([...h,{id:Date.now().toString(),...n,amount:0,isApplicable:!0}])},B=t=>{y(h.filter(n=>n.id!==t))},ee=(t,n)=>{y(h.map(o=>o.id===t?{...o,amount:n}:o))},te=async()=>{E(!0);try{const t=await ye(s,{});V(t.suggestions),q(t.estimatedSavings)}catch(t){console.error("AI診断エラー:",t)}finally{E(!1)}},X=()=>{const t=`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
           ${N?"法人税申告書":"確定申告書"}（${i}年度）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

申告方法: ${m?"青色申告":"白色申告"}
作成日時: ${new Date().toLocaleString("ja-JP")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【収支内訳】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
売上高:     ${c(s.totalRevenue)}
経費合計:   ${c(s.totalExpenses)}
──────────────────────────────────────────────────
事業所得:   ${c(s.netIncome)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【控除内訳】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${h.filter(d=>d.isApplicable).map(d=>`${d.name.padEnd(20,"　")}: ${c(d.amount)}`).join(`
`)}
──────────────────────────────────────────────────
控除合計:   ${c(s.totalDeductions)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【税額計算】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
課税所得:   ${c(s.taxableIncome)}
──────────────────────────────────────────────────
所得税額:   ${c(s.estimatedTax)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
※この書類はAinanceで生成された概算資料です。
  正式な確定申告は国税庁のe-Taxでお手続きください。
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`.trim(),n=new Blob(["\uFEFF"+t],{type:"text/plain;charset=utf-8"}),o=URL.createObjectURL(n),r=document.createElement("a");r.href=o,r.download=`確定申告書_${i}年度.txt`,document.body.appendChild(r),r.click(),document.body.removeChild(r);const l=window.open("","_blank");l&&(l.document.write(`
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>確定申告書プレビュー - ${i}年度</title>
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
        <p class="subtitle">${i}年度 | ${m?"青色申告":"白色申告"} | 作成日: ${new Date().toLocaleDateString("ja-JP")}</p>
        <pre>${t}</pre>
        <div class="actions">
            <button class="print-btn" onclick="window.print()">🖨️ 印刷する</button>
            <button class="close-btn" onclick="window.close()">✕ 閉じる</button>
        </div>
    </div>
</body>
</html>
            `),l.document.close()),setTimeout(()=>URL.revokeObjectURL(o),1e3)},se=()=>e.jsx("div",{className:"mb-8",children:e.jsx("div",{className:"flex items-center justify-between",children:D.map((t,n)=>e.jsxs(ue.Fragment,{children:[e.jsxs("div",{className:"flex flex-col items-center",children:[e.jsx("div",{className:`w-8 h-8 rounded-full flex items-center justify-center transition-all ${x>t.id?"bg-success text-white":x===t.id?"bg-primary text-white":"bg-surface-highlight text-text-muted"}`,children:x>t.id?e.jsx(b,{className:"w-4 h-4"}):e.jsx(t.icon,{className:"w-4 h-4"})}),e.jsx("span",{className:`text-xs mt-2 hidden sm:block ${x>=t.id?"text-text-main font-medium":"text-text-muted"}`,children:t.title})]}),n<D.length-1&&e.jsx("div",{className:`flex-1 h-1 mx-2 rounded ${x>t.id?"bg-success":"bg-surface-highlight"}`})]},t.id))})}),ae=()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsxs("h3",{className:"text-lg font-semibold text-text-main mb-4",children:[N?"法人税申告":"確定申告","の基本設定"]}),e.jsxs("p",{className:"text-text-muted mb-6",children:[N?"法人税申告":"確定申告","を行う年度と申告方法を選択してください。"]})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-text-main mb-2",children:"申告年度"}),e.jsx("select",{value:i,onChange:t=>J(Number(t.target.value)),className:"input-base",children:[v,...Array.from({length:4},(t,n)=>v-1-n)].map(t=>e.jsxs("option",{value:t,children:[t,"年度（",t,"年1月〜12月）",t===v&&" ※進行中"]},t))})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-text-main mb-2",children:"申告方法"}),e.jsxs("div",{className:"space-y-3",children:[e.jsxs("label",{className:"flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-surface-highlight transition-colors",children:[e.jsx("input",{type:"radio",checked:m,onChange:()=>L(!0),className:"w-4 h-4 text-primary"}),e.jsxs("div",{className:"ml-3",children:[e.jsx("span",{className:"font-medium text-text-main",children:"青色申告"}),e.jsx("span",{className:"ml-2 text-xs text-success",children:"最大65万円控除"}),e.jsx("p",{className:"text-sm text-text-muted mt-1",children:"複式簿記で最大65万円の控除が受けられます"})]})]}),e.jsxs("label",{className:"flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-surface-highlight transition-colors",children:[e.jsx("input",{type:"radio",checked:!m,onChange:()=>L(!1),className:"w-4 h-4 text-primary"}),e.jsxs("div",{className:"ml-3",children:[e.jsx("span",{className:"font-medium text-text-main",children:"白色申告"}),e.jsx("p",{className:"text-sm text-text-muted mt-1",children:"簡易的な帳簿で申告できます"})]})]})]})]})]}),e.jsxs("div",{className:"bg-info-light border border-info/20 rounded-lg p-4 flex items-start gap-3",children:[e.jsx(Ae,{className:"w-5 h-5 text-info flex-shrink-0 mt-0.5"}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-text-main font-medium",children:"青色申告がおすすめ！"}),e.jsx("p",{className:"text-sm text-text-muted mt-1",children:"Ainanceで取引を記録していれば、複式簿記の要件を満たしています。 65万円の控除で税金がお得になります。"})]})]})]}),ne=()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold text-text-main mb-4",children:"収支の確認"}),e.jsxs("p",{className:"text-text-muted mb-6",children:[i,"年度の取引データから自動集計した結果です。"]})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4",children:[e.jsxs("div",{className:"bg-success-light border border-success/20 rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-success font-medium",children:"売上高"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:c(s.totalRevenue)})]}),e.jsxs("div",{className:"bg-error-light border border-error/20 rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-error font-medium",children:"経費合計"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:c(s.totalExpenses)})]}),e.jsxs("div",{className:"bg-primary-light border border-primary/20 rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-primary font-medium",children:"事業所得"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:c(s.netIncome)})]})]}),e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-5",children:[e.jsx("h4",{className:"font-medium text-text-main mb-4",children:"経費内訳（上位5件）"}),s.expensesByCategory.length>0?e.jsx("div",{className:"space-y-3",children:s.expensesByCategory.slice(0,5).map((t,n)=>e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"w-8 h-8 bg-surface-highlight rounded-lg flex items-center justify-center text-sm font-medium text-text-muted",children:n+1}),e.jsx("span",{className:"text-text-main",children:t.category})]}),e.jsxs("div",{className:"text-right",children:[e.jsx("span",{className:"font-medium text-text-main",children:c(t.amount)}),e.jsxs("span",{className:"text-text-muted text-sm ml-2",children:["(",ve(t.percentage),")"]})]})]},n))}):e.jsxs("p",{className:"text-text-muted text-center py-4",children:[i,"年度の経費データがありません"]})]}),s.totalRevenue===0&&s.totalExpenses===0&&e.jsxs("div",{className:"bg-warning-light border border-warning/20 rounded-lg p-4 flex items-start gap-3",children:[e.jsx(W,{className:"w-5 h-5 text-warning flex-shrink-0 mt-0.5"}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-text-main font-medium",children:"取引データがありません"}),e.jsxs("p",{className:"text-sm text-text-muted mt-1",children:[i,"年度の取引を登録してから確定申告を行ってください。",e.jsx(k,{to:"/transactions",className:"text-primary hover:underline ml-1",children:"取引を登録する →"})]})]})]})]}),re=()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold text-text-main mb-4",children:"各種控除の入力"}),e.jsx("p",{className:"text-text-muted mb-6",children:"該当する控除を追加して金額を入力してください。控除が多いほど税金が安くなります。"})]}),e.jsx("div",{className:"space-y-4",children:h.map(t=>e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4",children:[e.jsxs("div",{className:"flex-1",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(O,{className:"w-5 h-5 text-success"}),e.jsx("span",{className:"font-medium text-text-main",children:t.name})]}),e.jsx("p",{className:"text-sm text-text-muted mt-1 ml-7",children:t.description})]}),e.jsxs("div",{className:"flex items-center gap-3 ml-7 sm:ml-0",children:[e.jsxs("div",{className:"relative",children:[e.jsx("input",{type:"number",value:t.amount,onChange:n=>ee(t.id,Number(n.target.value)),className:"input-base pr-8 w-40",placeholder:"金額",disabled:t.type==="basic"||t.type==="blue_return"}),e.jsx("span",{className:"absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none",children:"円"})]}),t.type!=="basic"&&t.type!=="blue_return"&&e.jsx("button",{onClick:()=>B(t.id),className:"p-2 text-error hover:bg-error-light rounded-lg transition-colors",children:e.jsx(ge,{className:"w-5 h-5"})})]})]},t.id))}),e.jsxs("div",{className:"bg-surface-highlight border border-border rounded-xl p-5",children:[e.jsxs("h4",{className:"font-medium text-text-main mb-4 flex items-center gap-2",children:[e.jsx(_,{className:"w-5 h-5"}),"控除を追加"]}),e.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-3",children:U.filter(t=>!h.find(n=>n.type===t.type)).map(t=>e.jsxs("button",{onClick:()=>Q(t.type),className:"flex items-center gap-3 p-3 bg-surface border border-border rounded-lg hover:border-primary hover:bg-primary-light transition-colors text-left",children:[e.jsx("div",{className:"w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center",children:e.jsx(_,{className:"w-4 h-4 text-primary"})}),e.jsxs("div",{children:[e.jsx("p",{className:"font-medium text-text-main text-sm",children:t.name}),e.jsx("p",{className:"text-xs text-text-muted",children:t.description})]})]},t.type))})]}),e.jsxs("div",{className:"bg-success-light border border-success/20 rounded-xl p-5 flex items-center justify-between",children:[e.jsx("span",{className:"font-medium text-text-main",children:"控除合計"}),e.jsx("span",{className:"text-2xl font-bold text-success",children:c(s.totalDeductions)})]})]}),ie=()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsxs("h3",{className:"text-lg font-semibold text-text-main mb-4 flex items-center gap-2",children:[e.jsx(F,{className:"w-5 h-5 text-primary"}),"AIによる節税アドバイス"]}),e.jsx("p",{className:"text-text-muted mb-6",children:"AIがあなたの収支データを分析し、節税のアドバイスを提供します。"})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-text-muted",children:"課税所得"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:c(s.taxableIncome)}),e.jsx("p",{className:"text-xs text-text-muted mt-2",children:"事業所得 - 各種控除"})]}),e.jsxs("div",{className:"bg-primary-light border border-primary/20 rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-primary font-medium",children:"予想所得税額"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:c(s.estimatedTax)}),e.jsx("p",{className:"text-xs text-text-muted mt-2",children:"※概算です。実際の税額とは異なる場合があります"})]})]}),z.length===0?e.jsx("button",{onClick:te,disabled:P,className:"btn-primary w-full py-4",children:P?e.jsxs(e.Fragment,{children:[e.jsx(_e,{className:"w-5 h-5 animate-spin"}),"AI分析中..."]}):e.jsxs(e.Fragment,{children:[e.jsx(F,{className:"w-5 h-5"}),"AIアドバイスを受ける"]})}):e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-5 space-y-4",children:[e.jsxs("div",{className:"flex items-center gap-2 text-primary",children:[e.jsx(F,{className:"w-5 h-5"}),e.jsx("span",{className:"font-medium",children:"AIからのアドバイス"})]}),e.jsx("ul",{className:"space-y-3",children:z.map((t,n)=>e.jsxs("li",{className:"flex items-start gap-3",children:[e.jsx(be,{className:"w-5 h-5 text-primary flex-shrink-0 mt-0.5"}),e.jsx("span",{className:"text-text-main",children:t})]},n))}),M>0&&e.jsx("div",{className:"bg-success-light border border-success/20 rounded-lg p-4 mt-4",children:e.jsxs("p",{className:"text-sm text-success font-medium",children:["推定節税可能額: ",c(M)]})})]})]}),le=()=>{const t={fiscalYear:i,revenue:s.totalRevenue,expenses:s.totalExpenses,netIncome:s.netIncome,expensesByCategory:s.expensesByCategory,deductions:h.filter(l=>l.isApplicable).map(l=>({type:l.type,name:l.name,amount:l.amount})),totalDeductions:s.totalDeductions,taxableIncome:s.taxableIncome,estimatedTax:s.estimatedTax},n=m?we(t):ke(t),o=m?`青色申告決算書_${i}年度.xtx`:`収支内訳書_${i}年度.xml`;Ce(n,o);const r=window.open("","_blank");r&&(r.document.write(`
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>e-Tax用ファイルプレビュー - ${i}年度</title>
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
        <h1>📄 ${m?"青色申告決算書":"収支内訳書"}（${i}年度）</h1>
        <div class="info">
            <p>⚠️ <strong>このXMLファイルは参考資料です。</strong></p>
            <p>正式な確定申告は、国税庁の確定申告書等作成コーナーをご利用ください。XMLデータは入力の参考にお使いいただけます。</p>
        </div>
        <pre>${n.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</pre>
        <div class="actions">
            <button class="secondary" onclick="window.close()">✕ 閉じる</button>
        </div>
    </div>
</body>
</html>
            `),r.document.close())},ce=()=>{const[t,n]=p.useState(null),o=async(r,l)=>{try{await navigator.clipboard.writeText(String(r).replace(/[¥,]/g,"")),n(l),setTimeout(()=>n(null),2e3)}catch(d){console.error("コピーに失敗しました:",d)}};return e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsxs("h3",{className:"text-lg font-semibold text-text-main mb-4 flex items-center gap-2",children:[e.jsx(f,{className:"w-5 h-5 text-primary"}),N?"法人税申告書":"確定申告書","の作成"]}),e.jsx("p",{className:"text-text-muted mb-2",children:"入力内容を確認して、書類を作成してください。"}),e.jsx("p",{className:"text-xs text-text-muted",children:"💡 各項目の右側のコピーボタンで、e-Tax入力時にそのまま貼り付けできます"})]}),e.jsxs("div",{className:"bg-surface border border-border rounded-xl divide-y divide-border",children:[e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"申告年度"}),e.jsx("div",{className:"flex items-center gap-2",children:e.jsxs("span",{className:"font-medium text-text-main",children:[i,"年度"]})})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"申告方法"}),e.jsx("span",{className:"font-medium text-text-main",children:m?"青色申告":"白色申告"})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"売上高"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-success",children:c(s.totalRevenue)}),e.jsx("button",{onClick:()=>o(s.totalRevenue,"revenue"),className:`p-1.5 rounded transition-colors ${t==="revenue"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:t==="revenue"?e.jsx(b,{className:"w-4 h-4"}):e.jsx(g,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"経費合計"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-error",children:c(s.totalExpenses)}),e.jsx("button",{onClick:()=>o(s.totalExpenses,"expenses"),className:`p-1.5 rounded transition-colors ${t==="expenses"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:t==="expenses"?e.jsx(b,{className:"w-4 h-4"}):e.jsx(g,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"事業所得"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-text-main",children:c(s.netIncome)}),e.jsx("button",{onClick:()=>o(s.netIncome,"netIncome"),className:`p-1.5 rounded transition-colors ${t==="netIncome"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:t==="netIncome"?e.jsx(b,{className:"w-4 h-4"}):e.jsx(g,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"控除合計"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-primary",children:c(s.totalDeductions)}),e.jsx("button",{onClick:()=>o(s.totalDeductions,"deductions"),className:`p-1.5 rounded transition-colors ${t==="deductions"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:t==="deductions"?e.jsx(b,{className:"w-4 h-4"}):e.jsx(g,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"課税所得"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-text-main",children:c(s.taxableIncome)}),e.jsx("button",{onClick:()=>o(s.taxableIncome,"taxableIncome"),className:`p-1.5 rounded transition-colors ${t==="taxableIncome"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:t==="taxableIncome"?e.jsx(b,{className:"w-4 h-4"}):e.jsx(g,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center bg-primary-light",children:[e.jsx("span",{className:"font-medium text-text-main",children:"予想所得税額"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-bold text-primary text-lg",children:c(s.estimatedTax)}),e.jsx("button",{onClick:()=>o(s.estimatedTax,"tax"),className:`p-1.5 rounded transition-colors ${t==="tax"?"bg-success text-white":"hover:bg-primary/20 text-primary"}`,title:"コピー",children:t==="tax"?e.jsx(b,{className:"w-4 h-4"}):e.jsx(g,{className:"w-4 h-4"})})]})]})]}),e.jsxs("div",{className:"space-y-6",children:[e.jsxs("h4",{className:"text-md font-semibold text-text-main flex items-center gap-2",children:[e.jsx(j,{className:"w-5 h-5 text-slate-400"}),"ダウンロード・申告"]}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-3",children:[e.jsxs("button",{onClick:X,className:"px-4 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors text-sm font-medium flex items-center justify-center gap-2",children:[e.jsx(j,{className:"w-4 h-4"}),"申告書プレビュー"]}),e.jsxs("button",{onClick:le,className:"px-4 py-3 border border-slate-500 text-slate-300 rounded-lg hover:bg-slate-700/50 transition-colors text-sm font-medium flex items-center justify-center gap-2",children:[e.jsx(Pe,{className:"w-4 h-4"}),"e-Tax用XMLファイル"]})]}),e.jsxs("div",{className:"bg-slate-800/50 border border-slate-600/50 rounded-xl p-5",children:[e.jsxs("div",{className:"flex items-center gap-2 mb-1",children:[e.jsx("span",{className:"bg-blue-500/20 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full",children:"NEW"}),e.jsx("h5",{className:"text-sm font-semibold text-text-main",children:"日本語PDF自動生成"})]}),e.jsx("p",{className:"text-xs text-slate-400 mb-4",children:(a==null?void 0:a.business_type)==="corporation"?"法人税申告書・決算報告書（財務三表）を日本語PDFで生成":"確定申告書B・青色申告決算書を日本語PDFで生成"}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-3",children:[(a==null?void 0:a.business_type)!=="corporation"&&e.jsxs(e.Fragment,{children:[e.jsxs("button",{onClick:async()=>{var r,l;try{const d={name:(a==null?void 0:a.representative_name)||(u==null?void 0:u.name)||"",address:(a==null?void 0:a.address)||"",tradeName:(a==null?void 0:a.company_name)||"",phone:(a==null?void 0:a.phone)||"",revenue:s.totalRevenue,expenses:s.totalExpenses,netIncome:s.netIncome,expensesByCategory:s.expensesByCategory,deductions:{basic:((r=h.find(S=>S.type==="basic"))==null?void 0:r.amount)||48e4,blueReturn:m?65e4:0,socialInsurance:(l=h.find(S=>S.type==="socialInsurance"))==null?void 0:l.amount},taxableIncome:s.taxableIncome,estimatedTax:s.estimatedTax,fiscalYear:i,isBlueReturn:m},T=await Ie(d),de=`確定申告書B_${i}年度.pdf`;C(T,de),I(T)}catch(d){console.error("PDF生成エラー:",d),alert("PDF生成に失敗しました。フォントファイルを確認してください。")}},className:"px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm font-medium flex items-center justify-center gap-2",children:[e.jsx(f,{className:"w-4 h-4"}),"確定申告書B"]}),m&&e.jsxs("button",{onClick:async()=>{try{const r={name:u==null?void 0:u.name,address:(a==null?void 0:a.address)||"",tradeName:(a==null?void 0:a.company_name)||"",revenue:s.totalRevenue,expenses:s.totalExpenses,netIncome:s.netIncome,expensesByCategory:s.expensesByCategory,deductions:{blueReturn:65e4},taxableIncome:s.taxableIncome,estimatedTax:s.estimatedTax,fiscalYear:i,isBlueReturn:!0},l=await De(r),d=`青色申告決算書_${i}年度.pdf`;C(l,d),I(l)}catch(r){console.error("PDF生成エラー:",r),alert("PDF生成に失敗しました。フォントファイルを確認してください。")}},className:"px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm font-medium flex items-center justify-center gap-2",children:[e.jsx(f,{className:"w-4 h-4"}),"青色申告決算書"]})]}),(a==null?void 0:a.business_type)==="corporation"&&e.jsxs(e.Fragment,{children:[e.jsxs("button",{onClick:async()=>{try{const r={companyName:(a==null?void 0:a.company_name)||"会社名",representativeName:(a==null?void 0:a.representative_name)||"",address:(a==null?void 0:a.address)||"",revenue:s.totalRevenue,expenses:s.totalExpenses,netIncome:s.netIncome,expensesByCategory:s.expensesByCategory,taxableIncome:s.taxableIncome,estimatedTax:s.estimatedTax,fiscalYear:i,businessType:"corporation"},l=await Fe(r),d=`法人税申告書_${i}年度.pdf`;C(l,d),I(l)}catch(r){console.error("PDF生成エラー:",r),alert("PDF生成に失敗しました。フォントファイルを確認してください。")}},className:"px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm font-medium flex items-center justify-center gap-2",children:[e.jsx(f,{className:"w-4 h-4"}),"法人税申告書"]}),e.jsxs("button",{onClick:async()=>{try{const r={revenue:s.totalRevenue,expenses:s.totalExpenses,netIncome:s.netIncome,expensesByCategory:s.expensesByCategory,taxableIncome:s.taxableIncome,estimatedTax:s.estimatedTax,fiscalYear:i,businessType:"corporation",companyName:(a==null?void 0:a.company_name)||"会社名",representativeName:(a==null?void 0:a.representative_name)||"",capital:1e6},l=await Se(r),d=`決算報告書_${i}年度.pdf`;C(l,d),I(l)}catch(r){console.error("PDF生成エラー:",r),alert("PDF生成に失敗しました。フォントファイルを確認してください。")}},className:"px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm font-medium flex items-center justify-center gap-2",children:[e.jsx(f,{className:"w-4 h-4"}),"決算報告書（財務三表）"]})]})]})]}),(a==null?void 0:a.business_type)==="corporation"&&e.jsxs("div",{className:"bg-slate-800/30 border border-slate-600/30 rounded-xl p-5",children:[e.jsx("h5",{className:"text-sm font-semibold text-text-main mb-1",children:"公式テンプレート"}),e.jsx("p",{className:"text-xs text-slate-400 mb-4",children:"国税庁の法人税申告書テンプレート（令和6年4月1日以後終了事業年度分）"}),e.jsxs("div",{className:"grid grid-cols-2 sm:grid-cols-4 gap-2",children:[e.jsxs("a",{href:"https://www.nta.go.jp/taxes/tetsuzuki/shinsei/annai/hojin/shinkoku/itiran2024/pdf/01_01.pdf",target:"_blank",rel:"noopener noreferrer",className:"px-3 py-2.5 border border-slate-500/50 text-slate-300 rounded-lg hover:bg-slate-700/50 hover:border-slate-400 transition-all text-xs font-medium flex items-center justify-center gap-1.5",children:[e.jsx(j,{className:"w-3.5 h-3.5"}),"別表一（一）"]}),e.jsxs("a",{href:"https://www.nta.go.jp/taxes/tetsuzuki/shinsei/annai/hojin/shinkoku/itiran2024/pdf/01_02.pdf",target:"_blank",rel:"noopener noreferrer",className:"px-3 py-2.5 border border-slate-500/50 text-slate-300 rounded-lg hover:bg-slate-700/50 hover:border-slate-400 transition-all text-xs font-medium flex items-center justify-center gap-1.5",children:[e.jsx(j,{className:"w-3.5 h-3.5"}),"別表一（二）"]}),e.jsxs("a",{href:"https://www.nta.go.jp/taxes/tetsuzuki/shinsei/annai/hojin/shinkoku/itiran2024/pdf/04.pdf",target:"_blank",rel:"noopener noreferrer",className:"px-3 py-2.5 border border-slate-500/50 text-slate-300 rounded-lg hover:bg-slate-700/50 hover:border-slate-400 transition-all text-xs font-medium flex items-center justify-center gap-1.5",children:[e.jsx(j,{className:"w-3.5 h-3.5"}),"別表四"]}),e.jsxs("a",{href:"https://www.nta.go.jp/taxes/tetsuzuki/shinsei/annai/hojin/shinkoku/itiran2024/01.htm",target:"_blank",rel:"noopener noreferrer",className:"px-3 py-2.5 border border-slate-500/50 text-slate-300 rounded-lg hover:bg-slate-700/50 hover:border-slate-400 transition-all text-xs font-medium flex items-center justify-center gap-1.5",children:[e.jsx($,{className:"w-3.5 h-3.5"}),"全別表一覧"]})]})]})]}),e.jsxs("div",{className:"bg-slate-800/30 border border-slate-600/30 rounded-xl p-5",children:[e.jsxs("h4",{className:"text-sm font-semibold text-text-main mb-3 flex items-center gap-2",children:[e.jsx($,{className:"w-4 h-4 text-slate-400"}),"e-Taxで直接申告する"]}),e.jsxs("ol",{className:"text-xs text-slate-400 space-y-2 mb-4",children:[e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx("span",{className:"flex-shrink-0 w-5 h-5 bg-slate-600 text-slate-200 rounded-full flex items-center justify-center text-[10px] font-medium",children:"1"}),"上のコピーボタンで各数値をコピー"]}),e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx("span",{className:"flex-shrink-0 w-5 h-5 bg-slate-600 text-slate-200 rounded-full flex items-center justify-center text-[10px] font-medium",children:"2"}),"確定申告書等作成コーナーにアクセス"]}),e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx("span",{className:"flex-shrink-0 w-5 h-5 bg-slate-600 text-slate-200 rounded-full flex items-center justify-center text-[10px] font-medium",children:"3"}),"コピーした数値を貼り付けて入力"]}),e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx("span",{className:"flex-shrink-0 w-5 h-5 bg-slate-600 text-slate-200 rounded-full flex items-center justify-center text-[10px] font-medium",children:"4"}),"マイナンバーカードで電子署名 → 送信完了！"]})]}),e.jsxs("div",{className:"flex flex-wrap gap-3",children:[e.jsxs("a",{href:"https://www.keisan.nta.go.jp/kyoutu/ky/smsp/top",target:"_blank",rel:"noopener noreferrer",className:"inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm font-medium",children:[e.jsx($,{className:"w-4 h-4"}),"確定申告書等作成コーナー"]}),e.jsx(k,{to:"/tax-filing-guide",className:"inline-flex items-center gap-2 px-4 py-2.5 border border-slate-500 text-slate-300 rounded-lg hover:bg-slate-700/50 transition-colors text-sm font-medium",children:"📖 詳しい申告ガイド"})]})]}),e.jsxs("div",{className:"bg-slate-800/30 border border-slate-600/30 rounded-xl p-4 flex items-start gap-3",children:[e.jsx(W,{className:"w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5"}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-slate-300 font-medium",children:"ご注意ください"}),e.jsxs("ul",{className:"text-xs text-slate-400 mt-2 space-y-1 list-disc list-inside",children:[e.jsx("li",{children:"この計算は概算です。正確な税額は税務署にご確認ください"}),e.jsx("li",{children:"確定申告の期限は翌年3月15日です（例：2025年度分は2026年3月15日まで）"}),e.jsx("li",{children:"青色申告特別控除65万円の適用には電子申告が必要です"})]})]})]})]})},oe=()=>{switch(x){case 1:return e.jsx(ae,{});case 2:return e.jsx(ne,{});case 3:return e.jsx(fe,{onCalculate:t=>G(t),initialAssets:[]});case 4:return e.jsx(re,{});case 5:return e.jsx(ie,{});case 6:return e.jsx(ce,{});default:return null}};return e.jsx("div",{className:"min-h-screen bg-background",children:e.jsxs("div",{className:"max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6",children:[e.jsxs("div",{className:"mb-4",children:[e.jsxs("div",{className:"flex items-center justify-between mb-3",children:[e.jsxs(k,{to:"/dashboard",className:"flex items-center text-xs text-primary hover:text-primary-hover",children:[e.jsx(Y,{className:"h-4 w-4 mr-1.5"}),"ダッシュボードに戻る"]}),e.jsx(k,{to:"/tax-filing-guide",className:"inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-xs font-medium",children:"📖 申告ガイド"})]}),e.jsx("h1",{className:"text-xl font-bold text-text-main mb-1",children:"確定申告サポート"}),e.jsx("p",{className:"text-xs text-text-muted",children:"6つのステップで簡単に確定申告を完了できます"})]}),e.jsx(se,{}),e.jsx("div",{className:"bg-surface border border-border rounded-xl p-3 mb-6",children:oe()}),e.jsxs("div",{className:"flex justify-between",children:[e.jsxs("button",{onClick:Z,disabled:x===1,className:`btn-ghost ${x===1?"opacity-50 cursor-not-allowed":""}`,children:[e.jsx(Y,{className:"w-5 h-5"}),"戻る"]}),x<D.length?e.jsxs("button",{onClick:K,className:"btn-primary",children:["次へ",e.jsx($e,{className:"w-5 h-5"})]}):e.jsxs("button",{onClick:X,className:"btn-success",children:[e.jsx(O,{className:"w-5 h-5"}),"完了"]})]})]})})};export{Be as default};
