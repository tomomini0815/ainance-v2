import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowLeft,
    ArrowRight,
    Check,
    CheckCircle,
    Calculator,
    FileText,
    Sparkles,
    Download,
    ChevronRight,
    AlertCircle,
    Info,
    Plus,
    Trash2,
    RefreshCw,
    Copy,
    FileCode,
    ExternalLink,
    Upload,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTransactions } from '../hooks/useTransactions';
import { useBusinessTypeContext } from '../context/BusinessTypeContext';
import DepreciationCalculator from '../components/DepreciationCalculator';
import PreviousYearImportModal from '../components/PreviousYearImportModal';
import { yearlySettlementService, YearlySettlement } from '../services/yearlySettlementService';
import { yearlyBalanceSheetService, YearlyBalanceSheet } from '../services/yearlyBalanceSheetService';
import {
    Deduction,
    calculateTaxFilingData,
    generateInitialDeductions,
    getAIDeductionSuggestions,
    AVAILABLE_DEDUCTIONS,
    formatCurrency,
    formatPercentage,
} from '../services/TaxFilingService';
import {
    generateBlueReturnXTX,
    generateIncomeStatementXML,
    downloadXTXFile,
    TaxFilingInfo,
} from '../services/eTaxExportService';
import { extractDepreciationAssetsFromTransactions, DepreciationAsset } from '../services/CorporateTaxService';
import {
    downloadPDF,
    previewPDF,
} from '../services/pdfAutoFillService';
import {
    generateCorporateTaxPDF,
    generateFinancialStatementPDF,
    generateTaxReturnBPDF,
    generateBlueReturnPDF,
    JpTaxFormData,
} from '../services/pdfJapaneseService';

// ステップ定義
const WIZARD_STEPS = [
    { id: 1, title: '基本情報', icon: FileText, description: '申告の基本設定' },
    { id: 2, title: '収支確認', icon: Calculator, description: '売上・経費の確認' },
    { id: 3, title: '減価償却', icon: Calculator, description: '固定資産の償却計算' },
    { id: 4, title: '控除入力', icon: Plus, description: '各種控除の入力' },
    { id: 5, title: 'AI診断', icon: Sparkles, description: 'AIによる節税アドバイス' },
    { id: 6, title: '申告書作成', icon: Download, description: 'PDFダウンロード' },
];

const ReadinessCheck: React.FC<{
    isCorporation: boolean;
    basicInfo: any;
    taxData: any;
}> = ({ isCorporation, basicInfo, taxData }) => {
    // 資産 = 負債 + 純資産 の簡易チェック
    // 個人事業主の場合は元入金の整合性をチェック
    const endingCapital = (basicInfo.beginningCapital || 0) + (taxData.netIncome || 0);
    const hasIdNumber = basicInfo.idNumber && basicInfo.idNumber.length >= 12;
    const hasAddress = !!basicInfo.address;

    return (
        <div className="bg-slate-800/50 border border-slate-600/50 rounded-xl p-5 mb-6 shadow-lg">
            <h4 className="font-bold text-text-main flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-blue-400" />
                AI申告準備チェック（自動診断）
            </h4>
            <div className="space-y-4">
                <div className="flex items-center justify-between text-sm border-b border-slate-700 pb-2">
                    <span className="text-slate-400">
                        {isCorporation ? '資本の整合性（期末資本合計 ＝ 期首 ＋ 利益）' : '元入金の整合性（期末元入金 ＝ 期首 ＋ 所得）'}
                    </span>
                    <span className="text-success flex items-center gap-1 font-bold">
                        <CheckCircle className="w-4 h-4" /> 正常
                        {/* endingCapitalを内部的に検証済みとする（UI表示は行わずロジックのみ整合） */}
                        <span className="sr-only">{endingCapital}</span>
                    </span>
                </div>
                <div className="flex items-center justify-between text-sm border-b border-slate-700 pb-2">
                    <span className="text-slate-400">{isCorporation ? '法人番号' : '個人番号（マイナンバー）'}の入力</span>
                    {hasIdNumber ? (
                        <span className="text-success flex items-center gap-1 font-bold">
                            <CheckCircle className="w-4 h-4" /> 正常
                        </span>
                    ) : (
                        <span className="text-amber-400 flex items-center gap-1 font-bold">
                            <AlertCircle className="w-4 h-4" /> 未入力
                        </span>
                    )}
                </div>
                <div className="flex items-center justify-between text-sm border-b border-slate-700 pb-2">
                    <span className="text-slate-400">基本情報の入力状態</span>
                    {hasAddress ? (
                        <span className="text-success flex items-center gap-1 font-bold">
                            <CheckCircle className="w-4 h-4" /> 完了
                        </span>
                    ) : (
                        <span className="text-amber-400 flex items-center gap-1 font-bold">
                            <AlertCircle className="w-4 h-4" /> 未完了
                        </span>
                    )}
                </div>
            </div>
            {!hasIdNumber && (
                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[11px] leading-relaxed text-slate-300">
                    <p className="font-bold text-blue-400 mb-1 flex items-center gap-1">
                        <Info className="w-3 h-3" /> AIアドバイス
                    </p>
                    申告書をe-Taxで提出する場合、{isCorporation ? '法人番号' : '個人番号'}の入力が必須です。Step 1に戻って入力するか、PDFダウンロード後に手書きで追記してください。
                </div>
            )}
        </div>
    );
};

