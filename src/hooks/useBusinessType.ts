
import { useState, useEffect, useCallback } from 'react'
import { lumi } from '../lib/lumi'
import toast from 'react-hot-toast'

interface BusinessType {
  _id: string
  user_id: string
  business_type: 'individual' | 'corporation'
  company_name: string
  tax_number: string
  address: string
  phone: string
  email: string
  representative_name: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export const useBusinessType = (userId?: string) => {
  const [currentBusinessType, setCurrentBusinessType] = useState<BusinessType | null>(null)
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([])
  const [loading, setLoading] = useState(true)

  // 現在アクティブな業態形態を取得
  const fetchCurrentBusinessType = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    try {
      const { list } = await lumi.entities.business_type.list({
        filter: { 
          user_id: userId,
          is_active: true 
        }
      })
      
      if (list && list.length > 0) {
        setCurrentBusinessType(list[0])
      }
    } catch (error) {
      console.error('業態形態の取得に失敗しました:', error)
      toast.error('業態形態の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [userId])

  // ユーザーの全業態形態を取得
  const fetchAllBusinessTypes = useCallback(async () => {
    if (!userId) return

    try {
      const { list } = await lumi.entities.business_type.list({
        filter: { user_id: userId },
        sort: { created_at: -1 }
      })
      
      setBusinessTypes(list || [])
    } catch (error) {
      console.error('業態形態リストの取得に失敗しました:', error)
    }
  }, [userId])

  // 業態形態を作成
  const createBusinessType = async (data: Omit<BusinessType, '_id' | 'user_id' | 'is_active' | 'created_at' | 'updated_at'>) => {
    if (!userId) {
      toast.error('ユーザーIDが必要です')
      return null
    }

    try {
      // 既存のアクティブな業態形態を非アクティブにする
      if (currentBusinessType) {
        await lumi.entities.business_type.update(currentBusinessType._id, {
          is_active: false,
          updated_at: new Date().toISOString()
        })
      }

      // 新しい業態形態を作成
      const newBusinessType = await lumi.entities.business_type.create({
        ...data,
        user_id: userId,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

      setCurrentBusinessType(newBusinessType)
      await fetchAllBusinessTypes()
      toast.success('業態形態を作成しました')
      return newBusinessType
    } catch (error) {
      console.error('業態形態の作成に失敗しました:', error)
      toast.error('業態形態の作成に失敗しました')
      return null
    }
  }

  // 業態形態を切り替え
  const switchBusinessType = async (businessTypeId: string) => {
    try {
      // 現在のアクティブ業態形態を非アクティブにする
      if (currentBusinessType) {
        await lumi.entities.business_type.update(currentBusinessType._id, {
          is_active: false,
          updated_at: new Date().toISOString()
        })
      }

      // 選択した業態形態をアクティブにする
      const updatedBusinessType = await lumi.entities.business_type.update(businessTypeId, {
        is_active: true,
        updated_at: new Date().toISOString()
      })

      setCurrentBusinessType(updatedBusinessType)
      toast.success('業態形態を切り替えました')
      
      // ページをリロードして新しい業態形態を反映
      window.location.reload()
    } catch (error) {
      console.error('業態形態の切り替えに失敗しました:', error)
      toast.error('業態形態の切り替えに失敗しました')
    }
  }

  // 業態形態を更新
  const updateBusinessType = async (businessTypeId: string, updates: Partial<BusinessType>) => {
    try {
      const updatedBusinessType = await lumi.entities.business_type.update(businessTypeId, {
        ...updates,
        updated_at: new Date().toISOString()
      })

      if (currentBusinessType?._id === businessTypeId) {
        setCurrentBusinessType(updatedBusinessType)
      }
      
      await fetchAllBusinessTypes()
      toast.success('業態形態を更新しました')
      return updatedBusinessType
    } catch (error) {
      console.error('業態形態の更新に失敗しました:', error)
      toast.error('業態形態の更新に失敗しました')
      return null
    }
  }

  // 業態形態を削除
  const deleteBusinessType = async (businessTypeId: string) => {
    try {
      await lumi.entities.business_type.delete(businessTypeId)
      
      if (currentBusinessType?._id === businessTypeId) {
        setCurrentBusinessType(null)
      }
      
      await fetchAllBusinessTypes()
      toast.success('業態形態を削除しました')
    } catch (error) {
      console.error('業態形態の削除に失敗しました:', error)
      toast.error('業態形態の削除に失敗しました')
    }
  }

  useEffect(() => {
    if (userId) {
      fetchCurrentBusinessType()
      fetchAllBusinessTypes()
    }
  }, [fetchCurrentBusinessType, fetchAllBusinessTypes])

  return {
    currentBusinessType,
    businessTypes,
    loading,
    createBusinessType,
    switchBusinessType,
    updateBusinessType,
    deleteBusinessType,
    refetch: fetchCurrentBusinessType
  }
}
