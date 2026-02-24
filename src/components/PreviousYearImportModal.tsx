import React, { useState, useRef, useEffect } from 'react';
import { storageService } from '../services/storageService';
import {
    X,
    Upload,
    FileText,
    Save,
    Loader2,
    Plus,
    Trash2,
    Sparkles,
    Check,
    ArrowRight,
    ArrowLeft
} from 'lucide-react';
import { analyzePLDocumentWithVision } from '../services/geminiAIService';
import { yearlySettlementService, YearlySettlement } from '../services/yearlySettlementService';
import toast from 'react-hot-toast';

interface PreviousYearImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    businessType: 'individual' | 'corporation';
    onImportSuccess: () => void;
    initialData?: YearlySettlement | null;
}

const PreviousYearImportModal: React.FC<PreviousYearImportModalProps> = ({
    isOpen,
    onClose,
    userId,
    businessType,
    onImportSuccess,
    initialData
}) => {
    // Step 1: Upload/Select, Step 2: Verify/Edit, Step 3: Complete
    const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<Omit<YearlySettlement, 'id' | 'created_at' | 'updated_at'>>({
        user_id: userId,
        business_type: businessType,
        year: new Date().getFullYear() - 1,
        revenue: 0,
        cost_of_sales: 0,
        operating_expenses: 0,
        non_operating_income: 0,
        non_operating_expenses: 0,
        extraordinary_income: 0,
        extraordinary_loss: 0,
        income_before_tax: 0,
        net_income: 0,
        category_breakdown: [],
        metadata: {},
        document_path: undefined,
        status: 'draft'
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                // Edit existing data
                const { id, created_at, updated_at, ...rest } = initialData;
                setFormData({
                    ...rest,
                    user_id: userId, // Ensure userId matches
                });
                setIsEditMode(true);
                setCurrentStep(2); // Jump to verification step
            } else {
                // New import
                setCurrentStep(1);
                setSelectedFile(null);
                setIsEditMode(false);
                setFormData({
                    user_id: userId,
                    business_type: businessType,
                    year: new Date().getFullYear() - 1,
                    revenue: 0,
                    cost_of_sales: 0,
                    operating_expenses: 0,
                    non_operating_income: 0,
                    non_operating_expenses: 0,
                    extraordinary_income: 0,
                    extraordinary_loss: 0,
                    income_before_tax: 0,
                    net_income: 0,
                    category_breakdown: [],
                    metadata: {},
                    document_path: undefined,
                    status: 'draft'
                });
            }
            setIsAnalyzing(false);
            setIsSaving(false);
        }
    }, [isOpen, userId, businessType, initialData]);

    if (!isOpen) return null;

    const processFile = async (file: File) => {
        if (!file) return;

        const isImage = file.type.startsWith('image/');
        const isPdf = file.type === 'application/pdf';

        if (!isImage && !isPdf) {
            toast.error('画像ファイル（JPG/PNG）またはPDFファイルのみ対応しています');
            return;
        }

        setSelectedFile(file);
        setIsAnalyzing(true);

        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = reader.result as string;
                const result = await analyzePLDocumentWithVision(base64);

                if (result) {
                    const settlement = yearlySettlementService.mapAiResultToSettlement(
                        result,
                        userId,
                        businessType,
                        { fileName: file.name }
                    );
                    setFormData(settlement);
                    setCurrentStep(2); // Move to verification step
                    toast.success('解析が完了しました。内容を確認してください。');
                } else {
                    toast.error('解析に失敗しました。手動で入力してください。');
                    // Even if failed, maybe let them go to manual?
                    // For now, stay on step 1 with error? Or go to step 2 with empty data?
                    // Let's go to step 2 so they can manually enter.
                    setCurrentStep(2);
                }
                setIsAnalyzing(false);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('File Analysis Error:', error);
            toast.error('解析中にエラーが発生しました');
            setIsAnalyzing(false);
            setCurrentStep(2); // Allow manual input even on error
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

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (!formData.year || formData.year < 2000 || formData.year > 2100) {
                toast.error('有効な年度を入力してください');
                setIsSaving(false);
                return;
            }

            let documentPath = undefined;
            if (selectedFile) {
                try {
                    toast.loading('ファイルをアップロード中...', { id: 'upload-toast' });
                    documentPath = await storageService.uploadFinancialDocument(
                        userId,
                        selectedFile,
                        formData.year,
                        'pl'
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

            await yearlySettlementService.save(dataToSave);
            onImportSuccess();
            setCurrentStep(3); // Move to complete step
            setIsSaving(false);
        } catch (error) {
            console.error('Save Error:', error);
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
        setFormData({
            ...formData,
            year: new Date().getFullYear() - 1,
            revenue: 0,
            cost_of_sales: 0,
            operating_expenses: 0,
            non_operating_income: 0,
            non_operating_expenses: 0,
            extraordinary_income: 0,
            extraordinary_loss: 0,
            income_before_tax: 0,
            net_income: 0,
            category_breakdown: [],
            document_path: undefined,
            status: 'draft'
        });
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => {
            const newData: any = { ...prev, [field]: value };
            // Simple re-calc for display consistency if needed, but for now rely on manual input
            return newData;
        });
    };

    const addCategory = () => {
        setFormData(prev => ({
            ...prev,
            category_breakdown: [...prev.category_breakdown, { category: '', amount: 0, percentage: 0 }]
        }));
    };

    const updateCategory = (index: number, field: string, value: any) => {
        setFormData(prev => {
            const newBreakdown = [...prev.category_breakdown];
            newBreakdown[index] = { ...newBreakdown[index], [field]: value };
            return { ...prev, category_breakdown: newBreakdown };
        });
    };

    const removeCategory = (index: number) => {
        setFormData(prev => ({
            ...prev,
            category_breakdown: prev.category_breakdown.filter((_, i) => i !== index)
        }));
    };

    // --- Render Helpers ---

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
                        前年度決算データのインポート
                    </h2>
                    <button onClick={onClose} className="text-text-muted hover:text-text-main transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
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
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*,.pdf"
                                    onChange={handleFileChange}
                                />

                                <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                    {isAnalyzing ? (
                                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                                    ) : (
                                        <Upload className="w-10 h-10 text-primary" />
                                    )}
                                </div>

                                <h3 className="text-xl font-bold text-text-main mb-2">
                                    {isAnalyzing ? 'AI解析中...' : '決算書をアップロード'}
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
                        <div className="space-y-6">
                            <div className="bg-surface-highlight/30 rounded-lg p-4 mb-6 border border-border/50">
                                <h3 className="text-sm font-semibold text-text-main mb-2 flex items-center">
                                    <Sparkles className="w-4 h-4 text-primary mr-2" />
                                    データ確認・修正
                                </h3>
                                <p className="text-sm text-text-muted">
                                    {isEditMode ? 'データを修正して保存してください。' : (selectedFile ? 'AI解析によって抽出されたデータです。誤りがないか確認し、必要に応じて修正してください。' : '手動でデータを入力してください。')}
                                </p>
                                {selectedFile && (
                                    <div className="mt-3 flex items-center text-xs text-text-muted bg-surface/50 p-2 rounded border border-border">
                                        <FileText className="w-3 h-3 mr-2" />
                                        参照ファイル: {selectedFile.name}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Basic Info */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-text-muted mb-1">対象年度</label>
                                        <input
                                            type="number"
                                            value={formData.year}
                                            onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-text-muted mb-1">売上高</label>
                                        <input
                                            type="number"
                                            value={formData.revenue}
                                            onChange={(e) => handleInputChange('revenue', parseInt(e.target.value))}
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-text-muted mb-1">売上原価</label>
                                        <input
                                            type="number"
                                            value={formData.cost_of_sales}
                                            onChange={(e) => handleInputChange('cost_of_sales', parseInt(e.target.value))}
                                            className="input-field"
                                        />
                                    </div>
                                </div>

                                {/* Profit Calc Flow */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-text-muted mb-1">販売費及び一般管理費</label>
                                        <input
                                            type="number"
                                            value={formData.operating_expenses}
                                            onChange={(e) => handleInputChange('operating_expenses', parseInt(e.target.value))}
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-text-muted mb-1">営業外収益</label>
                                        <input
                                            type="number"
                                            value={formData.non_operating_income}
                                            onChange={(e) => handleInputChange('non_operating_income', parseInt(e.target.value))}
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-text-muted mb-1">営業外費用</label>
                                        <input
                                            type="number"
                                            value={formData.non_operating_expenses}
                                            onChange={(e) => handleInputChange('non_operating_expenses', parseInt(e.target.value))}
                                            className="input-field"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Category Breakdown Section */}
                            <div className="bg-surface-highlight/10 rounded-xl p-5 border border-border mt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-bold text-text-main flex items-center">
                                        <div className="w-2 h-2 rounded-full bg-purple-500 mr-2" />
                                        主要カテゴリ別内訳（任意）
                                    </h3>
                                    <button
                                        onClick={addCategory}
                                        className="text-xs flex items-center text-primary hover:text-primary-light transition-colors"
                                    >
                                        <Plus className="w-3 h-3 mr-1" />
                                        カテゴリを追加
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {formData.category_breakdown.map((item, index) => (
                                        <div key={index} className="flex items-center gap-3 bg-surface-highlight/20 p-3 rounded-lg border border-border/50 group">
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    placeholder="カテゴリ名（例: 商品売上）"
                                                    value={item.category}
                                                    onChange={(e) => updateCategory(index, 'category', e.target.value)}
                                                    className="w-full bg-transparent border-none p-0 text-sm focus:ring-0 text-text-main placeholder-text-muted/50"
                                                />
                                            </div>
                                            <div className="w-32 relative">
                                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted text-xs">¥</span>
                                                <input
                                                    type="number"
                                                    placeholder="金額"
                                                    value={item.amount}
                                                    onChange={(e) => updateCategory(index, 'amount', parseInt(e.target.value))}
                                                    className="w-full bg-surface-highlight/50 border border-border rounded-md pl-6 pr-2 py-1 text-right text-sm font-mono focus:ring-1 focus:ring-primary"
                                                />
                                            </div>
                                            <button
                                                onClick={() => removeCategory(index)}
                                                className="w-6 h-6 flex items-center justify-center text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    {formData.category_breakdown.length === 0 && (
                                        <p className="text-xs text-text-muted text-center py-4 border-2 border-dashed border-border/50 rounded-lg">
                                            内訳を登録すると、統計比較がより詳細になります。
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="border-t border-border pt-6 mt-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-xs font-medium text-text-muted mb-1">特別利益</label>
                                        <input
                                            type="number"
                                            value={formData.extraordinary_income}
                                            onChange={(e) => handleInputChange('extraordinary_income', parseInt(e.target.value))}
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-text-muted mb-1">特別損失</label>
                                        <input
                                            type="number"
                                            value={formData.extraordinary_loss}
                                            onChange={(e) => handleInputChange('extraordinary_loss', parseInt(e.target.value))}
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-primary mb-1">当期純利益</label>
                                        <input
                                            type="number"
                                            value={formData.net_income}
                                            onChange={(e) => handleInputChange('net_income', parseInt(e.target.value))}
                                            className="input-field border-primary/50 bg-primary/5 font-bold"
                                        />
                                    </div>
                                </div>
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
                                前年度データの保存が完了しました。<br />
                                経営分析の比較データとして利用されます。
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={onClose}
                                    className="btn-ghost"
                                >
                                    閉じる
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="btn-primary"
                                >
                                    続けてインポートする
                                </button>
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

export default PreviousYearImportModal;
