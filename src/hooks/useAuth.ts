
import { useState, useEffect } from 'react'
import { lumi } from '../lib/lumi'

interface User {
  projectId: string
  userId: string
  email: string
  userName: string
  userRole: 'ADMIN' | 'USER'
  createdTime: string
  accessToken: string
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(lumi.auth.user)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // 既存セッションをチェック
    const checkSession = () => {
      const existingUser = lumi.auth.user
      const isLoggedIn = lumi.auth.isAuthenticated

      if (isLoggedIn && existingUser) {
        setUser(existingUser)
      }
    }

    checkSession()

    // 認証状態の変更を監視
    const unsubscribe = lumi.auth.onAuthChange((user: User | null) => {
      setUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signIn = async () => {
    try {
      setLoading(true)
      await lumi.auth.signIn()
    } catch (error) {
      console.error('ログインに失敗しました:', error)
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      await lumi.auth.signOut()
    } catch (error) {
      console.error('ログアウトに失敗しました:', error)
      setLoading(false)
    }
  }

  return {
    user,
    isAuthenticated: !!user,
    userRole: user?.userRole,
    loading,
    signIn,
    signOut
  }
}
