
import { useState, useEffect, useCallback } from 'react'
import { lumi } from '../lib/lumi'
import toast from 'react-hot-toast'

interface Transaction {
  _id: string
  item: string
  amount: number
  date: string
  category: string
  type: string
  description?: string
  receipt_url?: string
  creator: string
  createdAt: string
  updatedAt: string
  tags?: string[]
  location?: string
  recurring?: boolean
  recurring_frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly'
}

interface AITransaction {
  _id: string
  item: string
  amount: number
  category: string
  confidence: number
  ai_category: string
  manual_verified: boolean
  original_text?: string
  receipt_url?: string
  location?: string
  creator: string
  createdAt: string
  updatedAt: string
  ai_suggestions?: string[]
  learning_feedback?: string
  processing_time?: number
}

interface TransactionStats {
  totalIncome: number
  totalExpense: number
  netAmount: number
  averageTransaction: number
  transactionCount: number
  categoryBreakdown: Record<string, number>
  monthlyTrend: Array<{ month: string; income: number; expense: number; net: number }>
  yearlyComparison: Array<{ year: string; income: number; expense: number }>
  topExpenseCategories: Array<{ category: string; amount: number; percentage: number }>
  cashFlowProjection: Array<{ month: string; projected: number; actual?: number }>
  budgetVariance: Record<string, { budgeted: number; actual: number; variance: number }>
  recurringTransactions: number
  averageDailySpend: number
  largestTransaction: Transaction | null
  frequentVendors: Array<{ vendor: string; count: number; total: number }>
}

