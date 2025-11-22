/**
 * 画像品質チェックユーティリティ
 * レシート撮影時の画像品質を評価し、OCR成功率を向上させる
 */

export interface QualityCheckResult {
    isBlurred: boolean;
    blurScore: number; // 0-100, 高いほど鮮明
    brightness: number; // 0-100, 適正範囲は30-80
    contrast: number; // 0-100, 高いほど良い
    hasReceipt: boolean; // レシート領域が検出されたか
    receiptBounds?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    overallScore: number; // 0-100, 総合スコア
    warnings: string[]; // 警告メッセージ
    isGoodQuality: boolean; // 撮影可能な品質か
}

export class QualityChecker {
    private readonly BLUR_THRESHOLD = 50;
    private readonly MIN_BRIGHTNESS = 30;
    private readonly MAX_BRIGHTNESS = 80;
    private readonly MIN_CONTRAST = 40;

    /**
     * ブレ検出（Laplacian variance）
     * 画像のシャープネスを測定
     * @param imageData - Base64エンコードされた画像データ
     * @returns ブレスコア（0-100、高いほど鮮明）
     */
    async detectBlur(imageData: string): Promise<number> {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    resolve(50); // デフォルト値
                    return;
                }

                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageDataObj.data;

                // グレースケール変換
                const gray: number[] = [];
                for (let i = 0; i < data.length; i += 4) {
                    gray.push(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
                }

                // Laplacianフィルタを適用
                let variance = 0;
                let count = 0;

                for (let y = 1; y < canvas.height - 1; y++) {
                    for (let x = 1; x < canvas.width - 1; x++) {
                        const idx = y * canvas.width + x;

                        // 3x3 Laplacianカーネル
                        const laplacian =
                            -gray[idx - canvas.width - 1] - gray[idx - canvas.width] - gray[idx - canvas.width + 1] +
                            -gray[idx - 1] + 8 * gray[idx] - gray[idx + 1] +
                            -gray[idx + canvas.width - 1] - gray[idx + canvas.width] - gray[idx + canvas.width + 1];

                        variance += laplacian * laplacian;
                        count++;
                    }
                }

                variance = variance / count;

                // 分散を0-100のスコアに変換
                // 分散が高いほど鮮明
                const score = Math.min(100, Math.sqrt(variance) / 10);

                resolve(score);
            };

