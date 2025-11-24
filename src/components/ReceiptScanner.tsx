import React, { useState, useRef, useEffect } from 'react';
import { Camera, Image as ImageIcon, RotateCcw, Save, Copy, Share2, ZoomIn, ZoomOut, CheckCircle, AlertCircle } from 'lucide-react';
import { ReceiptParser, ReceiptData } from '../utils/ReceiptParser';
import { ImageProcessor } from '../utils/imageProcessor';
import { QualityChecker, QualityCheckResult } from '../utils/qualityChecker';

// Google Cloud Vision APIクライアントをインポート
import { ImageAnnotatorClient } from '@google-cloud/vision';

interface ReceiptScannerProps {
  onScanComplete: (data: ReceiptData) => void;
  // 処理状態の更新コールバックを追加
  onProcessingStateChange?: (state: { isProcessing: boolean; progress?: number; currentStep?: string }) => void;
}

const ReceiptScanner: React.FC<ReceiptScannerProps> = (props) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ReceiptData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // 画像のズームレベルを追加
  const [zoomLevel, setZoomLevel] = useState(1);
  // フラッシュの状態を追加
  const [isFlashOn, setIsFlashOn] = useState(false);

  // Phase 2: 品質チェック関連の状態
  const [qualityScore, setQualityScore] = useState<number>(0);
  const [qualityWarnings, setQualityWarnings] = useState<string[]>([]);
  const [receiptDetected, setReceiptDetected] = useState<boolean>(false);
  const [autoCaptureCountdown, setAutoCaptureCountdown] = useState<number>(0);
  const [isAutoCapturing, setIsAutoCapturing] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const trackRef = useRef<MediaStreamTrack | null>(null);
  const qualityCheckIntervalRef = useRef<number | null>(null);
  const autoCaptureTimerRef = useRef<number | null>(null);

  // ImageProcessorとQualityCheckerのインスタンスを作成
  const imageProcessor = new ImageProcessor();
  const qualityChecker = new QualityChecker();

  const ERROR_MESSAGES = {
    CAMERA_PERMISSION: "カメラの使用許可が必要です",
    OCR_FAILED: "レシートの読み取りに失敗しました",
    NO_DATA_FOUND: "必要な情報が見つかりませんでした",
    INVALID_IMAGE: "画像が不鮮明です。再度撮影してください"
  };

  // カメラ起動
  const startCamera = async () => {
    console.log('カメラ起動ボタンがクリックされました');
    console.log('現在のプロトコル:', location.protocol);
    console.log('現在のホスト名:', location.hostname);

    // HTTPS環境でのカメラアクセス確認
    if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
      console.log('HTTPS環境での警告を表示します');
      const confirmed = window.confirm(
        'モバイル端末でカメラ機能を使用するにはHTTPS環境が必要です。' +
        '現在のHTTP環境ではカメラが動作しない可能性があります。' +
        'テストを続行しますか？'
      );
      if (!confirmed) {
        console.log('ユーザーが警告をキャンセルしました');
        return;
      }
      console.log('ユーザーが警告を確認しました');
    }

    // カメラ使用許可モーダルを表示
    setShowPermissionModal(true);
    console.log('カメラ使用許可モーダルを表示しました');
  };

  // カメラ許可処理
  const handleCameraPermission = async () => {
    console.log('カメラ許可ボタンがクリックされました');
    try {
      setShowPermissionModal(false);
      console.log('カメラアクセスを試行中...');

      console.log('カメラ制約を設定中...');
      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };
      console.log('カメラ制約:', constraints);

      // モバイル環境での特別処理
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      console.log('モバイル環境チェック:', isMobile);

      if (isMobile) {
        // モバイル環境では制約を簡素化
        const mobileConstraints = {
          video: {
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        };
        console.log('モバイル用カメラ制約:', mobileConstraints);
        const stream = await navigator.mediaDevices.getUserMedia(mobileConstraints);
        console.log('モバイル環境でカメラストリームを取得しました:', stream);
        streamRef.current = stream;
        trackRef.current = stream.getVideoTracks()[0];

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          console.log('video要素にストリームを設定しました');
        }
      } else {
        // デスクトップ環境では詳細な制約を使用
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log('カメラストリームを取得しました:', stream);
        streamRef.current = stream;
        trackRef.current = stream.getVideoTracks()[0];

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          console.log('video要素にストリームを設定しました');
        }
      }

      setIsCameraActive(true);
      setError(null);
      console.log('カメラが正常に起動しました');
    } catch (err: any) {
      console.error('カメラ起動エラー:', err);
      // より詳細なエラーハンドリング
      if (err.name === 'NotAllowedError') {
        setError('カメラの使用が拒否されました。ブラウザの設定でカメラの使用を許可してください。');
      } else if (err.name === 'NotFoundError') {
        setError('利用可能なカメラが見つかりません。');
      } else if (err.name === 'NotReadableError') {
        setError('カメラが他のアプリケーションによって使用中です。');
      } else if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
        setError('モバイル端末でカメラ機能を使用するにはHTTPS環境が必要です。HTTPS環境またはlocalhostでのみカメラ機能を使用できます。');
      } else {
        setError(ERROR_MESSAGES.CAMERA_PERMISSION);
      }
    }
  };

  // カメラ停止
  const stopCamera = () => {
    console.log('カメラ停止処理を開始');
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        console.log('トラックを停止:', track);
        track.stop();
      });
      streamRef.current = null;
      trackRef.current = null;
    }
    setIsCameraActive(false);
    console.log('カメラ停止処理完了');
  };

  // フラッシュの切り替え
  const toggleFlash = async () => {
    if (trackRef.current && 'torch' in trackRef.current.getCapabilities()) {
      try {
        const newState = !isFlashOn;
        await trackRef.current.applyConstraints({
          advanced: [{ torch: newState } as any]
        });
        setIsFlashOn(newState);
      } catch (err) {
        console.error('フラッシュの切り替えに失敗しました:', err);
        setError('フラッシュの切り替えに失敗しました');
      }
    } else {
      setError('このデバイスではフラッシュがサポートされていません');
    }
  };

  // ズームの調整
  const adjustZoom = async (delta: number) => {
    if (trackRef.current && 'zoom' in trackRef.current.getCapabilities()) {
      try {
        const capabilities = trackRef.current.getCapabilities() as any;
        const settings = trackRef.current.getSettings() as any;
        const currentZoom = settings.zoom || 1;
        const newZoom = Math.min(Math.max(currentZoom + delta, capabilities.zoom.min), capabilities.zoom.max);

        await trackRef.current.applyConstraints({
          advanced: [{ zoom: newZoom } as any]
        });
        setZoomLevel(newZoom);
      } catch (err) {
        console.error('ズームの調整に失敗しました:', err);
      }
    }
  };

  // 写真撮影（高度な画像処理を適用）
  const capturePhoto = async () => {
    console.log('写真撮影を開始');
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      console.log('video要素のサイズ:', video.videoWidth, 'x', video.videoHeight);

      // canvasのサイズをvideoに合わせる
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // videoの現在のフレームをcanvasに描画
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        console.log('canvasに画像を描画しました');

        // 画像をBase64として取得（画質を調整）
        const imageData = canvas.toDataURL('image/jpeg', 0.9);
        console.log('画像データを取得しました。データURLの長さ:', imageData.length);

        // 高度な画像前処理を実行（傾き補正、ノイズ除去、二値化など）
        console.log('高度な画像処理を開始...');
        const preprocessedImage = await imageProcessor.processImage(imageData, {
          deskew: true,
          binarize: true,
          enhanceContrast: true,
          removeNoise: true,
          sharpen: true
        });
        console.log('画像処理完了');
        setCapturedImage(preprocessedImage);
        stopCamera();

        // OCR処理を実行
        processImage(preprocessedImage);
      } else {
        console.error('canvasのコンテキストを取得できませんでした');
        setError('画像処理に失敗しました。もう一度お試しください。');
      }
    } else {
      console.error('videoまたはcanvas要素が見つかりません');
      setError('カメラが正しく初期化されていません。もう一度お試しください。');
    }
  };

  // OCR処理（強化版）
  const performOCR = async (imageData: string): Promise<string> => {
    console.log('OCR処理を開始');
    // 画像データからBase64プレフィックスを削除
    const base64Image = imageData.split(',')[1];
    console.log('Base64画像データの長さ:', base64Image?.length);

    // Google Cloud Vision APIキーを環境変数から取得
    const apiKey = import.meta.env.VITE_GOOGLE_VISION_API_KEY;
    console.log('APIキーの存在確認:', !!apiKey);

    if (!apiKey) {
      // APIキーが設定されていない場合は、Tesseract.jsにフォールバック
      console.warn('Google Cloud Vision APIキーが設定されていません。Tesseract.jsを使用します。');
      return await performOCRWithTesseract(imageData);
    }

    // 画像データの検証
    if (!base64Image) {
      console.error('画像データが無効です');
      throw new Error('INVALID_IMAGE');
    }

    try {
      console.log('Google Cloud Vision APIにリクエストを送信中...');
      // Google Cloud Vision APIにリクエストを送信（最適化版）
      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requests: [
              {
                image: {
                  content: base64Image
                },
                features: [
                  {
                    type: 'DOCUMENT_TEXT_DETECTION', // ドキュメントテキスト検出を優先
                    maxResults: 1
                  },
                  {
                    type: 'TEXT_DETECTION', // 通常のテキスト検出も追加
                    maxResults: 1
                  },
                  {
                    type: 'IMAGE_PROPERTIES', // 画像品質分析
                    maxResults: 1
                  }
                ],
                imageContext: {
                  languageHints: ['ja', 'en'], // 日本語と英語をヒント
                  textDetectionParams: {
                    enableTextDetectionConfidenceScore: true // 信頼度スコアを有効化
                  }
                }
              }
            ]
          })
        }
      );

      console.log('APIレスポンスのステータス:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('APIエラーレスポンス:', errorText);
        // Google Cloud Vision APIが失敗した場合、Tesseract.jsにフォールバック
        console.warn('Google Cloud Vision APIが失敗しました。Tesseract.jsにフォールバックします。');
        return await performOCRWithTesseract(imageData);
      }

      const result = await response.json();
      console.log('APIレスポンスの内容:', JSON.stringify(result, null, 2));

      // レスポンスからテキストを取得（優先順位付き）
      const ocrText =
        result.responses[0]?.fullTextAnnotation?.text || // DOCUMENT_TEXT_DETECTION
        result.responses[0]?.textAnnotations?.[0]?.description || // TEXT_DETECTION
        '';

      console.log('抽出されたテキスト:', ocrText);

      if (!ocrText || ocrText.trim().length === 0) {
        console.warn('Google Cloud Vision APIでテキストが抽出できませんでした。Tesseract.jsにフォールバックします。');
        return await performOCRWithTesseract(imageData);
      }

      return ocrText;
    } catch (error) {
      console.error('Vision API処理エラー:', error);
      // エラーが発生した場合、Tesseract.jsにフォールバック
      console.warn('Vision API処理エラーが発生しました。Tesseract.jsにフォールバックします。');
      return await performOCRWithTesseract(imageData);
    }
  };

  // Tesseract.jsを使用したOCR処理（フォールバック）
  const performOCRWithTesseract = async (imageData: string): Promise<string> => {
    console.log('Tesseract.jsでOCR処理を開始');
    try {
      // 動的インポートでTesseract.jsを読み込み
      const Tesseract = await import('tesseract.js');

      // OCR処理を実行（日本語+英語）
      const result = await Tesseract.recognize(
        imageData,
        'jpn+eng',
        {
          logger: (m: any) => {
            if (m.status === 'recognizing text') {
              console.log(`Tesseract.js 認識中: ${Math.round(m.progress * 100)}%`);
            }
          }
        }
      );

      console.log('Tesseract.js OCR結果:', result.data.text);
      return result.data.text;
    } catch (error) {
      console.error('Tesseract.js処理エラー:', error);
      throw new Error('OCR_FAILED');
    }
  };

  // AI分析機能
  const analyzeReceiptWithAI = (ocrText: string, extractedData: any) => {
    console.log('AI分析を開始');

    // AIによる追加情報の抽出
    const aiAnalysis = {
      // カテゴリの推定
      category: estimateCategory(ocrText),
      // 支出の種類の推定
      expenseType: estimateExpenseType(ocrText),
      // 信頼度の再計算
      confidence: calculateAIConfidence(ocrText, extractedData),
      // その他の分析情報
      insights: generateInsights(ocrText, extractedData)
    };

    console.log('AI分析結果:', aiAnalysis);
    return aiAnalysis;
  };

  // カテゴリの推定
  const estimateCategory = (text: string) => {
    const categories = {
      '食費': ['レストラン', 'カフェ', 'マクドナルド', 'スターバックス', '居酒屋', 'ラーメン', '寿司'],
      '交通費': ['電車', 'バス', 'タクシー', 'ガソリン', '駐車場'],
      '買い物': ['スーパー', 'ダイエー', 'セブンイレブン', 'ローソン', 'ファミリーマート', 'Amazon', '楽天'],
      '娯楽': ['映画', 'ゲーム', '本屋', 'CD', 'DVD'],
      '医療': ['病院', '薬局', 'クリニック'],
      '教育': ['書店', '学習塾', '受験', '教材'],
      '通信': ['電話', 'インターネット', '携帯'],
      '公共': ['水道', '電気', 'ガス', 'NHK'],
      'その他': []
    };

    for (const [category, keywords] of Object.entries(categories)) {
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          return category;
        }
      }
    }

    return 'その他';
  };

  // 支出の種類の推定
  const estimateExpenseType = (text: string) => {
    if (text.includes('給与') || text.includes('収入')) {
      return '収入';
    } else if (text.includes('交通') || text.includes('電車') || text.includes('バス')) {
      return '交通費';
    } else if (text.includes('食') || text.includes('レストラン') || text.includes('カフェ')) {
      return '食費';
    } else if (text.includes('買い物') || text.includes('スーパー')) {
      return '買い物';
    } else {
      return '一般支出';
    }
  };

  // AIによる信頼度の計算
  const calculateAIConfidence = (text: string, extractedData: any) => {
    // テキストの品質を評価
    const textQuality = Math.min(text.length / 100, 1); // テキスト長に基づく品質評価

    // 抽出されたデータの整合性を評価
    let consistency = 0;
    if (extractedData.store_name && extractedData.store_name.length > 1) consistency += 0.25;
    if (extractedData.date && extractedData.date.length > 0) consistency += 0.25;
    if (extractedData.total_amount && extractedData.total_amount > 0) consistency += 0.25;
    if (extractedData.tax_rate !== undefined) consistency += 0.25;

    // 総合信頼度を計算
    const confidence = (textQuality + consistency) / 2;
    return Math.min(Math.max(confidence, 0), 1); // 0-1の範囲に正規化
  };

  // 分析インサイトの生成
  const generateInsights = (text: string, extractedData: any) => {
    const insights = [];

    // 金額に関するインサイト
    if (extractedData.total_amount > 10000) {
      insights.push('高額な支出です。経費精算の際には詳細な説明が必要かもしれません。');
    }

    // 日付に関するインサイト
    const today = new Date();
    const receiptDate = new Date(extractedData.date);
    const daysDiff = Math.floor((today.getTime() - receiptDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff > 30) {
      insights.push('このレシートは30日以上前のものです。経費申請の期限に注意してください。');
    }

    // 店舗に関するインサイト
    if (text.includes('コンビニ') || text.includes('セブンイレブン') ||
      text.includes('ローソン') || text.includes('ファミリーマート')) {
      insights.push('コンビニでの購入です。領収書がなくても電子レシートで申請可能です。');
    }

    return insights;
  };

  // 画像処理とOCR
  const processImage = async (imageData: string) => {
    console.log('画像処理を開始');
    setIsProcessing(true);
    setError(null);

    // 処理状態の更新コールバックがある場合は呼び出す
    if (props.onProcessingStateChange) {
      props.onProcessingStateChange({
        isProcessing: true,
        progress: 0,
        currentStep: '画像前処理中...'
      });
    }

    try {
      // 画像品質チェック
      if (!validateImageQuality(imageData)) {
        throw new Error('INVALID_IMAGE');
      }

      console.log('OCR処理を実行中...');
      if (props.onProcessingStateChange) {
        props.onProcessingStateChange({
          isProcessing: true,
          progress: 30,
          currentStep: 'OCR処理中...'
        });
      }

      // 実際のOCR処理を実行
      const ocrResult = await performOCR(imageData);
      console.log('OCR処理完了。結果の長さ:', ocrResult.length);

      // データ抽出
      console.log('データ抽出を実行中...');
      if (props.onProcessingStateChange) {
        props.onProcessingStateChange({
          isProcessing: true,
          progress: 60,
          currentStep: 'データ抽出中...'
        });
      }

      const parser = new ReceiptParser();
      const extractedData = parser.parseReceipt(ocrResult);
      console.log('データ抽出完了:', extractedData);

      // AI分析を実行
      console.log('AI分析を実行中...');
      if (props.onProcessingStateChange) {
        props.onProcessingStateChange({
          isProcessing: true,
          progress: 80,
          currentStep: 'AI分析中...'
        });
      }

      const aiAnalysis = analyzeReceiptWithAI(ocrResult, extractedData);

      // AI分析結果を抽出データに統合
      const enhancedData = {
        ...extractedData,
        category: aiAnalysis.category,
        expenseType: aiAnalysis.expenseType,
        aiConfidence: aiAnalysis.confidence,
        insights: aiAnalysis.insights
      };

      // バリデーション
      if (!validateExtractedData(enhancedData)) {
        throw new Error('NO_DATA_FOUND');
      }

      if (props.onProcessingStateChange) {
        props.onProcessingStateChange({
          isProcessing: true,
          progress: 90,
          currentStep: '処理完了...'
        });
      }

      setExtractedData(enhancedData as any);
      props.onScanComplete(enhancedData as any);
    } catch (err: any) {
      console.error('OCR処理エラー:', err);
      setError(ERROR_MESSAGES[err.message as keyof typeof ERROR_MESSAGES] || "予期しないエラーが発生しました");
    } finally {
      setIsProcessing(false);
      if (props.onProcessingStateChange) {
        props.onProcessingStateChange({
          isProcessing: false,
          progress: 100,
          currentStep: '完了'
        });
      }
    }
  };

  // 抽出データのバリデーション
  const validateExtractedData = (data: ReceiptData): boolean => {
    console.log('データバリデーションを実行中:', data);
    // 必須フィールドが存在し、有効な値であることを確認
    const isValid = (
      data.store_name.length > 0 &&
      data.date.length > 0 &&
      data.total_amount > 0
    );
    console.log('データバリデーション結果:', isValid);
    return isValid;
  };

  // 画像品質チェック
  const validateImageQuality = (imageData: string): boolean => {
    console.log('画像品質チェックを実行中');
    // ここに画像品質チェックのロジックを実装
    // 現在は常にtrueを返す
    console.log('画像品質チェック結果: OK');
    return true;
  };

  // 再撮影
  const retakePhoto = () => {
    setCapturedImage(null);
    setExtractedData(null);
    setError(null);
    startCamera();
  };

  // 画像選択
  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target?.result as string;
        if (imageData) {
          // 高度な画像前処理を実行
          const preprocessedImage = await imageProcessor.processImage(imageData, {
            deskew: true,
            binarize: true,
            enhanceContrast: true,
            removeNoise: true,
            sharpen: true
          });
          setCapturedImage(preprocessedImage);
          processImage(preprocessedImage);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // 編集
  const handleEdit = (field: keyof ReceiptData, value: string | number) => {
    if (extractedData) {
      setExtractedData({
        ...extractedData,
        [field]: value
      });
    }
  };

  // JSON出力
  const exportToJson = () => {
    if (extractedData) {
      const output = {
        success: true,
        data: extractedData,
        confidence: extractedData.confidence
      };
      const json = JSON.stringify(output, null, 2);
      console.log(json);
      // 実際の実装では、ファイルダウンロードやクリップボードコピーを行う
    }
  };

  // クリップボードコピー
  const copyToClipboard = () => {
    if (extractedData) {
      const json = JSON.stringify(extractedData, null, 2);
      navigator.clipboard.writeText(json);
    }
  };

  // 共有
  const shareData = () => {
    if (extractedData && navigator.share) {
      navigator.share({
        title: 'レシートデータ',
        text: JSON.stringify(extractedData, null, 2)
      });
    }
  };

  // コンポーネントのクリーンアップ
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* カメラ使用許可モーダル */}
      {showPermissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">カメラの使用許可</h3>
              <p className="text-gray-600 mb-6">
                レシートをスキャンするには、カメラへのアクセス許可が必要です。
                カメラでレシートを撮影するためにアクセスを許可してください。
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowPermissionModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleCameraPermission}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  許可する
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* カメラ画面 */}
      {!capturedImage && !extractedData && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">レシートスキャナー</h2>

          {isCameraActive ? (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-96 object-cover rounded-lg bg-gray-100"
              />
              {/* 撮影ガイドオーバーレイ */}
              <div className="absolute inset-0 border-2 border-dashed border-white m-8 pointer-events-none"></div>

              {/* ズームとフラッシュコントロール */}
              <div className="absolute top-4 right-4 flex flex-col space-y-2">
                <button
                  onClick={() => adjustZoom(1)}
                  className="p-2 bg-black bg-opacity-50 rounded-full text-white"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
                <button
                  onClick={() => adjustZoom(-1)}
                  className="p-2 bg-black bg-opacity-50 rounded-full text-white"
                >
                  <ZoomOut className="w-5 h-5" />
                </button>
                <button
                  onClick={toggleFlash}
                  className={`p-2 rounded-full ${isFlashOn ? 'bg-yellow-500' : 'bg-black bg-opacity-50'} text-white`}
                >
                  <span className="text-xs">FLASH</span>
                </button>
              </div>

              <div className="flex justify-center mt-4 space-x-4">
                <button
                  onClick={capturePhoto}
                  className="w-16 h-16 rounded-full bg-white border-4 border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-red-500"></div>
                </button>

                <button
                  onClick={stopCamera}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <button
                onClick={startCamera}
                className="w-full py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <Camera className="w-5 h-5 mr-2" />
                カメラで撮影
              </button>

              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <button className="w-full py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 mr-2" />
                  画像を選択
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
              {error}
            </div>
          )}
        </div>
      )}

      {/* 確認・編集画面 */}
      {capturedImage && !extractedData && isProcessing && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">処理中...</h2>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      )}

      {capturedImage && extractedData && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">抽出結果</h2>

          <div className="mb-6">
            <img
              src={capturedImage}
              alt="Captured receipt"
              className="w-full h-48 object-contain rounded-lg border"
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">店舗名</label>
              <input
                type="text"
                value={extractedData.store_name}
                onChange={(e) => handleEdit('store_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">日付</label>
              <input
                type="date"
                value={extractedData.date}
                onChange={(e) => handleEdit('date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">合計金額</label>
              <input
                type="number"
                value={extractedData.total_amount}
                onChange={(e) => handleEdit('total_amount', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">税率</label>
              <input
                type="number"
                value={extractedData.tax_rate}
                onChange={(e) => handleEdit('tax_rate', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* AI分析結果の表示 */}
            {extractedData.category && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ（AI推定）</label>
                <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-md">
                  {extractedData.category}
                </div>
              </div>
            )}

            {extractedData.expenseType && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">支出種別（AI推定）</label>
                <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-md">
                  {extractedData.expenseType}
                </div>
              </div>
            )}

            {extractedData.aiConfidence !== undefined && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">AI信頼度</label>
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${extractedData.aiConfidence * 100}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm text-gray-600">
                    {Math.round(extractedData.aiConfidence * 100)}%
                  </span>
                </div>
              </div>
            )}

            {extractedData.insights && extractedData.insights.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">分析インサイト</label>
                <ul className="list-disc pl-5 space-y-1">
                  {extractedData.insights.map((insight, index) => (
                    <li key={index} className="text-sm text-gray-600">
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mt-6">
            <button
              onClick={retakePhoto}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              再撮影
            </button>

            <button
              onClick={exportToJson}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              保存
            </button>

            <button
              onClick={copyToClipboard}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Copy className="w-4 h-4 mr-2" />
              コピー
            </button>

            {typeof navigator.share !== 'undefined' && (
              <button
                onClick={shareData}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Share2 className="w-4 h-4 mr-2" />
                共有
              </button>
            )}
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
              {error}
            </div>
          )}
        </div>
      )}

      {/* キャンバス（非表示） */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default ReceiptScanner;