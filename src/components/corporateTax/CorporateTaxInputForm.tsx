import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { initialCorporateTaxInputData, CorporateTaxInputData } from '../../types/corporateTaxInput';
import { CorporateTaxInputService } from '../../services/CorporateTaxInputService';
import { generateCompleteCorporateTaxPDF, fillOfficialCorporateTaxPDF, fillSingleOfficialCorporateTaxPDF } from '../../services/pdfJapaneseService';
import { CsvExportService } from '../../services/CsvExportService';
import { Beppyo1Input } from './Beppyo1Input';
import { Beppyo4Input } from './Beppyo4Input';
import { Beppyo5_1Input } from './Beppyo5_1Input';
import { Beppyo5_2Input } from './Beppyo5_2Input';
import { Beppyo15Input } from './Beppyo15Input';
import { Beppyo16Input } from './Beppyo16Input';
import { Beppyo2Input } from './Beppyo2Input';
import { BusinessOverviewInput } from './BusinessOverviewInput';
import { generateCorporateTaxXTX, downloadFile } from '../../services/eTaxExportService';
import { Save, RefreshCw, Download, Activity, Calculator, PieChart, Landmark, Box, Coffee, Users, FileText, BookOpen, Eye, X, Share2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTransactions } from '../../hooks/useTransactions';
import { useBusinessTypeContext } from '../../context/BusinessTypeContext';
import toast from 'react-hot-toast';

