import React, { useEffect, useState, Suspense, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import QuickActions from '../components/QuickActions'
import { useMySQLTransactions } from '../hooks/useMySQLTransactions'
import { useMySQLAITransactions } from '../hooks/useMySQLAITransactions'
import { useAuth } from '../hooks/useAuth'
import { Download, Plus } from 'lucide-react'

// Lazy load heavy components
const RevenueChart = React.lazy(() => import('../components/RevenueChart'));
const ExpenseChart = React.lazy(() => import('../components/ExpenseChart'));
const TransactionTable = React.lazy(() => import('../components/TransactionTable'));
const AITransactionTable = React.lazy(() => import('../components/AITransactionTable'));
const TransactionForm = React.lazy(() => import('../components/TransactionForm'));

// Preload components
// これらのコンポーネントはReact.lazyで遅延読み込みされるため、明示的なプリロードは不要です

import { useBusinessTypeContext } from '../context/BusinessTypeContext'

const Dashboard: React.FC = () => {
  const { currentBusinessType } = useBusinessTypeContext();
  const { transactions, createTransaction } = useMySQLTransactions(currentBusinessType?.id);
  const { aiTransactions, loading: aiTransactionsLoading } = useMySQLAITransactions();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { isAuthenticated, user: authUser, loading: authLoading } = useAuth();

  useEffect(() => {
    const handleOpenModal = () => setShowCreateForm(true);
    window.addEventListener('openCreateTransactionModal', handleOpenModal);

    return () => {
      window.removeEventListener('openCreateTransactionModal', handleOpenModal);
    };
  }, []);

  // Skeleton Loader Component
  const DashboardSkeleton = () => (
    <div className="min-h-screen">
      <div className="p-4 bg-red-500 text-white text-center mb-4">
        <p>ダッシュボードのローディング中...</p>
        <p>authLoading: {authLoading ? 'true' : 'false'}</p>
        <p>isAuthenticated: {isAuthenticated ? 'true' : 'false'}</p>
      </div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
      <div className="h-24 w-full bg-gray-200 dark:bg-gray-700 rounded-xl mb-8"></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
      </div>
    </div>
  );

  if (authLoading) {
    console.log('ダッシュボードをスケルトンローディングで表示中 - authLoading:', authLoading);
    return <DashboardSkeleton />;
  }

  const convertToCSV = (data: any[]): string => {
    const headers = ['日付', '説明', '金額', 'カテゴリ', 'タイプ', 'ステータス'];
    const rows = data.map(transaction => [
      transaction.date,
      `"${transaction.description}"`,
      transaction.amount.toString(),
      `"${transaction.category}"`,
      transaction.type,
      transaction.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    return csvContent;
  };

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

  const handleCreateTransaction = async (transactionData: any) => {
    try {
      console.log('取引作成を開始:', transactionData);

      if (authUser && authUser.id) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(authUser.id)) {
          transactionData.creator = authUser.id;
        } else {
          transactionData.creator = '00000000-0000-0000-0000-000000000000';
        }
      } else {
        transactionData.creator = '00000000-0000-0000-0000-000000000000';
      }

      console.log('creator IDを設定:', transactionData.creator);

      const result = await createTransaction(transactionData);
      console.log('取引作成成功:', result);
      setShowCreateForm(false);
    } catch (error: any) {
      console.error('取引の作成に失敗:', error);
      alert(`取引の作成に失敗しました: ${error.message || 'もう一度お試しください。'}`);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-main tracking-tight">ダッシュボード</h1>
          <p className="text-text-muted mt-1">財務状況の概要と最近の活動</p>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={downloadCSV}
            disabled={transactions.length === 0}
            className={`btn-secondary flex-1 sm:flex-none flex items-center justify-center ${transactions.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Download className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">CSV</span>
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary flex-1 sm:flex-none flex items-center justify-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">新規</span>
          </button>
        </div>
      </div>

      <QuickActions />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Suspense fallback={<div className="h-80 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center"><div className="text-gray-400">読み込み中...</div></div>}>
          <RevenueChart transactions={transactions} />
        </Suspense>
        <Suspense fallback={<div className="h-80 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center"><div className="text-gray-400">読み込み中...</div></div>}>
          <ExpenseChart transactions={transactions} />
        </Suspense>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center"><div className="text-gray-400">読み込み中...</div></div>}>
          <TransactionTable
            transactions={transactions}
            onOpenCreateModal={() => setShowCreateForm(true)}
            showCreateButton={false}
          />
        </Suspense>
        <Suspense fallback={<div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center"><div className="text-gray-400">読み込み中...</div></div>}>
          <AITransactionTable
            aiTransactions={aiTransactions}
            loading={aiTransactionsLoading}
          />
        </Suspense>
      </div>

      {showCreateForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <Suspense fallback={<div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center"><div className="text-gray-400">読み込み中...</div></div>}>
                <TransactionForm
                  onSubmit={handleCreateTransaction}
                  onCancel={() => setShowCreateForm(false)}
                />
              </Suspense>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard