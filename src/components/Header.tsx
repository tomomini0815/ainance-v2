import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Bell, Menu, Settings, LogOut, Building, User } from 'lucide-react'
import BusinessTypeSwitcher from './BusinessTypeSwitcher'
import CreateBusinessTypeModal from './CreateBusinessTypeModal'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../context/ThemeContext'
import { useBusinessTypeContext } from '../context/BusinessTypeContext'

import { useGlobalSearch } from '../hooks/useGlobalSearch'
import { TrendingUp, TrendingDown } from 'lucide-react'

import { createPortal } from 'react-dom'

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const navigate = useNavigate()
  const { user, signOut, loading } = useAuth()
  const { currentBusinessType } = useBusinessTypeContext()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 })
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const { pages, transactions } = useGlobalSearch(searchTerm)



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
    if (searchTerm.trim()) {
      navigate(`/transaction-history?search=${encodeURIComponent(searchTerm)}`)
      setIsSearchExpanded(false)
      setSearchTerm('')
    }
  }

  const handlePageClick = (path: string) => {
    navigate(path)
    setIsSearchExpanded(false)
    setSearchTerm('')
  }

  const handleTransactionClick = (item: string) => {
    navigate(`/transaction-history?search=${encodeURIComponent(item)}`)
    setIsSearchExpanded(false)
    setSearchTerm('')
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-white/5 h-16 transition-colors duration-300">
        <div className="px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between items-center h-full">
            {/* Left: Logo (Mobile only) */}
            <div className="md:hidden flex items-center gap-2">
              <Link to="/dashboard" className="flex items-center gap-2">
                <img src="/ainance-logo.png" alt="Ainance" className="w-8 h-8 object-contain" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Ainance</h1>
              </Link>
            </div>

            {/* Center: Business Type Display (Desktop only) */}
            <div className="hidden md:flex items-center">
              {currentBusinessType ? (
                <div className="flex items-center space-x-2 bg-surface border border-white/10 px-3 py-1.5 rounded-lg">
                  {currentBusinessType.business_type === 'individual' ? (
                    <User className="w-4 h-4 text-primary" />
                  ) : (
                    <Building className="w-4 h-4 text-green-400" />
                  )}
                  <span className="text-sm font-medium text-text-main">
                    {currentBusinessType.business_type === 'individual' ? '個人' : '法人'}
                  </span>
                  <span className="text-sm text-text-muted truncate max-w-xs">
                    - {currentBusinessType.company_name}
                  </span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 bg-surface border border-white/10 px-3 py-1.5 rounded-lg">
                  <User className="w-4 h-4 text-text-muted" />
                  <span className="text-sm text-text-muted">業態形態を選択</span>
                </div>
              )}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center space-x-4">
              {/* Search (Desktop) */}
              <div className="hidden md:block relative">
                <form onSubmit={handleSearch} className={`relative flex items-center transition-all duration-300 ${isSearchExpanded ? 'w-64' : 'w-10'}`}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSearchExpanded(!isSearchExpanded);
                      if (!isSearchExpanded) {
                        setTimeout(() => document.getElementById('search-input')?.focus(), 100);
                      }
                    }}
                    className={`absolute left-0 z-10 p-2 rounded-full transition-colors ${isSearchExpanded ? 'text-primary' : 'text-text-muted hover:text-white hover:bg-white/5'}`}
                  >
                    <Search className="h-5 w-5" />
                  </button>
                  <input
                    id="search-input"
                    type="text"
                    placeholder="検索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onBlur={() => {
                      // ドロップダウン内のクリックを許可するために遅延させる
                      setTimeout(() => {
                        if (!searchTerm) setIsSearchExpanded(false);
                      }, 200);
                    }}
                    className={`w-full pl-10 pr-4 py-2 bg-surface border border-white/10 rounded-full text-sm text-text-main placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all duration-300 ${isSearchExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                  />
                </form>

                {/* Search Results Dropdown */}
                {isSearchExpanded && searchTerm && (pages.length > 0 || transactions.length > 0) && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                    {pages.length > 0 && (
                      <div className="py-2">
                        <div className="px-4 py-1 text-xs font-semibold text-text-muted uppercase tracking-wider">ページ</div>
                        {pages.map((page) => (
                          <button
                            key={page.path}
                            onClick={() => handlePageClick(page.path)}
                            className="w-full text-left px-4 py-2 hover:bg-white/5 flex items-center gap-3 transition-colors"
                          >
                            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                              <page.icon size={16} />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-text-main">{page.title}</div>
                              <div className="text-xs text-text-muted">{page.description}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {pages.length > 0 && transactions.length > 0 && <div className="h-px bg-white/5 mx-2" />}

                    {transactions.length > 0 && (
                      <div className="py-2">
                        <div className="px-4 py-1 text-xs font-semibold text-text-muted uppercase tracking-wider">最近の取引</div>
                        {transactions.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => handleTransactionClick(t.item)}
                            className="w-full text-left px-4 py-2 hover:bg-white/5 flex items-center gap-3 transition-colors"
                          >
                            <div className={`p-1.5 rounded-lg ${t.type === 'income' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                              {t.type === 'income' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-text-main truncate">{t.item}</div>
                              <div className="text-xs text-text-muted truncate">{t.date} • {t.category}</div>
                            </div>
                            <div className={`text-sm font-medium ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                              {t.amount.toLocaleString()}円
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>



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
                  <>
                    <button
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setMenuPosition({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
                        setShowUserMenu(!showUserMenu);
                      }}
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

                    {showUserMenu && createPortal(
                      <>
                        <div
                          className="fixed inset-0 z-[999]"
                          onClick={() => setShowUserMenu(false)}
                        />
                        <div
                          className="fixed w-64 bg-surface border border-white/10 rounded-xl shadow-2xl z-[1000] py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                          style={{
                            top: `${menuPosition.top}px`,
                            right: `${menuPosition.right}px`
                          }}
                        >
                          <div className="px-4 py-3 border-b border-white/5 bg-white/5">
                            <div className="font-medium text-text-main">{user?.name}</div>
                            <div className="text-xs text-text-muted truncate">{user?.email}</div>
                          </div>

                          <div className="p-2">
                            <div className="px-2 py-1.5">
                              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">業態形態</h3>
                              <BusinessTypeSwitcher
                                displayMode="inline"
                                onCreateClick={() => {
                                  setShowCreateModal(true)
                                  setShowUserMenu(false)
                                }}
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
                      </>,
                      document.body
                    )}
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium"
                  >
                    <User className="w-4 h-4" />
                    <span>ログイン</span>
                  </Link>
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

      <CreateBusinessTypeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </>
  )
}

export default Header