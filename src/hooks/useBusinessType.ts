import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import toast from 'react-hot-toast'

interface BusinessType {
  id: string
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
  console.log('useBusinessType - userId:', userId);

  const [currentBusinessType, setCurrentBusinessType] = useState<BusinessType | null>(null)
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([])
  const [loading, setLoading] = useState(true)

  // 現在アクティブな業態形態を取得
  const fetchCurrentBusinessType = useCallback(() => {
    console.log('fetchCurrentBusinessType - 開始:', { userId });
    if (!userId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)

      // Supabaseからユーザーの業態形態を取得
      supabase
        .from('business_type')
        .select('*')
        .eq('user_id', userId)
        .order('is_active', { ascending: false })
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          console.log('fetchCurrentBusinessType - Supabaseからの応答:', { data, error });
          if (error) {
            console.error('業態形態の取得に失敗しました:', error)
            toast.error('業態形態の取得に失敗しました')
            setLoading(false)
            return
          }

          if (data && data.length > 0) {
            // アクティブな業態形態を検索
            const activeBusinessType = data.find((bt) => bt.is_active)
            if (activeBusinessType) {
              setCurrentBusinessType(activeBusinessType)
              console.log('fetchCurrentBusinessType - アクティブな業態形態を設定しました:', activeBusinessType);
            } else {
              // アクティブな業態がない場合、最初のものをアクティブとして設定
              const firstBusinessType = data[0]
              setCurrentBusinessType(firstBusinessType)
              console.log('fetchCurrentBusinessType - 最初の業態形態をアクティブとして設定しました:', firstBusinessType);

              // DBにもアクティブとしてマーク
              supabase
                .from('business_type')
                .update({ is_active: true, updated_at: new Date().toISOString() })
                .eq('id', firstBusinessType.id)
            }
            setBusinessTypes(data)
          } else {
            // 業態形態がない場合はnullを設定
            setCurrentBusinessType(null)
            setBusinessTypes([])
            console.log('fetchCurrentBusinessType - 業態形態が見つかりません');
          }
          setLoading(false)
        })
    } catch (error) {
      console.error('業態形態の取得に失敗しました:', error)
      toast.error('業態形態の取得に失敗しました')
      setLoading(false)
    }
  }, [userId])

  // ユーザーの全業態形態を取得
  const fetchAllBusinessTypes = useCallback(() => {
    if (!userId) return

    supabase
      .from('business_type')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error('業態形態リストの取得に失敗しました:', error)
          return
        }

        setBusinessTypes(data || [])

        // アクティブな業態形態がリストになければ更新
        if (data && data.length > 0) {
          const activeBusinessType = data.find((bt) => bt.is_active)
          if (activeBusinessType) {
            setCurrentBusinessType(activeBusinessType)
          } else if (!currentBusinessType && data.length > 0) {
            // 現在の業態がなく、リストに業態がある場合は最初のものを設定
            setCurrentBusinessType(data[0])
          }
        }
      })
  }, [userId, currentBusinessType])

  // 業態形態を作成
  const createBusinessType = async (data: Omit<BusinessType, 'id' | 'user_id' | 'is_active' | 'created_at' | 'updated_at'>) => {
    console.log('createBusinessType called with data:', data);
    console.log('Current user ID:', userId);
    
    if (!userId) {
      console.error('ユーザーIDがありません');
      toast.error('ユーザーIDが必要です')
      return null
    }

    try {
      // 既存のアクティブな業態形態を非アクティブにする
      if (currentBusinessType) {
        console.log('既存の業態形態を非アクティブにします:', currentBusinessType.id);
        const { error: updateError } = await supabase
          .from('business_type')
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq('id', currentBusinessType.id)
        
        if (updateError) {
          console.error('既存の業態形態の更新に失敗しました:', updateError);
          throw updateError;
        }
      }

      const newBusinessTypeData = {
        ...data,
        user_id: userId,
        is_active: true, // 新規作成時は常にアクティブにする
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      console.log('Supabaseに保存するデータ:', newBusinessTypeData);
      
      // Supabaseにデータを挿入
      const { data: insertedData, error } = await supabase
        .from('business_type')
        .insert(newBusinessTypeData)
        .select()
        .single()

      if (error) {
        console.error('Supabaseへの挿入に失敗しました:', error);
        console.error('エラーコード:', error.code);
        console.error('エラーメッセージ:', error.message);
        console.error('エラー詳細:', error.details);
        throw error;
      }

      console.log('Supabaseに保存成功:', insertedData);

      const newBusinessType: BusinessType = insertedData

      setCurrentBusinessType(newBusinessType)
      // fetchAllBusinessTypesはリアルタイムリスナーではないので、手動で更新
      setBusinessTypes(prev => [newBusinessType, ...prev])
      toast.success('業態形態を作成しました')
      return newBusinessType
    } catch (error: any) {
      console.error('業態形態の作成に失敗しました:', error)
      console.error('エラーの詳細:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      
      // より詳細なエラーメッセージを表示
      let errorMessage = '不明なエラー';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.error_description) {
        errorMessage = error.error_description;
      }
      
      toast.error(`業態形態の作成に失敗しました: ${errorMessage}`)
      return null
    }
  }

  // 業態形態を切り替え
  const switchBusinessType = async (businessTypeId: string) => {
    try {
      // 現在のアクティブ業態形態を非アクティブにする
      if (currentBusinessType) {
        await supabase
          .from('business_type')
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq('id', currentBusinessType.id)
      }

      // 選択した業態形態をアクティブにする
      const { data, error } = await supabase
        .from('business_type')
        .update({ is_active: true, updated_at: new Date().toISOString() })
        .eq('id', businessTypeId)
        .select()
        .single()

      if (error) throw error

      const updatedBusinessType: BusinessType = data

      setCurrentBusinessType(updatedBusinessType)
      // fetchAllBusinessTypesはリアルタイムリスナーではないので、手動で更新
      setBusinessTypes(prev => 
        prev.map(bt => bt.id === businessTypeId ? updatedBusinessType : bt)
      )
      toast.success('業態形態を切り替えました')
      return updatedBusinessType
    } catch (error) {
      console.error('業態形態の切り替えに失敗しました:', error)
      toast.error('業態形態の切り替えに失敗しました')
      return null
    }
  }

  // 業態形態を更新
  const updateBusinessType = async (businessTypeId: string, updates: Partial<BusinessType>) => {
    try {
      const { data, error } = await supabase
        .from('business_type')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', businessTypeId)
        .select()
        .single()

      if (error) throw error

      const updatedBusinessType: BusinessType = data

      if (currentBusinessType?.id === businessTypeId) {
        setCurrentBusinessType(updatedBusinessType)
      }

      // fetchAllBusinessTypesはリアルタイムリスナーではないので、手動で更新
      setBusinessTypes(prev => 
        prev.map(bt => bt.id === businessTypeId ? updatedBusinessType : bt)
      )
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
      const { error } = await supabase
        .from('business_type')
        .delete()
        .eq('id', businessTypeId)

      if (error) throw error

      if (currentBusinessType?.id === businessTypeId) {
        setCurrentBusinessType(null)
      }

      // fetchAllBusinessTypesはリアルタイムリスナーではないので、手動で更新
      setBusinessTypes(prev => prev.filter(bt => bt.id !== businessTypeId))
      toast.success('業態形態を削除しました')
    } catch (error) {
      console.error('業態形態の削除に失敗しました:', error)
      toast.error('業態形態の削除に失敗しました')
    }
  }

  useEffect(() => {
    fetchCurrentBusinessType()
  }, [fetchCurrentBusinessType])

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