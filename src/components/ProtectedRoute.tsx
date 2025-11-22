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
  const auth = useAuth()
  const { loading, isAuthenticated } = auth || {}

  console.log('ProtectedRouteの認証状態:', { loading, isAuthenticated })

  // 認証状態を確認中
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // 認証されていない場合はログインページにリダイレクト
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // 認証されている場合は子コンポーネントを表示
  return <>{children}</>
}

export default ProtectedRoute