export interface TaxReturnInputData {
    // 基本情報
    fiscalYear: number;
    
    // 第一表：収入金額等
    income: {
        business_agriculture: number; // 事業（農業）
        real_estate: number; // 不動産
        employment: number; // 給与
        miscellaneous_public_pension: number; // 雑（公的年金等）
        miscellaneous_other: number; // 雑（その他）
        capital_gains: number; // 配当
        occasional: number; // 一時
    };

    // 第一表：所得から差し引かれる金額（所得控除）
    deductions: {
        medical_expenses: number; // 医療費控除
        social_insurance: number; // 社会保険料控除
        small_business_mutual_aid: number; // 小規模企業共済等掛金控除
        life_insurance: number; // 生命保険料控除
        earthquake_insurance: number; // 地震保険料控除
        donation: number; // 寄附金控除（ふるさと納税など）
        widow_single_parent: number; // 寡婦・ひとり親控除
        working_student: number; // 勤労学生控除
        spouse: number; // 配偶者（特別）控除
        dependents: number; // 扶養控除
        basic: number; // 基礎控除
    };

    // 第一表：税金の計算
    tax_calculation: {
        withholding_tax: number; // 源泉徴収税額
        foreign_tax_credit: number; // 外国税額控除
    };

    // 第一表：その他
    refund_account: {
        bank_name: string;
        branch_name: string;
        account_type: 'ordinary' | 'current' | 'saving'; // 普通/当座/貯蓄
        account_number: string;
    };

    // 第二表：所得の内訳（源泉徴収税額に関する事項）
    withholding_tax_details: WithholdingTaxDetail[];

    // 第二表：保険料控除等の明細
    insurance_premium_details: {
        life_insurance: InsurancePolicy[];
        earthquake_insurance: InsurancePolicy[];
        social_insurance: SocialInsurancePayment[];
    };

    // 第二表：親族に関する事項
    family_details: {
        spouse: FamilyMember | null;
        dependents: FamilyMember[];
    };

    // 第二表：住民税に関する事項
    resident_tax: {
        collection_method: 'special' | 'ordinary'; // 特別徴収/普通徴収
        dependent_under_16_names: string[]; // 16歳未満の扶養親族
    };

    // 青色申告決算書：損益計算書（P/L）補足
    blue_return_pl: {
        beginning_inventory: number; // 期首棚卸高
        ending_inventory: number; // 期末棚卸高
    };

    // 青色申告決算書：貸借対照表（B/S）
    blue_return_bs: {
        items: BalanceSheetItem[];
    };

    // 青色申告決算書：給料賃金の内訳
    employee_salaries: EmployeeSalary[];
}

export interface WithholdingTaxDetail {
    id: string;
    payer_name: string; // 支払者
    income_category: string; // 所得の種類 (給与、報酬など)
    revenue_amount: number; // 収入金額
    tax_amount: number; // 源泉徴収税額
}

export interface InsurancePolicy {
    id: string;
    insurance_company: string; // 保険会社名
    insurance_type: string; // 保険の種類
    term: string; // 保険期間
    beneficiary: string; // 受取人
    payment_amount: number; // 支払保険料
    classification: 'general' | 'nursing' | 'pension' | 'earthquake' | 'old_long_term'; // 新生命/介護/個人年金/地震/旧長期
}

export interface SocialInsurancePayment {
    id: string;
    type: string; // 社会保険の種類
    amount: number;
}

export interface FamilyMember {
    id: string;
    name: string;
    relationship: string; // 続柄
    birth_date: string;
    my_number?: string; // マイナンバー（保存時はセキュリティに注意、今回はモックのみ）
    income: number; // 所得金額
    disability_type?: 'none' | 'general' | 'special'; // 障害者区分
    living_separately: boolean; // 別居
}

export interface BalanceSheetItem {
    id: string;
    asset_liability_type: 'asset' | 'liability' | 'equity';
    account_name: string; // 勘定科目名
    beginning_balance: number; // 期首残高
    ending_balance: number; // 期末残高
}

export interface EmployeeSalary {
    id: string;
    name: string;
    description: string; // 摘要（年齢など）
    months_worked: number; // 従事月数
    salary_amount: number; // 給料賃金
    bonus_amount: number; // 賞与
    withholding_tax: number; // 源泉徴収税額
}

export const initialTaxReturnInputData: TaxReturnInputData = {
    fiscalYear: new Date().getFullYear() - 1,
    income: {
        business_agriculture: 0,
        real_estate: 0,
        employment: 0,
        miscellaneous_public_pension: 0,
        miscellaneous_other: 0,
        capital_gains: 0,
        occasional: 0,
    },
    deductions: {
        medical_expenses: 0,
        social_insurance: 0,
        small_business_mutual_aid: 0,
        life_insurance: 0,
        earthquake_insurance: 0,
        donation: 0,
        widow_single_parent: 0,
        working_student: 0,
        spouse: 0,
        dependents: 0,
        basic: 480000,
    },
    tax_calculation: {
        withholding_tax: 0,
        foreign_tax_credit: 0,
    },
    refund_account: {
        bank_name: '',
        branch_name: '',
        account_type: 'ordinary',
        account_number: '',
    },
    withholding_tax_details: [],
    insurance_premium_details: {
        life_insurance: [],
        earthquake_insurance: [],
        social_insurance: [],
    },
    family_details: {
        spouse: null,
        dependents: [],
    },
    resident_tax: {
        collection_method: 'ordinary',
        dependent_under_16_names: [],
    },
    blue_return_pl: {
        beginning_inventory: 0,
        ending_inventory: 0,
    },
    blue_return_bs: {
        items: [
            { id: '1', asset_liability_type: 'asset', account_name: '現金', beginning_balance: 0, ending_balance: 0 },
            { id: '2', asset_liability_type: 'asset', account_name: '預金', beginning_balance: 0, ending_balance: 0 },
            { id: '3', asset_liability_type: 'asset', account_name: '売掛金', beginning_balance: 0, ending_balance: 0 },
            { id: '4', asset_liability_type: 'asset', account_name: '棚卸資産', beginning_balance: 0, ending_balance: 0 },
            { id: '5', asset_liability_type: 'asset', account_name: '車両運搬具', beginning_balance: 0, ending_balance: 0 },
            { id: '6', asset_liability_type: 'asset', account_name: '工具器具備品', beginning_balance: 0, ending_balance: 0 },
            { id: '7', asset_liability_type: 'liability', account_name: '買掛金', beginning_balance: 0, ending_balance: 0 },
            { id: '8', asset_liability_type: 'liability', account_name: '借入金', beginning_balance: 0, ending_balance: 0 },
            { id: '9', asset_liability_type: 'equity', account_name: '元入金', beginning_balance: 0, ending_balance: 0 },
        ],
    },
    employee_salaries: [],
};
