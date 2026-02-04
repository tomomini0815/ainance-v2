import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom';
import { Upload, FileText, ArrowLeft, Camera, RefreshCw, FileImage, Search, Save, AlertTriangle, CheckCircle, Trash2, Sparkles, Edit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import ReceiptCamera from '../components/ReceiptCamera';
import ReceiptResultModal from '../components/ReceiptResultModal';
import { getReceipts, updateReceiptStatus, approveReceiptAndCreateTransaction } from '../services/receiptService'
import { useAuth } from '../components/AuthProvider'
import { useBusinessTypeContext } from '../context/BusinessTypeContext'
import { useTransactions } from '../hooks/useTransactions'
import TransactionIcon from '../components/TransactionIcon';

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

// 抽出されたレシート結果
interface ExtractedReceiptData {
  merchant: string;
  date: string;
  amount: number;
  category: string;
  taxRate: number;
  confidence: number;
  validationErrors?: string[];
}

const ReceiptProcessing: React.FC = () => {
  const { user } = useAuth(); // 認証されたユーザーを取得
  const { currentBusinessType } = useBusinessTypeContext(); // 事業タイプを取得
  useTransactions(user?.id, currentBusinessType?.business_type as 'individual' | 'corporation'); // トランザクション追加用フック

  const [uploadedReceipts, setUploadedReceipts] = useState<ReceiptData[]>([])

  // スキャン状態の管理
  const [scanState, setScanState] = useState<ScanState>({
    isProcessing: false,
    retryCount: 0
  })

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<ReceiptData>>({})

  const [showCamera, setShowCamera] = useState(false)

  // 結果モーダル用の状態
  const [showResultModal, setShowResultModal] = useState(false)
  const [extractedData, setExtractedData] = useState<ExtractedReceiptData | null>(null)

  // フィルターと検索の状態
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')


  // Supabaseからレシートデータをロード
  const loadReceipts = async () => {
    if (!user?.id) return;

    const receipts = await getReceipts(user.id);
    const formattedReceipts: ReceiptData[] = receipts.map(r => ({
      id: r.id!,
      date: r.date,
      merchant: r.merchant,
      amount: r.amount,
      category: r.category,
      description: r.description,
      confidence: r.confidence,
      status: r.status,
      taxRate: r.tax_rate,
      confidenceScores: r.confidence_scores
    }));
    // 承認済み・却下済みのレシートは除外（ToDoリストとして機能させるため）
    const activeReceipts = formattedReceipts.filter(r => r.status !== 'approved' && r.status !== 'rejected');
    setUploadedReceipts(activeReceipts);
  };

  useEffect(() => {
    loadReceipts();
  }, [user]);

  // カメラ開始処理
  const startCamera = () => {
    setShowCamera(true);
  }

  // カメラ停止処理
  const stopCamera = () => {
    setShowCamera(false)
  }

  // Gemini Visionを使用したレシート画像処理
  const processReceiptImageWithGemini = async (imageUrl: string) => {
    // 処理状態を更新
    setScanState(prev => ({
      ...prev,
      isProcessing: true,
      retryCount: 0,
      progress: 10,
      currentStep: 'AI分析を開始しています...',
    }));

    try {
      // 動的インポート
      const { analyzeReceiptWithVision, GEMINI_API_KEY_LOADED } = await import('../services/geminiAIService');

      if (!GEMINI_API_KEY_LOADED) {
        throw new Error('Gemini APIキーが設定されていません。.envファイルを確認してください。');
      }

      setScanState(prev => ({
        ...prev,
        progress: 30,
        currentStep: '画像を解析中...'
      }));

      // 画像データを取得 (URL -> Base64)
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const reader = new FileReader();

      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          if (typeof reader.result === 'string') resolve(reader.result);
          else reject(new Error('画像の読み込みに失敗しました'));
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(blob);
      const base64Data = await base64Promise;

      setScanState(prev => ({
        ...prev,
        progress: 50,
        currentStep: 'AIがデータを抽出・検証中...'
      }));

      // Gemini Vision API呼び出し
      const aiResult = await analyzeReceiptWithVision(base64Data);

      if (!aiResult) {
        throw new Error('AIによる解析ができませんでした');
      }

      console.log('AI解析結果:', aiResult);

      setScanState(prev => ({
        ...prev,
        progress: 90,
        currentStep: 'データを整形中...'
      }));

      // 抽出したデータを設定
      setExtractedData({
        merchant: aiResult.store_info.name || '不明',
        date: aiResult.summary.transaction_date || '', // 日付がない場合は空文字
        amount: aiResult.summary.total_amount || 0,
        category: typeof aiResult.category === 'string' ? aiResult.category : (aiResult.category.primary || '雑費'),
        taxRate: aiResult.tax_info.tax_amount_10 ? 10 : 8, // 簡易判定
        confidence: aiResult.summary.confidence || 0,
        validationErrors: aiResult.validation_errors, // 検証エラーをUIに渡す
      });

      // 処理完了
      setScanState(prev => ({
        ...prev,
        isProcessing: false,
        retryCount: 0,
        progress: 100,
        currentStep: '完了'
      }));

      // 結果モーダルを表示
      setShowResultModal(true);
      toast.success('レシートの読み取りが完了しました');

    } catch (error: any) {
      console.error('AI処理エラー:', error);
      setScanState(prev => ({
        ...prev,
        isProcessing: false,
        retryCount: 0,
        errorMessage: `AI処理に失敗しました: ${error.message} `
      }));
      toast.error('AI読み取りに失敗しました。');
    }
  };

  // レシート画像処理（エントリポイント）
  const processReceiptImage = async (imageBlob: Blob) => {
    setShowCamera(false);

    const imageUrl = URL.createObjectURL(imageBlob);
    setScanState(prev => ({
      ...prev,
      imageData: imageUrl
    }));

    // Geminiを使用
    await processReceiptImageWithGemini(imageUrl);
  };



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
    setEditingId(receipt.id);
    setEditData({
      date: receipt.date,
      merchant: receipt.merchant,
      amount: receipt.amount,
      category: receipt.category,
      description: receipt.description
    });
  };

  const handleSave = () => {
    if (editingId && editData) {
      setUploadedReceipts(prev => prev.map(receipt =>
        receipt.id === editingId ? { ...receipt, ...editData } : receipt
      ))
      setEditingId(null)
      setEditData({})
    }
  }

  const handleApprove = async (id: string) => {
    // レシート情報を取得
    const receipt = uploadedReceipts.find(r => r.id === id);
    if (!receipt || !user?.id) {
      console.error('レシートまたはユーザーが見つかりません');
      return;
    }

    // UIを先に更新（楽観的削除）
    setUploadedReceipts(prev => prev.filter(r => r.id !== id));

    try {
      const businessType = currentBusinessType?.business_type || 'individual';

      // サービス関数を使用して承認とトランザクション作成（同期処理を含む）
      const result = await approveReceiptAndCreateTransaction(
        id,
        {
          ...receipt,
          user_id: user.id,
          // 必要なフィールドをマッピング
          confidence_scores: receipt.confidenceScores,
          tax_rate: receipt.taxRate
        } as any,
        businessType,
        user.id
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success('レシートが登録され、取引履歴に反映されました');

      // イベント発行して他のコンポーネント（Inboxなど）を更新
      window.dispatchEvent(new CustomEvent('transactionApproved'));
      window.dispatchEvent(new CustomEvent('transactionRecorded'));

    } catch (error) {
      console.error('レシート登録エラー:', error);
      toast.error('登録に失敗しました');
      // エラー時はリストに戻す（楽観的削除のロールバック）
      setUploadedReceipts(prev => [...prev, receipt]);
    }
  }

  const handleReject = async (id: string) => {
    // UIから削除（楽観的更新）
    setUploadedReceipts(prev => prev.filter(r => r.id !== id));

    // Supabaseにも保存（ステータス更新または削除）
    // updateReceiptStatus(id, 'rejected'); 
    // 完全に削除する場合は deleteReceipt(id) などを呼ぶべきだが、
    // ここではステータスをrejectedにしてリストから消す（裏では残る）か、
    // 要件通り「リストから消える」を実現するために、ユーザー視点では削除と同様に振る舞う。
    await updateReceiptStatus(id, 'rejected');
    toast.success('レシートを削除しました');
  }

  // 再試行機能
  const retryProcessing = async () => {
    if (scanState.imageData && scanState.retryCount < 3) {
      setScanState(prev => ({
        ...prev,
        retryCount: prev.retryCount + 1,
        errorMessage: undefined
      }));

      // 画像URLを使用して再処理
      try {
        await processReceiptImageWithGemini(scanState.imageData);
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



  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">


        <div className="flex items-center mb-6">
          <Link to="/dashboard" className="mr-4">
            <ArrowLeft className="w-6 h-6 text-text-muted hover:text-text-main" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-text-main">レシート処理</h1>
            <p className="text-text-muted">レシートのアップロードで簡単に取引を記録できます</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto space-y-6 mb-5">
          {/* Upload Area and Recent Uploads Placeholder */}
          {/* アップロードエリア */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-surface rounded-xl shadow-sm border border-border p-3 sm:p-4"
          >
            <div className="flex items-center gap-2 mb-3 px-1">
              <Upload className="w-4 h-4 text-primary" />
              <h2 className="text-base font-semibold text-text-main">レシートをアップロード</h2>
            </div>

            {/* 処理状態の表示 */}
            {scanState.isProcessing && (
              <div className="mb-5 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <RefreshCw className="w-5 h-5 text-blue-500 animate-spin mr-2" />
                  <span className="text-blue-700 font-medium">レシートを処理中です...</span>
                </div>
                {scanState.currentStep && (
                  <div className="text-sm text-blue-600 mb-2">
                    {scanState.currentStep}
                  </div>
                )}
                {scanState.progress !== undefined && (
                  <div className="w-full bg-blue-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${scanState.progress}% ` }}
                    ></div>
                  </div>
                )}
              </div>
            )}

            {/* エラーメッセージの表示 */}
            {scanState.errorMessage && (
              <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
                  <span className="text-red-700 text-sm">{scanState.errorMessage}</span>
                </div>
                {scanState.retryCount < 3 && (
                  <button
                    onClick={retryProcessing}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                  >
                    再試行
                  </button>
                )}
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              {/* カメラ撮影 */}
              <div
                className="group border-[1.5px] border-primary border-dashed rounded-lg p-2.5 sm:p-4 text-center cursor-pointer bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
                onClick={startCamera}
              >
                <Camera className="w-6 h-6 text-text-muted group-hover:text-primary mx-auto mb-1.5 transition-colors" />
                <p className="text-[10px] sm:text-sm font-semibold text-text-main mb-0.5">カメラで撮影</p>
                <p className="hidden sm:block text-[10px] text-text-muted">その場で撮影</p>
                <p className="sm:hidden text-[9px] text-text-muted">撮影可能</p>
              </div>

              {/* ファイルアップロード */}
              <label className="group border-[1.5px] border-primary border-dashed rounded-lg p-2.5 sm:p-4 text-center cursor-pointer bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Upload className="w-6 h-6 text-text-muted group-hover:text-primary mx-auto mb-1.5 transition-colors" />
                <p className="text-[10px] sm:text-sm font-semibold text-text-main mb-0.5">ファイルを選択</p>
                <p className="hidden sm:block text-[10px] text-text-muted">PNG, JPG, PDF対応</p>
                <p className="sm:hidden text-[9px] text-text-muted">画像・PDF</p>
              </label>

              {/* ドラッグ&ドロップ */}
              <div className="group border-[1.5px] border-primary border-dashed rounded-lg p-2.5 sm:p-4 text-center bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200">
                <FileImage className="w-6 h-6 text-text-muted group-hover:text-primary mx-auto mb-1.5 transition-colors" />
                <p className="text-[10px] sm:text-sm font-semibold text-text-main mb-0.5">ドロップ</p>
                <p className="hidden sm:block text-[10px] text-text-muted">ここに画像をドロップ</p>
                <p className="sm:hidden text-[9px] text-text-muted">ドラッグ</p>
              </div>
            </div>
          </motion.div>

          {/* 最近のアップロードセクションは削除されました */}
        </div>

        {/* Other Components Placeholder */}
        <div className="space-y-4">
          {/* 高性能レシートカメラ */}
          {showCamera && (
            <ReceiptCamera
              onCapture={processReceiptImage}
              onClose={stopCamera}
            />
          )}

          {/* フィルターと検索 */}
          <div className="bg-surface rounded-xl shadow-sm border border-border p-2.5 sm:p-3 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" />
                  <input
                    type="text"
                    placeholder="店舗名や説明で検索..."
                    className="w-full pl-8 pr-3 py-1.5 border border-border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary bg-background text-xs transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  className="px-3 py-1.5 border border-border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary bg-background font-medium text-[11px] transition-all w-full sm:w-auto"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">ステータス</option>
                  <option value="pending">保留中</option>
                  <option value="approved">承認済み</option>
                  <option value="rejected">却下</option>
                </select>
                <select
                  className="px-3 py-1.5 border border-border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary bg-background font-medium text-[11px] transition-all w-full sm:w-auto"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">カテゴリ</option>
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
              <h2 className="text-lg font-semibold text-text-main">処理済みレシート</h2>
              <p className="text-sm text-text-muted mt-1">
                内容を確認し、表の「登録」ボタンをクリックして記帳を確定してください。
              </p>
            </div>

            {/* モバイル用カード表示 */}
            <div className="md:hidden space-y-3 p-3">
              {filteredReceipts.length === 0 ? (
                <div className="p-8 text-center text-text-muted border border-dashed border-border rounded-lg">
                  <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>処理済みのレシートはありません</p>
                  <p className="text-sm mt-1">新しいレシートをアップロードしてください</p>
                </div>
              ) : (
                filteredReceipts.map((receipt) => (
                  <div key={receipt.id} className="bg-surface p-3 rounded-lg shadow-sm border border-border">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-start flex-1 min-w-0">
                        <div className="mr-3 mt-1">
                          <TransactionIcon item={receipt.merchant} category={receipt.category} size="sm" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-text-main text-base mb-1">
                            {editingId === receipt.id ? (
                              <input
                                type="text"
                                value={editData.merchant || receipt.merchant}
                                onChange={(e) => setEditData(prev => ({ ...prev, merchant: e.target.value }))}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full px-2 py-1 border border-border rounded text-sm bg-background text-text-main"
                                placeholder="店舗名"
                                autoFocus
                              />
                            ) : (
                              <div className="cursor-pointer" onClick={() => handleEdit(receipt)}>{receipt.merchant}</div>
                            )}
                          </div>
                          <div className="text-sm text-text-muted">
                            {editingId === receipt.id ? (
                              <input
                                type="date"
                                value={editData.date || receipt.date}
                                onChange={(e) => setEditData(prev => ({ ...prev, date: e.target.value }))}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full px-2 py-1 border border-border rounded text-sm bg-background text-text-main"
                              />
                            ) : (
                              <span className="cursor-pointer" onClick={() => handleEdit(receipt)}>{receipt.date}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right ml-2 shrink-0">
                        {editingId === receipt.id ? (
                          <input
                            type="number"
                            value={editData.amount || receipt.amount}
                            onChange={(e) => setEditData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                            onClick={(e) => e.stopPropagation()}
                            className="w-24 px-2 py-1 border border-border rounded text-sm text-right bg-background text-text-main"
                          />
                        ) : (
                          <div className="font-medium text-lg text-text-main cursor-pointer" onClick={() => handleEdit(receipt)}>
                            ¥{receipt.amount.toLocaleString()}
                          </div>
                        )}
                        <div className="flex justify-end gap-1 mt-1">
                          {receipt.confidence >= 90 ? (
                            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                          ) : receipt.confidence >= 70 ? (
                            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                      <div onClick={() => editingId !== receipt.id && handleEdit(receipt)} className="flex-1">
                        {editingId === receipt.id ? (
                          <select
                            value={editData.category || receipt.category}
                            onChange={(e) => setEditData(prev => ({ ...prev, category: e.target.value }))}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-[140px] px-2 py-1 border border-border rounded text-sm bg-background text-text-main"
                          >
                            {categories.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                            <option value="消耗品費">消耗品費</option>
                            <option value="接待交際費">接待交際費</option>
                            <option value="旅費交通費">旅費交通費</option>
                            <option value="通信費">通信費</option>
                            <option value="水道光熱費">水道光熱費</option>
                          </select>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-highlight text-text-main border border-border cursor-pointer">
                            {receipt.category}
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2.5">
                        {editingId === receipt.id ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSave();
                            }}
                            className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-md active:scale-95"
                            title="保存"
                          >
                            <Save className="w-5 h-5" />
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApprove(receipt.id);
                              }}
                              className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-md active:scale-95"
                              title="承認"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(receipt);
                              }}
                              className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-md active:scale-95"
                              title="編集"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReject(receipt.id);
                              }}
                              className="w-10 h-10 rounded-full flex items-center justify-center bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-md active:scale-95"
                              title="削除"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* デスクトップ用テーブル表示 */}
            <div className="hidden md:block bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-surface-highlight">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider whitespace-nowrap">日付</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider whitespace-nowrap">店舗名</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider whitespace-nowrap">金額</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider whitespace-nowrap">カテゴリ</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider whitespace-nowrap">信頼度</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider whitespace-nowrap">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredReceipts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-text-muted">
                          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                          <p>処理済みのレシートはありません</p>
                          <p className="text-sm mt-1">新しいレシートをアップロードしてください</p>
                        </td>
                      </tr>
                    ) : (
                      filteredReceipts.map((receipt) => (
                        <tr key={receipt.id} className="hover:bg-surface-highlight transition-colors">
                          <td className="px-4 py-3 text-sm text-text-main" onClick={() => editingId !== receipt.id && handleEdit(receipt)}>
                            {editingId === receipt.id ? (
                              <input
                                type="date"
                                value={editData.date || receipt.date}
                                onChange={(e) => setEditData(prev => ({ ...prev, date: e.target.value }))}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full px-2 py-1 bg-background border border-border rounded text-sm text-text-main"
                              />
                            ) : (
                              <span className="cursor-pointer">{receipt.date}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-text-main" onClick={() => editingId !== receipt.id && handleEdit(receipt)}>
                            <div className="flex items-center gap-2">
                              <TransactionIcon item={receipt.merchant} category={receipt.category} size="sm" />
                              {editingId === receipt.id ? (
                                <input
                                  type="text"
                                  value={editData.merchant || receipt.merchant}
                                  onChange={(e) => setEditData(prev => ({ ...prev, merchant: e.target.value }))}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-full px-2 py-1 bg-background border border-border rounded text-sm text-text-main"
                                />
                              ) : (
                                <div className="flex flex-col">
                                  <span className="cursor-pointer">{receipt.merchant}</span>
                                  <span className="text-[10px] text-text-muted mt-0.5">{receipt.category}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-text-main" onClick={() => editingId !== receipt.id && handleEdit(receipt)}>
                            {editingId === receipt.id ? (
                              <input
                                type="number"
                                value={editData.amount || receipt.amount}
                                onChange={(e) => setEditData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full px-2 py-1 bg-background border border-border rounded text-sm text-text-main"
                              />
                            ) : (
                              <span className="cursor-pointer font-medium text-text-main">¥{receipt.amount.toLocaleString()}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-text-main" onClick={() => editingId !== receipt.id && handleEdit(receipt)}>
                            {editingId === receipt.id ? (
                              <select
                                value={editData.category || receipt.category}
                                onChange={(e) => setEditData(prev => ({ ...prev, category: e.target.value }))}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full px-2 py-1 bg-background border border-border rounded text-sm text-text-main"
                              >
                                {categories.map(cat => (
                                  <option key={cat} value={cat}>{cat}</option>
                                ))}
                                <option value="消耗品費">消耗品費</option>
                                <option value="接待交際費">接待交際費</option>
                                <option value="旅費交通費">旅費交通費</option>
                                <option value="通信費">通信費</option>
                                <option value="水道光熱費">水道光熱費</option>
                              </select>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-highlight text-text-main border border-border whitespace-nowrap cursor-pointer">
                                {receipt.category}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex items-center">
                              <div className="w-16 bg-border rounded-full h-1.5 mr-2">
                                <div
                                  className={`h-1.5 rounded-full ${receipt.confidence >= 90 ? 'bg-green-500' :
                                    receipt.confidence >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                  style={{ width: `${receipt.confidence}%` }}
                                ></div>
                              </div>
                              <span className="text-[10px] text-text-muted">{receipt.confidence}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium">
                            <div className="flex items-center gap-2">
                              {editingId === receipt.id ? (
                                <button
                                  onClick={handleSave}
                                  className="p-2 bg-green-500/10 text-green-600 rounded-lg hover:bg-green-500 hover:text-white transition-all shadow-sm flex items-center gap-1 text-xs whitespace-nowrap"
                                  title="保存"
                                >
                                  <Save className="w-4 h-4" />
                                  保存
                                </button>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleApprove(receipt.id)}
                                    className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition-all shadow-sm flex items-center gap-1 text-xs whitespace-nowrap"
                                    title="登録"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                    登録
                                  </button>
                                  <button
                                    onClick={() => handleReject(receipt.id)}
                                    className="p-2 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all shadow-sm flex items-center gap-1 text-xs whitespace-nowrap"
                                    title="削除"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    削除
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 結果モーダル */}
            <AnimatePresence>
              {
                showResultModal && extractedData && (
                  <ReceiptResultModal
                    receiptData={extractedData as any}
                    onClose={() => {
                      setShowResultModal(false);
                      setExtractedData(null);
                    }}
                    onRetake={() => {
                      setShowResultModal(false);
                      setExtractedData(null);
                      setShowCamera(true);
                    }}
                    onSave={() => {
                      loadReceipts();
                    }}
                  />
                )
              }
            </AnimatePresence>
          </div>
        </div>
      </main >
    </div >
  )
}

export default ReceiptProcessing
