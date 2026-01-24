import { QuickTaxFilingData, TaxCalculationResult, ExpensesInfo } from '../types/quickTaxFiling';

/**
 * 業種別の一般的な経費比率（売上に対する割合）
 */
const EXPENSE_RATIOS_BY_BUSINESS: Record<string, Partial<ExpensesInfo>> = {
  'IT・エンジニア': {
    supplies: 0.05,
    communication: 0.03,
    transportation: 0.02,
    entertainment: 0.02,
    rent: 0.10,
    utilities: 0.02,
    other: 0.06
  },
  'デザイナー': {
    supplies: 0.08,
    communication: 0.03,
    transportation: 0.03,
    entertainment: 0.03,
    rent: 0.12,
    utilities: 0.02,
    other: 0.07
  },
  'ライター': {
    supplies: 0.03,
    communication: 0.02,
    transportation: 0.02,
    entertainment: 0.02,
    rent: 0.08,
    utilities: 0.01,
    other: 0.04
  },
  'コンサルタント': {
    supplies: 0.03,
    communication: 0.04,
    transportation: 0.05,
    entertainment: 0.05,
    rent: 0.10,
    utilities: 0.02,
    other: 0.06
  },
  'その他': {
    supplies: 0.05,
    communication: 0.03,
    transportation: 0.03,
    entertainment: 0.03,
    rent: 0.10,
    utilities: 0.02,
    other: 0.05
  }
};

/**
 * 業種と売上から経費を推定
 */
export const estimateExpenses = (businessType: string, totalRevenue: number): ExpensesInfo => {
  const ratios = EXPENSE_RATIOS_BY_BUSINESS[businessType] || EXPENSE_RATIOS_BY_BUSINESS['その他'];
  
  return {
    supplies: Math.round(totalRevenue * (ratios.supplies || 0)),
    communication: Math.round(totalRevenue * (ratios.communication || 0)),
    transportation: Math.round(totalRevenue * (ratios.transportation || 0)),
    entertainment: Math.round(totalRevenue * (ratios.entertainment || 0)),
    rent: Math.round(totalRevenue * (ratios.rent || 0)),
    utilities: Math.round(totalRevenue * (ratios.utilities || 0)),
    other: Math.round(totalRevenue * (ratios.other || 0))
  };
};

/**
 * 所得税額を計算
 */
export const calculateTax = (data: QuickTaxFilingData): TaxCalculationResult => {
  // 総収入
  const totalIncome = data.income.totalRevenue;
  
  // 総経費
  const totalExpenses = Object.values(data.expenses).reduce((sum, val) => sum + val, 0);
  
  // 所得金額（収入 - 経費）
  const netIncome = totalIncome - totalExpenses;
  
  // 基礎控除（48万円）
  const basicDeduction = 480000;
  
  // その他の控除合計
  const totalDeductions = basicDeduction + Object.values(data.deductions).reduce((sum, val) => sum + val, 0);
  
  // 課税所得（所得金額 - 控除）
  const taxableIncome = Math.max(0, netIncome - totalDeductions);
  
  // 所得税額の計算（累進課税）
  let incomeTax = 0;
  if (taxableIncome <= 1950000) {
    incomeTax = taxableIncome * 0.05;
  } else if (taxableIncome <= 3300000) {
    incomeTax = 1950000 * 0.05 + (taxableIncome - 1950000) * 0.10;
  } else if (taxableIncome <= 6950000) {
    incomeTax = 1950000 * 0.05 + 1350000 * 0.10 + (taxableIncome - 3300000) * 0.20;
  } else if (taxableIncome <= 9000000) {
    incomeTax = 1950000 * 0.05 + 1350000 * 0.10 + 3650000 * 0.20 + (taxableIncome - 6950000) * 0.23;
  } else if (taxableIncome <= 18000000) {
    incomeTax = 1950000 * 0.05 + 1350000 * 0.10 + 3650000 * 0.20 + 2050000 * 0.23 + (taxableIncome - 9000000) * 0.33;
  } else if (taxableIncome <= 40000000) {
    incomeTax = 1950000 * 0.05 + 1350000 * 0.10 + 3650000 * 0.20 + 2050000 * 0.23 + 9000000 * 0.33 + (taxableIncome - 18000000) * 0.40;
  } else {
    incomeTax = 1950000 * 0.05 + 1350000 * 0.10 + 3650000 * 0.20 + 2050000 * 0.23 + 9000000 * 0.33 + 22000000 * 0.40 + (taxableIncome - 40000000) * 0.45;
  }
  
  // 復興特別所得税（所得税額の2.1%）
  const reconstructionTax = Math.floor(incomeTax * 0.021);
  
  // 合計税額
  const totalTax = Math.floor(incomeTax) + reconstructionTax;
  
  return {
    totalIncome,
    totalExpenses,
    netIncome,
    totalDeductions,
    taxableIncome,
    incomeTax: Math.floor(incomeTax),
    reconstructionTax,
    totalTax
  };
};

/**
 * データをローカルストレージに保存
 */
export const saveQuickTaxFilingData = (userId: string, data: QuickTaxFilingData): void => {
  const key = `quickTaxFiling_${userId}`;
  const dataWithTimestamp = {
    ...data,
    updatedAt: new Date().toISOString()
  };
  localStorage.setItem(key, JSON.stringify(dataWithTimestamp));
};

/**
 * ローカルストレージからデータを読み込み
 */
export const loadQuickTaxFilingData = (userId: string): QuickTaxFilingData | null => {
  const key = `quickTaxFiling_${userId}`;
  const stored = localStorage.getItem(key);
  if (!stored) return null;
  
  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to parse stored tax filing data:', error);
    return null;
  }
};

/**
 * 保存されたデータを削除
 */
export const clearQuickTaxFilingData = (userId: string): void => {
  const key = `quickTaxFiling_${userId}`;
  localStorage.removeItem(key);
};
