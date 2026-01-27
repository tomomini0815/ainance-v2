import React, { useEffect } from 'react';
import { CorporateTaxInputData, Beppyo15Data } from '../../types/corporateTaxInput';
import { ArrowRight, HelpCircle } from 'lucide-react';
import { MoneyInput } from '../common/MoneyInput';

interface Props {
    data: CorporateTaxInputData;
    onChange: (updates: Partial<CorporateTaxInputData>) => void;
}

export const Beppyo15Input: React.FC<Props> = ({ data, onChange }) => {
    const { beppyo15 } = data;

    // 自動計算
    useEffect(() => {
        // 中小法人の特例（資本金1億円以下）
        // 1. 定額控除限度額 (年800万円)
        // 2. 接待飲食費の50%
        // いずれか有利な方を選択可能だが、通常は800万円の方が有利なケースが多い（飲食費が1600万円を超えない限り）

        const limit1 = 8000000;
        const limit2 = Math.floor((beppyo15.deductibleExpenses || 0) * 0.5);
        const limit = Math.max(limit1, limit2);

        // 損金不算入額の計算
        const excess = Math.max(0, (beppyo15.socialExpenses || 0) - limit);

        if (limit !== beppyo15.deductionLimit || excess !== beppyo15.excessAmount) {
            onChange({
                beppyo15: {
                    ...beppyo15,
                    deductionLimit: limit,
                    excessAmount: excess
                }
            });
        }
    }, [beppyo15.socialExpenses, beppyo15.deductibleExpenses, beppyo15.deductionLimit, beppyo15.excessAmount]);

    const handleChange = (field: keyof Beppyo15Data, value: number) => {
        onChange({
            beppyo15: {
                ...beppyo15,
                [field]: value
            }
        });
    };

    return (
        <div className="space-y-8">


            {/* 入力フォーム */}
            <div>
                <h4 className="text-md font-bold text-text-main border-l-4 border-secondary pl-3 mb-4">
                    交際費の計算
                </h4>

                <div className="bg-surface rounded-xl border border-border overflow-hidden">
                    <div className="p-6 grid grid-cols-1 gap-6">

                        {/* 1. 交際費の総額 */}
                        <div>
                            <label className="block text-sm font-medium text-text-main mb-2">
                                1. 支出した交際費等の額
                            </label>
                            <div className="relative max-w-md">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">¥</span>
                                <MoneyInput
                                    value={beppyo15.socialExpenses}
                                    onChange={(val) => handleChange('socialExpenses', val)}
                                    className="w-full pl-8 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-right font-mono text-lg"
                                />
                            </div>
                            <p className="text-xs text-text-muted mt-1">
                                決算書の「交際費」の金額を入力してください
                            </p>
                        </div>

                        {/* 2. 接待飲食費 */}
                        <div>
                            <label className="block text-sm font-medium text-text-main mb-2">
                                2. うち接待飲食費の額
                            </label>
                            <div className="relative max-w-md">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">¥</span>
                                <MoneyInput
                                    value={beppyo15.deductibleExpenses}
                                    onChange={(val) => handleChange('deductibleExpenses', val)}
                                    className="w-full pl-8 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-right font-mono"
                                />
                            </div>
                            <p className="text-xs text-text-muted mt-1">
                                飲食等のために支出した費用（1人あたり5000円超のものなど）
                            </p>
                        </div>

                        <div className="my-2 border-t border-dashed border-border"></div>

                        {/* 計算結果 */}
                        <div className="bg-surface-highlight/50 p-4 rounded-lg space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-text-muted">損金算入限度額 (A)</span>
                                <span className="text-lg font-mono font-bold text-success">
                                    ¥{beppyo15.deductionLimit.toLocaleString()}
                                </span>
                            </div>
                            <p className="text-xs text-text-muted text-right -mt-2">
                                ※ 年800万円 または 接待飲食費×50% の大きい方
                            </p>

                            <div className="flex justify-between items-center pt-2 border-t border-border">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-text-main">損金不算入額</span>
                                    <ArrowRight className="w-4 h-4 text-text-muted" />
                                    <span className="text-xs text-text-muted bg-surface px-2 py-1 rounded border border-border">別表四で加算</span>
                                </div>
                                <span className={`text-xl font-mono font-bold ${beppyo15.excessAmount > 0 ? 'text-error' : 'text-text-main'}`}>
                                    ¥{beppyo15.excessAmount.toLocaleString()}
                                </span>
                            </div>
                            <p className="text-xs text-text-muted text-right -mt-1">
                                交際費等の額 - 損金算入限度額 (マイナスの場合は0)
                            </p>
                        </div>

                    </div>
                </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-surface-highlight rounded-lg border border-border">
                <HelpCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-sm text-text-muted">
                    <p className="font-bold text-text-main mb-1">注意点</p>
                    <p>
                        ・資本金1億円以下の中小法人は、年800万円までの交際費を全額経費（損金）にできます。<br />
                        ・800万円を超える部分は、損金として認められないため、別表四で「加算（損金不算入）」する必要があります。<br />
                        ・1人あたり5000円以下の飲食費は、そもそも「交際費」から除外できる（会議費等）ため、ここには含めないのが一般的です。
                    </p>
                </div>
            </div>
        </div>
    );
};
