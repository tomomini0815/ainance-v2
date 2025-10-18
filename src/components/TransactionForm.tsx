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
  creator?: string // creatorフィールドを追加
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
    creator: transaction?.creator || '' // creatorフィールドを初期化
  })

  const [tagInput, setTagInput] = useState('')
  const [locationHistory, setLocationHistory] = useState<string[]>([])
  const [favoriteCategories, setFavoriteCategories] = useState<string[]>([])
  const [recentTransactions, setRecentTransactions] = useState<Omit<Transaction, 'id'>[]>([])
  const [isAmountFocused, setIsAmountFocused] = useState(false)
  const [quickAmount, setQuickAmount] = useState<number | null>(null)

  // 過去の場所入力履歴とお気に入りカテゴリをローカルストレージから取得
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

  // カテゴリの選択肢を動的に生成
  const categoryOptions = useMemo(() => {
    // 一般的なカテゴリ
    const commonCategories = [
      '食費', '交通費', '消耗品費', '通信費', '光熱費', '住居費', '医療費', '教育費', 
      '娯楽費', '衣服費', '美容費', '交際費', '給与', '副業収入', '賞与', '事業所得', 
      '配当金', '利息', '家賃収入', 'その他収入', 'その他支出'
    ]
    
    // お気に入りカテゴリを先頭に配置
    const allCategories = [...new Set([...favoriteCategories, ...commonCategories])]
    return allCategories
  }, [favoriteCategories])

  // 金額のクイック入力オプション
  const quickAmountOptions = [1000, 3000, 5000, 10000, 30000]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // 金額のクイック入力
  const handleQuickAmountSelect = (amount: number) => {
    setFormData(prev => ({
      ...prev,
      amount
    }))
    setQuickAmount(amount)
  }

  // お気に入りカテゴリの切り替え
  const toggleFavoriteCategory = (category: string) => {
    const newFavorites = favoriteCategories.includes(category)
      ? favoriteCategories.filter(fav => fav !== category)
      : [...favoriteCategories, category]
    
    setFavoriteCategories(newFavorites)
    localStorage.setItem('favoriteCategories', JSON.stringify(newFavorites))
  }

  // 場所選択時に履歴を更新
  const handleLocationSelect = (location: string) => {
    setFormData(prev => ({ ...prev, location }))
    
    // 履歴を更新
    if (!locationHistory.includes(location)) {
      const newHistory = [location, ...locationHistory].slice(0, 10) // 最大10件まで保持
      setLocationHistory(newHistory)
      localStorage.setItem('locationHistory', JSON.stringify(newHistory))
    }
  }

  // 最近の取引から選択
  const handleRecentTransactionSelect = (recentTransaction: Omit<Transaction, 'id'>) => {
    // 新しいオブジェクトを作成し、日付のみ現在日時で更新
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
    
    // creatorフィールドをローカルストレージから取得したユーザー情報で設定
    const storedUser = localStorage.getItem('user')
    let creator = '00000000-0000-0000-0000-000000000000' // ダミーのUUID
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        // UUID形式のチェック
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
    
    // 最近の取引を更新
    const newRecent = [formData, ...recentTransactions].slice(0, 5) // 最大5件まで保持
    setRecentTransactions(newRecent)
    localStorage.setItem('recentTransactions', JSON.stringify(newRecent))
    
    // creatorフィールドを設定して送信
    onSubmit({ ...formData, creator })
  }

  // 収入/支出に応じたカテゴリアイコン
  const getCategoryIcon = (category: string, type: string) => {
    if (type === 'income') {
      return <TrendingUp className="w-4 h-4 text-green-500" />
    }
    
    // 支出カテゴリに応じたアイコン
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
      default: return <Wallet className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          {transaction ? '取引編集' : '新規取引作成'}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* 最近の取引 */}
      {recentTransactions.length > 0 && !transaction && (
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <Clock className="w-4 h-4 text-gray-500 mr-2" />
            <h3 className="text-sm font-medium text-gray-700">最近の取引</h3>
          </div>
          <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
            {recentTransactions.slice(0, 3).map((recent, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleRecentTransactionSelect(recent)}
                className="flex items-center justify-between p-2 text-sm bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center">
                  {getCategoryIcon(recent.category, recent.type)}
                  <span className="ml-2 font-medium">{recent.item}</span>
                </div>
                <div className="text-gray-500">
                  {recent.type === 'income' ? '+' : '-'}¥{Math.abs(recent.amount).toLocaleString()}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">取引項目</label>
          <div className="relative">
            <input
              type="text"
              name="item"
              value={formData.item}
              onChange={handleChange}
              placeholder="例: コンビニ買い物"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <label className="block text-sm font-medium text-gray-700 mb-1">金額</label>
          <div className="relative">
            <input
              type="number"
              name="amount"
              value={formData.amount || ''}
              onChange={handleChange}
              onFocus={() => setIsAmountFocused(true)}
              onBlur={() => setTimeout(() => setIsAmountFocused(false), 200)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              min="0"
              step="1"
            />
            {isAmountFocused && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-2">
                <div className="text-xs text-gray-500 mb-1">クイック入力:</div>
                <div className="flex flex-wrap gap-1">
                  {quickAmountOptions.map(amount => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => handleQuickAmountSelect(amount)}
                      className={`px-2 py-1 text-xs rounded ${
                        quickAmount === amount
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
          <label className="block text-sm font-medium text-gray-700 mb-1">日付</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ</label>
          <div className="relative">
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              required
            >
              <option value="">カテゴリを選択</option>
              {categoryOptions.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            {formData.category && (
              <button
                type="button"
                onClick={() => toggleFavoriteCategory(formData.category)}
                className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-yellow-500"
              >
                <Star className={`w-4 h-4 ${favoriteCategories.includes(formData.category) ? 'fill-yellow-400 text-yellow-400' : ''}`} />
              </button>
            )}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <Zap className="w-4 h-4 text-gray-400" />
            </div>
          </div>
          
          {/* お気に入りカテゴリのクイック選択 */}
          {favoriteCategories.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {favoriteCategories.slice(0, 5).map(category => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, category }))}
                  className={`px-2 py-1 text-xs rounded flex items-center ${
                    formData.category === category
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">タイプ</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, type: 'expense' }))}
              className={`flex items-center justify-center px-3 py-2 rounded-lg border ${
                formData.type === 'expense'
                  ? 'bg-red-50 border-red-300 text-red-700'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <TrendingDown className="w-4 h-4 mr-2" />
              支出
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, type: 'income' }))}
              className={`flex items-center justify-center px-3 py-2 rounded-lg border ${
                formData.type === 'income'
                  ? 'bg-green-50 border-green-300 text-green-700'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              収入
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">場所</label>
          <div className="relative">
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="場所を入力"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <label className="block text-xs font-medium text-gray-500 mb-1">最近の場所</label>
              <div className="flex flex-wrap gap-1">
                {locationHistory.slice(0, 5).map(location => (
                  <button
                    key={location}
                    type="button"
                    onClick={() => handleLocationSelect(location)}
                    className={`px-2 py-1 text-xs rounded ${
                      formData.location === location
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
        <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={2}
          placeholder="取引の詳細を入力（任意）"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">タグ</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.tags?.map(tag => (
            <span 
              key={tag} 
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              <Tag className="w-3 h-3 mr-1" />
              {tag}
              <button
                type="button"
                onClick={() => handleTagRemove(tag)}
                className="ml-1 inline-flex items-center"
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
            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-700 hover:bg-gray-200"
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
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label className="ml-2 block text-sm text-gray-700">
          繰り返し取引
        </label>
      </div>

      {formData.recurring && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">繰り返し頻度</label>
          <select
            name="recurring_frequency"
            value={formData.recurring_frequency}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="daily">日次</option>
            <option value="weekly">週次</option>
            <option value="monthly">月次</option>
            <option value="yearly">年次</option>
          </select>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          キャンセル
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {transaction ? '更新' : '作成'}
        </button>
      </div>
    </form>
  )
}

export default TransactionForm