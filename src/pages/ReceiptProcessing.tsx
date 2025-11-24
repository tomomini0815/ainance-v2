import React, { useState, useEffect } from 'react'
import { Upload, FileText, CheckCircle, ArrowRight, Camera, X, RefreshCw, FileImage, Search, Eye, RotateCcw, Check, Save, AlertTriangle } from 'lucide-react';
import DocumentUpload from '../components/DocumentUpload';
import ReceiptCamera from '../components/ReceiptCamera';
import { ReceiptData as ParsedReceiptData } from '../utils/ReceiptParser'
import { saveReceipt, getReceipts, updateReceiptStatus, approveReceiptAndCreateTransaction } from '../services/receiptService'
import { useAuth } from '../components/AuthProvider'
import { useBusinessTypeContext } from '../context/BusinessTypeContext'

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
  const { user } = useAuth(); // 認証されたユーザーを取得
  const { currentBusinessType } = useBusinessTypeContext(); // 事業タイプを取得

  const [uploadedReceipts, setUploadedReceipts] = useState<ReceiptData[]>([])

  // スキャン状態の管理
  const [scanState, setScanState] = useState<ScanState>({
    isProcessing: false,
    retryCount: 0
  })

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<ReceiptData>>({})

  const [showCamera, setShowCamera] = useState(false)

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
      if (!user?.uid) return;

      const receipts = await getReceipts(user.uid);
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
    // Tesseract.jsを使用して処理
    await processReceiptImageWithTesseract(imageBlob);
  };

  // Tesseract.jsを使用したレシート画像処理
  const processReceiptImageWithTesseract = async (imageBlob: Blob) => {
    // 処理状態を更新
    setScanState({
      isProcessing: true,
      retryCount: 0,
      progress: 0,
      currentStep: 'OCR処理を開始しています...'
    });

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
      // 動的インポートでTesseract.jsを読み込み
      const Tesseract = await import('tesseract.js');

      // 画像URLを作成
      const imageUrl = URL.createObjectURL(imageBlob);

      setScanState(prev => ({
        ...prev,
        progress: 10,
        currentStep: 'OCRエンジンを初期化中...'
      }));

      // OCR処理を実行（日本語+英語）
      const result = await Tesseract.recognize(
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

      // URLを解放
      URL.revokeObjectURL(imageUrl);

      console.log('OCR結果:', result.data.text);

      setScanState(prev => ({
        ...prev,
        progress: 90,
        currentStep: 'データを抽出中...'
      }));

      // テキストから情報を抽出
      const extractedData = extractReceiptData(result.data.text);

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
            confidence: extractedData.confidence || 70,
            confidenceScores: extractedData.confidenceScores
          }
          : receipt
      ));

      setScanState(prev => ({
        ...prev,
        progress: 95,
        currentStep: 'データベースに保存中...'
      }));

      // Supabaseに保存
      if (user?.uid) {
        const savedReceipt = await saveReceipt({
          user_id: user.uid,
          date: extractedData.date || newReceipt.date,
          merchant: extractedData.merchant || '不明',
          amount: extractedData.amount || 0,
          category: extractedData.category || '未分類',
          description: extractedData.description || 'OCR処理完了',
          confidence: extractedData.confidence || 70,
          status: 'pending',
          tax_rate: extractedData.taxRate || 0,
          confidence_scores: extractedData.confidenceScores
        });

        if (savedReceipt && savedReceipt.id) {
          // 保存成功：ローカルのレシート情報をSupabaseのIDで更新
          setUploadedReceipts(prev => prev.map(receipt =>
            receipt.id === newReceipt.id
              ? { ...receipt, id: savedReceipt.id! }
              : receipt
          ));
        }
      }

      setScanState(prev => ({
        ...prev,
        progress: 100,
        currentStep: '完了'
      }));

      // 成功メッセージ
      setTimeout(() => {
        setScanState({
          isProcessing: false,
          retryCount: 0
        });
      }, 500);

    } catch (error: any) {
      console.error('OCR処理エラー:', error);

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

      setScanState({
        isProcessing: false,
        retryCount: 0,
        errorMessage: `OCR処理に失敗しました: ${error.message}`
      });
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
      // コンビニエンスストア
      'セブンイレブン', 'セブン-イレブン', 'セブン', '7-ELEVEN', '7-11', '7ELEVEN',
      'ローソン', 'LAWSON', 'ナチュラルローソン', 'ローソンストア100',
      'ファミリーマート', 'ファミマ', 'FamilyMart', 'FAMILY MART',
      'ミニストップ', 'MINISTOP',
      'デイリーヤマザキ', 'ヤマザキデイリーストア',
      'ニューデイズ', 'NewDays',
      'ポプラ', 'くらしハウス',

      // スーパーマーケット
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

      // 飲食店（ファストフード）
      'マクドナルド', "McDonald's", 'マック', 'McDonalds',
      'モスバーガー', 'モス', 'MOS BURGER',
      'ロッテリア', 'LOTTERIA',
      'ケンタッキー', 'KFC', 'ケンタッキーフライドチキン',
      'バーガーキング', 'BURGER KING',
      'フレッシュネスバーガー',
      'サブウェイ', 'SUBWAY',
      'ミスタードーナツ', 'ミスド', 'Mister Donut',

      // 飲食店（カフェ）
      'スターバックス', 'スタバ', 'Starbucks', 'STARBUCKS',
      'ドトール', 'DOUTOR',
      'タリーズ', "TULLY'S", 'タリーズコーヒー',
      'コメダ珈琲', 'コメダ', 'KOMEDA',
      'サンマルクカフェ', 'サンマルク',
      'プロント', 'PRONTO',
      '上島珈琲',
      'カフェ・ド・クリエ',
      'ベローチェ',

      // 飲食店（牛丼・定食）
      'すき家', 'すきや', 'SUKIYA',
      '吉野家', 'YOSHINOYA',
      '松屋', 'MATSUYA',
      'なか卯', 'NAKAU',
      'てんや',
      '大戸屋', 'OOTOYA',
      'やよい軒',

      // 飲食店（ファミレス）
      'ガスト', 'GUSTO',
      'サイゼリヤ', 'Saizeriya',
      'ジョナサン', "Jonathan's",
      'バーミヤン',
      'ロイヤルホスト',
      'デニーズ', "Denny's",
      'ココス', "COCO'S",
      'ビッグボーイ',

      // 飲食店（回転寿司）
      'くら寿司', 'くらずし', '無添くら寿司',
      'スシロー', 'SUSHIRO',
      'はま寿司', 'はまずし',
      'かっぱ寿司', 'かっぱずし',
      '魚べい',

      // 飲食店（その他）
      'サイゼリア',
      'リンガーハット',
      '丸亀製麺',
      'はなまるうどん',
      '天下一品',
      '一風堂',
      '日高屋',
      '王将', '餃子の王将',
      'ペッパーランチ',

      // ドラッグストア
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

      // 家電量販店
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

      // ファッション・アパレル
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

      // 生活雑貨・インテリア
      'ニトリ', 'NITORI',
      '無印良品', 'MUJI',
      'ダイソー', 'DAISO', '100円ショップ',
      'セリア', 'Seria',
      'キャンドゥ', 'Can Do',
      'フランフラン',
      '東急ハンズ', 'ハンズ', 'HANDS',
      'ロフト', 'LOFT',

      // ホームセンター
      'カインズ', 'CAINZ',
      'コーナン', 'KOHNAN',
      'コメリ',
      'ビバホーム',
      'ジョイフル本田',
      'ケーヨーデイツー', 'D2',

      // 百貨店
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

      // 書店
      '紀伊國屋書店', '紀伊国屋',
      'ジュンク堂',
      '丸善',
      'TSUTAYA', 'ツタヤ',
      'ブックオフ', 'BOOKOFF',
      '有隣堂',
      '三省堂書店',

      // その他小売
      'トイザらス',
      'ベビーザらス',
      'ABCマート',
      'アスビー',
      '眼鏡市場',
      'JINS', 'ジンズ',
      'Zoff', 'ゾフ',

      // ガソリンスタンド
      'ENEOS', 'エネオス',
      '出光', 'Idemitsu',
      'コスモ石油', 'COSMO',
      'シェル', 'Shell',
      'エッソ', 'Esso',
      'モービル', 'Mobil',

      // その他
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

  const handleApprove = async (id: string) => {
    // レシート情報を取得
    const receipt = uploadedReceipts.find(r => r.id === id);
    if (!receipt || !user?.uid) {
      console.error('レシートまたはユーザーが見つかりません');
      return;
    }

    // 事業タイプを取得（デフォルトは個人）
    const businessType = currentBusinessType?.business_type || 'individual';

    // UIを先に更新（楽観的更新）
    setUploadedReceipts(prev => prev.map(r =>
      r.id === id ? { ...r, status: 'approved' as const } : r
    ));

    // レシートデータを作成
    const receiptData = {
      id: receipt.id,
      user_id: user.uid,
      date: receipt.date,
      merchant: receipt.merchant,
      amount: receipt.amount,
      category: receipt.category,
      description: receipt.description,
      confidence: receipt.confidence,
      status: 'approved' as const,
      tax_rate: receipt.taxRate,
      confidence_scores: receipt.confidenceScores,
    };

    // 各テーブルに保存
    const result = await approveReceiptAndCreateTransaction(
      id,
      receiptData,
      businessType,
      user.uid
    );

    if (result.success) {
      console.log('✅ レシート承認完了: 各テーブルに保存されました');
      // 成功通知を表示（オプション）
      alert(`レシートが承認され、${businessType === 'individual' ? '個人' : '法人'}の取引として記録されました！`);
    } else {
      console.error('❌ レシート承認エラー:', result.error);
      // エラー時は状態を元に戻す
      setUploadedReceipts(prev => prev.map(r =>
        r.id === id ? { ...r, status: 'pending' as const } : r
      ));
      alert(`エラーが発生しました: ${result.error}`);
    }
  }

  const handleReject = async (id: string) => {
    setUploadedReceipts(prev => prev.map(receipt =>
      receipt.id === id ? { ...receipt, status: 'rejected' as const } : receipt
    ))
    // Supabaseにも保存
    await updateReceiptStatus(id, 'rejected');
  }

  // サンプルレシートを追加する関数（テスト用）
  const addSampleReceipts = () => {
    const sampleData: ReceiptData[] = [
      {
        id: Date.now().toString(),
        date: '2024-01-15',
        merchant: 'セブンイレブン',
        amount: 1320,
        category: '消耗品費',
        description: 'コピー用紙',
        confidence: 95,
        status: 'pending',
        taxRate: 10
      },
      {
        id: (Date.now() + 1).toString(),
        date: '2024-01-14',
        merchant: 'マクドナルド',
        amount: 748,
        category: '接待交際費',
        description: 'ビッグマックセット',
        confidence: 92,
        status: 'pending',
        taxRate: 10
      },
      {
        id: (Date.now() + 2).toString(),
        date: '2024-01-13',
        merchant: 'ローソン',
        amount: 540,
        category: '消耗品費',
        description: '飲料水',
        confidence: 88,
        status: 'pending',
        taxRate: 8
      }
    ];
    setUploadedReceipts(prev => [...sampleData, ...prev]);
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

  // AI自動処理機能
  const [isAutoProcessing, setIsAutoProcessing] = useState(false);

  const handleAutoProcess = async () => {
    setIsAutoProcessing(true);
    try {
      // 保留中のレシートを自動処理
      const pendingReceipts = uploadedReceipts.filter(r => r.status === 'pending');

      for (const receipt of pendingReceipts) {
        try {
          // ここでAI処理を実行
          // 実際のアプリケーションでは、AIサービスを呼び出して処理を行う
          await new Promise(resolve => setTimeout(resolve, 1000)); // シミュレーション

          // 処理が成功したら承認状態に変更
          await handleApprove(receipt.id);
        } catch (error) {
          console.error(`レシート ${receipt.id} の自動処理に失敗しました:`, error);
        }
      }
    } finally {
      setIsAutoProcessing(false);
    }
  };

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
            <button
              onClick={handleAutoProcess}
              disabled={isAutoProcessing}
              className={`px-4 py-2 rounded-lg transition-colors ${isAutoProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary text-white hover:bg-primary/90'}`}
            >
              {isAutoProcessing ? (
                <span className="flex items-center">
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  処理中...
                </span>
              ) : (
                'AI自動処理'
              )}
            </button>
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
                  {uploadedReceipts.length > 0 ? (
                    uploadedReceipts.slice(0, 3).map((receipt) => (
                      <div key={receipt.id} className="flex items-center justify-between p-4 bg-background rounded-xl border border-border hover:border-primary/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium text-text-main">{receipt.merchant}</p>
                            <p className="text-sm text-text-muted">{receipt.date} {receipt.amount > 0 ? `¥${receipt.amount.toLocaleString()}` : ''}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${receipt.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                            receipt.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                              'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                            }`}>
                            {receipt.status === 'approved' ? '処理完了' :
                              receipt.status === 'rejected' ? '却下' : '処理中'}
                          </span>
                          <button
                            onClick={() => showReceiptDetails(receipt)}
                            className="p-2 text-text-muted hover:text-primary transition-colors"
                          >
                            <ArrowRight className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-text-muted">
                      まだアップロードされたレシートはありません
                    </div>
                  )}
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

        {/* アップロードエリア */}
        <div className="bg-surface rounded-xl shadow-sm border border-border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">レシートをアップロード</h2>

          {/* カメラボタン */}
          <div className="mb-6">
            <button
              onClick={startCamera}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Camera className="w-5 h-5" />
              カメラでレシートを撮影
            </button>
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
                      className="p-2 text-primary hover:text-blue-900 hover:bg-blue-50 rounded-full transition-colors duration-200"
                      title="詳細"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    {/* 再試行ボタン（OCR処理に失敗した場合に表示） */}
                    {receipt.merchant === '解析エラー' && (
                      <button
                        onClick={() => retryReceiptProcessing(receipt.id)}
                        className="p-2 text-orange-600 hover:text-orange-900 hover:bg-orange-50 rounded-full transition-colors duration-200"
                        title="再試行"
                      >
                        <RotateCcw className="w-5 h-5" />
                      </button>
                    )}
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
                            className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-full transition-colors duration-200"
                            title="保存"
                          >
                            <Save className="w-5 h-5" />
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => showReceiptDetails(receipt)}
                              className="p-2 text-primary hover:text-blue-900 hover:bg-blue-50 rounded-full transition-colors duration-200"
                              title="詳細"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            {/* 再試行ボタン（OCR処理に失敗した場合に表示） */}
                            {receipt.merchant === '解析エラー' && (
                              <button
                                onClick={() => retryReceiptProcessing(receipt.id)}
                                className="p-2 text-orange-600 hover:text-orange-900 hover:bg-orange-50 rounded-full transition-colors duration-200"
                                title="再試行"
                              >
                                <RotateCcw className="w-5 h-5" />
                              </button>
                            )}
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