import React, { useState, useRef } from 'react';
import {
    X,
    Upload,
    FileText,
    Sparkles,
    AlertCircle,
    Save,
    Loader2,
    Trash2,
    Plus
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
}

const PreviousYearImportModal: React.FC<PreviousYearImportModalProps> = ({
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

    // 編集用データ
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
        metadata: {}
    });

    if (!isOpen) return null;

    const processFile = async (file: File) => {
        if (!file) return;

        const isImage = file.type.startsWith('image/');
        const isPdf = file.type === 'application/pdf';

        if (!isImage && !isPdf) {
            toast.error('画像ファイル（JPG/PNG）またはPDFファイルのみ対応しています');
            return;
        }

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
                    setActiveTab('manual');
                    toast.success('解析が完了しました。内容を確認してください。');
                } else {
                    toast.error('解析に失敗しました。手動で入力してください。');
                    setActiveTab('manual');
                }
                setIsAnalyzing(false);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('File Analysis Error:', error);
            toast.error('解析中にエラーが発生しました');
            setIsAnalyzing(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (activeTab === 'upload' && !isAnalyzing) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (activeTab === 'upload' && !isAnalyzing) {
            const file = e.dataTransfer.files?.[0];
            if (file) processFile(file);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // データの検証
            if (!formData.year || formData.year < 2000 || formData.year > 2100) {
                toast.error('有効な年度を入力してください');
                setIsSaving(false);
                return;
            }

            await yearlySettlementService.save(formData);
            toast.success('データを保存しました');
            onImportSuccess();
            onClose();
        } catch (error) {
            console.error('Save Error:', error);
            toast.error('保存に失敗しました');
        } finally {
            setIsSaving(false);
        }
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => {
            const newData: any = { ...prev, [field]: value };

            // 利益の自動計算
            if (['revenue', 'cost_of_sales', 'operating_expenses', 'non_operating_income', 'non_operating_expenses', 'extraordinary_income', 'extraordinary_loss'].includes(field)) {
                const opIncome = newData.revenue - newData.cost_of_sales - newData.operating_expenses;
                newData.income_before_tax = opIncome + newData.non_operating_income - newData.non_operating_expenses + newData.extraordinary_income - newData.extraordinary_loss;
                newData.net_income = newData.income_before_tax; // 簡易的に同じにする
            }

            return newData;
        });
    };

    const addCategory = () => {
        setFormData(prev => ({
            ...prev,
            category_breakdown: [...prev.category_breakdown, { category: '', amount: 0 }]
        }));
    };

    const updateCategory = (index: number, field: 'category' | 'amount', value: any) => {
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

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-surface w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-border animate-in fade-in zoom-in duration-200">
                {/* ヘッダー */}
                <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface-highlight">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="text-lg font-bold text-text-main">前年度データのインポート</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-5 h-5 text-text-muted" />
                    </button>
                </div>

                {/* タブ */}
                <div className="flex border-b border-border">
                    <button
                        onClick={() => setActiveTab('upload')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'upload' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-text-muted hover:text-text-main hover:bg-surface-highlight'}`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            AI解析 (推奨)
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('manual')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'manual' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-text-muted hover:text-text-main hover:bg-surface-highlight'}`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <Upload className="w-4 h-4" />
                            手動入力・確認
                        </div>
                    </button>
                </div>

                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    {activeTab === 'upload' ? (
                        <div className="space-y-6">
                            <div
                                onClick={() => !isAnalyzing && fileInputRef.current?.click()}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer ${isAnalyzing ? 'border-primary/50 bg-primary/5 cursor-not-allowed' : isDragging ? 'border-primary bg-primary/10 scale-[1.02]' : 'border-border hover:border-primary/50 hover:bg-surface-highlight'}`}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept="image/*,.pdf"
                                />

                                {isAnalyzing ? (
                                    <>
                                        <Loader2 className="w-12 h-12 text-primary animate-spin" />
                                        <div className="text-center">
                                            <p className="text-lg font-bold text-text-main">損益計算書を解析中...</p>
                                            <p className="text-sm text-text-muted mt-1">AIが数値を抽出しています。しばらくお待ちください。</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 transition-colors ${isDragging ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>
                                            <Upload className={`w-8 h-8 ${isDragging ? 'animate-bounce' : ''}`} />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-lg font-bold text-text-main">
                                                {isDragging ? 'そのままドロップしてください' : '決算書の画像またはPDFをアップロード'}
                                            </p>
                                            <p className="text-sm text-text-muted mt-1">損益計算書（P&L）を撮影・選択またはドラッグ＆ドロップ</p>
                                        </div>
                                        <button className="btn-primary px-8 mt-2" disabled={isAnalyzing}>ファイルを選択</button>
                                    </>
                                )}
                            </div>

                            <div className="bg-info-light/50 border border-info/20 rounded-xl p-4 flex gap-3">
                                <AlertCircle className="w-5 h-5 text-info shrink-0 mt-0.5" />
                                <div className="text-sm text-text-main">
                                    <p className="font-bold">AI解析について</p>
                                    <p className="text-text-muted mt-1">アップロードされた画像やPDFから売上高、販管費、純利益などの主要項目を自動で抽出します。解析後、数値が正しいか確認・修正いただけます。</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-text-muted mb-1.5">対象年度 (西暦)</label>
                                    <input
                                        type="number"
                                        value={formData.year}
                                        onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                                        className="input-base text-lg font-bold"
                                        placeholder="2024"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <h4 className="font-bold text-text-main border-l-2 border-success pl-2">収益</h4>
                                    <div>
                                        <label className="block text-xs font-medium text-text-muted mb-1">売上高 (収入金額)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">¥</span>
                                            <input
                                                type="number"
                                                value={formData.revenue}
                                                onChange={(e) => handleInputChange('revenue', parseInt(e.target.value))}
                                                className="input-base pl-8"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-text-muted mb-1">営業外収益</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">¥</span>
                                            <input
                                                type="number"
                                                value={formData.non_operating_income}
                                                onChange={(e) => handleInputChange('non_operating_income', parseInt(e.target.value))}
                                                className="input-base pl-8"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="font-bold text-text-main border-l-2 border-error pl-2">費用</h4>
                                    <div>
                                        <label className="block text-xs font-medium text-text-muted mb-1">売上原価</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">¥</span>
                                            <input
                                                type="number"
                                                value={formData.cost_of_sales}
                                                onChange={(e) => handleInputChange('cost_of_sales', parseInt(e.target.value))}
                                                className="input-base pl-8"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-text-muted mb-1">販管費 (経費合計)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">¥</span>
                                            <input
                                                type="number"
                                                value={formData.operating_expenses}
                                                onChange={(e) => handleInputChange('operating_expenses', parseInt(e.target.value))}
                                                className="input-base pl-8"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-surface-highlight rounded-xl p-4 border border-border">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-bold text-text-main">経費内訳 (任意)</h4>
                                    <button onClick={addCategory} className="text-primary text-sm flex items-center gap-1 hover:underline">
                                        <Plus className="w-4 h-4" />
                                        追加
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    {formData.category_breakdown.map((cat, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={cat.category}
                                                onChange={(e) => updateCategory(idx, 'category', e.target.value)}
                                                placeholder="カテゴリ名"
                                                className="input-base flex-1 text-sm bg-surface"
                                            />
                                            <div className="relative w-32">
                                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted text-xs">¥</span>
                                                <input
                                                    type="number"
                                                    value={cat.amount}
                                                    onChange={(e) => updateCategory(idx, 'amount', parseInt(e.target.value))}
                                                    className="input-base pl-6 text-sm bg-surface text-right"
                                                />
                                            </div>
                                            <button onClick={() => removeCategory(idx)} className="p-2 text-error hover:bg-error/10 rounded-lg">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    {formData.category_breakdown.length === 0 && (
                                        <p className="text-xs text-text-muted text-center py-2">内訳を登録すると、統計比較がより詳細になります。</p>
                                    )}
                                </div>
                            </div>

                            <div className="bg-primary/5 rounded-xl p-5 border border-primary/20 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-primary">計算後の当期純利益</p>
                                    <p className="text-2xl font-black text-text-main mt-1">¥{formData.net_income.toLocaleString()}</p>
                                </div>
                                <div className="p-3 bg-white/5 rounded-2xl">
                                    <Sparkles className="w-8 h-8 text-primary/40" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* フッター */}
                <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3 bg-surface-highlight/50">
                    <button
                        onClick={onClose}
                        className="btn-ghost"
                        disabled={isSaving}
                    >
                        キャンセル
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || (activeTab === 'manual' && formData.revenue === 0)}
                        className="btn-primary min-w-[120px]"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                保存中...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                保存する
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PreviousYearImportModal;
