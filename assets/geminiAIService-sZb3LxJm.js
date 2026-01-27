import{s as S,d as C}from"./keywordCategoryService-DUEZLWyb.js";const $="your_gemini_api_key_here",I=["gemini-2.0-flash","gemini-2.0-flash-lite","gemini-1.5-flash","gemini-1.5-pro"],x=`https://generativelanguage.googleapis.com/v1beta/models/${I[0]}:generateContent`,O=t=>`https://generativelanguage.googleapis.com/v1beta/models/${t}:generateContent`;async function w(t,y){var l,g,p,m,u;const c=`あなたは日本の経理・会計の専門家です。以下のレシートのOCRテキストを分析し、JSON形式で情報を抽出してください。

レシートテキスト:
"""
${t}
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
    "category": "経費カテゴリ（消耗品費/旅費交通費/接待交際費/通信費/水道光熱費/会議費/福利厚生費/新聞図書費/外注費/食費/地代家賃/租税公課/雑費/その他）",
    "accountTitle": "勘定科目",
    "confidence": 0.0-1.0の信頼度,
    "reasoning": "この分類にした理由",
    "taxDeductible": true/false（経費計上可能か）,
    "suggestions": ["経費処理に関するアドバイス"]
  },
  "warnings": ["注意事項があればここに"]
}

注意: ランチや夕食などの飲食店での利用は、原則として「接待交際費」に分類し、品目名は「飲食代」としてください。`;try{const n=await fetch(`${x}?key=${$}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:c}]}],generationConfig:{temperature:.2,topK:40,topP:.95,maxOutputTokens:2048}})});if(!n.ok){const a=await n.json();return console.error("Gemini API エラー:",a),null}const s=(u=(m=(p=(g=(l=(await n.json()).candidates)==null?void 0:l[0])==null?void 0:g.content)==null?void 0:p.parts)==null?void 0:m[0])==null?void 0:u.text;if(!s)return console.error("Gemini APIからの応答が空です"),null;const r=s.match(/\{[\s\S]*\}/);if(!r)return console.error("JSONを抽出できませんでした:",s),null;const e=JSON.parse(r[0]);return console.log("Gemini AI分析結果:",e),e&&e.items&&e.items.forEach(a=>{var i;a.name=S(a.name,((i=e.classification)==null?void 0:i.category)||"")}),e}catch(n){return console.error("Gemini AI分析エラー:",n),null}}function A(){return!0}function J(){return{enabled:A(),provider:"Google Gemini",model:"gemini-1.5-flash"}}async function P(t){var l,g,p,m,u,n;console.log("🔑 Gemini API Key:",$.substring(0,10)+"...");const y=`あなたは日本の中小企業向け経営コンサルタントです。以下の財務データを分析し、実用的なアドバイスを提供してください。

【財務データ】
期間: ${t.period}
売上高: ¥${t.revenue.toLocaleString()} (前期比: ${t.revenueChange>=0?"+":""}${t.revenueChange.toFixed(1)}%)
経費: ¥${t.expense.toLocaleString()} (前期比: ${t.expenseChange>=0?"+":""}${t.expenseChange.toFixed(1)}%)
利益: ¥${t.profit.toLocaleString()} (前期比: ${t.profitChange>=0?"+":""}${t.profitChange.toFixed(1)}%)
利益率: ${t.revenue>0?(t.profit/t.revenue*100).toFixed(1):0}%
取引件数: ${t.transactionCount}件

【経費カテゴリ（上位）】
${t.topExpenseCategories.map(o=>`- ${o.category}: ¥${o.amount.toLocaleString()} (${o.percentage.toFixed(1)}%)`).join(`
`)}

【売上カテゴリ（上位）】
${t.topIncomeCategories.map(o=>`- ${o.category}: ¥${o.amount.toLocaleString()} (${o.percentage.toFixed(1)}%)`).join(`
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

注意: 日本の中小企業や個人事業主向けに、実行可能で具体的なアドバイスを提供してください。`;let c=null;for(const o of I)try{console.log(`🤖 Gemini AI: モデル「${o}」でアドバイス生成を試行中...`),console.log("🤖 送信データ:",t);const s=O(o),r=await fetch(`${s}?key=${$}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:y}]}],generationConfig:{temperature:.7,topP:.9,topK:40,maxOutputTokens:1500}})});if(console.log(`🤖 Gemini API レスポンスステータス (${o}):`,r.status),!r.ok){const f=await r.json().catch(()=>({}));if(console.error(`❌ モデル「${o}」がエラー:`,r.status,f),r.status===400||r.status===401||r.status===403){const d=((l=f==null?void 0:f.error)==null?void 0:l.message)||"API認証エラー";console.error("❌ API認証エラー:",d),c=new Error(`API認証エラー: ${d}`);break}continue}const e=await r.json();console.log("🤖 Gemini API 生のレスポンス:",e);const a=((n=(u=(m=(p=(g=e.candidates)==null?void 0:g[0])==null?void 0:p.content)==null?void 0:m.parts)==null?void 0:u[0])==null?void 0:n.text)||"";if(console.log("🤖 抽出されたテキスト:",a),!a){console.warn(`モデル「${o}」: テキストが空です`);continue}const i=a.match(/\{[\s\S]*\}/);if(!i){console.warn(`モデル「${o}」: JSONが見つかりません`);continue}const h=JSON.parse(i[0]);return console.log(`✅ Gemini AI (${o}): アドバイス生成完了`,h),h}catch(s){console.error(`❌ モデル「${o}」でエラー:`,s.message),c=s}throw console.error("❌ すべてのモデルでアドバイス生成に失敗しました"),c||new Error("AIアドバイスの生成に失敗しました。しばらくしてから再度お試しください。")}async function T(t){var l,g,p,m,u;const y=new Date().toISOString().split("T")[0],c=`あなたは日本の経理専門家です。ユーザーのチャットメッセージから取引情報を抽出してJSON形式で返してください。
 
 現在の今日の日付: ${y}
 
 チャットメッセージ: "${t}"
 
 ### 抽出ルール:
 1. **品目**: 具体的な内容を抽出（"ランチ" → "昼食代"など）。
 2. **金額**: 数値を抽出。万円、千円などの単位も考慮。
 3. **日付**: "昨日"、"一昨日"、"先週の金曜日"などの相対日時を、今日(${y})を基準に"YYYY-MM-DD"形式に変換。指定がなければ"${y}"とする。
 4. **カテゴリルール**: 以下のカテゴリから最も適切なものを選択。
    - **旅費交通費**: 電車、バス、タクシー、ガソリン、駐車場、宿泊費
    - **接待交際費**: ランチ、ディナー、飲み会、レストラン、居酒屋、取引先との会食、手土産、ゴルフ、慶弔費
    - **消耗品費**: 文房具、PC周辺機器(<10万円)、日用雑貨、作業用具
    - **会議費**: 打ち合わせ時のカフェ代、会議室利用料、弁当代
    - **通信費**: 携帯電話、インターネット、切手、配送料
    - **水道光熱費**: 電気、ガス、水道
    - **新聞図書費**: 書籍、新聞、雑誌、セミナー参加費
    - **広告宣伝費**: 広告掲載、チラシ、Web広告
    - **外注費**: 業務委託、デザイン料、ライティング料
    - **福利厚生費**: 従業員の慰安、健康診断、慶弔見舞金
    - **地代家賃**: 事務所家賃、月極駐車場、コワーキングスペース
    - **租税公課**: 印紙代、固定資産税、自動車税
    - **支払手数料**: 振込手数料、仲介手数料、システム利用料
    - **仕入**: 商品の仕入れ、原材料
    - **売上**: 商品やサービスの対価として受け取ったお金
    - **雑費**: その他分類できない少額の費用
 
 以下のJSON形式で回答してください（JSONのみ、説明不要）:
 {
   "item": "品目名",
   "amount": 数値,
   "date": "YYYY-MM-DD",
   "category": "カテゴリ名",
   "type": "income または expense",
   "description": "補足説明"
 }`;try{const n=await fetch(`${x}?key=${$}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:c}]}],generationConfig:{temperature:.1,maxOutputTokens:512,response_mime_type:"application/json"}})});if(!n.ok)return null;const s=(u=(m=(p=(g=(l=(await n.json()).candidates)==null?void 0:l[0])==null?void 0:g.content)==null?void 0:p.parts)==null?void 0:m[0])==null?void 0:u.text;if(!s)return null;const r=s.replace(/```json\n|\n```/g,"").trim();let e;try{e=JSON.parse(r)}catch{const i=s.match(/\{[\s\S]*\}/);if(i)e=JSON.parse(i[0]);else return null}if(e&&(!e.category||e.category==="その他"||e.category==="未分類"||e.category==="Unclassified"||e.category==="雑費")){const a=`${e.item} ${e.description||""}`,i=C(a);i&&(console.log(`Keyword Category Fallback (Chat): ${e.item} -> ${i}`),e.category=i)}return e&&(e.item=S(e.item,e.category)),e}catch(n){return console.error("AIチャット解析エラー:",n),null}}export{w as a,P as b,J as g,A as i,T as p};
