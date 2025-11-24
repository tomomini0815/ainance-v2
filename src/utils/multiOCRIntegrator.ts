/**
 * マルチOCR統合エンジン
 * 複数のOCR結果を統合し、最も信頼度の高い結果を選択
 */

export interface OCRResult {
    text: string;
    confidence: number;
    source: 'google-vision' | 'tesseract';
    timestamp: number;
}

export interface FieldConfidence {
    value: string;
    confidence: number;
    sources: string[];
}

export class MultiOCRIntegrator {
    /**
     * 複数のOCR結果を統合
     * @param results - OCR結果の配列
     * @returns 統合されたテキスト
     */
    integrateResults(results: OCRResult[]): string {
        if (results.length === 0) return '';
        if (results.length === 1) return results[0].text;

        console.log('🔀 複数OCR結果を統合中...');
        console.log(`入力: ${results.length}件のOCR結果`);

        // 信頼度の重み付け
        const weights = {
            'google-vision': 1.5, // Google Vision APIを優先
            'tesseract': 1.0
        };

        // 各結果に重み付け信頼度を計算
        const weightedResults = results.map(r => ({
            ...r,
            weightedConfidence: r.confidence * weights[r.source]
        }));

        // 最も信頼度の高い結果を選択
        const bestResult = weightedResults.reduce((best, current) =>
            current.weightedConfidence > best.weightedConfidence ? current : best
        );

        console.log(`✅ 最良結果: ${bestResult.source} (信頼度: ${bestResult.confidence})`);

        return bestResult.text;
    }

    /**
     * フィールドレベルでの統合
     * 店舗名、日付、金額など個別のフィールドを統合
     */
    integrateFields(results: OCRResult[]): {
        storeName: FieldConfidence;
        date: FieldConfidence;
        amount: FieldConfidence;
    } {
        console.log('📊 フィールドレベルの統合を開始...');

        const storeNames: Map<string, FieldConfidence> = new Map();
        const dates: Map<string, FieldConfidence> = new Map();
        const amounts: Map<string, FieldConfidence> = new Map();

        // 各結果から店舗名、日付、金額を抽出
        for (const result of results) {
            const extracted = this.extractFields(result.text);

            // 店舗名の集計
            if (extracted.storeName) {
                const key = this.normalizeStoreName(extracted.storeName);
                const existing = storeNames.get(key);
                if (existing) {
                    existing.confidence += result.confidence;
                    existing.sources.push(result.source);
                } else {
                    storeNames.set(key, {
                        value: extracted.storeName,
                        confidence: result.confidence,
                        sources: [result.source]
                    });
                }
            }

            // 日付の集計
            if (extracted.date) {
                const key = extracted.date;
                const existing = dates.get(key);
                if (existing) {
                    existing.confidence += result.confidence;
                    existing.sources.push(result.source);
                } else {
                    dates.set(key, {
                        value: extracted.date,
                        confidence: result.confidence,
                        sources: [result.source]
                    });
                }
            }

            // 金額の集計
            if (extracted.amount) {
                const key = extracted.amount.toString();
                const existing = amounts.get(key);
                if (existing) {
                    existing.confidence += result.confidence;
                    existing.sources.push(result.source);
                } else {
                    amounts.set(key, {
                        value: extracted.amount.toString(),
                        confidence: result.confidence,
                        sources: [result.source]
                    });
                }
            }
        }

        // 最も信頼度の高いフィールドを選択
        const bestStoreName = this.selectBestField(storeNames);
        const bestDate = this.selectBestField(dates);
        const bestAmount = this.selectBestField(amounts);

        console.log('✅ フィールド統合完了:');
        console.log(`  店舗名: ${bestStoreName.value} (信頼度: ${bestStoreName.confidence.toFixed(2)})`);
        console.log(`  日付: ${bestDate.value} (信頼度: ${bestDate.confidence.toFixed(2)})`);
        console.log(`  金額: ${bestAmount.value} (信頼度: ${bestAmount.confidence.toFixed(2)})`);

        return {
            storeName: bestStoreName,
            date: bestDate,
            amount: bestAmount
        };
    }

    /**
     * テキストから基本フィールドを抽出
     */
    private extractFields(text: string): {
        storeName?: string;
        date?: string;
        amount?: number;
    } {
        // 簡易的な抽出（実際のReceiptParserと同じロジックを使用すべき）
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

        return {
            storeName: lines[0] || undefined,
            date: this.extractDate(text),
            amount: this.extractAmount(text)
        };
    }

    /**
     * 日付抽出
     */
    private extractDate(text: string): string | undefined {
        const patterns = [
            /(\d{4})[年\/\-](\d{1,2})[月\/\-](\d{1,2})[日]?/,
            /(\d{2,4})[\/-](\d{1,2})[\/-](\d{1,2})/,
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                let year = match[1];
                const month = match[2].padStart(2, '0');
                const day = match[3].padStart(2, '0');

                if (year.length === 2) {
                    year = '20' + year;
                }

                return `${year}-${month}-${day}`;
            }
        }

        return undefined;
    }

    /**
     * 金額抽出
     */
    private extractAmount(text: string): number | undefined {
        const patterns = [
            /(?:合\s*計|総\s*計|お買上計)[\s:：]*[¥￥]*\s*([0-9,，]+)/i,
            /[¥￥]\s*([0-9,，]+)/,
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                const amount = parseInt(match[1].replace(/[,，]/g, ''));
                if (!isNaN(amount) && amount > 0) {
                    return amount;
                }
            }
        }

        return undefined;
    }

    /**
     * 店舗名の正規化
     */
    private normalizeStoreName(name: string): string {
        return name
            .toLowerCase()
            .replace(/\s+/g, '')
            .replace(/[株式会社]/g, '');
    }

    /**
     * 最も信頼度の高いフィールドを選択
     */
    private selectBestField(fields: Map<string, FieldConfidence>): FieldConfidence {
        if (fields.size === 0) {
            return { value: '', confidence: 0, sources: [] };
        }

        let best: FieldConfidence = { value: '', confidence: 0, sources: [] };
        for (const field of fields.values()) {
            // 複数のソースから同じ値が得られた場合、信頼度を大幅にブースト
            const sourceBonus = field.sources.length > 1 ? 1.5 : 1.0;
            const adjustedConfidence = field.confidence * sourceBonus;

            if (adjustedConfidence > best.confidence) {
                best = { ...field, confidence: adjustedConfidence };
            }
        }

        return best;
    }

    /**
     * 信頼度の評価
     */
    evaluateConfidence(result: OCRResult): number {
        let score = result.confidence;

        // ソースによる重み付け
        if (result.source === 'google-vision') {
            score *= 1.2;
        }

        // テキスト長による調整（極端に短い・長いテキストは信頼度を下げる）
        if (result.text.length < 10) {
            score *= 0.5;
        } else if (result.text.length > 5000) {
            score *= 0.8;
        }

        // 日本語文字の割合をチェック
        const japaneseChars = (result.text.match(/[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf]/g) || []).length;
        const japaneseRatio = japaneseChars / result.text.length;

        if (japaneseRatio > 0.3) {
            score *= 1.1; // 日本語が多いとスコアアップ
        }

        return Math.min(100, score);
    }
}