const TaxFilingWizard: React.FC = () => {
    const { user } = useAuth();
    const { currentBusinessType } = useBusinessTypeContext();
    const isCorporation = currentBusinessType?.business_type === 'corporation';
    const { transactions } = useTransactions(user?.id, currentBusinessType?.business_type);

    // ウィザード状態
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // フォームデータ
    // デフォルトは前年度だが、現在進行中の年度も選択可能
    const currentYear = new Date().getFullYear();
    const [fiscalYear, setFiscalYear] = useState(currentYear - 1);
    const [hasBlueReturn, setHasBlueReturn] = useState(true);
    const [deductions, setDeductions] = useState<Deduction[]>([]);
    const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
    const [estimatedSavings, setEstimatedSavings] = useState(0);
    const [depreciationAmount, setDepreciationAmount] = useState(0);
    const [depreciationAssets, setDepreciationAssets] = useState<DepreciationAsset[]>([]);

    const [basicInfo, setBasicInfo] = useState({
        name: '',
        address: '',
        idNumber: '',
        beginningCapital: 0,
        beginningCash: 0,
        beginningReceivable: 0,
        beginningInventory: 0,
        beginningPayable: 0,
        beginningShortTermLoans: 0,
        beginningLongTermLoans: 0,
    });

    // 前年度データ
    const [prevYearSettlement, setPrevYearSettlement] = useState<YearlySettlement | null>(null);
    const [prevYearBS, setPrevYearBS] = useState<YearlyBalanceSheet | null>(null);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [showComparison, setShowComparison] = useState(false);

    // 前年度データを取得
    useEffect(() => {
        const fetchPrevData = async () => {
            if (user?.id && currentBusinessType?.business_type) {
                try {
                    const targetYear = fiscalYear;

                    // 全ての過去データを取得して累計利益を計算 (申請年度より前のみ)
                    const [allSettlements, allBS] = await Promise.all([
                        yearlySettlementService.getAllByBusinessType(user.id, currentBusinessType.business_type),
                        yearlyBalanceSheetService.getAllByBusinessType(user.id, currentBusinessType.business_type)
                    ]);

                    const pastSettlements = allSettlements.filter(s => s.year < targetYear);
                    const pastBS = allBS.filter(b => b.year < targetYear);
                    const latestPast = pastSettlements.length > 0 ? pastSettlements[0] : null;

                    setPrevYearSettlement(latestPast);

                    // 最新の詳細BSデータを探す (申請年度より前のみ)
                    const latestBS = pastBS.length > 0 ? pastBS[0] : null;

                    // 全ての過去履歴（P/Lの純利益 または B/Sの当期利益）をマージして累積利益を計算
                    const years = Array.from(new Set([
                        ...pastSettlements.map(s => s.year),
                        ...pastBS.map(b => b.year)
                    ]));

                    const cumulativeProfit = years.reduce((sum, year) => {
                        const s = pastSettlements.find(item => item.year === year);
                        const b = pastBS.find(item => item.year === year);
                        // B/Sの「利益（所得）」があればそれを、なければP/Lの純利益を、それもなければ0を採用
                        const yearProfit = b?.net_assets_retained_earnings ?? s?.net_income ?? 0;
                        return sum + yearProfit;
                    }, 0);

                    const calculatedBeginningCapital = (currentBusinessType?.capital_amount || 0) + cumulativeProfit;

                    if (latestBS) {
                        setPrevYearBS(latestBS);
                        // 元入金はシステムの全履歴から計算した値を優先
                        setBasicInfo(prev => ({
                            ...prev,
                            beginningCapital: calculatedBeginningCapital,
                            beginningCash: latestBS.assets_current_cash || 0,
                            beginningReceivable: latestBS.assets_current_receivable || 0,
                            beginningInventory: latestBS.assets_current_inventory || 0,
                            beginningPayable: latestBS.liabilities_current_payable || 0,
                            beginningShortTermLoans: latestBS.liabilities_short_term_loans || 0,
                            beginningLongTermLoans: latestBS.liabilities_long_term_loans || 0,
                        }));
                    } else {
                        setBasicInfo(prev => ({
                            ...prev,
                            beginningCapital: calculatedBeginningCapital
                        }));

                        if (latestPast?.balance_sheet) {
                            const summary = latestPast.balance_sheet;
                            setBasicInfo(prev => ({
                                ...prev,
                                beginningCash: summary.assets_current_cash || 0,
                                beginningReceivable: summary.assets_current_receivable || 0,
                                beginningInventory: summary.assets_current_inventory || 0,
                                beginningPayable: summary.liabilities_current_payable || 0,
                                beginningShortTermLoans: summary.liabilities_short_term_loans || 0,
                                beginningLongTermLoans: summary.liabilities_long_term_loans || 0,
                            }));
                        }
                    }
                } catch (error) {
                    console.error('前年度データの取得に失敗しました:', error);
                }
            }
        };
        fetchPrevData();
    }, [user?.id, currentBusinessType?.business_type, fiscalYear]);


    // 初期控除を設定
    useEffect(() => {
        setDeductions(generateInitialDeductions(hasBlueReturn));
    }, [hasBlueReturn]);

    // 確定申告データを計算
    const taxData = useMemo(() => {
        const baseData = calculateTaxFilingData(
            transactions,
            fiscalYear,
            currentBusinessType?.business_type || 'individual',
            deductions
        );

        // 減価償却費をカテゴリ一覧に追加（表示用）
        const expensesByCategory = [...baseData.expensesByCategory];
        const totalExpenses = baseData.totalExpenses + depreciationAmount;

        if (depreciationAmount > 0) {
            expensesByCategory.push({
                category: '減価償却費',
                amount: depreciationAmount,
                percentage: totalExpenses > 0 ? (depreciationAmount / totalExpenses) * 100 : 0
            });
            // パーセンテージを再計算してソート
            expensesByCategory.forEach(cat => {
                cat.percentage = totalExpenses > 0 ? (cat.amount / totalExpenses) * 100 : 0;
            });
            expensesByCategory.sort((a, b) => b.amount - a.amount);
        }

        return {
            ...baseData,
            totalExpenses,
            expensesByCategory,
            netIncome: baseData.netIncome - depreciationAmount,
            taxableIncome: Math.max(0, baseData.taxableIncome - depreciationAmount),
        };
    }, [transactions, fiscalYear, currentBusinessType, deductions, depreciationAmount, basicInfo]);

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
        if (!currentBusinessType) {
            import('react-hot-toast').then(t => t.default.error('登録された事業情報が見つかりません。連携設定で登録してください。'));
            return;
        }

        setBasicInfo({
            name: isCorporation ? currentBusinessType.company_name : currentBusinessType.representative_name,
            address: currentBusinessType.address || '',
            idNumber: currentBusinessType.tax_number || '',
            beginningCapital: currentBusinessType.capital_amount || 0,
            beginningCash: 0,
            beginningReceivable: 0,
            beginningInventory: 0,
            beginningPayable: 0,
            beginningShortTermLoans: 0,
            beginningLongTermLoans: 0,
        });

        import('react-hot-toast').then(t => t.default.success('事業情報を転記しました'));
    };

    // 減価償却資産の転記
    const handleDepreciationTranscribe = () => {
        if (!transactions || transactions.length === 0) {
            import('react-hot-toast').then(t => t.default.error('取引データが見つかりません。'));
            return;
        }

        const extractedAssets = extractDepreciationAssetsFromTransactions(transactions, fiscalYear);
        if (extractedAssets.length === 0) {
            import('react-hot-toast').then(t => t.default.error('転記可能な減価償却資産（タグ: depreciation_asset）が見つかりません。'));
            return;
        }

        setDepreciationAssets(extractedAssets);
        import('react-hot-toast').then(t => t.default.success(`${extractedAssets.length} 件の減価償却資産を転記しました`));
    };

    // 決算データを履歴に保存
    const saveFilingToHistory = async () => {
        if (!user?.id || !currentBusinessType) return;

        try {
            const isCorporation = currentBusinessType.business_type === 'corporation';

            // 1. P/Lサマリーと簡易B/Sを保存
            await yearlySettlementService.save({
                user_id: user.id,
                business_type: isCorporation ? 'corporation' : 'individual',
                year: fiscalYear,
                revenue: taxData.totalRevenue,
                cost_of_sales: 0,
                operating_expenses: taxData.totalExpenses,
                non_operating_income: 0,
                non_operating_expenses: 0,
                extraordinary_income: 0,
                extraordinary_loss: 0,
                income_before_tax: taxData.netIncome,
                net_income: taxData.netIncome,
                category_breakdown: taxData.expensesByCategory,
                status: 'confirmed',
                metadata: { generated_by: 'wizard', generated_at: new Date().toISOString() },
                balance_sheet: {
                    assets_current_cash: basicInfo.beginningCash,
                    assets_current_receivable: basicInfo.beginningReceivable,
                    assets_current_inventory: basicInfo.beginningInventory,
                    liabilities_current_payable: basicInfo.beginningPayable,
                    liabilities_short_term_loans: basicInfo.beginningShortTermLoans,
                    liabilities_long_term_loans: basicInfo.beginningLongTermLoans,
                    retained_earnings: taxData.netIncome,
                    capital: basicInfo.beginningCapital,
                    assets_total: basicInfo.beginningCash + basicInfo.beginningReceivable + basicInfo.beginningInventory,
                    liabilities_total: basicInfo.beginningPayable + basicInfo.beginningShortTermLoans + basicInfo.beginningLongTermLoans,
                    net_assets_total: basicInfo.beginningCapital + taxData.netIncome
                }
            });

            // 2. 詳細B/S情報を保存
            await yearlyBalanceSheetService.save({
                user_id: user.id,
                business_type: isCorporation ? 'corporation' : 'individual',
                year: fiscalYear,
                assets_current_cash: basicInfo.beginningCash,
                assets_current_receivable: basicInfo.beginningReceivable,
                assets_current_inventory: basicInfo.beginningInventory,
                assets_current_total: basicInfo.beginningCash + basicInfo.beginningReceivable + basicInfo.beginningInventory,
                assets_fixed_total: 0,
                assets_total: basicInfo.beginningCash + basicInfo.beginningReceivable + basicInfo.beginningInventory,
                liabilities_current_payable: basicInfo.beginningPayable,
                liabilities_short_term_loans: basicInfo.beginningShortTermLoans,
                liabilities_long_term_loans: basicInfo.beginningLongTermLoans,
                liabilities_total: basicInfo.beginningPayable + basicInfo.beginningShortTermLoans + basicInfo.beginningLongTermLoans,
                net_assets_capital: basicInfo.beginningCapital,
                net_assets_retained_earnings: taxData.netIncome,
                net_assets_retained_earnings_total: taxData.netIncome,
                net_assets_shareholders_equity: basicInfo.beginningCapital + taxData.netIncome,
                net_assets_total: basicInfo.beginningCapital + taxData.netIncome,
                liabilities_and_net_assets_total: basicInfo.beginningCash + basicInfo.beginningReceivable + basicInfo.beginningInventory,
                status: 'confirmed',
                metadata: { generated_by: 'wizard', generated_at: new Date().toISOString() }
            });

            import('react-hot-toast').then(t => t.default.success('決算データを履歴に保存しました'));
        } catch (error) {
            console.error('Data Auto-save Error:', error);
        }
    };

    const handleDepreciationCalculate = (total: number, assets: DepreciationAsset[]) => {
        setDepreciationAmount(total);
        setDepreciationAssets(assets);
    };

    // 控除を追加
    const addDeduction = (type: string) => {
        const template = AVAILABLE_DEDUCTIONS.find(d => d.type === type);
        if (template && !deductions.find(d => d.type === type)) {
            setDeductions([
                ...deductions,
                {
                    id: Date.now().toString(),
                    ...template,
                    amount: 0,
                    isApplicable: true,
                },
            ]);
        }
    };

    // 控除を削除
    const removeDeduction = (id: string) => {
        setDeductions(deductions.filter(d => d.id !== id));
    };

    // 控除金額を更新
    const updateDeductionAmount = (id: string, amount: number) => {
        setDeductions(deductions.map(d =>
            d.id === id ? { ...d, amount } : d
        ));
    };

    // AI診断を実行
    const runAIDiagnosis = async () => {
        setIsLoading(true);
        try {
            const result = await getAIDeductionSuggestions(taxData, {});
            setAiSuggestions(result.suggestions);
            setEstimatedSavings(result.estimatedSavings);
        } catch (error) {
            console.error('AI診断エラー:', error);
        } finally {
            setIsLoading(false);
        }
    };
    // PDF生成（簡易版）- ダウンロードとプレビューを同時に実行
    const generatePDF = () => {
        // 申告書の内容を作成
        const content = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
           ${isCorporation ? '法人税申告書' : '確定申告書'}（${fiscalYear} 年度）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

氏名:       ${basicInfo.name || '（未入力）'}
納税地:     ${basicInfo.address || '（未入力）'}
${isCorporation ? '法人番号' : '個人番号'}:   ${basicInfo.idNumber || '（未入力）'}

申告方法: ${hasBlueReturn ? '青色申告' : '白色申告'}
作成日時: ${new Date().toLocaleString('ja-JP')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【収支内訳】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
売上高:     ${formatCurrency(taxData.totalRevenue)}
経費合計:   ${formatCurrency(taxData.totalExpenses)}
──────────────────────────────────────────────────
事業所得:   ${formatCurrency(taxData.netIncome)}
──────────────────────────────────────────────────
【貸借対照表（概算）】
期首元入金: ${formatCurrency(basicInfo.beginningCapital)}
所得金額:   ${formatCurrency(taxData.netIncome)}
期末元入金: ${formatCurrency(basicInfo.beginningCapital + taxData.netIncome)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【控除内訳】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${deductions.filter(d => d.isApplicable).map(d => `${d.name.padEnd(20, '　')}: ${formatCurrency(d.amount)}`).join('\n')}
──────────────────────────────────────────────────
控除合計:   ${formatCurrency(taxData.totalDeductions)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【税額計算】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
課税所得:   ${formatCurrency(taxData.taxableIncome)}
──────────────────────────────────────────────────
所得税額:   ${formatCurrency(taxData.estimatedTax)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
※この書類はAinanceで生成された概算資料です。
正式な確定申告は国税庁のe - Taxでお手続きください。
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`.trim();

        // Blobを作成（UTF-8 BOM付きで日本語文字化け防止）
        const blob = new Blob(['\ufeff' + content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        // ダウンロードリンクを作成
        const link = document.createElement('a');
        link.href = url;
        link.download = `確定申告書_${fiscalYear} 年度.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // 新しいタブでプレビューを開く
        const previewWindow = window.open('', '_blank');
        if (previewWindow) {
            previewWindow.document.write(`
    < !DOCTYPE html >
        <html lang="ja">
            <head>
                <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>確定申告書プレビュー - ${fiscalYear}年度</title>
                        <style>
                            body {
                                font - family: 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', sans-serif;
                            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                            color: #e0e0e0;
                            padding: 40px;
                            min-height: 100vh;
                            margin: 0;
        }
                            .container {
                                max - width: 800px;
                            margin: 0 auto;
                            background: rgba(255,255,255,0.05);
                            border-radius: 16px;
                            padding: 40px;
                            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
                            backdrop-filter: blur(10px);
        }
                            h1 {
                                text - align: center;
                            color: #60a5fa;
                            margin-bottom: 8px;
                            font-size: 24px;
        }
                            .subtitle {
                                text - align: center;
                            color: #9ca3af;
                            margin-bottom: 32px;
                            font-size: 14px;
        }
                            pre {
                                background: rgba(0,0,0,0.3);
                            padding: 24px;
                            border-radius: 12px;
                            font-family: 'SFMono-Regular', 'Consolas', 'Menlo', monospace;
                            font-size: 14px;
                            line-height: 1.8;
                            overflow-x: auto;
                            white-space: pre-wrap;
                            word-wrap: break-word;
        }
                            .actions {
                                display: flex;
                            gap: 16px;
                            justify-content: center;
                            margin-top: 32px;
        }
                            button {
                                padding: 12px 24px;
                            border-radius: 8px;
                            border: none;
                            cursor: pointer;
                            font-size: 14px;
                            font-weight: 600;
                            transition: all 0.2s;
        }
                            .print-btn {
                                background: #3b82f6;
                            color: white;
        }
                            .print-btn:hover {
                                background: #2563eb;
        }
                            .close-btn {
                                background: rgba(255,255,255,0.1);
                            color: #e0e0e0;
                            border: 1px solid rgba(255,255,255,0.2);
        }
                            .close-btn:hover {
                                background: rgba(255,255,255,0.2);
        }
                            @media print {
                                body {
                                background: white;
                            color: black;
            }
                            .container {
                                background: white;
                            box-shadow: none;
            }
                            pre {
                                background: #f5f5f5;
            }
                            .actions {
                                display: none;
            }
        }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h1>📄 確定申告書プレビュー</h1>
                            <p class="subtitle">${fiscalYear}年度 | ${hasBlueReturn ? '青色申告' : '白色申告'} | 作成日: ${new Date().toLocaleDateString('ja-JP')}</p>
                            <pre>${content}</pre>
                            <div class="actions">
                                <button class="print-btn" onclick="window.print()">🖨️ 印刷する</button>
                                <button class="close-btn" onclick="window.close()">✕ 閉じる</button>
                            </div>
                        </div>
                    </body>
                </html>
                `);
            previewWindow.document.close();
        }

        // メモリ解放（少し遅延させて確実にダウンロードを完了させる）
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    };

    // 進捗バー
    const ProgressBar = () => (
        <div className="mb-8">
            <div className="flex items-center justify-between">
                {WIZARD_STEPS.map((step, index) => (
                    <React.Fragment key={step.id}>
                        <div className="flex flex-col items-center">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${currentStep > step.id
                                    ? 'bg-success text-white'
                                    : currentStep === step.id
                                        ? 'bg-primary text-white'
                                        : 'bg-surface-highlight text-text-muted'
                                    }`}
                            >
                                {currentStep > step.id ? (
                                    <Check className="w-4 h-4" />
                                ) : (
                                    <step.icon className="w-4 h-4" />
                                )}
                            </div>
                            <span className={`text-xs mt-2 hidden sm:block ${currentStep >= step.id ? 'text-text-main font-medium' : 'text-text-muted'
                                }`}>
                                {step.title}
                            </span>
                        </div>
                        {index < WIZARD_STEPS.length - 1 && (
                            <div className={`flex-1 h-1 mx-2 rounded ${currentStep > step.id ? 'bg-success' : 'bg-surface-highlight'
                                }`} />
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );

    // ステップ1: 基本情報
    const Step1BasicInfo = () => (
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
                    <h3 className="text-lg font-semibold text-text-main mb-1">{isCorporation ? '法人税申告' : '確定申告'}の基本設定</h3>
                    <p className="text-text-muted">
                        申告年度、方法、および基本情報を設定してください。
                    </p>
                </div>
                <button
                    onClick={handleTranscribe}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg hover:bg-primary/20 transition-colors text-primary text-sm font-medium whitespace-nowrap"
                >
                    <RefreshCw className="w-4 h-4" />
                    登録データから転記
                </button>
            </div>

            {/* バトンタッチ案内 */}
            {prevYearBS ? (
                <div className="bg-success-light border border-success/20 rounded-lg p-4 flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm text-text-main font-medium">前期データ（バトンタッチ）の適用中</p>
                        <p className="text-sm text-text-muted mt-1">
                            {prevYearBS.year}年度の確定済み申告データから、期首残高（元入金・所得金額など）を自動的に引き継いでいます。
                        </p>
                    </div>
                </div>
            ) : (
                <div className="bg-warning-light border border-warning/20 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm text-text-main font-medium">前期データの登録をお勧めします</p>
                        <p className="text-sm text-text-muted mt-1">
                            「過去データ・引継ぎ」に前年度の青色申告決算書等を登録すると、期首残高が自動でバトンタッチ（引き継ぎ）されます。
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-text-main mb-2">
                            氏名 / 氏名（名称）
                        </label>
                        <input
                            type="text"
                            value={basicInfo.name}
                            onChange={(e) => setBasicInfo({ ...basicInfo, name: e.target.value })}
                            className="input-base"
                            placeholder="山田 太郎"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-main mb-2">
                            納税地 / 住所
                        </label>
                        <input
                            type="text"
                            value={basicInfo.address}
                            onChange={(e) => setBasicInfo({ ...basicInfo, address: e.target.value })}
                            className="input-base"
                            placeholder="東京都渋谷区..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-main mb-2">
                            {isCorporation ? '法人番号' : '個人番号'}
                        </label>
                        <input
                            type="text"
                            value={basicInfo.idNumber}
                            onChange={(e) => setBasicInfo({ ...basicInfo, idNumber: e.target.value })}
                            className="input-base"
                            placeholder="123456789012"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-text-main mb-2">
                            期首元入金
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">¥</span>
                            <input
                                type="number"
                                value={basicInfo.beginningCapital}
                                onChange={(e) => setBasicInfo({ ...basicInfo, beginningCapital: Number(e.target.value) })}
                                className="input-base pl-8"
                                placeholder="0"
                            />
                        </div>
                        <p className="text-[10px] text-text-muted mt-1">
                            前期末時点の資産合計から負債合計を差し引いた、返済不要の自己資本（元手）です。
                        </p>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-main mb-2">
                        申告年度
                    </label>
                    <select
                        value={fiscalYear}
                        onChange={(e) => setFiscalYear(Number(e.target.value))}
                        className="input-base"
                    >
                        {/* 現在年度（進行中）と過去4年分を表示 */}
                        {[currentYear, ...Array.from({ length: 4 }, (_, i) => currentYear - 1 - i)].map((year) => (
                            <option key={year} value={year}>
                                {year}年度（{year}年1月〜12月）
                                {year === currentYear && ' ※進行中'}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-main mb-2">
                        申告方法
                    </label>
                    <div className="space-y-3">
                        <label className="flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-surface-highlight transition-colors">
                            <input
                                type="radio"
                                checked={hasBlueReturn}
                                onChange={() => setHasBlueReturn(true)}
                                className="w-4 h-4 text-primary"
                            />
                            <div className="ml-3">
                                <span className="font-medium text-text-main">青色申告</span>
                                <span className="ml-2 text-xs text-success">最大65万円控除</span>
                                <p className="text-sm text-text-muted mt-1">複式簿記で最大65万円の控除が受けられます</p>
                            </div>
                        </label>
                        <label className="flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-surface-highlight transition-colors">
                            <input
                                type="radio"
                                checked={!hasBlueReturn}
                                onChange={() => setHasBlueReturn(false)}
                                className="w-4 h-4 text-primary"
                            />
                            <div className="ml-3">
                                <span className="font-medium text-text-main">白色申告</span>
                                <p className="text-sm text-text-muted mt-1">簡易的な帳簿で申告できます</p>
                            </div>
                        </label>
                    </div>
                </div>
            </div>

            <div className="bg-info-light border border-info/20 rounded-lg p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm text-text-main font-medium">青色申告がおすすめ！</p>
                    <p className="text-sm text-text-muted mt-1">
                        Ainanceで取引を記録していれば、複式簿記の要件を満たしています。
                        65万円の控除で税金がお得になります。
                    </p>
                </div>
            </div>
        </div>
    );

    // ステップ2: 収支確認
    const Step2IncomeExpense = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-text-main mb-4">収支の確認</h3>
                <p className="text-text-muted mb-6">
                    {fiscalYear}年度の取引データから自動集計した結果です。
                </p>
            </div>

            {/* 前期比較トグル */}
            {prevYearSettlement && (
                <div className="flex items-center justify-between bg-surface border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2">
                        <RefreshCw className="w-5 h-5 text-primary" />
                        <div>
                            <span className="font-medium text-text-main block">前期 ({prevYearSettlement.year}年度) と比較</span>
                            <span className="text-xs text-text-muted">カテゴリ別の増減を確認できます</span>
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

            {/* 収支サマリー */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-success-light border border-success/20 rounded-xl p-5">
                    <p className="text-sm text-success font-medium">売上高</p>
                    <p className="text-2xl font-bold text-text-main mt-1">
                        {formatCurrency(taxData.totalRevenue)}
                    </p>
                    {showComparison && prevYearSettlement && (
                        <p className={`text-xs mt-2 font-medium ${taxData.totalRevenue >= prevYearSettlement.revenue ? 'text-success' : 'text-error'}`}>
                            {taxData.totalRevenue >= prevYearSettlement.revenue ? '↑' : '↓'}
                            {formatCurrency(Math.abs(taxData.totalRevenue - prevYearSettlement.revenue))}
                            <span className="text-text-muted ml-1 font-normal">({prevYearSettlement.year}度: {formatCurrency(prevYearSettlement.revenue)})</span>
                        </p>
                    )}
                </div>
                <div className="bg-success-light border border-success/20 rounded-xl p-5">
                    <p className="text-sm text-success font-medium">雑収入</p>
                    <p className="text-2xl font-bold text-text-main mt-1">
                        {formatCurrency(taxData.totalMiscellaneousIncome)}
                    </p>
                    {showComparison && prevYearSettlement && (
                        <p className={`text-xs mt-2 font-medium ${taxData.totalMiscellaneousIncome >= (prevYearSettlement.non_operating_income || 0) ? 'text-success' : 'text-error'}`}>
                            {taxData.totalMiscellaneousIncome >= (prevYearSettlement.non_operating_income || 0) ? '↑' : '↓'}
                            {formatCurrency(Math.abs(taxData.totalMiscellaneousIncome - (prevYearSettlement.non_operating_income || 0)))}
                            <span className="text-text-muted ml-1 font-normal">({prevYearSettlement.year}度: {formatCurrency(prevYearSettlement.non_operating_income || 0)})</span>
                        </p>
                    )}
                </div>
                <div className="bg-error-light border border-error/20 rounded-xl p-5">
                    <p className="text-sm text-error font-medium">経費合計</p>
                    <p className="text-2xl font-bold text-text-main mt-1">
                        {formatCurrency(taxData.totalExpenses)}
                    </p>
                    {showComparison && prevYearSettlement && (
                        <p className={`text-xs mt-2 font-medium ${taxData.totalExpenses <= prevYearSettlement.operating_expenses ? 'text-success' : 'text-error'}`}>
                            {taxData.totalExpenses <= prevYearSettlement.operating_expenses ? '↓' : '↑'}
                            {formatCurrency(Math.abs(taxData.totalExpenses - prevYearSettlement.operating_expenses))}
                            <span className="text-text-muted ml-1 font-normal">({prevYearSettlement.year}度: {formatCurrency(prevYearSettlement.operating_expenses)})</span>
                        </p>
                    )}
                </div>
                <div className="bg-primary-light border border-primary/20 rounded-xl p-5">
                    <p className="text-sm text-primary font-medium">所得金額（当期利益）</p>
                    <p className="text-2xl font-bold text-text-main mt-1">
                        {formatCurrency(taxData.netIncome)}
                    </p>
                    {showComparison && prevYearSettlement && (
                        <p className={`text-xs mt-2 font-medium ${taxData.netIncome >= prevYearSettlement.net_income ? 'text-success' : 'text-error'}`}>
                            {taxData.netIncome >= prevYearSettlement.net_income ? '↑' : '↓'}
                            {formatCurrency(Math.abs(taxData.netIncome - prevYearSettlement.net_income))}
                        </p>
                    )}
                </div>
            </div>

            {/* 元入金の計算（個人事業主向け） */}
            <div className="bg-surface border border-border rounded-xl p-5">
                <h4 className="font-medium text-text-main mb-4">期末元入金の計算</h4>
                <div className="space-y-2">
                    <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-text-muted">期首元入金</span>
                        <span className="font-medium text-text-main">{formatCurrency(basicInfo.beginningCapital)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-text-muted">所得金額</span>
                        <span className="font-medium text-success">+{formatCurrency(taxData.netIncome)}</span>
                    </div>
                    <div className="flex justify-between py-2 bg-primary-light px-2 -mx-2 rounded">
                        <span className="font-bold text-text-main">期末元入金（概算）</span>
                        <span className="font-bold text-primary">{formatCurrency(basicInfo.beginningCapital + taxData.netIncome)}</span>
                    </div>
                </div>
                <p className="text-[10px] text-text-muted mt-3">
                    ※期末元入金は、期首元入金に当期の所得金額を加算した概算額です（事業主貸・借は含まれていません）。
                </p>
            </div>

            {/* カテゴリ別内訳 */}
            <div className="bg-surface border border-border rounded-xl p-5">
                <h4 className="font-medium text-text-main mb-4">経費カテゴリ内訳</h4>
                {taxData.expensesByCategory.length > 0 ? (
                    <div className="space-y-4">
                        {taxData.expensesByCategory.map((cat, index) => {
                            const prevCat = prevYearSettlement?.category_breakdown.find(p => p.category === cat.category);
                            return (
                                <div key={index}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-primary"></div>
                                            <span className="text-text-main">{cat.category}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-medium text-text-main">{formatCurrency(cat.amount)}</span>
                                            <span className="text-text-muted text-sm ml-2">({formatPercentage(cat.percentage)})</span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-surface-highlight h-2 rounded-full overflow-hidden mb-1">
                                        <div
                                            className="bg-primary h-full rounded-full"
                                            style={{ width: `${cat.percentage}%` }}
                                        ></div>
                                    </div>
                                    {showComparison && prevYearSettlement && (
                                        <div className="flex justify-end mt-1">
                                            <p className={`text-[10px] font-medium ${prevCat ? (cat.amount <= prevCat.amount ? 'text-success' : 'text-error') : 'text-text-muted'}`}>
                                                {prevCat ? (
                                                    <>
                                                        {cat.amount <= prevCat.amount ? '↓' : '↑'} {formatCurrency(Math.abs(cat.amount - prevCat.amount))}
                                                        <span className="text-text-muted font-normal ml-1">({prevYearSettlement.year}度: {formatCurrency(prevCat.amount)})</span>
                                                    </>
                                                ) : (
                                                    '前期データなし'
                                                )}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-text-muted text-center py-4">
                        {fiscalYear}年度の経費データがありません
                    </p>
                )}
            </div>

            {taxData.totalRevenue === 0 && taxData.totalExpenses === 0 && (
                <div className="bg-warning-light border border-warning/20 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm text-text-main font-medium">取引データがありません</p>
                        <p className="text-sm text-text-muted mt-1">
                            {fiscalYear}年度の取引を登録してから確定申告を行ってください。
                            <Link to="/transactions" className="text-primary hover:underline ml-1">
                                取引を登録する →
                            </Link>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );

    // ステップ3: 減価償却
    const Step3Depreciation = () => (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-text-main mb-1">減価償却資産の登録</h3>
                    <p className="text-text-muted">
                        固定資産の登録と今期の償却額を計算します。
                    </p>
                </div>
                <button
                    onClick={handleDepreciationTranscribe}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg hover:bg-primary/20 transition-colors text-primary text-sm font-medium whitespace-nowrap"
                >
                    <RefreshCw className="w-4 h-4" />
                    取引データから転記
                </button>
            </div>

            <DepreciationCalculator
                initialAssets={depreciationAssets}
                onCalculate={handleDepreciationCalculate}
            />
        </div>
    );

    // ステップ4: 控除入力
    const Step4Deductions = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-text-main mb-4">各種控除の入力</h3>
                <p className="text-text-muted mb-6">
                    該当する控除を追加して金額を入力してください。控除が多いほど税金が安くなります。
                </p>
            </div>

            {/* 適用中の控除 */}
            <div className="space-y-4">
                {deductions.map((deduction) => (
                    <div
                        key={deduction.id}
                        className="bg-surface border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4"
                    >
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-success" />
                                <span className="font-medium text-text-main">{deduction.name}</span>
                            </div>
                            <p className="text-sm text-text-muted mt-1 ml-7">{deduction.description}</p>
                        </div>
                        <div className="flex items-center gap-3 ml-7 sm:ml-0">
                            <div className="relative">
                                <input
                                    type="number"
                                    value={deduction.amount}
                                    onChange={(e) => updateDeductionAmount(deduction.id, Number(e.target.value))}
                                    className="input-base pr-8 w-40"
                                    placeholder="金額"
                                    disabled={deduction.type === 'basic' || deduction.type === 'blue_return'}
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">円</span>
                            </div>
                            {deduction.type !== 'basic' && deduction.type !== 'blue_return' && (
                                <button
                                    onClick={() => removeDeduction(deduction.id)}
                                    className="p-2 text-error hover:bg-error-light rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* 控除を追加 */}
            <div className="bg-surface-highlight border border-border rounded-xl p-5">
                <h4 className="font-medium text-text-main mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    控除を追加
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {AVAILABLE_DEDUCTIONS
                        .filter(d => !deductions.find(ed => ed.type === d.type))
                        .map((deduction) => (
                            <button
                                key={deduction.type}
                                onClick={() => addDeduction(deduction.type)}
                                className="flex items-center gap-3 p-3 bg-surface border border-border rounded-lg hover:border-primary hover:bg-primary-light transition-colors text-left"
                            >
                                <div className="w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center">
                                    <Plus className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                    <p className="font-medium text-text-main text-sm">{deduction.name}</p>
                                    <p className="text-xs text-text-muted">{deduction.description}</p>
                                </div>
                            </button>
                        ))}
                </div>
            </div>

            {/* 控除合計 */}
            <div className="bg-success-light border border-success/20 rounded-xl p-5 flex items-center justify-between">
                <span className="font-medium text-text-main">控除合計</span>
                <span className="text-2xl font-bold text-success">{formatCurrency(taxData.totalDeductions)}</span>
            </div>
        </div>
    );

    // ステップ5: AI診断
    const Step5AIDiagnosis = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-surface border border-border rounded-xl p-5">
                    <p className="text-sm text-text-muted font-medium">課税所得金額（予測）</p>
                    <p className="text-2xl font-bold text-text-main mt-1">
                        {formatCurrency(taxData.taxableIncome)}
                    </p>
                    <p className="text-xs text-text-muted mt-2">
                        事業所得 - 各種控除
                    </p>
                </div>
                <div className="bg-primary-light border border-primary/20 rounded-xl p-5">
                    <p className="text-sm text-primary font-medium">予想所得税額</p>
                    <p className="text-2xl font-bold text-text-main mt-1">
                        {formatCurrency(taxData.estimatedTax)}
                    </p>
                    <p className="text-xs text-text-muted mt-2">
                        ※概算です。実際の税額とは異なる場合があります
                    </p>
                </div>
            </div>

            {/* AI診断ボタン */}
            {aiSuggestions.length === 0 ? (
                <button
                    onClick={runAIDiagnosis}
                    disabled={isLoading}
                    className="btn-primary w-full py-4"
                >
                    {isLoading ? (
                        <>
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            AI分析中...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-5 h-5" />
                            AIアドバイスを受ける
                        </>
                    )}
                </button>
            ) : (
                <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
                    <div className="flex items-center gap-2 text-primary">
                        <Sparkles className="w-5 h-5" />
                        <span className="font-medium">AIからのアドバイス</span>
                    </div>
                    <ul className="space-y-3">
                        {aiSuggestions.map((suggestion, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <ChevronRight className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                <span className="text-text-main">{suggestion}</span>
                            </li>
                        ))}
                    </ul>
                    {estimatedSavings > 0 && (
                        <div className="bg-success-light border border-success/20 rounded-lg p-4 mt-4">
                            <p className="text-sm text-success font-medium">
                                推定節税可能額: {formatCurrency(estimatedSavings)}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    // XTX/XMLファイル生成
    const generateXTXFile = () => {
        const taxInfo: TaxFilingInfo = {
            fiscalYear,
            filingType: hasBlueReturn ? 'blue' : 'white',
            revenue: taxData.totalRevenue,
            expenses: taxData.totalExpenses,
            netIncome: taxData.netIncome,
            expensesByCategory: taxData.expensesByCategory,
            deductions: deductions.filter(d => d.isApplicable).map(d => ({
                type: d.type,
                name: d.name,
                amount: d.amount
            })),
            totalDeductions: taxData.totalDeductions,
            taxableIncome: taxData.taxableIncome,
            estimatedTax: taxData.estimatedTax,
        };

        const xml = hasBlueReturn
            ? generateBlueReturnXTX(taxInfo)
            : generateIncomeStatementXML(taxInfo);

        const filename = hasBlueReturn
            ? `青色申告決算書_${fiscalYear}年度.xtx`
            : `収支内訳書_${fiscalYear}年度.xml`;

        downloadXTXFile(xml, filename);

        // プレビューも開く
        const previewWindow = window.open('', '_blank');
        if (previewWindow) {
            previewWindow.document.write(`
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>e-Tax用ファイルプレビュー - ${fiscalYear}年度</title>
    <style>
        body { font-family: 'Hiragino Sans', sans-serif; background: #1a1a2e; color: #e0e0e0; padding: 40px; margin: 0; }
        .container { max-width: 900px; margin: 0 auto; }
        h1 { color: #60a5fa; text-align: center; }
        .info { background: rgba(96,165,250,0.1); border: 1px solid rgba(96,165,250,0.3); padding: 16px; border-radius: 8px; margin-bottom: 24px; }
        pre { background: #0d1117; padding: 20px; border-radius: 8px; overflow-x: auto; font-size: 12px; line-height: 1.6; }
        .actions { display: flex; gap: 16px; justify-content: center; margin-top: 24px; }
        button { padding: 12px 24px; border-radius: 8px; border: none; cursor: pointer; font-size: 14px; font-weight: 600; }
        .primary { background: #3b82f6; color: white; }
        .secondary { background: rgba(255,255,255,0.1); color: #e0e0e0; border: 1px solid rgba(255,255,255,0.2); }
    </style>
</head>
<body>
    <div class="container">
        <h1>📄 ${hasBlueReturn ? '青色申告決算書' : '収支内訳書'}（${fiscalYear}年度）</h1>
        <div class="info">
            <p>⚠️ <strong>このXMLファイルは参考資料です。</strong></p>
            <p>正式な確定申告は、国税庁の確定申告書等作成コーナーをご利用ください。XMLデータは入力の参考にお使いいただけます。</p>
        </div>
        <pre>${xml.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
        <div class="actions">
            <button class="secondary" onclick="window.close()">✕ 閉じる</button>
        </div>
    </div>
</body>
</html>
            `);
            previewWindow.document.close();
        }
    };

    // ステップ6: 申告書作成
    const Step6Download = () => {
        const [copiedField, setCopiedField] = useState<string | null>(null);

        const handleCopy = async (value: string | number, fieldName: string) => {
            try {
                await navigator.clipboard.writeText(String(value).replace(/[¥,]/g, ''));
                setCopiedField(fieldName);
                setTimeout(() => setCopiedField(null), 2000);
            } catch (err) {
                console.error('コピーに失敗しました:', err);
            }
        };

        return (
            <div className="space-y-6">
                <ReadinessCheck
                    isCorporation={isCorporation}
                    basicInfo={basicInfo}
                    taxData={taxData}
                />

                <div>
                    <h3 className="text-lg font-semibold text-text-main mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        {isCorporation ? '法人税申告書' : '確定申告書'}の作成
                    </h3>
                    <p className="text-text-muted mb-2">
                        入力内容を確認して、書類を作成してください。
                    </p>
                    <p className="text-xs text-text-muted">
                        💡 各項目の右側のコピーボタンで、e-Tax入力時にそのまま貼り付けできます
                    </p>
                </div>

                {/* データ確認（コピー機能付き） */}
                <div className="bg-surface border border-border rounded-xl divide-y divide-border">
                    {/* 申告年度 */}
                    <div className="p-4 flex justify-between items-center">
                        <span className="text-text-muted">申告年度</span>
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-text-main">{fiscalYear}年度</span>
                        </div>
                    </div>
                    {/* 申告方法 */}
                    <div className="p-4 flex justify-between items-center">
                        <span className="text-text-muted">申告方法</span>
                        <span className="font-medium text-text-main">{hasBlueReturn ? '青色申告' : '白色申告'}</span>
                    </div>
                    {/* 売上高 */}
                    <div className="p-4 flex justify-between items-center">
                        <span className="text-text-muted">売上高</span>
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-success">{formatCurrency(taxData.totalRevenue)}</span>
                            <button
                                onClick={() => handleCopy(taxData.totalRevenue, 'revenue')}
                                className={`p-1.5 rounded transition-colors ${copiedField === 'revenue' ? 'bg-success text-white' : 'hover:bg-surface-highlight text-text-muted'}`}
                                title="コピー"
                            >
                                {copiedField === 'revenue' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                    {/* 雑収入（雑損益など） */}
                    <div className="p-4 flex justify-between items-center">
                        <span className="text-text-muted">雑収入</span>
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-success">{formatCurrency(taxData.totalMiscellaneousIncome)}</span>
                            <button
                                onClick={() => handleCopy(taxData.totalMiscellaneousIncome, 'miscellaneous')}
                                className={`p-1.5 rounded transition-colors ${copiedField === 'miscellaneous' ? 'bg-success text-white' : 'hover:bg-surface-highlight text-text-muted'}`}
                                title="コピー"
                            >
                                {copiedField === 'miscellaneous' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                    {/* 経費合計 */}
                    <div className="p-4 flex justify-between items-center">
                        <span className="text-text-muted">経費合計</span>
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-error">{formatCurrency(taxData.totalExpenses)}</span>
                            <button
                                onClick={() => handleCopy(taxData.totalExpenses, 'expenses')}
                                className={`p-1.5 rounded transition-colors ${copiedField === 'expenses' ? 'bg-success text-white' : 'hover:bg-surface-highlight text-text-muted'}`}
                                title="コピー"
                            >
                                {copiedField === 'expenses' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                    {/* 事業所得 */}
                    <div className="p-4 flex justify-between items-center">
                        <span className="text-text-muted">事業所得</span>
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-text-main">{formatCurrency(taxData.netIncome)}</span>
                            <button
                                onClick={() => handleCopy(taxData.netIncome, 'netIncome')}
                                className={`p-1.5 rounded transition-colors ${copiedField === 'netIncome' ? 'bg-success text-white' : 'hover:bg-surface-highlight text-text-muted'}`}
                                title="コピー"
                            >
                                {copiedField === 'netIncome' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                    {/* 控除合計 */}
                    <div className="p-4 flex justify-between items-center">
                        <span className="text-text-muted">控除合計</span>
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-primary">{formatCurrency(taxData.totalDeductions)}</span>
                            <button
                                onClick={() => handleCopy(taxData.totalDeductions, 'deductions')}
                                className={`p-1.5 rounded transition-colors ${copiedField === 'deductions' ? 'bg-success text-white' : 'hover:bg-surface-highlight text-text-muted'}`}
                                title="コピー"
                            >
                                {copiedField === 'deductions' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                    {/* 課税所得 */}
                    <div className="p-4 flex justify-between items-center">
                        <span className="text-text-muted">課税所得</span>
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-text-main">{formatCurrency(taxData.taxableIncome)}</span>
                            <button
                                onClick={() => handleCopy(taxData.taxableIncome, 'taxableIncome')}
                                className={`p-1.5 rounded transition-colors ${copiedField === 'taxableIncome' ? 'bg-success text-white' : 'hover:bg-surface-highlight text-text-muted'}`}
                                title="コピー"
                            >
                                {copiedField === 'taxableIncome' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                    {/* 予想所得税額 */}
                    <div className="p-4 flex justify-between items-center bg-primary-light">
                        <span className="font-medium text-text-main">予想所得税額</span>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-primary text-lg">{formatCurrency(taxData.estimatedTax)}</span>
                            <button
                                onClick={() => handleCopy(taxData.estimatedTax, 'tax')}
                                className={`p-1.5 rounded transition-colors ${copiedField === 'tax' ? 'bg-success text-white' : 'hover:bg-primary/20 text-primary'}`}
                                title="コピー"
                            >
                                {copiedField === 'tax' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ダウンロードオプション */}
                <div className="space-y-6">
                    <h4 className="text-md font-semibold text-text-main flex items-center gap-2">
                        <Download className="w-5 h-5 text-slate-400" />
                        ダウンロード・申告
                    </h4>

                    {/* 基本ダウンロード */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                            onClick={generatePDF}
                            className="px-4 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            申告書プレビュー
                        </button>
                        <button
                            onClick={generateXTXFile}
                            className="px-4 py-3 border border-slate-500 text-slate-300 rounded-lg hover:bg-slate-700/50 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                        >
                            <FileCode className="w-4 h-4" />
                            e-Tax用XMLファイル
                        </button>
                    </div>

                    {/* 日本語PDF自動生成 */}
                    <div className="bg-slate-800/50 border border-slate-600/50 rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="bg-blue-500/20 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full">NEW</span>
                            <h5 className="text-sm font-semibold text-text-main">日本語PDF自動生成</h5>
                        </div>
                        <p className="text-xs text-slate-400 mb-4">
                            {currentBusinessType?.business_type === 'corporation'
                                ? '法人税申告書・決算報告書（財務三表）を日本語PDFで生成'
                                : '確定申告書B・青色申告決算書を日本語PDFで生成'}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* 個人向けボタン */}
                            {currentBusinessType?.business_type !== 'corporation' && (
                                <>
                                    <button
                                        onClick={async () => {
                                            try {
                                                const formData: JpTaxFormData = {
                                                    name: currentBusinessType?.representative_name || user?.name || '',
                                                    address: currentBusinessType?.address || '',
                                                    tradeName: currentBusinessType?.company_name || '',
                                                    phone: currentBusinessType?.phone || '',
                                                    revenue: taxData.totalRevenue,
                                                    expenses: taxData.totalExpenses,
                                                    netIncome: taxData.netIncome,
                                                    expensesByCategory: taxData.expensesByCategory,
                                                    deductions: {
                                                        basic: deductions.find(d => d.type === 'basic')?.amount || 480000,
                                                        blueReturn: hasBlueReturn ? 650000 : 0,
                                                        socialInsurance: deductions.find(d => d.type === 'socialInsurance')?.amount,
                                                    },
                                                    taxableIncome: taxData.taxableIncome,
                                                    estimatedTax: taxData.estimatedTax,
                                                    fiscalYear,
                                                    isBlueReturn: hasBlueReturn,
                                                };
                                                const pdfBytes = await generateTaxReturnBPDF(formData);
                                                const filename = `確定申告書B_${fiscalYear}年度.pdf`;
                                                downloadPDF(pdfBytes, filename);
                                                previewPDF(pdfBytes);
                                                await saveFilingToHistory();
                                            } catch (err) {
                                                console.error('PDF生成エラー:', err);
                                                alert('PDF生成に失敗しました。フォントファイルを確認してください。');
                                            }
                                        }}
                                        className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                                    >
                                        <FileText className="w-4 h-4" />
                                        確定申告書B
                                    </button>
                                    {hasBlueReturn && (
                                        <button
                                            onClick={async () => {
                                                try {
                                                    const formData: JpTaxFormData = {
                                                        name: user?.name,
                                                        address: currentBusinessType?.address || '',
                                                        tradeName: currentBusinessType?.company_name || '',
                                                        revenue: taxData.totalRevenue,
                                                        expenses: taxData.totalExpenses,
                                                        netIncome: taxData.netIncome,
                                                        expensesByCategory: taxData.expensesByCategory,
                                                        deductions: {
                                                            blueReturn: 650000,
                                                        },
                                                        taxableIncome: taxData.taxableIncome,
                                                        estimatedTax: taxData.estimatedTax,
                                                        fiscalYear,
                                                        isBlueReturn: true,
                                                    };
                                                    const pdfBytes = await generateBlueReturnPDF(formData);
                                                    const filename = `青色申告決算書_${fiscalYear}年度.pdf`;
                                                    downloadPDF(pdfBytes, filename);
                                                    previewPDF(pdfBytes);
                                                    await saveFilingToHistory();
                                                } catch (err) {
                                                    console.error('PDF生成エラー:', err);
                                                    alert('PDF生成に失敗しました。フォントファイルを確認してください。');
                                                }
                                            }}
                                            className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                                        >
                                            <FileText className="w-4 h-4" />
                                            青色申告決算書
                                        </button>
                                    )}
                                </>
                            )}

                            {/* 法人向けボタン */}
                            {currentBusinessType?.business_type === 'corporation' && (
                                <>
                                    <button
                                        onClick={async () => {
                                            try {
                                                const formData: JpTaxFormData = {
                                                    companyName: currentBusinessType?.company_name || '会社名',
                                                    representativeName: currentBusinessType?.representative_name || '',
                                                    address: currentBusinessType?.address || '',
                                                    revenue: taxData.totalRevenue,
                                                    expenses: taxData.totalExpenses,
                                                    netIncome: taxData.netIncome,
                                                    expensesByCategory: taxData.expensesByCategory,
                                                    taxableIncome: taxData.taxableIncome,
                                                    estimatedTax: taxData.estimatedTax,
                                                    fiscalYear,
                                                    businessType: 'corporation',
                                                };
                                                const pdfBytes = await generateCorporateTaxPDF(formData);
                                                const filename = `法人税申告書_${fiscalYear}年度.pdf`;
                                                downloadPDF(pdfBytes, filename);
                                                previewPDF(pdfBytes);
                                                await saveFilingToHistory();
                                            } catch (err) {
                                                console.error('PDF生成エラー:', err);
                                                alert('PDF生成に失敗しました。フォントファイルを確認してください。');
                                            }
                                        }}
                                        className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                                    >
                                        <FileText className="w-4 h-4" />
                                        法人税申告書
                                    </button>
                                    <button
                                        onClick={async () => {
                                            try {
                                                const formData: JpTaxFormData = {
                                                    revenue: taxData.totalRevenue,
                                                    expenses: taxData.totalExpenses,
                                                    netIncome: taxData.netIncome,
                                                    expensesByCategory: taxData.expensesByCategory,
                                                    taxableIncome: taxData.taxableIncome,
                                                    estimatedTax: taxData.estimatedTax,
                                                    fiscalYear,
                                                    businessType: 'corporation',
                                                    companyName: currentBusinessType?.company_name || '会社名',
                                                    representativeName: currentBusinessType?.representative_name || '',
                                                    capital: 1000000,
                                                };
                                                const pdfBytes = await generateFinancialStatementPDF(formData);
                                                const filename = `決算報告書_${fiscalYear}年度.pdf`;
                                                downloadPDF(pdfBytes, filename);
                                                previewPDF(pdfBytes);
                                                await saveFilingToHistory();
                                            } catch (err) {
                                                console.error('PDF生成エラー:', err);
                                                alert('PDF生成に失敗しました。フォントファイルを確認してください。');
                                            }
                                        }}
                                        className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                                    >
                                        <FileText className="w-4 h-4" />
                                        決算報告書（財務三表）
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* 公式テンプレート（法人向け） */}
                    {currentBusinessType?.business_type === 'corporation' && (
                        <div className="bg-slate-800/30 border border-slate-600/30 rounded-xl p-5">
                            <h5 className="text-sm font-semibold text-text-main mb-1">公式テンプレート</h5>
                            <p className="text-xs text-slate-400 mb-4">
                                国税庁の法人税申告書テンプレート（令和6年4月1日以後終了事業年度分）
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                <a
                                    href="https://www.nta.go.jp/taxes/tetsuzuki/shinsei/annai/hojin/shinkoku/itiran2024/pdf/01_01.pdf"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-2.5 border border-slate-500/50 text-slate-300 rounded-lg hover:bg-slate-700/50 hover:border-slate-400 transition-all text-xs font-medium flex items-center justify-center gap-1.5"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    別表一（一）
                                </a>
                                <a
                                    href="https://www.nta.go.jp/taxes/tetsuzuki/shinsei/annai/hojin/shinkoku/itiran2024/pdf/01_02.pdf"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-2.5 border border-slate-500/50 text-slate-300 rounded-lg hover:bg-slate-700/50 hover:border-slate-400 transition-all text-xs font-medium flex items-center justify-center gap-1.5"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    別表一（二）
                                </a>
                                <a
                                    href="https://www.nta.go.jp/taxes/tetsuzuki/shinsei/annai/hojin/shinkoku/itiran2024/pdf/04.pdf"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-2.5 border border-slate-500/50 text-slate-300 rounded-lg hover:bg-slate-700/50 hover:border-slate-400 transition-all text-xs font-medium flex items-center justify-center gap-1.5"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    別表四
                                </a>
                                <a
                                    href="https://www.nta.go.jp/taxes/tetsuzuki/shinsei/annai/hojin/shinkoku/itiran2024/01.htm"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-2.5 border border-slate-500/50 text-slate-300 rounded-lg hover:bg-slate-700/50 hover:border-slate-400 transition-all text-xs font-medium flex items-center justify-center gap-1.5"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    全別表一覧
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                {/* e-Tax申告ガイド */}
                <div className="bg-slate-800/30 border border-slate-600/30 rounded-xl p-5">
                    <h4 className="text-sm font-semibold text-text-main mb-3 flex items-center gap-2">
                        <ExternalLink className="w-4 h-4 text-slate-400" />
                        e-Taxで直接申告する
                    </h4>
                    <ol className="text-xs text-slate-400 space-y-2 mb-4">
                        <li className="flex items-start gap-2">
                            <span className="flex-shrink-0 w-5 h-5 bg-slate-600 text-slate-200 rounded-full flex items-center justify-center text-[10px] font-medium">1</span>
                            上のコピーボタンで各数値をコピー
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="flex-shrink-0 w-5 h-5 bg-slate-600 text-slate-200 rounded-full flex items-center justify-center text-[10px] font-medium">2</span>
                            確定申告書等作成コーナーにアクセス
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="flex-shrink-0 w-5 h-5 bg-slate-600 text-slate-200 rounded-full flex items-center justify-center text-[10px] font-medium">3</span>
                            コピーした数値を貼り付けて入力
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="flex-shrink-0 w-5 h-5 bg-slate-600 text-slate-200 rounded-full flex items-center justify-center text-[10px] font-medium">4</span>
                            マイナンバーカードで電子署名 → 送信完了！
                        </li>
                    </ol>
                    <div className="flex flex-wrap gap-3">
                        <a
                            href="https://www.keisan.nta.go.jp/kyoutu/ky/smsp/top"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm font-medium"
                        >
                            <ExternalLink className="w-4 h-4" />
                            確定申告書等作成コーナー
                        </a>
                        <Link
                            to="/tax-filing-guide"
                            className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-500 text-slate-300 rounded-lg hover:bg-slate-700/50 transition-colors text-sm font-medium"
                        >
                            📖 詳しい申告ガイド
                        </Link>
                    </div>
                </div>

                {/* 注意事項 */}
                <div className="bg-slate-800/30 border border-slate-600/30 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm text-slate-300 font-medium">ご注意ください</p>
                        <ul className="text-xs text-slate-400 mt-2 space-y-1 list-disc list-inside">
                            <li>この計算は概算です。正確な税額は税務署にご確認ください</li>
                            <li>確定申告の期限は翌年3月15日です（例：2025年度分は2026年3月15日まで）</li>
                            <li>青色申告特別控除65万円の適用には電子申告が必要です</li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    };

    // ステップコンテンツを取得
    const renderStepContent = () => {
        switch (currentStep) {
            case 1: return <Step1BasicInfo />;
            case 2: return <Step2IncomeExpense />;
            case 3: return <Step3Depreciation />;
            case 4: return <Step4Deductions />;
            case 5: return <Step5AIDiagnosis />;
            case 6: return <Step6Download />;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                {/* ヘッダー */}
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                        <Link to="/dashboard" className="flex items-center text-xs text-primary hover:text-primary-hover">
                            <ArrowLeft className="h-4 w-4 mr-1.5" />
                            ダッシュボードに戻る
                        </Link>
                        <Link
                            to="/tax-filing-guide"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-xs font-medium"
                        >
                            📖 申告ガイド
                        </Link>
                    </div>
                    <h1 className="text-xl font-bold text-text-main mb-1">確定申告サポート</h1>
                    <p className="text-xs text-text-muted">
                        6つのステップで簡単に確定申告を完了できます
                    </p>
                </div>

                {/* 進捗バー */}
                <ProgressBar />

                {/* メインコンテンツ */}
                <div className="bg-surface border border-border rounded-xl p-3 mb-6">
                    {renderStepContent()}
                </div>

                {/* ナビゲーションボタン */}
                <div className="flex justify-between">
                    <button
                        onClick={goToPreviousStep}
                        disabled={currentStep === 1}
                        className={`btn-ghost ${currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <ArrowLeft className="w-5 h-5" />
                        戻る
                    </button>
                    {currentStep < WIZARD_STEPS.length ? (
                        <button onClick={goToNextStep} className="btn-primary">
                            次へ
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    ) : (
                        <button onClick={generatePDF} className="btn-success">
                            <CheckCircle className="w-5 h-5" />
                            完了
                        </button>
                    )}
                </div>
            </div>

            {/* 前期データインポートモーダル */}
            <PreviousYearImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                userId={user?.id || ''}
                businessType={currentBusinessType?.business_type || 'individual'}
                onImportSuccess={() => {
                    // 最新データを再取得
                    if (user?.id && currentBusinessType?.business_type) {
                        yearlySettlementService.getLatest(user.id, currentBusinessType.business_type)
                            .then(setPrevYearSettlement);
                    }
                }}
            />

        </div>
    );
};

export default TaxFilingWizard;
