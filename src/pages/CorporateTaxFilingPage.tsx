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
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTransactions } from '../hooks/useTransactions';
import { useBusinessTypeContext } from '../context/BusinessTypeContext';
import {
    CorporateInfo,
    calculateAllCorporateTaxes,
    calculateConsumptionTax,
    generateFinancialDataFromTransactions,
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

const CorporateTaxFilingPage: React.FC = () => {
    const { user } = useAuth();
    const { currentBusinessType } = useBusinessTypeContext();
    const { transactions } = useTransactions(user?.id, currentBusinessType?.business_type);
    const navigate = useNavigate();

    // ウィザード状態
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const handleOpenInEditor = () => {
        if (window.confirm('現在の計算結果を詳細エディタに転記して開きますか？\n（エディタの既存データは上書きされます）')) {
            const calculatedData = CorporateTaxInputService.calculateDataFromTransactions(transactions);
            CorporateTaxInputService.saveData({
                ...initialCorporateTaxInputData,
                ...calculatedData
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
        capital: 10000000, // デフォルト1000万円
        fiscalYearStart: `${currentYear - 1}-04-01`,
        fiscalYearEnd: `${currentYear}-03-31`,
        fiscalYear: currentYear - 1,
        employeeCount: 1,
    });

    // 減価償却データ
    const [depreciationAssets, setDepreciationAssets] = useState<DepreciationAsset[]>([]);
    const [depreciationTotal, setDepreciationTotal] = useState(0);

    const handleDepreciationCalculate = (total: number, assets: DepreciationAsset[]) => {
        setDepreciationTotal(total);
        setDepreciationAssets(assets);
    };

    // 決算データを計算
    const financialData = useMemo(() => {
        const data = generateFinancialDataFromTransactions(transactions, corporateInfo.fiscalYear);

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
                taxableIncome: taxResult.taxableIncome,
                estimatedTax: taxResult.totalTax,
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



    // ステップ1: 会社情報
    const Step1CompanyInfo = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-text-main mb-4">会社基本情報</h3>
                <p className="text-text-muted mb-6">
                    法人税申告に必要な会社情報を入力してください。
                </p>
            </div>

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
                        onChange={(e) => setCorporateInfo({ ...corporateInfo, fiscalYearStart: e.target.value })}
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
                        onChange={(e) => setCorporateInfo({ ...corporateInfo, fiscalYearEnd: e.target.value })}
                        className="input-base"
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

    // ステップ2: 損益計算
    const Step2ProfitLoss = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-text-main mb-4">損益計算書</h3>
                <p className="text-text-muted mb-6">
                    {corporateInfo.fiscalYear}年度の取引データから自動集計した結果です。
                </p>
            </div>

            {/* 損益サマリー */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-success-light border border-success/20 rounded-xl p-5">
                    <p className="text-sm text-success font-medium">売上高</p>
                    <p className="text-2xl font-bold text-text-main mt-1">
                        {formatCurrency(financialData.revenue)}
                    </p>
                </div>
                <div className="bg-error-light border border-error/20 rounded-xl p-5">
                    <p className="text-sm text-error font-medium">販管費</p>
                    <p className="text-2xl font-bold text-text-main mt-1">
                        {formatCurrency(financialData.operatingExpenses)}
                    </p>
                </div>
                <div className="bg-primary-light border border-primary/20 rounded-xl p-5">
                    <p className="text-sm text-primary font-medium">営業利益</p>
                    <p className="text-2xl font-bold text-text-main mt-1">
                        {formatCurrency(financialData.operatingIncome)}
                    </p>
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

    // ステップ3: 法人税計算
    const Step3CorporateTax = () => (
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

    // ステップ4: 消費税確認
    const Step4ConsumptionTax = () => (
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

    // ステップ5: 書類作成
    const Step5Documents = () => (
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
                    <span className="text-text-muted">営業利益</span>
                    <span className="font-medium text-primary">{formatCurrency(financialData.operatingIncome)}</span>
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
                    className="flex items-center justify-center gap-2 p-6 bg-surface border border-border rounded-xl hover:border-primary hover:bg-primary-light transition-colors"
                >
                    {isLoading ? (
                        <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                    ) : (
                        <FileText className="w-6 h-6 text-primary" />
                    )}
                    <div className="text-left">
                        <p className="text-sm text-text-muted">損益計算書・貸借対照表</p>
                    </div>
                </button>
                <button
                    onClick={() => {
                        // JpTaxFormData から CSV生成
                        if (financialData) {
                            // JpTaxFormData型に合わせるための変換が必要なら行うが、ここでは簡易的にキャスト
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
                    className="flex items-center justify-center gap-2 p-6 bg-surface border border-border rounded-xl hover:border-primary hover:bg-primary-light transition-colors"
                >
                    <BookOpen className="w-6 h-6 text-primary" />
                    <div className="text-left">
                        <p className="font-medium text-text-main">財務諸表データ(CSV)</p>
                        <p className="text-sm text-text-muted">e-Tax取込用</p>
                    </div>
                </button>
                <button
                    onClick={() => generatePDF('corporate')}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 p-6 bg-surface border border-border rounded-xl hover:border-primary hover:bg-primary-light transition-colors"
                >
                    {isLoading ? (
                        <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                    ) : (
                        <Building2 className="w-6 h-6 text-primary" />
                    )}
                    <div className="text-left">
                        <p className="font-medium text-text-main">法人税申告書</p>
                        <p className="text-sm text-text-muted">法人税の概要</p>
                    </div>
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
        </div>
    );

    // ステップコンテンツを取得
    const renderStepContent = () => {
        switch (currentStep) {
            case 1: return <Step1CompanyInfo />;
            case 2: return (
                <DepreciationCalculator
                    onCalculate={handleDepreciationCalculate}
                    initialAssets={depreciationAssets}
                />
            );
            case 3: return <Step2ProfitLoss />;
            case 4: return <Step3CorporateTax />;
            case 5: return <Step4ConsumptionTax />;
            case 6: return <Step5Documents />;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
                <div className="flex justify-between items-center max-w-2xl mx-auto">
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
        </div>
    );
};

export default CorporateTaxFilingPage;
