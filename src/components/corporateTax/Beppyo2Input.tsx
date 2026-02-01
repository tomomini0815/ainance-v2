
import React, { useEffect } from 'react';
import { CorporateTaxInputData, Beppyo2Data, Shareholder } from '../../types/corporateTaxInput';
import { Plus, Trash2, HelpCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { MoneyInput } from '../common/MoneyInput';

interface Props {
    data: CorporateTaxInputData;
    onChange: (updates: Partial<CorporateTaxInputData>) => void;
}

export const Beppyo2Input: React.FC<Props> = ({ data, onChange }) => {
    const { beppyo2 } = data;

    // 同族会社判定ロジック
    useEffect(() => {
        if (!beppyo2.shareholders.length || beppyo2.totalShares === 0) return;

        // 持株数でソート
        const sorted = [...beppyo2.shareholders].sort((a, b) => b.shares - a.shares);

        // 上位3グループ（ここでは簡易的に個人のみで判定）の持株割合合計
        const top3Shares = sorted.slice(0, 3).reduce((sum, s) => sum + s.shares, 0);
        const ratio = top3Shares / beppyo2.totalShares;

        const isFamily = ratio > 0.5;

        if (isFamily !== beppyo2.isFamilyCompany) {
            handleChange('isFamilyCompany', isFamily);
        }
    }, [JSON.stringify(beppyo2.shareholders), beppyo2.totalShares]);

    const handleAddItem = () => {
        const newItem: Shareholder = {
            id: uuidv4(),
            name: '',
            address: '',
            shares: 0,
            relationship: '',
        };

        onChange({
            beppyo2: {
                ...beppyo2,
                shareholders: [...beppyo2.shareholders, newItem]
            }
        });
    };

    const handleRemoveItem = (id: string) => {
        onChange({
            beppyo2: {
                ...beppyo2,
                shareholders: beppyo2.shareholders.filter(item => item.id !== id)
            }
        });
    };

    const handleItemChange = (id: string, field: keyof Shareholder, value: any) => {
        onChange({
            beppyo2: {
                ...beppyo2,
                shareholders: beppyo2.shareholders.map(item =>
                    item.id === id ? { ...item, [field]: value } : item
                )
            }
        });
    };

    const handleChange = (field: keyof Beppyo2Data, value: any) => {
        onChange({
            beppyo2: {
                ...beppyo2,
                [field]: value
            }
        });
    };

    return (
        <div className="space-y-8">


            {/* 基本情報 */}
            <div className="bg-surface rounded-xl border border-border p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1">
                            発行済株式総数
                        </label>
                        <MoneyInput
                            value={beppyo2.totalShares}
                            onChange={(val) => handleChange('totalShares', val)}
                            className="w-full p-2 border border-border rounded focus:ring-2 focus:ring-primary focus:border-transparent bg-surface"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1">
                            判定結果
                        </label>
                        <div className={`px-4 py-2 rounded-lg font-bold text-center border ${beppyo2.isFamilyCompany ? 'bg-primary/10 text-primary border-primary/20' : 'bg-surface-highlight text-text-muted border-border'} `}>
                            {beppyo2.isFamilyCompany ? '同族会社' : '非同族会社'}
                        </div>
                    </div>
                </div>
            </div>

            {/* 株主一覧 */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-bold text-text-main border-l-4 border-secondary pl-3">
                        株主等の状況
                    </h4>
                    <button
                        onClick={handleAddItem}
                        className="btn-outline btn-sm"
                    >
                        <Plus size={16} />
                        株主を追加
                    </button>
                </div>

                {/* Mobile View */}
                <div className="md:hidden space-y-4 mb-4">
                    {beppyo2.shareholders.map((item) => (
                        <div key={item.id} className="bg-surface p-4 rounded-xl border border-border relative space-y-4">
                            <button
                                onClick={() => handleRemoveItem(item.id)}
                                className="absolute top-4 right-4 text-text-muted hover:text-error p-1"
                            >
                                <Trash2 size={16} />
                            </button>
                            <div>
                                <label className="text-xs text-text-muted block mb-1">株主名</label>
                                <input
                                    type="text"
                                    value={item.name}
                                    onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                                    placeholder="氏名・会社名"
                                    className="w-full p-2 border border-border rounded focus:ring-2 focus:ring-primary focus:border-transparent bg-surface"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-text-muted block mb-1">住所</label>
                                <input
                                    type="text"
                                    value={item.address}
                                    onChange={(e) => handleItemChange(item.id, 'address', e.target.value)}
                                    className="w-full p-2 border border-border rounded focus:ring-2 focus:ring-primary focus:border-transparent bg-surface"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-text-muted block mb-1">持株数</label>
                                    <MoneyInput
                                        value={item.shares}
                                        onChange={(val) => handleItemChange(item.id, 'shares', val)}
                                        className="w-full p-2 border border-border rounded focus:ring-2 focus:ring-primary focus:border-transparent text-right font-mono"
                                    />
                                </div>
                                <div className="text-right flex flex-col justify-end pb-2">
                                    <span className="text-xs text-text-muted block mb-1">割合</span>
                                    <div className="font-mono">
                                        {beppyo2.totalShares > 0
                                            ? `${((item.shares / beppyo2.totalShares) * 100).toFixed(1)}%`
                                            : '-'}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-text-muted block mb-1">代表者との関係</label>
                                <input
                                    type="text"
                                    value={item.relationship}
                                    onChange={(e) => handleItemChange(item.id, 'relationship', e.target.value)}
                                    className="w-full p-2 border border-border rounded focus:ring-2 focus:ring-primary focus:border-transparent bg-surface"
                                />
                            </div>
                        </div>
                    ))}
                    {beppyo2.shareholders.length === 0 && (
                        <div className="p-8 text-center text-text-muted bg-surface rounded-xl border border-border">
                            株主が登録されていません。「株主を追加」ボタンから追加してください。
                        </div>
                    )}
                </div>

                <div className="hidden md:block bg-surface rounded-xl border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-surface-highlight text-text-muted font-medium border-b border-border">
                                <tr>
                                    <th className="px-4 py-3 whitespace-nowrap min-w-[150px]">株主名</th>
                                    <th className="px-4 py-3 whitespace-nowrap min-w-[200px]">住所</th>
                                    <th className="px-4 py-3 whitespace-nowrap text-right">持株数</th>
                                    <th className="px-4 py-3 whitespace-nowrap text-right">割合</th>
                                    <th className="px-4 py-3 whitespace-nowrap">代表者との関係</th>
                                    <th className="px-4 py-3 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {beppyo2.shareholders.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-text-muted">
                                            株主が登録されていません。「株主を追加」ボタンから追加してください。
                                        </td>
                                    </tr>
                                ) : (
                                    beppyo2.shareholders.map((item) => (
                                        <tr key={item.id} className="hover:bg-surface-highlight/50">
                                            <td className="px-4 py-2">
                                                <input
                                                    type="text"
                                                    value={item.name}
                                                    onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                                                    placeholder="氏名・会社名"
                                                    className="w-full p-2 border border-border rounded focus:ring-2 focus:ring-primary focus:border-transparent bg-surface"
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="text"
                                                    value={item.address}
                                                    onChange={(e) => handleItemChange(item.id, 'address', e.target.value)}
                                                    className="w-full p-2 border border-border rounded focus:ring-2 focus:ring-primary focus:border-transparent bg-surface"
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <MoneyInput
                                                    value={item.shares}
                                                    onChange={(val) => handleItemChange(item.id, 'shares', val)}
                                                    className="w-full p-2 border border-border rounded focus:ring-2 focus:ring-primary focus:border-transparent text-right font-mono"
                                                />
                                            </td>
                                            <td className="px-4 py-2 text-right text-text-muted font-mono">
                                                {beppyo2.totalShares > 0 ? ((item.shares / beppyo2.totalShares) * 100).toFixed(1) : 0}%
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="text"
                                                    value={item.relationship}
                                                    onChange={(e) => handleItemChange(item.id, 'relationship', e.target.value)}
                                                    placeholder="本人、妻、父など"
                                                    className="w-full p-2 border border-border rounded focus:ring-2 focus:ring-primary focus:border-transparent bg-surface"
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
                        </table>
                    </div>
                </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-surface-highlight rounded-lg border border-border">
                <HelpCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-sm text-text-muted">
                    <p className="font-bold text-text-main mb-1">同族会社の判定について</p>
                    <p>
                        ・上位3グループ（親族等を含む）の持株割合の合計が50%超となる場合、「同族会社」となります。<br />
                        ・日本の多くの中小企業は同族会社に該当します。
                    </p>
                </div>
            </div>
        </div>
    );
};
