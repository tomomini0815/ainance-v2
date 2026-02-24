import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Home, ReceiptJapaneseYen, FileText, BarChart3, MessageSquare, Sparkles, Target,
    Settings, LogOut, ChevronLeft, ChevronRight, X, Upload, Edit, Sun, Moon,
    History as HistoryIcon
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useBusinessTypeContext } from '../context/BusinessTypeContext';
import { useTheme } from '../context/ThemeContext';

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
    onCloseMobile
}) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { signOut } = useAuth();
    const { theme, toggleTheme } = useTheme();
    // BusinessTypeContextから現在のビジネスタイプを取得
    const { currentBusinessType } = useBusinessTypeContext();

    // 法人かどうかを判定
    const isCorporation = currentBusinessType?.business_type === 'corporation';

    const isActive = (path: string) => location.pathname === path;

    const navItems = [
        { path: '/dashboard', label: 'ダッシュボード', icon: Home },
        { path: '/chat-to-book', label: '音声で記録', icon: MessageSquare },
        { path: '/receipt-processing', label: 'レシート処理', icon: ReceiptJapaneseYen },
        { path: '/invoice-creation', label: '書類作成管理', icon: FileText },
        { path: '/csv-import', label: 'CSV入出力管理', icon: Upload },
        { path: '/business-analysis', label: '経営分析', icon: BarChart3 },
        { path: '/settlement-history', label: '過去データ・引継ぎ', icon: HistoryIcon },
        // 法人の場合は法人税申告サポート、個人の場合は確定申告サポート
        {
            path: isCorporation ? '/corporate-tax' : '/tax-filing-wizard',
            label: isCorporation ? '法人税申告サポート' : '確定申告サポート',
            icon: Sparkles
        },
        // 法人のみ：申告書直接編集機能（個人事業主の直接編集とは遷移先が異なる）
        ...(isCorporation ? [{
            path: '/corporate-tax-input',
            label: '申告書直接編集',
            icon: Edit
        }] : []),
        // 個人事業主のみ：申告書直接編集機能を追加
        ...(!isCorporation ? [{
            path: '/tax-return-input',
            label: '申告書直接編集',
            icon: Edit
        }] : []),
        { path: '/subsidy-matching', label: '補助金マッチング', icon: Target },
    ];

    const handleSignOut = async () => {
        try {
            await signOut();
            navigate('/');
        } catch (error) {
            console.error('ログアウトエラー:', error);
        }
    };

    // Common link classes
    const getLinkClasses = (path: string) => {
        const collapsed = !isExpanded && !isOpen;
        return `
    flex items-center transition-all duration-300 group relative
    ${collapsed ? 'justify-center w-11 h-11 mx-auto rounded-full' : 'px-4 py-2.5 rounded-xl mx-1'}
    ${isActive(path)
                ? 'bg-primary/15 text-white shadow-[0_0_12px_rgba(99,102,241,0.3)]'
                : 'text-text-muted hover:bg-white/5 hover:text-text-main'
            }
  `;
    };

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
          bg-[#0f172a] border-r border-white/5
          transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${(isExpanded || isOpen) ? 'w-full md:w-72' : 'w-20'}
          overflow-visible
        `}
            >
                <div className={`flex flex-col h-full overflow-visible ${(isExpanded || isOpen) ? 'p-4' : 'px-1 py-4'}`}>
                    {/* Header / Logo Area */}
                    <div className={`flex items-center h-16 mb-2 ${(isExpanded || isOpen) ? 'justify-between' : 'justify-center'}`}>
                        {(isExpanded || isOpen) ? (
                            <div className="flex items-center space-x-3">
                                <img src="/ainance-logo-header.png" alt="Ainance" className="w-10 h-10 object-contain drop-shadow-[0_0_15px_rgba(99,102,241,0.5)] rounded-lg" />
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                    Ainance
                                </h1>
                            </div>
                        ) : (
                            <div className="relative">
                                <img src="/ainance-logo-header.png" alt="Ainance" className="w-10 h-10 object-contain drop-shadow-[0_0_15px_rgba(99,102,241,0.5)] rounded-lg" />
                            </div>
                        )}

                        {/* Mobile Close Button */}
                        <button
                            onClick={onCloseMobile}
                            className="md:hidden p-2 text-primary bg-primary/10 rounded-lg shadow-[0_0_15px_rgba(99,102,241,0.5)] hover:bg-primary/20 transition-all duration-300"
                        >
                            <X size={28} />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className={`flex-1 space-y-4 overflow-y-auto overflow-x-visible pt-2 pb-16 scrollbar-hide ${(isExpanded || isOpen) ? 'px-4' : 'px-0'}`}>
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={getLinkClasses(item.path)}
                                onClick={onCloseMobile}
                                title={(!isExpanded && !isOpen) ? item.label : undefined}
                            >
                                <item.icon size={22} className={`flex-shrink-0 transition-all duration-300 ${isActive(item.path) ? 'scale-110 drop-shadow-[0_0_3px_rgba(99,102,241,0.6)] text-white' : 'group-hover:scale-110'}`} />
                                {(isExpanded || isOpen) && (
                                    <span className={`ml-3 font-medium truncate ${isActive(item.path) ? 'text-white' : ''}`}>{item.label}</span>
                                )}
                            </Link>
                        ))}
                    </nav>

                    {/* Bottom Actions */}
                    <div className={`pt-4 border-t border-white/5 space-y-2 ${(isExpanded || isOpen) ? '' : 'px-0'}`}>
                        <button
                            onClick={toggleTheme}
                            className={getLinkClasses('theme-toggle')}
                            title={(!isExpanded && !isOpen) ? (theme === 'dark' ? 'ライトモード' : 'ダークモード') : undefined}
                        >
                            {theme === 'dark' ? <Sun size={24} className="flex-shrink-0" /> : <Moon size={24} className="flex-shrink-0" />}
                            {(isExpanded || isOpen) && <span className="ml-3 font-medium truncate">{theme === 'dark' ? 'ライトモード' : 'ダークモード'}</span>}
                        </button>

                        <Link
                            to="/integration-settings"
                            className={getLinkClasses('/integration-settings')}
                            onClick={onCloseMobile}
                            title={(!isExpanded && !isOpen) ? '設定' : undefined}
                        >
                            <Settings size={24} className="flex-shrink-0" />
                            {(isExpanded || isOpen) && <span className="ml-3 font-medium truncate">設定</span>}
                        </Link>

                        <button
                            onClick={handleSignOut}
                            className={`w-full ${getLinkClasses('')}`}
                            title={(!isExpanded && !isOpen) ? 'ログアウト' : undefined}
                        >
                            <LogOut size={24} className="flex-shrink-0" />
                            {(isExpanded || isOpen) && <span className="ml-3 font-medium truncate">ログアウト</span>}
                        </button>
                    </div>

                    {/* Expand/Collapse Button (Desktop only) */}
                    <button
                        onClick={onToggleExpand}
                        className="hidden md:flex absolute -right-3 top-8 w-8 h-8 bg-surface border border-white/10 rounded-full items-center justify-center text-text-muted hover:text-white hover:bg-surface-highlight transition-all duration-300 shadow-lg hover:shadow-[0_0_15px_rgba(99,102,241,0.5)] drop-shadow-[0_0_3px_rgba(99,102,241,0.6)]"
                    >
                        {isExpanded ? <ChevronLeft size={20} className="text-primary drop-shadow-[0_0_5px_rgba(99,102,241,0.8)] hover:text-primary/80 transition-colors duration-300" /> : <ChevronRight size={20} className="text-primary drop-shadow-[0_0_5px_rgba(99,102,241,0.8)] hover:text-primary/80 transition-colors duration-300" />}
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;