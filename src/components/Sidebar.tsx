import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Home, Receipt, FileText, BarChart3, MessageSquare, Users,
    Settings, LogOut, ChevronLeft, ChevronRight, X, Building, User
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useBusinessType } from '../hooks/useBusinessType';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface SidebarProps {
    isOpen: boolean;
    isExpanded: boolean;
    onToggleExpand: () => void;
    onCloseMobile: () => void;
    userId?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
    isOpen,
    isExpanded,
    onToggleExpand,
    onCloseMobile,
    userId
}) => {
    const location = useLocation();
    const { signOut } = useAuth();
    // ローカルストレージから現在のビジネスタイプを取得
    const [currentBusinessType] = useLocalStorage<any>(`businessType_${userId}`, null);

    const isActive = (path: string) => location.pathname === path;

    const navItems = [
        { path: '/dashboard', label: 'ダッシュボード', icon: Home },
        { path: '/receipt-processing', label: 'レシート', icon: Receipt },
        { path: '/invoice-creation', label: '請求書', icon: FileText },
        { path: '/business-analysis', label: '経営分析', icon: BarChart3 },
        { path: '/chat-to-book', label: 'CHAT-TO-BOOK', icon: MessageSquare },
        { path: '/business-conversion', label: '申告サポート', icon: Users },
    ];

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error('ログアウトエラー:', error);
        }
    };

    // Common link classes
    const getLinkClasses = (path: string) => `
    flex items-center px-3 py-3 rounded-xl transition-all duration-200 group
    ${isActive(path)
            ? 'bg-primary/10 text-primary shadow-[0_0_20px_rgba(99,102,241,0.3)]'
            : 'text-text-muted hover:bg-white/5 hover:text-text-main'
        }
    ${!isExpanded ? 'justify-center' : ''}
  `;

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                    onClick={onCloseMobile}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={`
          fixed top-0 left-0 h-screen z-50
          bg-[#0f172a]/90 backdrop-blur-xl border-r border-white/5
          transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${isExpanded ? 'w-72' : 'w-20'}
        `}
            >
                <div className="flex flex-col h-full p-4">
                    {/* Header / Logo Area */}
                    <div className={`flex items-center h-16 mb-6 ${isExpanded ? 'justify-between' : 'justify-center'}`}>
                        {isExpanded ? (
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                Ainance
                            </h1>
                        ) : (
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary" />
                        )}

                        {/* Mobile Close Button */}
                        <button
                            onClick={onCloseMobile}
                            className="md:hidden p-2 text-text-muted hover:text-white"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Business Type Display */}
                    {isExpanded && (
                        <div className="mb-6">
                            {currentBusinessType ? (
                                <div className="flex items-center space-x-2 bg-blue-50 border border-blue-200 px-3 py-2 rounded-lg">
                                    {currentBusinessType.business_type === 'individual' ? (
                                        <User className="w-4 h-4 text-blue-600" />
                                    ) : (
                                        <Building className="w-4 h-4 text-green-600" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-blue-800 truncate">
                                            {currentBusinessType.business_type === 'individual' ? '個人事業主' : '法人'}
                                        </div>
                                        <div className="text-xs text-blue-600 truncate">
                                            {currentBusinessType.company_name}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg">
                                    <User className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-500">業態形態を選択</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Navigation */}
                    <nav className="flex-1 space-y-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={getLinkClasses(item.path)}
                                onClick={onCloseMobile}
                                title={!isExpanded ? item.label : undefined}
                            >
                                <item.icon size={24} className={`transition-transform duration-200 ${isActive(item.path) ? 'scale-110' : 'group-hover:scale-110'}`} />
                                {isExpanded && (
                                    <span className="ml-3 font-medium">{item.label}</span>
                                )}
                            </Link>
                        ))}
                    </nav>

                    {/* Bottom Actions */}
                    <div className="pt-4 border-t border-white/5 space-y-2">
                        <Link
                            to="/integration-settings"
                            className={getLinkClasses('/integration-settings')}
                            onClick={onCloseMobile}
                            title={!isExpanded ? '設定' : undefined}
                        >
                            <Settings size={24} />
                            {isExpanded && <span className="ml-3 font-medium">設定</span>}
                        </Link>

                        <button
                            onClick={handleSignOut}
                            className={`w-full ${getLinkClasses('')}`}
                            title={!isExpanded ? 'ログアウト' : undefined}
                        >
                            <LogOut size={24} />
                            {isExpanded && <span className="ml-3 font-medium">ログアウト</span>}
                        </button>
                    </div>

                    {/* Expand/Collapse Button (Desktop only) */}
                    <button
                        onClick={onToggleExpand}
                        className="hidden md:flex absolute -right-3 top-20 w-6 h-6 bg-surface border border-white/10 rounded-full items-center justify-center text-text-muted hover:text-white hover:bg-surface-highlight transition-colors shadow-lg"
                    >
                        {isExpanded ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
