import React from 'react';
import { CorporateTaxInputData, Beppyo5_2Data, TaxPaymentItem } from '../../types/corporateTaxInput';
import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { MoneyInput } from '../common/MoneyInput';

interface Props {
    data: CorporateTaxInputData;
    onChange: (updates: Partial<CorporateTaxInputData>) => void;
}

export const Beppyo5_2Input: React.FC<Props> = ({ data, onChange }) => {
    const { beppyo5_2 } = data;

    const handleAddItem = () => {
        const newItem: TaxPaymentItem = {
            id: uuidv4(),
            taxType: 'corporate',
            description: '',
            paymentDate: '',
            amount: 0,
            category: 'interim'
        };

        onChange({
            beppyo5_2: {
                ...beppyo5_2,
                items: [...beppyo5_2.items, newItem]
            }
        });
    };

    const handleRemoveItem = (id: string) => {
        onChange({
            beppyo5_2: {
                ...beppyo5_2,
                items: beppyo5_2.items.filter(item => item.id !== id)
            }
        });
    };

    const handleItemChange = (id: string, field: keyof TaxPaymentItem, value: any) => {
        onChange({
            beppyo5_2: {
                ...beppyo5_2,
                items: beppyo5_2.items.map(item =>
                    item.id === id ? { ...item, [field]: value } : item
                )
            }
        });
    };

    const handleSummaryChange = (field: keyof Beppyo5_2Data['taxesPayable'], value: number) => {
        onChange({
            beppyo5_2: {
                ...beppyo5_2,
                taxesPayable: {
                    ...beppyo5_2.taxesPayable,
                    [field]: value
                }
            }
        });
    };

    // 合計納付額の計算
    const totalPaid = beppyo5_2.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    return (
        <div className="space-y-8">


            {/* 1. 納付状況の入力 */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-bold text-text-main border-l-4 border-secondary pl-3">
                        I. 租税公課の納付状況
                    </h4>
                    <button
                        onClick={handleAddItem}
                        className="btn-outline btn-sm"
                    >
                        <Plus size={16} />
                        納付記録を追加
                    </button>
                </div>

                {/* Mobile View */}
                <div className="md:hidden space-y-4 mb-4">
                    {beppyo5_2.items.map((item) => (
                        <div key={item.id} className="bg-surface p-4 rounded-xl border border-border relative space-y-4">
                            <button
                                onClick={() => handleRemoveItem(item.id)}
                                className="absolute top-4 right-4 text-text-muted hover:text-error p-1"
                            >
                                <Trash2 size={16} />
                            </button>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-text-muted block mb-1">税目</label>
                                    <select
                                        value={item.taxType}
                                        onChange={(e) => handleItemChange(item.id, 'taxType', e.target.value)}
                                        className="w-full p-2 border border-border rounded focus:ring-2 focus:ring-primary focus:border-transparent bg-surface"
                                    >
                                        <option value="corporate">法人税</option>
                                        <option value="inhabitant">道府県民税・市町村民税</option>
                                        <option value="enterprise">事業税</option>
                                        <option value="local_corporate">地方法人税</option>
                                        <option value="other">その他</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-text-muted block mb-1">区分</label>
                                    <select
                                        value={item.category}
                                        onChange={(e) => handleItemChange(item.id, 'category', e.target.value)}
                                        className="w-full p-2 border border-border rounded focus:ring-2 focus:ring-primary focus:border-transparent bg-surface"
                                    >
                                        <option value="interim">中間納付</option>
                                        <option value="final">確定納付</option>
                                        <option value="withholding">源泉徴収</option>
                                        <option value="other">その他</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-text-muted block mb-1">摘要 (納付先等)</label>
                                <input
                                    type="text"
                                    value={item.description}
                                    onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                                    placeholder="例: ○○税務署"
                                    className="w-full p-2 border border-border rounded focus:ring-2 focus:ring-primary focus:border-transparent bg-surface"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-text-muted block mb-1">納付日</label>
                                    <input
                                        type="date"
                                        value={item.paymentDate}
                                        onChange={(e) => handleItemChange(item.id, 'paymentDate', e.target.value)}
                                        className="w-full p-2 border border-border rounded focus:ring-2 focus:ring-primary focus:border-transparent bg-surface"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-text-muted block mb-1">金額</label>
                                    <MoneyInput
                                        value={item.amount}
                                        onChange={(val) => handleItemChange(item.id, 'amount', val)}
                                        className="w-full p-2 border border-border rounded focus:ring-2 focus:ring-primary focus:border-transparent text-right font-mono"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                    {beppyo5_2.items.length === 0 && (
                        <div className="p-8 text-center text-text-muted bg-surface rounded-xl border border-border">
                            納付記録がありません。「納付記録を追加」ボタンから追加してください。
                        </div>
                    )}
                </div>

                <div className="hidden md:block bg-surface rounded-xl border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-surface-highlight text-text-muted font-medium border-b border-border">
                                <tr>
                                    <th className="px-4 py-3 whitespace-nowrap">税目</th>
                                    <th className="px-4 py-3 whitespace-nowrap">区分</th>
                                    <th className="px-4 py-3 whitespace-nowrap min-w-[120px]">摘要 (納付先等)</th>
                                    <th className="px-4 py-3 whitespace-nowrap">納付日</th>
                                    <th className="px-4 py-3 whitespace-nowrap text-right">金額</th>
                                    <th className="px-4 py-3 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {beppyo5_2.items.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-text-muted">
                                            納付記録がありません。「納付記録を追加」ボタンから追加してください。
                                        </td>
                                    </tr>
                                ) : (
                                    beppyo5_2.items.map((item) => (
                                        <tr key={item.id} className="hover:bg-surface-highlight/50">
                                            <td className="px-4 py-2">
                                                <select
                                                    value={item.taxType}
                                                    onChange={(e) => handleItemChange(item.id, 'taxType', e.target.value)}
                                                    className="w-full p-2 border border-border rounded focus:ring-2 focus:ring-primary focus:border-transparent bg-surface"
                                                >
                                                    <option value="corporate">法人税</option>
                                                    <option value="inhabitant">道府県民税・市町村民税</option>
                                                    <option value="enterprise">事業税</option>
                                                    <option value="local_corporate">地方法人税</option>
                                                    <option value="other">その他</option>
                                                </select>
                                            </td>
                                            <td className="px-4 py-2">
                                                <select
                                                    value={item.category}
                                                    onChange={(e) => handleItemChange(item.id, 'category', e.target.value)}
                                                    className="w-full p-2 border border-border rounded focus:ring-2 focus:ring-primary focus:border-transparent bg-surface"
                                                >
                                                    <option value="interim">中間納付</option>
                                                    <option value="final">確定納付</option>
                                                    <option value="withholding">源泉徴収</option>
                                                    <option value="other">その他</option>
                                                </select>
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="text"
                                                    value={item.description}
                                                    onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                                                    placeholder="例: ○○税務署"
                                                    className="w-full p-2 border border-border rounded focus:ring-2 focus:ring-primary focus:border-transparent bg-surface"
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="date"
                                                    value={item.paymentDate}
                                                    onChange={(e) => handleItemChange(item.id, 'paymentDate', e.target.value)}
                                                    className="w-full p-2 border border-border rounded focus:ring-2 focus:ring-primary focus:border-transparent bg-surface"
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <MoneyInput
                                                    value={item.amount}
                                                    onChange={(val) => handleItemChange(item.id, 'amount', val)}
                                                    className="w-full p-2 border border-border rounded focus:ring-2 focus:ring-primary focus:border-transparent text-right font-mono"
                                                />
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                <button
                                                    onClick={() => handleRemoveItem(item.id)}
                                                    className="p-2 text-text-muted hover:text-error hover:bg-error/10 rounded-full transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                            <tfoot className="bg-surface-highlight font-bold">
                                <tr>
                                    <td colSpan={4} className="px-4 py-3 text-right">合計</td>
                                    <td className="px-4 py-3 text-right font-mono text-primary">
                                        ¥{totalPaid.toLocaleString()}
                                    </td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>

            {/* 2. 期末現在未納付の租税公課（未払法人税等） */}
            <div>
                <h4 className="text-md font-bold text-text-main border-l-4 border-tertiary pl-3 mb-4">
                    II. 期末現在未納付の租税公課 (未払法人税等)
                </h4>

                <div className="bg-surface rounded-xl border border-border p-4">
                    <p className="text-sm text-text-muted mb-4">
                        当期の確定申告で納付すべき税額（未払計上額）を入力します。<br />
                        ※ 通常、別表一・別表四の計算結果と一致させます。
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-1">法人税</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">¥</span>
                                <MoneyInput
                                    value={beppyo5_2.taxesPayable.corporate}
                                    onChange={(val) => handleSummaryChange('corporate', val)}
                                    className="w-full pl-8 pr-4 py-2 border border-border rounded-lg text-right font-mono bg-surface"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-1">地方法人税</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">¥</span>
                                <MoneyInput
                                    value={beppyo5_2.taxesPayable.localCorporate}
                                    onChange={(val) => handleSummaryChange('localCorporate', val)}
                                    className="w-full pl-8 pr-4 py-2 border border-border rounded-lg text-right font-mono bg-surface"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-1">道府県民税・市町村民税</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">¥</span>
                                <MoneyInput
                                    value={beppyo5_2.taxesPayable.inhabitant}
                                    onChange={(val) => handleSummaryChange('inhabitant', val)}
                                    className="w-full pl-8 pr-4 py-2 border border-border rounded-lg text-right font-mono bg-surface"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-1">事業税</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">¥</span>
                                <MoneyInput
                                    value={beppyo5_2.taxesPayable.enterprise}
                                    onChange={(val) => handleSummaryChange('enterprise', val)}
                                    className="w-full pl-8 pr-4 py-2 border border-border rounded-lg text-right font-mono bg-surface"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
