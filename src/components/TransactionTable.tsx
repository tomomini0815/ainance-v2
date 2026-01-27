import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, ChevronLeft, Plus, FileText, Repeat } from 'lucide-react'
import TransactionIcon from './TransactionIcon'
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
  const { user: authUser } = useAuth();
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

  // getItemIcon logic replaced by shared TransactionIcon component

  const latestTransactions = [...(transactions.length > 0 ? transactions : fetchedTransactions)]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(latestTransactions.length / itemsPerPage);
  const paginatedTransactions = latestTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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
    <div className="bg-white dark:bg-surface rounded-2xl p-4 border border-border shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-text-main">取引履歴</h3>
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

      {/* モバイル: カード表示 */}
      <div className="block md:hidden space-y-3">
        {paginatedTransactions.length > 0 ? (
          paginatedTransactions.map((transaction) => {
            // amountの型を確実に数値に変換
            let amount = transaction.amount;
            if (typeof transaction.amount === 'string') {
              amount = parseFloat(transaction.amount);
            } else if (typeof transaction.amount === 'number') {
              amount = transaction.amount;
            } else {
              amount = 0;
            }

            const isValidAmount = !isNaN(amount) && isFinite(amount);
            const isExplicitIncome = transaction.type === 'income';
            const isExplicitExpense = transaction.type === 'expense';

            const isFinalIncome = isExplicitIncome ? true : (isExplicitExpense ? false : (isValidAmount && amount > 0));
            const isFinalExpense = isExplicitExpense ? true : (isExplicitIncome ? false : (isValidAmount && amount < 0));

            return (
              <div
                key={transaction.id}
                className="bg-surface-highlight rounded-xl p-2.5 border border-border hover:border-primary/50 transition-all"
              >
                <div className="flex items-start justify-between mb-1.5">
                  <div className="flex items-start flex-1">
                    <TransactionIcon item={transaction.item} category={transaction.category} size="xs" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="font-medium text-text-main text-sm">{transaction.item}</div>
                        {transaction.recurring && (
                          <div className="flex items-center gap-1 px-1 py-0.5 rounded bg-primary/10 text-primary text-[8px] font-bold border border-primary/20">
                            <Repeat className="w-2 h-2" />
                            <span>{{
                              'daily': '毎日',
                              'weekly': '毎週',
                              'monthly': '毎月',
                              'yearly': '毎年'
                            }[transaction.recurring_frequency || 'monthly']}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-text-muted">
                        {new Date(transaction.date).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-3">
                    <div className={`font-bold text-base ${isFinalIncome ? 'text-green-500' : isFinalExpense ? 'text-red-500' : 'text-text-muted'}`}>
                      {isFinalIncome ? '+' : isFinalExpense ? '-' : ''}¥{isValidAmount ? Math.abs(amount).toLocaleString() : 'N/A'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="whitespace-nowrap inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full bg-surface-highlight text-gray-300 border border-white/5">
                    {transaction.category}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-12 text-center">
            <div className="flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-surface-highlight flex items-center justify-center mb-3">
                <FileText className="w-6 h-6 text-slate-600" />
              </div>
              <p className="text-text-muted text-sm">取引がありません</p>
            </div>
          </div>
        )}
      </div>

      {/* デスクトップ: テーブル表示 */}
      <div className="hidden md:block overflow-x-auto min-h-[300px]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-3 text-[10px] font-medium text-text-muted uppercase tracking-wider">項目</th>
              <th className="text-right py-2 px-3 text-[10px] font-medium text-text-muted uppercase tracking-wider">金額</th>
              <th className="text-left py-2 px-3 text-[10px] font-medium text-text-muted uppercase tracking-wider">日付</th>
              <th className="text-center py-2 px-3 text-[10px] font-medium text-text-muted uppercase tracking-wider">カテゴリ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {paginatedTransactions.length > 0 ? (
              paginatedTransactions.map((transaction) => {
                // amountの型を確実に数値に変換
                let amount = transaction.amount;
                if (typeof transaction.amount === 'string') {
                  amount = parseFloat(transaction.amount);
                } else if (typeof transaction.amount === 'number') {
                  amount = transaction.amount;
                } else {
                  amount = 0;
                }

                const isValidAmount = !isNaN(amount) && isFinite(amount);
                const isExplicitIncome = transaction.type === 'income';
                const isExplicitExpense = transaction.type === 'expense';

                // isExplicitIncomeまたはisExplicitExpenseが指定されている場合、それを優先
                // 両方がtrueになることはないので、isExplicitIncomeを優先
                const isFinalIncome = isExplicitIncome ? true : (isExplicitExpense ? false : (isValidAmount && amount > 0));
                const isFinalExpense = isExplicitExpense ? true : (isExplicitIncome ? false : (isValidAmount && amount < 0));

                return (
                  <tr key={transaction.id} className="hover:bg-white/5 transition-colors group">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center">
                        <TransactionIcon item={transaction.item} category={transaction.category} size="xs" />
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="font-medium text-text-main text-xs group-hover:text-white transition-colors">{transaction.item}</div>
                            {transaction.recurring && (
                              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold border border-primary/20">
                                <Repeat className="w-2.5 h-2.5" />
                                <span>{{
                                  'daily': '毎日',
                                  'weekly': '毎週',
                                  'monthly': '毎月',
                                  'yearly': '毎年'
                                }[transaction.recurring_frequency || 'monthly']}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium">
                      <span className={`${isFinalIncome ? 'text-green-500' : isFinalExpense ? 'text-red-500' : 'text-text-muted'}`}>
                        {isFinalIncome ? '+' : isFinalExpense ? '-' : ''}¥{isValidAmount ? Math.abs(amount).toLocaleString() : 'N/A'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-xs text-text-muted">
                      {new Date(transaction.date).toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="whitespace-nowrap inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full bg-surface-highlight text-gray-300 border border-white/5">
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
      {totalPages > 1 && (
        <div className="flex items-center justify-center mt-6 space-x-2">
          <button
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg transition-colors ${currentPage === 1
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-text-muted hover:text-text-secondary hover:bg-surface-highlight'
              }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {(() => {
            // 表示するページ番号の範囲を計算（最大5つ表示）
            let startPage = Math.max(1, currentPage - 2);
            let endPage = Math.min(totalPages, startPage + 4);

            // ページの範囲を調整（端の場合）
            if (endPage - startPage < 4) {
              startPage = Math.max(1, endPage - 4);
            }

            const buttons = Array.from({ length: endPage - startPage + 1 }).map((_, i) => {
              const pageNumber = startPage + i;
              return (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-all ${currentPage === pageNumber
                    ? 'bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary/90'
                    : 'bg-surface text-text-muted hover:bg-surface-highlight hover:text-text-main border border-border'
                    }`}
                >
                  {pageNumber}
                </button>
              );
            });

            if (endPage < totalPages) {
              buttons.push(
                <span key="ellipsis" className="w-8 h-8 flex items-center justify-center text-text-muted">
                  ...
                </span>
              );
            }

            return buttons;
          })()}

          <button
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-lg transition-colors ${currentPage === totalPages
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-text-muted hover:text-text-secondary hover:bg-surface-highlight'
              }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}

export default TransactionTable