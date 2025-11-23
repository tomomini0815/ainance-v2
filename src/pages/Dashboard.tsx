import React, { useEffect, useState, Suspense, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import QuickActions from '../components/QuickActions'
import { useMySQLTransactions } from '../hooks/useMySQLTransactions'
import { useMySQLAITransactions } from '../hooks/useMySQLAITransactions'
import { useAuth } from '../hooks/useAuth'
import { Download, Plus, X, FileText, TrendingUp, TrendingDown, JapaneseYen } from 'lucide-react'

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
  const { transactions, loading, createTransaction, fetchTransactions } = useMySQLTransactions(currentBusinessType?.id);
  const { aiTransactions, loading: aiTransactionsLoading } = useMySQLAITransactions();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { isAuthenticated, user: authUser, loading: authLoading } = useAuth();

  console.log('ダッシュボード - currentBusinessType:', currentBusinessType);
  console.log('ダッシュボード - transactions:', transactions);
  console.log('ダッシュボード - loading:', loading);

  useEffect(() => {
    const handleOpenModal = () => setShowCreateForm(true);
    window.addEventListener('openCreateTransactionModal', handleOpenModal);

    return () => {
      window.removeEventListener('openCreateTransactionModal', handleOpenModal);
    };
  }, []);

  // データの再取得
  useEffect(() => {
    if (currentBusinessType?.id) {
      fetchTransactions();
    }
  }, [currentBusinessType, fetchTransactions]);

  // 統計情報
  const stats = useMemo(() => {
    console.log('取引データ:', transactions);

    // 各取引の詳細情報を出力
    transactions.forEach((t, index) => {
      console.log(`取引 ${index + 1}:`, {
        id: t.id,
        item: t.item,
        amount: t.amount,
        amountType: typeof t.amount,
        amountStructure: typeof t.amount === 'object' ? Object.keys(t.amount) : 'N/A',
        date: t.date,
        category: t.category,
        type: t.type
      });
    });

    // amountの値を安全に取得するヘルパー関数
    const getAmountValue = (amount: any): number => {
      if (typeof amount === 'number') {
        return amount;
      }
      if (typeof amount === 'string') {
        const parsed = parseFloat(amount);
        return isNaN(parsed) ? 0 : parsed;
      }
      if (typeof amount === 'object' && amount !== null) {
        // オブジェクトの場合、valueやamountプロパティを探す
        const objValue = amount.value || amount.amount || amount.number || 0;
        if (typeof objValue === 'number') {
          return objValue;
        }
        if (typeof objValue === 'string') {
          const parsed = parseFloat(objValue);
          return isNaN(parsed) ? 0 : parsed;
        }
        return 0;
      }
      return 0;
    };

    // 金額を確実に数値に変換して計算
    const incomeTransactions = transactions.filter(t => {
      // typeが'income'の場合を優先
      if (t.type === 'income') {
        return true;
      }

      // amountが正の数値の場合も収入として扱う
      const amount = getAmountValue(t.amount);
      const isValid = !isNaN(amount) && isFinite(amount) && amount > 0;
      console.log(`取引ID ${t.id}: type=${t.type}, 元のamount=${JSON.stringify(t.amount)}, 数値化後=${amount}, 収入判定=${isValid}`);
      return isValid;
    });

    const expenseTransactions = transactions.filter(t => {
      // typeが'expense'の場合を優先
      if (t.type === 'expense') {
        return true;
      }

      // amountが負の数値の場合も支出として扱う
      const amount = getAmountValue(t.amount);
      const isValid = !isNaN(amount) && isFinite(amount) && amount < 0;
      console.log(`取引ID ${t.id}: type=${t.type}, 元のamount=${JSON.stringify(t.amount)}, 数値化後=${amount}, 支出判定=${isValid}`);
      return isValid;
    });

    const totalIncome = incomeTransactions.reduce((sum, t) => {
      const amount = getAmountValue(t.amount);
      const validAmount = !isNaN(amount) && isFinite(amount) ? Math.abs(amount) : 0;
      console.log(`収入計算: ${sum} + ${validAmount} = ${sum + validAmount}`);
      return sum + validAmount;
    }, 0);

    const totalExpense = expenseTransactions.reduce((sum, t) => {
      const amount = getAmountValue(t.amount);
      // 支出の場合は金額を正の値として計算（表示時にマイナスを付ける）
      const validAmount = !isNaN(amount) && isFinite(amount) ? Math.abs(amount) : 0;
      console.log(`支出計算: ${sum} + ${validAmount} = ${sum + validAmount}`);
      return sum + validAmount;
    }, 0);

    const result = {
      total: transactions.length,
      income: totalIncome,
      expense: totalExpense,
      balance: totalIncome - totalExpense
    };

    console.log('統計情報計算結果:', result);
    console.log('収入取引:', incomeTransactions);
    console.log('支出取引:', expenseTransactions);

    return result;
  }, [transactions])

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

      // creatorフィールドをローカルストレージから取得したユーザー情報で設定
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          transactionData.creator = userData.id;
        } catch (error) {
          console.error('ユーザー情報の解析に失敗しました:', error);
        }
      }

      console.log('creator IDを設定:', transactionData.creator);

      // typeプロパティが設定されていない場合、amountの正負で判断
      if (!transactionData.type) {
        const amount = typeof transactionData.amount === 'string' ? parseFloat(transactionData.amount) : transactionData.amount;
        transactionData.type = amount > 0 ? 'income' : 'expense';
        console.log('typeプロパティを自動設定:', transactionData.type);
      }

      const result = await createTransaction(transactionData);
      console.log('取引作成成功:', result);

      // データの再取得
      await fetchTransactions();

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
            CSV出力
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary flex-1 sm:flex-none flex items-center justify-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            新規取引
          </button>
        </div>
      </div>

      {/* 統計カード */}
      <div className="bg-surface rounded-xl shadow-sm p-4 border border-border hover:shadow-md transition-shadow mb-8">
        <div className="grid grid-cols-2 gap-4">
          <div className="border border-border rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-text-muted">総取引数</div>
              <div className="rounded-lg bg-primary/5 p-2">
                <FileText className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="text-xl font-bold text-primary mt-1">{stats.total}</div>
          </div>
          <div className="border border-border rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-text-muted">収入</div>
              <div className="rounded-lg bg-green-500/5 p-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
            </div>
            <div className="text-xl font-bold text-green-500 mt-1">¥{stats.income.toLocaleString()}</div>
          </div>
          <div className="border border-border rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-text-muted">支出</div>
              <div className="rounded-lg bg-red-500/5 p-2">
                <TrendingDown className="w-5 h-5 text-red-500" />
              </div>
            </div>
            <div className="text-xl font-bold text-red-500 mt-1">¥{stats.expense.toLocaleString()}</div>
          </div>
          <div className="border border-border rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-text-muted">収支</div>
              <div className={`rounded-lg p-2 ${stats.balance >= 0 ? 'bg-green-500/5' : 'bg-red-500/5'}`}>
                <JapaneseYen className={`w-5 h-5 ${stats.balance >= 0 ? 'text-green-500' : 'text-red-500'}`} />
              </div>
            </div>
            <div className={`text-xl font-bold mt-1 ${stats.balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ¥{stats.balance.toLocaleString()}
            </div>
          </div>
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-text-main">新規取引作成</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="p-2 rounded-lg hover:bg-surface-highlight transition-colors"
                >
                  <X className="w-5 h-5 text-text-muted" />
                </button>
              </div>
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

export default Dashboard;