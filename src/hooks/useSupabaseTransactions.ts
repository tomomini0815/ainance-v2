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
  const fetchAllData = useCallback(async () => {
    setLoading(true)
    
    try {
      // タイムアウト付きでデータを取得
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('データ取得がタイムアウトしました')), 10000)
      )

      // 両方のクエリを並列で実行
      const transactionsPromise = supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false })

      const aiTransactionsPromise = supabase
        .from('ai_transactions')
        .select('*')
        .order('created_at', { ascending: false })

      // タイムアウトとクエリをレース
      const [transactionsResult, aiTransactionsResult] = await Promise.race([
        Promise.all([transactionsPromise, aiTransactionsPromise]),
        timeoutPromise.then(() => { throw new Error('タイムアウト') })
      ]) as [any, any]

      // トランザクションデータの処理
      if (transactionsResult.error) {
        console.error(`取引履歴の取得に失敗しました: ${transactionsResult.error.message}`)
        setTransactions([])
      } else {
        setTransactions(transactionsResult.data || [])
      }

      // AIトランザクションデータの処理
      if (aiTransactionsResult.error) {
        console.error(`AI取引履歴の取得に失敗しました: ${aiTransactionsResult.error.message}`)
        setAiTransactions([])
      } else {
        setAiTransactions(aiTransactionsResult.data || [])
      }
    } catch (error: any) {
      console.error('データ取得中にエラーが発生しました:', error.message)
      // エラー時は空配列を設定して読み込み状態を解除
      setTransactions([])
      setAiTransactions([])
    } finally {
      // 必ずloading状態を解除
      setLoading(false)
    }
  }, [])

  // 新しいトランザクションの作成
  const createTransaction = async (transactionData: Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'creator'>) => {
    try {
      // モックユーザーIDを使用
      const mockUserId = '00000000-0000-0000-0000-000000000000'

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