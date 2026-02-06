import{s as C,d as E}from"./keywordCategoryService-C-gIZgmT.js";const A="AIzaSyBjJIKIrkmlU1qIheuy9gRl8M1Ii-W4oF4",J=!0,I=["gemini-2.0-flash","gemini-2.5-flash","gemini-2.5-pro","gemini-flash-latest","gemini-pro-latest"],Y=`https://generativelanguage.googleapis.com/v1beta/models/${I[0]}:generateContent`,M=e=>`https://generativelanguage.googleapis.com/v1beta/models/${e}:generateContent`;async function G(e,c){var h,y,f,u,n,m,s,t;const l=new Date().toISOString().split("T")[0],$=new Date().getFullYear(),_=`あなたは「CLOVA OCR」のような最高峰の日本語レシート認識エンジンをシミュレートするAIです。
以下のOCRテキストを分析し、高度な構造化データとして抽出してください。

OCRテキスト:
"""
${e}
"""

### 抽出ルール（CLOVA仕様）:
1.  **階層構造化**: 店名、日付、金額、税情報を明確に分離する。
2.  **キーバリュー抽出**: テキストの配置から「項目: 値」の関係を特定する。
3.  **誤字補正**: OCR特有のミス（例: 8とB）を文脈で補正する。

### 出力形式（Strict JSON）:
{
  "summary": {
    "transaction_date": "YYYY-MM-DD" | null,
    "total_amount": number | null,
    "confidence": 0-100
  },
  "store_info": {
    "name": "店舗名",
    "branch": "支店名",
    "tel": "電話番号",
    "address": "住所"
  },
  "payment_info": {
    "method": "cash/credit/other",
    "amount": number
  },
  "tax_info": {
    "tax_amount_8": number,
    "tax_amount_10": number,
    "tax_excluded_amount": number
  },
  "category": {
    "primary": "消耗品費/交際費/旅費交通費/通信費/会議費/雑費/その他",
    "confidence": 0-100
  },
  "items": []
}

**特記事項**:
- **品目明細のスキップ**: 個別の商品明細（items）は抽出不要です。summary, store_info, tax_info, categoryの抽出に集中してください。
- 基準日: ${l} (今日の日付)
- 年補完: ${$}年を優先して解釈してください。
`;try{const r=await fetch(`${Y}?key=${A}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:_}]}],generationConfig:{temperature:.2,maxOutputTokens:2048,response_mime_type:"application/json"}})});if(!r.ok){const x=await r.text();throw console.error("Gemini API Error:",r.status,x),new Error(`Gemini API Error: ${r.status} ${r.statusText} - ${x}`)}const g=(n=(u=(f=(y=(h=(await r.json()).candidates)==null?void 0:h[0])==null?void 0:y.content)==null?void 0:f.parts)==null?void 0:u[0])==null?void 0:n.text;if(!g)throw new Error("AIからの応答が空でした");const i=g.match(/\{[\s\S]*\}/);if(!i)throw new Error("AIの応答からJSONを抽出できませんでした");const a=JSON.parse(i[0]);return a&&a.items&&a.items.forEach(x=>{var w;x.name=C(x.name,((w=a.category)==null?void 0:w.primary)||"")}),a&&(a.transaction_date=((m=a.summary)==null?void 0:m.transaction_date)||"",a.store_name=(s=a.store_info)==null?void 0:s.name,a.total_amount=(t=a.summary)==null?void 0:t.total_amount),a}catch(r){throw console.error("Gemini AI Analysis Exception:",r),r}}async function P(e){for(const c of I)try{return console.log(`Trying Gemini Model: ${c}`),await T(e,c)}catch(l){if(console.warn(`Model ${c} failed:`,l),c===I[I.length-1])throw l}return null}async function T(e,c){var y,f,u,n,m,s,t,r,p;let l="image/jpeg";if(e.includes("data:")){const g=e.match(/data:([^;]+);/);g&&(l=g[1])}const $=e.includes(",")?e.split(",")[1]:e,h=`あなたは「CLOVA OCR」のような最高峰の日本語レシート認識エンジンをシミュレートするAIです。
画像認識と言語理解を統合した「End-to-Endモデル」として振る舞い、以下のルールでデータを抽出してください。

### シミュレーション設定:
1.  **ロゴ解析 & 電話番号推論 (最重要)**:
    - レシート上部のロゴを視覚的に認識し、店名を特定する。
    - **【重要】電話番号からの推論**: もし店名が曖昧な場合、レシート内の電話番号("03-xxxx-xxxx")を検索キーとして、**あなたの内部知識から正しい店舗名（正式名称）を導き出して補完**してください。この「逆引き」ロジックで精度を100%に近づけてください。
2.  **空間・レイアウト解析**:
    - レシートは「行（Line）」ごとに読み取るのではなく、「カラム（列）」の概念を持つこと。
    - 「品名エリア」「単価エリア」「個数エリア」「金額エリア」の垂直方向の並びを理解し、左右の文字が同じ行にあるかを判定する。
3.  **日付厳格化**: レシート印字以外の日付（今日の日付など）を絶対に出力しない。日付不明なら \`null\`。

### 思考プロセス:
1. **店名特定**: ロゴ画像 → テキストOCR → 電話番号逆引き の順で確度を高める。(例: ロゴが "7" だけでも電話番号がセブンのものなら「セブンイレブン」と断定)
2. **日付**:
    - **ターゲット形式**: 「2024年02月04日」「2024/02/04」「2024-02-04」に加え、**「2024年02月04日(日) 10:30」のように曜日や時刻が付くパターン**も対象とする。
    - "YYYY-MM-DD"形式に統一して出力する（時刻は捨てる）。
    - **今日の日付の誤入力厳禁**: レシートに日付が印字されていない場合は \`null\` とする。
3. **金額 (合計)**:
    - **【最重要】視覚的重み**: 「合計」「小計」「対象計」などの**ラベルの右側（または直下）にある、最もフォントサイズが大きく太い数字**を特定する。
    - 単なる最大値ではなく、「合計」というキーワードとの**位置関係（横並び）**を重視する。
    - ￥マークやカンマは除去して数値化する。
4. **明細抽出のスキップ**:
    - **【パフォーマンス・安定性向上のため】個別の商品明細（items）は絶対に抽出しないでください。**
    - \`items\` フィールドは常に空配列 \`[]\` として出力してください。
    - その分、店名、日付、合計金額、税額の抽出精度を極限まで高めてください。

### シミュレーション設定（追加）:
- **手書き・汚れ・折れ**: レシートが不鮮明、手書き、折れている場合でも、文脈から最大限推測する。読み取れない項目は無理に埋めず \`null\` とする。
- **数値形式**: 全ての数字は半角、カンマなしで出力する。

### 出力形式（Strict JSON）:
{
  "summary": {
    "transaction_date": "YYYY-MM-DD" | null,
    "total_amount": number | null,
    "confidence": 0-100
  },
  "store_info": {
    "name": "店舗名（正式名称、株式会社等は省略）",
    "branch": "支店名",
    "tel": "電話番号（ハイフンあり）",
    "address": "住所"
  },
  "payment_info": {
    "method": "cash/credit/paypay/ic/other",
    "amount": number | null
  },
  "tax_info": {
    "tax_amount_8": number | null,
    "tax_amount_10": number | null,
    "tax_excluded_amount": number | null
    // 複数の税率がある場合はここに内訳が入る
  },
  "category": {
    "primary": "消耗品費/交際費/旅費交通費/通信費/会議費/雑費/その他",
    "confidence": 0-100
  },
  "items": [],
  "validation_errors": [
    "合計金額が明細の合計と一致しません (Expected: 1000, Actual: 900)",
    "商品Aの金額計算が合いません"
  ]
}

**特記事項**:
- 年補完: 年が省略されている場合のみ ${new Date().getFullYear()}年を優先。
`;try{const g=M(c),i=await fetch(`${g}?key=${A}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:h},{inline_data:{mime_type:l,data:$}}]}],generationConfig:{temperature:.1,maxOutputTokens:2048,response_mime_type:"application/json"}})});if(!i.ok){if(i.status===404)throw new Error(`Model ${c} not found (404)`);const d=await i.text();throw console.error("Gemini API Error:",i.status,d),new Error(`Gemini API Error: ${i.status} ${i.statusText} - ${d}`)}const a=await i.json();console.log("Gemini Vision API Raw Response:",JSON.stringify(a,null,2));const x=(m=(n=(u=(f=(y=a.candidates)==null?void 0:y[0])==null?void 0:f.content)==null?void 0:u.parts)==null?void 0:n[0])==null?void 0:m.text;if(!x)throw console.warn("Gemini Vision API returned empty text content."),new Error("AIからの応答が空でした");const w=x.match(/\{[\s\S]*\}/);if(!w)throw console.error("Failed to extract JSON from Gemini Vision response:",x),new Error("AIの応答からJSONを抽出できませんでした");const o=JSON.parse(w[0]);if(o){const d=(s=o.category)==null?void 0:s.primary;if(!d||d==="その他"||d==="未分類"||d==="Unclassified"||d==="雑費"){const S=`${((t=o.store_info)==null?void 0:t.name)||""} ${(r=o.items)==null?void 0:r.map(N=>N.name).join(" ")}`,O=E(S);O&&(console.log(`Keyword Category Fallback (Main): ${(p=o.store_info)==null?void 0:p.name} -> ${O}`),o.category?o.category.primary=O:o.category={primary:O,confidence:.8})}}return o&&o.items&&o.items.forEach(d=>{var S;d.name=C(d.name,((S=o.category)==null?void 0:S.primary)||"")}),o&&(o.transaction_date=o.summary.transaction_date||"",o.store_name=o.store_info.name,o.total_amount=o.summary.total_amount),o}catch(g){throw console.error("Gemini Vision AI Analysis Exception:",g),g}}function b(){return!0}function k(){return{enabled:b(),provider:"Google Gemini",model:"gemini-1.5-flash"}}async function D(e){var $,_,h,y,f,u;console.log("🔑 Gemini API Key:",A.substring(0,10)+"...");const c=`あなたは日本の中小企業向け経営コンサルタントです。以下の財務データを分析し、実用的なアドバイスを提供してください。

【財務データ】
期間: ${e.period}
売上高: ¥${e.revenue.toLocaleString()} (前期比: ${e.revenueChange>=0?"+":""}${e.revenueChange.toFixed(1)}%)
経費: ¥${e.expense.toLocaleString()} (前期比: ${e.expenseChange>=0?"+":""}${e.expenseChange.toFixed(1)}%)
利益: ¥${e.profit.toLocaleString()} (前期比: ${e.profitChange>=0?"+":""}${e.profitChange.toFixed(1)}%)
利益率: ${e.revenue>0?(e.profit/e.revenue*100).toFixed(1):0}%
取引件数: ${e.transactionCount}件

【経費カテゴリ（上位）】
${e.topExpenseCategories.map(n=>`- ${n.category}: ¥${n.amount.toLocaleString()} (${n.percentage.toFixed(1)}%)`).join(`
`)}

【売上カテゴリ（上位）】
${e.topIncomeCategories.map(n=>`- ${n.category}: ¥${n.amount.toLocaleString()} (${n.percentage.toFixed(1)}%)`).join(`
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

注意: 日本の中小企業や個人事業主向けに、実行可能で具体的なアドバイスを提供してください。`;let l=null;for(const n of I)try{console.log(`🤖 Gemini AI: モデル「${n}」でアドバイス生成を試行中...`),console.log("🤖 送信データ:",e);const m=M(n),s=await fetch(`${m}?key=${A}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:c}]}],generationConfig:{temperature:.7,topP:.9,topK:40,maxOutputTokens:1500}})});if(console.log(`🤖 Gemini API レスポンスステータス (${n}):`,s.status),!s.ok){const i=await s.json().catch(()=>({}));if(console.error(`❌ モデル「${n}」がエラー:`,s.status,i),s.status===400||s.status===401||s.status===403){const a=(($=i==null?void 0:i.error)==null?void 0:$.message)||"API認証エラー";console.error("❌ API認証エラー:",a),l=new Error(`API認証エラー: ${a}`);break}continue}const t=await s.json();console.log("🤖 Gemini API 生のレスポンス:",t);const r=((u=(f=(y=(h=(_=t.candidates)==null?void 0:_[0])==null?void 0:h.content)==null?void 0:y.parts)==null?void 0:f[0])==null?void 0:u.text)||"";if(console.log("🤖 抽出されたテキスト:",r),!r){console.warn(`モデル「${n}」: テキストが空です`);continue}const p=r.match(/\{[\s\S]*\}/);if(!p){console.warn(`モデル「${n}」: JSONが見つかりません`);continue}const g=JSON.parse(p[0]);return console.log(`✅ Gemini AI (${n}): アドバイス生成完了`,g),g}catch(m){console.error(`❌ モデル「${n}」でエラー:`,m.message),l=m}throw console.error("❌ すべてのモデルでアドバイス生成に失敗しました"),l||new Error("AIアドバイスの生成に失敗しました。しばらくしてから再度お試しください。")}async function v(e){var $,_,h,y,f;const c=new Date().toISOString().split("T")[0],l=`あなたは日本の経理専門家です。ユーザーのチャットメッセージから取引情報を抽出してJSON形式で返してください。
 
 現在の今日の日付: ${c}
 
 チャットメッセージ: "${e}"
 
 ### 抽出ルール:
  1. **品目**: 具体的な内容を抽出（"ランチ" → "昼食代"など）。
  2. **金額**: 数値を抽出。万円、千円などの単位も考慮。
  3. **日付**: "昨日"、"一昨日"、"先週の金曜日"などの相対日時を、今日(${c})を基準に"YYYY-MM-DD"形式に変換。指定がなければ"${c}"とする。
  4. **カテゴリルール**: 以下のカテゴリから最も適切なものを一意に選択。
     - **接待交際費 (優先)**: 取引先とのランチ、ディナー、飲み会、レストラン、居酒屋、会食、手土産、ゴルフ、慶弔費。※一人の食事でも、仕事に関連する場合はここ。
     - **会議費**: 打ち合わせ時のカフェ代、会議室利用料、弁当代。
     - **旅費交通費**: 電車、バス、タクシー、ガソリン、駐車場、宿泊費。
     - **消耗品費**: 文房具、PC周辺機器(<10万円)、日用雑貨、作業用具。
     - **通信費**: 携帯電話、インターネット、切手、配送料。
     - **水道光熱費**: 電気、ガス、水道。
     - **新聞図書費**: 書籍、新聞、雑誌、セミナー参加費。
     - **広告宣伝費**: 広告掲載、チラシ、Web広告。
     - **外注費**: 業務委託、デザイン料、ライティング料。
     - **福利厚生費**: 従業員の慰安、健康診断、慶弔見舞金。
     - **地代家賃**: 事務所家賃、月極駐車場、コワーキングスペース。
     - **租税公課**: 印紙代、固定資産税、自動車税。
     - **支払手数料**: 振込手数料、仲介手数料、システム利用料。
     - **仕入**: 商品の仕入れ、原材料。
     - **給与**: 会社からの給料、賞与、残業代、手当など。
     - **売上**: 商品やサービスの対価として受け取ったお金、副業収入、業務委託料。
     - **雑費**: その他分類できない少額の費用。
 
 ### 重要: 収支区分の判定ルール
  - **売上、収入、給料、給与、賞与、ボーナス**などは必ず "type": "income" にしてください。
  - それ以外の経費、支払いは "type": "expense" です。
  - 「売り上げ」「入金」「受け取った」などの言葉がある場合は "income" です。

 以下のJSON形式で回答してください（JSONのみ、説明不要）:
 {
   "item": "品目名",
   "amount": 数値,
   "date": "YYYY-MM-DD",
   "category": "カテゴリ名",
   "type": "income または expense",
   "description": "補足説明"
 }`;try{const u=await fetch(`${Y}?key=${A}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:l}]}],generationConfig:{temperature:.1,maxOutputTokens:512,response_mime_type:"application/json"}})});if(!u.ok)return null;const m=(f=(y=(h=(_=($=(await u.json()).candidates)==null?void 0:$[0])==null?void 0:_.content)==null?void 0:h.parts)==null?void 0:y[0])==null?void 0:f.text;if(!m)return null;const s=m.replace(/```json\n|\n```/g,"").trim();let t;try{t=JSON.parse(s)}catch{const p=m.match(/\{[\s\S]*\}/);if(p)t=JSON.parse(p[0]);else return null}if(t&&(!t.category||t.category==="その他"||t.category==="未分類"||t.category==="Unclassified"||t.category==="雑費")){const r=`${t.item} ${t.description||""}`,p=E(r);p&&(console.log(`Keyword Category Fallback (Chat): ${t.item} -> ${p}`),t.category=p)}return t&&(t.item=C(t.item,t.category)),t}catch(u){return console.error("AIチャット解析エラー:",u),null}}export{J as GEMINI_API_KEY_LOADED,G as analyzeReceiptWithAI,P as analyzeReceiptWithVision,D as generateBusinessAdvice,k as getAIStatus,b as isAIEnabled,v as parseChatTransactionWithAI};
