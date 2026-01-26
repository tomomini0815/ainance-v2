import React, { useState, useRef } from 'react';
import { X, MessageSquare, Edit3, Sparkles, CheckCircle2, Calendar, Bot } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import TransactionForm from './TransactionForm';
import { useTransactions } from '../hooks/useTransactions';
import { useAuth } from '../hooks/useAuth';
import { useBusinessTypeContext } from '../context/BusinessTypeContext';
import { parseChatTransactionWithAI } from '../services/geminiAIService';
import { determineCategoryByKeyword } from '../services/keywordCategoryService';

interface OmniEntryPortalProps {
    onClose: () => void;
    onSuccess?: () => void;
}

type EntryMode = 'manual' | 'ai';

const OmniEntryPortal: React.FC<OmniEntryPortalProps> = ({ onClose, onSuccess }) => {
    const [mode, setMode] = useState<EntryMode>('manual');
    const navigate = useNavigate();
    const { user } = useAuth();
    const { currentBusinessType } = useBusinessTypeContext();
    const { createTransaction } = useTransactions(user?.id, currentBusinessType?.business_type);
    const [isProcessing, setIsProcessing] = useState(false);
    const [aiInput, setAiInput] = useState('');
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [isDateManuallySelected, setIsDateManuallySelected] = useState(false);
    const [isContinuousMode, setIsContinuousMode] = useState(false);

    const dateInputRef = useRef<HTMLInputElement>(null);


    console.log('OmniEntryPortal - Render:', {
        hasUser: !!user?.id,
        businessType: currentBusinessType?.business_type,
        mode
    });

    const formatDisplayDate = (dateStr: string) => {
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;

            const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
            const month = d.getMonth() + 1;
            const day = d.getDate();
            const dayOfWeek = dayNames[d.getDay()];

            const todayStr = new Date().toISOString().split('T')[0];
            const yesterdayDate = new Date();
            yesterdayDate.setDate(yesterdayDate.getDate() - 1);
            const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

            let suffix = '';
            if (dateStr === todayStr) suffix = ' (今日)';
            else if (dateStr === yesterdayStr) suffix = ' (昨日)';

            return `${month}月${day}日 (${dayOfWeek})${suffix}`;
        } catch (e) {
            return dateStr;
        }
    };

    const handleManualSubmit = async (data: any) => {
        setIsProcessing(true);
        try {
            const result = await createTransaction({
                ...data,
                tags: [...(data.tags || []), 'manual_created'], // 手動作成タグを追加
                approval_status: 'approved' // 手入力は即時承認扱い
            });
            if (result.error) throw result.error;
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error('Failed to create transaction:', error);
            toast.error('取引の作成に失敗しました。');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleAiSubmit = async () => {
        if (!aiInput.trim() || isProcessing) return;

        // ユーザー認証の再確認
        if (!user?.id) {
            toast.error('ユーザーが認証されていません。再ログインしてください。');
            return;
        }

        const toastId = toast.loading('AIで取引を分析中...');
        setIsProcessing(true);
        try {
            const bType = currentBusinessType?.business_type;
            const uId = user?.id;

            console.log('handleAiSubmit - 開始:', {
                input: aiInput,
                userId: uId,
                businessType: bType
            });

            if (!uId) {
                throw new Error('ユーザー情報の読み取りに失敗しました。再ログインをお試しください。');
            }

            if (!bType) {
                console.error('handleAiSubmit - ビジネスタイプが不明です');
                throw new Error('業態設定（個人/法人）がまだ読み込まれていません。画面を再読み込みしてください。');
            }

            // AIを使用してチャット内容を解析
            const aiData = await parseChatTransactionWithAI(aiInput);

            let transactionData;

            if (aiData) {
                console.log('handleAiSubmit - AI解析結果:', aiData);
                transactionData = {
                    item: aiData.item || 'AIチャット入力',
                    description: aiData.description || aiData.item,
                    amount: aiData.amount,
                    date: isDateManuallySelected ? selectedDate : (aiData.date || selectedDate),
                    category: aiData.category || '未分類',
                    type: aiData.type || 'expense',
                    creator: uId,
                    approval_status: 'pending' as const, // AI入力は一律で「確認待ち」にする
                    tags: ['ai-chat']
                };
            } else {
                // フォールバック（以前のロジック）
                console.warn('handleAiSubmit - AI解析に失敗しました。フォールバックを使用します。');

                let amount = 0;
                const amountTextMatch = aiInput.match(/(\d+(?:[,\d]*\d+)?(?:万|千)?(?:円)?)/);
                if (amountTextMatch) {
                    let text = amountTextMatch[1].replace(/円|,/g, '');
                    if (text.includes('万')) {
                        const parts = text.split('万');
                        amount = (parseFloat(parts[0]) || 0) * 10000;
                        if (parts[1] && parts[1].includes('千')) {
                            amount += (parseFloat(parts[1].replace('千', '')) || 0) * 1000;
                        } else if (parts[1]) {
                            amount += parseFloat(parts[1]) || 0;
                        }
                    } else if (text.includes('千')) {
                        const parts = text.split('千');
                        amount = (parseFloat(parts[0]) || 0) * 1000;
                        if (parts[1]) amount += parseFloat(parts[1]) || 0;
                    } else {
                        amount = parseFloat(text) || 0;
                    }
                }

                if (amount === 0) {
                    const simpleMatch = aiInput.match(/\d+/);
                    if (simpleMatch) amount = parseInt(simpleMatch[0], 10);
                }

                const cleanedItem = aiInput.replace(/(\d+(?:[,\d]*\d+)?(?:万|千)?(?:円)?)/g, '').trim() || 'AIチャット入力';
                const detectedCategory = determineCategoryByKeyword(aiInput) || '未分類';

                transactionData = {
                    item: cleanedItem,
                    description: cleanedItem,
                    amount: amount,
                    date: isDateManuallySelected ? selectedDate : new Date().toISOString().split('T')[0],
                    category: detectedCategory,
                    type: ((detectedCategory === '売上' || detectedCategory === '業務委託収入') ? 'income' : 'expense') as 'income' | 'expense',
                    creator: uId,
                    approval_status: 'pending' as const, // AI入力は一律で「確認待ち」にする
                    tags: ['ai-chat', 'fallback-classification']
                };
            }

            const result = await createTransaction(transactionData);

            console.log('handleAiSubmit - createTransaction結果:', result);

            if (result.error) throw result.error;

            // 入力欄をクリア
            setAiInput('');

            // 成功通知
            const successMsg = 'AIが取引を読み取りました。インボックス（確認待ち）で内容を確認してください。';
            toast.success(successMsg, { id: toastId });

            // ページ全体のデータ再取得をトリガー
            window.dispatchEvent(new CustomEvent('transactionRecorded'));

            onSuccess?.();

            // 連続入力モードでない場合のみ閉じる
            if (!isContinuousMode) {
                onClose();
            } else {
                // 連続入力モードの場合は入力欄にフォーカスを戻す（または維持する）
                console.log('Continuous Mode: Staying open for next entry');
            }
        } catch (error) {
            console.error('Failed to process AI input (OmniEntryPortal):', error);
            const errorMessage = (error as Error).message;
            toast.error('取引の記録に失敗しました: ' + errorMessage, { id: toastId });
        } finally {
            setIsProcessing(false);
        }
    };




    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-surface/50">
                    <div>
                        <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-primary" />
                            取引を記録する
                        </h2>
                        <p className="text-sm text-text-muted mt-1">最適な方法を選んで記帳を開始しましょう</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-surface-highlight transition-colors"
                    >
                        <X className="w-5 h-5 text-text-muted" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border border-white/10 p-1.5 bg-surface-highlight/50 mx-6 mt-6 rounded-2xl shadow-inner mb-2">
                    <button
                        onClick={() => setMode('manual')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all ${mode === 'manual' ? 'bg-surface text-primary shadow-lg border border-white/10 scale-[1.02] z-10' : 'text-text-muted hover:text-text-main hover:bg-white/5'
                            }`}
                    >
                        <Edit3 className="w-4 h-4" />
                        手入力
                    </button>
                    <button
                        onClick={() => setMode('ai')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all ${mode === 'ai' ? 'bg-surface text-primary shadow-lg border border-white/10 scale-[1.02] z-10' : 'text-text-muted hover:text-text-main hover:bg-white/5'
                            }`}
                    >
                        <MessageSquare className="w-4 h-4" />
                        AIチャット
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
                    {mode === 'manual' && (
                        <TransactionForm onSubmit={handleManualSubmit} onCancel={onClose} />
                    )}


                    {mode === 'ai' && (
                        <div className="py-4 sm:py-8 mb-8 flex flex-col items-center justify-center border border-border rounded-2xl bg-gradient-to-br from-primary/5 to-blue-500/5 transition-all">
                            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                <Bot className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold text-text-main mb-2">AIに任せる</h3>
                            <p className="text-sm text-text-muted mb-6 text-center max-w-sm px-4">
                                例：「タクシー代 2500円」と入力すると、AIが自動仕分けします。
                            </p>
                            <div className="w-full max-w-md px-4">
                                <div className="w-full flex flex-col items-center gap-4 mb-4">
                                    {/* Action row with Date and Continuous Toggle */}
                                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm">
                                        {/* Styled Date Display / Toggle */}
                                        <div
                                            className="relative flex-1 group cursor-pointer w-full"
                                            onClick={() => dateInputRef.current?.showPicker?.() || dateInputRef.current?.click()}
                                        >
                                            <div
                                                className="w-full flex items-center justify-between px-4 py-3 bg-surface border border-white/10 rounded-xl text-text-main group-hover:bg-surface-highlight group-hover:border-white/20 transition-all shadow-lg shadow-primary/5"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="p-1.5 bg-primary/10 rounded-lg">
                                                        <Calendar className="w-5 h-5 text-primary" />
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-[9px] text-text-muted font-bold uppercase tracking-wider leading-none mb-1">取引日</p>
                                                        <p className="text-sm font-black leading-none">
                                                            {formatDisplayDate(selectedDate)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Hidden internal input to trigger native picker */}
                                            <input
                                                type="date"
                                                ref={dateInputRef}
                                                value={selectedDate}
                                                onChange={(e) => {
                                                    setSelectedDate(e.target.value);
                                                    setIsDateManuallySelected(true);
                                                }}
                                                className="absolute inset-0 opacity-0 pointer-events-none"
                                            />
                                        </div>

                                        {/* Continuous Mode Toggle moved here */}
                                        <button
                                            onClick={() => setIsContinuousMode(!isContinuousMode)}
                                            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all border whitespace-nowrap min-w-[140px] ${isContinuousMode
                                                ? 'bg-primary/10 text-primary border-primary/30'
                                                : 'bg-surface border-border text-text-muted hover:border-primary/20 hover:text-text-secondary'
                                                }`}
                                        >
                                            <div className={`w-2.5 h-2.5 rounded-full border-2 transition-all ${isContinuousMode ? 'bg-primary border-primary animate-pulse' : 'bg-transparent border-text-muted'
                                                }`} />
                                            連続入力
                                        </button>
                                    </div>

                                    <div className="relative group w-full max-w-sm">
                                        <input
                                            autoFocus
                                            type="text"
                                            value={aiInput}
                                            onChange={(e) => setAiInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAiSubmit()}
                                            placeholder="メッセージを入力..."
                                            className="input-base pr-20 h-12 shadow-sm focus:ring-primary/20 border-primary/30 w-full"
                                            disabled={isProcessing}
                                        />
                                        <button
                                            onClick={handleAiSubmit}
                                            disabled={!aiInput.trim() || isProcessing || !user?.id || !currentBusinessType?.business_type}
                                            className={`absolute right-1 top-1.5 bottom-1.5 px-4 rounded-lg text-sm font-bold transition-all shadow-sm ${aiInput.trim() && !isProcessing && user?.id && currentBusinessType?.business_type
                                                ? 'bg-primary text-white hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/40 active:scale-95'
                                                : 'bg-surface-highlight text-text-muted cursor-not-allowed'
                                                }`}
                                        >
                                            {isProcessing ? (
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (!user?.id || !currentBusinessType?.business_type) ? (
                                                '準備中'
                                            ) : (
                                                '送信'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer info for Inbox */}
                <div className="p-4 bg-surface-highlight/50 border-t border-border flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs text-text-muted">
                        AIチャットで入力したデータは
                        <button
                            onClick={() => {
                                onClose();
                                navigate('/inbox');
                            }}
                            className="text-primary font-bold hover:underline mx-1 outline-none"
                        >
                            確認待ち
                        </button>
                        に保存されます
                    </span>
                </div>
            </div>
        </div>
    );
};

export default OmniEntryPortal;
