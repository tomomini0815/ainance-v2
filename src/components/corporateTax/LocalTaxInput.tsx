import React from 'react';
import { CorporateTaxInputData } from '../../types/corporateTaxInput';

interface Props {
    data: CorporateTaxInputData;
    onChange: (data: CorporateTaxInputData) => void;
}

export const LocalTaxInput: React.FC<Props> = ({ data, onChange }) => {
    const f6 = data.form6;
    const f20 = data.form20;

    const updateForm6 = (field: string, value: number) => {
        onChange({ ...data, form6: { ...f6, [field]: value } });
    };

    const updateForm20 = (field: string, value: number) => {
        onChange({ ...data, form20: { ...f20, [field]: value } });
    };

    const InputField = ({ label, value, onChange: onFieldChange, suffix = '円', hint }: {
        label: string; value: number; onChange: (v: number) => void; suffix?: string; hint?: string
    }) => (
        <div>
            <label className="block text-sm font-medium text-text-muted mb-1">{label}</label>
            <div className="relative">
                <input type="number" value={value} onChange={e => onFieldChange(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-main text-right pr-8" />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-text-muted">{suffix}</span>
            </div>
            {hint && <p className="text-xs text-text-muted mt-1">{hint}</p>}
        </div>
    );

    const ReadonlyField = ({ label, value }: { label: string; value: number }) => (
        <div>
            <label className="block text-sm font-medium text-text-muted mb-1">{label}</label>
            <div className="px-3 py-2 bg-surface-highlight border border-border rounded-lg text-text-main text-right font-semibold">
                {value.toLocaleString()} 円
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            {/* 第六号様式 */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-text-main border-b border-border pb-2">
                    第六号様式　都道府県民税・事業税・特別法人事業税
                </h3>

                <h4 className="font-semibold text-text-main mt-4">事業税（所得割）</h4>
                <div className="grid grid-cols-2 gap-4">
                    <ReadonlyField label="課税標準所得" value={f6.incomeForBusinessTax} />
                    <ReadonlyField label="事業税合計" value={f6.businessTaxAmount} />
                </div>
                <div className="grid grid-cols-3 gap-3 bg-surface-highlight p-3 rounded-lg">
                    <ReadonlyField label="400万以下 (3.5%)" value={f6.businessTax400} />
                    <ReadonlyField label="400万超800万以下 (5.2%)" value={f6.businessTax800} />
                    <ReadonlyField label="800万超 (7.0%)" value={f6.businessTaxOver} />
                </div>

                <h4 className="font-semibold text-text-main mt-4">特別法人事業税</h4>
                <div className="grid grid-cols-2 gap-4">
                    <InputField label="特別法人事業税率" value={f6.specialBusinessTaxRate * 100} onChange={v => updateForm6('specialBusinessTaxRate', v / 100)} suffix="%" hint="中小法人（所得割のみ）: 37%" />
                    <ReadonlyField label="特別法人事業税額" value={f6.specialBusinessTaxAmount} />
                </div>

                <h4 className="font-semibold text-text-main mt-4">都道府県民税</h4>
                <div className="grid grid-cols-2 gap-4">
                    <ReadonlyField label="法人税額（課税標準）" value={f6.corporateTaxBase} />
                    <InputField label="法人税割税率" value={f6.prefecturalTaxRate * 100} onChange={v => updateForm6('prefecturalTaxRate', v / 100)} suffix="%" hint="標準税率: 1.0%" />
                    <InputField label="均等割額" value={f6.prefecturalPerCapita} onChange={v => updateForm6('prefecturalPerCapita', v)} hint="資本金1千万円以下: 2万円" />
                    <ReadonlyField label="都道府県民税合計" value={f6.totalPrefecturalTax} />
                </div>

                <h4 className="font-semibold text-text-main mt-4">中間納付・差引</h4>
                <div className="grid grid-cols-2 gap-4">
                    <InputField label="中間納付 事業税" value={f6.interimBusinessTax} onChange={v => updateForm6('interimBusinessTax', v)} />
                    <InputField label="中間納付 都道府県民税" value={f6.interimPrefecturalTax} onChange={v => updateForm6('interimPrefecturalTax', v)} />
                    <ReadonlyField label="差引納付 事業税" value={f6.businessTaxPayable} />
                    <ReadonlyField label="差引納付 都道府県民税" value={f6.prefecturalTaxPayable} />
                </div>
            </div>

            {/* 第二十号様式 */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-text-main border-b border-border pb-2">
                    第二十号様式　市町村民税
                </h3>

                <div className="grid grid-cols-2 gap-4">
                    <ReadonlyField label="法人税額（課税標準）" value={f20.corporateTaxBase} />
                    <InputField label="法人税割税率" value={f20.municipalTaxRate * 100} onChange={v => updateForm20('municipalTaxRate', v / 100)} suffix="%" hint="標準税率: 6.0%" />
                    <InputField label="均等割額" value={f20.municipalPerCapita} onChange={v => updateForm20('municipalPerCapita', v)} hint="資本金1千万円以下・従業者50人以下: 5万円" />
                    <ReadonlyField label="市町村民税合計" value={f20.totalMunicipalTax} />
                    <InputField label="中間納付額" value={f20.interimMunicipalTax} onChange={v => updateForm20('interimMunicipalTax', v)} />
                    <ReadonlyField label="差引納付額" value={f20.municipalTaxPayable} />
                </div>
            </div>
        </div>
    );
};
