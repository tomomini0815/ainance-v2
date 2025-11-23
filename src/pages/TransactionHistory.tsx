import React, { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Search, Filter, Plus, ChevronDown, Calendar, JapaneseYen, Tag, FileText, Download, Trash2, Edit, TrendingUp, TrendingDown, X, Upload } from 'lucide-react'
import { useMySQLTransactions } from '../hooks/useMySQLTransactions'
import TransactionTable from '../components/TransactionTable'
import TransactionForm from '../components/TransactionForm'
import { useBusinessTypeContext } from '../context/BusinessTypeContext'

const TransactionHistory: React.FC = () => {
  const { currentBusinessType } = useBusinessTypeContext()
  const { transactions, loading, createTransaction, updateTransaction, deleteTransaction, fetchTransactions } = useMySQLTransactions(currentBusinessType?.id)
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

  // データの再取得
  useEffect(() => {
    if (currentBusinessType?.id) {
      fetchTransactions();
    }
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
    console.log('取引履歴 - 取引データ:', transactions);

    // amountの値を安全に取得するヘルパー関数
    const getAmountValue = (amount: any): number => {
      if (typeof amount === 'number') {
        return amount;
      }
      if (typeof amount === 'string') {
        const parsed = parseFloat(amount);
        return isNaN(parsed) ? 0 : parsed;
      }
      if (typeof amount === 'object' && amount !== null) {
        // オブジェクトの場合、valueやamountプロパティを探す
        const objValue = amount.value || amount.amount || amount.number || 0;
        if (typeof objValue === 'number') {
          return objValue;
        }
        if (typeof objValue === 'string') {
          const parsed = parseFloat(objValue);
          return isNaN(parsed) ? 0 : parsed;
        }
        return 0;
      }
      return 0;
    };

    // 金額を確実に数値に変換して計算
    const incomeTransactions = transactions.filter(t => {
      // typeが'income'の場合を優先
      if (t.type === 'income') {
        return true;
      }

      // amountが正の数値の場合も収入として扱う
      const amount = getAmountValue(t.amount);
      const isValid = !isNaN(amount) && isFinite(amount) && amount > 0;
      console.log(`取引ID ${t.id}: type=${t.type}, 元のamount=${JSON.stringify(t.amount)}, 数値化後=${amount}, 収入判定=${isValid}`);
      return isValid;
    });

    const expenseTransactions = transactions.filter(t => {
      // typeが'expense'の場合を優先
      if (t.type === 'expense') {
        return true;
      }

      // amountが負の数値の場合も支出として扱う
      const amount = getAmountValue(t.amount);
      const isValid = !isNaN(amount) && isFinite(amount) && amount < 0;
      console.log(`取引ID ${t.id}: type=${t.type}, 元のamount=${JSON.stringify(t.amount)}, 数値化後=${amount}, 支出判定=${isValid}`);
      return isValid;
    });

    const totalIncome = incomeTransactions.reduce((sum, t) => {
      const amount = getAmountValue(t.amount);
      const validAmount = !isNaN(amount) && isFinite(amount) ? Math.abs(amount) : 0;
      console.log(`収入計算: ${sum} + ${validAmount} = ${sum + validAmount}`);
      return sum + validAmount;
    }, 0);

    const totalExpense = expenseTransactions.reduce((sum, t) => {
      const amount = getAmountValue(t.amount);
      // 支出の場合は金額を正の値として計算（表示時にマイナスを付ける）
      const validAmount = !isNaN(amount) && isFinite(amount) ? Math.abs(amount) : 0;
      console.log(`支出計算: ${sum} + ${validAmount} = ${sum + validAmount}`);
      return sum + validAmount;
    }, 0);

    const result = {
      total: transactions.length,
      income: totalIncome,
      expense: totalExpense,
      balance: totalIncome - totalExpense
    };

    console.log('取引履歴 - 統計情報計算結果:', result);
    console.log('取引履歴 - 収入取引:', incomeTransactions);
    console.log('取引履歴 - 支出取引:', expenseTransactions);

    return result;
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

      // typeプロパティが設定されていない場合、amountの正負で判断
      if (!transactionData.type) {
        const amount = typeof transactionData.amount === 'string' ? parseFloat(transactionData.amount) : transactionData.amount;
        transactionData.type = amount > 0 ? 'income' : 'expense';
        console.log('typeプロパティを自動設定:', transactionData.type);
      }

      await createTransaction(transactionData)

      // データの再取得
      await fetchTransactions();

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

      // データの再取得
      await fetchTransactions();

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-muted">データを読み込んでいます...</p>
        </div>
      </div>
    )
  }

  // エラー処理を追加
  if (!transactions || transactions.length === 0) {
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
            <div className="bg-surface rounded-xl shadow-sm p-4 border border-border hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-text-muted">総取引数</div>
                  <div className="text-xl font-bold mt-1 text-primary">0</div>
                </div>
                <div className="rounded-lg bg-primary/10 p-2">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
              </div>
            </div>
            <div className="bg-surface rounded-xl shadow-sm p-4 border border-border hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-text-muted">収入</div>
                  <div className="text-xl font-bold mt-1 text-green-500">¥0</div>
                </div>
                <div className="rounded-lg bg-green-500/10 p-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
              </div>
            </div>
            <div className="bg-surface rounded-xl shadow-sm p-4 border border-border hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-text-muted">支出</div>
                  <div className="text-xl font-bold mt-1 text-red-500">¥0</div>
                </div>
                <div className="rounded-lg bg-red-500/10 p-2">
                  <TrendingDown className="w-5 h-5 text-red-500" />
                </div>
              </div>
            </div>
            <div className="rounded-xl shadow-sm p-4 border border-green-500/20 bg-green-500/5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-text-muted">収支</div>
                  <div className="text-xl font-bold mt-1 text-green-500">¥0</div>
                </div>
                <div className="rounded-lg bg-green-500/10 p-2">
                  <JapaneseYen className="w-5 h-5 text-green-500" />
                </div>
              </div>
            </div>
          </div>

          {/* メッセージ */}
          <div className="bg-surface rounded-xl shadow-sm border border-border p-8 text-center">
            <FileText className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <h3 className="text-xl font-medium text-text-main mb-2">取引が見つかりません</h3>
            <p className="text-text-muted mb-6">まだ取引が登録されていないか、条件に一致する取引がありません</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary flex items-center mx-auto"
            >
              <Plus className="w-5 h-5 mr-2" />
              最初の取引を追加
            </button>
          </div>
        </main>

        {/* 新規取引作成モーダル（取引がない場合の表示用） */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-surface rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl border border-border">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-text-main">最初の取引を追加</h2>
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
                  onSubmit={handleCreateTransaction}
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
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-border rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium text-text-muted">総取引数</div>
                <div className="rounded-lg bg-primary/10 p-2">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div className="text-xl font-bold text-primary mt-1">{stats.total}</div>
            </div>
            <div className="border border-border rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium text-text-muted">収入</div>
                <div className="rounded-lg bg-green-500/10 p-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
              </div>
              <div className="text-xl font-bold text-green-500 mt-1">¥{stats.income.toLocaleString()}</div>
            </div>
            <div className="border border-border rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium text-text-muted">支出</div>
                <div className="rounded-lg bg-red-500/10 p-2">
                  <TrendingDown className="w-5 h-5 text-red-500" />
                </div>
              </div>
              <div className="text-xl font-bold text-red-500 mt-1">¥{stats.expense.toLocaleString()}</div>
            </div>
            <div className="border border-border rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium text-text-muted">収支</div>
                <div className={`rounded-lg p-2 ${stats.balance >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                  <JapaneseYen className={`w-5 h-5 ${stats.balance >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                </div>
              </div>
              <div className={`text-xl font-bold mt-1 ${stats.balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
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
                  className={`px-4 py-2.5 text-sm rounded-lg transition-colors flex items-center space-x-2 ${showFilters
                    ? 'bg-primary/10 text-primary'
                    : 'bg-surface-highlight text-text-muted hover:bg-border'
                    }`}
                >
                  <Filter className="w-4 h-4" />
                  <span>フィルタ</span>
                  {activeFilterCount > 0 && (
                    <span className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                  <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
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
          <div className="overflow-x-auto">
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
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-text-main">{transaction.item}</div>
                        <div className="text-sm text-text-muted sm:hidden">
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
                          <span className={transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}>
                            {transaction.type === 'expense' ? '-' : ''}{transaction.amount.toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted hidden sm:table-cell">
                        {new Date(transaction.date).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${transaction.type === 'income'
                          ? 'bg-green-500/10 text-green-600'
                          : 'bg-red-500/10 text-red-600'
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
                            className="p-2 text-primary hover:text-primary/80 hover:bg-primary/10 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteTransaction(transaction.id)}
                            className="p-2 text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-lg transition-colors"
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
                        <FileText className="w-12 h-12 text-text-muted mb-4" />
                        <h3 className="text-lg font-medium text-text-main mb-1">取引が見つかりません</h3>
                        <p className="text-text-muted">条件に一致する取引がありません</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ページネーション */}
          {paginatedTransactions.length > 0 && (
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
                            }`}
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
          )}
        </div>
      </main>

      {/* 新規取引作成/編集モーダル */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl border border-border">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-text-main">
                  {editingTransaction ? '取引を編集' : '新規取引作成'}
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