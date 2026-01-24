import React, { useState } from 'react';
import { QuickTaxFilingData, TaxCalculationResult } from '../../types/quickTaxFiling';
import { calculateTax } from '../../services/quickTaxFilingService';
import { FileText, Download, CheckCircle, AlertCircle } from 'lucide-react';

interface Step5ConfirmationProps {
    data: QuickTaxFilingData;
    onBack: () => void;
    onComplete: () => void;
}

const Step5Confirmation: React.FC<Step5ConfirmationProps> = ({ data, onBack, onComplete }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const taxResult: TaxCalculationResult = calculateTax(data);

    const handleGeneratePDF = async () => {
        setIsGenerating(true);
        // TODO: PDF生成処理を実装
        await new Promise(resolve => setTimeout(resolve, 2000)); // シミュレーション
        setIsGenerating(false);
        alert('確定申告書類のPDF生成機能は開発中です。データは保存されました。');
        onComplete();
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-text-main mb-2">入力内容の確認</h2>
            <p className="text-text-muted mb-8">
                入力した内容を確認して、確定申告書類を生成します
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* 基本情報 */}
                <div className="bg-surface-elevated p-6 rounded-lg">
                    <h3 className="font-semibold text-text-main mb-4 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        基本情報
                    </h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-text-muted">氏名</span>
                            <span className="text-text-main font-medium">{data.basicInfo.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-text-muted">事業種類</span>
                            <span className="text-text-main font-medium">{data.basicInfo.businessType}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-text-muted">申告種類</span>
                            <span className="text-text-main font-medium">
                                {data.basicInfo.filingType === 'blue' ? '青色申告' : '白色申告'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 収入情報 */}
                <div className="bg-surface-elevated p-6 rounded-lg">
                    <h3 className="font-semibold text-text-main mb-4 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        収入情報
                    </h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-text-muted">総収入</span>
                            <span className="text-text-main font-medium">
                                ¥{data.income.totalRevenue.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-text-muted">収入源</span>
                            <span className="text-text-main font-medium">{data.income.sources.join(', ')}</span>
                        </div>
                    </div>
                </div>

                {/* 経費情報 */}
                <div className="bg-surface-elevated p-6 rounded-lg">
                    <h3 className="font-semibold text-text-main mb-4 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        経費情報
                    </h3>
                    <div className="space-y-2 text-sm">
                        {Object.entries(data.expenses).map(([key, value]) => {
                            const labels: Record<string, string> = {
                                supplies: '消耗品費',
                                communication: '通信費',
                                transportation: '旅費交通費',
                                entertainment: '接待交際費',
                                rent: '地代家賃',
                                utilities: '水道光熱費',
                                other: 'その他'
                            };
                            return value > 0 ? (
                                <div key={key} className="flex justify-between">
                                    <span className="text-text-muted">{labels[key]}</span>
                                    <span className="text-text-main font-medium">¥{value.toLocaleString()}</span>
                                </div>
                            ) : null;
                        })}
                        <div className="flex justify-between pt-2 border-t border-border">
                            <span className="text-text-main font-semibold">合計</span>
                            <span className="text-text-main font-semibold">
                                ¥{taxResult.totalExpenses.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 控除情報 */}
                <div className="bg-surface-elevated p-6 rounded-lg">
                    <h3 className="font-semibold text-text-main mb-4 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        控除情報
                    </h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-text-muted">基礎控除</span>
                            <span className="text-text-main font-medium">¥480,000</span>
                        </div>
                        {Object.entries(data.deductions).map(([key, value]) => {
                            const labels: Record<string, string> = {
                                socialInsurance: '社会保険料',
                                lifeInsurance: '生命保険料',
                                earthquakeInsurance: '地震保険料',
                                medicalExpenses: '医療費',
                                donations: '寄附金',
                                dependents: '扶養控除'
                            };
                            return value > 0 ? (
                                <div key={key} className="flex justify-between">
                                    <span className="text-text-muted">{labels[key]}</span>
                                    <span className="text-text-main font-medium">
                                        {key === 'dependents' ? `${value}人` : `¥${value.toLocaleString()}`}
                                    </span>
                                </div>
                            ) : null;
                        })}
                        <div className="flex justify-between pt-2 border-t border-border">
                            <span className="text-text-main font-semibold">合計</span>
                            <span className="text-text-main font-semibold">
                                ¥{taxResult.totalDeductions.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 税額計算結果 */}
            <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 p-6 rounded-lg border-2 border-primary/20 mb-8">
                <h3 className="text-xl font-bold text-text-main mb-4 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-primary" />
                    税額計算結果
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-surface/50 p-4 rounded-lg">
                        <div className="text-sm text-text-muted mb-1">所得金額</div>
                        <div className="text-2xl font-bold text-text-main">
                            ¥{taxResult.netIncome.toLocaleString()}
                        </div>
                    </div>
                    <div className="bg-surface/50 p-4 rounded-lg">
                        <div className="text-sm text-text-muted mb-1">課税所得</div>
                        <div className="text-2xl font-bold text-text-main">
                            ¥{taxResult.taxableIncome.toLocaleString()}
                        </div>
                    </div>
                    <div className="bg-surface/50 p-4 rounded-lg">
                        <div className="text-sm text-text-muted mb-1">所得税額</div>
                        <div className="text-2xl font-bold text-orange-600">
                            ¥{taxResult.incomeTax.toLocaleString()}
                        </div>
                    </div>
                    <div className="bg-surface/50 p-4 rounded-lg">
                        <div className="text-sm text-text-muted mb-1">合計納税額</div>
                        <div className="text-2xl font-bold text-red-600">
                            ¥{taxResult.totalTax.toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>

            {/* 注意事項 */}
            <div className="bg-orange-500/10 p-4 rounded-lg border border-orange-500/20 mb-8">
                <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-orange-600">
                        <p className="font-semibold mb-1">重要な注意事項</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>この計算結果は概算です。正確な税額は税務署で確認してください。</li>
                            <li>青色申告の場合、別途青色申告特別控除（最大65万円）が適用されます。</li>
                            <li>確定申告書類の提出期限は3月15日です。</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* アクションボタン */}
            <div className="flex gap-4">
                <button
                    onClick={onBack}
                    className="flex-1 px-8 py-3 rounded-lg font-medium bg-surface-elevated text-text-main hover:bg-surface transition-all"
                >
                    戻る
                </button>
                <button
                    onClick={handleGeneratePDF}
                    disabled={isGenerating}
                    className="flex-1 px-8 py-3 rounded-lg font-medium bg-primary text-white hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isGenerating ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            生成中...
                        </>
                    ) : (
                        <>
                            <Download className="w-5 h-5" />
                            確定申告書類を生成
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default Step5Confirmation;
