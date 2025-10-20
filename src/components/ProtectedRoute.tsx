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

  // 認証が確認されたときにコンソールに出力
  useEffect(() => {
    if (authChecked && isAuthenticated) {
      console.log('ProtectedRoute: 認証が確認されました。ダッシュボードにアクセスできます。')
    }
  }, [authChecked, isAuthenticated])

  // 認証が確認されなかったときにコンソールに出力
  useEffect(() => {
    if (authChecked && !isAuthenticated) {
      console.log('ProtectedRoute: 認証が確認されませんでした。ログインページにリダイレクトします。')
    }
  }, [authChecked, isAuthenticated])

  // ローディング中または認証チェックが完了していない場合
  if (loading || !authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // 認証されていない場合
  if (!isAuthenticated) {
    console.log('ProtectedRoute: ユーザーが認証されていません。ログインページにリダイレクトします。')
    return fallback || <Navigate to="/" replace />
  }

  // 認証されている場合
  console.log('ProtectedRoute: ユーザーが認証されています。子コンポーネントを表示します。')
  return <>{children}</>
}

export default ProtectedRoute