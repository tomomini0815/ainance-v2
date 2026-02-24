import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    ArrowRight,
    Building2,
    FileText,
    Calculator,
    Check,
    CheckCircle,
    Download,
    Info,
    AlertCircle,
    RefreshCw,
    Copy,
    Wallet,
    PiggyBank,
    BookOpen,
    Edit,
    Wrench,
    Upload,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTransactions } from '../hooks/useTransactions';
import { useBusinessTypeContext } from '../context/BusinessTypeContext';
import { yearlySettlementService, YearlySettlement } from '../services/yearlySettlementService';
import { yearlyBalanceSheetService, YearlyBalanceSheet } from '../services/yearlyBalanceSheetService';
import PreviousYearImportModal from '../components/PreviousYearImportModal';
import {
    CorporateInfo,
    FinancialData,
    CorporateTaxResult,
    ConsumptionTaxResult,
    calculateAllCorporateTaxes,
    calculateConsumptionTax,
    generateFinancialDataFromTransactions,
    extractDepreciationAssetsFromTransactions,
    formatCurrency,
    formatPercentage,
    DepreciationAsset,
} from '../services/CorporateTaxService';
import { CorporateTaxInputService } from '../services/CorporateTaxInputService';
import { initialCorporateTaxInputData } from '../types/corporateTaxInput';
import DepreciationCalculator from '../components/DepreciationCalculator';
import {
    generateCorporateTaxPDF,
    generateFinancialStatementPDF,
    JpTaxFormData,
} from '../services/pdfJapaneseService';
import { CsvExportService } from '../services/CsvExportService';
import toast from 'react-hot-toast';

import WizardProgress from '../components/quickTaxFiling/WizardProgress';

// ステップ定義
const WIZARD_STEPS = [
    { id: 1, title: '会社情報', icon: Building2, description: '会社基本情報の入力' },
    { id: 2, title: '減価償却', icon: Calculator, description: '資産の登録と計算' },
    { id: 3, title: '損益計算', icon: FileText, description: '売上・経費の確認' },
    { id: 4, title: '法人税計算', icon: PiggyBank, description: '法人税等の計算' },
    { id: 5, title: '消費税確認', icon: Wallet, description: '消費税の確認' },
    { id: 6, title: '書類作成', icon: Download, description: 'PDF出力' },
];

// 抽象的なステップコンポーネントのProps定義
interface Step1Props {
    corporateInfo: CorporateInfo;
    setCorporateInfo: React.Dispatch<React.SetStateAction<CorporateInfo>>;
    handleInfoChange: (updates: Partial<CorporateInfo>) => void;
    handleTranscribe: () => void;
    prevYearSettlement: YearlySettlement | null;
    prevYearBS: YearlyBalanceSheet | null;
    setIsImportModalOpen: (open: boolean) => void;
}

interface Step3Props {
    financialData: FinancialData;
    corporateInfo: CorporateInfo;
    prevYearSettlement: YearlySettlement | null;
    showComparison: boolean;
    setShowComparison: (show: boolean) => void;
}

interface Step4Props {
    taxResult: CorporateTaxResult;
    corporateInfo: CorporateInfo;
    handleCopy: (value: string | number, fieldName: string) => void;
    copiedField: string | null;
}

interface Step5Props {
    consumptionTaxResult: ConsumptionTaxResult;
}

interface Step6Props {
    corporateInfo: CorporateInfo;
    financialData: FinancialData;
    taxResult: CorporateTaxResult;
    isLoading: boolean;
    generatePDF: (type: 'corporate' | 'financial') => Promise<void>;
    handleOpenInEditor: () => void;
}

