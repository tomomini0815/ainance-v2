/**
 * Gemini AI Service
 * Google Gemini APIを使用した高精度なレシート分析・分類サービス
 */

// Gemini API設定
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
// 利用可能なモデル（優先順位順）
const GEMINI_MODELS = [
  'gemini-1.5-flash-latest',
  'gemini-1.5-pro-latest', 
  'gemini-pro',
  'gemini-1.0-pro'
];

// デフォルトのAPI URL
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODELS[0]}:generateContent`;

const getApiUrl = (model: string) => 
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

export interface AIClassificationResult {
  category: string;
  accountTitle: string;
  confidence: number;
  reasoning: string;
  taxDeductible: boolean;
  suggestions: string[];
}

export interface AIReceiptAnalysis {
  storeName: string;
  storeCategory: string;
  totalAmount: number;
  date: string;
  items: {
    name: string;
    price: number;
    category: string;
  }[];
  classification: AIClassificationResult;
  warnings: string[];
}

/**
 * Gemini AIを使用してレシートを分析
 */
export async function analyzeReceiptWithAI(
  ocrText: string,
  _imageBase64?: string // 将来の画像分析用（現在はテキストのみ）
): Promise<AIReceiptAnalysis | null> {
  if (!GEMINI_API_KEY) {
    console.warn('Gemini API Keyが設定されていません。ルールベースの分析にフォールバックします。');
    return null;
  }

  const prompt = `あなたは日本の経理・会計の専門家です。以下のレシートのOCRテキストを分析し、JSON形式で情報を抽出してください。

レシートテキスト:
"""
${ocrText}
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
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API エラー:', errorData);
      return null;
    }

    const data = await response.json();
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) {
      console.error('Gemini APIからの応答が空です');
      return null;
    }

    // JSONを抽出（マークダウンコードブロックを除去）
    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('JSONを抽出できませんでした:', textContent);
      return null;
    }

    const result = JSON.parse(jsonMatch[0]) as AIReceiptAnalysis;
    console.log('Gemini AI分析結果:', result);
    return result;

  } catch (error) {
    console.error('Gemini AI分析エラー:', error);
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
