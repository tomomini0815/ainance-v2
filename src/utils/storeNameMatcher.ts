/**
 * 店舗名マッチングエンジン
 * OCR誤認識を考慮した高精度な店舗名検出
 */

export class StoreNameMatcher {
    // OCRでよくある誤認識パターン
    private static readonly OCR_CONFUSION_PATTERNS: Array<[RegExp, string]> = [
        // 数字と文字の混同
        [/0/g, 'O'], [/O/g, '0'],
        [/1/g, 'I'], [/I/g, '1'], [/l/g, '1'],
        [/5/g, 'S'], [/S/g, '5'],
        [/8/g, 'B'], [/B/g, '8'],
        [/6/g, 'G'], [/G/g, '6'],
        
        // 日本語の混同
        [/ロ/g, '口'], [/口/g, 'ロ'],
        [/ー/g, '一'], [/一/g, 'ー'],
        [/二/g, 'ニ'], [/ニ/g, '二'],
        [/工/g, 'エ'], [/エ/g, '工'],
        
        // 記号の混同
        [/\s+/g, ''], // スペース削除
        [/[・．.]/g, ''], // 中点削除
        [/[ー－-]/g, ''], // ハイフン削除
    ];

    // 主要店舗名のバリエーション（正規化済み）
    private static readonly STORE_VARIATIONS: Map<string, string[]> = new Map([
        // コンビニ
        ['セブンイレブン', [
            'セブンイレブン', 'セブン-イレブン', 'セブン', 'セブン11', '7-11', '7-ELEVEN', '7ELEVEN', 
            'セフンイレフン', 'セフン', 'セプンイレプン', // OCR誤認識
        ]],
        ['ローソン', [
            'ローソン', 'LAWSON', 'Lawson', 'ナチュラルローソン', 'ローソンストア100',
            'ロ一ソン', 'ローソソ', 'ロ－ソン', // OCR誤認識
        ]],
        ['ファミリーマート', [
            'ファミリーマート', 'ファミマ', 'FamilyMart', 'FAMILY MART', 'Family Mart',
            'ファミリ一マ一ト', 'ファミリ－マ－ト', // OCR誤認識
        ]],
        ['ミニストップ', [
            'ミニストップ', 'MINISTOP', 'MiniStop', 'ミニスト',
            'ミニストツプ', 'ミエストップ', // OCR誤認識
        ]],
        
        // スーパー
        ['イオン', [
            'イオン', 'AEON', 'aeon', 'Aeon', 'イオンモール', 'イオンスタイル',
            'イオソ', '1オン', // OCR誤認識
        ]],
        ['イトーヨーカドー', [
            'イトーヨーカドー', 'ヨーカドー', 'ItoYokado', 'Ito Yokado',
            'イト一ヨ一カド一', // OCR誤認識
        ]],
        ['ライフ', [
            'ライフ', 'LIFE', 'Life', 'ライフコーポレーション',
            'ライ7', 'ラィフ', // OCR誤認識
        ]],
        
        // 飲食店
        ['マクドナルド', [
            'マクドナルド', 'McDonald\'s', 'McDonalds', 'マック', 'マクド',
            'マクドエルド', 'マクド子ルド', // OCR誤認識
        ]],
        ['スターバックス', [
            'スターバックス', 'スタバ', 'Starbucks', 'STARBUCKS', 'スターバックスコーヒー',
            'スタ一バックス', 'スターハ゛ックス', // OCR誤認識
        ]],
        ['すき家', [
            'すき家', 'SUKIYA', 'Sukiya', 'すきや', 'スキヤ',
            'すき屋', 'すさ家', // OCR誤認識
        ]],
        ['吉野家', [
            '吉野家', 'YOSHINOYA', 'Yoshinoya', 'よしのや', 'ヨシノヤ',
            '吉野屋', '古野家', // OCR誤認識
        ]],
        ['松屋', [
            '松屋', 'MATSUYA', 'Matsuya', 'まつや', 'マツヤ',
            '松屋フーズ', '松家', // OCR誤認識
        ]],
    ]);

    /**
     * テキスト正規化
     */
    static normalize(text: string): string {
        return text
            .toUpperCase() // 大文字に統一
            .replace(/\s+/g, '') // スペース削除
            .replace(/[・．.]/g, '') // 中点削除
            .replace(/[ー－-]/g, '') // ハイフン削除
            .replace(/株式会社|（株）|\(株\)/g, '') // 会社情報削除
            .trim();
    }

