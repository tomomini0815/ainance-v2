import React, { useState, useRef } from 'react';
import { X, Upload, MessageSquare, Edit3, Camera, Sparkles, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import TransactionForm from './TransactionForm';
import { useTransactions } from '../hooks/useTransactions';
import { useAuth } from '../hooks/useAuth';
import { useBusinessTypeContext } from '../context/BusinessTypeContext';
import { supabase } from '../lib/supabaseClient';
import { parseChatTransactionWithAI, analyzeReceiptWithVision, AIReceiptAnalysis } from '../services/geminiAIService';

interface OmniEntryPortalProps {
    onClose: () => void;
    onSuccess?: () => void;
}

type EntryMode = 'manual' | 'ocr' | 'ai';

const OmniEntryPortal: React.FC<OmniEntryPortalProps> = ({ onClose, onSuccess }) => {
    const [mode, setMode] = useState<EntryMode>('manual');
    const navigate = useNavigate();
    const { user } = useAuth();
    const { currentBusinessType } = useBusinessTypeContext();
    const { createTransaction } = useTransactions(user?.id, currentBusinessType?.business_type);
    const [isProcessing, setIsProcessing] = useState(false);
    const [aiInput, setAiInput] = useState('');
    const [analysisResult, setAnalysisResult] = useState<AIReceiptAnalysis | null>(null);
    const [capturedImageUrl, setCapturedImageUrl] = useState<string | null>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    console.log('OmniEntryPortal - Render:', {
        hasUser: !!user?.id,
        businessType: currentBusinessType?.business_type,
        mode
    });

    const handleManualSubmit = async (data: any) => {
        setIsProcessing(true);
        try {
            const result = await createTransaction({
                ...data,
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
                    date: aiData.date || new Date().toISOString().split('T')[0],
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

                transactionData = {
                    item: cleanedItem,
                    description: cleanedItem,
                    amount: amount,
                    date: new Date().toISOString().split('T')[0],
                    category: '未分類',
                    type: 'expense' as const,
                    creator: uId,
                    approval_status: 'pending' as const, // AI入力は一律で「確認待ち」にする
                    tags: ['ai-chat']
                };
            }

            const result = await createTransaction(transactionData);

            console.log('handleAiSubmit - createTransaction結果:', result);

            if (result.error) throw result.error;

            // 入力欄をクリア
            setAiInput('');

            // 成功通知とクローズ
            const successMsg = 'AIが取引を読み取りました。インボックス（確認待ち）で内容を確認してください。';

            toast.success(successMsg, { id: toastId });

            // ページ全体のデータ再取得をトリガー
            window.dispatchEvent(new CustomEvent('transactionRecorded'));

            onSuccess?.();
            onClose();
        } catch (error) {
            console.error('Failed to process AI input (OmniEntryPortal):', error);
            const errorMessage = (error as Error).message;
            toast.error('取引の記録に失敗しました: ' + errorMessage, { id: toastId });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement> | { target: { files: FileList | null } }) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];
        const toastId = toast.loading('レシートを解析中...');
        setIsProcessing(true);

        try {
            if (!user?.id) throw new Error('ユーザーが認証されていません。');

            // 1. Base64に変換してAI分析 (Gemini Vision)
            const reader = new FileReader();
            const base64Promise = new Promise<string>((resolve) => {
                reader.onload = () => resolve(reader.result as string);
                reader.readAsDataURL(file);
            });
            const base64Image = await base64Promise;
            setCapturedImageUrl(base64Image);

            const aiAnalysis = await analyzeReceiptWithVision(base64Image);

            if (aiAnalysis) {
                setAnalysisResult(aiAnalysis);
                toast.success('分析が完了しました。内容を確認してください。', { id: toastId });
            } else {
                throw new Error('AIによる解析に失敗しました。');
            }

            // 2. Supabase Storageにアップロード
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}.${fileExt}`;
            const { data: _uploadData, error: uploadError } = await supabase.storage
                .from('receipts')
                .upload(fileName, file);

            if (uploadError) console.warn('Storage upload error:', uploadError);

        } catch (error: any) {
            console.error('Failed to process receipt:', error);
            toast.error('解析に失敗しました: ' + (error.message || '不明なエラー'), { id: toastId });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleConfirmAnalysis = async () => {
        if (!analysisResult || !user?.id) return;

        const toastId = toast.loading('取引を登録中...');
        setIsProcessing(true);

        try {
            const transactionData = {
                item: analysisResult.storeName || 'レシート入力',
                description: `${analysisResult.storeName} (${analysisResult.storeCategory || ''})`,
                amount: analysisResult.totalAmount || 0,
                date: analysisResult.date || new Date().toISOString().split('T')[0],
                category: analysisResult.classification?.category || '未分類',
                type: 'expense' as const,
                creator: user.id,
                approval_status: currentBusinessType?.business_type === 'corporation' ? 'pending' : 'approved' as any,
                tags: ['ocr', 'vision-ai']
            };

            const result = await createTransaction(transactionData);
            if (result.error) throw result.error;

            toast.success('取引を登録しました。', { id: toastId });

            window.dispatchEvent(new CustomEvent('transactionRecorded'));
            onSuccess?.();
            onClose();
        } catch (error: any) {
            console.error('Final registration error:', error);
            toast.error('登録に失敗しました: ' + error.message, { id: toastId });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCameraCapture = () => {
        if (cameraInputRef.current) {
            cameraInputRef.current.click();
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
                        onClick={() => setMode('ocr')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all ${mode === 'ocr' ? 'bg-surface text-primary shadow-lg border border-white/10 scale-[1.02] z-10' : 'text-text-muted hover:text-text-main hover:bg-white/5'
                            }`}
                    >
                        <Camera className="w-4 h-4" />
                        レシート
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

                    {mode === 'ocr' && (
                        <div className="flex flex-col gap-6">
                            {!analysisResult ? (
                                <div className="py-8 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl bg-surface/30 px-4">
                                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                        <Camera className="w-8 h-8 text-primary" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-text-main mb-2 text-center">レシートを撮影・アップロード</h3>
                                    <p className="text-sm text-text-muted mb-6 text-center max-w-xs">
                                        カメラで撮影するか、ファイルを選択してください。<br />AIが自動で内容を読み取ります。
                                    </p>

                                    <div className="flex flex-col gap-3 w-full max-w-sm px-2">
                                        <input
                                            type="file"
                                            ref={cameraInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            capture="environment"
                                            onChange={handleFileUpload}
                                        />
                                        <button
                                            onClick={handleCameraCapture}
                                            disabled={isProcessing}
                                            className="w-full btn-primary flex items-center justify-center gap-2 py-4 rounded-xl text-base font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
                                        >
                                            <Camera className="w-5 h-5" />
                                            カメラで撮影
                                        </button>
                                        <label className="w-full flex items-center justify-center gap-2 py-4 bg-surface border border-border rounded-xl text-base font-bold text-text-main hover:bg-surface-highlight transition-all cursor-pointer hover:border-primary/30">
                                            <Upload className="w-5 h-5" />
                                            ファイルを選択
                                            <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,application/pdf" disabled={isProcessing} />
                                        </label>
                                    </div>
                                </div>
                            ) : (
                                <div className="animate-in slide-in-from-bottom-4 duration-300">
                                    <div className="bg-surface-highlight/30 rounded-2xl border border-border overflow-hidden">
                                        <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border">
                                            {/* Preview Image */}
                                            {capturedImageUrl && (
                                                <div className="md:w-1/3 h-48 md:h-auto bg-black flex items-center justify-center">
                                                    <img src={capturedImageUrl} alt="Receipt Preview" className="max-h-full object-contain" />
                                                </div>
                                            )}

                                            {/* Result Info */}
                                            <div className="flex-1 p-5 space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] uppercase tracking-wider text-text-muted font-bold">店舗名</label>
                                                        <input
                                                            type="text"
                                                            value={analysisResult.storeName}
                                                            onChange={(e) => setAnalysisResult({ ...analysisResult, storeName: e.target.value })}
                                                            className="w-full bg-transparent border-b border-border py-1 text-sm font-medium focus:border-primary transition-colors outline-none"
                                                        />
                                                    </div>
                                                    <div className="space-y-1 text-right">
                                                        <label className="text-[10px] uppercase tracking-wider text-text-muted font-bold">日付</label>
                                                        <input
                                                            type="date"
                                                            value={analysisResult.date}
                                                            onChange={(e) => setAnalysisResult({ ...analysisResult, date: e.target.value })}
                                                            className="w-full bg-transparent border-b border-border py-1 text-sm font-medium focus:border-primary transition-colors outline-none text-right"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="pt-2">
                                                    <label className="text-[10px] uppercase tracking-wider text-text-muted font-bold">合計金額</label>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-2xl font-black text-primary">¥</span>
                                                        <input
                                                            type="number"
                                                            value={analysisResult.totalAmount}
                                                            onChange={(e) => setAnalysisResult({ ...analysisResult, totalAmount: parseInt(e.target.value) || 0 })}
                                                            className="w-full bg-transparent border-b border-border py-1 text-3xl font-black focus:border-primary transition-colors outline-none"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="pt-2">
                                                    <label className="text-[10px] uppercase tracking-wider text-text-muted font-bold">勘定科目（カテゴリ）</label>
                                                    <div className="mt-1">
                                                        <select
                                                            value={analysisResult.classification?.category || '未分類'}
                                                            onChange={(e) => setAnalysisResult({
                                                                ...analysisResult,
                                                                classification: {
                                                                    ...(analysisResult.classification || {
                                                                        category: '未分類',
                                                                        accountTitle: '未分類',
                                                                        confidence: 1,
                                                                        reasoning: '手動変更',
                                                                        taxDeductible: true
                                                                    }),
                                                                    category: e.target.value
                                                                }
                                                            })}
                                                            className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm font-bold text-primary focus:border-primary outline-none appearance-none cursor-pointer hover:bg-surface-highlight transition-all"
                                                        >
                                                            <option value="売上">売上</option>
                                                            <option value="仕入">仕入</option>
                                                            <option value="消耗品費">消耗品費</option>
                                                            <option value="旅費交通費">旅費交通費</option>
                                                            <option value="接待交際費">接待交際費</option>
                                                            <option value="通信費">通信費</option>
                                                            <option value="水道光熱費">水道光熱費</option>
                                                            <option value="会議費">会議費</option>
                                                            <option value="福利厚生費">福利厚生費</option>
                                                            <option value="外注費">外注費</option>
                                                            <option value="広告宣伝費">広告宣伝費</option>
                                                            <option value="地代家賃">地代家賃</option>
                                                            <option value="支払手数料">支払手数料</option>
                                                            <option value="雑費">雑費</option>
                                                            <option value="未分類">未分類</option>
                                                        </select>
                                                        <p className="text-[10px] text-text-muted mt-1 ml-1">AI信頼度: {Math.round((analysisResult.classification?.confidence || 0) * 100)}%</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-surface-highlight border-t border-border flex flex-col gap-3">
                                            <button
                                                onClick={handleConfirmAnalysis}
                                                disabled={isProcessing}
                                                className="w-full py-5 bg-primary text-surface rounded-2xl text-lg font-black hover:bg-primary-hover shadow-xl shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-3"
                                            >
                                                {isProcessing ? <div className="w-5 h-5 border-2 border-surface/30 border-t-surface rounded-full animate-spin" /> : <Sparkles className="w-5 h-5" />}
                                                確定して登録
                                            </button>
                                            <button
                                                onClick={() => setAnalysisResult(null)}
                                                className="w-full py-2 px-4 rounded-xl text-xs font-bold text-text-muted hover:bg-white/5 transition-all outline-none"
                                            >
                                                撮り直す
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {mode === 'ai' && (
                        <div className="py-12 flex flex-col items-center justify-center border border-border rounded-2xl bg-gradient-to-br from-purple-500/5 to-blue-500/5">
                            <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mb-4">
                                <Sparkles className="w-8 h-8 text-purple-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-text-main mb-2">AIに任せる</h3>
                            <p className="text-sm text-text-muted mb-6 text-center max-w-sm">
                                「今日のお昼代 1200円 経費で」<br />のように入力するだけで、AIが自動で仕訳します。
                            </p>
                            <div className="w-full max-w-md relative group px-4">
                                <input
                                    autoFocus
                                    type="text"
                                    value={aiInput}
                                    onChange={(e) => setAiInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAiSubmit()}
                                    placeholder="メッセージを入力..."
                                    className="input-base pr-20 h-12 shadow-sm focus:ring-purple-500/20 border-purple-500/30"
                                    disabled={isProcessing}
                                />
                                <button
                                    onClick={handleAiSubmit}
                                    disabled={!aiInput.trim() || isProcessing || !user?.id || !currentBusinessType?.business_type}
                                    className={`absolute right-5 top-1.5 bottom-1.5 px-4 rounded-lg text-sm font-bold transition-all shadow-sm ${aiInput.trim() && !isProcessing && user?.id && currentBusinessType?.business_type
                                        ? 'bg-purple-600 text-white hover:bg-purple-700 hover:shadow-lg hover:shadow-purple-500/40 active:scale-95'
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
                    )}
                </div>

                {/* Footer info for Inbox */}
                <div className="p-4 bg-surface-highlight/50 border-t border-border flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs text-text-muted">
                        OCRやAIで入力したデータは
                        <button
                            onClick={() => {
                                onClose();
                                navigate('/inbox');
                            }}
                            className="text-primary font-bold hover:underline mx-1 outline-none"
                        >
                            「インボックス」
                        </button>
                        に保存されます
                    </span>
                </div>
            </div>
        </div>
    );
};

export default OmniEntryPortal;
