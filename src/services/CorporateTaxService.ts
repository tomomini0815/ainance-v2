/**
 * 法人税計算サービス
 * 法人税・地方法人税・住民税・事業税の計算ロジック
 */

// 減価償却資産の型
export interface DepreciationAsset {
  id: string;
  name: string;               // 資産名称
  quantity: number;           // 数量
  unit: string;               // 単位（台、式など）
  acquisitionDate: string;    // 取得年月
  acquisitionCost: number;    // 取得価額
  depreciationMethod: 'straightLine' | 'decliningBalance' | 'lumpSum' | 'unitsOfProduction' | 'leasePeriod' | 'immediateSME'; // 償却方法
  usefulLife: number;         // 耐用年数
  businessRatio: number;      // 事業専用割合(%)
  currentYearMonths: number;  // 本年中の償却期間（月数）
  // 生産高比例法用
  totalEstimatedUnits?: number; // 預計総生産高
  currentYearUnits?: number;    // 本年生産高
}

// 減価償却計算結果の型
export interface DepreciationResult {
  assetId: string;
  depreciationRate: number;       // 償却率
  currentDepreciation: number;    // 本年分の償却費
  accumulatedDepreciation: number; // 累計償却費（期末減価償却累計額）
  bookValue: number;              // 期末残高（未償却残高）
  allowableLimit: number;         // 償却限度額
}

// 法定耐用年数に応じた償却率（簡易版：定額法・定率法）
// 実際には詳細な表が必要ですが、ここでは主要な年数のみ定義
const DEPRECIATION_RATES: Record<number, { straightLine: number; decliningBalance: number }> = {
  2: { straightLine: 0.500, decliningBalance: 1.000 },
  3: { straightLine: 0.334, decliningBalance: 0.667 }, // 改定償却率等は省略
  4: { straightLine: 0.250, decliningBalance: 0.500 },
  5: { straightLine: 0.200, decliningBalance: 0.400 },
  6: { straightLine: 0.167, decliningBalance: 0.333 },
  8: { straightLine: 0.125, decliningBalance: 0.250 },
  10: { straightLine: 0.100, decliningBalance: 0.200 },
  12: { straightLine: 0.084, decliningBalance: 0.167 },
  15: { straightLine: 0.067, decliningBalance: 0.133 },
  20: { straightLine: 0.050, decliningBalance: 0.100 },
  22: { straightLine: 0.046, decliningBalance: 0.091 }, // 22年（木造建物等）
};

// 法人税の税率（2024/2025年度）
const CORPORATE_TAX_RATES = {
  // 中小法人（資本金1億円以下）
  smallBusiness: {
    lowerRate: 0.15,      // 年800万円以下の部分
    upperRate: 0.232,     // 年800万円超の部分
    threshold: 8000000,   // 800万円
  },
  // 普通法人（資本金1億円超）
  largeBusiness: {
    rate: 0.232,          // 一律23.2%
  },
};

// 地方法人税率
const LOCAL_CORPORATE_TAX_RATE = 0.103; // 法人税額の10.3%

// 法人住民税率（標準税率）
const CORPORATE_INHABITANT_TAX = {
  prefectural: 0.01,      // 都道府県民税（法人税割）
  municipal: 0.06,        // 市町村民税（法人税割）
  perCapitaLevy: 70000,   // 均等割（年額・資本金1千万円以下）
};

// 法人事業税率（外形標準課税対象外の中小法人）
const BUSINESS_TAX_RATES = {
  income400: 0.035,       // 年400万円以下
  income800: 0.052,       // 年400万円超800万円以下
  incomeOver: 0.070,      // 年800万円超
};

// 法人基本情報の型
export interface CorporateInfo {
  companyName: string;
  representativeName: string;
  corporateNumber?: string;
  address?: string;
  capital: number;            // 資本金
  fiscalYearStart: string;    // 事業年度開始日
  fiscalYearEnd: string;      // 事業年度終了日
  fiscalYear: number;         // 対象年度
  employeeCount?: number;     // 従業員数
}

