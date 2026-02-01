import React from 'react';
import { CorporateTaxInputData } from '../../types/corporateTaxInput';
import { MoneyInput } from '../common/MoneyInput';

interface Props {
    data: CorporateTaxInputData;
    onChange: (updates: Partial<CorporateTaxInputData>) => void;
}

export const BusinessOverviewInput: React.FC<Props> = ({ data, onChange }) => {
    const handleChange = (field: keyof typeof data.businessOverview, value: number) => {
        onChange({
            businessOverview: {
                ...data.businessOverview,
                [field]: value
            }
        });
    };

    return (
        <div className="space-y-6">


            <div className="grid grid-cols-2 gap-4 md:gap-x-8 md:gap-y-4">
                <div className="col-span-2 border-b border-border pb-2 mb-2 font-medium text-primary">損益計算書項目</div>

                <div>
                    <label className="block text-sm font-medium text-text-main mb-1">売上高</label>
                    <MoneyInput
                        value={data.businessOverview.sales}
                        onChange={(val) => handleChange('sales', val)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-main mb-1">売上原価</label>
                    <MoneyInput
                        value={data.businessOverview.costOfSales}
                        onChange={(val) => handleChange('costOfSales', val)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-main mb-1">売上総利益</label>
                    <MoneyInput
                        value={data.businessOverview.grossProfit}
                        onChange={(val) => handleChange('grossProfit', val)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-main mb-1">販売費及び一般管理費</label>
                    <MoneyInput
                        value={data.businessOverview.operatingExpenses}
                        onChange={(val) => handleChange('operatingExpenses', val)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-main mb-1">営業利益</label>
                    <MoneyInput
                        value={data.businessOverview.operatingIncome}
                        onChange={(val) => handleChange('operatingIncome', val)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-main mb-1">経常利益</label>
                    <MoneyInput
                        value={data.businessOverview.ordinaryIncome}
                        onChange={(val) => handleChange('ordinaryIncome', val)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-main mb-1">当期純利益</label>
                    <MoneyInput
                        value={data.businessOverview.netIncome}
                        onChange={(val) => handleChange('netIncome', val)}
                    />
                </div>

                <div className="col-span-2 border-b border-border pb-2 mb-2 mt-4 font-medium text-primary">主要科目の内訳</div>

                <div>
                    <label className="block text-sm font-medium text-text-main mb-1">役員給与</label>
                    <MoneyInput
                        value={data.businessOverview.directorsCompensation}
                        onChange={(val) => handleChange('directorsCompensation', val)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-main mb-1">従業員給料</label>
                    <MoneyInput
                        value={data.businessOverview.employeesSalary}
                        onChange={(val) => handleChange('employeesSalary', val)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-main mb-1">地代家賃</label>
                    <MoneyInput
                        value={data.businessOverview.rent}
                        onChange={(val) => handleChange('rent', val)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-main mb-1">租税公課</label>
                    <MoneyInput
                        value={data.businessOverview.taxesAndDues}
                        onChange={(val) => handleChange('taxesAndDues', val)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-main mb-1">交際費</label>
                    <MoneyInput
                        value={data.businessOverview.entertainmentExpenses}
                        onChange={(val) => handleChange('entertainmentExpenses', val)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-main mb-1">減価償却費</label>
                    <MoneyInput
                        value={data.businessOverview.depreciation}
                        onChange={(val) => handleChange('depreciation', val)}
                    />
                </div>
            </div>
        </div>
    );
};
