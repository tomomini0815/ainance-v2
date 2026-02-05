import React from 'react';
import { CorporateTaxInputData } from '../../types/corporateTaxInput';
import { Plus, Trash2, Info } from 'lucide-react';
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
        <div className="space-y-6">
            <div className="bg-info/5 border border-info/20 rounded-lg p-3 flex items-start gap-3 mb-4">
                <Info className="w-4 h-4 text-info shrink-0 mt-0.5" />
                <p className="text-xs text-text-muted">
                    この画面では会計上の利益から税務上の所得への調整を行います（申告調整）。
                    取引データから「租税公課」や「交際費」の不算入額が自動計算されています。
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
                    onChange={handleNetIncomeChange}
                    className="input-base w-full max-w-md bg-surface font-mono text-lg"
                />
            </div>

            {/* 加算項目 */}
            <div className="bg-surface p-5 rounded-xl border border-border shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        <span className="w-8 h-8 flex items-center justify-center bg-red-600 text-white rounded font-bold text-sm">＋</span>
                        <h4 className="font-bold text-text-main text-lg">加算（損金不算入・益金算入）</h4>
                    </div>
                    <button onClick={() => handleAddItem('additions')} className="btn-secondary btn-sm">
                        <Plus className="w-4 h-4 mr-1" /> 項目追加
                    </button>
                </div>
                <div className="space-y-3">
                    {data.beppyo4.additions.length > 0 ? (
                        <>
                            <div className="grid grid-cols-[1fr_1fr_40px] gap-4 px-2 text-xs font-bold text-text-muted">
                                <div>調整項目（摘要）</div>
                                <div>金額（加算額）</div>
                                <div></div>
                            </div>
                            {data.beppyo4.additions.map((item, idx) => (
                                <div key={item.id} className="grid grid-cols-[1fr_1fr_40px] items-center gap-4 group">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-mono text-text-muted w-4">{idx + 2}</span>
                                        <input
                                            type="text"
                                            value={item.description}
                                            onChange={(e) => handleItemChange('additions', item.id, 'description', e.target.value)}
                                            className="input-base w-full bg-surface-highlight/30"
                                            placeholder="項目名"
                                        />
                                    </div>
                                    <MoneyInput
                                        value={item.amount}
                                        onChange={(val) => handleItemChange('additions', item.id, 'amount', val)}
                                        className="input-base w-full font-mono text-right"
                                        placeholder="金額"
                                    />
                                    <button onClick={() => handleRemoveItem('additions', item.id)} className="text-text-muted hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            <div className="pt-4 mt-2 border-t border-border flex justify-end items-center gap-4">
                                <span className="text-sm font-bold text-text-muted">加算計</span>
                                <span className="text-xl font-mono font-bold text-red-500">¥{totalAdditions.toLocaleString()}</span>
                            </div>
                        </>
                    ) : (
                        <p className="text-center py-8 text-text-muted bg-surface-highlight/20 rounded-lg border border-dashed border-border">
                            加算項目はありません
                        </p>
                    )}
                </div>
            </div>

            {/* 減算項目 */}
            <div className="bg-surface p-5 rounded-xl border border-border shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        <span className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded font-bold text-sm">－</span>
                        <h4 className="font-bold text-text-main text-lg">減算（損金算入・益金不算入）</h4>
                    </div>
                    <button onClick={() => handleAddItem('subtractions')} className="btn-secondary btn-sm">
                        <Plus className="w-4 h-4 mr-1" /> 項目追加
                    </button>
                </div>
                <div className="space-y-3">
                    {data.beppyo4.subtractions.length > 0 ? (
                        <>
                            <div className="grid grid-cols-[1fr_1fr_40px] gap-4 px-2 text-xs font-bold text-text-muted">
                                <div>調整項目（摘要）</div>
                                <div>金額（減算額）</div>
                                <div></div>
                            </div>
                            {data.beppyo4.subtractions.map((item, idx) => (
                                <div key={item.id} className="grid grid-cols-[1fr_1fr_40px] items-center gap-4 group">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-mono text-text-muted w-4">{idx + data.beppyo4.additions.length + 2}</span>
                                        <input
                                            type="text"
                                            value={item.description}
                                            onChange={(e) => handleItemChange('subtractions', item.id, 'description', e.target.value)}
                                            className="input-base w-full bg-surface-highlight/30"
                                            placeholder="項目名"
                                        />
                                    </div>
                                    <MoneyInput
                                        value={item.amount}
                                        onChange={(val) => handleItemChange('subtractions', item.id, 'amount', val)}
                                        className="input-base w-full font-mono text-right"
                                        placeholder="金額"
                                    />
                                    <button onClick={() => handleRemoveItem('subtractions', item.id)} className="text-text-muted hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            <div className="pt-4 mt-2 border-t border-border flex justify-end items-center gap-4">
                                <span className="text-sm font-bold text-text-muted">減算計</span>
                                <span className="text-xl font-mono font-bold text-blue-500">¥{totalSubtractions.toLocaleString()}</span>
                            </div>
                        </>
                    ) : (
                        <p className="text-center py-8 text-text-muted bg-surface-highlight/20 rounded-lg border border-dashed border-border">
                            減算項目はありません
                        </p>
                    )}
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
