import { useState, useEffect, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'

interface User {
  id: string
  email: string
  name: string
  createdAt: string
}

export const useMockAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // ローカルストレージからユーザー情報を読み込む
  const loadUserFromStorage = useCallback(() => {
    const storedUser = localStorage.getItem('user')
    
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        setUser(userData)
      } catch (error) {
        console.error('ユーザー情報の解析に失敗しました:', error)
        localStorage.removeItem('user')
      }
    }
    
    setLoading(false)
  }, [])

  useEffect(() => {
    loadUserFromStorage()
  }, [loadUserFromStorage])

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true)
    
    try {
      console.log('signIn関数が呼び出されました:', { email, password })
      
      // フォームバリデーション
      if (!email || !password) {
        throw new Error('メールアドレスとパスワードを入力してください')
      }
      
      // メールアドレスの形式をチェック
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        throw new Error('有効なメールアドレスを入力してください')
      }
      
      // パスワードの長さをチェック
      if (password.length < 6) {
        throw new Error('パスワードは6文字以上である必要があります')
      }
      
      // モックの認証処理
      // 実際のアプリではここでAPIを呼び出して認証を行う
      const mockUser: User = {
        id: uuidv4(), // UUID形式のIDを生成
        email,
        name: email.split('@')[0],
        createdAt: new Date().toISOString()
      }
      
      console.log('モックユーザーを作成:', mockUser)
      
      // ローカルストレージに保存
      localStorage.setItem('user', JSON.stringify(mockUser))
      setUser(mockUser)
      
      console.log('ログイン成功')
      return mockUser
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
      console.log('signUp関数が呼び出されました:', { name, email, password })
      
      // フォームバリデーション
      if (!name || !email || !password) {
        throw new Error('すべてのフィールドを入力してください')
      }
      
      // メールアドレスの形式をチェック
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        throw new Error('有効なメールアドレスを入力してください')
      }
      
      // パスワードの長さをチェック
      if (password.length < 6) {
        throw new Error('パスワードは6文字以上である必要があります')
      }
      
      // モックのユーザー登録処理
      // 実際のアプリではここでAPIを呼び出してユーザー登録を行う
      const mockUser: User = {
        id: uuidv4(), // UUID形式のIDを生成
        email,
        name,
        createdAt: new Date().toISOString()
      }
      
      console.log('モックユーザーを作成:', mockUser)
      
      // ローカルストレージに保存
      localStorage.setItem('user', JSON.stringify(mockUser))
      setUser(mockUser)
      
      console.log('サインアップ成功')
      return mockUser
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
      console.log('signOut関数が呼び出されました')
      
      // ローカルストレージからユーザー情報を削除
      localStorage.removeItem('user')
      setUser(null)
      
      console.log('ログアウト成功')
    } catch (error: any) {
      console.error('ログアウトエラー:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  console.log('useMockAuthの状態:', { user, loading })

  return {
    user,
    isAuthenticated: !!user,
    loading,
    signIn,
    signUp,
    signOut
  }
}