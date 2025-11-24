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
  INSURANCE: '保険料',
  RENT: '家賃',
  LOAN: 'ローン返済',
  TAX: '税金',
  SALARY: '給与',
  BONUS: '賞与',
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
    '居酒屋', 'バー', '食堂', 'フード', 'ドリンク', 'お茶', 'コーヒー',
    'コンビニ', '牛丼', '定食', 'ラーメン', 'うどん', 'そば', 'パスタ',
    'ピザ', 'ハンバーグ', 'オムライス', 'カレー', '丼物', '惣菜'
  ],
  [CATEGORIES.TRANSPORT]: [
    'タクシー', '交通', '鉄道', 'バス', '駅', '切符', '定期券', 'Suica', 'PASMO',
    'JR', '地下鉄', 'メトロ', '航空', '飛行機', '空港', 'ガソリン', '給油',
    '駐車場', 'パーキング', '高速道路', 'ETC', '出張', '旅費',
    '電車', '新幹線', '特急', '急行', '快速', '普通', '各駅停車',
    'モノレール', 'ケーブルカー', '路面電車', ' tram', ' ferry', '船',
    'レンタカー', 'カーシェアリング', 'Uber', 'Lyft'
  ],
  [CATEGORIES.SUPPLIES]: [
    'ドラッグストア', '薬局', 'マツモトキヨシ', 'ウエルシア', 'ツルハ',
    'ユニクロ', 'GU', '無印良品', 'ニトリ', 'ダイソー', 'セリア', 'キャンドゥ',
    'ドン・キホーテ', 'ホームセンター', 'カインズ', 'コーナン', '文具', '事務用品',
    '日用品', '雑貨', '洗剤', 'トイレットペーパー', 'ティッシュ', 'コピー', '印刷',
    'オフィス用品', '消耗品', 'インク', 'トナー', '紙', 'ファイル', 'ノート',
    'ボールペン', 'シャープペンシル', '消しゴム', '定規', 'はさみ', 'のり',
    'ホッチキス', 'ステープラー', 'テープ', '養生テープ', 'ビニール袋'
  ],
  [CATEGORIES.ENTERTAINMENT]: [
    '居酒屋', 'カラオケ', 'ゴルフ', 'チケット', '映画', 'コンサート', 'イベント',
    'ギフト', '贈答', 'お土産', '接待', '会食', 'パーティ',
    '遊園地', 'テーマパーク', '水族館', '動物園', '美術館', '博物館',
    'ゲームセンター', 'パチンコ', '競馬', '競艇', 'オートレース',
    '旅行', '観光', '宿泊', 'ホテル', '旅館', '民宿'
  ],
  [CATEGORIES.COMMUNICATION]: [
    '携帯', 'スマホ', '電話', 'インターネット', 'Wi-Fi', 'プロバイダ',
    'ドコモ', 'au', 'ソフトバンク', '楽天モバイル', '切手', '郵便', '宅配', '送料',
    'Skype', 'Zoom', 'Teams', 'Slack', 'LINE', 'WhatsApp', 'Telegram',
    'Netflix', 'Amazon Prime', 'Disney+', 'Spotify', 'Apple Music',
    'Yahoo! BB', 'NURO', 'So-net', 'BIGLOBE', 'OCN', 'ぷらら'
  ],
  [CATEGORIES.UTILITIES]: [
    '電気', 'ガス', '水道', '東京電力', '関西電力', '東京ガス', '大阪ガス', '水道局',
    'エネオス', '出光', 'コスモ', 'シェル', 'エネオス', 'JOMO', '千葉石油',
    '灯油', 'プロパン', '都市ガス', '天然ガス', '水道料金', '下水道',
    '電力量', 'ガス使用量', '水使用量', '基本料金', '従量料金'
  ],
  [CATEGORIES.INSURANCE]: [
    '保険', '生命保険', '損害保険', '医療保険', '生命', '損害', '医療',
    '年金', '共済', 'JA共済', 'あんしん', '損害', '生命保険料', '損害保険料'
  ],
  [CATEGORIES.RENT]: [
    '家賃', '賃料', '賃貸', 'マンション', 'アパート', '物件', '不動産',
    '敷金', '礼金', '保証金', '共益費', '管理費'
  ],
  [CATEGORIES.LOAN]: [
    'ローン', '返済', '借入', 'カードローン', '住宅ローン', '教育ローン', '車両ローン',
    'カードローン返済', '住宅ローン返済', '教育ローン返済', '車両ローン返済'
  ],
  [CATEGORIES.TAX]: [
    '税', '税金', '所得税', '住民税', '固定資産税', '自動車税', '軽自動車税',
    '国民健康保険税', '後期高齢者医療保険', '国民年金保険料'
  ],
  [CATEGORIES.SALARY]: [
    '給与', '給料', '月給', '時給', '日給', 'ボーナス', '賞与', '手当',
    '残業代', '割増賃金', '退職金'
  ],
  [CATEGORIES.BONUS]: [
    'ボーナス', '賞与', '特別手当', '一時金', 'インセンティブ', '歩合'
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
          scores[category] += 15; // 店舗名の一致は重みをさらに高く
        }
      }
    }

    // 2. 商品名による判定
    for (const item of items) {
      for (const [category, keywords] of Object.entries(KEYWORD_DICTIONARY)) {
        for (const keyword of keywords) {
          if (item.name.includes(keyword)) {
            scores[category] += 5; // 商品名の一致も重みを高く
          }
        }
      }
    }

    // 3. テキスト全体からのキーワード検索
    for (const [category, keywords] of Object.entries(KEYWORD_DICTIONARY)) {
      for (const keyword of keywords) {
        // 店舗名と商品名に含まれるキーワードは重みを下げる
        const isInStoreName = storeName.includes(keyword);
        const isInItems = items.some(item => item.name.includes(keyword));
        
        if (text.includes(keyword)) {
          if (isInStoreName || isInItems) {
            scores[category] += 1; // 既にカウント済みのキーワードは重みを低く
          } else {
            scores[category] += 2; // 新しいキーワードは重みを中程度
          }
        }
      }
    }

    // 4. 特殊なパターンの検出
    // 給与やボーナスのパターン
    if (text.includes('給与') || text.includes('給料') || text.includes('月給') || 
        text.includes('時給') || text.includes('日給') || text.includes('手当')) {
      scores[CATEGORIES.SALARY] += 20;
    }
    
    if (text.includes('ボーナス') || text.includes('賞与') || text.includes('特別手当')) {
      scores[CATEGORIES.BONUS] += 20;
    }
    
    // 保険料のパターン
    if (text.includes('保険') && (text.includes('料') || text.includes('金'))) {
      scores[CATEGORIES.INSURANCE] += 15;
    }
    
    // 家賃のパターン
    if (text.includes('家賃') || text.includes('賃料') || text.includes('賃貸')) {
      scores[CATEGORIES.RENT] += 15;
    }
    
    // ローン返済のパターン
    if (text.includes('ローン') && text.includes('返済')) {
      scores[CATEGORIES.LOAN] += 15;
    }
    
    // 税金のパターン
    if (text.includes('税') && (text.includes('金') || text.includes('料'))) {
      scores[CATEGORIES.TAX] += 10;
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
    
    // よく知られた店舗名のリスト（大幅に拡充）
    const merchantKeywords = [
      // コンビニエンスストア
      'セブンイレブン', 'セブン-イレブン', 'セブン', '7-ELEVEN', '7-11', '7ELEVEN',
      'ローソン', 'LAWSON', 'ナチュラルローソン', 'ローソンストア100',
      'ファミリーマート', 'ファミマ', 'FamilyMart', 'FAMILY MART',
      'ミニストップ', 'MINISTOP',
      'デイリーヤマザキ', 'ヤマザキデイリーストア',
      'ニューデイズ', 'NewDays',
      'ポプラ', 'くらしハウス',
      
      // スーパーマーケット
      'イオン', 'AEON', 'マックスバリュ', 'MaxValu', 'ザ・ビッグ', 'まいばすけっと',
      'イトーヨーカドー', 'ヨーカドー', 'ItoYokado',
      'ライフ', 'LIFE',
      'サミット', 'Summit',
      '西友', 'SEIYU',
      'マルエツ', 'Maruetsu',
      'ダイエー', 'DAIEI',
      '成城石井', '成城',
      'カルディ', 'KALDI', 'カルディコーヒーファーム',
      '業務スーパー',
      'オーケー', 'OK', 'オーケーストア',
      'コープ', 'COOP', '生協',
      'ヤオコー',
      'ベルク',
      'ベイシア',
      'トライアル',
      'ドン・キホーテ', 'ドンキ', 'ドンキホーテ', 'MEGAドンキ',
      
      // 飲食店（ファストフード）
      'マクドナルド', "McDonald's", 'マック', 'McDonalds',
      'モスバーガー', 'モス', 'MOS BURGER',
      'ロッテリア', 'LOTTERIA',
      'ケンタッキー', 'KFC', 'ケンタッキーフライドチキン',
      'バーガーキング', 'BURGER KING',
      'フレッシュネスバーガー',
      'サブウェイ', 'SUBWAY',
      'ミスタードーナツ', 'ミスド', 'Mister Donut',
      
      // 飲食店（カフェ）
      'スターバックス', 'スタバ', 'Starbucks', 'STARBUCKS',
      'ドトール', 'DOUTOR',
      'タリーズ', 'TULLY\'S', 'タリーズコーヒー',
      'コメダ珈琲', 'コメダ', 'KOMEDA',
      'サンマルクカフェ', 'サンマルク',
      'プロント', 'PRONTO',
      '上島珈琲',
      'カフェ・ド・クリエ',
      'ベローチェ',
      
      // 飲食店（牛丼・定食）
      'すき家', 'すきや', 'SUKIYA',
      '吉野家', 'YOSHINOYA',
      '松屋', 'MATSUYA',
      'なか卯', 'NAKAU',
      'てんや',
      '大戸屋', 'OOTOYA',
      'やよい軒',
      
      // 飲食店（ファミレス）
      'ガスト', 'GUSTO',
      'サイゼリヤ', 'Saizeriya',
      'ジョナサン', 'Jonathan\'s',
      'バーミヤン',
      'ロイヤルホスト',
      'デニーズ', 'Denny\'s',
      'ココス', 'COCO\'S',
      'ビッグボーイ',
      
      // 飲食店（回転寿司）
      'くら寿司', 'くらずし', '無添くら寿司',
      'スシロー', 'SUSHIRO',
      'はま寿司', 'はまずし',
      'かっぱ寿司', 'かっぱずし',
      '魚べい',
      
      // 飲食店（その他）
      'サイゼリア',
      'リンガーハット',
      '丸亀製麺',
      'はなまるうどん',
      '天下一品',
      '一風堂',
      '日高屋',
      '王将', '餃子の王将',
      'ペッパーランチ',
      
      // ドラッグストア
      'マツモトキヨシ', 'マツキヨ', 'matsukiyo',
      'ウエルシア', 'Welcia',
      'ツルハドラッグ', 'ツルハ',
      'サンドラッグ', 'SUNDRUG',
      'スギ薬局', 'スギヤマ',
      'ココカラファイン',
      'クリエイト',
      'コスモス',
      'セイムス',
      'ダイコクドラッグ',
      'トモズ',
      
      // 家電量販店
      'ビックカメラ', 'ビッグカメラ', 'BIC CAMERA',
      'ヨドバシカメラ', 'ヨドバシ', 'Yodobashi',
      'ヤマダ電機', 'ヤマダデンキ', 'YAMADA',
      'エディオン', 'EDION',
      'ケーズデンキ', 'K\'s',
      'ジョーシン', 'Joshin',
      'ノジマ',
      'コジマ',
      'ソフマップ',
      'ベスト電器',
      
      // ファッション・アパレル
      'ユニクロ', 'UNIQLO',
      'GU', 'ジーユー',
      'しまむら',
      'ライトオン',
      'ハニーズ',
      'ZARA', 'ザラ',
      'H&M',
      'GAP', 'ギャップ',
      'ユナイテッドアローズ',
      'ビームス', 'BEAMS',
      'アーバンリサーチ',
      
      // 生活雑貨・インテリア
      'ニトリ', 'NITORI',
      '無印良品', 'MUJI',
      'ダイソー', 'DAISO', '100円ショップ',
      'セリア', 'Seria',
      'キャンドゥ', 'Can Do',
      'フランフラン',
      '東急ハンズ', 'ハンズ', 'HANDS',
      'ロフト', 'LOFT',
      
      // ホームセンター
      'カインズ', 'CAINZ',
      'コーナン', 'KOHNAN',
      'コメリ',
      'ビバホーム',
      'ジョイフル本田',
      'ケーヨーデイツー', 'D2',
      
      // 百貨店
      '高島屋', 'タカシマヤ',
      '伊勢丹', 'ISETAN',
      '三越', 'MITSUKOSHI',
      '大丸', 'DAIMARU',
      '松坂屋',
      '阪急百貨店', '阪急',
      '阪神百貨店', '阪神',
      '西武', '西武百貨店',
      '東武', '東武百貨店',
      '小田急百貨店',
      '京王百貨店',
      '近鉄百貨店',
      
      // 書店
      '紀伊國屋書店', '紀伊国屋',
      'ジュンク堂',
      '丸善',
      'TSUTAYA', 'ツタヤ',
      'ブックオフ', 'BOOKOFF',
      '有隣堂',
      '三省堂書店',
      
      // その他小売
      'ヤマダ電機',
      'ビックカメラ',
      'ヨドバシカメラ',
      'トイザらス',
      'ベビーザらス',
      'ABCマート',
      'アスビー',
      '眼鏡市場',
      'JINS', 'ジンズ',
      'Zoff', 'ゾフ',
      
      // ガソリンスタンド
      'ENEOS', 'エネオス',
      '出光', 'Idemitsu',
      'コスモ石油', 'COSMO',
      'シェル', 'Shell',
      'エッソ', 'Esso',
      'モービル', 'Mobil',
      
      // その他
      'Amazon', 'アマゾン',
      '楽天', 'Rakuten',
      'メルカリ',
      'ヤフオク', 'Yahoo!',
      'PayPay',
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
          if (line.length > 2 && line.length < 20 && !line.match(/[\d\/\-\.\:\s]+$/)) {
            return line;
          }
        }
      }
    }

    // 3. 最初の行を使用（フォールバック）
    if (lines.length > 0) {
      const firstLine = lines[0];
      if (firstLine.length > 1 && !/^[\d\s\-\/\.\:¥￥]+$/.test(firstLine)) {
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