// 決算データの型
export interface FinancialData {
  // 損益計算書
  revenue: number;            // 売上高
  costOfSales: number;        // 売上原価
  grossProfit: number;        // 売上総利益
  operatingExpenses: number;  // 販管費
  operatingIncome: number;    // 営業利益
  nonOperatingIncome: number; // 営業外収益
  nonOperatingExpenses: number; // 営業外費用
  ordinaryIncome: number;     // 経常利益
  extraordinaryIncome: number; // 特別利益
  extraordinaryLoss: number;  // 特別損失
  incomeBeforeTax: number;    // 税引前当期純利益
  
  // 貸借対照表（簡易版）
  totalAssets: number;        // 総資産
  totalLiabilities: number;   // 負債合計
  netAssets: number;          // 純資産
  cash: number;               // 現金・預金
  accountsReceivable: number; // 売掛金
  inventory: number;          // 棚卸資産
  fixedAssets: number;        // 固定資産
  accountsPayable: number;    // 買掛金
  shortTermLoans: number;     // 短期借入金
  longTermLoans: number;      // 長期借入金
  
  // 経費内訳
  expensesByCategory: {
    category: string;
    amount: number;
  }[];
}

// 法人税計算結果の型
export interface CorporateTaxResult {
  // 課税所得
  taxableIncome: number;
  
  // 法人税
  corporateTax: number;
  corporateTaxBreakdown: {
    lowerBracket: number;   // 800万円以下の部分
    upperBracket: number;   // 800万円超の部分
  };
  
  // 地方法人税
  localCorporateTax: number;
  
  // 法人住民税
  corporateInhabitantTax: number;
  prefecturalTax: number;
  municipalTax: number;
  perCapitaLevy: number;
  
  // 法人事業税
  businessTax: number;
  
  // 税金合計
  totalTax: number;
  
  // 当期純利益
  netIncome: number;
  
  // 実効税率
  effectiveTaxRate: number;
}

// 消費税計算結果の型
export interface ConsumptionTaxResult {
  taxableRevenue: number;     // 課税売上
  taxExemptRevenue: number;   // 非課税売上
  taxablePurchases: number;   // 課税仕入
  outputTax: number;          // 売上に係る消費税
  inputTax: number;           // 仕入に係る消費税
  netConsumptionTax: number;  // 納付消費税額
  localConsumptionTax: number; // 地方消費税
  totalConsumptionTax: number; // 消費税等合計
}

/**
 * 法人税を計算
 */
export function calculateCorporateTax(
  taxableIncome: number,
  capital: number
): { tax: number; breakdown: { lowerBracket: number; upperBracket: number } } {
  const isSmallBusiness = capital <= 100000000; // 資本金1億円以下
  
  if (isSmallBusiness) {
    const { lowerRate, upperRate, threshold } = CORPORATE_TAX_RATES.smallBusiness;
    
    if (taxableIncome <= threshold) {
      return {
        tax: Math.floor(taxableIncome * lowerRate),
        breakdown: {
          lowerBracket: Math.floor(taxableIncome * lowerRate),
          upperBracket: 0,
        },
      };
    } else {
      const lowerPart = Math.floor(threshold * lowerRate);
      const upperPart = Math.floor((taxableIncome - threshold) * upperRate);
      return {
        tax: lowerPart + upperPart,
        breakdown: {
          lowerBracket: lowerPart,
          upperBracket: upperPart,
        },
      };
    }
  } else {
    const tax = Math.floor(taxableIncome * CORPORATE_TAX_RATES.largeBusiness.rate);
    return {
      tax,
      breakdown: {
        lowerBracket: 0,
        upperBracket: tax,
      },
    };
  }
}

/**
 * 地方法人税を計算
 */
export function calculateLocalCorporateTax(corporateTax: number): number {
  return Math.floor(corporateTax * LOCAL_CORPORATE_TAX_RATE);
}

/**
 * 法人住民税を計算
 */
export function calculateCorporateInhabitantTax(corporateTax: number): {
  prefecturalTax: number;
  municipalTax: number;
  perCapitaLevy: number;
  total: number;
} {
  const prefecturalTax = Math.floor(corporateTax * CORPORATE_INHABITANT_TAX.prefectural);
  const municipalTax = Math.floor(corporateTax * CORPORATE_INHABITANT_TAX.municipal);
  const perCapitaLevy = CORPORATE_INHABITANT_TAX.perCapitaLevy;
  
  return {
    prefecturalTax,
    municipalTax,
    perCapitaLevy,
    total: prefecturalTax + municipalTax + perCapitaLevy,
  };
}

