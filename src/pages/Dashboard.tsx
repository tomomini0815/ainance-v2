import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import QuickActions from '../components/QuickActions'
import RevenueChart from '../components/RevenueChart'
import ExpenseChart from '../components/ExpenseChart'
import TransactionTable from '../components/TransactionTable'
import AITransactionTable from '../components/AITransactionTable'
import TransactionForm from '../components/TransactionForm'
import { ChevronRight, Plus } from 'lucide-react'
import { useMySQLTransactions } from '../hooks/useMySQLTransactions' // MySQL用のフックに変更

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { transactions, loading: transactionsLoading } = useMySQLTransactions(); // MySQL用のフックを使用
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    console.log('ダッシュボードページが読み込まれました');
    
    // ローカルストレージからユーザー情報を読み込む
    const storedUser = localStorage.getItem('user');
    console.log('ローカルストレージから取得したユーザー情報:', storedUser);
    
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        console.log('ユーザー情報を解析しました:', userData);
        setUser(userData);
        setLoading(false);
      } catch (error) {
        console.error('ユーザー情報の解析に失敗しました:', error);
        setLoading(false);
      }
    } else {
      console.log('ユーザー情報が見つかりません');
      setLoading(false);
      // ユーザー情報がない場合はログインページにリダイレクト
      // window.location.href = '/';
    }
  }, []);

  // 新規取引モーダル表示のイベントリスナー
  useEffect(() => {
    const handleOpenModal = () => setShowCreateForm(true);
    window.addEventListener('openCreateTransactionModal', handleOpenModal);
    
    return () => {
      window.removeEventListener('openCreateTransactionModal', handleOpenModal);
    };
  }, []);

  // ローディング中の表示
  if (loading || transactionsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">データを読み込んでいます...</p>
        </div>
      </div>
    );
  }

  // ユーザー情報がない場合の表示
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">認証が必要です</h2>
          <p className="text-gray-600 mb-6">ダッシュボードにアクセスするにはログインが必要です。</p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            ログインページへ
          </button>
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

  // 新規取引の作成（ダミー関数）
  const handleCreateTransaction = async (transactionData: any) => {
    // 実際のアプリでは、ここでAPIを呼び出して取引を作成します
    console.log('新規取引を作成:', transactionData);
    setShowCreateForm(false);
    // 作成後はページをリロードして最新のデータを表示
    window.location.reload();
  };

  console.log('ダッシュボードを表示します');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HeaderコンポーネントはApp.tsxでレンダリングされるため、ここでは削除 */}
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ヘッダーとエクスポートボタン */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              新規取引
            </button>
            <button
              onClick={downloadCSV}
              disabled={transactions.length === 0}
              className={`px-4 py-2 rounded-md transition-colors flex items-center ${
                transactions.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
              </svg>
              CSVエクスポート
            </button>
          </div>
        </div>
        
        {/* クイックアクション */}
        <QuickActions />
        
        {/* チャートセクション */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <RevenueChart />
          <ExpenseChart />
        </div>
        
        {/* テーブルセクション */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TransactionTable onOpenCreateModal={() => setShowCreateForm(true)} />
          <AITransactionTable />
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