/**
 * Gemini AI Service
 * Google Gemini APIを使用した高精度なレシート分析・分類サービス
 */

// Gemini API設定
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
export const GEMINI_API_KEY_LOADED = !!GEMINI_API_KEY;
// 利用可能なモデル（優先順位順）
// 利用可能なモデル（優先順位順）
// 利用可能なモデル（優先順位順）
// ユーザーの環境（Trusted Tester等）に合わせて利用可能なモデルを定義
const GEMINI_MODELS = [
  'gemini-2.0-flash',        // 最新高速モデル
  'gemini-1.5-flash-latest', // 安定高速モデル
  'gemini-1.5-pro-latest',   // 高性能モデル
  'gemini-flash-latest',     // エイリアス
  'gemini-pro-latest',       // エイリアス
];

// デフォルトのAPI URL
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODELS[0]}:generateContent`;

const getApiUrl = (model: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

import { determineCategoryByKeyword, standardizeItemName } from './keywordCategoryService';

export interface AIClassificationResult {
  category: string;
  accountTitle: string;
  confidence: number;
  reasoning: string;
  taxDeductible: boolean;
  suggestions: string[];
}

// ユーザー指定の出力形式に合わせたインターフェース
// CLOVA OCR（LINEレシート）の仕様を模倣した高度な構造化データ
export interface AIReceiptAnalysis {
  summary: {
    transaction_date: string | null;
    total_amount: number | null;
    confidence: number;
  };
  store_info: {
    name: string;
    branch?: string;
    tel?: string;
    address?: string;
  };
  payment_info: {
    method: 'cash' | 'credit_card' | 'electronic_money' | 'qr_code' | 'other';
    amount: number | null;
  };
  tax_info: {
    tax_amount_8: number | null;
    tax_amount_10: number | null;
    tax_excluded_amount: number | null;
  };
  category: {
    primary: '消耗品費' | '交際費' | '旅費交通費' | '通信費' | '会議費' | '事務用品費' | '役員報酬' | '雑費' | '不明' | string;
    confidence: number;
  };
  items: {
    name: string;
    price: number | null;
    qty: number | null;
    line_total: number | null;
    tax_rate?: string;
  }[];
  validation_errors?: string[];
  // 互換性のためのフラットフィールド（マッピング用）
  transaction_date?: string; // summary.transaction_dateへのエイリアス
  store_name?: string; // store_info.nameへのエイリアス
  total_amount?: number; // summary.total_amountへのエイリアス
  tax_classification?: string; // 推論フィールド
}

/**
 * 損益計算書（決算書）の解析結果インターフェース
 */
export interface AIPLSettlementAnalysis {
  year: number | null;
  revenue: number | null;
  cost_of_sales: number | null;
  operating_expenses: number | null;
  non_operating_income: number | null;
  non_operating_expenses: number | null;
  extraordinary_income: number | null;
  extraordinary_loss: number | null;
  income_before_tax: number | null;
  net_income: number | null;
  category_breakdown: {
    category: string;
    amount: number;
  }[];
  // 貸借対照表（BS）項目（オプション：P/L書類に含まれる場合があるため）
  net_assets_total?: number | null;
  assets_total?: number | null;
  liabilities_total?: number | null;
  assets_current_cash?: number | null;
  assets_current_receivable?: number | null;
  assets_current_inventory?: number | null;
  assets_fixed_total?: number | null;
  liabilities_current_payable?: number | null;
  liabilities_short_term_loans?: number | null;
  liabilities_long_term_loans?: number | null;
  net_assets_capital?: number | null;
  net_assets_retained_earnings?: number | null;
  confidence: number;
}

/**
 * 貸借対照表（BS）の解析結果インターフェース
 */
export interface AIBSAnalysis {
  year: number | null;
  assets_current_cash: number | null;
  assets_current_receivable: number | null;
  assets_current_inventory: number | null;
  assets_current_total: number | null;
  assets_fixed_total: number | null;
  assets_total: number | null;
  liabilities_current_payable: number | null;
  liabilities_short_term_loans: number | null;
  liabilities_long_term_loans: number | null;
  liabilities_total: number | null;
  net_assets_capital: number | null;
  net_assets_retained_earnings: number | null;
  net_assets_retained_earnings_total: number | null;
  net_assets_shareholders_equity: number | null;
  net_assets_total: number | null;
  liabilities_and_net_assets_total: number | null;
  confidence: number;
}

// ... helper logic to map flat fields ...

/**
 * Gemini AIを使用してレシートを分析
 */
/**
 * Gemini AIを使用してレシートを分析（テキストベース）
 */
export async function analyzeReceiptWithAI(
  ocrText: string,
  _imageBase64?: string // 将来の画像分析用
): Promise<AIReceiptAnalysis | null> {
  if (!GEMINI_API_KEY) {
    console.warn('Gemini API Keyが設定されていません。ルールベースの分析にフォールバックします。');
    return null;
  }

  const today = new Date().toISOString().split('T')[0];

  const currentYear = new Date().getFullYear();

  const prompt = `あなたは「CLOVA OCR」のような最高峰の日本語レシート認識エンジンをシミュレートするAIです。
