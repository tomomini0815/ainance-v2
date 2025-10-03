
import React, { useState, useMemo, useRef } from 'react'
import { useTransactions } from '../hooks/useTransactions'
import Header from '../components/Header'
import {Search, Filter, Edit, Trash2, Plus, Calendar, DollarSign, Tag, FileText, Download, Upload, SquareCheck as CheckSquare, Square, BarChart3, TrendingUp, TrendingDown, Eye, PieChart, ArrowUpRight, ArrowDownRight, Zap, Clock, Target, Award, AlertTriangle, RefreshCw, Settings, BookOpen, MapPin, Repeat, Star, Users, Activity, Globe} from 'lucide-react'

const TransactionHistory: React.FC = () => {
  const { 
    transactions, 
    loading, 
    stats,
    updateTransaction, 
    deleteTransaction, 
    createTransaction,
    bulkDeleteTransactions,
    bulkUpdateTransactions,
    exportTransactions,
    importTransactions,
    searchTransactions
  } = useTransactions()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [amountRange, setAmountRange] = useState({ min: '', max: '' })
  const [editingTransaction, setEditingTransaction] = useState<any>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([])
  const [showStats, setShowStats] = useState(true)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'item'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'timeline'>('table')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 高度なフィルタリングとソート
  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = transactions.filter(transaction => {
      const matchesSearch = transaction.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           transaction.location?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = !categoryFilter || transaction.category === categoryFilter
      const matchesType = !typeFilter || transaction.type === typeFilter
      
      let matchesDate = true
      if (dateRange.start || dateRange.end) {
        const transactionDate = new Date(transaction.date)
        if (dateRange.start) {
          matchesDate = matchesDate && transactionDate >= new Date(dateRange.start)
        }
        if (dateRange.end) {
          matchesDate = matchesDate && transactionDate <= new Date(dateRange.end)
        }
      }
      
      let matchesAmount = true
      if (amountRange.min || amountRange.max) {
        if (amountRange.min) {
          matchesAmount = matchesAmount && transaction.amount >= Number(amountRange.min)
        }
        if (amountRange.max) {
          matchesAmount = matchesAmount && transaction.amount <= Number(amountRange.max)
        }
      }
      
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.some(tag => transaction.tags?.includes(tag))
      
      return matchesSearch && matchesCategory && matchesType && matchesDate && matchesAmount && matchesTags
    })

    // ソート
    filtered.sort((a, b) => {
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

    return filtered
  }, [transactions, searchTerm, categoryFilter, typeFilter, dateRange, amountRange, selectedTags, sortBy, sortOrder])

  // 現在のフィルター統計
  const currentStats = useMemo(() => {
    const income = filteredAndSortedTransactions
      .filter(t => t.category === '収入')
      .reduce((sum, t) => sum + t.amount, 0)
    const expense = filteredAndSortedTransactions
      .filter(t => t.category === '支出')
      .reduce((sum, t) => sum + t.amount, 0)
    
    return {
      totalTransactions: filteredAndSortedTransactions.length,
      totalIncome: income,
      totalExpense: expense,
      netAmount: income - expense,
      averageTransaction: filteredAndSortedTransactions.length > 0 ? 
        (income + expense) / filteredAndSortedTransactions.length : 0
    }
  }, [filteredAndSortedTransactions])

  // 利用可能なタグの取得
  const availableTags = useMemo(() => {
    const tags = new Set<string>()
    transactions.forEach(t => {
      t.tags?.forEach(tag => tags.add(tag))
    })
    return Array.from(tags)
  }, [transactions])

  // チェックボックス管理
  const toggleSelectTransaction = (transactionId: string) => {
    setSelectedTransactions(prev => 
      prev.includes(transactionId) 
        ? prev.filter(id => id !== transactionId)
        : [...prev, transactionId]
    )
  }

  const toggleSelectAll = () => {
    if (selectedTransactions.length === filteredAndSortedTransactions.length) {
      setSelectedTransactions([])
    } else {
      setSelectedTransactions(filteredAndSortedTransactions.map(t => t._id))
    }
  }

  // バルク操作
  const handleBulkDelete = async () => {
    if (selectedTransactions.length === 0) return
    
    if (confirm(`選択した${selectedTransactions.length}件の取引を削除してもよろしいですか？`)) {
      await bulkDeleteTransactions(selectedTransactions)
      setSelectedTransactions([])
    }
  }

  const handleBulkCategoryUpdate = async (newCategory: string) => {
    if (selectedTransactions.length === 0) return
    
    const updates = selectedTransactions.map(id => ({
      id,
      data: { category: newCategory }
    }))
    
    await bulkUpdateTransactions(updates)
    setSelectedTransactions([])
  }

  // ファイルインポート
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'text/csv') {
      importTransactions(file)
    } else {
      alert('CSVファイルを選択してください')
    }
  }

  // 高度な検索実行
  const executeAdvancedSearch = () => {
    const query: any = {}
    
    if (searchTerm) query.text = searchTerm
    if (dateRange.start || dateRange.end) query.dateRange = dateRange
    if (amountRange.min || amountRange.max) {
      query.amountRange = {
        min: Number(amountRange.min) || 0,
        max: Number(amountRange.max) || Infinity
      }
    }
    if (categoryFilter) query.categories = [categoryFilter]
    if (typeFilter) query.types = [typeFilter]
    if (selectedTags.length > 0) query.tags = selectedTags
    
    searchTransactions(query)
  }

  // フォーム送信処理
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    
    const transactionData = {
      item: formData.get('item') as string,
      amount: Number(formData.get('amount')),
      date: formData.get('date') as string,
      category: formData.get('category') as string,
      type: formData.get('type') as string,
      description: formData.get('description') as string,
      location: formData.get('location') as string,
      tags: (formData.get('tags') as string)?.split(',').map(t => t.trim()).filter(Boolean) || [],
      recurring: formData.get('recurring') === 'on',
      recurring_frequency: formData.get('recurring_frequency') as any,
      creator: 'user'
    }

    try {
      if (editingTransaction) {
        await updateTransaction(editingTransaction._id, transactionData)
        setEditingTransaction(null)
      } else {
        await createTransaction(transactionData)
        setShowCreateForm(false)
      }
      
      event.currentTarget.reset()
    } catch (error) {
      // エラーはフック内で処理済み
    }
  }

  // 削除処理
  const handleDelete = async (transactionId: string, itemName: string) => {
    if (confirm(`「${itemName}」を削除してもよろしいですか？`)) {
      await deleteTransaction(transactionId)
    }
  }

  // 編集開始
  const startEdit = (transaction: any) => {
    setEditingTransaction(transaction)
    setShowCreateForm(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 強化されたヘッダー */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">高度取引履歴管理システム</h1>
            <p className="text-gray-600">AI分析・予測機能搭載の包括的財務管理プラットフォーム</p>
            <div className="flex items-center mt-2 space-x-4">
              <div className="flex items-center text-sm text-green-600">
                <Activity className="w-4 h-4 mr-1" />
                <span>リアルタイム同期</span>
              </div>
              <div className="flex items-center text-sm text-blue-600">
                <Globe className="w-4 h-4 mr-1" />
                <span>クラウド保存</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-4 lg:mt-0">
            <button
              onClick={() => setShowStats(!showStats)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <BarChart3 size={18} />
              <span>詳細分析</span>
            </button>
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
            >
              <Filter size={18} />
              <span>高度検索</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileImport}
              accept=".csv"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
            >
              <Upload size={18} />
              <span>インポート</span>
            </button>
            <button
              onClick={() => exportTransactions('csv', true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Download size={18} />
              <span>エクスポート</span>
            </button>
            <button
              onClick={() => { setEditingTransaction(null); setShowCreateForm(true) }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>新規取引</span>
            </button>
          </div>
        </div>

        {/* 強化された統計ダッシュボード */}
        {showStats && stats && (
          <div className="mb-8 space-y-6">
            {/* メイン統計カード */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">総取引数</p>
                    <p className="text-2xl font-bold text-gray-900">{currentStats.totalTransactions}</p>
                    <p className="text-xs text-gray-500 mt-1">全体: {stats.transactionCount}件</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">収入合計</p>
                    <p className="text-2xl font-bold text-green-600">¥{currentStats.totalIncome.toLocaleString()}</p>
                    <div className="flex items-center mt-1">
                      <ArrowUpRight className="w-4 h-4 text-green-500" />
                      <span className="text-xs text-green-600">収入</span>
                    </div>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">支出合計</p>
                    <p className="text-2xl font-bold text-red-600">¥{currentStats.totalExpense.toLocaleString()}</p>
                    <div className="flex items-center mt-1">
                      <ArrowDownRight className="w-4 h-4 text-red-500" />
                      <span className="text-xs text-red-600">支出</span>
                    </div>
                  </div>
                  <div className="p-3 bg-red-100 rounded-lg">
                    <TrendingDown className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">純利益</p>
                    <p className={`text-2xl font-bold ${currentStats.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ¥{currentStats.netAmount.toLocaleString()}
                    </p>
                    <div className="flex items-center mt-1">
                      {currentStats.netAmount >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                      <span className={`text-xs ${currentStats.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {currentStats.netAmount >= 0 ? '利益' : '損失'}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${currentStats.netAmount >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                    <DollarSign className={`w-6 h-6 ${currentStats.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">平均取引額</p>
                    <p className="text-2xl font-bold text-purple-600">¥{currentStats.averageTransaction.toLocaleString()}</p>
                    <div className="flex items-center mt-1">
                      <Target className="w-4 h-4 text-purple-500" />
                      <span className="text-xs text-purple-600">平均値</span>
                    </div>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Target className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* 高度な分析セクション */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 月別トレンド */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  月別トレンド（過去12ヶ月）
                </h3>
                <div className="space-y-3">
                  {stats.monthlyTrend?.slice(-6).map((month, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{month.month}</span>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-green-600">+¥{month.income.toLocaleString()}</span>
                        <span className="text-sm text-red-600">-¥{month.expense.toLocaleString()}</span>
                        <span className={`text-sm font-semibold ${month.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ¥{month.net.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* トップ支出カテゴリ */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <PieChart className="w-5 h-5 mr-2" />
                  支出カテゴリ分析
                </h3>
                <div className="space-y-3">
                  {stats.topExpenseCategories?.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${
                          index === 0 ? 'bg-red-500' :
                          index === 1 ? 'bg-orange-500' :
                          index === 2 ? 'bg-yellow-500' :
                          index === 3 ? 'bg-green-500' : 'bg-blue-500'
                        }`}></div>
                        <span className="text-sm text-gray-600">{category.category}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900">¥{category.amount.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">{category.percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 予算分析と予測 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 予算差異分析 */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  予算差異分析
                </h3>
                <div className="space-y-3">
                  {Object.entries(stats.budgetVariance || {}).map(([category, data]) => (
                    <div key={category} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{category}</span>
                        <span className={`font-semibold ${data.variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {data.variance > 0 ? '+' : ''}{data.variance.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${data.variance > 0 ? 'bg-red-500' : 'bg-green-500'}`}
                          style={{ width: `${Math.min(Math.abs(data.variance), 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* キャッシュフロー予測 */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  キャッシュフロー予測
                </h3>
                <div className="space-y-3">
                  {stats.cashFlowProjection?.slice(0, 4).map((month, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{month.month}</span>
                      <span className={`text-sm font-semibold ${month.projected >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ¥{month.projected.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* その他の統計 */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  その他の統計
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">定期支払い</span>
                    <span className="text-sm font-semibold text-blue-600">{stats.recurringTransactions}件</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">日平均支出</span>
                    <span className="text-sm font-semibold text-purple-600">¥{stats.averageDailySpend?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">最大取引</span>
                    <span className="text-sm font-semibold text-orange-600">
                      ¥{stats.largestTransaction?.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">取引先数</span>
                    <span className="text-sm font-semibold text-green-600">{stats.frequentVendors?.length}社</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 高度な検索・フィルター */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="space-y-4">
            {/* 基本検索 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="relative lg:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="項目・説明・場所で検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">すべてのカテゴリ</option>
                <option value="収入">収入</option>
                <option value="支出">支出</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">すべてのタイプ</option>
                <option value="売上">売上</option>
                <option value="交通費">交通費</option>
                <option value="食費">食費</option>
                <option value="消耗品費">消耗品費</option>
                <option value="通信費">通信費</option>
                <option value="光熱費">光熱費</option>
              </select>

              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="開始日"
              />

              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="終了日"
              />
            </div>

            {/* 高度なフィルター */}
            {showAdvancedFilters && (
              <div className="border-t pt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <input
                    type="number"
                    placeholder="最小金額"
                    value={amountRange.min}
                    onChange={(e) => setAmountRange(prev => ({ ...prev, min: e.target.value }))}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="最大金額"
                    value={amountRange.max}
                    onChange={(e) => setAmountRange(prev => ({ ...prev, max: e.target.value }))}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">タグ選択</label>
                    <div className="flex flex-wrap gap-2">
                      {availableTags.map(tag => (
                        <button
                          key={tag}
                          onClick={() => {
                            setSelectedTags(prev => 
                              prev.includes(tag) 
                                ? prev.filter(t => t !== tag)
                                : [...prev, tag]
                            )
                          }}
                          className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                            selectedTags.includes(tag)
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={executeAdvancedSearch}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <Search size={16} />
                    <span>詳細検索実行</span>
                  </button>
                </div>
              </div>
            )}

            {/* 表示オプションとバルク操作 */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">表示:</span>
                  <select
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value as any)}
                    className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="table">テーブル</option>
                    <option value="cards">カード</option>
                    <option value="timeline">タイムライン</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">ソート:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="date">日付</option>
                    <option value="amount">金額</option>
                    <option value="item">項目名</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors"
                  >
                    {sortOrder === 'asc' ? '昇順' : '降順'}
                  </button>
                </div>
              </div>

              {selectedTransactions.length > 0 && (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">
                    {selectedTransactions.length}件選択中
                  </span>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleBulkCategoryUpdate(e.target.value)
                        e.target.value = ''
                      }
                    }}
                    className="px-3 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="">カテゴリ一括変更</option>
                    <option value="収入">収入</option>
                    <option value="支出">支出</option>
                  </select>
                  <button
                    onClick={handleBulkDelete}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                  >
                    <Trash2 size={16} />
                    <span>一括削除</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 取引一覧（テーブル表示） */}
        {viewMode === 'table' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <button
                        onClick={toggleSelectAll}
                        className="flex items-center space-x-2 text-sm font-medium text-gray-900"
                      >
                        {selectedTransactions.length === filteredAndSortedTransactions.length && filteredAndSortedTransactions.length > 0 ? (
                          <CheckSquare className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                        <span>選択</span>
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">取引項目</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-900">金額</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">日付</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">カテゴリ</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">タイプ</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">詳細</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAndSortedTransactions.map((transaction) => (
                    <tr key={transaction._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleSelectTransaction(transaction._id)}
                          className="flex items-center"
                        >
                          {selectedTransactions.includes(transaction._id) ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900 flex items-center">
                            {transaction.item}
                            {transaction.recurring && (
                              <Repeat className="w-4 h-4 text-blue-500 ml-2" title="定期支払い" />
                            )}
                          </div>
                          {transaction.description && (
                            <div className="text-sm text-gray-500">{transaction.description}</div>
                          )}
                          {transaction.tags && transaction.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {transaction.tags.map(tag => (
                                <span key={tag} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          {transaction.receipt_url && (
                            <div className="flex items-center mt-1">
                              <Eye className="w-3 h-3 text-gray-400 mr-1" />
                              <span className="text-xs text-gray-500">レシート添付</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`font-medium ${transaction.category === '収入' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.category === '収入' ? '+' : '-'}¥{transaction.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(transaction.date).toLocaleDateString('ja-JP')}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          transaction.category === '収入' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{transaction.type}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center items-center space-x-2">
                          {transaction.location && (
                            <div className="flex items-center text-xs text-gray-500">
                              <MapPin className="w-3 h-3 mr-1" />
                              <span>{transaction.location}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => startEdit(transaction)}
                            className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded"
                            title="編集"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(transaction._id, transaction.item)}
                            className="text-red-600 hover:text-red-800 transition-colors p-1 rounded"
                            title="削除"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredAndSortedTransactions.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">取引が見つかりません</h3>
                <p className="text-gray-500">検索条件を変更するか、新しい取引を作成してください。</p>
              </div>
            )}
          </div>
        )}

        {/* カード表示 */}
        {viewMode === 'cards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedTransactions.map((transaction) => (
              <div key={transaction._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <button
                      onClick={() => toggleSelectTransaction(transaction._id)}
                      className="mr-3"
                    >
                      {selectedTransactions.includes(transaction._id) ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    <div>
                      <h3 className="font-medium text-gray-900 flex items-center">
                        {transaction.item}
                        {transaction.recurring && (
                          <Repeat className="w-4 h-4 text-blue-500 ml-2" />
                        )}
                      </h3>
                      <p className="text-sm text-gray-500">{new Date(transaction.date).toLocaleDateString('ja-JP')}</p>
                    </div>
                  </div>
                  <span className={`text-lg font-bold ${transaction.category === '収入' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.category === '収入' ? '+' : '-'}¥{transaction.amount.toLocaleString()}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">カテゴリ:</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      transaction.category === '収入' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.category}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">タイプ:</span>
                    <span className="text-sm text-gray-900">{transaction.type}</span>
                  </div>
                  {transaction.location && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">場所:</span>
                      <span className="text-sm text-gray-900 flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {transaction.location}
                      </span>
                    </div>
                  )}
                </div>

                {transaction.description && (
                  <p className="text-sm text-gray-600 mb-4">{transaction.description}</p>
                )}

                {transaction.tags && transaction.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {transaction.tags.map(tag => (
                      <span key={tag} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex justify-between items-center">
                  {transaction.receipt_url && (
                    <div className="flex items-center text-xs text-gray-500">
                      <Eye className="w-3 h-3 mr-1" />
                      <span>レシート添付</span>
                    </div>
                  )}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => startEdit(transaction)}
                      className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded"
                      title="編集"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(transaction._id, transaction.item)}
                      className="text-red-600 hover:text-red-800 transition-colors p-1 rounded"
                      title="削除"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 強化された作成・編集フォーム */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {editingTransaction ? '取引を編集' : '新規取引を作成'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    name="item"
                    placeholder="取引項目"
                    defaultValue={editingTransaction?.item || ''}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    name="amount"
                    type="number"
                    placeholder="金額"
                    defaultValue={editingTransaction?.amount || ''}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    name="date"
                    type="date"
                    defaultValue={editingTransaction?.date?.split('T')[0] || new Date().toISOString().split('T')[0]}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <select
                    name="category"
                    defaultValue={editingTransaction?.category || ''}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">カテゴリを選択</option>
                    <option value="収入">収入</option>
                    <option value="支出">支出</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    name="type"
                    placeholder="タイプ（売上、交通費など）"
                    defaultValue={editingTransaction?.type || ''}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    name="location"
                    placeholder="場所（任意）"
                    defaultValue={editingTransaction?.location || ''}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <input
                  name="tags"
                  placeholder="タグ（カンマ区切り、任意）"
                  defaultValue={editingTransaction?.tags?.join(', ') || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                <textarea
                  name="description"
                  placeholder="詳細説明（任意）"
                  defaultValue={editingTransaction?.description || ''}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="recurring"
                      defaultChecked={editingTransaction?.recurring || false}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">定期支払い</span>
                  </label>
                  <select
                    name="recurring_frequency"
                    defaultValue={editingTransaction?.recurring_frequency || 'monthly'}
                    className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="daily">毎日</option>
                    <option value="weekly">毎週</option>
                    <option value="monthly">毎月</option>
                    <option value="yearly">毎年</option>
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingTransaction ? '更新' : '作成'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowCreateForm(false); setEditingTransaction(null) }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    キャンセル
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default TransactionHistory
