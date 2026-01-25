
/**
 * Keyword Category Service
 * キーワードマッチングによるカテゴリ判定ロジック
 * AIが「未分類」などの曖昧な結果を返した際のフォールバックとして使用
 */

// カテゴリの定義（システム内で使用される標準的な勘定科目）
export type StandardCategory = 
  | '旅費交通費'
  | '通信費'
  | '消耗品費'
  | '接待交際費'
  | '会議費'
  | '水道光熱費'
  | '広告宣伝費'
  | '外注費'
  | '新聞図書費' // geminiでは図書研修費だが、TransactionFormでは新聞図書費
  | '修繕費'
  | '支払手数料'
  | '雑費'
  | '仕入'
  | '売上';

// キーワードとカテゴリのマッピング
// 優先順位が高い順に記述（配列の先頭からマッチングを行うため、より具体的なキーワードを先に書く）
const KEYWORD_RULES: { keyword: string; category: StandardCategory }[] = [
  // 通信費・クラウドサービス
  { keyword: 'AWS', category: '通信費' },
  { keyword: 'Amazon Web Services', category: '通信費' },
  { keyword: 'Google Cloud', category: '通信費' },
  { keyword: 'GCP', category: '通信費' },
  { keyword: 'Azure', category: '通信費' },
  { keyword: 'Vercel', category: '通信費' },
  { keyword: 'Heroku', category: '通信費' },
  { keyword: 'OpenAI', category: '通信費' },
  { keyword: 'GitHub', category: '通信費' },
  { keyword: 'Slack', category: '通信費' },
  { keyword: 'Zoom', category: '通信費' },
  { keyword: 'Adobe', category: '通信費' },
  { keyword: 'Internet', category: '通信費' },
  { keyword: 'Wifi', category: '通信費' },
  { keyword: 'Softbank', category: '通信費' },
  { keyword: 'Docomo', category: '通信費' },
  { keyword: 'KDDI', category: '通信費' },
  { keyword: 'Au', category: '通信費' },
  { keyword: 'Rakuten Mobile', category: '通信費' },

  // 旅費交通費
  { keyword: 'Uber', category: '旅費交通費' },
  { keyword: 'Taxi', category: '旅費交通費' },
  { keyword: 'タクシー', category: '旅費交通費' },
  { keyword: 'Suica', category: '旅費交通費' },
  { keyword: 'Pasmo', category: '旅費交通費' },
  { keyword: 'JR', category: '旅費交通費' },
  { keyword: '新幹線', category: '旅費交通費' },
  { keyword: 'Flight', category: '旅費交通費' },
  { keyword: 'Airline', category: '旅費交通費' },
  { keyword: 'ANA', category: '旅費交通費' },
  { keyword: 'JAL', category: '旅費交通費' },
  { keyword: 'Parking', category: '旅費交通費' },
  { keyword: '駐車場', category: '旅費交通費' },
  { keyword: 'Gas', category: '旅費交通費' }, // Gas can be utilities or fuel, tricky context. Assume generic 'Gas' might be fuel in transaction context often, but 'Tokyo Gas' is utilities.
  { keyword: 'Shell', category: '旅費交通費' },
  { keyword: 'Eneos', category: '旅費交通費' },

  // 水道光熱費
  { keyword: 'Tokyo Gas', category: '水道光熱費' },
  { keyword: 'Tepco', category: '水道光熱費' },
  { keyword: '東京電力', category: '水道光熱費' },
  { keyword: '東京ガス', category: '水道光熱費' },
  { keyword: '水道', category: '水道光熱費' },
  { keyword: 'Water', category: '水道光熱費' },

  // 広告宣伝費
  { keyword: 'Google Ads', category: '広告宣伝費' },
  { keyword: 'Meta Ads', category: '広告宣伝費' },
  { keyword: 'Facebook', category: '広告宣伝費' },
  { keyword: 'Instagram', category: '広告宣伝費' },
  { keyword: 'Twitter', category: '広告宣伝費' },
  { keyword: 'X Corp', category: '広告宣伝費' },
  { keyword: 'Ads', category: '広告宣伝費' },
  { keyword: 'Promotion', category: '広告宣伝費' },

  // 外注費
  { keyword: 'Lancers', category: '外注費' },
  { keyword: 'Cloudworks', category: '外注費' },
  { keyword: 'Upwork', category: '外注費' },
  { keyword: 'Fiverr', category: '外注費' },
  { keyword: 'Coconala', category: '外注費' },

  // 消耗品費
  { keyword: 'Amazon', category: '消耗品費' }, // Amazon is broad, but often supplies
  { keyword: 'Rakuten', category: '消耗品費' },
  { keyword: 'Monotaro', category: '消耗品費' },
  { keyword: 'Askul', category: '消耗品費' },
  { keyword: 'Yodobashi', category: '消耗品費' },
  { keyword: 'Bic Camera', category: '消耗品費' },
  { keyword: 'Apple Store', category: '消耗品費' }, // equipment often
  { keyword: 'Daiso', category: '消耗品費' },
  { keyword: 'Seria', category: '消耗品費' },

  // 会議費・交際費
  { keyword: 'Starbucks', category: '会議費' },
  { keyword: 'Doutor', category: '会議費' },
  { keyword: 'Tully', category: '会議費' },
  { keyword: 'Cafe', category: '会議費' },
  { keyword: 'Coffee', category: '会議費' },
  { keyword: 'Restaurant', category: '接待交際費' }, // Broad, but safe default
  { keyword: 'Izakaya', category: '接待交際費' },
  { keyword: 'Bar', category: '接待交際費' },

  // 支払手数料
  { keyword: 'Fee', category: '支払手数料' },
  { keyword: 'Charge', category: '支払手数料' },
  { keyword: '振込手数料', category: '支払手数料' },
];

/**
 * テキスト（品目名や取引先名）に基づいてカテゴリを判定する
 * @param text 品目名、説明、または取引先名
 * @returns マッチしたカテゴリ名、または null
 */
export function determineCategoryByKeyword(text: string): string | null {
  if (!text) return null;

  const normalizedText = text.toLowerCase();
  
  for (const rule of KEYWORD_RULES) {
    if (normalizedText.includes(rule.keyword.toLowerCase())) {
      return rule.category;
    }
  }

  return null;
}
