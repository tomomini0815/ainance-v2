/**
 * 法人基本情報 (Company Basic Information)
 * 公式申告書PDFのヘッダー部分に転記される情報
 */
export interface CompanyInfo {
    corporateName: string;           // 法人名
    corporateNameKana: string;       // 法人名（フリガナ）
    corporateNumber: string;         // 法人番号（13桁）
    postalCode: string;              // 郵便番号
    address: string;                 // 納税地（住所）
    phoneNumber: string;             // 電話番号
    representativeName: string;      // 代表者氏名
    representativeNameKana: string;  // 代表者氏名（フリガナ）
    representativeAddress: string;   // 代表者住所
    businessType: string;            // 事業種目
    taxOffice: string;               // 税務署名
    fiscalYearStart: string;         // 事業年度開始日 (YYYY-MM-DD)
    fiscalYearEnd: string;           // 事業年度終了日 (YYYY-MM-DD)
    filingDate: string;              // 申告日 (YYYY-MM-DD)
    capitalAmount: number;           // 資本金の額
    employeeCount: number;           // 従業員数
    groupCompanyType: 'single' | 'parent' | 'subsidiary' | 'consolidated'; // 連結納税区分
    blueFormApproval: boolean;       // 青色申告の承認
}

export interface Beppyo1Data {
    // National Tax (Corporate Tax)
    taxableIncome: number;
    corporateTaxAmount: number;
    specialTaxCredit: number;
    nationalInterimPayment: number;
    interimPayment: number; // Added for compatibility
    nationalTaxPayable: number;

    // Local Corporate Tax
    localCorporateTaxAmount: number; // 10.3% of national
    localInterimPayment: number;
    localTaxPayable: number;

    // Corporate Inhabitant Tax
    prefecturalTax: number;
    municipalTax: number;
    inhabitantInterimPayment: number;
    inhabitantTaxPayable: number;

    // Corporate Enterprise Tax
    enterpriseTax: number;
    specialLocalEnterpriseTax: number;
    enterpriseInterimPayment: number;
    enterpriseTaxPayable: number;

    totalTaxAmount: number;
    refundAmount: number;
}

export interface Beppyo4Item {
    id: string;
    description: string;
    amount: number;
    note?: string;
    category?: 'retained' | 'outflow' | 'other'; // 留保, 社外流出, その他
}

export interface Beppyo4Data {
    netIncomeFromPL: number; // 当期利益または当期欠損の額

    // Additions (加算)
    nonDeductibleTaxes: number; // 法人税・住民税
    inhabitantTax?: number;      // 住民税 (Specific for B4 mapping if split from total)
    nonDeductibleEntertainment: number; // 交際費等の損金不算入額
    excessDepreciation: number; // 償却超過額
    additions: Beppyo4Item[]; // Renamed from otherAdditions to match usage
    otherAdditions: Beppyo4Item[];

    // Subtractions (減算)
    deductibleEnterpriseTax: number; // 事業税等の損金算入額
    dividendExclusion: number; // 受取配当等の益金不算入額
    taxRefunds?: number;        // 法人税等還付金
    subtractions: Beppyo4Item[]; // Renamed from otherSubtractions to match usage
    otherSubtractions: Beppyo4Item[];

    taxableIncome: number; // 所得金額または欠損金額
}

export interface Beppyo5Item {
    id: string;
    description: string;
    beginAmount: number;
    increase: number;
    decrease: number;
    endAmount: number;
}

export interface Beppyo5Data {
    retainedEarningsItems: Beppyo5Item[];
    retainedEarningsBegin: number;  // 期首現在利益積立金額
    currentIncrease: number;        // 当期の増
    currentDecrease: number;        // 当期の減
    totalRetainedEarningsEnd: number; // 翌期首現在利益積立金額

