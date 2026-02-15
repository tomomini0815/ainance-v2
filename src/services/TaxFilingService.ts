/**
 * 確定申告サポートサービス
 * 取引データから確定申告に必要な情報を計算・生成
 */

// 確定申告の基本データ型
export interface TaxFilingData {
  // 基本情報
  fiscalYear: number;
  businessType: 'individual' | 'corporation';
  
  // 収支データ
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  
  // 経費内訳
  expensesByCategory: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  
  // 控除情報
  deductions: Deduction[];
  totalDeductions: number;
  
  // 税額計算
  taxableIncome: number;
  estimatedTax: number;
  
  // ステータス
  status: 'draft' | 'in_progress' | 'ready' | 'submitted';
}

export interface Deduction {
  id: string;
  type: string;
  name: string;
  amount: number;
  description: string;
  isApplicable: boolean;
  documents?: string[];
}

// 所得税の税率表（2024/2025年度）
const TAX_BRACKETS = [
  { min: 0, max: 1950000, rate: 0.05, deduction: 0 },
  { min: 1950000, max: 3300000, rate: 0.10, deduction: 97500 },
  { min: 3300000, max: 6950000, rate: 0.20, deduction: 427500 },
  { min: 6950000, max: 9000000, rate: 0.23, deduction: 636000 },
  { min: 9000000, max: 18000000, rate: 0.33, deduction: 1536000 },
  { min: 18000000, max: 40000000, rate: 0.40, deduction: 2796000 },
  { min: 40000000, max: Infinity, rate: 0.45, deduction: 4796000 },
];

// 青色申告特別控除
const BLUE_RETURN_DEDUCTION = 650000;

// 基礎控除（2024/2025年度）
const BASIC_DEDUCTION = 480000;

// 利用可能な控除一覧
export const AVAILABLE_DEDUCTIONS: Omit<Deduction, 'id' | 'amount' | 'isApplicable'>[] = [
  {
    type: 'basic',
    name: '基礎控除',
    description: '全ての納税者が受けられる控除（48万円）',
    documents: [],
  },
  {
    type: 'blue_return',
    name: '青色申告特別控除',
    description: '青色申告者が受けられる控除（最大65万円）',
    documents: ['青色申告承認申請書'],
  },
  {
    type: 'medical',
    name: '医療費控除',
    description: '年間10万円を超える医療費の控除',
    documents: ['医療費の領収書', '医療費控除の明細書'],
  },
  {
    type: 'social_insurance',
    name: '社会保険料控除',
    description: '国民健康保険、国民年金などの控除',
    documents: ['社会保険料控除証明書'],
  },
  {
    type: 'small_business_mutual',
    name: '小規模企業共済等掛金控除',
    description: '小規模企業共済やiDeCoの掛金控除',
    documents: ['掛金払込証明書'],
  },
  {
    type: 'life_insurance',
    name: '生命保険料控除',
    description: '生命保険料の控除（最大12万円）',
    documents: ['生命保険料控除証明書'],
  },
  {
    type: 'earthquake_insurance',
    name: '地震保険料控除',
    description: '地震保険料の控除（最大5万円）',
    documents: ['地震保険料控除証明書'],
  },
  {
    type: 'spouse',
    name: '配偶者控除',
    description: '配偶者の所得に応じた控除',
    documents: [],
  },
  {
    type: 'dependent',
    name: '扶養控除',
    description: '扶養親族に応じた控除',
    documents: [],
  },
  {
    type: 'furusato',
    name: 'ふるさと納税（寄附金控除）',
    description: 'ふるさと納税による寄附金控除',
    documents: ['寄附金受領証明書'],
  },
  {
    type: 'housing_loan',
    name: '住宅ローン控除',
    description: '住宅ローンの年末残高に応じた控除',
    documents: ['住宅借入金等特別控除証明書', '年末残高証明書'],
  },
];

// 取引データから確定申告データを計算
export const calculateTaxFilingData = (
  transactions: any[],
  fiscalYear: number,
  businessType: 'individual' | 'corporation' = 'individual',
  deductions: Deduction[] = []
): TaxFilingData => {
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

  const totalRevenue = incomeTransactions.reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);
  const totalExpenses = expenseTransactions.reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);
  const netIncome = totalRevenue - totalExpenses;

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
    percentage: totalExpenses > 0 ? ((amount as number) / totalExpenses) * 100 : 0,
  })).sort((a, b) => b.amount - a.amount);

  // 控除合計
  const totalDeductions = deductions
    .filter(d => d.isApplicable)
    .reduce((sum, d) => sum + d.amount, 0);

  // 課税所得 (所得税法では1,000円未満を切り捨て)
  const taxableIncome = Math.max(0, Math.floor((netIncome - totalDeductions) / 1000) * 1000);

  // 所得税計算
  const estimatedTax = calculateIncomeTax(taxableIncome);

  return {
    fiscalYear,
    businessType,
    totalRevenue,
    totalExpenses,
    netIncome,
    expensesByCategory,
    deductions,
    totalDeductions,
    taxableIncome,
    estimatedTax,
    status: 'draft',
  };
};

