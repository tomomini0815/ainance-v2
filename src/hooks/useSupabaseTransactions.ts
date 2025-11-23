import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import toast from 'react-hot-toast'

interface Transaction {
  id: string
  item: string
  amount: number
  date: string
  category: string
  type: 'income' | 'expense'
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
  id: string
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
  const fetchAllData = useCallback(() => {
    setLoading(true)
    
    // トランザクションデータの取得
    supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error(`取引履歴の取得に失敗しました: ${error.message}`)
          setTransactions([])
        } else {
          setTransactions(data || [])
        }
      })

    // AIトランザクションデータの取得
    supabase
      .from('ai_transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error(`AI取引履歴の取得に失敗しました: ${error.message}`)
          setAiTransactions([])
        } else {
          setAiTransactions(data || [])
        }
        setLoading(false)
      })
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
        .single()
      
      if (error) throw error
      
      const createdTransaction: Transaction = data
      
      setTransactions(prev => [createdTransaction, ...prev])
      toast.success('取引が正常に作成されました')
      return data.id
    } catch (error: any) {
      console.error('取引の作成に失敗:', error)
      toast.error(`取引の作成に失敗しました: ${error.message}`)
      throw error
    }
  }

  // トランザクションの更新
  const updateTransaction = async (transactionId: string, updates: Partial<Transaction>) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId)
        .select()
        .single()
      
      if (error) throw error
      
      const updatedTransaction: Transaction = data
      
      setTransactions(prev =>
        prev.map(transaction =>
          transaction.id === transactionId ? updatedTransaction : transaction
        )
      )
      
      toast.success('取引が正常に更新されました')
    } catch (error: any) {
      console.error('取引の更新に失敗:', error)
      toast.error(`取引の更新に失敗しました: ${error.message}`)
      throw error
    }
  }

  // トランザクションの削除
  const deleteTransaction = async (transactionId: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId)
      
      if (error) throw error
      
      setTransactions(prev => prev.filter(transaction => transaction.id !== transactionId))
      toast.success('取引が正常に削除されました')
    } catch (error: any) {
      console.error('取引の削除に失敗:', error)
      toast.error(`取引の削除に失敗しました: ${error.message}`)
      throw error
    }
  }

  // AIトランザクションの確認
  const verifyAITransaction = async (aiTransactionId: string, verified: boolean, feedback?: string) => {
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
        .single()
      
      if (error) throw error
      
      const updatedAiTransaction: AITransaction = data
      
      setAiTransactions(prev =>
        prev.map(transaction =>
          transaction.id === aiTransactionId ? updatedAiTransaction : transaction
        )
      )
      
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