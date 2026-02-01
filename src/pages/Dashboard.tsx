import React, { useEffect, useState, Suspense, useMemo } from 'react'
import { Link } from 'react-router-dom'
import QuickActions from '../components/QuickActions'
import { useTransactions } from '../hooks/useTransactions'
import { useAuth } from '../hooks/useAuth'
import { Plus, Inbox } from 'lucide-react'
import { getReceipts } from '../services/receiptService'
import { Receipt } from '../services/receiptService'

// Lazy load heavy components
const RevenueChart = React.lazy(() => import('../components/RevenueChart'));
const ExpenseChart = React.lazy(() => import('../components/ExpenseChart'));
const TransactionTable = React.lazy(() => import('../components/TransactionTable'));
const OmniEntryPortal = React.lazy(() => import('../components/OmniEntryPortal'));
const DashboardChatbot = React.lazy(() => import('../components/DashboardChatbot'));
import BudgetControlCard from '../components/BudgetControlCard';

// Preload components
// これらのコンポーネントはReact.lazyで遅延読み込みされるため、明示的なプリロードは不要です

import { useBusinessTypeContext } from '../context/BusinessTypeContext'

const Dashboard: React.FC = () => {
  const { currentBusinessType } = useBusinessTypeContext();
  const { isAuthenticated, user: authUser, loading: authLoading } = useAuth();
  const { transactions, loading, fetchTransactions } = useTransactions(authUser?.id, currentBusinessType?.business_type);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
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

  // レシートデータの取得
  const fetchReceiptsData = async () => {
    if (authUser?.id) {
      const data = await getReceipts(authUser.id);
      // 未承認・未却下のもののみ
      setReceipts(data.filter(r => r.status === 'pending'));
    }
  };

  useEffect(() => {
    if (!authLoading && authUser?.id) {
      fetchReceiptsData();
    }
  }, [authLoading, authUser?.id]);

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
            <div>
              <h1 className="text-xl font-bold text-text-main tracking-tight">ダッシュボード</h1>
              <p className="text-xs text-text-muted mt-0.5">財務状況の概要と最近の活動</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 w-full sm:w-auto h-10">
          <Link
            to="/transaction-inbox"
            className={`group flex-1 sm:flex-none relative inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full transition-all duration-200 border whitespace-nowrap ${stats.pendingCount > 0
              ? 'border-red-500/50 hover:border-red-500 text-red-500 hover:bg-red-500/10'
              : 'border-border hover:border-border-strong text-text-muted hover:bg-surface-highlight'
              } bg-surface`}
          >
            <Inbox className="w-4 h-4" />
            <span className="font-bold text-sm">確認待ち{stats.pendingCount === 0 ? '(0)' : ''}</span>
            {stats.pendingCount > 0 && (
              <>
                <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 ml-1 rounded-full text-[10px] font-bold bg-white/10 text-red-500">
                  {stats.pendingCount}
                </span>
                <span className="absolute top-0 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border-2 border-surface shadow-[0_0_10px_rgba(239,68,68,0.5)]"></span>
              </>
            )}
          </Link>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-1.5 rounded-full bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-all shadow-lg shadow-primary/25 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            新規取引
          </button>
        </div>
      </div>

      <QuickActions />



      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Suspense fallback={<div className="h-[580px] bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center"><div className="text-gray-400">読み込み中...</div></div>}>
          <div className="h-full lg:h-[580px]">
            <RevenueChart transactions={transactions} />
          </div>
        </Suspense>
        <Suspense fallback={<div className="h-[580px] bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center"><div className="text-gray-400">読み込み中...</div></div>}>
          <div className="h-[500px] lg:h-[580px]">
            <ExpenseChart transactions={transactions} />
          </div>
        </Suspense>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<div className="h-[500px] lg:h-[580px] bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center"><div className="text-gray-400">読み込み中...</div></div>}>
          <div className="h-[500px] lg:h-[580px]">
            <TransactionTable
              transactions={transactions}
              onOpenCreateModal={() => setShowCreateForm(true)}
              showCreateButton={false}
            />
          </div>
        </Suspense>
        <Suspense fallback={<div className="h-[580px] bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center"><div className="text-gray-400">読み込み中...</div></div>}>
          <div className="h-[500px] lg:h-[580px]">
            <BudgetControlCard transactions={transactions} receipts={receipts} />
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

      <Suspense fallback={null}>
        <DashboardChatbot />
      </Suspense>
    </div>
  )
}

export default Dashboard;