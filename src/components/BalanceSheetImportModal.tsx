import React, { useState, useRef, useEffect } from 'react';
import { storageService } from '../services/storageService';
import {
    X,
    Upload,
    FileText,
    AlertCircle,
    Save,
    Loader2,
    Sparkles,
    Check,
    ArrowRight,
    ArrowLeft
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
    const isCorporation = businessType === 'corporation';
    // Step 1: Upload/Select, Step 2: Verify/Edit, Step 3: Complete
    const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 編集用データ (貸借対照表)
    const [formData, setFormData] = useState<Omit<YearlyBalanceSheet, 'id' | 'created_at' | 'updated_at'> & { document_path?: string }>({
        user_id: userId,
        business_type: businessType,
        year: new Date().getFullYear() - 1,
        assets_current_cash: 0,
        assets_current_receivable: 0,
        assets_current_inventory: 0,
        assets_current_total: 0,
        assets_fixed_total: 0,
        assets_total: 0,
        liabilities_current_payable: 0,
        liabilities_short_term_loans: 0,
        liabilities_long_term_loans: 0,
        liabilities_total: 0,
        net_assets_capital: 0,
        net_assets_retained_earnings: 0,
        net_assets_retained_earnings_total: 0,
        net_assets_shareholders_equity: 0,
        net_assets_total: 0,
        liabilities_and_net_assets_total: 0,
        metadata: {},
        document_path: undefined,
        status: 'draft'
    });

    useEffect(() => {
        if (isOpen) {
            setCurrentStep(1);
            setSelectedFile(null);
            setIsAnalyzing(false);
            setIsSaving(false);
            setFormData({
                user_id: userId,
                business_type: businessType,
                year: new Date().getFullYear() - 1,
                assets_current_cash: 0,
                assets_current_receivable: 0,
                assets_current_inventory: 0,
                assets_current_total: 0,
                assets_fixed_total: 0,
                assets_total: 0,
                liabilities_current_payable: 0,
                liabilities_short_term_loans: 0,
                liabilities_long_term_loans: 0,
                liabilities_total: 0,
                net_assets_capital: 0,
                net_assets_retained_earnings: 0,
                net_assets_retained_earnings_total: 0,
                net_assets_shareholders_equity: 0,
                net_assets_total: 0,
                liabilities_and_net_assets_total: 0,
                metadata: {},
                document_path: undefined,
                status: 'draft'
            });
        }
    }, [isOpen, userId, businessType]);

    if (!isOpen) return null;

    const processFile = async (file: File) => {
        if (!file) return;
        const isImage = file.type.startsWith('image/');
        const isPdf = file.type === 'application/pdf';

        if (!isImage && !isPdf) {
            toast.error('画像またはPDFファイルを選択してください');
            return;
        }

        setSelectedFile(file);
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
                    setCurrentStep(2);
                    toast.success('解析が完了しました。内容を確認してください。');
                } else {
                    toast.error('解析に失敗しました。数値を直接入力してください。');
                    setCurrentStep(2);
                }
                setIsAnalyzing(false);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('BS Analysis Error:', error);
            toast.error('解析中にエラーが発生しました');
            setIsAnalyzing(false);
            setCurrentStep(2);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault(); e.stopPropagation();
        if (!isAnalyzing && currentStep === 1) setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault(); e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault(); e.stopPropagation();
        setIsDragging(false);
        if (!isAnalyzing && currentStep === 1) {
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
            let documentPath = undefined;
            if (selectedFile) {
                try {
                    toast.loading('ファイルをアップロード中...', { id: 'upload-toast' });
                    documentPath = await storageService.uploadFinancialDocument(
                        userId,
                        selectedFile,
                        formData.year,
                        'bs'
                    );
                    if (documentPath) {
                        toast.success('ファイルのアップロード完了', { id: 'upload-toast' });
                    }
                } catch (uploadError) {
                    console.error('File Upload Error:', uploadError);
                    toast.error('ファイルのアップロードに失敗しました', { id: 'upload-toast' });
                }
            }

            const dataToSave = {
                ...formData,
                document_path: documentPath || formData.document_path
            };

            await yearlyBalanceSheetService.save(dataToSave);
            onImportSuccess();
            setCurrentStep(3);
            setIsSaving(false);
        } catch (error) {
            console.error('Save BS Error:', error);
            toast.error('保存に失敗しました');
            setIsSaving(false);
        }
    };

    const handleManualInput = () => {
        setSelectedFile(null);
        setFormData({
            ...formData,
            year: new Date().getFullYear() - 1
        });
        setCurrentStep(2);
    };

    const handleReset = () => {
        setCurrentStep(1);
        setSelectedFile(null);
        // Reset form data... (simplified reset for brevity, same as useEffect)
        setFormData({
            user_id: userId,
            business_type: businessType,
            year: new Date().getFullYear() - 1,
            assets_current_cash: 0,
            assets_current_receivable: 0,
            assets_current_inventory: 0,
            assets_current_total: 0,
            assets_fixed_total: 0,
            assets_total: 0,
            liabilities_current_payable: 0,
            liabilities_short_term_loans: 0,
            liabilities_long_term_loans: 0,
            liabilities_total: 0,
            net_assets_capital: 0,
            net_assets_retained_earnings: 0,
            net_assets_retained_earnings_total: 0,
            net_assets_shareholders_equity: 0,
            net_assets_total: 0,
            liabilities_and_net_assets_total: 0,
            metadata: {},
            document_path: undefined,
            status: 'draft'
        });
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

        useEffect(() => {
            setEditValue(value.toString());
        }, [value]);

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

    const renderStepIndicator = () => (
        <div className="flex items-center justify-center mb-8">
            {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                    <div className={`
                        flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm
                        ${currentStep >= step ? 'bg-primary text-white' : 'bg-surface-highlight text-text-muted'}
                        transition-colors duration-300
                    `}>
                        {currentStep > step ? <Check className="w-5 h-5" /> : step}
                    </div>
                    <span className={`ml-2 text-sm font-medium ${currentStep >= step ? 'text-text-main' : 'text-text-muted'}`}>
                        {step === 1 && 'アップロード'}
                        {step === 2 && 'データ確認'}
                        {step === 3 && '完了'}
                    </span>
                    {step < 3 && (
                        <div className={`w-12 h-0.5 mx-4 ${currentStep > step ? 'bg-primary' : 'bg-surface-highlight'}`} />
                    )}
                </div>
            ))}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div
                className="bg-surface border border-border rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                    <h2 className="text-xl font-bold text-text-main flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-primary" />
                        {isCorporation ? '貸借対照表（BS）のインポート' : '貸借対照表(BS)・所得金額のインポート'}
                    </h2>
                    <button onClick={onClose} className="text-text-muted hover:text-text-main transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                    {renderStepIndicator()}

                    {/* Step 1: Upload or Select */}
                    {currentStep === 1 && (
                        <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className={`
                                    w-full max-w-2xl text-center p-12 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300
                                    ${isDragging
                                        ? 'border-primary bg-primary/10 scale-[1.02]'
                                        : 'border-border hover:border-primary/50 hover:bg-surface-highlight'
                                    }
                                `}
                            >
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,.pdf" />
                                <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                    {isAnalyzing ? (
                                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                                    ) : (
                                        <Upload className="w-10 h-10 text-primary" />
                                    )}
                                </div>
                                <h3 className="text-xl font-bold text-text-main mb-2">
                                    {isAnalyzing ? 'AI解析中...' : (isCorporation ? '貸借対照表をアップロード' : '青色申告決算書(4枚目)等をアップロード')}
                                </h3>
                                <p className="text-text-muted mb-6">
                                    {isAnalyzing
                                        ? '画像を解析してデータを抽出しています'
                                        : 'PDFまたは画像ファイル（JPG/PNG）をドラッグ＆ドロップ'
                                    }
                                </p>
                                {!isAnalyzing && (
                                    <button className="btn-primary px-8 py-3 rounded-full shadow-lg hover:shadow-primary/25">
                                        ファイルを選択
                                    </button>
                                )}
                            </div>

                            <div className="mt-8 flex items-center w-full max-w-2xl">
                                <div className="h-px bg-border flex-1"></div>
                                <span className="px-4 text-text-muted text-sm">または</span>
                                <div className="h-px bg-border flex-1"></div>
                            </div>

                            <button
                                onClick={handleManualInput}
                                className="mt-8 flex items-center text-text-muted hover:text-primary transition-colors font-medium group"
                            >
                                手動で入力する
                                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    )}

                    {/* Step 2: Verification / Edit */}
                    {currentStep === 2 && (
                        <div className="max-w-4xl mx-auto">
                            <div className="bg-surface-highlight/30 rounded-lg p-4 mb-6 border border-border/50">
                                <h3 className="text-sm font-semibold text-text-main mb-2 flex items-center">
                                    <Sparkles className="w-4 h-4 text-primary mr-2" />
                                    データ確認・修正
                                </h3>
                                <p className="text-sm text-text-muted">
                                    {selectedFile ? 'AI解析によって抽出されたデータです。内容を確認してください。' : '手動でデータを入力してください。'}
                                </p>
                                {selectedFile && (
                                    <div className="mt-3 flex items-center text-xs text-text-muted bg-surface/50 p-2 rounded border border-border">
                                        <FileText className="w-3 h-3 mr-2" />
                                        参照ファイル: {selectedFile.name}
                                    </div>
                                )}
                            </div>

                            <div className="font-serif bg-white dark:bg-zinc-950 p-8 rounded-xl shadow-inner border border-border/50 text-zinc-900 dark:text-zinc-100">
                                <h2 className="text-2xl text-center mb-2 font-bold">{isCorporation ? '貸借対照表' : '貸借対照表（元入金・所得）'}</h2>
                                <div className="text-center text-sm mb-8 flex items-center justify-center gap-2">
                                    <input
                                        type="number"
                                        value={formData.year}
                                        onChange={(e) => handleInputChange('year', e.target.value)}
                                        className="w-20 bg-transparent border-b border-zinc-300 text-center font-bold outline-none"
                                    />
                                    <span>年12月31日時点</span>
                                </div>

                                <div className="space-y-8">
                                    {/* 資産の部 */}
                                    <div>
                                        <h3 className="text-lg font-bold border-b-2 border-zinc-500 mb-4 pb-1">資産の部</h3>
                                        <div className="space-y-1">
                                            <div className="pl-4 text-xs font-bold text-zinc-500 mb-1">【流動資産】</div>
                                            <RenderBSField label="現金 及び 預金" value={formData.assets_current_cash} onChange={(val) => handleInputChange('assets_current_cash', val)} indent />
                                            <RenderBSField label="売掛金" value={formData.assets_current_receivable} onChange={(val) => handleInputChange('assets_current_receivable', val)} indent />
                                            <RenderBSField label="棚卸資産（在庫）" value={formData.assets_current_inventory} onChange={(val) => handleInputChange('assets_current_inventory', val)} indent />
                                            <RenderBSField label="流動資産合計" value={formData.assets_current_total} onChange={(val) => handleInputChange('assets_current_total', val)} indent />
                                            <div className="pl-4 text-xs font-bold text-zinc-500 mb-1 mt-2">【固定資産】</div>
                                            <RenderBSField label="固定資産合計" value={formData.assets_fixed_total} onChange={(val) => handleInputChange('assets_fixed_total', val)} indent />
                                            <RenderBSField label="資産の部合計" value={formData.assets_total} onChange={(val) => handleInputChange('assets_total', val)} isBold isTotal />
                                        </div>
                                    </div>

                                    {/* 負債の部 */}
                                    <div>
                                        <h3 className="text-lg font-bold border-b-2 border-zinc-500 mb-4 pb-1">負債の部</h3>
                                        <div className="space-y-1">
                                            <div className="pl-4 text-xs font-bold text-zinc-500 mb-1">【流動負債】</div>
                                            <RenderBSField label="買掛金" value={formData.liabilities_current_payable} onChange={(val) => handleInputChange('liabilities_current_payable', val)} indent />
                                            <RenderBSField label="短期借入金" value={formData.liabilities_short_term_loans} onChange={(val) => handleInputChange('liabilities_short_term_loans', val)} indent />
                                            <div className="pl-4 text-xs font-bold text-zinc-500 mb-1 mt-2">【固定負債】</div>
                                            <RenderBSField label="長期借入金" value={formData.liabilities_long_term_loans} onChange={(val) => handleInputChange('liabilities_long_term_loans', val)} indent />
                                            <RenderBSField label="負債の部合計" value={formData.liabilities_total} onChange={(val) => handleInputChange('liabilities_total', val)} isBold isTotal />
                                        </div>
                                    </div>

                                    {/* 純資産の部 */}
                                    <div>
                                        <h3 className="text-lg font-bold border-b-2 border-zinc-500 mb-4 pb-1">{isCorporation ? '純資産の部' : '元入金・所得の部'}</h3>
                                        <div className="space-y-1">
                                            <div className="pl-4 text-xs font-bold text-zinc-500 mb-1">{isCorporation ? '【株主資本】' : '【元入金等】'}</div>
                                            <RenderBSField label={isCorporation ? '資 本 金' : '元 入 金'} value={formData.net_assets_capital} onChange={(val) => handleInputChange('net_assets_capital', val)} indent />
                                            <div className="pl-4 text-xs text-zinc-500 py-1">{isCorporation ? 'その他利益剰余金' : '所得金額'}</div>
                                            <RenderBSField label={isCorporation ? '繰越利益剰余金' : '今期純利益'} value={formData.net_assets_retained_earnings} onChange={(val) => handleInputChange('net_assets_retained_earnings', val)} indentPlus />
                                            <RenderBSField label={isCorporation ? '利益剰余金合計' : '元入金・所得合計'} value={formData.net_assets_retained_earnings_total} onChange={(val) => handleInputChange('net_assets_retained_earnings_total', val)} indent />
                                            <RenderBSField label={isCorporation ? '株主資本合計' : '元入金・所得等合計'} value={formData.net_assets_shareholders_equity} onChange={(val) => handleInputChange('net_assets_shareholders_equity', val)} indent isBold />
                                            <RenderBSField label={isCorporation ? '純資産の部合計' : '元入金・所得等の合計'} value={formData.net_assets_total} onChange={(val) => handleInputChange('net_assets_total', val)} isBold />
                                            <RenderBSField label={isCorporation ? '負債及び純資産の部合計' : '負債及び元入金・所得等の合計'} value={formData.liabilities_and_net_assets_total} onChange={(val) => handleInputChange('liabilities_and_net_assets_total', val)} isBold isTotal />
                                        </div>
                                    </div>
                                </div>

                                {isUnbalanced && (
                                    <div className="mt-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400 text-xs font-bold">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        <span>資産合計と負債・純資産合計が一致していません（差額: ¥{(formData.assets_total - formData.liabilities_and_net_assets_total).toLocaleString()}）</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Complete */}
                    {currentStep === 3 && (
                        <div className="flex flex-col items-center justify-center h-full py-12">
                            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                                <Check className="w-10 h-10 text-green-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-text-main mb-2">インポート完了</h3>
                            <p className="text-text-muted mb-8 text-center max-w-md">
                                貸借対照表データの保存が完了しました。<br />
                                経営分析の比較データとして利用されます。
                            </p>
                            <div className="flex gap-4">
                                <button onClick={onClose} className="btn-ghost">閉じる</button>
                                <button onClick={handleReset} className="btn-primary">続けてインポートする</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer (Navigation) */}
                {currentStep === 2 && (
                    <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-surface-highlight/30">
                        <button
                            onClick={() => setCurrentStep(1)}
                            className="flex items-center text-text-muted hover:text-text-main transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            戻る
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="btn-primary min-w-[140px]"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    保存中...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    保存して完了
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BalanceSheetImportModal;
