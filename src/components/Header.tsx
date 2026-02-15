import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Bell, Menu, Settings, LogOut, Building, User, TrendingUp, TrendingDown, FileText, CheckSquare, Calendar, AlertCircle, ChevronDown } from 'lucide-react'
import BusinessTypeSwitcher from './BusinessTypeSwitcher'
import CreateBusinessTypeModal from './CreateBusinessTypeModal'
import { useAuth } from '../hooks/useAuth'
import { useBusinessTypeContext } from '../context/BusinessTypeContext'
import { useGlobalSearch } from '../hooks/useGlobalSearch'
import { createPortal } from 'react-dom'
import { getReceipts } from '../services/receiptService'
import { useTransactions } from '../hooks/useTransactions'
import { useFiscalYear } from '../context/FiscalYearContext'

interface HeaderProps {
  onMenuClick: () => void;
}

interface NotificationItem {
  id: string;
  type: 'receipt' | 'transaction' | 'tax' | 'system';
  title: string;
  message: string;
  link?: string;
  date?: string;
  priority: 'high' | 'medium' | 'low';
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
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const notificationRef = useRef<HTMLDivElement>(null)
  const { selectedYear, setSelectedYear, yearOptions } = useFiscalYear()

  const { pages, transactions: searchTransactions } = useGlobalSearch(searchTerm)
  const { transactions: allTransactions } = useTransactions(user?.id, currentBusinessType?.business_type)

