import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'

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
}

interface TransactionFormProps {
  transaction?: Transaction
  onSubmit: (transaction: Omit<Transaction, 'id'>) => void
  onCancel: () => void
}

const TransactionForm: React.FC<TransactionFormProps> = ({ transaction, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Omit<Transaction, 'id'>>({
    item: transaction?.item || '給与',
    amount: transaction?.amount || 0,
    date: transaction?.date || new Date().toISOString().split('T')[0],
    category: transaction?.category || '食費',
    type: transaction?.type || 'expense',
    description: transaction?.description || '',
    receipt_url: transaction?.receipt_url || '',
    location: transaction?.location || '',
    tags: transaction?.tags || [],
    recurring: transaction?.recurring || false,
    recurring_frequency: transaction?.recurring_frequency || 'monthly'
  })

  const [tagInput, setTagInput] = useState('')
  const [locationHistory, setLocationHistory] = useState<string[]>([])

  // 過去の場所入力履歴をローカルストレージから取得
  useEffect(() => {
    const history = localStorage.getItem('locationHistory')
    if (history) {
      setLocationHistory(JSON.parse(history))
    }
  }, [])

  const itemOptions = ['給与', '副業収入', '賞与', '事業所得', '配当金', '利息', '家賃収入', 'その他収入', '食費', '交通費', '消耗品費', '通信費', '光熱費', '住居費', '医療費', '教育費', '娯楽費', '衣服費', '美容費', '交際費', 'その他支出']
  const categoryOptions = ['食費', '交通費', '消耗品費', '通信費', '光熱費', '住居費', '医療費', '教育費', '娯楽費', '衣服費', '美容費', '交際費', 'その他']
  const typeOptions = ['income', 'expense']
  const locationOptions = ['自宅', 'オフィス', 'コンビニ', 'スーパー', 'レストラン', '駅', '銀行', '病院', '学校', 'ジム', '美容院', 'その他']
  const tagOptions = ['仕事関連', '個人', '家族', '友人', '旅行', '買い物', '食事', '交通', '医療', '教育', '娯楽', '衣服', '美容', '住居', '光熱費', '通信費', 'その他']
  const frequencyOptions = ['daily', 'weekly', 'monthly', 'yearly']

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
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
    onSubmit(formData)
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">取引項目</label>
          <select
            name="item"
            value={formData.item}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            {itemOptions.map(item => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">金額</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">日付</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categoryOptions.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">タイプ</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="income">収入</option>
            <option value="expense">支出</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">場所</label>
          <div className="grid grid-cols-3 gap-2 mb-2">
            {locationOptions.map(location => (
              <label key={location} className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={formData.location === location}
                  onChange={() => handleLocationSelect(location)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">{location}</span>
              </label>
            ))}
          </div>
          {locationHistory.length > 0 && (
            <div className="mt-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">過去の場所</label>
              <div className="flex flex-wrap gap-1">
                {locationHistory.map(location => (
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
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">タグ</label>
        <div className="grid grid-cols-3 gap-2 mb-2">
          {tagOptions.map(tag => (
            <label key={tag} className="inline-flex items-center">
              <input
                type="checkbox"
                checked={formData.tags?.includes(tag)}
                onChange={() => {
                  if (formData.tags?.includes(tag)) {
                    setFormData(prev => ({ ...prev, tags: prev.tags?.filter(t => t !== tag) || [] }))
                  } else {
                    setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), tag] }))
                  }
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">{tag}</span>
            </label>
          ))}
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
            {frequencyOptions.map(frequency => (
              <option key={frequency} value={frequency}>
                {frequency === 'daily' && '日次'}
                {frequency === 'weekly' && '週次'}
                {frequency === 'monthly' && '月次'}
                {frequency === 'yearly' && '年次'}
              </option>
            ))}
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