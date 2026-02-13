import React, { useState, useRef } from 'react';
import {
    X,
    Upload,
    FileText,
    AlertCircle,
    Save,
    Loader2
} from 'lucide-react';
import { analyzeBSDocumentWithVision } from '../services/geminiAIService';
import { yearlyBalanceSheetService, YearlyBalanceSheet } from '../services/yearlyBalanceSheetService';
import toast from 'react-hot-toast';

interface BalanceSheetImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    businessType: 'individual' | 'corporation';
    onImportSuccess: () => void;
}

const BalanceSheetImportModal: React.FC<BalanceSheetImportModalProps> = ({
    isOpen,
    onClose,
    userId,
    businessType,
    onImportSuccess
}) => {
    const [activeTab, setActiveTab] = useState<'upload' | 'manual'>('upload');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 編集用データ (貸借対照表)
    const [formData, setFormData] = useState<Omit<YearlyBalanceSheet, 'id' | 'created_at' | 'updated_at'>>({
        user_id: userId,
        business_type: businessType,
        year: new Date().getFullYear() - 1,
        assets_current_cash: 0,
        assets_current_total: 0,
        assets_total: 0,
        liabilities_total: 0,
        net_assets_capital: 0,
        net_assets_retained_earnings: 0,
        net_assets_retained_earnings_total: 0,
        net_assets_shareholders_equity: 0,
        net_assets_total: 0,
        liabilities_and_net_assets_total: 0,
        metadata: {}
    });

    if (!isOpen) return null;

    const processFile = async (file: File) => {
        if (!file) return;
        const isImage = file.type.startsWith('image/');
        const isPdf = file.type === 'application/pdf';

        if (!isImage && !isPdf) {
            toast.error('画像またはPDFファイルを選択してください');
            return;
        }

        setIsAnalyzing(true);
        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = reader.result as string;
                const result = await analyzeBSDocumentWithVision(base64);

                if (result) {
                    const bsData = yearlyBalanceSheetService.mapAiResultToBS(
                        result,
                        userId,
                        businessType,
                        { fileName: file.name }
                    );
                    setFormData(bsData);
                    setActiveTab('manual');
                    toast.success('解析が完了しました。内容を確認してください。');
                } else {
                    toast.error('解析に失敗しました。数値を直接入力してください。');
                    setActiveTab('manual');
                }
                setIsAnalyzing(false);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('BS Analysis Error:', error);
            toast.error('解析中にエラーが発生しました');
            setIsAnalyzing(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault(); e.stopPropagation();
        if (!isAnalyzing) setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault(); e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault(); e.stopPropagation();
        setIsDragging(false);
        if (!isAnalyzing) {
            const file = e.dataTransfer.files?.[0];
            if (file) processFile(file);
        }
    };

    const handleInputChange = (field: keyof typeof formData, value: any) => {
        let numVal = typeof value === 'string' ? parseInt(value) || 0 : value;
        setFormData(prev => ({ ...prev, [field]: numVal }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await yearlyBalanceSheetService.save(formData);
            toast.success('貸借対照表を保存しました');
            onImportSuccess();
            onClose();
        } catch (error) {
            console.error('Save BS Error:', error);
            toast.error('保存に失敗しました');
        } finally {
            setIsSaving(false);
        }
    };

    // 金額のフォーマット表示
    const formatCurrency = (num: number) => {
        const isNeg = num < 0;
        const absNum = Math.abs(num);
        return (isNeg ? '△' : '') + absNum.toLocaleString();
    };

    /**
     * BSフォームの各行を描画するサブコンポーネント
     */
    const RenderBSField = ({
        label,
        value,
        onChange,
        indent = false,
        indentPlus = false,
        isBold = false,
        isTotal = false
    }: {
        label: string,
        value: number,
        onChange: (val: number) => void,
        indent?: boolean,
        indentPlus?: boolean,
        isBold?: boolean,
        isTotal?: boolean
    }) => {
        const [isEditing, setIsEditing] = useState(false);
        const [editValue, setEditValue] = useState(value.toString());

        const handleBlur = () => {
            setIsEditing(false);
            onChange(parseInt(editValue) || 0);
        };

        const handleFocus = () => {
            setEditValue(value.toString());
            setIsEditing(true);
        };

        const displayValue = formatCurrency(value);

        return (
            <div className={`flex justify-between items-end border-b ${isTotal ? 'border-zinc-800 border-b-2' : 'border-zinc-200'} py-1.5 group transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50`}>
                <div className={`${indent ? 'pl-4' : indentPlus ? 'pl-8' : ''} ${isBold ? 'font-bold' : 'text-zinc-700 dark:text-zinc-300'} text-sm`}>
                    {label}
                </div>
                <div className="w-36 text-right relative">
                    {isEditing ? (
                        <input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={handleBlur}
                            autoFocus
                            className="w-full bg-white dark:bg-zinc-800 border-b-2 border-primary text-right outline-none font-mono py-0.5 px-1 rounded-t-sm shadow-sm"
                        />
                    ) : (
                        <div
                            onClick={handleFocus}
                            className={`w-full cursor-text text-right font-mono text-sm ${isBold ? 'font-bold text-zinc-900 dark:text-zinc-50' : 'text-zinc-800 dark:text-zinc-200'} ${value < 0 ? 'text-error' : ''} py-0.5 px-1 hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50 rounded transition-colors`}
                        >
                            {displayValue}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // バランスチェック
    const isUnbalanced = formData.assets_total !== formData.liabilities_and_net_assets_total;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-surface w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-border animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface-highlight">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="text-lg font-bold text-text-main">貸借対照表（BS）のインポート</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-5 h-5 text-text-muted" />
                    </button>
                </div>

                <div className="flex border-b border-border">
                    <button onClick={() => setActiveTab('upload')} className={`flex-1 py-3 text-sm font-medium border-b-2 ${activeTab === 'upload' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-text-muted'}`}>
                        AI解析
                    </button>
                    <button onClick={() => setActiveTab('manual')} className={`flex-1 py-3 text-sm font-medium border-b-2 ${activeTab === 'manual' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-text-muted'}`}>
                        BSフォーム入力
                    </button>
                </div>

                <div className="p-6 max-h-[75vh] overflow-y-auto bg-white dark:bg-zinc-950">
                    {activeTab === 'upload' ? (
                        <div className="space-y-6">
                            <div
                                onClick={() => !isAnalyzing && fileInputRef.current?.click()}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer ${isAnalyzing ? 'border-primary/50' : isDragging ? 'border-primary bg-primary/10' : 'border-border'}`}
                            >
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,.pdf" />
                                {isAnalyzing ? <Loader2 className="w-10 h-10 animate-spin text-primary" /> : <Upload className="w-10 h-10 text-text-muted" />}
                                <p className="font-bold">{isAnalyzing ? '解析中...' : 'ここにファイルをドロップ'}</p>
                                <button className="btn-primary" disabled={isAnalyzing}>ファイルを選択</button>
                            </div>
                        </div>
                    ) : (
                        <div className="font-serif max-w-lg mx-auto py-8 px-4 text-zinc-900 dark:text-zinc-100">
                            <h2 className="text-2xl text-center mb-2">貸借対照表</h2>
                            <div className="text-center text-sm mb-8 flex items-center justify-center gap-2">
                                <input
                                    type="number"
                                    value={formData.year}
                                    onChange={(e) => handleInputChange('year', e.target.value)}
                                    className="w-20 bg-transparent border-b border-zinc-300 text-center font-bold outline-none"
                                />
                                <span>年12月31日 現在</span>
                            </div>

                            <div className="space-y-8">
                                {/* 資産の部 */}
                                <div>
                                    <h3 className="text-lg font-bold border-b border-zinc-800 mb-4 pb-1">資産の部</h3>
                                    <div className="space-y-1">
                                        <div className="pl-4 text-xs font-bold text-zinc-500 mb-1">【流動資産】</div>

                                        <RenderBSField
                                            label="現金 及び 預金"
                                            value={formData.assets_current_cash}
                                            onChange={(val) => handleInputChange('assets_current_cash', val)}
                                            indent
                                        />

                                        <RenderBSField
                                            label="流動資産合計"
                                            value={formData.assets_current_total}
                                            onChange={(val) => handleInputChange('assets_current_total', val)}
                                            indent
                                        />

                                        <RenderBSField
                                            label="資産の部合計"
                                            value={formData.assets_total}
                                            onChange={(val) => handleInputChange('assets_total', val)}
                                            isBold
                                            isTotal
                                        />
                                    </div>
                                </div>

                                {/* 負債の部 */}
                                <div>
                                    <h3 className="text-lg font-bold border-b border-zinc-800 mb-4 pb-1">負債の部</h3>
                                    <RenderBSField
                                        label="負債の部合計"
                                        value={formData.liabilities_total}
                                        onChange={(val) => handleInputChange('liabilities_total', val)}
                                    />
                                </div>

                                {/* 純資産の部 */}
                                <div>
                                    <h3 className="text-lg font-bold border-b border-zinc-800 mb-4 pb-1">純資産の部</h3>
                                    <div className="space-y-1">
                                        <div className="pl-4 text-xs font-bold text-zinc-500 mb-1">【株主資本】</div>

                                        <RenderBSField
                                            label="資 本 金"
                                            value={formData.net_assets_capital}
                                            onChange={(val) => handleInputChange('net_assets_capital', val)}
                                            indent
                                        />

                                        <div className="pl-4 text-xs text-zinc-500 py-1">その他利益剰余金</div>

                                        <RenderBSField
                                            label="繰越利益剰余金"
                                            value={formData.net_assets_retained_earnings}
                                            onChange={(val) => handleInputChange('net_assets_retained_earnings', val)}
                                            indentPlus
                                        />

                                        <RenderBSField
                                            label="利益剰余金合計"
                                            value={formData.net_assets_retained_earnings_total}
                                            onChange={(val) => handleInputChange('net_assets_retained_earnings_total', val)}
                                            indent
                                        />

                                        <RenderBSField
                                            label="株主資本合計"
                                            value={formData.net_assets_shareholders_equity}
                                            onChange={(val) => handleInputChange('net_assets_shareholders_equity', val)}
                                            indent
                                            isBold
                                        />

                                        <RenderBSField
                                            label="純資産の部合計"
                                            value={formData.net_assets_total}
                                            onChange={(val) => handleInputChange('net_assets_total', val)}
                                            isBold
                                        />

                                        <RenderBSField
                                            label="負債及び純資産の部合計"
                                            value={formData.liabilities_and_net_assets_total}
                                            onChange={(val) => handleInputChange('liabilities_and_net_assets_total', val)}
                                            isBold
                                            isTotal
                                        />
                                    </div>
                                </div>
                            </div>

                            {isUnbalanced && (
                                <div className="mt-6 p-3 bg-error/10 border border-error/20 rounded-lg flex items-center gap-2 text-error text-xs">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>資産合計と負債・純資産合計が一致していません（差額: ¥{(formData.assets_total - formData.liabilities_and_net_assets_total).toLocaleString()}）</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 border-t border-border flex justify-end gap-3 bg-surface-highlight">
                    <button onClick={onClose} className="btn-ghost" disabled={isSaving}>キャンセル</button>
                    <button onClick={handleSave} disabled={isSaving || (activeTab === 'manual' && formData.assets_total === 0)} className="btn-primary min-w-[120px]">
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        保存する
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BalanceSheetImportModal;
