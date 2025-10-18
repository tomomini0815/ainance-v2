import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Search, Filter, Plus, ChevronDown, Calendar, DollarSign, Tag, FileText, Download, Trash2, Edit, TrendingUp, TrendingDown, X, Upload } from 'lucide-react'
import { useMySQLTransactions } from '../hooks/useMySQLTransactions'
import TransactionTable from '../components/TransactionTable'
import TransactionForm from '../components/TransactionForm'

const TransactionHistory: React.FC = () => {
  const { transactions, loading, createTransaction, updateTransaction, deleteTransaction } = useMySQLTransactions()
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<any>(null)
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [amountRange, setAmountRange] = useState({ min: '', max: '' })
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'item'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // 利用可能なカテゴリの取得
  const availableCategories = useMemo(() => {
    const categories = transactions.map(t => t.category)
    return Array.from(new Set(categories)).filter(Boolean) as string[]
  }, [transactions])

  // フィルタリングとソートされたトランザクション
  const filteredAndSortedTransactions = useMemo(() => {
    let result = [...transactions]
    
    // 検索フィルタ
    if (searchTerm) {
      result = result.filter(transaction => 
        (transaction.item && transaction.item.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (transaction.description && transaction.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (transaction.category && transaction.category.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }
    
    // カテゴリフィルタ
    if (categoryFilter) {
      result = result.filter(transaction => transaction.category === categoryFilter)
    }
    
    // 日付範囲フィルタ
    if (dateRange.start) {
      result = result.filter(transaction => transaction.date >= dateRange.start)
    }
    if (dateRange.end) {
      result = result.filter(transaction => transaction.date <= dateRange.end)
    }
    
    // 金額範囲フィルタ
    if (amountRange.min) {
      result = result.filter(transaction => transaction.amount >= Number(amountRange.min))
    }
    if (amountRange.max) {
      result = result.filter(transaction => transaction.amount <= Number(amountRange.max))
    }
    
    // ソート
    result.sort((a, b) => {
      let aValue: any, bValue: any
      switch (sortBy) {
        case 'amount':
          aValue = a.amount
          bValue = b.amount
          break
        case 'item':
          aValue = a.item.toLowerCase()
          bValue = b.item.toLowerCase()
          break
        default:
          aValue = new Date(a.date)
          bValue = new Date(b.date)
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
    
    return result
  }, [transactions, searchTerm, categoryFilter, dateRange, amountRange, sortBy, sortOrder])

  // ページネーション
  const totalPages = Math.ceil(filteredAndSortedTransactions.length / itemsPerPage)
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    const end = start + itemsPerPage
    return filteredAndSortedTransactions.slice(start, end)
  }, [filteredAndSortedTransactions, currentPage])

  // 統計情報
  const stats = useMemo(() => {
    const totalIncome = transactions
      .filter(t => parseFloat(t.amount as any) > 0)
      .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount as any)), 0)
      
    const totalExpense = transactions
      .filter(t => parseFloat(t.amount as any) < 0)
      .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount as any)), 0)
      
    return {
      total: transactions.length,
      income: totalIncome,
      expense: totalExpense,
      balance: totalIncome - totalExpense
    }
  }, [transactions])

  // チェックボックス操作
  const toggleSelectAll = () => {
    if (selectedTransactions.length === paginatedTransactions.length) {
      setSelectedTransactions([])
    } else {
      setSelectedTransactions(paginatedTransactions.map(t => t.id))
    }
  }

  const toggleSelectTransaction = (id: string) => {
    if (selectedTransactions.includes(id)) {
      setSelectedTransactions(selectedTransactions.filter(transactionId => transactionId !== id))
    } else {
      setSelectedTransactions([...selectedTransactions, id])
    }
  }

  // 一括削除
  const handleBulkDelete = async () => {
    if (window.confirm(`${selectedTransactions.length}件の取引を削除してもよろしいですか？`)) {
      try {
        for (const id of selectedTransactions) {
          await deleteTransaction(id)
        }
        setSelectedTransactions([])
      } catch (error) {
        console.error('一括削除に失敗:', error)
      }
    }
  }

  // 新規取引の作成
  const handleCreateTransaction = async (transactionData: any) => {
    try {
      // creatorフィールドをローカルストレージから取得したユーザー情報で設定
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser)
          transactionData.creator = userData.id
        } catch (error) {
          console.error('ユーザー情報の解析に失敗しました:', error)
        }
      }
      
      await createTransaction(transactionData)
      setShowCreateForm(false)
    } catch (error) {
      console.error('取引の作成に失敗:', error)
      // エラーはuseMySQLTransactionsフック内で処理されるため、ここでは追加の処理は不要
    }
  }

  // 既存取引の更新
  const handleUpdateTransaction = async (transactionData: any) => {
    if (!editingTransaction) return
    try {
      await updateTransaction(editingTransaction.id, transactionData)
      setEditingTransaction(null)
    } catch (error) {
      console.error('取引の更新に失敗:', error)
    }
  }

  // フィルタのリセット
  const resetFilters = () => {
    setCategoryFilter('')
    setDateRange({ start: '', end: '' })
    setAmountRange({ min: '', max: '' })
    setSearchTerm('')
  }

  // アクティブなフィルターの数をカウント
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (categoryFilter) count++
    if (dateRange.start || dateRange.end) count++
    if (amountRange.min || amountRange.max) count++
    return count
  }, [categoryFilter, dateRange, amountRange])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">データを読み込んでいます...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ヘッダー */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center mb-2">
              <Link to="/dashboard" className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <ArrowLeft className="w-6 h-6 text-gray-600 hover:text-gray-900" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">取引履歴</h1>
                <p className="text-gray-600 mt-1">すべての取引履歴を確認・管理できます</p>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-sm font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              新規取引
            </button>
          </div>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-500">総取引数</div>
                <div className="text-2xl font-bold mt-1 text-gray-900">{stats.total}</div>
              </div>
              <div className="rounded-lg bg-blue-50 p-3">
                <FileText className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-500">収入</div>
                <div className="text-2xl font-bold mt-1 text-green-600">¥{stats.income.toLocaleString()}</div>
              </div>
              <div className="rounded-lg bg-green-50 p-3">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-500">支出</div>
                <div className="text-2xl font-bold mt-1 text-red-600">¥{stats.expense.toLocaleString()}</div>
              </div>
              <div className="rounded-lg bg-red-50 p-3">
                <TrendingDown className="w-6 h-6 text-red-500" />
              </div>
            </div>
          </div>
          <div className={`rounded-xl shadow-sm p-5 border hover:shadow-md transition-shadow ${
            stats.balance >= 0 ? 'border-green-100 bg-green-50' : 'border-red-100 bg-red-50'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-500">収支</div>
                <div className={`text-2xl font-bold mt-1 ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ¥{stats.balance.toLocaleString()}
                </div>
              </div>
              <div className={`rounded-lg p-3 ${stats.balance >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <DollarSign className={`w-6 h-6 ${stats.balance >= 0 ? 'text-green-500' : 'text-red-500'}`} />
              </div>
            </div>
          </div>
        </div>

        {/* フィルターと検索 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
          <div className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="取引内容、カテゴリなどで検索..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-2.5 text-sm rounded-lg transition-colors flex items-center space-x-2 ${
                    showFilters 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  <span>フィルタ</span>
                  {activeFilterCount > 0 && (
                    <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                  <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
                {(categoryFilter || dateRange.start || dateRange.end || amountRange.min || amountRange.max) && (
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                  >
                    <X className="w-4 h-4 mr-1" />
                    クリア
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {showFilters && (
            <div className="px-4 pb-4 border-t border-gray-100">
              <div className="pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">カテゴリ</label>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
                    >
                      <option value="">すべて</option>
                      {availableCategories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">開始日</label>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">終了日</label>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">最小金額</label>
                    <input
                      type="number"
                      value={amountRange.min}
                      onChange={(e) => setAmountRange({...amountRange, min: e.target.value})}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">最大金額</label>
                    <input
                      type="number"
                      value={amountRange.max}
                      onChange={(e) => setAmountRange({...amountRange, max: e.target.value})}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ソートと一括操作 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
          <div className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <label className="text-sm text-gray-700 mr-2">ソート:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
                  >
                    <option value="date">日付</option>
                    <option value="amount">金額</option>
                    <option value="item">項目</option>
                  </select>
                </div>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                >
                  {sortOrder === 'asc' ? '昇順' : '降順'}
                </button>
              </div>
              
              {selectedTransactions.length > 0 && (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">{selectedTransactions.length}件選択中</span>
                  <button
                    onClick={handleBulkDelete}
                    className="px-3 py-2 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors flex items-center"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    削除
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* トランザクションテーブル */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                    <input
                      type="checkbox"
                      checked={selectedTransactions.length === paginatedTransactions.length && paginatedTransactions.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">項目</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">金額</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">日付</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">カテゴリ</th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {paginatedTransactions.length > 0 ? (
                  paginatedTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedTransactions.includes(transaction.id)}
                          onChange={() => toggleSelectTransaction(transaction.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{transaction.item}</div>
                        <div className="text-sm text-gray-500 sm:hidden">
                          {new Date(transaction.date).toLocaleDateString('ja-JP', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end">
                          {transaction.type === 'income' ? 
                            <TrendingUp className="w-4 h-4 text-green-500 mr-1" /> : 
                            <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                          }
                          <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                            {transaction.type === 'expense' ? '-' : ''}{transaction.amount.toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                        {new Date(transaction.date).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${
                          transaction.type === 'income' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => {
                              setEditingTransaction(transaction)
                              setShowCreateForm(true)
                            }}
                            className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteTransaction(transaction.id)}
                            className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <FileText className="w-12 h-12 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">取引が見つかりません</h3>
                        <p className="text-gray-500">条件に一致する取引がありません</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* ページネーション */}
          {paginatedTransactions.length > 0 && (
            <div className="bg-white px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  前へ
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  次へ
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">{Math.min((currentPage - 1) * itemsPerPage + 1, filteredAndSortedTransactions.length)}</span>
                    &nbsp;件から&nbsp;
                    <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredAndSortedTransactions.length)}</span>
                    &nbsp;件までを表示中（全&nbsp;
                    <span className="font-medium">{filteredAndSortedTransactions.length}</span>
                    &nbsp;件）
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <span className="sr-only">前へ</span>
                      &lt;
                    </button>
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      const pageNum = Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === pageNum
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <span className="sr-only">次へ</span>
                      &gt;
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 新規取引作成/編集モーダル */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingTransaction ? '取引を編集' : '新規取引'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateForm(false)
                    setEditingTransaction(null)
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <TransactionForm
                transaction={editingTransaction}
                onSubmit={editingTransaction ? handleUpdateTransaction : handleCreateTransaction}
                onCancel={() => {
                  setShowCreateForm(false)
                  setEditingTransaction(null)
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TransactionHistory