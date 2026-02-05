export interface Beppyo1Data {
    taxableIncome: number;
    corporateTaxAmount: number;
    specialTaxCredit: number;
    interimPayment: number;
    refundAmount: number;
    totalTaxAmount: number;
}

export interface Beppyo4Item {
    id: string;
    description: string;
    amount: number;
    note?: string;
}

export interface Beppyo4Data {
    netIncomeFromPL: number; // 当期利益または当期欠損の額
    additions: Beppyo4Item[]; // 加算（損金不算入など）
    subtractions: Beppyo4Item[]; // 減算（益金不算入など）
    taxableIncome: number; // 所得金額または欠損金額
}

export interface Beppyo5Data {
    retainedEarningsBegin: number; // 期首現在利益積立金額
    currentIncrease: number; // 当期増減（増）
    currentDecrease: number; // 当期増減（減）
    retainedEarningsEnd: number; // 差引翌期首現在利益積立金額

    capitalBegin: number; // 期首資本金等の額
    capitalIncrease: number;
    capitalDecrease: number;
    capitalEnd: number;
}

export interface TaxPaymentItem {
    id: string;
    taxType: 'corporate' | 'inhabitant' | 'enterprise' | 'local_corporate' | 'other';
    description: string;
    paymentDate: string;
    amount: number;
    category: 'interim' | 'final' | 'withholding' | 'other'; // 中間/確定/源泉/その他
}

export interface Beppyo5_2Data {
    items: TaxPaymentItem[];
    totalPaid: number;
    taxesPayable: {
        corporate: number;
        inhabitant: number;
        enterprise: number;
        localCorporate: number;
    };
}

export interface DepreciationAssetItem {
    id: string;
    name: string;
    acquisitionDate: string;
    acquisitionCost: number;
    usefulLife: number; // 耐用年数
    depreciationMethod: string; // 償却方法
    currentDepreciation: number; // 当期償却額
    allowableLimit: number; // 償却限度額
    bookValueEnd: number; // 期末帳簿価額
}

export interface Beppyo16Data {
    assets: DepreciationAssetItem[];
    totalDepreciation: number;
    totalAllowable: number;
    excessAmount: number; // 償却超過額
}

export interface Beppyo15Data {
    socialExpenses: number; // 交際費等の額
    deductibleExpenses: number; // 接待飲食費の額
    capitalAmount: number; // 資本金の額 (通常はbeppyo5から参照可能だが入力も可)
    deductionLimit: number; // 損金算入限度額
    excessAmount: number; // 損金不算入額
}

export interface Shareholder {
    id: string;
    name: string;
    address: string;
    shares: number; // 持株数
    relationship: string; // 代表者との関係
}

export interface Beppyo2Data {
    shareholders: Shareholder[];
    totalShares: number; // 発行済株式総数
    isFamilyCompany: boolean; // 同族会社判定
}

export interface BusinessOverviewData {
    sales: number;
    costOfSales: number;
    grossProfit: number;
    operatingExpenses: number;
    operatingIncome: number;
    ordinaryIncome: number;
    netIncome: number;

    // 主要科目
    directorsCompensation: number; // 役員給与
    employeesSalary: number; // 従業員給料
    rent: number; // 地代家賃
    taxesAndDues: number; // 租税公課
    entertainmentExpenses: number; // 交際費
    depreciation: number; // 減価償却費
}

export interface CorporateTaxInputData {
    beppyo1: Beppyo1Data;
    beppyo4: Beppyo4Data;
    beppyo5: Beppyo5Data;
    beppyo5_2: Beppyo5_2Data;
    beppyo16: Beppyo16Data;
    beppyo15: Beppyo15Data;
    beppyo2: Beppyo2Data;
    businessOverview: BusinessOverviewData;
    calibration?: {
        globalShiftX: number;
        globalShiftY: number;
    };
}

export const initialCorporateTaxInputData: CorporateTaxInputData = {
    beppyo1: {
        taxableIncome: 0,
        corporateTaxAmount: 0,
        specialTaxCredit: 0,
        interimPayment: 0,
        refundAmount: 0,
        totalTaxAmount: 0,
    },
    beppyo4: {
        netIncomeFromPL: 0,
        additions: [
            { id: '1', description: '法人税等の損金不算入額', amount: 0 },
            { id: '2', description: '交際費等の損金不算入額', amount: 0 },
            { id: '3', description: '役員給与の損金不算入額', amount: 0 },
        ],
        subtractions: [
            { id: '1', description: '事業税等の損金算入額', amount: 0 },
        ],
        taxableIncome: 0,
    },
    beppyo5: {
        retainedEarningsBegin: 0,
        currentIncrease: 0,
        currentDecrease: 0,
        retainedEarningsEnd: 0,
        capitalBegin: 1000000,
        capitalIncrease: 0,
        capitalDecrease: 0,
        capitalEnd: 1000000,
    },
    beppyo5_2: {
        items: [],
        totalPaid: 0,
        taxesPayable: {
            corporate: 0,
            inhabitant: 0,
            enterprise: 0,
            localCorporate: 0
        }
    },
    beppyo16: {
        assets: [],
        totalDepreciation: 0,
        totalAllowable: 0,
        excessAmount: 0
    },
    beppyo15: {
        socialExpenses: 0,
        deductibleExpenses: 0,
        capitalAmount: 1000000,
        deductionLimit: 8000000,
        excessAmount: 0
    },
    beppyo2: {
        shareholders: [],
        totalShares: 100,
        isFamilyCompany: true
    },
    businessOverview: {
        sales: 0,
        costOfSales: 0,
        grossProfit: 0,
        operatingExpenses: 0,
        operatingIncome: 0,
        ordinaryIncome: 0,
        netIncome: 0,
        directorsCompensation: 0,
        employeesSalary: 0,
        rent: 0,
        taxesAndDues: 0,
        entertainmentExpenses: 0,
        depreciation: 0,
    },
    calibration: {
        globalShiftX: 0,
        globalShiftY: 0,
    }
};
