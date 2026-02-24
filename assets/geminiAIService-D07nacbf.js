import{s as A,d as C}from"./keywordCategoryService-9yZ-pShI.js";const $="AIzaSyCf0pSoeaNdpufVKw3mNeNU66oIeCTmqkQ",D=!0,x=["gemini-2.0-flash","gemini-1.5-flash-latest","gemini-1.5-pro-latest","gemini-flash-latest","gemini-pro-latest"],N=`https://generativelanguage.googleapis.com/v1beta/models/${x[0]}:generateContent`,E=r=>`https://generativelanguage.googleapis.com/v1beta/models/${r}:generateContent`;async function k(r,t){var f,p,y,o,w,l,d,n;const e=new Date().toISOString().split("T")[0],_=new Date().getFullYear(),g=`あなたは「CLOVA OCR」のような最高峰の日本語レシート認識エンジンをシミュレートするAIです。
以下のOCRテキストを分析し、高度な構造化データとして抽出してください。

OCRテキスト:
"""
${r}
"""

### 抽出ルール（CLOVA仕様）:
1.  **階層構造化**: 店名、日付、金額、税情報を明確に分離する。
2.  **キーバリュー抽出**: テキストの配置から「項目: 値」の関係を特定する。
3.  **誤字補正**: OCR特有のミス（例: 8とB）を文脈で補正する。

### 勘定科目（category.primary）の候補:
旅費交通費, 通信費, 消耗品費, 接待交際費, 会議費, 水道光熱費, 役員報酬, 広告宣伝費, 外注費, 新聞図書費, 修繕費, 支払手数料, 福利厚生費, 地代家賃, 租税公課, 保険料, 食費, 雑費, 仕入, 売上, 業務委託収入, 給与, 燃料費, 設備費, 車両費, 雑損益

### 取引項目（items.name）の候補:
売上, 役員報酬, コンビニ買い物, 飲食代, 事務用品, コーヒー代, 新聞代, 書籍代, 切手代, 宅配便代, 電気代, 家賃, インターネット接続料, 電話料金, 携帯代, 水道代, ガス代, 出張費, 交通費, 電車代, 燃料代, 修理代, 高速道路料金, 固定資産税, 自動車税, 印紙税, チラシ作成費, ウェブ広告費, 看板設置費, 贈答品代, 火災保険料, 生命保険料, 振込手数料, 税理士報酬, デザイン委託費, システム開発費, 業務ツール, サブスク, 少額費用, 為替, 暗号資産, その他

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
    "primary": "上記の【勘定科目】候補から選択",
    "confidence": 0-100
  },
  "items": []
}

**特記事項**:
- **品目明細のスキップ**: 個別の商品明細（items）は抽出不要です。summary, store_info, tax_info, categoryの抽出に集中してください。
- 基準日: ${e} (今日の日付)
- 年補完: ${_}年を優先して解釈してください。
- 項目名の抽出: ユーザーが「スタバ」「タクシー」「ランチ」などの具体的な店名や名称を挙げた場合は、それを優先して抽出してください。無理に標準的な名称に変換しないでください。
`;try{const s=await fetch(`${N}?key=${$}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:g}]}],generationConfig:{temperature:.2,maxOutputTokens:2048,response_mime_type:"application/json"}})});if(!s.ok){const b=await s.text();throw console.error("Gemini API Error:",s.status,b),new Error(`Gemini API Error: ${s.status} ${s.statusText} - ${b}`)}const m=(w=(o=(y=(p=(f=(await s.json()).candidates)==null?void 0:f[0])==null?void 0:p.content)==null?void 0:y.parts)==null?void 0:o[0])==null?void 0:w.text;if(!m)throw new Error("AIからの応答が空でした");const u=m.match(/\{[\s\S]*\}/);if(!u)throw new Error("AIの応答からJSONを抽出できませんでした");const a=JSON.parse(u[0]);return a&&a.items&&a.items.forEach(b=>{var S;b.name=A(b.name,((S=a.category)==null?void 0:S.primary)||"")}),a&&(a.transaction_date=((l=a.summary)==null?void 0:l.transaction_date)||"",a.store_name=(d=a.store_info)==null?void 0:d.name,a.total_amount=(n=a.summary)==null?void 0:n.total_amount),a}catch(s){throw console.error("Gemini AI Analysis Exception:",s),s}}async function G(r){for(const t of x)try{return console.log(`Trying Gemini Model: ${t}`),await Y(r,t)}catch(e){if(console.warn(`Model ${t} failed:`,e),t===x[x.length-1])throw e}return null}async function Y(r,t){var p,y,o,w,l,d,n,s,c;let e="image/jpeg";if(r.includes("data:")){const m=r.match(/data:([^;]+);/);m&&(e=m[1])}const _=r.includes(",")?r.split(",")[1]:r,f=`あなたは「CLOVA OCR」のような最高峰の日本語レシート認識エンジンをシミュレートするAIです。
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

### 勘定科目（category.primary）の候補:
旅費交通費, 通信費, 消耗品費, 接待交際費, 会議費, 水道光熱費, 役員報酬, 広告宣伝費, 外注費, 新聞図書費, 修繕費, 支払手数料, 福利厚生費, 地代家賃, 租税公課, 保険料, 食費, 雑費, 仕入, 売上, 業務委託収入, 給与, 燃料費, 設備費, 車両費, 雑損益

### 取引項目（items.name）の候補:
売上, 役員報酬, コンビニ買い物, 飲食代, 事務用品, コーヒー代, 新聞代, 書籍代, 切手代, 宅配便代, 電気代, 家賃, インターネット接続料, 電話料金, 携帯代, 水道代, ガス代, 出張費, 交通費, 電車代, 燃料代, 修理代, 高速道路料金, 固定資産税, 自動車税, 印紙税, チラシ作成費, ウェブ広告費, 看板設置費, 贈答品代, 火災保険料, 生命保険料, 振込手数料, 税理士報酬, デザイン委託費, システム開発費, 業務ツール, サブスク, 少額費用, 為替, 暗号資産, その他

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
  },
  "category": {
    "primary": "上記の【勘定科目】候補から選択",
    "confidence": 0-100
  },
  "items": [],
  "validation_errors": []
}

**特記事項**:
- 年補完: 年が省略されている場合のみ ${new Date().getFullYear()}年を優先。
`;try{const m=E(t),u=await fetch(`${m}?key=${$}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:f},{inline_data:{mime_type:e,data:_}}]}],generationConfig:{temperature:.1,maxOutputTokens:2048,response_mime_type:"application/json"}})});if(!u.ok){if(u.status===404)throw new Error(`Model ${t} not found (404)`);const h=await u.text();throw console.error("Gemini API Error:",u.status,h),new Error(`Gemini API Error: ${u.status} ${u.statusText} - ${h}`)}const a=await u.json();console.log("Gemini Vision API Raw Response:",JSON.stringify(a,null,2));const b=(l=(w=(o=(y=(p=a.candidates)==null?void 0:p[0])==null?void 0:y.content)==null?void 0:o.parts)==null?void 0:w[0])==null?void 0:l.text;if(!b)throw console.warn("Gemini Vision API returned empty text content."),new Error("AIからの応答が空でした");const S=b.match(/\{[\s\S]*\}/);if(!S)throw console.error("Failed to extract JSON from Gemini Vision response:",b),new Error("AIの応答からJSONを抽出できませんでした");const i=JSON.parse(S[0]);if(i){const h=(d=i.category)==null?void 0:d.primary;if(!h||h==="その他"||h==="未分類"||h==="Unclassified"||h==="雑費"){const O=`${((n=i.store_info)==null?void 0:n.name)||""} ${(s=i.items)==null?void 0:s.map(T=>T.name).join(" ")}`,I=C(O);I&&(console.log(`Keyword Category Fallback (Main): ${(c=i.store_info)==null?void 0:c.name} -> ${I}`),i.category?i.category.primary=I:i.category={primary:I,confidence:.8})}}return i&&i.items&&i.items.forEach(h=>{var O;h.name=A(h.name,((O=i.category)==null?void 0:O.primary)||"")}),i&&(i.transaction_date=i.summary.transaction_date||"",i.store_name=i.store_info.name,i.total_amount=i.summary.total_amount),i}catch(m){throw console.error("Gemini Vision AI Analysis Exception:",m),m}}function M(){return!0}function v(){return{enabled:M(),provider:"Google Gemini",model:"gemini-1.5-flash"}}async function R(r){var _,g,f,p,y;const t=new Date().toISOString().split("T")[0],e=`あなたは日本の経理専門家です。ユーザーのチャットメッセージから取引情報を抽出してJSON形式で返してください。
 
 現在の今日の日付: ${t}
 
 チャットメッセージ: "${r}"
 
 ### 抽出ルール:
  1. **品目**: 具体的な内容を抽出（"ランチ" → "昼食代"など）。
  2. **金額**: 数値を抽出。万円、千円などの単位も考慮。
  3. **日付**: "昨日"、"一昨日"、"先週の金曜日"などの相対日時を、今日(${t})を基準に"YYYY-MM-DD"形式に変換。指定がなければ"${t}"とする。
  4. **カテゴリルール**: 以下のカテゴリから最も適切なものを一意に選択。
  ### 勘定科目の候補:
  旅費交通費, 通信費, 消耗品費, 接待交際費, 会議費, 水道光熱費, 役員報酬, 広告宣伝費, 外注費, 新聞図書費, 修繕費, 支払手数料, 福利厚生費, 地代家賃, 租税公課, 保険料, 食費, 雑費, 仕入, 売上, 業務委託収入, 給与, 燃料費, 設備費, 車両費, 雑損益

  ### 取引項目の候補:
  売上, 役員報酬, コンビニ買い物, 飲食代, 事務用品, コーヒー代, 新聞代, 書籍代, 切手代, 宅配便代, 電気代, 家賃, インターネット接続料, 電話料金, 携帯代, 水道代, ガス代, 出張費, 交通費, 電車代, 燃料代, 修理代, 高速道路料金, 固定資産税, 自動車税, 印紙税, チラシ作成費, ウェブ広告費, 看板設置費, 贈答品代, 火災保険料, 生命保険料, 振込手数料, 税理士報酬, デザイン委託費, システム開発費, 業務ツール, サブスク, 少額費用, 為替, 暗号資産, その他

  ### 重要: 収支区分の判定ルール
   - **売上、収入、給料、給与、賞与、ボーナス**などは必ず "type": "income" にしてください。
   - それ以外の経費、支払いは "type": "expense" です。
   - 「売り上げ」「入金」「受け取った」などの言葉がある場合は "income" です。

  以下のJSON形式で回答してください（JSONのみ、説明不要）:
  {
    "item": "具体的な取引内容（例：スタバ、タクシー代、ランチなど）。ユーザーの表現を尊重してください。",
    "amount": 数値,
    "date": "YYYY-MM-DD",
    "category": "上記の【勘定科目】候補から選択",
    "type": "income または expense",
    "description": "具体的な店名や詳細な補足説明"
  }
`;try{const o=await fetch(`${N}?key=${$}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:e}]}],generationConfig:{temperature:.1,maxOutputTokens:512,response_mime_type:"application/json"}})});if(!o.ok)return null;const l=(y=(p=(f=(g=(_=(await o.json()).candidates)==null?void 0:_[0])==null?void 0:g.content)==null?void 0:f.parts)==null?void 0:p[0])==null?void 0:y.text;if(!l)return null;const d=l.replace(/```json\n|\n```/g,"").trim();let n;try{n=JSON.parse(d)}catch{const c=l.match(/\{[\s\S]*\}/);if(c)n=JSON.parse(c[0]);else return null}if(n&&(!n.category||n.category==="その他"||n.category==="未分類"||n.category==="Unclassified"||n.category==="雑費")){const s=`${n.item} ${n.description||""}`,c=C(s);c&&(console.log(`Keyword Category Fallback (Chat): ${n.item} -> ${c}`),n.category=c)}return n&&(n.item=A(n.item,n.category)),n}catch(o){return console.error("AIチャット解析エラー:",o),null}}async function V(r){for(const t of x)try{console.log(`Trying P&L analysis with model (Vision): ${t}`);const e=await J(t,void 0,r);if(e)return e}catch(e){if(console.warn(`Model ${t} failed for P&L Vision:`,e),t===x[x.length-1])throw e}return null}async function J(r,t,e){var n,s,c,m,u;const _=new Date().getFullYear(),g=!!e,f=g?`あなたは日本の税理士レベルの視覚理解力を持つAIです。
画像から損益計算書（P&L）を読み取り、主要な財務データを抽出してください。

### コンテキスト:
- 表の構造（特に「科目名」と「当期実績/当期金額」の列）を正確に特定してください。
- 漢字の読み間違い（例: 費と賃、売と完など）に注意してください。
- 単位（千円、百万円など）が指定されている場合は、必ず円単位に換算してください。
- 負の数値（例: △100、▲100、(100)）は、マイナス記号を付けて返してください。

### 抽出の優先順位:
1. 売上高: 「売上高」「完成工事高」「営業収益」
2. 売上原価: 「売上原価」「原材料費」「仕入高」
3. 販管費: 「販売費及び一般管理費」「経費合計」
4. 営業外収益/費用: それぞれの合計金額
5. 特別利益/損失: それぞれの合計金額
6. 当期純利益: 最終的な純利益
7. 貸借対照表（BS）項目（もしあれば）: 「純資産合計（自己資本）」「資産合計」「負債合計」

### 出力形式（Strict JSON）:
{
  "year": number,
  "revenue": number,
  "cost_of_sales": number,
  "operating_expenses": number,
  "non_operating_income": number,
  "non_operating_expenses": number,
  "extraordinary_income": number,
  "extraordinary_loss": number,
  "income_before_tax": number,
  "net_income": number,
  "net_assets_total": number | null,
  "assets_total": number | null,
  "liabilities_total": number | null,
  "assets_current_cash": number | null,
  "assets_current_receivable": number | null,
  "assets_current_inventory": number | null,
  "assets_fixed_total": number | null,
  "liabilities_current_payable": number | null,
  "liabilities_short_term_loans": number | null,
  "liabilities_long_term_loans": number | null,
  "net_assets_capital": number | null,
  "net_assets_retained_earnings": number | null,
  "category_breakdown": [
    { "category": "カテゴリ名", "amount": 数値 }
  ],
  "confidence": 0-100
}

年度補完: 書類内に年度の記載がない場合は ${_-1} または ${_} と推測してください。`:`あなたは日本の税理士・会計士レベルの知識を持つAIです。
以下のOCRテキストから損益計算書（P&L）の数値を抽出し、JSON形式で返してください。

OCRテキスト:
"""
${t}
"""

### 抽出の優先順位とヒント:
1. **対象年度**: 「2024年3月期」「令和5年度」「第XX期」などの記述から西暦4桁を特定。
2. **売上高**: 「売上高」「完成工事高」「営業収益」など。
3. **売上原価**: 「売上原価」「完成工事原価」など。
4. **販売費及び一般管理費**: 「販売費及び一般管理費」「販管費」「経費合計」など。
5. **営業利益**: (売上 - 原価 - 販管費)。「営業利益」または「営業損失」(マイナス)。
6. **営業外収益**: 「営業外収益」の合計。
7. **営業外費用**: 「営業外費用」の合計。
8. **特別利益**: 「特別利益」の合計。
9. **特別損失**: 「特別損失」の合計。
10. **税引前当期純利益**: 「税引前当期純利益」または「税金等調整前当期純利益」。
11. **当期純利益**: 「当期純利益」または「当期純損失」。
12. **貸借対照表（BS）項目（重要）**: OCRテキスト内に「資産合計」「負債合計」「純資産合計（または自己資本）」などの記載がある場合、それらも抽出してください。特に個人事業主の「青色申告決算書」には通常含まれています。

### 注意事項:
- 金額が「千円」「百万円」単位の場合は必ず円単位に換算してください。
- 負の数値（例: △100、▲100、(100)）はマイナスを付けてください。
- 数値が見当たらない項目は 0 ではなく null を返してください。

### 出力形式（Strict JSON）:
{
  "year": number,
  "revenue": number,
  "cost_of_sales": number,
  "operating_expenses": number,
  "non_operating_income": number,
  "non_operating_expenses": number,
  "extraordinary_income": number,
  "extraordinary_loss": number,
  "income_before_tax": number,
  "net_income": number,
  "net_assets_total": number | null,
  "assets_total": number | null,
  "liabilities_total": number | null,
  "assets_current_cash": number | null,
  "assets_current_receivable": number | null,
  "assets_current_inventory": number | null,
  "assets_fixed_total": number | null,
  "liabilities_current_payable": number | null,
  "liabilities_short_term_loans": number | null,
  "liabilities_long_term_loans": number | null,
  "net_assets_capital": number | null,
  "net_assets_retained_earnings": number | null,
  "category_breakdown": [
    { "category": "カテゴリ名", "amount": 数値 }
  ],
  "confidence": 0-100
}

年度補完: 年度・期間が不明な場合は ${_-1} または ${_} と推測してください。`,p=E(r),y=[{text:f}];if(g){let a="image/jpeg";if(e.includes("data:")){const S=e.match(/data:([^;]+);/);S&&(a=S[1])}const b=e.includes(",")?e.split(",")[1]:e;y.push({inline_data:{mime_type:a,data:b}})}const o=await fetch(`${p}?key=${$}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:y}],generationConfig:{temperature:.1,response_mime_type:"application/json"}})});if(!o.ok){const a=await o.text();throw console.error(`Gemini API Error (${r}):`,o.status,a),new Error(`API Error ${o.status}: ${a}`)}const l=(u=(m=(c=(s=(n=(await o.json()).candidates)==null?void 0:n[0])==null?void 0:s.content)==null?void 0:c.parts)==null?void 0:m[0])==null?void 0:u.text;if(!l)throw console.error(`Empty response from model ${r}`),new Error(`Empty response from model ${r}`);console.log(`AI Response Text (${r}):`,l);const d=l.match(/\{[\s\S]*\}/);if(!d)throw console.error("Failed to extract JSON from AI response:",l),new Error("Invalid JSON format in AI response");return JSON.parse(d[0])}async function L(r){for(const t of x)try{console.log(`Trying Balance Sheet analysis with model: ${t}`);const e=await j(t,r);if(e)return e}catch(e){if(console.warn(`Model ${t} failed for Balance Sheet Vision:`,e),t===x[x.length-1])throw e}return null}async function j(r,t){var n,s,c,m,u;const e=new Date().getFullYear(),_=`あなたは日本の税理士レベルの視覚理解力を持つAIです。
画像から貸借対照表（BS）を読み取り、主要な財務データを抽出してください。

### コンテキスト:
- 表の構造（資産の部、負債の部、純資産の部）を正確に特定してください。
- 単位（千円、百万円など）が指定されている場合は、円単位に換算してください。
- 負の数値（例: △100、(100)）は、マイナス記号を付けて返してください。

### 抽出項目（JSONキー）:
1. **year**: 対象年度（西暦4桁）
2. **assets_current_cash**: 現金及び預金
3. **assets_current_total**: 流動資産合計
4. **assets_total**: 資産の部合計
5. **liabilities_total**: 負債の部合計
6. **net_assets_capital**: 資本金
7. **net_assets_retained_earnings**: 繰越利益剰余金
8. **net_assets_retained_earnings_total**: 利益剰余金合計 / その他利益剰余金合計
9. **net_assets_shareholders_equity**: 株主資本合計
10. **net_assets_total**: 純資産の部合計
11. **liabilities_and_net_assets_total**: 負債及び純資産の部合計

### 出力形式（Strict JSON）:
{
  "year": number,
  "assets_current_cash": number,
  "assets_current_receivable": number,
  "assets_current_inventory": number,
  "assets_current_total": number,
  "assets_fixed_total": number,
  "assets_total": number,
  "liabilities_current_payable": number,
  "liabilities_short_term_loans": number,
  "liabilities_long_term_loans": number,
  "liabilities_total": number,
  "net_assets_capital": number,
  "net_assets_retained_earnings": number,
  "net_assets_retained_earnings_total": number,
  "net_assets_shareholders_equity": number,
  "net_assets_total": number,
  "liabilities_and_net_assets_total": number,
  "confidence": 0-100
}

年度補完: ${e-1}年または${e}年を優先。`,g=E(r),f=[{text:_}];let p="image/jpeg";if(t.includes("data:")){const a=t.match(/data:([^;]+);/);a&&(p=a[1])}const y=t.includes(",")?t.split(",")[1]:t;f.push({inline_data:{mime_type:p,data:y}});const o=await fetch(`${g}?key=${$}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:f}],generationConfig:{temperature:.1,response_mime_type:"application/json"}})});if(!o.ok){const a=await o.text();throw console.error(`Gemini API Error (BS - ${r}):`,o.status,a),new Error(`API Error ${o.status}: ${a}`)}const l=(u=(m=(c=(s=(n=(await o.json()).candidates)==null?void 0:n[0])==null?void 0:s.content)==null?void 0:c.parts)==null?void 0:m[0])==null?void 0:u.text;if(!l)throw new Error(`Empty response from model ${r}`);const d=l.match(/\{[\s\S]*\}/);if(!d)throw new Error("Invalid JSON format in AI response");return JSON.parse(d[0])}export{D as GEMINI_API_KEY_LOADED,L as analyzeBSDocumentWithVision,V as analyzePLDocumentWithVision,k as analyzeReceiptWithAI,G as analyzeReceiptWithVision,v as getAIStatus,M as isAIEnabled,R as parseChatTransactionWithAI};
