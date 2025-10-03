
import React from 'react'
import { Link } from 'react-router-dom'
import {ChevronRight} from 'lucide-react'

const TransactionTable: React.FC = () => {
  const transactions = [
    {
      item: 'ウェブデザイン制作費',
      amount: '¥150,000',
      date: '2023-09-15',
      category: '収入',
      categoryColor: 'bg-green-100 text-green-800'
    },
    {
      item: '交通費',
      amount: '¥2,200',
      date: '2023-09-14',
      category: '支出',
      categoryColor: 'bg-red-100 text-red-800'
    },
    {
      item: 'コンサルティング料金',
      amount: '¥300,000',
      date: '2023-09-10',
      category: '収入',
      categoryColor: 'bg-green-100 text-green-800'
    }
  ]

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">最近の履歴</h3>
        <Link 
          to="/transaction-history"
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
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-600 hidden sm:table-cell">日付</th>
              <th className="text-center py-3 px-2 text-sm font-medium text-gray-600">種別</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction, index) => (
              <tr key={index} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-4 px-2">
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{transaction.item}</div>
                    <div className="text-xs text-gray-500 sm:hidden">{transaction.date}</div>
                  </div>
                </td>
                <td className="py-4 px-2 text-right font-medium text-gray-900">{transaction.amount}</td>
                <td className="py-4 px-2 text-sm text-gray-600 hidden sm:table-cell">{transaction.date}</td>
                <td className="py-4 px-2 text-center">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${transaction.categoryColor}`}>
                    {transaction.category}
                  </span>
                </td>
              </tr>
            ))}
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

export default TransactionTable
