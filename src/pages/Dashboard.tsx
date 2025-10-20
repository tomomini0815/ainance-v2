import React, { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import QuickActions from '../components/QuickActions'
import RevenueChart from '../components/RevenueChart'
import ExpenseChart from '../components/ExpenseChart'
import TransactionTable from '../components/TransactionTable'
import AITransactionTable from '../components/AITransactionTable'
import TransactionForm from '../components/TransactionForm'
import { ChevronRight, Plus } from 'lucide-react'
import { useMySQLTransactions } from '../hooks/useMySQLTransactions'
import { useMySQLAITransactions } from '../hooks/useMySQLAITransactions'
import { useAuth } from '../hooks/useAuth'

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { transactions, loading: transactionsLoading, createTransaction } = useMySQLTransactions();
  const { aiTransactions, loading: aiTransactionsLoading } = useMySQLAITransactions();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { isAuthenticated, user: authUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Dashboard: ページが読み込まれました');
    console.log('Dashboard: 認証状態', { isAuthenticated, authUser, authLoading });
    
    // 認証状態の確認
    if (authLoading) {
      console.log('Dashboard: 認証状態を確認中...');
      return;
    }
    
    // 認証されている場合はユーザー情報を設定
    if (isAuthenticated && authUser) {
      console.log('Dashboard: useAuthフックからユーザー情報を取得しました:', authUser);
      setUser(authUser);
      // ローカルストレージにもユーザー情報を保存
      localStorage.setItem('user', JSON.stringify(authUser));
    }
    
    // 認証されていなくてもダッシュボードを表示
    setLoading(false);
  }, [isAuthenticated, authUser, authLoading, navigate]);

  // 新規取引モーダル表示のイベントリスナー
  useEffect(() => {
    const handleOpenModal = () => setShowCreateForm(true);
    window.addEventListener('openCreateTransactionModal', handleOpenModal);
    
    return () => {
      window.removeEventListener('openCreateTransactionModal', handleOpenModal);
    };
  }, []);

  // ローディング中の表示
  if (loading || transactionsLoading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">データを読み込んでいます...</p>
        </div>
      </div>
    );
  }

  // CSV形式にデータを変換する関数
  const convertToCSV = (data: any[]): string => {
    // ヘッダー行
    const headers = ['日付', '説明', '金額', 'カテゴリ', 'タイプ', 'ステータス'];
    
    // データ行
    const rows = data.map(transaction => [
      transaction.date,
      `"${transaction.description}"`, // 説明にカンマが含まれる場合に備えてクォートで囲む
      transaction.amount.toString(),
      `"${transaction.category}"`, // カテゴリにカンマが含まれる場合に備えてクォートで囲む
      transaction.type,
      transaction.status
    ]);
    
    // CSV文字列を作成
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    return csvContent;
  };

  // CSVファイルをダウンロードする関数
  const downloadCSV = () => {
    const csvContent = convertToCSV(transactions);
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

  // 新規取引の作成
  const handleCreateTransaction = async (transactionData: any) => {
    try {
      // creatorフィールドを認証されたユーザー情報で設定
      if (user && user.id) {
        // UUID形式のチェック
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(user.id)) {
          transactionData.creator = user.id;
        } else {
          console.warn('無効なユーザーID形式です。匿名ユーザーとして処理します。');
          transactionData.creator = '00000000-0000-0000-0000-000000000000'; // ダミーのUUID
        }
      } else {
        // ユーザー情報がない場合も、取引は作成できるようにする
        transactionData.creator = '00000000-0000-0000-0000-000000000000'; // ダミーのUUID
      }
      
      await createTransaction(transactionData);
      setShowCreateForm(false);
    } catch (error) {
      console.error('取引の作成に失敗:', error);
      alert('取引の作成に失敗しました。もう一度お試しください。');
    }
  };

  console.log('Dashboard: ダッシュボードを表示します');
  console.log('Dashboard: 取引データ', transactions);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ヘッダーとエクスポートボタン */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center justify-between w-full">
            <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
            <div className="flex sm:hidden gap-2">
              <button
                onClick={downloadCSV}
                disabled={transactions.length === 0}
                className={`px-3 py-2 rounded-md transition-colors flex items-center justify-center border ${
                  transactions.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-white text-green-600 border-green-600 hover:bg-green-50'
                }`}
                title="CSVエクスポート"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
                <span className="text-sm">CSV</span>
              </button>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                title="新規取引"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                <span className="text-sm">新規</span>
              </button>
            </div>
          </div>
          <div className="hidden sm:flex gap-2 whitespace-nowrap">
            <button
              onClick={downloadCSV}
              disabled={transactions.length === 0}
              className={`px-4 py-2 rounded-md transition-colors flex items-center justify-center border ${
                transactions.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-white text-green-600 border-green-600 hover:bg-green-50'
              }`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
              </svg>
              CSVエクスポート
            </button>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              新規取引
            </button>
          </div>
        </div>
        
        {/* クイックアクション */}
        <QuickActions />
        
        {/* チャートセクション */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <RevenueChart transactions={transactions} />
          <ExpenseChart transactions={transactions} />
        </div>
        
        {/* テーブルセクション */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TransactionTable 
            transactions={transactions} 
            onOpenCreateModal={() => setShowCreateForm(true)} 
            showCreateButton={false} // 新規作成ボタンを非表示
          />
          <AITransactionTable 
            aiTransactions={aiTransactions} 
            loading={transactionsLoading} 
          />
        </div>
      </main>

      {/* 新規取引作成モーダル */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <TransactionForm
                onSubmit={handleCreateTransaction}
                onCancel={() => setShowCreateForm(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard