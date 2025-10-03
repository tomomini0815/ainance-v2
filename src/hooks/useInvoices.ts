
import { useState, useEffect, useCallback } from 'react'
import { lumi } from '../lib/lumi'
import toast from 'react-hot-toast'

interface Invoice {
  _id: string
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

  // 業態形態に応じてエンティティ名を決定
  const getEntityName = useCallback(() => {
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
      const entityName = getEntityName()
      
      const { list } = await lumi.entities[entityName].list({
        filter: { user_id: userId },
        sort: { created_at: -1 }
      })
      
      setInvoices(list || [])
    } catch (error) {
      console.error('請求書の取得に失敗しました:', error)
      toast.error('請求書の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [userId, businessType, getEntityName])

  // 請求書を作成
  const createInvoice = async (invoiceData: Omit<Invoice, '_id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!userId || !businessType) {
      toast.error('ユーザーIDと業態形態が必要です')
      return null
    }

    try {
      const entityName = getEntityName()
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

      const newInvoice = await lumi.entities[entityName].create(newInvoiceData)
      setInvoices(prev => [newInvoice, ...prev])
      toast.success('請求書を作成しました')
      return newInvoice
    } catch (error) {
      console.error('請求書の作成に失敗しました:', error)
      toast.error('請求書の作成に失敗しました')
      return null
    }
  }

  // 請求書を更新
  const updateInvoice = async (invoiceId: string, updates: Partial<Invoice>) => {
    try {
      const entityName = getEntityName()
      
      const updatedInvoice = await lumi.entities[entityName].update(invoiceId, {
        ...updates,
        updated_at: new Date().toISOString()
      })

      setInvoices(prev => prev.map(invoice => 
        invoice._id === invoiceId ? updatedInvoice : invoice
      ))
      
      toast.success('請求書を更新しました')
      return updatedInvoice
    } catch (error) {
      console.error('請求書の更新に失敗しました:', error)
      toast.error('請求書の更新に失敗しました')
      return null
    }
  }

  // 請求書を削除
  const deleteInvoice = async (invoiceId: string) => {
    try {
      const entityName = getEntityName()
      
      await lumi.entities[entityName].delete(invoiceId)
      setInvoices(prev => prev.filter(invoice => invoice._id !== invoiceId))
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
      (stats as any).pending = invoices.filter(inv => (inv as any).approval_status === 'pending').length
      ;(stats as any).approved = invoices.filter(inv => (inv as any).approval_status === 'approved').length
      ;(stats as any).rejected = invoices.filter(inv => (inv as any).approval_status === 'rejected').length
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
