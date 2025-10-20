import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mic, Square, Send, Trash2, Download, Plus, Edit3, Save, CheckCircle, Circle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useMySQLTransactions } from '../hooks/useMySQLTransactions';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
}

const ChatToBook: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Transaction>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const recognitionRef = useRef<any>(null);
  const { createTransaction } = useMySQLTransactions();

  // 音声認識の初期化
  useEffect(() => {
    // Web Speech APIのチェック
    if (!('webkitSpeechRecognition' in window)) {
      console.log('Web Speech API is not supported in this browser.');
      return;
    }

    // @ts-ignore
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false; // 連続認識をオフに変更
    recognition.interimResults = true;
    recognition.lang = 'ja-JP';

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          setTranscript(prev => prev + transcript + ' ');
        } else {
          interimTranscript += transcript;
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error('音声認識エラー:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      // 自動再開を削除し、状態のみ更新
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

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
    
    // カテゴリマッピング（優先順位付き）
    const categoryMapping: Array<{ keywords: string[]; category: string; type: 'income' | 'expense'; priority: number }> = [
      // 収入系（高優先度）
      { keywords: ['売上'], category: '売上', type: 'income', priority: 10 },
      { keywords: ['給与'], category: '給与', type: 'income', priority: 9 },
      
      // 支出系（中優先度）
      { keywords: ['交通費', '電車', 'バス', 'タクシー'], category: '交通費', type: 'expense', priority: 7 },
      { keywords: ['食費', 'ランチ', 'ディナー', 'コーヒー'], category: '食費', type: 'expense', priority: 6 },
      { keywords: ['消耗品', '文具', 'コピー'], category: '消耗品費', type: 'expense', priority: 5 },
      { keywords: ['接待', '会食'], category: '接待交際費', type: 'expense', priority: 5 },
      { keywords: ['通信費', '電話料金'], category: '通信費', type: 'expense', priority: 4 },
      { keywords: ['光熱費', '電気', 'ガス', '水道'], category: '水道光熱費', type: 'expense', priority: 4 },
      
      // 低優先度（デフォルト）
      { keywords: ['費用', '費'], category: '雑費', type: 'expense', priority: 1 }
    ];
    
    let detectedCategory = '未分類';
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
      
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        ...transactionData
      };
      
      setTransactions(prev => [newTransaction, ...prev]);
      setTranscript('');
      setIsProcessing(false);
    }, 1000);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingId(transaction.id);
    setEditData(transaction);
  };

  const handleSave = () => {
    if (editingId && editData) {
      setTransactions(prev => 
        prev.map(t => t.id === editingId ? { ...t, ...editData } as Transaction : t)
      );
      setEditingId(null);
      setEditData({});
    }
  };

  const handleDelete = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    // 選択済みリストからも削除
    setSelectedTransactions(prev => prev.filter(tid => tid !== id));
  };

  // 取引をデータベースに保存
  const saveTransactionToDB = async (transaction: Transaction) => {
    try {
      // ログインユーザーの取得
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      // 認証エラーのチェック
      if (authError) {
        throw new Error(`認証エラー: ${authError.message}`);
      }
      
      // ユーザーがログインしていない場合
      if (!user) {
        throw new Error('ユーザーがログインしていません。ログインしてください。');
      }
      
      // Supabaseに保存するデータの準備
      const transactionData = {
        item: transaction.description,
        amount: transaction.amount,
        date: transaction.date,
        category: transaction.category,
        type: transaction.type,
        description: transaction.description,
        creator: user.id
      };

      // useMySQLTransactionsフックのcreateTransaction関数を使用して取引を保存
      const transactionId = await createTransaction(transactionData);
      
      return transactionId;
    } catch (error: any) {
      console.error('取引の保存中にエラーが発生しました:', error);
      // ネットワークエラーの場合、より具体的なメッセージを表示
      if (error.message.includes('Failed to fetch')) {
        throw new Error('ネットワークエラーが発生しました。インターネット接続を確認してください。');
      }
      // 認証エラーの場合、ユーザーに再ログインを促す
      if (error.message.includes('Auth session missing')) {
        throw new Error('認証セッションが切れました。再度ログインしてください。');
      }
      throw error;
    }
  };

  // 単一の取引を記録
  const recordTransaction = async (transaction: Transaction) => {
    try {
      await saveTransactionToDB(transaction);
      // 成功したらローカルリストから削除
      setTransactions(prev => prev.filter(t => t.id !== transaction.id));
      alert('取引が正常に記録されました');
    } catch (error) {
      alert('取引の記録に失敗しました: ' + (error as Error).message);
    }
  };

  // 複数の取引を一括記録
  const bulkRecordTransactions = async () => {
    const selectedItems = transactions.filter(t => selectedTransactions.includes(t.id));
    
    if (selectedItems.length === 0) {
      alert('記録する取引を選択してください');
      return;
    }
    
    try {
      // 選択された取引を一括で保存
      const savePromises = selectedItems.map(transaction => saveTransactionToDB(transaction));
      const results = await Promise.allSettled(savePromises);
      
      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;
      
      // 失敗した取引のエラー情報をコンソールに出力
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`取引記録失敗 (${index + 1}):`, result.reason);
        }
      });
      
      if (failed > 0) {
        alert(`${successful}件の取引が正常に記録されましたが、${failed}件の取引の記録に失敗しました。詳細はコンソールを確認してください。`);
      } else {
        alert(`${successful}件の取引が正常に記録されました`);
      }
      
      // 成功した取引のIDを取得
      const successfulIds = results
        .map((result, index) => ({ result, index }))
        .filter(({ result }) => result.status === 'fulfilled')
        .map(({ index }) => selectedItems[index].id);
      
      // 成功した取引をローカルリストから削除
      setTransactions(prev => prev.filter(t => !successfulIds.includes(t.id)));
      setSelectedTransactions(prev => prev.filter(id => !successfulIds.includes(id)));
    } catch (error) {
      console.error('取引の一括記録中にエラーが発生しました:', error);
      alert('取引の一括記録に失敗しました: ' + (error as Error).message);
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
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center mb-6">
          <Link to="/dashboard" className="mr-4">
            <ArrowLeft className="w-6 h-6 text-gray-600 hover:text-gray-900" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">CHAT-TO-BOOK</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">音声入力</h2>
            
            <div className="mb-4">
              <div className="flex items-center justify-center mb-4">
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`flex items-center justify-center w-16 h-16 rounded-full ${
                    isListening 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-blue-500 hover:bg-blue-600'
                  } text-white transition-colors`}
                >
                  {isListening ? (
                    <Square className="w-8 h-8" />
                  ) : (
                    <Mic className="w-8 h-8" />
                  )}
                </button>
              </div>
              
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600">
                  {isListening ? '音声認識中...' : 'マイクボタンをクリックして開始'}
                </p>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">認識テキスト</label>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="音声認識されたテキストがここに表示されます..."
              />
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={processTranscript}
                disabled={!transcript.trim() || isProcessing}
                className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                  !transcript.trim() || isProcessing
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
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
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">取引一覧</h2>
            
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <p className="text-sm text-gray-600">
                  {transactions.length}件の取引
                </p>
                {selectedTransactions.length > 0 && (
                  <span className="text-sm text-blue-600">
                    {selectedTransactions.length}件選択中
                  </span>
                )}
              </div>
              <div className="flex space-x-2">
                {selectedTransactions.length > 0 && (
                  <button
                    onClick={bulkRecordTransactions}
                    className="flex items-center px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    一括記録 ({selectedTransactions.length})
                  </button>
                )}
                <button
                  onClick={exportTransactions}
                  disabled={transactions.length === 0}
                  className={`flex items-center px-3 py-1 rounded-md text-sm transition-colors ${
                    transactions.length === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <Download className="w-4 h-4 mr-1" />
                  CSVエクスポート
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button 
                        onClick={toggleAllTransactionsSelection}
                        className="flex items-center"
                      >
                        {selectedTransactions.length === transactions.length && transactions.length > 0 ? (
                          <CheckCircle className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日付</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">説明</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">金額</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">カテゴリ</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-4 py-3 text-sm">
                        <button 
                          onClick={() => toggleTransactionSelection(transaction.id)}
                          className="flex items-center"
                        >
                          {selectedTransactions.includes(transaction.id) ? (
                            <CheckCircle className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {editingId === transaction.id ? (
                          <input
                            type="date"
                            value={editData.date || transaction.date}
                            onChange={(e) => setEditData(prev => ({ ...prev, date: e.target.value }))}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        ) : (
                          transaction.date
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 max-w-xs">
                        {editingId === transaction.id ? (
                          <input
                            type="text"
                            value={editData.description || transaction.description}
                            onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        ) : (
                          transaction.description
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {editingId === transaction.id ? (
                          <input
                            type="number"
                            value={editData.amount || transaction.amount}
                            onChange={(e) => setEditData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        ) : (
                          <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                            {transaction.type === 'income' ? '+' : '-'}¥{transaction.amount.toLocaleString()}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {editingId === transaction.id ? (
                          <select
                            value={editData.category || transaction.category}
                            onChange={(e) => setEditData(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
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
                            className="text-green-600 hover:text-green-900 mr-2"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => recordTransaction(transaction)}
                              className="text-green-600 hover:text-green-900 mr-2"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(transaction)}
                              className="text-blue-600 hover:text-blue-900 mr-2"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(transaction.id)}
                              className="text-red-600 hover:text-red-900"
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
              
              {transactions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>まだ取引がありません</p>
                  <p className="text-sm mt-2">音声入力で取引を追加してください</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">使い方</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">音声入力開始</h3>
              <p className="text-sm text-gray-600">マイクボタンをクリックして、取引内容を話してください。</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">テキスト確認</h3>
              <p className="text-sm text-gray-600">認識されたテキストを確認・編集してください。</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">取引に変換</h3>
              <p className="text-sm text-gray-600">「取引に変換」ボタンをクリックして、取引を登録してください。</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatToBook;