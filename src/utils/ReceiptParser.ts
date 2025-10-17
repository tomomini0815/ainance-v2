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
  raw_text: string; // OCRから得られた元のテキスト
  time?: string; // 時刻情報（ある場合）
  items_count?: number; // アイテム数（ある場合）
  tax_info?: {
    tax_rate_8?: number;
    tax_rate_10?: number;
  };
  // 新しいフィールドを追加
  category?: string; // カテゴリ
  expenseType?: string; // 支出の種類
  aiConfidence?: number; // AIによる信頼度
  insights?: string[]; // 分析インサイト
  items?: ReceiptItem[]; // 商品アイテム
}

// 商品アイテムのインターフェースを追加
export interface ReceiptItem {
  name: string;
  price: number;
  quantity: number;
  category?: string;
}

export class ReceiptParser {
  parseReceipt(ocrText: string): ReceiptData {
    console.log('レシート解析を開始。OCRテキスト:', ocrText);
    const result = {
      store_name: this.extractStoreName(ocrText),
      date: this.extractDate(ocrText),
      total_amount: this.extractTotal(ocrText),
      tax_rate: this.extractTaxRate(ocrText),
      raw_text: ocrText,
      confidence: {
        store_name: this.calculateConfidence('store_name', ocrText),
        date: this.calculateConfidence('date', ocrText),
        total_amount: this.calculateConfidence('total_amount', ocrText),
        tax_rate: this.calculateConfidence('tax_rate', ocrText)
      },
      items: this.extractItems(ocrText), // 商品アイテムを抽出
      items_count: this.extractItemsCount(ocrText) // アイテム数を抽出
    };
    console.log('レシート解析結果:', result);
    return result;
  }

