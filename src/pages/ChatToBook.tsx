import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mic, Send, Save, Trash2, Edit, CheckCircle, ArrowLeft, ArrowUpDown, Circle, Info, AlertCircle, Square, ChevronDown } from 'lucide-react';
import TransactionIcon from '../components/TransactionIcon';
import { useTransactions } from '../hooks/useTransactions';
import { useBusinessType } from '../hooks/useBusinessType';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { findPotentialDuplicates } from '../utils/duplicateCheckUtils';
import { STANDARD_CATEGORIES, determineCategoryByKeyword, getCategoryType, standardizeItemName } from '../services/keywordCategoryService';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  created_at?: string;
  updated_at?: string;
  approval_status?: 'pending' | 'approved' | 'rejected'; // 型を明確に指定
}

type SortKey = 'date' | 'created_at';
type SortDirection = 'asc' | 'desc';

const ChatToBook: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Transaction>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  // const [approvedTransactions, setApprovedTransactions] = useState<string[]>(); // 承認された取引のIDを管理
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null); // 選択されたカテゴリを管理
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // エラーメッセージを管理
  // ソート設定（デフォルトは作成日時降順＝新しいものが上）
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({
    key: 'created_at',
    direction: 'desc'
  });
  const [isMobileUsageOpen, setIsMobileUsageOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  // const recognitionRef = useRef<any>(null); // Removed: Handled by hook
  const { user } = useAuth();
  const { currentBusinessType } = useBusinessType(user?.id);
  // currentBusinessType?.business_typeを明示的に渡す
  const {
    transactions: dbTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    approveTransaction, // approveTransactionを追加
    // loading,
    fetchTransactions
  } = useTransactions(user?.id, currentBusinessType?.business_type);
  const navigate = useNavigate();

  // ソート関数
  const handleSort = (key: SortKey) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  // ソートされた取引データ
  const sortedTransactions = React.useMemo(() => {
    return transactions
      .filter(t => t.approval_status !== 'approved')
      .sort((a, b) => {
        const direction = sortConfig.direction === 'asc' ? 1 : -1;

        if (sortConfig.key === 'created_at') {
          // created_atがない場合は新しいものとして扱う（一時データなど）
          const dateA = a.created_at ? new Date(a.created_at).getTime() : Date.now();
          const dateB = b.created_at ? new Date(b.created_at).getTime() : Date.now();
          return (dateA - dateB) * direction;
        }

        // 日付ソート
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return (dateA - dateB) * direction;
      });
  }, [transactions, sortConfig]);

  const {
    isListening,
    transcript,
    setTranscript,
    error: speechError,
    startListening: startSpeechRecognition,
    stopListening: stopSpeechRecognition,
    isSupported
  } = useSpeechRecognition();

  // エラーが変更されたら表示
  useEffect(() => {
    if (speechError) {
      setErrorMessage(speechError);
      // 数秒後にエラーをクリア（オプション）
      const timer = setTimeout(() => setErrorMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [speechError]);

  const startListening = () => {
    setErrorMessage(null);
    startSpeechRecognition();
  };

  const stopListening = () => {
    stopSpeechRecognition();
  };

  // DBから取引データを取得
  useEffect(() => {
    console.log('ChatToBook - DBから取引データを取得中', {
      dbTransactionsCount: dbTransactions.length,
      dbTransactionIds: dbTransactions.map(t => t.id)
    });

    // DBから取得した取引データのみを表示（ローカルの一時データは除外）
    // ただし、一括記録後に再取得されたデータはローカルリストに追加しない
    setTransactions(prev => {
      // DBから取得した取引のIDリスト
      const dbTransactionIds = dbTransactions.map((t: any) => t.id);

      // ローカルの一時データ（DBにまだ保存されていないデータ）のみをフィルタリング
      // ただし、一括承認済みのデータは除外する
      const localTempData = prev.filter(t => !dbTransactionIds.includes(t.id));

      // DBから取得したデータとローカルの一時データを結合
      // 承認された取引も表示するが、重複を避ける
      const mergedTransactions = [
        ...dbTransactions
          .filter((t: any) => t.tags?.includes('voice')) // 音声記録データのみを表示
          .map((t: any) => ({
            id: t.id,
            date: t.date,
            description: t.description || t.item || '',
            amount: t.amount,
            category: t.category,
            type: t.type as 'income' | 'expense',
            created_at: t.created_at,
            updated_at: t.updated_at,
            approval_status: t.approval_status // 承認状態を追加
          })),
        ...localTempData
      ];

      // 重複を削除（IDが同じものは除外）
      const uniqueTransactions = mergedTransactions.filter((transaction, index, self) =>
        index === self.findIndex(t => t.id === transaction.id)
      );

      console.log('ChatToBook - 合成された取引データ:', {
        mergedCount: mergedTransactions.length,
        uniqueCount: uniqueTransactions.length,
        dbTransactionIds,
        localTempDataCount: localTempData.length
      });

      return uniqueTransactions;
    });
  }, [dbTransactions]);

  // カスタムイベントリスナーを追加して、取引が記録されたときにデータを再取得
  useEffect(() => {
    const handleTransactionRecorded = async () => {
      console.log('ChatToBook - transactionRecordedイベントを受信');
      if (currentBusinessType?.id) {
        // 少し遅延させてからデータを再取得する
        await new Promise(resolve => setTimeout(resolve, 100));
        fetchTransactions();
      }
    };

    window.addEventListener('transactionRecorded', handleTransactionRecorded);

    return () => {
      window.removeEventListener('transactionRecorded', handleTransactionRecorded);
    };
  }, [currentBusinessType, fetchTransactions]);

  // 承認イベントリスナーを追加して、取引が承認されたときにデータを再取得
  useEffect(() => {
    const handleTransactionApproved = async () => {
      console.log('ChatToBook - transactionApprovedイベントを受信');
      if (currentBusinessType?.id) {
        // 少し遅延させてからデータを再取得する
        await new Promise(resolve => setTimeout(resolve, 100));
        fetchTransactions();
      }
    };

    window.addEventListener('transactionApproved', handleTransactionApproved);

    return () => {
      window.removeEventListener('transactionApproved', handleTransactionApproved);
    };
  }, [currentBusinessType, fetchTransactions]);



  // 音声テキストから取引情報を抽出
  const extractTransactionData = (text: string) => {
    console.log('extractTransactionData - text:', text);

    // 句読点（、。）を除去して整形
    let processingText = text.replace(/[、。]/g, ' ').replace(/\s+/g, ' ').trim();
    let targetDate = new Date();
    if (selectedDate) {
      const [y, m, d] = selectedDate.split('-').map(Number);
      targetDate = new Date(y, m - 1, d);
    }

    // 1. 日付を抽出して除去
    const datePattern = /(\d{1,2})月(\d{1,2})日/;
    const dateMatch = processingText.match(datePattern);

    if (dateMatch) {
      const month = parseInt(dateMatch[1], 10);
      const day = parseInt(dateMatch[2], 10);
      const currentYear = targetDate.getFullYear();
      targetDate = new Date(currentYear, month - 1, day);

      // 未来の日付になってしまった場合、去年の日付とする
      // 例: 現在1月で「12月」と言われた場合、今年の12月（未来）ではなく去年の12月とする
      const today = new Date();
      if (targetDate > today) {
        targetDate.setFullYear(currentYear - 1);
      }

      // テキストから日付を除去
      processingText = processingText.replace(dateMatch[0], '');
    } else {
      // 相対日付の処理
      const yesterdayMatch = processingText.match(/(昨日|一昨日|おととい)/);
      if (yesterdayMatch) {
        if (yesterdayMatch[0] === '昨日') {
          targetDate.setDate(targetDate.getDate() - 1);
        } else {
          targetDate.setDate(targetDate.getDate() - 2);
        }
        // テキストから除去
        processingText = processingText.replace(yesterdayMatch[0], '');
      }
      // "今日"も除去しておく
      processingText = processingText.replace('今日', '');
    }

    // 日付フォーマット
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    // 2. 金額を抽出（残りのテキストから）
    // "15万6000円", "15,000円", "1万 5千円", "1000円" などのパターンに対応
    // 金額部分にカンマやスペースが含まれる可能性を考慮
    const amountPattern = /((?:\d+[,\s]?)+(?:万(?:\s?\d+)*)?(?:千(?:\s?\d+)*)?円?)/g;
    const amounts = processingText.match(amountPattern);

    let amount = 0;
    if (amounts && amounts.length > 0) {
      // 最も長い一致（情報量が多いもの）を採用する戦略
      // 例: "15万6000円" と "6000円" がマッチした場合、前者を採用
      const amountText = amounts.reduce((a, b) => a.length >= b.length ? a : b);

      // テキストから除去
      processingText = processingText.replace(amountText, '');

      // 金額パースロジック
      let tempAmount = 0;
      let currentText = amountText;

      // "万"の処理
      if (currentText.includes('万')) {
        const parts = currentText.split('万');
        const manPart = parts[0];
        const manValue = parseFloat(manPart.replace(/[^\d.]/g, '')) || 0;
        tempAmount += manValue * 10000;
        currentText = parts[1] || ''; // 残りの部分
      }

      // "千"の処理
      if (currentText.includes('千')) {
        const parts = currentText.split('千');
        const senPart = parts[0];
        // "1千" のように数字がある場合と、単に "千" (1000) の場合があるが、
        // 前の正規表現で \d+千 としているので数字はあるはず
        // ただし "万" の後ろがすぐ "千" の場合（例: 1万千円? あまりないが）のケア
        // ここではシンプルに数字があれば掛ける
        let senValue = 1;
        if (senPart) {
          senValue = parseFloat(senPart.replace(/[^\d.]/g, '')) || 1; // 数字がなければ1000? いや \d+千 なので数字はある
        }
        tempAmount += senValue * 1000;
        currentText = parts[1] || '';
      }

      // 残りの数字（円や100未満の端数など）
      if (currentText) {
        const restValue = parseFloat(currentText.replace(/[^\d.]/g, '')) || 0;
        tempAmount += restValue;
      }

      amount = tempAmount;
    }

    // 3. カテゴリ検出
    // 共有サービスのロジックを使用
    const detectedCategoryName = determineCategoryByKeyword(processingText) || '雑費';
    const detectedType = getCategoryType(detectedCategoryName);

    // 残ったテキストを説明文として整形
    // 標準化（例：ガソリン -> 燃料代）
    const description = standardizeItemName(processingText.trim(), detectedCategoryName || '');

    // 表示用の日付文字列
    let dateDisplay = '今日';
    if (text.includes('昨日')) dateDisplay = '昨日';
    else if (text.includes('一昨日') || text.includes('おととい')) dateDisplay = '一昨日';
    else if (dateMatch) dateDisplay = `${dateMatch[1]}月${dateMatch[2]} 日`;

    return {
      date: formattedDate,
      dateDisplay,
      description, // クリーニング済みのテキスト
      amount,
      category: detectedCategoryName,
      type: detectedType
    };
  };

  const processTranscript = async () => {
    if (!transcript.trim()) return;

    console.log('processTranscript - transcript:', transcript);
    setIsProcessing(true);

    try {
      // ユーザーが認証されているか確認
      if (!user?.id) {
        toast.error('ユーザーが認証されていません。ログインしてください。');
        console.error('ユーザーが認証されていません。userオブジェクト:', user);
        setIsProcessing(false);
        return;
      }

      // 実際のアプリケーションでは、AIやルールベースの処理で取引情報を抽出
      // ここでは簡略化のためにクライアント側で処理
      const transactionData = extractTransactionData(transcript);

      const cleanedDescription = transactionData.description;

      console.log('processTranscript - データベースに保存中:', {
        item: cleanedDescription,
        amount: transactionData.amount,
        date: transactionData.date,
        category: selectedCategory || transactionData.category,
        type: transactionData.type
      });

      // データベースに直接保存
      const result = await createTransaction({
        item: cleanedDescription,
        amount: transactionData.amount,
        date: transactionData.date,
        category: selectedCategory || transactionData.category,
        type: transactionData.type,
        creator: user.id,
        approval_status: 'pending', // 確認リストに表示するために一旦pendingにする
        tags: ['voice'] // 音声入力のタグを追加
      });

      console.log('processTranscript - 保存結果:', result);

      if (result.error) {
        throw result.error;
      }

      // 保存成功後、データを再取得
      await fetchTransactions();

      // カスタムイベントを発行して他のコンポーネントに通知
      window.dispatchEvent(new CustomEvent('transactionRecorded'));

      toast.success(`${cleanedDescription}を保存しました`);
      console.log('processTranscript - 取引をデータベースに保存しました');

      // 処理後にテキストをクリアして重複を防ぐ
      setTranscript('');
      // カテゴリ選択もクリア
      setSelectedCategory(null);
      setIsProcessing(false);
    } catch (error) {
      console.error('取引の保存に失敗しました:', error);
      // 認証エラーの場合、ログインページにリダイレクト
      if ((error as Error).message.includes('認証セッションが切れました')) {
        toast.error('認証セッションが切れました。ログインページにリダイレクトします。');
        navigate('/login');
        return;
      }
      toast.error('取引の保存に失敗しました: ' + (error as Error).message);
      setIsProcessing(false);
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingId(transaction.id);
    setEditData(transaction);
  };

  const handleSave = async () => {
    if (editingId && editData) {
      try {
        // DBの取引を更新（descriptionとitemの両方を更新）
        const updatedItem = editData.description !== undefined ? editData.description : '';
        const result = await updateTransaction(editingId, {
          date: editData.date || '',
          item: updatedItem,
          description: updatedItem,  // descriptionフィールドも同じ値で更新
          amount: editData.amount || 0,
          category: editData.category || '未分類',
          type: editData.type || 'expense'
        });

        if (result.error) {
          throw result.error;
        }

        // ローカル状態を更新（descriptionフィールドも更新）
        setTransactions(prev =>
          prev.map(t => {
            if (t.id === editingId) {
              return {
                ...t,
                ...editData,
                description: updatedItem  // descriptionも一緒に更新
              } as Transaction;
            }
            return t;
          })
        );

        // データの再取得を強制的に実行して、最近の履歴と取引履歴ページにデータを反映
        await fetchTransactions();

        // カスタムイベントを発行して他のコンポーネントに通知
        window.dispatchEvent(new CustomEvent('transactionRecorded'));

        setEditingId(null);
        setEditData({});

        console.log('取引の編集を保存しました:', { id: editingId, description: updatedItem });
      } catch (error) {
        console.error('取引の更新に失敗しました:', error);
        alert('取引の更新に失敗しました: ' + (error as Error).message);
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // DBから取引を削除
      const result = await deleteTransaction(id);

      if (result.error) {
        throw result.error;
      }

      // ローカル状態も更新
      setTransactions(prev => prev.filter(t => t.id !== id));
      // 選択済みリストからも削除
      setSelectedTransactions(prev => prev.filter(tid => tid !== id));
    } catch (error) {
      console.error('取引の削除に失敗しました:', error);
      alert('取引の削除に失敗しました: ' + (error as Error).message);
    }
  };

  // 単一の取引を記録（新規作成または承認）
  const recordTransaction = async (transaction: Transaction) => {
    try {
      console.log('recordTransaction - 開始:', transaction);

      // ユーザーが認証されているか確認
      if (!user?.id) {
        alert('ユーザーが認証されていません。ログインしてください。');
        console.error('ユーザーが認証されていません。userオブジェクト:', user);
        return;
      }

      // ユーザーIDをログに出力
      console.log('認証されたユーザーID:', user.id);

      // DBから最新の取引データを取得
      console.log('DBから最新の取引データを取得中...');
      await fetchTransactions();

      // DBから取得した最新の取引データを再取得
      const currentDbTransactions = dbTransactions;
      console.log('DBから取得した最新の取引データ:', currentDbTransactions);

      // 既存の取引かどうかを判断（IDがUUID形式かどうかで判断）
      const isExistingTransaction = transaction.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(transaction.id) &&
        currentDbTransactions.some(t => t.id === transaction.id);
      console.log('既存の取引かどうか:', {
        isExistingTransaction,
        transactionId: transaction.id,
        dbTransactionsCount: currentDbTransactions.length,
        dbTransactionIds: currentDbTransactions.map(t => t.id)
      });

      if (isExistingTransaction) {
        console.log('既存取引の承認処理を開始');
        // 既存の取引を承認状態に更新
        const result = await approveTransaction(transaction.id);
        console.log('承認処理結果:', result);

        if (result.error) {
          throw result.error;
        }

        // ローカル状態も更新
        setTransactions(prev =>
          prev.map(t => t.id === transaction.id ? { ...t, approval_status: 'approved' } : t)
        );

        // 承認イベントを発火
        console.log('transactionApprovedイベントを発火');
        window.dispatchEvent(new CustomEvent('transactionApproved'));

        console.log('recordTransaction - 取引を承認しました');
        toast.success('取引を登録しました。取引履歴から確認できます。', {
          id: 'transaction-registration',
          duration: 6000
        });

        // データの再取得を強制的に実行して、最近の履歴と取引履歴ページにデータを反映
        await fetchTransactions();
        console.log('recordTransaction - データ再取得完了');

        // ページ全体のデータ再取得をトリガーするカスタムイベントを発火
        window.dispatchEvent(new CustomEvent('transactionRecorded'));
      } else {
        console.log('新規取引作成処理を開始');
        // 新規取引を作成
        const cleanedDescription = transaction.description.replace(/(\d+(?:万)?(?:千)?(?:円)?)/g, '').trim();

        const result = await createTransaction({
          item: cleanedDescription,
          amount: transaction.amount,
          date: transaction.date.trim(),
          category: transaction.category,
          type: transaction.type,
          creator: user.id, // 認証されたユーザーのIDを使用
          approval_status: 'approved', // 作成時に承認状態にする
          tags: ['voice'] // 音声入力タグを追加
        });
        console.log('新規取引作成結果:', result);

        if (result.error) {
          throw result.error;
        }

        // ローカルの一時データを削除
        setTransactions(prev => prev.filter(t => t.id !== transaction.id));

        console.log('recordTransaction - 新規取引を作成しました');
        toast.success('取引を登録しました。取引履歴から確認できます。', {
          id: 'transaction-registration',
          duration: 6000
        });

        // データの再取得を強制的に実行して、最近の履歴と取引履歴ページにデータを反映
        await fetchTransactions();
        console.log('recordTransaction - データ再取得完了');

        // ページ全体のデータ再取得をトリガーするカスタムイベントを発火
        window.dispatchEvent(new CustomEvent('transactionRecorded'));
      }
    } catch (error) {
      console.error('取引の記録に失敗しました:', error);
      // 認証エラーの場合、ログインページにリダイレクト
      if ((error as Error).message.includes('認証セッションが切れました')) {
        alert('認証セッションが切れました。ログインページにリダイレクトします。');
        navigate('/login');
        return;
      }
      alert('取引の記録に失敗しました: ' + (error as Error).message);
    }
  };

  // 複数の取引を一括記録（新規作成または承認）
  const bulkRecordTransactions = async () => {
    // ユーザーが認証されているか確認
    if (!user?.id) {
      alert('ユーザーが認証されていません。ログインしてください。');
      console.error('ユーザーが認証されていません。userオブジェクト:', user);
      return;
    }

    // ユーザーIDをログに出力
    console.log('認証されたユーザーID:', user.id);

    // DBから最新の取引データを取得
    console.log('DBから最新の取引データを取得中...');
    await fetchTransactions();

    // DBから取得した最新の取引データを再取得
    const currentDbTransactions = dbTransactions;
    console.log('DBから取得した最新の取引データ:', currentDbTransactions);

    const selectedItems = transactions.filter(t => selectedTransactions.includes(t.id));
    console.log('bulkRecordTransactions - 選択された取引:', selectedItems);
    console.log('bulkRecordTransactions - 現在のDB取引データ:', currentDbTransactions);

    if (selectedItems.length === 0) {
      alert('記録する取引を選択してください');
      return;
    }

    try {
      // 既存の取引と新規取引に分類（IDがUUID形式かどうかで判断）
      const existingTransactions = selectedItems.filter(t =>
        t.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(t.id) &&
        currentDbTransactions.some(dbT => dbT.id === t.id)
      );
      const newTransactions = selectedItems.filter(t =>
        !t.id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(t.id) ||
        !currentDbTransactions.some(dbT => dbT.id === t.id)
      );

      console.log('取引分類結果:', {
        existingCount: existingTransactions.length,
        newCount: newTransactions.length,
        existingTransactions: existingTransactions.map(t => ({ id: t.id, item: t.description })),
        newTransactions: newTransactions.map(t => ({ id: t.id, item: t.description })),
        dbTransactionsCount: currentDbTransactions.length,
        dbTransactionIds: currentDbTransactions.map(t => t.id)
      });

      // 承認処理のPromise
      const approvePromises = existingTransactions.map(transaction => {
        console.log('承認処理を実行:', transaction.id);
        return approveTransaction(transaction.id);
      });

      // 新規作成処理のPromise
      const createPromises = newTransactions.map(transaction => {
        console.log('新規作成処理を実行:', transaction.id);
        const cleanedDescription = transaction.description.replace(/(\d+(?:万)?(?:千)?(?:円)?)/g, '').trim();
        return createTransaction({
          item: cleanedDescription,
          amount: transaction.amount,
          date: transaction.date.trim(),
          category: transaction.category,
          type: transaction.type,
          creator: user.id,
          approval_status: 'approved', // 登録時はapprovedにする
          tags: ['voice']
        });
      });

      // すべての処理を並列実行
      const approveResults = await Promise.allSettled(approvePromises);
      const createResults = await Promise.allSettled(createPromises);

      console.log('bulkRecordTransactions - 承認結果:', approveResults);
      console.log('bulkRecordTransactions - 作成結果:', createResults);

      const approveSuccessful = approveResults.filter(result => result.status === 'fulfilled').length;
      const createSuccessful = createResults.filter(result => result.status === 'fulfilled').length;

      const approveFailed = approveResults.filter(result => result.status === 'rejected').length;
      const createFailed = createResults.filter(result => result.status === 'rejected').length;

      const totalSuccessful = approveSuccessful + createSuccessful;
      const totalFailed = approveFailed + createFailed;

      // 失敗した取引のエラー情報をコンソールに出力
      approveResults.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`取引承認失敗(${index + 1}): `, result.reason);
          // 認証エラーの場合、ログインページにリダイレクト
          if (result.reason.message.includes('認証セッションが切れました')) {
            alert('認証セッションが切れました。ログインページにリダイレクトします。');
            navigate('/login');
            return;
          }
        }
      });

      createResults.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`新規取引作成失敗(${index + 1}): `, result.reason);
          // 認証エラーの場合、ログインページにリダイレクト
          if (result.reason.message.includes('認証セッションが切れました')) {
            alert('認証セッションが切れました。ログインページにリダイレクトします。');
            navigate('/login');
            return;
          }
        }
      });

      if (totalFailed > 0) {
        toast.error(`${totalSuccessful} 件の取引が記録されましたが、${totalFailed} 件に失敗しました。`, {
          id: 'transaction-registration',
          duration: 6000
        });
      } else {
        toast.success(`${totalSuccessful} 件の取引を登録しました。取引履歴から確認できます。`, {
          id: 'transaction-registration',
          duration: 6000
        });
      }

      // ローカル状態も更新
      setTransactions(prev => {
        const updatedTransactions = [...prev];
        for (let i = 0; i < updatedTransactions.length; i++) {
          // 承認された取引の更新
          if (existingTransactions.some(et => et.id === updatedTransactions[i].id)) {
            updatedTransactions[i] = { ...updatedTransactions[i], approval_status: 'approved' };
          }
        }
        // 新規作成された取引はローカルリストから削除
        return updatedTransactions.filter(t => !newTransactions.some(nt => nt.id === t.id));
      });

      // 選択状態をクリア
      setSelectedTransactions([]);

      // データの再取得を強制的に実行して、最近の履歴と取引履歴ページにデータを反映
      await fetchTransactions();
      console.log('bulkRecordTransactions - データ再取得完了');

      // ページ全体のデータ再取得をトリガーするカスタムイベントを発火
      window.dispatchEvent(new CustomEvent('transactionRecorded'));
      // 承認イベントを発火
      window.dispatchEvent(new CustomEvent('transactionApproved'));
    } catch (error) {
      console.error('取引の一括記録中にエラーが発生しました:', error);
      alert('取引の一括記録に失敗しました: ' + (error as Error).message);
    }
  };

  // 一括削除機能を追加
  const bulkDeleteTransactions = async () => {
    if (selectedTransactions.length === 0) {
      alert('削除する取引を選択してください');
      return;
    }

    if (!window.confirm(`${selectedTransactions.length} 件の取引を削除してもよろしいですか？`)) {
      return;
    }

    try {
      // 選択された取引を一括で削除
      const deletePromises = selectedTransactions.map(id => deleteTransaction(id));
      const results = await Promise.allSettled(deletePromises);

      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;

      // 失敗した取引のエラー情報をコンソールに出力
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`取引削除失敗(${index + 1}): `, result.reason);
        }
      });

      if (failed > 0) {
        alert(`${successful} 件の取引が正常に削除されましたが、${failed} 件の取引の削除に失敗しました。詳細はコンソールを確認してください。`);
      } else {
        alert(`${successful} 件の取引が正常に削除されました`);
      }

      // 成功した取引をローカルリストから削除
      setTransactions(prev => prev.filter(t => !selectedTransactions.includes(t.id)));
      setSelectedTransactions([]);

      // データの再取得
      await fetchTransactions();
    } catch (error) {
      console.error('取引の一括削除中にエラーが発生しました:', error);
      alert('取引の一括削除に失敗しました: ' + (error as Error).message);
    }
  };

  // 取引の選択状態を切り替え
  const toggleTransactionSelection = (id: string) => {
    setSelectedTransactions(prev =>
      prev.includes(id)
        ? prev.filter(tid => tid !== id)
        : [...prev, id]
    );
  };

  // 全取引の選択状態を切り替え
  const toggleAllTransactionsSelection = () => {
    if (selectedTransactions.length === transactions.length && transactions.length > 0) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(transactions.map(t => t.id));
    }
  };

  // const exportTransactions = () => {
  //   // 取引データをCSV形式でエクスポート
  //   const csvContent = [
  //     ['日付', '説明', '金額', 'カテゴリ', 'タイプ'],
  //     ...transactions.map(t => [
  //       t.date,
  //       `"${t.description}"`,
  //       t.amount.toString(),
  //       t.category,
  //       t.type
  //     ])
  //   ].map(row => row.join(',')).join('\n');

  //   const blob = new Blob(['\ufeff', csvContent], { type: 'text/csv;charset=utf-8;' });
  //   const url = URL.createObjectURL(blob);
  //   const link = document.createElement('a');
  //   link.setAttribute('href', url);
  //   link.setAttribute('download', `取引データ_${ new Date().toISOString().split('T')[0] }.csv`);
  //   link.style.visibility = 'hidden';
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // };

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center mb-6">
          <Link to="/dashboard" className="mr-4">
            <ArrowLeft className="w-6 h-6 text-text-muted hover:text-text-main" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-text-main">音声で記録</h1>
            <p className="text-text-muted">音声やチャットで簡単に取引を記録できます</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* 音声入力セクション */}
          <div className="lg:col-span-2 bg-surface rounded-xl shadow-sm border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-main">音声で記録</h2>
              <button
                onClick={isMobileUsageOpen ? () => setIsMobileUsageOpen(false) : () => setIsMobileUsageOpen(true)}
                className="lg:hidden flex items-center text-xs text-primary hover:text-primary/80 transition-colors bg-primary/10 px-3 py-1.5 rounded-full"
              >
                <Info className="w-3.5 h-3.5 mr-1.5" />
                使い方
                <ChevronDown className={`w-3.5 h-3.5 ml-1 transition-transform duration-200 ${isMobileUsageOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* モバイル用：使い方の折りたたみ表示 */}
            <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMobileUsageOpen ? 'max-h-[600px] opacity-100 mb-6' : 'max-h-0 opacity-0'}`}>
              <div className="bg-surface-highlight/30 rounded-xl p-4 border border-border/50">
                <h3 className="text-sm font-semibold text-text-main mb-3 flex items-center">
                  <Info className="w-4 h-4 mr-2 text-primary" />
                  音声記録の使い方
                </h3>
                <div className="space-y-3">
                  <div className="border border-border rounded-lg p-3 bg-surface">
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                        <span className="text-primary font-bold text-xs">1</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-text-main text-sm">音声記録開始</h3>
                        <p className="text-xs text-text-muted">マイクボタンをクリックして、取引内容を話してください。</p>
                      </div>
                    </div>
                  </div>
                  <div className="border border-border rounded-lg p-3 bg-surface">
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                        <span className="text-primary font-bold text-xs">2</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-text-main text-sm mb-1">日付選択</h3>
                        <p className="text-xs text-text-muted">必要に応じてカレンダーから日付を選択してください。</p>
                      </div>
                    </div>
                  </div>
                  <div className="border border-border rounded-lg p-3 bg-surface">
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                        <span className="text-primary font-bold text-xs">3</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-text-main text-sm mb-1">テキスト確認</h3>
                        <p className="text-xs text-text-muted">認識されたテキストを確認・編集してください。</p>
                      </div>
                    </div>
                  </div>
                  <div className="border border-border rounded-lg p-3 bg-surface">
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                        <span className="text-primary font-bold text-xs">4</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-text-main text-sm mb-1">カテゴリ選択</h3>
                        <p className="text-xs text-text-muted">未選択でもAIが自動認識しますが、選択した方が確実です。</p>
                      </div>
                    </div>
                  </div>
                  <div className="border border-border rounded-lg p-3 bg-surface">
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                        <span className="text-primary font-bold text-xs">5</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-text-main text-sm mb-1">取引に変換</h3>
                        <p className="text-xs text-text-muted">「取引に変換」ボタンをクリックして、取引を登録してください。</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4">


              <div className="flex items-center justify-center mb-4">
                <button
                  onClick={isListening ? stopListening : startListening}
                  disabled={!isSupported}
                  title={!isSupported ? "このブラウザは音声認識をサポートしていません" : ""}
                  className={`flex items-center justify-center w-16 h-16 rounded-full ${!isSupported
                    ? 'bg-gray-400 cursor-not-allowed'
                    : isListening
                      ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                      : 'bg-primary hover:bg-primary/90'
                    } text-white transition-colors shadow-lg shadow-primary/25`}
                >
                  {isListening ? (
                    <Square className="w-8 h-8 fill-current" />
                  ) : (
                    <Mic className="w-8 h-8" />
                  )}
                </button>
              </div>

              {/* エラーメッセージ表示 */}
              {errorMessage && (
                <div className="text-center mb-4">
                  <p className="text-sm text-red-500">{errorMessage}</p>
                </div>
              )}

              <div className="text-center mb-4">
                <p className="text-sm text-text-muted">
                  {isListening ? (
                    <span className="flex items-center justify-center">
                      <span className="flex h-3 w-3 mr-2">
                        <span className="animate-ping absolute h-3 w-3 rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative h-3 w-3 rounded-full bg-red-500"></span>
                      </span>
                      音声認識中... 話してください
                    </span>
                  ) : (
                    'マイクボタンをクリックして開始'
                  )}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-text-muted mb-2">日付</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-text-main focus:outline-none focus:ring-2 focus:ring-primary mb-4"
              />

              <label className="block text-sm font-medium text-text-muted mb-2">
                認識テキスト
                <span className="text-xs font-normal ml-2 text-primary">（例：5月2日 ランチ 1500円）</span>
              </label>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="音声認識されたテキストがここに表示されます..."
              />

              {/* カテゴリタグ */}
              <label className="block text-sm font-medium text-text-muted mt-3 mb-2">
                カテゴリ選択
                <span className="ml-2 text-xs text-primary font-normal">未選択でも認識可</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {STANDARD_CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors ${selectedCategory === category
                      ? 'bg-primary/20 border-primary text-primary'
                      : 'bg-surface-highlight text-text-main border-border hover:bg-surface-hover'
                      }`}
                  >
                    {category}
                  </button>
                ))}
                {selectedCategory && (
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-highlight text-text-muted border border-border hover:bg-surface-hover transition-colors"
                  >
                    クリア
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setTranscript('')}
                disabled={!transcript.trim()}
                className={`px-4 py-2 rounded-md transition-colors ${!transcript.trim()
                  ? 'bg-surface-highlight text-text-muted cursor-not-allowed'
                  : 'bg-gray-500 text-white hover:bg-gray-600'
                  }`}
              >
                クリア
              </button>
              <button
                onClick={processTranscript}
                disabled={!transcript.trim() || isProcessing}
                className={`flex items-center px-4 py-2 rounded-md transition-colors ${!transcript.trim() || isProcessing
                  ? 'bg-surface-highlight text-text-muted cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    処理中...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    取引に変換
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 使い方セクション */}
          <div className="hidden lg:block bg-surface rounded-xl shadow-sm border border-border p-4">
            <h2 className="text-md font-semibold text-text-main mb-3">使い方</h2>
            <div className="space-y-3">
              <div className="border border-border rounded-lg p-3">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                    <span className="text-primary font-bold text-xs">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-main group-hover:text-primary transition-colors">音声記録開始</h3>
                    <p className="text-xs text-text-muted">マイクボタンをクリックして、取引内容を話してください。</p>
                  </div>
                </div>
              </div>
              <div className="border border-border rounded-lg p-3">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                    <span className="text-primary font-bold text-xs">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-text-main text-sm mb-1">日付選択</h3>
                    <p className="text-xs text-text-muted">必要に応じてカレンダーから日付を選択してください。</p>
                  </div>
                </div>
              </div>
              <div className="border border-border rounded-lg p-3">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                    <span className="text-primary font-bold text-xs">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-text-main text-sm mb-1">テキスト確認</h3>
                    <p className="text-xs text-text-muted">認識されたテキストを確認・編集してください。</p>
                  </div>
                </div>
              </div>
              <div className="border border-border rounded-lg p-3">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                    <span className="text-primary font-bold text-xs">4</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-text-main text-sm mb-1">カテゴリ選択</h3>
                    <p className="text-xs text-text-muted">未選択でもAIが自動認識しますが、選択した方が確実です。</p>
                  </div>
                </div>
              </div>
              <div className="border border-border rounded-lg p-3">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                    <span className="text-primary font-bold text-xs">5</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-text-main text-sm mb-1">取引に変換</h3>
                    <p className="text-xs text-text-muted">「取引に変換」ボタンをクリックして、取引を登録してください。</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 取引一覧セクション */}
        <div className="bg-surface rounded-xl shadow-sm border border-border p-6 mb-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-text-main">取引一覧</h2>
            <p className="text-sm text-text-muted mt-1">
              内容を確認し、表の「登録」ボタンをクリックして記帳を確定してください。
            </p>
          </div>

          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <span className="flex items-center gap-1.5 text-sm font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20">
                <AlertCircle className="w-3.5 h-3.5" />
                {sortedTransactions.length}件の未完了取引
              </span>
              {selectedTransactions.length > 0 && (
                <span className="text-sm text-primary">
                  {selectedTransactions.length}件選択中
                </span>
              )}
            </div>
            <div className="flex space-x-2">
              {selectedTransactions.length > 0 && (
                <>
                  <button
                    onClick={bulkDeleteTransactions}
                    className="flex items-center px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    一括削除 ({selectedTransactions.length})
                  </button>
                  <button
                    onClick={bulkRecordTransactions}
                    className="flex items-center px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    一括承認 ({selectedTransactions.length})
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="block md:hidden space-y-4">
              {sortedTransactions.map((transaction) => (
                <div key={transaction.id} className="bg-surface p-3 rounded-lg shadow-sm border border-border">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center">
                      <button
                        onClick={() => toggleTransactionSelection(transaction.id)}
                        className="mr-3"
                        disabled={transaction.approval_status === 'approved'}
                      >
                        {selectedTransactions.includes(transaction.id) ? (
                          <CheckCircle className="w-5 h-5 text-primary" />
                        ) : (
                          <Circle className="w-5 h-5 text-text-muted" />
                        )}
                      </button>
                      <div>
                        <div className="font-medium text-text-main">
                          {editingId === transaction.id ? (
                            <input
                              type="text"
                              value={editData.description !== undefined ? editData.description : transaction.description}
                              onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                              className="w-full px-2 py-1 bg-background border border-border rounded text-sm text-text-main"
                            />
                          ) : (
                            transaction.description
                          )}
                        </div>
                        <div className="text-sm text-text-muted mt-1">
                          {editingId === transaction.id ? (
                            <input
                              type="date"
                              value={editData.date || transaction.date}
                              onChange={(e) => setEditData(prev => ({ ...prev, date: e.target.value }))}
                              className="w-full px-2 py-1 bg-background border border-border rounded text-sm text-text-main"
                            />
                          ) : (
                            transaction.date
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {editingId === transaction.id ? (
                        <input
                          type="number"
                          value={editData.amount || transaction.amount}
                          onChange={(e) => setEditData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                          className="w-24 px-2 py-1 bg-background border border-border rounded text-sm text-text-main text-right"
                        />
                      ) : (
                        <span className={`font-medium ${transaction.type === 'income' ? 'text-green-500' : 'text-text-main'}`}>
                          {transaction.type === 'income' ? '+' : '-'}¥{transaction.amount.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-border">
                    <div className="text-sm">
                      {editingId === transaction.id ? (
                        <select
                          value={editData.category || transaction.category}
                          onChange={(e) => setEditData(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full px-2 py-1 bg-background border border-border rounded text-sm text-text-main"
                        >
                          {STANDARD_CATEGORIES.map(category => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                          <option value="未分類">未分類</option>
                        </select>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-highlight text-gray-300 border border-white/5">
                          {transaction.category}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2.5">
                      {editingId === transaction.id ? (
                        <button
                          onClick={handleSave}
                          className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-md active:scale-95"
                        >
                          <Save className="w-5 h-5" />
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => recordTransaction(transaction)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md active:scale-95 ${transaction.approval_status === 'approved'
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                              : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white'
                              }`}
                            disabled={transaction.approval_status === 'approved'}
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleEdit(transaction)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md active:scale-95 ${transaction.approval_status === 'approved'
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                              : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'
                              }`}
                            disabled={transaction.approval_status === 'approved'}
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(transaction.id)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md active:scale-95 ${transaction.approval_status === 'approved'
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                              : 'bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white'
                              }`}
                            disabled={transaction.approval_status === 'approved'}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden md:block">
              <table className="w-full">
                <thead className="bg-surface-highlight">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                      <button
                        onClick={toggleAllTransactionsSelection}
                        className="flex items-center"
                      >
                        {selectedTransactions.length === transactions.length && transactions.length > 0 ? (
                          <CheckCircle className="w-4 h-4 text-primary" />
                        ) : (
                          <Circle className="w-4 h-4 text-text-muted" />
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                      <button
                        className="flex items-center gap-1 hover:text-text-main transition-colors"
                        onClick={() => handleSort('date')}
                      >
                        日付
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">説明</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">金額</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">カテゴリ</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-surface divide-y divide-border">
                  {sortedTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-surface-highlight transition-colors">
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => toggleTransactionSelection(transaction.id)}
                          className="flex items-center"
                          disabled={transaction.approval_status === 'approved'}
                        >
                          {selectedTransactions.includes(transaction.id) ? (
                            <CheckCircle className="w-5 h-5 text-primary" />
                          ) : (
                            <Circle className="w-5 h-5 text-text-muted" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-main">
                        {editingId === transaction.id ? (
                          <input
                            type="date"
                            value={editData.date || transaction.date}
                            onChange={(e) => setEditData(prev => ({ ...prev, date: e.target.value }))}
                            className="w-full px-2 py-1 bg-background border border-border rounded text-sm text-text-main"
                          />
                        ) : (
                          transaction.date
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-main max-w-xs">
                        {editingId === transaction.id ? (
                          <input
                            type="text"
                            value={editData.description !== undefined ? editData.description : transaction.description}
                            onChange={(e) => {
                              console.log('説明入力変更:', e.target.value, 'editData:', editData);
                              setEditData(prev => ({ ...prev, description: e.target.value }));
                            }}
                            className="w-full px-2 py-1 bg-background border border-border rounded text-sm text-text-main"
                          />
                        ) : (
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <TransactionIcon item={transaction.description || ''} category={transaction.category || ''} size="sm" />
                              <span>{transaction.description}</span>
                            </div>
                            {dbTransactions && findPotentialDuplicates(transaction as any, dbTransactions).length > 0 && (
                              <div className="flex items-center gap-1">
                                <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                                  <Info className="w-3 h-3" />
                                  重複の可能性
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-main">
                        {editingId === transaction.id ? (
                          <input
                            type="number"
                            value={editData.amount || transaction.amount}
                            onChange={(e) => setEditData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                            className="w-full px-2 py-1 bg-background border border-border rounded text-sm text-text-main"
                          />
                        ) : (
                          <span className={transaction.type === 'income' ? 'text-green-500' : 'text-text-main'}>
                            {transaction.type === 'income' ? '+' : '-'}¥{transaction.amount.toLocaleString()}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-main">
                        {editingId === transaction.id ? (
                          <select
                            value={editData.category || transaction.category}
                            onChange={(e) => setEditData(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full px-2 py-1 bg-background border border-border rounded text-sm text-text-main"
                          >
                            {STANDARD_CATEGORIES.map(category => (
                              <option key={category} value={category}>{category}</option>
                            ))}
                            <option value="未分類">未分類</option>
                          </select>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-highlight text-text-main border border-border whitespace-nowrap">
                            {transaction.category}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {editingId === transaction.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={handleSave}
                              className="p-2 bg-green-500/10 text-green-600 rounded-lg hover:bg-green-500 hover:text-white transition-all shadow-sm flex items-center gap-1 text-xs whitespace-nowrap"
                            >
                              <Save className="w-4 h-4" />
                              保存
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => recordTransaction(transaction)}
                              className={`p-2 rounded-lg transition-all shadow-sm flex items-center gap-1 text-xs whitespace-nowrap ${transaction.approval_status === 'approved'
                                ? 'bg-surface-highlight text-text-muted cursor-not-allowed shadow-none'
                                : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white'
                                }`}
                              disabled={transaction.approval_status === 'approved'}
                            >
                              <CheckCircle className="w-4 h-4" />
                              登録
                            </button>
                            <button
                              onClick={() => handleEdit(transaction)}
                              className={`p-2 rounded-lg transition-all shadow-sm flex items-center gap-1 text-xs whitespace-nowrap ${transaction.approval_status === 'approved'
                                ? 'bg-surface-highlight text-text-muted cursor-not-allowed shadow-none'
                                : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'
                                }`}
                              disabled={transaction.approval_status === 'approved'}
                            >
                              <Edit className="w-4 h-4" />
                              編集
                            </button>
                            <button
                              onClick={() => handleDelete(transaction.id)}
                              className={`p-2 rounded-lg transition-all shadow-sm flex items-center gap-1 text-xs whitespace-nowrap ${transaction.approval_status === 'approved'
                                ? 'bg-surface-highlight text-text-muted cursor-not-allowed shadow-none'
                                : 'bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white'
                                }`}
                              disabled={transaction.approval_status === 'approved'}
                            >
                              <Trash2 className="w-4 h-4" />
                              削除
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {transactions.filter(transaction => transaction.approval_status !== 'approved').length === 0 && (
              <div className="text-center py-8 text-text-muted">
                <p>まだ取引がありません</p>
                <p className="text-sm mt-2">音声入力で取引を追加してください</p>
              </div>
            )}
          </div>
        </div>
      </main >
    </div >
  );
};

export default ChatToBook;