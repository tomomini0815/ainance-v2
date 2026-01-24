import React, { useState } from 'react';
import { IncomeInfo } from '../../types/quickTaxFiling';
import { TrendingUp, HelpCircle } from 'lucide-react';

interface Step2IncomeProps {
    data: IncomeInfo;
    onChange: (data: IncomeInfo) => void;
    onNext: () => void;
    onBack: () => void;
}

const incomeSources = [
    '業務委託',
    '給与所得',
    'アフィリエイト',
    '広告収入',
    '販売収入',
    'その他'
];

const Step2Income: React.FC<Step2IncomeProps> = ({ data, onChange, onNext, onBack }) => {
    const [showMonthlyInput, setShowMonthlyInput] = useState(false);

    const handleChange = (field: keyof IncomeInfo, value: any) => {
        onChange({ ...data, [field]: value });
    };

    const handleSourceToggle = (source: string) => {
        const sources = data.sources.includes(source)
            ? data.sources.filter((s) => s !== source)
            : [...data.sources, source];
        handleChange('sources', sources);
    };

    const handleMonthlyChange = (month: number, value: string) => {
        const monthlyBreakdown = data.monthlyBreakdown || Array(12).fill(0);
        monthlyBreakdown[month] = parseInt(value) || 0;
        handleChange('monthlyBreakdown', monthlyBreakdown);

        // 月別合計を総収入に反映
        const total = monthlyBreakdown.reduce((sum, val) => sum + val, 0);
        handleChange('totalRevenue', total);
    };

    const isValid = data.totalRevenue > 0 && data.sources.length > 0;

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-text-main mb-2">収入情報を入力してください</h2>
            <p className="text-text-muted mb-8">
                2025年の総収入と収入源を入力します
            </p>

            <div className="space-y-6">
                {/* 総売上 */}
                <div>
                    <label className="block text-sm font-medium text-text-main mb-2">
                        2025年の総売上（収入） <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <TrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                        <input
                            type="number"
                            value={data.totalRevenue || ''}
                            onChange={(e) => handleChange('totalRevenue', parseInt(e.target.value) || 0)}
                            placeholder="5000000"
                            disabled={showMonthlyInput}
                            className="w-full pl-12 pr-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text-main disabled:opacity-50"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted">円</span>
                    </div>
                    {data.totalRevenue > 0 && (
                        <p className="text-sm text-green-600 mt-2">
                            ¥{data.totalRevenue.toLocaleString()}
                        </p>
                    )}
                </div>

                {/* 月別入力オプション */}
                <div className="bg-surface-elevated p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <label className="flex items-center text-sm font-medium text-text-main">
                            <input
                                type="checkbox"
                                checked={showMonthlyInput}
                                onChange={(e) => {
                                    setShowMonthlyInput(e.target.checked);
                                    if (!e.target.checked) {
                                        handleChange('monthlyBreakdown', undefined);
                                    } else {
                                        handleChange('monthlyBreakdown', Array(12).fill(0));
                                    }
                                }}
                                className="mr-2"
                            />
                            月別に詳しく入力する（任意）
                        </label>
                        <HelpCircle className="w-4 h-4 text-text-muted" />
                    </div>
                    <p className="text-xs text-text-muted">
                        より正確な申告をしたい場合は、月別の収入を入力できます
                    </p>
                </div>

                {/* 月別入力 */}
                {showMonthlyInput && (
                    <div className="grid grid-cols-3 gap-3">
                        {Array.from({ length: 12 }, (_, i) => (
                            <div key={i}>
                                <label className="block text-xs text-text-muted mb-1">
                                    {i + 1}月
                                </label>
                                <input
                                    type="number"
                                    value={data.monthlyBreakdown?.[i] || ''}
                                    onChange={(e) => handleMonthlyChange(i, e.target.value)}
                                    placeholder="0"
                                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text-main text-sm"
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* 収入源 */}
                <div>
                    <label className="block text-sm font-medium text-text-main mb-2">
                        主な収入源（複数選択可） <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {incomeSources.map((source) => (
                            <button
                                key={source}
                                type="button"
                                onClick={() => handleSourceToggle(source)}
                                className={`p-3 rounded-lg border-2 transition-all text-sm ${data.sources.includes(source)
                                        ? 'border-primary bg-primary/10 text-primary'
                                        : 'border-border bg-surface text-text-main hover:border-primary/50'
                                    }`}
                            >
                                {source}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ナビゲーションボタン */}
            <div className="mt-8 flex justify-between">
                <button
                    onClick={onBack}
                    className="px-8 py-3 rounded-lg font-medium bg-surface-elevated text-text-main hover:bg-surface transition-all"
                >
                    戻る
                </button>
                <button
                    onClick={onNext}
                    disabled={!isValid}
                    className={`px-8 py-3 rounded-lg font-medium transition-all ${isValid
                            ? 'bg-primary text-white hover:bg-primary/90'
                            : 'bg-surface-elevated text-text-muted cursor-not-allowed'
                        }`}
                >
                    次へ進む
                </button>
            </div>
        </div>
    );
};

export default Step2Income;
