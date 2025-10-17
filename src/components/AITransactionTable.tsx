import React from 'react'
import { Link } from 'react-router-dom'
import {ChevronRight, Brain, CheckCircle, AlertCircle} from 'lucide-react'
import { useMySQLTransactions } from '../hooks/useMySQLTransactions' // MySQL用のフックを使用

const AITransactionTable: React.FC = () => {
  const { aiTransactions, loading } = useMySQLTransactions() // MySQL用のフックを使用して最新データを取得

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">AI自動仕訳</h3>
          <Link 
            to="/ai-transaction-list"
            className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            詳細一覧
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  // 最初の5件のみ表示（日付降順）
  const displayedTransactions = [...aiTransactions]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  // 信頼度に基づく色の取得
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'bg-green-100 text-green-800'
    if (confidence >= 70) return 'bg-blue-100 text-blue-800'
    return 'bg-yellow-100 text-yellow-800'
  }

  // カテゴリアイコンの取得
  const getCategoryIcon = (category: string) => {
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

  // カテゴリ選択ボタン
  const CategorySelector = ({ currentCategory, onSelect }: { currentCategory: string; onSelect: (category: string) => void }) => {
    const categories = ['交通費', '食費', '消耗品費', '通信費', '光熱費', 'その他']
    
    return (
      <div className="flex flex-wrap gap-1">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => onSelect(category)}
            className={`px-2 py-1 text-xs rounded-full transition-colors ${
              currentCategory === category
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {getCategoryIcon(category)}
            {category}
          </button>
        ))}
      </div>
    )
  }

  // 状態アイコンの取得
  const getStatusIcon = (verified: boolean) => {
    return verified ? 
      <CheckCircle className="w-5 h-5 text-green-500 mx-auto" /> :
      <AlertCircle className="w-5 h-5 text-yellow-500 mx-auto" />
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">AI自動仕訳</h3>
        <Link 
          to="/ai-transaction-list"
          className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          詳細一覧
          <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
      
      <div className="table-container">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">項目</th>
              <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">金額</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-600 hidden sm:table-cell">カテゴリ</th>
              <th className="text-center py-3 px-2 text-sm font-medium text-gray-600">信頼度</th>
              <th className="text-center py-3 px-2 text-sm font-medium text-gray-600">状態</th>
            </tr>
          </thead>
          <tbody>
            {displayedTransactions.length > 0 ? (
              displayedTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-4 px-2">
                    <div className="font-medium text-gray-900 text-sm flex items-center">
                      <Brain className="w-4 h-4 text-purple-500 mr-2" />
                      {transaction.item}
                    </div>
                    <div className="text-xs text-gray-500 sm:hidden">{transaction.ai_category}</div>
                  </td>
                  <td className="py-4 px-2 text-right font-medium text-gray-900">¥{Math.abs(transaction.amount).toLocaleString()}</td>
                  <td className="py-4 px-2 text-sm text-gray-600 hidden sm:table-cell">{transaction.ai_category}</td>
                  <td className="py-4 px-2 text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getConfidenceColor(transaction.confidence)}`}>
                      {transaction.confidence}%
                    </span>
                  </td>
                  <td className="py-4 px-2 text-center">
                    {getStatusIcon(transaction.manual_verified)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">
                  <Brain className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                  <p>AI分析データがありません</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* ページネーション */}
      <div className="flex items-center justify-center mt-4 space-x-2">
        <button className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
          1
        </button>
        <button className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-sm font-medium hover:bg-gray-200">
          2
        </button>
        <button className="p-2">
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </div>
  )
}

export default AITransactionTable