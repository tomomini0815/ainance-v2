// 駆け込み確定申告のデータ型定義

export interface BasicInfo {
  name: string;
  address: string;
  myNumber: string;
  businessType: string;
  filingType: 'blue' | 'white';
}

export interface IncomeInfo {
  totalRevenue: number;
  sources: string[];
  monthlyBreakdown?: number[];
}

export interface ExpensesInfo {
  supplies: number;          // 消耗品費
  communication: number;     // 通信費
  transportation: number;    // 旅費交通費
  entertainment: number;     // 接待交際費
  rent: number;             // 地代家賃
  utilities: number;        // 水道光熱費
  other: number;            // その他
}

export interface DeductionsInfo {
  socialInsurance: number;      // 社会保険料控除
  lifeInsurance: number;        // 生命保険料控除
  earthquakeInsurance: number;  // 地震保険料控除
  medicalExpenses: number;      // 医療費控除
  donations: number;            // 寄附金控除
  dependents: number;           // 扶養控除
}

export interface QuickTaxFilingData {
  basicInfo: BasicInfo;
  income: IncomeInfo;
  expenses: ExpensesInfo;
  depreciation?: number;      // 減価償却費
  deductions: DeductionsInfo;
  calculatedTax?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaxCalculationResult {
  totalIncome: number;        // 総収入
  totalExpenses: number;      // 総経費
  netIncome: number;          // 所得金額
  totalDeductions: number;    // 控除合計
  taxableIncome: number;      // 課税所得
  incomeTax: number;          // 所得税額
  reconstructionTax: number;  // 復興特別所得税
  totalTax: number;           // 合計税額
}

export type WizardStep = 1 | 2 | 3 | 4 | 5 | 6;
