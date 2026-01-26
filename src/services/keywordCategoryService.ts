
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
  | '新聞図書費'
  | '修繕費'
  | '支払手数料'
  | '福利厚生費'
  | '地代家賃'
  | '租税公課'
  | '保険料'
  | '食費'
  | '雑費'
  | '仕入'
  | '売上'
  | '業務委託収入';

export const STANDARD_CATEGORIES: StandardCategory[] = [
  '旅費交通費',
  '通信費',
  '消耗品費',
  '接待交際費',
  '会議費',
  '水道光熱費',
  '広告宣伝費',
  '外注費',
  '新聞図書費',
  '修繕費',
  '支払手数料',
  '福利厚生費',
  '地代家賃',
  '租税公課',
  '保険料',
  '食費',
  '雑費',
  '仕入',
  '売上',
  '業務委託収入'
];

// キーワードとカテゴリのマッピング
// 優先順位が高い順に記述
const KEYWORD_RULES: { keyword: string; category: StandardCategory }[] = [
  // 収益関連
  { keyword: '売上', category: '売上' },
  { keyword: '入金', category: '売上' },
  { keyword: '報酬', category: '売上' },
  { keyword: '業務委託', category: '売上' },

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
  { keyword: '切手', category: '通信費' },
  { keyword: '配送', category: '通信費' },
  { keyword: '送料', category: '通信費' },
  { keyword: 'ヤマト運輸', category: '通信費' },
  { keyword: '佐川急便', category: '通信費' },
  { keyword: 'レターパック', category: '通信費' },

  // 旅費交通費
  { keyword: 'Uber', category: '旅費交通費' },
  { keyword: 'Taxi', category: '旅費交通費' },
  { keyword: 'タクシー', category: '旅費交通費' },
  { keyword: 'Suica', category: '旅費交通費' },
  { keyword: 'Pasmo', category: '旅費交通費' },
  { keyword: 'Icoca', category: '旅費交通費' },
  { keyword: 'JR', category: '旅費交通費' },
  { keyword: '地下鉄', category: '旅費交通費' },
  { keyword: '電車', category: '旅費交通費' },
  { keyword: 'バス', category: '旅費交通費' },
  { keyword: '新幹線', category: '旅費交通費' },
  { keyword: '特急', category: '旅費交通費' },
  { keyword: 'Flight', category: '旅費交通費' },
  { keyword: 'Airline', category: '旅費交通費' },
  { keyword: 'ANA', category: '旅費交通費' },
  { keyword: 'JAL', category: '旅費交通費' },
  { keyword: '航空券', category: '旅費交通費' },
  { keyword: 'Parking', category: '旅費交通費' },
  { keyword: '駐車場', category: '旅費交通費' },
  { keyword: 'タイムズ', category: '旅費交通費' },
  { keyword: '宿泊', category: '旅費交通費' },
  { keyword: 'ホテル', category: '旅費交通費' },
  { keyword: '宿', category: '旅費交通費' },
  { keyword: 'Gas', category: '旅費交通費' },
  { keyword: 'ガソリン', category: '旅費交通費' },
  { keyword: '給油', category: '旅費交通費' },
  { keyword: 'Shell', category: '旅費交通費' },
  { keyword: 'Eneos', category: '旅費交通費' },
  { keyword: '出光', category: '旅費交通費' },

  // 水道光熱費
  { keyword: 'Tokyo Gas', category: '水道光熱費' },
  { keyword: 'Tepco', category: '水道光熱費' },
  { keyword: '東京電力', category: '水道光熱費' },
  { keyword: '東京ガス', category: '水道光熱費' },
  { keyword: '水道', category: '水道光熱費' },
  { keyword: 'Water', category: '水道光熱費' },
  { keyword: '電気代', category: '水道光熱費' },
  { keyword: 'ガス代', category: '水道光熱費' },

  // 広告宣伝費
  { keyword: 'Google Ads', category: '広告宣伝費' },
  { keyword: 'Meta Ads', category: '広告宣伝費' },
  { keyword: 'Facebook', category: '広告宣伝費' },
  { keyword: 'Instagram', category: '広告宣伝費' },
  { keyword: 'Twitter', category: '広告宣伝費' },
  { keyword: 'X Corp', category: '広告宣伝費' },
  { keyword: 'Ads', category: '広告宣伝費' },
  { keyword: 'Promotion', category: '広告宣伝費' },
  { keyword: 'チラシ', category: '広告宣伝費' },
  { keyword: '看板', category: '広告宣伝費' },

  // 外注費
  { keyword: 'Lancers', category: '外注費' },
  { keyword: 'Cloudworks', category: '外注費' },
  { keyword: 'Upwork', category: '外注費' },
  { keyword: 'Fiverr', category: '外注費' },
  { keyword: 'Coconala', category: '外注費' },
  { keyword: '業務委託費', category: '外注費' },
  { keyword: '制作費', category: '外注費' },

  // 消耗品費
  { keyword: 'Amazon', category: '消耗品費' },
  { keyword: 'Rakuten', category: '消耗品費' },
  { keyword: '楽天', category: '消耗品費' },
  { keyword: 'Monotaro', category: '消耗品費' },
  { keyword: 'Askul', category: '消耗品費' },
  { keyword: 'アスクル', category: '消耗品費' },
  { keyword: 'Yodobashi', category: '消耗品費' },
  { keyword: 'ヨドバシ', category: '消耗品費' },
  { keyword: 'Bic Camera', category: '消耗品費' },
  { keyword: 'ビックカメラ', category: '消耗品費' },
  { keyword: 'Apple Store', category: '消耗品費' },
  { keyword: 'Daiso', category: '消耗品費' },
  { keyword: 'ダイソー', category: '消耗品費' },
  { keyword: 'Seria', category: '消耗品費' },
  { keyword: 'セリア', category: '消耗品費' },
  { keyword: 'CanDo', category: '消耗品費' },
  { keyword: 'キャンドゥ', category: '消耗品費' },
  { keyword: '文具', category: '消耗品費' },
  { keyword: '文房具', category: '消耗品費' },
  { keyword: 'ペン', category: '消耗品費' },
  { keyword: 'ノート', category: '消耗品費' },
  { keyword: 'コピー用紙', category: '消耗品費' },
  { keyword: 'マウス', category: '消耗品費' },
  { keyword: 'キーボード', category: '消耗品費' },
  { keyword: 'PC周辺機器', category: '消耗品費' },
  { keyword: '備品', category: '消耗品費' },
  { keyword: '消耗品', category: '消耗品費' },
  { keyword: '100均', category: '消耗品費' },

  // 新聞図書費
  { keyword: '書籍', category: '新聞図書費' },
  { keyword: '本', category: '新聞図書費' },
  { keyword: '雑誌', category: '新聞図書費' },
  { keyword: '新聞', category: '新聞図書費' },
  { keyword: 'kindle', category: '新聞図書費' },
  { keyword: '日経', category: '新聞図書費' },
  { keyword: '図書', category: '新聞図書費' },

  // 会議費・交際費
  { keyword: 'Starbucks', category: '会議費' },
  { keyword: 'スターバックス', category: '会議費' },
  { keyword: 'スタバ', category: '会議費' },
  { keyword: 'Doutor', category: '会議費' },
  { keyword: 'ドトール', category: '会議費' },
  { keyword: 'Tully', category: '会議費' },
  { keyword: 'タリーズ', category: '会議費' },
  { keyword: 'Cafe', category: '会議費' },
  { keyword: 'カフェ', category: '会議費' },
  { keyword: '喫茶店', category: '会議費' },
  { keyword: 'Coffee', category: '会議費' },
  { keyword: 'コーヒー', category: '会議費' },
  { keyword: '打ち合わせ', category: '会議費' },
  { keyword: '会議室', category: '会議費' },
  { keyword: 'Restaurant', category: '接待交際費' },
  { keyword: 'レストラン', category: '接待交際費' },
  { keyword: 'Izakaya', category: '接待交際費' },
  { keyword: '居酒屋', category: '接待交際費' },
  { keyword: '飲み会', category: '接待交際費' },
  { keyword: '宴会', category: '接待交際費' },
  { keyword: '接待', category: '接待交際費' },
  { keyword: '土産', category: '接待交際費' },
  { keyword: '御祝', category: '接待交際費' },
  { keyword: '慶弔', category: '接待交際費' },
  { keyword: 'Bar', category: '接待交際費' },

  // 食費
  { keyword: 'ランチ', category: '食費' },
  { keyword: '昼食', category: '食費' },
  { keyword: '夕食', category: '食費' },
  { keyword: 'ディナー', category: '食費' },
  { keyword: '弁当', category: '食費' },
  { keyword: 'スーパー', category: '食費' },
  { keyword: 'コンビニ', category: '食費' },
  { keyword: 'セブンイレブン', category: '食費' },
  { keyword: 'ローソン', category: '食費' },
  { keyword: 'ファミリーマート', category: '食費' },
  { keyword: 'ファミマ', category: '食費' },
  { keyword: '食品', category: '食費' },
  { keyword: '飲料', category: '食費' },

  // 支払手数料
  { keyword: 'Fee', category: '支払手数料' },
  { keyword: 'Charge', category: '支払手数料' },
  { keyword: '振込手数料', category: '支払手数料' },
  { keyword: '仲介手数料', category: '支払手数料' },
  { keyword: 'システム利用料', category: '支払手数料' },

  // 修繕費
  { keyword: '修理', category: '修繕費' },
  { keyword: '修繕', category: '修繕費' },
  { keyword: 'メンテナンス', category: '修繕費' },

  // 地代家賃
  { keyword: '家賃', category: '地代家賃' },
  { keyword: '貸事務所', category: '地代家賃' },
  { keyword: 'アパート', category: '地代家賃' },

  // 租税公課
  { keyword: '税金', category: '租税公課' },
  { keyword: '印紙', category: '租税公課' },
  { keyword: '固定資産税', category: '租税公課' },

  // 保険料
  { keyword: '保険', category: '保険料' },
  { keyword: '損保', category: '保険料' },
  { keyword: '生保', category: '保険料' },
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
