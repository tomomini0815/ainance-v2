import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mic, Square, Send, Trash2, Download, Plus, Edit3, Save, CheckCircle, Circle } from 'lucide-react';
import { useTransactions } from '../hooks/useTransactions';
import { useBusinessType } from '../hooks/useBusinessType';
import { useAuth } from '../hooks/useAuth';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  created_at?: string;
  updated_at?: string;
}

const ChatToBook: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Transaction>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [approvedTransactions, setApprovedTransactions] = useState<string[]>([]); // 承認された取引のIDを管理
  const recognitionRef = useRef<any>(null);
  const { user } = useAuth();
  const { currentBusinessType } = useBusinessType(user?.id);
  // currentBusinessType?.business_typeを明示的に渡す
  const { transactions: dbTransactions, createTransaction, updateTransaction, deleteTransaction, loading, fetchTransactions } = useTransactions(user?.id, currentBusinessType?.business_type);
  const navigate = useNavigate();

  // 音声認識の初期化
  useEffect(() => {
    // Web Speech APIのチェック
    if (!('webkitSpeechRecognition' in window)) {
      console.log('Web Speech API is not supported in this browser.');
      return;
    }

    // @ts-ignore
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true; // 連続認識をオン
    recognition.interimResults = true;
    recognition.lang = 'ja-JP';

    let lastResultIndex = 0;

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      
      // 前回の結果以降の新しい結果のみを処理
      for (let i = lastResultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        }
      }
      
      // 最終結果がある場合のみ更新
      if (finalTranscript) {
        setTranscript(prev => prev + finalTranscript);
      }
      
      // 最後の結果インデックスを更新
      lastResultIndex = event.results.length;
    };

    recognition.onerror = (event: any) => {
      console.error('音声認識エラー:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      // 自動再開機能を追加
      if (isListening) {
        try {
          lastResultIndex = 0; // 再開時にインデックスをリセット
          recognition.start();
        } catch (error) {
          console.error('音声認識の再開に失敗:', error);
          setIsListening(false);
        }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening]); // isListeningを依存配列に追加

  // DBから取引データを取得
  useEffect(() => {
    // DBから取得した取引データのみを表示（ローカルの一時データは除外）
    // ただし、一括記録後に再取得されたデータはローカルリストに追加しない
    setTransactions(prev => {
      // DBから取得した取引のIDリスト
      const dbTransactionIds = dbTransactions.map((t: any) => t.id);
      
      // ローカルの一時データ（DBにまだ保存されていないデータ）のみをフィルタリング
      // ただし、一括承認済みのデータは除外する
      const localTempData = prev.filter(t => !dbTransactionIds.includes(t.id) && !approvedTransactions.includes(t.id));
      
      // DBから取得したデータとローカルの一時データを結合
      // ただし、承認された取引は除外する
      const mergedTransactions = [
        ...dbTransactions.filter((t: any) => !approvedTransactions.includes(t.id)).map((t: any) => ({
          id: t.id,
          date: t.date,
          description: t.description || t.item || '',
          amount: t.amount,
          category: t.category,
          type: t.type as 'income' | 'expense',
          created_at: t.created_at,
          updated_at: t.updated_at
        })),
        ...localTempData
      ];
      
      return mergedTransactions;
    });
  }, [dbTransactions, approvedTransactions]);

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // 音声テキストから取引情報を抽出
  const extractTransactionData = (text: string) => {
    // 金額を抽出（数字に万、千などの単位がつく場合も考慮）
    const amountPattern = /(\d+(?:万)?(?:千)?(?:円)?)/g;
    const amounts = text.match(amountPattern);

    // TransactionForm.tsxのカテゴリオプションを参考にカテゴリマッピングを作成
    const categoryMapping: Array<{ keywords: string[]; category: string; type: 'income' | 'expense'; priority: number }> = [
      // 収入系（高優先度）
      { keywords: ['売上'], category: '業務委託収入', type: 'income', priority: 10 },
      { keywords: ['給与'], category: '給与', type: 'income', priority: 9 },

      // 支出系（高優先度 - 消耗品費、接待交際費）
      { keywords: ['消耗品', '文具', 'コピー', 'オフィス用品'], category: '消耗品費', type: 'expense', priority: 10 },
      { keywords: ['接待', '会食', '食事', 'ディナー', 'ランチ'], category: '接待交際費', type: 'expense', priority: 9 },
      
      // 支出系（中優先度）
      { keywords: ['交通費', '電車', 'バス', 'タクシー'], category: '旅費交通費', type: 'expense', priority: 7 },
      { keywords: ['食費', 'ランチ', 'ディナー', 'コーヒー'], category: '食費', type: 'expense', priority: 6 },
      { keywords: ['通信費', '電話料金'], category: '通信費', type: 'expense', priority: 5 },
      { keywords: ['光熱費', '電気', 'ガス', '水道'], category: '水道光熱費', type: 'expense', priority: 5 },
      { keywords: ['修繕', '修理'], category: '修繕費', type: 'expense', priority: 4 },
      { keywords: ['保険'], category: '保険料', type: 'expense', priority: 4 },
      { keywords: ['手数料'], category: '支払手数料', type: 'expense', priority: 4 },
      { keywords: ['新聞', '図書'], category: '新聞図書費', type: 'expense', priority: 3 },
      { keywords: ['外注'], category: '外注費', type: 'expense', priority: 3 },
      { keywords: ['税金'], category: '租税公課', type: 'expense', priority: 3 },
      { keywords: ['広告', '宣伝'], category: '広告宣伝費', type: 'expense', priority: 2 },
      { keywords: ['地代', '家賃'], category: '地代家賃', type: 'expense', priority: 2 },

      // 低優先度（デフォルト）
      { keywords: ['費用', '費'], category: '雑費', type: 'expense', priority: 1 }
    ];

    let detectedCategory = '雑費'; // デフォルトカテゴリ
    let detectedType: 'income' | 'expense' = 'expense';
    let maxPriority = 0;

    // カテゴリを検出
    for (const mapping of categoryMapping) {
      for (const keyword of mapping.keywords) {
        if (text.includes(keyword) && mapping.priority > maxPriority) {
          detectedCategory = mapping.category;
          detectedType = mapping.type;
          maxPriority = mapping.priority;
        }
      }
    }

    // 金額を数値に変換
    let amount = 0;
    if (amounts && amounts.length > 0) {
      const amountText = amounts[0];
      // 「万円」や「千円」の処理
      if (amountText.includes('万')) {
        const number = parseFloat(amountText.replace('万', ''));
        amount = isNaN(number) ? 0 : number * 10000;
      } else if (amountText.includes('千')) {
        const number = parseFloat(amountText.replace('千', ''));
        amount = isNaN(number) ? 0 : number * 1000;
      } else {
        amount = parseFloat(amountText.replace(/[^\d]/g, '')) || 0;
      }
    }

    // 日付の処理（今日の日付をデフォルトとする）
    const today = new Date().toISOString().split('T')[0];

    return {
      date: today,
      description: text,
      amount,
      category: detectedCategory,
      type: detectedType
    };
  };

  const processTranscript = () => {
    if (!transcript.trim()) return;

    setIsProcessing(true);

    // 実際のアプリケーションでは、AIやルールベースの処理で取引情報を抽出
    // ここでは簡略化のためにクライアント側で処理
    setTimeout(() => {
      const transactionData = extractTransactionData(transcript);

      // UUID v4 を生成する関数
      const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      };

      const newTransaction: Transaction = {
        id: generateUUID(),
        ...transactionData
      };

      setTransactions(prev => [newTransaction, ...prev]);
      // 処理後にテキストをクリアして重複を防ぐ
      setTranscript('');
      setIsProcessing(false);
    }, 1000);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingId(transaction.id);
    setEditData(transaction);
  };

  const handleSave = async () => {
    if (editingId && editData) {
      try {
        // DBの取引を更新
        const result = await updateTransaction(editingId, {
          date: editData.date || '',
          item: editData.description || '',
          amount: editData.amount || 0,
          category: editData.category || '未分類',
          type: editData.type || 'expense'
        });

        if (result.error) {
          throw result.error;
        }

        // ローカル状態も更新
        setTransactions(prev =>
          prev.map(t => t.id === editingId ? { ...t, ...editData } as Transaction : t)
        );
        setEditingId(null);
        setEditData({});
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

  // 取引をDBに保存する関数
  const saveTransactionToDB = async (transaction: Transaction): Promise<{ id: string; tempId: string } | null> => {
    console.log('saveTransactionToDB - 取引データ:', transaction);
    try {
      // tempIdを保存（ローカルリストから削除する際に使用）
      const tempId = transaction.id;
      
      // Supabaseに保存するデータを準備（idフィールドを除外）
      const { id, ...transactionData } = transaction;
      
      // descriptionから「〇〇円」を削除
      const cleanedDescription = transactionData.description.replace(/(\d+(?:万)?(?:千)?(?:円)?)/g, '').trim();
      
      console.log('saveTransactionToDB - 保存するデータ:', transactionData);
      
      // useTransactionsフックのcreateTransaction関数を使用して取引を保存
      const result = await createTransaction({
        ...transactionData,
        item: cleanedDescription,
        type: transactionData.type,
        creator: user?.id || '00000000-0000-0000-0000-000000000000'
      });
      console.log('saveTransactionToDB - 保存結果:', result);
      
      if (result.data) {
        // 保存成功時にtempIdと新しいIDを返す
        return { id: result.data.id, tempId };
      } else {
        console.error('saveTransactionToDB - 保存失敗:', result.error);
        return null;
      }
    } catch (error) {
      console.error('saveTransactionToDB - エラー:', error);
      return null;
    }
  };

  // 単一の取引を記録
  const recordTransaction = async (transaction: Transaction) => {
    try {
      console.log('recordTransaction - 開始:', transaction);
      const savedTransaction = await saveTransactionToDB(transaction);
      console.log('recordTransaction - 保存された取引:', savedTransaction);
      // 成功したらローカルリストから削除し、承認された取引のIDを追加
      if (savedTransaction) {
        setTransactions(prev => prev.filter(t => t.id !== transaction.id));
        setApprovedTransactions(prev => [...prev, savedTransaction.tempId]);
        console.log('recordTransaction - ローカルリストから削除し、承認された取引のIDを追加しました');
      }
      
      // データの再取得
      await fetchTransactions();
      console.log('recordTransaction - データ再取得完了');
      
      alert('取引が正常に記録されました');
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

  // 複数の取引を一括記録
  const bulkRecordTransactions = async () => {
    const selectedItems = transactions.filter(t => selectedTransactions.includes(t.id));

    console.log('bulkRecordTransactions - 選択された取引:', selectedItems);

    if (selectedItems.length === 0) {
      alert('記録する取引を選択してください');
      return;
    }

    try {
      // 選択された取引を一括で保存
      const savePromises = selectedItems.map(transaction => saveTransactionToDB(transaction));
      const results = await Promise.allSettled(savePromises);

      console.log('bulkRecordTransactions - 保存結果:', results);

      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;

      // 失敗した取引のエラー情報をコンソールに出力
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`取引記録失敗 (${index + 1}):`, result.reason);
          // 認証エラーの場合、ログインページにリダイレクト
          if (result.reason.message.includes('認証セッションが切れました')) {
            alert('認証セッションが切れました。ログインページにリダイレクトします。');
            navigate('/login');
            return;
          }
        }
      });

      if (failed > 0) {
        alert(`${successful}件の取引が正常に記録されましたが、${failed}件の取引の記録に失敗しました。詳細はコンソールを確認してください。`);
      } else {
        alert(`${successful}件の取引が正常に記録されました`);
      }

      // 成功した取引のtempIdを取得
      const successfulTempIds: string[] = results
        .filter((result): result is PromiseFulfilledResult<{ id: string; tempId: string } | null> => result.status === 'fulfilled')
        .map(result => result.value?.tempId)
        .filter((tempId): tempId is string => tempId !== undefined);

      console.log('bulkRecordTransactions - 成功した取引tempId:', successfulTempIds);
      console.log('bulkRecordTransactions - 選択された取引ID:', selectedItems.map(t => t.id));

      // 成功した取引をローカルリストから削除
      setTransactions(prev => prev.filter(t => !selectedItems.some(item => item.id === t.id)));
      setSelectedTransactions(prev => prev.filter(id => !selectedItems.some(item => item.id === id)));
      // 承認された取引のIDを追加
      setApprovedTransactions(prev => [...prev, ...successfulTempIds]);
      
      // データの再取得を強制的に実行して、最近の履歴と取引履歴ページにデータを反映
      await fetchTransactions();
      console.log('bulkRecordTransactions - データ再取得完了');
      
      // ページ全体のデータ再取得をトリガーするカスタムイベントを発火
      window.dispatchEvent(new CustomEvent('transactionRecorded'));
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

    if (!window.confirm(`${selectedTransactions.length}件の取引を削除してもよろしいですか？`)) {
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
          console.error(`取引削除失敗 (${index + 1}):`, result.reason);
        }
      });

      if (failed > 0) {
        alert(`${successful}件の取引が正常に削除されましたが、${failed}件の取引の削除に失敗しました。詳細はコンソールを確認してください。`);
      } else {
        alert(`${successful}件の取引が正常に削除されました`);
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

  const exportTransactions = () => {
    // 取引データをCSV形式でエクスポート
    const csvContent = [
      ['日付', '説明', '金額', 'カテゴリ', 'タイプ'],
      ...transactions.map(t => [
        t.date,
        `"${t.description}"`,
        t.amount.toString(),
        t.category,
        t.type
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob(['\ufeff', csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `取引データ_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center mb-6">
          <Link to="/dashboard" className="mr-4">
            <ArrowLeft className="w-6 h-6 text-text-muted hover:text-text-main" />
          </Link>
          <h1 className="text-2xl font-bold text-text-main">CHAT-TO-BOOK</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
            <h2 className="text-lg font-semibold text-text-main mb-4">音声入力</h2>

            <div className="mb-4">
              <div className="flex items-center justify-center mb-4">
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`flex items-center justify-center w-16 h-16 rounded-full ${isListening
                      ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                      : 'bg-primary hover:bg-primary/90'
                    } text-white transition-colors shadow-lg shadow-primary/25`}
                >
                  {isListening ? (
                    <Square className="w-8 h-8" />
                  ) : (
                    <Mic className="w-8 h-8" />
                  )}
                </button>
              </div>

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
              <label className="block text-sm font-medium text-text-muted mb-2">認識テキスト</label>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="音声認識されたテキストがここに表示されます..."
              />
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

          <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
            <h2 className="text-lg font-semibold text-text-main mb-4">取引一覧</h2>

            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <p className="text-sm text-text-muted">
                  {transactions.length}件の取引
                </p>
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">日付</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">説明</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">金額</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">カテゴリ</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-surface divide-y divide-border">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className={approvedTransactions.includes(transaction.id) ? 'opacity-50' : ''}>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => toggleTransactionSelection(transaction.id)}
                          className="flex items-center"
                          disabled={approvedTransactions.includes(transaction.id)}
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
                            value={editData.description || transaction.description}
                            onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full px-2 py-1 bg-background border border-border rounded text-sm text-text-main"
                          />
                        ) : (
                          transaction.description
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
                          <span className={transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}>
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
                            <option value="売上">売上</option>
                            <option value="給与">給与</option>
                            <option value="交通費">交通費</option>
                            <option value="食費">食費</option>
                            <option value="消耗品費">消耗品費</option>
                            <option value="接待交際費">接待交際費</option>
                            <option value="通信費">通信費</option>
                            <option value="水道光熱費">水道光熱費</option>
                            <option value="雑費">雑費</option>
                            <option value="未分類">未分類</option>
                          </select>
                        ) : (
                          transaction.category
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {editingId === transaction.id ? (
                          <button
                            onClick={handleSave}
                            className="text-green-500 hover:text-green-600 mr-2"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => recordTransaction(transaction)}
                              className={`mr-2 ${approvedTransactions.includes(transaction.id) ? 'text-gray-400 cursor-not-allowed' : 'text-green-500 hover:text-green-600'}`}
                              disabled={approvedTransactions.includes(transaction.id)}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(transaction)}
                              className={`mr-2 ${approvedTransactions.includes(transaction.id) ? 'text-gray-400 cursor-not-allowed' : 'text-primary hover:text-primary/80'}`}
                              disabled={approvedTransactions.includes(transaction.id)}
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(transaction.id)}
                              className={approvedTransactions.includes(transaction.id) ? 'text-gray-400 cursor-not-allowed' : 'text-red-500 hover:text-red-600'}
                              disabled={approvedTransactions.includes(transaction.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {transactions.filter(transaction => !approvedTransactions.includes(transaction.id)).length === 0 && (
                <div className="text-center py-8 text-text-muted">
                  <p>まだ取引がありません</p>
                  <p className="text-sm mt-2">音声入力で取引を追加してください</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
          <h2 className="text-lg font-semibold text-text-main mb-4">使い方</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="border border-border rounded-lg p-4">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                <span className="text-primary font-bold">1</span>
              </div>
              <h3 className="font-medium text-text-main mb-2">音声入力開始</h3>
              <p className="text-sm text-text-muted">マイクボタンをクリックして、取引内容を話してください。</p>
            </div>
            <div className="border border-border rounded-lg p-4">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                <span className="text-primary font-bold">2</span>
              </div>
              <h3 className="font-medium text-text-main mb-2">テキスト確認</h3>
              <p className="text-sm text-text-muted">認識されたテキストを確認・編集してください。</p>
            </div>
            <div className="border border-border rounded-lg p-4">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                <span className="text-primary font-bold">3</span>
              </div>
              <h3 className="font-medium text-text-main mb-2">取引に変換</h3>
              <p className="text-sm text-text-muted">「取引に変換」ボタンをクリックして、取引を登録してください。</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatToBook;