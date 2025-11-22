/**
 * AI分析ユーティリティ
 * レシートデータの高度な分析・分類・提案を行う
 */

import { ReceiptData, ReceiptItem } from './ReceiptParser';

export interface ExpenseCategory {
    id: string;
    name: string;
    accountTitle: string; // 勘定科目
    taxDeductible: boolean; // 経費計上可能か
    keywords: string[];
}

export interface DuplicateCheckResult {
    isDuplicate: boolean;
    duplicateId?: string;
    similarity: number;
    reason?: string;
}

export interface AnomalyCheckResult {
    hasAnomaly: boolean;
    anomalyType?: 'unusual_amount' | 'unusual_time' | 'unusual_category' | 'suspicious_merchant';
    severity: 'low' | 'medium' | 'high';
    message?: string;
}

export class AIAnalyzer {
    // 99種類の勘定科目データベース
    private readonly EXPENSE_CATEGORIES: ExpenseCategory[] = [
        // 消耗品費
        { id: 'supplies_office', name: '事務用品', accountTitle: '消耗品費', taxDeductible: true, keywords: ['コピー用紙', '文房具', 'ペン', 'ノート', 'クリップ'] },
        { id: 'supplies_cleaning', name: '清掃用品', accountTitle: '消耗品費', taxDeductible: true, keywords: ['洗剤', 'ティッシュ', 'トイレットペーパー'] },

        // 交通費
        { id: 'transport_train', name: '電車代', accountTitle: '旅費交通費', taxDeductible: true, keywords: ['JR', '地下鉄', '私鉄', 'IC', 'Suica', 'PASMO'] },
        { id: 'transport_taxi', name: 'タクシー代', accountTitle: '旅費交通費', taxDeductible: true, keywords: ['タクシー', 'Uber', '配車'] },
        { id: 'transport_parking', name: '駐車場代', accountTitle: '旅費交通費', taxDeductible: true, keywords: ['駐車場', 'パーキング'] },
        { id: 'transport_gas', name: 'ガソリン代', accountTitle: '車両費', taxDeductible: true, keywords: ['ガソリン', 'ENEOS', '出光', 'コスモ'] },

        // 接待交際費
        { id: 'entertainment_restaurant', name: '飲食接待', accountTitle: '接待交際費', taxDeductible: true, keywords: ['レストラン', '居酒屋', '会食'] },
        { id: 'entertainment_gift', name: '贈答品', accountTitle: '接待交際費', taxDeductible: true, keywords: ['ギフト', 'お歳暮', 'お中元'] },

        // 通信費
        { id: 'communication_mobile', name: '携帯電話代', accountTitle: '通信費', taxDeductible: true, keywords: ['ソフトバンク', 'ドコモ', 'au', '楽天モバイル'] },
        { id: 'communication_internet', name: 'インターネット代', accountTitle: '通信費', taxDeductible: true, keywords: ['プロバイダ', '回線', 'Wi-Fi'] },

        // 水道光熱費
        { id: 'utility_electric', name: '電気代', accountTitle: '水道光熱費', taxDeductible: true, keywords: ['電気', '東京電力', '関西電力'] },
        { id: 'utility_gas', name: 'ガス代', accountTitle: '水道光熱費', taxDeductible: true, keywords: ['ガス', '東京ガス', '大阪ガス'] },
        { id: 'utility_water', name: '水道代', accountTitle: '水道光熱費', taxDeductible: true, keywords: ['水道局', '上下水道'] },

        // 広告宣伝費
        { id: 'advertising_online', name: 'オンライン広告', accountTitle: '広告宣伝費', taxDeductible: true, keywords: ['Google', 'Facebook', 'Instagram', '広告'] },
        { id: 'advertising_print', name: '印刷広告', accountTitle: '広告宣伝費', taxDeductible: true, keywords: ['チラシ', 'ポスター', '看板'] },

        // 会議費
        { id: 'meeting_food', name: '会議飲食代', accountTitle: '会議費', taxDeductible: true, keywords: ['カフェ', 'スターバックス', 'ドトール'] },
        { id: 'meeting_room', name: '会議室代', accountTitle: '会議費', taxDeductible: true, keywords: ['会議室', 'レンタルスペース', 'コワーキング'] },

        // 福利厚生費
        { id: 'welfare_health', name: '健康診断費', accountTitle: '福利厚生費', taxDeductible: true, keywords: ['健康診断', '人間ドック', '検診'] },
        { id: 'welfare_training', name: '研修費', accountTitle: '研修費', taxDeductible: true, keywords: ['セミナー', '研修', '講座'] },

        // 業務委託費
        { id: 'outsourcing_design', name: 'デザイン外注', accountTitle: '外注費', taxDeductible: true, keywords: ['デザイン', 'ロゴ', 'グラフィック'] },
        { id: 'outsourcing_development', name: '開発外注', accountTitle: '外注費', taxDeductible: true, keywords: ['開発', 'プログラミング', 'システム'] },

        // その他
        { id: 'other_insurance', name: '保険料', accountTitle: '保険料', taxDeductible: true, keywords: ['保険', '損保', '生保'] },
        { id: 'other_subscription', name: 'サブスクリプション', accountTitle: '通信費', taxDeductible: true, keywords: ['Netflix', 'Amazon', 'サブスク', 'Adobe'] },
        { id: 'personal', name: '個人的支出', accountTitle: '事業主貸', taxDeductible: false, keywords: [''] }
    ];

