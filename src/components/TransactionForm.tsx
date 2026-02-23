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
  recurring_start_date?: string
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
    recurring_start_date: transaction?.recurring_start_date || new Date().toISOString().split('T')[0],
    recurring_end_date: transaction?.recurring_end_date || new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0],
    creator: transaction?.creator || ''
  })

  // Placeholder for component logic


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
  const [showBusinessRatioInput, setShowBusinessRatioInput] = useState<boolean>(false)
  const [acqDate, setAcqDate] = useState<string>(transaction?.date || new Date().toISOString().split('T')[0])

  const annualDepreciation = useMemo(() => {
    const amount = Number(formData.amount) || 0;
    const ratio = businessRatio / 100;
    const baseAmount = amount * ratio;

    if (depreciationMethod === '少額減価償却資産 (特例)') {
      return baseAmount;
    }
    if (depreciationMethod === '一括償却 (3年)') {
      return baseAmount / 3; // 法令上、月割は行わない
    }

    if (usefulLife <= 0) return 0;
    const fullAnnual = baseAmount / usefulLife;

    // 取得日と計上年度の比較による計算
    const acquisitionDate = new Date(acqDate);
    const reportingDate = formData.date ? new Date(formData.date) : new Date();

    const acqYear = acquisitionDate.getFullYear();
    const repYear = reportingDate.getFullYear();

    if (repYear < acqYear) return 0; // 取得前は償却なし

    if (repYear === acqYear) {
      // 1年目: 取得月に基づく月割
      const acquisitionMonth = acquisitionDate.getMonth() + 1;
      const remainingMonths = 12 - acquisitionMonth + 1;
      return (fullAnnual * remainingMonths) / 12;
    } else {
      // 2年目以降
      const yearsElapsed = repYear - acqYear;

      // 耐用年数を超えているかチェック
      if (yearsElapsed >= usefulLife) {
        // 最終年（端数月）の計算
        const acqMonth = acquisitionDate.getMonth() + 1;
        const firstYearMonths = 12 - acqMonth + 1;
        const lastYearMonths = 12 - firstYearMonths;

        if (yearsElapsed === Math.ceil(usefulLife) && lastYearMonths > 0) {
          return (fullAnnual * lastYearMonths) / 12;
        }
        return 0; // すでに償却完了
      }

      return fullAnnual; // 通常の12ヶ月分
    }
  }, [formData.amount, formData.date, acqDate, usefulLife, depreciationMethod, businessRatio]);

  useEffect(() => {
    const history = localStorage.getItem('locationHistory')
    if (history) setLocationHistory(JSON.parse(history))
    const favorites = localStorage.getItem('favoriteCategories')
    if (favorites) setFavoriteCategories(JSON.parse(favorites))
    const recent = localStorage.getItem('recentTransactions')
    if (recent) setRecentTransactions(JSON.parse(recent))
  }, [])

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
        recurring_start_date: transaction.recurring_start_date || new Date().toISOString().split('T')[0],
        recurring_end_date: transaction.recurring_end_date || new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0],
        creator: transaction.creator || ''
      })

      // 減価償却資産の場合、説明欄から取得日や事業割合を復元
      if (transaction.tags?.includes('depreciation_asset')) {
        setActiveTab('depreciation');
        const acqMatch = transaction.description?.match(/取得日:(\d{4}-\d{2}-\d{2})/);
        if (acqMatch) {
          setAcqDate(acqMatch[1]);
        } else {
          // 取得日が説明欄にない場合は取引日を使用（古いデータなど）
          setAcqDate(transaction.date);
        }

        const ratioMatch = transaction.description?.match(/事業割合:(\d+)%/);
        if (ratioMatch) {
          setBusinessRatio(parseInt(ratioMatch[1], 10));
        }

        // 取得価額の復元
        const amountMatch = transaction.description?.match(/取得価額:¥([\d,]+)/);
        if (amountMatch) {
          // フォーム上の金額は取得価額として表示したい（保存時は今期償却額になるが、入力時は取得価額）
          setFormData(prev => ({ ...prev, amount: parseInt(amountMatch[1].replace(/,/g, ''), 10) }));
        } else {
          // 取得価額がない場合（古いデータ）、年数と償却額から逆算するか、transaction.amount（これまでの仕様ではここが取得価額だった可能性がある）を使う
          // しかし、直近の修正でtransaction.amountは今期償却額になっている可能性がある。
          // ひとまずtransaction.amountをそのまま使う。
        }
      } else if (transaction.tags?.includes('business_ratio_applied')) {
        // 通常の家事按分の場合
        const ratioMatch = transaction.description?.match(/事業割合: (\d+)%/);
        if (ratioMatch) {
          setBusinessRatio(parseInt(ratioMatch[1], 10));
          setShowBusinessRatioInput(true);
          // 支払総額の復元
          const totalMatch = transaction.description?.match(/支払総額: ¥([\d,]+)/);
          if (totalMatch) {
            setFormData(prev => ({ ...prev, amount: parseInt(totalMatch[1].replace(/,/g, ''), 10) }));
          }
        }
      }
    }
  }, [transaction])

  useEffect(() => {
    if (depreciationMethod === '少額減価償却資産 (特例)') {
      setUsefulLife(1)
    }
  }, [depreciationMethod])

  // カテゴリ変更時の家事按分デフォルト設定
  useEffect(() => {
    const category = formData.category;
    if (activeTab === 'normal') {
      if (['家賃', '地代家賃'].includes(category)) {
        setShowBusinessRatioInput(true);
        setBusinessRatio(30);
      } else if (['水道代', 'ガス代', '電気代', '水道光熱費'].includes(category)) {
        setShowBusinessRatioInput(true);
        setBusinessRatio(20);
      } else if (['インターネット接続料', '電話料金', '通信費'].includes(category)) {
        setShowBusinessRatioInput(true);
        setBusinessRatio(50);
      } else {
        setShowBusinessRatioInput(false);
        setBusinessRatio(100);
      }
    }
  }, [formData.category, activeTab])

  const categoryOptions = useMemo(() => {
    return [...new Set([...favoriteCategories, ...STANDARD_CATEGORIES])]
  }, [favoriteCategories])

  const quickAmountOptions = [1000, 3000, 5000, 10000, 30000]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined

    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };

      // 特殊処理: 取引項目が「役員報酬」の場合、カテゴリを「役員報酬」に自動設定
      if (name === 'item' && value === '役員報酬') {
        newData.category = '役員報酬';
      }

      return newData;
    })
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
      const year = formData.date ? new Date(formData.date).getFullYear() : new Date().getFullYear();
      const reportDate = formData.date || new Date().toISOString().split('T')[0];
      const acqMonth = new Date(acqDate).getMonth() + 1;

      let calcBasis = '';
      const acqYear = new Date(acqDate).getFullYear();
      const repYear = new Date(reportDate).getFullYear();

      if (acqYear === repYear) {
        calcBasis = `${12 - acqMonth + 1}ヶ月分`;
      } else {
        calcBasis = `12ヶ月分`;
      }

      const depreciationInfo = `\n[固定資産台帳] 取得日:${acqDate}, 計上日:${reportDate}, 取得価額:¥${formData.amount}, 償却方法:${depreciationMethod}, 耐用年数:${usefulLife}年, 事業割合:${businessRatio}%, 今期(${year}年)償却額:¥${Math.round(annualDepreciation).toLocaleString()} (${calcBasis})`;

      // 既存の説明から古い固定資産台帳情報を削除（重複防止）
      let cleanDescription = dataToSubmit.description || '';
      // $アンカーを削除し、すべての行の固定資産台帳情報を削除
      cleanDescription = cleanDescription.replace(/\n\[固定資産台帳\].*/g, '');

      dataToSubmit.description = cleanDescription + depreciationInfo;
      dataToSubmit.tags = [...(dataToSubmit.tags || []), 'depreciation_asset'];

      // 金額を今期償却額に上書き
      dataToSubmit.amount = Math.round(annualDepreciation);
      console.log(`減価償却資産: 取得価額 ${formData.amount} -> 今期償却額 ${dataToSubmit.amount}`);
    } else {
      // 通常取引での家事按分計算（経費の場合のみ）
      if (showBusinessRatioInput && businessRatio < 100 && dataToSubmit.type === 'expense') {
        const originalAmount = typeof dataToSubmit.amount === 'string' ? parseFloat(dataToSubmit.amount) : dataToSubmit.amount;
        // 端数切り捨て（安全側）
        const deductibleAmount = Math.floor(originalAmount * (businessRatio / 100));

        const ratioInfo = ` (支払総額: ¥${originalAmount.toLocaleString()}, 事業割合: ${businessRatio}%)`;

        // 既存の説明から古い家事按分情報を削除（重複防止）
        let cleanDescription = dataToSubmit.description || '';
        // カッコつきの支払総額情報を削除。複数ある場合も考慮して末尾アンカー削除
        cleanDescription = cleanDescription.replace(/\s*\(支払総額:.*?\%\)/g, '');

        dataToSubmit.description = cleanDescription + ratioInfo;
        dataToSubmit.amount = deductibleAmount;
        dataToSubmit.tags = [...(dataToSubmit.tags || []), 'business_ratio_applied'];

        console.log(`家事按分適用: 総額 ${originalAmount} -> 計上額 ${deductibleAmount} (割合 ${businessRatio}%)`);
      }
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
      case '設備費': return <span className="text-lg">🛠️</span>
      case '車両費': return <span className="text-lg">🚗</span>
      default: return <Wallet className="w-4 h-4 text-text-muted" />
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-text-main">
      {/* Tabs */}
      {/* Tabs */}
      {/* Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-900/60 p-1 rounded-full mb-8 border border-slate-200 dark:border-slate-700/50 w-full shadow-inner backdrop-blur-md">
        <button
          type="button"
          onClick={() => setActiveTab('normal')}
          className={`flex-1 flex items-center justify-center py-2.5 px-2 sm:px-4 rounded-full text-xs sm:text-sm font-bold transition-all duration-500 whitespace-nowrap ${activeTab === 'normal'
            ? 'bg-white dark:bg-slate-800 text-primary shadow-lg shadow-black/5 dark:shadow-black/20 transform scale-[1.02]'
            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
        >
          <Wallet className={`w-4 h-4 mr-2 transition-colors duration-500 ${activeTab === 'normal' ? 'text-primary' : 'text-slate-500'}`} />
          通常取引
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('depreciation')}
          className={`flex-1 flex items-center justify-center py-2.5 px-2 sm:px-4 rounded-full text-xs sm:text-sm font-bold transition-all duration-500 whitespace-nowrap ${activeTab === 'depreciation'
            ? 'bg-white dark:bg-slate-800 text-primary shadow-lg shadow-black/5 dark:shadow-black/20 transform scale-[1.02]'
            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
        >
          <Clock className={`w-4 h-4 mr-2 transition-colors duration-500 ${activeTab === 'depreciation' ? 'text-primary' : 'text-slate-500'}`} />
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
                  className="w-full min-w-0 appearance-none pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-text-main transition-all"
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
                  className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-text-main appearance-none transition-all"
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
                <input
                  name="item"
                  list="items-list"
                  value={formData.item}
                  onChange={handleChange}
                  placeholder="取引項目を入力または選択"
                  className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-text-main transition-all"
                  required
                />
                <datalist id="items-list">
                  <option value="売上" />
                  <option value="役員報酬" />
                  <option value="コンビニ買い物" />
                  <option value="飲食代" />
                  <option value="事務用品" />
                  <option value="コーヒー代" />
                  <option value="新聞代" />
                  <option value="書籍代" />
                  <option value="切手代" />
                  <option value="宅配便代" />
                  <option value="電気代" />
                  <option value="家賃" />
                  <option value="インターネット接続料" />
                  <option value="電話料金" />
                  <option value="携帯代" />
                  <option value="水道代" />
                  <option value="ガス代" />
                  <option value="出張費" />
                  <option value="交通費" />
                  <option value="電車代" />
                  <option value="燃料代" />
                  <option value="修理代" />
                  <option value="高速道路料金" />
                  <option value="固定資産税" />
                  <option value="自動車税" />
                  <option value="印紙税" />
                  <option value="チラシ作成費" />
                  <option value="ウェブ広告費" />
                  <option value="看板設置費" />
                  <option value="贈答品代" />
                  <option value="火災保険料" />
                  <option value="生命保険料" />
                  <option value="振込手数料" />
                  <option value="税理士報酬" />
                  <option value="デザイン委託費" />
                  <option value="システム開発費" />
                  <option value="業務ツール" />
                  <option value="サブスク" />
                  <option value="少額費用" />
                  <option value="為替" />
                  <option value="暗号資産" />
                </datalist>
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
                  className="w-full pl-4 pr-10 py-2.5 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-text-main placeholder-text-muted transition-all"
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
                  className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-text-main placeholder-text-muted transition-all"
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

          {/* Business Ratio Input (Moved outside grid for full width) */}
          {showBusinessRatioInput && formData.type === 'expense' && (
            <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30 animate-in fade-in slide-in-from-top-2">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <div>
                  <h4 className="text-sm font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                    <Wallet className="w-4 h-4" />
                    家事按分 (事業利用割合)
                  </h4>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    自宅兼事務所の家賃や光熱費など、プライベートと事業の兼用経費の割合を設定します。
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-text-muted">経費計上額</div>
                  <div className="text-xl font-bold text-primary">
                    ¥{Math.floor((Number(formData.amount) || 0) * (businessRatio / 100)).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={businessRatio}
                  onChange={(e) => setBusinessRatio(Number(e.target.value))}
                  className="flex-1 h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer dark:bg-blue-800"
                />
                <div className="w-16 text-right font-medium text-text-main">
                  {businessRatio}%
                </div>
              </div>
              <div className="flex justify-between text-xs text-text-muted mt-1 px-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          )}

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
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1.5">開始日</label>
                  <input
                    type="date"
                    name="recurring_start_date"
                    value={formData.recurring_start_date}
                    onChange={handleChange}
                    className="w-full min-w-0 appearance-none px-4 py-2.5 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-text-main transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1.5">終了日</label>
                  <input
                    type="date"
                    name="recurring_end_date"
                    value={formData.recurring_end_date}
                    onChange={handleChange}
                    className="w-full min-w-0 appearance-none px-4 py-2.5 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-text-main transition-all"
                  />
                </div>
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
            {/* Name & Price Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1.5">資産名称 *</label>
                <input
                  type="text"
                  name="item"
                  value={formData.item}
                  onChange={handleChange}
                  placeholder="例: パソコン、営業車"
                  className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-text-main transition-all placeholder:text-text-muted/50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1.5">取得価額 *</label>
                <div className="relative">
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-text-main transition-all"
                    placeholder="0"
                    min="0"
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">円</span>
                </div>
              </div>
            </div>

            {/* Date Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1.5">取得年月日</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-text-muted" />
                  </div>
                  <input
                    type="date"
                    value={acqDate}
                    onChange={(e) => setAcqDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-text-main transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-muted mb-1.5">計上年度の決算日等</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-text-muted" />
                  </div>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-text-main transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1.5">償却方法</label>
                <div className="relative">
                  <select
                    value={depreciationMethod}
                    onChange={(e) => setDepreciationMethod(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-text-main appearance-none transition-all cursor-pointer"
                  >
                    <option value="定額法">定額法</option>
                    <option value="定率法">定率法 (要届出)</option>
                    <option value="一括償却 (3年)">一括償却 (3年)</option>
                    <option value="少額減価償却資産 (特例)">少額特例 (30万未満)</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-muted mb-1.5">耐用年数</label>
                <div className="relative">
                  <input
                    type="number"
                    value={usefulLife}
                    onChange={(e) => setUsefulLife(Number(e.target.value))}
                    min="1"
                    max="100"
                    disabled={depreciationMethod === '一括償却 (3年)' || depreciationMethod === '少額減価償却資産 (特例)'}
                    className={`w-full px-4 py-2.5 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-text-main transition-all ${(depreciationMethod === '一括償却 (3年)' || depreciationMethod === '少額減価償却資産 (特例)') ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">年</span>
                </div>
              </div>
            </div>

            {/* Usage Ratio */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1.5">事業専用割合 (%)</label>
                <input
                  type="number"
                  value={businessRatio}
                  onChange={(e) => setBusinessRatio(Number(e.target.value))}
                  min="0"
                  max="100"
                  className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-text-main transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1.5">勘定科目 (任意)</label>
                <div className="relative">
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    list="asset-categories"
                    className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-text-main transition-all"
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

            {/* Calculated Depreciation Result */}
            <div className="bg-surface-highlight/50 px-4 py-3 rounded-xl border border-border/50 animate-in fade-in slide-in-from-top-1 duration-300">
              <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider">償却年度</span>
                  <span className="text-sm font-bold text-text-secondary">
                    {formData.date ? new Date(formData.date).getFullYear() : new Date().getFullYear()}年度分
                    <span className="text-[10px] text-text-muted ml-1">
                      {(() => {
                        const acquisitionDate = new Date(acqDate);
                        const reportingDate = formData.date ? new Date(formData.date) : new Date();
                        const acqYear = acquisitionDate.getFullYear();
                        const repYear = reportingDate.getFullYear();

                        if (repYear < acqYear) return '(0ヶ月)';
                        if (repYear === acqYear) return `(${(12 - (acquisitionDate.getMonth() + 1) + 1)}ヶ月)`;

                        const yearsElapsed = repYear - acqYear;
                        if (yearsElapsed >= usefulLife) {
                          const lastYearMonths = 12 - (12 - (acquisitionDate.getMonth() + 1) + 1);
                          if (yearsElapsed === Math.ceil(usefulLife) && lastYearMonths > 0) return `(${lastYearMonths}ヶ月)`;
                          return '(償却済)';
                        }
                        return '(12ヶ月)';
                      })()}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider">今期償却額</span>
                  <div className="text-lg font-bold text-primary">
                    ¥{Math.round(annualDepreciation).toLocaleString()}
                  </div>
                </div>
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
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-500/30 mt-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <Clock className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-blue-800 dark:text-white mb-1">減価償却の記帳について</h4>
                <p className="text-xs text-blue-700 dark:text-blue-200/80 leading-relaxed">
                  ここで計算された償却費の合計額は、自動的に損益計算書の「減価償却費」として計上されます。
                  10万円未満の資産は消耗品費として処理できます（青色申告の場合は30万円未満を少額減価償却資産として即時償却できる特例もあります）。
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </form>
  )
}

export default TransactionForm