以下のOCRテキストを分析し、高度な構造化データとして抽出してください。

OCRテキスト:
"""
${ocrText}
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
- 基準日: ${today} (今日の日付)
- 年補完: ${currentYear}年を優先して解釈してください。
- 項目名の抽出: ユーザーが「スタバ」「タクシー」「ランチ」などの具体的な店名や名称を挙げた場合は、それを優先して抽出してください。無理に標準的な名称に変換しないでください。
`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 2048,
          response_mime_type: "application/json"
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error:', response.status, errorText);
      throw new Error(`Gemini API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) {
      throw new Error('AIからの応答が空でした');
    }

    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AIの応答からJSONを抽出できませんでした');
    }

    const result = JSON.parse(jsonMatch[0]) as AIReceiptAnalysis;

    // 項目名の標準化
    if (result && result.items) {
      result.items.forEach(item => {
        item.name = standardizeItemName(item.name, result.category?.primary || '');
      });
    }

    // フラットフィールドへのマッピング（互換性確保）
    if (result) {
      result.transaction_date = result.summary?.transaction_date || '';
      // @ts-ignore
      result.store_name = result.store_info?.name;
      // @ts-ignore
      result.total_amount = result.summary?.total_amount;
    }

    return result;

  } catch (error) {
    console.error('Gemini AI Analysis Exception:', error);
    // 元のエラーをスローしてUI側で表示させる
    throw error;
  }
}

/**
 * Gemini AIのマルチモーダル機能を使用して画像から直接レシートを分析
 */
export async function analyzeReceiptWithVision(
  imageBase64: string
): Promise<AIReceiptAnalysis | null> {
  if (!GEMINI_API_KEY) {
    return null;
  }

  // 複数のモデルで再試行するロジック
  for (const model of GEMINI_MODELS) {
    try {
      console.log(`Trying Gemini Model: ${model}`);
      return await analyzeReceiptWithModel(imageBase64, model);
    } catch (error: any) {
      console.warn(`Model ${model} failed:`, error);
      // 最後のモデルだった場合はエラーをスロー
      if (model === GEMINI_MODELS[GEMINI_MODELS.length - 1]) {
        throw error;
      }
      // 次のモデルを試行（ループ継続）
    }
  }
  return null;
}

/**
 * 指定されたモデルでレシートを分析する内部関数
 */
async function analyzeReceiptWithModel(
  imageBase64: string,
  model: string
): Promise<AIReceiptAnalysis | null> {

  // MIMEタイプの動的検出
  let mimeType = 'image/jpeg';
  if (imageBase64.includes('data:')) {
    const match = imageBase64.match(/data:([^;]+);/);
    if (match) mimeType = match[1];
  }

  // Base64プレフィックスを除去
  const pureBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;


  const currentYear = new Date().getFullYear();

  const prompt = `あなたは「CLOVA OCR」のような最高峰の日本語レシート認識エンジンをシミュレートするAIです。
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
- 年補完: 年が省略されている場合のみ ${currentYear}年を優先。
`;

  try {
    const apiUrl = getApiUrl(model);
    const response = await fetch(`${apiUrl}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: mimeType,
                data: pureBase64
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 2048,
          response_mime_type: "application/json"
        }
      })
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Model ${model} not found (404)`);
      }
      const errorText = await response.text();
      console.error('Gemini API Error:', response.status, errorText);
      throw new Error(`Gemini API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Gemini Vision API Raw Response:', JSON.stringify(data, null, 2));

    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) {
      console.warn('Gemini Vision API returned empty text content.');
      throw new Error('AIからの応答が空でした');
    }

    // JSON extraction fix for potential markdown wrapping
    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Failed to extract JSON from Gemini Vision response:', textContent);
      throw new Error('AIの応答からJSONを抽出できませんでした');
    }

    const result = JSON.parse(jsonMatch[0]) as AIReceiptAnalysis;

    // 全体のカテゴリチェック
    if (result) {
      const currentCategory = result.category?.primary;
      if (!currentCategory || currentCategory === 'その他' || currentCategory === '未分類' || currentCategory === 'Unclassified' || currentCategory === '雑費') {
        // 店名や品目から推測
        const textToAnalyze = `${result.store_info?.name || ''} ${result.items?.map(i => i.name).join(' ')}`;
        const keywordCategory = determineCategoryByKeyword(textToAnalyze);
        if (keywordCategory) {
          console.log(`Keyword Category Fallback (Main): ${result.store_info?.name} -> ${keywordCategory}`);
          if (result.category) {
            // @ts-ignore: Updating readonly property if any
            result.category.primary = keywordCategory;
          } else {
            // @ts-ignore
            result.category = { primary: keywordCategory, confidence: 0.8 };
          }
        }
      }
    }

    // 項目名の標準化を適用 (ランチ -> 飲食代)
    if (result && result.items) {
      result.items.forEach(item => {
        item.name = standardizeItemName(item.name, result.category?.primary || '');
      });
    }

    // フラットフィールドへのマッピング（互換性確保）
    if (result) {
      result.transaction_date = result.summary.transaction_date || '';
      // @ts-ignore
      result.store_name = result.store_info.name;
      // @ts-ignore
      result.total_amount = result.summary.total_amount;
      // category.primary is used by caller
    }

    return result;
  } catch (error) {
    console.error('Gemini Vision AI Analysis Exception:', error);
    // 元のエラーをスローして呼び出し元（再試行ループ）で処理させる
    throw error;
  }
}


/**
 * AIを使用して経費カテゴリを分類
 */
export async function classifyExpenseWithAI(
  storeName: string,
  amount: number,
  description?: string
): Promise<AIClassificationResult | null> {
  if (!GEMINI_API_KEY) {
    console.warn('Gemini API Keyが設定されていません');
    return null;
  }

  const prompt = `あなたは日本の経理・会計の専門家です。以下の支出を適切な勘定科目に分類してください。

店舗名: ${storeName}
金額: ¥${amount.toLocaleString()}
${description ? `詳細: ${description}` : ''}

勘定科目（accountTitle）の候補:
旅費交通費, 通信費, 消耗品費, 接待交際費, 会議費, 水道光熱費, 役員報酬, 広告宣伝費, 外注費, 新聞図書費, 修繕費, 支払手数料, 福利厚生費, 地代家賃, 租税公課, 保険料, 食費, 雑費, 仕入, 売上, 業務委託収入, 給与, 燃料費, 設備費, 車両費, 雑損益, 事業主貸

以下の形式でJSONを返してください（JSONのみ）:
{
  "category": "【勘定科目】の候補から選択",
  "accountTitle": "【勘定科目】の候補から選択",
  "confidence": 0.0-1.0,
  "reasoning": "分類理由（日本語で簡潔に）",
  "taxDeductible": true/false,
  "suggestions": ["経費処理のアドバイス"]
}

注意: ランチや飲食に関連する場合は「接待交際費」を優先してください。`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) {
      return null;
    }

    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return null;
    }

    return JSON.parse(jsonMatch[0]) as AIClassificationResult;

  } catch (error) {
    console.error('AI分類エラー:', error);
    return null;
  }
}

/**
 * AIを使用して経費の異常を検知
 */
export async function detectAnomalyWithAI(
  currentExpense: { storeName: string; amount: number; date: string },
  recentExpenses: { storeName: string; amount: number; date: string }[]
): Promise<{ isAnomaly: boolean; reason?: string; severity?: 'low' | 'medium' | 'high' } | null> {
  if (!GEMINI_API_KEY || recentExpenses.length < 5) {
    return null;
  }

  const prompt = `あなたは経費不正検知の専門家です。以下の支出履歴を分析し、最新の支出が異常かどうか判定してください。

最新の支出:
- 店舗: ${currentExpense.storeName}
- 金額: ¥${currentExpense.amount.toLocaleString()}
- 日付: ${currentExpense.date}

過去の支出履歴:
${recentExpenses.slice(0, 10).map(e => `- ${e.date}: ${e.storeName} ¥${e.amount.toLocaleString()}`).join('\n')}

以下のJSON形式で回答（JSONのみ）:
{
  "isAnomaly": true/false,
  "reason": "異常と判定した理由（なければnull）",
  "severity": "low/medium/high（異常でなければnull）"
}`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 512,
        }
      })
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const jsonMatch = textContent?.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return null;
    }

    return JSON.parse(jsonMatch[0]);

  } catch (error) {
    console.error('異常検知エラー:', error);
    return null;
  }
}

/**
 * API Keyが設定されているか確認
 */
export function isAIEnabled(): boolean {
  return !!GEMINI_API_KEY;
}

/**
 * AI分析のステータスを取得
 */
export function getAIStatus(): { enabled: boolean; provider: string; model: string } {
  return {
    enabled: isAIEnabled(),
    provider: 'Google Gemini',
    model: 'gemini-1.5-flash'
  };
}

/**
 * 経営分析アドバイスのインターフェース
 */
export interface BusinessAdvice {
  summary: string;
  insights: {
    type: 'positive' | 'warning' | 'info';
    title: string;
    description: string;
  }[];
  recommendations: string[];
  goals: {
    shortTerm: string;
    longTerm: string;
  };
}

/**
 * 経営分析データに基づいてAIアドバイスを生成
 */
export async function generateBusinessAdvice(
  data: {
    revenue: number;
    expense: number;
    profit: number;
    revenueChange: number;
    expenseChange: number;
    profitChange: number;
    topExpenseCategories: { category: string; amount: number; percentage: number }[];
    topIncomeCategories: { category: string; amount: number; percentage: number }[];
    transactionCount: number;
    period: string;
  }
): Promise<BusinessAdvice | null> {
  if (!GEMINI_API_KEY) {
    console.error('❌ Gemini API Key が設定されていません。.env ファイルを確認してください。');
    console.error('   現在のキー値:', GEMINI_API_KEY ? '(設定済み)' : '(空)');
    throw new Error('API Keyが設定されていません。.envファイルにVITE_GEMINI_API_KEYを設定してください。');
  }

  console.log('🔑 Gemini API Key:', GEMINI_API_KEY.substring(0, 10) + '...');

  const prompt = `あなたは日本の中小企業向け経営コンサルタントです。以下の財務データを分析し、実用的なアドバイスを提供してください。

【財務データ】
期間: ${data.period}
売上高: ¥${data.revenue.toLocaleString()} (前期比: ${data.revenueChange >= 0 ? '+' : ''}${data.revenueChange.toFixed(1)}%)
経費: ¥${data.expense.toLocaleString()} (前期比: ${data.expenseChange >= 0 ? '+' : ''}${data.expenseChange.toFixed(1)}%)
利益: ¥${data.profit.toLocaleString()} (前期比: ${data.profitChange >= 0 ? '+' : ''}${data.profitChange.toFixed(1)}%)
利益率: ${data.revenue > 0 ? ((data.profit / data.revenue) * 100).toFixed(1) : 0}%
取引件数: ${data.transactionCount}件

【経費カテゴリ（上位）】
${data.topExpenseCategories.map(c => `- ${c.category}: ¥${c.amount.toLocaleString()} (${c.percentage.toFixed(1)}%)`).join('\n')}

【売上カテゴリ（上位）】
${data.topIncomeCategories.map(c => `- ${c.category}: ¥${c.amount.toLocaleString()} (${c.percentage.toFixed(1)}%)`).join('\n')}

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

注意: 日本の中小企業や個人事業主向けに、実行可能で具体的なアドバイスを提供してください。`;

  // 複数のモデルでフォールバック
  let lastError: Error | null = null;

  for (const model of GEMINI_MODELS) {
    try {
      console.log(`🤖 Gemini AI: モデル「${model}」でアドバイス生成を試行中...`);
      console.log('🤖 送信データ:', data);

      const apiUrl = getApiUrl(model);
      const response = await fetch(`${apiUrl}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            topK: 40,
            maxOutputTokens: 1500,
          }
        }),
      });

      console.log(`🤖 Gemini API レスポンスステータス (${model}):`, response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`❌ モデル「${model}」がエラー:`, response.status, errorData);

        // APIキーのエラーかどうかを判定
        if (response.status === 400 || response.status === 401 || response.status === 403) {
          const errorMessage = errorData?.error?.message || 'API認証エラー';
          console.error('❌ API認証エラー:', errorMessage);
          lastError = new Error(`API認証エラー: ${errorMessage}`);
          // 認証エラーの場合は他のモデルを試しても無駄なのでループを抜ける
          break;
        }

        // 次のモデルを試す
        continue;
      }

      const result = await response.json();
      console.log('🤖 Gemini API 生のレスポンス:', result);

      const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
      console.log('🤖 抽出されたテキスト:', text);

      if (!text) {
        console.warn(`モデル「${model}」: テキストが空です`);
        continue;
      }

      // JSONを抽出
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.warn(`モデル「${model}」: JSONが見つかりません`);
        continue;
      }

      const advice = JSON.parse(jsonMatch[0]) as BusinessAdvice;
      console.log(`✅ Gemini AI (${model}): アドバイス生成完了`, advice);

      return advice;
    } catch (error: any) {
      console.error(`❌ モデル「${model}」でエラー:`, error.message);
      lastError = error;
      // 次のモデルを試す
    }
  }

  console.error('❌ すべてのモデルでアドバイス生成に失敗しました');

  if (lastError) {
    throw lastError;
  }

  throw new Error('AIアドバイスの生成に失敗しました。しばらくしてから再度お試しください。');
}
/**
 * AIを使用してチャットテキストから取引データを抽出
 */
export async function parseChatTransactionWithAI(
  text: string
): Promise<{
  item: string;
  amount: number;
  date: string;
  category: string;
  type: 'income' | 'expense';
  description: string;
} | null> {
  if (!GEMINI_API_KEY) {
    return null;
  }

  const today = new Date().toISOString().split('T')[0];
  const prompt = `あなたは日本の経理専門家です。ユーザーのチャットメッセージから取引情報を抽出してJSON形式で返してください。
 
 現在の今日の日付: ${today}
 
 チャットメッセージ: "${text}"
 
 ### 抽出ルール:
  1. **品目**: 具体的な内容を抽出（"ランチ" → "昼食代"など）。
  2. **金額**: 数値を抽出。万円、千円などの単位も考慮。
  3. **日付**: "昨日"、"一昨日"、"先週の金曜日"などの相対日時を、今日(${today})を基準に"YYYY-MM-DD"形式に変換。指定がなければ"${today}"とする。
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
`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 512,
          response_mime_type: "application/json"
        }
      })
    });

    if (!response.ok) return null;

    const data = await response.json();
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) return null;

    // Remove markdown code blocks if present
    const cleanedText = textContent.replace(/```json\n|\n```/g, '').trim();

    let result;
    try {
      result = JSON.parse(cleanedText);
    } catch (e) {
      // Fallback: try regex extraction if direct parse fails
      const jsonMatch = textContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        return null;
      }
    }

    // キーワードによるカテゴリ修正のフォールバック
    if (result) {
      if (!result.category || result.category === 'その他' || result.category === '未分類' || result.category === 'Unclassified' || result.category === '雑費') {
        // 品目やDescriptionから推測
        const textToAnalyze = `${result.item} ${result.description || ''}`;
        const keywordCategory = determineCategoryByKeyword(textToAnalyze);
        if (keywordCategory) {
          console.log(`Keyword Category Fallback (Chat): ${result.item} -> ${keywordCategory}`);
          result.category = keywordCategory;
        }
      }
    }

    // 項目名の標準化を適用 (ランチ -> 飲食代)
    if (result) {
      result.item = standardizeItemName(result.item, result.category);
    }

    return result;
  } catch (error) {
    console.error('AIチャット解析エラー:', error);
    return null;
  }
}

/**
 * Gemini AIを使用して損益計算書（決算書）を分析
 */
export async function analyzePLDocumentWithAI(
  ocrText: string
): Promise<AIPLSettlementAnalysis | null> {
  if (!GEMINI_API_KEY) return null;

  for (const model of GEMINI_MODELS) {
    try {
      console.log(`Trying P&L analysis with model (Text): ${model}`);
      const result = await analyzePLWithModelInternal(model, ocrText, undefined);
      if (result) return result;
    } catch (error) {
      console.warn(`Model ${model} failed for P&L Text:`, error);
      if (model === GEMINI_MODELS[GEMINI_MODELS.length - 1]) throw error;
    }
  }
  return null;
}

/**
 * Gemini AI (Vision)を使用して画像から損益計算書を分析
 */
export async function analyzePLDocumentWithVision(
  imageBase64: string
): Promise<AIPLSettlementAnalysis | null> {
  if (!GEMINI_API_KEY) return null;

  for (const model of GEMINI_MODELS) {
    try {
      console.log(`Trying P&L analysis with model (Vision): ${model}`);
      const result = await analyzePLWithModelInternal(model, undefined, imageBase64);
      if (result) return result;
    } catch (error) {
      console.warn(`Model ${model} failed for P&L Vision:`, error);
      if (model === GEMINI_MODELS[GEMINI_MODELS.length - 1]) throw error;
    }
  }
  return null;
}

/**
 * 内部用の共通AI分析関数
 */
async function analyzePLWithModelInternal(
  model: string,
  ocrText?: string,
  imageBase64?: string
): Promise<AIPLSettlementAnalysis | null> {
  const currentYear = new Date().getFullYear();
  const isVision = !!imageBase64;

  const prompt = isVision
    ? `あなたは日本の税理士レベルの視覚理解力を持つAIです。
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

年度補完: 書類内に年度の記載がない場合は ${currentYear - 1} または ${currentYear} と推測してください。`
    : `あなたは日本の税理士・会計士レベルの知識を持つAIです。
以下のOCRテキストから損益計算書（P&L）の数値を抽出し、JSON形式で返してください。

OCRテキスト:
"""
${ocrText}
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

