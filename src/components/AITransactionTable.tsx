import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Brain, CheckCircle, AlertCircle } from 'lucide-react'
import { useMySQLAITransactions } from '../hooks/useMySQLAITransactions'

interface AITransaction {
  id: string | number
  item: string
  amount: number
  category: string
  confidence: number
  ai_category: string
  manual_verified: boolean
  original_text?: string
  receipt_url?: string
  location?: string
  creator: string
  created_at?: string
  updated_at?: string
  ai_suggestions?: string[]
  learning_feedback?: string
  processing_time?: number
}

interface AITransactionTableProps {
  aiTransactions: AITransaction[];
  loading: boolean;
}

const AITransactionTable: React.FC<AITransactionTableProps> = ({ aiTransactions, loading }) => {
  const { fetchAITransactions } = useMySQLAITransactions();

  // カスタムイベントリスナーを追加して、取引が記録されたときにデータを再取得
  useEffect(() => {
    const handleTransactionRecorded = () => {
      fetchAITransactions();
    };

    window.addEventListener('transactionRecorded', handleTransactionRecorded);

    return () => {
      window.removeEventListener('transactionRecorded', handleTransactionRecorded);
    };
  }, [fetchAITransactions]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-surface rounded-2xl p-6 border border-border shadow-sm transition-all duration-200 hover:shadow-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-text-main">AI自動仕訳</h3>
          <Link
            to="/ai-transaction-list"
            className="flex items-center text-sm text-primary hover:text-primary/80 font-medium transition-colors"
          >
            詳細一覧
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  const displayedTransactions = [...aiTransactions]
    .sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5)

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    if (confidence >= 70) return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
  }

  const getStatusIcon = (verified: boolean) => {
    return verified ?
      <CheckCircle className="w-5 h-5 text-emerald-400 mx-auto" /> :
      <AlertCircle className="w-5 h-5 text-amber-400 mx-auto" />
  }

  return (
    <div className="bg-white dark:bg-surface rounded-2xl p-6 border border-border shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text-main">AI自動仕訳</h3>
        <Link
          to="/ai-transaction-list"
          className="flex items-center text-sm text-primary hover:text-primary/80 font-medium transition-colors"
        >
          詳細一覧
          <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
      </div>

      <div className="block md:hidden space-y-4">
        {displayedTransactions.length > 0 ? (
          displayedTransactions.map((transaction) => (
            <div key={transaction.id} className="bg-surface p-4 rounded-lg shadow-sm border border-border">
              <div className="flex justify-between items-start mb-2">
                <div className="font-medium text-text-main text-sm flex items-center">
                  <Brain className="w-4 h-4 text-purple-400 mr-2" />
                  {transaction.item}
                </div>
                <div className="text-right">
                  <div className="font-medium text-text-main">¥{Math.abs(transaction.amount).toLocaleString()}</div>
                  <div className="mt-1 flex justify-end">{getStatusIcon(transaction.manual_verified)}</div>
                </div>
              </div>

              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">カテゴリ:</span>
                  <span className="text-text-main">{transaction.ai_category}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-muted">信頼度:</span>
                  <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full border ${getConfidenceColor(transaction.confidence)}`}>
                    {transaction.confidence}%
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-text-muted">
            <div className="w-12 h-12 rounded-full bg-surface-highlight flex items-center justify-center mx-auto mb-3">
              <Brain className="w-6 h-6 text-slate-600" />
            </div>
            <p className="text-sm">AI分析データがありません</p>
          </div>
        )}
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase tracking-wider">項目</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-text-muted uppercase tracking-wider">金額</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase tracking-wider hidden sm:table-cell">カテゴリ</th>
              <th className="text-center py-3 px-4 text-xs font-medium text-text-muted uppercase tracking-wider">信頼度</th>
              <th className="text-center py-3 px-4 text-xs font-medium text-text-muted uppercase tracking-wider">状態</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {displayedTransactions.length > 0 ? (
              displayedTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-white/5 transition-colors group">
                  <td className="py-4 px-4">
                    <div className="font-medium text-text-main text-sm flex items-center group-hover:text-white transition-colors">
                      <Brain className="w-4 h-4 text-purple-400 mr-2" />
                      {transaction.item}
                    </div>
                    <div className="text-xs text-text-muted sm:hidden mt-0.5">{transaction.ai_category}</div>
                  </td>
                  <td className="py-4 px-4 text-right font-medium text-text-main">¥{Math.abs(transaction.amount).toLocaleString()}</td>
                  <td className="py-4 px-4 text-sm text-text-muted hidden sm:table-cell">{transaction.ai_category}</td>
                  <td className="py-4 px-4 text-center">
                    <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full border ${getConfidenceColor(transaction.confidence)}`}>
                      {transaction.confidence}%
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    {getStatusIcon(transaction.manual_verified)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-12 text-center text-text-muted">
                  <div className="w-12 h-12 rounded-full bg-surface-highlight flex items-center justify-center mx-auto mb-3">
                    <Brain className="w-6 h-6 text-slate-600" />
                  </div>
                  <p className="text-sm">AI分析データがありません</p>
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

export default AITransactionTable