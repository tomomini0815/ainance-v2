import React, { useState } from 'react';
import { IncomeInfo } from '../../types/quickTaxFiling';
import { TrendingUp, HelpCircle, Check } from 'lucide-react';

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
            <h2 className="text-xl sm:text-2xl font-bold text-text-main mb-2">収入情報を入力してください</h2>
            <p className="text-sm sm:text-base text-text-muted mb-6 sm:mb-8">
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
                            inputMode="numeric"
                            className="w-full pl-12 pr-10 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base text-text-main disabled:opacity-50 disabled:bg-surface-elevated"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted">円</span>
                    </div>
                    {data.totalRevenue > 0 && (
                        <p className="text-sm text-green-600 mt-2 font-medium">
                            ¥{data.totalRevenue.toLocaleString()}
                        </p>
                    )}
                </div>

                {/* 月別入力オプション */}
                <div
                    className="bg-surface-elevated p-4 rounded-lg cursor-pointer hover:bg-surface-elevated/80 transition-colors border border-transparent hover:border-border"
                    onClick={() => {
                        const newValue = !showMonthlyInput;
                        setShowMonthlyInput(newValue);
                        if (!newValue) {
                            handleChange('monthlyBreakdown', undefined);
                        } else {
                            handleChange('monthlyBreakdown', Array(12).fill(0));
                        }
                    }}
                >
                    <div className="flex items-center justify-between pointer-events-none">
                        <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${showMonthlyInput ? 'bg-primary border-primary' : 'border-text-muted bg-surface'}`}>
                                {showMonthlyInput && <Check className="w-3.5 h-3.5 text-white" />}
                            </div>
                            <span className="text-sm font-medium text-text-main">月別に詳しく入力する（任意）</span>
                        </div>
                        <HelpCircle className="w-4 h-4 text-text-muted" />
                    </div>
                    <p className="text-xs text-text-muted mt-2 pl-8">
                        より正確な申告をしたい場合は、月別の収入を入力できます
                    </p>
                </div>

                {/* 月別入力 */}
                {showMonthlyInput && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
                        {Array.from({ length: 12 }, (_, i) => (
                            <div key={i}>
                                <label className="block text-xs text-text-muted mb-1 ml-1">
                                    {i + 1}月
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={data.monthlyBreakdown?.[i] || ''}
                                        onChange={(e) => handleMonthlyChange(i, e.target.value)}
                                        placeholder="0"
                                        inputMode="numeric"
                                        className="w-full pl-3 pr-7 py-2.5 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base text-text-main"
                                    />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-text-muted">円</span>
                                </div>
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
                                className={`p-3.5 sm:p-3 rounded-lg border text-sm font-medium transition-all relative overflow-hidden ${data.sources.includes(source)
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'border-border bg-surface text-text-main hover:border-primary/50 hover:bg-surface-elevated'
                                    }`}
                            >
                                {source}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ナビゲーションボタン */}
            <div className="mt-8 sm:mt-10 flex gap-4">
                <button
                    onClick={onBack}
                    className="flex-1 sm:flex-none px-6 sm:px-8 py-3.5 sm:py-3 rounded-lg font-medium bg-surface-elevated text-text-main hover:bg-surface transition-all border border-border"
                >
                    戻る
                </button>
                <button
                    onClick={onNext}
                    disabled={!isValid}
                    className={`flex-1 sm:flex-none sm:ml-auto px-6 sm:px-8 py-3.5 sm:py-3 rounded-lg font-medium transition-all shadow-sm ${isValid
                        ? 'bg-primary text-white hover:bg-primary/90 hover:shadow'
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
