import React from 'react';
import { TaxReturnInputData } from '../../types/taxReturnInput';
import { Info } from 'lucide-react';

interface TaxReturnTable1InputProps {
    data: TaxReturnInputData;
    onChange: (updates: Partial<TaxReturnInputData>) => void;
}

export const TaxReturnTable1Input: React.FC<TaxReturnTable1InputProps> = ({ data, onChange }) => {

    // ネストされたオブジェクトの更新ヘルパー
    const updateIncome = (field: keyof TaxReturnInputData['income'], value: number) => {
        onChange({
            income: { ...data.income, [field]: value }
        });
    };

    const updateDeductions = (field: keyof TaxReturnInputData['deductions'], value: number) => {
        onChange({
            deductions: { ...data.deductions, [field]: value }
        });
    };

    const updateTaxCalc = (field: keyof TaxReturnInputData['tax_calculation'], value: number) => {
        onChange({
            tax_calculation: { ...data.tax_calculation, [field]: value }
        });
    };

    const updateRefund = (field: keyof TaxReturnInputData['refund_account'], value: string) => {
        onChange({
            refund_account: { ...data.refund_account, [field]: value }
        });
    };

    return (
        <div className="space-y-8">
            <div className="bg-info-light border border-info/20 p-4 rounded-lg flex items-start gap-3">
                <Info className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
                <div>
                    <h4 className="font-medium text-text-main text-sm">第一表の手動入力について</h4>
                    <p className="text-sm text-text-muted mt-1">
                        取引データから自動計算された「事業所得」以外の収入や、手動入力が必要な控除項目を入力します。
                        入力した値は自動計算結果に加算または上書きされます。
                    </p>
                </div>
            </div>

            {/* 収入金額等 */}
            <section className="space-y-4">
                <h3 className="text-lg font-semibold text-text-main border-b border-border pb-2">
                    収入金額等
                    <span className="text-xs font-normal text-text-muted ml-2">事業（営業等）以外の収入がある場合に入力</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputGroup label="事業（農業）" value={data.income.business_agriculture} onChange={(v) => updateIncome('business_agriculture', v)} />
                    <InputGroup label="不動産" value={data.income.real_estate} onChange={(v) => updateIncome('real_estate', v)} />
                    <InputGroup label="給与" value={data.income.employment} onChange={(v) => updateIncome('employment', v)} />
                    <InputGroup label="雑（公的年金等）" value={data.income.miscellaneous_public_pension} onChange={(v) => updateIncome('miscellaneous_public_pension', v)} />
                    <InputGroup label="雑（その他）" value={data.income.miscellaneous_other} onChange={(v) => updateIncome('miscellaneous_other', v)} />
                    <InputGroup label="配当" value={data.income.capital_gains} onChange={(v) => updateIncome('capital_gains', v)} />
                    <InputGroup label="一時" value={data.income.occasional} onChange={(v) => updateIncome('occasional', v)} />
                </div>
            </section>

            {/* 所得から差し引かれる金額 */}
            <section className="space-y-4">
                <h3 className="text-lg font-semibold text-text-main border-b border-border pb-2">
                    所得から差し引かれる金額
                    <span className="text-xs font-normal text-text-muted ml-2">控除証明書などを元に入力</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputGroup label="医療費控除" value={data.deductions.medical_expenses} onChange={(v) => updateDeductions('medical_expenses', v)} helper="支払った医療費 - 保険金などで補填される金額 - 10万円（または総所得の5%）" />
                    <InputGroup label="社会保険料控除" value={data.deductions.social_insurance} onChange={(v) => updateDeductions('social_insurance', v)} helper="国民健康保険、国民年金（過去分含む）など" />
                    <InputGroup label="小規模企業共済等掛金控除" value={data.deductions.small_business_mutual_aid} onChange={(v) => updateDeductions('small_business_mutual_aid', v)} />
                    <InputGroup label="生命保険料控除" value={data.deductions.life_insurance} onChange={(v) => updateDeductions('life_insurance', v)} />
                    <InputGroup label="地震保険料控除" value={data.deductions.earthquake_insurance} onChange={(v) => updateDeductions('earthquake_insurance', v)} />
                    <InputGroup label="寄附金控除" value={data.deductions.donation} onChange={(v) => updateDeductions('donation', v)} helper="ふるさと納税など（寄附金額 - 2,000円）" />
                    <InputGroup label="寡婦・ひとり親控除" value={data.deductions.widow_single_parent} onChange={(v) => updateDeductions('widow_single_parent', v)} />
                    <InputGroup label="勤労学生控除" value={data.deductions.working_student} onChange={(v) => updateDeductions('working_student', v)} />
                    <InputGroup label="配偶者（特別）控除" value={data.deductions.spouse} onChange={(v) => updateDeductions('spouse', v)} />
                    <InputGroup label="扶養控除" value={data.deductions.dependents} onChange={(v) => updateDeductions('dependents', v)} />
                    <InputGroup label="基礎控除" value={data.deductions.basic} onChange={(v) => updateDeductions('basic', v)} readOnly />
                </div>
            </section>

            {/* 税金の計算 */}
            <section className="space-y-4">
                <h3 className="text-lg font-semibold text-text-main border-b border-border pb-2">
                    税金の計算
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputGroup label="源泉徴収税額" value={data.tax_calculation.withholding_tax} onChange={(v) => updateTaxCalc('withholding_tax', v)} helper="給与や報酬から天引きされた所得税の合計" />
                    <InputGroup label="外国税額控除" value={data.tax_calculation.foreign_tax_credit} onChange={(v) => updateTaxCalc('foreign_tax_credit', v)} />
                </div>
            </section>

            {/* 還付先口座 */}
            <section className="space-y-4">
                <h3 className="text-lg font-semibold text-text-main border-b border-border pb-2">
                    還付される税金の受取場所
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1">金融機関名</label>
                        <input
                            type="text"
                            className="input-base"
                            value={data.refund_account.bank_name}
                            onChange={(e) => updateRefund('bank_name', e.target.value)}
                            placeholder="例: みずほ銀行"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1">支店名</label>
                        <input
                            type="text"
                            className="input-base"
                            value={data.refund_account.branch_name}
                            onChange={(e) => updateRefund('branch_name', e.target.value)}
                            placeholder="例: 本店営業部"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1">預金種類</label>
                        <select
                            className="input-base"
                            value={data.refund_account.account_type}
                            onChange={(e) => updateRefund('account_type', e.target.value as any)}
                        >
                            <option value="ordinary">普通</option>
                            <option value="current">当座</option>
                            <option value="saving">貯蓄</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1">口座番号</label>
                        <input
                            type="text"
                            className="input-base"
                            value={data.refund_account.account_number}
                            onChange={(e) => updateRefund('account_number', e.target.value)}
                            placeholder="1234567"
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};

const InputGroup: React.FC<{
    label: string;
    value: number;
    onChange: (val: number) => void;
    helper?: string;
    readOnly?: boolean;
}> = ({ label, value, onChange, helper, readOnly }) => (
    <div>
        <label className="block text-sm font-medium text-text-muted mb-1">{label}</label>
        <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">¥</span>
            <input
                type="number"
                className={`input-base pl-8 ${readOnly ? 'bg-surface-highlight cursor-not-allowed' : ''}`}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                readOnly={readOnly}
                onFocus={(e) => e.target.select()}
            />
        </div>
        {helper && <p className="text-xs text-text-muted mt-1">{helper}</p>}
    </div>
);
