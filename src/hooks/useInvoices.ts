import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import toast from 'react-hot-toast'

interface Invoice {
  id: string
  user_id: string
  invoice_number: string
  issue_date: string
  due_date: string
  customer_info: any
  items: any[]
  subtotal: number
  tax_amount: number
  total_amount: number
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  notes?: string
  created_at: string
  updated_at: string
  // 法人用追加フィールド
  approval_status?: 'pending' | 'approved' | 'rejected'
  approved_by?: string
  approved_at?: string
  department?: string
  project_code?: string
}

export const useInvoices = (userId?: string, businessType?: 'individual' | 'corporation') => {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  // 業態形態に応じてテーブル名を決定
  const getTableName = useCallback(() => {
    return businessType === 'corporation' ? 'corporation_invoices' : 'individual_invoices'
  }, [businessType])

  // 請求書リストを取得
  const fetchInvoices = useCallback(async () => {
    if (!userId || !businessType) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const tableName = getTableName()
      
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      setInvoices(data as Invoice[] || [])
    } catch (error) {
      console.error('請求書の取得に失敗しました:', error)
      toast.error('請求書の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [userId, businessType, getTableName])

  // 請求書を作成
  const createInvoice = async (invoiceData: Omit<Invoice, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!userId || !businessType) {
      toast.error('ユーザーIDと業態形態が必要です')
      return null
    }

    try {
      const tableName = getTableName()
      const now = new Date().toISOString()
      
      const newInvoiceData = {
        ...invoiceData,
        user_id: userId,
        created_at: now,
        updated_at: now
      }

      // 法人の場合は承認ステータスを追加
      if (businessType === 'corporation') {
        (newInvoiceData as any).approval_status = 'pending'
      }

      const { data: newInvoice, error } = await supabase
        .from(tableName)
        .insert(newInvoiceData)
        .select()
        .single()

      if (error) throw error

      setInvoices(prev => [newInvoice as Invoice, ...prev])
      toast.success('請求書を作成しました')
      return newInvoice as Invoice
    } catch (error) {
      console.error('請求書の作成に失敗しました:', error)
      toast.error('請求書の作成に失敗しました')
      return null
    }
  }

  // 請求書を更新
  const updateInvoice = async (invoiceId: string, updates: Partial<Invoice>) => {
    try {
      const tableName = getTableName()
      
      const { data: updatedInvoice, error } = await supabase
        .from(tableName)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', invoiceId)
        .select()
        .single()

      if (error) throw error

      setInvoices(prev => prev.map(invoice => 
        invoice.id === invoiceId ? updatedInvoice as Invoice : invoice
      ))
      
      toast.success('請求書を更新しました')
      return updatedInvoice as Invoice
    } catch (error) {
      console.error('請求書の更新に失敗しました:', error)
      toast.error('請求書の更新に失敗しました')
      return null
    }
  }

  // 請求書を削除
  const deleteInvoice = async (invoiceId: string) => {
    try {
      const tableName = getTableName()
      
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', invoiceId)

      if (error) throw error

      setInvoices(prev => prev.filter(invoice => invoice.id !== invoiceId))
      toast.success('請求書を削除しました')
    } catch (error) {
      console.error('請求書の削除に失敗しました:', error)
      toast.error('請求書の削除に失敗しました')
    }
  }

  // 請求書のステータスを更新
  const updateInvoiceStatus = async (invoiceId: string, status: Invoice['status']) => {
    return updateInvoice(invoiceId, { status })
  }

  // 法人用: 請求書を承認
  const approveInvoice = async (invoiceId: string, approvedBy: string) => {
    if (businessType !== 'corporation') {
      toast.error('法人のみ承認機能を使用できます')
      return null
    }

    return updateInvoice(invoiceId, {
      approval_status: 'approved',
      approved_by: approvedBy,
      approved_at: new Date().toISOString()
    })
  }

  // 法人用: 請求書を却下
  const rejectInvoice = async (invoiceId: string) => {
    if (businessType !== 'corporation') {
      toast.error('法人のみ承認機能を使用できます')
      return null
    }

    return updateInvoice(invoiceId, {
      approval_status: 'rejected'
    })
  }

  // 統計情報を取得
  const getInvoiceStats = useCallback(() => {
    const stats = {
      total: invoices.length,
      draft: invoices.filter(inv => inv.status === 'draft').length,
      sent: invoices.filter(inv => inv.status === 'sent').length,
      paid: invoices.filter(inv => inv.status === 'paid').length,
      overdue: invoices.filter(inv => inv.status === 'overdue').length,
      totalAmount: invoices.reduce((sum, inv) => sum + inv.total_amount, 0),
      paidAmount: invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total_amount, 0)
    }

    // 法人用統計
    if (businessType === 'corporation') {
      (stats as any).pending = invoices.filter(inv => inv.approval_status === 'pending').length
      ;(stats as any).approved = invoices.filter(inv => inv.approval_status === 'approved').length
      ;(stats as any).rejected = invoices.filter(inv => inv.approval_status === 'rejected').length
    }

    return stats
  }, [invoices, businessType])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  return {
    invoices,
    loading,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    updateInvoiceStatus,
    approveInvoice,
    rejectInvoice,
    getInvoiceStats,
    refetch: fetchInvoices
  }
}