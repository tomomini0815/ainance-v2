import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowLeft,
    FileText,
    Plus,
    Trash2,
    Edit,
    TrendingUp,
    Search,
    Filter,
    CheckCircle,
    AlertCircle,
    Download,
    FileCheck,
    Clock,
    Layout
} from 'lucide-react';
import { yearlySettlementService, YearlySettlement } from '../services/yearlySettlementService';
import { yearlyBalanceSheetService, YearlyBalanceSheet } from '../services/yearlyBalanceSheetService';
import { storageService } from '../services/storageService';
import { useAuth } from '../hooks/useAuth';
import { useBusinessTypeContext } from '../context/BusinessTypeContext';
import PreviousYearImportModal from '../components/PreviousYearImportModal';
import BalanceSheetImportModal from '../components/BalanceSheetImportModal';
import toast from 'react-hot-toast';

interface YearlyHistoryItem {
    year: number;
    pl?: YearlySettlement;
    bs?: YearlyBalanceSheet;
}

const YearlySettlementHistory: React.FC = () => {
    const { user } = useAuth();
    const { currentBusinessType } = useBusinessTypeContext();
    const [historyItems, setHistoryItems] = useState<YearlyHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPLModalOpen, setIsPLModalOpen] = useState(false);
    const [isBSModalOpen, setIsBSModalOpen] = useState(false);
    const [selectedSettlement, setSelectedSettlement] = useState<YearlySettlement | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const businessType = currentBusinessType?.business_type || 'individual';
    const businessLabel = businessType === 'corporation' ? '法人' : '個人事業主';

    const fetchHistory = async () => {
        if (!user?.id) return;
        setIsLoading(true);
        try {
            const [plData, bsData] = await Promise.all([
                yearlySettlementService.getAllByBusinessType(user.id, businessType),
                yearlyBalanceSheetService.getAllByBusinessType(user.id, businessType)
            ]);

            // 年度でグループ化
            const years = Array.from(new Set([
                ...plData.map(d => d.year),
                ...bsData.map(d => d.year)
            ])).sort((a, b) => b - a);

            const items: YearlyHistoryItem[] = years.map(year => ({
                year,
                pl: plData.find(d => d.year === year),
                bs: bsData.find(d => d.year === year)
            }));

            setHistoryItems(items);
        } catch (error) {
            console.error('Error fetching history:', error);
            toast.error('データの取得に失敗しました');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [user?.id, businessType]);

    const handleDelete = async (item: YearlyHistoryItem) => {
        if (!window.confirm(`${item.year}年度の全データを削除してもよろしいですか？`)) return;

        try {
            if (item.pl) await yearlySettlementService.delete(item.pl.id);
            if (item.bs) await yearlyBalanceSheetService.delete(item.bs.id);
            toast.success(`${item.year}年度のデータを削除しました`);
            fetchHistory();
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('削除に失敗しました');
        }
    };

    const handleToggleStatus = async (item: YearlyHistoryItem) => {
        // 全体のステータスを決定（両方あれば両方がconfirmedならconfirmed、そうでなければdraftに切り替える想定）
        // シンプルに「現在の状態と反対にする」
        const currentStatus = item.pl?.status || item.bs?.status || 'draft';
        const newStatus = currentStatus === 'confirmed' ? 'draft' : 'confirmed';

        try {
            const promises = [];
            if (item.pl) promises.push(yearlySettlementService.updateStatus(item.pl.id, newStatus));
            if (item.bs) promises.push(yearlyBalanceSheetService.updateStatus(item.bs.id, newStatus));

            await Promise.all(promises);
            toast.success(`ステータスを${newStatus === 'confirmed' ? '確定' : '下書き'}に変更しました`);
            fetchHistory();
        } catch (error) {
            console.error('Status update error:', error);
            toast.error('ステータスの更新に失敗しました');
        }
    };

    const handleDownload = async (path: string | undefined) => {
        if (!path) return;
        try {
            const url = await storageService.getSignedUrl(path);
            if (url) {
                window.open(url, '_blank');
            } else {
                toast.error('ファイルの取得に失敗しました');
            }
        } catch (error) {
            console.error('Download error:', error);
            toast.error('ダウンロード中にエラーが発生しました');
        }
    };

    const formatCurrency = (amount: number | undefined) => {
        if (amount === undefined) return '-';
        return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount);
    };

    const filteredItems = useMemo(() => {
        if (!searchQuery) return historyItems;
        const q = searchQuery.toLowerCase();
        return historyItems.filter(item =>
            item.year.toString().includes(q) ||
            item.pl?.revenue.toString().includes(q) ||
            item.pl?.net_income.toString().includes(q)
        );
    }, [historyItems, searchQuery]);

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
                                <Layout className="w-7 h-7 text-primary" />
                                過去決算データ・引継ぎ管理
                            </h1>
                            <p className="text-text-muted mt-1">
                                {businessLabel}としての過去の決算履歴を確認・管理できます
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setIsBSModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-surface border border-primary/20 text-primary rounded-xl hover:bg-primary/5 transition-all font-bold"
                        >
                            <Plus className="w-5 h-5" />
                            貸借対照表(B/S)追加
                        </button>
                        <button
                            onClick={() => setIsPLModalOpen(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 font-bold"
                        >
                            <Plus className="w-5 h-5" />
                            損益計算書(P/L)追加
                        </button>
                    </div>
                </div>

                {/* Filters/Actions Bar */}
                <div className="bg-surface border border-border rounded-2xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input
                                type="text"
                                placeholder="年度や金額で検索..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm"
                            />
                        </div>
                        <button className="flex items-center gap-2 px-3 py-2 bg-surface-highlight rounded-xl text-sm font-medium hover:bg-border transition-colors border border-border">
                            <Filter className="w-4 h-4" />
                            フィルター
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-text-muted mr-2">全 {filteredItems.length} 年度分</span>
                    </div>
                </div>

                {/* Main Table */}
                <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
                    {isLoading ? (
                        <div className="p-12 text-center group">
                            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-text-muted">読み込み中...</p>
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="bg-surface-highlight w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-10 h-10 text-text-muted" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">履歴がありません</h3>
                            <p className="text-text-muted mb-6">
                                過去の決算書をアップロードするか、手動で入力して<br />
                                前期からの数値引き継ぎや経営分析を可能にしましょう。
                            </p>
                            <div className="flex justify-center gap-4">
                                <button onClick={() => setIsPLModalOpen(true)} className="btn-primary px-8 py-3 rounded-xl font-bold">P/Lを登録</button>
                                <button onClick={() => setIsBSModalOpen(true)} className="btn-ghost px-8 py-3 rounded-xl font-bold border border-border">B/Sを登録</button>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-surface-highlight/50 border-b border-border">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">年度</th>
                                        <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">損益 (P/L)</th>
                                        <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">貸借 (B/S)</th>
                                        <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">書類</th>
                                        <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">状態</th>
                                        <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider text-right">操作</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filteredItems.map((item) => (
                                        <tr key={item.year} className="hover:bg-surface-highlight/30 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                        {item.year.toString().slice(-2)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-text-main">{item.year}年度</div>
                                                        <div className="text-xs text-text-muted">
                                                            P/L: {item.pl ? 'あり' : 'なし'} | B/S: {item.bs ? 'あり' : 'なし'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-xs text-text-muted mb-1">売上: {formatCurrency(item.pl?.revenue)}</div>
                                                <div className={`font-bold ${item.pl && item.pl.net_income >= 0 ? 'text-success' : 'text-red-500'}`}>
                                                    利益: {formatCurrency(item.pl?.net_income)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-xs text-text-muted mb-1">資産: {formatCurrency(item.bs?.assets_total)}</div>
                                                <div className="font-bold text-text-main text-sm">
                                                    純資産: {formatCurrency(item.bs?.net_assets_total)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col gap-1">
                                                    {item.pl?.document_path && (
                                                        <button
                                                            onClick={() => handleDownload(item.pl?.document_path)}
                                                            className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                                                        >
                                                            <Download className="w-3 h-3" /> P/L書類
                                                        </button>
                                                    )}
                                                    {item.bs?.document_path && (
                                                        <button
                                                            onClick={() => handleDownload(item.bs?.document_path)}
                                                            className="flex items-center gap-1.5 text-xs text-secondary hover:underline"
                                                        >
                                                            <Download className="w-3 h-3" /> B/S書類
                                                        </button>
                                                    )}
                                                    {!item.pl?.document_path && !item.bs?.document_path && (
                                                        <span className="text-xs text-text-muted">書類なし</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => handleToggleStatus(item)}
                                                    className={`
                                                        flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all
                                                        ${(item.pl?.status === 'confirmed' || item.bs?.status === 'confirmed')
                                                            ? 'bg-success/10 text-success border border-success/20'
                                                            : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                                        }
                                                    `}
                                                >
                                                    {(item.pl?.status === 'confirmed' || item.bs?.status === 'confirmed') ? (
                                                        <><FileCheck className="w-3 h-3" /> 確定済</>
                                                    ) : (
                                                        <><Clock className="w-3 h-3" /> 下書き</>
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => {
                                                            if (item.pl) {
                                                                setSelectedSettlement(item.pl);
                                                                setIsPLModalOpen(true);
                                                            } else if (item.bs) {
                                                                toast.error('B/Sデータの編集は現在個別に対応予定です');
                                                            }
                                                        }}
                                                        className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-all shadow-sm flex items-center gap-1.5 text-xs font-bold whitespace-nowrap"
                                                        title="編集"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" />
                                                        編集
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item)}
                                                        className="px-3 py-1.5 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all shadow-sm flex items-center gap-1.5 text-xs font-bold whitespace-nowrap"
                                                        title="削除"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                        削除
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

                {/* PL Import Modal */}
                <PreviousYearImportModal
                    isOpen={isPLModalOpen}
                    onClose={() => {
                        setIsPLModalOpen(false);
                        setSelectedSettlement(null);
                    }}
                    userId={user?.id || ''}
                    businessType={businessType}
                    onImportSuccess={() => {
                        fetchHistory();
                        setIsPLModalOpen(false);
                    }}
                    initialData={selectedSettlement}
                />

                {/* BS Import Modal */}
                <BalanceSheetImportModal
                    isOpen={isBSModalOpen}
                    onClose={() => setIsBSModalOpen(false)}
                    userId={user?.id || ''}
                    businessType={businessType}
                    onImportSuccess={() => {
                        fetchHistory();
                        setIsBSModalOpen(false);
                    }}
                />
            </main>
        </div>
    );
};

export default YearlySettlementHistory;