// ステップ1: 会社情報
const Step1CompanyInfo: React.FC<Step1Props> = ({ corporateInfo, setCorporateInfo, handleInfoChange, handleTranscribe, prevYearSettlement, prevYearBS, setIsImportModalOpen }) => (
    <div className="space-y-6">
        {/* 前期データ取込の案内 */}
        <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Upload className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-text-main mb-1">前期データの引き継ぎ</h4>
                    <p className="text-sm text-text-muted mb-4">
                        前期の決算データを取り込むことで、今期の収支比較やBSの期首残高設定がスムーズに行えます。
                    </p>
                    <div className="flex flex-wrap gap-3">
                        {prevYearSettlement ? (
                            <div className="flex items-center gap-2 text-sm text-success font-medium">
                                <CheckCircle className="w-4 h-4" />
                                {prevYearSettlement.year}年度のデータが取込済みです
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsImportModalOpen(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                            >
                                <Upload className="w-4 h-4" />
                                前期データをインポート
                            </button>
                        )}
                        <Link
                            to="/settlement-history"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-surface-highlight border border-border text-text-muted hover:text-text-main rounded-lg transition-colors text-sm font-medium"
                        >
                            <FileText className="w-4 h-4" />
                            履歴・引継ぎ管理
                        </Link>
                    </div>
                </div>
            </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h3 className="text-lg font-semibold text-text-main mb-1">会社基本情報</h3>
                <p className="text-text-muted">
                    法人税申告に必要な会社情報を入力してください。
                </p>
            </div>
            <div className="flex flex-col items-end gap-2">
                <button
                    onClick={handleTranscribe}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg hover:bg-primary/20 transition-colors text-primary text-sm font-medium whitespace-nowrap"
                >
                    <RefreshCw className="w-4 h-4" />
                    登録データから転記
                </button>
            </div>
        </div>

        {prevYearBS ? (
            <div className="bg-success-light border border-success/20 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm text-text-main font-medium">前期データ（バトンタッチ）の適用中</p>
                    <p className="text-sm text-text-muted mt-1">
                        {prevYearBS.year}年度の確定済み決算データから、期首残高（資本金・利益剰余金など）を自動的に引き継いでいます。
                    </p>
                </div>
            </div>
        ) : (
            <div className="bg-warning-light border border-warning/20 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm text-text-main font-medium">前期データの登録をお勧めします</p>
                    <p className="text-sm text-text-muted mt-1">
                        「過去決算・引継ぎ管理」に前年度のB/Sを登録すると、期首残高が自動でバトンタッチ（引き継ぎ）されます。
                    </p>
                </div>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-text-main mb-2">
                    会社名 <span className="text-error">*</span>
                </label>
                <input
                    type="text"
                    value={corporateInfo.companyName}
                    onChange={(e) => setCorporateInfo({ ...corporateInfo, companyName: e.target.value })}
                    className="input-base"
                    placeholder="株式会社〇〇"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-text-main mb-2">
                    代表者名
                </label>
                <input
                    type="text"
                    value={corporateInfo.representativeName}
                    onChange={(e) => setCorporateInfo({ ...corporateInfo, representativeName: e.target.value })}
                    className="input-base"
                    placeholder="山田 太郎"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-text-main mb-2">
                    法人番号
                </label>
                <input
                    type="text"
                    value={corporateInfo.corporateNumber}
                    onChange={(e) => setCorporateInfo({ ...corporateInfo, corporateNumber: e.target.value })}
                    className="input-base"
                    placeholder="1234567890123"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-text-main mb-2">
                    資本金
                </label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">¥</span>
                    <input
                        type="number"
                        value={corporateInfo.capital}
                        onChange={(e) => setCorporateInfo({ ...corporateInfo, capital: Number(e.target.value) })}
                        className="input-base pl-8"
                    />
                </div>
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-main mb-2">
                    所在地
                </label>
                <input
                    type="text"
                    value={corporateInfo.address}
                    onChange={(e) => setCorporateInfo({ ...corporateInfo, address: e.target.value })}
                    className="input-base"
                    placeholder="東京都渋谷区..."
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-text-main mb-2">
                    事業年度（開始）
                </label>
                <input
                    type="date"
                    value={corporateInfo.fiscalYearStart}
                    onChange={(e) => handleInfoChange({ fiscalYearStart: e.target.value })}
                    className="input-base"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-text-main mb-2">
                    事業年度（終了）
                </label>
                <input
                    type="date"
                    value={corporateInfo.fiscalYearEnd}
                    onChange={(e) => handleInfoChange({ fiscalYearEnd: e.target.value })}
                    className="input-base"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-text-main mb-2">
                    所轄税務署
                </label>
                <input
                    type="text"
                    value={corporateInfo.taxOffice || ''}
                    onChange={(e) => handleInfoChange({ taxOffice: e.target.value })}
                    className="input-base"
                    placeholder="例：芝税務署"
                />
            </div>
        </div>

        <div className="bg-info-light border border-info/20 rounded-lg p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
            <div>
                <p className="text-sm text-text-main font-medium">中小法人の税制優遇</p>
                <p className="text-sm text-text-muted mt-1">
                    資本金1億円以下の中小法人は、年800万円以下の所得に対して15%の軽減税率が適用されます。
                </p>
            </div>
        </div>
    </div>
);

// ステップ2: 減価償却
interface Step2Props {
    assets: DepreciationAsset[];
    onDepreciationCalculate: (total: number, assets: DepreciationAsset[]) => void;
    handleTranscribe: () => void;
}

const Step2Depreciation: React.FC<Step2Props> = ({ assets, onDepreciationCalculate, handleTranscribe }) => (
    <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h3 className="text-lg font-semibold text-text-main mb-1">減価償却資産の登録</h3>
                <p className="text-text-muted">
                    10万円以上の資産や、減価償却が必要な資産を登録してください。
                </p>
            </div>
            <button
                onClick={handleTranscribe}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg hover:bg-primary/20 transition-colors text-primary text-sm font-medium whitespace-nowrap"
            >
                <RefreshCw className="w-4 h-4" />
                取引データから転記
            </button>
        </div>

        <DepreciationCalculator
            initialAssets={assets}
            onCalculate={onDepreciationCalculate}
        />
    </div>
);

// ステップ3: 損益計算
const Step3ProfitLoss: React.FC<Step3Props> = ({ financialData, corporateInfo, prevYearSettlement, showComparison, setShowComparison }) => (
    <div className="space-y-6">
        <div>
            <h3 className="text-lg font-semibold text-text-main mb-4">損益計算書</h3>
            <p className="text-text-muted mb-6">
                {corporateInfo.fiscalYear}年度の取引データから自動集計した結果です。
            </p>
        </div>

        {/* 前期比較トグル */}
        {prevYearSettlement && (
            <div className="flex items-center justify-between bg-surface border border-border rounded-xl p-4">
                <div className="flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-primary" />
                    <div>
                        <span className="font-medium text-text-main block">前期 ({prevYearSettlement.year}年度) と比較</span>
                        <span className="text-xs text-text-muted">収益・費用の増減を確認できます</span>
                    </div>
                </div>
                <button
                    onClick={() => setShowComparison(!showComparison)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${showComparison ? 'bg-primary' : 'bg-border'
                        }`}
                >
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showComparison ? 'translate-x-6' : 'translate-x-1'
                            }`}
                    />
                </button>
            </div>
        )}

        {/* 損益サマリー */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-success-light border border-success/20 rounded-xl p-5">
                <p className="text-sm text-success font-medium">売上高</p>
                <p className="text-2xl font-bold text-text-main mt-1">
                    {formatCurrency(financialData.revenue)}
                </p>
                {showComparison && prevYearSettlement && (
                    <p className={`text-xs mt-2 font-medium ${financialData.revenue >= prevYearSettlement.revenue ? 'text-success' : 'text-error'}`}>
                        {financialData.revenue >= prevYearSettlement.revenue ? '↑' : '↓'}
                        {formatCurrency(Math.abs(financialData.revenue - prevYearSettlement.revenue))}
                        <span className="text-text-muted ml-1 font-normal">({prevYearSettlement.year}度: {formatCurrency(prevYearSettlement.revenue)})</span>
                    </p>
                )}
            </div>
            <div className="bg-error-light border border-error/20 rounded-xl p-5">
                <p className="text-sm text-error font-medium">販管費</p>
                <p className="text-2xl font-bold text-text-main mt-1">
                    {formatCurrency(financialData.operatingExpenses)}
                </p>
                {showComparison && prevYearSettlement && (
                    <p className={`text-xs mt-2 font-medium ${financialData.operatingExpenses <= prevYearSettlement.operating_expenses ? 'text-success' : 'text-error'}`}>
                        {financialData.operatingExpenses <= prevYearSettlement.operating_expenses ? '↓' : '↑'}
                        {formatCurrency(Math.abs(financialData.operatingExpenses - prevYearSettlement.operating_expenses))}
                        <span className="text-text-muted ml-1 font-normal">({prevYearSettlement.year}度: {formatCurrency(prevYearSettlement.operating_expenses)})</span>
                    </p>
                )}
            </div>
            <div className="bg-primary-light border border-primary/20 rounded-xl p-5">
                <p className="text-sm text-primary font-medium">経常利益</p>
                <p className="text-2xl font-bold text-text-main mt-1">
                    {formatCurrency(financialData.ordinaryIncome)}
                </p>
                {showComparison && prevYearSettlement && (
                    <p className={`text-xs mt-2 font-medium ${financialData.ordinaryIncome >= (prevYearSettlement.net_income) ? 'text-success' : 'text-error'}`}>
                        {financialData.ordinaryIncome >= (prevYearSettlement.net_income) ? '↑' : '↓'}
                        {formatCurrency(Math.abs(financialData.ordinaryIncome - (prevYearSettlement.net_income)))}
                    </p>
                )}
            </div>
        </div>

        {/* 損益計算書詳細 */}
        <div className="bg-surface border border-border rounded-xl p-5">
            <h4 className="font-medium text-text-main mb-4">損益計算書</h4>
            <div className="space-y-2">
                <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-text-muted">売上高</span>
                    <span className="font-medium text-text-main">{formatCurrency(financialData.revenue)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-text-muted">売上原価</span>
                    <span className="font-medium text-text-main">{formatCurrency(financialData.costOfSales)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border bg-surface-highlight px-2 -mx-2">
                    <span className="font-medium text-text-main">売上総利益</span>
                    <span className="font-bold text-text-main">{formatCurrency(financialData.grossProfit)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-text-muted">販売費及び一般管理費</span>
                    <span className="font-medium text-error">{formatCurrency(financialData.operatingExpenses)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border bg-primary-light px-2 -mx-2">
                    <span className="font-medium text-text-main">営業利益</span>
                    <span className="font-bold text-primary">{formatCurrency(financialData.operatingIncome)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-text-muted">営業外損益</span>
                    <span className="font-medium text-text-main">{formatCurrency(financialData.nonOperatingIncome - financialData.nonOperatingExpenses)}</span>
                </div>
                <div className="flex justify-between py-2 bg-success-light px-2 -mx-2 rounded">
                    <span className="font-bold text-text-main">税引前当期純利益</span>
                    <span className="font-bold text-success">{formatCurrency(financialData.incomeBeforeTax)}</span>
                </div>
            </div>
        </div>

        {/* 経費内訳 */}
        {financialData.expensesByCategory.length > 0 && (
            <div className="bg-surface border border-border rounded-xl p-5">
                <h4 className="font-medium text-text-main mb-4">経費内訳（上位5件）</h4>
                <div className="space-y-3">
                    {financialData.expensesByCategory.slice(0, 5).map((cat, index) => (
                        <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-surface-highlight rounded-lg flex items-center justify-center text-sm font-medium text-text-muted">
                                    {index + 1}
                                </div>
                                <span className="text-text-main">{cat.category}</span>
                            </div>
                            <span className="font-medium text-text-main">{formatCurrency(cat.amount)}</span>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
);

// ステップ4: 法人税計算
const Step3CorporateTax: React.FC<Step4Props> = ({ taxResult, corporateInfo, handleCopy, copiedField }) => (
    <div className="space-y-6">
        <div>
            <h3 className="text-lg font-semibold text-text-main mb-4">法人税等の計算</h3>
            <p className="text-text-muted mb-6">
                課税所得に基づいて法人税等を自動計算しました。
            </p>
        </div>

        {/* 税金サマリー */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-surface border border-border rounded-xl p-5">
                <p className="text-sm text-text-muted">課税所得</p>
                <p className="text-2xl font-bold text-text-main mt-1">
                    {formatCurrency(taxResult.taxableIncome)}
                </p>
            </div>
            <div className="bg-primary-light border border-primary/20 rounded-xl p-5">
                <p className="text-sm text-primary font-medium">法人税等合計</p>
                <p className="text-2xl font-bold text-text-main mt-1">
                    {formatCurrency(taxResult.totalTax)}
                </p>
                <p className="text-xs text-text-muted mt-2">
                    実効税率: {formatPercentage(taxResult.effectiveTaxRate)}
                </p>
            </div>
        </div>

        {/* 税金内訳 */}
        <div className="bg-surface border border-border rounded-xl divide-y divide-border">
            <div className="p-4">
                <h4 className="font-medium text-text-main">法人税等の内訳</h4>
            </div>
            <div className="p-4 flex justify-between items-center">
                <div>
                    <span className="text-text-main">法人税</span>
                    {corporateInfo.capital <= 100000000 && (
                        <span className="ml-2 text-xs text-success bg-success-light px-2 py-0.5 rounded">中小法人軽減</span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-medium text-text-main">{formatCurrency(taxResult.corporateTax)}</span>
                    <button
                        onClick={() => handleCopy(taxResult.corporateTax, 'corporateTax')}
                        className={`p-1.5 rounded transition-colors ${copiedField === 'corporateTax' ? 'bg-success text-white' : 'hover:bg-surface-highlight text-text-muted'}`}
                    >
                        {copiedField === 'corporateTax' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                </div>
            </div>
            <div className="p-4 flex justify-between items-center">
                <span className="text-text-main">地方法人税</span>
                <span className="font-medium text-text-main">{formatCurrency(taxResult.localCorporateTax)}</span>
            </div>
            <div className="p-4 flex justify-between items-center">
                <span className="text-text-main">法人住民税</span>
                <span className="font-medium text-text-main">{formatCurrency(taxResult.corporateInhabitantTax)}</span>
            </div>
            <div className="p-4 flex justify-between items-center">
                <span className="text-text-main">法人事業税</span>
                <span className="font-medium text-text-main">{formatCurrency(taxResult.businessTax)}</span>
            </div>
            <div className="p-4 flex justify-between items-center bg-primary-light">
                <span className="font-bold text-text-main">税金合計</span>
                <span className="font-bold text-primary text-lg">{formatCurrency(taxResult.totalTax)}</span>
            </div>
        </div>

        {/* 当期純利益 */}
        <div className="bg-success-light border border-success/20 rounded-xl p-5 flex items-center justify-between">
            <span className="font-medium text-text-main">当期純利益</span>
            <span className="text-2xl font-bold text-success">{formatCurrency(taxResult.netIncome)}</span>
        </div>

        {taxResult.taxableIncome <= 0 && (
            <div className="bg-warning-light border border-warning/20 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm text-text-main font-medium">課税所得がありません</p>
                    <p className="text-sm text-text-muted mt-1">
                        今期は課税所得がないため、法人税は発生しません（均等割のみ発生）。
                    </p>
                </div>
            </div>
        )}
    </div>
);

// ステップ5: 消費税確認
const Step4ConsumptionTax: React.FC<Step5Props> = ({ consumptionTaxResult }) => (
    <div className="space-y-6">
        <div>
            <h3 className="text-lg font-semibold text-text-main mb-4">消費税の確認</h3>
            <p className="text-text-muted mb-6">
                売上・仕入に係る消費税を集計しました。
            </p>
        </div>

        <div className="bg-surface border border-border rounded-xl divide-y divide-border">
            <div className="p-4">
                <h4 className="font-medium text-text-main">消費税計算</h4>
            </div>
            <div className="p-4 flex justify-between items-center">
                <span className="text-text-main">課税売上高</span>
                <span className="font-medium text-text-main">{formatCurrency(consumptionTaxResult.taxableRevenue)}</span>
            </div>
            <div className="p-4 flex justify-between items-center">
                <span className="text-text-main">売上に係る消費税</span>
                <span className="font-medium text-text-main">{formatCurrency(consumptionTaxResult.outputTax)}</span>
            </div>
            <div className="p-4 flex justify-between items-center">
                <span className="text-text-main">課税仕入高</span>
                <span className="font-medium text-text-main">{formatCurrency(consumptionTaxResult.taxablePurchases)}</span>
            </div>
            <div className="p-4 flex justify-between items-center">
                <span className="text-text-main">仕入に係る消費税</span>
                <span className="font-medium text-error">{formatCurrency(consumptionTaxResult.inputTax)}</span>
            </div>
            <div className="p-4 flex justify-between items-center bg-primary-light">
                <span className="font-bold text-text-main">納付消費税額（国税）</span>
                <span className="font-bold text-primary">{formatCurrency(consumptionTaxResult.netConsumptionTax)}</span>
            </div>
            <div className="p-4 flex justify-between items-center">
                <span className="text-text-main">地方消費税</span>
                <span className="font-medium text-text-main">{formatCurrency(consumptionTaxResult.localConsumptionTax)}</span>
            </div>
            <div className="p-4 flex justify-between items-center bg-success-light">
                <span className="font-bold text-text-main">消費税等合計</span>
                <span className="font-bold text-success text-lg">{formatCurrency(consumptionTaxResult.totalConsumptionTax)}</span>
            </div>
        </div>

        <div className="bg-info-light border border-info/20 rounded-lg p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
            <div>
                <p className="text-sm text-text-main font-medium">免税事業者の確認</p>
                <p className="text-sm text-text-muted mt-1">
                    基準期間の課税売上高が1,000万円以下の場合、消費税の納税義務が免除される場合があります。
                </p>
            </div>
        </div>
    </div>
);

// ステップ6: 書類作成
const Step5Documents: React.FC<Step6Props> = ({ corporateInfo, financialData, taxResult, isLoading, generatePDF, handleOpenInEditor }) => (
    <div className="space-y-6">
        <div>
            <h3 className="text-lg font-semibold text-text-main mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                書類の作成・ダウンロード
            </h3>
            <p className="text-text-muted mb-6">
                入力内容を確認して、必要な書類をダウンロードしてください。
            </p>
        </div>

        {/* データ確認 */}
        <div className="bg-surface border border-border rounded-xl divide-y divide-border">
            <div className="p-4 flex justify-between items-center">
                <span className="text-text-muted">会社名</span>
                <span className="font-medium text-text-main">{corporateInfo.companyName || '（未入力）'}</span>
            </div>
            <div className="p-4 flex justify-between items-center">
                <span className="text-text-muted">事業年度</span>
                <span className="font-medium text-text-main">{corporateInfo.fiscalYear}年度</span>
            </div>
            <div className="p-4 flex justify-between items-center">
                <span className="text-text-muted">売上高</span>
                <span className="font-medium text-success">{formatCurrency(financialData.revenue)}</span>
            </div>
            <div className="p-4 flex justify-between items-center">
                <span className="text-text-muted">営業外収益</span>
                <span className="font-medium text-success">{formatCurrency(financialData.nonOperatingIncome)}</span>
            </div>
            <div className="p-4 flex justify-between items-center">
                <span className="text-text-muted">経常利益</span>
                <span className="font-medium text-primary">{formatCurrency(financialData.ordinaryIncome)}</span>
            </div>
            <div className="p-4 flex justify-between items-center">
                <span className="text-text-muted">法人税等</span>
                <span className="font-medium text-error">{formatCurrency(taxResult.totalTax)}</span>
            </div>
            <div className="p-4 flex justify-between items-center bg-success-light">
                <span className="font-bold text-text-main">当期純利益</span>
                <span className="font-bold text-success">{formatCurrency(taxResult.netIncome)}</span>
            </div>
        </div>

        {/* ダウンロードボタン */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
                onClick={() => generatePDF('financial')}
                disabled={isLoading}
                className="flex items-center justify-between p-6 bg-surface border border-border rounded-xl hover:border-primary hover:bg-primary/5 hover:shadow-md transition-all group w-full"
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        {isLoading ? (
                            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                        ) : (
                            <FileText className="w-6 h-6 text-primary" />
                        )}
                    </div>
                    <div className="text-left">
                        <p className="font-bold text-text-main text-lg">損益計算書・貸借対照表</p>
                        <p className="text-sm text-text-muted mt-0.5">当期の決算状況をPDFで出力</p>
                    </div>
                </div>
                {!isLoading && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-bold shadow-sm transition-transform group-hover:scale-105">
                        <Download className="w-4 h-4" />
                        <span>ダウンロード</span>
                    </div>
                )}
            </button>

            <button
                onClick={() => {
                    if (financialData) {
                        const csv = CsvExportService.generateFinancialStatementCSV({
                            ...corporateInfo,
                            ...financialData,
                            fiscalYear: corporateInfo.fiscalYear,
                            taxableIncome: taxResult.taxableIncome,
                            estimatedTax: taxResult.totalTax
                        } as any);
                        CsvExportService.downloadCSV(csv, `financial_statements_${corporateInfo.companyName}_${corporateInfo.fiscalYear}.csv`);
                        toast.success('財務諸表CSVを出力しました');
                    }
                }}
                disabled={isLoading}
                className="flex items-center justify-between p-6 bg-surface border border-border rounded-xl hover:border-primary hover:bg-primary/5 hover:shadow-md transition-all group w-full"
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                        <BookOpen className="w-6 h-6 text-indigo-500" />
                    </div>
                    <div className="text-left">
                        <p className="font-bold text-text-main text-lg">財務諸表データ(CSV)</p>
                        <p className="text-sm text-text-muted mt-0.5">e-Taxソフト等への取込用</p>
                    </div>
                </div>
                {!isLoading && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500 text-white rounded-lg text-sm font-bold shadow-sm transition-transform group-hover:scale-105">
                        <Download className="w-4 h-4" />
                        <span>CSV出力</span>
                    </div>
                )}
            </button>

            <button
                onClick={() => generatePDF('corporate')}
                disabled={isLoading}
                className="flex items-center justify-between p-6 bg-surface border border-border rounded-xl hover:border-primary hover:bg-primary/5 hover:shadow-md transition-all group w-full lg:col-span-2"
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        {isLoading ? (
                            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                        ) : (
                            <Building2 className="w-6 h-6 text-primary" />
                        )}
                    </div>
                    <div className="text-left">
                        <p className="font-bold text-text-main text-lg">法人税申告書（詳細）</p>
                        <p className="text-sm text-text-muted mt-0.5">別表を含めた法人税申告のドラフト版</p>
                    </div>
                </div>
                {!isLoading && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-bold shadow-sm transition-transform group-hover:scale-105">
                        <Download className="w-4 h-4" />
                        <span>ダウンロード</span>
                    </div>
                )}
            </button>
        </div>

        {/* 詳細エディタへのリンク */}
        <div className="bg-surface-highlight rounded-xl p-5 border border-border">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h4 className="font-bold text-text-main flex items-center gap-2">
                        <Edit className="w-5 h-5 text-primary" />
                        申告書を詳細に編集する
                    </h4>
                    <p className="text-sm text-text-muted mt-1">
                        別表の調整や、細かい数字の修正が必要な場合は、詳細エディタをご利用ください。
                    </p>
                </div>
                <button
                    onClick={handleOpenInEditor}
                    className="btn-secondary whitespace-nowrap"
                >
                    詳細エディタで開く
                    <ArrowRight className="w-4 h-4 ml-2" />
                </button>
            </div>
        </div>

        {/* 注意事項 */}
        <div className="bg-warning-light border border-warning/20 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
                <p className="text-sm text-text-main font-medium">ご注意</p>
                <p className="text-sm text-text-muted mt-1">
                    この書類は参考資料です。正式な法人税申告は税理士にご相談いただくか、
                    e-Taxにて提出してください。
                </p>
            </div>
        </div>

        {/* 開発者ツール */}
        <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Wrench className="w-5 h-5 text-text-muted" />
                    <div>
                        <p className="font-medium text-text-main">PDF座標キャリブレーター</p>
                        <p className="text-sm text-text-muted">公式PDFフォームの座標調整ツール</p>
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
    </div>
);

const CorporateTaxFilingPage: React.FC = () => {
    const { user } = useAuth();
    const { currentBusinessType } = useBusinessTypeContext();
    const { transactions } = useTransactions(user?.id, currentBusinessType?.business_type);
    const navigate = useNavigate();

    // ウィザード状態
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    // 前年度データ
    const [prevYearSettlement, setPrevYearSettlement] = useState<YearlySettlement | null>(null);
    const [prevYearBS, setPrevYearBS] = useState<YearlyBalanceSheet | null>(null);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [showComparison, setShowComparison] = useState(false);

    // 前年度データを取得
    React.useEffect(() => {
        const fetchPrevData = async () => {
            if (user?.id && currentBusinessType?.business_type) {
                try {
                    const latest = await yearlySettlementService.getLatest(user.id, currentBusinessType.business_type);
                    setPrevYearSettlement(latest);

                    // BSデータも取得
                    const latestBS = await yearlyBalanceSheetService.getByYear(
                        user.id,
                        currentBusinessType.business_type,
                        (latest?.year || (new Date().getFullYear() - 1))
                    );
                    if (latestBS) {
                        setPrevYearBS(latestBS);
                        // 資本金を前期から引き継ぐ
                        setCorporateInfo(prev => ({
                            ...prev,
                            capital: latestBS.net_assets_capital || prev.capital
                        }));
                    }
                } catch (error) {
                    console.error('前年度データの取得に失敗しました:', error);
                }
            }
        };
        fetchPrevData();
    }, [user?.id, currentBusinessType?.business_type]);


    const handleOpenInEditor = () => {
        if (window.confirm('現在の計算結果を詳細エディタに転記して開きますか？\n（エディタの既存データは上書きされます）')) {
            const calculatedData = CorporateTaxInputService.calculateDataFromTransactions(transactions, corporateInfo, prevYearSettlement?.balance_sheet || null);
            CorporateTaxInputService.saveData({
                ...initialCorporateTaxInputData,
                ...calculatedData,
                companyInfo: {
                    ...initialCorporateTaxInputData.companyInfo,
                    corporateName: corporateInfo.companyName,
                    representativeName: corporateInfo.representativeName,
                    corporateNumber: corporateInfo.corporateNumber || '',
                    address: corporateInfo.address || '',
                    taxOffice: corporateInfo.taxOffice || '',
                    capitalAmount: corporateInfo.capital,
                    fiscalYearStart: corporateInfo.fiscalYearStart,
                    fiscalYearEnd: corporateInfo.fiscalYearEnd,
                }
            });
            navigate('/corporate-tax/input');
        }
    };

    // 会社情報
    const currentYear = new Date().getFullYear();
    const [corporateInfo, setCorporateInfo] = useState<CorporateInfo>({
        companyName: '',
        representativeName: '',
        corporateNumber: '',
        address: '',
        taxOffice: '',
        capital: 10000000, // デフォルト1000万円
        fiscalYearStart: `${currentYear - 1}-04-01`,
        fiscalYearEnd: `${currentYear}-03-31`,
        fiscalYear: currentYear - 1,
        employeeCount: 1,
    });

    const handleInfoChange = (updates: Partial<CorporateInfo>) => {
        setCorporateInfo(prev => ({ ...prev, ...updates }));
    };

    // 減価償却データ
    const [depreciationAssets, setDepreciationAssets] = useState<DepreciationAsset[]>([]);
    const [depreciationTotal, setDepreciationTotal] = useState(0);

    const handleDepreciationCalculate = (total: number, assets: DepreciationAsset[]) => {
        setDepreciationTotal(total);
        setDepreciationAssets(assets);
    };

    // 決算データを計算
    const financialData = useMemo(() => {
        const beginningBalances = {
            retainedEarnings: prevYearBS?.net_assets_retained_earnings_total || 0,
            capital: prevYearBS?.net_assets_capital || corporateInfo.capital,
            cash: prevYearBS?.assets_current_cash || 0,
            receivable: prevYearBS?.assets_current_total ? (prevYearBS.assets_current_total - (prevYearBS.assets_current_cash || 0)) : 0, // 簡易的な差分
            inventory: 0, // 必要に応じて拡張
            fixedAssets: prevYearBS?.assets_total ? (prevYearBS.assets_total - (prevYearBS.assets_current_total || 0)) : 0,
            payable: prevYearBS?.liabilities_total || 0,
            shortTermLoans: 0, // 必要に応じて拡張
            longTermLoans: 0,
        };

        const data = generateFinancialDataFromTransactions(
            transactions,
            corporateInfo.fiscalYear,
            beginningBalances
        );

        // 減価償却費を経費に追加・合算
        if (depreciationTotal > 0) {
            // 既に「減価償却費」カテゴリがあるか確認
            const depreciationCategoryIndex = data.expensesByCategory.findIndex(c => c.category === '減価償却費');
            if (depreciationCategoryIndex >= 0) {
                data.expensesByCategory[depreciationCategoryIndex].amount += depreciationTotal;
            } else {
                data.expensesByCategory.push({ category: '減価償却費', amount: depreciationTotal });
            }

            data.operatingExpenses += depreciationTotal;
            data.operatingIncome -= depreciationTotal;
            data.ordinaryIncome -= depreciationTotal;
            data.incomeBeforeTax -= depreciationTotal;

            data.expensesByCategory.sort((a, b) => b.amount - a.amount);
        }

        return data;
    }, [transactions, corporateInfo.fiscalYear, depreciationTotal]);

    // 法人税計算結果
    const taxResult = useMemo(() => {
        return calculateAllCorporateTaxes(financialData, corporateInfo);
    }, [financialData, corporateInfo]);

    // 消費税計算結果
    const consumptionTaxResult = useMemo(() => {
        return calculateConsumptionTax(financialData.revenue, financialData.operatingExpenses);
    }, [financialData]);

    // ステップ移動
    const goToNextStep = () => {
        if (currentStep < WIZARD_STEPS.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const goToPreviousStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    // 登録データから転記
    const handleTranscribe = () => {
        const business = currentBusinessType;
        if (!business) {
            toast.error('登録された事業情報が見つかりません。連携設定で登録してください。');
            return;
        }

        const startMonth = business.fiscal_year_start_month || (business.business_type === 'corporation' ? 4 : 1);

        // 事業年度の期間を計算
        const startDate = `${currentYear - 1}-${String(startMonth).padStart(2, '0')}-01`;
        const endDateObj = new Date(currentYear - 1, startMonth - 1, 1);
        endDateObj.setFullYear(endDateObj.getFullYear() + 1);
        endDateObj.setDate(endDateObj.getDate() - 1);
        const endDate = `${endDateObj.getFullYear()}-${String(endDateObj.getMonth() + 1).padStart(2, '0')}-${String(endDateObj.getDate()).padStart(2, '0')}`;

        setCorporateInfo(prev => ({
            ...prev,
            companyName: business?.company_name || prev.companyName || '',
            representativeName: business?.representative_name || prev.representativeName || '',
            corporateNumber: (business?.tax_number || prev.corporateNumber || '').replace(/^T/, ''),
            address: business?.address || prev.address || '',
            capital: business?.capital_amount || prev.capital || 0,
            fiscalYearStart: startDate,
            fiscalYearEnd: endDate,
        }));

        toast.success('事業情報を転記しました');
    };

    // 減価償却資産の転記
    const handleDepreciationTranscribe = () => {
        if (!transactions || transactions.length === 0) {
            toast.error('取引データが見つかりません。');
            return;
        }

        const extractedAssets = extractDepreciationAssetsFromTransactions(transactions, corporateInfo.fiscalYear);
        if (extractedAssets.length === 0) {
            toast.error('転記可能な減価償却資産（タグ: depreciation_asset）が見つかりません。');
            return;
        }

        setDepreciationAssets(extractedAssets);
        toast.success(`${extractedAssets.length}件の減価償却資産を転記しました`);
    };

    // コピー機能
    const handleCopy = async (value: string | number, fieldName: string) => {
        try {
            await navigator.clipboard.writeText(String(value).replace(/[¥,]/g, ''));
            setCopiedField(fieldName);
            setTimeout(() => setCopiedField(null), 2000);
        } catch (err) {
            console.error('コピーに失敗しました:', err);
        }
    };

    // PDF生成
    const generatePDF = async (type: 'corporate' | 'financial') => {
        setIsLoading(true);
        try {
            const pdfData: JpTaxFormData = {
                companyName: corporateInfo.companyName || '（会社名未入力）',
                representativeName: corporateInfo.representativeName,
                address: corporateInfo.address,
                corporateNumber: corporateInfo.corporateNumber,
                capital: corporateInfo.capital,
                businessType: 'corporation',
                revenue: financialData.revenue,
                expenses: financialData.operatingExpenses,
                netIncome: taxResult.netIncome,
                expensesByCategory: financialData.expensesByCategory,
                fiscalYear: corporateInfo.fiscalYear,
                fiscalYearStart: corporateInfo.fiscalYearStart,
                fiscalYearEnd: corporateInfo.fiscalYearEnd,
                taxableIncome: taxResult.taxableIncome,
                estimatedTax: taxResult.totalTax,
                // 追加: 実績ベースの財務詳細
                costOfSales: financialData.costOfSales,
                grossProfit: financialData.grossProfit,
                operatingExpenses: financialData.operatingExpenses,
                operatingIncome: financialData.operatingIncome,
                nonOperatingIncome: financialData.nonOperatingIncome,
                nonOperatingExpenses: financialData.nonOperatingExpenses,
                ordinaryIncome: financialData.ordinaryIncome,
                cash: financialData.cash,
                accountsReceivable: financialData.accountsReceivable,
                inventory: financialData.inventory,
                fixedAssets: financialData.fixedAssets,
                totalAssets: financialData.totalAssets,
                accountsPayable: financialData.accountsPayable,
                shortTermLoans: financialData.shortTermLoans,
                longTermLoans: financialData.longTermLoans,
                totalLiabilities: financialData.totalLiabilities,
                beginningRetainedEarnings: financialData.beginningRetainedEarnings,
                beginningCapital: financialData.beginningCapital,
                depreciation: depreciationTotal,
            };

            let pdfBytes: Uint8Array;
            let filename: string;

            if (type === 'corporate') {
                pdfBytes = await generateCorporateTaxPDF(pdfData);
                filename = `法人税申告書_${corporateInfo.fiscalYear}年度.pdf`;
            } else {
                pdfBytes = await generateFinancialStatementPDF(pdfData);
                filename = `決算報告書_${corporateInfo.fiscalYear}年度.pdf`;
            }

            // ダウンロード
            const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // プレビュー
            window.open(url, '_blank');
        } catch (error) {
            console.error('PDF生成エラー:', error);
        } finally {
            setIsLoading(false);
        }
    };



    // ステップコンテンツを取得
    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <Step1CompanyInfo
                        corporateInfo={corporateInfo}
                        setCorporateInfo={setCorporateInfo}
                        handleInfoChange={handleInfoChange}
                        handleTranscribe={handleTranscribe}
                        prevYearSettlement={prevYearSettlement}
                        prevYearBS={prevYearBS}
                        setIsImportModalOpen={setIsImportModalOpen}
                    />
                );
            case 2:
                return (
                    <Step2Depreciation
                        assets={depreciationAssets}
                        onDepreciationCalculate={handleDepreciationCalculate}
                        handleTranscribe={handleDepreciationTranscribe}
                    />
                );
            case 3:
                return (
                    <Step3ProfitLoss
                        financialData={financialData}
                        corporateInfo={corporateInfo}
                        prevYearSettlement={prevYearSettlement}
                        showComparison={showComparison}
                        setShowComparison={setShowComparison}
                    />
                );
            case 4:
                return (
                    <Step3CorporateTax
                        taxResult={taxResult}
                        corporateInfo={corporateInfo}
                        handleCopy={handleCopy}
                        copiedField={copiedField}
                    />
                );
            case 5:
                return (
                    <Step4ConsumptionTax
                        consumptionTaxResult={consumptionTaxResult}
                    />
                );
            case 6:
                return (
                    <Step5Documents
                        corporateInfo={corporateInfo}
                        financialData={financialData}
                        taxResult={taxResult}
                        isLoading={isLoading}
                        generatePDF={generatePDF}
                        handleOpenInEditor={handleOpenInEditor}
                    />
                );
            default:
                return null;
        }
    };


    return (
        <div className="min-h-screen bg-background">
            <main className="w-full px-4 sm:px-6 lg:px-8 py-6">
                {/* ヘッダー */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center">
                        <Link to="/dashboard" className="mr-4 p-2 rounded-lg hover:bg-surface-highlight transition-colors">
                            <ArrowLeft className="w-6 h-6 text-text-muted hover:text-text-main" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-text-main flex items-center gap-2">
                                <Building2 className="w-7 h-7 text-primary" />
                                法人税申告サポート
                            </h1>
                            <p className="text-text-muted mt-1">法人決算・税務申告のサポート</p>
                        </div>
                    </div>
                    <Link
                        to="/corporate-tax-guide"
                        className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg hover:bg-primary/20 transition-colors text-primary"
                    >
                        <BookOpen className="w-4 h-4" />
                        <span className="text-sm font-medium">申告ガイド</span>
                    </Link>
                </div>

                {/* 進捗バー */}
                <WizardProgress
                    currentStep={currentStep}
                    steps={WIZARD_STEPS.map(s => ({ number: s.id, title: s.title, description: s.description }))}
                />

                {/* ステップコンテンツ */}
                <div className="bg-surface rounded-xl border border-border p-6 md:p-8 mb-8 shadow-sm">
                    {renderStepContent()}
                </div>

                {/* ナビゲーションボタン */}
                <div className="flex justify-between items-center w-full">
                    <button
                        onClick={goToPreviousStep}
                        disabled={currentStep === 1}
                        className={`btn-ghost ${currentStep === 1 ? 'invisible' : ''}`}
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        戻る
                    </button>
                    {currentStep < WIZARD_STEPS.length ? (
                        <button
                            onClick={goToNextStep}
                            className="btn-primary min-w-[200px]"
                        >
                            次へ進む
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </button>
                    ) : (
                        <Link to="/dashboard" className="btn-primary min-w-[200px]">
                            <CheckCircle className="w-5 h-5 mr-2" />
                            ダッシュボードへ
                        </Link>
                    )}
                </div>
            </main>

            {/* 前期データインポートモーダル */}
            <PreviousYearImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                userId={user?.id || ''}
                businessType={currentBusinessType?.business_type || 'corporation'}
                onImportSuccess={() => {
                    // 最新データを再取得
                    if (user?.id && currentBusinessType?.business_type) {
                        yearlySettlementService.getLatest(user.id, currentBusinessType.business_type)
                            .then(setPrevYearSettlement);
                    }
                    toast.success('前期データをインポートしました');
                }}
            />
        </div>
    );
};


export default CorporateTaxFilingPage;
