import React, { useState } from 'react';
import { QuickTaxFilingData, TaxCalculationResult } from '../../types/quickTaxFiling';
import { calculateTax } from '../../services/quickTaxFilingService';
import { FileText, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { generateTaxReturnBPDF, generateBlueReturnPDF, JpTaxFormData } from '../../services/pdfJapaneseService';

interface Step5ConfirmationProps {
    data: QuickTaxFilingData;
    onBack: () => void;
    onComplete: () => void;
}

const Step5Confirmation: React.FC<Step5ConfirmationProps> = ({ data, onBack, onComplete }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const taxResult: TaxCalculationResult = calculateTax(data);

    // 駆け込み申告データをPDF生成用データへ変換
    const mapQuickDataToPdfData = (quickData: QuickTaxFilingData, result: TaxCalculationResult): JpTaxFormData => {
        // 経費カテゴリのマッピング
        const expensesByCategory = Object.entries(quickData.expenses)
            .filter(([_, amount]) => amount > 0)
            .map(([key, amount]) => {
                let categoryName = '雑費';
                if (key === 'supplies') categoryName = '消耗品費';
                if (key === 'communication') categoryName = '通信費';
                if (key === 'transportation') categoryName = '旅費交通費';
                if (key === 'entertainment') categoryName = '接待交際費';
                if (key === 'rent') categoryName = '地代家賃';
                if (key === 'utilities') categoryName = '水道光熱費';
                return { category: categoryName, amount };
            });

        // 減価償却費も追加
        if (quickData.depreciation && quickData.depreciation > 0) {
            expensesByCategory.push({ category: '減価償却費', amount: quickData.depreciation });
        }

        // 扶養親族の振り分け（16歳未満かどうか）
        const dependentDetails = quickData.deductions.dependentDetails || [];
        const today = new Date();
        // 簡易実装として前年12/31時点の年齢
        const baseDate = new Date(today.getFullYear() - 1, 11, 31);

        const dependentsOver16 = dependentDetails.filter(d => {
            const birth = new Date(d.birthDate);
            let age = baseDate.getFullYear() - birth.getFullYear();
            const m = baseDate.getMonth() - birth.getMonth();
            if (m < 0 || (m === 0 && baseDate.getDate() < birth.getDate())) age--;
            return age >= 16;
        });

        const dependentsUnder16 = dependentDetails.filter(d => {
            const birth = new Date(d.birthDate);
            let age = baseDate.getFullYear() - birth.getFullYear();
            const m = baseDate.getMonth() - birth.getMonth();
            if (m < 0 || (m === 0 && baseDate.getDate() < birth.getDate())) age--;
            return age < 16;
        });

        return {
            companyName: quickData.basicInfo.name, // 個人名を使用
            representativeName: quickData.basicInfo.name,
            address: quickData.basicInfo.address,
            fiscalYear: new Date().getFullYear() - 1, // 前年分
            businessType: quickData.basicInfo.businessType === 'corporate' ? 'individual' : 'individual', // 基本個人
            revenue: quickData.income.totalRevenue,
            expenses: result.totalExpenses,
            netIncome: result.netIncome,
            expensesByCategory: expensesByCategory,
            taxableIncome: result.taxableIncome,
            estimatedTax: result.incomeTax,
            deductions: {
                basic: 480000,
                blueReturn: quickData.basicInfo.filingType === 'blue' ? 650000 : 100000,
                socialInsurance: quickData.deductions.socialInsurance,
                lifeInsurance: quickData.deductions.lifeInsurance
            },
            isBlueReturn: quickData.basicInfo.filingType === 'blue',
            manualData: {
                family_details: {
                    spouse: null,
                    dependents: dependentsOver16.map((d, index) => ({
                        id: `dep-${index}`,
                        name: d.name,
                        relationship: d.relationship,
                        birth_date: d.birthDate,
                        income: d.income,
                        living_separately: false,
                        disability_type: 'none'
                    }))
                },
                resident_tax: {
                    collection_method: 'ordinary',
                    dependent_under_16_names: dependentsUnder16.map(d => d.name)
                }
            }
        };
    };

    const handleGeneratePDF = async () => {
        setIsGenerating(true);
        try {
            const pdfData = mapQuickDataToPdfData(data, taxResult);

            // 確定申告書Bの生成
            const taxReturnBytes = await generateTaxReturnBPDF(pdfData);
            downloadPdf(taxReturnBytes, `確定申告書B_${pdfData.fiscalYear}.pdf`);

            // 青色申告の場合は決算書も生成
            if (data.basicInfo.filingType === 'blue') {
                const blueReturnBytes = await generateBlueReturnPDF(pdfData);
                downloadPdf(blueReturnBytes, `青色申告決算書_${pdfData.fiscalYear}.pdf`);
            }

            alert('PDFの生成が完了しました。');
            onComplete();
        } catch (error) {
            console.error('PDF generation failed:', error);
            alert('PDFの生成に失敗しました。');
        } finally {
            setIsGenerating(false);
        }
    };

    const downloadPdf = (bytes: Uint8Array, filename: string) => {
        const blob = new Blob([bytes as any], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-text-main mb-2">入力内容の確認</h2>
            <p className="text-sm sm:text-base text-text-muted mb-6 sm:mb-8">
                入力した内容を確認して、確定申告書類を生成します
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-8">
                {/* 基本情報 */}
                <div className="bg-surface-elevated p-5 rounded-xl border border-border/50">
                    <h3 className="font-bold text-text-main mb-4 flex items-center gap-2 text-lg">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        基本情報
                    </h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between border-b border-border/50 pb-2 last:border-0 last:pb-0">
                            <span className="text-text-muted">氏名</span>
                            <span className="text-text-main font-medium">{data.basicInfo.name}</span>
                        </div>
                        <div className="flex justify-between border-b border-border/50 pb-2 last:border-0 last:pb-0">
                            <span className="text-text-muted">事業種類</span>
                            <span className="text-text-main font-medium">{data.basicInfo.businessType}</span>
                        </div>
                        <div className="flex justify-between border-b border-border/50 pb-2 last:border-0 last:pb-0">
                            <span className="text-text-muted">申告種類</span>
                            <span className="text-text-main font-medium">
                                {data.basicInfo.filingType === 'blue' ? '青色申告' : '白色申告'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 収入情報 */}
                <div className="bg-surface-elevated p-5 rounded-xl border border-border/50">
                    <h3 className="font-bold text-text-main mb-4 flex items-center gap-2 text-lg">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        収入情報
                    </h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between border-b border-border/50 pb-2 last:border-0 last:pb-0">
                            <span className="text-text-muted">総収入</span>
                            <span className="text-text-main font-medium text-base">
                                ¥{data.income.totalRevenue.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between border-b border-border/50 pb-2 last:border-0 last:pb-0">
                            <span className="text-text-muted">収入源</span>
                            <span className="text-text-main font-medium text-right max-w-[60%]">{data.income.sources.join(', ')}</span>
                        </div>
                    </div>
                </div>

                {/* 経費情報 */}
                <div className="bg-surface-elevated p-5 rounded-xl border border-border/50">
                    <h3 className="font-bold text-text-main mb-4 flex items-center gap-2 text-lg">
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
                        {(data.depreciation ?? 0) > 0 && (
                            <div className="flex justify-between py-1 text-primary">
                                <span className="text-text-muted">減価償却費</span>
                                <span className="font-medium">¥{(data.depreciation ?? 0).toLocaleString()}</span>
                            </div>
                        )}
                        <div className="flex justify-between pt-3 mt-1 border-t border-border">
                            <span className="text-text-main font-bold">合計</span>
                            <span className="text-text-main font-bold text-base">
                                ¥{taxResult.totalExpenses.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 控除情報 */}
                <div className="bg-surface-elevated p-5 rounded-xl border border-border/50">
                    <h3 className="font-bold text-text-main mb-4 flex items-center gap-2 text-lg">
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
                                        {key === 'dependents' ? (
                                            data.deductions.dependentDetails?.length ?
                                                `¥${data.deductions.dependentDetails.reduce((acc, dep) => {
                                                    // ここの計算ロジックも統一する必要あり
                                                    const today = new Date();
                                                    const baseDate = new Date(today.getFullYear() - 1, 11, 31);
                                                    const birth = new Date(dep.birthDate);
                                                    let age = baseDate.getFullYear() - birth.getFullYear();
                                                    const m = baseDate.getMonth() - birth.getMonth();
                                                    if (m < 0 || (m === 0 && baseDate.getDate() < birth.getDate())) age--;

                                                    if (age < 16) return acc;
                                                    if (age >= 19 && age < 23) return acc + 630000;
                                                    if (age >= 70) return acc + 480000;
                                                    return acc + 380000;
                                                }, 0).toLocaleString()}` : `${value}人`
                                        ) : `¥${value.toLocaleString()}`}
                                    </span>
                                </div>
                            ) : null;
                        })}
                        <div className="flex justify-between pt-3 mt-1 border-t border-border">
                            <span className="text-text-main font-bold">合計</span>
                            <span className="text-text-main font-bold text-base">
                                ¥{taxResult.totalDeductions.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 税額計算結果 */}
            <div className="bg-gradient-to-br from-primary/5 to-purple-500/10 p-5 sm:p-6 rounded-xl border border-primary/20 mb-8 shadow-sm">
                <h3 className="text-xl font-bold text-text-main mb-6 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-primary" />
                    税額計算結果
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-surface/80 p-4 rounded-lg border border-border/50">
                        <div className="text-xs text-text-muted mb-1">所得金額</div>
                        <div className="text-xl font-bold text-text-main">
                            ¥{taxResult.netIncome.toLocaleString()}
                        </div>
                    </div>
                    <div className="bg-surface/80 p-4 rounded-lg border border-border/50">
                        <div className="text-xs text-text-muted mb-1">課税所得</div>
                        <div className="text-xl font-bold text-text-main">
                            ¥{taxResult.taxableIncome.toLocaleString()}
                        </div>
                    </div>
                    <div className="bg-surface/80 p-4 rounded-lg border border-border/50">
                        <div className="text-xs text-text-muted mb-1">所得税額</div>
                        <div className="text-xl font-bold text-orange-600">
                            ¥{taxResult.incomeTax.toLocaleString()}
                        </div>
                    </div>
                    <div className="bg-surface/80 p-4 rounded-lg border-2 border-primary/20 relative overflow-hidden">
                        <div className="text-xs text-text-muted mb-1">合計納税額</div>
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
                        <p className="font-bold mb-1">重要な注意事項</p>
                        <ul className="list-disc list-inside space-y-1 opacity-90">
                            <li>この計算結果は概算です。正確な税額は税務署で確認してください。</li>
                            <li>青色申告の場合、別途青色申告特別控除（最大65万円）が適用されます。</li>
                            <li>確定申告書類の提出期限は3月15日です。</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* アクションボタン */}
            <div className="flex flex-col-reverse sm:flex-row gap-4">
                <button
                    onClick={onBack}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-lg font-medium bg-surface-elevated text-text-main hover:bg-surface transition-all border border-border"
                >
                    戻る
                </button>
                <button
                    onClick={handleGeneratePDF}
                    disabled={isGenerating}
                    className="flex-1 px-8 py-3.5 rounded-lg font-medium bg-primary text-white hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-98"
                >
                    {isGenerating ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            生成中...
                        </>
                    ) : (
                        <>
                            <Download className="w-5 h-5" />
                            確定申告書類を生成する
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default Step5Confirmation;
