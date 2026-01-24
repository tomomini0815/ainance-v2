import React from 'react';
import { DeductionsInfo } from '../../types/quickTaxFiling';
import { Shield, HelpCircle } from 'lucide-react';

interface Step4DeductionsProps {
    data: DeductionsInfo;
    onChange: (data: DeductionsInfo) => void;
    onNext: () => void;
    onBack: () => void;
}

const deductionCategories = [
    {
        key: 'socialInsurance',
        label: '社会保険料控除',
        description: '国民年金、国民健康保険など',
        help: '支払った社会保険料の全額が控除されます'
    },
    {
        key: 'lifeInsurance',
        label: '生命保険料控除',
        description: '生命保険、医療保険など',
        help: '最大12万円まで控除されます'
    },
    {
        key: 'earthquakeInsurance',
        label: '地震保険料控除',
        description: '地震保険料',
        help: '最大5万円まで控除されます'
    },
    {
        key: 'medicalExpenses',
        label: '医療費控除',
        description: '病院代、薬代など',
        help: '10万円を超えた分が控除されます'
    },
    {
        key: 'donations',
        label: '寄附金控除',
        description: 'ふるさと納税など',
        help: '2,000円を超えた分が控除されます'
    },
    {
        key: 'dependents',
        label: '扶養控除',
        description: '扶養家族の人数',
        help: '1人あたり38万円〜63万円が控除されます'
    }
];

const Step4Deductions: React.FC<Step4DeductionsProps> = ({
    data,
    onChange,
    onNext,
    onBack
}) => {
    const handleChange = (field: keyof DeductionsInfo, value: string) => {
        onChange({ ...data, [field]: parseInt(value) || 0 });
    };

    const totalDeductions = Object.values(data).reduce((sum, val) => sum + val, 0);

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-text-main mb-2">控除情報を入力してください</h2>
            <p className="text-text-muted mb-8">
                税金を減らせる各種控除を入力します（該当するものだけで構いません）
            </p>

            {/* 控除入力フォーム */}
            <div className="space-y-4">
                {deductionCategories.map((category) => (
                    <div key={category.key} className="bg-surface-elevated p-4 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-text-main mb-1">
                                    {category.label}
                                </label>
                                <p className="text-xs text-text-muted mb-2">{category.description}</p>
                            </div>
                            <div className="group relative">
                                <HelpCircle className="w-4 h-4 text-text-muted cursor-help" />
                                <div className="absolute right-0 top-6 w-64 p-3 bg-surface-elevated border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                                    <p className="text-xs text-text-main">{category.help}</p>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <input
                                type="number"
                                value={data[category.key as keyof DeductionsInfo] || ''}
                                onChange={(e) => handleChange(category.key as keyof DeductionsInfo, e.target.value)}
                                placeholder="0"
                                className="w-full px-4 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text-main"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted text-sm">
                                {category.key === 'dependents' ? '人' : '円'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* 控除合計 */}
            {totalDeductions > 0 && (
                <div className="mt-6 p-4 bg-green-500/10 rounded-lg border-2 border-green-500/20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-green-600" />
                            <span className="font-semibold text-text-main">控除合計</span>
                        </div>
                        <span className="text-2xl font-bold text-green-600">
                            ¥{totalDeductions.toLocaleString()}
                        </span>
                    </div>
                    <p className="text-sm text-text-muted mt-2">
                        基礎控除48万円に加えて、上記の控除が適用されます
                    </p>
                </div>
            )}

            {/* 注意事項 */}
            <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <p className="text-sm text-blue-600">
                    💡 控除の証明書類は確定申告時に提出が必要です。保管しておいてください。
                </p>
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
                    className="px-8 py-3 rounded-lg font-medium bg-primary text-white hover:bg-primary/90 transition-all"
                >
                    次へ進む
                </button>
            </div>
        </div>
    );
};

export default Step4Deductions;
