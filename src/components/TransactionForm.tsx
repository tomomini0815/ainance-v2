import React, { useState, useEffect, useMemo } from 'react'
import { X, Star, Clock, Zap, Calendar, Tag, Wallet, TrendingUp, TrendingDown } from 'lucide-react'

interface Transaction {
  id?: number
  item: string
  amount: number
  date: string
  category: string
  type: string
  description?: string
  receipt_url?: string
  location?: string
  tags?: string[]
  recurring?: boolean
  recurring_frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly'
  creator?: string
}

interface TransactionFormProps {
  transaction?: Transaction
  onSubmit: (transaction: Omit<Transaction, 'id'>) => void
  onCancel: () => void
}

const TransactionForm: React.FC<TransactionFormProps> = ({ transaction, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Omit<Transaction, 'id'>>({
    item: transaction?.item || '',
    amount: transaction?.amount || 0,
    date: transaction?.date || new Date().toISOString().split('T')[0],
    category: transaction?.category || '',
    type: transaction?.type || 'expense',
    description: transaction?.description || '',
    receipt_url: transaction?.receipt_url || '',
    location: transaction?.location || '',
    tags: transaction?.tags || [],
    recurring: transaction?.recurring || false,
    recurring_frequency: transaction?.recurring_frequency || 'monthly',
    creator: transaction?.creator || ''
  })

  const [tagInput, setTagInput] = useState('')
  const [locationHistory, setLocationHistory] = useState<string[]>([])
  const [favoriteCategories, setFavoriteCategories] = useState<string[]>([])
  const [recentTransactions, setRecentTransactions] = useState<Omit<Transaction, 'id'>[]>([])
  const [isAmountFocused, setIsAmountFocused] = useState(false)
  const [quickAmount, setQuickAmount] = useState<number | null>(null)

  useEffect(() => {
    const history = localStorage.getItem('locationHistory')
    if (history) {
      setLocationHistory(JSON.parse(history))
    }

    const favorites = localStorage.getItem('favoriteCategories')
    if (favorites) {
      setFavoriteCategories(JSON.parse(favorites))
    }

    const recent = localStorage.getItem('recentTransactions')
    if (recent) {
      setRecentTransactions(JSON.parse(recent))
    }
  }, [])

  const categoryOptions = useMemo(() => {
    const commonCategories = [
      '食費', '交通費', '消耗品費', '通信費', '光熱費', '住居費', '医療費', '教育費',
      '娯楽費', '衣服費', '美容費', '交際費', '給与', '副業収入', '賞与', '事業所得',
      '配当金', '利息', '家賃収入', 'その他収入', 'その他支出'
    ]

    const allCategories = [...new Set([...favoriteCategories, ...commonCategories])]
    return allCategories
  }, [favoriteCategories])

  const quickAmountOptions = [1000, 3000, 5000, 10000, 30000]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleQuickAmountSelect = (amount: number) => {
    setFormData(prev => ({
      ...prev,
      amount
    }))
    setQuickAmount(amount)
  }

  const toggleFavoriteCategory = (category: string) => {
    const newFavorites = favoriteCategories.includes(category)
      ? favoriteCategories.filter(fav => fav !== category)
      : [...favoriteCategories, category]

    setFavoriteCategories(newFavorites)
    localStorage.setItem('favoriteCategories', JSON.stringify(newFavorites))
  }

  const handleLocationSelect = (location: string) => {
    setFormData(prev => ({ ...prev, location }))

    if (!locationHistory.includes(location)) {
      const newHistory = [location, ...locationHistory].slice(0, 10)
      setLocationHistory(newHistory)
      localStorage.setItem('locationHistory', JSON.stringify(newHistory))
    }
  }

  const handleRecentTransactionSelect = (recentTransaction: Omit<Transaction, 'id'>) => {
    const updatedTransaction = {
      ...recentTransaction,
      date: new Date().toISOString().split('T')[0]
    }
    setFormData(updatedTransaction)
  }

  const handleTagAdd = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const handleTagRemove = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag) || []
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('取引フォーム送信開始:', formData);

    const storedUser = localStorage.getItem('user')
    let creator = '00000000-0000-0000-0000-000000000000'
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(userData.id)) {
          creator = userData.id
        } else {
          console.warn('無効なユーザーID形式です。匿名ユーザーとして処理します。');
        }
      } catch (error) {
        console.error('ユーザー情報の解析に失敗しました:', error)
      }
    }
    
    console.log('creator IDを設定:', creator);

    const newRecent = [formData, ...recentTransactions].slice(0, 5)
    setRecentTransactions(newRecent)
    localStorage.setItem('recentTransactions', JSON.stringify(newRecent))

    onSubmit({ ...formData, creator })
  }

  const getCategoryIcon = (category: string, type: string) => {
    if (type === 'income') {
      return <TrendingUp className="w-4 h-4 text-emerald-400" />
    }

    switch (category) {
      case '食費': return <span className="text-lg">🍽️</span>
      case '交通費': return <span className="text-lg">🚗</span>
      case '消耗品費': return <span className="text-lg">🛍️</span>
      case '通信費': return <span className="text-lg">📱</span>
      case '光熱費': return <span className="text-lg">💡</span>
      case '住居費': return <span className="text-lg">🏠</span>
      case '医療費': return <span className="text-lg">⚕️</span>
      case '教育費': return <span className="text-lg">📚</span>
      case '娯楽費': return <span className="text-lg">🎉</span>
      case '衣服費': return <span className="text-lg">👕</span>
      case '美容費': return <span className="text-lg">💇</span>
      case '交際費': return <span className="text-lg">🎁</span>
      default: return <Wallet className="w-4 h-4 text-text-muted" />
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-text-main">
      <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
        <h2 className="text-xl font-bold text-text-main">
          {transaction ? '取引編集' : '新規取引作成'}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-text-muted hover:text-text-main transition-colors p-1 hover:bg-white/5 rounded-lg"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {recentTransactions.length > 0 && !transaction && (
        <div className="mb-6 bg-surface-highlight/30 rounded-xl p-4 border border-border">
          <div className="flex items-center mb-3">
            <Clock className="w-4 h-4 text-primary mr-2" />
            <h3 className="text-sm font-medium text-text-secondary">最近の取引からコピー</h3>
          </div>
          <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto custom-scrollbar">
            {recentTransactions.slice(0, 3).map((recent, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleRecentTransactionSelect(recent)}
                className="flex items-center justify-between p-3 text-sm bg-surface rounded-lg hover:bg-surface-highlight transition-colors border border-border text-left w-full group"
              >
                <div className="flex items-center">
                  <div className="mr-3 opacity-80 group-hover:opacity-100 transition-opacity">
                    {getCategoryIcon(recent.category, recent.type)}
                  </div>
                  <span className="font-medium text-text-main">{recent.item}</span>
                </div>
                <div className={recent.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}>
                  {recent.type === 'income' ? '+' : '-'}¥{Math.abs(recent.amount).toLocaleString()}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-text-muted mb-1.5">取引項目</label>
          <div className="relative">
            <input
              type="text"
              name="item"
              value={formData.item}
              onChange={handleChange}
              placeholder="例: コンビニ買い物"
              className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-text-main placeholder-text-muted transition-all"
              required
              list="item-options"
            />
            <datalist id="item-options">
              <option value="コンビニ買い物" />
              <option value="スーパーマーケット" />
              <option value="給与" />
              <option value="交通費" />
              <option value="外食" />
              <option value="カフェ" />
              <option value="ガソリン" />
              <option value="電車賃" />
            </datalist>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-muted mb-1.5">金額</label>
          <div className="relative">
            <input
              type="number"
              name="amount"
              value={formData.amount || ''}
              onChange={handleChange}
              onFocus={() => setIsAmountFocused(true)}
              onBlur={() => setTimeout(() => setIsAmountFocused(false), 200)}
              className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-text-main placeholder-text-muted transition-all"
              required
              min="0"
              step="1"
            />
            {isAmountFocused && (
              <div className="absolute top-full left-0 mt-2 w-full bg-surface border border-border rounded-xl shadow-xl z-10 p-3 animate-in fade-in zoom-in-95 duration-200">
                <div className="text-xs text-text-muted mb-2">クイック入力:</div>
                <div className="flex flex-wrap gap-2">
                  {quickAmountOptions.map(amount => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => handleQuickAmountSelect(amount)}
                      className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${quickAmount === amount
                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                        : 'bg-surface-highlight text-text-secondary hover:bg-surface-highlight border border-border'
                        }`}
                    >
                      ¥{amount.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-muted mb-1.5">日付</label>
          <div className="relative">
            <Calendar className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" />
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-text-main transition-all appearance-none"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-muted mb-1.5">カテゴリ</label>
          <div className="relative">
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-text-main appearance-none transition-all"
              required
            >
              <option value="" className="bg-surface-highlight text-text-muted">カテゴリを選択</option>
              {categoryOptions.map(category => (
                <option key={category} value={category} className="bg-surface-highlight text-text-main">{category}</option>
              ))}
            </select>
            {formData.category && (
              <button
                type="button"
                onClick={() => toggleFavoriteCategory(formData.category)}
                className="absolute right-10 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-yellow-400 transition-colors"
              >
                <Star className={`w-4 h-4 ${favoriteCategories.includes(formData.category) ? 'fill-yellow-400 text-yellow-400' : ''}`} />
              </button>
            )}
            <div className="absolute right-3.5 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <Zap className="w-4 h-4 text-text-muted" />
            </div>
          </div>

          {favoriteCategories.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {favoriteCategories.slice(0, 5).map(category => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, category }))}
                  className={`px-2.5 py-1 text-xs rounded-lg flex items-center transition-all ${formData.category === category
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'bg-surface text-text-muted hover:bg-surface-highlight border border-border'
                    }`}
                >
                  <Star className="w-3 h-3 mr-1.5 fill-yellow-400 text-yellow-400" />
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-muted mb-1.5">タイプ</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, type: 'expense' }))}
              className={`flex items-center justify-center px-4 py-2.5 rounded-xl border transition-all ${formData.type === 'expense'
                ? 'bg-rose-500/20 border-rose-500/30 text-rose-400 shadow-lg shadow-rose-500/10'
                : 'bg-surface border-border text-text-muted hover:bg-surface-highlight'
                }`}
            >
              <TrendingDown className="w-4 h-4 mr-2" />
              支出
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, type: 'income' }))}
              className={`flex items-center justify-center px-4 py-2.5 rounded-xl border transition-all ${formData.type === 'income'
                ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/10'
                : 'bg-surface border-border text-text-muted hover:bg-surface-highlight'
                }`}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              収入
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-muted mb-1.5">場所</label>
          <div className="relative">
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="場所を入力"
              className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-text-main placeholder-text-muted transition-all"
              list="location-options"
            />
            <datalist id="location-options">
              <option value="自宅" />
              <option value="オフィス" />
              <option value="コンビニ" />
              <option value="スーパー" />
              <option value="レストラン" />
              <option value="駅" />
              <option value="銀行" />
              <option value="病院" />
              <option value="学校" />
              <option value="ジム" />
              <option value="美容院" />
            </datalist>
          </div>
          {locationHistory.length > 0 && (
            <div className="mt-2">
              <label className="block text-xs font-medium text-text-muted mb-1.5">最近の場所</label>
              <div className="flex flex-wrap gap-2">
                {locationHistory.slice(0, 5).map(location => (
                  <button
                    key={location}
                    type="button"
                    onClick={() => handleLocationSelect(location)}
                    className={`px-2.5 py-1 text-xs rounded-lg transition-all ${formData.location === location
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'bg-surface text-text-muted hover:bg-surface-highlight border border-border'
                      }`}
                  >
                    {location}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-muted mb-1.5">説明</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={2}
          placeholder="取引の詳細を入力（任意）"
          className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-text-main placeholder-text-muted transition-all resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-muted mb-1.5">タグ</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.tags?.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/20 text-primary border border-primary/30"
            >
              <Tag className="w-3 h-3 mr-1.5" />
              {tag}
              <button
                type="button"
                onClick={() => handleTagRemove(tag)}
                className="ml-1.5 hover:text-primary/80 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="タグを追加"
            className="flex-1 px-4 py-2.5 bg-surface border border-border border-r-0 rounded-l-xl focus:ring-2 focus:ring-primary focus:border-transparent text-text-main placeholder-text-muted transition-all"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleTagAdd()
              }
            }}
          />
          <button
            type="button"
            onClick={handleTagAdd}
            className="px-4 py-2.5 bg-surface-highlight border border-border rounded-r-xl text-text-secondary hover:bg-surface-highlight transition-colors"
          >
            追加
          </button>
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="recurring"
          checked={formData.recurring}
          onChange={handleChange}
          className="h-4 w-4 text-primary focus:ring-primary border-border rounded bg-surface"
        />
        <label className="ml-2 block text-sm text-text-secondary">
          繰り返し取引
        </label>
      </div>

      {formData.recurring && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
          <label className="block text-sm font-medium text-text-muted mb-1.5">繰り返し頻度</label>
          <select
            name="recurring_frequency"
            value={formData.recurring_frequency}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-text-main appearance-none transition-all"
          >
            <option value="daily" className="bg-surface-highlight">日次</option>
            <option value="weekly" className="bg-surface-highlight">週次</option>
            <option value="monthly" className="bg-surface-highlight">月次</option>
            <option value="yearly" className="bg-surface-highlight">年次</option>
          </select>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-6 border-t border-border">
        <button
          type="button"
          onClick={onCancel}
          className="btn-tertiary"
        >
          キャンセル
        </button>
        <button
          type="submit"
          className="btn-primary"
        >
          {transaction ? '更新' : '作成'}
        </button>
      </div>
    </form>
  )
}

export default TransactionForm