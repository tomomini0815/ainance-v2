import React, { useState, useRef, useEffect } from 'react'
import { Upload, FileText, CheckCircle, ArrowRight, Camera, X, RefreshCw, FileImage, Search, Eye, RotateCcw, Check, Save, AlertTriangle } from 'lucide-react';
import DocumentUpload from '../components/DocumentUpload';
// HeaderコンポーネントはApp.tsxでレンダリングされるため、ここでは削除
// レシートスキャナーコンポーネントをインポート
import ReceiptScanner from '../components/ReceiptScanner'
import { ReceiptData as ParsedReceiptData } from '../utils/ReceiptParser'

interface ReceiptData {
  id: string
  date: string
  merchant: string
  amount: number
  category: string
  description: string
  confidence: number
  status: 'pending' | 'approved' | 'rejected'
  // 各項目の信頼度スコアを追加
  confidenceScores?: {
    date?: number
    merchant?: number
    amount?: number
  }
  taxRate?: number
  // AI分析結果を追加
  aiAnalysis?: {
    category?: string
    expenseType?: string
    confidence?: number
    insights?: string[]
    items?: Array<{
      name: string
      price: number
      quantity: number
      category?: string
    }>
  }
}

// レシートスキャンの状態管理用インターフェース
interface ScanState {
  isProcessing: boolean
  errorMessage?: string
  retryCount: number
  imageData?: string
  // 処理進捗を追加
  progress?: number
  currentStep?: string
}