    /**
     * Levenshtein距離（編集距離）の計算
     */
    static levenshteinDistance(str1: string, str2: string): number {
        const len1 = str1.length;
        const len2 = str2.length;
        const dp: number[][] = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));

        for (let i = 0; i <= len1; i++) dp[i][0] = i;
        for (let j = 0; j <= len2; j++) dp[0][j] = j;

        for (let i = 1; i <= len1; i++) {
            for (let j = 1; j <= len2; j++) {
                const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
                dp[i][j] = Math.min(
                    dp[i - 1][j] + 1,      // 削除
                    dp[i][j - 1] + 1,      // 挿入
                    dp[i - 1][j - 1] + cost // 置換
                );
            }
        }

        return dp[len1][len2];
    }

    /**
     * 類似度スコアの計算（0-100）
     */
    static similarityScore(str1: string, str2: string): number {
        const normalized1 = this.normalize(str1);
        const normalized2 = this.normalize(str2);

        if (normalized1 === normalized2) return 100;

        const maxLen = Math.max(normalized1.length, normalized2.length);
        if (maxLen === 0) return 0;

        const distance = this.levenshteinDistance(normalized1, normalized2);
        return Math.round((1 - distance / maxLen) * 100);
    }

    /**
     * OCR誤認識を考慮したバリエーション生成
     */
    static generateVariations(text: string): string[] {
        const variations = new Set<string>([text]);
        
        // 基本的な正規化
        variations.add(this.normalize(text));

        // OCR誤認識パターンの適用
        for (const [pattern, replacement] of this.OCR_CONFUSION_PATTERNS) {
            const variant = text.replace(pattern, replacement);
            if (variant !== text) {
                variations.add(variant);
                variations.add(this.normalize(variant));
            }
        }

        return Array.from(variations);
    }

    /**
     * 最も一致する店舗名を検索
     */
    static findBestMatch(ocrText: string, knownStores: string[]): {
        storeName: string;
        confidence: number;
        matchType: 'exact' | 'fuzzy' | 'variation' | 'none';
    } {
        const normalizedOCR = this.normalize(ocrText);
        let bestMatch: { storeName: string; confidence: number; matchType: 'exact' | 'fuzzy' | 'variation' | 'none' } = { 
            storeName: '', 
            confidence: 0, 
            matchType: 'none'
        };

        // 1. 完全一致チェック
        for (const store of knownStores) {
            if (this.normalize(store) === normalizedOCR) {
                return { storeName: store, confidence: 100, matchType: 'exact' };
            }
        }

        // 2. バリエーションチェック
        for (const [canonical, variations] of this.STORE_VARIATIONS) {
            for (const variation of variations) {
                const normalizedVariation = this.normalize(variation);
                if (normalizedOCR.includes(normalizedVariation) || 
                    normalizedVariation.includes(normalizedOCR)) {
                    const score = this.similarityScore(ocrText, variation);
                    if (score > bestMatch.confidence) {
                        bestMatch = {
                            storeName: canonical,
                            confidence: Math.min(score + 10, 100), // ボーナス
                            matchType: 'variation'
                        };
                    }
                }
            }
        }

        // 3. ファジーマッチング（類似度80%以上）
        if (bestMatch.confidence < 80) {
            for (const store of knownStores) {
                const score = this.similarityScore(ocrText, store);
                if (score >= 80 && score > bestMatch.confidence) {
                    bestMatch = {
                        storeName: store,
                        confidence: score,
                        matchType: 'fuzzy'
                    };
                }
            }
        }

        return bestMatch;
    }

    /**
     * テキストから店舗名候補を抽出
     */
    static extractStoreCandidates(text: string): string[] {
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        const candidates: string[] = [];

        // 最初の5行から候補を抽出
        for (let i = 0; i < Math.min(5, lines.length); i++) {
            const line = lines[i];
            
            // 明らかに店舗名でない行を除外
            if (this.isLikelyStoreName(line)) {
                candidates.push(line);
                
                // 複数行を組み合わせた候補も追加
                if (i < lines.length - 1) {
                    candidates.push(line + lines[i + 1]);
                }
            }
        }

        return candidates;
    }

    /**
     * 店舗名らしいかどうかの判定
     */
    private static isLikelyStoreName(text: string): boolean {
        // 短すぎる・長すぎる
        if (text.length < 2 || text.length > 30) return false;

        // 日付パターンを除外
        if (/\d{4}[-\/]\d{1,2}[-\/]\d{1,2}/.test(text)) return false;
        if (/\d{1,2}:\d{2}/.test(text)) return false;

        // 金額パターンを除外
        if (/[¥￥]\s*[\d,]+/.test(text)) return false;
        if (/\d+円/.test(text)) return false;

        // 住所パターンを除外
        if (/(都|道|府|県|市|区|町|村)/.test(text) && text.length > 10) return false;

        // 電話番号を除外
        if (/\d{2,4}-\d{2,4}-\d{4}/.test(text)) return false;

        return true;
    }

    /**
     * マルチ戦略での店舗名検出
     */
    static detectStoreName(text: string, knownStores: string[]): {
        storeName: string;
        confidence: number;
        method: string;
    } {
        console.log('🏪 高精度店舗名検出を開始...');

        const candidates = this.extractStoreCandidates(text);
        console.log(`  候補: ${candidates.length}件`);

        let bestResult = { storeName: '不明', confidence: 0, method: 'なし' };

        // 各候補で最も良いマッチを探す
        for (const candidate of candidates) {
            const match = this.findBestMatch(candidate, knownStores);
            
            if (match.confidence > bestResult.confidence) {
                bestResult = {
                    storeName: match.storeName,
                    confidence: match.confidence,
                    method: match.matchType
                };
            }
        }

        console.log(`✅ 検出結果: ${bestResult.storeName} (信頼度: ${bestResult.confidence}%, 方法: ${bestResult.method})`);

        return bestResult;
    }
}
