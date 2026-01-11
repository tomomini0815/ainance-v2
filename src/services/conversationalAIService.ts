import { GoogleGenerativeAI } from '@google/generative-ai';

// Gemini APIの初期化
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface TransactionContext {
  recentTransactions: Array<{
    date: string;
    description: string;
    amount: number;
    category: string;
    type: 'income' | 'expense';
  }>;
  frequentCategories: Array<{
    category: string;
    count: number;
    avgAmount: number;
  }>;
  commonVendors: string[];
}

export interface ParsedTransaction {
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  confidence: number;
  reasoning: string;
}

export interface ConversationResponse {
  transactions: ParsedTransaction[];
  message: string;
  suggestions: string[];
}

/**
 * 過去の取引からコンテキストを分析
 */
export const analyzeTransactionContext = (
  transactions: Array<{
    date: string;
    description?: string;
    item?: string;
    amount: number;
    category: string;
    type: string;
  }>
): TransactionContext => {
  // 最近の取引（直近30件）
  const recentTransactions = transactions
    .slice(0, 30)
    .map(t => ({
      date: t.date,
      description: t.description || t.item || '',
      amount: typeof t.amount === 'number' ? t.amount : 0,
      category: t.category,
      type: t.type as 'income' | 'expense',
    }));

  // カテゴリごとの集計
  const categoryMap = new Map<string, { count: number; totalAmount: number }>();
  transactions.forEach(t => {
    const category = t.category;
    const amount = typeof t.amount === 'number' ? Math.abs(t.amount) : 0;
    
    if (!categoryMap.has(category)) {
      categoryMap.set(category, { count: 0, totalAmount: 0 });
    }
    
    const data = categoryMap.get(category)!;
    data.count++;
    data.totalAmount += amount;
  });

  const frequentCategories = Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      count: data.count,
      avgAmount: data.totalAmount / data.count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // よく使う取引先を抽出
  const vendorMap = new Map<string, number>();
  transactions.forEach(t => {
    const description = t.description || t.item || '';
    // 簡易的な取引先抽出（実際にはもっと高度な処理が必要）
    const words = description.split(/\s+/);
    words.forEach(word => {
      if (word.length > 2) {
        vendorMap.set(word, (vendorMap.get(word) || 0) + 1);
      }
    });
  });

  const commonVendors = Array.from(vendorMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([vendor]) => vendor);

  return {
    recentTransactions,
    frequentCategories,
    commonVendors,
  };
};

/**
 * AIを使って会話から取引を抽出
 */
