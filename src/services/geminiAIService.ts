/**
 * Gemini AI Service
 * Google Gemini APIを使用した高精度なレシート分析・分類サービス
 */

// Gemini API設定
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
// 利用可能なモデル（優先順位順）
const GEMINI_MODELS = [
  'gemini-1.5-pro',          // 最高精度（推奨）
  'gemini-1.5-flash',        // 高速・低コスト
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
    primary: '消耗品費' | '交際費' | '旅費交通費' | '通信費' | '会議費' | '事務用品費' | '雑費' | '不明' | string;
    confidence: number;
  };
  items: {
    name: string;
    price: number | null;
    qty: number | null;
    line_total: number | null;
  }[];
  // 互換性のためのフラットフィールド（マッピング用）
  transaction_date?: string; // summary.transaction_dateへのエイリアス
  store_name?: string; // store_info.nameへのエイリアス
  total_amount?: number; // summary.total_amountへのエイリアス
  tax_classification?: string; // 推論フィールド
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
  "items": [
    { "name": "品名", "price": number, "qty": number, "line_total": number }
  ]
}

**特記事項**:
- 基準日: ${today} (今日の日付)
- 年補完: ${currentYear}年を優先して解釈してください。
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
      // ... error handling ...
      return null;
    }

    const data = await response.json();
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) return null;

    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

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
    return null;
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

  // MIMEタイプの動的検出
  let mimeType = 'image/jpeg';
  if (imageBase64.includes('data:')) {
    const match = imageBase64.match(/data:([^;]+);/);
    if (match) mimeType = match[1];
  }

  // Base64プレフィックスを除去
  const pureBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;

  const today = new Date().toISOString().split('T')[0];
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
3. **日付**:
    - **ターゲット形式**: 「2024年02月04日」「2024/02/04」「2024-02-04」「R6.02.04」など、**和暦・西暦・スラッシュ区切り・ハイフン区切り**の全てに対応して検索する。
    - "YYYY-MM-DD"形式に統一して出力する。
    - **今日の日付の誤入力厳禁**: レシートに日付が印字されていない場合は \`null\` とするが、ノイズで見えにくい場合は前後の文脈から推測して良い。
3. **金額 (合計)**:
    - **【最重要】視覚的重み**: 「合計」「小計」「対象計」などの**ラベルの右側（または直下）にある、最もフォントサイズが大きく太い数字**を特定する。
    - 単なる最大値ではなく、「合計」というキーワードとの**位置関係（横並び）**を重視する。
    - 割り勘やポイント利用前の「支払うべき総額」を特定する。
    - ￥マークやカンマは除去して数値化する。

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
  "items": [
    {
      "name": "品名",
      "price": number, // 値引きはマイナスで表現
      "qty": number,
      "line_total": number,
      "tax_rate": "8% or 10%" // 可能なら推定
    }
  ]
}

**特記事項**:
- 基準日コンテキスト(参考): ${today}
- 年補完: 年が省略されている場合のみ ${currentYear}年を優先。
`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
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
      const errorData = await response.json();
      console.error('Gemini Vision API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      return null;
    }

    const data = await response.json();
    console.log('Gemini Vision API Raw Response:', JSON.stringify(data, null, 2));

    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) {
      console.warn('Gemini Vision API returned empty text content.');
      return null;
    }

    // JSON extraction fix for potential markdown wrapping
    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Failed to extract JSON from Gemini Vision response:', textContent);
      return null;
    }

    const result = JSON.parse(jsonMatch[0]) as AIReceiptAnalysis;

    // キーワードによるカテゴリ修正のフォールバック (itemsにcategoryがないため、この処理は削除または変更が必要)
    // 今回の要件ではitemsにcategoryを含めないため、このブロックは削除します。

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
    return null;
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

以下の形式でJSONを返してください（JSONのみ）:
{
  "category": "経費カテゴリ",
  "accountTitle": "勘定科目（消耗品費/旅費交通費/接待交際費/通信費/水道光熱費/会議費/福利厚生費/外注費/広告宣伝費/地代家賃/減価償却費/雑費/事業主貸など）",
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
 }`;

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
