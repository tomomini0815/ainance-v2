const $="AIzaSyA5Tg6szP9tJ1bCkP9i2ggoxKNdJ5XRezg",f=["gemini-1.5-flash-latest","gemini-1.5-pro-latest","gemini-pro","gemini-1.0-pro"],x=`https://generativelanguage.googleapis.com/v1beta/models/${f[0]}:generateContent`,S=e=>`https://generativelanguage.googleapis.com/v1beta/models/${e}:generateContent`;async function I(e,m){var i,a,c,g,t;const p=`あなたは日本の経理・会計の専門家です。以下のレシートのOCRテキストを分析し、JSON形式で情報を抽出してください。

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
}`;try{const n=await fetch(`${x}?key=${$}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:p}]}],generationConfig:{temperature:.2,topK:40,topP:.95,maxOutputTokens:2048}})});if(!n.ok){const u=await n.json();return console.error("Gemini API エラー:",u),null}const r=(t=(g=(c=(a=(i=(await n.json()).candidates)==null?void 0:i[0])==null?void 0:a.content)==null?void 0:c.parts)==null?void 0:g[0])==null?void 0:t.text;if(!r)return console.error("Gemini APIからの応答が空です"),null;const s=r.match(/\{[\s\S]*\}/);if(!s)return console.error("JSONを抽出できませんでした:",r),null;const l=JSON.parse(s[0]);return console.log("Gemini AI分析結果:",l),l}catch(n){return console.error("Gemini AI分析エラー:",n),null}}function y(){return!0}function C(){return{enabled:y(),provider:"Google Gemini",model:"gemini-1.5-flash"}}async function d(e){var p,i,a,c,g;const m=`あなたは日本の中小企業向け経営コンサルタントです。以下の財務データを分析し、実用的なアドバイスを提供してください。

【財務データ】
期間: ${e.period}
売上高: ¥${e.revenue.toLocaleString()} (前期比: ${e.revenueChange>=0?"+":""}${e.revenueChange.toFixed(1)}%)
経費: ¥${e.expense.toLocaleString()} (前期比: ${e.expenseChange>=0?"+":""}${e.expenseChange.toFixed(1)}%)
利益: ¥${e.profit.toLocaleString()} (前期比: ${e.profitChange>=0?"+":""}${e.profitChange.toFixed(1)}%)
利益率: ${e.revenue>0?(e.profit/e.revenue*100).toFixed(1):0}%
取引件数: ${e.transactionCount}件

【経費カテゴリ（上位）】
${e.topExpenseCategories.map(t=>`- ${t.category}: ¥${t.amount.toLocaleString()} (${t.percentage.toFixed(1)}%)`).join(`
`)}

【売上カテゴリ（上位）】
${e.topIncomeCategories.map(t=>`- ${t.category}: ¥${t.amount.toLocaleString()} (${t.percentage.toFixed(1)}%)`).join(`
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

注意: 日本の中小企業や個人事業主向けに、実行可能で具体的なアドバイスを提供してください。`;for(const t of f)try{console.log(`🤖 Gemini AI: モデル「${t}」でアドバイス生成を試行中...`),console.log("🤖 送信データ:",e);const n=S(t),o=await fetch(`${n}?key=${$}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:m}]}],generationConfig:{temperature:.7,topP:.9,topK:40,maxOutputTokens:1500}})});if(console.log(`🤖 Gemini API レスポンスステータス (${t}):`,o.status),!o.ok){const h=await o.text();console.warn(`モデル「${t}」がエラー:`,o.status,h);continue}const r=await o.json();console.log("🤖 Gemini API 生のレスポンス:",r);const s=((g=(c=(a=(i=(p=r.candidates)==null?void 0:p[0])==null?void 0:i.content)==null?void 0:a.parts)==null?void 0:c[0])==null?void 0:g.text)||"";if(console.log("🤖 抽出されたテキスト:",s),!s){console.warn(`モデル「${t}」: テキストが空です`);continue}const l=s.match(/\{[\s\S]*\}/);if(!l){console.warn(`モデル「${t}」: JSONが見つかりません`);continue}const u=JSON.parse(l[0]);return console.log(`✅ Gemini AI (${t}): アドバイス生成完了`,u),u}catch(n){console.warn(`モデル「${t}」でエラー:`,n.message)}return console.error("すべてのモデルでアドバイス生成に失敗しました"),null}export{I as a,d as b,C as g,y as i};
