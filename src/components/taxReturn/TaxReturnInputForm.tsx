import React, { useState, useEffect } from 'react';
import { TaxReturnInputData, initialTaxReturnInputData } from '../../types/taxReturnInput';
import { TaxReturnInputService } from '../../services/TaxReturnInputService';
import { TaxReturnTable1Input } from './TaxReturnTable1Input';
import { TaxReturnTable2Input } from './TaxReturnTable2Input';
import { BlueReturnInput } from './BlueReturnInput';
import { Save, RefreshCw, FileText, Activity, CreditCard, Download, Wrench, ArrowRight } from 'lucide-react';
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

    // PDF出力 - 確定申告書B
    const handleDownloadTaxReturnPDF = async () => {
        setIsGeneratingPdf(true);
        try {
            // TaxReturnInputDataを TaxFormData形式に変換
            const totalIncome = (data.income.business_agriculture || 0) +
                (data.income.employment || 0) +
                (data.income.miscellaneous_other || 0);
            const totalDeductions = (data.deductions.social_insurance || 0) +
                (data.deductions.life_insurance || 0) +
                (data.deductions.basic || 480000);
            const taxableIncome = Math.max(0, totalIncome - totalDeductions);

            const taxFormData = {
                name: '',
                address: '',
                phone: '',
                year: new Date().getFullYear(),
                month: 3,
                day: 15,
                revenue: data.income.business_agriculture || 0,
                expenses: 0,
                netIncome: data.income.business_agriculture || 0,
                expensesByCategory: [],
                deductions: {
                    social_insurance: data.deductions.social_insurance || 0,
                    life_insurance: data.deductions.life_insurance || 0,
                    basic: data.deductions.basic || 480000,
                },
                businessIncome: data.income.business_agriculture || 0,
                salaryIncome: data.income.employment || 0,
                miscellaneousIncome: data.income.miscellaneous_other + data.income.miscellaneous_public_pension || 0,
                totalIncome: totalIncome,
                socialInsurance: data.deductions.social_insurance || 0,
                lifeInsurance: data.deductions.life_insurance || 0,
                medicalExpenses: data.deductions.medical_expenses || 0,
                basicDeduction: data.deductions.basic || 480000,
                taxableIncome: taxableIncome,
                estimatedTax: 0,
                fiscalYear: data.fiscalYear,
                isBlueReturn: false,
            };

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
            const taxFormData = {
                name: '',
                tradeName: '',
                address: '',
                year: new Date().getFullYear(),
                month: 3,
                day: 15,
                revenue: data.income.business_agriculture || 0,
                costOfGoods: 0,
                expenses: 0,
                netIncome: data.income.business_agriculture || 0,
                expensesByCategory: [],
                deductions: {
                    social_insurance: data.deductions.social_insurance || 0,
                    basic: data.deductions.basic || 480000,
                },
                blueReturnDeduction: 650000,
                taxableIncome: Math.max(0, (data.income.business_agriculture || 0) - 650000),
                estimatedTax: 0,
                fiscalYear: data.fiscalYear,
                isBlueReturn: true,
            };

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

    return (
        <div className="bg-background min-h-screen">
            <div className="max-w-4xl mx-auto px-4 py-8">

                {/* ヘッダー */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-text-main whitespace-nowrap">申告書入力エディタ</h1>
                        <p className="text-xs sm:text-base text-text-muted mt-1">
                            申告書に記載する詳細情報を手動で入力・編集します
                        </p>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button
                            onClick={handleImportFromTransactions}
                            className="btn-outline whitespace-nowrap px-2 py-2 text-xs sm:px-4 sm:text-sm h-8 sm:h-10"
                            title="収入や一部の控除を取引履歴から自動集計して入力します"
                        >
                            <Download className="w-3 h-3 mr-1 sm:w-4 sm:mr-2" />
                            取引データ転記
                        </button>
                        <button
                            onClick={() => {
                                if (window.confirm('入力内容をすべてリセットしますか？')) {
                                    TaxReturnInputService.resetData();
                                    setData(initialTaxReturnInputData);
                                    setHasUnsavedChanges(true);
                                }
                            }}
                            className="btn-ghost whitespace-nowrap px-2 py-2 text-xs sm:px-4 sm:text-sm h-8 sm:h-10"
                        >
                            <RefreshCw className="w-3 h-3 mr-1 sm:w-4 sm:mr-2" />
                            リセット
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!hasUnsavedChanges && saveStatus !== 'saved'}
                            className={`btn-primary whitespace-nowrap px-3 py-2 text-xs sm:px-4 sm:text-sm h-8 sm:h-10 min-w-0 sm:min-w-[140px] ${saveStatus === 'saved' ? 'bg-success hover:bg-success' : ''}`}
                        >
                            {saveStatus === 'saving' ? (
                                <>
                                    <RefreshCw className="w-3 h-3 mr-1 sm:w-4 sm:mr-2 animate-spin" />
                                    保存中...
                                </>
                            ) : saveStatus === 'saved' ? (
                                <>保存しました</>
                            ) : (
                                <>
                                    <Save className="w-3 h-3 mr-1 sm:w-4 sm:mr-2" />
                                    {hasUnsavedChanges ? '保存する' : '保存済み'}
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* タブナビゲーション */}
                <div className="bg-surface rounded-xl shadow-sm border border-border mb-6 overflow-hidden">
                    <div className="flex overflow-x-auto">
                        <TabButton
                            active={activeTab === 'table1'}
                            onClick={() => setActiveTab('table1')}
                            icon={Activity}
                            label="第一表 (収入・控除)"
                        />
                        <TabButton
                            active={activeTab === 'table2'}
                            onClick={() => setActiveTab('table2')}
                            icon={CreditCard}
                            label="第二表 (内訳・詳細)"
                        />
                        <TabButton
                            active={activeTab === 'blue'}
                            onClick={() => setActiveTab('blue')}
                            icon={FileText}
                            label="青色申告決算書"
                        />
                    </div>
                </div>

                {/* フォームコンテンツ */}
                <div className="bg-surface rounded-xl shadow-sm border border-border p-6 animate-in fade-in duration-300">
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

                {/* PDF出力セクション */}
                <div className="mt-6 bg-surface rounded-xl shadow-sm border border-border p-5">
                    <h3 className="text-sm font-bold text-text-main mb-4 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        公式書類PDF出力
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                            onClick={handleDownloadTaxReturnPDF}
                            disabled={isGeneratingPdf}
                            className="py-3 px-4 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
                        >
                            {isGeneratingPdf ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <FileText className="w-4 h-4" />
                            )}
                            確定申告書B (第一表・第二表)
                        </button>
                        <button
                            onClick={handleDownloadBlueReturnPDF}
                            disabled={isGeneratingPdf}
                            className="py-3 px-4 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
                        >
                            {isGeneratingPdf ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <FileText className="w-4 h-4" />
                            )}
                            青色申告決算書
                        </button>
                    </div>
                </div>

                {/* 開発者ツール */}
                <div className="mt-4 bg-surface rounded-xl shadow-sm border border-border p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Wrench className="w-5 h-5 text-text-muted" />
                            <div>
                                <p className="font-medium text-text-main text-sm">PDF座標キャリブレーター</p>
                                <p className="text-xs text-text-muted">公式PDFフォームの座標調整ツール</p>
                            </div>
                        </div>
                        <a
                            href="/tools/coordinate_picker.html"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-ghost text-sm flex items-center gap-1"
                        >
                            開く
                            <ArrowRight className="w-4 h-4" />
                        </a>
                    </div>
                </div>

                {/* フッターナビ */}
                <div className="mt-8 flex justify-between">
                    <p className="text-sm text-text-muted">
                        ※ ここで入力したデータはブラウザに保存され、PDF作成時に使用されます。
                    </p>
                </div>
            </div>
        </div>
    );
};

const TabButton: React.FC<{
    active: boolean;
    onClick: () => void;
    icon: React.ElementType;
    label: string;
}> = ({ active, onClick, icon: Icon, label }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-colors whitespace-nowrap border-b-2 ${active
            ? 'border-primary text-primary bg-primary-light/10'
            : 'border-transparent text-text-muted hover:text-text-main hover:bg-surface-highlight'
            }`}
    >
        <Icon className={`w-4 h-4 ${active ? 'text-primary' : 'text-text-muted'}`} />
        {label}
    </button>
);