/**
 * 法人事業税を計算
 */
export function calculateBusinessTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;
  
  let tax = 0;
  
  if (taxableIncome <= 4000000) {
    tax = Math.floor(taxableIncome * BUSINESS_TAX_RATES.income400);
  } else if (taxableIncome <= 8000000) {
    tax = Math.floor(4000000 * BUSINESS_TAX_RATES.income400);
    tax += Math.floor((taxableIncome - 4000000) * BUSINESS_TAX_RATES.income800);
  } else {
    tax = Math.floor(4000000 * BUSINESS_TAX_RATES.income400);
    tax += Math.floor(4000000 * BUSINESS_TAX_RATES.income800);
    tax += Math.floor((taxableIncome - 8000000) * BUSINESS_TAX_RATES.incomeOver);
  }
  
  return tax;
}

/**
 * 全ての法人税等を計算
 */
export function calculateAllCorporateTaxes(
  financialData: FinancialData,
  corporateInfo: CorporateInfo
): CorporateTaxResult {
  // 課税所得（税引前利益から計算。実際はより複雑な調整が必要）
  const taxableIncome = Math.max(0, financialData.incomeBeforeTax);
  
  // 法人税
  const corporateTaxResult = calculateCorporateTax(taxableIncome, corporateInfo.capital);
  
  // 地方法人税
  const localCorporateTax = calculateLocalCorporateTax(corporateTaxResult.tax);
  
  // 法人住民税
  const inhabitantTax = calculateCorporateInhabitantTax(corporateTaxResult.tax);
  
  // 法人事業税
  const businessTax = calculateBusinessTax(taxableIncome);
  
  // 税金合計
  const totalTax = corporateTaxResult.tax + localCorporateTax + inhabitantTax.total + businessTax;
  
  // 当期純利益
  const netIncome = financialData.incomeBeforeTax - totalTax;
  
  // 実効税率
  const effectiveTaxRate = taxableIncome > 0 ? totalTax / taxableIncome : 0;
  
  return {
    taxableIncome,
    corporateTax: corporateTaxResult.tax,
    corporateTaxBreakdown: corporateTaxResult.breakdown,
    localCorporateTax,
    corporateInhabitantTax: inhabitantTax.total,
    prefecturalTax: inhabitantTax.prefecturalTax,
    municipalTax: inhabitantTax.municipalTax,
    perCapitaLevy: inhabitantTax.perCapitaLevy,
    businessTax,
    totalTax,
    netIncome,
    effectiveTaxRate,
  };
}

/**
 * 消費税を計算（簡易課税を想定）
 */
export function calculateConsumptionTax(
  taxableRevenue: number,
  taxablePurchases: number
): ConsumptionTaxResult {
  const TAX_RATE = 0.10;
  const LOCAL_TAX_RATIO = 22 / 78; // 地方消費税の割合
  
  // 売上に係る消費税
  const outputTax = Math.floor(taxableRevenue * TAX_RATE / (1 + TAX_RATE));
  
  // 仕入に係る消費税
  const inputTax = Math.floor(taxablePurchases * TAX_RATE / (1 + TAX_RATE));
  
  // 納付消費税額（国税分）
  const netConsumptionTax = Math.max(0, outputTax - inputTax);
  
  // 地方消費税
  const localConsumptionTax = Math.floor(netConsumptionTax * LOCAL_TAX_RATIO);
  
  return {
    taxableRevenue,
    taxExemptRevenue: 0,
    taxablePurchases,
    outputTax,
    inputTax,
    netConsumptionTax,
    localConsumptionTax,
    totalConsumptionTax: netConsumptionTax + localConsumptionTax,
  };
}

/**
 * 減価償却費を計算
 */
