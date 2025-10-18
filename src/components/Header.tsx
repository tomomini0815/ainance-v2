import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {ChevronDown, User, Settings, LogOut, Search, Bell, Menu, X, Home, Receipt, FileText, BarChart3, MessageSquare, Users, Zap, ChevronLeft, ChevronRight, Building, User as UserIcon}from 'lucide-react'
import BusinessTypeSwitcher from './BusinessTypeSwitcher'
import { useAuth } from '../hooks/useAuth'

interface HeaderProps {
  showPcSideMenu?: boolean; // PCサイドメニューを表示するかどうか
  onPcSideMenuToggle?: (expanded: boolean) => void; // PCサイドメニューの状態変更コールバック
  isPcSideMenuExpanded?: boolean; // PCサイドメニューの展開状態
  showSideMenus?: boolean; // サイドメニュー全体を表示するかどうか（デフォルト: true）
}

const Header: React.FC<HeaderProps> = ({ showPcSideMenu = false, onPcSideMenuToggle, isPcSideMenuExpanded = true, showSideMenus = true }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showSideMenu, setShowSideMenu] = useState(false) // サイドメニュー用の状態
  const [isSideMenuExpanded, setIsSideMenuExpanded] = useState(true) // サイドメニューの展開状態
  const [currentBusinessType, setCurrentBusinessType] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  // 仮のユーザーID（実際の実装では認証システムから取得）
  const userId = user?.id || "user_001"
  
  const isActive = (path: string) => {
    return location.pathname === path
  }

  const handleBusinessTypeChange = (businessType: any) => {
    setCurrentBusinessType(businessType)
    console.log('業態形態が変更されました:', businessType)
  }

  // 選択された業態形態の表示名を取得する関数
  const getBusinessTypeDisplay = () => {
    if (!currentBusinessType) return '業態形態を選択'
    
    if (currentBusinessType.business_type === 'individual') {
      return `個人事業主 - ${currentBusinessType.company_name}`
    } else {
      return `法人 - ${currentBusinessType.company_name}`
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      console.error('ログアウトエラー:', error)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // 検索機能の実装
    console.log('検索:', searchTerm)
  }

  const navItems = [
    { path: '/dashboard', label: 'ダッシュボード', icon: Home },
    { path: '/receipt-processing', label: 'レシート', icon: Receipt },
    { path: '/invoice-creation', label: '請求書', icon: FileText },
    { path: '/business-analysis', label: '経営分析', icon: BarChart3 },
    { path: '/chat-to-book', label: 'CHAT-TO-BOOK', icon: MessageSquare },
    { path: '/business-conversion', label: '申告サポート', icon: Users },
  ]

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* ロゴ */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center">
              <h1 className="text-xl font-bold text-blue-600 cursor-pointer hover:text-blue-700">Ainance</h1>
            </Link>
          </div>
          
          {/* 中央の要素 - 業態選択プルダウン（デスクトップのみ） */}
          <div className="hidden md:flex items-center">
            <BusinessTypeSwitcher 
              userId={userId}
              onBusinessTypeChange={handleBusinessTypeChange}
            />
          </div>
          
          {/* 右側の要素 */}
          <div className="flex items-center space-x-3">
            {/* 検索バー（デスクトップ） */}
            {showSideMenus && (
              <div className="hidden md:block">
                <form onSubmit={handleSearch} className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="検索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-48 pl-10 pr-4 py-2 border border-gray-300 rounded-full leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200 hover:shadow-sm"
                  />
                </form>
              </div>
            )}
            
            {/* 通知アイコン */}
            {showSideMenus && (
              <button className="relative p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors hidden md:block">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full ring-2 ring-white bg-red-400"></span>
              </button>
            )}
            
            {/* ユーザードロップダウン（デスクトップ） */}
            {showSideMenus && (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors p-1 rounded-full hover:bg-gray-100"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.name ? user.name.charAt(0) : 'U'}
                    </span>
                  </div>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-1">
                    <div className="px-4 py-3 text-sm text-gray-700 border-b border-gray-100">
                      <div className="font-medium">{user?.name}</div>
                      <div className="text-gray-500 truncate">{user?.email}</div>
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
                )}
              </div>
            )}
            
            {/* モバイル用の要素 */}
            <div className="md:hidden flex items-center space-x-2">
              {/* 業態選択プルダウン（モバイル） */}
              <div className="flex items-center">
                <BusinessTypeSwitcher 
                  userId={userId}
                  onBusinessTypeChange={handleBusinessTypeChange}
                />
              </div>
              
              {/* ユーザーアイコン（モバイル） */}
              {showSideMenus && (
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors p-1 rounded-full hover:bg-gray-100"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.name ? user.name.charAt(0) : 'U'}
                    </span>
                  </div>
                </button>
              )}
              
              {/* ハンバーガーメニュー（モバイル） */}
              {showSideMenus && (
                <button
                  onClick={() => {
                    setShowSideMenu(!showSideMenu)
                    // サイドメニューを開くときに展開状態にする
                    if (!showSideMenu) {
                      setIsSideMenuExpanded(true)
                    }
                  }}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
                >
                  {showSideMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              )}
            </div>
            
            {/* ユーザードロップダウン（モバイル） */}
            {showUserMenu && (
              <div className="md:hidden absolute right-0 top-16 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-1">
                <div className="px-4 py-3 text-sm text-gray-700 border-b border-gray-100">
                  <div className="font-medium">{user?.name}</div>
                  <div className="text-gray-500 truncate">{user?.email}</div>
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
            )}
          </div>
        </div>
        
        {/* 折りたためるサイドメニュー（PC用） */}
        {showPcSideMenu && showSideMenus && (
          <div className={`hidden md:block fixed left-0 top-16 h-full bg-white shadow-lg z-40 transition-all duration-300 ease-in-out ${
            isPcSideMenuExpanded ? 'w-64' : 'w-20'
          }`}>
            <div className="flex h-full flex-col">
              {/* 折りたたみボタン */}
              <div className="absolute top-4 -right-8 z-10">
                <button
                  onClick={() => onPcSideMenuToggle && onPcSideMenuToggle(!isPcSideMenuExpanded)}
                  className="bg-white rounded-r-lg p-2 shadow-lg hover:bg-gray-100 transition-colors"
                  aria-label={isPcSideMenuExpanded ? "メニューを折りたたむ" : "メニューを展開する"}
                >
                  {isPcSideMenuExpanded ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto py-4">
                {/* ナビゲーション */}
                <nav className={`space-y-1 px-2 ${isPcSideMenuExpanded ? '' : 'flex flex-col items-center space-y-4'}`}>
                  {navItems.map((item) => {
                    const IconComponent = item.icon;
                    return isPcSideMenuExpanded ? (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                          isActive(item.path)
                            ? 'bg-blue-100 text-blue-900'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        <IconComponent className="mr-3 h-6 w-6" />
                        {item.label}
                      </Link>
                    ) : (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center justify-center p-3 rounded-lg transition-colors ${
                          isActive(item.path)
                            ? 'bg-blue-100 text-blue-900'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                        title={item.label}
                        aria-label={item.label}
                      >
                        <IconComponent className="h-6 w-6" />
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>
        )}
        
        {/* 折りたためるサイドメニュー（モバイル用） */}
        <div className={`md:hidden fixed inset-0 z-50 transition-all duration-300 ease-in-out transform ${
          showSideMenu ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="absolute inset-0 overflow-hidden">
            {/* 背景オーバーレイ */}
            <div 
              className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowSideMenu(false)}
            ></div>
            
            {/* サイドメニュー */}
            <div className="absolute inset-y-0 right-0 max-w-full flex">
              <div className={`relative h-full ${isSideMenuExpanded ? 'w-80' : 'w-20'} transition-all duration-300 ease-in-out`}>
                <div className="h-full flex flex-col bg-white shadow-xl">
                  {/* 折りたたみボタン */}
                  <div className="absolute top-4 -left-8 z-10">
                    <button
                      onClick={() => setIsSideMenuExpanded(!isSideMenuExpanded)}
                      className="bg-white rounded-l-lg p-2 shadow-lg hover:bg-gray-100 transition-colors"
                      aria-label={isSideMenuExpanded ? "メニューを折りたたむ" : "メニューを展開する"}
                    >
                      {isSideMenuExpanded ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                    </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto">
                    {/* ヘッダー */}
                    <div className="px-4 py-6 bg-blue-600 sm:px-6">
                      <div className="flex items-center justify-between">
                        {isSideMenuExpanded ? (
                          <>
                            <h2 className="text-lg font-semibold text-white">メニュー</h2>
                            <button
                              type="button"
                              className="text-white hover:text-gray-200"
                              onClick={() => setShowSideMenu(false)}
                              aria-label="メニューを閉じる"
                            >
                              <X className="h-6 w-6" />
                            </button>
                          </>
                        ) : (
                          <div className="flex justify-center w-full">
                            <button
                              type="button"
                              className="text-white hover:text-gray-200"
                              onClick={() => setShowSideMenu(false)}
                              aria-label="メニューを閉じる"
                            >
                              <X className="h-6 w-6" />
                            </button>
                          </div>
                        )}
                      </div>
                      {isSideMenuExpanded && (
                        <div className="mt-4 flex items-center">
                          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                            <span className="text-blue-600 text-sm font-medium">
                              {user?.name ? user.name.charAt(0) : 'U'}
                            </span>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-white">{user?.name || 'ユーザー'}</p>
                            <p className="text-sm text-blue-200">{user?.email}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* メニュー内容 */}
                    <div className="px-4 py-6 sm:px-6">
                      {/* 業態形態表示と切り替え（モバイル） */}
                      {isSideMenuExpanded && (
                        <div className="mb-6">
                          <h3 className="text-sm font-medium text-gray-900 mb-2">業態形態</h3>
                          <div className="flex items-center bg-blue-50 border border-blue-200 px-3 py-2 rounded-lg mb-2">
                            {currentBusinessType ? (
                              <>
                                {currentBusinessType.business_type === 'individual' ? (
                                  <UserIcon className="w-4 h-4 text-blue-600 mr-2" />
                                ) : (
                                  <Building className="w-4 h-4 text-green-600 mr-2" />
                                )}
                                <span className="text-sm font-medium text-blue-800">
                                  {getBusinessTypeDisplay()}
                                </span>
                              </>
                            ) : (
                              <span className="text-sm text-gray-500">業態形態を選択</span>
                            )}
                          </div>
                          <BusinessTypeSwitcher 
                            userId={userId}
                            onBusinessTypeChange={handleBusinessTypeChange}
                          />
                        </div>
                      )}
                      
                      {/* ナビゲーション */}
                      <nav className={`space-y-1 mb-8 ${isSideMenuExpanded ? '' : 'flex flex-col items-center space-y-4 py-4'}`}>
                        {navItems.map((item) => {
                          const IconComponent = item.icon;
                          return isSideMenuExpanded ? (
                            <Link
                              key={item.path}
                              to={item.path}
                              className={`flex items-center px-3 py-3 text-base font-medium rounded-lg transition-colors ${
                                isActive(item.path)
                                  ? 'bg-blue-100 text-blue-900'
                                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                              }`}
                              onClick={() => setShowSideMenu(false)}
                            >
                              <IconComponent className="mr-3 h-6 w-6" />
                              {item.label}
                            </Link>
                          ) : (
                            <Link
                              key={item.path}
                              to={item.path}
                              className={`flex items-center justify-center p-3 rounded-lg transition-colors ${
                                isActive(item.path)
                                  ? 'bg-blue-100 text-blue-900'
                                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                              }`}
                              onClick={() => setShowSideMenu(false)}
                              title={item.label}
                              aria-label={item.label}
                            >
                              <IconComponent className="h-6 w-6" />
                            </Link>
                          );
                        })}
                      </nav>
                      
                      {/* 検索バー（モバイル） */}
                      {isSideMenuExpanded && (
                        <div className="mb-6">
                          <form onSubmit={handleSearch} className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              placeholder="検索..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              aria-label="検索"
                            />
                          </form>
                        </div>
                      )}
                      
                      {/* 設定とログアウト */}
                      {isSideMenuExpanded ? (
                        <div className="pt-6 border-t border-gray-200">
                          <Link
                            to="/integration-settings"
                            className="flex items-center px-3 py-3 text-base font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
                            onClick={() => setShowSideMenu(false)}
                          >
                            <Settings className="mr-3 h-6 w-6" />
                            設定
                          </Link>
                          <button
                            onClick={() => {
                              setShowSideMenu(false)
                              handleSignOut()
                            }}
                            className="flex items-center w-full px-3 py-3 text-base font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
                          >
                            <LogOut className="mr-3 h-6 w-6" />
                            ログアウト
                          </button>
                        </div>
                      ) : (
                        <div className="pt-6 border-t border-gray-200 flex flex-col items-center space-y-4">
                          <Link
                            to="/integration-settings"
                            className="flex items-center justify-center p-3 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                            onClick={() => setShowSideMenu(false)}
                            title="設定"
                            aria-label="設定"
                          >
                            <Settings className="h-6 w-6" />
                          </Link>
                          <button
                            onClick={() => {
                              setShowSideMenu(false)
                              handleSignOut()
                            }}
                            className="flex items-center justify-center p-3 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                            title="ログアウト"
                            aria-label="ログアウト"
                          >
                            <LogOut className="h-6 w-6" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header