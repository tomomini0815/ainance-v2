import{s as A,d as C}from"./keywordCategoryService-CeSB7JfV.js";const $="AIzaSyCojD6WNfryAIw-hiGr-IH8jaPAlMzpQs0",D=!0,x=["gemini-2.0-flash","gemini-2.5-flash","gemini-2.5-pro","gemini-flash-latest","gemini-pro-latest"],N=`https://generativelanguage.googleapis.com/v1beta/models/${x[0]}:generateContent`,E=r=>`https://generativelanguage.googleapis.com/v1beta/models/${r}:generateContent`;async function k(r,e){var f,d,_,a,b,c,y,n;const t=new Date().toISOString().split("T")[0],p=new Date().getFullYear(),w=`あなたは「CLOVA OCR」のような最高峰の日本語レシート認識エンジンをシミュレートするAIです。
以下のOCRテキストを分析し、高度な構造化データとして抽出してください。

OCRテキスト:
"""
${r}
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
    "primary": "消耗品費/交際費/旅費交通費/通信費/会議費/役員報酬/雑費/その他",
    "confidence": 0-100
  },
  "items": []
}

**特記事項**:
- **品目明細のスキップ**: 個別の商品明細（items）は抽出不要です。summary, store_info, tax_info, categoryの抽出に集中してください。
- 基準日: ${t} (今日の日付)
- 年補完: ${p}年を優先して解釈してください。
`;try{const s=await fetch(`${N}?key=${$}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:w}]}],generationConfig:{temperature:.2,maxOutputTokens:2048,response_mime_type:"application/json"}})});if(!s.ok){const h=await s.text();throw console.error("Gemini API Error:",s.status,h),new Error(`Gemini API Error: ${s.status} ${s.statusText} - ${h}`)}const m=(b=(a=(_=(d=(f=(await s.json()).candidates)==null?void 0:f[0])==null?void 0:d.content)==null?void 0:_.parts)==null?void 0:a[0])==null?void 0:b.text;if(!m)throw new Error("AIからの応答が空でした");const u=m.match(/\{[\s\S]*\}/);if(!u)throw new Error("AIの応答からJSONを抽出できませんでした");const o=JSON.parse(u[0]);return o&&o.items&&o.items.forEach(h=>{var S;h.name=A(h.name,((S=o.category)==null?void 0:S.primary)||"")}),o&&(o.transaction_date=((c=o.summary)==null?void 0:c.transaction_date)||"",o.store_name=(y=o.store_info)==null?void 0:y.name,o.total_amount=(n=o.summary)==null?void 0:n.total_amount),o}catch(s){throw console.error("Gemini AI Analysis Exception:",s),s}}async function G(r){for(const e of x)try{return console.log(`Trying Gemini Model: ${e}`),await Y(r,e)}catch(t){if(console.warn(`Model ${e} failed:`,t),e===x[x.length-1])throw t}return null}async function Y(r,e){var d,_,a,b,c,y,n,s,l;let t="image/jpeg";if(r.includes("data:")){const m=r.match(/data:([^;]+);/);m&&(t=m[1])}const p=r.includes(",")?r.split(",")[1]:r,f=`あなたは「CLOVA OCR」のような最高峰の日本語レシート認識エンジンをシミュレートするAIです。
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
    "primary": "消耗品費/交際費/旅費交通費/通信費/会議費/役員報酬/雑費/その他",
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
`;try{const m=E(e),u=await fetch(`${m}?key=${$}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:f},{inline_data:{mime_type:t,data:p}}]}],generationConfig:{temperature:.1,maxOutputTokens:2048,response_mime_type:"application/json"}})});if(!u.ok){if(u.status===404)throw new Error(`Model ${e} not found (404)`);const g=await u.text();throw console.error("Gemini API Error:",u.status,g),new Error(`Gemini API Error: ${u.status} ${u.statusText} - ${g}`)}const o=await u.json();console.log("Gemini Vision API Raw Response:",JSON.stringify(o,null,2));const h=(c=(b=(a=(_=(d=o.candidates)==null?void 0:d[0])==null?void 0:_.content)==null?void 0:a.parts)==null?void 0:b[0])==null?void 0:c.text;if(!h)throw console.warn("Gemini Vision API returned empty text content."),new Error("AIからの応答が空でした");const S=h.match(/\{[\s\S]*\}/);if(!S)throw console.error("Failed to extract JSON from Gemini Vision response:",h),new Error("AIの応答からJSONを抽出できませんでした");const i=JSON.parse(S[0]);if(i){const g=(y=i.category)==null?void 0:y.primary;if(!g||g==="その他"||g==="未分類"||g==="Unclassified"||g==="雑費"){const O=`${((n=i.store_info)==null?void 0:n.name)||""} ${(s=i.items)==null?void 0:s.map(T=>T.name).join(" ")}`,I=C(O);I&&(console.log(`Keyword Category Fallback (Main): ${(l=i.store_info)==null?void 0:l.name} -> ${I}`),i.category?i.category.primary=I:i.category={primary:I,confidence:.8})}}return i&&i.items&&i.items.forEach(g=>{var O;g.name=A(g.name,((O=i.category)==null?void 0:O.primary)||"")}),i&&(i.transaction_date=i.summary.transaction_date||"",i.store_name=i.store_info.name,i.total_amount=i.summary.total_amount),i}catch(m){throw console.error("Gemini Vision AI Analysis Exception:",m),m}}function M(){return!0}function R(){return{enabled:M(),provider:"Google Gemini",model:"gemini-1.5-flash"}}async function V(r){var p,w,f,d,_;const e=new Date().toISOString().split("T")[0],t=`あなたは日本の経理専門家です。ユーザーのチャットメッセージから取引情報を抽出してJSON形式で返してください。
 
 現在の今日の日付: ${e}
 
 チャットメッセージ: "${r}"
 
 ### 抽出ルール:
  1. **品目**: 具体的な内容を抽出（"ランチ" → "昼食代"など）。
  2. **金額**: 数値を抽出。万円、千円などの単位も考慮。
  3. **日付**: "昨日"、"一昨日"、"先週の金曜日"などの相対日時を、今日(${e})を基準に"YYYY-MM-DD"形式に変換。指定がなければ"${e}"とする。
  4. **カテゴリルール**: 以下のカテゴリから最も適切なものを一意に選択。
     - **役員報酬 (マイクロ法人)**: 代表者（社長・取締役）への報酬支払い。
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
 }`;try{const a=await fetch(`${N}?key=${$}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:t}]}],generationConfig:{temperature:.1,maxOutputTokens:512,response_mime_type:"application/json"}})});if(!a.ok)return null;const c=(_=(d=(f=(w=(p=(await a.json()).candidates)==null?void 0:p[0])==null?void 0:w.content)==null?void 0:f.parts)==null?void 0:d[0])==null?void 0:_.text;if(!c)return null;const y=c.replace(/```json\n|\n```/g,"").trim();let n;try{n=JSON.parse(y)}catch{const l=c.match(/\{[\s\S]*\}/);if(l)n=JSON.parse(l[0]);else return null}if(n&&(!n.category||n.category==="その他"||n.category==="未分類"||n.category==="Unclassified"||n.category==="雑費")){const s=`${n.item} ${n.description||""}`,l=C(s);l&&(console.log(`Keyword Category Fallback (Chat): ${n.item} -> ${l}`),n.category=l)}return n&&(n.item=A(n.item,n.category)),n}catch(a){return console.error("AIチャット解析エラー:",a),null}}async function L(r){for(const e of x)try{console.log(`Trying P&L analysis with model (Vision): ${e}`);const t=await J(e,void 0,r);if(t)return t}catch(t){if(console.warn(`Model ${e} failed for P&L Vision:`,t),e===x[x.length-1])throw t}return null}async function J(r,e,t){var n,s,l,m,u;const p=new Date().getFullYear(),w=!!t,f=w?`あなたは日本の税理士レベルの視覚理解力を持つAIです。
画像から損益計算書（P&L）を読み取り、主要な財務データを抽出してください。

### コンテキスト:
- 表の構造（特に「当期実績」の列）を正確に特定してください。
- 漢字の読み間違い（例: 費と賃など）に注意してください。
- 単位（千円、百万円など）が指定されている場合は、円単位に換算してください。

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
  "category_breakdown": [
    { "category": "カテゴリ名", "amount": 数値 }
  ],
  "confidence": 0-100
}

年度補完: ${p-1}年または${p}年を優先。`:`あなたは日本の税理士・会計士レベルの知識を持つAIです。
以下のOCRテキストから損益計算書（P&L）の数値を抽出し、JSON形式で返してください。

OCRテキスト:
"""
${e}
"""

### 抽出項目:
1. **対象年度**: 決算書の対象期間（例: 2024年度、令和6年度など）から西暦4桁を特定。
2. **売上高**: 売上、収入金額。
3. **売上原価**: 仕入など。
4. **販売費及び一般管理費**: 経費の合計（販管費）。
5. **営業利益**: (売上 - 原価 - 販管費)。
6. **営業外損益**: 受取利息、支払利息など。
7. **特別損益**: 固定資産売却益、火災損失など。
8. **税引前当期純利益**: (営業利益 + 営業外損益 + 特別損益)。
9. **当期純利益**: 最終的な純利益。
10. **経費内訳**: 主な経費カテゴリ名と金額。

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
  "category_breakdown": [
    { "category": "カテゴリ名", "amount": 数値 }
  ],
  "confidence": 0-100
}

注意: 年度が不明な場合は ${p-1} または ${p} と推測してください。金額はカンマを除去した数値で返してください。`,d=E(r),_=[{text:f}];if(w){let o="image/jpeg";if(t.includes("data:")){const S=t.match(/data:([^;]+);/);S&&(o=S[1])}const h=t.includes(",")?t.split(",")[1]:t;_.push({inline_data:{mime_type:o,data:h}})}const a=await fetch(`${d}?key=${$}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:_}],generationConfig:{temperature:.1,response_mime_type:"application/json"}})});if(!a.ok){const o=await a.text();throw console.error(`Gemini API Error (${r}):`,a.status,o),new Error(`API Error ${a.status}: ${o}`)}const c=(u=(m=(l=(s=(n=(await a.json()).candidates)==null?void 0:n[0])==null?void 0:s.content)==null?void 0:l.parts)==null?void 0:m[0])==null?void 0:u.text;if(!c)throw new Error(`Empty response from model ${r}`);const y=c.match(/\{[\s\S]*\}/);if(!y)throw console.error("Failed to extract JSON from AI response:",c),new Error("Invalid JSON format in AI response");return JSON.parse(y[0])}async function z(r){for(const e of x)try{console.log(`Trying Balance Sheet analysis with model: ${e}`);const t=await j(e,r);if(t)return t}catch(t){if(console.warn(`Model ${e} failed for Balance Sheet Vision:`,t),e===x[x.length-1])throw t}return null}async function j(r,e){var n,s,l,m,u;const t=new Date().getFullYear(),p=`あなたは日本の税理士レベルの視覚理解力を持つAIです。
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
  "assets_current_total": number,
  "assets_total": number,
  "liabilities_total": number,
  "net_assets_capital": number,
  "net_assets_retained_earnings": number,
  "net_assets_retained_earnings_total": number,
  "net_assets_shareholders_equity": number,
  "net_assets_total": number,
  "liabilities_and_net_assets_total": number,
  "confidence": 0-100
}

年度補完: ${t-1}年または${t}年を優先。`,w=E(r),f=[{text:p}];let d="image/jpeg";if(e.includes("data:")){const o=e.match(/data:([^;]+);/);o&&(d=o[1])}const _=e.includes(",")?e.split(",")[1]:e;f.push({inline_data:{mime_type:d,data:_}});const a=await fetch(`${w}?key=${$}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:f}],generationConfig:{temperature:.1,response_mime_type:"application/json"}})});if(!a.ok){const o=await a.text();throw console.error(`Gemini API Error (BS - ${r}):`,a.status,o),new Error(`API Error ${a.status}: ${o}`)}const c=(u=(m=(l=(s=(n=(await a.json()).candidates)==null?void 0:n[0])==null?void 0:s.content)==null?void 0:l.parts)==null?void 0:m[0])==null?void 0:u.text;if(!c)throw new Error(`Empty response from model ${r}`);const y=c.match(/\{[\s\S]*\}/);if(!y)throw new Error("Invalid JSON format in AI response");return JSON.parse(y[0])}export{D as GEMINI_API_KEY_LOADED,z as analyzeBSDocumentWithVision,L as analyzePLDocumentWithVision,k as analyzeReceiptWithAI,G as analyzeReceiptWithVision,R as getAIStatus,M as isAIEnabled,V as parseChatTransactionWithAI};
