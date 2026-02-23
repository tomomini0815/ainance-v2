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
  taxOffice?: string;         // 所轄税務署
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
  beginningRetainedEarnings: number; // 期首利益剰余金
  beginningCapital: number;          // 期首資本金
  beginningCash: number;             // 期首現金預金
  beginningReceivable: number;       // 期首売掛金
  beginningInventory: number;        // 期首棚卸資産
  beginningFixedAssets: number;      // 期首固定資産
  beginningPayable: number;          // 期首買掛金
  beginningShortTermLoans: number;   // 期首短期借入金
  beginningLongTermLoans: number;    // 期首長期借入金

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
 * 交際費の損金不算入額を計算
 * 中小法人の場合：年800万円までは損金算入可能
 */
export function calculateEntertainmentAdjustment(
  totalEntertainment: number,
  capital: number
): number {
  const isSmallBusiness = capital <= 100000000;
  if (!isSmallBusiness) {
    // 大法人は原則全額不算入（飲食費の50%を除くが、ここでは簡略化）
    return totalEntertainment;
  }

  const LIMIT = 8000000; // 800万円定額控除制度
  return Math.max(0, totalEntertainment - LIMIT);
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
  // 少額特例（immediateSME）や一括償却（lumpSum）の場合は、全額償却可能なため0円になる
  // 通常の減価償却資産は、備忘価額1円を残す
  let bookValue = acquisitionCost - currentDepreciation;
  if (depreciationMethod !== 'immediateSME' && depreciationMethod !== 'lumpSum') {
    bookValue = Math.max(1, bookValue);
  }
  // 念のためマイナスにならないように
  bookValue = Math.max(0, bookValue);

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
  fiscalYear: number,
  beginningBalances: {
    retainedEarnings?: number;
    capital?: number;
    cash?: number;
    receivable?: number;
    inventory?: number;
    fixedAssets?: number;
    payable?: number;
    shortTermLoans?: number;
    longTermLoans?: number;
  } = {}
): FinancialData {
  // 該当年度の取引をフィルター
  // 減価償却資産（depreciation_asset）は計算の重複を避けるため除外（別ステップで集計）
  const yearTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    const isTargetYear = date.getFullYear() === fiscalYear;
    const isDepreciation = t.tags?.includes('depreciation_asset');
    return isTargetYear && !isDepreciation;
  });

  // 収入と経費を集計
  const incomeTransactions = yearTransactions.filter(t => t.type === 'income');
  const expenseTransactions = yearTransactions.filter(t => t.type === 'expense');

  // 「売上」と「業務委託収入」を本業の売上として集計、それ以外は営業外収益（雑益）として集計
  const revenueTransactions = incomeTransactions.filter(t => t.category === '売上' || t.category === '業務委託収入');
  const nonOperatingIncomeTransactions = incomeTransactions.filter(t => t.category !== '売上' && t.category !== '業務委託収入');

  const revenue = revenueTransactions.reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);
  const nonOperatingIncome = nonOperatingIncomeTransactions.reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);
  
  // 売上原価計上（仕入、外注費などを原価として扱う）
  const costOfSalesTransactions = expenseTransactions.filter(t => 
    t.category === '仕入' || t.category === '外注費' || t.category === '外注工賃'
  );
  const costOfSales = costOfSalesTransactions.reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);

  // 販管費計上（売上原価以外）
  const operatingExpenseTransactions = expenseTransactions.filter(t => 
    t.category !== '仕入' && t.category !== '外注費' && t.category !== '外注工賃'
  );
  const totalOperatingExpenses = operatingExpenseTransactions.reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);

  // 債務（買掛金、借入金など）
  // 注意: 本来は支払・返済 transactions ではなく「未払」の状態を見るべきだが、
  // 現状の簡易帳簿データでは「借入金」などのカテゴリで計上された金額を一旦反映する
  const shortTermLoans = expenseTransactions
    .filter(t => t.category === '借入金' || t.category === '短期借入金')
    .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);
  
  const accountsPayable = expenseTransactions
    .filter(t => t.category === '買掛金' || t.category === '未払金')
    .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);

  const accountsReceivable = incomeTransactions
    .filter(t => t.category === '売掛金' || t.category === '未収金')
    .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);

  // カテゴリ別経費集計（全経費）
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

  // 損益計算書データを生成
  const grossProfit = revenue - costOfSales; 
  const operatingIncome = grossProfit - totalOperatingExpenses; 
  const ordinaryIncome = operatingIncome + nonOperatingIncome; 
  const incomeBeforeTax = ordinaryIncome; 

  // 現金残高（簡易計算：期首残高 + 収入合計 - 支出合計）
  const totalIncome = incomeTransactions.reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);
  const totalOut = expenseTransactions.reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);
  const currentCash = totalIncome - totalOut;
  const cash = Math.max(0, (beginningBalances.cash || 0) + currentCash);

  return {
    revenue,
    costOfSales,
    grossProfit,
    operatingExpenses: totalOperatingExpenses,
    operatingIncome,
    nonOperatingIncome,
    nonOperatingExpenses: 0,
    ordinaryIncome,
    extraordinaryIncome: 0,
    extraordinaryLoss: 0,
    incomeBeforeTax,
    totalAssets: cash + (accountsReceivable + (beginningBalances.receivable || 0)) + (beginningBalances.inventory || 0) + (beginningBalances.fixedAssets || 0),
    totalLiabilities: (accountsPayable + (beginningBalances.payable || 0)) + (shortTermLoans + (beginningBalances.shortTermLoans || 0)) + (beginningBalances.longTermLoans || 0),
    netAssets: (beginningBalances.capital || 0) + (beginningBalances.retainedEarnings || 0) + incomeBeforeTax,
    cash,
    accountsReceivable: accountsReceivable + (beginningBalances.receivable || 0),
    inventory: beginningBalances.inventory || 0,
    fixedAssets: beginningBalances.fixedAssets || 0,
    accountsPayable: accountsPayable + (beginningBalances.payable || 0),
    shortTermLoans: shortTermLoans + (beginningBalances.shortTermLoans || 0),
    longTermLoans: beginningBalances.longTermLoans || 0,
    beginningRetainedEarnings: beginningBalances.retainedEarnings || 0,
    beginningCapital: beginningBalances.capital || 0,
    beginningCash: beginningBalances.cash || 0,
    beginningReceivable: beginningBalances.receivable || 0,
    beginningInventory: beginningBalances.inventory || 0,
    beginningFixedAssets: beginningBalances.fixedAssets || 0,
    beginningPayable: beginningBalances.payable || 0,
    beginningShortTermLoans: beginningBalances.shortTermLoans || 0,
    beginningLongTermLoans: beginningBalances.longTermLoans || 0,
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
/**
 * 取引データから減価償却資産を抽出
 */
export function extractDepreciationAssetsFromTransactions(
  transactions: any[],
  fiscalYear: number
): DepreciationAsset[] {
  return transactions
    .filter(t => t.tags?.includes('depreciation_asset'))
    .map(t => {
      const desc = t.description || '';
      const acqDateMatch = desc.match(/取得日:(\d{4}-\d{2}-\d{2})/);
      const acqCostMatch = desc.match(/取得価額:¥([\d,]+)/);
      const methodMatch = desc.match(/償却方法:(定額法|定率法|一括償却 \(3年\)|少額減価償却資産 \(特例\))/);
      const lifeMatch = desc.match(/耐用年数:(\d+)年/);
      const ratioMatch = desc.match(/事業割合:(\d+)%/);

      const mapping: Record<string, DepreciationAsset['depreciationMethod']> = {
        '定額法': 'straightLine',
        '定率法': 'decliningBalance',
        '一括償却 (3年)': 'lumpSum',
        '少額減価償却資産 (特例)': 'immediateSME'
      };

      // 取得月を計算（計上年度と等しい場合。それ以外は12ヶ月または償却完了の判定が必要だが、
      // 転記時点では「現在の資産状態」を反映するため一旦簡易的に扱う）
      const acqDateStr = acqDateMatch ? acqDateMatch[1] : t.date;
      const acqDate = new Date(acqDateStr);
      const isSameYear = acqDate.getFullYear() === fiscalYear;
      const currentYearMonths = isSameYear ? (12 - acqDate.getMonth()) : 12;

      return {
        id: t.id || Math.random().toString(36).substr(2, 9),
        name: t.item,
        quantity: 1,
        unit: '台',
        acquisitionDate: acqDateStr,
        acquisitionCost: acqCostMatch ? parseInt(acqCostMatch[1].replace(/,/g, ''), 10) : Math.abs(t.amount),
        depreciationMethod: mapping[methodMatch ? methodMatch[1] : '定額法'] || 'straightLine',
        usefulLife: lifeMatch ? parseInt(lifeMatch[1], 10) : 5,
        businessRatio: ratioMatch ? parseInt(ratioMatch[1], 10) : 100,
        currentYearMonths: currentYearMonths
      };
    })
    .filter(asset => {
      // 該当年度以前に取得されたもののみ
      const acqYear = new Date(asset.acquisitionDate).getFullYear();
      return acqYear <= fiscalYear;
    })
    .reduce((unique: DepreciationAsset[], asset) => {
      // 同じ資産名と取得日の組み合わせを重複として排除
      const isDuplicate = unique.some(u => u.name === asset.name && u.acquisitionDate === asset.acquisitionDate);
      if (!isDuplicate) {
        unique.push(asset);
      }
      return unique;
    }, []);
}
