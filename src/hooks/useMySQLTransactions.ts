import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'

interface Transaction {
  id: number
  item: string
  amount: number
  date: string
  category: string
  type: string
  description?: string
  receipt_url?: string
  creator: string
  created_at: string
  updated_at: string
  tags?: string[]
  location?: string
  recurring?: boolean
  recurring_frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly'
}

interface AITransaction {
  id: number
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
  created_at: string
  updated_at: string
  ai_suggestions?: string[]
  learning_feedback?: string
  processing_time?: number
}

const API_BASE_URL = 'http://localhost:3001/api'

export const useMySQLTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [aiTransactions, setAiTransactions] = useState<AITransaction[]>([])
  const [loading, setLoading] = useState(false)

  // トランザクションデータの取得
  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/transactions`)
      if (!response.ok) {
        throw new Error('取引履歴の取得に失敗しました')
      }
      const data = await response.json()
      setTransactions(data)
    } catch (error: any) {
      console.error('取引履歴の取得に失敗:', error)
      toast.error('取引履歴の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [])

  // AIトランザクションデータの取得
  const fetchAITransactions = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/ai-transactions`)
      if (!response.ok) {
        throw new Error('AI取引履歴の取得に失敗しました')
      }
      const data = await response.json()
      setAiTransactions(data)
    } catch (error: any) {
      console.error('AI取引履歴の取得に失敗:', error)
      toast.error('AI取引履歴の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [])

  // 新しいトランザクションの作成
  const createTransaction = async (transactionData: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      })
      
      if (!response.ok) {
        throw new Error('取引の作成に失敗しました')
      }
      
      const data = await response.json()
      await fetchTransactions()
      toast.success('取引が正常に作成されました')
      return data.id
    } catch (error: any) {
      console.error('取引の作成に失敗:', error)
      toast.error('取引の作成に失敗しました')
      throw error
    }
  }

  // トランザクションの更新
  const updateTransaction = async (transactionId: number, updates: Partial<Transaction>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })
      
      if (!response.ok) {
        throw new Error('取引の更新に失敗しました')
      }
      
      await fetchTransactions()
      toast.success('取引が正常に更新されました')
    } catch (error: any) {
      console.error('取引の更新に失敗:', error)
      toast.error('取引の更新に失敗しました')
      throw error
    }
  }

  // トランザクションの削除
  const deleteTransaction = async (transactionId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('取引の削除に失敗しました')
      }
      
      await fetchTransactions()
      toast.success('取引が正常に削除されました')
    } catch (error: any) {
      console.error('取引の削除に失敗:', error)
      toast.error('取引の削除に失敗しました')
      throw error
    }
  }

  // AIトランザクションの確認
  const verifyAITransaction = async (aiTransactionId: number, verified: boolean, feedback?: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ai-transactions/${aiTransactionId}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ verified, feedback }),
      })
      
      if (!response.ok) {
        throw new Error('AI取引の確認に失敗しました')
      }
      
      await fetchAITransactions()
      toast.success(verified ? 'AI分類を承認しました' : 'AI分類を却下しました')
    } catch (error: any) {
      console.error('AI取引の確認に失敗:', error)
      toast.error('AI取引の確認に失敗しました')
      throw error
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
    fetchTransactions,
    fetchAITransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    verifyAITransaction
  }
}