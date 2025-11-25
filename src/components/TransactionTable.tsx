import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, TrendingUp, TrendingDown, Plus, FileText } from 'lucide-react'
import { useTransactions } from '../hooks/useTransactions'
import { useBusinessTypeContext } from '../context/BusinessTypeContext'
import { useAuth } from '../hooks/useAuth'

interface Transaction {
  id: string | number
  item: string
  amount: number
  date: string
  category: string
  type: string
  description?: string
  receipt_url?: string
  creator: string
  created_at?: string
  updated_at?: string
  tags?: string[]
  location?: string
  recurring?: boolean
  recurring_frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly'
  approval_status?: 'pending' | 'approved' | 'rejected'
}

interface TransactionTableProps {
  transactions: Transaction[];
  onOpenCreateModal?: () => void;
  showCreateButton?: boolean;
}

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, onOpenCreateModal, showCreateButton = true }) => {
  const { currentBusinessType } = useBusinessTypeContext();
  const { isAuthenticated, user: authUser, loading: authLoading } = useAuth();
  const { transactions: fetchedTransactions, loading, fetchTransactions } = useTransactions(authUser?.id, currentBusinessType?.business_type);

  // データの再取得
  useEffect(() => {
    if (currentBusinessType?.id) {
      fetchTransactions();
    }
  }, [currentBusinessType, fetchTransactions]);

  // カスタムイベントリスナーを追加して、取引が記録されたときにデータを再取得
  useEffect(() => {
    const handleTransactionRecorded = () => {
      if (currentBusinessType?.id) {
        fetchTransactions(); // _TRANSACTION_TABLE_FETCH_TRANSACTIONS_
      }
    };

    const handleTransactionApproved = () => {
      if (currentBusinessType?.id) {
        fetchTransactions();
      }
    };

    window.addEventListener('transactionRecorded', handleTransactionRecorded);
    window.addEventListener('transactionApproved', handleTransactionApproved);

    return () => {
      window.removeEventListener('transactionRecorded', handleTransactionRecorded);
      window.removeEventListener('transactionApproved', handleTransactionApproved);
    };
  }, [currentBusinessType, fetchTransactions]);

  const getCategoryIcon = (category: string, amount: number, isFinalIncome?: boolean, isFinalExpense?: boolean) => {
    console.log('getCategoryIcon called with:', { category, amount, isFinalIncome, isFinalExpense });
    
    // isFinalIncomeとisFinalExpenseの両方がtrueの場合、isFinalExpenseを優先
    if (isFinalIncome === true && isFinalExpense === true) {
      console.log('Both isFinalIncome and isFinalExpense are true, prioritizing expense');
      return <TrendingDown className="w-4 h-4 text-red-500 mr-2" />;
    }
    
    // isFinalIncomeまたはisFinalExpenseが指定されている場合、それを優先
    if (isFinalIncome === true) {
      console.log('Returning TrendingUp icon for income');
      return <TrendingUp className="w-4 h-4 text-green-500 mr-2" />;
    }

    if (isFinalExpense === true) {
      console.log('Returning TrendingDown icon for expense');
      return <TrendingDown className="w-4 h-4 text-red-500 mr-2" />;
    }

    // amountが文字列の場合、数値に変換
    let numericAmount = amount;
    if (typeof amount === 'string') {
      numericAmount = parseFloat(amount);
    }
    
    const isValidAmount = !isNaN(numericAmount) && isFinite(numericAmount);
    const isIncome = isValidAmount && numericAmount > 0;
    const isExpense = isValidAmount && numericAmount < 0;

    if (isIncome) {
      console.log('Returning TrendingUp icon for positive amount');
      return <TrendingUp className="w-4 h-4 text-green-500 mr-2" />;
    }

    if (isExpense) {
      console.log('Returning TrendingDown icon for negative amount');
      return <TrendingDown className="w-4 h-4 text-red-500 mr-2" />;
    }

    // 金額が0または無効な場合のデフォルトアイコン
    const badgeClass = "inline-flex items-center justify-center w-6 h-6 rounded-full mr-2 text-xs font-bold";

    switch (category) {
      case '交通費':
        return <span className={`${badgeClass} bg-blue-500/20 text-blue-400`}>交</span>;
      case '食費':
        return <span className={`${badgeClass} bg-emerald-500/20 text-emerald-400`}>食</span>;
      case '消耗品費':
        return <span className={`${badgeClass} bg-purple-500/20 text-purple-400`}>消</span>;
      case '通信費':
        return <span className={`${badgeClass} bg-amber-500/20 text-amber-400`}>通</span>;
      case '光熱費':
        return <span className={`${badgeClass} bg-rose-500/20 text-rose-400`}>光</span>;
      default:
        return <span className={`${badgeClass} bg-slate-500/20 text-text-muted`}>他</span>;
    }
  };

  const latestTransactions = [...(transactions.length > 0 ? transactions : fetchedTransactions)]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (loading) {
    return (
      <div className="bg-white dark:bg-surface rounded-2xl p-6 border border-border shadow-sm transition-all duration-200 hover:shadow-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-text-main">最近の履歴</h3>
          <div className="flex items-center space-x-3">
            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 mr-3"></div>
                <div>
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
              <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-surface rounded-2xl p-6 border border-border shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text-main">取引履歴</h3>
        <div className="flex items-center space-x-3">
          <Link
            to="/transaction-history"
            className="flex items-center text-sm text-primary hover:text-primary/80 font-medium transition-colors"
          >
            詳細一覧
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
          {showCreateButton && onOpenCreateModal && (
            <button
              onClick={onOpenCreateModal}
              className="flex items-center px-3 py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              <Plus className="w-4 h-4 mr-1" />
              新規作成
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto max-h-96 overflow-y-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase tracking-wider">項目</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-text-muted uppercase tracking-wider">金額</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase tracking-wider hidden sm:table-cell">日付</th>
              <th className="text-center py-3 px-4 text-xs font-medium text-text-muted uppercase tracking-wider">カテゴリ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {latestTransactions.length > 0 ? (
              latestTransactions.slice(0, 10).map((transaction) => {
                // amountの型を確実に数値に変換
                let amount = transaction.amount;
                if (typeof transaction.amount === 'string') {
                  amount = parseFloat(transaction.amount);
                } else if (typeof transaction.amount === 'number') {
                  amount = transaction.amount;
                } else {
                  amount = 0;
                }

                // 承認状態をチェック
                const isApproved = transaction.approval_status === 'approved';

                const isValidAmount = !isNaN(amount) && isFinite(amount);
                const isExplicitIncome = transaction.type === 'income';
                const isExplicitExpense = transaction.type === 'expense';

                // isExplicitIncomeまたはisExplicitExpenseが指定されている場合、それを優先
                // 両方がtrueになることはないので、isExplicitIncomeを優先
                const isFinalIncome = isExplicitIncome ? true : (isExplicitExpense ? false : (isValidAmount && amount > 0));
                const isFinalExpense = isExplicitExpense ? true : (isExplicitIncome ? false : (isValidAmount && amount < 0));

                console.log('Transaction processing:', { 
                  id: transaction.id, 
                  amount, 
                  type: transaction.type, 
                  isExplicitIncome, 
                  isExplicitExpense, 
                  isFinalIncome, 
                  isFinalExpense 
                });

                return (
                  <tr key={transaction.id} className="hover:bg-white/5 transition-colors group">
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        {getCategoryIcon(transaction.category, amount, isFinalIncome, isFinalExpense)}
                        <div>
                          <div className="font-medium text-text-main text-sm group-hover:text-white transition-colors">{transaction.item}</div>
                          <div className="text-xs text-text-muted sm:hidden mt-0.5">
                            {new Date(transaction.date).toLocaleDateString('ja-JP', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right font-medium">
                      <div className="flex items-center justify-end">
                        {isFinalIncome ?
                          <TrendingUp className="w-4 h-4 text-green-500 mr-1" /> :
                          isFinalExpense ?
                            <TrendingDown className="w-4 h-4 text-red-500 mr-1" /> :
                            null
                        }
                        <span className={`${isFinalIncome ? 'text-green-500' : isFinalExpense ? 'text-red-500' : 'text-text-muted'}`}>
                          {isFinalIncome ? '' : isFinalExpense ? '-' : ''}{isValidAmount ? Math.abs(amount).toLocaleString() : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-text-muted hidden sm:table-cell">
                      {new Date(transaction.date).toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${isFinalIncome ?
                          'bg-green-500/10 text-green-600' :
                          isFinalExpense ?
                            'bg-red-500/10 text-red-600' :
                            'bg-slate-500/10 text-text-muted'
                        }`}>
                        {transaction.category}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-surface-highlight flex items-center justify-center mb-3">
                      <FileText className="w-6 h-6 text-slate-600" />
                    </div>
                    <p className="text-text-muted text-sm">取引がありません</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ページネーション */}
      <div className="flex items-center justify-center mt-6 space-x-2">
        <button className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center text-sm font-medium shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all">
          1
        </button>
        <button className="w-8 h-8 rounded-lg bg-surface text-text-muted flex items-center justify-center text-sm font-medium hover:bg-surface-highlight hover:text-text-main transition-all border border-border">
          2
        </button>
        <button className="p-2 text-text-muted hover:text-text-secondary transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default TransactionTable