export const parseConversationToTransactions = async (
  userMessage: string,
  context: TransactionContext,
  conversationHistory: ConversationMessage[]
): Promise<ConversationResponse> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // コンテキスト情報を文字列化
    const contextStr = `
【過去の取引パターン】
よく使うカテゴリ:
${context.frequentCategories.map(c => `- ${c.category} (${c.count}回, 平均¥${c.avgAmount.toLocaleString()})`).join('\n')}

よく使う取引先:
${context.commonVendors.join(', ')}

【最近の取引】
${context.recentTransactions.slice(0, 5).map(t => 
  `- ${t.date}: ${t.description} ¥${Math.abs(t.amount).toLocaleString()} (${t.category})`
).join('\n')}
`;

    // 会話履歴を文字列化
    const historyStr = conversationHistory
      .slice(-5) // 直近5件のみ
      .map(m => `${m.role === 'user' ? 'ユーザー' : 'アシスタント'}: ${m.content}`)
      .join('\n');

    const prompt = `
あなたは日本の経理AIアシスタントです。ユーザーの自然な会話から取引情報を抽出し、適切な勘定科目を提案してください。

${contextStr}

【会話履歴】
${historyStr}

【ユーザーの最新メッセージ】
${userMessage}

【タスク】
1. ユーザーのメッセージから取引情報を抽出してください
2. 複数の取引がある場合は、すべて抽出してください
3. 過去の取引パターンを参考に、最適な勘定科目を提案してください
4. 各取引の信頼度（0-100%）を評価してください
5. ユーザーへの返信メッセージと追加の提案を生成してください

【出力形式】
以下のJSON形式で回答してください：
{
  "transactions": [
    {
      "description": "取引の説明（金額を除く）",
      "amount": 金額（数値）,
      "category": "勘定科目",
      "type": "income" または "expense",
      "confidence": 信頼度（0-100）,
      "reasoning": "この勘定科目を選んだ理由"
    }
  ],
  "message": "ユーザーへの返信メッセージ",
  "suggestions": ["追加の提案1", "追加の提案2"]
}

【注意事項】
- 金額は必ず数値型で返してください
- typeは "income" または "expense" のみ
- 勘定科目は日本の会計基準に従ってください
- 不明な点があれば、messageで質問してください
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // JSONを抽出
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed as ConversationResponse;
    }

    // フォールバック: 簡易パース
    return parseConversationFallback(userMessage, context);
  } catch (error) {
    console.error('AI会話解析エラー:', error);
    return parseConversationFallback(userMessage, context);
  }
};

/**
 * フォールバック: ルールベースの会話解析
 */
const parseConversationFallback = (
  userMessage: string,
  context: TransactionContext
): ConversationResponse => {
  const transactions: ParsedTransaction[] = [];
  
  // 金額を抽出
  const amountPattern = /(\d+(?:,\d{3})*(?:\.\d+)?)\s*円?/g;
  const amounts: number[] = [];
  let match;
  while ((match = amountPattern.exec(userMessage)) !== null) {
    const amount = parseFloat(match[1].replace(/,/g, ''));
    amounts.push(amount);
  }

  // キーワードから勘定科目を推測
  const categoryKeywords: Array<{ keywords: string[]; category: string; type: 'income' | 'expense' }> = [
    { keywords: ['売上', '収入', '入金'], category: '業務委託収入', type: 'income' },
    { keywords: ['交通費', '電車', 'タクシー', '出張'], category: '旅費交通費', type: 'expense' },
    { keywords: ['食事', 'ランチ', 'ディナー', '会食'], category: '接待交際費', type: 'expense' },
    { keywords: ['文具', 'コピー', '消耗品'], category: '消耗品費', type: 'expense' },
    { keywords: ['ホテル', '宿泊'], category: '旅費交通費', type: 'expense' },
  ];

  let detectedCategory = '雑費';
  let detectedType: 'income' | 'expense' = 'expense';

  for (const { keywords, category, type } of categoryKeywords) {
    if (keywords.some(keyword => userMessage.includes(keyword))) {
      detectedCategory = category;
      detectedType = type;
      break;
    }
  }

  // 取引を生成
  if (amounts.length > 0) {
    amounts.forEach(amount => {
      transactions.push({
        description: userMessage.replace(amountPattern, '').trim(),
        amount,
        category: detectedCategory,
        type: detectedType,
        confidence: 70,
        reasoning: 'キーワードマッチングによる推測',
      });
    });
  }

  return {
    transactions,
    message: transactions.length > 0
      ? `${transactions.length}件の取引を認識しました。内容を確認して記録してください。`
      : '取引情報を認識できませんでした。もう少し詳しく教えていただけますか？',
    suggestions: [
      '金額と内容を明確に伝えてください',
      '例: 「昨日、新幹線代15,000円とホテル代8,000円を使いました」',
    ],
  };
};

/**
 * 勘定科目の最適化提案
 */
export const suggestOptimalCategory = async (
  description: string,
  amount: number,
  context: TransactionContext
): Promise<{
  suggestedCategory: string;
  alternatives: Array<{ category: string; reason: string }>;
  taxOptimization: string;
}> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
あなたは日本の税務・会計の専門家です。以下の取引に最適な勘定科目を提案してください。

【取引情報】
- 説明: ${description}
- 金額: ¥${amount.toLocaleString()}

【過去の取引パターン】
${context.frequentCategories.map(c => `- ${c.category}: ${c.count}回使用`).join('\n')}

【タスク】
1. 最も適切な勘定科目を提案
2. 代替案を2-3個提示
3. 節税の観点からのアドバイス

以下のJSON形式で回答してください：
{
  "suggestedCategory": "推奨する勘定科目",
  "alternatives": [
    {
      "category": "代替案の勘定科目",
      "reason": "この勘定科目を選ぶ理由"
    }
  ],
  "taxOptimization": "節税の観点からのアドバイス"
}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // フォールバック
    return {
      suggestedCategory: context.frequentCategories[0]?.category || '雑費',
      alternatives: [],
      taxOptimization: '適切な勘定科目を選択することで、税務調査のリスクを減らせます。',
    };
  } catch (error) {
    console.error('勘定科目最適化エラー:', error);
    return {
      suggestedCategory: context.frequentCategories[0]?.category || '雑費',
      alternatives: [],
      taxOptimization: '適切な勘定科目を選択することで、税務調査のリスクを減らせます。',
    };
  }
};

/**
 * 会話履歴を保存
 */
export const saveConversationHistory = (
  userId: string,
  messages: ConversationMessage[]
): void => {
  try {
    const key = `conversation_history_${userId}`;
    localStorage.setItem(key, JSON.stringify(messages));
  } catch (error) {
    console.error('会話履歴保存エラー:', error);
  }
};

/**
 * 会話履歴を読み込み
 */
export const loadConversationHistory = (userId: string): ConversationMessage[] => {
  try {
    const key = `conversation_history_${userId}`;
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('会話履歴読み込みエラー:', error);
  }
  return [];
};