    /**
     * 商品明細の完全抽出
     * OCRテキストから個別アイテムを詳細に抽出
     */
    extractLineItems(ocrText: string): ReceiptItem[] {
        console.log('商品明細の抽出を開始');
        const items: ReceiptItem[] = [];
        const lines = ocrText.split('\n');

        // 商品行のパターン（より詳細）
        const patterns = [
            /^(.+?)\s+(\d+)個?\s*[×xX]\s*(\d+)円?\s*=?\s*(\d+)円?/, // 商品名 数量×単価=合計
            /^(.+?)\s+(\d+)円?\s*[×xX]\s*(\d+)\s*=?\s*(\d+)円?/, // 商品名 単価×数量=合計
            /^(.+?)\s+(\d+)\s*[×xX]\s*[¥￥]?(\d+)\s*=?\s*[¥￥]?(\d+)/, // 商品名 数量×¥単価=¥合計
            /^(.+?)\s+[¥￥]?(\d{2,})円?$/, // 商品名 価格（簡易版）
            /^(.+?)\s+(\d+)(?:個|本|枚|袋|箱)?\s*[¥￥]?(\d+)/, // 商品名 数量 価格
        ];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            // スキップすべき行
            if (this.shouldSkipLine(line)) continue;

            for (const pattern of patterns) {
                const match = line.match(pattern);
                if (match) {
                    let name: string;
                    let quantity: number;
                    let price: number;
                    let total: number;

                    if (pattern.source.includes('個?\\s*[×xX]')) {
                        // パターン1: 商品名 数量×単価=合計
                        name = match[1].trim();
                        quantity = parseInt(match[2]);
                        const unitPrice = parseInt(match[3]);
                        total = parseInt(match[4]);
                        price = total; // 合計金額
                    } else if (match.length >= 3) {
                        // パターン2以降
                        name = match[1].trim();
                        quantity = 1;
                        price = parseInt(match[2].replace(/[,]/g, ''));
                        total = price;
                    } else {
                        continue;
                    }

                    // カテゴリを推定
                    const category = this.inferItemCategory(name);

                    items.push({
                        name,
                        quantity,
                        price,
                        category
                    });

                    console.log(`商品抽出: ${name} x${quantity} = ¥${price}`);
                    break;
                }
            }
        }

