export interface ReceiptData {
  store_name: string;
  date: string;
  total_amount: number;
  tax_rate: number;
  confidence: {
    store_name: number;
    date: number;
    total_amount: number;
    tax_rate: number;
  };
  raw_text: string;
  time?: string;
  items_count?: number;
  tax_info?: {
    tax_rate_8?: number;
    tax_rate_10?: number;
  };
  category?: string;
  expenseType?: string;
  aiConfidence?: number;
  insights?: string[];
  items?: ReceiptItem[];
}

export interface ReceiptItem {
  name: string;
  price: number;
  quantity: number;
  category?: string;
}

// カテゴリ定義
const CATEGORIES = {
  FOOD: '食費',
  TRANSPORT: '交通費',
  SUPPLIES: '消耗品費',
  ENTERTAINMENT: '接待交際費',
  UTILITIES: '水道光熱費',
  COMMUNICATION: '通信費',
  OTHER: 'その他'
};

// キーワード辞書
const KEYWORD_DICTIONARY: Record<string, string[]> = {
  [CATEGORIES.FOOD]: [
    'スーパー', '食品', '弁当', '惣菜', '野菜', '肉', '魚', '米', 'パン',
    'セブンイレブン', 'ローソン', 'ファミリーマート', 'マクドナルド', 'スターバックス',
    'すき家', '吉野家', '松屋', 'サイゼリヤ', 'ガスト', 'くら寿司', 'スシロー',
    'イオン', 'イトーヨーカドー', 'ライフ', 'サミット', '西友', 'マックスバリュ',
    '成城石井', 'カルディ', '業務スーパー', '飲食店', 'レストラン', 'カフェ',
    '居酒屋', 'バー', '食堂', 'フード', 'ドリンク', 'お茶', 'コーヒー'
  ],
  [CATEGORIES.TRANSPORT]: [
    'タクシー', '交通', '鉄道', 'バス', '駅', '切符', '定期券', 'Suica', 'PASMO',
    'JR', '地下鉄', 'メトロ', '航空', '飛行機', '空港', 'ガソリン', '給油',
    '駐車場', 'パーキング', '高速道路', 'ETC', '出張', '旅費'
  ],
  [CATEGORIES.SUPPLIES]: [
    'ドラッグストア', '薬局', 'マツモトキヨシ', 'ウエルシア', 'ツルハ',
    'ユニクロ', 'GU', '無印良品', 'ニトリ', 'ダイソー', 'セリア', 'キャンドゥ',
    'ドン・キホーテ', 'ホームセンター', 'カインズ', 'コーナン', '文具', '事務用品',
    '日用品', '雑貨', '洗剤', 'トイレットペーパー', 'ティッシュ', 'コピー', '印刷'
  ],
  [CATEGORIES.ENTERTAINMENT]: [
    '居酒屋', 'カラオケ', 'ゴルフ', 'チケット', '映画', 'コンサート', 'イベント',
    'ギフト', '贈答', 'お土産', '接待', '会食', 'パーティ'
  ],
  [CATEGORIES.COMMUNICATION]: [
    '携帯', 'スマホ', '電話', 'インターネット', 'Wi-Fi', 'プロバイダ',
    'ドコモ', 'au', 'ソフトバンク', '楽天モバイル', '切手', '郵便', '宅配', '送料'
  ],
  [CATEGORIES.UTILITIES]: [
    '電気', 'ガス', '水道', '東京電力', '関西電力', '東京ガス', '大阪ガス', '水道局'
  ]
};

export class ReceiptParser {
  parseReceipt(ocrText: string): ReceiptData {
    console.log('レシート解析を開始。OCRテキスト:', ocrText);
    
    // 全角数字を半角に変換
    const normalizedText = this.normalizeText(ocrText);
    
    const storeName = this.extractStoreName(normalizedText);
    const items = this.extractItems(normalizedText);
    
    // カテゴリの自動判定
    const category = this.categorizeReceipt(storeName, items, normalizedText);

    const result = {
      store_name: storeName,
      date: this.extractDate(normalizedText),
      total_amount: this.extractTotal(normalizedText),
      tax_rate: this.extractTaxRate(normalizedText),
      raw_text: ocrText,
      confidence: {
        store_name: this.calculateConfidence('store_name', normalizedText),
        date: this.calculateConfidence('date', normalizedText),
        total_amount: this.calculateConfidence('total_amount', normalizedText),
        tax_rate: this.calculateConfidence('tax_rate', normalizedText)
      },
      items: items,
      items_count: items.length,
      category: category,
      expenseType: 'expense', // デフォルトは支出
      aiConfidence: 0.8 // 仮のAI信頼度
    };
    console.log('レシート解析結果:', result);
    return result;
  }