  // 通知データの取得と生成
  useEffect(() => {
    if (!user || !currentBusinessType) return;

    const fetchNotifications = async () => {
      const newNotifications: NotificationItem[] = [];

      // 1. 未処理のレシート (Inboxにあるもの)
      try {
        const receipts = await getReceipts(user.id);
        const pendingReceipts = receipts.filter(r => r.status === 'pending');
        if (pendingReceipts.length > 0) {
          newNotifications.push({
            id: 'receipts-pending',
            type: 'receipt',
            title: '未処理のレシート',
            message: `${pendingReceipts.length}件のレシートが確認待ちです`,
            link: '/receipt-processing',
            priority: 'high'
          });
        }
      } catch (error) {
        console.error('レシート取得エラー:', error);
      }

      // 2. 承認待ちの取引 (AI登録など)
      // useTransactionsですでに取得しているデータを使用
      const pendingTransactions = allTransactions.filter(t => t.approval_status === 'pending');
      if (pendingTransactions.length > 0) {
        newNotifications.push({
          id: 'transactions-pending',
          type: 'transaction',
          title: '承認待ちの取引',
          message: `${pendingTransactions.length}件の取引が承認待ちです`,
          link: '/transaction-inbox', // または承認画面
          priority: 'medium'
        });
      }

      // 3. 確定申告期限 (個人事業主の場合)
      if (currentBusinessType.business_type === 'individual') {
        const today = new Date();
        const currentYear = today.getFullYear();
        // 確定申告期間: 2/16 - 3/15 (翌年)
        // 現在が1/1 - 3/15なら、前年分の申告期限
        let deadlineYear = currentYear;
        if (today.getMonth() + 1 <= 3 && today.getDate() <= 15) {
          // そのまま
        } else {
          // 3/16以降は来年の3/15
          deadlineYear = currentYear + 1;
        }

        const deadline = new Date(deadlineYear, 2, 15); // 3月15日 (Month is 0-indexed)
        const diffTime = deadline.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 0 && diffDays <= 60) { // 60日前から通知
          newNotifications.push({
            id: 'tax-deadline',
            type: 'tax',
            title: '確定申告期限',
            message: `申告期限まであと${diffDays}日です`,
            link: '/tax-return',
            priority: diffDays <= 14 ? 'high' : 'medium'
          });
        }
      }

      setNotifications(newNotifications);
    };

    fetchNotifications();
  }, [user, currentBusinessType, allTransactions]);

  // クリック外側の検知（通知用）
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const handleNotificationClick = (link?: string) => {
    if (link) {
      navigate(link);
      setShowNotifications(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'receipt': return <FileText className="w-4 h-4 text-blue-500" />;
      case 'transaction': return <CheckSquare className="w-4 h-4 text-green-500" />;
      case 'tax': return <Calendar className="w-4 h-4 text-orange-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-white/5 h-16 transition-colors duration-300">
        <div className="px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between items-center h-full">
            {/* Left: Logo (Mobile only) */}
            <div className="md:hidden flex items-center gap-2">
              <Link to="/dashboard" className="flex items-center gap-2">
                <img src="/ainance-logo.png" alt="Ainance" className="w-8 h-8 object-contain" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent hidden sm:block">Ainance</h1>
              </Link>
            </div>

            {/* Left/Center: Empty space or Search (Adjusted) */}
            <div className="hidden md:flex flex-1 items-center justify-center">
              {/* This space can be used for search or global announcements */}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
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
                {isSearchExpanded && searchTerm && (pages.length > 0 || searchTransactions.length > 0) && (
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

                    {pages.length > 0 && searchTransactions.length > 0 && <div className="h-px bg-white/5 mx-2" />}

                    {searchTransactions.length > 0 && (
                      <div className="py-2">
                        <div className="px-4 py-1 text-xs font-semibold text-text-muted uppercase tracking-wider">最近の取引</div>
                        {searchTransactions.map((t) => (
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

              {/* Fiscal Year Selector (Pill Design) */}
              <div className="relative group">
                <div className="flex items-center bg-surface border border-white/10 px-2 sm:px-3 py-1.5 rounded-full transition-all duration-200 hover:bg-white/5 hover:border-white/20">
                  <Calendar className="w-4 h-4 text-secondary mr-2" />
                  <span className="text-sm font-bold text-text-main mr-1">
                    {selectedYear}
                    <span className="hidden sm:inline">年度</span>
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-text-muted transition-transform group-hover:rotate-180" />
                </div>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  title="会計年度を選択"
                >
                  {yearOptions.map(y => (
                    <option key={y} value={y} className="bg-surface text-text-main">
                      {y}年度
                    </option>
                  ))}
                </select>
              </div>

              {/* Notifications */}
              <div className="relative" ref={notificationRef}>
                <button
                  className={`relative p-2 rounded-full transition-colors ${showNotifications ? 'bg-white/10 text-primary' : 'text-text-muted hover:text-primary hover:bg-white/5'}`}
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className="h-5 w-5" />
                  {notifications.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse"></span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="fixed top-16 right-4 left-4 w-auto md:absolute md:top-full md:right-0 md:left-auto md:w-80 md:mt-2 bg-surface border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                      <h3 className="font-semibold text-text-main">お知らせ</h3>
                      {notifications.length > 0 && (
                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                          {notifications.length}件の未読
                        </span>
                      )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        <div className="py-2">
                          {notifications.map((notification) => (
                            <button
                              key={notification.id}
                              onClick={() => handleNotificationClick(notification.link)}
                              className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-start gap-3 transition-colors border-l-2 border-transparent hover:border-primary/50"
                            >
                              <div className={`mt-0.5 p-1.5 rounded-lg bg-surface border border-white/5 shadow-sm`}>
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1">
                                <div className="text-sm font-medium text-text-main">{notification.title}</div>
                                <div className="text-xs text-text-muted mt-0.5">{notification.message}</div>
                              </div>
                              {notification.priority === 'high' && (
                                <span className="h-2 w-2 rounded-full bg-red-500 mt-2"></span>
                              )}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="px-4 py-8 text-center text-text-muted">
                          <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                          <p className="text-sm">新しいお知らせはありません</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

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
                        {currentBusinessType?.business_type === 'corporation' ? (
                          <Building className="w-4 h-4 text-white" />
                        ) : (
                          <User className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div className="hidden md:flex flex-col items-start leading-tight">
                        <span className="text-sm font-medium text-text-main truncate max-w-[120px]">
                          {currentBusinessType?.company_name || user.name || 'ユーザー'}
                        </span>
                      </div>
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