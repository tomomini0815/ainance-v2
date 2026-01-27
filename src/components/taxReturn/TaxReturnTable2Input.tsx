import React from 'react';
import { TaxReturnInputData, FamilyMember, InsurancePolicy, WithholdingTaxDetail } from '../../types/taxReturnInput';
import { DynamicListInput } from './DynamicListInput';
import { Info } from 'lucide-react';

interface TaxReturnTable2InputProps {
    data: TaxReturnInputData;
    onChange: (updates: Partial<TaxReturnInputData>) => void;
}

export const TaxReturnTable2Input: React.FC<TaxReturnTable2InputProps> = ({ data, onChange }) => {

    // --- 家族情報系ヘルパー ---
    const handleAddDependent = () => {
        const newDependent: FamilyMember = {
            id: Date.now().toString(),
            name: '',
            relationship: '',
            birth_date: '',
            income: 0,
            living_separately: false,
        };
        onChange({
            family_details: {
                ...data.family_details,
                dependents: [...data.family_details.dependents, newDependent],
            },
        });
    };

    const handleUpdateDependent = (index: number, updated: FamilyMember) => {
        const newDependents = [...data.family_details.dependents];
        newDependents[index] = updated;
        onChange({
            family_details: {
                ...data.family_details,
                dependents: newDependents,
            },
        });
    };

    const handleRemoveDependent = (index: number) => {
        onChange({
            family_details: {
                ...data.family_details,
                dependents: data.family_details.dependents.filter((_, i) => i !== index),
            },
        });
    };

    // --- 保険料控除系ヘルパー ---
    const handleAddInsurance = (type: 'life_insurance' | 'earthquake_insurance', insuranceType: InsurancePolicy['classification']) => {
        const newPolicy: InsurancePolicy = {
            id: Date.now().toString(),
            insurance_company: '',
            insurance_type: '',
            term: '',
            beneficiary: '',
            payment_amount: 0,
            classification: insuranceType,
        };
        onChange({
            insurance_premium_details: {
                ...data.insurance_premium_details,
                [type]: [...data.insurance_premium_details[type], newPolicy],
            },
        });
    };

    const handleUpdateInsurance = (type: 'life_insurance' | 'earthquake_insurance', index: number, updated: InsurancePolicy) => {
        const newList = [...data.insurance_premium_details[type]];
        newList[index] = updated;
        onChange({
            insurance_premium_details: {
                ...data.insurance_premium_details,
                [type]: newList,
            },
        });
    };

    const handleRemoveInsurance = (type: 'life_insurance' | 'earthquake_insurance', index: number) => {
        onChange({
            insurance_premium_details: {
                ...data.insurance_premium_details,
                [type]: data.insurance_premium_details[type].filter((_, i) => i !== index),
            },
        });
    };

    // --- 源泉徴収詳細ヘルパー ---
    const handleAddWithholding = () => {
        const newItem: WithholdingTaxDetail = {
            id: Date.now().toString(),
            payer_name: '',
            income_category: '給与',
            revenue_amount: 0,
            tax_amount: 0,
        };
        onChange({
            withholding_tax_details: [...data.withholding_tax_details, newItem],
        });
    };

    const handleUpdateWithholding = (index: number, updated: WithholdingTaxDetail) => {
        const newList = [...data.withholding_tax_details];
        newList[index] = updated;
        onChange({
            withholding_tax_details: newList,
        });
    };

    const handleRemoveWithholding = (index: number) => {
        onChange({
            withholding_tax_details: data.withholding_tax_details.filter((_, i) => i !== index),
        });
    };

    // --- 住民税ヘルパー ---
    const updateResidentTax = (field: keyof TaxReturnInputData['resident_tax'], value: any) => {
        onChange({
            resident_tax: { ...data.resident_tax, [field]: value }
        });
    };

    return (
        <div className="space-y-8">
            <div className="bg-info-light border border-info/20 p-4 rounded-lg flex items-start gap-3">
                <Info className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
                <div>
                    <h4 className="font-medium text-text-main text-sm">第二表の手動入力について</h4>
                    <p className="text-sm text-text-muted mt-1">
                        源泉徴収の内訳、保険料控除の明細、家族情報など、申告書の第二表に記載する詳細情報を入力します。
                    </p>
                </div>
            </div>

            {/* 源泉徴収税額に関する事項 */}
            <section className="space-y-4">
                <h3 className="text-lg font-semibold text-text-main border-b border-border pb-2">
                    所得の内訳（源泉徴収税額に関する事項）
                </h3>
                <DynamicListInput
                    items={data.withholding_tax_details}
                    onAdd={handleAddWithholding}
                    onRemove={handleRemoveWithholding}
                    onEdit={handleUpdateWithholding}
                    title=""
                    addButtonLabel="支払者を追加"
                    renderItem={(item, index) => (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-text-muted">所得の種類</label>
                                <input
                                    type="text"
                                    className="input-base py-1.5"
                                    value={item.income_category}
                                    onChange={(e) => handleUpdateWithholding(index, { ...item, income_category: e.target.value })}
                                    placeholder="給与、報酬など"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-text-muted">支払者の名称・氏名</label>
                                <input
                                    type="text"
                                    className="input-base py-1.5"
                                    value={item.payer_name}
                                    onChange={(e) => handleUpdateWithholding(index, { ...item, payer_name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-text-muted">収入金額</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">¥ </span>
                                    <input
                                        type="number"
                                        className="input-base py-1.5 pl-14"
                                        value={item.revenue_amount === 0 ? '' : item.revenue_amount}
                                        onChange={(e) => handleUpdateWithholding(index, { ...item, revenue_amount: e.target.value === '' ? 0 : Number(e.target.value) })}
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
                                        value={item.tax_amount === 0 ? '' : item.tax_amount}
                                        onChange={(e) => handleUpdateWithholding(index, { ...item, tax_amount: e.target.value === '' ? 0 : Number(e.target.value) })}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                />
            </section>

            {/* 保険料控除等に関する事項 */}
            <section className="space-y-4">
                <h3 className="text-lg font-semibold text-text-main border-b border-border pb-2">
                    保険料控除等に関する事項
                </h3>

                {/* 生命保険料 */}
                <DynamicListInput
                    items={data.insurance_premium_details.life_insurance}
                    onAdd={() => handleAddInsurance('life_insurance', 'general')}
                    onRemove={(index) => handleRemoveInsurance('life_insurance', index)}
                    onEdit={(index, item) => handleUpdateInsurance('life_insurance', index, item)}
                    title="生命保険料控除"
                    addButtonLabel="生命保険を追加"
                    renderItem={(item, index) => (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            <div>
                                <label className="text-xs text-text-muted">保険会社名</label>
                                <input
                                    type="text"
                                    className="input-base py-1.5"
                                    value={item.insurance_company}
                                    onChange={(e) => handleUpdateInsurance('life_insurance', index, { ...item, insurance_company: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-text-muted">保険等の種類</label>
                                <input
                                    type="text"
                                    className="input-base py-1.5"
                                    value={item.insurance_type}
                                    onChange={(e) => handleUpdateInsurance('life_insurance', index, { ...item, insurance_type: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-text-muted">期間</label>
                                <input
                                    type="text"
                                    className="input-base py-1.5"
                                    value={item.term}
                                    onChange={(e) => handleUpdateInsurance('life_insurance', index, { ...item, term: e.target.value })}
                                    placeholder="例: 10年"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-text-muted">受取人</label>
                                <input
                                    type="text"
                                    className="input-base py-1.5"
                                    value={item.beneficiary}
                                    onChange={(e) => handleUpdateInsurance('life_insurance', index, { ...item, beneficiary: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-text-muted">新・旧の区分</label>
                                <select
                                    className="input-base py-1.5"
                                    value={item.classification}
                                    onChange={(e) => handleUpdateInsurance('life_insurance', index, { ...item, classification: e.target.value as any })}
                                >
                                    <option value="general">新生命保険</option>
                                    <option value="old_long_term">旧生命保険</option>
                                    <option value="nursing">介護医療保険</option>
                                    <option value="pension">個人年金</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-text-muted">支払保険料</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">¥ </span>
                                    <input
                                        type="number"
                                        className="input-base py-1.5 pl-14"
                                        value={item.payment_amount === 0 ? '' : item.payment_amount}
                                        onChange={(e) => handleUpdateInsurance('life_insurance', index, { ...item, payment_amount: e.target.value === '' ? 0 : Number(e.target.value) })}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                />

                {/* 地震保険料 */}
                <DynamicListInput
                    items={data.insurance_premium_details.earthquake_insurance}
                    onAdd={() => handleAddInsurance('earthquake_insurance', 'earthquake')}
                    onRemove={(index) => handleRemoveInsurance('earthquake_insurance', index)}
                    onEdit={(index, item) => handleUpdateInsurance('earthquake_insurance', index, item)}
                    title="地震保険料控除"
                    addButtonLabel="地震保険を追加"
                    renderItem={(item, index) => (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-text-muted">保険会社名</label>
                                <input
                                    type="text"
                                    className="input-base py-1.5"
                                    value={item.insurance_company}
                                    onChange={(e) => handleUpdateInsurance('earthquake_insurance', index, { ...item, insurance_company: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-text-muted">保険等の種類</label>
                                <input
                                    type="text"
                                    className="input-base py-1.5"
                                    value={item.insurance_type}
                                    onChange={(e) => handleUpdateInsurance('earthquake_insurance', index, { ...item, insurance_type: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-text-muted">区分</label>
                                <select
                                    className="input-base py-1.5"
                                    value={item.classification}
                                    onChange={(e) => handleUpdateInsurance('earthquake_insurance', index, { ...item, classification: e.target.value as any })}
                                >
                                    <option value="earthquake">地震</option>
                                    <option value="old_long_term">旧長期</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-text-muted">支払保険料</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">¥ </span>
                                    <input
                                        type="number"
                                        className="input-base py-1.5 pl-14"
                                        value={item.payment_amount === 0 ? '' : item.payment_amount}
                                        onChange={(e) => handleUpdateInsurance('earthquake_insurance', index, { ...item, payment_amount: e.target.value === '' ? 0 : Number(e.target.value) })}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                />
            </section>

            {/* 配偶者や親族に関する事項 */}
            <section className="space-y-4">
                <h3 className="text-lg font-semibold text-text-main border-b border-border pb-2">
                    配偶者や親族に関する事項
                </h3>

                {/* 配偶者 */}
                <div className="bg-surface p-4 border border-border rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                        <label className="font-medium text-text-main">配偶者</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={!!data.family_details.spouse}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        onChange({
                                            family_details: {
                                                ...data.family_details,
                                                spouse: { id: 'spouse', name: '', relationship: '夫/妻', birth_date: '', income: 0, living_separately: false }
                                            }
                                        });
                                    } else {
                                        onChange({
                                            family_details: {
                                                ...data.family_details,
                                                spouse: null
                                            }
                                        });
                                    }
                                }}
                                className="w-5 h-5 text-primary rounded"
                            />
                            <span className="text-sm text-text-muted">配偶者あり</span>
                        </div>
                    </div>

                    {data.family_details.spouse && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 animate-in fade-in slide-in-from-top-2">
                            <div>
                                <label className="text-xs text-text-muted">氏名</label>
                                <input
                                    type="text"
                                    className="input-base py-1.5"
                                    value={data.family_details.spouse.name}
                                    onChange={(e) => onChange({
                                        family_details: {
                                            ...data.family_details,
                                            spouse: { ...data.family_details.spouse!, name: e.target.value }
                                        }
                                    })}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-text-muted">生年月日</label>
                                <input
                                    type="date"
                                    className="input-base py-1.5"
                                    value={data.family_details.spouse.birth_date}
                                    onChange={(e) => onChange({
                                        family_details: {
                                            ...data.family_details,
                                            spouse: { ...data.family_details.spouse!, birth_date: e.target.value }
                                        }
                                    })}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* 扶養親族 */}
                <DynamicListInput
                    items={data.family_details.dependents}
                    onAdd={handleAddDependent}
                    onRemove={handleRemoveDependent}
                    onEdit={handleUpdateDependent}
                    title="扶養親族"
                    addButtonLabel="扶養親族を追加"
                    renderItem={(item, index) => (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-text-muted">氏名</label>
                                <input
                                    type="text"
                                    className="input-base py-1.5"
                                    value={item.name}
                                    onChange={(e) => handleUpdateDependent(index, { ...item, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-text-muted">続柄</label>
                                <input
                                    type="text"
                                    className="input-base py-1.5"
                                    value={item.relationship}
                                    onChange={(e) => handleUpdateDependent(index, { ...item, relationship: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-text-muted">生年月日</label>
                                <input
                                    type="date"
                                    className="input-base py-1.5"
                                    value={item.birth_date}
                                    onChange={(e) => handleUpdateDependent(index, { ...item, birth_date: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-text-muted">所得金額</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">¥ </span>
                                    <input
                                        type="number"
                                        className="input-base py-1.5 pl-14"
                                        value={item.income === 0 ? '' : item.income}
                                        onChange={(e) => handleUpdateDependent(index, { ...item, income: e.target.value === '' ? 0 : Number(e.target.value) })}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                />
            </section>

            {/* 住民税に関する事項 */}
            <section className="space-y-4">
                <h3 className="text-lg font-semibold text-text-main border-b border-border pb-2">
                    住民税に関する事項
                </h3>
                <div className="bg-surface p-4 border border-border rounded-lg">
                    <label className="block text-sm font-medium text-text-main mb-2">
                        給与、公的年金等以外の所得に係る住民税の徴収方法
                    </label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="resident_tax_collection"
                                checked={data.resident_tax.collection_method === 'special'}
                                onChange={() => updateResidentTax('collection_method', 'special')}
                                className="text-primary focus:ring-primary"
                            />
                            <span className="text-sm">特別徴収（給与から天引き）</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="resident_tax_collection"
                                checked={data.resident_tax.collection_method === 'ordinary'}
                                onChange={() => updateResidentTax('collection_method', 'ordinary')}
                                className="text-primary focus:ring-primary"
                            />
                            <span className="text-sm">普通徴収（自分で納付）</span>
                        </label>
                    </div>
                </div>
            </section>
        </div>
    );
};
