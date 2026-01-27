import React from 'react';
import { CorporateTaxInputData, DepreciationAssetItem } from '../../types/corporateTaxInput';
import { Plus, Trash2, Box } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { MoneyInput } from '../common/MoneyInput';

interface Props {
    data: CorporateTaxInputData;
    onChange: (updates: Partial<CorporateTaxInputData>) => void;
}

export const Beppyo16Input: React.FC<Props> = ({ data, onChange }) => {
    const { beppyo16 } = data;

    const handleAddItem = () => {
        const newItem: DepreciationAssetItem = {
            id: uuidv4(),
            name: '',
            acquisitionDate: '',
            acquisitionCost: 0,
            usefulLife: 0,
            depreciationMethod: 'straightLine',
            currentDepreciation: 0,
            allowableLimit: 0,
            bookValueEnd: 0
        };

        onChange({
            beppyo16: {
                ...beppyo16,
                assets: [...beppyo16.assets, newItem]
            }
        });
    };

    const handleRemoveItem = (id: string) => {
        onChange({
            beppyo16: {
                ...beppyo16,
                assets: beppyo16.assets.filter(item => item.id !== id)
            }
        });
    };

    const handleItemChange = (id: string, field: keyof DepreciationAssetItem, value: any) => {
        onChange({
            beppyo16: {
                ...beppyo16,
                assets: beppyo16.assets.map(item =>
                    item.id === id ? { ...item, [field]: value } : item
                )
            }
        });
    };

    // 集計
    const totalDepreciation = beppyo16.assets.reduce((sum, item) => sum + (Number(item.currentDepreciation) || 0), 0);
    const totalAllowable = beppyo16.assets.reduce((sum, item) => sum + (Number(item.allowableLimit) || 0), 0);
    const excessAmount = Math.max(0, totalDepreciation - totalAllowable);

    return (
        <div className="space-y-8">


            {/* 一覧 */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-bold text-text-main border-l-4 border-secondary pl-3">
                        資産一覧
                    </h4>
                    <button
                        onClick={handleAddItem}
                        className="btn-outline btn-sm"
                    >
                        <Plus size={16} />
                        資産を追加
                    </button>
                </div>

                {/* Mobile View */}
                <div className="md:hidden space-y-4 mb-4">
                    {beppyo16.assets.map((item) => (
                        <div key={item.id} className="bg-surface p-4 rounded-xl border border-border relative space-y-4">
                            <button
                                onClick={() => handleRemoveItem(item.id)}
                                className="absolute top-4 right-4 text-text-muted hover:text-error p-1"
                            >
                                <Trash2 size={16} />
                            </button>
                            <div>
                                <label className="text-xs text-text-muted block mb-1">資産名称</label>
                                <input
                                    type="text"
                                    value={item.name}
                                    onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                                    placeholder="例: パソコン"
                                    className="w-full p-2 border border-border rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-text-muted block mb-1">取得日</label>
                                    <input
                                        type="date"
                                        value={item.acquisitionDate}
                                        onChange={(e) => handleItemChange(item.id, 'acquisitionDate', e.target.value)}
                                        className="w-full p-2 border border-border rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-text-muted block mb-1">取得価額</label>
                                    <MoneyInput
                                        value={item.acquisitionCost}
                                        onChange={(val) => handleItemChange(item.id, 'acquisitionCost', val)}
                                        className="w-full p-2 border border-border rounded focus:ring-2 focus:ring-primary focus:border-transparent text-right font-mono"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
                                <div>
                                    <label className="text-xs text-text-muted block mb-1">償却限度額</label>
                                    <MoneyInput
                                        value={item.allowableLimit}
                                        onChange={(val) => handleItemChange(item.id, 'allowableLimit', val)}
                                        className="w-full p-2 border border-border rounded focus:ring-2 focus:ring-primary focus:border-transparent text-right font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-text-muted block mb-1">当期償却額</label>
                                    <MoneyInput
                                        value={item.currentDepreciation}
                                        onChange={(val) => handleItemChange(item.id, 'currentDepreciation', val)}
                                        className="w-full p-2 border border-border rounded focus:ring-2 focus:ring-primary focus:border-transparent text-right font-mono"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-text-muted block mb-1">期末帳簿価額</label>
                                <MoneyInput
                                    value={item.bookValueEnd}
                                    onChange={(val) => handleItemChange(item.id, 'bookValueEnd', val)}
                                    className="w-full p-2 border border-border rounded focus:ring-2 focus:ring-primary focus:border-transparent text-right font-mono bg-surface-highlight"
                                />
                            </div>
                        </div>
                    ))}
                    {beppyo16.assets.length === 0 && (
                        <div className="p-8 text-center text-text-muted bg-surface rounded-xl border border-border">
                            資産が登録されていません。「資産を追加」ボタンから追加してください。
                        </div>
                    )}
                </div>

                <div className="hidden md:block bg-surface rounded-xl border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-surface-highlight text-text-muted font-medium border-b border-border">
                                <tr>
                                    <th className="px-4 py-3 whitespace-nowrap min-w-[150px]">資産名称</th>
                                    <th className="px-4 py-3 whitespace-nowrap">取得日</th>
                                    <th className="px-4 py-3 whitespace-nowrap text-right">取得価額</th>
                                    <th className="px-4 py-3 whitespace-nowrap text-right">償却限度額</th>
                                    <th className="px-4 py-3 whitespace-nowrap text-right">当期償却額</th>
                                    <th className="px-4 py-3 whitespace-nowrap text-right">期末帳簿価額</th>
                                    <th className="px-4 py-3 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {beppyo16.assets.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-text-muted">
                                            資産が登録されていません。「資産を追加」ボタンから追加してください。
                                        </td>
                                    </tr>
                                ) : (
                                    beppyo16.assets.map((item) => (
                                        <tr key={item.id} className="hover:bg-surface-highlight/50">
                                            <td className="px-4 py-2">
                                                <input
                                                    type="text"
                                                    value={item.name}
                                                    onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                                                    placeholder="例: パソコン"
                                                    className="w-full p-2 border border-border rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="date"
                                                    value={item.acquisitionDate}
                                                    onChange={(e) => handleItemChange(item.id, 'acquisitionDate', e.target.value)}
                                                    className="w-full p-2 border border-border rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <MoneyInput
                                                    value={item.acquisitionCost}
                                                    onChange={(val) => handleItemChange(item.id, 'acquisitionCost', val)}
                                                    className="w-full p-2 border border-border rounded focus:ring-2 focus:ring-primary focus:border-transparent text-right font-mono"
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <MoneyInput
                                                    value={item.allowableLimit}
                                                    onChange={(val) => handleItemChange(item.id, 'allowableLimit', val)}
                                                    className="w-full p-2 border border-border rounded focus:ring-2 focus:ring-primary focus:border-transparent text-right font-mono"
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <MoneyInput
                                                    value={item.currentDepreciation}
                                                    onChange={(val) => handleItemChange(item.id, 'currentDepreciation', val)}
                                                    className="w-full p-2 border border-border rounded focus:ring-2 focus:ring-primary focus:border-transparent text-right font-mono"
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <MoneyInput
                                                    value={item.bookValueEnd}
                                                    onChange={(val) => handleItemChange(item.id, 'bookValueEnd', val)}
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
                                    <td colSpan={3} className="px-4 py-3 text-right">合計</td>
                                    <td className="px-4 py-3 text-right font-mono">{totalAllowable.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-right font-mono text-primary">{totalDepreciation.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-right font-mono">{beppyo16.assets.reduce((sum, item) => sum + (Number(item.bookValueEnd) || 0), 0).toLocaleString()}</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>      {excessAmount > 0 && (
                <div className="mt-4 p-4 bg-error/10 border border-error/20 rounded-lg text-error-dark flex items-center gap-2">
                    <Box size={20} />
                    <div>
                        <span className="font-bold">償却超過額が発生しています: </span>
                        <span className="font-mono text-lg">¥{excessAmount.toLocaleString()}</span>
                        <p className="text-sm mt-1">この金額は別表四で加算（損金不算入）する必要があります。</p>
                    </div>
                </div>
            )}
        </div>
    );
};