  extractTotal(text: string): number {
    console.log('合計金額抽出を開始');
    // パターン: 合計、計、Total、小計など
    const patterns = [
      /合計[^\d]*(?:¥|￥)?[\d,]+\.?\d*円?/,
      /計[^\d]*(?:¥|￥)?[\d,]+\.?\d*円?/,
      /Total[^\d]*(?:¥|￥)?[\d,]+\.?\d*/,
      /お買上金額[^\d]*(?:¥|￥)?[\d,]+\.?\d*円?/,
      /お会計[^\d]*(?:¥|￥)?[\d,]+\.?\d*円?/,
      /合\s*計[^\d]*(?:¥|￥)?[\d,]+\.?\d*円?/,
      /総合計[^\d]*(?:¥|￥)?[\d,]+\.?\d*円?/,
      /[合計金額合計][^\d]*(?:¥|￥)?[\d,]+\.?\d*円?/,
      /お支払総額[^\d]*(?:¥|￥)?[\d,]+\.?\d*円?/,
      /お支払い金額[^\d]*(?:¥|￥)?[\d,]+\.?\d*円?/,
      /支払金額[^\d]*(?:¥|￥)?[\d,]+\.?\d*円?/,
      /お支払[^\d]*(?:¥|￥)?[\d,]+\.?\d*円?/,
      /[Tt]otal\s*:?\s*(?:¥|￥)?[\d,]+\.?\d*/,
      /[Ss]ubtotal\s*:?\s*(?:¥|￥)?[\d,]+\.?\d*/,
      /ご購入金額[^\d]*(?:¥|￥)?[\d,]+\.?\d*円?/
    ];

    // 最も高い金額を持つパターンを見つける
    let maxAmount = 0;
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        console.log('合計金額のパターンマッチ:', match[0]);
        // 金額部分を抽出
        const amountMatch = match[0].match(/(?:¥|￥)?([\d,]+\.?\d*)円?/);
        if (amountMatch) {
          console.log('金額部分の抽出:', amountMatch[1]);
          const value = amountMatch[1].replace(/,/g, '');
          const amount = parseFloat(value);
          if (!isNaN(amount) && amount > maxAmount) {
            maxAmount = amount;
          }
        }
      }
    }

    if (maxAmount > 0) {
      console.log('合計金額抽出成功:', maxAmount);
      return Math.round(maxAmount);
    }

    // 数字が大きい順に並べて、最後の数字を合計金額として扱う
    const numberMatches = text.match(/(?:¥|￥)?([\d,]+\.?\d*)円?/g);
    if (numberMatches && numberMatches.length > 0) {
      console.log('数字マッチ:', numberMatches);
      const numbers = numberMatches
        .map(match => {
          const value = match.replace(/[^0-9.]/g, '');
          return parseFloat(value);
        })
        .filter(num => !isNaN(num))
        .sort((a, b) => b - a);
      
      if (numbers.length > 0) {
        console.log('ソートされた数字:', numbers);
        console.log('最大の数字を合計金額として採用:', numbers[0]);
        return Math.round(numbers[0]);
      }
    }

    // 最後の手段として、テキスト全体から最大の数字を探す
    const allNumbers = text.match(/[\d,]+\.?\d*/g);
    if (allNumbers && allNumbers.length > 0) {
      console.log('すべての数字:', allNumbers);
      const numbers = allNumbers
        .map(num => parseFloat(num.replace(/,/g, '')))
        .filter(num => !isNaN(num))
        .sort((a, b) => b - a);
      
      if (numbers.length > 0) {
        console.log('すべての数字から最大値を採用:', numbers[0]);
        return Math.round(numbers[0]);
      }
    }

    console.log('合計金額の抽出に失敗');
    return 0;
  }

  extractDate(text: string): string {
    console.log('日付抽出を開始');
    // パターン: YYYY/MM/DD, YYYY年MM月DD日など
    const patterns = [
      /(\d{4})[/年\-\.](\d{1,2})[/月\-\.](\d{1,2})\s*日?/,
      /(\d{2})[/年\-\.](\d{1,2})[/月\-\.](\d{1,2})\s*日?/,
      /(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日/,
      /(\d{1,2})[/\-\.](\d{1,2})[/\-\.](\d{4})/,
      /(\d{4})[/\-\.](\d{1,2})[/\-\.](\d{1,2})\s*T\d{2}:\d{2}:\d{2}/,
      /(\d{4})[/年\-\.](\d{1,2})[/月\-\.](\d{1,2})\s*\d{1,2}:\d{2}/,
      /(\d{1,2})月(\d{1,2})日(\d{4})年/,
      /(\d{1,2})\/(\d{1,2})\/(\d{2})/,
      /(\d{1,2})[-\.](\d{1,2})[-\.](\d{2})/,
      /[Dd]ate\s*:?\s*(\d{4})[/\-\.](\d{1,2})[/\-\.](\d{1,2})/,
      /[Dd]ate\s*:?\s*(\d{1,2})[/\-\.](\d{1,2})[/\-\.](\d{4})/
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        console.log('日付のパターンマッチ:', match);
        let year, month, day;
        
        // 日付形式によってグループの順序が異なる
        if (pattern.toString().includes('(\\d{1,2})[/\\-\\.](\\d{1,2})[/\\-\\.](\\d{4})')) {
          // MM/DD/YYYY 形式
          month = match[1].padStart(2, '0');
          day = match[2].padStart(2, '0');
          year = match[3];
        } else if (pattern.toString().includes('(\\d{1,2})月(\\d{1,2})日(\\d{4})年')) {
          // MM月DD日YYYY年 形式
          month = match[1].padStart(2, '0');
          day = match[2].padStart(2, '0');
          year = match[3];
        } else if (pattern.toString().includes('(\\d{1,2})\\/(\\d{1,2})\\/(\\d{2})') || 
                   pattern.toString().includes('(\\d{1,2})[-\\.](\\d{1,2})[-\\.](\\d{2})')) {
          // MM/DD/YY 形式
          month = match[1].padStart(2, '0');
          day = match[2].padStart(2, '0');
          year = `20${match[3]}`;
        } else {
          // YYYY/MM/DD 形式
          year = match[1];
          month = match[2].padStart(2, '0');
          day = match[3].padStart(2, '0');
        }
        
        // 2桁の場合は2000年代と仮定
        if (year.length === 2) {
          year = `20${year}`;
        }
        
        const result = `${year}-${month}-${day}`;
        console.log('日付抽出成功:', result);
        return result;
      }
    }

    // 最後の手段として、テキストから最初の日付っぽいものを抽出
    const dateLike = text.match(/\d{4}[/\-\.年]\d{1,2}[/\-\.月]\d{1,2}/);
    if (dateLike) {
      const normalized = dateLike[0].replace(/[年月]/g, '/').replace(/日/g, '');
      const parts = normalized.split(/[/\-\.]/);
      if (parts.length === 3) {
        const year = parts[0];
        const month = parts[1].padStart(2, '0');
        const day = parts[2].padStart(2, '0');
        const result = `${year}-${month}-${day}`;
        console.log('代替方法で日付抽出成功:', result);
        return result;
      }
    }

    console.log('日付の抽出に失敗');
    return '';
  }

  extractTaxRate(text: string): number {
    console.log('税率抽出を開始');
    // 8%, 10%などの検出
    const patterns = [
      /税率?\s*(\d+(?:\.\d+)?)%/,
      /消費税\s*(\d+(?:\.\d+)?)%/,
      /内消費税\s*(\d+(?:\.\d+)?)%/,
      /税\s*(\d+(?:\.\d+)?)\s*%/,
      /(\d+(?:\.\d+)?)%\s*消費税/,
      /(\d+(?:\.\d+)?)%\s*税/,
      /(\d+(?:\.\d+)?)%\s*内税/,
      /(\d+(?:\.\d+)?)%\s*外税/,
      /[Tt]ax\s*:?\s*(\d+(?:\.\d+)?)%/,
      /[Rr]ate\s*:?\s*(\d+(?:\.\d+)?)%/,
      /(\d+(?:\.\d+)?)\s*%\s*[Ii]ncl?\./
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        console.log('税率のパターンマッチ:', match[1]);
        const rate = parseFloat(match[1]);
        if (!isNaN(rate)) {
          console.log('税率抽出成功:', rate);
          return rate;
        }
      }
    }

    // 税率が明示されていない場合、一般的な税率を推定
    // 8%または10%のいずれかがテキストに含まれているかチェック
    if (text.includes('8%') || text.includes('0.08')) {
      console.log('8%の税率を推定');
      return 8;
    }
    if (text.includes('10%') || text.includes('0.10')) {
      console.log('10%の税率を推定');
      return 10;
    }
    
    // 内税表示のチェック
    if (text.includes('内税') || text.includes('税込')) {
      console.log('内税表示を検出。一般的な税率10%を推定');
      return 10;
    }

    console.log('税率の抽出に失敗');
    return 0;
  }

  extractStoreName(text: string): string {
    console.log('店舗名抽出を開始');
    // レシート上部の店舗名を推測
    const lines = text.split('\n');
    console.log('テキスト行数:', lines.length);
    
    // 最初の数行から店舗名と思われるものを抽出
    for (let i = 0; i < Math.min(20, lines.length); i++) {
      const line = lines[i].trim();
      console.log(`行${i}:`, line);
      
      // 明らかに店舗名ではないものを除外
      if (line && 
          !line.includes('合計') && 
          !line.includes('計') && 
          !line.includes('税率') && 
          !line.includes('消費税') && 
          !line.includes('小計') && 
          !line.includes('預かり') && 
          !line.includes('お釣り') && 
          !line.includes('合計') && 
          !line.includes('レシート') &&
          !line.includes('領収書') &&
          !line.includes('売上票') &&
          !line.includes('No.') &&
          !line.includes('TEL') &&
          !line.includes('電話') &&
          !/^\d+[)%]/.test(line) && // 数字で始まり、)または%で終わる行を除外
          !/^[¥￥]/.test(line) && // ¥または￥で始まる行を除外
          !/^\d{4}[/\-\.年]\d{1,2}[/\-\.月]\d{1,2}/.test(line) && // 日付で始まる行を除外
          !/^(\d{1,2}:\d{2}|\d{1,2}時\d{1,2}分)/.test(line) && // 時刻で始まる行を除外
          line.length > 1) { // 1文字以下の行を除外
        console.log('店舗名候補:', line);
        
        // 特定の接頭辞を持つ場合は除外
        const excludePrefixes = ['様', '御社', '御中', '宛', '宛先'];
        if (!excludePrefixes.some(prefix => line.startsWith(prefix))) {
          // 店舗名の候補を返す
          return line;
        }
      }
    }

    // 最後の手段として、最初の非空行を返す（ただし明らかに店舗名ではないものを除く）
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i].trim();
      if (line && 
          !/^\d/.test(line) && // 数字で始まる行を除外
          line.length > 2) { // 2文字以上の行のみ
        console.log('最終候補として店舗名を返す:', line);
        return line;
      }
    }

    console.log('店舗名の抽出に失敗');
    return '';
  }

  calculateConfidence(field: string, text: string): number {
    console.log('信頼度計算を開始。フィールド:', field);
    // 各フィールドの信頼度を計算
    switch (field) {
      case 'store_name':
        const storeName = this.extractStoreName(text);
        return storeName && storeName.length > 1 ? 0.9 : 0.1;
      case 'date':
        const date = this.extractDate(text);
        return date && date.length >= 8 ? 0.95 : 0.2;
      case 'total_amount':
        const totalAmount = this.extractTotal(text);
        return totalAmount > 0 ? 0.9 : 0.3;
      case 'tax_rate':
        const taxRate = this.extractTaxRate(text);
        return taxRate > 0 ? 0.85 : (taxRate === 0 ? 0.5 : 0.1);
      default:
        return 0.5;
    }
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
          line.includes('/') || line.includes('-') || line.includes(':')) {
        continue;
      }
      
      for (const pattern of itemPatterns) {
        const match = line.match(pattern);
        if (match) {
          const name = match[1].trim();
          const price = parseInt(match[2].replace(/,/g, ''));
          
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
    
    console.log('商品アイテム抽出結果:', items);
    return items;
  }

  // アイテム数の抽出
  extractItemsCount(text: string): number {
    console.log('アイテム数抽出を開始');
    const items = this.extractItems(text);
    const count = items.length;
    console.log('アイテム数:', count);
    return count;
  }

}
