import React from 'react'
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
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
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