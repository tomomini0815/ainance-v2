import React, { useState, useMemo, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowLeft, Search, Filter, Plus, ChevronDown, JapaneseYen, FileText, Trash2, Edit, TrendingUp, TrendingDown, X, Repeat } from 'lucide-react'
import TransactionIcon from '../components/TransactionIcon'
import { useTransactions } from '../hooks/useTransactions'
import TransactionForm from '../components/TransactionForm'
import { useBusinessTypeContext } from '../context/BusinessTypeContext'
import { useAuth } from '../hooks/useAuth'
import OmniEntryPortal from '../components/OmniEntryPortal'

const TransactionHistory: React.FC = () => {
  const { currentBusinessType } = useBusinessTypeContext()
  const { user: authUser } = useAuth();
  const { transactions, loading, updateTransaction, deleteTransaction, fetchTransactions } = useTransactions(authUser?.id, currentBusinessType?.business_type)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<any>(null)
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [amountRange, setAmountRange] = useState({ min: '', max: '' })
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'item' | 'created_at'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // データの再取得
  useEffect(() => {
    if (currentBusinessType?.id) {
      fetchTransactions();
    }
  }, [currentBusinessType, fetchTransactions]);

  // URLクエリパラメータから検索語を取得
  const location = useLocation();
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get('search');
    if (query) {
      setSearchTerm(query);
    }
  }, [location.search]);

  // カスタムイベントリスナーを追加して、取引が記録されたときにデータを再取得
  useEffect(() => {
    const handleTransactionRecorded = async () => {
      if (currentBusinessType?.id) {
        // 少し遅延させてからデータを再取得する
        await new Promise(resolve => setTimeout(resolve, 100));
        fetchTransactions();
      }
    };

    window.addEventListener('transactionRecorded', handleTransactionRecorded);

    return () => {
      window.removeEventListener('transactionRecorded', handleTransactionRecorded);
    };
  }, [currentBusinessType, fetchTransactions]);

  // 承認イベントリスナーを追加して、取引が承認されたときにデータを再取得
  useEffect(() => {
    const handleTransactionApproved = async () => {
      console.log('transactionApprovedイベントを受信');
      if (currentBusinessType?.id) {
        // 少し遅延させてからデータを再取得する
        await new Promise(resolve => setTimeout(resolve, 100));
        fetchTransactions();
      }
    };

    window.addEventListener('transactionApproved', handleTransactionApproved);

    return () => {
      window.removeEventListener('transactionApproved', handleTransactionApproved);
    };
  }, [currentBusinessType, fetchTransactions]);

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
        case 'created_at':
          aValue = a.created_at ? new Date(a.created_at) : new Date(0)
          bValue = b.created_at ? new Date(b.created_at) : new Date(0)
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
    // amountの値を安全に取得するヘルパー関数
    const getAmountValue = (amount: any): number => {
      if (typeof amount === 'number') return amount;
      if (typeof amount === 'string') {
        const parsed = parseFloat(amount.replace(/,/g, ''));
        return isNaN(parsed) ? 0 : parsed;
      }
      return 0;
    };

    const incomeTransactions = transactions.filter(t => t.type === 'income' && t.approval_status !== 'pending');
    const expenseTransactions = transactions.filter(t => t.type === 'expense' && t.approval_status !== 'pending');

    const totalIncome = incomeTransactions.reduce((sum, t) => sum + getAmountValue(t.amount), 0);
    const totalExpense = expenseTransactions.reduce((sum, t) => sum + getAmountValue(t.amount), 0);

    return {
      total: transactions.length,
      income: totalIncome,
      expense: totalExpense,
      balance: totalIncome - totalExpense,
      pendingCount: transactions.filter(t => t.approval_status === 'pending').length
    };
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
    if (window.confirm(`${selectedTransactions.length} 件の取引を削除してもよろしいですか？`)) {
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

  // 既存取引の更新
  const handleUpdateTransaction = async (transactionData: any) => {
    if (!editingTransaction) return
    try {
      const result = await updateTransaction(editingTransaction.id, transactionData)
      if (result.error) throw result.error;

      await new Promise(resolve => setTimeout(resolve, 100));
      await fetchTransactions();
      window.dispatchEvent(new CustomEvent('transactionRecorded'));

      setEditingTransaction(null)
      setShowCreateForm(false)
    } catch (error: any) {
      console.error('取引の更新に失敗:', error)
      alert(`取引の更新に失敗しました: ${error.message || '不明なエラーが発生しました'} `);
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-muted">データを読み込んでいます...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ヘッダー */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center mb-2">
              <Link to="/dashboard" className="mr-4 p-2 rounded-lg hover:bg-surface-highlight transition-colors">
                <ArrowLeft className="w-6 h-6 text-text-muted hover:text-text-main" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-text-main">取引履歴</h1>
                <p className="text-text-muted mt-1">すべての取引履歴を確認・管理できます</p>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              新規取引
            </button>
          </div>
        </div>

        {/* 統計カード */}
        <div className="bg-surface rounded-xl shadow-sm p-4 border border-border hover:shadow-md transition-shadow mb-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="border border-border rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium text-text-muted">総取引数</div>
                <div className="rounded-lg bg-primary/5 p-2">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div className="text-xl font-bold text-primary mt-1">{stats.total}</div>
            </div>
            <div className="border border-border rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium text-text-muted">収入</div>
                <div className="rounded-lg bg-green-500/5 p-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
              </div>
              <div className="text-xl font-bold text-green-500 mt-1">¥{stats.income.toLocaleString()}</div>
            </div>
            <div className="border border-border rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium text-text-muted">支出</div>
                <div className="rounded-lg bg-red-500/5 p-2">
                  <TrendingDown className="w-5 h-5 text-red-500" />
                </div>
              </div>
              <div className="text-xl font-bold text-red-500 mt-1">¥{stats.expense.toLocaleString()}</div>
            </div>
            <div className="border border-border rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium text-text-muted">収支</div>
                <div className={`rounded - lg p - 2 ${stats.balance >= 0 ? 'bg-green-500/5' : 'bg-red-500/5'} `}>
                  <JapaneseYen className={`w - 5 h - 5 ${stats.balance >= 0 ? 'text-green-500' : 'text-red-500'} `} />
                </div>
              </div>
              <div className={`text - xl font - bold mt - 1 ${stats.balance >= 0 ? 'text-green-500' : 'text-red-500'} `}>
                ¥{stats.balance.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* フィルターと検索 */}
        <div className="bg-surface rounded-xl shadow-sm border border-border mb-6 overflow-hidden">
          <div className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="取引内容、カテゴリなどで検索..."
                    className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background focus:bg-surface transition-colors text-text-main placeholder-text-muted"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px - 4 py - 2.5 text - sm rounded - lg transition - colors flex items - center space - x - 2 ${showFilters
                    ? 'bg-primary/10 text-primary'
                    : 'bg-surface-highlight text-text-muted hover:bg-border'
                    } `}
                >
                  <Filter className="w-4 h-4" />
                  <span>フィルタ</span>
                  {activeFilterCount > 0 && (
                    <span className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                  <ChevronDown className={`w - 4 h - 4 transition - transform ${showFilters ? 'rotate-180' : ''} `} />
                </button>
                {(categoryFilter || dateRange.start || dateRange.end || amountRange.min || amountRange.max) && (
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2.5 text-sm bg-surface-highlight text-text-muted rounded-lg hover:bg-border transition-colors flex items-center"
                  >
                    <X className="w-4 h-4 mr-1" />
                    クリア
                  </button>
                )}
              </div>
            </div>
          </div>

          {showFilters && (
            <div className="px-4 pb-4 border-t border-border">
              <div className="pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">カテゴリ</label>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="input-base"
                    >
                      <option value="">すべて</option>
                      {availableCategories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">開始日</label>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                      className="input-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">終了日</label>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                      className="input-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">最小金額</label>
                    <input
                      type="number"
                      value={amountRange.min}
                      onChange={(e) => setAmountRange({ ...amountRange, min: e.target.value })}
                      className="input-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">最大金額</label>
                    <input
                      type="number"
                      value={amountRange.max}
                      onChange={(e) => setAmountRange({ ...amountRange, max: e.target.value })}
                      className="input-base"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ソートと一括操作 */}
        <div className="bg-surface rounded-xl shadow-sm border border-border mb-6 overflow-hidden">
          <div className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <label className="text-sm text-text-muted mr-2">ソート:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background focus:bg-surface transition-colors text-text-main"
                  >
                    <option value="date">日付</option>
                    <option value="amount">金額</option>
                    <option value="item">項目</option>
                    <option value="created_at">登録</option>
                  </select>
                </div>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 text-sm bg-surface-highlight text-text-muted rounded-lg hover:bg-border transition-colors flex items-center"
                >
                  {sortOrder === 'asc' ? '昇順' : '降順'}
                </button>
              </div>

              {selectedTransactions.length > 0 && (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-text-muted">{selectedTransactions.length}件選択中</span>
                  <button
                    onClick={handleBulkDelete}
                    className="px-3 py-2 text-sm bg-red-500/10 text-red-600 rounded-lg hover:bg-red-500/20 transition-colors flex items-center"
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
        <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
          {/* モバイル: カード表示 */}
          <div className="block md:hidden divide-y divide-border">
            {paginatedTransactions.length > 0 ? (
              paginatedTransactions.map((transaction) => (
                <div key={transaction.id} className="p-4 hover:bg-surface-highlight transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedTransactions.includes(transaction.id)}
                        onChange={() => toggleSelectTransaction(transaction.id)}
                        className="rounded border-border text-primary focus:ring-primary h-4 w-4 bg-background"
                      />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <TransactionIcon item={transaction.item} category={transaction.category} size="sm" />
                          <div className="font-medium text-text-main">{transaction.item}</div>
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
                    <div className="text-right">
                      <div className={`font - bold ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'} `}>
                        {transaction.type === 'expense' ? '-' : ''}¥{transaction.amount.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-slate-500/10 text-text-muted">
                      {transaction.category}
                    </span>

                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => {
                          setEditingTransaction(transaction)
                          setShowCreateForm(true)
                        }}
                        className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-all shadow-sm flex items-center gap-1 text-xs whitespace-nowrap"
                      >
                        <Edit className="w-4 h-4" />
                        編集
                      </button>
                      <button
                        onClick={() => deleteTransaction(transaction.id)}
                        className="p-2 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all shadow-sm flex items-center gap-1 text-xs whitespace-nowrap"
                      >
                        <Trash2 className="w-4 h-4" />
                        削除
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <FileText className="w-12 h-12 text-text-muted mx-auto mb-4" />
                <h3 className="text-lg font-medium text-text-main mb-1">取引が見つかりません</h3>
                <p className="text-text-muted">条件に一致する取引がありません</p>
              </div>
            )}
          </div>

          {/* デスクトップ: テーブル表示 */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-highlight">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase tracking-wider w-12">
                    <input
                      type="checkbox"
                      checked={selectedTransactions.length === paginatedTransactions.length && paginatedTransactions.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-border text-primary focus:ring-primary h-4 w-4 bg-background"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase tracking-wider">項目</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-text-muted uppercase tracking-wider">金額</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase tracking-wider hidden sm:table-cell">日付</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase tracking-wider">カテゴリ</th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-text-muted uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-surface divide-y divide-border">
                {paginatedTransactions.length > 0 ? (
                  paginatedTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-surface-highlight transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedTransactions.includes(transaction.id)}
                          onChange={() => toggleSelectTransaction(transaction.id)}
                          className="rounded border-border text-primary focus:ring-primary h-4 w-4 bg-background"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <TransactionIcon item={transaction.item} category={transaction.category} size="sm" />
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-medium text-text-main">{transaction.item}</div>
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
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <span className={transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}>
                          {transaction.type === 'income' ? '+' : '-'}¥{transaction.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted hidden sm:table-cell">
                        {new Date(transaction.date).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="whitespace-nowrap px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-slate-500/10 text-text-muted">
                          {transaction.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setEditingTransaction(transaction)
                              setShowCreateForm(true)
                            }}
                            className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-all shadow-sm flex items-center gap-1 text-xs whitespace-nowrap"
                          >
                            <Edit className="w-4 h-4" />
                            編集
                          </button>
                          <button
                            onClick={() => deleteTransaction(transaction.id)}
                            className="p-2 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all shadow-sm flex items-center gap-1 text-xs whitespace-nowrap"
                          >
                            <Trash2 className="w-4 h-4" />
                            削除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <FileText className="w-12 h-12 text-text-muted mb-4" />
                        <h3 className="text-lg font-medium text-text-main mb-1">取引が見つかりません</h3>
                        <p className="text-text-muted">条件に一致する取引がありません</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table >
          </div >

          {/* ページネーション */}
          {
            paginatedTransactions.length > 0 && (
              <div className="bg-surface px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-border text-sm font-medium rounded-md text-text-muted bg-surface hover:bg-surface-highlight disabled:opacity-50"
                  >
                    前へ
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-border text-sm font-medium rounded-md text-text-muted bg-surface hover:bg-surface-highlight disabled:opacity-50"
                  >
                    次へ
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-text-muted">
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
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-border bg-surface text-sm font-medium text-text-muted hover:bg-surface-highlight disabled:opacity-50"
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
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === pageNum
                              ? 'z-10 bg-primary/10 border-primary text-primary'
                              : 'bg-surface border-border text-text-muted hover:bg-surface-highlight'
                              } `}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-border bg-surface text-sm font-medium text-text-muted hover:bg-surface-highlight disabled:opacity-50"
                      >
                        <span className="sr-only">次へ</span>
                        &gt;
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )
          }
        </div >
      </main >

      {/* 新規取引作成/編集モーダル */}
      {
        showCreateForm && (
          <div className="z-50">
            {editingTransaction ? (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div className="bg-surface rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl border border-border">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-text-main">
                        取引を編集
                      </h2>
                      <button
                        onClick={() => {
                          setShowCreateForm(false)
                          setEditingTransaction(null)
                        }}
                        className="p-2 rounded-lg hover:bg-surface-highlight transition-colors"
                      >
                        <X className="w-5 h-5 text-text-muted" />
                      </button>
                    </div>
                    <TransactionForm
                      transaction={editingTransaction}
                      onSubmit={handleUpdateTransaction}
                      onCancel={() => {
                        setShowCreateForm(false)
                        setEditingTransaction(null)
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <OmniEntryPortal
                onClose={() => setShowCreateForm(false)}
                onSuccess={() => fetchTransactions()}
              />
            )}
          </div>
        )
      }
    </div >
  )
}

export default TransactionHistory