import React from 'react';
import { CorporateTaxInputData, LossCarryforwardItem } from '../../types/corporateTaxInput';

interface Props {
    data: CorporateTaxInputData;
    onChange: (data: CorporateTaxInputData) => void;
}

export const Beppyo7Input: React.FC<Props> = ({ data, onChange }) => {
    const b7 = data.beppyo7;

    const updateField = (field: string, value: number) => {
        onChange({ ...data, beppyo7: { ...b7, [field]: value } });
    };

    const addItem = () => {
        const newItem: LossCarryforwardItem = {
            fiscalYear: '',
            originalLoss: 0,
            usedPrior: 0,
            usedCurrent: 0,
            remaining: 0,
        };
        onChange({ ...data, beppyo7: { ...b7, items: [...b7.items, newItem] } });
    };

    const updateItem = (index: number, field: string, value: string | number) => {
        const items = [...b7.items];
        items[index] = { ...items[index], [field]: value };
        // 残額を自動計算
        items[index].remaining = items[index].originalLoss - items[index].usedPrior - items[index].usedCurrent;
        onChange({ ...data, beppyo7: { ...b7, items } });
    };

    const removeItem = (index: number) => {
        const items = b7.items.filter((_, i) => i !== index);
        onChange({ ...data, beppyo7: { ...b7, items } });
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-bold text-text-main">別表七（一）欠損金又は災害損失金の損金算入等に関する明細書</h3>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-text-muted mb-1">控除前所得金額</label>
                    <input type="number" value={b7.preDeductionIncome} onChange={e => updateField('preDeductionIncome', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-main text-right" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-muted mb-1">損金算入限度額</label>
                    <input type="number" value={b7.deductionLimit} onChange={e => updateField('deductionLimit', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-main text-right" />
                    <p className="text-xs text-text-muted mt-1">※中小法人は所得の100%まで控除可能</p>
                </div>
            </div>

            <div>
                <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-text-main">年度別欠損金明細</h4>
                    <button onClick={addItem} className="px-3 py-1 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-colors">
                        ＋ 追加
                    </button>
                </div>
                {b7.items.length === 0 ? (
                    <p className="text-sm text-text-muted p-4 bg-surface-highlight rounded-lg text-center">繰越欠損金がある場合は「追加」をクリックしてください</p>
                ) : (
                    <div className="border border-border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-surface-highlight">
                                <tr>
                                    <th className="px-3 py-2 text-left text-text-muted font-medium">欠損事業年度</th>
                                    <th className="px-3 py-2 text-right text-text-muted font-medium">欠損金額</th>
                                    <th className="px-3 py-2 text-right text-text-muted font-medium">前期以前控除済</th>
                                    <th className="px-3 py-2 text-right text-text-muted font-medium">当期控除額</th>
                                    <th className="px-3 py-2 text-right text-text-muted font-medium">翌期繰越額</th>
                                    <th className="px-3 py-2 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {b7.items.map((item, i) => (
                                    <tr key={i}>
                                        <td className="px-2 py-1">
                                            <input type="text" value={item.fiscalYear} onChange={e => updateItem(i, 'fiscalYear', e.target.value)}
                                                placeholder="R3.4.1-R4.3.31"
                                                className="w-full px-2 py-1 border border-border rounded bg-surface text-text-main text-sm" />
                                        </td>
                                        <td className="px-2 py-1">
                                            <input type="number" value={item.originalLoss} onChange={e => updateItem(i, 'originalLoss', Number(e.target.value))}
                                                className="w-full px-2 py-1 border border-border rounded bg-surface text-text-main text-right text-sm" />
                                        </td>
                                        <td className="px-2 py-1">
                                            <input type="number" value={item.usedPrior} onChange={e => updateItem(i, 'usedPrior', Number(e.target.value))}
                                                className="w-full px-2 py-1 border border-border rounded bg-surface text-text-main text-right text-sm" />
                                        </td>
                                        <td className="px-2 py-1">
                                            <input type="number" value={item.usedCurrent} onChange={e => updateItem(i, 'usedCurrent', Number(e.target.value))}
                                                className="w-full px-2 py-1 border border-border rounded bg-surface text-text-main text-right text-sm" />
                                        </td>
                                        <td className="px-2 py-1 text-right text-text-muted">{item.remaining.toLocaleString()}</td>
                                        <td className="px-2 py-1">
                                            <button onClick={() => removeItem(i)} className="text-red-500 hover:text-red-700 text-sm">✕</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4 bg-surface-highlight p-4 rounded-lg">
                <div>
                    <label className="block text-sm font-medium text-text-muted mb-1">当期損金算入合計</label>
                    <div className="text-lg font-bold text-text-main text-right">
                        {b7.items.reduce((sum, item) => sum + item.usedCurrent, 0).toLocaleString()} 円
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-muted mb-1">翌期繰越合計</label>
                    <div className="text-lg font-bold text-text-main text-right">
                        {b7.items.reduce((sum, item) => sum + item.remaining, 0).toLocaleString()} 円
                    </div>
                </div>
            </div>
        </div>
    );
};
