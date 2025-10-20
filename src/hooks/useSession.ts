import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

interface User {
  id: string
  email: string
  name: string
  created_at: string
}

export const useSession = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // セッション状態の更新
  const updateSession = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        throw error
      }
      
      if (session) {
        // ユーザープロファイルの取得
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', session.user.id)
          .single()
        
        if (profileError) {
          console.warn('プロファイルの取得に失敗しました:', profileError)
        }
        
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: profile?.name || session.user.email?.split('@')[0] || '',
          created_at: session.user.created_at
        })
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('セッションの更新に失敗しました:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // セッション状態の監視
  useEffect(() => {
    // 初期セッションの取得
    updateSession()
    
    // セッション状態の変化を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        // ユーザープロファイルの取得
        supabase
          .from('profiles')
          .select('name')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile, error }) => {
            if (error) {
              console.warn('プロファイルの取得に失敗しました:', error)
            }
            
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              name: profile?.name || session.user.email?.split('@')[0] || '',
              created_at: session.user.created_at
            })
          })
      } else {
        setUser(null)
      }
      setLoading(false)
    })
    
    return () => {
      subscription.unsubscribe()
    }
  }, [updateSession])

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        throw error
      }
      
      if (data.session) {
        // ユーザープロファイルの取得
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', data.session.user.id)
          .single()
        
        if (profileError) {
          console.warn('プロファイルの取得に失敗しました:', profileError)
        }
        
        setUser({
          id: data.session.user.id,
          email: data.session.user.email || '',
          name: profile?.name || data.session.user.email?.split('@')[0] || '',
          created_at: data.session.user.created_at
        })
      }
      
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
      
      if (error) {
        throw error
      }
      
      if (data.user) {
        // プロファイルテーブルにユーザー情報を挿入
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              name,
              email,
              created_at: data.user.created_at,
            },
          ])
        
        if (profileError) {
          console.warn('プロファイルの作成に失敗しました:', profileError)
        }
        
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          name,
          created_at: data.user.created_at,
        })
      }
      
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
      await supabase.auth.signOut()
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