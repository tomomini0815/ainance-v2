import React from 'react';
import { CorporateTaxInputData } from '../../types/corporateTaxInput';
import { Plus, Trash2, Info } from 'lucide-react';
import { MoneyInput } from '../common/MoneyInput';

interface Props {
    data: CorporateTaxInputData;
    onChange: (updates: Partial<CorporateTaxInputData>) => void;
}

export const Beppyo4Input: React.FC<Props> = ({ data, onChange }) => {
    const handleChange = (field: keyof typeof data.beppyo4, value: any) => {
        onChange({
            beppyo4: { ...data.beppyo4, [field]: value }
        });
    };

    const handleAddItem = (type: 'otherAdditions' | 'otherSubtractions') => {
        const newItem = { id: Date.now().toString(), description: '', amount: 0, category: 'other' as const };
        onChange({
            beppyo4: {
                ...data.beppyo4,
                [type]: [...data.beppyo4[type], newItem]
            }
        });
    };

    const handleRemoveItem = (type: 'otherAdditions' | 'otherSubtractions', id: string) => {
        onChange({
            beppyo4: {
                ...data.beppyo4,
                [type]: data.beppyo4[type].filter(item => item.id !== id)
            }
        });
    };

    const handleItemChange = (type: 'otherAdditions' | 'otherSubtractions', id: string, field: 'description' | 'amount', value: any) => {
        onChange({
            beppyo4: {
                ...data.beppyo4,
                [type]: data.beppyo4[type].map(item =>
                    item.id === id ? { ...item, [field]: value } : item
                )
            }
        });
    };

    const totalAdditions = data.beppyo4.nonDeductibleTaxes +
        data.beppyo4.nonDeductibleEntertainment +
        data.beppyo4.excessDepreciation +
        data.beppyo4.otherAdditions.reduce((sum, item) => sum + item.amount, 0);

    const totalSubtractions = data.beppyo4.deductibleEnterpriseTax +
        data.beppyo4.dividendExclusion +
        data.beppyo4.otherSubtractions.reduce((sum, item) => sum + item.amount, 0);

    const calculatedIncome = data.beppyo4.netIncomeFromPL + totalAdditions - totalSubtractions;

    return (
        <div className="space-y-6">
            <div className="bg-info/5 border border-info/20 rounded-lg p-3 flex items-start gap-3 mb-4">
                <Info className="w-4 h-4 text-info shrink-0 mt-0.5" />
                <p className="text-xs text-text-muted">
                    この画面では会計上の利益から税務上の所得への調整を行います（申告調整）。
                    地方法人税や住民税は「加算」、支払った事業税などは「減算」として処理されます。
                </p>
            </div>

            {/* 当期純利益 */}
            <div className="bg-surface p-5 rounded-xl border border-border shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <span className="w-8 h-8 flex items-center justify-center bg-slate-800 text-white rounded font-bold text-sm">1</span>
                    <label className="block text-sm font-bold text-text-main">当期利益又は当期欠損の額</label>
                </div>
                <MoneyInput
                    value={data.beppyo4.netIncomeFromPL}
                    onChange={(val) => handleChange('netIncomeFromPL', val)}
                    className="input-base w-full max-w-md bg-surface font-mono text-lg"
                />
            </div>

            {/* 加算項目 */}
            <div className="bg-surface p-5 rounded-xl border border-border shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <span className="w-8 h-8 flex items-center justify-center bg-red-600 text-white rounded font-bold text-sm">＋</span>
                        <h4 className="font-bold text-text-main text-lg">加算（損金不算入・益金算入）</h4>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Fixed Addition Items */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50/50 rounded-lg border border-border">
                            <label className="block text-xs font-bold text-text-muted mb-2 uppercase tracking-wider">法人税・住民税の損金不算入</label>
                            <MoneyInput
                                value={data.beppyo4.nonDeductibleTaxes}
                                onChange={(val) => handleChange('nonDeductibleTaxes', val)}
                                className="input-base w-full font-mono text-base"
                            />
                        </div>
                        <div className="p-4 bg-slate-50/50 rounded-lg border border-border">
                            <label className="block text-xs font-bold text-text-muted mb-2 uppercase tracking-wider">交際費等の損金不算入</label>
                            <MoneyInput
                                value={data.beppyo4.nonDeductibleEntertainment}
                                onChange={(val) => handleChange('nonDeductibleEntertainment', val)}
                                className="input-base w-full font-mono text-base"
                            />
                        </div>
                        <div className="p-4 bg-slate-50/50 rounded-lg border border-border">
                            <label className="block text-xs font-bold text-text-muted mb-2 uppercase tracking-wider">減価償却の償却超過額</label>
                            <MoneyInput
                                value={data.beppyo4.excessDepreciation}
                                onChange={(val) => handleChange('excessDepreciation', val)}
                                className="input-base w-full font-mono text-base"
                            />
                        </div>
                    </div>

                    <div className="mt-6">
                        <div className="flex justify-between items-center mb-4">
                            <label className="text-xs font-bold text-text-muted flex items-center gap-2">
                                その他加算項目
                            </label>
                            <button onClick={() => handleAddItem('otherAdditions')} className="btn-secondary btn-sm h-7 px-3 text-[10px]">
                                <Plus className="w-3 h-3 mr-1" /> 項目追加
                            </button>
                        </div>
                        <div className="space-y-2">
                            {data.beppyo4.otherAdditions.map((item) => (
                                <div key={item.id} className="grid grid-cols-[1fr_1fr_40px] items-center gap-4 group">
                                    <input
                                        type="text"
                                        value={item.description}
                                        onChange={(e) => handleItemChange('otherAdditions', item.id, 'description', e.target.value)}
                                        className="input-base w-full text-sm py-1.5"
                                        placeholder="項目名"
                                    />
                                    <MoneyInput
                                        value={item.amount}
                                        onChange={(val) => handleItemChange('otherAdditions', item.id, 'amount', val)}
                                        className="input-base w-full font-mono text-right py-1.5"
                                    />
                                    <button onClick={() => handleRemoveItem('otherAdditions', item.id)} className="text-text-muted hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 mt-2 border-t border-border flex justify-end items-center gap-4">
                        <span className="text-sm font-bold text-text-muted">加算計</span>
                        <span className="text-xl font-mono font-bold text-red-500">¥{totalAdditions.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* 減算項目 */}
            <div className="bg-surface p-5 rounded-xl border border-border shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <span className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded font-bold text-sm">－</span>
                        <h4 className="font-bold text-text-main text-lg">減算（損金算入・益金不算入）</h4>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Fixed Subtraction Items */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50/20 rounded-lg border border-border">
                            <label className="block text-xs font-bold text-text-muted mb-2 uppercase tracking-wider">事業税等の損金算入</label>
                            <MoneyInput
                                value={data.beppyo4.deductibleEnterpriseTax}
                                onChange={(val) => handleChange('deductibleEnterpriseTax', val)}
                                className="input-base w-full font-mono text-base"
                            />
                        </div>
                        <div className="p-4 bg-blue-50/20 rounded-lg border border-border">
                            <label className="block text-xs font-bold text-text-muted mb-2 uppercase tracking-wider">受取配当等の益金不算入</label>
                            <MoneyInput
                                value={data.beppyo4.dividendExclusion}
                                onChange={(val) => handleChange('dividendExclusion', val)}
                                className="input-base w-full font-mono text-base"
                            />
                        </div>
                    </div>

                    <div className="mt-6">
                        <div className="flex justify-between items-center mb-4">
                            <label className="text-xs font-bold text-text-muted flex items-center gap-2">
                                その他減算項目
                            </label>
                            <button onClick={() => handleAddItem('otherSubtractions')} className="btn-secondary btn-sm h-7 px-3 text-[10px]">
                                <Plus className="w-3 h-3 mr-1" /> 項目追加
                            </button>
                        </div>
                        <div className="space-y-2">
                            {data.beppyo4.otherSubtractions.map((item) => (
                                <div key={item.id} className="grid grid-cols-[1fr_1fr_40px] items-center gap-4 group">
                                    <input
                                        type="text"
                                        value={item.description}
                                        onChange={(e) => handleItemChange('otherSubtractions', item.id, 'description', e.target.value)}
                                        className="input-base w-full text-sm py-1.5"
                                        placeholder="項目名"
                                    />
                                    <MoneyInput
                                        value={item.amount}
                                        onChange={(val) => handleItemChange('otherSubtractions', item.id, 'amount', val)}
                                        className="input-base w-full font-mono text-right py-1.5"
                                    />
                                    <button onClick={() => handleRemoveItem('otherSubtractions', item.id)} className="text-text-muted hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 mt-2 border-t border-border flex justify-end items-center gap-4">
                        <span className="text-sm font-bold text-text-muted">減算計</span>
                        <span className="text-xl font-mono font-bold text-blue-500">¥{totalSubtractions.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* 所得金額 */}
            <div className="bg-gradient-to-r from-primary to-primary-light p-8 rounded-2xl border border-primary/20 shadow-xl shadow-primary/10 transition-all hover:shadow-2xl hover:shadow-primary/20">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur-md text-white rounded-lg font-bold text-lg">48</span>
                            <label className="text-xl font-bold text-white">所得金額又は欠損金額</label>
                        </div>
                        <p className="text-primary-light/80 text-sm max-w-sm">
                            （1 + 加算計 - 減算計）
                            この金額が別表一の「課税標準額」の計算の基礎となります。
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-4xl md:text-5xl font-mono font-black text-white drop-shadow-lg">
                            ¥{calculatedIncome.toLocaleString()}
                        </div>
                        <div className="mt-2 text-white/60 text-xs font-medium uppercase tracking-widest">Calculated Taxable Income</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
