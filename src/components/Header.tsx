
import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {ChevronDown, User, Settings, LogOut} from 'lucide-react'
import BusinessTypeSwitcher from './BusinessTypeSwitcher'
import { useAuth } from '../hooks/useAuth'

const Header: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [currentBusinessType, setCurrentBusinessType] = useState<any>(null)
  
  // 仮のユーザーID（実際の実装では認証システムから取得）
  const userId = user?.userId || "user_001"
  
  const isActive = (path: string) => {
    return location.pathname === path
  }

  const handleBusinessTypeChange = (businessType: any) => {
    setCurrentBusinessType(businessType)
    console.log('業態形態が変更されました:', businessType)
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      console.error('ログアウトエラー:', error)
    }
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* ロゴ */}
          <div className="flex items-center">
            <Link to="/dashboard">
              <h1 className="text-2xl font-bold text-blue-600 cursor-pointer hover:text-blue-700">Ainance</h1>
            </Link>
          </div>
          
          {/* デスクトップナビゲーション */}
          <nav className="hidden md:flex items-center space-x-8">
            {/* 業態形態切り替え */}
            <BusinessTypeSwitcher 
              userId={userId}
              onBusinessTypeChange={handleBusinessTypeChange}
            />
            
            <Link 
              to="/dashboard" 
              className={`font-medium pb-1 ${
                isActive('/dashboard') 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ダッシュボード
            </Link>
            <Link 
              to="/receipt-processing" 
              className={`font-medium pb-1 ${
                isActive('/receipt-processing') 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              レシート
            </Link>
            <Link 
              to="/invoice-creation" 
              className={`font-medium pb-1 ${
                isActive('/invoice-creation') 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              請求書
            </Link>
            <Link 
              to="/business-analysis" 
              className={`font-medium pb-1 ${
                isActive('/business-analysis') 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              経営分析
            </Link>
            <Link 
              to="/chat-to-book" 
              className={`font-medium pb-1 ${
                isActive('/chat-to-book') 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              CHAT-TO-BOOK
            </Link>
            <Link 
              to="/business-conversion" 
              className={`font-medium pb-1 ${
                isActive('/business-conversion') 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              事業変換
            </Link>
          </nav>
          
          {/* ユーザーメニュー */}
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">7</span>
            </div>
            
            {/* ユーザードロップダウン */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <span className="hidden md:block text-sm font-medium">
                  {user?.userName || 'ユーザー'}
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                      <div className="font-medium">{user?.userName}</div>
                      <div className="text-gray-500">{user?.email}</div>
                    </div>
                    <Link
                      to="/integration-settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      設定
                    </Link>
                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        handleSignOut()
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      ログアウト
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* モバイルナビゲーション */}
        <div className="md:hidden border-t border-gray-200 pt-4 pb-4">
          <div className="flex items-center justify-between mb-4">
            <BusinessTypeSwitcher 
              userId={userId}
              onBusinessTypeChange={handleBusinessTypeChange}
            />
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <Link 
              to="/dashboard" 
              className={`text-center py-2 ${
                isActive('/dashboard') 
                  ? 'text-blue-600 font-medium' 
                  : 'text-gray-600'
              }`}
            >
              ダッシュボード
            </Link>
            <Link 
              to="/receipt-processing" 
              className={`text-center py-2 ${
                isActive('/receipt-processing') 
                  ? 'text-blue-600 font-medium' 
                  : 'text-gray-600'
              }`}
            >
              レシート
            </Link>
            <Link 
              to="/invoice-creation" 
              className={`text-center py-2 ${
                isActive('/invoice-creation') 
                  ? 'text-blue-600 font-medium' 
                  : 'text-gray-600'
              }`}
            >
              請求書
            </Link>
            <Link 
              to="/business-analysis" 
              className={`text-center py-2 ${
                isActive('/business-analysis') 
                  ? 'text-blue-600 font-medium' 
                  : 'text-gray-600'
              }`}
            >
              経営分析
            </Link>
            <Link 
              to="/chat-to-book" 
              className={`text-center py-2 ${
                isActive('/chat-to-book') 
                  ? 'text-blue-600 font-medium' 
                  : 'text-gray-600'
              }`}
            >
              CHAT-TO-BOOK
            </Link>
            <Link 
              to="/business-conversion" 
              className={`text-center py-2 ${
                isActive('/business-conversion') 
                  ? 'text-blue-600 font-medium' 
                  : 'text-gray-600'
              }`}
            >
              事業変換
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
