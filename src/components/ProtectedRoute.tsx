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
  const { isAuthenticated, loading } = auth || {}

  console.log('ProtectedRouteの認証状態:', { isAuthenticated, loading, auth })

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
    console.log('ProtectedRoute: ユーザーが認証されていません。ダッシュボードにリダイレクトします。')
    return fallback || <Navigate to="/dashboard" replace />
  }

  // 認証されている場合
  console.log('ProtectedRoute: ユーザーが認証されています。子コンポーネントを表示します。')
  return <>{children}</>
}

export default ProtectedRoute