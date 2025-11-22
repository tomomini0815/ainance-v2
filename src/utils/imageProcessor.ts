/**
 * 画像処理ユーティリティ
 * レシート画像のOCR精度を向上させるための高度な前処理機能を提供
 */

export class ImageProcessor {
    /**
     * 適応的二値化
     * レシートの明暗に関わらず文字を鮮明に抽出
     * @param imageData - Base64エンコードされた画像データ
     * @returns 二値化された画像データ
     */
    async adaptiveBinarization(imageData: string): Promise<string> {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    resolve(imageData);
                    return;
                }

                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageDataObj.data;

                // グレースケール変換
                for (let i = 0; i < data.length; i += 4) {
                    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
                    data[i] = data[i + 1] = data[i + 2] = gray;
                }

                // ローカル適応的閾値処理
                const blockSize = 15; // ブロックサイズ
                const C = 10; // 定数

                for (let y = 0; y < canvas.height; y++) {
                    for (let x = 0; x < canvas.width; x++) {
                        // 局所領域の平均を計算
                        let sum = 0;
                        let count = 0;

                        for (let dy = -blockSize; dy <= blockSize; dy++) {
                            for (let dx = -blockSize; dx <= blockSize; dx++) {
                                const nx = x + dx;
                                const ny = y + dy;

                                if (nx >= 0 && nx < canvas.width && ny >= 0 && ny < canvas.height) {
                                    const idx = (ny * canvas.width + nx) * 4;
                                    sum += data[idx];
                                    count++;
                                }
                            }
                        }

                        const mean = sum / count;
                        const idx = (y * canvas.width + x) * 4;
                        const threshold = mean - C;

                        // 閾値処理
                        const value = data[idx] > threshold ? 255 : 0;
                        data[idx] = data[idx + 1] = data[idx + 2] = value;
                    }
                }

