import React, { useState } from 'react';
import { X, Upload, MessageSquare, Edit3, Camera, Sparkles, CheckCircle2 } from 'lucide-react';
import TransactionForm from './TransactionForm';
import { useTransactions } from '../hooks/useTransactions';
import { useAuth } from '../hooks/useAuth';
import { useBusinessTypeContext } from '../context/BusinessTypeContext';

interface OmniEntryPortalProps {
    onClose: () => void;
    onSuccess?: () => void;
}

type EntryMode = 'manual' | 'ocr' | 'ai';

const OmniEntryPortal: React.FC<OmniEntryPortalProps> = ({ onClose, onSuccess }) => {
    const [mode, setMode] = useState<EntryMode>('manual');
    const { user } = useAuth();
    const { currentBusinessType } = useBusinessTypeContext();
    const { createTransaction } = useTransactions(user?.id, currentBusinessType?.business_type);
    const [isProcessing, setIsProcessing] = useState(false);

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
            alert('取引の作成に失敗しました。');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsProcessing(true);
        // 実際にはOCRサービスを呼び出すが、ここではデモ用にpending状態で作成
        // (将来的にReceiptProcessingのロジックと統合)
        setTimeout(() => {
            setIsProcessing(false);
            alert('レシートを読み取りました。「インボックス」で内容を確認してください。');
            onSuccess?.();
            onClose();
        }, 2000);
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
                <div className="flex border-b border-border p-1 bg-surface-highlight/30 m-6 rounded-xl">
                    <button
                        onClick={() => setMode('manual')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === 'manual' ? 'bg-surface text-primary shadow-sm border border-border' : 'text-text-muted hover:text-text-main'
                            }`}
                    >
                        <Edit3 className="w-4 h-4" />
                        手入力
                    </button>
                    <button
                        onClick={() => setMode('ocr')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === 'ocr' ? 'bg-surface text-primary shadow-sm border border-border' : 'text-text-muted hover:text-text-main'
                            }`}
                    >
                        <Camera className="w-4 h-4" />
                        レシート
                    </button>
                    <button
                        onClick={() => setMode('ai')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === 'ai' ? 'bg-surface text-primary shadow-sm border border-border' : 'text-text-muted hover:text-text-main'
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
                        <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl bg-surface/30">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                <Upload className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold text-text-main mb-2">レシート・PDFをアップロード</h3>
                            <p className="text-sm text-text-muted mb-6 text-center max-w-xs">
                                画像をドロップするか、ファイルを選択してください。<br />AIが自動で内容を読み取ります。
                            </p>
                            <label className="btn-primary cursor-pointer">
                                ファイルを選択
                                <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,application/pdf" />
                            </label>
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
                            <div className="w-full flex gap-2">
                                <input
                                    type="text"
                                    placeholder="メッセージを入力..."
                                    className="input-base flex-1"
                                />
                                <button className="btn-primary">送信</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer info for Inbox */}
                <div className="p-4 bg-surface-highlight/50 border-t border-border flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs text-text-muted">OCRやAIで入力したデータは「インボックス」で確認・修正できます</span>
                </div>
            </div>
        </div>
    );
};

export default OmniEntryPortal;