年度補完: 年度・期間が不明な場合は ${currentYear - 1} または ${currentYear} と推測してください。`;

  const apiUrl = getApiUrl(model);
  const parts: any[] = [{ text: prompt }];

  if (isVision) {
    let mimeType = 'image/jpeg';
    if (imageBase64!.includes('data:')) {
      const match = imageBase64!.match(/data:([^;]+);/);
      if (match) mimeType = match[1];
    }
    const pureBase64 = imageBase64!.includes(',') ? imageBase64!.split(',')[1] : imageBase64;
    parts.push({ inline_data: { mime_type: mimeType, data: pureBase64 } });
  }

  const response = await fetch(`${apiUrl}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: {
        temperature: 0.1,
        response_mime_type: "application/json"
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Gemini API Error (${model}):`, response.status, errorText);
    throw new Error(`API Error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    console.error(`Empty response from model ${model}`);
    throw new Error(`Empty response from model ${model}`);
  }

  console.log(`AI Response Text (${model}):`, text);

  // 堅牢なJSON抽出
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error('Failed to extract JSON from AI response:', text);
    throw new Error('Invalid JSON format in AI response');
  }

  return JSON.parse(jsonMatch[0]);
}
/**
 * Gemini AI (Vision)を使用して画像から貸借対照表を分析
 */
