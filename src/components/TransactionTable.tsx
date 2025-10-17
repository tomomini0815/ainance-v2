import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, TrendingUp, TrendingDown, Plus, Calendar, Tag, FileText } from 'lucide-react'
import { useMySQLTransactions } from '../hooks/useMySQLTransactions' // MySQL用のフックをインポート

interface Transaction {
  id: number
  item: string
  amount: number
  date: string
  category: string
  type: string
  description?: string
  receipt_url?: string
  creator: string
  created_at: string
  updated_at: string
  tags?: string[]
  location?: string
  recurring?: boolean
  recurring_frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly'
}

interface TransactionTableProps {
  onOpenCreateModal?: () => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({ onOpenCreateModal }) => {
  const { transactions } = useMySQLTransactions() // MySQL用のフックを使用して最新データを取得

  // カテゴリアイコンの取得
  const getCategoryIcon = (category: string, type: string) => {
    if (type === 'income') {
      return <TrendingUp className="w-4 h-4 text-green-500 mr-2" />
    }
    
    switch (category) {
      case '交通費':
        return <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 mr-2">交</span>
      case '食費':
        return <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600 mr-2">食</span>
      case '消耗品費':
        return <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-600 mr-2">消</span>
      case '通信費':
        return <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-100 text-yellow-600 mr-2">通</span>
      case '光熱費':
        return <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600 mr-2">光</span>
      default:
        return <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-600 mr-2">他</span>
    }
  }

  // 最新の5件の取引を取得（日付降順）
  const latestTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">最近の履歴</h3>
        <div className="flex items-center space-x-2">
          <Link 
            to="/transaction-history"
            className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            詳細一覧
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
          <button 
            onClick={onOpenCreateModal}
            className="flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            新規作成
          </button>
        </div>
      </div>
      
      <div className="table-container">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">項目</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">金額</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 hidden sm:table-cell">日付</th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">カテゴリ</th>
            </tr>
          </thead>
          <tbody>
            {latestTransactions.length > 0 ? (
              latestTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      {getCategoryIcon(transaction.category, transaction.type)}
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{transaction.item}</div>
                        <div className="text-xs text-gray-500 sm:hidden">
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
                      {parseFloat(transaction.amount as any) > 0 ? 
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" /> : 
                        <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                      }
                      <span className={parseFloat(transaction.amount as any) > 0 ? 'text-green-600' : 'text-red-600'}>
                        {parseFloat(transaction.amount as any) < 0 ? '-' : ''}{Math.abs(parseFloat(transaction.amount as any)).toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600 hidden sm:table-cell">
                    {new Date(transaction.date).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
                      parseFloat(transaction.amount as any) > 0
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.category}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-8 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <FileText className="w-10 h-10 text-gray-300 mb-2" />
                    <p className="text-gray-500 text-sm">取引がありません</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* ページネーション */}
      <div className="flex items-center justify-center mt-6 space-x-2">
        <button className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium hover:bg-blue-700 transition-colors">
          1
        </button>
        <button className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-sm font-medium hover:bg-gray-200 transition-colors">
          2
        </button>
        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default TransactionTable