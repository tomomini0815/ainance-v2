import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import TransactionForm from './TransactionForm';
import { useTransactions } from '../hooks/useTransactions';
import { useAuth } from '../hooks/useAuth';
import { useBusinessTypeContext } from '../context/BusinessTypeContext';

interface OmniEntryPortalProps {
    onClose: () => void;
    onSuccess?: () => void;
}

const OmniEntryPortal: React.FC<OmniEntryPortalProps> = ({ onClose, onSuccess }) => {
    const { user } = useAuth();
    const { currentBusinessType } = useBusinessTypeContext();
    const { createTransaction } = useTransactions(user?.id, currentBusinessType?.business_type);
    const [isProcessing, setIsProcessing] = useState(false);

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

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-border flex items-center justify-between bg-surface/50">
                    <div>
                        <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-primary" />
                            取引を記録する
                        </h2>
                        <p className="text-sm text-text-muted mt-1">取引内容を入力してください</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-surface-highlight transition-colors"
                    >
                        <X className="w-5 h-5 text-text-muted" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
                    <TransactionForm onSubmit={handleManualSubmit} onCancel={onClose} />
                </div>
            </div>
        </div>
    );
};

export default OmniEntryPortal;
