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
  const [initialLoad, setInitialLoad] = useState(true)

  // セッション状態の更新
  const updateSession = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        throw error
      }
      
      console.log('セッション情報:', session)
      
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
        
        const userData = {
          id: session.user.id,
          email: session.user.email || '',
          name: profile?.name || session.user.email?.split('@')[0] || '',
          created_at: session.user.created_at
        }
        
        console.log('ユーザー情報:', userData)
        setUser(userData)
      } else {
        console.log('セッションが存在しません')
        setUser(null)
      }
    } catch (error) {
      console.error('セッションの更新に失敗しました:', error)
      setUser(null)
    } finally {
      if (initialLoad) {
        setLoading(false)
        setInitialLoad(false)
      }
    }
  }, [initialLoad])

  // セッション状態の監視
  useEffect(() => {
    console.log('セッション監視を開始します')
    
    // 初期セッションの取得
    updateSession()
    
    // セッション状態の変化を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('認証状態が変化しました:', _event, session)
      
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
            
            const userData = {
              id: session.user.id,
              email: session.user.email || '',
              name: profile?.name || session.user.email?.split('@')[0] || '',
              created_at: session.user.created_at
            }
            
            // 現在のユーザー情報と比較して、実際に変更があった場合にのみ更新
            setUser(prevUser => {
              if (!prevUser) {
                console.log('ユーザー情報を更新しました:', userData)
                return userData
              }
              
              if (prevUser.id !== userData.id || 
                  prevUser.email !== userData.email || 
                  prevUser.name !== userData.name) {
                console.log('ユーザー情報を更新しました:', userData)
                return userData
              }
              
              // 変更がない場合は現在の状態を維持
              return prevUser
            })
          })
      } else {
        console.log('セッションがクリアされました')
        setUser(null)
      }
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
  }, [updateSession, initialLoad])

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
      
      console.log('ログイン成功:', data)
      
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
        
        const userData = {
          id: data.session.user.id,
          email: data.session.user.email || '',
          name: profile?.name || data.session.user.email?.split('@')[0] || '',
          created_at: data.session.user.created_at
        }
        
        console.log('ログイン後のユーザー情報:', userData)
        setUser(userData)
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
      
      console.log('サインアップ成功:', data)
      
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
        
        const userData = {
          id: data.user.id,
          email: data.user.email || '',
          name,
          created_at: data.user.created_at,
        }
        
        console.log('サインアップ後のユーザー情報:', userData)
        setUser(userData)
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