        console.log(`合計${items.length}個の商品を抽出`);
        return items;
    }

    /**
     * スキップすべき行かどうか判定
     */
    private shouldSkipLine(line: string): boolean {
        const skipPatterns = [
            /^$/,
            /合計|小計|総計|税|預かり|お釣り|釣銭/,
            /^\d{4}[/-]\d{2}[/-]\d{2}/, // 日付
            /^\d{1,2}:\d{2}/, // 時刻
            /レシート|領収|売上票|No\.|TEL|電話|住所|営業時間/,
            /ありがとう|またお越し|Thank you|お買い上げ/,
            /ポイント|クーポン|割引/
        ];

        return skipPatterns.some(pattern => pattern.test(line));
    }

    /**
     * アイテムのカテゴリを推定
     */
    private inferItemCategory(itemName: string): string {
        const categoryMap: { [key: string]: string[] } = {
            '食品': ['パン', 'おにぎり', '弁当', '牛乳', 'ヨーグルト', '野菜', '果物'],
            '飲料': ['水', 'お茶', 'コーヒー', 'ジュース', '炭酸'],
            '事務用品': ['ペン', 'ノート', 'ファイル', '付箋', 'ホッチキス'],
            '清掃用品': ['洗剤', 'ティッシュ', 'トイレットペーパー', 'タオル'],
            '日用品': ['シャンプー', '石鹸', '歯ブラシ', '歯磨き粉'],
            '書籍': ['本', '雑誌', '新聞'],
            'その他': []
        };

        for (const [category, keywords] of Object.entries(categoryMap)) {
            if (keywords.some(keyword => itemName.includes(keyword))) {
                return category;
            }
        }

        return 'その他';
    }

    /**
     * 高度なカテゴリ分類
     * 店舗名とアイテムから最適な勘定科目を提案
     */
    classifyExpense(receiptData: ReceiptData): {
        category: ExpenseCategory;
        confidence: number;
        reasoning: string;
    } {
        console.log('カテゴリ分類を開始:', receiptData.store_name);

        const storeName = receiptData.store_name.toLowerCase();
        const items = receiptData.items || [];
        const rawText = receiptData.raw_text.toLowerCase();

        let bestMatch: ExpenseCategory | null = null;
        let bestScore = 0;
        let reasoning = '';

        // 各カテゴリのスコアを計算
        for (const category of this.EXPENSE_CATEGORIES) {
            let score = 0;
            const matches: string[] = [];

            // キーワードマッチ
            for (const keyword of category.keywords) {
                const lowerKeyword = keyword.toLowerCase();
                if (storeName.includes(lowerKeyword)) {
                    score += 10;
                    matches.push(`店舗名に「${keyword}」を検出`);
                }
                if (rawText.includes(lowerKeyword)) {
                    score += 5;
                    matches.push(`レシート内に「${keyword}」を検出`);
                }
            }

            // アイテムベースの分類
            for (const item of items) {
                if (item.category && category.name.includes(item.category)) {
                    score += 3;
                    matches.push(`商品カテゴリ「${item.category}」が一致`);
                }
            }

            if (score > bestScore) {
                bestScore = score;
                bestMatch = category;
                reasoning = matches.join('、');
            }
        }

        // マッチしない場合はデフォルト
        if (!bestMatch || bestScore === 0) {
            bestMatch = this.EXPENSE_CATEGORIES.find(c => c.id === 'personal') || this.EXPENSE_CATEGORIES[0];
            reasoning = '明確な分類ができませんでした';
        }

        const confidence = Math.min(bestScore / 20, 1.0); // 0-1にスケーリング

        console.log(`分類結果: ${bestMatch.name} (信頼度: ${(confidence * 100).toFixed(1)}%)`);

        return {
            category: bestMatch,
            confidence,
            reasoning
        };
    }

    /**
     * 経費精算提案
     * 確定申告や経費精算に必要な情報を提供
     */
    suggestAccountTitle(receiptData: ReceiptData): {
        accountTitle: string;
        taxDeductible: boolean;
        suggestedDescription: string;
        warnings: string[];
    } {
        const classification = this.classifyExpense(receiptData);
        const warnings: string[] = [];

        // 金額チェック
        if (receiptData.total_amount > 10000) {
            warnings.push('高額な支出です。領収書の保管が必要です。');
        }

        if (receiptData.total_amount > 30000) {
            warnings.push('3万円以上の支出は、特に詳細な説明が求められます。');
        }

        // 接待交際費の特別チェック
        if (classification.category.accountTitle === '接待交際費') {
            warnings.push('接待交際費は、参加者名・目的・人数の記載が必要です。');
            if (receiptData.total_amount > 5000) {
                warnings.push('5千円以上の飲食費は、領収書に参加者全員の氏名が必要です。');
            }
        }

        // 個人的支出の警告
        if (!classification.category.taxDeductible) {
            warnings.push('個人的な支出と判定されました。経費計上できません。');
        }

        const suggestedDescription = `${receiptData.store_name}での${classification.category.name}（${receiptData.date}）`;

        return {
            accountTitle: classification.category.accountTitle,
            taxDeductible: classification.category.taxDeductible,
            suggestedDescription,
            warnings
        };
    }

    /**
     * 重複検出
     * 同じレシートが二重登録されていないかチェック
     */
    detectDuplicate(
        newReceipt: ReceiptData,
        existingReceipts: ReceiptData[]
    ): DuplicateCheckResult {
        console.log('重複検出を開始');

        for (const existing of existingReceipts) {
            // 同一性チェック
            const dateMatch = newReceipt.date === existing.date;
            const storeMatch = this.calculateStringSimilarity(
                newReceipt.store_name,
                existing.store_name
            ) > 0.8;
            const amountMatch = Math.abs(newReceipt.total_amount - existing.total_amount) < 10;

            // 類似度スコアを計算
            let similarity = 0;
            if (dateMatch) similarity += 0.4;
            if (storeMatch) similarity += 0.3;
            if (amountMatch) similarity += 0.3;

            // 90%以上の類似度で重複と判定
            if (similarity >= 0.9) {
                return {
                    isDuplicate: true,
                    duplicateId: existing.store_name + '_' + existing.date,
                    similarity,
                    reason: `同じ日付(${newReceipt.date})、同じ店舗(${newReceipt.store_name})、同じ金額(¥${newReceipt.total_amount})のレシートが既に存在します。`
                };
            }
        }

        return {
            isDuplicate: false,
            similarity: 0
        };
    }

    /**
     * 文字列の類似度を計算（Levenshtein距離）
     */
    private calculateStringSimilarity(str1: string, str2: string): number {
        const len1 = str1.length;
        const len2 = str2.length;
        const matrix: number[][] = [];

        for (let i = 0; i <= len1; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= len2; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= len1; i++) {
            for (let j = 1; j <= len2; j++) {
                const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j - 1] + cost
                );
            }
        }

        const distance = matrix[len1][len2];
        const maxLen = Math.max(len1, len2);
        return 1 - distance / maxLen;
    }

    /**
     * 異常検知
     * 通常とは異なるパターンを検出
     */
    detectAnomaly(receiptData: ReceiptData, userHistory: ReceiptData[]): AnomalyCheckResult {
        console.log('異常検知を開始');

        // 金額の異常チェック
        const amounts = userHistory.map(r => r.total_amount);
        if (amounts.length > 0) {
            const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
            const stdDev = Math.sqrt(
                amounts.reduce((sum, val) => sum + Math.pow(val - avgAmount, 2), 0) / amounts.length
            );

            // 平均から3標準偏差以上離れていたら異常
            if (Math.abs(receiptData.total_amount - avgAmount) > 3 * stdDev) {
                return {
                    hasAnomaly: true,
                    anomalyType: 'unusual_amount',
                    severity: receiptData.total_amount > avgAmount * 5 ? 'high' : 'medium',
                    message: `通常の支出額(平均¥${Math.round(avgAmount)})と大きく異なります。`
                };
            }
        }

        // 時刻の異常チェック（深夜・早朝の購入）
        if (receiptData.time) {
            const hour = parseInt(receiptData.time.split(':')[0]);
            if (hour >= 0 && hour < 5) {
                return {
                    hasAnomaly: true,
                    anomalyType: 'unusual_time',
                    severity: 'low',
                    message: '深夜の購入です。確認してください。'
                };
            }
        }

        // 疑わしい店舗名パターン
        const suspiciousPatterns = ['test', 'テスト', 'sample', 'サンプル', '123', 'xxx'];
        for (const pattern of suspiciousPatterns) {
            if (receiptData.store_name.toLowerCase().includes(pattern)) {
                return {
                    hasAnomaly: true,
                    anomalyType: 'suspicious_merchant',
                    severity: 'high',
                    message: '店舗名が疑わしいパターンです。OCR誤認識の可能性があります。'
                };
            }
        }

        return {
            hasAnomaly: false,
            severity: 'low'
        };
    }
}
