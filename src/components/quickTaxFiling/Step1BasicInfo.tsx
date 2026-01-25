import React from 'react';
import { BasicInfo } from '../../types/quickTaxFiling';

interface Step1BasicInfoProps {
    data: BasicInfo;
    onChange: (data: BasicInfo) => void;
    onNext: () => void;
}

const businessTypes = [
    'IT・エンジニア',
    'デザイナー',
    'ライター',
    'コンサルタント',
    '士業（弁護士・税理士等）',
    '医療・介護',
    '飲食業',
    '小売業',
    'その他'
];

const Step1BasicInfo: React.FC<Step1BasicInfoProps> = ({ data, onChange, onNext }) => {
    const handleChange = (field: keyof BasicInfo, value: string) => {
        onChange({ ...data, [field]: value });
    };

    const isValid = data.name && data.address && data.businessType && data.filingType;

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-text-main mb-2">基本情報を入力してください</h2>
            <p className="text-sm sm:text-base text-text-muted mb-6 sm:mb-8">
                確定申告に必要な基本的な情報を入力します
            </p>

            <div className="space-y-5 sm:space-y-6">
                {/* 氏名 */}
                <div>
                    <label className="block text-sm font-medium text-text-main mb-2">
                        氏名 <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={data.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="山田 太郎"
                        className="w-full px-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base text-text-main placeholder:text-text-muted/50"
                    />
                </div>

                {/* 住所 */}
                <div>
                    <label className="block text-sm font-medium text-text-main mb-2">
                        住所 <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={data.address}
                        onChange={(e) => handleChange('address', e.target.value)}
                        placeholder="東京都渋谷区..."
                        className="w-full px-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base text-text-main placeholder:text-text-muted/50"
                    />
                </div>

                {/* マイナンバー */}
                <div>
                    <label className="block text-sm font-medium text-text-main mb-2">
                        マイナンバー（任意）
                    </label>
                    <input
                        type="text"
                        value={data.myNumber}
                        onChange={(e) => handleChange('myNumber', e.target.value)}
                        placeholder="123456789012"
                        maxLength={12}
                        pattern="\d*"
                        inputMode="numeric"
                        className="w-full px-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base text-text-main placeholder:text-text-muted/50"
                    />
                    <p className="text-xs text-text-muted mt-1.5">
                        12桁の数字を入力してください（後から入力することもできます）
                    </p>
                </div>

                {/* 事業の種類 */}
                <div>
                    <label className="block text-sm font-medium text-text-main mb-2">
                        事業の種類 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <select
                            value={data.businessType}
                            onChange={(e) => handleChange('businessType', e.target.value)}
                            className="w-full px-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base text-text-main appearance-none"
                        >
                            <option value="">選択してください</option>
                            {businessTypes.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                            <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-xs text-text-muted mt-1.5">
                        経費の推定に使用します
                    </p>
                </div>

                {/* 申告の種類 */}
                <div>
                    <label className="block text-sm font-medium text-text-main mb-2">
                        申告の種類 <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <button
                            type="button"
                            onClick={() => handleChange('filingType', 'blue')}
                            className={`p-4 rounded-lg border-2 transition-all text-left relative overflow-hidden group ${data.filingType === 'blue'
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-border bg-surface text-text-main hover:border-primary/50'
                                }`}
                        >
                            <div className="font-semibold mb-1 text-base">青色申告</div>
                            <div className="text-xs sm:text-sm opacity-80">65万円控除・節税効果大</div>
                            {data.filingType === 'blue' && (
                                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => handleChange('filingType', 'white')}
                            className={`p-4 rounded-lg border-2 transition-all text-left relative overflow-hidden group ${data.filingType === 'white'
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-border bg-surface text-text-main hover:border-primary/50'
                                }`}
                        >
                            <div className="font-semibold mb-1 text-base">白色申告</div>
                            <div className="text-xs sm:text-sm opacity-80">記帳がシンプル・控除なし</div>
                            {data.filingType === 'white' && (
                                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* 次へボタン */}
            <div className="mt-8 sm:mt-10 flex justify-end">
                <button
                    onClick={onNext}
                    disabled={!isValid}
                    className={`w-full sm:w-auto px-8 py-3.5 sm:py-3 rounded-lg font-medium transition-all shadow-sm active:scale-[0.98] ${isValid
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

export default Step1BasicInfo;
