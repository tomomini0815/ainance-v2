import{s as I,d as C}from"./keywordCategoryService-DUEZLWyb.js";const S="your_gemini_api_key_here",w=["gemini-2.0-flash","gemini-2.0-flash-lite","gemini-1.5-flash","gemini-1.5-pro"],O=`https://generativelanguage.googleapis.com/v1beta/models/${w[0]}:generateContent`,N=t=>`https://generativelanguage.googleapis.com/v1beta/models/${t}:generateContent`;async function j(t,f){var u,d,y,g,p;const m=`あなたは日本の経理・会計の専門家です。以下のレシートのOCRテキストを分析し、JSON形式で情報を抽出してください。

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

注意: ランチや夕食などの飲食店での利用は、原則として「接待交際費」に分類し、品目名は「飲食代」としてください。`;try{const a=await fetch(`${O}?key=${S}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:m}]}],generationConfig:{temperature:.2,topK:40,topP:.95,maxOutputTokens:2048}})});if(!a.ok){const l=await a.json();return console.error("Gemini API エラー:",l),null}const c=(p=(g=(y=(d=(u=(await a.json()).candidates)==null?void 0:u[0])==null?void 0:d.content)==null?void 0:y.parts)==null?void 0:g[0])==null?void 0:p.text;if(!c)return console.error("Gemini APIからの応答が空です"),null;const s=c.match(/\{[\s\S]*\}/);if(!s)return console.error("JSONを抽出できませんでした:",c),null;const e=JSON.parse(s[0]);return console.log("Gemini AI分析結果:",e),e&&e.items&&e.items.forEach(l=>{var i;l.name=I(l.name,((i=e.classification)==null?void 0:i.category)||"")}),e}catch(a){return console.error("Gemini AI分析エラー:",a),null}}async function J(t){var g,p,a,n,c,s;let f="image/jpeg";if(t.includes("data:")){const e=t.match(/data:([^;]+);/);e&&(f=e[1])}const m=t.includes(",")?t.split(",")[1]:t,u=new Date().toISOString().split("T")[0],y=`あなたは日本の経理・会計および税務の専門家です。提供されたレシートまたは領収書の画像を細部まで詳細に分析し、最高精度の情報を抽出してください。

### 解析ルール (日本市場向け最適化):
1. **店舗名**: 正確な正式名称を抽出してください。ロゴや電話番号、住所、さらにはインボイス登録番号から推測が必要な場合も、最も可能性の高い名称を特定してください。
2. **登録番号 (重要)**: インボイス制度に基づく登録番号（T+13桁の数字）を探して抽出してください。見つからない場合は null としてください。
3. **日付**: "YYYY-MM-DD"形式で抽出してください。
   - 年が明記されていない場合（例: "1月25日"）、現在の年（${new Date().getFullYear()}年）を補完してください。ただし、現在1月でレシートが11月や12月の場合は前年と判断してください。
   - 和暦（令和、平成など）は西暦に変換してください（例: 令和6年 -> 2024年）。
4. **合計金額**: 最終的な支払い金額（税込、値引き後）を抽出してください。
   - **重要**: 「お預かり（Cash Received）」や「お釣り（Change）」、「対象計」などの数値を誤って合計金額としないでください。
5. **税率の内訳**: 8%（軽減税率）と10%（標準税率）それぞれの対象金額と税額を抽出してください。
6. **品目**: 各行の商品名、金額、税率、カテゴリを抽出してください。
   - 値引きやポイント利用がある場合は、それらも正確に反映させて合計と一致するか内部で検証してください。
7. **分類**: 日本の標準的な勘定科目に基いて分類してください。
   - 消耗品費、旅費交通費、接待交際費、会議費、通信費、福利厚生費、外注費、地代家賃、雑費、事業主貸など。
   - **重要**: ランチや居酒屋、レストランなどの飲食店での利用は、店舗の業種に関わらず「接待交際費」に分類し、品目名（itemsの中のname）は「飲食代」とすることを優先してください。

### 回答形式:
必ず以下の純粋なJSON形式のみで回答してください:
{
  "storeName": "店舗名",
  "storeCategory": "店舗の業種",
  "totalAmount": 数値,
  "date": "YYYY-MM-DD",
  "invoiceRegistrationNumber": "T1234567890123 または null",
  "taxBreakdown": [
    {"rate": 10, "amount": 100, "targetAmount": 1000},
    {"rate": 8, "amount": 40, "targetAmount": 500}
  ],
  "items": [
    {"name": "商品名", "price": 数値, "taxRate": 8|10, "category": "食品/飲料/事務用品/日用品/その他"}
  ],
  "classification": {
    "category": "勘定科目カテゴリ名（消耗品費/旅費交通費/接待交際費/通信費/水道光熱費/会議費/福利厚生費/新聞図書費/外注費/地代家賃/租税公課/支払手数料/仕入/売上/食費/雑費/事業主貸など）",
    "accountTitle": "勘定科目詳細",
    "confidence": 0.0-1.0,
    "reasoning": "分類の理由",
    "taxDeductible": true/false
  },
  "warnings": []
}

現在の今日の日付: ${u}`;try{const e=await fetch(`${O}?key=${S}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:y},{inline_data:{mime_type:f,data:m}}]}],generationConfig:{temperature:.1,maxOutputTokens:2048,response_mime_type:"application/json"}})});if(!e.ok){const o=await e.json();return console.error("Gemini Vision API Error Details:",{status:e.status,statusText:e.statusText,error:o}),null}const l=await e.json();console.log("Gemini Vision API Raw Response:",JSON.stringify(l,null,2));const i=(c=(n=(a=(p=(g=l.candidates)==null?void 0:g[0])==null?void 0:p.content)==null?void 0:a.parts)==null?void 0:n[0])==null?void 0:c.text;if(!i)return console.warn("Gemini Vision API returned empty text content."),null;const $=i.match(/\{[\s\S]*\}/);if(!$)return console.error("Failed to extract JSON from Gemini Vision response:",i),null;const r=JSON.parse($[0]);if(r&&r.items&&r.items.forEach(o=>{if(!o.category||o.category==="その他"||o.category==="未分類"||o.category==="Unclassified"){const h=C(o.name);h&&(console.log(`Keyword Category Fallback (Item): ${o.name} -> ${h}`),o.category=h)}}),r&&r.classification){const o=r.classification;if(!o.category||o.category==="その他"||o.category==="未分類"||o.category==="Unclassified"||o.category==="雑費"){const h=`${r.storeName} ${(s=r.items)==null?void 0:s.map(A=>A.name).join(" ")}`,x=C(h);x&&(console.log(`Keyword Category Fallback (Main): ${r.storeName} -> ${x}`),o.category=x,o.accountTitle=x,o.reasoning+=" (キーワードマッチングにより修正)")}}return r&&r.items&&r.items.forEach(o=>{var h;o.name=I(o.name,((h=r.classification)==null?void 0:h.category)||"")}),r}catch(e){return console.error("Gemini Vision AI Analysis Exception:",e),null}}function T(){return!0}function k(){return{enabled:T(),provider:"Google Gemini",model:"gemini-1.5-flash"}}async function M(t){var u,d,y,g,p,a;console.log("🔑 Gemini API Key:",S.substring(0,10)+"...");const f=`あなたは日本の中小企業向け経営コンサルタントです。以下の財務データを分析し、実用的なアドバイスを提供してください。

【財務データ】
期間: ${t.period}
売上高: ¥${t.revenue.toLocaleString()} (前期比: ${t.revenueChange>=0?"+":""}${t.revenueChange.toFixed(1)}%)
経費: ¥${t.expense.toLocaleString()} (前期比: ${t.expenseChange>=0?"+":""}${t.expenseChange.toFixed(1)}%)
利益: ¥${t.profit.toLocaleString()} (前期比: ${t.profitChange>=0?"+":""}${t.profitChange.toFixed(1)}%)
利益率: ${t.revenue>0?(t.profit/t.revenue*100).toFixed(1):0}%
取引件数: ${t.transactionCount}件

【経費カテゴリ（上位）】
${t.topExpenseCategories.map(n=>`- ${n.category}: ¥${n.amount.toLocaleString()} (${n.percentage.toFixed(1)}%)`).join(`
`)}

【売上カテゴリ（上位）】
${t.topIncomeCategories.map(n=>`- ${n.category}: ¥${n.amount.toLocaleString()} (${n.percentage.toFixed(1)}%)`).join(`
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

注意: 日本の中小企業や個人事業主向けに、実行可能で具体的なアドバイスを提供してください。`;let m=null;for(const n of w)try{console.log(`🤖 Gemini AI: モデル「${n}」でアドバイス生成を試行中...`),console.log("🤖 送信データ:",t);const c=N(n),s=await fetch(`${c}?key=${S}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:f}]}],generationConfig:{temperature:.7,topP:.9,topK:40,maxOutputTokens:1500}})});if(console.log(`🤖 Gemini API レスポンスステータス (${n}):`,s.status),!s.ok){const r=await s.json().catch(()=>({}));if(console.error(`❌ モデル「${n}」がエラー:`,s.status,r),s.status===400||s.status===401||s.status===403){const o=((u=r==null?void 0:r.error)==null?void 0:u.message)||"API認証エラー";console.error("❌ API認証エラー:",o),m=new Error(`API認証エラー: ${o}`);break}continue}const e=await s.json();console.log("🤖 Gemini API 生のレスポンス:",e);const l=((a=(p=(g=(y=(d=e.candidates)==null?void 0:d[0])==null?void 0:y.content)==null?void 0:g.parts)==null?void 0:p[0])==null?void 0:a.text)||"";if(console.log("🤖 抽出されたテキスト:",l),!l){console.warn(`モデル「${n}」: テキストが空です`);continue}const i=l.match(/\{[\s\S]*\}/);if(!i){console.warn(`モデル「${n}」: JSONが見つかりません`);continue}const $=JSON.parse(i[0]);return console.log(`✅ Gemini AI (${n}): アドバイス生成完了`,$),$}catch(c){console.error(`❌ モデル「${n}」でエラー:`,c.message),m=c}throw console.error("❌ すべてのモデルでアドバイス生成に失敗しました"),m||new Error("AIアドバイスの生成に失敗しました。しばらくしてから再度お試しください。")}async function P(t){var u,d,y,g,p;const f=new Date().toISOString().split("T")[0],m=`あなたは日本の経理専門家です。ユーザーのチャットメッセージから取引情報を抽出してJSON形式で返してください。
 
 現在の今日の日付: ${f}
 
 チャットメッセージ: "${t}"
 
 ### 抽出ルール:
 1. **品目**: 具体的な内容を抽出（"ランチ" → "昼食代"など）。
 2. **金額**: 数値を抽出。万円、千円などの単位も考慮。
 3. **日付**: "昨日"、"一昨日"、"先週の金曜日"などの相対日時を、今日(${f})を基準に"YYYY-MM-DD"形式に変換。指定がなければ"${f}"とする。
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
 }`;try{const a=await fetch(`${O}?key=${S}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:m}]}],generationConfig:{temperature:.1,maxOutputTokens:512,response_mime_type:"application/json"}})});if(!a.ok)return null;const c=(p=(g=(y=(d=(u=(await a.json()).candidates)==null?void 0:u[0])==null?void 0:d.content)==null?void 0:y.parts)==null?void 0:g[0])==null?void 0:p.text;if(!c)return null;const s=c.replace(/```json\n|\n```/g,"").trim();let e;try{e=JSON.parse(s)}catch{const i=c.match(/\{[\s\S]*\}/);if(i)e=JSON.parse(i[0]);else return null}if(e&&(!e.category||e.category==="その他"||e.category==="未分類"||e.category==="Unclassified"||e.category==="雑費")){const l=`${e.item} ${e.description||""}`,i=C(l);i&&(console.log(`Keyword Category Fallback (Chat): ${e.item} -> ${i}`),e.category=i)}return e&&(e.item=I(e.item,e.category)),e}catch(a){return console.error("AIチャット解析エラー:",a),null}}export{j as a,M as b,J as c,k as g,T as i,P as p};