interface AIStats {
  totalProcessed: number
  averageConfidence: number
  accuracyRate: number
  learningProgress: number
  categoryAccuracy: Record<string, { accuracy: number; processed: number; verified: number }>
  processingSpeed: number
  improvementRate: number
  confidenceDistribution: { high: number; medium: number; low: number }
}

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [aiTransactions, setAiTransactions] = useState<AITransaction[]>([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<TransactionStats | null>(null)
  const [aiStats, setAiStats] = useState<AIStats | null>(null)

  // 高度な取引履歴取得（フィルター、ソート、ページネーション対応）
  const fetchTransactions = useCallback(async (filters?: any) => {
    setLoading(true)
    try {
      const response = await lumi.entities.transactions.list({
        sort: { date: -1 },
        limit: 1000,
        ...filters
      })
      setTransactions(response.list || [])
      calculateAdvancedStats(response.list || [])
    } catch (error: any) {
      console.error('取引履歴の取得に失敗:', error)
      toast.error('取引履歴の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [])

  // AI取引の高度な取得
  const fetchAITransactions = useCallback(async (filters?: any) => {
    setLoading(true)
    try {
      const response = await lumi.entities.ai_transactions.list({
        sort: { createdAt: -1 },
        limit: 1000,
        ...filters
      })
      setAiTransactions(response.list || [])
      calculateAIStats(response.list || [])
    } catch (error: any) {
      console.error('AI取引履歴の取得に失敗:', error)
      toast.error('AI取引履歴の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [])

  // 高度な統計計算
  const calculateAdvancedStats = (transactionList: Transaction[]) => {
    const income = transactionList.filter(t => t.category === '収入').reduce((sum, t) => sum + t.amount, 0)
    const expense = transactionList.filter(t => t.category === '支出').reduce((sum, t) => sum + t.amount, 0)
    
    // カテゴリ別内訳
    const categoryBreakdown = transactionList.reduce((acc, t) => {
      acc[t.type] = (acc[t.type] || 0) + t.amount
      return acc
    }, {} as Record<string, number>)

    // 月別トレンド（過去12ヶ月）
    const monthlyTrend = []
    for (let i = 11; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthKey = date.toISOString().slice(0, 7)
      
      const monthTransactions = transactionList.filter(t => 
        t.date.startsWith(monthKey)
      )
      
      const monthIncome = monthTransactions.filter(t => t.category === '収入').reduce((sum, t) => sum + t.amount, 0)
      const monthExpense = monthTransactions.filter(t => t.category === '支出').reduce((sum, t) => sum + t.amount, 0)
      
      monthlyTrend.push({
        month: date.toLocaleDateString('ja-JP', { month: 'short' }),
        income: monthIncome,
        expense: monthExpense,
        net: monthIncome - monthExpense
      })
    }

    // 年別比較
    const yearlyComparison = []
    const currentYear = new Date().getFullYear()
    for (let year = currentYear - 2; year <= currentYear; year++) {
      const yearTransactions = transactionList.filter(t => 
        new Date(t.date).getFullYear() === year
      )
      const yearIncome = yearTransactions.filter(t => t.category === '収入').reduce((sum, t) => sum + t.amount, 0)
      const yearExpense = yearTransactions.filter(t => t.category === '支出').reduce((sum, t) => sum + t.amount, 0)
      
      yearlyComparison.push({
        year: year.toString(),
        income: yearIncome,
        expense: yearExpense
      })
    }

    // トップ支出カテゴリ
    const expenseByCategory = transactionList
      .filter(t => t.category === '支出')
      .reduce((acc, t) => {
        acc[t.type] = (acc[t.type] || 0) + t.amount
        return acc
      }, {} as Record<string, number>)

    const topExpenseCategories = Object.entries(expenseByCategory)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: (amount / expense) * 100
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)

    // キャッシュフロー予測（次の6ヶ月）
    const cashFlowProjection = []
    const avgMonthlyIncome = monthlyTrend.slice(-6).reduce((sum, m) => sum + m.income, 0) / 6
    const avgMonthlyExpense = monthlyTrend.slice(-6).reduce((sum, m) => sum + m.expense, 0) / 6
    
    for (let i = 1; i <= 6; i++) {
      const date = new Date()
      date.setMonth(date.getMonth() + i)
      cashFlowProjection.push({
        month: date.toLocaleDateString('ja-JP', { month: 'short' }),
        projected: avgMonthlyIncome - avgMonthlyExpense
      })
    }

    // 予算差異分析
    const budgetTargets = {
      '食費': 50000,
      '交通費': 20000,
      '消耗品費': 15000,
      '通信費': 10000,
      '光熱費': 25000
    }

    const budgetVariance = Object.entries(budgetTargets).reduce((acc, [category, budget]) => {
      const actual = categoryBreakdown[category] || 0
      acc[category] = {
        budgeted: budget,
        actual,
        variance: ((actual - budget) / budget) * 100
      }
      return acc
    }, {} as Record<string, { budgeted: number; actual: number; variance: number }>)

    // その他の統計
    const recurringTransactions = transactionList.filter(t => t.recurring).length
    const averageDailySpend = expense / 30
    const largestTransaction = transactionList.reduce((max, t) => 
      t.amount > (max?.amount || 0) ? t : max, null as Transaction | null
    )

    // 頻繁な取引先
    const vendorCounts = transactionList.reduce((acc, t) => {
      if (t.location) {
        if (!acc[t.location]) {
          acc[t.location] = { count: 0, total: 0 }
        }
        acc[t.location].count++
        acc[t.location].total += t.amount
      }
      return acc
    }, {} as Record<string, { count: number; total: number }>)

    const frequentVendors = Object.entries(vendorCounts)
      .map(([vendor, data]) => ({ vendor, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    setStats({
      totalIncome: income,
      totalExpense: expense,
      netAmount: income - expense,
      averageTransaction: transactionList.length > 0 ? (income + expense) / transactionList.length : 0,
      transactionCount: transactionList.length,
      categoryBreakdown,
      monthlyTrend,
      yearlyComparison,
      topExpenseCategories,
      cashFlowProjection,
      budgetVariance,
      recurringTransactions,
      averageDailySpend,
      largestTransaction,
      frequentVendors
    })
  }

  // AI統計計算
  const calculateAIStats = (aiTransactionList: AITransaction[]) => {
    const totalProcessed = aiTransactionList.length
    const averageConfidence = totalProcessed > 0 
      ? aiTransactionList.reduce((sum, t) => sum + t.confidence, 0) / totalProcessed 
      : 0

    const verifiedTransactions = aiTransactionList.filter(t => t.manual_verified)
    const accuracyRate = totalProcessed > 0 ? (verifiedTransactions.length / totalProcessed) * 100 : 0

    // カテゴリ別精度
    const categoryAccuracy = aiTransactionList.reduce((acc, t) => {
      if (!acc[t.ai_category]) {
        acc[t.ai_category] = { accuracy: 0, processed: 0, verified: 0 }
      }
      acc[t.ai_category].processed++
      if (t.manual_verified) {
        acc[t.ai_category].verified++
      }
      acc[t.ai_category].accuracy = (acc[t.ai_category].verified / acc[t.ai_category].processed) * 100
      return acc
    }, {} as Record<string, { accuracy: number; processed: number; verified: number }>)

    // 信頼度分布
    const confidenceDistribution = {
      high: aiTransactionList.filter(t => t.confidence >= 90).length,
      medium: aiTransactionList.filter(t => t.confidence >= 70 && t.confidence < 90).length,
      low: aiTransactionList.filter(t => t.confidence < 70).length
    }

    // 処理速度（模擬データ）
    const processingSpeed = aiTransactionList.reduce((sum, t) => sum + (t.processing_time || 0.5), 0) / totalProcessed

    // 改善率（時系列での精度向上）
    const recentAccuracy = aiTransactionList
      .filter(t => new Date(t.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .filter(t => t.manual_verified).length
    const recentTotal = aiTransactionList
      .filter(t => new Date(t.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length
    const recentAccuracyRate = recentTotal > 0 ? (recentAccuracy / recentTotal) * 100 : 0
    const improvementRate = recentAccuracyRate - accuracyRate

    setAiStats({
      totalProcessed,
      averageConfidence,
      accuracyRate,
      learningProgress: accuracyRate,
      categoryAccuracy,
      processingSpeed,
      improvementRate,
      confidenceDistribution
    })
  }

  // 高度な取引作成（タグ、場所、定期支払い対応）
  const createTransaction = async (transactionData: Omit<Transaction, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const now = new Date().toISOString()
      const newTransaction = await lumi.entities.transactions.create({
        ...transactionData,
        createdAt: now,
        updatedAt: now
      })
      await fetchTransactions()
      toast.success('取引が正常に作成されました')
      return newTransaction
    } catch (error: any) {
      console.error('取引の作成に失敗:', error)
      toast.error('取引の作成に失敗しました')
      throw error
    }
  }

  // バルク取引作成
  const bulkCreateTransactions = async (transactionsData: Omit<Transaction, '_id' | 'createdAt' | 'updatedAt'>[]) => {
    try {
      const now = new Date().toISOString()
      const createdTransactions = await Promise.all(
        transactionsData.map(data => 
          lumi.entities.transactions.create({
            ...data,
            createdAt: now,
            updatedAt: now
          })
        )
      )
      await fetchTransactions()
      toast.success(`${createdTransactions.length}件の取引を一括作成しました`)
      return createdTransactions
    } catch (error: any) {
      console.error('バルク作成に失敗:', error)
      toast.error('一括作成に失敗しました')
      throw error
    }
  }

  // 取引更新
  const updateTransaction = async (transactionId: string, updates: Partial<Transaction>) => {
    try {
      const updatedTransaction = await lumi.entities.transactions.update(transactionId, {
        ...updates,
        updatedAt: new Date().toISOString()
      })
      await fetchTransactions()
      toast.success('取引が正常に更新されました')
      return updatedTransaction
    } catch (error: any) {
      console.error('取引の更新に失敗:', error)
      toast.error('取引の更新に失敗しました')
      throw error
    }
  }

  // バルク更新
  const bulkUpdateTransactions = async (updates: Array<{ id: string; data: Partial<Transaction> }>) => {
    try {
      const updatedTransactions = await Promise.all(
        updates.map(({ id, data }) => 
          lumi.entities.transactions.update(id, {
            ...data,
            updatedAt: new Date().toISOString()
          })
        )
      )
      await fetchTransactions()
      toast.success(`${updatedTransactions.length}件の取引を一括更新しました`)
      return updatedTransactions
    } catch (error: any) {
      console.error('バルク更新に失敗:', error)
      toast.error('一括更新に失敗しました')
      throw error
    }
  }

  // 取引削除
  const deleteTransaction = async (transactionId: string) => {
    try {
      await lumi.entities.transactions.delete(transactionId)
      await fetchTransactions()
      toast.success('取引が正常に削除されました')
    } catch (error: any) {
      console.error('取引の削除に失敗:', error)
      toast.error('取引の削除に失敗しました')
      throw error
    }
  }

  // バルク削除
  const bulkDeleteTransactions = async (transactionIds: string[]) => {
    try {
      await Promise.all(transactionIds.map(id => lumi.entities.transactions.delete(id)))
      await fetchTransactions()
      toast.success(`${transactionIds.length}件の取引を削除しました`)
    } catch (error: any) {
      console.error('バルク削除に失敗:', error)
      toast.error('一括削除に失敗しました')
      throw error
    }
  }

  // AI取引の手動確認
  const verifyAITransaction = async (aiTransactionId: string, verified: boolean, feedback?: string) => {
    try {
      await lumi.entities.ai_transactions.update(aiTransactionId, {
        manual_verified: verified,
        learning_feedback: feedback,
        updatedAt: new Date().toISOString()
      })
      await fetchAITransactions()
      toast.success(verified ? 'AI分類を承認しました' : 'AI分類を却下しました')
    } catch (error: any) {
      console.error('AI取引の確認に失敗:', error)
      toast.error('AI取引の確認に失敗しました')
      throw error
    }
  }

  // AI取引のバルク確認
  const bulkVerifyAITransactions = async (aiTransactionIds: string[], verified: boolean) => {
    try {
      await Promise.all(aiTransactionIds.map(id => 
        lumi.entities.ai_transactions.update(id, {
          manual_verified: verified,
          updatedAt: new Date().toISOString()
        })
      ))
      await fetchAITransactions()
      toast.success(`${aiTransactionIds.length}件のAI分類を${verified ? '承認' : '却下'}しました`)
    } catch (error: any) {
      console.error('バルク確認に失敗:', error)
      toast.error('一括確認に失敗しました')
      throw error
    }
  }

  // 高度なエクスポート機能
  const exportTransactions = (format: 'csv' | 'json' | 'excel' = 'csv', includeStats = false) => {
    try {
      if (format === 'csv') {
        const headers = ['項目', '金額', '日付', 'カテゴリ', 'タイプ', '説明', '場所', 'タグ', '定期支払い']
        const csvContent = [
          headers.join(','),
          ...transactions.map(t => [
            `"${t.item}"`,
            t.amount,
            t.date.split('T')[0],
            `"${t.category}"`,
            `"${t.type}"`,
            `"${t.description || ''}"`,
            `"${t.location || ''}"`,
            `"${t.tags?.join(';') || ''}"`,
            t.recurring ? 'はい' : 'いいえ'
          ].join(','))
        ].join('\n')
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`
        link.click()
      } else if (format === 'json') {
        const exportData = {
          transactions,
          ...(includeStats && { stats, aiStats }),
          exportDate: new Date().toISOString(),
          totalCount: transactions.length
        }
        const jsonContent = JSON.stringify(exportData, null, 2)
        const blob = new Blob([jsonContent], { type: 'application/json' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `transactions_${new Date().toISOString().split('T')[0]}.json`
        link.click()
      }
      toast.success('データをエクスポートしました')
    } catch (error) {
      toast.error('エクスポートに失敗しました')
    }
  }

  // CSVインポート機能
  const importTransactions = async (csvFile: File) => {
    try {
      const text = await csvFile.text()
      const lines = text.split('\n')
      const headers = lines[0].split(',')
      
      const transactionsToImport = lines.slice(1)
        .filter(line => line.trim())
        .map(line => {
          const values = line.split(',')
          return {
            item: values[0]?.replace(/"/g, '') || '',
            amount: Number(values[1]) || 0,
            date: values[2] || new Date().toISOString().split('T')[0],
            category: values[3]?.replace(/"/g, '') || '',
            type: values[4]?.replace(/"/g, '') || '',
            description: values[5]?.replace(/"/g, '') || '',
            location: values[6]?.replace(/"/g, '') || '',
            tags: values[7]?.replace(/"/g, '').split(';').filter(Boolean) || [],
            recurring: values[8]?.replace(/"/g, '') === 'はい',
            creator: 'user'
          }
        })

      await bulkCreateTransactions(transactionsToImport)
      toast.success(`${transactionsToImport.length}件の取引をインポートしました`)
    } catch (error) {
      toast.error('インポートに失敗しました')
    }
  }

  // 高度な検索機能
  const searchTransactions = async (query: {
    text?: string
    dateRange?: { start: string; end: string }
    amountRange?: { min: number; max: number }
    categories?: string[]
    types?: string[]
    tags?: string[]
    hasReceipt?: boolean
  }) => {
    try {
      const filters: any = {}
      
      if (query.text) {
        filters.$or = [
          { item: { $regex: query.text, $options: 'i' } },
          { description: { $regex: query.text, $options: 'i' } },
          { location: { $regex: query.text, $options: 'i' } }
        ]
      }
      
      if (query.dateRange) {
        filters.date = {
          $gte: query.dateRange.start,
          $lte: query.dateRange.end
        }
      }
      
      if (query.amountRange) {
        filters.amount = {
          $gte: query.amountRange.min,
          $lte: query.amountRange.max
        }
      }
      
      if (query.categories?.length) {
        filters.category = { $in: query.categories }
      }
      
      if (query.types?.length) {
        filters.type = { $in: query.types }
      }
      
      if (query.tags?.length) {
        filters.tags = { $in: query.tags }
      }
      
      if (query.hasReceipt !== undefined) {
        filters.receipt_url = query.hasReceipt ? { $exists: true } : { $exists: false }
      }
      
      await fetchTransactions(filters)
    } catch (error) {
      toast.error('検索に失敗しました')
    }
  }

  useEffect(() => {
    fetchTransactions()
    fetchAITransactions()
  }, [fetchTransactions, fetchAITransactions])

  return {
    transactions,
    aiTransactions,
    loading,
    stats,
    aiStats,
    fetchTransactions,
    fetchAITransactions,
    createTransaction,
    bulkCreateTransactions,
    updateTransaction,
    bulkUpdateTransactions,
    deleteTransaction,
    bulkDeleteTransactions,
    verifyAITransaction,
    bulkVerifyAITransactions,
    exportTransactions,
    importTransactions,
    searchTransactions
  }
}
