import React, { useMemo, useState } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { useAuth } from '../hooks/useAuth';
import { useBusinessTypeContext } from '../context/BusinessTypeContext';
import { Check, X, Edit2, AlertCircle, Inbox, Sparkles, Filter, ArrowLeft, Mic } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

const TransactionInbox: React.FC = () => {
    const { user } = useAuth();
    const { currentBusinessType } = useBusinessTypeContext();
    const { transactions, loading, approveTransaction, deleteTransaction, fetchTransactions } = useTransactions(user?.id, currentBusinessType?.business_type);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const pendingTransactions = useMemo(() => {
        return transactions.filter(t => t.approval_status === 'pending');
    }, [transactions]);

    const handleApprove = async (id: string) => {
        setProcessingId(id);
        try {
            const result = await approveTransaction(id);
            if (result.error) throw result.error;
        } catch (error) {
            console.error('Approval failed:', error);
            alert('承認に失敗しました。');
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

    const [isBulkProcessing, setIsBulkProcessing] = useState(false);

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

                    <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
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
                                                <div className="font-medium text-text-main whitespace-nowrap">{t.item}</div>
                                                <div className="text-xs text-text-muted truncate max-w-[200px]">{t.description}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm whitespace-nowrap">
                                                <span className="px-2 py-1 bg-surface-highlight rounded text-text-secondary border border-border whitespace-nowrap">
                                                    {t.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-right font-bold whitespace-nowrap">
                                                <span className={t.type === 'expense' ? 'text-rose-400' : 'text-emerald-400'}>
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
            <div className="mt-8 bg-gradient-to-br from-purple-500/5 to-blue-500/5 border border-border rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    <h3 className="font-semibold text-text-main text-sm">AIからのヒント</h3>
                </div>
                <p className="text-sm text-text-muted leading-relaxed">
                    レシートスキャンやチャットで記録されたデータは、AIが自動で判断しています。
                    内容が不正確な場合は、編集アイコンから正しい情報に修正してから承認してください。
                    (※編集機能は現在開発中です。削除して再入力をお願いします)
                </p>
            </div>
        </div>
    );
};

export default TransactionInbox;
