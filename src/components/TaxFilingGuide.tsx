import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowLeft,
    Check,
    CheckCircle,
    Copy,
    ExternalLink,
    HelpCircle,
    ClipboardCheck,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';

interface TaxFilingGuideProps {
    taxData: {
        totalRevenue: number;
        totalExpenses: number;
        netIncome: number;
        totalDeductions: number;
        taxableIncome: number;
        estimatedTax: number;
        expensesByCategory: { category: string; amount: number }[];
    };
    fiscalYear: number;
    isBlueReturn: boolean;
    deductions: { name: string; amount: number; isApplicable: boolean }[];
}

// 金額フォーマット
const formatAmount = (amount: number) => {
    return amount.toLocaleString('ja-JP');
};

const TaxFilingGuide: React.FC<TaxFilingGuideProps> = ({
    taxData,
    fiscalYear,
    isBlueReturn,
    deductions,
}) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);
    const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
    const [copiedAll, setCopiedAll] = useState(false);

    // 申告に必要なデータをまとめて生成
    const getAllDataForCopy = () => {
        const applicableDeductions = deductions.filter(d => d.isApplicable);

        return `
【${fiscalYear}年度 確定申告データ】
作成日: ${new Date().toLocaleDateString('ja-JP')}

■ 基本情報
申告方法: ${isBlueReturn ? '青色申告' : '白色申告'}
対象年度: ${fiscalYear}年1月1日〜12月31日

■ 収支
売上高: ${formatAmount(taxData.totalRevenue)}円
経費合計: ${formatAmount(taxData.totalExpenses)}円
事業所得: ${formatAmount(taxData.netIncome)}円

■ 経費内訳
${taxData.expensesByCategory.map(exp => `${exp.category}: ${formatAmount(exp.amount)}円`).join('\n')}

■ 所得控除
${applicableDeductions.map(d => `${d.name}: ${formatAmount(d.amount)}円`).join('\n')}
控除合計: ${formatAmount(taxData.totalDeductions)}円

■ 税額計算
課税所得: ${formatAmount(taxData.taxableIncome)}円
所得税額（概算）: ${formatAmount(taxData.estimatedTax)}円

※この金額は概算です。正式な税額は確定申告書等作成コーナーで確定されます。
`.trim();
    };

    // 全データをコピー
    const copyAllData = async () => {
        try {
            await navigator.clipboard.writeText(getAllDataForCopy());
            setCopiedAll(true);
            setTimeout(() => setCopiedAll(false), 3000);
        } catch (err) {
            console.error('コピーに失敗しました:', err);
        }
    };

    // ステップ完了をトグル
    const toggleStepComplete = (step: number) => {
        if (completedSteps.includes(step)) {
            setCompletedSteps(completedSteps.filter(s => s !== step));
        } else {
            setCompletedSteps([...completedSteps, step]);
        }
    };

    // 申告手順ステップ
    const steps = [
        {
            id: 1,
            title: 'マイナンバーカードを準備',
            description: 'スマートフォンまたはICカードリーダーを用意してください',
            details: [
                'マイナンバーカード（通知カードではNG）',
                '署名用電子証明書のパスワード（6〜16桁）',
                '利用者証明用電子証明書のパスワード（4桁）',
                'マイナポータルアプリ（スマホの場合）',
            ],
            tips: 'パスワードを3回間違えるとロックされます。事前に確認しておきましょう。',
        },
        {
            id: 2,
            title: '確定申告書等作成コーナーにアクセス',
            description: '国税庁のサイトで申告書を作成します',
            details: [
                '「作成開始」をクリック',
                '「マイナンバーカード方式」を選択',
                'スマホを使う場合は「スマートフォンを使用してe-Tax」を選択',
                'ICカードリーダーの場合は「ICカードリーダライタを使用してe-Tax」を選択',
            ],
            link: 'https://www.keisan.nta.go.jp/kyoutu/ky/smsp/top',
            linkText: '確定申告書等作成コーナー',
        },
        {
            id: 3,
            title: '申告書の種類を選択',
            description: '所得税の確定申告書を選びます',
            details: [
                '「所得税」を選択',
                isBlueReturn ? '「青色申告決算書・収支内訳書」→「青色申告決算書」を選択' : '「青色申告決算書・収支内訳書」→「収支内訳書」を選択',
                '事業所得がある方を選択',
            ],
        },
        {
            id: 4,
            title: 'Ainanceのデータを入力',
            description: '下のデータをコピーして入力欄に貼り付けます',
            inputData: [
                { label: '売上高（収入金額）', value: taxData.totalRevenue, field: 'revenue' },
                { label: '経費合計', value: taxData.totalExpenses, field: 'expenses' },
                ...taxData.expensesByCategory.map((exp, i) => ({
                    label: exp.category,
                    value: exp.amount,
                    field: `expense_${i}`,
                })),
            ],
        },
        {
            id: 5,
            title: '所得控除を入力',
            description: '該当する控除を入力します',
            inputData: deductions.filter(d => d.isApplicable).map((d, i) => ({
                label: d.name,
                value: d.amount,
                field: `deduction_${i}`,
            })),
        },
        {
            id: 6,
            title: '内容を確認して送信',
            description: '入力内容を確認し、電子署名をして送信します',
            details: [
                '入力内容を確認する画面で金額をチェック',
                `予想税額: ${formatAmount(taxData.estimatedTax)}円（実際の税額と多少異なる場合があります）`,
                'マイナンバーカードで電子署名',
                '送信完了！受付番号を控えておきましょう',
            ],
        },
        {
            id: 7,
            title: '納税（税金がある場合）',
            description: '所得税の納付期限は3月15日です',
            details: [
                '振替納税（口座振替）: 4月中旬に引き落とし',
                'ダイレクト納付: e-Taxから即時納付',
                'インターネットバンキング: ペイジー対応',
                'クレジットカード: 国税クレジットカードお支払サイト',
                'コンビニ納付: 30万円以下の場合',
            ],
            tips: taxData.estimatedTax > 0
                ? `納税額: 約${formatAmount(taxData.estimatedTax)}円を期限までに納付してください`
                : '今回は還付（お金が戻ってくる）の可能性があります！',
        },
    ];

    // FAQ
    const faqs = [
        {
            question: '青色申告と白色申告、どちらがお得？',
            answer: '青色申告は最大65万円の特別控除があるためお得です。ただし、複式簿記での記帳と電子申告が必要です。Ainanceを使えば自動で帳簿が作成されるので、青色申告がおすすめです。',
        },
        {
            question: 'マイナンバーカードがない場合は？',
            answer: 'ID・パスワード方式でも申告できますが、事前に税務署での届出が必要です。マイナンバーカードの取得をおすすめします（無料で申請可能）。',
        },
        {
            question: '経費の証拠書類は必要？',
            answer: 'はい、領収書・レシートは7年間保存が義務です。Ainanceで撮影した画像も証拠として保存しておきましょう。税務調査の際に提示を求められることがあります。',
        },
        {
            question: '申告期限に間に合わなかったら？',
            answer: '期限後申告も可能ですが、延滞税や加算税がかかる場合があります。できるだけ3月15日までに申告しましょう。',
        },
        {
            question: '間違えて申告してしまったら？',
            answer: '修正申告または更正の請求で訂正できます。税額が増える場合は修正申告、減る場合は更正の請求を行います。',
        },
    ];

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* ヘッダー */}
                <div className="flex items-center mb-8">
                    <Link to="/tax-filing-wizard" className="mr-4">
                        <ArrowLeft className="w-6 h-6 text-text-muted hover:text-text-main" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-text-main">確定申告ガイド</h1>
                        <p className="text-text-muted">ステップに沿って進めれば、税理士なしで申告完了！</p>
                    </div>
                </div>

                {/* 進捗バー */}
                <div className="bg-surface rounded-xl border border-border p-4 mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-text-muted">進捗状況</span>
                        <span className="text-sm font-medium text-primary">
                            {completedSteps.length} / {steps.length} 完了
                        </span>
                    </div>
                    <div className="w-full bg-surface-highlight rounded-full h-3">
                        <div
                            className="bg-gradient-to-r from-primary to-blue-400 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${(completedSteps.length / steps.length) * 100}%` }}
                        />
                    </div>
                </div>

                {/* 一括コピーボタン */}
                <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 border border-primary/20 rounded-xl p-5 mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h3 className="font-semibold text-text-main flex items-center gap-2">
                                <ClipboardCheck className="w-5 h-5 text-primary" />
                                申告データを一括コピー
                            </h3>
                            <p className="text-sm text-text-muted mt-1">
                                このボタンで全データをコピーして、メモとして保存できます
                            </p>
                        </div>
                        <button
                            onClick={copyAllData}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${copiedAll
                                ? 'bg-green-500 text-white'
                                : 'bg-primary text-white hover:bg-primary/90'
                                }`}
                        >
                            {copiedAll ? (
                                <>
                                    <Check className="w-5 h-5" />
                                    コピーしました！
                                </>
                            ) : (
                                <>
                                    <Copy className="w-5 h-5" />
                                    全データをコピー
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* ステップリスト */}
                <div className="space-y-4 mb-8">
                    {steps.map((step) => (
                        <div
                            key={step.id}
                            className={`bg-surface rounded-xl border transition-all ${completedSteps.includes(step.id)
                                ? 'border-green-500/50 bg-green-500/5'
                                : currentStep === step.id
                                    ? 'border-primary'
                                    : 'border-border'
                                }`}
                        >
                            {/* ステップヘッダー */}
                            <div
                                className="p-4 flex items-center justify-between cursor-pointer"
                                onClick={() => setCurrentStep(currentStep === step.id ? 0 : step.id)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${completedSteps.includes(step.id)
                                        ? 'bg-green-500 text-white'
                                        : 'bg-primary/10 text-primary'
                                        }`}>
                                        {completedSteps.includes(step.id) ? (
                                            <Check className="w-5 h-5" />
                                        ) : (
                                            step.id
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-text-main">{step.title}</h3>
                                        <p className="text-sm text-text-muted">{step.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleStepComplete(step.id);
                                        }}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${completedSteps.includes(step.id)
                                            ? 'bg-green-500/10 text-green-500'
                                            : 'bg-surface-highlight text-text-muted hover:text-text-main'
                                            }`}
                                    >
                                        {completedSteps.includes(step.id) ? '完了 ✓' : '完了にする'}
                                    </button>
                                    {currentStep === step.id ? (
                                        <ChevronUp className="w-5 h-5 text-text-muted" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-text-muted" />
                                    )}
                                </div>
                            </div>

                            {/* ステップ詳細 */}
                            {currentStep === step.id && (
                                <div className="px-4 pb-4 border-t border-border pt-4">
                                    {/* 詳細リスト */}
                                    {step.details && (
                                        <ul className="space-y-2 mb-4">
                                            {step.details.map((detail, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-text-main">
                                                    <span className="text-primary">•</span>
                                                    {detail}
                                                </li>
                                            ))}
                                        </ul>
                                    )}

                                    {/* 入力データ（コピー機能付き） */}
                                    {step.inputData && (
                                        <div className="bg-surface-highlight rounded-lg divide-y divide-border">
                                            {step.inputData.map((data, i) => (
                                                <CopyableField
                                                    key={i}
                                                    label={data.label}
                                                    value={data.value}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {/* リンク */}
                                    {step.link && (
                                        <a
                                            href={step.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            {step.linkText}
                                        </a>
                                    )}

                                    {/* ヒント */}
                                    {step.tips && (
                                        <div className="mt-4 flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                            <HelpCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                                            <p className="text-sm text-text-main">{step.tips}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* 全ステップ完了時 */}
                {completedSteps.length === steps.length && (
                    <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-6 mb-8 text-center">
                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-text-main mb-2">
                            🎉 確定申告完了おめでとうございます！
                        </h3>
                        <p className="text-text-muted">
                            税理士なしで確定申告を完了しました。来年もAinanceをご活用ください！
                        </p>
                    </div>
                )}

                {/* FAQ */}
                <div className="bg-surface rounded-xl border border-border p-6">
                    <h2 className="text-lg font-semibold text-text-main mb-4 flex items-center gap-2">
                        <HelpCircle className="w-5 h-5 text-primary" />
                        よくある質問
                    </h2>
                    <div className="space-y-2">
                        {faqs.map((faq, index) => (
                            <div key={index} className="border border-border rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                                    className="w-full p-4 flex items-center justify-between text-left hover:bg-surface-highlight transition-colors"
                                >
                                    <span className="font-medium text-text-main">{faq.question}</span>
                                    {expandedFAQ === index ? (
                                        <ChevronUp className="w-5 h-5 text-text-muted" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-text-muted" />
                                    )}
                                </button>
                                {expandedFAQ === index && (
                                    <div className="px-4 pb-4">
                                        <p className="text-sm text-text-muted">{faq.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// コピー可能フィールドコンポーネント
const CopyableField: React.FC<{ label: string; value: number }> = ({ label, value }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(String(value));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('コピーに失敗しました:', err);
        }
    };

    return (
        <div className="p-3 flex items-center justify-between">
            <span className="text-sm text-text-muted">{label}</span>
            <div className="flex items-center gap-2">
                <span className="font-medium text-text-main">{formatAmount(value)}円</span>
                <button
                    onClick={handleCopy}
                    className={`p-1.5 rounded transition-colors ${copied ? 'bg-green-500 text-white' : 'hover:bg-primary/10 text-text-muted'
                        }`}
                    title="コピー"
                >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
            </div>
        </div>
    );
};

export default TaxFilingGuide;
