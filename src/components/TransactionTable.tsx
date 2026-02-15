import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, ChevronLeft, Plus, FileText, Repeat, Calendar } from 'lucide-react'
import TransactionIcon from './TransactionIcon'
import { useTransactions } from '../hooks/useTransactions'
import { useBusinessTypeContext } from '../context/BusinessTypeContext'
import { useAuth } from '../hooks/useAuth'
import ReceiptResultModal from './ReceiptResultModal';

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
  disableEdit?: boolean;
}

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, onOpenCreateModal, showCreateButton = true, disableEdit = false }) => {
  const { currentBusinessType } = useBusinessTypeContext();
  const { user: authUser } = useAuth();
  const { transactions: fetchedTransactions, loading, fetchTransactions } = useTransactions(authUser?.id, currentBusinessType?.business_type);
  const [selectedTransaction, setSelectedTransaction] = React.useState<any>(null); // 編集用

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

  const latestTransactions = [...(Array.isArray(transactions) ? transactions : fetchedTransactions)]
    .filter(t => t.approval_status !== 'pending')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 8;

  const totalPages = Math.ceil(latestTransactions.length / itemsPerPage);
  const paginatedTransactions = latestTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRowClick = (transaction: Transaction) => {
    // Descriptionから明細（Items）を復元する簡易ロジック
    // 形式: "店舗名での購入\n【内訳】\n・品名: ¥価格\n..."
    let items: any[] = [];
    if (transaction.description && transaction.description.includes('【内訳】')) {
      const parts = transaction.description.split('【内訳】');
      const itemsPart = parts[1];
      if (itemsPart) {
        items = itemsPart.trim().split('\n').map(line => {
          const match = line.match(/・(.+): ¥([\d,]+)/);
          if (match) {
            return {
              name: match[1].trim(),
              price: parseInt(match[2].replace(/,/g, '')),
              line_total: parseInt(match[2].replace(/,/g, '')),
              qty: 1
            };
          }
          return null;
        }).filter(i => i !== null);
      }
    }

    // ReceiptResultModal形式にデータを変換
    const receiptData = {
      merchant: transaction.item,
      date: transaction.date.split('T')[0], // YYYY-MM-DD
      amount: Math.abs(transaction.amount),
      category: transaction.category,
      taxRate: 10,
      confidence: 100, // 編集なので100%
      items: items
    };

    setSelectedTransaction({
      id: transaction.id,
      data: receiptData
    });
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
    <div className="bg-white dark:bg-surface rounded-2xl p-4 border border-border shadow-sm transition-all duration-200 hover:shadow-md h-full flex flex-col">
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

      {/* Edit Modal */}
      {selectedTransaction && (
        <ReceiptResultModal
          mode="edit"
          transactionId={selectedTransaction.id}
          receiptData={selectedTransaction.data}
          onClose={() => setSelectedTransaction(null)}
          onSave={() => {
            fetchTransactions();
            setSelectedTransaction(null);
          }}
        />
      )}

      {/* モバイル: カード表示 */}
      <div className="block md:hidden flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-3">
        {paginatedTransactions.length > 0 ? (
          paginatedTransactions.slice(0, 5).map((transaction) => {
            let amount = 0;
            if (typeof transaction.amount === 'string') {
              amount = parseFloat(transaction.amount);
            } else if (typeof transaction.amount === 'number') {
              amount = transaction.amount;
            }

            if (transaction.tags?.includes('depreciation_asset')) {
              const depMatch = transaction.description?.match(/今期\(\d+年\)償却額:¥([\d,]+)/);
              if (depMatch) {
                amount = parseInt(depMatch[1].replace(/,/g, ''), 10);
              } else {
                const oldMatch = transaction.description?.match(/年間償却費: ¥([\d,]+)/);
                if (oldMatch) {
                  amount = parseInt(oldMatch[1].replace(/,/g, ''), 10);
                }
              }
            }

            const isValidAmount = !isNaN(amount) && isFinite(amount);
            const isExplicitIncome = transaction.type === 'income';
            const isExplicitExpense = transaction.type === 'expense';

            const isFinalIncome = isExplicitIncome ? true : (isExplicitExpense ? false : (isValidAmount && amount > 0));
            const isDepreciation = transaction.tags?.includes('depreciation_asset');

            return (
              <div
                key={transaction.id}
                onClick={() => !disableEdit && handleRowClick(transaction)}
                className={`${disableEdit ? 'cursor-default' : 'cursor-pointer active:scale-[0.98]'} bg-surface-highlight rounded-xl p-2.5 border border-border hover:border-primary/50 transition-all relative group`}
              >
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-2 px-0.5 font-medium uppercase tracking-wider">
                  <Calendar className="w-2.5 h-2.5 opacity-40" />
                  <span>
                    {new Date(transaction.date).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center flex-1 min-w-0">
                    <TransactionIcon item={transaction.item} category={transaction.category} size="xs" />
                    <div className="flex flex-wrap items-center gap-2 min-w-0">
                      <div className="font-medium text-text-main text-sm truncate">{transaction.item}</div>
                      {transaction.recurring && (
                        <div className="flex items-center gap-1 px-1 py-0.5 rounded bg-primary/10 text-primary text-[8px] font-bold border border-primary/20 shrink-0">
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
                  </div>
                  <div className="text-right ml-3 shrink-0">
                    <div className={`font-bold text-base ${isFinalIncome ? 'text-green-500' : isDepreciation ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>
                      {isFinalIncome ? '+' : '-'} {isValidAmount ? Math.abs(amount).toLocaleString() : 'N/A'}円
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between min-w-0">
                  <div className="flex-1 min-w-0">
                    <span className="inline-flex px-2.5 py-0.5 text-[10px] font-medium rounded-full bg-surface-highlight text-gray-400 border border-white/5 truncate max-w-[120px]">
                      {transaction.category}
                    </span>
                  </div>
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
      <div className="hidden md:block flex-1 min-h-0 overflow-auto custom-scrollbar">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-3 text-[10px] font-bold text-slate-500 dark:text-text-muted uppercase tracking-wider">項目</th>
              <th className="text-right py-2 px-3 text-[10px] font-bold text-slate-500 dark:text-text-muted uppercase tracking-wider">金額</th>
              <th className="text-left py-2 px-3 text-[10px] font-bold text-slate-500 dark:text-text-muted uppercase tracking-wider">日付</th>
              <th className="text-center py-2 px-3 text-[10px] font-bold text-slate-500 dark:text-text-muted uppercase tracking-wider">カテゴリ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {paginatedTransactions.length > 0 ? (
              paginatedTransactions.map((transaction) => {
                let amount = 0;
                if (typeof transaction.amount === 'string') {
                  amount = parseFloat(transaction.amount);
                } else if (typeof transaction.amount === 'number') {
                  amount = transaction.amount;
                }

                if (transaction.tags?.includes('depreciation_asset')) {
                  const depMatch = transaction.description?.match(/今期\(\d+年\)償却額:¥([\d,]+)/);
                  if (depMatch) {
                    amount = parseInt(depMatch[1].replace(/,/g, ''), 10);
                  } else {
                    const oldMatch = transaction.description?.match(/年間償却費: ¥([\d,]+)/);
                    if (oldMatch) {
                      amount = parseInt(oldMatch[1].replace(/,/g, ''), 10);
                    }
                  }
                }

                const isValidAmount = !isNaN(amount) && isFinite(amount);
                const isExplicitIncome = transaction.type === 'income';
                const isExplicitExpense = transaction.type === 'expense';
                const isFinalIncome = isExplicitIncome ? true : (isExplicitExpense ? false : (isValidAmount && amount > 0));
                const isDepreciation = transaction.tags?.includes('depreciation_asset');

                return (
                  <tr
                    key={transaction.id}
                    className={`hover:bg-white/5 transition-colors group ${disableEdit ? 'cursor-default' : 'cursor-pointer'}`}
                    onClick={() => !disableEdit && handleRowClick(transaction)}
                  >
                    <td className="py-2.5 px-3">
                      <div className="flex items-center">
                        <TransactionIcon item={transaction.item} category={transaction.category} size="xs" />
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="font-medium text-text-main text-xs group-hover:text-primary dark:group-hover:text-white transition-colors">{transaction.item}</div>
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
                      <span className={`${isFinalIncome ? 'text-green-600 dark:text-green-500' : isDepreciation ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>
                        {isFinalIncome ? '+' : '-'}{isValidAmount ? Math.abs(amount).toLocaleString() : 'N/A'}円
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-xs text-text-muted">
                      {new Date(transaction.date).toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="whitespace-nowrap inline-flex px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 dark:bg-surface-highlight text-slate-600 dark:text-gray-300 border border-slate-200 dark:border-white/5">
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
          {/* ... pagination (same) ... */}
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
            let startPage = Math.max(1, currentPage - 2);
            let endPage = Math.min(totalPages, startPage + 4);

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