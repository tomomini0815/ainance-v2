/**
 * Gemini AI Service
 * Google Gemini APIを使用した高精度なレシート分析・分類サービス
 */

// Gemini API設定
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
// 利用可能なモデル（優先順位順）- 2024年12月時点の最新モデル
const GEMINI_MODELS = [
  'gemini-2.0-flash',        // 最新の高速モデル
  'gemini-2.0-flash-lite',   // 軽量版
  'gemini-1.5-flash',        // 旧バージョン（フォールバック）
  'gemini-1.5-pro',          // 高性能版
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
 * Gemini AIのマルチモーダル機能を使用して画像から直接レシートを分析
 */
export async function analyzeReceiptWithVision(
  imageBase64: string
): Promise<AIReceiptAnalysis | null> {
  if (!GEMINI_API_KEY) {
    return null;
  }

  // Base64プレフィックスを除去
  const pureBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;

  const today = new Date().toISOString().split('T')[0];
  const currentYear = new Date().getFullYear();

  const prompt = `あなたは日本の経理・会計および税務の専門家です。提供されたレシートまたは領収書の画像を細部まで詳細に分析し、最高精度の情報を抽出してください。

### 解析ルール:
1. **店舗名**: 正確な正式名称を抽出してください。ロゴや電話番号、住所から推測が必要な場合も、最も可能性の高い名称を特定してください。
2. **日付**: "YYYY-MM-DD"形式で抽出してください。
   - 年が明記されていない場合（例: "1月25日"）、現在の年（${currentYear}年）を補完してください。ただし、現在1月でレシートが12月の場合は前年と判断してください。
   - 和暦（令和、平成など）は西暦に変換してください（例: 令和6年 -> 2024年）。
3. **合計金額**: 最終的な支払い金額（税込、値引き後）を抽出してください。
   - **重要**: 「お預かり（Cash Received）」や「お釣り（Change）」、「対象計」などの数値を誤って合計金額としないでください。"合計"、"小計"、"Total"、"領収金額"などのキーワードに注目し、最も支払額として適切な数値を選んでください。
4. **品目**: 各行の商品名、単価、カテゴリを抽出してください。
   - 消費税（8% vs 10%）の区別がある場合は、それぞれの税額も考慮してください。
   - 値引きやポイント利用がある場合は、それらも正確に反映させて合計と一致するか内部で検証してください。
5. **分類**: 日本の標準的な勘定科目に基いて分類してください。
   - 事業主貸、消耗品費、旅費交通費、接待交際費、通信費、水道光熱費、会議費、福利厚生費、外注費、地代家賃、雑費など。
   - 判断の根拠を日本語で簡潔に記述してください。

### 回答形式:
必ず以下の純粋なJSON形式のみで回答してください（コードブロックなどの装飾は不要）:
{
  "storeName": "店舗名",
  "storeCategory": "店舗の業種",
  "totalAmount": 数値,
  "date": "YYYY-MM-DD",
  "items": [
    {"name": "商品名", "price": 数値, "category": "食品/飲料/事務用品/日用品/その他"}
  ],
  "classification": {
    "category": "勘定科目カテゴリ名",
    "accountTitle": "勘定科目詳細",
    "confidence": 0.0-1.0,
    "reasoning": "分類の理由（日本語）",
    "taxDeductible": true/false
  }
}

現在の今日の日付: ${today}`;

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
                mime_type: 'image/jpeg',
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

    return JSON.parse(jsonMatch[0]) as AIReceiptAnalysis;
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
 4. **カテゴリルール**: 以下のカテゴリから最も適切なものを選択。
    - **旅費交通費**: 電車、バス、タクシー、ガソリン、駐車場、宿泊費
    - **接待交際費**: 取引先との会食、手土産、ゴルフ、慶弔費
    - **消耗品費**: 文房具、PC周辺機器(<10万円)、日用雑貨、作業用具
    - **食費**: （個人事業主の場合）個人の食事 ※会議に伴うものは会議費、取引先とは接待交際費
    - **会議費**: 打ち合わせ時のカフェ代、会議室利用料、弁当代
    - **通信費**: 携帯電話、インターネット、切手、配送料
    - **水道光熱費**: 電気、ガス、水道
    - **図書研修費**: 書籍、新聞、セミナー参加費
    - **広告宣伝費**: 広告掲載、チラシ、Web広告
    - **外注費**: 業務委託、デザイン料、ライティング料
    - **福利厚生費**: （法人/雇用有）従業員の慰安、健康診断
    - **仕入**: 商品の仕入れ、原材料
    - **売上**: 商品やサービスの対価として受け取ったお金
    - **雑費**: 手数料、その他分類できないもの
 
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
        }
      })
    });

    if (!response.ok) return null;

    const data = await response.json();
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const jsonMatch = textContent?.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) return null;

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('AIチャット解析エラー:', error);
    return null;
  }
}
