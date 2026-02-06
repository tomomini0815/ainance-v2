import React, { useState, useEffect } from 'react';
import { TaxReturnInputData, initialTaxReturnInputData } from '../../types/taxReturnInput';
import { TaxReturnInputService } from '../../services/TaxReturnInputService';
import { TaxReturnTable1Input } from './TaxReturnTable1Input';
import { TaxReturnTable2Input } from './TaxReturnTable2Input';
import { BlueReturnInput } from './BlueReturnInput';
import { Save, RefreshCw, FileText, Activity, CreditCard, Download, Wrench, Eye, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTransactions } from '../../hooks/useTransactions';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { generateFilledTaxForm, downloadPDF } from '../../services/pdfAutoFillService';

import { useBusinessTypeContext } from '../../context/BusinessTypeContext';

export const TaxReturnInputForm: React.FC = () => {
    const [data, setData] = useState<TaxReturnInputData>(initialTaxReturnInputData);
    const [activeTab, setActiveTab] = useState<'table1' | 'table2' | 'blue'>('table1');
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);

    const { user } = useAuth();
    const { currentBusinessType } = useBusinessTypeContext();
    const { transactions } = useTransactions(user?.id, currentBusinessType?.business_type);

    // データ読み込み
    useEffect(() => {
        const loadedData = TaxReturnInputService.getData();
        setData(loadedData);
    }, []);

    // 変更ハンドラ wrapper
    const handleDataChange = (updates: Partial<TaxReturnInputData>) => {
        setData(prev => ({ ...prev, ...updates }));
        setHasUnsavedChanges(true);
        setSaveStatus('idle');
    };

    // 取引データからのインポート処理
    const handleImportFromTransactions = () => {
        if (!transactions || transactions.length === 0) {
            toast.error('取り込む取引データがありません');
            return;
        }

        if (!window.confirm('現在入力されているデータに、取引データから集計した値を加算・上書きしますか？\n（手動修正した内容は上書きされる可能性があります）')) {
            return;
        }

        try {
            const calculatedData = TaxReturnInputService.calculateDataFromTransactions(transactions);
            setData(prev => {
                const newData = { ...prev };
                if (calculatedData.income) {
                    newData.income = { ...newData.income, ...calculatedData.income };
                }
                if (calculatedData.deductions) {
                    const newDeductions = { ...newData.deductions };
                    (Object.keys(calculatedData.deductions) as Array<keyof typeof calculatedData.deductions>).forEach(key => {
                        const val = calculatedData.deductions![key];
                        if (val > 0) {
                            newDeductions[key] = val;
                        }
                    });
                    newData.deductions = newDeductions;
                }
                return newData;
            });
            setHasUnsavedChanges(true);
            toast.success('取引データを転記しました');
        } catch (error) {
            console.error('Import failed:', error);
            toast.error('データの転記に失敗しました');
        }
    };

    // 保存処理
    const handleSave = () => {
        setSaveStatus('saving');
        setTimeout(() => {
            TaxReturnInputService.saveData(data);
            setHasUnsavedChanges(false);
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        }, 500);
    };

    // TaxFormData変換ヘルパー
    const createTaxFormData = (isBlueReturn: boolean = false) => {
        const totalIncome = (data.income.business_agriculture || 0) +
            (data.income.employment || 0) +
            (data.income.miscellaneous_other || 0);
        const totalDeductions = (data.deductions.social_insurance || 0) +
            (data.deductions.life_insurance || 0) +
            (data.deductions.basic || 480000);
        const taxableIncome = Math.max(0, totalIncome - totalDeductions);

        return {
            name: currentBusinessType?.representative_name || user?.name || '',
            address: currentBusinessType?.address || '',
            phone: currentBusinessType?.phone || '',
            tradeName: currentBusinessType?.company_name || '',
            year: new Date().getFullYear(),
            month: 3,
            day: 15,
            revenue: data.income.business_agriculture || 0,
            costOfGoods: 0,
            expenses: 0,
            netIncome: data.income.business_agriculture || 0,
            expensesByCategory: [],
            deductions: {
                socialInsurance: data.deductions.social_insurance || 0,
                lifeInsurance: data.deductions.life_insurance || 0,
                basic: data.deductions.basic || 480000,
                medicalExpenses: data.deductions.medical_expenses || 0,
                blueReturn: isBlueReturn ? 650000 : 0,
            },
            businessIncome: data.income.business_agriculture || 0,
            salaryIncome: data.income.employment || 0,
            miscellaneousIncome: (data.income.miscellaneous_other || 0) + (data.income.miscellaneous_public_pension || 0),
            totalIncome: totalIncome,
            taxableIncome: taxableIncome,
            estimatedTax: 0,
            fiscalYear: data.fiscalYear,
            isBlueReturn: isBlueReturn,
        };
    };

    // PDF出力 - 確定申告書B
    const handleDownloadTaxReturnPDF = async () => {
        setIsGeneratingPdf(true);
        try {
            const taxFormData = createTaxFormData(false);
            const { pdfBytes, filename } = await generateFilledTaxForm('tax_return_b', taxFormData);
            downloadPDF(pdfBytes, filename);
            toast.success('確定申告書Bを出力しました');
        } catch (error: any) {
            console.error('PDF generation failed', error);
            toast.error(error.message || 'PDF出力に失敗しました');
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    // PDF出力 - 青色申告決算書
    const handleDownloadBlueReturnPDF = async () => {
        setIsGeneratingPdf(true);
        try {
            const taxFormData = createTaxFormData(true);
            const { pdfBytes, filename } = await generateFilledTaxForm('blue_return', taxFormData);
            downloadPDF(pdfBytes, filename);
            toast.success('青色申告決算書を出力しました');
        } catch (error: any) {
            console.error('PDF generation failed', error);
            toast.error(error.message || 'PDF出力に失敗しました');
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    // PDF出力 - 所得の内訳書
    const handleDownloadIncomeStatementPDF = async () => {
        setIsGeneratingPdf(true);
        try {
            const taxFormData = createTaxFormData(false);
            const { pdfBytes, filename } = await generateFilledTaxForm('income_statement', taxFormData);
            downloadPDF(pdfBytes, filename);
            toast.success('所得の内訳書を出力しました');
        } catch (error: any) {
            console.error('PDF generation failed', error);
            toast.error(error.message || 'PDF出力に失敗しました');
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    // PDF出力 - 公式テンプレート直接ダウンロード（転記機能なし）
    const handleDownloadOfficialTemplate = async (templatePath: string, displayName: string) => {
        setIsGeneratingPdf(true);
        try {
            const response = await fetch(templatePath);
            if (!response.ok) {
                throw new Error(`テンプレートの読み込みに失敗: ${response.statusText}`);
            }
            const pdfBytes = await response.arrayBuffer();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = `${displayName}_${data.fiscalYear}年度.pdf`;
            link.click();
            window.URL.revokeObjectURL(link.href);
            toast.success(`${displayName}を出力しました`);
        } catch (error: any) {
            console.error('PDF download failed', error);
            toast.error(error.message || 'PDF出力に失敗しました');
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    // 個人税PDF出力項目リスト
    const personalPdfItems = [
        {
            id: 'kakutei_1_2',
            name: '確定申告書 第一表・第二表',
            handler: handleDownloadTaxReturnPDF,
            hasAutoFill: true
        },
        {
            id: 'aoiro_kessan',
            name: '青色申告決算書',
            handler: handleDownloadBlueReturnPDF,
            hasAutoFill: true
        },
        {
            id: 'syotoku_aoiro',
            name: '所得税青色申告',
            handler: () => handleDownloadOfficialTemplate('/templates/syotokuaoiro.pdf', '所得税青色申告'),
            hasAutoFill: false
        },
        {
            id: 'uchiwake',
            name: '所得の内訳書',
            handler: handleDownloadIncomeStatementPDF,
            hasAutoFill: true
        },
    ];

    // プレビュー
    const handlePreviewPDF = async () => {
        setIsGeneratingPdf(true);
        try {
            const taxFormData = createTaxFormData(false);
            const { pdfBytes } = await generateFilledTaxForm('tax_return_b', taxFormData);
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

    const tabDetails = {
        table1: { label: '第一表（収入・控除）', icon: Activity },
        table2: { label: '第二表（内訳・詳細）', icon: CreditCard },
        blue: { label: '青色申告決算書', icon: FileText },
    };

    return (
        <div className="bg-background min-h-screen">
            <div className="max-w-[1280px] mx-auto px-4 py-8">
                {/* Main Page Header */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-xl sm:text-2xl font-bold text-text-main whitespace-nowrap">申告書入力エディタ</h1>
                    <p className="text-xs sm:text-base text-text-muted mt-1">
                        確定申告書・青色申告決算書の各項目を詳細に入力・編集します
                    </p>
                </div>

                {/* Styled Tabs Section */}
                <div className="mb-6 overflow-x-auto pb-2 scrollbar-hide">
                    <nav className="inline-flex bg-[#1e293b]/80 backdrop-blur-md p-1 rounded-full border border-white/10 min-w-max items-stretch">
                        {Object.entries(tabDetails).map(([id, detail]) => {
                            const Icon = detail.icon;
                            const isActive = activeTab === id;
                            const match = detail.label.match(/^(.+?)([（(].+[）)])$/);
                            const mainLabel = match ? match[1] : detail.label;
                            const subLabel = match ? match[2].replace(/[（()）]/g, '') : null;

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
                                            layoutId="activeTabIndicatorPersonal"
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

                {/* Main Content Area with Sidebar */}
                <div className="flex flex-col lg:flex-row bg-surface rounded-2xl shadow-xl border border-border overflow-hidden">
                    {/* Form Content */}
                    <div className="flex-1 p-6 overflow-auto">
                        {activeTab === 'table1' && (
                            <TaxReturnTable1Input data={data} onChange={handleDataChange} />
                        )}
                        {activeTab === 'table2' && (
                            <TaxReturnTable2Input data={data} onChange={handleDataChange} />
                        )}
                        {activeTab === 'blue' && (
                            <BlueReturnInput data={data} onChange={handleDataChange} />
                        )}
                    </div>

                    {/* Right Sidebar - Actions */}
                    <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-border bg-surface-highlight/5">
                        <div className="p-6 sticky top-0">
                            <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-4">アクション</h3>
                            <div className="space-y-3">
                                {/* 取引データ転記 */}
                                <button
                                    onClick={handleImportFromTransactions}
                                    className="w-full py-2.5 px-4 bg-transparent border-2 border-primary text-primary rounded-lg font-bold hover:bg-primary/10 transition-all flex items-center justify-center gap-2"
                                >
                                    <Upload className="w-4 h-4" />
                                    取引データ転記
                                </button>

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

                                {/* 公式PDF出力セクション */}
                                <div className="space-y-3">
                                    <div className="grid grid-cols-1 gap-1 border border-border rounded-xl overflow-hidden bg-surface shadow-inner">
                                        <div className="px-3 py-2 bg-surface-highlight text-[10px] font-bold text-text-muted uppercase border-b border-border tracking-wider flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                            公式PDF書類出力
                                        </div>
                                        <div className="divide-y divide-border">
                                            {personalPdfItems.map(item => (
                                                <button
                                                    key={item.id}
                                                    onClick={item.handler}
                                                    disabled={isGeneratingPdf}
                                                    className="w-full py-2.5 px-3 text-left text-sm text-text-main hover:bg-surface-highlight transition-colors flex items-center justify-between disabled:opacity-50"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span>{item.name}</span>
                                                        {!item.hasAutoFill && (
                                                            <span className="text-[9px] px-1.5 py-0.5 bg-surface-highlight text-text-muted rounded">テンプレート</span>
                                                        )}
                                                    </div>
                                                    {isGeneratingPdf ? (
                                                        <RefreshCw className="w-3 h-3 text-text-muted animate-spin" />
                                                    ) : (
                                                        <Download className="w-3 h-3 text-text-muted" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-border my-2"></div>

                            <button
                                onClick={() => {
                                    if (window.confirm('入力内容をすべてリセットしますか？')) {
                                        TaxReturnInputService.resetData();
                                        setData(initialTaxReturnInputData);
                                        setHasUnsavedChanges(true);
                                    }
                                }}
                                className="w-full py-2.5 px-4 bg-transparent text-text-muted rounded-lg font-medium hover:bg-red-50 hover:text-red-500 transition-colors flex items-center justify-center gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                リセット
                            </button>

                            {/* 開発者ツール */}
                            <a
                                href="/tools/coordinate_picker.html"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-2 px-4 bg-surface border border-border text-text-muted rounded-lg font-medium hover:bg-surface-highlight transition-colors flex items-center justify-center gap-2 text-sm"
                            >
                                <Wrench className="w-4 h-4" />
                                座標キャリブレーター
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* フッターナビ */}
            <div className="mt-8 flex justify-between">
                <p className="text-sm text-text-muted">
                    ※ ここで入力したデータはブラウザに保存され、PDF作成時に使用されます。
                </p>
            </div>

            {/* Preview Modal */}
            {showPreviewModal && previewBlobUrl && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                            <h3 className="font-bold text-text-main">プレビュー</h3>
                            <button
                                onClick={closePreviewModal}
                                className="text-text-muted hover:text-text-main transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="flex-1">
                            <iframe
                                src={previewBlobUrl ?? undefined}
                                className="w-full h-full"
                                title="PDF Preview"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
