import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, TrendingUp, TrendingDown, Plus, FileText } from 'lucide-react'

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
}

interface TransactionTableProps {
  transactions: Transaction[];
  onOpenCreateModal?: () => void;
  showCreateButton?: boolean;
}

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, onOpenCreateModal, showCreateButton = true }) => {
  const getCategoryIcon = (category: string, amount: number) => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    const isValidAmount = !isNaN(numericAmount) && isFinite(numericAmount);
    const isIncome = isValidAmount && numericAmount > 0;
    const isExpense = isValidAmount && numericAmount < 0;

    if (isIncome) {
      return <TrendingUp className="w-4 h-4 text-emerald-400 mr-2" />
    }

    if (isExpense) {
      return <TrendingDown className="w-4 h-4 text-rose-400 mr-2" />
    }

    const badgeClass = "inline-flex items-center justify-center w-6 h-6 rounded-full mr-2 text-xs font-bold";

    switch (category) {
      case '交通費':
        return <span className={`${badgeClass} bg-blue-500/20 text-blue-400`}>交</span>
      case '食費':
        return <span className={`${badgeClass} bg-emerald-500/20 text-emerald-400`}>食</span>
      case '消耗品費':
        return <span className={`${badgeClass} bg-purple-500/20 text-purple-400`}>消</span>
      case '通信費':
        return <span className={`${badgeClass} bg-amber-500/20 text-amber-400`}>通</span>
      case '光熱費':
        return <span className={`${badgeClass} bg-rose-500/20 text-rose-400`}>光</span>
      default:
        return <span className={`${badgeClass} bg-slate-500/20 text-text-muted`}>他</span>
    }
  }

  const latestTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  return (
    <div className="bg-white dark:bg-surface rounded-2xl p-6 border border-border shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text-main">最近の履歴</h3>
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

      <div className="overflow-x-auto">
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
              latestTransactions.map((transaction) => {
                const amount = typeof transaction.amount === 'string'
                  ? parseFloat(transaction.amount)
                  : typeof transaction.amount === 'number'
                    ? transaction.amount
                    : 0;

                const isValidAmount = !isNaN(amount) && isFinite(amount);
                const isExplicitIncome = transaction.type === 'income';
                const isExplicitExpense = transaction.type === 'expense';

                const isFinalIncome = isExplicitIncome || (isValidAmount && amount > 0);
                const isFinalExpense = isExplicitExpense || (isValidAmount && amount < 0);

                return (
                  <tr key={transaction.id} className="hover:bg-white/5 transition-colors group">
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        {getCategoryIcon(transaction.category, amount)}
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
                          <TrendingUp className="w-3 h-3 text-emerald-400 mr-1.5" /> :
                          isFinalExpense ?
                            <TrendingDown className="w-3 h-3 text-rose-400 mr-1.5" /> :
                            null
                        }
                        <span className={isFinalIncome ? 'text-emerald-400' : isFinalExpense ? 'text-rose-400' : 'text-text-muted'}>
                          {isFinalIncome ? '+' : isFinalExpense ? '' : ''}{isValidAmount ? Math.abs(amount).toLocaleString() : 'N/A'}
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
                      <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full border ${isFinalIncome ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          isFinalExpense ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                            'bg-slate-500/10 text-text-muted border-slate-500/20'
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