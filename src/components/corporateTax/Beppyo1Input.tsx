import React from 'react';
import { CorporateTaxInputData } from '../../types/corporateTaxInput';
import { MoneyInput } from '../common/MoneyInput';

interface Props {
    data: CorporateTaxInputData;
    onChange: (updates: Partial<CorporateTaxInputData>) => void;
}

export const Beppyo1Input: React.FC<Props> = ({ data, onChange }) => {
    const handleChange = (field: keyof typeof data.beppyo1, value: number) => {
        onChange({
            beppyo1: {
                ...data.beppyo1,
                [field]: value
            }
        });
    };

    return (
        <div className="space-y-6">


            <div className="grid grid-cols-2 gap-4 md:gap-6">
                <div>
                    <label className="block text-sm font-medium text-text-main mb-1">課税標準額（所得金額）</label>
                    <MoneyInput
                        value={data.beppyo1.taxableIncome}
                        onChange={(val) => handleChange('taxableIncome', val)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-main mb-1">法人税額（算出）</label>
                    <MoneyInput
                        value={data.beppyo1.corporateTaxAmount}
                        onChange={(val) => handleChange('corporateTaxAmount', val)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-main mb-1">特別控除額</label>
                    <MoneyInput
                        value={data.beppyo1.specialTaxCredit}
                        onChange={(val) => handleChange('specialTaxCredit', val)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-main mb-1">中間納付額</label>
                    <MoneyInput
                        value={data.beppyo1.interimPayment}
                        onChange={(val) => handleChange('interimPayment', val)}
                    />
                </div>
                <div className="border-t border-border pt-4 md:col-span-2">
                    <label className="block text-sm font-medium text-text-main mb-1">差引確定納付税額</label>
                    <div className="text-2xl font-bold text-primary">
                        ¥{(data.beppyo1.corporateTaxAmount - data.beppyo1.specialTaxCredit - data.beppyo1.interimPayment).toLocaleString()}
                    </div>
                </div>
            </div>
        </div>
    );
};
