import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { Navigate, useLocation } from 'react-router-dom'

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback 
}) => {
  const auth = useAuth()
  const { loading, isAuthenticated } = auth || {}
  const location = useLocation()

  console.log('ProtectedRouteの認証状態:', { loading, isAuthenticated, pathname: location.pathname })

  // 認証状態を確認中
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // 認証されていない場合はログインページにリダイレクト
  // ただし、リダイレクト元がログインページの場合は無限ループを防ぐため/homeにリダイレクト
  if (!isAuthenticated) {
    if (location.pathname === '/login') {
      return <Navigate to="/" replace />
    }
    return <Navigate to="/login" replace />
  }

  // 認証されている場合は子コンポーネントを表示
  return <>{children}</>
}

export default ProtectedRoute