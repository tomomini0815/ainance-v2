import React, { useMemo, useState } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { useAuth } from '../hooks/useAuth';
import { useBusinessTypeContext } from '../context/BusinessTypeContext';
import { Check, X, Edit2, AlertCircle, Inbox, Sparkles, Filter, ArrowLeft, Mic, MessageSquare } from 'lucide-react';
import TransactionIcon from '../components/TransactionIcon';
import TransactionForm from '../components/TransactionForm';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import toast from 'react-hot-toast';

const TransactionInbox: React.FC = () => {
    const { user } = useAuth();
    const { currentBusinessType } = useBusinessTypeContext();
    const { transactions, loading, approveTransaction, deleteTransaction, updateTransaction, fetchTransactions } = useTransactions(user?.id, currentBusinessType?.business_type);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [editingTransaction, setEditingTransaction] = useState<any | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const pendingTransactions = useMemo(() => {
        return transactions.filter(t => t.approval_status === 'pending');
    }, [transactions]);

    const handleApprove = async (id: string) => {
        setProcessingId(id);
        try {
            const result = await approveTransaction(id);
            if (result.error) throw result.error;
            toast.success('取引を承認しました！');
        } catch (error: any) {
            console.error('取引の承認に失敗しました:', error);
            toast.error('取引の承認に失敗しました: ' + (error.message || '不明なエラー'));
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (id: string) => {
        if (!window.confirm('この取引を削除しますか？')) return;
        setProcessingId(id);
        try {
            const result = await deleteTransaction(id);
            if (result.error) throw result.error;
        } catch (error) {
            console.error('Rejection failed:', error);
            alert('削除に失敗しました。');
        } finally {
            setProcessingId(null);
        }
    };

    const handleApproveAll = async () => {
        if (!window.confirm(`${pendingTransactions.length}件の取引をすべて承認しますか？`)) return;
        setIsBulkProcessing(true);
        try {
            for (const t of pendingTransactions) {
                await approveTransaction(t.id);
            }
        } finally {
            setIsBulkProcessing(false);
        }
    };

    const handleEditClick = (transaction: any) => {
        setEditingTransaction(transaction);
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async (updatedData: any) => {
        if (!editingTransaction) return;

        try {
            const { id, created_at, updated_at, ...updatePayload } = updatedData;
            const result = await updateTransaction(editingTransaction.id, updatePayload);

            if (result.error) throw result.error;

            toast.success('取引情報を更新しました');
            setIsEditModalOpen(false);
            setEditingTransaction(null);
            fetchTransactions();
        } catch (error: any) {
            console.error('更新エラー:', error);
            toast.error('更新に失敗しました: ' + (error.message || '不明なエラー'));
        }
    };

    const [isBulkProcessing, setIsBulkProcessing] = useState(false);

    // 取引が記録されたときにデータを再取得するイベントリスナー
    React.useEffect(() => {
        const handleRefresh = () => {
            console.log('TransactionInbox - 取引登録イベントを検知、再取得します');
            fetchTransactions();
        };
        window.addEventListener('transactionRecorded', handleRefresh);
        return () => window.removeEventListener('transactionRecorded', handleRefresh);
    }, [fetchTransactions]);

    if (loading && transactions.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => window.history.back()}
                        className="p-2 hover:bg-surface-highlight rounded-full transition-colors"
                        aria-label="戻る"
                    >
                        <ArrowLeft className="w-6 h-6 text-text-muted" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-text-main flex items-center gap-2">
                            <Inbox className="w-6 h-6 text-primary" />
                            インボックス
                        </h1>
                        <p className="text-text-muted mt-1">AI・レシートスキャンで入力された内容を確認してください</p>
                    </div>
                </div>

                {pendingTransactions.length > 0 && (
                    <button
                        onClick={handleApproveAll}
                        disabled={isBulkProcessing}
                        className="btn-primary flex items-center gap-2 whitespace-nowrap"
                    >
                        {isBulkProcessing ? (
                            <Filter className="w-4 h-4 animate-spin" />
                        ) : (
                            <Check className="w-4 h-4" />
                        )}
                        すべて承認する
                    </button>
                )}
            </div>

            {pendingTransactions.length === 0 ? (
                <div className="bg-surface border border-border rounded-2xl p-12 text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-surface-highlight rounded-full flex items-center justify-center mb-4">
                        <Check className="w-8 h-8 text-text-muted" />
                    </div>
                    <h2 className="text-lg font-semibold text-text-main">確認待ちの取引はありません</h2>
                    <p className="text-text-muted mt-2">すべての取引が承認済みです。清々しいですね！</p>
                    <button
                        onClick={() => window.history.back()}
                        className="mt-6 px-6 py-2 bg-surface border border-border rounded-lg text-text-main hover:bg-surface-highlight transition-colors"
                    >
                        ダッシュボードに戻る
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3 mb-6">
                        <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <div className="text-sm text-text-secondary">
                            <span className="font-bold text-primary">{pendingTransactions.length}件</span>の未承認データがあります。内容を確認して、承認ボタンを押すと記帳が確定します。
                        </div>
                    </div>

                    {/* モバイル表示（カードレイアウト） */}
                    <div className="md:hidden space-y-3">
                        {pendingTransactions.map((t) => (
                            <div key={t.id} className="bg-surface border border-border rounded-xl p-4 shadow-sm relative">
                                <div className="flex items-start gap-3 mb-3">
                                    <TransactionIcon item={t.item} category={t.category} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <div className="font-bold text-text-main truncate text-base mb-1">{t.item}</div>
                                                <div className="text-xs text-text-muted">
                                                    {format(new Date(t.date), 'yyyy年M月d日', { locale: ja })}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex justify-end mb-1">
                                                    {t.receipt_url ? (
                                                        <div className="flex items-center gap-1 p-1 bg-purple-100 dark:bg-purple-900/30 rounded text-purple-600 dark:text-purple-400">
                                                            <Sparkles className="w-3 h-3" />
                                                            <span className="text-[10px] font-medium">AI読取</span>
                                                        </div>
                                                    ) : t.tags?.includes('ai-chat') ? (
                                                        <div className="flex items-center gap-1 p-1 bg-indigo-100 dark:bg-indigo-900/30 rounded text-indigo-600 dark:text-indigo-100">
                                                            <MessageSquare className="w-3 h-3" />
                                                            <span className="text-[10px] font-medium text-white">AIチャット</span>
                                                        </div>
                                                    ) : t.tags?.includes('voice') ? (
                                                        <div className="flex items-center gap-1 p-1 bg-blue-100 dark:bg-blue-900/30 rounded text-blue-600 dark:text-blue-400">
                                                            <Mic className="w-3 h-3" />
                                                            <span className="text-[10px] font-medium">音声入力</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded text-gray-600 dark:text-gray-400">
                                                            <Edit2 className="w-3 h-3" />
                                                            <span className="text-[10px] font-medium">手入力</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className={`text-xl font-bold leading-none ${t.type === 'expense' ? 'text-red-500' : 'text-emerald-500'}`}>
                                                    {t.type === 'expense' ? '-' : '+'}¥{Math.abs(t.amount).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-3 gap-2">
                                    <span className="inline-flex items-center px-2 h-5 rounded-full text-[10px] font-medium bg-surface-highlight text-text-secondary border border-border whitespace-nowrap">
                                        {t.category}
                                    </span>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleApprove(t.id)}
                                            disabled={!!processingId}
                                            className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-md active:scale-95"
                                            title="承認"
                                        >
                                            <Check className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleEditClick(t)}
                                            disabled={!!processingId}
                                            className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-md active:scale-95"
                                            title="編集"
                                        >
                                            <Edit2 className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleReject(t.id)}
                                            disabled={!!processingId}
                                            className="w-10 h-10 rounded-full flex items-center justify-center bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-md active:scale-95"
                                            title="削除"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* PC表示（テーブルレイアウト） */}
                    <div className="hidden md:block bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-surface-highlight/30 border-b border-border">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider whitespace-nowrap">日付</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider whitespace-nowrap">入力元</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider whitespace-nowrap">説明・項目</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider whitespace-nowrap">カテゴリ</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider text-right whitespace-nowrap">金額</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider text-center whitespace-nowrap">操作</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {pendingTransactions.map((t) => (
                                        <tr key={t.id} className="hover:bg-surface-highlight/20 transition-colors group">
                                            <td className="px-6 py-4 text-sm text-text-main whitespace-nowrap">
                                                {format(new Date(t.date), 'yyyy/MM/dd', { locale: ja })}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-text-main whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    {t.receipt_url ? (
                                                        <>
                                                            <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-md text-purple-600 dark:text-purple-400">
                                                                <Sparkles className="w-3.5 h-3.5" />
                                                            </div>
                                                            <span className="text-xs font-medium">AI読取</span>
                                                        </>
                                                    ) : t.tags?.includes('ai-chat') ? (
                                                        <>
                                                            <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-md text-indigo-600 dark:text-indigo-400">
                                                                <MessageSquare className="w-3.5 h-3.5" />
                                                            </div>
                                                            <span className="text-xs font-medium">AIチャット</span>
                                                        </>
                                                    ) : t.tags?.includes('voice') ? (
                                                        <>
                                                            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-md text-blue-600 dark:text-blue-400">
                                                                <Mic className="w-3.5 h-3.5" />
                                                            </div>
                                                            <span className="text-xs font-medium">音声入力</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-md text-gray-600 dark:text-gray-400">
                                                                <Edit2 className="w-3.5 h-3.5" />
                                                            </div>
                                                            <span className="text-xs font-medium">手入力</span>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <TransactionIcon item={t.item} category={t.category} size="sm" />
                                                    <div className="flex flex-col overflow-hidden">
                                                        {t.description && t.description !== t.item ? (
                                                            <>
                                                                <div className="font-bold text-text-main text-sm truncate max-w-[200px]" title={t.description}>
                                                                    {t.description}
                                                                </div>
                                                                <div className="text-xs text-text-muted truncate max-w-[200px]" title={t.item}>
                                                                    {t.item}
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div className="font-medium text-text-main whitespace-nowrap">{t.item}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm whitespace-nowrap">
                                                <span className="px-2 py-1 bg-surface-highlight rounded text-text-secondary border border-border whitespace-nowrap">
                                                    {t.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-right font-bold whitespace-nowrap">
                                                <span className={t.type === 'expense' ? 'text-red-500' : 'text-emerald-500'}>
                                                    {t.type === 'expense' ? '-' : '+'}¥{Math.abs(t.amount).toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleApprove(t.id)}
                                                        disabled={!!processingId}
                                                        className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition-all shadow-sm flex items-center gap-1 text-xs whitespace-nowrap"
                                                        title="承認する"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                        承認
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditClick(t)}
                                                        disabled={!!processingId}
                                                        className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-all shadow-sm flex items-center gap-1 text-xs whitespace-nowrap"
                                                        title="編集する"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                        編集
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(t.id)}
                                                        disabled={!!processingId}
                                                        className="p-2 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all shadow-sm flex items-center gap-1 text-xs whitespace-nowrap"
                                                        title="削除する"
                                                    >
                                                        <X className="w-4 h-4" />
                                                        削除
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* AI Tips */}

            {/* 編集モーダル */}
            {isEditModalOpen && editingTransaction && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-surface border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-border flex justify-between items-center sticky top-0 bg-surface/95 backdrop-blur z-10">
                            <h3 className="text-xl font-bold text-text-main flex items-center gap-2">
                                <Edit2 className="w-5 h-5 text-primary" />
                                取引情報の編集
                            </h3>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="p-2 hover:bg-surface-highlight rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-text-muted" />
                            </button>
                        </div>
                        <div className="p-6">
                            <TransactionForm
                                transaction={editingTransaction}
                                onSubmit={handleEditSubmit}
                                onCancel={() => setIsEditModalOpen(false)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransactionInbox;
