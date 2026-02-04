import React, { useState, useEffect, useMemo } from 'react'
import { Star, Clock, Zap, Calendar, Tag, Wallet, TrendingUp, TrendingDown, ChevronDown } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { STANDARD_CATEGORIES } from '../services/keywordCategoryService'

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
  recurring_end_date?: string
  creator?: string
}

interface TransactionFormProps {
  transaction?: Transaction
  onSubmit: (transaction: Omit<Transaction, 'id'>) => void
  onCancel: () => void
}

const TransactionForm: React.FC<TransactionFormProps> = ({ transaction, onSubmit, onCancel }) => {
  const { user } = useAuth()
  const [formData, setFormData] = useState<Omit<Transaction, 'id'>>({
    item: transaction?.item || '',
    amount: transaction?.amount || 0,
    date: transaction?.date || '',
    category: transaction?.category || '',
    type: transaction?.type || 'expense',
    description: transaction?.description || '',
    receipt_url: transaction?.receipt_url || '',
    location: transaction?.location || '',
    tags: transaction?.tags || [],
    recurring: transaction?.recurring || false,
    recurring_frequency: transaction?.recurring_frequency || 'monthly',
    recurring_end_date: transaction?.recurring_end_date || new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0],
    creator: transaction?.creator || ''
  })

  const [tagInput, setTagInput] = useState('')
  const [locationHistory, setLocationHistory] = useState<string[]>([])
  const [favoriteCategories, setFavoriteCategories] = useState<string[]>([])
  const [recentTransactions, setRecentTransactions] = useState<Omit<Transaction, 'id'>[]>([])
  const [isAmountFocused, setIsAmountFocused] = useState(false)
  const [quickAmount, setQuickAmount] = useState<number | null>(null)

  // Tab State
  const [activeTab, setActiveTab] = useState<'normal' | 'depreciation'>('normal')
  const [usefulLife, setUsefulLife] = useState<number>(5)
  const [depreciationMethod, setDepreciationMethod] = useState<string>('定額法')
  const [businessRatio, setBusinessRatio] = useState<number>(100)

  useEffect(() => {
    const history = localStorage.getItem('locationHistory')
    // ... (rest of useEffect is unchanged from my perspective, but I need to include it if I replace the whole block)
    if (history) setLocationHistory(JSON.parse(history))
    const favorites = localStorage.getItem('favoriteCategories')
    if (favorites) setFavoriteCategories(JSON.parse(favorites))
    const recent = localStorage.getItem('recentTransactions')
    if (recent) setRecentTransactions(JSON.parse(recent))
  }, [])

  // ... (keeping other hooks)

  // (Skipping down to handleSubmit)
  // Wait, I should not replace too much if I can't see it all.
  // I will just replace the state definition block first.


  useEffect(() => {
    if (transaction) {
      setFormData({
        item: transaction.item || '',
        amount: transaction.amount || 0,
        date: transaction.date || '',
        category: transaction.category || '',
        type: transaction.type || 'expense',
        description: transaction.description || '',
        receipt_url: transaction.receipt_url || '',
        location: transaction.location || '',
        tags: transaction.tags || [],
        recurring: transaction.recurring || false,
        recurring_frequency: transaction.recurring_frequency || 'monthly',
        recurring_end_date: transaction.recurring_end_date || new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0],
        creator: transaction.creator || ''
      })
    }
  }, [transaction])

  useEffect(() => {
    if (depreciationMethod === '少額減価償却資産 (特例)') {
      setUsefulLife(1)
    }
  }, [depreciationMethod])

  const categoryOptions = useMemo(() => {
    return [...new Set([...favoriteCategories, ...STANDARD_CATEGORIES])]
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

    // Prepare data based on active tab
    let dataToSubmit = { ...formData };
    if (activeTab === 'depreciation') {
      const depreciationInfo = `\n[減価償却資産] 耐用年数: ${usefulLife}年`;
      dataToSubmit.description = (dataToSubmit.description || '') + depreciationInfo;
      dataToSubmit.tags = [...(dataToSubmit.tags || []), 'depreciation_asset'];
    }

    // 編集モードの場合、creatorの検証をスキップ
    // 親コンポーネントが既存のcreatorを維持する
    if (transaction) {
      console.log('編集モード: creatorの検証をスキップ');

      const newRecent = [dataToSubmit, ...recentTransactions].slice(0, 5)
      setRecentTransactions(newRecent)
      localStorage.setItem('recentTransactions', JSON.stringify(newRecent))

      // typeプロパティが設定されていない場合、amountの正負で判断
      const transactionData = { ...dataToSubmit };
      if (!transactionData.type) {
        const amount = typeof transactionData.amount === 'string' ? parseFloat(transactionData.amount) : transactionData.amount;
        transactionData.type = amount > 0 ? 'income' : 'expense';
        console.log('typeプロパティを自動設定:', transactionData.type);
      }

      onSubmit(transactionData)
      return;
    }

    // 新規作成モードの場合のみ、creatorを検証
    let creator = '00000000-0000-0000-0000-000000000000'
    if (user && user.id) {
      creator = user.id
      console.log('useAuthからユーザーIDを取得:', creator);
    } else {
      console.warn('ユーザー情報が取得できません。localStorageを確認します。');
      // フォールバック: localStorageから取得（念のため）
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser)
          if (userData.id) {
            creator = userData.id
            console.log('localStorageからユーザーIDを取得:', creator);
          }
        } catch (e) {
          console.error('localStorageの解析に失敗:', e);
        }
      }
    }

    console.log('creator IDを設定:', creator);

    // creatorが無効な場合はエラーを表示して処理を中断
    if (creator === '00000000-0000-0000-0000-000000000000') {
      console.error('無効なユーザーIDです。ログインしていることを確認してください。');
      alert('ユーザー情報が取得できません。ログインしていることを確認してください。');
      return;
    }

    const newRecent = [dataToSubmit, ...recentTransactions].slice(0, 5)
    setRecentTransactions(newRecent)
    localStorage.setItem('recentTransactions', JSON.stringify(newRecent))

    // typeプロパティが設定されていない場合、amountの正負で判断
    const transactionData = { ...dataToSubmit, creator };
    if (!transactionData.type) {
      const amount = typeof transactionData.amount === 'string' ? parseFloat(transactionData.amount) : transactionData.amount;
      transactionData.type = amount > 0 ? 'income' : 'expense';
      console.log('typeプロパティを自動設定:', transactionData.type);
    }

    onSubmit(transactionData)
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
      {/* Tabs */}
      {/* Tabs */}
      <div className="flex bg-slate-800 p-1.5 rounded-full mb-8 border border-slate-700 w-full shadow-lg shadow-black/20">
        <button
          type="button"
          onClick={() => setActiveTab('normal')}
          className={`flex-1 flex items-center justify-center py-2 px-6 rounded-full text-sm font-bold transition-all duration-300 ${activeTab === 'normal'
            ? 'bg-primary text-white shadow-md shadow-primary/30'
            : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
        >
          <Wallet className="w-4 h-4 mr-2" />
          通常取引
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('depreciation')}
          className={`flex-1 flex items-center justify-center py-2 px-6 rounded-full text-sm font-bold transition-all duration-300 ${activeTab === 'depreciation'
            ? 'bg-primary text-white shadow-md shadow-primary/30'
            : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
        >
          <Clock className="w-4 h-4 mr-2" />
          減価償却資産
        </button>
      </div>

      {activeTab === 'normal' ? (
        <>
          <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
            <div></div>
            <div></div>
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
              <label className="block text-sm font-medium text-text-muted mb-1.5">日付</label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4 pointer-events-none z-10" />
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-text-main transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">カテゴリ(勘定科目)</label>
              <div className="relative">
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-text-main appearance-none transition-all"
                  required
                >
                  <option value="" className="bg-surface-highlight text-text-muted">カテゴリを選択</option>
                  <option value="業務委託収入" className="bg-surface-highlight">業務委託収入</option>
                  <option value="給与" className="bg-surface-highlight">給与</option>
                  {categoryOptions.filter(category => category !== '業務委託収入' && category !== '給与').map(category => (
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
              <label className="block text-sm font-medium text-text-muted mb-1.5">取引項目</label>
              <div className="relative">
                <select
                  name="item"
                  value={formData.item}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-text-main appearance-none transition-all"
                  required
                >
                  <option value="" className="bg-surface-highlight text-text-muted">取引項目を選択</option>
                  <option value="売上" className="bg-surface-highlight">売上</option>
                  <option value="コンビニ買い物" className="bg-surface-highlight">コンビニ買い物</option>
                  <option value="飲食代" className="bg-surface-highlight">飲食代</option>
                  <option value="事務用品" className="bg-surface-highlight">事務用品</option>
                  <option value="コーヒー代" className="bg-surface-highlight">コーヒー代</option>
                  <option value="新聞代" className="bg-surface-highlight">新聞代</option>
                  <option value="書籍代" className="bg-surface-highlight">書籍代</option>
                  <option value="切手代" className="bg-surface-highlight">切手代</option>
                  <option value="宅配便代" className="bg-surface-highlight">宅配便代</option>
                  <option value="電気代" className="bg-surface-highlight">電気代</option>
                  <option value="家賃" className="bg-surface-highlight">家賃</option>
                  <option value="インターネット接続料" className="bg-surface-highlight">インターネット接続料</option>
                  <option value="電話料金" className="bg-surface-highlight">電話料金</option>
                  <option value="水道代" className="bg-surface-highlight">水道代</option>
                  <option value="ガス代" className="bg-surface-highlight">ガス代</option>
                  <option value="出張費" className="bg-surface-highlight">出張費</option>
                  <option value="交通費" className="bg-surface-highlight">交通費</option>
                  <option value="電車代" className="bg-surface-highlight">電車代</option>
                  <option value="燃料代" className="bg-surface-highlight">燃料代</option>
                  <option value="修理代" className="bg-surface-highlight">修理代</option>
                  <option value="高速道路料金" className="bg-surface-highlight">高速道路料金</option>
                  <option value="固定資産税" className="bg-surface-highlight">固定資産税</option>
                  <option value="自動車税" className="bg-surface-highlight">自動車税</option>
                  <option value="印紙税" className="bg-surface-highlight">印紙税</option>
                  <option value="チラシ作成費" className="bg-surface-highlight">チラシ作成費</option>
                  <option value="ウェブ広告費" className="bg-surface-highlight">ウェブ広告費</option>
                  <option value="看板設置費" className="bg-surface-highlight">看板設置費</option>
                  <option value="贈答品代" className="bg-surface-highlight">贈答品代</option>
                  <option value="火災保険料" className="bg-surface-highlight">火災保険料</option>
                  <option value="生命保険料" className="bg-surface-highlight">生命保険料</option>
                  <option value="振込手数料" className="bg-surface-highlight">振込手数料</option>
                  <option value="税理士報酬" className="bg-surface-highlight">税理士報酬</option>
                  <option value="デザイン委託費" className="bg-surface-highlight">デザイン委託費</option>
                  <option value="システム開発費" className="bg-surface-highlight">システム開発費</option>
                  <option value="業務ツール" className="bg-surface-highlight">業務ツール</option>
                  <option value="サブスク" className="bg-surface-highlight">サブスク</option>
                  <option value="少額費用" className="bg-surface-highlight">少額費用</option>
                  <option value="その他" className="bg-surface-highlight">その他</option>
                </select>
                <div className="absolute right-3.5 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <Zap className="w-4 h-4 text-text-muted" />
                </div>
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
                  className="w-full pl-4 pr-10 py-2.5 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-text-main placeholder-text-muted transition-all"
                  required
                  min="0"
                  step="1"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted text-sm pointer-events-none">円</span>
                {isAmountFocused && (
                  <div className="absolute top-full left-0 mt-2 w-full bg-surface border border-border rounded-xl shadow-xl z-20 p-3 animate-in fade-in zoom-in-95 duration-200">
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
                          {amount.toLocaleString()}円
                        </button>
                      ))}
                    </div>
                  </div>
                )}
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
                    <span className="text-xs">×</span>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div>
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
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1.5">終了日</label>
                <input
                  type="date"
                  name="recurring_end_date"
                  value={formData.recurring_end_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-text-main transition-all"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-6 border-t border-border">
            <button
              type="button"
              onClick={onCancel}
              className="btn-tertiary whitespace-nowrap"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="btn-primary px-10 py-3 text-base font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span className="text-lg">+</span> {transaction ? '更新' : '記録する'}
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="space-y-6">
            {/* Asset Name */}
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">資産名称 *</label>
              <input
                type="text"
                name="item"
                value={formData.item}
                onChange={handleChange}
                placeholder="例: パソコン、営業車"
                className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-text-main transition-all placeholder:text-text-muted/50"
                required
              />
            </div>

            {/* Price & Date Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1.5">取得価額 *</label>
                <div className="relative">
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-text-main font-mono text-lg transition-all"
                    placeholder="0"
                    min="0"
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">円</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-muted mb-1.5">取得年月</label>
                <div className="relative">
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-text-main transition-all"
                    required
                  />
                  {/* Calendar icon removed to avoid duplication with browser native picker */}
                </div>
              </div>
            </div>

            {/* Method & Life Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1.5">償却方法</label>
                <div className="relative">
                  <select
                    value={depreciationMethod}
                    onChange={(e) => setDepreciationMethod(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-text-main appearance-none transition-all"
                  >
                    <option value="定額法">定額法</option>
                    <option value="定率法">定率法</option>
                    <option value="一括償却 (3年)">一括償却 (3年)</option>
                    <option value="生産高比例法">生産高比例法</option>
                    <option value="リース期間定額法">リース期間定額法</option>
                    <option value="少額減価償却資産 (特例)">少額減価償却資産 (特例)</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-muted mb-1.5">耐用年数 (年)</label>
                <input
                  type="number"
                  value={usefulLife}
                  onChange={(e) => setUsefulLife(Number(e.target.value))}
                  min="1"
                  max="100"
                  className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-text-main font-mono text-lg transition-all"
                  required
                />
              </div>
            </div>

            {/* Usage Ratio */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1.5">事業専用割合 (%)</label>
                <input
                  type="number"
                  value={businessRatio}
                  onChange={(e) => setBusinessRatio(Number(e.target.value))}
                  min="0"
                  max="100"
                  className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-text-main font-mono text-lg transition-all"
                />
              </div>
              {/* Category (Optional) could go here or replace method if needed, but keeping method separate as requested */}
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1.5">勘定科目 (任意)</label>
                <div className="relative">
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    list="asset-categories"
                    className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-text-main transition-all"
                    placeholder="例: 工具器具備品"
                  />
                  <datalist id="asset-categories">
                    <option value="工具器具備品" />
                    <option value="車両運搬具" />
                    <option value="機械装置" />
                    <option value="建物付属設備" />
                    <option value="一括償却資産" />
                  </datalist>
                </div>
              </div>
            </div>

            <div className="flex justify-end items-center gap-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="btn-tertiary whitespace-nowrap"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="btn-primary px-10 py-3 text-base font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span className="text-lg">+</span> 追加する
              </button>
            </div>

            {/* Info Box */}
            <div className="bg-blue-900/20 p-4 rounded-xl border border-blue-500/30 mt-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <Clock className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">減価償却の記帳について</h4>
                  <p className="text-xs text-blue-200/80 leading-relaxed">
                    ここで計算された償却費の合計額は、自動的に損益計算書の「減価償却費」として計上されます。
                    10万円未満の資産は消耗品費として処理できます（青色申告の場合は30万円未満を少額減価償却資産として即時償却できる特例もあります）。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </form>
  )
}

export default TransactionForm
