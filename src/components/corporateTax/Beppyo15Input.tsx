import React, { useEffect } from 'react';
import { CorporateTaxInputData, Beppyo15Data } from '../../types/corporateTaxInput';
import { ArrowRight, HelpCircle, Info } from 'lucide-react';
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
        const limit2 = Math.floor((beppyo15.foodAndDrinkExpenses || 0) * 0.5);
        const limit = Math.max(limit1, limit2);

        // 損金不算入額の計算
        const excess = Math.max(0, (beppyo15.totalEntertainmentExpenses || 0) - limit);

        if (limit !== beppyo15.deductionLimit || excess !== beppyo15.excessAmount) {
            onChange({
                beppyo15: {
                    ...beppyo15,
                    deductionLimit: limit,
                    excessAmount: excess
                }
            });
        }
    }, [beppyo15.totalEntertainmentExpenses, beppyo15.foodAndDrinkExpenses, beppyo15.deductionLimit, beppyo15.excessAmount]);

    const handleChange = (field: keyof Beppyo15Data, value: number) => {
        const updates: Partial<Beppyo15Data> = { [field]: value };

        // 交際費総額または飲食費が変更された場合、その他交際費を自動更新
        if (field === 'totalEntertainmentExpenses') {
            updates.otherEntertainmentExpenses = value - beppyo15.foodAndDrinkExpenses;
        } else if (field === 'foodAndDrinkExpenses') {
            updates.otherEntertainmentExpenses = beppyo15.totalEntertainmentExpenses - value;
        }

        onChange({
            beppyo15: {
                ...beppyo15,
                ...updates
            }
        });
    };

    return (
        <div className="space-y-8">
            {/* 資本金情報 */}
            <div className="bg-slate-50 p-4 rounded-xl border border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-text-secondary">適用判定用 資本金の額:</span>
                </div>
                <div className="flex items-center gap-2">
                    <MoneyInput
                        value={beppyo15.capitalAmount}
                        onChange={(val) => handleChange('capitalAmount', val)}
                        className="bg-transparent text-right font-mono font-bold text-text-main border-b border-border focus:border-primary outline-none px-2 py-0.5"
                    />
                    <span className="text-xs text-text-muted">円</span>
                </div>
            </div>

            {/* 入力フォーム */}
            <div>
                <h4 className="text-md font-bold text-text-main border-l-4 border-secondary pl-3 mb-6">
                    交際費の支出内訳 (別表15)
                </h4>

                <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-sm">
                    <div className="p-6 space-y-8">
                        {/* 1. 交際費の総額 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-text-main mb-2">
                                        交際費等の支出額 (総額)
                                    </label>
                                    <div className="relative">
                                        <MoneyInput
                                            value={beppyo15.totalEntertainmentExpenses}
                                            onChange={(val) => handleChange('totalEntertainmentExpenses', val)}
                                            className="w-full pr-12 pl-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-right font-mono text-xl bg-surface-highlight/30"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted font-bold pointer-events-none">円</span>
                                    </div>
                                    <p className="text-[10px] text-text-muted mt-2">
                                        ※ 損益計算書に計上した交際費・接待費などの全額
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4 p-4 bg-emerald-50/20 rounded-xl border border-emerald-500/10">
                                <label className="block text-[11px] font-black text-emerald-700 uppercase tracking-widest mb-3">支出内訳の入力</label>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs font-bold text-emerald-800">接待飲食費 (50%特例対象)</span>
                                            <span className="text-[10px] text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">特例A</span>
                                        </div>
                                        <div className="relative">
                                            <MoneyInput
                                                value={beppyo15.foodAndDrinkExpenses}
                                                onChange={(val) => handleChange('foodAndDrinkExpenses', val)}
                                                className="w-full pr-10 pl-3 py-2 border border-emerald-500/20 rounded-lg text-right font-mono text-base"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-emerald-400 font-bold">円</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs font-bold text-text-muted">その他の交際費 (贈答・ゴルフ等)</span>
                                        </div>
                                        <div className="relative">
                                            <MoneyInput
                                                value={beppyo15.otherEntertainmentExpenses}
                                                onChange={(val) => handleChange('otherEntertainmentExpenses', val)}
                                                className="w-full pr-10 pl-3 py-2 border border-border rounded-lg text-right font-mono text-base bg-slate-50/50"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-text-muted font-bold">円</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 計算結果 */}
                        <div className="bg-slate-900 text-white p-6 rounded-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl -mr-16 -mt-16"></div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                                <div className="space-y-6">
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">損金算入限度額の判定</span>
                                        <div className="flex items-baseline gap-3">
                                            <span className="text-2xl font-mono font-bold text-primary">
                                                ¥{beppyo15.deductionLimit.toLocaleString()}
                                            </span>
                                            <p className="text-[10px] text-slate-500 italic">
                                                ※ 年800万円 vs 飲食費×50% の大きい方を適用
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center md:items-end justify-center">
                                    <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">損金不算入額 (別表四 加算分)</span>
                                    <div className="text-4xl font-mono font-black text-white">
                                        ¥{beppyo15.excessAmount.toLocaleString()}
                                    </div>
                                    {beppyo15.excessAmount > 0 ? (
                                        <div className="mt-2 text-[10px] text-red-300 flex items-center gap-1">
                                            <ArrowRight className="w-3 h-3" />
                                            限度額を超えた交際費は経費として認められません
                                        </div>
                                    ) : (
                                        <div className="mt-2 text-[10px] text-emerald-400">
                                            全額を損金（経費）として処理可能です
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-blue-50/30 rounded-xl border border-blue-500/10">
                <HelpCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-blue-700/80 leading-relaxed">
                    <p className="font-extrabold text-blue-900 mb-1 tracking-tight">申告実務のヒント</p>
                    <p>
                        資本金1億円以下の中小法人は、以下のいずれか有利な方を選択できます：<br />
                        <span className="font-bold">A. 800万円定額控除制度:</span> 年間800万円までの交際費を全額損金算入<br />
                        <span className="font-bold">B. 接待飲食費50%損金算入制度:</span> 飲食費の50%相当額を損金算入<br />
                        このツールでは、自動的に有利な方（算入額が大きい方）を選択して計算します。
                    </p>
                </div>
            </div>
        </div>
    );
};
