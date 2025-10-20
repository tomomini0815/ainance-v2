import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const LandingPage: React.FC = () => {
  const navigate = useNavigate()

  // 直接ダッシュボードにリダイレクト
  React.useEffect(() => {
    navigate('/dashboard')
  }, [navigate])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">ダッシュボードに移動中...</p>
      </div>
    </div>
  )
}

export default LandingPage
