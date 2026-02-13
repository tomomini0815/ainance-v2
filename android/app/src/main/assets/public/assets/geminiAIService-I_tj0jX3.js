const $="AIzaSyCojD6WNfryAIw-hiGr-IH8jaPAlMzpQs0",y=["gemini-2.0-flash","gemini-2.0-flash-lite","gemini-1.5-flash","gemini-1.5-pro"],S=`https://generativelanguage.googleapis.com/v1beta/models/${y[0]}:generateContent`,x=e=>`https://generativelanguage.googleapis.com/v1beta/models/${e}:generateContent`;async function d(e,f){var i,a,c,l,g;const s=`あなたは日本の経理・会計の専門家です。以下のレシートのOCRテキストを分析し、JSON形式で情報を抽出してください。

レシートテキスト:
"""
${e}
"""

以下の形式でJSONを返してください（JSONのみ、説明不要）:
{
  "storeName": "店舗名",
  "storeCategory": "店舗の業種（コンビニ、飲食店、文具店など）",
  "totalAmount": 数値（合計金額）,
  "date": "YYYY-MM-DD形式の日付",
  "items": [
    {"name": "商品名", "price": 数値, "category": "食品/飲料/事務用品/日用品/その他"}
  ],
  "classification": {
    "category": "経費カテゴリ（消耗品費/旅費交通費/接待交際費/通信費/水道光熱費/会議費/福利厚生費/外注費/その他）",
    "accountTitle": "勘定科目",
    "confidence": 0.0-1.0の信頼度,
    "reasoning": "この分類にした理由",
    "taxDeductible": true/false（経費計上可能か）,
    "suggestions": ["経費処理に関するアドバイス"]
  },
  "warnings": ["注意事項があればここに"]
}`;try{const t=await fetch(`${S}?key=${$}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:s}]}],generationConfig:{temperature:.2,topK:40,topP:.95,maxOutputTokens:2048}})});if(!t.ok){const u=await t.json();return console.error("Gemini API エラー:",u),null}const r=(g=(l=(c=(a=(i=(await t.json()).candidates)==null?void 0:i[0])==null?void 0:a.content)==null?void 0:c.parts)==null?void 0:l[0])==null?void 0:g.text;if(!r)return console.error("Gemini APIからの応答が空です"),null;const n=r.match(/\{[\s\S]*\}/);if(!n)return console.error("JSONを抽出できませんでした:",r),null;const p=JSON.parse(n[0]);return console.log("Gemini AI分析結果:",p),p}catch(t){return console.error("Gemini AI分析エラー:",t),null}}function C(){return!0}function O(){return{enabled:C(),provider:"Google Gemini",model:"gemini-1.5-flash"}}async function N(e){var i,a,c,l,g,t;console.log("🔑 Gemini API Key:",$.substring(0,10)+"...");const f=`あなたは日本の中小企業向け経営コンサルタントです。以下の財務データを分析し、実用的なアドバイスを提供してください。

【財務データ】
期間: ${e.period}
売上高: ¥${e.revenue.toLocaleString()} (前期比: ${e.revenueChange>=0?"+":""}${e.revenueChange.toFixed(1)}%)
経費: ¥${e.expense.toLocaleString()} (前期比: ${e.expenseChange>=0?"+":""}${e.expenseChange.toFixed(1)}%)
利益: ¥${e.profit.toLocaleString()} (前期比: ${e.profitChange>=0?"+":""}${e.profitChange.toFixed(1)}%)
利益率: ${e.revenue>0?(e.profit/e.revenue*100).toFixed(1):0}%
取引件数: ${e.transactionCount}件

【経費カテゴリ（上位）】
${e.topExpenseCategories.map(o=>`- ${o.category}: ¥${o.amount.toLocaleString()} (${o.percentage.toFixed(1)}%)`).join(`
`)}

【売上カテゴリ（上位）】
${e.topIncomeCategories.map(o=>`- ${o.category}: ¥${o.amount.toLocaleString()} (${o.percentage.toFixed(1)}%)`).join(`
`)}

以下のJSON形式でアドバイスを返してください（JSONのみ、説明不要）:
{
  "summary": "全体的な財務状況の要約（100文字以内）",
  "insights": [
    {
      "type": "positive/warning/info",
      "title": "インサイトのタイトル",
      "description": "詳細説明（50文字以内）"
    }
  ],
  "recommendations": [
    "具体的な改善提案1",
    "具体的な改善提案2",
    "具体的な改善提案3"
  ],
  "goals": {
    "shortTerm": "短期目標（1-3ヶ月）",
    "longTerm": "長期目標（6-12ヶ月）"
  }
}

注意: 日本の中小企業や個人事業主向けに、実行可能で具体的なアドバイスを提供してください。`;let s=null;for(const o of y)try{console.log(`🤖 Gemini AI: モデル「${o}」でアドバイス生成を試行中...`),console.log("🤖 送信データ:",e);const r=x(o),n=await fetch(`${r}?key=${$}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:f}]}],generationConfig:{temperature:.7,topP:.9,topK:40,maxOutputTokens:1500}})});if(console.log(`🤖 Gemini API レスポンスステータス (${o}):`,n.status),!n.ok){const m=await n.json().catch(()=>({}));if(console.error(`❌ モデル「${o}」がエラー:`,n.status,m),n.status===400||n.status===401||n.status===403){const A=((i=m==null?void 0:m.error)==null?void 0:i.message)||"API認証エラー";console.error("❌ API認証エラー:",A),s=new Error(`API認証エラー: ${A}`);break}continue}const p=await n.json();console.log("🤖 Gemini API 生のレスポンス:",p);const u=((t=(g=(l=(c=(a=p.candidates)==null?void 0:a[0])==null?void 0:c.content)==null?void 0:l.parts)==null?void 0:g[0])==null?void 0:t.text)||"";if(console.log("🤖 抽出されたテキスト:",u),!u){console.warn(`モデル「${o}」: テキストが空です`);continue}const h=u.match(/\{[\s\S]*\}/);if(!h){console.warn(`モデル「${o}」: JSONが見つかりません`);continue}const I=JSON.parse(h[0]);return console.log(`✅ Gemini AI (${o}): アドバイス生成完了`,I),I}catch(r){console.error(`❌ モデル「${o}」でエラー:`,r.message),s=r}throw console.error("❌ すべてのモデルでアドバイス生成に失敗しました"),s||new Error("AIアドバイスの生成に失敗しました。しばらくしてから再度お試しください。")}export{d as a,N as b,O as g,C as i};