export const CorporateTaxInputForm: React.FC = () => {
    const [data, setData] = useState<CorporateTaxInputData>(initialCorporateTaxInputData);
    const [activeTab, setActiveTab] = useState<'overview' | 'beppyo4' | 'beppyo16' | 'beppyo15' | 'beppyo5' | 'beppyo5_2' | 'beppyo2' | 'beppyo1'>('overview');
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);

    const { user } = useAuth();
    const { currentBusinessType } = useBusinessTypeContext();
    const { transactions } = useTransactions(user?.id, currentBusinessType?.business_type);

    // Load data
    useEffect(() => {
        const loadedData = CorporateTaxInputService.getData();
        setData(loadedData);
    }, []);

    const handleDataChange = (updates: Partial<CorporateTaxInputData>) => {
        setData(prev => ({ ...prev, ...updates }));
        setHasUnsavedChanges(true);
        setSaveStatus('idle');
    };

    const handleImport = () => {
        if (!transactions || transactions.length === 0) {
            toast.error('取り込む取引データがありません');
            return;
        }

        const currentYear = new Date().getFullYear();
        const fiscalYear = currentYear - 1;
        const yearTransactions = transactions.filter(t => new Date(t.date).getFullYear() === fiscalYear);

        if (yearTransactions.length === 0) {
            toast.error(`${fiscalYear}年度の取引データが見つかりませんでした`);
            return;
        }

        if (!window.confirm(`${fiscalYear}年度の取引（${yearTransactions.length}件）を解析し、申告書に転記しますか？\n（現在入力されている調整項目は上書きされる場合があります）`)) {
            return;
        }

        try {
            const calculated = CorporateTaxInputService.calculateDataFromTransactions(transactions);
            setData(prev => ({ ...prev, ...calculated }));
            setHasUnsavedChanges(true);

            // 転記された内容を要約して通知
            const additionCount = calculated.beppyo4?.additions?.length || 0;
            const assetCount = calculated.beppyo16?.assets?.length || 0;

            toast.success(
                <div>
                    <p className="font-bold">データの転記が完了しました</p>
                    <p className="text-xs mt-1">
                        ・別表四: {additionCount}項目の調整を抽出<br />
                        ・別表十六: {assetCount}件の資産を特定
                    </p>
                </div>,
                { duration: 4000 }
            );
        } catch (error) {
            console.error('Import failed', error);
            toast.error('転記に失敗しました');
        }
    };

    const handleSave = () => {
        setSaveStatus('saving');
        setTimeout(() => {
            CorporateTaxInputService.saveData(data);
            setHasUnsavedChanges(false);
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        }, 500);
    };

    const handleDownloadPDF = async () => {
        setIsGeneratingPdf(true);
        try {
            const pdfBytes = await generateCompleteCorporateTaxPDF(data);
            const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = `法人税申告書_${new Date().toISOString().split('T')[0]}.pdf`;
            link.click();
            toast.success('PDFを出力しました');
        } catch (error) {
            console.error('PDF generation failed', error);
            toast.error('PDFの作成に失敗しました');
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    const handleDownloadOfficialPDF = async () => {
        setIsGeneratingPdf(true);
        try {
            const { pdfBytes, successes, errors } = await fillOfficialCorporateTaxPDF(data);
            const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = `公式法人税申告書_一括_${new Date().toISOString().split('T')[0]}.pdf`;
            link.click();

            toast.success(
                <div>
                    <p className="font-bold">公式様式PDFを出力しました</p>
                    <p className="text-xs mt-1">成功: {successes.join(', ')}</p>
                    {errors.length > 0 && <p className="text-xs text-red-500 mt-1">失敗: {errors.join(', ')}</p>}
                </div>
            );
        } catch (error: any) {
            console.error('Official PDF filling failed', error);
            toast.error(error.message || '公式様式の作成に失敗しました');
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    const handleDownloadSingleOfficialPDF = async (templateId: string, name: string) => {
        setIsGeneratingPdf(true);
        try {
            const pdfBytes = await fillSingleOfficialCorporateTaxPDF(data, templateId);
            const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = `${name}_${new Date().toISOString().split('T')[0]}.pdf`;
            link.click();
            toast.success(`${name}を出力しました`);
        } catch (error: any) {
            console.error(`Single PDF filling failed for ${templateId}`, error);
            toast.error(`${name}の作成に失敗しました: ${error.message}`);
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    const handlePreviewPDF = async () => {
        setIsGeneratingPdf(true);
        try {
            const pdfBytes = await generateCompleteCorporateTaxPDF(data);
            const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            setPreviewBlobUrl(url);
            setShowPreviewModal(true);
        } catch (error) {
            console.error('PDF preview failed', error);
            toast.error('プレビューの作成に失敗しました');
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    const closePreviewModal = () => {
        setShowPreviewModal(false);
        if (previewBlobUrl) {
            window.URL.revokeObjectURL(previewBlobUrl);
            setPreviewBlobUrl(null);
        }
    };

    const handleExportXTX = () => {
        try {
            const xtx = generateCorporateTaxXTX(data);
            const fileName = `corporate_tax_return_${new Date().getFullYear()}.xtx`;
            downloadFile(xtx, fileName);
            toast.success(
                <div>
                    <p className="font-bold">e-Tax用ファイルを書き出しました</p>
                    <p className="text-xs mt-1">
                        国税庁のe-Taxソフト等でインポートできます。
                    </p>
                </div>
            );
        } catch (error) {
            console.error('XTX export failed', error);
            toast.error('書き出しに失敗しました');
        }
    };

    const tabDetails = {
        overview: { label: '事業概況', icon: Activity, title: '事業概況', description: '法人の基本的情報および事業の概要を入力します。' },
        beppyo16: { label: '別表十六（減価償却）', icon: Box, title: '別表十六（減価償却資産の償却額の計算に関する明細書）', description: '固定資産の減価償却費の計算および償却限度額との調整を行います。' },
        beppyo15: { label: '別表十五（交際費）', icon: Coffee, title: '別表十五（交際費等の損金算入に関する明細書）', description: '交際費等の支出額および損金不算入額を計算します。' },
        beppyo2: { label: '別表二（同族判定）', icon: Users, title: '別表二（同族会社等の判定に関する明細書）', description: '株主構成に基づき、同族会社の判定および留保金課税の要否を判断します。' },
        beppyo4: { label: '別表四（所得調整）', icon: Calculator, title: '別表四（所得の金額の計算に関する明細書）', description: '会計上の利益から税務上の所得を計算するための調整を行います。' },
        beppyo5_2: { label: '別表五(二)（租税公課）', icon: Landmark, title: '別表五(二)（租税公課の納付状況等に関する明細書）', description: '法人税、住民税、事業税などの納付状況および納税充当金の計算を行います。' },
        beppyo5: { label: '別表五(一)（利益積立金）', icon: PieChart, title: '別表五(一)（利益積立金額及び資本金等の額の計算に関する明細書）', description: '税務上の純資産（利益積立金、資本金等）の増減を管理します。' },
        beppyo1: { label: '別表一（申告書）', icon: FileText, title: '別表一（各事業年度の所得に係る申告書）', description: '計算された所得金額に基づき、法人税額を計算・申告します。' },
    };

    return (
        <div className="bg-background min-h-screen">
            <div className="max-w-[1280px] mx-auto px-4 py-8">
                {/* Main Page Header */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-xl sm:text-2xl font-bold text-text-main whitespace-nowrap">法人税申告書エディタ</h1>
                    <p className="text-xs sm:text-base text-text-muted mt-1">
                        法人税申告書類の各項目を詳細に入力・編集します
                    </p>
                </div>

                {/* Styled Tabs Section */}
                <div className="mb-6 overflow-x-auto pb-2 scrollbar-hide">
                    <nav className="inline-flex bg-[#1e293b]/80 backdrop-blur-md p-1 rounded-full border border-white/10 min-w-max items-stretch">
                        {Object.entries(tabDetails).map(([id, detail]) => {
                            const Icon = detail.icon;
                            const isActive = activeTab === id;

                            // Split label: Main + (Sub)
                            const match = detail.label.match(/^(.+?)([（(].+[）)])$/);
                            const mainLabel = match ? match[1] : detail.label;
                            const subLabel = match ? match[2].replace(/[（()）]/g, '') : null; // Strip parens for cleaner 2nd line? 
                            // User said "()の部分" (The part in parens). Usually implies keeping the content.
                            // I will render it small.

                            return (
                                <button
                                    key={id}
                                    onClick={() => setActiveTab(id as any)}
                                    className={`
                                        relative flex flex-col items-center justify-center px-4 py-2 rounded-full transition-colors duration-200 min-h-[56px] min-w-[100px]
                                        ${isActive
                                            ? 'text-primary'
                                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                                        }
                                    `}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTabIndicator"
                                            className="absolute bottom-0 left-3 right-3 h-[3px] bg-primary rounded-t-full shadow-[0_-2px_8px_rgba(var(--color-primary),0.5)]"
                                            transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                                        />
                                    )}

                                    <div className="relative z-10 flex flex-col items-center leading-tight">
                                        <div className="flex items-center gap-1.5 mb-0.5">
                                            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-primary' : 'text-slate-500'}`} />
                                            <span className="text-sm font-bold tracking-tight whitespace-nowrap">{mainLabel}</span>
                                        </div>
                                        {subLabel && (
                                            <span className={`text-[10px] font-medium tracking-wide ${isActive ? 'text-primary/80' : 'text-slate-500'}`}>
                                                {subLabel}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Unified Card Container (Form + Sidebar) */}
                <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
                    <div className="flex flex-col lg:flex-row">
                        {/* Main Content Area */}
                        <div className="flex-1 p-3 lg:p-8 min-w-0">
                            {/* Dynamic Document Title & Description */}
                            <div className="mb-8 pb-6 border-b border-border">
                                <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
                                    {React.createElement(tabDetails[activeTab].icon, { className: "w-6 h-6 text-primary" })}
                                    {tabDetails[activeTab].title}
                                </h2>
                                <p className="text-sm text-text-muted mt-2 leading-relaxed">
                                    {tabDetails[activeTab].description}
                                </p>
                            </div>

                            {activeTab === 'overview' && (
                                <BusinessOverviewInput data={data} onChange={handleDataChange} />
                            )}
                            {activeTab === 'beppyo4' && (
                                <Beppyo4Input data={data} onChange={handleDataChange} />
                            )}
                            {activeTab === 'beppyo5' && (
                                <Beppyo5_1Input data={data} onChange={handleDataChange} />
                            )}
                            {activeTab === 'beppyo5_2' && (
                                <Beppyo5_2Input data={data} onChange={handleDataChange} />
                            )}
                            {activeTab === 'beppyo1' && (
                                <Beppyo1Input data={data} onChange={handleDataChange} />
                            )}
                            {activeTab === 'beppyo2' && (
                                <Beppyo2Input data={data} onChange={handleDataChange} />
                            )}
                            {activeTab === 'beppyo15' && (
                                <Beppyo15Input data={data} onChange={handleDataChange} />
                            )}
                            {activeTab === 'beppyo16' && (
                                <Beppyo16Input data={data} onChange={handleDataChange} />
                            )}
                        </div>

                        {/* Right Sidebar */}
                        <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-border bg-surface-highlight/5">
                            <div className="p-6 sticky top-0">
                                <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-4">アクション</h3>
                                <div className="space-y-3">
                                    <button
                                        onClick={handlePreviewPDF}
                                        className="w-full py-2.5 px-4 bg-surface border border-border text-text-main rounded-lg font-medium hover:bg-surface-highlight transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Eye className="w-4 h-4" />
                                        プレビュー
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={saveStatus === 'saving'}
                                        className={`w-full py-2.5 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${hasUnsavedChanges
                                            ? 'btn-primary shadow-lg shadow-primary/25'
                                            : 'bg-surface border border-border text-text-muted hover:bg-surface-highlight'
                                            }`}
                                    >
                                        {saveStatus === 'saving' ? (
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Save className="w-4 h-4" />
                                        )}
                                        {saveStatus === 'saved' ? '保存しました' : '保存'}
                                    </button>
                                    <div className="border-t border-border my-2"></div>
                                    <button
                                        onClick={handleDownloadPDF}
                                        disabled={isGeneratingPdf}
                                        className="w-full py-2.5 px-4 bg-surface border border-border text-text-main rounded-lg font-medium hover:bg-surface-highlight transition-colors flex items-center justify-center gap-2"
                                    >
                                        {isGeneratingPdf ? (
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <FileText className="w-4 h-4" />
                                        )}
                                        PDF出力 (下書き用)
                                    </button>

                                    <div className="space-y-3">
                                        <button
                                            onClick={handleDownloadOfficialPDF}
                                            disabled={isGeneratingPdf}
                                            className="w-full h-12 bg-primary text-white font-bold rounded-xl shadow-lg hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
                                        >
                                            <FileText className="w-5 h-5" />
                                            {isGeneratingPdf ? '生成中...' : '公式PDF (一括出力)'}
                                        </button>

                                        <div className="grid grid-cols-1 gap-1 border border-border rounded-xl overflow-hidden bg-surface mt-4 shadow-inner">
                                            <div className="px-3 py-2 bg-surface-highlight text-[10px] font-bold text-text-muted uppercase border-b border-border tracking-wider flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                                個別出力 (反映成功のみ)
                                            </div>
                                            <div className="divide-y divide-border">
                                                {[
                                                    { id: 'beppyo1', name: '別表一' },
                                                    { id: 'beppyo4', name: '別表四' },
                                                    { id: 'beppyo5_1', name: '別表五一' },
                                                    { id: 'beppyo15', name: '別表十五' },
                                                    { id: 'beppyo16', name: '別表十六' }
                                                ].map(item => (
                                                    <div key={item.id} className="flex divide-x divide-border">
                                                        <button
                                                            onClick={() => handleDownloadSingleOfficialPDF(item.id, item.name)}
                                                            className="flex-1 py-2 px-3 text-left text-sm text-text-main hover:bg-surface-highlight transition-colors flex items-center justify-between"
                                                        >
                                                            <span>{item.name}</span>
                                                            <Download className="w-3 h-3 text-text-muted" />
                                                        </button>
                                                        {item.id === 'beppyo1' && (
                                                            <button
                                                                onClick={() => handleDownloadSingleOfficialPDF('beppyo1_debug', '座標確認用')}
                                                                title="位置合わせ用の目盛りを表示します"
                                                                className="px-2 bg-surface hover:bg-surface-highlight text-[10px] text-text-muted transition-colors flex items-center justify-center border-l border-border"
                                                            >
                                                                <Activity className="w-3 h-3" />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleExportXTX}
                                        className="w-full py-2.5 px-4 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                                    >
                                        <Share2 className="w-4 h-4" />
                                        e-Tax出力 (提出用)
                                    </button>
                                    <button
                                        onClick={() => {
                                            const csv = CsvExportService.generateFinancialStatementCSV(data);
                                            CsvExportService.downloadCSV(csv, `financial_statements_draft.csv`);
                                            toast.success('財務諸表CSVを出力しました');
                                        }}
                                        className="w-full py-2.5 px-4 bg-surface border border-border text-text-main rounded-lg font-medium hover:bg-surface-highlight transition-colors flex items-center justify-center gap-2"
                                    >
                                        <BookOpen className="w-4 h-4" />
                                        財務諸表CSV (提出用)
                                    </button>
                                    <button
                                        onClick={handleImport}
                                        className="w-full py-2.5 px-4 bg-surface border border-border text-text-main rounded-lg font-medium hover:bg-surface-highlight transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Download className="w-4 h-4" />
                                        データ転記
                                    </button>
                                    <div className="border-t border-border my-2"></div>
                                    <button
                                        onClick={() => {
                                            if (window.confirm('入力内容をリセットしますか？')) {
                                                CorporateTaxInputService.resetData();
                                                setData(initialCorporateTaxInputData);
                                                setHasUnsavedChanges(true);
                                            }
                                        }}
                                        className="w-full py-2.5 px-4 bg-transparent text-text-muted rounded-lg font-medium hover:bg-red-50 hover:text-red-500 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        リセット
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preview Modal */}
                {showPreviewModal && previewBlobUrl && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                        <div className="bg-surface rounded-xl max-w-4xl w-full h-[90vh] flex flex-col border border-border shadow-2xl">
                            <div className="flex justify-between items-center p-4 border-b border-border">
                                <h3 className="text-lg font-semibold text-text-main">プレビュー</h3>
                                <button
                                    onClick={closePreviewModal}
                                    className="text-text-muted hover:text-text-main p-2 hover:bg-surface-highlight rounded-full transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="flex-1 bg-surface-highlight p-4">
                                <iframe
                                    src={previewBlobUrl}
                                    className="w-full h-full rounded-lg shadow-inner border border-border"
                                    title="PDF Preview"
                                />
                            </div>
                            <div className="p-4 border-t border-border flex justify-end gap-3 bg-surface rounded-b-xl">
                                <button
                                    onClick={closePreviewModal}
                                    className="px-4 py-2 border border-border text-text-main rounded-lg hover:bg-surface-highlight transition-colors"
                                >
                                    閉じる
                                </button>
                                <button
                                    onClick={() => {
                                        handleDownloadPDF();
                                        closePreviewModal();
                                    }}
                                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-lg shadow-primary/20"
                                >
                                    <FileText className="w-4 h-4" />
                                    PDFを保存
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
