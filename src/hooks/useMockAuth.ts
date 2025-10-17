import { useState, useEffect } from 'react'

interface User {
  projectId: string
  userId: string
  email: string
  userName: string
  userRole: 'ADMIN' | 'USER'
  createdTime: string
  accessToken: string
}

export const useMockAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // ローカルストレージからユーザー情報を読み込む
    const storedUser = localStorage.getItem('user')
    
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        setUser(userData)
      } catch (error) {
        console.error('ユーザー情報の解析に失敗しました:', error)
      }
    }
    
    setLoading(false)
  }, [])

  const signIn = async () => {
    setLoading(true)
    
    // モックのユーザー情報を生成
    const mockUser: User = {
      projectId: 'p364423076073435136',
      userId: 'mock_user_001',
      email: 'mock@example.com',
      userName: 'モックユーザー',
      userRole: 'USER',
      createdTime: new Date().toISOString(),
      accessToken: 'mock_access_token'
    }
    
    // ローカルストレージに保存
    localStorage.setItem('user', JSON.stringify(mockUser))
    setUser(mockUser)
    setLoading(false)
    
    // ダッシュボードにリダイレクト
    window.location.href = '/dashboard'
  }

  const signOut = async () => {
    setLoading(true)
    
    // ローカルストレージからユーザー情報を削除
    localStorage.removeItem('user')
    setUser(null)
    setLoading(false)
    
    // ログインページにリダイレクト
    window.location.href = '/'
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