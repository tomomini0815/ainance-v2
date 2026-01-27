import React from 'react';
import { TaxReturnInputData, BalanceSheetItem, EmployeeSalary } from '../../types/taxReturnInput';
import { DynamicListInput } from './DynamicListInput';
import { Info } from 'lucide-react';

interface BlueReturnInputProps {
    data: TaxReturnInputData;
    onChange: (updates: Partial<TaxReturnInputData>) => void;
}

export const BlueReturnInput: React.FC<BlueReturnInputProps> = ({ data, onChange }) => {

    const handleUpdatePL = (field: keyof TaxReturnInputData['blue_return_pl'], value: number) => {
        onChange({
            blue_return_pl: { ...data.blue_return_pl, [field]: value }
        });
    };

    const handleUpdateBSItem = (index: number, updated: BalanceSheetItem) => {
        const newItems = [...data.blue_return_bs.items];
        newItems[index] = updated;
        onChange({
            blue_return_bs: { items: newItems }
        });
    };

    const handleAddSalary = () => {
        const newItem: EmployeeSalary = {
            id: Date.now().toString(),
            name: '',
            description: '',
            months_worked: 12,
            salary_amount: 0,
            bonus_amount: 0,
            withholding_tax: 0,
        };
        onChange({
            employee_salaries: [...data.employee_salaries, newItem]
        });
    };

    const handleUpdateSalary = (index: number, updated: EmployeeSalary) => {
        const newList = [...data.employee_salaries];
        newList[index] = updated;
        onChange({
            employee_salaries: newList
        });
    };

    const handleRemoveSalary = (index: number) => {
        onChange({
            employee_salaries: data.employee_salaries.filter((_, i) => i !== index)
        });
    };

    return (
        <div className="space-y-8">
            <div className="bg-info-light border border-info/20 p-4 rounded-lg flex items-start gap-3">
                <Info className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
                <div>
                    <h4 className="font-medium text-text-main text-sm">青色申告決算書の詳細入力</h4>
                    <p className="text-sm text-text-muted mt-1">
                        貸借対照表（B/S）の期首・期末残高や、従業員給与の内訳を入力します。
                        売上や経費は取引データから自動集計されますが、棚卸資産などはここで入力が必要です。
                    </p>
                </div>
            </div>

            {/* 損益計算書（追加入力） */}
            <section className="space-y-4">
                <h3 className="text-lg font-semibold text-text-main border-b border-border pb-2">
                    棚卸資産（在庫）
                    <span className="text-xs font-normal text-text-muted ml-2">売上原価の計算に使用</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1">期首棚卸高（1月1日時点）</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">¥ </span>
                            <input
                                type="number"
                                className="input-base pl-14"
                                value={data.blue_return_pl.beginning_inventory === 0 ? '' : data.blue_return_pl.beginning_inventory}
                                onChange={(e) => handleUpdatePL('beginning_inventory', e.target.value === '' ? 0 : Number(e.target.value))}
                                placeholder="0"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1">期末棚卸高（12月31日時点）</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">¥ </span>
                            <input
                                type="number"
                                className="input-base pl-14"
                                value={data.blue_return_pl.ending_inventory === 0 ? '' : data.blue_return_pl.ending_inventory}
                                onChange={(e) => handleUpdatePL('ending_inventory', e.target.value === '' ? 0 : Number(e.target.value))}
                                placeholder="0"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* 貸借対照表（B/S） */}
            <section className="space-y-4">
                <h3 className="text-lg font-semibold text-text-main border-b border-border pb-2">
                    貸借対照表（B/S）
                    <span className="text-xs font-normal text-text-muted ml-2">資産・負債の期首・期末残高</span>
                </h3>

                <div className="bg-surface border border-border rounded-lg overflow-hidden">
                    <div className="grid grid-cols-12 gap-2 bg-surface-highlight p-3 text-sm font-medium text-text-muted border-b border-border">
                        <div className="col-span-4">勘定科目</div>
                        <div className="col-span-4">期首など</div>
                        <div className="col-span-4">期末（12/31）</div>
                    </div>

                    {data.blue_return_bs.items.map((item, index) => (
                        <div key={item.id} className="grid grid-cols-12 gap-2 p-3 border-b border-border last:border-0 items-center hover:bg-surface-highlight/50 transition-colors">
                            <div className="col-span-4 font-medium text-text-main">
                                {item.account_name}
                            </div>
                            <div className="col-span-4 relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted text-xs">¥ </span>
                                <input
                                    type="number"
                                    className="input-base py-1 pl-12 text-sm"
                                    value={item.beginning_balance === 0 ? '' : item.beginning_balance}
                                    onChange={(e) => handleUpdateBSItem(index, { ...item, beginning_balance: e.target.value === '' ? 0 : Number(e.target.value) })}
                                    placeholder="期首残高"
                                />
                            </div>
                            <div className="col-span-4 relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted text-xs">¥ </span>
                                <input
                                    type="number"
                                    className="input-base py-1 pl-12 text-sm"
                                    value={item.ending_balance === 0 ? '' : item.ending_balance}
                                    onChange={(e) => handleUpdateBSItem(index, { ...item, ending_balance: e.target.value === '' ? 0 : Number(e.target.value) })}
                                    placeholder="期末残高"
                                />
                            </div>
                        </div>
                    ))}
                </div>
                <p className="text-xs text-text-muted">
                    ※ 現金、預金などの資産だけでなく、借入金などの負債も入力してください。
                    元入金は期首の金額を入力します。
                </p>
            </section>

            {/* 給料賃金の内訳 */}
            <section className="space-y-4">
                <h3 className="text-lg font-semibold text-text-main border-b border-border pb-2">
                    給料賃金の内訳
                </h3>
                <DynamicListInput
                    items={data.employee_salaries}
                    onAdd={handleAddSalary}
                    onRemove={handleRemoveSalary}
                    onEdit={handleUpdateSalary}
                    title="従業員・専従者給与"
                    addButtonLabel="従業員を追加"
                    renderItem={(item, index) => (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-text-muted">氏名</label>
                                <input
                                    type="text"
                                    className="input-base py-1.5"
                                    value={item.name}
                                    onChange={(e) => handleUpdateSalary(index, { ...item, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-text-muted">従事月数</label>
                                <input
                                    type="number"
                                    className="input-base py-1.5"
                                    value={item.months_worked}
                                    onChange={(e) => handleUpdateSalary(index, { ...item, months_worked: Number(e.target.value) })}
                                    min={1}
                                    max={12}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-text-muted">給料賃金（年額）</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">¥ </span>
                                    <input
                                        type="number"
                                        className="input-base py-1.5 pl-14"
                                        value={item.salary_amount === 0 ? '' : item.salary_amount}
                                        onChange={(e) => handleUpdateSalary(index, { ...item, salary_amount: e.target.value === '' ? 0 : Number(e.target.value) })}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-text-muted">賞与</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">¥ </span>
                                    <input
                                        type="number"
                                        className="input-base py-1.5 pl-14"
                                        value={item.bonus_amount === 0 ? '' : item.bonus_amount}
                                        onChange={(e) => handleUpdateSalary(index, { ...item, bonus_amount: e.target.value === '' ? 0 : Number(e.target.value) })}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-text-muted">源泉徴収税額</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">¥ </span>
                                    <input
                                        type="number"
                                        className="input-base py-1.5 pl-14"
                                        value={item.withholding_tax === 0 ? '' : item.withholding_tax}
                                        onChange={(e) => handleUpdateSalary(index, { ...item, withholding_tax: e.target.value === '' ? 0 : Number(e.target.value) })}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                />
            </section>
        </div>
    );
};
