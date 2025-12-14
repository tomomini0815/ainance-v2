import{c as _,a as ae,b as ne,d as ie,r as f,j as e,L as E,F as U,P as D,S,R as re,g as y,v as ce,T as le}from"./index-D-2ZFFPa.js";import{A as R}from"./arrow-left-DNihySOM.js";import{C as oe}from"./calculator-BAQmQXOL.js";import{D as O}from"./download-BENyTrdU.js";import{A as de}from"./arrow-right-DMwQmbke.js";import{C as L}from"./circle-check-big-CdJAVegb.js";import{C as k}from"./copy-BjmFkIgK.js";import{C as M}from"./circle-alert-BIirurkd.js";import{R as me}from"./refresh-cw-BE49meEL.js";/**
 * @license lucide-react v0.540.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const xe=[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]],B=_("external-link",xe);/**
 * @license lucide-react v0.540.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ue=[["path",{d:"M10 12.5 8 15l2 2.5",key:"1tg20x"}],["path",{d:"m14 12.5 2 2.5-2 2.5",key:"yinavb"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z",key:"1mlx9k"}]],pe=_("file-code",ue);/**
 * @license lucide-react v0.540.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const he=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 16v-4",key:"1dtifu"}],["path",{d:"M12 8h.01",key:"e9boi3"}]],be=_("info",he),ge=[{min:0,max:195e4,rate:.05,deduction:0},{min:195e4,max:33e5,rate:.1,deduction:97500},{min:33e5,max:695e4,rate:.2,deduction:427500},{min:695e4,max:9e6,rate:.23,deduction:636e3},{min:9e6,max:18e6,rate:.33,deduction:1536e3},{min:18e6,max:4e7,rate:.4,deduction:2796e3},{min:4e7,max:1/0,rate:.45,deduction:4796e3}],je=65e4,fe=48e4,P=[{type:"basic",name:"基礎控除",description:"全ての納税者が受けられる控除（48万円）",documents:[]},{type:"blue_return",name:"青色申告特別控除",description:"青色申告者が受けられる控除（最大65万円）",documents:["青色申告承認申請書"]},{type:"medical",name:"医療費控除",description:"年間10万円を超える医療費の控除",documents:["医療費の領収書","医療費控除の明細書"]},{type:"social_insurance",name:"社会保険料控除",description:"国民健康保険、国民年金などの控除",documents:["社会保険料控除証明書"]},{type:"small_business_mutual",name:"小規模企業共済等掛金控除",description:"小規模企業共済やiDeCoの掛金控除",documents:["掛金払込証明書"]},{type:"life_insurance",name:"生命保険料控除",description:"生命保険料の控除（最大12万円）",documents:["生命保険料控除証明書"]},{type:"earthquake_insurance",name:"地震保険料控除",description:"地震保険料の控除（最大5万円）",documents:["地震保険料控除証明書"]},{type:"spouse",name:"配偶者控除",description:"配偶者の所得に応じた控除",documents:[]},{type:"dependent",name:"扶養控除",description:"扶養親族に応じた控除",documents:[]},{type:"furusato",name:"ふるさと納税（寄附金控除）",description:"ふるさと納税による寄附金控除",documents:["寄附金受領証明書"]},{type:"housing_loan",name:"住宅ローン控除",description:"住宅ローンの年末残高に応じた控除",documents:["住宅借入金等特別控除証明書","年末残高証明書"]}],Ne=(s,r,m="individual",n=[])=>{const u=s.filter(l=>new Date(l.date).getFullYear()===r),$=u.filter(l=>l.type==="income"),b=u.filter(l=>l.type==="expense"),N=$.reduce((l,x)=>l+Math.abs(Number(x.amount)||0),0),c=b.reduce((l,x)=>l+Math.abs(Number(x.amount)||0),0),I=N-c,p=Object.entries(b.reduce((l,x)=>{const A=x.category||"未分類";return l[A]=(l[A]||0)+Math.abs(Number(x.amount)||0),l},{})).map(([l,x])=>({category:l,amount:x,percentage:c>0?x/c*100:0})).sort((l,x)=>x.amount-l.amount),C=n.filter(l=>l.isApplicable).reduce((l,x)=>l+x.amount,0),h=Math.max(0,I-C),v=ye(h);return{fiscalYear:r,businessType:m,totalRevenue:N,totalExpenses:c,netIncome:I,expensesByCategory:p,deductions:n,totalDeductions:C,taxableIncome:h,estimatedTax:v,status:"draft"}},ye=s=>{for(const r of ge)if(s<=r.max)return Math.floor(s*r.rate-r.deduction);return 0},ve=(s=!0)=>{const r=[{id:"basic",type:"basic",name:"基礎控除",amount:fe,description:"全ての納税者が受けられる控除",isApplicable:!0}];return s&&r.push({id:"blue_return",type:"blue_return",name:"青色申告特別控除",amount:je,description:"電子申告で最大65万円控除",isApplicable:!0}),r},we=async(s,r)=>{const m=[];return s.deductions.find(n=>n.type==="blue_return")||m.push("青色申告特別控除（65万円）の適用をご検討ください"),s.totalRevenue>0&&s.totalExpenses/s.totalRevenue<.3&&m.push("経費率が低めです。経費として計上できる支出がないか確認してみましょう"),s.taxableIncome>33e5&&m.push("小規模企業共済やiDeCoへの加入で節税効果が期待できます"),m.push("ふるさと納税で節税しながら地域貢献ができます"),m.push("経費の領収書は7年間保管が必要です"),{suggestions:m,estimatedSavings:Math.round(s.estimatedTax*.1)}},o=s=>new Intl.NumberFormat("ja-JP",{style:"currency",currency:"JPY",maximumFractionDigits:0}).format(s),ke=s=>`${s.toFixed(1)}%`;function $e(s){const r=new Date,m=r.toISOString().replace(/[-:]/g,"").split(".")[0],n={売上高:"AA100",仕入高:"AB100",消耗品費:"AC100",旅費交通費:"AC110",通信費:"AC120",広告宣伝費:"AC130",接待交際費:"AC140",水道光熱費:"AC150",地代家賃:"AC160",外注費:"AC170",減価償却費:"AC180",雑費:"AC190"},u=s.expensesByCategory.map((b,N)=>{const c=n[b.category]||`AC${200+N}`;return`    <${c}>${b.amount}</${c}>`}).join(`
`);return`<?xml version="1.0" encoding="UTF-8"?>
<!--
  Ainance e-Tax Export File
  生成日時: ${r.toLocaleString("ja-JP")}
  対象年度: ${s.fiscalYear}年度
  申告区分: ${s.filingType==="blue"?"青色申告":"白色申告"}
-->
<申告書等送信票等>
  <作成日時>${m}</作成日時>
  <ファイル種別>青色申告決算書</ファイル種別>
  
  <申告者情報>
    <氏名>${s.name||"（要入力）"}</氏名>
    <フリガナ>${s.furigana||"（要入力）"}</フリガナ>
    <郵便番号>${s.postalCode||""}</郵便番号>
    <住所>${s.address||"（要入力）"}</住所>
    <電話番号>${s.phoneNumber||""}</電話番号>
    <生年月日>${s.birthDate||""}</生年月日>
  </申告者情報>
  
  <青色申告決算書>
    <対象年度>${s.fiscalYear}</対象年度>
    <申告区分>${s.filingType==="blue"?"1":"2"}</申告区分>
    
    <!-- 損益計算書 -->
    <損益計算書>
      <売上金額>
        <AA100>${s.revenue}</AA100>
      </売上金額>
      
      <必要経費>
${u}
        <経費合計>${s.expenses}</経費合計>
      </必要経費>
      
      <差引金額>${s.netIncome}</差引金額>
      
      <各種引当金>
        <繰戻額>0</繰戻額>
        <繰入額>0</繰入額>
      </各種引当金>
      
      <青色申告特別控除前所得>${s.netIncome}</青色申告特別控除前所得>
      <青色申告特別控除額>${s.filingType==="blue"?65e4:0}</青色申告特別控除額>
      <所得金額>${s.netIncome-(s.filingType==="blue"?65e4:0)}</所得金額>
    </損益計算書>
    
    <!-- 控除情報 -->
    <所得控除>
${s.deductions.map(b=>`      <${b.type}>${b.amount}</${b.type}>`).join(`
`)}
      <控除合計>${s.totalDeductions}</控除合計>
    </所得控除>
    
    <!-- 税額計算 -->
    <税額計算>
      <課税所得金額>${s.taxableIncome}</課税所得金額>
      <算出税額>${s.estimatedTax}</算出税額>
    </税額計算>
  </青色申告決算書>
  
  <備考>
    このファイルはAinanceで生成されました。
    正式な申告にはe-Tax確定申告書等作成コーナーでの確認・修正が必要な場合があります。
  </備考>
</申告書等送信票等>`}function Ce(s){return`<?xml version="1.0" encoding="UTF-8"?>
<!--
  Ainance e-Tax Export File - 収支内訳書
  生成日時: ${new Date().toLocaleString("ja-JP")}
  対象年度: ${s.fiscalYear}年度
-->
<収支内訳書>
  <対象年度>${s.fiscalYear}</対象年度>
  
  <収入金額>
    <売上金額>${s.revenue}</売上金額>
  </収入金額>
  
  <必要経費>
${s.expensesByCategory.map(n=>`    <${n.category.replace(/\s/g,"")}>${n.amount}</${n.category.replace(/\s/g,"")}>`).join(`
`)}
    <経費合計>${s.expenses}</経費合計>
  </必要経費>
  
  <差引金額>${s.netIncome}</差引金額>
</収支内訳書>`}function Ae(s,r){const m=new Blob(["\uFEFF"+s],{type:"application/xml;charset=utf-8"}),n=URL.createObjectURL(m),u=document.createElement("a");u.href=n,u.download=r,document.body.appendChild(u),u.click(),document.body.removeChild(u),setTimeout(()=>URL.revokeObjectURL(n),1e3)}const T=[{id:1,title:"基本情報",icon:U,description:"確定申告の基本設定"},{id:2,title:"収支確認",icon:oe,description:"売上・経費の確認"},{id:3,title:"控除入力",icon:D,description:"各種控除の入力"},{id:4,title:"AI診断",icon:S,description:"AIによる節税アドバイス"},{id:5,title:"申告書作成",icon:O,description:"PDFダウンロード"}],Me=()=>{const{user:s}=ae(),{currentBusinessType:r}=ne(),{transactions:m}=ie(s==null?void 0:s.id,r==null?void 0:r.business_type),[n,u]=f.useState(1),[$,b]=f.useState(!1),N=new Date().getFullYear(),[c,I]=f.useState(N-1),[p,C]=f.useState(!0),[h,v]=f.useState([]),[l,x]=f.useState([]),[A,X]=f.useState(0);f.useEffect(()=>{v(ve(p))},[p]);const a=f.useMemo(()=>Ne(m,c,(r==null?void 0:r.business_type)||"individual",h),[m,c,r,h]),Y=()=>{n<T.length&&u(n+1)},z=()=>{n>1&&u(n-1)},J=t=>{const i=P.find(d=>d.type===t);i&&!h.find(d=>d.type===t)&&v([...h,{id:Date.now().toString(),...i,amount:0,isApplicable:!0}])},H=t=>{v(h.filter(i=>i.id!==t))},q=(t,i)=>{v(h.map(d=>d.id===t?{...d,amount:i}:d))},W=async()=>{b(!0);try{const t=await we(a,{});x(t.suggestions),X(t.estimatedSavings)}catch(t){console.error("AI診断エラー:",t)}finally{b(!1)}},F=()=>{const t=`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
           確定申告書（${c}年度）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

申告方法: ${p?"青色申告":"白色申告"}
作成日時: ${new Date().toLocaleString("ja-JP")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【収支内訳】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
売上高:     ${o(a.totalRevenue)}
経費合計:   ${o(a.totalExpenses)}
──────────────────────────────────────────────────
事業所得:   ${o(a.netIncome)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【控除内訳】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${h.filter(w=>w.isApplicable).map(w=>`${w.name.padEnd(20,"　")}: ${o(w.amount)}`).join(`
`)}
──────────────────────────────────────────────────
控除合計:   ${o(a.totalDeductions)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【税額計算】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
課税所得:   ${o(a.taxableIncome)}
──────────────────────────────────────────────────
所得税額:   ${o(a.estimatedTax)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
※この書類はAinanceで生成された概算資料です。
  正式な確定申告は国税庁のe-Taxでお手続きください。
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`.trim(),i=new Blob(["\uFEFF"+t],{type:"text/plain;charset=utf-8"}),d=URL.createObjectURL(i),g=document.createElement("a");g.href=d,g.download=`確定申告書_${c}年度.txt`,document.body.appendChild(g),g.click(),document.body.removeChild(g);const j=window.open("","_blank");j&&(j.document.write(`
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
        <p class="subtitle">${c}年度 | ${p?"青色申告":"白色申告"} | 作成日: ${new Date().toLocaleDateString("ja-JP")}</p>
        <pre>${t}</pre>
        <div class="actions">
            <button class="print-btn" onclick="window.print()">🖨️ 印刷する</button>
            <button class="close-btn" onclick="window.close()">✕ 閉じる</button>
        </div>
    </div>
</body>
</html>
            `),j.document.close()),setTimeout(()=>URL.revokeObjectURL(d),1e3)},V=()=>e.jsx("div",{className:"mb-8",children:e.jsx("div",{className:"flex items-center justify-between",children:T.map((t,i)=>e.jsxs(re.Fragment,{children:[e.jsxs("div",{className:"flex flex-col items-center",children:[e.jsx("div",{className:`w-10 h-10 rounded-full flex items-center justify-center transition-all ${n>t.id?"bg-success text-white":n===t.id?"bg-primary text-white":"bg-surface-highlight text-text-muted"}`,children:n>t.id?e.jsx(y,{className:"w-5 h-5"}):e.jsx(t.icon,{className:"w-5 h-5"})}),e.jsx("span",{className:`text-xs mt-2 hidden sm:block ${n>=t.id?"text-text-main font-medium":"text-text-muted"}`,children:t.title})]}),i<T.length-1&&e.jsx("div",{className:`flex-1 h-1 mx-2 rounded ${n>t.id?"bg-success":"bg-surface-highlight"}`})]},t.id))})}),K=()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold text-text-main mb-4",children:"確定申告の基本設定"}),e.jsx("p",{className:"text-text-muted mb-6",children:"確定申告を行う年度と申告方法を選択してください。"})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-text-main mb-2",children:"申告年度"}),e.jsx("select",{value:c,onChange:t=>I(Number(t.target.value)),className:"input-base",children:[N,...Array.from({length:4},(t,i)=>N-1-i)].map(t=>e.jsxs("option",{value:t,children:[t,"年度（",t,"年1月〜12月）",t===N&&" ※進行中"]},t))})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-text-main mb-2",children:"申告方法"}),e.jsxs("div",{className:"space-y-3",children:[e.jsxs("label",{className:"flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-surface-highlight transition-colors",children:[e.jsx("input",{type:"radio",checked:p,onChange:()=>C(!0),className:"w-4 h-4 text-primary"}),e.jsxs("div",{className:"ml-3",children:[e.jsx("span",{className:"font-medium text-text-main",children:"青色申告"}),e.jsx("span",{className:"ml-2 text-xs text-success",children:"最大65万円控除"}),e.jsx("p",{className:"text-sm text-text-muted mt-1",children:"複式簿記で最大65万円の控除が受けられます"})]})]}),e.jsxs("label",{className:"flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-surface-highlight transition-colors",children:[e.jsx("input",{type:"radio",checked:!p,onChange:()=>C(!1),className:"w-4 h-4 text-primary"}),e.jsxs("div",{className:"ml-3",children:[e.jsx("span",{className:"font-medium text-text-main",children:"白色申告"}),e.jsx("p",{className:"text-sm text-text-muted mt-1",children:"簡易的な帳簿で申告できます"})]})]})]})]})]}),e.jsxs("div",{className:"bg-info-light border border-info/20 rounded-lg p-4 flex items-start gap-3",children:[e.jsx(be,{className:"w-5 h-5 text-info flex-shrink-0 mt-0.5"}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-text-main font-medium",children:"青色申告がおすすめ！"}),e.jsx("p",{className:"text-sm text-text-muted mt-1",children:"Ainanceで取引を記録していれば、複式簿記の要件を満たしています。 65万円の控除で税金がお得になります。"})]})]})]}),G=()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold text-text-main mb-4",children:"収支の確認"}),e.jsxs("p",{className:"text-text-muted mb-6",children:[c,"年度の取引データから自動集計した結果です。"]})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4",children:[e.jsxs("div",{className:"bg-success-light border border-success/20 rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-success font-medium",children:"売上高"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:o(a.totalRevenue)})]}),e.jsxs("div",{className:"bg-error-light border border-error/20 rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-error font-medium",children:"経費合計"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:o(a.totalExpenses)})]}),e.jsxs("div",{className:"bg-primary-light border border-primary/20 rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-primary font-medium",children:"事業所得"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:o(a.netIncome)})]})]}),e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-5",children:[e.jsx("h4",{className:"font-medium text-text-main mb-4",children:"経費内訳（上位5件）"}),a.expensesByCategory.length>0?e.jsx("div",{className:"space-y-3",children:a.expensesByCategory.slice(0,5).map((t,i)=>e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"w-8 h-8 bg-surface-highlight rounded-lg flex items-center justify-center text-sm font-medium text-text-muted",children:i+1}),e.jsx("span",{className:"text-text-main",children:t.category})]}),e.jsxs("div",{className:"text-right",children:[e.jsx("span",{className:"font-medium text-text-main",children:o(t.amount)}),e.jsxs("span",{className:"text-text-muted text-sm ml-2",children:["(",ke(t.percentage),")"]})]})]},i))}):e.jsxs("p",{className:"text-text-muted text-center py-4",children:[c,"年度の経費データがありません"]})]}),a.totalRevenue===0&&a.totalExpenses===0&&e.jsxs("div",{className:"bg-warning-light border border-warning/20 rounded-lg p-4 flex items-start gap-3",children:[e.jsx(M,{className:"w-5 h-5 text-warning flex-shrink-0 mt-0.5"}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-text-main font-medium",children:"取引データがありません"}),e.jsxs("p",{className:"text-sm text-text-muted mt-1",children:[c,"年度の取引を登録してから確定申告を行ってください。",e.jsx(E,{to:"/transactions",className:"text-primary hover:underline ml-1",children:"取引を登録する →"})]})]})]})]}),Z=()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold text-text-main mb-4",children:"各種控除の入力"}),e.jsx("p",{className:"text-text-muted mb-6",children:"該当する控除を追加して金額を入力してください。控除が多いほど税金が安くなります。"})]}),e.jsx("div",{className:"space-y-4",children:h.map(t=>e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4",children:[e.jsxs("div",{className:"flex-1",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(L,{className:"w-5 h-5 text-success"}),e.jsx("span",{className:"font-medium text-text-main",children:t.name})]}),e.jsx("p",{className:"text-sm text-text-muted mt-1 ml-7",children:t.description})]}),e.jsxs("div",{className:"flex items-center gap-3 ml-7 sm:ml-0",children:[e.jsxs("div",{className:"relative",children:[e.jsx("span",{className:"absolute left-3 top-1/2 -translate-y-1/2 text-text-muted",children:"¥"}),e.jsx("input",{type:"number",value:t.amount,onChange:i=>q(t.id,Number(i.target.value)),className:"input-base pl-8 w-40",placeholder:"金額",disabled:t.type==="basic"||t.type==="blue_return"})]}),t.type!=="basic"&&t.type!=="blue_return"&&e.jsx("button",{onClick:()=>H(t.id),className:"p-2 text-error hover:bg-error-light rounded-lg transition-colors",children:e.jsx(le,{className:"w-5 h-5"})})]})]},t.id))}),e.jsxs("div",{className:"bg-surface-highlight border border-border rounded-xl p-5",children:[e.jsxs("h4",{className:"font-medium text-text-main mb-4 flex items-center gap-2",children:[e.jsx(D,{className:"w-5 h-5"}),"控除を追加"]}),e.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-3",children:P.filter(t=>!h.find(i=>i.type===t.type)).map(t=>e.jsxs("button",{onClick:()=>J(t.type),className:"flex items-center gap-3 p-3 bg-surface border border-border rounded-lg hover:border-primary hover:bg-primary-light transition-colors text-left",children:[e.jsx("div",{className:"w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center",children:e.jsx(D,{className:"w-4 h-4 text-primary"})}),e.jsxs("div",{children:[e.jsx("p",{className:"font-medium text-text-main text-sm",children:t.name}),e.jsx("p",{className:"text-xs text-text-muted",children:t.description})]})]},t.type))})]}),e.jsxs("div",{className:"bg-success-light border border-success/20 rounded-xl p-5 flex items-center justify-between",children:[e.jsx("span",{className:"font-medium text-text-main",children:"控除合計"}),e.jsx("span",{className:"text-2xl font-bold text-success",children:o(a.totalDeductions)})]})]}),Q=()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsxs("h3",{className:"text-lg font-semibold text-text-main mb-4 flex items-center gap-2",children:[e.jsx(S,{className:"w-5 h-5 text-primary"}),"AIによる節税アドバイス"]}),e.jsx("p",{className:"text-text-muted mb-6",children:"AIがあなたの収支データを分析し、節税のアドバイスを提供します。"})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-text-muted",children:"課税所得"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:o(a.taxableIncome)}),e.jsx("p",{className:"text-xs text-text-muted mt-2",children:"事業所得 - 各種控除"})]}),e.jsxs("div",{className:"bg-primary-light border border-primary/20 rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-primary font-medium",children:"予想所得税額"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:o(a.estimatedTax)}),e.jsx("p",{className:"text-xs text-text-muted mt-2",children:"※概算です。実際の税額とは異なる場合があります"})]})]}),l.length===0?e.jsx("button",{onClick:W,disabled:$,className:"btn-primary w-full py-4",children:$?e.jsxs(e.Fragment,{children:[e.jsx(me,{className:"w-5 h-5 animate-spin"}),"AI分析中..."]}):e.jsxs(e.Fragment,{children:[e.jsx(S,{className:"w-5 h-5"}),"AIアドバイスを受ける"]})}):e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-5 space-y-4",children:[e.jsxs("div",{className:"flex items-center gap-2 text-primary",children:[e.jsx(S,{className:"w-5 h-5"}),e.jsx("span",{className:"font-medium",children:"AIからのアドバイス"})]}),e.jsx("ul",{className:"space-y-3",children:l.map((t,i)=>e.jsxs("li",{className:"flex items-start gap-3",children:[e.jsx(ce,{className:"w-5 h-5 text-primary flex-shrink-0 mt-0.5"}),e.jsx("span",{className:"text-text-main",children:t})]},i))}),A>0&&e.jsx("div",{className:"bg-success-light border border-success/20 rounded-lg p-4 mt-4",children:e.jsxs("p",{className:"text-sm text-success font-medium",children:["推定節税可能額: ",o(A)]})})]})]}),ee=()=>{const t={fiscalYear:c,filingType:p?"blue":"white",revenue:a.totalRevenue,expenses:a.totalExpenses,netIncome:a.netIncome,expensesByCategory:a.expensesByCategory,deductions:h.filter(j=>j.isApplicable).map(j=>({type:j.type,name:j.name,amount:j.amount})),totalDeductions:a.totalDeductions,taxableIncome:a.taxableIncome,estimatedTax:a.estimatedTax},i=p?$e(t):Ce(t),d=p?`青色申告決算書_${c}年度.xtx`:`収支内訳書_${c}年度.xml`;Ae(i,d);const g=window.open("","_blank");g&&(g.document.write(`
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
        <h1>📄 ${p?"青色申告決算書":"収支内訳書"}（${c}年度）</h1>
        <div class="info">
            <p>⚠️ <strong>このXMLファイルは参考資料です。</strong></p>
            <p>正式な確定申告は、国税庁の確定申告書等作成コーナーをご利用ください。XMLデータは入力の参考にお使いいただけます。</p>
        </div>
        <pre>${i.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</pre>
        <div class="actions">
            <button class="secondary" onclick="window.close()">✕ 閉じる</button>
        </div>
    </div>
</body>
</html>
            `),g.document.close())},te=()=>{const[t,i]=f.useState(null),d=async(g,j)=>{try{await navigator.clipboard.writeText(String(g).replace(/[¥,]/g,"")),i(j),setTimeout(()=>i(null),2e3)}catch(w){console.error("コピーに失敗しました:",w)}};return e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsxs("h3",{className:"text-lg font-semibold text-text-main mb-4 flex items-center gap-2",children:[e.jsx(U,{className:"w-5 h-5 text-primary"}),"確定申告書の作成"]}),e.jsx("p",{className:"text-text-muted mb-2",children:"入力内容を確認して、書類を作成してください。"}),e.jsx("p",{className:"text-xs text-text-muted",children:"💡 各項目の右側のコピーボタンで、e-Tax入力時にそのまま貼り付けできます"})]}),e.jsxs("div",{className:"bg-surface border border-border rounded-xl divide-y divide-border",children:[e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"申告年度"}),e.jsx("div",{className:"flex items-center gap-2",children:e.jsxs("span",{className:"font-medium text-text-main",children:[c,"年度"]})})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"申告方法"}),e.jsx("span",{className:"font-medium text-text-main",children:p?"青色申告":"白色申告"})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"売上高"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-success",children:o(a.totalRevenue)}),e.jsx("button",{onClick:()=>d(a.totalRevenue,"revenue"),className:`p-1.5 rounded transition-colors ${t==="revenue"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:t==="revenue"?e.jsx(y,{className:"w-4 h-4"}):e.jsx(k,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"経費合計"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-error",children:o(a.totalExpenses)}),e.jsx("button",{onClick:()=>d(a.totalExpenses,"expenses"),className:`p-1.5 rounded transition-colors ${t==="expenses"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:t==="expenses"?e.jsx(y,{className:"w-4 h-4"}):e.jsx(k,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"事業所得"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-text-main",children:o(a.netIncome)}),e.jsx("button",{onClick:()=>d(a.netIncome,"netIncome"),className:`p-1.5 rounded transition-colors ${t==="netIncome"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:t==="netIncome"?e.jsx(y,{className:"w-4 h-4"}):e.jsx(k,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"控除合計"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-primary",children:o(a.totalDeductions)}),e.jsx("button",{onClick:()=>d(a.totalDeductions,"deductions"),className:`p-1.5 rounded transition-colors ${t==="deductions"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:t==="deductions"?e.jsx(y,{className:"w-4 h-4"}):e.jsx(k,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"課税所得"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-text-main",children:o(a.taxableIncome)}),e.jsx("button",{onClick:()=>d(a.taxableIncome,"taxableIncome"),className:`p-1.5 rounded transition-colors ${t==="taxableIncome"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:t==="taxableIncome"?e.jsx(y,{className:"w-4 h-4"}):e.jsx(k,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center bg-primary-light",children:[e.jsx("span",{className:"font-medium text-text-main",children:"予想所得税額"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-bold text-primary text-lg",children:o(a.estimatedTax)}),e.jsx("button",{onClick:()=>d(a.estimatedTax,"tax"),className:`p-1.5 rounded transition-colors ${t==="tax"?"bg-success text-white":"hover:bg-primary/20 text-primary"}`,title:"コピー",children:t==="tax"?e.jsx(y,{className:"w-4 h-4"}):e.jsx(k,{className:"w-4 h-4"})})]})]})]}),e.jsxs("div",{className:"space-y-4",children:[e.jsx("h4",{className:"text-md font-medium text-text-main",children:"📥 ダウンロード"}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-4",children:[e.jsxs("button",{onClick:F,className:"btn-primary py-4 flex items-center justify-center gap-2",children:[e.jsx(O,{className:"w-5 h-5"}),"申告書プレビュー"]}),e.jsxs("button",{onClick:ee,className:"btn-outline py-4 flex items-center justify-center gap-2 border-2 border-blue-500 text-blue-500 hover:bg-blue-500/10",children:[e.jsx(pe,{className:"w-5 h-5"}),"e-Tax用XMLファイル"]})]})]}),e.jsxs("div",{className:"bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-xl p-5",children:[e.jsxs("h4",{className:"text-md font-medium text-text-main mb-3 flex items-center gap-2",children:[e.jsx(B,{className:"w-5 h-5 text-blue-500"}),"e-Taxで直接申告する"]}),e.jsxs("ol",{className:"text-sm text-text-muted space-y-2 mb-4",children:[e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx("span",{className:"flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs",children:"1"}),"上のコピーボタンで各数値をコピー"]}),e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx("span",{className:"flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs",children:"2"}),"確定申告書等作成コーナーにアクセス"]}),e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx("span",{className:"flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs",children:"3"}),"コピーした数値を貼り付けて入力"]}),e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx("span",{className:"flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs",children:"4"}),"マイナンバーカードで電子署名 → 送信完了！"]})]}),e.jsxs("a",{href:"https://www.keisan.nta.go.jp/kyoutu/ky/smsp/top",target:"_blank",rel:"noopener noreferrer",className:"inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm",children:[e.jsx(B,{className:"w-4 h-4"}),"確定申告書等作成コーナーを開く"]})]}),e.jsxs("div",{className:"bg-warning-light border border-warning/20 rounded-lg p-4 flex items-start gap-3",children:[e.jsx(M,{className:"w-5 h-5 text-warning flex-shrink-0 mt-0.5"}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-text-main font-medium",children:"ご注意ください"}),e.jsxs("ul",{className:"text-sm text-text-muted mt-2 space-y-1 list-disc list-inside",children:[e.jsx("li",{children:"この計算は概算です。正確な税額は税務署にご確認ください"}),e.jsx("li",{children:"確定申告の期限は翌年3月15日です（例：2025年度分は2026年3月15日まで）"}),e.jsx("li",{children:"青色申告特別控除65万円の適用には電子申告が必要です"})]})]})]})]})},se=()=>{switch(n){case 1:return e.jsx(K,{});case 2:return e.jsx(G,{});case 3:return e.jsx(Z,{});case 4:return e.jsx(Q,{});case 5:return e.jsx(te,{});default:return null}};return e.jsx("div",{className:"min-h-screen bg-background",children:e.jsxs("div",{className:"max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8",children:[e.jsxs("div",{className:"mb-8",children:[e.jsxs(E,{to:"/dashboard",className:"flex items-center text-primary hover:text-primary-hover mb-4",children:[e.jsx(R,{className:"h-5 w-5 mr-2"}),"ダッシュボードに戻る"]}),e.jsx("h1",{className:"text-3xl font-bold text-text-main mb-2",children:"確定申告サポート"}),e.jsx("p",{className:"text-text-muted",children:"5つのステップで簡単に確定申告を完了できます"})]}),e.jsx(V,{}),e.jsx("div",{className:"bg-surface border border-border rounded-xl p-6 mb-6",children:se()}),e.jsxs("div",{className:"flex justify-between",children:[e.jsxs("button",{onClick:z,disabled:n===1,className:`btn-ghost ${n===1?"opacity-50 cursor-not-allowed":""}`,children:[e.jsx(R,{className:"w-5 h-5"}),"戻る"]}),n<T.length?e.jsxs("button",{onClick:Y,className:"btn-primary",children:["次へ",e.jsx(de,{className:"w-5 h-5"})]}):e.jsxs("button",{onClick:F,className:"btn-success",children:[e.jsx(L,{className:"w-5 h-5"}),"完了"]})]})]})})};export{Me as default};