                ctx.putImageData(imageDataObj, 0, 0);
                resolve(canvas.toDataURL('image/jpeg', 0.95));
            };

            img.src = imageData;
        });
    }

    /**
     * 傾き補正 (Deskewing)
     * レシートの傾きを検出して水平・垂直に補正
     * @param imageData - Base64エンコードされた画像データ
     * @returns 補正された画像データ
     */
    async deskewImage(imageData: string): Promise<string> {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    resolve(imageData);
                    return;
                }

                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                // エッジ検出で傾き角度を推定
                const angle = this.detectSkewAngle(canvas);

                // 角度が小さい場合は補正しない（±2度以下）
                if (Math.abs(angle) < 2) {
                    resolve(imageData);
                    return;
                }

                // 回転のための新しいキャンバスを作成
                const rotatedCanvas = document.createElement('canvas');
                const rotatedCtx = rotatedCanvas.getContext('2d');

                if (!rotatedCtx) {
                    resolve(imageData);
                    return;
                }

                // 回転後のキャンバスサイズを計算
                const angleRad = (angle * Math.PI) / 180;
                const cos = Math.abs(Math.cos(angleRad));
                const sin = Math.abs(Math.sin(angleRad));
                rotatedCanvas.width = canvas.width * cos + canvas.height * sin;
                rotatedCanvas.height = canvas.width * sin + canvas.height * cos;

                // 中心点を基準に回転
                rotatedCtx.translate(rotatedCanvas.width / 2, rotatedCanvas.height / 2);
                rotatedCtx.rotate(-angleRad);
                rotatedCtx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);

                resolve(rotatedCanvas.toDataURL('image/jpeg', 0.95));
            };

            img.src = imageData;
        });
    }

    /**
     * エッジ検出による傾き角度の推定
     * @param canvas - 画像が描画されたキャンバス
     * @returns 傾き角度（度）
     */
    private detectSkewAngle(canvas: HTMLCanvasElement): number {
        const ctx = canvas.getContext('2d');
        if (!ctx) return 0;

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Sobelフィルタでエッジを検出
        const edges: number[] = [];
        for (let y = 1; y < canvas.height - 1; y++) {
            for (let x = 1; x < canvas.width - 1; x++) {
                const idx = (y * canvas.width + x) * 4;

                // Sobelフィルタ（簡易版）
                const gx =
                    -data[((y - 1) * canvas.width + (x - 1)) * 4] +
                    data[((y - 1) * canvas.width + (x + 1)) * 4] +
                    -2 * data[(y * canvas.width + (x - 1)) * 4] +
                    2 * data[(y * canvas.width + (x + 1)) * 4] +
                    -data[((y + 1) * canvas.width + (x - 1)) * 4] +
                    data[((y + 1) * canvas.width + (x + 1)) * 4];

                const gy =
                    -data[((y - 1) * canvas.width + (x - 1)) * 4] +
                    -2 * data[((y - 1) * canvas.width + x) * 4] +
                    -data[((y - 1) * canvas.width + (x + 1)) * 4] +
                    data[((y + 1) * canvas.width + (x - 1)) * 4] +
                    2 * data[((y + 1) * canvas.width + x) * 4] +
                    data[((y + 1) * canvas.width + (x + 1)) * 4];

                const magnitude = Math.sqrt(gx * gx + gy * gy);

                if (magnitude > 100) {
                    // エッジの角度を記録
                    const angle = Math.atan2(gy, gx) * (180 / Math.PI);
                    edges.push(angle);
                }
            }
        }

        if (edges.length === 0) return 0;

        // 最も頻出する角度を傾きとして返す（ヒストグラム分析）
        const histogram: { [key: number]: number } = {};
        for (const angle of edges) {
            const rounded = Math.round(angle);
            histogram[rounded] = (histogram[rounded] || 0) + 1;
        }

        let maxCount = 0;
        let dominantAngle = 0;
        for (const [angle, count] of Object.entries(histogram)) {
            if (count > maxCount) {
                maxCount = count;
                dominantAngle = parseInt(angle);
            }
        }

        return dominantAngle;
    }

    /**
     * コントラスト強化
     * ヒストグラム均等化でコントラストを改善
     * @param imageData - Base64エンコードされた画像データ
     * @returns コントラスト強化された画像データ
     */
    async enhanceContrast(imageData: string): Promise<string> {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    resolve(imageData);
                    return;
                }

                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageDataObj.data;

                // ヒストグラムの作成
                const histogram = new Array(256).fill(0);
                for (let i = 0; i < data.length; i += 4) {
                    const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
                    histogram[gray]++;
                }

                // 累積分布関数の作成
                const cdf = new Array(256).fill(0);
                cdf[0] = histogram[0];
                for (let i = 1; i < 256; i++) {
                    cdf[i] = cdf[i - 1] + histogram[i];
                }

                // 正規化
                const totalPixels = canvas.width * canvas.height;
                const normalized = cdf.map(val => Math.round((val / totalPixels) * 255));

                // ヒストグラム均等化を適用
                for (let i = 0; i < data.length; i += 4) {
                    const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
                    const newValue = normalized[gray];
                    data[i] = data[i + 1] = data[i + 2] = newValue;
                }

                ctx.putImageData(imageDataObj, 0, 0);
                resolve(canvas.toDataURL('image/jpeg', 0.95));
            };

            img.src = imageData;
        });
    }

    /**
     * ノイズ除去
     * Gaussian Blur + Median Filterでノイズを除去
     * @param imageData - Base64エンコードされた画像データ
     * @returns ノイズ除去された画像データ
     */
    async removeNoise(imageData: string): Promise<string> {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = async () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    resolve(imageData);
                    return;
                }

                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                // Gaussian Blurを適用
                const blurred = await this.gaussianBlur(canvas, 1.5);

                // Median Filterを適用
                const final = await this.medianFilter(blurred, 3);

                resolve(final);
            };

            img.src = imageData;
        });
    }

    /**
     * Gaussian Blur
     * @param canvas - 画像が描画されたキャンバス
     * @param sigma - ガウス分布の標準偏差
     * @returns ぼかし処理された画像データ
     */
    private async gaussianBlur(canvas: HTMLCanvasElement, sigma: number): Promise<string> {
        return new Promise((resolve) => {
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                resolve(canvas.toDataURL('image/jpeg', 0.95));
                return;
            }

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // ガウシアンカーネルの生成
            const kernelSize = Math.ceil(sigma * 3) * 2 + 1;
            const kernel: number[] = [];
            let sum = 0;

            for (let i = 0; i < kernelSize; i++) {
                const x = i - Math.floor(kernelSize / 2);
                const value = Math.exp(-(x * x) / (2 * sigma * sigma));
                kernel.push(value);
                sum += value;
            }

            // 正規化
            for (let i = 0; i < kernel.length; i++) {
                kernel[i] /= sum;
            }

            // 水平方向のぼかし
            const tempData = new Uint8ClampedArray(data);
            for (let y = 0; y < canvas.height; y++) {
                for (let x = 0; x < canvas.width; x++) {
                    for (let c = 0; c < 3; c++) {
                        let sum = 0;
                        for (let k = 0; k < kernelSize; k++) {
                            const kx = x + k - Math.floor(kernelSize / 2);
                            if (kx >= 0 && kx < canvas.width) {
                                const idx = (y * canvas.width + kx) * 4 + c;
                                sum += data[idx] * kernel[k];
                            }
                        }
                        const idx = (y * canvas.width + x) * 4 + c;
                        tempData[idx] = sum;
                    }
                }
            }

            // 垂直方向のぼかし
            const finalData = new Uint8ClampedArray(tempData);
            for (let y = 0; y < canvas.height; y++) {
                for (let x = 0; x < canvas.width; x++) {
                    for (let c = 0; c < 3; c++) {
                        let sum = 0;
                        for (let k = 0; k < kernelSize; k++) {
                            const ky = y + k - Math.floor(kernelSize / 2);
                            if (ky >= 0 && ky < canvas.height) {
                                const idx = (ky * canvas.width + x) * 4 + c;
                                sum += tempData[idx] * kernel[k];
                            }
                        }
                        const idx = (y * canvas.width + x) * 4 + c;
                        finalData[idx] = sum;
                    }
                }
            }

            // アルファチャンネルをコピー
            for (let i = 0; i < data.length; i += 4) {
                finalData[i + 3] = data[i + 3];
            }

            const newImageData = new ImageData(finalData, canvas.width, canvas.height);
            ctx.putImageData(newImageData, 0, 0);
            resolve(canvas.toDataURL('image/jpeg', 0.95));
        });
    }

    /**
     * Median Filter
     * @param imageDataUrl - Base64エンコードされた画像データ
     * @param windowSize - フィルタウィンドウサイズ
     * @returns フィルタ処理された画像データ
     */
    private async medianFilter(imageDataUrl: string, windowSize: number): Promise<string> {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    resolve(imageDataUrl);
                    return;
                }

                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                const output = new Uint8ClampedArray(data);

                const halfWindow = Math.floor(windowSize / 2);

                for (let y = 0; y < canvas.height; y++) {
                    for (let x = 0; x < canvas.width; x++) {
                        for (let c = 0; c < 3; c++) {
                            const values: number[] = [];

                            for (let dy = -halfWindow; dy <= halfWindow; dy++) {
                                for (let dx = -halfWindow; dx <= halfWindow; dx++) {
                                    const ny = y + dy;
                                    const nx = x + dx;

                                    if (ny >= 0 && ny < canvas.height && nx >= 0 && nx < canvas.width) {
                                        const idx = (ny * canvas.width + nx) * 4 + c;
                                        values.push(data[idx]);
                                    }
                                }
                            }

                            values.sort((a, b) => a - b);
                            const median = values[Math.floor(values.length / 2)];
                            const idx = (y * canvas.width + x) * 4 + c;
                            output[idx] = median;
                        }
                    }
                }

                const newImageData = new ImageData(output, canvas.width, canvas.height);
                ctx.putImageData(newImageData, 0, 0);
                resolve(canvas.toDataURL('image/jpeg', 0.95));
            };

            img.src = imageDataUrl;
        });
    }

    /**
     * テキストシャープ化
     * Unsharp Maskingで文字のエッジを強調
     * @param imageData - Base64エンコードされた画像データ
     * @returns シャープ化された画像データ
     */
    async sharpenText(imageData: string): Promise<string> {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = async () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    resolve(imageData);
                    return;
                }

                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                // まずぼかし画像を作成
                const blurred = await this.gaussianBlur(canvas, 1.0);

                // 元の画像からぼかし画像を引いてエッジ成分を抽出
                const blurredImg = new Image();
                blurredImg.onload = () => {
                    const blurredCanvas = document.createElement('canvas');
                    const blurredCtx = blurredCanvas.getContext('2d');

                    if (!blurredCtx) {
                        resolve(imageData);
                        return;
                    }

                    blurredCanvas.width = canvas.width;
                    blurredCanvas.height = canvas.height;
                    blurredCtx.drawImage(blurredImg, 0, 0);

                    const originalData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const blurredData = blurredCtx.getImageData(0, 0, canvas.width, canvas.height);

                    const amount = 1.5; // シャープ化の強度

                    for (let i = 0; i < originalData.data.length; i += 4) {
                        for (let c = 0; c < 3; c++) {
                            const original = originalData.data[i + c];
                            const blur = blurredData.data[i + c];
                            const edge = original - blur;
                            const sharpened = original + edge * amount;
                            originalData.data[i + c] = Math.max(0, Math.min(255, sharpened));
                        }
                    }

                    ctx.putImageData(originalData, 0, 0);
                    resolve(canvas.toDataURL('image/jpeg', 0.95));
                };

                blurredImg.src = blurred;
            };

            img.src = imageData;
        });
    }

    /**
     * 統合画像処理パイプライン
     * すべての前処理を最適な順序で適用
     * @param imageData - Base64エンコードされた画像データ
     * @param options - 処理オプション
     * @returns 処理された画像データ
     */
    async processImage(
        imageData: string,
        options: {
            deskew?: boolean;
            binarize?: boolean;
            enhanceContrast?: boolean;
            removeNoise?: boolean;
            sharpen?: boolean;
        } = {}
    ): Promise<string> {
        let processed = imageData;

        // 1. 傾き補正（最初に実行）
        if (options.deskew !== false) {
            console.log('傾き補正を実行中...');
            processed = await this.deskewImage(processed);
        }

        // 2. ノイズ除去
        if (options.removeNoise !== false) {
            console.log('ノイズ除去を実行中...');
            processed = await this.removeNoise(processed);
        }

        // 3. コントラスト強化
        if (options.enhanceContrast !== false) {
            console.log('コントラスト強化を実行中...');
            processed = await this.enhanceContrast(processed);
        }

        // 4. シャープ化
        if (options.sharpen !== false) {
            console.log('シャープ化を実行中...');
            processed = await this.sharpenText(processed);
        }

        // 5. 二値化（最後に実行）
        if (options.binarize !== false) {
            console.log('適応的二値化を実行中...');
            processed = await this.adaptiveBinarization(processed);
        }

        return processed;
    }
}