export async function analyzeBSDocumentWithVision(
  imageBase64: string
): Promise<AIBSAnalysis | null> {
  if (!GEMINI_API_KEY) return null;

  for (const model of GEMINI_MODELS) {
    try {
      console.log(`Trying Balance Sheet analysis with model: ${model}`);
      const result = await analyzeBSWithModelInternal(model, imageBase64);
      if (result) return result;
    } catch (error) {
      console.warn(`Model ${model} failed for Balance Sheet Vision:`, error);
      if (model === GEMINI_MODELS[GEMINI_MODELS.length - 1]) throw error;
    }
  }
  return null;
}

/**
 * 内部用の共通BS分析関数
 */
async function analyzeBSWithModelInternal(
  model: string,
  imageBase64: string
): Promise<AIBSAnalysis | null> {
  const currentYear = new Date().getFullYear();

  const prompt = `あなたは日本の税理士レベルの視覚理解力を持つAIです。
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

年度補完: ${currentYear - 1}年または${currentYear}年を優先。`;

  const apiUrl = getApiUrl(model);
  const parts: any[] = [{ text: prompt }];

  let mimeType = 'image/jpeg';
  if (imageBase64.includes('data:')) {
    const match = imageBase64.match(/data:([^;]+);/);
    if (match) mimeType = match[1];
  }
  const pureBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
  parts.push({ inline_data: { mime_type: mimeType, data: pureBase64 } });

  const response = await fetch(`${apiUrl}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: {
        temperature: 0.1,
        response_mime_type: "application/json"
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Gemini API Error (BS - ${model}):`, response.status, errorText);
    throw new Error(`API Error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error(`Empty response from model ${model}`);
  }

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Invalid JSON format in AI response');
  }

  return JSON.parse(jsonMatch[0]);
}