const ReceiptProcessing: React.FC = () => {
  const [uploadedReceipts, setUploadedReceipts] = useState<ReceiptData[]>([
    {
      id: '1',
      date: '2024-01-15',
      merchant: 'セブンイレブン',
      amount: 1200,
      category: '消耗品費',
      description: '事務用品購入',
      confidence: 95,
      status: 'pending'
    },
    {
      id: '2',
      date: '2024-01-14',
      merchant: 'スターバックス',
      amount: 580,
      category: '接待交際費',
      description: 'クライアント打ち合わせ',
      confidence: 88,
      status: 'approved'
    }
  ])

  // スキャン状態の管理
  const [scanState, setScanState] = useState<ScanState>({
    isProcessing: false,
    retryCount: 0
  })

  // サンプルレシートデータを追加
  const sampleReceipts: ReceiptData[] = [
    {
      id: '3',
      date: '2024-01-16',
      merchant: 'ローソン',
      amount: 750,
      category: '消耗品費',
      description: 'コピー用紙',
      confidence: 90,
      status: 'pending'
    },
    {
      id: '4',
      date: '2024-01-13',
      merchant: 'マクドナルド',
      amount: 680,
      category: '接待交際費',
      description: '社内打合せ',
      confidence: 85,
      status: 'pending'
    }
  ];

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<ReceiptData>>({})

  const [showCamera, setShowCamera] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // フィルターと検索の状態
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  // 詳細表示用の状態
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  // カメラ開始処理
  const startCamera = async () => {
    // モバイル端末からのアクセスかどうかを判定
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // HTTP環境でのカメラアクセスに関する警告を表示（localhostのみ許可）
    if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
      // モバイル端末からのアクセスの場合、特別な警告を表示
      if (isMobile) {
        const confirmed = window.confirm(
          'モバイル端末からのカメラアクセスにはHTTPS環境が必要です。' +
          '現在はHTTP環境のため、カメラが動作しない可能性があります。' +
          'テスト目的であれば、PCのlocalhost環境でアクセスしてください。' +
          '続行しますか？'
        );
        if (!confirmed) return;
      } else {
        // PCからのアクセスの場合
        const confirmed = window.confirm(
          'カメラ機能を使用するにはHTTPS環境またはlocalhostが必要です。' +
          'HTTP環境ではカメラが動作しない可能性があります。' +
          '続行しますか？'
        );
        if (!confirmed) return;
      }
    }

    try {
      // 背面カメラを優先して試す
      let stream: MediaStream;

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
      } catch (err) {
        // 背面カメラが利用できない場合はフロントカメラを試す
        console.warn('背面カメラが利用できません。フロントカメラを試します。', err);
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowCamera(true);
    } catch (err) {
      console.error('カメラの起動に失敗しました:', err);
      // より詳細なエラーメッセージを表示
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        alert('カメラの使用が拒否されました。ブラウザの設定でカメラの使用を許可してください。');
      } else if (err instanceof DOMException && err.name === 'NotFoundError') {
        alert('利用可能なカメラが見つかりません。');
      } else if (err instanceof DOMException && err.name === 'NotReadableError') {
        alert('カメラが他のアプリケーションによって使用中です。');
      } else {
        // HTTP環境でのエラーメッセージを追加
        if (location.protocol !== 'https:') {
          // モバイル端末からのアクセスの場合、特別なメッセージを表示
          if (isMobile) {
            alert('モバイル端末からのカメラアクセスにはHTTPS環境が必要です。PCのlocalhost環境でテストしてください。');
          } else {
            alert('カメラの起動に失敗しました。HTTP環境ではカメラが動作しない可能性があります。HTTPS環境またはlocalhostでのみカメラ機能を使用できます。');
          }
        } else {
          alert('カメラの起動に失敗しました。ブラウザの設定を確認してください。');
        }
      }
    }
  }

  // カメラ停止処理
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setShowCamera(false)
  }

  // 写真撮影処理
  const capturePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')

      // canvasのサイズをvideoに合わせる
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // videoの現在のフレームをcanvasに描画
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        // 画像をBlobとして取得
        canvas.toBlob(async (blob) => {
          if (blob) {
            // OCR処理を実行
            await processReceiptImage(blob)
          }
        }, 'image/jpeg', 0.95)
      }

      stopCamera()
    }
  }

  // レシート画像処理（OCR実装の強化版）
  const processReceiptImage = async (imageBlob: Blob) => {
    // Google Cloud Vision APIを使用して処理
    await processReceiptImageWithVisionAPI(imageBlob);
  };

  // Google Cloud Vision APIを使用したレシート画像処理
  const processReceiptImageWithVisionAPI = async (imageBlob: Blob) => {
    // 処理状態を更新
    setScanState({
      isProcessing: true,
      retryCount: 0
    });

    try {
      // 画像をBase64に変換
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target?.result as string;
        if (!imageData) {
          throw new Error('画像データの読み込みに失敗しました');
        }

        // Base64文字列からプレフィックスを削除
        const base64Image = imageData.split(',')[1];

        // Google Cloud Vision APIの設定
        // 実際のAPIキーは環境変数から取得
        const apiKey = import.meta.env.VITE_GOOGLE_VISION_API_KEY;
        if (!apiKey) {
          throw new Error('Google Cloud Vision APIキーが設定されていません');
        }

        // 新しいレシートを追加（処理中状態）
        const newReceipt: ReceiptData = {
          id: Date.now().toString(),
          date: new Date().toISOString().split('T')[0],
          merchant: '処理中...',
          amount: 0,
          category: '未分類',
          description: '解析中...',
          confidence: 0,
          status: 'pending'
        }
        setUploadedReceipts(prev => [newReceipt, ...prev])

        try {
          // Google Cloud Vision APIにリクエストを送信
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
                        type: 'TEXT_DETECTION',
                        maxResults: 100
                      }
                    ]
                  }
                ]
              })
            }
          );

          if (!response.ok) {
            throw new Error(`APIリクエスト失敗: ${response.status} ${response.statusText}`);
          }

          const result = await response.json();
          console.log('Vision API結果:', result);

          // レスポンスからテキストを取得
          const ocrText = result.responses[0]?.fullTextAnnotation?.text || '';

          if (!ocrText) {
            throw new Error('テキストが検出されませんでした');
          }

          // テキストから情報を抽出
          const extractedData = extractReceiptData(ocrText);

          // レシート情報を更新
          setUploadedReceipts(prev => prev.map(receipt =>
            receipt.id === newReceipt.id
              ? {
                ...receipt,
                merchant: extractedData.merchant || '不明',
                date: extractedData.date || receipt.date,
                amount: extractedData.amount || 0,
                taxRate: extractedData.taxRate || 0,
                description: extractedData.description || 'OCR処理完了',
                confidence: extractedData.confidence || 80,
                confidenceScores: extractedData.confidenceScores
              }
              : receipt
          ));
        } catch (error: any) {
          console.error('Vision API処理エラー:', error);
          // エラーの場合、エラーメッセージを表示
          setUploadedReceipts(prev => prev.map(receipt =>
            receipt.id === newReceipt.id
              ? {
                ...receipt,
                merchant: '解析エラー',
                description: `OCR処理に失敗しました: ${error.message}`,
                confidence: 0
              }
              : receipt
          ));
        } finally {
          // 処理状態を更新
          setScanState(prev => ({
            ...prev,
            isProcessing: false
          }));
        }
      };

      reader.readAsDataURL(imageBlob);
    } catch (error: any) {
      console.error('画像処理エラー:', error);
      setScanState(prev => ({
        ...prev,
        isProcessing: false,
        errorMessage: `画像の処理中にエラーが発生しました: ${error.message}`
      }));
    }
  };

  // 画像前処理機能
  const preprocessImage = (imageData: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(imageData);
          return;
        }

        // キャンバスのサイズを画像に合わせる
        canvas.width = img.width;
        canvas.height = img.height;

        // 画像をキャンバスに描画
        ctx.drawImage(img, 0, 0);

        // 画像処理（簡単なコントラスト調整）
        const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageDataObj.data;

        // コントラストを強調
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // グレースケール変換
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;

          // コントラスト調整
          const contrast = 1.2;
          const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
          const adjusted = factor * (gray - 128) + 128;

          // 0-255の範囲にクリップ
          data[i] = data[i + 1] = data[i + 2] = Math.max(0, Math.min(255, adjusted));
        }

        ctx.putImageData(imageDataObj, 0, 0);

        // 処理後の画像データをBase64として返す
        resolve(canvas.toDataURL('image/jpeg'));
      };

      img.src = imageData;
    });
  };

  // テキストからレシート情報を抽出する関数（簡易的な実装）
  const extractReceiptData = (text: string) => {
    // 正規表現パターン
    const patterns = {
      totalAmount: /合計|総計|total.*?([0-9,]+)円/i,
      date: /(\d{4}[年/-]\d{1,2}[月/-]\d{1,2}[日]?)|(\d{2}\/\d{2}\/\d{2})/i,
      taxRate: /税率?\s*([0-9]+)%|消費税.*?([0-9]+)%/i,
      storeName: /^([ァ-ヴー・ａ-ｚＡ-Ｚ0-9\u4E00-\u9FFF]+)(店|ストア|マート)/i
    };

    // 店舗名の候補を検索
    let merchant = '不明';
    let merchantConfidence = 0;

    const storeNameMatch = text.match(patterns.storeName);
    if (storeNameMatch) {
      merchant = storeNameMatch[1] + (storeNameMatch[2] || '');
      merchantConfidence = 90;
    } else {
      // 代替方法で店舗名を検索
      const merchantKeywords = ['セブンイレブン', 'ローソン', 'ファミリーマート', 'スターバックス', 'マクドナルド'];
      for (const keyword of merchantKeywords) {
        if (text.includes(keyword)) {
          merchant = keyword;
          merchantConfidence = 80;
          break;
        }
      }
    }

    // 日付を検索
    let date = '';
    let dateConfidence = 0;
    const dateMatch = text.match(patterns.date);
    if (dateMatch) {
      date = dateMatch[0];
      dateConfidence = 85;
    }

    // 金額を検索（最も大きな数値を金額と仮定）
    let amount = 0;
    let amountConfidence = 0;
    const amountMatches = text.match(/\d{3,}/g);
    if (amountMatches) {
      amount = Math.max(...amountMatches.map(Number));
      amountConfidence = 80;
    }

    // 税率を検索
    let taxRate = 0;
    let taxRateConfidence = 0;
    const taxRateMatch = text.match(patterns.taxRate);
    if (taxRateMatch) {
      taxRate = parseInt(taxRateMatch[1] || taxRateMatch[2]);
      taxRateConfidence = 85;
    }

    return {
      merchant,
      date,
      amount,
      taxRate,
      description: 'OCRで抽出',
      confidence: Math.round((merchantConfidence + dateConfidence + amountConfidence + taxRateConfidence) / 4),
      confidenceScores: {
        merchant: merchantConfidence,
        date: dateConfidence,
        amount: amountConfidence,
        taxRate: taxRateConfidence
      }
    };
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      const file = files[0]

      // FileReaderを使用してファイルを読み込み
      const reader = new FileReader()
      reader.onload = async (e) => {
        const imageData = e.target?.result
        if (imageData) {
          // Blobとして処理
          const blob = new Blob([imageData], { type: file.type })
          // OCR処理を実行
          await processReceiptImage(blob)
        }
      }
      reader.readAsArrayBuffer(file)
    }
  }

  const handleEdit = (receipt: ReceiptData) => {
    setEditingId(receipt.id)
    setEditData(receipt)
  }

  const handleSave = () => {
    if (editingId && editData) {
      setUploadedReceipts(prev => prev.map(receipt =>
        receipt.id === editingId ? { ...receipt, ...editData } : receipt
      ))
      setEditingId(null)
      setEditData({})
    }
  }

  const handleApprove = (id: string) => {
    setUploadedReceipts(prev => prev.map(receipt =>
      receipt.id === id ? { ...receipt, status: 'approved' as const } : receipt
    ))
  }

  const handleReject = (id: string) => {
    setUploadedReceipts(prev => prev.map(receipt =>
      receipt.id === id ? { ...receipt, status: 'rejected' as const } : receipt
    ))
  }

  // サンプルレシートを追加する関数
  const addSampleReceipts = () => {
    setUploadedReceipts(prev => [...sampleReceipts, ...prev]);
  };

  // サンプル画像でOCRテストを行う関数
  const testOCROnSampleImage = async () => {
    try {
      // サンプルレシートを追加（処理中状態）
      const newReceipt: ReceiptData = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        merchant: '処理中...',
        amount: 0,
        category: '未分類',
        description: '解析中...',
        confidence: 0,
        status: 'pending'
      }
      setUploadedReceipts(prev => [newReceipt, ...prev])

      // サンプル画像URLを使用してOCRテストを実行
      // 実際のアプリケーションでは、適切なサンプル画像URLに置き換える必要があります
      const sampleText = `セブンイレブン
2024/01/15
レシート番号: 12345
商品名: コピー用紙 ￥1,200
消費税: ￥120
合計: ￥1,320
      
マクドナルド
2024/01/14
商品名: ビッグマックセット ￥680
消費税: ￥68
合計: ￥748`

      // テキストから情報を抽出
      const extractedData = extractReceiptData(sampleText)

      // レシート情報を更新
      setUploadedReceipts(prev => prev.map(receipt =>
        receipt.id === newReceipt.id
          ? {
            ...receipt,
            merchant: extractedData.merchant || '不明',
            amount: extractedData.amount || 0,
            description: extractedData.description || 'OCR処理完了',
            confidence: extractedData.confidence || 80
          }
          : receipt
      ))
    } catch (error) {
      console.error('OCRテストエラー:', error)
    }
  };

  // レシートスキャナーのスキャン完了ハンドラー
  const handleScanComplete = (scannedData: ParsedReceiptData) => {
    // スキャンされたデータを既存のレシート形式に変換
    const newReceipt: ReceiptData = {
      id: Date.now().toString(),
      date: scannedData.date,
      merchant: scannedData.store_name,
      amount: scannedData.total_amount,
      category: scannedData.category || '未分類',
      description: 'スキャンされたレシート',
      confidence: Math.round((scannedData.confidence.store_name + scannedData.confidence.date +
        scannedData.confidence.total_amount + scannedData.confidence.tax_rate) / 4 * 100),
      status: 'pending',
      taxRate: scannedData.tax_rate,
      // AI分析結果を追加
      aiAnalysis: {
        category: scannedData.category,
        expenseType: scannedData.expenseType,
        confidence: scannedData.aiConfidence,
        insights: scannedData.insights,
        items: scannedData.items
      }
    };

    // 新しいレシートをリストに追加
    setUploadedReceipts(prev => [newReceipt, ...prev]);
  };

  // 個々のレシートに対して再試行する関数
  const retryReceiptProcessing = async (receiptId: string) => {
    // 特定のレシートを再処理するロジックをここに実装
    // 現在はサンプルとして、レシートの状態をリセットする
    setUploadedReceipts(prev => prev.map(receipt =>
      receipt.id === receiptId
        ? {
          ...receipt,
          merchant: '処理中...',
          amount: 0,
          description: '再解析中...',
          confidence: 0
        }
        : receipt
    ));

    // 実際のアプリケーションでは、元の画像データを使用して再処理を行う
    // ここではサンプルとして、3秒後に成功したことにする
    setTimeout(() => {
      setUploadedReceipts(prev => prev.map(receipt =>
        receipt.id === receiptId
          ? {
            ...receipt,
            merchant: 'ファミリーマート',
            amount: 950,
            description: '再解析完了',
            confidence: 88
          }
          : receipt
      ));
    }, 3000);
  };

  // 再試行機能
  const retryProcessing = async () => {
    if (scanState.imageData && scanState.retryCount < 3) {
      setScanState(prev => ({
        ...prev,
        retryCount: prev.retryCount + 1,
        errorMessage: undefined
      }));

      // 画像データをBlobに変換して再処理
      try {
        const response = await fetch(scanState.imageData!);
        const blob = await response.blob();
        await processReceiptImage(blob);
      } catch (error) {
        console.error('再試行エラー:', error);
        setScanState(prev => ({
          ...prev,
          errorMessage: '再試行に失敗しました'
        }));
      }
    }
  };

  // レシートの詳細情報を表示
  const showReceiptDetails = (receipt: ReceiptData) => {
    setSelectedReceipt(receipt);
    setShowDetailModal(true);
  };

  // フィルターされたレシートリスト
  const filteredReceipts = uploadedReceipts.filter(receipt => {
    const matchesSearch = receipt.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || receipt.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || receipt.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // カテゴリ一覧の取得
  const categories = Array.from(new Set(uploadedReceipts.map(r => r.category)));

  // コンポーネントのクリーンアップ
  React.useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* HeaderコンポーネントはApp.tsxでレンダリングされるため、ここでは削除 */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* モバイルアクセス時の注意喚起メッセージ */}
        {/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && location.protocol !== 'https:' && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex">
              <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">モバイル端末からのアクセスについて</h3>
                <p className="text-xs text-yellow-700 mt-1">
                  現在HTTP環境でアクセスしています。カメラ機能を使用するにはHTTPS環境が必要です。
                  テスト目的であれば、PCのlocalhost環境（http://localhost:5173）でアクセスしてください。
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ヘッダー */}
        <div className="p-6 max-w-7xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                レシート処理
              </h1>
              <p className="text-text-muted mt-2">
                アップロードされたレシートをAIが解析し、自動で仕訳データを作成します
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upload Section */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-text-main mb-4 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-primary" />
                  レシートアップロード
                </h2>
                <DocumentUpload onUpload={handleFileUpload} />
              </div>

              {/* Recent Uploads List */}
              <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-text-main mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  最近のアップロード
                </h2>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-background rounded-xl border border-border hover:border-primary/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-text-main">セブンイレブン ジャパン</p>
                          <p className="text-sm text-text-muted">2024年3月{15 - i}日 12:30</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                          処理完了
                        </span>
                        <button className="p-2 text-text-muted hover:text-primary transition-colors">
                          <ArrowRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="space-y-6">
              <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-text-main mb-4">処理ステータス</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-background rounded-xl border border-border">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-text-muted">今月の処理枚数</span>
                      <span className="text-2xl font-bold text-text-main">45枚</span>
                    </div>
                    <div className="w-full bg-surface-highlight rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>

                  <div className="p-4 bg-background rounded-xl border border-border">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-text-muted">AI認識精度</span>
                      <span className="text-2xl font-bold text-text-main">98.5%</span>
                    </div>
                    <div className="w-full bg-surface-highlight rounded-full h-2">
                      <div className="bg-secondary h-2 rounded-full" style={{ width: '98.5%' }}></div>
                    </div>
                  </div>

                  <div className="p-4 bg-background rounded-xl border border-border">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-text-muted">削減時間</span>
                      <span className="text-2xl font-bold text-text-main">12.5時間</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-500">
                      <CheckCircle className="w-4 h-4" />
                      <span>先月比 +2.5時間</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-text-main mb-2">Proプランでさらに便利に</h3>
                <p className="text-sm text-text-muted mb-4">
                  月間処理枚数無制限、優先処理、専任サポートなど、ビジネスを加速させる機能をご利用いただけます。
                </p>
                <button className="w-full py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25">
                  プランを確認する
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* カメラモーダル */}
        {showCamera && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-surface rounded-lg w-full max-w-2xl">
              <div className="p-4 border-b border-border flex justify-between items-center">
                <h3 className="text-lg font-semibold">カメラでレシートを撮影</h3>
                <button
                  onClick={stopCamera}
                  className="text-text-muted hover:text-text-muted"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-4">
                <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain"
                  />
                  {/* 撮影ガイドオーバーレイ */}
                  <div className="absolute inset-0 border-2 border-dashed border-white m-8 pointer-events-none"></div>
                </div>
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={capturePhoto}
                    className="w-16 h-16 rounded-full bg-surface border-4 border-border flex items-center justify-center hover:bg-surface-highlight transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-red-500"></div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 詳細モーダル */}
        {showDetailModal && selectedReceipt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface rounded-lg w-full max-w-md">
              <div className="p-4 border-b border-border flex justify-between items-center">
                <h3 className="text-lg font-semibold">レシート詳細</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-text-muted hover:text-text-muted"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-text-muted">日付</label>
                    <p className="text-text-main">{selectedReceipt.date}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text-muted">店舗名</label>
                    <p className="text-text-main">{selectedReceipt.merchant}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text-muted">金額</label>
                    <p className="text-text-main">¥{selectedReceipt.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text-muted">カテゴリ</label>
                    <p className="text-text-main">{selectedReceipt.category}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text-muted">説明</label>
                    <p className="text-text-main">{selectedReceipt.description}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text-muted">信頼度</label>
                    <div className="flex items-center">
                      <div className="w-16 bg-border rounded-full h-2 mr-2">
                        <div
                          className={`h-2 rounded-full ${selectedReceipt.confidence >= 90 ? 'bg-green-500' :
                            selectedReceipt.confidence >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                          style={{ width: `${selectedReceipt.confidence}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-text-muted">{selectedReceipt.confidence}%</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text-muted">ステータス</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${selectedReceipt.status === 'approved' ? 'bg-green-100 text-green-800' :
                      selectedReceipt.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                      {selectedReceipt.status === 'approved' ? '承認済み' :
                        selectedReceipt.status === 'rejected' ? '却下' : '保留中'}
                    </span>
                  </div>
                  {selectedReceipt.taxRate !== undefined && selectedReceipt.taxRate > 0 && (
                    <div>
                      <label className="text-sm font-medium text-text-muted">税率</label>
                      <p className="text-text-main">{selectedReceipt.taxRate}%</p>
                    </div>
                  )}
                  {selectedReceipt.confidenceScores && (
                    <div>
                      <label className="text-sm font-medium text-text-muted">信頼度詳細</label>
                      <div className="text-xs text-text-muted mt-1">
                        <div>店舗: {selectedReceipt.confidenceScores.merchant || 0}%</div>
                        <div>日付: {selectedReceipt.confidenceScores.date || 0}%</div>
                        <div>金額: {selectedReceipt.confidenceScores.amount || 0}%</div>
                      </div>
                    </div>
                  )}
                  {/* AI分析結果の表示 */}
                  {selectedReceipt.aiAnalysis && (
                    <div className="border-t border-border pt-3">
                      <h4 className="text-sm font-medium text-text-muted mb-2">AI分析結果</h4>
                      {selectedReceipt.aiAnalysis.category && (
                        <div className="mb-2">
                          <label className="text-xs font-medium text-text-muted">推定カテゴリ</label>
                          <p className="text-sm text-text-main">{selectedReceipt.aiAnalysis.category}</p>
                        </div>
                      )}
                      {selectedReceipt.aiAnalysis.expenseType && (
                        <div className="mb-2">
                          <label className="text-xs font-medium text-text-muted">支出種別</label>
                          <p className="text-sm text-text-main">{selectedReceipt.aiAnalysis.expenseType}</p>
                        </div>
                      )}
                      {selectedReceipt.aiAnalysis.confidence !== undefined && (
                        <div className="mb-2">
                          <label className="text-xs font-medium text-text-muted">AI信頼度</label>
                          <div className="flex items-center">
                            <div className="w-16 bg-border rounded-full h-1.5 mr-2">
                              <div
                                className={`h-1.5 rounded-full ${selectedReceipt.aiAnalysis.confidence >= 0.9 ? 'bg-green-500' :
                                  selectedReceipt.aiAnalysis.confidence >= 0.7 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                style={{ width: `${selectedReceipt.aiAnalysis.confidence * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-text-muted">
                              {Math.round(selectedReceipt.aiAnalysis.confidence * 100)}%
                            </span>
                          </div>
                        </div>
                      )}
                      {selectedReceipt.aiAnalysis.insights && selectedReceipt.aiAnalysis.insights.length > 0 && (
                        <div className="mb-2">
                          <label className="text-xs font-medium text-text-muted">分析インサイト</label>
                          <ul className="list-disc pl-4 space-y-1 mt-1">
                            {selectedReceipt.aiAnalysis.insights.map((insight, index) => (
                              <li key={index} className="text-xs text-text-muted">
                                {insight}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {selectedReceipt.aiAnalysis.items && selectedReceipt.aiAnalysis.items.length > 0 && (
                        <div>
                          <label className="text-xs font-medium text-text-muted">商品アイテム</label>
                          <div className="mt-1 space-y-1">
                            {selectedReceipt.aiAnalysis.items.map((item, index) => (
                              <div key={index} className="flex justify-between text-xs">
                                <span className="text-text-muted">{item.name}</span>
                                <span className="text-text-main">¥{item.price.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="p-4 border-t border-border flex justify-end space-x-2">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 bg-border text-text-main rounded-md hover:bg-gray-300 transition-colors"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        )}

        {/* キャンバス（非表示） */}
        <canvas ref={canvasRef} className="hidden" />

        {/* アップロードエリア */}
        <div className="bg-surface rounded-xl shadow-sm border border-border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">レシートをアップロード</h2>

          {/* レシートスキャナー */}
          <div className="mb-6">
            <ReceiptScanner
              onScanComplete={handleScanComplete}
              onProcessingStateChange={(state) => {
                setScanState(prev => ({
                  ...prev,
                  isProcessing: state.isProcessing,
                  progress: state.progress,
                  currentStep: state.currentStep
                }));
              }}
            />
          </div>

          {/* 処理状態の表示 */}
          {scanState.isProcessing && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center mb-2">
                <RefreshCw className="w-5 h-5 text-blue-500 animate-spin mr-2" />
                <span className="text-blue-700 font-medium">レシートを処理中です...</span>
              </div>
              {scanState.currentStep && (
                <div className="text-sm text-primary mb-2">
                  処理ステップ: {scanState.currentStep}
                </div>
              )}
              {scanState.progress !== undefined && (
                <div className="w-full bg-border rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${scanState.progress}%` }}
                  ></div>
                </div>
              )}
            </div>
          )}

          {/* エラーメッセージの表示 */}
          {scanState.errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700">{scanState.errorMessage}</span>
              {scanState.retryCount < 3 && (
                <button
                  onClick={retryProcessing}
                  className="ml-4 px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm"
                >
                  再試行
                </button>
              )}
            </div>
          )}

          {/* サンプルレシート追加ボタン（開発用） */}
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              onClick={addSampleReceipts}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm w-full sm:w-auto"
            >
              サンプルレシートを追加（テスト用）
            </button>
            <button
              onClick={testOCROnSampleImage}
              className="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-sm w-full sm:w-auto"
            >
              OCRテストを実行（サンプル画像）
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* ファイルアップロード */}
            <label className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
              <Upload className="w-8 h-8 text-text-muted mx-auto mb-2" />
              <p className="text-sm font-medium text-text-muted">ファイルを選択</p>
              <p className="text-xs text-text-muted">PNG, JPG, PDF対応</p>
            </label>

            {/* カメラ撮影 */}
            <div
              className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors"
              onClick={startCamera}
            >
              <Camera className="w-8 h-8 text-text-muted mx-auto mb-2" />
              <p className="text-sm font-medium text-text-muted">カメラで撮影</p>
              <p className="text-xs text-text-muted">その場で撮影</p>
            </div>

            {/* ドラッグ&ドロップ */}
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <FileImage className="w-8 h-8 text-text-muted mx-auto mb-2" />
              <p className="text-sm font-medium text-text-muted">ドラッグ&ドロップ</p>
              <p className="text-xs text-text-muted">ここに画像をドロップ</p>
            </div>
          </div>
        </div>

        {/* フィルターと検索 */}
        <div className="bg-surface rounded-xl shadow-sm border border-border p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" />
                <input
                  type="text"
                  placeholder="店舗名や説明で検索..."
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                className="px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary w-full sm:w-auto"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">すべてのステータス</option>
                <option value="pending">保留中</option>
                <option value="approved">承認済み</option>
                <option value="rejected">却下</option>
              </select>
              <select
                className="px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary w-full sm:w-auto"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">すべてのカテゴリ</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 処理済みレシート一覧 */}
        <div className="bg-surface rounded-xl shadow-sm border border-border">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold">処理済みレシート</h2>
          </div>

          {/* モバイル用カード表示 */}
          <div className="md:hidden p-4 space-y-4">
            {filteredReceipts.map((receipt) => (
              <div key={receipt.id} className="border border-border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-text-main">{receipt.merchant}</h3>
                    <p className="text-sm text-text-muted">{receipt.date}</p>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${receipt.status === 'approved' ? 'bg-green-100 text-green-800' :
                    receipt.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                    {receipt.status === 'approved' ? '承認' :
                      receipt.status === 'rejected' ? '却下' : '保留'}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <p className="text-lg font-semibold text-text-main">¥{receipt.amount.toLocaleString()}</p>
                  <div className="flex items-center">
                    <div className="w-16 bg-border rounded-full h-1.5 mr-2">
                      <div
                        className={`h-1.5 rounded-full ${receipt.confidence >= 90 ? 'bg-green-500' :
                          receipt.confidence >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                        style={{ width: `${receipt.confidence}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-text-muted">{receipt.confidence}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-muted">{receipt.category}</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => showReceiptDetails(receipt)}
                      className="text-primary hover:text-blue-900"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {receipt.merchant === '解析エラー' && (
                      <button
                        onClick={() => retryReceiptProcessing(receipt.id)}
                        className="text-orange-600 hover:text-orange-900"
                        title="再試行"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                    {receipt.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(receipt.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleReject(receipt.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* デスクトップ用テーブル表示 */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">日付</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">店舗名</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">金額</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">カテゴリ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">説明</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">信頼度</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">ステータス</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-surface divide-y divide-gray-200">
                {filteredReceipts.map((receipt) => (
                  <tr key={receipt.id} className="hover:bg-background">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-main">
                      {editingId === receipt.id ? (
                        <input
                          type="date"
                          value={editData.date || receipt.date}
                          onChange={(e) => setEditData(prev => ({ ...prev, date: e.target.value }))}
                          className="w-full px-2 py-1 border border-border rounded text-sm"
                        />
                      ) : (
                        receipt.date
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-main">
                      {editingId === receipt.id ? (
                        <input
                          type="text"
                          value={editData.merchant || receipt.merchant}
                          onChange={(e) => setEditData(prev => ({ ...prev, merchant: e.target.value }))}
                          className="w-full px-2 py-1 border border-border rounded text-sm"
                        />
                      ) : (
                        receipt.merchant
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-main">
                      {editingId === receipt.id ? (
                        <input
                          type="number"
                          value={editData.amount || receipt.amount}
                          onChange={(e) => setEditData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                          className="w-full px-2 py-1 border border-border rounded text-sm"
                        />
                      ) : (
                        `¥${receipt.amount.toLocaleString()}`
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-main">
                      {editingId === receipt.id ? (
                        <select
                          value={editData.category || receipt.category}
                          onChange={(e) => setEditData(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full px-2 py-1 border border-border rounded text-sm"
                        >
                          <option value="消耗品費">消耗品費</option>
                          <option value="接待交際費">接待交際費</option>
                          <option value="旅費交通費">旅費交通費</option>
                          <option value="通信費">通信費</option>
                          <option value="水道光熱費">水道光熱費</option>
                        </select>
                      ) : (
                        receipt.category
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-main max-w-xs truncate">
                      {editingId === receipt.id ? (
                        <input
                          type="text"
                          value={editData.description || receipt.description}
                          onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full px-2 py-1 border border-border rounded text-sm"
                        />
                      ) : (
                        <div>
                          <div>{receipt.description}</div>
                          {receipt.taxRate !== undefined && receipt.taxRate > 0 && (
                            <div className="text-xs text-text-muted mt-1">
                              税率: {receipt.taxRate}%
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center">
                        <div className="w-16 bg-border rounded-full h-2 mr-2">
                          <div
                            className={`h-2 rounded-full ${receipt.confidence >= 90 ? 'bg-green-500' :
                              receipt.confidence >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                            style={{ width: `${receipt.confidence}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-text-muted">{receipt.confidence}%</span>
                      </div>
                      {/* 各項目の信頼度スコアを表示 */}
                      {receipt.confidenceScores && (
                        <div className="text-xs text-text-muted mt-1">
                          <div>店舗: {receipt.confidenceScores.merchant || 0}%</div>
                          <div>日付: {receipt.confidenceScores.date || 0}%</div>
                          <div>金額: {receipt.confidenceScores.amount || 0}%</div>
                        </div>
                      )}
                      {/* AI分析の信頼度を表示 */}
                      {receipt.aiAnalysis && receipt.aiAnalysis.confidence !== undefined && (
                        <div className="text-xs text-text-muted mt-1">
                          <div>AI信頼度: {Math.round(receipt.aiAnalysis.confidence * 100)}%</div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${receipt.status === 'approved' ? 'bg-green-100 text-green-800' :
                        receipt.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                        {receipt.status === 'approved' ? '承認済み' :
                          receipt.status === 'rejected' ? '却下' : '保留中'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {editingId === receipt.id ? (
                          <button
                            onClick={handleSave}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => showReceiptDetails(receipt)}
                              className="text-primary hover:text-blue-900"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {/* 再試行ボタン（OCR処理に失敗した場合に表示） */}
                            {receipt.merchant === '解析エラー' && (
                              <button
                                onClick={() => retryReceiptProcessing(receipt.id)}
                                className="text-orange-600 hover:text-orange-900"
                                title="再試行"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            )}
                            {receipt.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApprove(receipt.id)}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleReject(receipt.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ReceiptProcessing