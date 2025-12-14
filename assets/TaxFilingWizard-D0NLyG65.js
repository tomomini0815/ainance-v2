import{c as L,a as X,b as Z,d as ee,r as h,j as e,L as R,F as D,P as _,S as A,R as te,g as se,v as ae,T as ne}from"./index-CoXdtoTx.js";import{A as $}from"./arrow-left-DBXEFR4i.js";import{C as ie}from"./calculator-CwjvOm3X.js";import{D as P}from"./download-CabtwRdb.js";import{A as re}from"./arrow-right-8-YdpibM.js";import{C as E}from"./circle-check-big-q0T_-bjV.js";import{R as ce}from"./refresh-cw-B889ysdR.js";import{C as le}from"./circle-alert-Bm3D2yBo.js";/**
 * @license lucide-react v0.540.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const de=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3",key:"1u773s"}],["path",{d:"M12 17h.01",key:"p32p05"}]],oe=L("circle-question-mark",de);/**
 * @license lucide-react v0.540.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const me=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 16v-4",key:"1dtifu"}],["path",{d:"M12 8h.01",key:"e9boi3"}]],xe=L("info",me),ue=[{min:0,max:195e4,rate:.05,deduction:0},{min:195e4,max:33e5,rate:.1,deduction:97500},{min:33e5,max:695e4,rate:.2,deduction:427500},{min:695e4,max:9e6,rate:.23,deduction:636e3},{min:9e6,max:18e6,rate:.33,deduction:1536e3},{min:18e6,max:4e7,rate:.4,deduction:2796e3},{min:4e7,max:1/0,rate:.45,deduction:4796e3}],pe=65e4,he=48e4,F=[{type:"basic",name:"基礎控除",description:"全ての納税者が受けられる控除（48万円）",documents:[]},{type:"blue_return",name:"青色申告特別控除",description:"青色申告者が受けられる控除（最大65万円）",documents:["青色申告承認申請書"]},{type:"medical",name:"医療費控除",description:"年間10万円を超える医療費の控除",documents:["医療費の領収書","医療費控除の明細書"]},{type:"social_insurance",name:"社会保険料控除",description:"国民健康保険、国民年金などの控除",documents:["社会保険料控除証明書"]},{type:"small_business_mutual",name:"小規模企業共済等掛金控除",description:"小規模企業共済やiDeCoの掛金控除",documents:["掛金払込証明書"]},{type:"life_insurance",name:"生命保険料控除",description:"生命保険料の控除（最大12万円）",documents:["生命保険料控除証明書"]},{type:"earthquake_insurance",name:"地震保険料控除",description:"地震保険料の控除（最大5万円）",documents:["地震保険料控除証明書"]},{type:"spouse",name:"配偶者控除",description:"配偶者の所得に応じた控除",documents:[]},{type:"dependent",name:"扶養控除",description:"扶養親族に応じた控除",documents:[]},{type:"furusato",name:"ふるさと納税（寄附金控除）",description:"ふるさと納税による寄附金控除",documents:["寄附金受領証明書"]},{type:"housing_loan",name:"住宅ローン控除",description:"住宅ローンの年末残高に応じた控除",documents:["住宅借入金等特別控除証明書","年末残高証明書"]}],be=(n,c,x="individual",l=[])=>{const g=n.filter(s=>new Date(s.date).getFullYear()===c),w=g.filter(s=>s.type==="income"),f=g.filter(s=>s.type==="expense"),b=w.reduce((s,o)=>s+Math.abs(Number(o.amount)||0),0),d=f.reduce((s,o)=>s+Math.abs(Number(o.amount)||0),0),k=b-d,p=Object.entries(f.reduce((s,o)=>{const y=o.category||"未分類";return s[y]=(s[y]||0)+Math.abs(Number(o.amount)||0),s},{})).map(([s,o])=>({category:s,amount:o,percentage:d>0?o/d*100:0})).sort((s,o)=>o.amount-s.amount),N=l.filter(s=>s.isApplicable).reduce((s,o)=>s+o.amount,0),m=Math.max(0,k-N),j=je(m);return{fiscalYear:c,businessType:x,totalRevenue:b,totalExpenses:d,netIncome:k,expensesByCategory:p,deductions:l,totalDeductions:N,taxableIncome:m,estimatedTax:j,status:"draft"}},je=n=>{for(const c of ue)if(n<=c.max)return Math.floor(n*c.rate-c.deduction);return 0},ge=(n=!0)=>{const c=[{id:"basic",type:"basic",name:"基礎控除",amount:he,description:"全ての納税者が受けられる控除",isApplicable:!0}];return n&&c.push({id:"blue_return",type:"blue_return",name:"青色申告特別控除",amount:pe,description:"電子申告で最大65万円控除",isApplicable:!0}),c},fe=async(n,c)=>{const x=[];return n.deductions.find(l=>l.type==="blue_return")||x.push("青色申告特別控除（65万円）の適用をご検討ください"),n.totalRevenue>0&&n.totalExpenses/n.totalRevenue<.3&&x.push("経費率が低めです。経費として計上できる支出がないか確認してみましょう"),n.taxableIncome>33e5&&x.push("小規模企業共済やiDeCoへの加入で節税効果が期待できます"),x.push("ふるさと納税で節税しながら地域貢献ができます"),x.push("経費の領収書は7年間保管が必要です"),{suggestions:x,estimatedSavings:Math.round(n.estimatedTax*.1)}},r=n=>new Intl.NumberFormat("ja-JP",{style:"currency",currency:"JPY",maximumFractionDigits:0}).format(n),Ne=n=>`${n.toFixed(1)}%`,S=[{id:1,title:"基本情報",icon:D,description:"確定申告の基本設定"},{id:2,title:"収支確認",icon:ie,description:"売上・経費の確認"},{id:3,title:"控除入力",icon:_,description:"各種控除の入力"},{id:4,title:"AI診断",icon:A,description:"AIによる節税アドバイス"},{id:5,title:"申告書作成",icon:P,description:"PDFダウンロード"}],De=()=>{const{user:n}=X(),{currentBusinessType:c}=Z(),{transactions:x}=ee(n==null?void 0:n.id,c==null?void 0:c.business_type),[l,g]=h.useState(1),[w,f]=h.useState(!1),b=new Date().getFullYear(),[d,k]=h.useState(b-1),[p,N]=h.useState(!0),[m,j]=h.useState([]),[s,o]=h.useState([]),[y,M]=h.useState(0);h.useEffect(()=>{j(ge(p))},[p]);const a=h.useMemo(()=>be(x,d,(c==null?void 0:c.business_type)||"individual",m),[x,d,c,m]),B=()=>{l<S.length&&g(l+1)},U=()=>{l>1&&g(l-1)},O=t=>{const i=F.find(u=>u.type===t);i&&!m.find(u=>u.type===t)&&j([...m,{id:Date.now().toString(),...i,amount:0,isApplicable:!0}])},Y=t=>{j(m.filter(i=>i.id!==t))},z=(t,i)=>{j(m.map(u=>u.id===t?{...u,amount:i}:u))},J=async()=>{f(!0);try{const t=await fe(a,{});o(t.suggestions),M(t.estimatedSavings)}catch(t){console.error("AI診断エラー:",t)}finally{f(!1)}},T=()=>{const t=`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
           確定申告書（${d}年度）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

申告方法: ${p?"青色申告":"白色申告"}
作成日時: ${new Date().toLocaleString("ja-JP")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【収支内訳】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
売上高:     ${r(a.totalRevenue)}
経費合計:   ${r(a.totalExpenses)}
──────────────────────────────────────────────────
事業所得:   ${r(a.netIncome)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【控除内訳】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${m.filter(C=>C.isApplicable).map(C=>`${C.name.padEnd(20,"　")}: ${r(C.amount)}`).join(`
`)}
──────────────────────────────────────────────────
控除合計:   ${r(a.totalDeductions)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【税額計算】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
課税所得:   ${r(a.taxableIncome)}
──────────────────────────────────────────────────
所得税額:   ${r(a.estimatedTax)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
※この書類はAinanceで生成された概算資料です。
  正式な確定申告は国税庁のe-Taxでお手続きください。
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`.trim(),i=new Blob(["\uFEFF"+t],{type:"text/plain;charset=utf-8"}),u=URL.createObjectURL(i),v=document.createElement("a");v.href=u,v.download=`確定申告書_${d}年度.txt`,document.body.appendChild(v),v.click(),document.body.removeChild(v);const I=window.open("","_blank");I&&(I.document.write(`
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>確定申告書プレビュー - ${d}年度</title>
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
        <p class="subtitle">${d}年度 | ${p?"青色申告":"白色申告"} | 作成日: ${new Date().toLocaleDateString("ja-JP")}</p>
        <pre>${t}</pre>
        <div class="actions">
            <button class="print-btn" onclick="window.print()">🖨️ 印刷する</button>
            <button class="close-btn" onclick="window.close()">✕ 閉じる</button>
        </div>
    </div>
</body>
</html>
            `),I.document.close()),setTimeout(()=>URL.revokeObjectURL(u),1e3)},H=()=>e.jsx("div",{className:"mb-8",children:e.jsx("div",{className:"flex items-center justify-between",children:S.map((t,i)=>e.jsxs(te.Fragment,{children:[e.jsxs("div",{className:"flex flex-col items-center",children:[e.jsx("div",{className:`w-10 h-10 rounded-full flex items-center justify-center transition-all ${l>t.id?"bg-success text-white":l===t.id?"bg-primary text-white":"bg-surface-highlight text-text-muted"}`,children:l>t.id?e.jsx(se,{className:"w-5 h-5"}):e.jsx(t.icon,{className:"w-5 h-5"})}),e.jsx("span",{className:`text-xs mt-2 hidden sm:block ${l>=t.id?"text-text-main font-medium":"text-text-muted"}`,children:t.title})]}),i<S.length-1&&e.jsx("div",{className:`flex-1 h-1 mx-2 rounded ${l>t.id?"bg-success":"bg-surface-highlight"}`})]},t.id))})}),W=()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold text-text-main mb-4",children:"確定申告の基本設定"}),e.jsx("p",{className:"text-text-muted mb-6",children:"確定申告を行う年度と申告方法を選択してください。"})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-text-main mb-2",children:"申告年度"}),e.jsx("select",{value:d,onChange:t=>k(Number(t.target.value)),className:"input-base",children:[b,...Array.from({length:4},(t,i)=>b-1-i)].map(t=>e.jsxs("option",{value:t,children:[t,"年度（",t,"年1月〜12月）",t===b&&" ※進行中"]},t))})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-text-main mb-2",children:"申告方法"}),e.jsxs("div",{className:"space-y-3",children:[e.jsxs("label",{className:"flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-surface-highlight transition-colors",children:[e.jsx("input",{type:"radio",checked:p,onChange:()=>N(!0),className:"w-4 h-4 text-primary"}),e.jsxs("div",{className:"ml-3",children:[e.jsx("span",{className:"font-medium text-text-main",children:"青色申告"}),e.jsx("span",{className:"ml-2 text-xs text-success",children:"最大65万円控除"}),e.jsx("p",{className:"text-sm text-text-muted mt-1",children:"複式簿記で最大65万円の控除が受けられます"})]})]}),e.jsxs("label",{className:"flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-surface-highlight transition-colors",children:[e.jsx("input",{type:"radio",checked:!p,onChange:()=>N(!1),className:"w-4 h-4 text-primary"}),e.jsxs("div",{className:"ml-3",children:[e.jsx("span",{className:"font-medium text-text-main",children:"白色申告"}),e.jsx("p",{className:"text-sm text-text-muted mt-1",children:"簡易的な帳簿で申告できます"})]})]})]})]})]}),e.jsxs("div",{className:"bg-info-light border border-info/20 rounded-lg p-4 flex items-start gap-3",children:[e.jsx(xe,{className:"w-5 h-5 text-info flex-shrink-0 mt-0.5"}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-text-main font-medium",children:"青色申告がおすすめ！"}),e.jsx("p",{className:"text-sm text-text-muted mt-1",children:"Ainanceで取引を記録していれば、複式簿記の要件を満たしています。 65万円の控除で税金がお得になります。"})]})]})]}),q=()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold text-text-main mb-4",children:"収支の確認"}),e.jsxs("p",{className:"text-text-muted mb-6",children:[d,"年度の取引データから自動集計した結果です。"]})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4",children:[e.jsxs("div",{className:"bg-success-light border border-success/20 rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-success font-medium",children:"売上高"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:r(a.totalRevenue)})]}),e.jsxs("div",{className:"bg-error-light border border-error/20 rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-error font-medium",children:"経費合計"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:r(a.totalExpenses)})]}),e.jsxs("div",{className:"bg-primary-light border border-primary/20 rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-primary font-medium",children:"事業所得"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:r(a.netIncome)})]})]}),e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-5",children:[e.jsx("h4",{className:"font-medium text-text-main mb-4",children:"経費内訳（上位5件）"}),a.expensesByCategory.length>0?e.jsx("div",{className:"space-y-3",children:a.expensesByCategory.slice(0,5).map((t,i)=>e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"w-8 h-8 bg-surface-highlight rounded-lg flex items-center justify-center text-sm font-medium text-text-muted",children:i+1}),e.jsx("span",{className:"text-text-main",children:t.category})]}),e.jsxs("div",{className:"text-right",children:[e.jsx("span",{className:"font-medium text-text-main",children:r(t.amount)}),e.jsxs("span",{className:"text-text-muted text-sm ml-2",children:["(",Ne(t.percentage),")"]})]})]},i))}):e.jsxs("p",{className:"text-text-muted text-center py-4",children:[d,"年度の経費データがありません"]})]}),a.totalRevenue===0&&a.totalExpenses===0&&e.jsxs("div",{className:"bg-warning-light border border-warning/20 rounded-lg p-4 flex items-start gap-3",children:[e.jsx(le,{className:"w-5 h-5 text-warning flex-shrink-0 mt-0.5"}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-text-main font-medium",children:"取引データがありません"}),e.jsxs("p",{className:"text-sm text-text-muted mt-1",children:[d,"年度の取引を登録してから確定申告を行ってください。",e.jsx(R,{to:"/transactions",className:"text-primary hover:underline ml-1",children:"取引を登録する →"})]})]})]})]}),K=()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold text-text-main mb-4",children:"各種控除の入力"}),e.jsx("p",{className:"text-text-muted mb-6",children:"該当する控除を追加して金額を入力してください。控除が多いほど税金が安くなります。"})]}),e.jsx("div",{className:"space-y-4",children:m.map(t=>e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4",children:[e.jsxs("div",{className:"flex-1",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(E,{className:"w-5 h-5 text-success"}),e.jsx("span",{className:"font-medium text-text-main",children:t.name})]}),e.jsx("p",{className:"text-sm text-text-muted mt-1 ml-7",children:t.description})]}),e.jsxs("div",{className:"flex items-center gap-3 ml-7 sm:ml-0",children:[e.jsxs("div",{className:"relative",children:[e.jsx("span",{className:"absolute left-3 top-1/2 -translate-y-1/2 text-text-muted",children:"¥"}),e.jsx("input",{type:"number",value:t.amount,onChange:i=>z(t.id,Number(i.target.value)),className:"input-base pl-8 w-40",placeholder:"金額",disabled:t.type==="basic"||t.type==="blue_return"})]}),t.type!=="basic"&&t.type!=="blue_return"&&e.jsx("button",{onClick:()=>Y(t.id),className:"p-2 text-error hover:bg-error-light rounded-lg transition-colors",children:e.jsx(ne,{className:"w-5 h-5"})})]})]},t.id))}),e.jsxs("div",{className:"bg-surface-highlight border border-border rounded-xl p-5",children:[e.jsxs("h4",{className:"font-medium text-text-main mb-4 flex items-center gap-2",children:[e.jsx(_,{className:"w-5 h-5"}),"控除を追加"]}),e.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-3",children:F.filter(t=>!m.find(i=>i.type===t.type)).map(t=>e.jsxs("button",{onClick:()=>O(t.type),className:"flex items-center gap-3 p-3 bg-surface border border-border rounded-lg hover:border-primary hover:bg-primary-light transition-colors text-left",children:[e.jsx("div",{className:"w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center",children:e.jsx(_,{className:"w-4 h-4 text-primary"})}),e.jsxs("div",{children:[e.jsx("p",{className:"font-medium text-text-main text-sm",children:t.name}),e.jsx("p",{className:"text-xs text-text-muted",children:t.description})]})]},t.type))})]}),e.jsxs("div",{className:"bg-success-light border border-success/20 rounded-xl p-5 flex items-center justify-between",children:[e.jsx("span",{className:"font-medium text-text-main",children:"控除合計"}),e.jsx("span",{className:"text-2xl font-bold text-success",children:r(a.totalDeductions)})]})]}),G=()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsxs("h3",{className:"text-lg font-semibold text-text-main mb-4 flex items-center gap-2",children:[e.jsx(A,{className:"w-5 h-5 text-primary"}),"AIによる節税アドバイス"]}),e.jsx("p",{className:"text-text-muted mb-6",children:"AIがあなたの収支データを分析し、節税のアドバイスを提供します。"})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-text-muted",children:"課税所得"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:r(a.taxableIncome)}),e.jsx("p",{className:"text-xs text-text-muted mt-2",children:"事業所得 - 各種控除"})]}),e.jsxs("div",{className:"bg-primary-light border border-primary/20 rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-primary font-medium",children:"予想所得税額"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:r(a.estimatedTax)}),e.jsx("p",{className:"text-xs text-text-muted mt-2",children:"※概算です。実際の税額とは異なる場合があります"})]})]}),s.length===0?e.jsx("button",{onClick:J,disabled:w,className:"btn-primary w-full py-4",children:w?e.jsxs(e.Fragment,{children:[e.jsx(ce,{className:"w-5 h-5 animate-spin"}),"AI分析中..."]}):e.jsxs(e.Fragment,{children:[e.jsx(A,{className:"w-5 h-5"}),"AIアドバイスを受ける"]})}):e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-5 space-y-4",children:[e.jsxs("div",{className:"flex items-center gap-2 text-primary",children:[e.jsx(A,{className:"w-5 h-5"}),e.jsx("span",{className:"font-medium",children:"AIからのアドバイス"})]}),e.jsx("ul",{className:"space-y-3",children:s.map((t,i)=>e.jsxs("li",{className:"flex items-start gap-3",children:[e.jsx(ae,{className:"w-5 h-5 text-primary flex-shrink-0 mt-0.5"}),e.jsx("span",{className:"text-text-main",children:t})]},i))}),y>0&&e.jsx("div",{className:"bg-success-light border border-success/20 rounded-lg p-4 mt-4",children:e.jsxs("p",{className:"text-sm text-success font-medium",children:["推定節税可能額: ",r(y)]})})]})]}),Q=()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsxs("h3",{className:"text-lg font-semibold text-text-main mb-4 flex items-center gap-2",children:[e.jsx(D,{className:"w-5 h-5 text-primary"}),"確定申告書の作成"]}),e.jsx("p",{className:"text-text-muted mb-6",children:"入力内容を確認して、確定申告書をダウンロードしてください。"})]}),e.jsxs("div",{className:"bg-surface border border-border rounded-xl divide-y divide-border",children:[e.jsxs("div",{className:"p-4 flex justify-between",children:[e.jsx("span",{className:"text-text-muted",children:"申告年度"}),e.jsxs("span",{className:"font-medium text-text-main",children:[d,"年度"]})]}),e.jsxs("div",{className:"p-4 flex justify-between",children:[e.jsx("span",{className:"text-text-muted",children:"申告方法"}),e.jsx("span",{className:"font-medium text-text-main",children:p?"青色申告":"白色申告"})]}),e.jsxs("div",{className:"p-4 flex justify-between",children:[e.jsx("span",{className:"text-text-muted",children:"売上高"}),e.jsx("span",{className:"font-medium text-success",children:r(a.totalRevenue)})]}),e.jsxs("div",{className:"p-4 flex justify-between",children:[e.jsx("span",{className:"text-text-muted",children:"経費合計"}),e.jsx("span",{className:"font-medium text-error",children:r(a.totalExpenses)})]}),e.jsxs("div",{className:"p-4 flex justify-between",children:[e.jsx("span",{className:"text-text-muted",children:"事業所得"}),e.jsx("span",{className:"font-medium text-text-main",children:r(a.netIncome)})]}),e.jsxs("div",{className:"p-4 flex justify-between",children:[e.jsx("span",{className:"text-text-muted",children:"控除合計"}),e.jsx("span",{className:"font-medium text-primary",children:r(a.totalDeductions)})]}),e.jsxs("div",{className:"p-4 flex justify-between bg-primary-light",children:[e.jsx("span",{className:"font-medium text-text-main",children:"予想所得税額"}),e.jsx("span",{className:"font-bold text-primary text-lg",children:r(a.estimatedTax)})]})]}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-4",children:[e.jsxs("button",{onClick:T,className:"btn-primary py-4",children:[e.jsx(P,{className:"w-5 h-5"}),"申告書をダウンロード"]}),e.jsxs("a",{href:"https://www.keisan.nta.go.jp/kyoutu/ky/smsp/top",target:"_blank",rel:"noopener noreferrer",className:"btn-outline py-4 text-center",children:[e.jsx(D,{className:"w-5 h-5"}),"e-Taxで申告する"]})]}),e.jsxs("div",{className:"bg-info-light border border-info/20 rounded-lg p-4 flex items-start gap-3",children:[e.jsx(oe,{className:"w-5 h-5 text-info flex-shrink-0 mt-0.5"}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-text-main font-medium",children:"次のステップ"}),e.jsxs("ol",{className:"text-sm text-text-muted mt-2 space-y-1 list-decimal list-inside",children:[e.jsx("li",{children:"ダウンロードした申告書の内容を確認"}),e.jsx("li",{children:"国税庁のe-Taxサイトで電子申告、または税務署に郵送"}),e.jsx("li",{children:"納税（3月15日まで）"})]})]})]})]}),V=()=>{switch(l){case 1:return e.jsx(W,{});case 2:return e.jsx(q,{});case 3:return e.jsx(K,{});case 4:return e.jsx(G,{});case 5:return e.jsx(Q,{});default:return null}};return e.jsx("div",{className:"min-h-screen bg-background",children:e.jsxs("div",{className:"max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8",children:[e.jsxs("div",{className:"mb-8",children:[e.jsxs(R,{to:"/dashboard",className:"flex items-center text-primary hover:text-primary-hover mb-4",children:[e.jsx($,{className:"h-5 w-5 mr-2"}),"ダッシュボードに戻る"]}),e.jsx("h1",{className:"text-3xl font-bold text-text-main mb-2",children:"確定申告サポート"}),e.jsx("p",{className:"text-text-muted",children:"5つのステップで簡単に確定申告を完了できます"})]}),e.jsx(H,{}),e.jsx("div",{className:"bg-surface border border-border rounded-xl p-6 mb-6",children:V()}),e.jsxs("div",{className:"flex justify-between",children:[e.jsxs("button",{onClick:U,disabled:l===1,className:`btn-ghost ${l===1?"opacity-50 cursor-not-allowed":""}`,children:[e.jsx($,{className:"w-5 h-5"}),"戻る"]}),l<S.length?e.jsxs("button",{onClick:B,className:"btn-primary",children:["次へ",e.jsx(re,{className:"w-5 h-5"})]}):e.jsxs("button",{onClick:T,className:"btn-success",children:[e.jsx(E,{className:"w-5 h-5"}),"完了"]})]})]})})};export{De as default};
