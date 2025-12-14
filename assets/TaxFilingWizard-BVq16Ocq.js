import{c as K,a as he,b as pe,d as be,r as $,j as e,L as P,F as R,P as _,S,R as ge,g as I,t as fe,T as je}from"./index-fP8bMWvD.js";import{g as ye,c as Ne,f as b,E as Y,A as U,a as we,b as ve}from"./TaxFilingService-cCkxMQ9O.js";import{P as F,S as B,r as C}from"./PDFButton-BFjrsoOr.js";import{A as J}from"./arrow-left-DmizAObh.js";import{C as ke}from"./calculator-CHpB4eKN.js";import{D as W}from"./download-DiKaStas.js";import{A as $e}from"./arrow-right-ydd2svJ_.js";import{C as M}from"./circle-check-big-CLS9Svu9.js";import{C as T}from"./copy-msONix3L.js";import{C as O}from"./circle-alert--Ug5qlkn.js";import{R as Ce}from"./refresh-cw-6vSOzKyG.js";/**
 * @license lucide-react v0.540.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ie=[["path",{d:"M10 12.5 8 15l2 2.5",key:"1tg20x"}],["path",{d:"m14 12.5 2 2.5-2 2.5",key:"yinavb"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z",key:"1mlx9k"}]],Te=K("file-code",Ie);/**
 * @license lucide-react v0.540.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ae=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 16v-4",key:"1dtifu"}],["path",{d:"M12 8h.01",key:"e9boi3"}]],De=K("info",Ae);function Re(i){const t=new Date,u=t.toISOString().replace(/[-:]/g,"").split(".")[0],o={売上高:"AA100",仕入高:"AB100",消耗品費:"AC100",旅費交通費:"AC110",通信費:"AC120",広告宣伝費:"AC130",接待交際費:"AC140",水道光熱費:"AC150",地代家賃:"AC160",外注費:"AC170",減価償却費:"AC180",雑費:"AC190"},p=i.expensesByCategory.map((c,n)=>{const d=o[c.category]||`AC${200+n}`;return`    <${d}>${c.amount}</${d}>`}).join(`
`);return`<?xml version="1.0" encoding="UTF-8"?>
<!--
  Ainance e-Tax Export File
  生成日時: ${t.toLocaleString("ja-JP")}
  対象年度: ${i.fiscalYear}年度
  申告区分: ${i.filingType==="blue"?"青色申告":"白色申告"}
-->
<申告書等送信票等>
  <作成日時>${u}</作成日時>
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
${p}
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
${i.deductions.map(c=>`      <${c.type}>${c.amount}</${c.type}>`).join(`
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
</申告書等送信票等>`}function Se(i){return`<?xml version="1.0" encoding="UTF-8"?>
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
${i.expensesByCategory.map(o=>`    <${o.category.replace(/\s/g,"")}>${o.amount}</${o.category.replace(/\s/g,"")}>`).join(`
`)}
    <経費合計>${i.expenses}</経費合計>
  </必要経費>
  
  <差引金額>${i.netIncome}</差引金額>
</収支内訳書>`}function Pe(i,t){const u=new Blob(["\uFEFF"+i],{type:"application/xml;charset=utf-8"}),o=URL.createObjectURL(u),p=document.createElement("a");p.href=o,p.download=t,document.body.appendChild(p),p.click(),document.body.removeChild(p),setTimeout(()=>URL.revokeObjectURL(o),1e3)}const x={事業_営業等:{x:475,y:648},事業所得_営業等:{x:475,y:458},総所得金額:{x:475,y:318},社会保険料控除:{x:475,y:268},小規模企業共済等掛金控除:{x:475,y:248},生命保険料控除:{x:475,y:228},地震保険料控除:{x:475,y:208},配偶者控除:{x:475,y:168},扶養控除:{x:475,y:148},基礎控除:{x:475,y:128},所得控除合計:{x:475,y:88},住所:{x:120,y:780},氏名:{x:120,y:755},電話番号:{x:350,y:755}},j={売上金額:{x:430,y:680,width:100},売上原価:{x:430,y:640,width:100},差引金額:{x:430,y:600,width:100},租税公課:{x:430,y:540,width:80},荷造運賃:{x:430,y:520,width:80},水道光熱費:{x:430,y:500,width:80},旅費交通費:{x:430,y:480,width:80},通信費:{x:430,y:460,width:80},広告宣伝費:{x:430,y:440,width:80},接待交際費:{x:430,y:420,width:80},損害保険料:{x:430,y:400,width:80},修繕費:{x:430,y:380,width:80},消耗品費:{x:430,y:360,width:80},減価償却費:{x:430,y:340,width:80},福利厚生費:{x:430,y:320,width:80},給料賃金:{x:430,y:300,width:80},外注工賃:{x:430,y:280,width:80},地代家賃:{x:430,y:260,width:80},支払利息:{x:430,y:240,width:80},雑費:{x:430,y:220,width:80},経費計:{x:430,y:180,width:100},青色申告特別控除前の所得金額:{x:430,y:140,width:100},青色申告特別控除額:{x:430,y:120,width:100},所得金額:{x:430,y:80,width:100},屋号:{x:100,y:750,width:150},住所:{x:100,y:720,width:200},氏名:{x:100,y:690,width:150}},G={交通費:"旅費交通費",旅費交通費:"旅費交通費",通信費:"通信費",水道光熱費:"水道光熱費",消耗品費:"消耗品費",接待交際費:"接待交際費",広告宣伝費:"広告宣伝費",地代家賃:"地代家賃",外注費:"外注工賃",給与:"給料賃金",雑費:"雑費",減価償却費:"減価償却費",修繕費:"修繕費",保険料:"損害保険料",福利厚生費:"福利厚生費",支払利息:"支払利息",租税公課:"租税公課",荷造運賃:"荷造運賃",その他:"雑費",未分類:"雑費"};async function _e(i,t){const u=await F.load(i,{ignoreEncryption:!0}),p=u.getPages()[0],w=await u.embedFont(B.Helvetica),c=s=>s.toLocaleString("ja-JP"),n=(s,l,g,h=9)=>{p.drawText(s,{x:l,y:g,size:h,font:w,color:C(0,0,0)})};n(c(t.revenue),x.事業_営業等.x,x.事業_営業等.y),n(c(t.netIncome),x.事業所得_営業等.x,x.事業所得_営業等.y),n(c(t.netIncome),x.総所得金額.x,x.総所得金額.y),t.deductions.socialInsurance&&n(c(t.deductions.socialInsurance),x.社会保険料控除.x,x.社会保険料控除.y),t.deductions.smallBusinessMutual&&n(c(t.deductions.smallBusinessMutual),x.小規模企業共済等掛金控除.x,x.小規模企業共済等掛金控除.y),t.deductions.lifeInsurance&&n(c(t.deductions.lifeInsurance),x.生命保険料控除.x,x.生命保険料控除.y),t.deductions.earthquakeInsurance&&n(c(t.deductions.earthquakeInsurance),x.地震保険料控除.x,x.地震保険料控除.y),t.deductions.spouse&&n(c(t.deductions.spouse),x.配偶者控除.x,x.配偶者控除.y),t.deductions.dependents&&n(c(t.deductions.dependents),x.扶養控除.x,x.扶養控除.y),t.deductions.basic&&n(c(t.deductions.basic),x.基礎控除.x,x.基礎控除.y);const d=Object.values(t.deductions).reduce((s,l)=>s+(l||0),0);return n(c(d),x.所得控除合計.x,x.所得控除合計.y),t.address&&n(t.address,x.住所.x,x.住所.y,8),t.name&&n(t.name,x.氏名.x,x.氏名.y),t.phone&&n(t.phone,x.電話番号.x,x.電話番号.y),u.save()}async function Fe(i,t){const u=await F.load(i,{ignoreEncryption:!0}),p=u.getPages()[0],w=await u.embedFont(B.Helvetica),c=l=>l.toLocaleString("ja-JP"),n=(l,g,h,k=9)=>{p.drawText(l,{x:g,y:h,size:k,font:w,color:C(0,0,0)})};n(c(t.revenue),j.売上金額.x,j.売上金額.y);const d={};t.expensesByCategory.forEach(l=>{const g=G[l.category]||"雑費";d[g]=(d[g]||0)+l.amount}),Object.entries(d).forEach(([l,g])=>{const h=j[l];h&&n(c(g),h.x,h.y)}),n(c(t.expenses),j.経費計.x,j.経費計.y),n(c(t.revenue-t.expenses),j.差引金額.x,j.差引金額.y),n(c(t.netIncome),j.青色申告特別控除前の所得金額.x,j.青色申告特別控除前の所得金額.y),t.isBlueReturn&&t.deductions.blueReturn&&n(c(t.deductions.blueReturn),j.青色申告特別控除額.x,j.青色申告特別控除額.y);const s=t.netIncome-(t.deductions.blueReturn||0);return n(c(Math.max(0,s)),j.所得金額.x,j.所得金額.y),t.tradeName&&n(t.tradeName,j.屋号.x,j.屋号.y),t.address&&n(t.address,j.住所.x,j.住所.y,8),t.name&&n(t.name,j.氏名.x,j.氏名.y),u.save()}async function X(i,t){const u=i==="tax_return_b"?"/templates/tax_return_r05.pdf":"/templates/blue_return_r05.pdf";let o;try{const w=await fetch(u);if(!w.ok)throw new Error(`テンプレートの読み込みに失敗: ${w.statusText}`);const c=await w.arrayBuffer();o=i==="tax_return_b"?await _e(c,t):await Fe(c,t)}catch(w){console.warn("テンプレート読み込み失敗、白紙から生成します:",w),o=await Be(i,t)}const p=i==="tax_return_b"?`確定申告書B_${t.fiscalYear}年度_入力済み.pdf`:`青色申告決算書_${t.fiscalYear}年度_入力済み.pdf`;return{pdfBytes:o,filename:p}}async function Be(i,t){const u=await F.create(),o=u.addPage([595.28,841.89]),p=await u.embedFont(B.Helvetica),{height:w}=o.getSize(),c=l=>l.toLocaleString("ja-JP"),n=(l,g,h,k=10,A=C(0,0,0))=>{o.drawText(l,{x:g,y:w-h,size:k,font:p,color:A})},d=(l,g,h,k)=>{o.drawLine({start:{x:l,y:w-g},end:{x:h,y:w-k},thickness:.5,color:C(.5,.5,.5)})};n(i==="tax_return_b"?"Shinkou-sho B (Tax Return Form B)":"Aoiro Shinkoku Kessan-sho (Blue Return)",50,50,16),n(`Fiscal Year: ${t.fiscalYear}`,50,75,12),n(`Generated by Ainance - ${new Date().toLocaleDateString("ja-JP")}`,50,95,9,C(.5,.5,.5)),d(50,110,545,110);let s=140;if(i==="tax_return_b"){n("=== Income (Shuunyu) ===",50,s,12),s+=25,n("Business Income (Jigyo Shotoku):",60,s),n(c(t.revenue)+" JPY",350,s),s+=20,d(50,s,545,s),s+=25,n("=== Deductions (Shotoku) ===",50,s,12),s+=25,n("Business Income (Net):",60,s),n(c(t.netIncome)+" JPY",350,s),s+=20,n("Total Income:",60,s),n(c(t.netIncome)+" JPY",350,s),s+=30,d(50,s,545,s),s+=25,n("=== Tax Deductions (Shotoku Koujo) ===",50,s,12),s+=25,t.deductions.basic&&(n("Basic Deduction (Kiso Koujo):",60,s),n(c(t.deductions.basic)+" JPY",350,s),s+=20),t.deductions.blueReturn&&(n("Blue Return Deduction (Aoiro):",60,s),n(c(t.deductions.blueReturn)+" JPY",350,s),s+=20);const l=Object.values(t.deductions).reduce((g,h)=>g+(h||0),0);n("Total Deductions:",60,s),n(c(l)+" JPY",350,s),s+=30,d(50,s,545,s),s+=25,n("=== Tax Calculation ===",50,s,12),s+=25,n("Taxable Income:",60,s),n(c(t.taxableIncome)+" JPY",350,s),s+=25,n("Estimated Tax:",60,s,12),n(c(t.estimatedTax)+" JPY",350,s,12,C(.8,0,0))}else if(n("=== Profit & Loss Statement ===",50,s,12),s+=25,n("Revenue (Uriage):",60,s),n(c(t.revenue)+" JPY",350,s),s+=30,d(50,s,545,s),s+=25,n("=== Expenses (Keihi) ===",50,s,12),s+=25,t.expensesByCategory.forEach(l=>{const g=G[l.category]||l.category;n(`${g}:`,60,s),n(c(l.amount)+" JPY",350,s),s+=18}),s+=10,n("Total Expenses:",60,s),n(c(t.expenses)+" JPY",350,s),s+=30,d(50,s,545,s),s+=25,n("=== Income Calculation ===",50,s,12),s+=25,n("Gross Profit (Revenue - Expenses):",60,s),n(c(t.netIncome)+" JPY",350,s),s+=25,t.isBlueReturn&&t.deductions.blueReturn){n("Blue Return Deduction:",60,s),n("-"+c(t.deductions.blueReturn)+" JPY",350,s),s+=25;const l=Math.max(0,t.netIncome-t.deductions.blueReturn);n("Final Income:",60,s,12),n(c(l)+" JPY",350,s,12,C(0,.6,0))}return d(50,780,545,780),n("* This document is generated by Ainance for reference purposes.",50,800,8,C(.5,.5,.5)),n("* For official tax filing, please use the NTA e-Tax system.",50,815,8,C(.5,.5,.5)),u.save()}function z(i,t){const u=new Blob([new Uint8Array(i)],{type:"application/pdf"}),o=URL.createObjectURL(u),p=document.createElement("a");p.href=o,p.download=t,document.body.appendChild(p),p.click(),document.body.removeChild(p),setTimeout(()=>URL.revokeObjectURL(o),1e3)}function H(i){const t=new Blob([new Uint8Array(i)],{type:"application/pdf"}),u=URL.createObjectURL(t);window.open(u,"_blank")}const D=[{id:1,title:"基本情報",icon:R,description:"確定申告の基本設定"},{id:2,title:"収支確認",icon:ke,description:"売上・経費の確認"},{id:3,title:"控除入力",icon:_,description:"各種控除の入力"},{id:4,title:"AI診断",icon:S,description:"AIによる節税アドバイス"},{id:5,title:"申告書作成",icon:W,description:"PDFダウンロード"}],We=()=>{const{user:i}=he(),{currentBusinessType:t}=pe(),{transactions:u}=be(i==null?void 0:i.id,t==null?void 0:t.business_type),[o,p]=$.useState(1),[w,c]=$.useState(!1),n=new Date().getFullYear(),[d,s]=$.useState(n-1),[l,g]=$.useState(!0),[h,k]=$.useState([]),[A,q]=$.useState([]),[E,V]=$.useState(0);$.useEffect(()=>{k(ye(l))},[l]);const r=$.useMemo(()=>Ne(u,d,(t==null?void 0:t.business_type)||"individual",h),[u,d,t,h]),Z=()=>{o<D.length&&p(o+1)},Q=()=>{o>1&&p(o-1)},ee=a=>{const m=U.find(f=>f.type===a);m&&!h.find(f=>f.type===a)&&k([...h,{id:Date.now().toString(),...m,amount:0,isApplicable:!0}])},te=a=>{k(h.filter(m=>m.id!==a))},se=(a,m)=>{k(h.map(f=>f.id===a?{...f,amount:m}:f))},ne=async()=>{c(!0);try{const a=await ve(r,{});q(a.suggestions),V(a.estimatedSavings)}catch(a){console.error("AI診断エラー:",a)}finally{c(!1)}},L=()=>{const a=`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
           確定申告書（${d}年度）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

申告方法: ${l?"青色申告":"白色申告"}
作成日時: ${new Date().toLocaleString("ja-JP")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【収支内訳】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
売上高:     ${b(r.totalRevenue)}
経費合計:   ${b(r.totalExpenses)}
──────────────────────────────────────────────────
事業所得:   ${b(r.netIncome)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【控除内訳】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${h.filter(v=>v.isApplicable).map(v=>`${v.name.padEnd(20,"　")}: ${b(v.amount)}`).join(`
`)}
──────────────────────────────────────────────────
控除合計:   ${b(r.totalDeductions)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【税額計算】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
課税所得:   ${b(r.taxableIncome)}
──────────────────────────────────────────────────
所得税額:   ${b(r.estimatedTax)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
※この書類はAinanceで生成された概算資料です。
  正式な確定申告は国税庁のe-Taxでお手続きください。
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`.trim(),m=new Blob(["\uFEFF"+a],{type:"text/plain;charset=utf-8"}),f=URL.createObjectURL(m),y=document.createElement("a");y.href=f,y.download=`確定申告書_${d}年度.txt`,document.body.appendChild(y),y.click(),document.body.removeChild(y);const N=window.open("","_blank");N&&(N.document.write(`
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
        <p class="subtitle">${d}年度 | ${l?"青色申告":"白色申告"} | 作成日: ${new Date().toLocaleDateString("ja-JP")}</p>
        <pre>${a}</pre>
        <div class="actions">
            <button class="print-btn" onclick="window.print()">🖨️ 印刷する</button>
            <button class="close-btn" onclick="window.close()">✕ 閉じる</button>
        </div>
    </div>
</body>
</html>
            `),N.document.close()),setTimeout(()=>URL.revokeObjectURL(f),1e3)},ae=()=>e.jsx("div",{className:"mb-8",children:e.jsx("div",{className:"flex items-center justify-between",children:D.map((a,m)=>e.jsxs(ge.Fragment,{children:[e.jsxs("div",{className:"flex flex-col items-center",children:[e.jsx("div",{className:`w-10 h-10 rounded-full flex items-center justify-center transition-all ${o>a.id?"bg-success text-white":o===a.id?"bg-primary text-white":"bg-surface-highlight text-text-muted"}`,children:o>a.id?e.jsx(I,{className:"w-5 h-5"}):e.jsx(a.icon,{className:"w-5 h-5"})}),e.jsx("span",{className:`text-xs mt-2 hidden sm:block ${o>=a.id?"text-text-main font-medium":"text-text-muted"}`,children:a.title})]}),m<D.length-1&&e.jsx("div",{className:`flex-1 h-1 mx-2 rounded ${o>a.id?"bg-success":"bg-surface-highlight"}`})]},a.id))})}),ie=()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold text-text-main mb-4",children:"確定申告の基本設定"}),e.jsx("p",{className:"text-text-muted mb-6",children:"確定申告を行う年度と申告方法を選択してください。"})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-text-main mb-2",children:"申告年度"}),e.jsx("select",{value:d,onChange:a=>s(Number(a.target.value)),className:"input-base",children:[n,...Array.from({length:4},(a,m)=>n-1-m)].map(a=>e.jsxs("option",{value:a,children:[a,"年度（",a,"年1月〜12月）",a===n&&" ※進行中"]},a))})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-text-main mb-2",children:"申告方法"}),e.jsxs("div",{className:"space-y-3",children:[e.jsxs("label",{className:"flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-surface-highlight transition-colors",children:[e.jsx("input",{type:"radio",checked:l,onChange:()=>g(!0),className:"w-4 h-4 text-primary"}),e.jsxs("div",{className:"ml-3",children:[e.jsx("span",{className:"font-medium text-text-main",children:"青色申告"}),e.jsx("span",{className:"ml-2 text-xs text-success",children:"最大65万円控除"}),e.jsx("p",{className:"text-sm text-text-muted mt-1",children:"複式簿記で最大65万円の控除が受けられます"})]})]}),e.jsxs("label",{className:"flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-surface-highlight transition-colors",children:[e.jsx("input",{type:"radio",checked:!l,onChange:()=>g(!1),className:"w-4 h-4 text-primary"}),e.jsxs("div",{className:"ml-3",children:[e.jsx("span",{className:"font-medium text-text-main",children:"白色申告"}),e.jsx("p",{className:"text-sm text-text-muted mt-1",children:"簡易的な帳簿で申告できます"})]})]})]})]})]}),e.jsxs("div",{className:"bg-info-light border border-info/20 rounded-lg p-4 flex items-start gap-3",children:[e.jsx(De,{className:"w-5 h-5 text-info flex-shrink-0 mt-0.5"}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-text-main font-medium",children:"青色申告がおすすめ！"}),e.jsx("p",{className:"text-sm text-text-muted mt-1",children:"Ainanceで取引を記録していれば、複式簿記の要件を満たしています。 65万円の控除で税金がお得になります。"})]})]})]}),re=()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold text-text-main mb-4",children:"収支の確認"}),e.jsxs("p",{className:"text-text-muted mb-6",children:[d,"年度の取引データから自動集計した結果です。"]})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4",children:[e.jsxs("div",{className:"bg-success-light border border-success/20 rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-success font-medium",children:"売上高"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:b(r.totalRevenue)})]}),e.jsxs("div",{className:"bg-error-light border border-error/20 rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-error font-medium",children:"経費合計"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:b(r.totalExpenses)})]}),e.jsxs("div",{className:"bg-primary-light border border-primary/20 rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-primary font-medium",children:"事業所得"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:b(r.netIncome)})]})]}),e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-5",children:[e.jsx("h4",{className:"font-medium text-text-main mb-4",children:"経費内訳（上位5件）"}),r.expensesByCategory.length>0?e.jsx("div",{className:"space-y-3",children:r.expensesByCategory.slice(0,5).map((a,m)=>e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"w-8 h-8 bg-surface-highlight rounded-lg flex items-center justify-center text-sm font-medium text-text-muted",children:m+1}),e.jsx("span",{className:"text-text-main",children:a.category})]}),e.jsxs("div",{className:"text-right",children:[e.jsx("span",{className:"font-medium text-text-main",children:b(a.amount)}),e.jsxs("span",{className:"text-text-muted text-sm ml-2",children:["(",we(a.percentage),")"]})]})]},m))}):e.jsxs("p",{className:"text-text-muted text-center py-4",children:[d,"年度の経費データがありません"]})]}),r.totalRevenue===0&&r.totalExpenses===0&&e.jsxs("div",{className:"bg-warning-light border border-warning/20 rounded-lg p-4 flex items-start gap-3",children:[e.jsx(O,{className:"w-5 h-5 text-warning flex-shrink-0 mt-0.5"}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-text-main font-medium",children:"取引データがありません"}),e.jsxs("p",{className:"text-sm text-text-muted mt-1",children:[d,"年度の取引を登録してから確定申告を行ってください。",e.jsx(P,{to:"/transactions",className:"text-primary hover:underline ml-1",children:"取引を登録する →"})]})]})]})]}),ce=()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold text-text-main mb-4",children:"各種控除の入力"}),e.jsx("p",{className:"text-text-muted mb-6",children:"該当する控除を追加して金額を入力してください。控除が多いほど税金が安くなります。"})]}),e.jsx("div",{className:"space-y-4",children:h.map(a=>e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4",children:[e.jsxs("div",{className:"flex-1",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(M,{className:"w-5 h-5 text-success"}),e.jsx("span",{className:"font-medium text-text-main",children:a.name})]}),e.jsx("p",{className:"text-sm text-text-muted mt-1 ml-7",children:a.description})]}),e.jsxs("div",{className:"flex items-center gap-3 ml-7 sm:ml-0",children:[e.jsxs("div",{className:"relative",children:[e.jsx("span",{className:"absolute left-3 top-1/2 -translate-y-1/2 text-text-muted",children:"¥"}),e.jsx("input",{type:"number",value:a.amount,onChange:m=>se(a.id,Number(m.target.value)),className:"input-base pl-8 w-40",placeholder:"金額",disabled:a.type==="basic"||a.type==="blue_return"})]}),a.type!=="basic"&&a.type!=="blue_return"&&e.jsx("button",{onClick:()=>te(a.id),className:"p-2 text-error hover:bg-error-light rounded-lg transition-colors",children:e.jsx(je,{className:"w-5 h-5"})})]})]},a.id))}),e.jsxs("div",{className:"bg-surface-highlight border border-border rounded-xl p-5",children:[e.jsxs("h4",{className:"font-medium text-text-main mb-4 flex items-center gap-2",children:[e.jsx(_,{className:"w-5 h-5"}),"控除を追加"]}),e.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-3",children:U.filter(a=>!h.find(m=>m.type===a.type)).map(a=>e.jsxs("button",{onClick:()=>ee(a.type),className:"flex items-center gap-3 p-3 bg-surface border border-border rounded-lg hover:border-primary hover:bg-primary-light transition-colors text-left",children:[e.jsx("div",{className:"w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center",children:e.jsx(_,{className:"w-4 h-4 text-primary"})}),e.jsxs("div",{children:[e.jsx("p",{className:"font-medium text-text-main text-sm",children:a.name}),e.jsx("p",{className:"text-xs text-text-muted",children:a.description})]})]},a.type))})]}),e.jsxs("div",{className:"bg-success-light border border-success/20 rounded-xl p-5 flex items-center justify-between",children:[e.jsx("span",{className:"font-medium text-text-main",children:"控除合計"}),e.jsx("span",{className:"text-2xl font-bold text-success",children:b(r.totalDeductions)})]})]}),le=()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsxs("h3",{className:"text-lg font-semibold text-text-main mb-4 flex items-center gap-2",children:[e.jsx(S,{className:"w-5 h-5 text-primary"}),"AIによる節税アドバイス"]}),e.jsx("p",{className:"text-text-muted mb-6",children:"AIがあなたの収支データを分析し、節税のアドバイスを提供します。"})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-text-muted",children:"課税所得"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:b(r.taxableIncome)}),e.jsx("p",{className:"text-xs text-text-muted mt-2",children:"事業所得 - 各種控除"})]}),e.jsxs("div",{className:"bg-primary-light border border-primary/20 rounded-xl p-5",children:[e.jsx("p",{className:"text-sm text-primary font-medium",children:"予想所得税額"}),e.jsx("p",{className:"text-2xl font-bold text-text-main mt-1",children:b(r.estimatedTax)}),e.jsx("p",{className:"text-xs text-text-muted mt-2",children:"※概算です。実際の税額とは異なる場合があります"})]})]}),A.length===0?e.jsx("button",{onClick:ne,disabled:w,className:"btn-primary w-full py-4",children:w?e.jsxs(e.Fragment,{children:[e.jsx(Ce,{className:"w-5 h-5 animate-spin"}),"AI分析中..."]}):e.jsxs(e.Fragment,{children:[e.jsx(S,{className:"w-5 h-5"}),"AIアドバイスを受ける"]})}):e.jsxs("div",{className:"bg-surface border border-border rounded-xl p-5 space-y-4",children:[e.jsxs("div",{className:"flex items-center gap-2 text-primary",children:[e.jsx(S,{className:"w-5 h-5"}),e.jsx("span",{className:"font-medium",children:"AIからのアドバイス"})]}),e.jsx("ul",{className:"space-y-3",children:A.map((a,m)=>e.jsxs("li",{className:"flex items-start gap-3",children:[e.jsx(fe,{className:"w-5 h-5 text-primary flex-shrink-0 mt-0.5"}),e.jsx("span",{className:"text-text-main",children:a})]},m))}),E>0&&e.jsx("div",{className:"bg-success-light border border-success/20 rounded-lg p-4 mt-4",children:e.jsxs("p",{className:"text-sm text-success font-medium",children:["推定節税可能額: ",b(E)]})})]})]}),oe=()=>{const a={fiscalYear:d,filingType:l?"blue":"white",revenue:r.totalRevenue,expenses:r.totalExpenses,netIncome:r.netIncome,expensesByCategory:r.expensesByCategory,deductions:h.filter(N=>N.isApplicable).map(N=>({type:N.type,name:N.name,amount:N.amount})),totalDeductions:r.totalDeductions,taxableIncome:r.taxableIncome,estimatedTax:r.estimatedTax},m=l?Re(a):Se(a),f=l?`青色申告決算書_${d}年度.xtx`:`収支内訳書_${d}年度.xml`;Pe(m,f);const y=window.open("","_blank");y&&(y.document.write(`
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>e-Tax用ファイルプレビュー - ${d}年度</title>
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
        <h1>📄 ${l?"青色申告決算書":"収支内訳書"}（${d}年度）</h1>
        <div class="info">
            <p>⚠️ <strong>このXMLファイルは参考資料です。</strong></p>
            <p>正式な確定申告は、国税庁の確定申告書等作成コーナーをご利用ください。XMLデータは入力の参考にお使いいただけます。</p>
        </div>
        <pre>${m.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</pre>
        <div class="actions">
            <button class="secondary" onclick="window.close()">✕ 閉じる</button>
        </div>
    </div>
</body>
</html>
            `),y.document.close())},de=()=>{const[a,m]=$.useState(null),f=async(y,N)=>{try{await navigator.clipboard.writeText(String(y).replace(/[¥,]/g,"")),m(N),setTimeout(()=>m(null),2e3)}catch(v){console.error("コピーに失敗しました:",v)}};return e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsxs("h3",{className:"text-lg font-semibold text-text-main mb-4 flex items-center gap-2",children:[e.jsx(R,{className:"w-5 h-5 text-primary"}),"確定申告書の作成"]}),e.jsx("p",{className:"text-text-muted mb-2",children:"入力内容を確認して、書類を作成してください。"}),e.jsx("p",{className:"text-xs text-text-muted",children:"💡 各項目の右側のコピーボタンで、e-Tax入力時にそのまま貼り付けできます"})]}),e.jsxs("div",{className:"bg-surface border border-border rounded-xl divide-y divide-border",children:[e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"申告年度"}),e.jsx("div",{className:"flex items-center gap-2",children:e.jsxs("span",{className:"font-medium text-text-main",children:[d,"年度"]})})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"申告方法"}),e.jsx("span",{className:"font-medium text-text-main",children:l?"青色申告":"白色申告"})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"売上高"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-success",children:b(r.totalRevenue)}),e.jsx("button",{onClick:()=>f(r.totalRevenue,"revenue"),className:`p-1.5 rounded transition-colors ${a==="revenue"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:a==="revenue"?e.jsx(I,{className:"w-4 h-4"}):e.jsx(T,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"経費合計"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-error",children:b(r.totalExpenses)}),e.jsx("button",{onClick:()=>f(r.totalExpenses,"expenses"),className:`p-1.5 rounded transition-colors ${a==="expenses"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:a==="expenses"?e.jsx(I,{className:"w-4 h-4"}):e.jsx(T,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"事業所得"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-text-main",children:b(r.netIncome)}),e.jsx("button",{onClick:()=>f(r.netIncome,"netIncome"),className:`p-1.5 rounded transition-colors ${a==="netIncome"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:a==="netIncome"?e.jsx(I,{className:"w-4 h-4"}):e.jsx(T,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"控除合計"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-primary",children:b(r.totalDeductions)}),e.jsx("button",{onClick:()=>f(r.totalDeductions,"deductions"),className:`p-1.5 rounded transition-colors ${a==="deductions"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:a==="deductions"?e.jsx(I,{className:"w-4 h-4"}):e.jsx(T,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center",children:[e.jsx("span",{className:"text-text-muted",children:"課税所得"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-text-main",children:b(r.taxableIncome)}),e.jsx("button",{onClick:()=>f(r.taxableIncome,"taxableIncome"),className:`p-1.5 rounded transition-colors ${a==="taxableIncome"?"bg-success text-white":"hover:bg-surface-highlight text-text-muted"}`,title:"コピー",children:a==="taxableIncome"?e.jsx(I,{className:"w-4 h-4"}):e.jsx(T,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"p-4 flex justify-between items-center bg-primary-light",children:[e.jsx("span",{className:"font-medium text-text-main",children:"予想所得税額"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-bold text-primary text-lg",children:b(r.estimatedTax)}),e.jsx("button",{onClick:()=>f(r.estimatedTax,"tax"),className:`p-1.5 rounded transition-colors ${a==="tax"?"bg-success text-white":"hover:bg-primary/20 text-primary"}`,title:"コピー",children:a==="tax"?e.jsx(I,{className:"w-4 h-4"}):e.jsx(T,{className:"w-4 h-4"})})]})]})]}),e.jsxs("div",{className:"space-y-4",children:[e.jsx("h4",{className:"text-md font-medium text-text-main",children:"📥 ダウンロード"}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-4",children:[e.jsxs("button",{onClick:L,className:"btn-primary py-4 flex items-center justify-center gap-2",children:[e.jsx(W,{className:"w-5 h-5"}),"申告書プレビュー"]}),e.jsxs("button",{onClick:oe,className:"btn-outline py-4 flex items-center justify-center gap-2 border-2 border-blue-500 text-blue-500 hover:bg-blue-500/10",children:[e.jsx(Te,{className:"w-5 h-5"}),"e-Tax用XMLファイル"]})]}),e.jsxs("div",{className:"bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4",children:[e.jsx("h5",{className:"text-sm font-medium text-text-main mb-3 flex items-center gap-2",children:"✨ テンプレート自動転記（NEW!）"}),e.jsx("p",{className:"text-xs text-text-muted mb-3",children:"国税庁の申告書テンプレートにAinanceのデータを自動入力したPDFを生成します"}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-3",children:[e.jsxs("button",{onClick:async()=>{var y;try{const N={revenue:r.totalRevenue,expenses:r.totalExpenses,netIncome:r.netIncome,expensesByCategory:r.expensesByCategory,deductions:{basic:((y=h.find(ue=>ue.type==="basic"))==null?void 0:y.amount)||48e4,blueReturn:l?65e4:0},taxableIncome:r.taxableIncome,estimatedTax:r.estimatedTax,fiscalYear:d,isBlueReturn:l},{pdfBytes:v,filename:me}=await X("tax_return_b",N);z(v,me),H(v)}catch(N){console.error("PDF生成エラー:",N),alert("PDF生成に失敗しました。テンプレートファイルを確認してください。")}},className:"px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium flex items-center justify-center gap-2",children:[e.jsx(R,{className:"w-4 h-4"}),"確定申告書B"]}),l&&e.jsxs("button",{onClick:async()=>{try{const y={revenue:r.totalRevenue,expenses:r.totalExpenses,netIncome:r.netIncome,expensesByCategory:r.expensesByCategory,deductions:{blueReturn:65e4},taxableIncome:r.taxableIncome,estimatedTax:r.estimatedTax,fiscalYear:d,isBlueReturn:!0},{pdfBytes:N,filename:v}=await X("blue_return",y);z(N,v),H(N)}catch(y){console.error("PDF生成エラー:",y),alert("PDF生成に失敗しました。テンプレートファイルを確認してください。")}},className:"px-4 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium flex items-center justify-center gap-2",children:[e.jsx(R,{className:"w-4 h-4"}),"青色申告決算書"]})]})]})]}),e.jsxs("div",{className:"bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-xl p-5",children:[e.jsxs("h4",{className:"text-md font-medium text-text-main mb-3 flex items-center gap-2",children:[e.jsx(Y,{className:"w-5 h-5 text-blue-500"}),"e-Taxで直接申告する"]}),e.jsxs("ol",{className:"text-sm text-text-muted space-y-2 mb-4",children:[e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx("span",{className:"flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs",children:"1"}),"上のコピーボタンで各数値をコピー"]}),e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx("span",{className:"flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs",children:"2"}),"確定申告書等作成コーナーにアクセス"]}),e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx("span",{className:"flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs",children:"3"}),"コピーした数値を貼り付けて入力"]}),e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx("span",{className:"flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs",children:"4"}),"マイナンバーカードで電子署名 → 送信完了！"]})]}),e.jsxs("a",{href:"https://www.keisan.nta.go.jp/kyoutu/ky/smsp/top",target:"_blank",rel:"noopener noreferrer",className:"inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm",children:[e.jsx(Y,{className:"w-4 h-4"}),"確定申告書等作成コーナーを開く"]}),e.jsx(P,{to:"/tax-filing-guide",className:"inline-flex items-center gap-2 px-4 py-2 ml-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm",children:"📖 詳しい申告ガイドを見る"})]}),e.jsxs("div",{className:"bg-warning-light border border-warning/20 rounded-lg p-4 flex items-start gap-3",children:[e.jsx(O,{className:"w-5 h-5 text-warning flex-shrink-0 mt-0.5"}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-text-main font-medium",children:"ご注意ください"}),e.jsxs("ul",{className:"text-sm text-text-muted mt-2 space-y-1 list-disc list-inside",children:[e.jsx("li",{children:"この計算は概算です。正確な税額は税務署にご確認ください"}),e.jsx("li",{children:"確定申告の期限は翌年3月15日です（例：2025年度分は2026年3月15日まで）"}),e.jsx("li",{children:"青色申告特別控除65万円の適用には電子申告が必要です"})]})]})]})]})},xe=()=>{switch(o){case 1:return e.jsx(ie,{});case 2:return e.jsx(re,{});case 3:return e.jsx(ce,{});case 4:return e.jsx(le,{});case 5:return e.jsx(de,{});default:return null}};return e.jsx("div",{className:"min-h-screen bg-background",children:e.jsxs("div",{className:"max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8",children:[e.jsxs("div",{className:"mb-8",children:[e.jsxs(P,{to:"/dashboard",className:"flex items-center text-primary hover:text-primary-hover mb-4",children:[e.jsx(J,{className:"h-5 w-5 mr-2"}),"ダッシュボードに戻る"]}),e.jsx("h1",{className:"text-3xl font-bold text-text-main mb-2",children:"確定申告サポート"}),e.jsx("p",{className:"text-text-muted",children:"5つのステップで簡単に確定申告を完了できます"})]}),e.jsx(ae,{}),e.jsx("div",{className:"bg-surface border border-border rounded-xl p-6 mb-6",children:xe()}),e.jsxs("div",{className:"flex justify-between",children:[e.jsxs("button",{onClick:Q,disabled:o===1,className:`btn-ghost ${o===1?"opacity-50 cursor-not-allowed":""}`,children:[e.jsx(J,{className:"w-5 h-5"}),"戻る"]}),o<D.length?e.jsxs("button",{onClick:Z,className:"btn-primary",children:["次へ",e.jsx($e,{className:"w-5 h-5"})]}):e.jsxs("button",{onClick:L,className:"btn-success",children:[e.jsx(M,{className:"w-5 h-5"}),"完了"]})]})]})})};export{We as default};
