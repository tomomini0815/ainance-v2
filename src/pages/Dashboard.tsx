import React, { useEffect, useState, Suspense, useMemo } from 'react'
import { Link } from 'react-router-dom'
import QuickActions from '../components/QuickActions'
import { useTransactions } from '../hooks/useTransactions'
import { useAuth } from '../hooks/useAuth'
import { Plus, Sparkles, Inbox, FileText, TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { AIStatusBadge } from '../components/AIStatusComponents'
import { isAIEnabled } from '../services/geminiAIService'

// Lazy load heavy components
const RevenueChart = React.lazy(() => import('../components/RevenueChart'));
const ExpenseChart = React.lazy(() => import('../components/ExpenseChart'));
const TransactionTable = React.lazy(() => import('../components/TransactionTable'));
const OmniEntryPortal = React.lazy(() => import('../components/OmniEntryPortal'));

// Preload components
// これらのコンポーネントはReact.lazyで遅延読み込みされるため、明示的なプリロードは不要です

import { useBusinessTypeContext } from '../context/BusinessTypeContext'

const Dashboard: React.FC = () => {
  const { currentBusinessType } = useBusinessTypeContext();
  const { isAuthenticated, user: authUser, loading: authLoading } = useAuth();
  const { transactions, loading, fetchTransactions } = useTransactions(authUser?.id, currentBusinessType?.business_type);
  const [showCreateForm, setShowCreateForm] = useState(false);

  console.log('ダッシュボード - currentBusinessType:', currentBusinessType);
  console.log('ダッシュボード - transactions:', transactions);
  console.log('ダッシュボード - loading:', loading);
  console.log('ダッシュボード - authUser:', authUser);

  useEffect(() => {
    const handleOpenModal = () => setShowCreateForm(true);
    window.addEventListener('openCreateTransactionModal', handleOpenModal);

    return () => {
      window.removeEventListener('openCreateTransactionModal', handleOpenModal);
    };
  }, []);

  // データの再取得
  useEffect(() => {
    if (!authLoading) {
      console.log('ダッシュボード - 取引データの読み込みを開始');
      fetchTransactions();
    }
  }, [authLoading, fetchTransactions]);

  // transactionsの状態変化を監視
  useEffect(() => {
    console.log('ダッシュボード - transactions状態が更新されました:', transactions);
  }, [transactions]);

  // カスタムイベントリスナーを追加して、取引が記録されたときにデータを再取得
  useEffect(() => {
    const handleTransactionRecorded = async () => {
      console.log('ダッシュボード - transactionRecordedイベントを受信');
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
      console.log('ダッシュボード - transactionApprovedイベントを受信');
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

  // 統計情報
  const stats = useMemo(() => {
    console.log('ダッシュボード - 取引データ:', transactions);

    // 各取引の詳細情報を出力
    transactions.forEach((t, index) => {
      console.log(`ダッシュボード - 取引 ${index + 1}:`, {
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
      // 承認待ちの取引は統計に含めない
      if (t.approval_status === 'pending') return false;

      // typeが'income'の場合を優先
      if (t.type === 'income') {
        return true;
      }

      // typeが'expense'の場合は除外
      if (t.type === 'expense') {
        return false;
      }

      // typeが指定されていない場合のみ、amountが正の数値の場合を収入として扱う
      const amount = getAmountValue(t.amount);
      const isValid = !isNaN(amount) && isFinite(amount) && amount > 0;
      console.log(`ダッシュボード - 取引ID ${t.id}: type=${t.type}, 元のamount=${JSON.stringify(t.amount)}, 数値化後=${amount}, 収入判定=${isValid}`);
      return isValid;
    });

    const expenseTransactions = transactions.filter(t => {
      // 承認待ちの取引は統計に含めない
      if (t.approval_status === 'pending') return false;

      // typeが'expense'の場合を優先
      if (t.type === 'expense') {
        return true;
      }

      // typeが'income'の場合は除外
      if (t.type === 'income') {
        return false;
      }

      // typeが指定されていない場合のみ、amountが負の数値の場合を支出として扱う
      const amount = getAmountValue(t.amount);
      const isValid = !isNaN(amount) && isFinite(amount) && amount < 0;
      console.log(`ダッシュボード - 取引ID ${t.id}: type=${t.type}, 元のamount=${JSON.stringify(t.amount)}, 数値化後=${amount}, 支出判定=${isValid}`);
      return isValid;
    });

    const totalIncome = incomeTransactions.reduce((sum, t) => {
      const amount = getAmountValue(t.amount);
      // 収入は常に正の値として計算
      const validAmount = !isNaN(amount) && isFinite(amount) ? Math.abs(amount) : 0;
      console.log(`ダッシュボード - 収入計算: ${sum} + ${validAmount} = ${sum + validAmount}`);
      return sum + validAmount;
    }, 0);

    const totalExpense = expenseTransactions.reduce((sum, t) => {
      const amount = getAmountValue(t.amount);
      // 支出は常に正の値として計算
      const validAmount = !isNaN(amount) && isFinite(amount) ? Math.abs(amount) : 0;
      console.log(`ダッシュボード - 支出計算: ${sum} + ${validAmount} = ${sum + validAmount}`);
      return sum + validAmount;
    }, 0);

    const result = {
      total: transactions.length,
      income: totalIncome,
      expense: totalExpense,
      balance: totalIncome - totalExpense,
      pendingCount: transactions.filter(t => t.approval_status === 'pending').length
    };

    console.log('ダッシュボード - 統計情報計算結果:', result);
    console.log('ダッシュボード - 収入取引:', incomeTransactions);
    console.log('ダッシュボード - 支出取引:', expenseTransactions);

    return result;
  }, [transactions]);

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

  return (
    <div className="min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center">
          <div>
            <h1 className="text-2xl font-bold text-text-main tracking-tight">ダッシュボード</h1>
            <p className="text-text-muted mt-1">財務状況の概要と最近の活動</p>
          </div>
        </div>

        <div className="flex gap-4 w-full sm:w-auto h-12">
          <Link
            to="/transaction-inbox"
            className={`group flex-1 sm:flex-none relative inline-flex items-center justify-center gap-2 px-6 py-2 rounded-full transition-all duration-200 border border-red-500/50 hover:border-red-500 bg-surface text-red-500 hover:bg-red-500/10`}
          >
            <Inbox className="w-5 h-5" />
            <span className="font-bold">確認待ち</span>
            {stats.pendingCount > 0 && (
              <>
                <span className="flex items-center justify-center min-w-[24px] h-6 px-1.5 ml-1 rounded-full text-xs font-bold bg-white/10 text-red-500">
                  {stats.pendingCount}
                </span>
                <span className="absolute top-0 right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-surface shadow-[0_0_10px_rgba(239,68,68,0.5)]"></span>
              </>
            )}
          </Link>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-8 py-2 rounded-full bg-primary hover:bg-primary/90 text-white font-bold transition-all shadow-lg shadow-primary/25 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            新規取引
          </button>
        </div>
      </div>

      <QuickActions />

      {/* 統計カード - 一旦非表示 */}
      <div className="bg-surface rounded-xl shadow-sm p-4 border border-border hover:shadow-md transition-shadow mb-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="border border-border rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-text-muted">総取引数</div>
              <div className="rounded-lg bg-primary/5 p-2">
                <FileText className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="text-lg font-bold text-primary mt-1">{stats.total}件</div>
          </div>
          <div className="border border-border rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-text-muted">収入</div>
              <div className="rounded-lg bg-green-500/5 p-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
            </div>
            <div className="text-lg font-bold text-green-500 mt-1">¥{stats.income.toLocaleString()}</div>
          </div>
          <div className="border border-border rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-text-muted">支出</div>
              <div className="rounded-lg bg-red-500/5 p-2">
                <TrendingDown className="w-5 h-5 text-red-500" />
              </div>
            </div>
            <div className="text-lg font-bold text-red-500 mt-1">¥{stats.expense.toLocaleString()}</div>
          </div>
          <div className="border border-border rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-text-muted">収支</div>
              <div className={`rounded-lg p-2 ${stats.balance >= 0 ? 'bg-green-500/5' : 'bg-red-500/5'}`}>
                <Wallet className={`w-5 h-5 ${stats.balance >= 0 ? 'text-green-500' : 'text-red-500'}`} />
              </div>
            </div>
            <div className={`text-lg font-bold mt-1 ${stats.balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ¥{stats.balance.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

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
          <div className="bg-white dark:bg-surface rounded-2xl p-6 border border-border shadow-sm transition-all duration-200 hover:shadow-md">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Sparkles className={`w-5 h-5 ${isAIEnabled() ? 'text-purple-500' : 'text-gray-400'}`} />
                <h3 className="text-lg font-semibold text-text-main">AI分析</h3>
              </div>
              <AIStatusBadge />
            </div>

            {isAIEnabled() ? (
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-text-main">AI分析 有効</span>
                  </div>
                  <p className="text-sm text-text-muted">
                    レシートスキャン時にGemini AIが自動で勘定科目を分類します。
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-xs text-text-muted mb-1">高精度分類</div>
                    <div className="text-sm font-semibold text-text-main">95%+</div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-xs text-text-muted mb-1">処理時間</div>
                    <div className="text-sm font-semibold text-text-main">〜3秒</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
                  <p className="text-sm text-text-muted">
                    AIを有効にするとレシートの自動分類精度が向上します。
                  </p>
                </div>
                <div className="text-xs text-text-muted">
                  .envファイルにGemini API Keyを設定してください
                </div>
              </div>
            )}
          </div>
        </Suspense>
      </div>

      {showCreateForm && (
        <Suspense fallback={null}>
          <OmniEntryPortal
            onClose={() => setShowCreateForm(false)}
            onSuccess={() => fetchTransactions()}
          />
        </Suspense>
      )}
    </div>
  )
}

export default Dashboard;