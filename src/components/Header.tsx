import React, { useState, useMemo, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Bell, Menu, Settings, LogOut, Sun, Moon, Building, User } from 'lucide-react'
import BusinessTypeSwitcher from './BusinessTypeSwitcher'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../context/ThemeContext'
import { useBusinessTypeContext } from '../context/BusinessTypeContext'

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const navigate = useNavigate()
  const { user, signOut, loading } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { currentBusinessType } = useBusinessTypeContext()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

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
    console.log('検索:', searchTerm)
  }

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-white/5 h-16 transition-colors duration-300">
      <div className="px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          {/* Left: Logo (Mobile only) */}
          <div className="md:hidden flex items-center gap-2">
            <Link to="/dashboard" className="flex items-center">
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Ainance</h1>
            </Link>
          </div>

          {/* Center: Business Type Display (Desktop only) */}
          <div className="hidden md:flex items-center">
            {currentBusinessType ? (
              <div className="flex items-center space-x-2 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg">
                {currentBusinessType.business_type === 'individual' ? (
                  <User className="w-4 h-4 text-blue-600" />
                ) : (
                  <Building className="w-4 h-4 text-green-600" />
                )}
                <span className="text-sm font-medium text-blue-800">
                  {currentBusinessType.business_type === 'individual' ? '個人事業主' : '法人'}
                </span>
                <span className="text-sm text-blue-600 truncate max-w-xs">
                  - {currentBusinessType.company_name}
                </span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1.5 rounded-lg">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">業態形態を選択</span>
              </div>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-4">
            {/* Search (Desktop) */}
            <div className="hidden md:block relative">
              <form onSubmit={handleSearch}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 bg-surface border border-white/10 rounded-full text-sm text-text-main placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                />
              </form>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-text-muted hover:text-primary rounded-full hover:bg-white/5 transition-colors"
              title={theme === 'dark' ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Notifications */}
            <button className="relative p-2 text-text-muted hover:text-primary rounded-full hover:bg-white/5 transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-accent shadow-[0_0_8px_rgba(244,114,182,0.5)]"></span>
            </button>

            {/* User Menu */}
            <div className="relative">
              {loading ? (
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center animate-pulse">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : user ? (
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 p-1 pr-3 rounded-full hover:bg-white/5 transition-colors border border-transparent hover:border-white/5"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                    <span className="text-white text-sm font-bold">
                      {user.name ? user.name.charAt(0) : 'U'}
                    </span>
                  </div>
                  <span className="hidden md:block text-sm font-medium text-text-secondary dark:text-text-secondary text-slate-700">
                    {user.name || 'ユーザー'}
                  </span>
                </button>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium"
                >
                  <User className="w-4 h-4" />
                  <span>ログイン</span>
                </Link>
              )}

              {showUserMenu && user && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-surface border border-white/10 rounded-xl shadow-2xl z-50 py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-3 border-b border-white/5 bg-white/5">
                      <div className="font-medium text-text-main">{user?.name}</div>
                      <div className="text-xs text-text-muted truncate">{user?.email}</div>
                    </div>

                    <div className="p-2">
                      <div className="px-2 py-1.5">
                        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">業態形態</h3>
                        <BusinessTypeSwitcher
                          displayMode="inline"
                        />
                      </div>

                      <div className="h-px bg-white/5 my-2" />

                      <Link
                        to="/integration-settings"
                        className="flex items-center px-3 py-2 text-sm text-text-secondary hover:bg-white/5 hover:text-white rounded-lg transition-colors"
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
                        className="flex items-center w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        ログアウト
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Menu Button (Mobile only) */}
            <button
              onClick={onMenuClick}
              className="md:hidden p-2 text-text-muted hover:text-primary rounded-lg hover:bg-white/5 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header