import React, { useEffect } from 'react';
import { CorporateTaxInputData, Beppyo5Data } from '../../types/corporateTaxInput';
import { Calculator, HelpCircle, Landmark } from 'lucide-react';
import { MoneyInput } from '../common/MoneyInput';

interface Props {
    data: CorporateTaxInputData;
    onChange: (updates: Partial<CorporateTaxInputData>) => void;
}

export const Beppyo5_1Input: React.FC<Props> = ({ data, onChange }) => {
    const { beppyo5 } = data;

    const handleItemChange = (id: string, field: keyof typeof beppyo5.retainedEarningsItems[0], value: any) => {
        onChange({
            beppyo5: {
                ...beppyo5,
                retainedEarningsItems: beppyo5.retainedEarningsItems.map(item =>
                    item.id === id ? { ...item, [field]: value } : item
                )
            }
        });
    };

    const handleMainFieldChange = (field: keyof Beppyo5Data, value: number) => {
        onChange({
            beppyo5: {
                ...beppyo5,
                [field]: value
            }
        });
    };

    // 自動計算
    useEffect(() => {
        // 各行の後期（期末）残高を計算
        const updatedItems = beppyo5.retainedEarningsItems.map(item => ({
            ...item,
            endAmount: (item.beginAmount || 0) + (item.increase || 0) - (item.decrease || 0)
        }));

        // 合計を計算
        const totalBegin = updatedItems.reduce((sum, item) => sum + item.beginAmount, 0);
        const totalIncrease = updatedItems.reduce((sum, item) => sum + item.increase, 0);
        const totalDecrease = updatedItems.reduce((sum, item) => sum + item.decrease, 0);
        const totalEnd = updatedItems.reduce((sum, item) => sum + item.endAmount, 0);

        const capitalEnd = (beppyo5.capitalBegin || 0) + (beppyo5.capitalIncrease || 0) - (beppyo5.capitalDecrease || 0);

        // 状態が実際に変更されている場合のみ更新（無限ループ回避）
        const hasItemChanges = updatedItems.some((item, i) => item.endAmount !== beppyo5.retainedEarningsItems[i].endAmount);

        if (hasItemChanges ||
            totalBegin !== beppyo5.retainedEarningsBegin ||
            totalEnd !== beppyo5.totalRetainedEarningsEnd ||
            capitalEnd !== beppyo5.capitalEnd) {

            onChange({
                beppyo5: {
                    ...beppyo5,
                    retainedEarningsItems: updatedItems,
                    retainedEarningsBegin: totalBegin,
                    currentIncrease: totalIncrease,
                    currentDecrease: totalDecrease,
                    totalRetainedEarningsEnd: totalEnd,
                    capitalEnd: capitalEnd
                }
            });
        }
    }, [
        beppyo5.retainedEarningsItems,
        beppyo5.capitalBegin,
        beppyo5.capitalIncrease,
        beppyo5.capitalDecrease
    ]);

    return (
        <div className="space-y-10">
            {/* 1. 利益積立金額の計算 */}
            <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border bg-white dark:bg-slate-800/50">
                    <div className="flex justify-between items-center">
                        <h4 className="flex items-center gap-2 text-md font-black text-text-main uppercase tracking-tight">
                            <Calculator className="w-5 h-5 text-primary" />
                            I. 利益積立金額の計算 (別表5-1)
                        </h4>
                        <div className="px-3 py-1 bg-primary/10 rounded-full">
                            <span className="text-[10px] font-bold text-primary italic uppercase">Retained Earnings Breakdown</span>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white dark:bg-slate-800 text-[10px] uppercase font-black text-text-muted tracking-widest border-b border-border">
                                <th className="px-4 py-3 w-48">区分 (明細)</th>
                                <th className="px-4 py-3 text-right">① 期首現在高</th>
                                <th className="px-4 py-3 text-right">② 当期中の減</th>
                                <th className="px-4 py-3 text-right">③ 当期中の増</th>
                                <th className="px-4 py-3 text-right bg-white dark:bg-slate-800">④ 翌期首現在高</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {beppyo5.retainedEarningsItems.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="font-bold text-xs text-text-main">{item.description}</div>
                                        <div className="text-[9px] text-text-muted mt-1 leading-tight">
                                            {item.description.includes('未納') ? '※ 法人税等不算入項目' : '※ 内部留保項目'}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <MoneyInput
                                            value={item.beginAmount}
                                            onChange={(val) => handleItemChange(item.id, 'beginAmount', val)}
                                            className="w-full bg-transparent border-none text-right font-mono text-sm focus:ring-0"
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <MoneyInput
                                            value={item.decrease}
                                            onChange={(val) => handleItemChange(item.id, 'decrease', val)}
                                            className="w-full bg-transparent border-none text-right font-mono text-sm focus:ring-0 text-red-600"
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <MoneyInput
                                            value={item.increase}
                                            onChange={(val) => handleItemChange(item.id, 'increase', val)}
                                            className="w-full bg-transparent border-none text-right font-mono text-sm focus:ring-0 text-emerald-600"
                                        />
                                    </td>
                                    <td className="px-4 py-3 bg-slate-50/30 dark:bg-slate-800/30 font-bold text-right font-mono text-sm">
                                        {item.endAmount.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="bg-white dark:bg-slate-900 text-text-main dark:text-white font-bold border-t-2 border-primary/20">
                                <td className="px-4 py-4 text-xs uppercase tracking-widest">合計 (利益積立金)</td>
                                <td className="px-4 py-4 text-right font-mono">{beppyo5.retainedEarningsBegin.toLocaleString()}</td>
                                <td className="px-4 py-4 text-right font-mono text-error dark:text-red-300">△ {beppyo5.currentDecrease.toLocaleString()}</td>
                                <td className="px-4 py-4 text-right font-mono text-success dark:text-emerald-300">{beppyo5.currentIncrease.toLocaleString()}</td>
                                <td className="px-4 py-4 text-right font-mono text-primary dark:text-primary-light text-lg">{beppyo5.totalRetainedEarningsEnd.toLocaleString()}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* 2. 資本金等の額の計算 */}
            <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border bg-white dark:bg-slate-800/50">
                    <h4 className="flex items-center gap-2 text-md font-black text-text-main uppercase tracking-tight">
                        <Landmark className="w-5 h-5 text-secondary" />
                        II. 資本金等の額の計算
                    </h4>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">期首資本金等の額</label>
                            <div className="relative">
                                <MoneyInput
                                    value={beppyo5.capitalBegin}
                                    onChange={(val) => handleMainFieldChange('capitalBegin', val)}
                                    className="w-full pl-5 pr-10 py-3 border border-border rounded-xl font-mono text-xl text-right bg-white dark:bg-slate-800/50"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted font-bold">円</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-2">当期中の増</label>
                                <MoneyInput
                                    value={beppyo5.capitalIncrease}
                                    onChange={(val) => handleMainFieldChange('capitalIncrease', val)}
                                    className="w-full px-3 py-2 border border-emerald-500/20 rounded-lg font-mono text-sm text-right bg-emerald-50/10 dark:bg-emerald-900/20"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-red-700 uppercase tracking-widest mb-2">当期中の減</label>
                                <MoneyInput
                                    value={beppyo5.capitalDecrease}
                                    onChange={(val) => handleMainFieldChange('capitalDecrease', val)}
                                    className="w-full px-3 py-2 border border-red-500/20 rounded-lg font-mono text-sm text-right bg-red-50/10 dark:bg-red-900/20"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-primary/5 rounded-2xl p-6 flex flex-col justify-center items-center md:items-end border border-primary/10">
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest mb-2 italic">Closing Capital Balance</span>
                        <div className="text-4xl font-mono font-black text-primary">
                            ¥{beppyo5.capitalEnd.toLocaleString()}
                        </div>
                        <div className="mt-2 text-[10px] text-text-muted text-right">
                            翌期首現在資本金等の額 (別表一「資本金等の額」と一致)
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-start gap-4 p-5 bg-amber-50/30 dark:bg-amber-900/20 rounded-2xl border border-amber-500/10">
                <HelpCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900/80 leading-relaxed">
                    <p className="font-extrabold text-amber-900 mb-1 tracking-tight uppercase">法務・税務担当者へのアドバイス</p>
                    <p>
                        別表五(一)は税務上の貸借対照表と呼ばれ、会計上の内部留保と税務上の内部留保の差異を管理する非常に重要な書類です。<br />
                        特に<span className="font-bold underline">「未納法人税」</span>などの項目は、別表四の申告調整（法人税等不算入）と密接に関連します。<br />
                        「差引翌期首現在利益積立金額」が翌期の「期首現在利益積立金額」と完全に一致することを確認してください。
                    </p>
                </div>
            </div>
        </div>
    );
};
