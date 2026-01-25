import React, { useState } from 'react';
import { ExpensesInfo } from '../../types/quickTaxFiling';
import { Sparkles, Calculator } from 'lucide-react';
import { estimateExpenses } from '../../services/quickTaxFilingService';

interface Step3ExpensesProps {
    data: ExpensesInfo;
    businessType: string;
    totalRevenue: number;
    onChange: (data: ExpensesInfo) => void;
    onNext: () => void;
    onBack: () => void;
}

const expenseCategories = [
    { key: 'supplies', label: '消耗品費', description: '文具、コピー用紙、オフィス用品など' },
    { key: 'communication', label: '通信費', description: '電話料金、インターネット料金など' },
    { key: 'transportation', label: '旅費交通費', description: '電車代、タクシー代、出張費など' },
    { key: 'entertainment', label: '接待交際費', description: '取引先との会食、贈答品など' },
    { key: 'rent', label: '地代家賃', description: '事務所家賃、駐車場代など' },
    { key: 'utilities', label: '水道光熱費', description: '電気代、ガス代、水道代など' },
    { key: 'other', label: 'その他', description: '上記以外の経費' }
];

const Step3Expenses: React.FC<Step3ExpensesProps> = ({
    data,
    businessType,
    totalRevenue,
    onChange,
    onNext,
    onBack
}) => {
    const [showEstimation, setShowEstimation] = useState(false);

    const handleChange = (field: keyof ExpensesInfo, value: string) => {
        onChange({ ...data, [field]: parseInt(value) || 0 });
    };

    const handleEstimate = () => {
        const estimated = estimateExpenses(businessType, totalRevenue);
        onChange(estimated);
        setShowEstimation(true);
    };

    const totalExpenses = Object.values(data).reduce((sum, val) => sum + val, 0);
    const expenseRatio = totalRevenue > 0 ? (totalExpenses / totalRevenue) * 100 : 0;

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-text-main mb-2">経費情報を入力してください</h2>
            <p className="text-sm sm:text-base text-text-muted mb-6 sm:mb-8">
                2025年に使った経費をカテゴリ別に入力します
            </p>

            {/* AI推定ボタン */}
            <div className="mb-8 p-5 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-xl border border-primary/20 shadow-sm relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                            <h3 className="font-bold text-lg text-text-main">AI経費推定</h3>
                        </div>
                        <p className="text-sm text-text-muted">
                            業種「{businessType}」と売上から一般的な経費を自動算出します
                        </p>
                    </div>
                    <button
                        onClick={handleEstimate}
                        className="w-full sm:w-auto px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all text-sm font-bold shadow-md active:scale-95"
                    >
                        経費を推定する
                    </button>
                </div>
                {showEstimation && (
                    <div className="mt-4 p-3 bg-white/50 dark:bg-black/20 rounded-lg animate-in fade-in slide-in-from-top-2">
                        <p className="text-sm text-green-600 font-medium flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500" />
                            推定値を入力しました。必要に応じて調整してください。
                        </p>
                    </div>
                )}
            </div>

            {/* 経費入力フォーム */}
            <div className="space-y-4">
                {expenseCategories.map((category) => (
                    <div key={category.key} className="bg-surface-elevated p-4 sm:p-5 rounded-lg transition-colors border border-transparent hover:border-border">
                        <label className="block text-base font-medium text-text-main mb-1">
                            {category.label}
                        </label>
                        <p className="text-xs text-text-muted mb-3">{category.description}</p>
                        <div className="relative">
                            <input
                                type="number"
                                value={data[category.key as keyof ExpensesInfo] || ''}
                                onChange={(e) => handleChange(category.key as keyof ExpensesInfo, e.target.value)}
                                placeholder="0"
                                inputMode="numeric"
                                className="w-full pl-4 pr-10 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base text-text-main"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted text-sm pointer-events-none">円</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* 合計表示 */}
            <div className="sticky bottom-4 mx-auto mt-8 p-4 bg-surface/90 backdrop-blur-md rounded-xl border-2 border-primary/20 shadow-lg max-w-lg z-10 transition-all">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Calculator className="w-5 h-5 text-primary" />
                        <span className="font-semibold text-text-main">経費合計</span>
                    </div>
                    <span className="text-2xl font-bold text-primary">
                        ¥{totalExpenses.toLocaleString()}
                    </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">売上に対する経費率</span>
                    <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${expenseRatio > 70 ? 'bg-orange-500' : 'bg-green-500'}`}
                                style={{ width: `${Math.min(expenseRatio, 100)}%` }}
                            />
                        </div>
                        <span className={`font-medium ${expenseRatio > 70 ? 'text-orange-500' : 'text-text-main'}`}>
                            {expenseRatio.toFixed(1)}%
                        </span>
                    </div>
                </div>
                {expenseRatio > 70 && (
                    <div className="mt-2 p-2 bg-orange-500/10 rounded text-xs text-orange-600 font-medium">
                        ⚠️ 経費率が高めです。入力内容を確認してください。
                    </div>
                )}
            </div>

            {/* ナビゲーションボタン */}
            <div className="mt-10 mb-6 flex gap-4">
                <button
                    onClick={onBack}
                    className="flex-1 sm:flex-none px-6 sm:px-8 py-3.5 sm:py-3 rounded-lg font-medium bg-surface-elevated text-text-main hover:bg-surface transition-all border border-border"
                >
                    戻る
                </button>
                <button
                    onClick={onNext}
                    className="flex-1 sm:flex-none sm:ml-auto px-6 sm:px-8 py-3.5 sm:py-3 rounded-lg font-medium bg-primary text-white hover:bg-primary/90 transition-all shadow-sm"
                >
                    次へ進む
                </button>
            </div>
        </div>
    );
};

export default Step3Expenses;
