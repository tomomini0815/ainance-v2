import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

export const useSession = () => {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [initialLoad, setInitialLoad] = useState(true)

  // セッション状態の監視
  useEffect(() => {
    console.log('セッション監視を開始します')
    
    // Supabase Authのセッション状態を取得
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        console.error('セッション取得エラー:', error)
      } else {
        setUser(data.session?.user || null)
        console.log('セッション情報:', data.session)
      }
      
      if (initialLoad) {
        setLoading(false)
        setInitialLoad(false)
      }
    }

    getSession()

    // Supabase Authの状態変化を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('認証状態が変化しました:', session)
      setUser(session?.user || null)
      
      // 初回ロード時のみloading状態を解除
      if (initialLoad) {
        setLoading(false)
        setInitialLoad(false)
      }
    })

    return () => {
      console.log('セッション監視を解除します')
      subscription.unsubscribe()
    }
  }, [initialLoad])

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      
      console.log('ログイン成功:', data)
      setUser(data.user)
      
      return data
    } catch (error: any) {
      console.error('ログインエラー:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    setLoading(true)
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      })
      
      if (error) throw error
      
      console.log('サインアップ成功:', data)
      setUser(data.user)
      
      return data
    } catch (error: any) {
      console.error('サインアップエラー:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    setLoading(true)
    
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      console.log('ログアウトしました')
      setUser(null)
    } catch (error: any) {
      console.error('ログアウトエラー:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  console.log('useSessionの状態:', { user, loading })

  return {
    user,
    isAuthenticated: !!user,
    loading,
    signIn,
    signUp,
    signOut
  }
}