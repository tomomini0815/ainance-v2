import React from 'react';
import { CorporateTaxInputData } from '../../types/corporateTaxInput';
import { Plus, Trash2 } from 'lucide-react';
import { MoneyInput } from '../common/MoneyInput';

interface Props {
    data: CorporateTaxInputData;
    onChange: (updates: Partial<CorporateTaxInputData>) => void;
}

export const Beppyo4Input: React.FC<Props> = ({ data, onChange }) => {
    const handleNetIncomeChange = (val: number) => {
        onChange({
            beppyo4: { ...data.beppyo4, netIncomeFromPL: val }
        });
    };

    const handleAddItem = (type: 'additions' | 'subtractions') => {
        const newItem = { id: Date.now().toString(), description: '', amount: 0 };
        onChange({
            beppyo4: {
                ...data.beppyo4,
                [type]: [...data.beppyo4[type], newItem]
            }
        });
    };

    const handleRemoveItem = (type: 'additions' | 'subtractions', id: string) => {
        onChange({
            beppyo4: {
                ...data.beppyo4,
                [type]: data.beppyo4[type].filter(item => item.id !== id)
            }
        });
    };

    const handleItemChange = (type: 'additions' | 'subtractions', id: string, field: 'description' | 'amount', value: any) => {
        onChange({
            beppyo4: {
                ...data.beppyo4,
                [type]: data.beppyo4[type].map(item =>
                    item.id === id ? { ...item, [field]: value } : item
                )
            }
        });
    };

    const totalAdditions = data.beppyo4.additions.reduce((sum, item) => sum + item.amount, 0);
    const totalSubtractions = data.beppyo4.subtractions.reduce((sum, item) => sum + item.amount, 0);
    const calculatedIncome = data.beppyo4.netIncomeFromPL + totalAdditions - totalSubtractions;

    return (
        <div className="space-y-8">


            {/* 当期純利益 */}
            <div className="bg-surface p-4 rounded-lg border border-border">
                <label className="block text-sm font-medium text-text-main mb-2">当期純利益（損益計算書）</label>
                <MoneyInput
                    value={data.beppyo4.netIncomeFromPL}
                    onChange={handleNetIncomeChange}
                    className="input-base flex-1 min-w-0 bg-surface"
                />
            </div>

            {/* 加算項目 */}
            <div>
                <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-text-main">加算（損金不算入・益金算入）</h4>
                    <button onClick={() => handleAddItem('additions')} className="btn-ghost btn-sm text-xs">
                        <Plus className="w-3 h-3 mr-1" /> 追加
                    </button>
                </div>
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-text-muted px-1">
                        <div className="flex-1">項目名</div>
                        <div className="flex-1">金額</div>
                        <div className="w-6"></div> {/* Spacer for delete button */}
                    </div>
                    {data.beppyo4.additions.map((item) => (
                        <div key={item.id} className="flex items-center gap-2">
                            <input
                                type="text"
                                value={item.description}
                                onChange={(e) => handleItemChange('additions', item.id, 'description', e.target.value)}
                                className="input-base flex-1 min-w-0" // Add min-w-0 to prevent flex item overflow
                                placeholder="項目名"
                            />
                            <MoneyInput
                                value={item.amount}
                                onChange={(val) => handleItemChange('additions', item.id, 'amount', val)}
                                className="input-base flex-1 min-w-0"
                                placeholder="金額"
                            />
                            <button onClick={() => handleRemoveItem('additions', item.id)} className="text-text-muted hover:text-error p-1 shrink-0">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    <div className="text-right text-sm font-semibold text-text-muted mt-2">
                        加算計: ¥{totalAdditions.toLocaleString()}
                    </div>
                </div>
            </div>

            {/* 減算項目 */}
            <div>
                <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-text-main">減算（損金算入・益金不算入）</h4>
                    <button onClick={() => handleAddItem('subtractions')} className="btn-ghost btn-sm text-xs">
                        <Plus className="w-3 h-3 mr-1" /> 追加
                    </button>
                </div>
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-text-muted px-1">
                        <div className="flex-1">項目名</div>
                        <div className="flex-1">金額</div>
                        <div className="w-6"></div>
                    </div>
                    {data.beppyo4.subtractions.map((item) => (
                        <div key={item.id} className="flex items-center gap-2">
                            <input
                                type="text"
                                value={item.description}
                                onChange={(e) => handleItemChange('subtractions', item.id, 'description', e.target.value)}
                                className="input-base flex-1 min-w-0"
                                placeholder="項目名"
                            />
                            <MoneyInput
                                value={item.amount}
                                onChange={(val) => handleItemChange('subtractions', item.id, 'amount', val)}
                                className="input-base flex-1 min-w-0"
                                placeholder="金額"
                            />
                            <button onClick={() => handleRemoveItem('subtractions', item.id)} className="text-text-muted hover:text-error p-1 shrink-0">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    <div className="text-right text-sm font-semibold text-text-muted mt-2">
                        減算計: ¥{totalSubtractions.toLocaleString()}
                    </div>
                </div>
            </div>

            {/* 所得金額 */}
            <div className="bg-primary/5 p-6 rounded-xl border border-primary/20">
                <div className="flex justify-between items-center">
                    <label className="text-lg font-bold text-text-main">所得金額</label>
                    <div className="text-3xl font-bold text-primary">
                        ¥{calculatedIncome.toLocaleString()}
                    </div>
                </div>
                <p className="text-xs text-text-muted mt-2">※ この金額が別表一の「課税標準額」に転記されます</p>
            </div>
        </div>
    );
};