    capitalBegin: number;
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
    totalEntertainmentExpenses: number; // 交際費等の支出額
    foodAndDrinkExpenses: number; // うち接待飲食費の額
    otherEntertainmentExpenses: number; // その他の交際費
    capitalAmount: number; // 資本金の額
    socialExpenses: number; // Added to match usage
    deductibleExpenses: number; // Added to match usage
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

// 別表七（一）欠損金の繰越控除
export interface LossCarryforwardItem {
    fiscalYear: string;     // 欠損事業年度
    originalLoss: number;   // 欠損金額
    usedPrior: number;      // 前期以前の控除済額
    usedCurrent: number;    // 当期控除額
    remaining: number;      // 翌期繰越額
}

export interface Beppyo7Data {
    preDeductionIncome: number;       // 控除前所得金額
    deductionLimit: number;           // 損金算入限度額（中小法人は100%）
    items: LossCarryforwardItem[];    // 年度別欠損金明細
    totalDeduction: number;           // 当期損金算入合計
    totalCarryforward: number;        // 翌期繰越合計
}

// 第六号様式（都道府県民税・事業税・特別法人事業税）
export interface Form6Data {
    // 事業税（所得割）
    incomeForBusinessTax: number;     // 課税標準所得
    businessTax400: number;           // 400万以下の部分
    businessTax800: number;           // 400万超800万以下の部分
    businessTaxOver: number;          // 800万超の部分
    businessTaxAmount: number;        // 事業税合計
    // 特別法人事業税
    specialBusinessTaxRate: number;   // 特別法人事業税率（37%）
    specialBusinessTaxAmount: number; // 特別法人事業税額
    // 都道府県民税
    corporateTaxBase: number;         // 法人税額（課税標準）
    prefecturalTaxRate: number;       // 都道府県民税率
    prefecturalTaxAmount: number;     // 都道府県民税（法人税割）
    prefecturalPerCapita: number;     // 均等割額
    totalPrefecturalTax: number;      // 都道府県民税合計
    // 中間・予定納付
    interimBusinessTax: number;
    interimPrefecturalTax: number;
    // 差引納付額
    businessTaxPayable: number;
    prefecturalTaxPayable: number;
}

// 第二十号様式（市町村民税）
export interface Form20Data {
    corporateTaxBase: number;         // 法人税額（課税標準）
    municipalTaxRate: number;         // 市町村民税率
    municipalTaxAmount: number;       // 市町村民税（法人税割）
    municipalPerCapita: number;       // 均等割額
    totalMunicipalTax: number;        // 市町村民税合計
    interimMunicipalTax: number;      // 中間納付額
    municipalTaxPayable: number;      // 差引納付額
}

// 財務諸表（貸借対照表・損益計算書）
export interface BalanceSheetData {
    currentAssets: number;            // 流動資産
    fixedAssets: number;              // 固定資産
    deferredAssets: number;           // 繰延資産
    totalAssets: number;              // 資産合計
    
    currentLiabilities: number;       // 流動負債
    fixedLiabilities: number;         // 固定負債
    totalLiabilities: number;         // 負債合計
    
    capitalStock: number;             // 資本金
    capitalSurplus: number;           // 資本剰余金
    retainedEarnings: number;         // 利益剰余金
    treasuryStock: number;            // 自己株式
    totalNetAssets: number;           // 純資産合計
    
    totalLiabilitiesAndNetAssets: number; // 負債純資産合計
}

export interface IncomeStatementData {
    netSales: number;                 // 売上高
    costOfSales: number;              // 売上原価
    grossProfit: number;              // 売上総利益
    
    sellingGeneralAdminExpenses: number; // 販売費及び一般管理費
    operatingIncome: number;          // 営業利益
    
    nonOperatingIncome: number;       // 営業外収益
    nonOperatingExpenses: number;     // 営業外費用
    ordinaryIncome: number;           // 経常利益
    
    extraordinaryIncome: number;      // 特別利益
    extraordinaryLoss: number;        // 特別損失
    incomeBeforeTax: number;          // 税引前当期純利益
    