export function calculateDepreciation(asset: DepreciationAsset): DepreciationResult {
  const {
    acquisitionCost,
    depreciationMethod,
    usefulLife,
    businessRatio,
    currentYearMonths,
  } = asset;

  // 1. 償却率の取得
  let rate = 0;
  if (depreciationMethod === 'lumpSum') {
     // 一括償却資産（3年均等）
     rate = 1 / 3;
  } else if (depreciationMethod === 'immediateSME') {
     // 少額減価償却資産の特例（30万円未満、即時償却）
     rate = 1.0;
  } else if (depreciationMethod === 'leasePeriod') {
     // リース期間定額法
     rate = 1 / usefulLife;
  } else if (depreciationMethod === 'unitsOfProduction') {
     // 生産高比例法
     if (asset.totalEstimatedUnits && asset.totalEstimatedUnits > 0) {
       rate = (asset.currentYearUnits || 0) / asset.totalEstimatedUnits;
     }
  } else if (DEPRECIATION_RATES[usefulLife]) {
    const methods = DEPRECIATION_RATES[usefulLife];
    if (depreciationMethod === 'straightLine' || depreciationMethod === 'decliningBalance') {
      rate = methods[depreciationMethod];
    } else {
      rate = 1 / usefulLife;
    }
  } else {
    rate = 1 / usefulLife;
  }

  // 2. 本年分の償却費計算
  let currentDepreciation = 0;

  if (depreciationMethod === 'lumpSum') {
    currentDepreciation = Math.floor(acquisitionCost * rate);
  } else if (depreciationMethod === 'immediateSME') {
    currentDepreciation = acquisitionCost;
  } else if (depreciationMethod === 'unitsOfProduction') {
    // 生産高比例法：取得価額 × (本年利用量 / 推定総利用量)
    currentDepreciation = Math.floor(acquisitionCost * rate);
  } else if (depreciationMethod === 'straightLine' || depreciationMethod === 'leasePeriod') {
    currentDepreciation = Math.floor(acquisitionCost * rate * (currentYearMonths / 12));
  } else {
    // 定率法
    currentDepreciation = Math.floor(acquisitionCost * rate * (currentYearMonths / 12));
  }

  // 事業専用割合の適用
  currentDepreciation = Math.floor(currentDepreciation * (businessRatio / 100));

  // 3. 期末残高（未償却残高）の計算
  // 簡易的に「取得価額 - 当期償却額」とする（過去分は考慮していないため、運用で調整が必要）
  // ※本来は「期首残高 - 当期償却額」
  const bookValue = Math.max(1, acquisitionCost - currentDepreciation); // 備忘価額1円を残す

  return {
    assetId: asset.id,
    depreciationRate: rate,
    currentDepreciation,
    accumulatedDepreciation: currentDepreciation, // 簡易
    bookValue,
    allowableLimit: currentDepreciation, // 簡易
  };
}

/**
 * 取引データから決算データを生成
 */
export function generateFinancialDataFromTransactions(
  transactions: any[],
  fiscalYear: number
): FinancialData {
  // 該当年度の取引をフィルター
  const yearTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date.getFullYear() === fiscalYear;
  });

  // 収入と経費を集計
  const incomeTransactions = yearTransactions.filter(t => t.type === 'income');
  const expenseTransactions = yearTransactions.filter(t => t.type === 'expense');

  const revenue = incomeTransactions.reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);
  const totalExpenses = expenseTransactions.reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);

  // カテゴリ別経費集計
  const expensesByCategory = Object.entries(
    expenseTransactions.reduce((acc: Record<string, number>, t) => {
      const category = t.category || '未分類';
      acc[category] = (acc[category] || 0) + Math.abs(Number(t.amount) || 0);
      return acc;
    }, {})
  ).map(([category, amount]) => ({
    category,
    amount: amount as number,
  })).sort((a, b) => b.amount - a.amount);

  // 簡易的な損益計算書データを生成
  const grossProfit = revenue;
  const operatingIncome = grossProfit - totalExpenses;
  const ordinaryIncome = operatingIncome;
  const incomeBeforeTax = ordinaryIncome;

  return {
    revenue,
    costOfSales: 0,
    grossProfit,
    operatingExpenses: totalExpenses,
    operatingIncome,
    nonOperatingIncome: 0,
    nonOperatingExpenses: 0,
    ordinaryIncome,
    extraordinaryIncome: 0,
    extraordinaryLoss: 0,
    incomeBeforeTax,
    totalAssets: revenue,
    totalLiabilities: 0,
    netAssets: revenue,
    cash: revenue,
    accountsReceivable: 0,
    inventory: 0,
    fixedAssets: 0,
    accountsPayable: 0,
    shortTermLoans: 0,
    longTermLoans: 0,
    expensesByCategory,
  };
}

/**
 * 金額をフォーマット
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * パーセンテージをフォーマット
 */
export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}