// 所得税を計算
export const calculateIncomeTax = (taxableIncome: number): number => {
  for (const bracket of TAX_BRACKETS) {
    if (taxableIncome <= bracket.max) {
      return Math.floor(taxableIncome * bracket.rate - bracket.deduction);
    }
  }
  return 0;
};

// 初期控除を生成
export const generateInitialDeductions = (
  hasBlueReturn: boolean = true
): Deduction[] => {
  const deductions: Deduction[] = [
    {
      id: 'basic',
      type: 'basic',
      name: '基礎控除',
      amount: BASIC_DEDUCTION,
      description: '全ての納税者が受けられる控除',
      isApplicable: true,
    },
  ];

  if (hasBlueReturn) {
    deductions.push({
      id: 'blue_return',
      type: 'blue_return',
      name: '青色申告特別控除',
      amount: BLUE_RETURN_DEDUCTION,
      description: '電子申告で最大65万円控除',
      isApplicable: true,
    });
  }

  return deductions;
};

// AIによる控除提案を取得
export const getAIDeductionSuggestions = async (
  taxData: TaxFilingData,
  _userAnswers?: Record<string, any>
): Promise<{ suggestions: string[]; estimatedSavings: number }> => {
  // デフォルトの提案を返す（AIは別途対応）
  const suggestions: string[] = [];
  
  // 青色申告の提案
  if (!taxData.deductions.find(d => d.type === 'blue_return')) {
    suggestions.push('青色申告特別控除（65万円）の適用をご検討ください');
  }
  
  // 経費が少ない場合
  if (taxData.totalRevenue > 0 && taxData.totalExpenses / taxData.totalRevenue < 0.3) {
    suggestions.push('経費率が低めです。経費として計上できる支出がないか確認してみましょう');
  }
  
  // 課税所得に応じた提案
  if (taxData.taxableIncome > 3300000) {
    suggestions.push('小規模企業共済やiDeCoへの加入で節税効果が期待できます');
  }
  
  suggestions.push('ふるさと納税で節税しながら地域貢献ができます');
  suggestions.push('経費の領収書は7年間保管が必要です');
  
  return {
    suggestions,
    estimatedSavings: Math.round(taxData.estimatedTax * 0.1),
  };
};

// 金額をフォーマット
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    maximumFractionDigits: 0,
  }).format(amount);
};

// パーセンテージをフォーマット
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

import { TaxReturnInputData } from '../types/taxReturnInput';
import { JpTaxFormData } from './pdfJapaneseService';

// 手動入力データをPDF生成用データ形式に変換・マージ
export const mergeTaxData = (
  autoData: TaxFilingData,
  manualData: TaxReturnInputData
): JpTaxFormData => {
  // 基本データ
  const base: JpTaxFormData = {
    fiscalYear: autoData.fiscalYear,
    businessType: autoData.businessType,
    revenue: autoData.totalRevenue,
    expenses: autoData.totalExpenses,
    netIncome: autoData.netIncome,
    expensesByCategory: autoData.expensesByCategory,
    taxableIncome: autoData.taxableIncome,
    estimatedTax: autoData.estimatedTax,
    // 以下、手動データで上書きまたは補完
    deductions: {
      basic: manualData.deductions.basic,
      blueReturn: manualData.deductions.basic, // TODO: 青色申告特別控除のフィールド確認
      socialInsurance: manualData.deductions.social_insurance,
      lifeInsurance: manualData.deductions.life_insurance,
    }
  };

  // 手動入力の収入が0でなければ、自動計算の結果に加算するか、あるいは手動入力を優先するか
  // ここでは「事業所得(営業)以外」は手動入力から追加する形にする
  // 事業所得自体のオーバーライドが必要な場合は、manualDataにフラグが必要かもしれないが、
  // 現状は「取引データからの集計」を正とする運用を想定し、他所得を加算する
  
  // 青色申告決算書用データ（B/Sなど）
  // JpTaxFormData型を拡張して、詳細データを渡せるようにする
  return {
    ...base,
    // 拡張フィールド（pdfJapaneseService側で型定義更新が必要）
    manualData: manualData
  } as JpTaxFormData & { manualData: TaxReturnInputData };
};