    incomeTaxes: number;              // 法人税、住民税及び事業税等
    netIncome: number;                // 当期純利益
}

export interface FinancialStatementsData {
    balanceSheet: BalanceSheetData;
    incomeStatement: IncomeStatementData;
}

export interface CorporateTaxInputData {
    companyInfo: CompanyInfo;        // 法人基本情報
    beppyo1: Beppyo1Data;
    beppyo2: Beppyo2Data;
    beppyo4: Beppyo4Data;
    beppyo5: Beppyo5Data;
    beppyo5_2: Beppyo5_2Data;
    beppyo7: Beppyo7Data;
    beppyo15: Beppyo15Data;
    beppyo16: Beppyo16Data;
    businessOverview: BusinessOverviewData;
    form6: Form6Data;
    form20: Form20Data;
    financialStatements: FinancialStatementsData;
    calibration?: {
        globalShiftX: number;
        globalShiftY: number;
        digitCenterOffsetX?: number;
        digitCenterOffsetY?: number;
    };
}

export const initialCorporateTaxInputData: CorporateTaxInputData = {
    companyInfo: {
        corporateName: '',
        corporateNameKana: '',
        corporateNumber: '',
        postalCode: '',
        address: '',
        phoneNumber: '',
        representativeName: '',
        representativeNameKana: '',
        representativeAddress: '',
        businessType: '',
        taxOffice: '',
        fiscalYearStart: '',
        fiscalYearEnd: '',
        filingDate: '',
        capitalAmount: 1000000,
        employeeCount: 1,
        groupCompanyType: 'single',
        blueFormApproval: true,
    },
    beppyo1: {
        taxableIncome: 0,
        corporateTaxAmount: 0,
        specialTaxCredit: 0,
        nationalInterimPayment: 0,
        interimPayment: 0,
        nationalTaxPayable: 0,
        localCorporateTaxAmount: 0,
        localInterimPayment: 0,
        localTaxPayable: 0,
        prefecturalTax: 0,
        municipalTax: 0,
        inhabitantInterimPayment: 0,
        inhabitantTaxPayable: 0,
        enterpriseTax: 0,
        specialLocalEnterpriseTax: 0,
        enterpriseInterimPayment: 0,
        enterpriseTaxPayable: 0,
        totalTaxAmount: 0,
        refundAmount: 0,
    },
    beppyo4: {
        netIncomeFromPL: 0,
        nonDeductibleTaxes: 0,
        nonDeductibleEntertainment: 0,
        excessDepreciation: 0,
        additions: [],
        otherAdditions: [],
        deductibleEnterpriseTax: 0,
        dividendExclusion: 0,
        subtractions: [],
        otherSubtractions: [],
        taxableIncome: 0,
    },
    beppyo5: {
        retainedEarningsItems: [
            { id: '1', description: '利益準備金', beginAmount: 0, increase: 0, decrease: 0, endAmount: 0 },
            { id: '2', description: '別途積立金', beginAmount: 0, increase: 0, decrease: 0, endAmount: 0 },
            { id: '3', description: '繰越利益剰余金', beginAmount: 0, increase: 0, decrease: 0, endAmount: 0 },
            { id: '4', description: '未払法人税等', beginAmount: 0, increase: 0, decrease: 0, endAmount: 0 },
            { id: '5', description: '未払事業税', beginAmount: 0, increase: 0, decrease: 0, endAmount: 0 },
        ],
        retainedEarningsBegin: 0,
        currentIncrease: 0,
        currentDecrease: 0,
        totalRetainedEarningsEnd: 0,
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
        totalEntertainmentExpenses: 0,
        foodAndDrinkExpenses: 0,
        otherEntertainmentExpenses: 0,
        capitalAmount: 1000000,
        socialExpenses: 0,
        deductibleExpenses: 0,
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
    },
    beppyo7: {
        preDeductionIncome: 0,
        deductionLimit: 0,
        items: [],
        totalDeduction: 0,
        totalCarryforward: 0,
    },
    form6: {
        incomeForBusinessTax: 0,
        businessTax400: 0,
        businessTax800: 0,
        businessTaxOver: 0,
        businessTaxAmount: 0,
        specialBusinessTaxRate: 0.37,
        specialBusinessTaxAmount: 0,
        corporateTaxBase: 0,
        prefecturalTaxRate: 0.01,
        prefecturalTaxAmount: 0,
        prefecturalPerCapita: 20000,
        totalPrefecturalTax: 0,
        interimBusinessTax: 0,
        interimPrefecturalTax: 0,
        businessTaxPayable: 0,
        prefecturalTaxPayable: 0,
    },
    form20: {
        corporateTaxBase: 0,
        municipalTaxRate: 0.06,
        municipalTaxAmount: 0,
        municipalPerCapita: 50000,
        totalMunicipalTax: 0,
        interimMunicipalTax: 0,
        municipalTaxPayable: 0,
    },
    financialStatements: {
        balanceSheet: {
            currentAssets: 0,
            fixedAssets: 0,
            deferredAssets: 0,
            totalAssets: 0,
            currentLiabilities: 0,
            fixedLiabilities: 0,
            totalLiabilities: 0,
            capitalStock: 1000000,
            capitalSurplus: 0,
            retainedEarnings: 0,
            treasuryStock: 0,
            totalNetAssets: 1000000,
            totalLiabilitiesAndNetAssets: 1000000,
        },
        incomeStatement: {
            netSales: 0,
            costOfSales: 0,
            grossProfit: 0,
            sellingGeneralAdminExpenses: 0,
            operatingIncome: 0,
            nonOperatingIncome: 0,
            nonOperatingExpenses: 0,
            ordinaryIncome: 0,
            extraordinaryIncome: 0,
            extraordinaryLoss: 0,
            incomeBeforeTax: 0,
            incomeTaxes: 0,
            netIncome: 0,
        },
    },
};
