import React, { useState, useMemo, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowLeft, Search, Filter, Plus, JapaneseYen, FileText, Trash2, Edit, TrendingUp, TrendingDown, X, Repeat, ChevronLeft, ChevronRight, Calendar, List, Activity, Wallet, Clock } from 'lucide-react'
import TransactionIcon from '../components/TransactionIcon'
import { useTransactions } from '../hooks/useTransactions'
import TransactionForm from '../components/TransactionForm'
import { useBusinessTypeContext } from '../context/BusinessTypeContext'
import { useFiscalYear } from '../context/FiscalYearContext'
import { useAuth } from '../hooks/useAuth'
import OmniEntryPortal from '../components/OmniEntryPortal'

const TransactionHistory: React.FC = () => {
  const { currentBusinessType } = useBusinessTypeContext()
  const { user: authUser } = useAuth();
  const { selectedYear } = useFiscalYear();
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
  const [viewMode, setViewMode] = useState<'all' | 'depreciation'>('all')
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
    // 未承認の取引（Voice入力など）を除外
    result = result.filter(transaction => transaction.approval_status !== 'pending')

    // ビュー選択によるフィルタリング
    if (viewMode === 'depreciation') {
      result = result.filter(transaction => transaction.tags?.includes('depreciation_asset'))
    }

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

    // 年度フィルタ
    result = result.filter(transaction => {
      const transYear = new Date(transaction.date).getFullYear();
      return transYear === selectedYear;
    });

    return result
  }, [transactions, searchTerm, categoryFilter, dateRange, amountRange, sortBy, sortOrder, viewMode, selectedYear])

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

    const incomeTransactions = filteredAndSortedTransactions.filter(t => {
      if (t.type === 'income') return true;
      if (t.type === 'expense') return false;
      const val = getAmountValue(t.amount);
      return !isNaN(val) && isFinite(val) && val > 0;
    });

    const expenseTransactions = filteredAndSortedTransactions.filter(t => {
      if (t.type === 'expense') return true;
      if (t.type === 'income') return false;
      const val = getAmountValue(t.amount);
      return !isNaN(val) && isFinite(val) && val < 0;
    });

    const totalIncome = incomeTransactions.reduce((sum, t) => {
      let amount = getAmountValue(t.amount);
      if (t.tags?.includes('depreciation_asset')) {
        const depMatch = t.description?.match(/今期\(\d+年\)償却額:¥([\d,]+)/);
        if (depMatch) {
          amount = parseInt(depMatch[1].replace(/,/g, ''), 10);
        } else {
          const oldMatch = t.description?.match(/年間償却費: ¥([\d,]+)/);
          if (oldMatch) {
            amount = parseInt(oldMatch[1].replace(/,/g, ''), 10);
          }
        }
      }
      return sum + Math.abs(amount);
    }, 0);

    const totalExpense = expenseTransactions.reduce((sum, t) => {
      let amount = getAmountValue(t.amount);
      if (t.tags?.includes('depreciation_asset')) {
        const depMatch = t.description?.match(/今期\(\d+年\)償却額:¥([\d,]+)/);
        if (depMatch) {
          amount = parseInt(depMatch[1].replace(/,/g, ''), 10);
        } else {
          const oldMatch = t.description?.match(/年間償却費: ¥([\d,]+)/);
          if (oldMatch) {
            amount = parseInt(oldMatch[1].replace(/,/g, ''), 10);
          }
        }
      }
      return sum + Math.abs(amount);
    }, 0);

    return {
      total: filteredAndSortedTransactions.length,
      income: totalIncome,
      expense: totalExpense,
      balance: totalIncome - totalExpense,
      pendingCount: transactions.filter(t => t.approval_status === 'pending').length,
      depreciationCount: filteredAndSortedTransactions.filter(t => t.tags?.includes('depreciation_asset')).length,
      allCount: filteredAndSortedTransactions.length
    };
  }, [filteredAndSortedTransactions, transactions])

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
        <div className="flex flex-row justify-between items-center mb-6 gap-4">
          <div className="flex items-center">
            <Link to="/dashboard" className="mr-3 p-1.5 rounded-lg hover:bg-surface-highlight transition-colors">
              <ArrowLeft className="w-5 h-5 text-text-muted hover:text-text-main" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-text-main">取引履歴</h1>
              <p className="hidden sm:block text-xs text-text-muted mt-0.5">すべての取引履歴を確認・管理できます</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary flex items-center px-3 py-1.5 text-xs sm:text-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            新規取引
          </button>
        </div>

        {/* 統計カード */}
        <div className="bg-surface rounded-xl shadow-sm p-2 border border-border hover:shadow-md transition-shadow mb-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            <div className="border border-border rounded-lg p-2">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-medium text-text-muted">総取引数</div>
                <div className="rounded-lg bg-primary/5 p-1">
                  <FileText className="w-3.5 h-3.5 text-primary" />
                </div>
              </div>
              <div className="text-base sm:text-lg font-bold text-primary mt-0.5">{stats.total}</div>
            </div>
            <div className="border border-border rounded-lg p-2">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-medium text-text-muted">収入</div>
                <div className="rounded-lg bg-green-500/5 p-1">
                  <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                </div>
              </div>
              <div className="text-base sm:text-lg font-bold text-green-500 mt-0.5">{stats.income.toLocaleString()}円</div>
            </div>
            <div className="border border-border rounded-lg p-2">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-medium text-text-muted">支出</div>
                <div className="rounded-lg bg-red-500/5 p-1">
                  <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                </div>
              </div>
              <div className="text-base sm:text-lg font-bold text-red-500 mt-0.5">{stats.expense.toLocaleString()}円</div>
            </div>
            <div className="border border-border rounded-lg p-2">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-medium text-text-muted">収支</div>
                <div className={`rounded-lg p-1 ${stats.balance >= 0 ? 'bg-green-500/5' : 'bg-red-500/5'}`}>
                  <JapaneseYen className={`w-3.5 h-3.5 ${stats.balance >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                </div>
              </div>
              <div className={`text-base sm:text-lg font-bold mt-0.5 ${stats.balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {stats.balance.toLocaleString()}円
              </div>
            </div>
          </div>
        </div>

        {/* 操作パネル（検索・検索・ソート） */}
        <div className="bg-surface rounded-xl shadow-sm border border-border mb-4 overflow-hidden">
          <div className="p-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              {/* ソート・フィルターグループ */}
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-2 py-1.5 border border-border rounded-lg bg-background text-[11px] text-text-main focus:ring-1 focus:ring-primary outline-none"
                  >
                    <option value="date">日付</option>
                    <option value="amount">金額</option>
                    <option value="item">項目</option>
                    <option value="created_at">追加日</option>
                  </select>
                </div>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-1.5 text-[10px] bg-surface-highlight text-text-muted rounded hover:bg-border transition-colors border border-transparent hover:border-border"
                >
                  {sortOrder === 'asc' ? '昇順' : '降順'}
                </button>

                <div className="h-6 w-px bg-border mx-0.5"></div>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-2.5 py-1.5 text-xs rounded-lg transition-colors flex items-center space-x-1.5 border ${showFilters
                    ? 'bg-primary/10 text-primary border-primary/20'
                    : 'bg-surface-highlight text-text-muted border-transparent hover:bg-border'
                    }`}
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">フィルター</span>
                  {activeFilterCount > 0 && (
                    <span className="bg-primary text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
                {activeFilterCount > 0 && (
                  <button
                    onClick={resetFilters}
                    className="px-2 py-1.5 text-xs bg-surface-highlight text-text-muted rounded-lg hover:bg-border transition-colors flex items-center"
                    title="フィルターをクリア"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* 検索バー (右端に配置) */}
              <div className="relative flex-1 min-w-[140px] sm:max-w-xs ml-auto">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-text-muted w-3.5 h-3.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="検索..."
                  className="w-full pl-8 pr-3 py-1.5 border border-border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary bg-background focus:bg-surface transition-colors text-xs text-text-main placeholder-text-muted"
                />
              </div>
            </div>

            {/* 一括操作エリア (選択時のみ表示) */}
            {selectedTransactions.length > 0 && (
              <div className="mt-2 pt-2 border-t border-border flex items-center justify-between">
                <span className="text-[10px] text-text-muted">{selectedTransactions.length}件選択中</span>
                <button
                  onClick={handleBulkDelete}
                  className="px-2 py-1 text-[10px] bg-red-500/10 text-red-600 rounded hover:bg-red-500 hover:text-white transition-colors flex items-center"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  削除
                </button>
              </div>
            )}

            {showFilters && (
              <div className="mt-3 pt-3 border-t border-border">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-[10px] font-medium text-text-muted mb-1">カテゴリ</label>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full px-2 py-1 border border-border rounded bg-background text-[11px] text-text-main"
                    >
                      <option value="">すべて</option>
                      {availableCategories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-text-muted mb-1">開始日</label>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                      className="w-full px-2 py-1 border border-border rounded bg-background text-[11px] text-text-main"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-text-muted mb-1">終了日</label>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                      className="w-full px-2 py-1 border border-border rounded bg-background text-[11px] text-text-main"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-text-muted mb-1">最小金額</label>
                    <input
                      type="number"
                      value={amountRange.min}
                      onChange={(e) => setAmountRange({ ...amountRange, min: e.target.value })}
                      className="w-full px-2 py-1 border border-border rounded bg-background text-[11px] text-text-main"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-text-muted mb-1">最大金額</label>
                    <input
                      type="number"
                      value={amountRange.max}
                      onChange={(e) => setAmountRange({ ...amountRange, max: e.target.value })}
                      className="w-full px-2 py-1 border border-border rounded bg-background text-[11px] text-text-main"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* トランザクションテーブル */}
        <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
          {/* モバイル: カード表示 */}
          <div className="block md:hidden divide-y divide-border">
            {/* モバイル用タブ切り替え (元のデザインを維持) */}
            <div className="p-3 border-b border-border bg-surface-highlight/30">
              <div className="flex bg-surface-highlight p-1 rounded-xl border border-border w-full">
                <button
                  onClick={() => {
                    setViewMode('all');
                    setCurrentPage(1);
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode === 'all'
                    ? 'bg-surface text-primary shadow-sm'
                    : 'text-text-muted hover:text-text-main'
                    }`}
                >
                  <List className="w-3.5 h-3.5" />
                  全ての取引
                </button>
                <button
                  onClick={() => {
                    setViewMode('depreciation');
                    setCurrentPage(1);
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode === 'depreciation'
                    ? 'bg-surface text-primary shadow-sm'
                    : 'text-text-muted hover:text-text-main'
                    }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  減価償却資産
                </button>
              </div>
            </div>
            {paginatedTransactions.length > 0 ? (
              paginatedTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="p-4 hover:bg-surface-highlight/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedTransactions.includes(transaction.id)}
                        onChange={(e) => {
                          e.stopPropagation()
                          toggleSelectTransaction(transaction.id)
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded border-border text-primary focus:ring-primary h-4 w-4 bg-background mr-3"
                      />
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                        <Calendar className="w-2.5 h-2.5 opacity-40" />
                        <span>
                          {new Date(transaction.date).toLocaleDateString('ja-JP', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start justify-between">
                    <div className="flex items-center flex-1 min-w-0">
                      <TransactionIcon item={transaction.item} category={transaction.category} size="sm" />
                      <div className="flex flex-wrap items-center gap-2 min-w-0 ml-2">
                        <div className="font-medium text-text-main truncate text-sm">{transaction.item}</div>
                        {transaction.recurring && (
                          <div className="flex items-center gap-1 px-1 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold border border-primary/20 shrink-0">
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
                    <div className="text-right ml-3 shrink-0">
                      <div className={`font-bold text-sm ${transaction.type === 'income' ? 'text-green-500' : 'text-text-main'}`}>
                        {transaction.type === 'expense' ? '-' : transaction.type === 'income' ? '+' : ''}{transaction.amount.toLocaleString()}円
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 shrink-0" /> {/* Spacer for alignment */}
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-surface-highlight text-text-secondary border border-border truncate">
                        {transaction.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingTransaction(transaction)
                          setShowCreateForm(true)
                        }}
                        className="w-11 h-11 rounded-full flex items-center justify-center bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-md active:scale-95"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteTransaction(transaction.id)
                        }}
                        className="w-11 h-11 rounded-full flex items-center justify-center bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-md active:scale-95"
                      >
                        <Trash2 className="w-5 h-5" />
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
            {/* View Mode Tabs */}
            <div className="flex bg-white dark:bg-[#2a3245] p-1 rounded-full border border-slate-200 dark:border-slate-800 w-fit shadow-md mt-4 mb-4 ml-4">
              <button
                onClick={() => {
                  setViewMode('all');
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-2.5 px-6 py-2 text-xs font-medium rounded-full transition-all duration-300 ${viewMode === 'all'
                  ? 'bg-slate-100 dark:bg-[#1e293b] text-primary dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5'
                  }`}
              >
                <Wallet className={`w-4 h-4 ${viewMode === 'all' ? 'text-primary dark:text-indigo-400' : 'text-slate-400'}`} />
                <span>全ての取引</span>
              </button>
              <button
                onClick={() => {
                  setViewMode('depreciation');
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-2.5 px-6 py-2 text-xs font-medium rounded-full transition-all duration-300 ${viewMode === 'depreciation'
                  ? 'bg-slate-100 dark:bg-[#1e293b] text-primary dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'
                  }`}
              >
                <Clock className={`w-4 h-4 ${viewMode === 'depreciation' ? 'text-primary dark:text-indigo-400' : 'text-slate-500'}`} />
                <span className={viewMode === 'depreciation' ? '' : 'opacity-75'}>減価償却資産</span>
              </button>
            </div>

            <table className="min-w-full divide-y divide-border">
              <thead className="bg-slate-50 dark:bg-[#2a3245]">
                <tr>
                  <th className="px-4 py-3 text-left w-12">
                    <input
                      type="checkbox"
                      checked={selectedTransactions.length === paginatedTransactions.length && paginatedTransactions.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-border text-primary focus:ring-primary h-4 w-4 bg-background"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-medium text-text-muted uppercase tracking-wider">項目</th>
                  <th className="px-4 py-3 text-right text-[10px] font-medium text-text-muted uppercase tracking-wider">金額</th>
                  {viewMode === 'depreciation' && (
                    <th className="px-4 py-3 text-right text-[10px] font-medium text-text-muted uppercase tracking-wider">取得価額</th>
                  )}
                  <th className="px-4 py-3 text-center text-[10px] font-medium text-text-muted uppercase tracking-wider hidden sm:table-cell">日付</th>
                  <th className="px-4 py-3 text-center text-[10px] font-medium text-text-muted uppercase tracking-wider">カテゴリ</th>
                  <th className="px-4 py-3 text-center text-[10px] font-medium text-text-muted uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-surface divide-y divide-border">
                {paginatedTransactions.length > 0 ? (
                  paginatedTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-surface-highlight transition-colors">
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedTransactions.includes(transaction.id)}
                          onChange={() => toggleSelectTransaction(transaction.id)}
                          className="rounded border-border text-primary focus:ring-primary h-4 w-4 bg-background"
                        />
                      </td>
                      <td className="px-4 py-3 text-left">
                        <div className="flex items-center gap-2 min-w-0">
                          <TransactionIcon item={transaction.item} category={transaction.category} size="xs" />
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-text-main truncate max-w-[200px]" title={transaction.item}>
                                {transaction.item}
                              </span>
                              {transaction.recurring && (
                                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold border border-primary/20 shrink-0">
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
                            <span className="text-[10px] text-text-muted truncate max-w-[200px] font-medium">
                              {transaction.category}
                            </span>
                          </div>
                        </div>

                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-right text-sm font-bold text-text-main">
                        {(() => {
                          if (transaction.tags?.includes('depreciation_asset')) {
                            const newMatch = transaction.description?.match(/今期\(\d+年\)償却額:¥([\d,]+)/);
                            if (newMatch) return `¥${newMatch[1]}`;
                            const oldMatch = transaction.description?.match(/年間償却費: ¥([\d,]+)/);
                            return oldMatch ? `¥${oldMatch[1]}` : `¥${transaction.amount.toLocaleString()}`;
                          }
                          return `${transaction.type === 'income' ? '+' : '-'}¥${transaction.amount.toLocaleString()}`;
                        })()}
                      </td>

                      {viewMode === 'depreciation' && (
                        <td className="px-4 py-2.5 whitespace-nowrap text-right text-sm font-medium text-text-muted">
                          {(() => {
                            if (transaction.tags?.includes('depreciation_asset')) {
                              // 新しい形式: 取得価額が明記されている場合
                              const acqMatch = transaction.description?.match(/取得価額:¥([\d,]+)/);
                              if (acqMatch) return `¥${acqMatch[1]}`;

                              // 古い形式: 年間償却費の記載がある場合、transaction.amountが取得価額だった
                              const oldDepMatch = transaction.description?.match(/年間償却費: ¥([\d,]+)/);
                              if (oldDepMatch) return `¥${transaction.amount.toLocaleString()}`;

                              // 中間の形式: 今期償却額のみ記載があり、取得価額がない場合 (バグ期間のデータ)
                              // この場合、transaction.amountは今期償却額になってしまっているため、取得価額は不明。
                              // 暫定的に「-」を表示するか、transaction.amountを表示する
                              const currentDepMatch = transaction.description?.match(/今期\(\d+年\)償却額:¥([\d,]+)/);
                              if (currentDepMatch) return `(不明)`;

                              return `¥${transaction.amount.toLocaleString()}`;
                            }
                            return `¥${transaction.amount.toLocaleString()}`;
                          })()}
                        </td>
                      )}
                      <td className="px-4 py-2.5 whitespace-nowrap text-center text-[11px] text-text-muted hidden sm:table-cell">
                        {new Date(transaction.date).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-center">
                        <span className="whitespace-nowrap px-2 py-0.5 inline-flex text-[10px] leading-4 font-medium rounded-full bg-slate-500/10 text-text-secondary">
                          {transaction.category}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm font-medium text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setEditingTransaction(transaction)
                              setShowCreateForm(true)
                            }}
                            className="px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-all shadow-sm flex items-center gap-1 text-sm whitespace-nowrap"
                          >
                            <Edit className="w-4 h-4" />
                            編集
                          </button>
                          <button
                            onClick={() => deleteTransaction(transaction.id)}
                            className="px-3 py-2 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all shadow-sm flex items-center gap-1 text-sm whitespace-nowrap"
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
                    <td colSpan={viewMode === 'depreciation' ? 7 : 6} className="px-6 py-12 text-center">
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
              <div className="flex items-center justify-center mt-6 space-x-2 pb-8">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
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
                    if (pageNumber <= 0 || pageNumber > totalPages) return null;
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
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
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg transition-colors ${currentPage === totalPages
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-text-muted hover:text-text-secondary hover:bg-surface-highlight'
                    }`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
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
                  <div className="p-4">
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