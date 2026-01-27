import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom';
import { Upload, FileText, ArrowLeft, Camera, X, RefreshCw, FileImage, Search, Eye, Check, Save, AlertTriangle, Edit2, CheckCircle, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import ReceiptCamera from '../components/ReceiptCamera';
import ReceiptResultModal from '../components/ReceiptResultModal';
import { getReceipts, updateReceiptStatus } from '../services/receiptService'
import { useAuth } from '../components/AuthProvider'
import { useBusinessTypeContext } from '../context/BusinessTypeContext'
import { useTransactions } from '../hooks/useTransactions'

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
}

const ReceiptProcessing: React.FC = () => {
  const { user } = useAuth(); // 認証されたユーザーを取得
  const { currentBusinessType } = useBusinessTypeContext(); // 事業タイプを取得
  const { createTransaction } = useTransactions(user?.id, currentBusinessType?.business_type as 'individual' | 'corporation'); // トランザクション追加用フック

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

  // 詳細表示用の状態
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  // Supabaseからレシートデータをロード
  useEffect(() => {
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
      setUploadedReceipts(formattedReceipts);
    };

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

  // レシート画像処理（OCR実装の強化版）
  const processReceiptImage = async (imageBlob: Blob) => {
    setShowCamera(false); // Close camera

    // 画像URLを作成して保存（再試行用）
    const imageUrl = URL.createObjectURL(imageBlob);
    setScanState(prev => ({
      ...prev,
      imageData: imageUrl
    }));

    // Tesseract.jsを使用して処理
    await processReceiptImageWithTesseract(imageUrl);
  };

  // Tesseract.jsを使用したレシート画像処理
  const processReceiptImageWithTesseract = async (imageUrl: string) => {
    // 処理状態を更新
    setScanState(prev => ({
      ...prev,
      isProcessing: true,
      retryCount: 0,
      progress: 0,
      currentStep: 'OCR処理を開始しています...',
      // imageDataはprocessReceiptImageで設定済み
    }));

    try {
      // 動的インポートでTesseract.jsを読み込み
      const Tesseract = await import('tesseract.js');

      setScanState(prev => ({
        ...prev,
        progress: 10,
        currentStep: 'OCRエンジンを初期化中...'
      }));

      // タイムアウト設定（45秒）
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('OCR処理がタイムアウトしました。画像の解像度が高いか、ネットワークが不安定です。')), 45000);
      });

      // OCR処理を実行（日本語+英語）
      const recognizePromise = Tesseract.recognize(
        imageUrl,
        'jpn+eng',
        {
          logger: (m: any) => {
            if (m.status === 'recognizing text') {
              const progress = Math.round(m.progress * 80) + 10; // 10-90%
              setScanState(prev => ({
                ...prev,
                progress,
                currentStep: `テキストを認識中... ${Math.round(m.progress * 100)}%`
              }));
            }
          }
        }
      );

      const result: any = await Promise.race([recognizePromise, timeoutPromise]);

      // 注: imageUrlは再試行のために保持するため、ここではrevokeしない
      // クリーンアップはコンポーネントのアンマウント時や新しい画像がロードされた時に行うべき

      console.log('OCR結果:', result.data.text);

      setScanState(prev => ({
        ...prev,
        progress: 90,
        currentStep: 'データを抽出中...'
      }));

      // テキストから情報を抽出
      const extractedReceiptData = extractReceiptData(result.data.text);

      // 抽出したデータを設定
      setExtractedData({
        merchant: extractedReceiptData.merchant || '不明',
        date: extractedReceiptData.date || new Date().toISOString().split('T')[0],
        amount: extractedReceiptData.amount || 0,
        category: extractedReceiptData.category || '雑費',
        taxRate: extractedReceiptData.taxRate || 0,
        confidence: extractedReceiptData.confidence || 70,
      });

      // 処理完了
      setScanState(prev => ({
        ...prev, // 既存の状態（imageData含む）を維持
        isProcessing: false,
        retryCount: 0,
        progress: 100,
        currentStep: '完了'
      }));

      // 結果モーダルを表示
      setShowResultModal(true);
      toast.success('レシートの読み取りが完了しました');

    } catch (error: any) {
      console.error('OCR処理エラー:', error);

      setScanState(prev => ({
        ...prev,
        isProcessing: false,
        retryCount: 0,
        errorMessage: `OCR処理に失敗しました: ${error.message}`
      }));

      toast.error('レシートの読み取りに失敗しました。もう一度お試しください。');
    }
  };

  // テキストからレシート情報を抽出する関数（日本語対応強化版）
  const extractReceiptData = (text: string) => {
    console.log('抽出対象テキスト:', text);

    // 全角数字を半角に変換するヘルパー関数
    const normalizeText = (str: string) => {
      return str.replace(/[０-９]/g, (s) => {
        return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
      }).replace(/[Ａ-Ｚａ-ｚ]/g, (s) => {
        return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
      });
    };

    const normalizedText = normalizeText(text);

    // 正規表現パターン（日本語レシート対応強化）
    const patterns = {
      // 金額パターン
      totalAmount: [
        /(?:合計|総計|お買上計|領収金額|支払金額|請求金額)[\s:：]*[¥￥]*\s*([0-9,]+)/i,
        /合\s*計[\s:：]*[¥￥]*\s*([0-9,]+)/i,
        /小計[\s:：]*[¥￥]*\s*([0-9,]+)/i,
        /(?:現\s*金|クレ(?:ジット)?|PayPay|d払い|auPAY|LINE\s*Pay)[\s:：]*[¥￥]*\s*([0-9,]+)/i,
        /[¥￥]\s*([0-9,]+)(?!\s*[\-\+])/ // 単独の金額表記（マイナス表記を除く）
      ],
      // 日付パターン
      date: [
        /(\d{4})[年\/\-](\d{1,2})[月\/\-](\d{1,2})[日]?/,
        /(\d{2,4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,
        /(\d{4})\.(\d{2})\.(\d{2})/,
        /(?:令和|R)(\d{1,2})[年\/\-](\d{1,2})[月\/\-](\d{1,2})[日]?/ // 和暦対応
      ],
      // 税率パターン
      taxRate: [
        /(?:10|8)%対象/i,
        /消費税等?\s*\(?(10|8)%\)?/i,
        /内税/
      ],
      // 電話番号パターン
      phone: /(?:TEL|電話|Tel|tel)[:：\s]*(\d{2,4}[-\s]\d{2,4}[-\s]\d{3,4})/,
      // インボイス登録番号
      invoice: /(T\d{13})/
    };

    // 店舗名の候補を検索
    let merchant = '不明';
    let merchantConfidence = 0;


    // よく知られた店舗名のリスト（大幅に拡充）
    const merchantKeywords = [
      'セブンイレブン', 'セブン-イレブン', 'セブン', '7-ELEVEN', '7-11', '7ELEVEN',
      'ローソン', 'LAWSON', 'ナチュラルローソン', 'ローソンストア100',
      'ファミリーマート', 'ファミマ', 'FamilyMart', 'FAMILY MART',
      'ミニストップ', 'MINISTOP',
      'デイリーヤマザキ', 'ヤマザキデイリーストア',
      'ニューデイズ', 'NewDays',
      'ポプラ', 'くらしハウス',
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
      'マクドナルド', "McDonald's", 'マック', 'McDonalds',
      'モスバーガー', 'モス', 'MOS BURGER',
      'ロッテリア', 'LOTTERIA',
      'ケンタッキー', 'KFC', 'ケンタッキーフライドチキン',
      'バーガーキング', 'BURGER KING',
      'フレッシュネスバーガー',
      'サブウェイ', 'SUBWAY',
      'ミスタードーナツ', 'ミスド', 'Mister Donut',
      'スターバックス', 'スタバ', 'Starbucks', 'STARBUCKS',
      'ドトール', 'DOUTOR',
      'タリーズ', "TULLY'S", 'タリーズコーヒー',
      'コメダ珈琲', 'コメダ', 'KOMEDA',
      'サンマルクカフェ', 'サンマルク',
      'プロント', 'PRONTO',
      '上島珈琲',
      'カフェ・ド・クリエ',
      'ベローチェ',
      'すき家', 'すきや', 'SUKIYA',
      '吉野家', 'YOSHINOYA',
      '松屋', 'MATSUYA',
      'なか卯', 'NAKAU',
      'てんや',
      '大戸屋', 'OOTOYA',
      'やよい軒',
      'ガスト', 'GUSTO',
      'サイゼリヤ', 'Saizeriya',
      'ジョナサン', "Jonathan's",
      'バーミヤン',
      'ロイヤルホスト',
      'デニーズ', "Denny's",
      'ココス', "COCO'S",
      'ビッグボーイ',
      'くら寿司', 'くらずし', '無添くら寿司',
      'スシロー', 'SUSHIRO',
      'はま寿司', 'はまずし',
      'かっぱ寿司', 'かっぱずし',
      '魚べい',
      'サイゼリア',
      'リンガーハット',
      '丸亀製麺',
      'はなまるうどん',
      '天下一品',
      '一風堂',
      '日高屋',
      '王将', '餃子の王将',
      'ペッパーランチ',
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
      'ビックカメラ', 'ビッグカメラ', 'BIC CAMERA',
      'ヨドバシカメラ', 'ヨドバシ', 'Yodobashi',
      'ヤマダ電機', 'ヤマダデンキ', 'YAMADA',
      'エディオン', 'EDION',
      'ケーズデンキ', "K's",
      'ジョーシン', 'Joshin',
      'ノジマ',
      'コジマ',
      'ソフマップ',
      'ベスト電器',
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
      'ニトリ', 'NITORI',
      '無印良品', 'MUJI',
      'ダイソー', 'DAISO', '100円ショップ',
      'セリア', 'Seria',
      'キャンドゥ', 'Can Do',
      'フランフラン',
      '東急ハンズ', 'ハンズ', 'HANDS',
      'ロフト', 'LOFT',
      'カインズ', 'CAINZ',
      'コーナン', 'KOHNAN',
      'コメリ',
      'ビバホーム',
      'ジョイフル本田',
      'ケーヨーデイツー', 'D2',
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
      '紀伊國屋書店', '紀伊国屋',
      'ジュンク堂',
      '丸善',
      'TSUTAYA', 'ツタヤ',
      'ブックオフ', 'BOOKOFF',
      '有隣堂',
      '三省堂書店',
      'トイザらス',
      'ベビーザらス',
      'ABCマート',
      'アスビー',
      '眼鏡市場',
      'JINS', 'ジンズ',
      'Zoff', 'ゾフ',
      'ENEOS', 'エネオス',
      '出光', 'Idemitsu',
      'コスモ石油', 'COSMO',
      'シェル', 'Shell',
      'エッソ', 'Esso',
      'モービル', 'Mobil',
      'Amazon', 'アマゾン',
      '楽天', 'Rakuten',
      'メルカリ',
      'ヤフオク', 'Yahoo!',
      'PayPay',
    ];


    // 1. キーワードマッチング
    for (const keyword of merchantKeywords) {
      if (normalizedText.includes(keyword)) {
        merchant = keyword;
        merchantConfidence = 95;
        break;
      }
    }

    const lines = normalizedText.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    // 2. 電話番号の近くにある行を店舗名として推測
    if (merchantConfidence < 50) {
      const phoneMatch = normalizedText.match(patterns.phone);
      if (phoneMatch) {
        // 電話番号が見つかった場合、その数行前を探索
        const phoneIndex = lines.findIndex(line => line.includes(phoneMatch[1]) || line.includes(phoneMatch[0]));
        if (phoneIndex > 0) {
          // 電話番号の1-3行前をチェック
          for (let i = Math.max(0, phoneIndex - 3); i < phoneIndex; i++) {
            const line = lines[i];
            // 明らかに店舗名っぽくない行を除外（日付や金額のみなど）
            if (line.length > 2 && line.length < 20 && !line.match(/[\d\/\-\.:\s]+$/)) {
              merchant = line;
              merchantConfidence = 70;
              break; // 一番上の行を優先したい場合はループ順序を逆にするか、ここでbreakしない
            }
          }
        }
      }
    }

    // 3. 最初の行を使用（フォールバック）
    if (merchantConfidence === 0 && lines.length > 0) {
      const firstLine = lines[0];
      // 記号や数字だけの行を除外
      if (firstLine.length > 1 && !/^[\d\s\-\/\.:¥￥]+$/.test(firstLine)) {
        merchant = firstLine;
        merchantConfidence = 50;
      } else if (lines.length > 1) {
        merchant = lines[1]; // 2行目を試す
        merchantConfidence = 40;
      }
    }

    // 日付を検索
    let date = '';
    let dateConfidence = 0;
    for (const pattern of patterns.date) {
      const dateMatch = normalizedText.match(pattern);
      if (dateMatch) {
        let year = dateMatch[1];
        const month = dateMatch[2].padStart(2, '0');
        const day = dateMatch[3].padStart(2, '0');

        // 和暦変換
        if (pattern.toString().includes('令和') || pattern.toString().includes('R')) {
          year = (parseInt(year) + 2018).toString();
        } else if (year.length === 2) {
          year = '20' + year;
        }

        // 有効な日付かチェック
        const dateObj = new Date(`${year}-${month}-${day}`);
        if (!isNaN(dateObj.getTime()) && dateObj.getFullYear() > 2000 && dateObj.getFullYear() < 2030) {
          date = `${year}-${month}-${day}`;
          dateConfidence = 90;
          break;
        }
      }
    }

    // 日付が見つからない場合、今日の日付を設定
    if (!date) {
      date = new Date().toISOString().split('T')[0];
      dateConfidence = 10; // 低い信頼度
    }

    // 金額を検索
    let amount = 0;
    let amountConfidence = 0;

    for (const pattern of patterns.totalAmount) {
      const amountMatch = normalizedText.match(pattern);
      if (amountMatch) {
        const amountStr = amountMatch[1].replace(/[,，]/g, ''); // 全角カンマも考慮
        const parsedAmount = parseInt(amountStr);
        if (!isNaN(parsedAmount) && parsedAmount > 0) {
          amount = parsedAmount;
          amountConfidence = 90;
          break;
        }
      }
    }

    // 金額が見つからない場合、全ての数字から最大値を探す（ただし日付や電話番号と誤認しないように注意）
    if (amount === 0) {
      const allNumbers = normalizedText.match(/[0-9,]+/g);
      if (allNumbers) {
        const numbers = allNumbers
          .map(n => parseInt(n.replace(/[,，]/g, '')))
          .filter(n => !isNaN(n) && n > 0 && n < 1000000); // 100万円未満

        // 日付っぽい数字（20240101など）を除外するロジックが必要だが、簡易的に最大値を取る
        if (numbers.length > 0) {
          // 単純な最大値ではなく、頻出する金額や、合計っぽい位置にあるものを探すべきだが、
          // ここでは簡易的に最大値を採用しつつ信頼度を下げる
          amount = Math.max(...numbers);
          amountConfidence = 40;
        }
      }
    }

    // 税率を検索
    let taxRate = 10; // デフォルト10%
    let taxRateConfidence = 50;

    if (normalizedText.match(/8%|軽減税率/)) {
      taxRate = 8;
      taxRateConfidence = 80;
    } else if (normalizedText.match(/10%/)) {
      taxRate = 10;
      taxRateConfidence = 80;
    }

    // インボイス登録番号の抽出（あれば信頼度アップ）
    const invoiceMatch = normalizedText.match(patterns.invoice);
    const hasInvoice = !!invoiceMatch;

    const totalConfidence = Math.round(
      (merchantConfidence + dateConfidence + amountConfidence + taxRateConfidence + (hasInvoice ? 20 : 0)) / (hasInvoice ? 5 : 4)
    );

    console.log('抽出結果:', {
      merchant,
      date,
      amount,
      taxRate,
      hasInvoice,
      confidence: totalConfidence
    });

    return {
      merchant,
      date,
      amount,
      taxRate,
      category: '未分類', // デフォルトカテゴリ
      description: hasInvoice ? `インボイス登録番号: ${invoiceMatch![1]}` : 'OCRで抽出',
      confidence: Math.min(100, totalConfidence),
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
      // 1. レシートステータスを承認済みに更新
      await updateReceiptStatus(id, 'approved');

      // 2. トランザクションを作成 (Context経由で追加することで即座に反映)
      await createTransaction({
        item: receipt.merchant, // 店舗名を項目名として使用
        amount: receipt.amount,
        date: receipt.date,
        category: receipt.category,
        type: 'expense',
        description: receipt.description || `${receipt.merchant}での購入`,
        receipt_url: undefined,
        creator: user.id,
        tags: ['receipt_scan'],
        recurring: false,
        approval_status: 'approved' // 明示的にapprovedを設定
      });

      toast.success('レシートが登録され、取引履歴に反映されました');
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
        await processReceiptImageWithTesseract(scanState.imageData);
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



  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Mobile Alert */}
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

        <div className="flex items-center mb-4">
          <Link to="/dashboard" className="mr-3">
            <ArrowLeft className="w-5 h-5 text-text-muted hover:text-text-main" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-text-main">レシート処理</h1>
            <p className="text-xs text-text-muted">AI解析で自動仕訳データを作成します</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto space-y-6 mb-12">
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
                      style={{ width: `${scanState.progress}%` }}
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
                className="group border border-primary border-dashed rounded-lg p-2.5 sm:p-4 text-center cursor-pointer bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
                onClick={startCamera}
              >
                <Camera className="w-6 h-6 text-text-muted group-hover:text-primary mx-auto mb-1.5 transition-colors" />
                <p className="text-[10px] sm:text-sm font-semibold text-text-main mb-0.5">カメラで撮影</p>
                <p className="hidden sm:block text-[10px] text-text-muted">その場で撮影</p>
                <p className="sm:hidden text-[9px] text-text-muted">撮影可能</p>
              </div>

              {/* ファイルアップロード */}
              <label className="group border border-primary border-dashed rounded-lg p-2.5 sm:p-4 text-center cursor-pointer bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200">
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
              <div className="group border border-primary border-dashed rounded-lg p-2.5 sm:p-4 text-center bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200">
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
            <div className="p-3 border-b border-border">
              <h2 className="text-base font-semibold text-text-main">処理済みレシート</h2>
            </div>

            {/* モバイル用カード表示 */}
            <div className="md:hidden p-3 space-y-3">
              {filteredReceipts.length === 0 ? (
                <div className="p-8 text-center text-text-muted border border-dashed border-border rounded-lg">
                  <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>処理済みのレシートはありません</p>
                  <p className="text-sm mt-1">新しいレシートをアップロードしてください</p>
                </div>
              ) : (
                filteredReceipts.map((receipt) => (
                  <div key={receipt.id} className="border border-border rounded-lg p-3">
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
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-base font-semibold text-text-main">¥{receipt.amount.toLocaleString()}</p>
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
                          className="p-2 text-primary hover:text-blue-900 hover:bg-blue-50 rounded-full transition-colors duration-200"
                          title="詳細"
                        >
                          <Eye className="w-5 h-5" />
                        </button>

                        {receipt.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(receipt.id)}
                              className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-full transition-colors duration-200"
                              title="承認"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleReject(receipt.id)}
                              className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-full transition-colors duration-200"
                              title="却下"
                            >
                              <X className="w-5 h-5" />
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
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-background">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">日付</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">店舗名</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">金額</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">カテゴリ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">信頼度</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-surface divide-y divide-gray-200">
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
                          {/* AI分析の信頼度を表示 */}
                          {receipt.aiAnalysis && receipt.aiAnalysis.confidence !== undefined && (
                            <div className="text-xs text-text-muted mt-1">
                              <div>AI信頼度: {Math.round(receipt.aiAnalysis.confidence * 100)}%</div>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
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
                                  onClick={() => handleEdit(receipt)}
                                  className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-all shadow-sm flex items-center gap-1 text-xs whitespace-nowrap"
                                  title="編集"
                                >
                                  <Edit2 className="w-4 h-4" />
                                  編集
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
                />
              )
            }
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}

export default ReceiptProcessing