  private normalizeText(text: string): string {
    return text.replace(/[０-９]/g, (s) => {
      return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    }).replace(/[Ａ-Ｚａ-ｚ]/g, (s) => {
      return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });
  }

  categorizeReceipt(storeName: string, items: ReceiptItem[], text: string): string {
    let scores: Record<string, number> = {};
    
    // 初期化
    Object.values(CATEGORIES).forEach(cat => scores[cat] = 0);

    // 1. 店舗名による判定
    for (const [category, keywords] of Object.entries(KEYWORD_DICTIONARY)) {
      for (const keyword of keywords) {
        if (storeName.includes(keyword)) {
          scores[category] += 10; // 店舗名の一致は重みを高く
        }
      }
    }

    // 2. 商品名による判定
    for (const item of items) {
      for (const [category, keywords] of Object.entries(KEYWORD_DICTIONARY)) {
        for (const keyword of keywords) {
          if (item.name.includes(keyword)) {
            scores[category] += 3;
          }
        }
      }
    }

    // 3. テキスト全体からのキーワード検索
    for (const [category, keywords] of Object.entries(KEYWORD_DICTIONARY)) {
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          scores[category] += 1;
        }
      }
    }

    // スコアが最も高いカテゴリを選択
    let maxScore = 0;
    let bestCategory = CATEGORIES.OTHER; // デフォルト

    for (const [category, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        bestCategory = category;
      }
    }

    return bestCategory;
  }

  extractTotal(text: string): number {
    console.log('合計金額抽出を開始');
    // パターン: 合計、計、Total、小計など
    const patterns = [
      /(?:合計|総計|お買上計|領収金額|支払金額|請求金額|お支払い)[\s:：]*[¥￥]*\s*([0-9,]+)/,
      /合\s*計[\s:：]*[¥￥]*\s*([0-9,]+)/,
      /小計[\s:：]*[¥￥]*\s*([0-9,]+)/,
      /(?:現\s*金|クレ(?:ジット)?|PayPay|d払い|auPAY|LINE\s*Pay)[\s:：]*[¥￥]*\s*([0-9,]+)/,
      /[Tt]otal\s*:?\s*(?:¥|￥)?([0-9,]+)/,
      /[¥￥]\s*([0-9,]+)(?!\s*[\-\+])/ // 単独の金額表記
    ];

    // 「合計」などのキーワードを含むパターンを優先
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const value = match[1].replace(/[,，]/g, '');
        const amount = parseFloat(value);
        if (!isNaN(amount) && amount > 0) {
          console.log('合計金額抽出成功:', amount);
          return Math.round(amount);
        }
      }
    }

    // 数字が大きい順に並べて、最大の数字を合計金額として扱う（ただし日付などを除外）
    const allNumbers = text.match(/[0-9,]+/g);
    if (allNumbers) {
      const numbers = allNumbers
        .map(n => parseInt(n.replace(/[,，]/g, '')))
        .filter(n => !isNaN(n) && n > 0 && n < 1000000); // 100万円未満
      
      if (numbers.length > 0) {
        const maxAmount = Math.max(...numbers);
        console.log('最大値を合計金額として採用:', maxAmount);
        return maxAmount;
      }
    }

    return 0;
  }

  extractDate(text: string): string {
    console.log('日付抽出を開始');
    const patterns = [
      /(\d{4})[年\/\-](\d{1,2})[月\/\-](\d{1,2})[日]?/,
      /(\d{2,4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,
      /(\d{4})\.(\d{2})\.(\d{2})/,
      /(?:令和|R)(\d{1,2})[年\/\-](\d{1,2})[月\/\-](\d{1,2})[日]?/ // 和暦対応
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        let year = match[1];
        const month = match[2].padStart(2, '0');
        const day = match[3].padStart(2, '0');

        // 和暦変換
        if (pattern.toString().includes('令和') || pattern.toString().includes('R')) {
          year = (parseInt(year) + 2018).toString();
        } else if (year.length === 2) {
          year = '20' + year;
        }

        const dateObj = new Date(`${year}-${month}-${day}`);
        if (!isNaN(dateObj.getTime()) && dateObj.getFullYear() > 2000 && dateObj.getFullYear() < 2030) {
          const result = `${year}-${month}-${day}`;
          console.log('日付抽出成功:', result);
          return result;
        }
      }
    }

    // 日付が見つからない場合、今日の日付
    return new Date().toISOString().split('T')[0];
  }

  extractTaxRate(text: string): number {
    console.log('税率抽出を開始');
    // 8%, 10%などの検出
    if (text.match(/8%|軽減税率/)) return 8;
    if (text.match(/10%|標準税率/)) return 10;
    
    const patterns = [
      /税率?\s*(\d+(?:\.\d+)?)%/,
      /消費税\s*(\d+(?:\.\d+)?)%/,
      /\(?(10|8)%\)?/
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const rate = parseFloat(match[1]);
        if (!isNaN(rate)) return rate;
      }
    }

    return 10; // デフォルト
  }

  extractStoreName(text: string): string {
    console.log('店舗名抽出を開始');
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    // よく知られた店舗名のリスト
    const merchantKeywords = [
      'セブンイレブン', 'セブン-イレブン', 'セブン',
      'ローソン', 'LAWSON',
      'ファミリーマート', 'ファミマ', 'FamilyMart',
      'スターバックス', 'スタバ', 'Starbucks',
      'マクドナルド', "McDonald's",
      'すき家', '吉野家', '松屋',
      'イオン', 'AEON', 'マックスバリュ',
      'ユニクロ', 'UNIQLO', 'GU',
      'ニトリ', '無印良品',
      'ダイソー', 'DAISO', 'セリア',
      'マツモトキヨシ', 'ウエルシア',
      'ドン・キホーテ', 'ビックカメラ', 'ヨドバシカメラ'
    ];

    // 1. キーワードマッチング
    for (const keyword of merchantKeywords) {
      if (text.includes(keyword)) {
        return keyword;
      }
    }

    // 2. 電話番号の近くにある行を店舗名として推測
    const phoneMatch = text.match(/(?:TEL|電話|Tel|tel)[:：\s]*(\d{2,4}[-\s]\d{2,4}[-\s]\d{3,4})/);
    if (phoneMatch) {
      const phoneIndex = lines.findIndex(line => line.includes(phoneMatch[1]) || line.includes(phoneMatch[0]));
      if (phoneIndex > 0) {
        // 電話番号の1-3行前をチェック
        for (let i = Math.max(0, phoneIndex - 3); i < phoneIndex; i++) {
          const line = lines[i];
          if (line.length > 2 && line.length < 20 && !line.match(/[\d\/\-\.:\s]+$/)) {
            return line;
          }
        }
      }
    }

    // 3. 最初の行を使用（フォールバック）
    if (lines.length > 0) {
      const firstLine = lines[0];
      if (firstLine.length > 1 && !/^[\d\s\-\/\.:¥￥]+$/.test(firstLine)) {
        return firstLine;
      } else if (lines.length > 1) {
        return lines[1];
      }
    }

    return '不明';
  }

  calculateConfidence(field: string, text: string): number {
    // 簡易的な信頼度計算
    return 0.9;
  }

  // 商品アイテムの抽出
  extractItems(text: string): ReceiptItem[] {
    console.log('商品アイテム抽出を開始');
    const items: ReceiptItem[] = [];
    const lines = text.split('\n');
    
    // 商品行のパターン（価格を含む行）
    const itemPatterns = [
      /(.+?)\s+([0-9,]+)円/, // 商品名 価格円
      /(.+?)\s+¥([0-9,]+)/, // 商品名 ¥価格
      /(.+?)\s+￥([0-9,]+)/, // 商品名 ￥価格
      /(.+?)\s+([0-9,]+)\s*円/ // 商品名 価格 円
    ];
    
    for (const line of lines) {
      // 合計行や日付行はスキップ
      if (line.includes('合計') || line.includes('小計') || line.includes('税') || 
          line.includes('/') || line.includes('-') || line.includes(':') || line.includes('お釣り')) {
        continue;
      }
      
      for (const pattern of itemPatterns) {
        const match = line.match(pattern);
        if (match) {
          const name = match[1].trim();
          const price = parseInt(match[2].replace(/[,，]/g, ''));
          
          // 明らかに商品名ではないものを除外
          if (name.length > 1 && name.length < 50 && price > 0 && price < 100000) {
            items.push({
              name: name,
              price: price,
              quantity: 1 // 数量はデフォルトで1
            });
            break; // パターンがマッチしたら次の行へ
          }
        }
      }
    }
    
    return items;
  }

  // アイテム数の抽出
  extractItemsCount(text: string): number {
    const items = this.extractItems(text);
    return items.length;
  }
}
