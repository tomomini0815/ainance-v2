import React, { useState } from 'react';
import { DeductionsInfo } from '../../types/quickTaxFiling';
import { Shield, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
        help: '支払った社会保険料の全額が控除されます。年金定期便やハガキを確認してください。'
    },
    {
        key: 'lifeInsurance',
        label: '生命保険料控除',
        description: '生命保険、医療保険など',
        help: '最大12万円まで控除されます。保険会社から送られてくる控除証明書を確認してください。'
    },
    {
        key: 'earthquakeInsurance',
        label: '地震保険料控除',
        description: '地震保険料',
        help: '最大5万円まで控除されます。'
    },
    {
        key: 'medicalExpenses',
        label: '医療費控除',
        description: '病院代、薬代など',
        help: '10万円を超えた分が控除されます。交通費（電車・バス）も対象になります。'
    },
    {
        key: 'donations',
        label: '寄附金控除',
        description: 'ふるさと納税など',
        help: '2,000円を超えた分が控除されます。ワンストップ特例を使わない場合に入力します。'
    }
];

const Step4Deductions: React.FC<Step4DeductionsProps> = ({
    data,
    onChange,
    onNext,
    onBack
}) => {
    // 各項目のヘルプ表示状態を管理
    const [openHelp, setOpenHelp] = useState<string | null>(null);

    const handleChange = (field: keyof DeductionsInfo, value: string) => {
        onChange({ ...data, [field]: parseInt(value) || 0 });
    };

    const toggleHelp = (key: string) => {
        setOpenHelp(openHelp === key ? null : key);
    };

    const handleAddDependent = () => {
        const currentDetails = data.dependentDetails || [];
        const newDetails = [...currentDetails, { name: '', relationship: '', birthDate: '', income: 0 }];
        onChange({ ...data, dependentDetails: newDetails, dependents: newDetails.length });
    };

    const handleRemoveDependent = (index: number) => {
        const currentDetails = data.dependentDetails || [];
        const newDetails = currentDetails.filter((_, i) => i !== index);
        onChange({ ...data, dependentDetails: newDetails, dependents: newDetails.length });
    };

    const calculateDeductionAmount = (birthDate: string): number => {
        if (!birthDate) return 0;

        const today = new Date();
        const currentYear = today.getFullYear();
        // 判定基準日: 申告対象年の12月31日
        // ※ 簡易実装として現在年の前年を申告年とする（アプリの仕様に合わせる）
        const filingYear = currentYear - 1;
        const baseDate = new Date(filingYear, 11, 31); // 12月31日

        const birth = new Date(birthDate);
        let age = baseDate.getFullYear() - birth.getFullYear();
        const m = baseDate.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && baseDate.getDate() < birth.getDate())) {
            age--;
        }

        if (age < 16) return 0; // 年少扶養親族 (0円)
        if (age >= 19 && age < 23) return 630000; // 特定扶養親族
        if (age >= 70) return 480000; // 老人扶養親族 (同居以外と仮定)
        return 380000; // 一般の控除対象扶養親族
    };

    const getAge = (birthDate: string): number => {
        if (!birthDate) return 0;
        const today = new Date();
        const currentYear = today.getFullYear();
        const filingYear = currentYear - 1;
        const baseDate = new Date(filingYear, 11, 31);
        const birth = new Date(birthDate);
        let age = baseDate.getFullYear() - birth.getFullYear();
        const m = baseDate.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && baseDate.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    const handleDependentChange = (index: number, field: string, value: any) => {
        const currentDetails = [...(data.dependentDetails || [])];
        if (field === 'income') {
            currentDetails[index] = { ...currentDetails[index], [field]: parseInt(value) || 0 };
        } else if (field === 'birthDate') {
            // 生年月日が変更されたら、控除額を自動計算してセット
            const amount = calculateDeductionAmount(value);
            // incomeというフィールド名だが、ここでは控除額(deduction amount)として使われている箇所があるため注意が必要
            // ただし、型定義のDependentDetail.incomeは「扶養親族の所得」を指すはずだが、
            // Step4DDeductionsの入力フォームでは「控除額」ではなく「所得」を入れている？
            // 前のコードを見ると `<label>所得金額</label>` とあるので、これは「扶養親族自身の所得」を入力させている。
            // ユーザーのリクエストは「控除額の自動計算」。
            // しかし、QuickTaxFilingDataには「控除額」を保存する場所が `deductions.dependents` (合計額) しかない。
            // `DependentDetail` には `deductionAmount` プロパティがないので追加する必要があるかもしれない。
            // いったん、このフィールドは「扶養親族の所得」のままにしておき、
            // 合計控除額の計算ロジック側で、年齢に基づいて計算するように変更するのが正しい。

            // ...訂正: ユーザーは「生年月日を入れると自動的に63万円などがセットされるように」と言っている。
            // つまり詳細データに「控除額」を持たせるべき。

            currentDetails[index] = { ...currentDetails[index], [field]: value };
        } else {
            currentDetails[index] = { ...currentDetails[index], [field]: value };
        }
        onChange({ ...data, dependentDetails: currentDetails });
    };

    // 合計控除額の計算（詳細データがある場合は年齢から算出）
    const totalDeductions = Object.entries(data).reduce((sum, [key, val]) => {
        if (key === 'dependentDetails') return sum; // 詳細配列はスキップ
        if (key === 'dependents') {
            // 扶養控除は詳細データから再計算
            const details = data.dependentDetails || [];
            if (details.length > 0) {
                const depTotal = details.reduce((acc, dep) => acc + calculateDeductionAmount(dep.birthDate), 0);
                return sum + depTotal;
            }
            // 詳細がない場合（後方互換性）、dependentsが「金額」ではなく「人数」を表しているなら加算してはいけない
            // しかし、型定義上 `dependents: number` は元々「控除額」だったのか「人数」だったのか？
            // 以前のコードでは単なる入力フィールドで「円」単位だったが、Step4Deductionsで「人/円」の切り替えがあった。
            // 現在の実装では `dependents: newDetails.length` をセットしているため、これは「人数」である。
            // したがって、単純に足してはいけない。
            return sum;
        }
        return sum + (typeof val === 'number' ? val : 0);
    }, 0);

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-text-main mb-2">控除情報を入力してください</h2>
            <p className="text-sm sm:text-base text-text-muted mb-6 sm:mb-8">
                税金を減らせる各種控除を入力します（該当するものだけで構いません）
            </p>

            {/* 控除入力フォーム */}
            <div className="space-y-3">
                {deductionCategories.map((category) => (
                    <div key={category.key} className="bg-surface-elevated p-3 sm:p-4 rounded-lg border border-transparent transition-colors hover:border-border">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 cursor-pointer" onClick={() => toggleHelp(category.key)}>
                                <div className="flex items-center gap-2">
                                    <label className="block text-base font-medium text-text-main pointer-events-none">
                                        {category.label}
                                    </label>
                                    <HelpCircle className="w-4 h-4 text-text-muted" />
                                </div>
                                <p className="text-xs text-text-muted mt-0.5">{category.description}</p>
                            </div>
                        </div>

                        {/* ヘルプアコーディオン */}
                        <AnimatePresence>
                            {openHelp === category.key && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                    animate={{ height: 'auto', opacity: 1, marginTop: 8 }}
                                    exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="bg-primary/5 p-3 rounded-lg text-sm text-text-main mb-3 border border-primary/10">
                                        💡 {category.help}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="relative">
                            {/* 扶養控除以外の入力 */}
                            <input
                                type="number"
                                value={data[category.key as keyof DeductionsInfo] as number || ''}
                                onChange={(e) => handleChange(category.key as keyof DeductionsInfo, e.target.value)}
                                placeholder="0"
                                inputMode="numeric"
                                className="w-full pl-4 pr-10 py-2.5 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base text-text-main"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted text-sm pointer-events-none">
                                円
                            </span>
                        </div>
                    </div>
                ))}

                {/* 扶養親族の詳細入力 */}
                <div className="bg-surface-elevated p-3 sm:p-4 rounded-lg border border-transparent transition-colors hover:border-border">
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 cursor-pointer" onClick={() => toggleHelp('dependents')}>
                            <div className="flex items-center gap-2">
                                <label className="block text-base font-medium text-text-main pointer-events-none">
                                    扶養控除（扶養親族）
                                </label>
                                <HelpCircle className="w-4 h-4 text-text-muted" />
                            </div>
                            <p className="text-xs text-text-muted mt-0.5">16歳以上の扶養親族の詳細を入力</p>
                        </div>
                    </div>
                    <AnimatePresence>
                        {openHelp === 'dependents' && (
                            <motion.div
                                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                animate={{ height: 'auto', opacity: 1, marginTop: 8 }}
                                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="bg-primary/5 p-3 rounded-lg text-sm text-text-main mb-3 border border-primary/10">
                                    💡 控除額は生年月日から自動計算されます（16歳未満: 0円、19-22歳: 63万円、その他: 38万円等）。
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-4">
                        {(data.dependentDetails || []).map((dep, index) => {
                            const age = getAge(dep.birthDate);
                            const deductionAmount = calculateDeductionAmount(dep.birthDate);

                            return (
                                <div key={index} className="p-4 bg-surface rounded-lg border border-border relative">
                                    <button
                                        onClick={() => handleRemoveDependent(index)}
                                        className="absolute top-2 right-2 text-text-muted hover:text-red-500"
                                    >
                                        ✕
                                    </button>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs text-text-muted mb-1">氏名</label>
                                            <input
                                                type="text"
                                                value={dep.name}
                                                onChange={(e) => handleDependentChange(index, 'name', e.target.value)}
                                                className="w-full px-3 py-2 bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                                                placeholder="例: 佐藤 花子"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-text-muted mb-1">続柄</label>
                                            <input
                                                type="text"
                                                value={dep.relationship}
                                                onChange={(e) => handleDependentChange(index, 'relationship', e.target.value)}
                                                className="w-full px-3 py-2 bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                                                placeholder="例: 母"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-text-muted mb-1">生年月日</label>
                                            <input
                                                type="date"
                                                value={dep.birthDate}
                                                onChange={(e) => handleDependentChange(index, 'birthDate', e.target.value)}
                                                className="w-full px-3 py-2 bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-text-muted mb-1">親族の年間所得（控除額ではありません）</label>
                                            <input
                                                type="number"
                                                value={dep.income}
                                                onChange={(e) => handleDependentChange(index, 'income', e.target.value)}
                                                className="w-full px-3 py-2 bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-2 pt-2 border-t border-border/50 text-right">
                                        <span className="text-xs text-text-muted mr-2">年齢: {age}歳</span>
                                        <span className="text-sm font-bold text-primary">
                                            控除額: {deductionAmount.toLocaleString()}円
                                            {age < 16 && <span className="text-xs text-text-muted ml-1">（年少扶養親族・住民税対象）</span>}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                        <button
                            onClick={handleAddDependent}
                            className="w-full py-2 border-2 border-dashed border-border rounded-lg text-text-muted hover:text-primary hover:border-primary transition-colors flex items-center justify-center gap-2"
                        >
                            <span>+ 扶養親族を追加</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* 控除合計 */}
            <div className={`mt-6 p-4 rounded-xl border-2 transition-all ${totalDeductions > 0 ? 'bg-green-500/10 border-green-500/20' : 'bg-surface-elevated border-border'}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Shield className={`w-5 h-5 ${totalDeductions > 0 ? 'text-green-600' : 'text-text-muted'}`} />
                        <span className="font-semibold text-text-main">控除合計</span>
                    </div>
                    <span className={`text-2xl font-bold ${totalDeductions > 0 ? 'text-green-600' : 'text-text-main'}`}>
                        ¥{totalDeductions.toLocaleString()}
                    </span>
                </div>
                <p className="text-xs sm:text-sm text-text-muted mt-2">
                    基礎控除（最大95万円）に加えて、上記の控除が適用されます
                </p>
            </div>

            {/* 注意事項 */}
            <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <p className="text-sm text-blue-600 font-medium">
                    💡 控除の証明書類は確定申告時に提出が必要です。大切に保管しておいてください。
                </p>
            </div>

            {/* ナビゲーションボタン */}
            <div className="mt-10 flex gap-4">
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

export default Step4Deductions;