            img.src = imageData;
        });
    }

    /**
     * 明るさチェック（ヒストグラム分析）
     * 適切な露出かどうかを判定
     * @param imageData - Base64エンコードされた画像データ
     * @returns 明るさスコア（0-100）
     */
    async checkBrightness(imageData: string): Promise<number> {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    resolve(50);
                    return;
                }

                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageDataObj.data;

                let totalBrightness = 0;
                let pixelCount = 0;

                for (let i = 0; i < data.length; i += 4) {
                    const brightness = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
                    totalBrightness += brightness;
                    pixelCount++;
                }

                const avgBrightness = totalBrightness / pixelCount;

                // 0-255を0-100に変換
                const score = (avgBrightness / 255) * 100;

                resolve(score);
            };

            img.src = imageData;
        });
    }

    /**
     * コントラストチェック
     * 画像の明暗差を測定
     * @param imageData - Base64エンコードされた画像データ
     * @returns コントラストスコア（0-100）
     */
    async checkContrast(imageData: string): Promise<number> {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    resolve(50);
                    return;
                }

                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageDataObj.data;

                let minBrightness = 255;
                let maxBrightness = 0;

                for (let i = 0; i < data.length; i += 4) {
                    const brightness = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
                    minBrightness = Math.min(minBrightness, brightness);
                    maxBrightness = Math.max(maxBrightness, brightness);
                }

                // コントラスト比を計算
                const contrastRatio = maxBrightness - minBrightness;

                // 0-255を0-100に変換
                const score = (contrastRatio / 255) * 100;

                resolve(score);
            };

            img.src = imageData;
        });
    }

    /**
     * レシート領域検出
     * エッジ検出と輪郭検出でレシートの位置を特定
     * @param imageData - Base64エンコードされた画像データ
     * @returns レシート領域の境界ボックス
     */
    async detectReceipt(imageData: string): Promise<{
        found: boolean;
        bounds?: { x: number; y: number; width: number; height: number };
    }> {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    resolve({ found: false });
                    return;
                }

                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageDataObj.data;

                // グレースケール変換
                const gray: number[] = [];
                for (let i = 0; i < data.length; i += 4) {
                    gray.push(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
                }

                // Cannyエッジ検出（簡易版）
                const edges: boolean[] = new Array(gray.length).fill(false);

                for (let y = 1; y < canvas.height - 1; y++) {
                    for (let x = 1; x < canvas.width - 1; x++) {
                        const idx = y * canvas.width + x;

                        // Sobelフィルタ
                        const gx =
                            -gray[idx - canvas.width - 1] + gray[idx - canvas.width + 1] +
                            -2 * gray[idx - 1] + 2 * gray[idx + 1] +
                            -gray[idx + canvas.width - 1] + gray[idx + canvas.width + 1];

                        const gy =
                            -gray[idx - canvas.width - 1] - 2 * gray[idx - canvas.width] - gray[idx - canvas.width + 1] +
                            gray[idx + canvas.width - 1] + 2 * gray[idx + canvas.width] + gray[idx + canvas.width + 1];

                        const magnitude = Math.sqrt(gx * gx + gy * gy);

                        // エッジ閾値
                        edges[idx] = magnitude > 50;
                    }
                }

                // 境界ボックスを計算
                let minX = canvas.width;
                let minY = canvas.height;
                let maxX = 0;
                let maxY = 0;
                let edgeCount = 0;

                for (let y = 0; y < canvas.height; y++) {
                    for (let x = 0; x < canvas.width; x++) {
                        const idx = y * canvas.width + x;
                        if (edges[idx]) {
                            minX = Math.min(minX, x);
                            minY = Math.min(minY, y);
                            maxX = Math.max(maxX, x);
                            maxY = Math.max(maxY, y);
                            edgeCount++;
                        }
                    }
                }

                // エッジの量が十分あり、矩形のアスペクト比が妥当な場合、レシートとみなす
                const width = maxX - minX;
                const height = maxY - minY;
                const aspectRatio = height / width;

                // レシートは通常縦長（アスペクト比 > 1.5）
                const isReceipt = edgeCount > 1000 && aspectRatio > 1.0 && aspectRatio < 5.0;

                if (isReceipt) {
                    resolve({
                        found: true,
                        bounds: { x: minX, y: minY, width, height }
                    });
                } else {
                    resolve({ found: false });
                }
            };

            img.src = imageData;
        });
    }

    /**
     * 総合品質チェック
     * すべてのチェックを実行し、総合評価を返す
     * @param imageData - Base64エンコードされた画像データ
     * @returns 品質チェック結果
     */
    async checkQuality(imageData: string): Promise<QualityCheckResult> {
        console.log('画像品質チェックを開始');

        // 並列で各チェックを実行
        const [blurScore, brightness, contrast, receiptDetection] = await Promise.all([
            this.detectBlur(imageData),
            this.checkBrightness(imageData),
            this.checkContrast(imageData),
            this.detectReceipt(imageData)
        ]);

        const warnings: string[] = [];

        // ブレチェック
        const isBlurred = blurScore < this.BLUR_THRESHOLD;
        if (isBlurred) {
            warnings.push('画像がぼやけています。カメラを固定してください。');
        }

        // 明るさチェック
        if (brightness < this.MIN_BRIGHTNESS) {
            warnings.push('画像が暗すぎます。明るい場所で撮影してください。');
        } else if (brightness > this.MAX_BRIGHTNESS) {
            warnings.push('画像が明るすぎます。露出を下げてください。');
        }

        // コントラストチェック
        if (contrast < this.MIN_CONTRAST) {
            warnings.push('コントラストが低すぎます。背景とレシートの明暗差を大きくしてください。');
        }

        // レシート検出チェック
        if (!receiptDetection.found) {
            warnings.push('レシートが検出されませんでした。レシート全体を画面に収めてください。');
        }

        // 総合スコアを計算（加重平均）
        const overallScore =
            blurScore * 0.35 +
            (brightness >= this.MIN_BRIGHTNESS && brightness <= this.MAX_BRIGHTNESS ? 100 : brightness > this.MAX_BRIGHTNESS ? (100 - (brightness - this.MAX_BRIGHTNESS)) : brightness) * 0.25 +
            contrast * 0.25 +
            (receiptDetection.found ? 100 : 0) * 0.15;

        const isGoodQuality = overallScore >= 70 && !isBlurred && receiptDetection.found;

        console.log('品質チェック結果:', {
            blurScore,
            brightness,
            contrast,
            hasReceipt: receiptDetection.found,
            overallScore,
            isGoodQuality
        });

        return {
            isBlurred,
            blurScore,
            brightness,
            contrast,
            hasReceipt: receiptDetection.found,
            receiptBounds: receiptDetection.bounds,
            overallScore,
            warnings,
            isGoodQuality
        };
    }

    /**
     * リアルタイム品質チェック（軽量版）
     * カメラプレビュー中に高速で実行
     * @param imageData - Base64エンコードされた画像データ
     * @returns 簡易品質スコア
     */
    async quickCheck(imageData: string): Promise<{ score: number; canCapture: boolean }> {
        // ブレと明るさのみチェック（高速）
        const [blurScore, brightness] = await Promise.all([
            this.detectBlur(imageData),
            this.checkBrightness(imageData)
        ]);

        const score = (blurScore * 0.6 +
            (brightness >= this.MIN_BRIGHTNESS && brightness <= this.MAX_BRIGHTNESS ? 100 : 50) * 0.4);

        const canCapture = score >= 60;

        return { score, canCapture };
    }
}
