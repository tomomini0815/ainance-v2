import React, { useEffect } from 'react';
import { CorporateTaxInputData, Beppyo5Data } from '../../types/corporateTaxInput';
import { ArrowUpRight, ArrowDownRight, Calculator, HelpCircle, Landmark } from 'lucide-react';
import { MoneyInput } from '../common/MoneyInput';

interface Props {
    data: CorporateTaxInputData;
    onChange: (updates: Partial<CorporateTaxInputData>) => void;
}

export const Beppyo5_1Input: React.FC<Props> = ({ data, onChange }) => {
    const { beppyo5 } = data;

    // 自動計算
    useEffect(() => {
        const retainedEnd = (beppyo5.retainedEarningsBegin || 0) + (beppyo5.currentIncrease || 0) - (beppyo5.currentDecrease || 0);
        const capitalEnd = (beppyo5.capitalBegin || 0) + (beppyo5.capitalIncrease || 0) - (beppyo5.capitalDecrease || 0);

        if (retainedEnd !== beppyo5.retainedEarningsEnd || capitalEnd !== beppyo5.capitalEnd) {
            handleChange('retainedEarningsEnd', retainedEnd);
            handleChange('capitalEnd', capitalEnd);
        }
    }, [
        beppyo5.retainedEarningsBegin,
        beppyo5.currentIncrease,
        beppyo5.currentDecrease,
        beppyo5.capitalBegin,
        beppyo5.capitalIncrease,
        beppyo5.capitalDecrease
    ]);

    const handleChange = (field: keyof Beppyo5Data, value: number) => {
        onChange({
            beppyo5: {
                ...beppyo5,
                [field]: value
            }
        });
    };

    return (
        <div className="space-y-8">


            {/* 1. 利益積立金額の計算 */}
            <div>
                <h4 className="flex items-center gap-2 text-md font-bold text-text-main mb-4 border-l-4 border-secondary pl-3">
                    <Calculator className="w-5 h-5 text-secondary" />
                    I. 利益積立金額の計算
                </h4>

                <div className="bg-surface rounded-xl border border-border overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-border">
                        {/* 期首現在高 */}
                        <div className="p-4 bg-surface-highlight/30">
                            <label className="block text-sm font-medium text-text-muted mb-2">
                                期首現在利益積立金額
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">¥</span>
                                <MoneyInput
                                    value={beppyo5.retainedEarningsBegin}
                                    onChange={(val) => handleChange('retainedEarningsBegin', val)}
                                    className="w-full pl-8 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-right font-mono bg-surface"
                                />
                            </div>
                            <p className="text-xs text-text-muted mt-2">
                                ※ 前期末の利益積立金額を入力します
                            </p>
                        </div>

                        {/* 差引翌期首現在高 (結果) */}
                        <div className="p-4 bg-primary/5">
                            <label className="block text-sm font-medium text-text-muted mb-2">
                                差引翌期首現在利益積立金額 (④)
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">¥</span>
                                <div className="w-full pl-8 pr-4 py-2 bg-surface border border-primary/30 rounded-lg text-right font-mono font-bold text-primary">
                                    {beppyo5.retainedEarningsEnd.toLocaleString()}
                                </div>
                            </div>
                            <p className="text-xs text-text-muted mt-2">
                                ※ 自動計算されます (① + ② - ③)
                            </p>
                        </div>
                    </div>

                    <div className="border-t border-border p-4 bg-surface">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-2 flex items-center gap-1">
                                    <ArrowUpRight className="w-4 h-4 text-success" />
                                    当期の増減（増）
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">¥</span>
                                    <MoneyInput
                                        value={beppyo5.currentIncrease}
                                        onChange={(val) => handleChange('currentIncrease', val)}
                                        className="w-full pl-8 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-success focus:border-transparent text-right font-mono bg-surface"
                                    />
                                </div>
                                <p className="text-xs text-text-muted mt-1">
                                    当期純利益などを入力
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-2 flex items-center gap-1">
                                    <ArrowDownRight className="w-4 h-4 text-error" />
                                    当期の増減（減）
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">¥</span>
                                    <MoneyInput
                                        value={beppyo5.currentDecrease}
                                        onChange={(val) => handleChange('currentDecrease', val)}
                                        className="w-full pl-8 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-error focus:border-transparent text-right font-mono bg-surface"
                                    />
                                </div>
                                <p className="text-xs text-text-muted mt-1">
                                    配当、中間納付税額などを入力
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. 資本金等の額の計算 */}
            <div>
                <h4 className="flex items-center gap-2 text-md font-bold text-text-main mb-4 border-l-4 border-tertiary pl-3">
                    <Landmark className="w-5 h-5 text-tertiary" />
                    II. 資本金等の額の計算
                </h4>

                <div className="bg-surface rounded-xl border border-border overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-border">
                        {/* 期首現在高 */}
                        <div className="p-4 bg-surface-highlight/30">
                            <label className="block text-sm font-medium text-text-muted mb-2">
                                期首資本金等の額
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">¥</span>
                                <MoneyInput
                                    value={beppyo5.capitalBegin}
                                    onChange={(val) => handleChange('capitalBegin', val)}
                                    className="w-full pl-8 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-right font-mono bg-surface"
                                />
                            </div>
                        </div>

                        {/* 差引翌期首現在高 */}
                        <div className="p-4 bg-primary/5">
                            <label className="block text-sm font-medium text-text-muted mb-2">
                                差引翌期首資本金等の額
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">¥</span>
                                <div className="w-full pl-8 pr-4 py-2 bg-surface border border-primary/30 rounded-lg text-right font-mono font-bold text-primary">
                                    {beppyo5.capitalEnd.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-border p-4 bg-surface">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-2">
                                    当期の増減（増）
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">¥</span>
                                    <MoneyInput
                                        value={beppyo5.capitalIncrease}
                                        onChange={(val) => handleChange('capitalIncrease', val)}
                                        className="w-full pl-8 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-right font-mono bg-surface"
                                    />
                                </div>
                                <p className="text-xs text-text-muted mt-1">
                                    増資など
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-2">
                                    当期の増減（減）
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">¥</span>
                                    <MoneyInput
                                        value={beppyo5.capitalDecrease}
                                        onChange={(val) => handleChange('capitalDecrease', val)}
                                        className="w-full pl-8 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-right font-mono bg-surface"
                                    />
                                </div>
                                <p className="text-xs text-text-muted mt-1">
                                    減資など
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-surface-highlight rounded-lg border border-border">
                <HelpCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-sm text-text-muted">
                    <p className="font-bold text-text-main mb-1">入力のポイント</p>
                    <p>
                        ・この表は、税務上の貸借対照表（純資産の部）とも言われます。<br />
                        ・「差引翌期首現在利益積立金額」が、翌期の「期首現在利益積立金額」となります。<br />
                        ・通常、法人税等の申告書作成において最も重要な表の一つです。決算書の貸借対照表と数字がリンクしていることを確認してください。
                    </p>
                </div>
            </div>
        </div>
    );
};
