import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowLeft,
    ArrowRight,
    Check,
    CheckCircle,
    Calculator,
    FileText,
    HelpCircle,
    Sparkles,
    Download,
    ChevronRight,
    AlertCircle,
    Info,
    Plus,
    Trash2,
    RefreshCw,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTransactions } from '../hooks/useTransactions';
import { useBusinessTypeContext } from '../context/BusinessTypeContext';
import {
    TaxFilingData,
    Deduction,
    calculateTaxFilingData,
    generateInitialDeductions,
    getAIDeductionSuggestions,
    AVAILABLE_DEDUCTIONS,
    formatCurrency,
    formatPercentage,
} from '../services/TaxFilingService';

// ステップ定義
const WIZARD_STEPS = [
    { id: 1, title: '基本情報', icon: FileText, description: '確定申告の基本設定' },
    { id: 2, title: '収支確認', icon: Calculator, description: '売上・経費の確認' },
    { id: 3, title: '控除入力', icon: Plus, description: '各種控除の入力' },
    { id: 4, title: 'AI診断', icon: Sparkles, description: 'AIによる節税アドバイス' },
    { id: 5, title: '申告書作成', icon: Download, description: 'PDFダウンロード' },
];

const TaxFilingWizard: React.FC = () => {
    const { user } = useAuth();
    const { currentBusinessType } = useBusinessTypeContext();
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

    // 初期控除を設定
    useEffect(() => {
        setDeductions(generateInitialDeductions(hasBlueReturn));
    }, [hasBlueReturn]);

    // 確定申告データを計算
    const taxData = useMemo(() => {
        return calculateTaxFilingData(
            transactions,
            fiscalYear,
            currentBusinessType?.business_type || 'individual',
            deductions
        );
    }, [transactions, fiscalYear, currentBusinessType, deductions]);

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
           確定申告書（${fiscalYear}年度）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

申告方法: ${hasBlueReturn ? '青色申告' : '白色申告'}
作成日時: ${new Date().toLocaleString('ja-JP')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【収支内訳】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
売上高:     ${formatCurrency(taxData.totalRevenue)}
経費合計:   ${formatCurrency(taxData.totalExpenses)}
──────────────────────────────────────────────────
事業所得:   ${formatCurrency(taxData.netIncome)}

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
  正式な確定申告は国税庁のe-Taxでお手続きください。
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`.trim();

        // Blobを作成（UTF-8 BOM付きで日本語文字化け防止）
        const blob = new Blob(['\ufeff' + content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        // ダウンロードリンクを作成
        const link = document.createElement('a');
        link.href = url;
        link.download = `確定申告書_${fiscalYear}年度.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // 新しいタブでプレビューを開く
        const previewWindow = window.open('', '_blank');
        if (previewWindow) {
            previewWindow.document.write(`
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>確定申告書プレビュー - ${fiscalYear}年度</title>
    <style>
        body {
            font-family: 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: #e0e0e0;
            padding: 40px;
            min-height: 100vh;
            margin: 0;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: rgba(255,255,255,0.05);
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            backdrop-filter: blur(10px);
        }
        h1 {
            text-align: center;
            color: #60a5fa;
            margin-bottom: 8px;
            font-size: 24px;
        }
        .subtitle {
            text-align: center;
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
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${currentStep > step.id
                                    ? 'bg-success text-white'
                                    : currentStep === step.id
                                        ? 'bg-primary text-white'
                                        : 'bg-surface-highlight text-text-muted'
                                    }`}
                            >
                                {currentStep > step.id ? (
                                    <Check className="w-5 h-5" />
                                ) : (
                                    <step.icon className="w-5 h-5" />
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
            <div>
                <h3 className="text-lg font-semibold text-text-main mb-4">確定申告の基本設定</h3>
                <p className="text-text-muted mb-6">
                    確定申告を行う年度と申告方法を選択してください。
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            {/* 収支サマリー */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-success-light border border-success/20 rounded-xl p-5">
                    <p className="text-sm text-success font-medium">売上高</p>
                    <p className="text-2xl font-bold text-text-main mt-1">
                        {formatCurrency(taxData.totalRevenue)}
                    </p>
                </div>
                <div className="bg-error-light border border-error/20 rounded-xl p-5">
                    <p className="text-sm text-error font-medium">経費合計</p>
                    <p className="text-2xl font-bold text-text-main mt-1">
                        {formatCurrency(taxData.totalExpenses)}
                    </p>
                </div>
                <div className="bg-primary-light border border-primary/20 rounded-xl p-5">
                    <p className="text-sm text-primary font-medium">事業所得</p>
                    <p className="text-2xl font-bold text-text-main mt-1">
                        {formatCurrency(taxData.netIncome)}
                    </p>
                </div>
            </div>

            {/* 経費内訳 */}
            <div className="bg-surface border border-border rounded-xl p-5">
                <h4 className="font-medium text-text-main mb-4">経費内訳（上位5件）</h4>
                {taxData.expensesByCategory.length > 0 ? (
                    <div className="space-y-3">
                        {taxData.expensesByCategory.slice(0, 5).map((cat, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-surface-highlight rounded-lg flex items-center justify-center text-sm font-medium text-text-muted">
                                        {index + 1}
                                    </div>
                                    <span className="text-text-main">{cat.category}</span>
                                </div>
                                <div className="text-right">
                                    <span className="font-medium text-text-main">{formatCurrency(cat.amount)}</span>
                                    <span className="text-text-muted text-sm ml-2">({formatPercentage(cat.percentage)})</span>
                                </div>
                            </div>
                        ))}
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

    // ステップ3: 控除入力
    const Step3Deductions = () => (
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
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">¥</span>
                                <input
                                    type="number"
                                    value={deduction.amount}
                                    onChange={(e) => updateDeductionAmount(deduction.id, Number(e.target.value))}
                                    className="input-base pl-8 w-40"
                                    placeholder="金額"
                                    disabled={deduction.type === 'basic' || deduction.type === 'blue_return'}
                                />
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

    // ステップ4: AI診断
    const Step4AIDiagnosis = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-text-main mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    AIによる節税アドバイス
                </h3>
                <p className="text-text-muted mb-6">
                    AIがあなたの収支データを分析し、節税のアドバイスを提供します。
                </p>
            </div>

            {/* 税額計算結果 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-surface border border-border rounded-xl p-5">
                    <p className="text-sm text-text-muted">課税所得</p>
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

    // ステップ5: 申告書作成
    const Step5CreateDocument = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-text-main mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    確定申告書の作成
                </h3>
                <p className="text-text-muted mb-6">
                    入力内容を確認して、確定申告書をダウンロードしてください。
                </p>
            </div>

            {/* 最終確認 */}
            <div className="bg-surface border border-border rounded-xl divide-y divide-border">
                <div className="p-4 flex justify-between">
                    <span className="text-text-muted">申告年度</span>
                    <span className="font-medium text-text-main">{fiscalYear}年度</span>
                </div>
                <div className="p-4 flex justify-between">
                    <span className="text-text-muted">申告方法</span>
                    <span className="font-medium text-text-main">{hasBlueReturn ? '青色申告' : '白色申告'}</span>
                </div>
                <div className="p-4 flex justify-between">
                    <span className="text-text-muted">売上高</span>
                    <span className="font-medium text-success">{formatCurrency(taxData.totalRevenue)}</span>
                </div>
                <div className="p-4 flex justify-between">
                    <span className="text-text-muted">経費合計</span>
                    <span className="font-medium text-error">{formatCurrency(taxData.totalExpenses)}</span>
                </div>
                <div className="p-4 flex justify-between">
                    <span className="text-text-muted">事業所得</span>
                    <span className="font-medium text-text-main">{formatCurrency(taxData.netIncome)}</span>
                </div>
                <div className="p-4 flex justify-between">
                    <span className="text-text-muted">控除合計</span>
                    <span className="font-medium text-primary">{formatCurrency(taxData.totalDeductions)}</span>
                </div>
                <div className="p-4 flex justify-between bg-primary-light">
                    <span className="font-medium text-text-main">予想所得税額</span>
                    <span className="font-bold text-primary text-lg">{formatCurrency(taxData.estimatedTax)}</span>
                </div>
            </div>

            {/* ダウンロードボタン */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                    onClick={generatePDF}
                    className="btn-primary py-4"
                >
                    <Download className="w-5 h-5" />
                    申告書をダウンロード
                </button>
                <a
                    href="https://www.keisan.nta.go.jp/kyoutu/ky/smsp/top"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline py-4 text-center"
                >
                    <FileText className="w-5 h-5" />
                    e-Taxで申告する
                </a>
            </div>

            <div className="bg-info-light border border-info/20 rounded-lg p-4 flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm text-text-main font-medium">次のステップ</p>
                    <ol className="text-sm text-text-muted mt-2 space-y-1 list-decimal list-inside">
                        <li>ダウンロードした申告書の内容を確認</li>
                        <li>国税庁のe-Taxサイトで電子申告、または税務署に郵送</li>
                        <li>納税（3月15日まで）</li>
                    </ol>
                </div>
            </div>
        </div>
    );

    // ステップコンテンツを取得
    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return <Step1BasicInfo />;
            case 2:
                return <Step2IncomeExpense />;
            case 3:
                return <Step3Deductions />;
            case 4:
                return <Step4AIDiagnosis />;
            case 5:
                return <Step5CreateDocument />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* ヘッダー */}
                <div className="mb-8">
                    <Link to="/dashboard" className="flex items-center text-primary hover:text-primary-hover mb-4">
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        ダッシュボードに戻る
                    </Link>
                    <h1 className="text-3xl font-bold text-text-main mb-2">確定申告サポート</h1>
                    <p className="text-text-muted">
                        5つのステップで簡単に確定申告を完了できます
                    </p>
                </div>

                {/* 進捗バー */}
                <ProgressBar />

                {/* メインコンテンツ */}
                <div className="bg-surface border border-border rounded-xl p-6 mb-6">
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
        </div>
    );
};

export default TaxFilingWizard;
