import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowLeft,
    FileText,
    Plus,
    Trash2,
    Edit2,
    Calendar,
    TrendingUp,
    ArrowRight,
    Search,
    Filter,
    MoreVertical,
    CheckCircle,
    AlertCircle,
    Download
} from 'lucide-react';
import { yearlySettlementService, YearlySettlement } from '../services/yearlySettlementService';
import { useAuth } from '../hooks/useAuth';
import { useBusinessTypeContext } from '../context/BusinessTypeContext';
import PreviousYearImportModal from '../components/PreviousYearImportModal';
import toast from 'react-hot-toast';

const YearlySettlementHistory: React.FC = () => {
    const { user } = useAuth();
    const { currentBusinessType } = useBusinessTypeContext();
    const [settlements, setSettlements] = useState<YearlySettlement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [selectedSettlement, setSelectedSettlement] = useState<YearlySettlement | null>(null);

    const businessType = currentBusinessType?.business_type || 'individual';
    const businessLabel = businessType === 'corporation' ? '法人' : '個人事業主';

    const fetchSettlements = async () => {
        if (!user?.id) return;
        setIsLoading(true);
        try {
            const data = await yearlySettlementService.getAllByBusinessType(user.id, businessType);
            setSettlements(data);
        } catch (error) {
            console.error('Error fetching settlements:', error);
            toast.error('決算データの取得に失敗しました');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSettlements();
    }, [user?.id, businessType]);

    const handleDelete = async (id: string, year: number) => {
        if (!window.confirm(`${year}年度の決算データを削除してもよろしいですか？`)) return;

        try {
            await yearlySettlementService.delete(id);
            toast.success(`${year}年度のデータを削除しました`);
            setSettlements(prev => prev.filter(s => s.id !== id));
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('削除に失敗しました');
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount);
    };

    return (
        <div className="min-h-screen bg-background text-text-main">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link to={businessType === 'corporation' ? '/corporate-tax' : '/tax-filing-wizard'} className="p-2 rounded-lg hover:bg-surface-highlight transition-colors">
                            <ArrowLeft className="w-6 h-6 text-text-muted hover:text-text-main" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                <FileText className="w-7 h-7 text-primary" />
                                過去決算データ・引継ぎ管理
                            </h1>
                            <p className="text-text-muted mt-1">
                                {businessLabel}としての過去の決算履歴を確認・管理できます
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsImportModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 font-bold"
                    >
                        <Plus className="w-5 h-5" />
                        新規データ追加
                    </button>
                </div>

                {/* Filters/Actions Bar */}
                <div className="bg-surface border border-border rounded-2xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input
                                type="text"
                                placeholder="年度や金額で検索..."
                                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm"
                            />
                        </div>
                        <button className="flex items-center gap-2 px-3 py-2 bg-surface-highlight rounded-xl text-sm font-medium hover:bg-border transition-colors border border-border">
                            <Filter className="w-4 h-4" />
                            フィルター
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-text-muted mr-2">全 {settlements.length} 件</span>
                    </div>
                </div>

                {/* Main Table */}
                <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
                    {isLoading ? (
                        <div className="p-12 text-center group">
                            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-text-muted">読み込み中...</p>
                        </div>
                    ) : settlements.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="bg-surface-highlight w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-10 h-10 text-text-muted" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">履歴がありません</h3>
                            <p className="text-text-muted mb-6">
                                過去の決算書をアップロードするか、手動で入力して<br />
                                前期からの数値引き継ぎや経営分析を可能にしましょう。
                            </p>
                            <button
                                onClick={() => setIsImportModalOpen(true)}
                                className="btn-primary px-8 py-3 rounded-xl font-bold"
                            >
                                初めてのデータを登録
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-surface-highlight/50 border-b border-border">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">年度</th>
                                        <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">売上高</th>
                                        <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">当期純利益</th>
                                        <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">主な経費カテゴリ</th>
                                        <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider text-right">操作</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {settlements.map((s) => (
                                        <tr key={s.id} className="hover:bg-surface-highlight/30 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                        {s.year.toString().slice(-2)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-text-main">{s.year}年度</div>
                                                        <div className="text-xs text-text-muted">登録日: {new Date(s.created_at || '').toLocaleDateString()}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-bold">{formatCurrency(s.revenue)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className={`font-bold ${s.net_income >= 0 ? 'text-success' : 'text-red-500'}`}>
                                                    {formatCurrency(s.net_income)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {s.category_breakdown?.slice(0, 2).map((cat, i) => (
                                                        <span key={i} className="px-2 py-0.5 rounded-full bg-surface-highlight text-[10px] font-medium border border-border">
                                                            {cat.category}
                                                        </span>
                                                    ))}
                                                    {s.category_breakdown?.length > 2 && (
                                                        <span className="text-[10px] text-text-muted">+{s.category_breakdown.length - 2}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedSettlement(s);
                                                            setIsImportModalOpen(true);
                                                        }}
                                                        className="p-2 text-text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                                        title="編集"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(s.id, s.year)}
                                                        className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                                        title="削除"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Information Card */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10 rounded-2xl p-6">
                        <TrendingUp className="w-8 h-8 text-primary mb-4" />
                        <h4 className="font-bold mb-2">引継ぎのメリット</h4>
                        <p className="text-sm text-text-muted leading-relaxed">
                            前期の数値を登録すると、今期の収支との比較分析が可能になり、経営の健全性をより深く理解できます。
                        </p>
                    </div>
                    <div className="bg-gradient-to-br from-success/5 to-primary/5 border border-success/10 rounded-2xl p-6">
                        <CheckCircle className="w-8 h-8 text-success mb-4" />
                        <h4 className="font-bold mb-2">自動転記の連携</h4>
                        <p className="text-sm text-text-muted leading-relaxed">
                            決算書PDFからAIが自動で数値を抽出するため、手入力の手間を最小限に抑えられます。
                        </p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-500/5 to-red-500/5 border border-amber-500/10 rounded-2xl p-6">
                        <AlertCircle className="w-8 h-8 text-amber-500 mb-4" />
                        <h4 className="font-bold mb-2">正確な申告準備</h4>
                        <p className="text-sm text-text-muted leading-relaxed">
                            貸借対照表の期末残高が翌期首残高として正しく引き継がれているか確認するのにも役立ちます。
                        </p>
                    </div>
                </div>

                {/* Import Modal */}
                <PreviousYearImportModal
                    isOpen={isImportModalOpen}
                    onClose={() => {
                        setIsImportModalOpen(false);
                        setSelectedSettlement(null);
                    }}
                    userId={user?.id || ''}
                    businessType={businessType}
                    onImportSuccess={() => {
                        fetchSettlements();
                        setIsImportModalOpen(false);
                    }}
                />
            </main>
        </div>
    );
};

export default YearlySettlementHistory;
