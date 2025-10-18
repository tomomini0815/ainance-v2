import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
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

export const useSupabaseTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [aiTransactions, setAiTransactions] = useState<AITransaction[]>([])
  const [loading, setLoading] = useState(false)

  // 両方のデータを同時に取得する関数
  const fetchAllData = useCallback(async () => {
    setLoading(true)
    try {
      // トランザクションデータの取得
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false })

      if (transactionsError) {
        throw new Error(`取引履歴の取得に失敗しました: ${transactionsError.message}`)
      }

      // AIトランザクションデータの取得
      const { data: aiTransactionsData, error: aiTransactionsError } = await supabase
        .from('ai_transactions')
        .select('*')
        .order('created_at', { ascending: false })

      if (aiTransactionsError) {
        throw new Error(`AI取引履歴の取得に失敗しました: ${aiTransactionsError.message}`)
      }

      setTransactions(transactionsData || [])
      setAiTransactions(aiTransactionsData || [])
    } catch (error: any) {
      console.error('データの取得に失敗:', error)
      toast.error(`データの取得に失敗しました: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }, [])

  // 新しいトランザクションの作成
  const createTransaction = async (transactionData: Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'creator'>) => {
    try {
      // モックユーザーIDを使用
      const mockUserId = 'mock_user_001'

      const newTransaction = {
        ...transactionData,
        creator: mockUserId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('transactions')
        .insert(newTransaction)
        .select()

      if (error) {
        const errorText = JSON.stringify(error)
        throw new Error(`取引の作成に失敗しました: ${error.message} - ${errorText}`)
      }

      await fetchAllData()
      toast.success('取引が正常に作成されました')
      return data?.[0]?.id
    } catch (error: any) {
      console.error('取引の作成に失敗:', error)
      toast.error(`取引の作成に失敗しました: ${error.message}`)
      throw error
    }
  }

  // トランザクションの更新
  const updateTransaction = async (transactionId: number, updates: Partial<Transaction>) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId)
        .select()

      if (error) {
        const errorText = JSON.stringify(error)
        throw new Error(`取引の更新に失敗しました: ${error.message} - ${errorText}`)
      }

      await fetchAllData()
      toast.success('取引が正常に更新されました')
    } catch (error: any) {
      console.error('取引の更新に失敗:', error)
      toast.error(`取引の更新に失敗しました: ${error.message}`)
      throw error
    }
  }

  // トランザクションの削除
  const deleteTransaction = async (transactionId: number) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId)

      if (error) {
        const errorText = JSON.stringify(error)
        throw new Error(`取引の削除に失敗しました: ${error.message} - ${errorText}`)
      }

      await fetchAllData()
      toast.success('取引が正常に削除されました')
    } catch (error: any) {
      console.error('取引の削除に失敗:', error)
      toast.error(`取引の削除に失敗しました: ${error.message}`)
      throw error
    }
  }

  // AIトランザクションの確認
  const verifyAITransaction = async (aiTransactionId: number, verified: boolean, feedback?: string) => {
    try {
      const { data, error } = await supabase
        .from('ai_transactions')
        .update({
          manual_verified: verified,
          learning_feedback: feedback,
          updated_at: new Date().toISOString()
        })
        .eq('id', aiTransactionId)
        .select()

      if (error) {
        const errorText = JSON.stringify(error)
        throw new Error(`AI取引の確認に失敗しました: ${error.message} - ${errorText}`)
      }

      await fetchAllData()
      toast.success(verified ? 'AI分類を承認しました' : 'AI分類を却下しました')
    } catch (error: any) {
      console.error('AI取引の確認に失敗:', error)
      toast.error(`AI取引の確認に失敗しました: ${error.message}`)
      throw error
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [fetchAllData])

  return {
    transactions,
    aiTransactions,
    loading,
    fetchAllData,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    verifyAITransaction
  }
}