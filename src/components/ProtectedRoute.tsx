import React, { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Navigate } from 'react-router-dom'

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback 
}) => {
  const auth = useAuth()
  const { isAuthenticated, loading, user } = auth || {}
  const [authChecked, setAuthChecked] = useState(false)

  console.log('ProtectedRouteの認証状態:', { isAuthenticated, loading, user, auth })

  // authオブジェクトがundefinedの場合の処理
  if (!auth) {
    console.log('ProtectedRoute: authオブジェクトが利用できません。')
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">認証情報を確認中...</p>
        </div>
      </div>
    )
  }

  // 認証状態が変化したときにコンソールに出力
  useEffect(() => {
    console.log('ProtectedRoute: 認証状態が変化しました', { isAuthenticated, loading, user })
    if (!loading) {
      setAuthChecked(true)
    }
  }, [isAuthenticated, loading, user])

  if (loading || !authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    // 認証されていない場合はログインページにリダイレクト
    console.log('ProtectedRoute: ユーザーが認証されていません。ログインページにリダイレクトします。')
    return fallback || <Navigate to="/" replace />
  }

  console.log('ProtectedRoute: ユーザーが認証されています。子コンポーネントを表示します。')
  return <>{children}</>
}

export default ProtectedRoute