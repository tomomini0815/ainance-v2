import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, JapaneseYen, Download, AlertCircle, Loader2, RefreshCw, Target, FileText } from 'lucide-react';
import { useTransactions } from '../hooks/useTransactions';
import { useAuth } from '../hooks/useAuth';
import { useBusinessTypeContext } from '../context/BusinessTypeContext';
import { useFiscalYear } from '../context/FiscalYearContext';
// import { generateBusinessAdvice, isAIEnabled, BusinessAdvice } from '../services/geminiAIService';
import { yearlySettlementService, YearlySettlement } from '../services/yearlySettlementService';
import { yearlyBalanceSheetService, YearlyBalanceSheet } from '../services/yearlyBalanceSheetService';
import PreviousYearImportModal from '../components/PreviousYearImportModal';
import BalanceSheetImportModal from '../components/BalanceSheetImportModal';

// 型定義
interface MonthlyData {
  month: string;
  monthKey: string;
  revenue: number;
  expense: number;
  profit: number;
}

interface CategoryData {
  category: string;
  amount: number;
  count: number;
  percentage: number;
}

// 月名を日本語に変換
const getJapaneseMonth = (monthNum: number): string => {
  return `${monthNum}月`;
};

// 既存のインポートに追加
import { FileBarChart } from 'lucide-react';

// ... (既存のコード)

// 勘定科目マッピングヘルパー
const categorizeExpense = (category: string): 'cost_of_sales' | 'operating_expenses' | 'other' => {
  const c = category.trim();
  if (['仕入', '仕入高', '当期商品仕入高', '売上原価', '外注工賃', '外注費'].some(k => c.includes(k))) {
    return 'cost_of_sales';
  }
  return 'operating_expenses';
};

// 金額をフォーマット
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// パーセンテージ変化を計算
const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

const BusinessAnalysis: React.FC = () => {
  const { user } = useAuth();
  const { currentBusinessType } = useBusinessTypeContext();
  const { selectedYear } = useFiscalYear();

  // selectedYearを文字列として扱うためのエイリアス
  const year = selectedYear.toString();

  const businessType = currentBusinessType?.business_type || 'individual';

  const { transactions, loading } = useTransactions(user?.id, businessType);
  const [activeTab, setActiveTab] = useState<'analysis' | 'pl'>('analysis');

  const [period, setPeriod] = useState<'yearly' | 'monthly' | 'quarterly'>('yearly');
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));

  // 前年度決算データの状態
  const [yearlySettlements, setYearlySettlements] = useState<YearlySettlement[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [yearlyBalanceSheets, setYearlyBalanceSheets] = useState<YearlyBalanceSheet[]>([]);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isBSModalOpen, setIsBSModalOpen] = useState(false);

  // 決算データを取得
  const fetchSettlements = React.useCallback(async () => {
    if (user?.id) {
      try {
        const [plData, bsData] = await Promise.all([
          yearlySettlementService.getAllByBusinessType(user.id, businessType),
          yearlyBalanceSheetService.getAllByBusinessType(user.id, businessType)
        ]);
        setYearlySettlements(plData);
        setYearlyBalanceSheets(bsData);
      } catch (error) {
        console.error('Fetch Settlements/BS Error:', error);
      }
    }
  }, [user?.id, businessType]);

  React.useEffect(() => {
    fetchSettlements();
  }, [fetchSettlements]);

  // 期間でフィルタリングされたトランザクション
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const transactionDate = new Date(t.date);
      const transactionYear = transactionDate.getFullYear().toString();
      const transactionMonth = (transactionDate.getMonth() + 1).toString().padStart(2, '0');

      if (period === 'yearly') {
        return transactionYear === year;
      } else if (period === 'monthly') {
        return transactionYear === year && transactionMonth === month;
      } else if (period === 'quarterly') {
        const quarterMonth = Math.floor((transactionDate.getMonth()) / 3) + 1;
        const selectedQuarter = Math.floor((parseInt(month) - 1) / 3) + 1;
        return transactionYear === year && quarterMonth === selectedQuarter;
      }
      return true;
    });
  }, [transactions, period, year, month]);

  // 月次データを計算
  const monthlyData = useMemo((): MonthlyData[] => {
    const dataByMonth: { [key: string]: { revenue: number; expense: number } } = {};

    // 選択年の12ヶ月分を初期化
    for (let i = 1; i <= 12; i++) {
      const monthKey = `${year}-${i.toString().padStart(2, '0')}`;
      dataByMonth[monthKey] = { revenue: 0, expense: 0 };
    }

    // トランザクションを集計
    transactions.forEach(t => {
      const date = new Date(t.date);
      if (date.getFullYear().toString() === year) {
        const monthKey = `${year}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        if (dataByMonth[monthKey]) {
          if (t.type === 'income') {
            dataByMonth[monthKey].revenue += t.amount;
          } else {
            dataByMonth[monthKey].expense += t.amount;
          }
        }
      }
    });

    return Object.entries(dataByMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([monthKey, data]) => ({
        month: getJapaneseMonth(parseInt(monthKey.split('-')[1])),
        monthKey,
        revenue: data.revenue,
        expense: data.expense,
        profit: data.revenue - data.expense
      }));
  }, [transactions, year]);

  // 合計値を計算
  const totals = useMemo(() => {
    const revenue = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      revenue,
      expense,
      profit: revenue - expense
    };
  }, [filteredTransactions]);

  // 前期間との比較を計算
  const comparison = useMemo(() => {
    const getPreviousPeriodTransactions = () => {
      const prevYear = period === 'yearly' ? (parseInt(year) - 1).toString() : year;
      const prevMonth = period === 'monthly'
        ? (parseInt(month) === 1 ? '12' : (parseInt(month) - 1).toString().padStart(2, '0'))
        : month;

      return transactions.filter(t => {
        const transactionDate = new Date(t.date);
        const transactionYear = transactionDate.getFullYear().toString();
        const transactionMonth = (transactionDate.getMonth() + 1).toString().padStart(2, '0');

        if (period === 'yearly') {
          return transactionYear === prevYear;
        } else if (period === 'monthly') {
          const checkYear = parseInt(month) === 1 ? (parseInt(year) - 1).toString() : year;
          return transactionYear === checkYear && transactionMonth === prevMonth;
        }
        return false;
      });
    };

    const prevTransactions = getPreviousPeriodTransactions();
    let prevRevenue = prevTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    let prevExpense = prevTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    // 取引データがない場合、決算データテーブルから補完（年次の時のみ）
    if (period === 'yearly' && prevRevenue === 0 && prevExpense === 0) {
      const prevYear = parseInt(year) - 1;
      const s = yearlySettlements.find(item => item.year === prevYear);
      if (s) {
        prevRevenue = s.revenue;
        prevExpense = s.operating_expenses + s.cost_of_sales;
      }
    }

    const prevProfit = prevRevenue - prevExpense;

    return {
      revenue: calculatePercentageChange(totals.revenue, prevRevenue),
      expense: calculatePercentageChange(totals.expense, prevExpense),
      profit: calculatePercentageChange(totals.profit, prevProfit),
      hasPreviousData: prevRevenue > 0 || prevExpense > 0
    };
  }, [transactions, totals, period, year, month, yearlySettlements]);

  // カテゴリ別データを計算
  const categoryData = useMemo((): { income: CategoryData[]; expense: CategoryData[] } => {
    const incomeByCategory: { [key: string]: { amount: number; count: number } } = {};
    const expenseByCategory: { [key: string]: { amount: number; count: number } } = {};

    filteredTransactions.forEach(t => {
      const category = t.category || 'その他';
      if (t.type === 'income') {
        if (!incomeByCategory[category]) {
          incomeByCategory[category] = { amount: 0, count: 0 };
        }
        incomeByCategory[category].amount += t.amount;
        incomeByCategory[category].count += 1;
      } else {
        if (!expenseByCategory[category]) {
          expenseByCategory[category] = { amount: 0, count: 0 };
        }
        expenseByCategory[category].amount += t.amount;
        expenseByCategory[category].count += 1;
      }
    });

    const processCategory = (data: { [key: string]: { amount: number; count: number } }, total: number): CategoryData[] => {
      return Object.entries(data)
        .map(([category, { amount, count }]) => ({
          category,
          amount,
          count,
          percentage: total > 0 ? (amount / total) * 100 : 0
        }))
        .sort((a, b) => b.amount - a.amount);
    };

    return {
      income: processCategory(incomeByCategory, totals.revenue),
      expense: processCategory(expenseByCategory, totals.expense)
    };
  }, [filteredTransactions, totals]);

  // 推定BSデータの計算 (期首BS + 今期損益)
  const estimatedBS = useMemo(() => {
    // 選択された年度の「前期」のBSを探す
    const prevYear = parseInt(year) - 1;
    const baseBS = yearlyBalanceSheets.find(bs => bs.year === prevYear);

    if (!baseBS) return null;

    const currentProfit = totals.revenue - totals.expense;

    // 単純計算: 現金 ＝ 期首現金 ＋ 売上 ー 経費
    const estimatedCash = baseBS.assets_current_cash + currentProfit;

    // 利益剰余金 ＝ 期首利益剰余金 ＋ 今期利益
    const estimatedRetainedEarnings = baseBS.net_assets_retained_earnings + currentProfit;

    // 資産合計 ＝ 期首資産合計 ＋ 今期利益分（現金増加と仮定）
    const estimatedAssets = baseBS.assets_total + currentProfit;

    // 純資産合計 ＝ 期首純資産合計 ＋ 今期利益
    const estimatedNetAssets = baseBS.net_assets_total + currentProfit;

    // 自己資本比率の計算
    const equityRatio = estimatedAssets > 0 ? (estimatedNetAssets / estimatedAssets) * 100 : 0;
    const prevEquityRatio = baseBS.assets_total > 0 ? (baseBS.net_assets_total / baseBS.assets_total) * 100 : 0;

    return {
      baseYear: prevYear,
      cash: estimatedCash,
      retainedEarnings: estimatedRetainedEarnings,
      assets: estimatedAssets,
      netAssets: estimatedNetAssets,
      equityRatio,
      equityRatioChange: equityRatio - prevEquityRatio,
      cashChange: currentProfit
    };
  }, [yearlyBalanceSheets, year, totals]);

  const exportReport = () => {
    // CSVエクスポートロジック
    const csvContent = [
      ['期間', period === 'yearly' ? `${year}年` : `${year}年${month}月`],
      [''],
      ['サマリー'],
      ['売上高', totals.revenue],
      ['経費', totals.expense],
      ['利益', totals.profit],
      [''],
      ['月次データ'],
      ['月', '売上高', '経費', '利益'],
      ...monthlyData.map(d => [d.month, d.revenue, d.expense, d.profit]),
      [''],
      ['カテゴリ別売上'],
      ['カテゴリ', '金額', '件数', '割合'],
      ...categoryData.income.map(d => [d.category, d.amount, d.count, `${d.percentage.toFixed(1)}%`]),
      [''],
      ['カテゴリ別経費'],
      ['カテゴリ', '金額', '件数', '割合'],
      ...categoryData.expense.map(d => [d.category, d.amount, d.count, `${d.percentage.toFixed(1)}%`])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `経営分析レポート_${year}${period === 'monthly' ? month : ''}.csv`;
    link.click();
  };

  // P&Lデータの計算ロジック
  const plData = useMemo(() => {
    // 今期データの集計
    let currentRevenue = 0;
    let currentCostOfSales = 0;
    let currentOperatingExpenses = 0;
    const currentBreakdown: { [key: string]: number } = {};

    filteredTransactions.forEach(t => {
      // P&Lは基本的に「通期」または「選択月」の概念で計算するが、
      // 決算書プレビューとしては「選択年度の全期間」を集計するのが一般的。
      // ただし、ユーザーが月次フィルタしている場合はその範囲で出すべきか？
      // ここでは「選択年度(year)の全データ」を対象とする（決算書なので）。
      // そのため filteredTransactions ではなく raw transactions から当該年度分を再抽出するか、
      // あるいは filteredTransactions が year でフィルタされていることを前提とする。
      // period state が 'yearly' 以外の場合、filteredTransactions は絞り込まれている。
      // 決算書タブでは常に「通期」で見たいニーズが高いが、四半期決算も見たいかもしれない。
      // ここでは現状の filteredTransactions（画面の期間設定に従う）を使用する。

      const category = t.category || 'その他';
      if (t.type === 'income') {
        currentRevenue += t.amount;
        currentBreakdown[category] = (currentBreakdown[category] || 0) + t.amount;
      } else {
        const expenseType = categorizeExpense(category);
        if (expenseType === 'cost_of_sales') {
          currentCostOfSales += t.amount;
        } else {
          currentOperatingExpenses += t.amount;
        }
        currentBreakdown[category] = (currentBreakdown[category] || 0) + t.amount;
      }
    });

    const currentGrossProfit = currentRevenue - currentCostOfSales;
    const currentOperatingProfit = currentGrossProfit - currentOperatingExpenses;
    // 営業外・特別損益は区分できないため0とする（将来的に拡張）
    const currentOrdinaryProfit = currentOperatingProfit;
    const currentIncomeBeforeTax = currentOrdinaryProfit;
    const currentNetIncome = currentIncomeBeforeTax;

    // 前期データの取得
    const prevYearData = yearlySettlements.find(y => y.year === parseInt(year) - 1);

    return {
      current: {
        revenue: currentRevenue,
        costOfSales: currentCostOfSales,
        grossProfit: currentGrossProfit,
        operatingExpenses: currentOperatingExpenses,
        operatingProfit: currentOperatingProfit,
        ordinaryProfit: currentOrdinaryProfit,
        incomeBeforeTax: currentIncomeBeforeTax,
        netIncome: currentNetIncome,
        breakdown: currentBreakdown
      },
      prev: prevYearData ? {
        revenue: prevYearData.revenue,
        costOfSales: prevYearData.cost_of_sales,
        grossProfit: prevYearData.revenue - prevYearData.cost_of_sales,
        operatingExpenses: prevYearData.operating_expenses,
        operatingProfit: (prevYearData.revenue - prevYearData.cost_of_sales) - prevYearData.operating_expenses,
        ordinaryProfit: prevYearData.income_before_tax,
        incomeBeforeTax: prevYearData.income_before_tax,
        netIncome: prevYearData.net_income
      } : null
    };
  }, [filteredTransactions, yearlySettlements, year]);

  const exportPLCSV = () => {
    const rows = [
      ['項目', '当期金額', '前期金額', '前年比'],
      ['売上高', plData.current.revenue, plData.prev?.revenue || 0, calculatePercentageChange(plData.current.revenue, plData.prev?.revenue || 0).toFixed(1) + '%'],
      ['売上原価', plData.current.costOfSales, plData.prev?.costOfSales || 0, calculatePercentageChange(plData.current.costOfSales, plData.prev?.costOfSales || 0).toFixed(1) + '%'],
      ['売上総利益', plData.current.grossProfit, plData.prev?.grossProfit || 0, calculatePercentageChange(plData.current.grossProfit, plData.prev?.grossProfit || 0).toFixed(1) + '%'],
      ['販売費及び一般管理費', plData.current.operatingExpenses, plData.prev?.operatingExpenses || 0, calculatePercentageChange(plData.current.operatingExpenses, plData.prev?.operatingExpenses || 0).toFixed(1) + '%'],
      ['営業利益', plData.current.operatingProfit, plData.prev?.operatingProfit || 0, calculatePercentageChange(plData.current.operatingProfit, plData.prev?.operatingProfit || 0).toFixed(1) + '%'],
      ['経常利益', plData.current.ordinaryProfit, plData.prev?.ordinaryProfit || 0, calculatePercentageChange(plData.current.ordinaryProfit, plData.prev?.ordinaryProfit || 0).toFixed(1) + '%'],
      ['税引前当期純利益', plData.current.incomeBeforeTax, plData.prev?.incomeBeforeTax || 0, calculatePercentageChange(plData.current.incomeBeforeTax, plData.prev?.incomeBeforeTax || 0).toFixed(1) + '%'],
      ['当期純利益', plData.current.netIncome, plData.prev?.netIncome || 0, calculatePercentageChange(plData.current.netIncome, plData.prev?.netIncome || 0).toFixed(1) + '%'],
    ];

    const csvContent = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `損益計算書_${year}年度.csv`;
    link.click();
  };

  // チャートの最大値を計算
  const chartMax = useMemo(() => {
    const maxRevenue = Math.max(...monthlyData.map(d => d.revenue), 1);
    const maxExpense = Math.max(...monthlyData.map(d => d.expense), 1);
    return Math.max(maxRevenue, maxExpense);
  }, [monthlyData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <p className="mt-4 text-text-muted">データを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link to="/dashboard" className="mr-4">
              <ArrowLeft className="w-6 h-6 text-text-muted hover:text-text-main" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-text-main">
                {activeTab === 'analysis' ? '経営分析' : '決算書プレビュー'}
              </h1>
              <p className="text-text-muted hidden sm:block">
                {activeTab === 'analysis'
                  ? '売上・経費の推移や予実管理を行い、経営判断をサポートします'
                  : '今期の取引実績と前期決算を比較し、着地見込みを確認します'}
              </p>
            </div>
          </div>
          <button
            onClick={activeTab === 'analysis' ? exportReport : exportPLCSV}
            className="flex items-center px-4 py-2 bg-surface text-text-main border border-border rounded-lg hover:bg-surface-highlight transition-colors text-sm font-medium shadow-sm"
          >
            <Download className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">CSV出力</span>
            <span className="sm:hidden">出力</span>
          </button>
        </div>

        {/* タブ切り替え */}
        <div className="bg-surface rounded-xl shadow-sm border border-border mb-6 overflow-hidden">
          <div>
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('analysis')}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-all ${activeTab === 'analysis'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-muted hover:text-text-main'
                  }`}
              >
                <TrendingUp className="mr-2" size={18} />
                <span>経営分析</span>
              </button>
              <button
                onClick={() => setActiveTab('pl')}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-all ${activeTab === 'pl'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-muted hover:text-text-main'
                  }`}
              >
                <FileBarChart className="mr-2" size={18} />
                <span>損益計算書 (P&L)</span>
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'analysis' ? (
          <>
            {/* データがない場合の表示 */}
            {transactions.length === 0 && (
              <div className="bg-surface rounded-xl shadow-sm border border-border p-8 mb-6 text-center">
                <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-text-main mb-2">取引データがありません</h3>
                <p className="text-text-muted mb-4">
                  経営分析を行うには、取引データを登録してください。
                </p>
                <Link
                  to="/receipt-processing"
                  className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  レシートを登録する
                </Link>
              </div>
            )}

            <div className="bg-surface rounded-xl shadow-sm border border-border p-6 mb-6">
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-text-main">財務状況</h2>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-white/5 p-1.5 rounded-lg border border-white/10">
                    <div className="px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-md">
                      <span className="text-sm font-bold text-primary">{year}年度</span>
                    </div>
                    <div className="h-6 w-px bg-white/10 hidden sm:block"></div>
                    <select
                      value={period}
                      onChange={(e) => setPeriod(e.target.value as any)}
                      className="bg-transparent text-sm font-medium text-text-main focus:outline-none cursor-pointer py-1.5 px-1 underline underline-offset-4 decoration-primary/30"
                    >
                      <option value="yearly" className="bg-[#0f172a]">通期</option>
                      <option value="quarterly" className="bg-[#0f172a]">四半期</option>
                      <option value="monthly" className="bg-[#0f172a]">月次</option>
                    </select>
                    {period === 'monthly' && (
                      <select
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        className="px-2 py-1 bg-background border border-border rounded-md text-xs sm:text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                          <option key={m} value={m.toString().padStart(2, '0')}>{m}月</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setIsImportModalOpen(true)}
                    className="flex items-center justify-center px-3 py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg hover:bg-primary/20 transition-colors text-xs sm:text-sm font-medium"
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                    前年度PL取込
                  </button>
                  <button
                    onClick={() => setIsBSModalOpen(true)}
                    className="flex items-center justify-center px-3 py-2 bg-secondary/10 text-secondary border border-secondary/20 rounded-lg hover:bg-secondary/20 transition-colors text-xs sm:text-sm font-medium"
                  >
                    <FileText className="w-3.5 h-3.5 mr-1.5" />
                    貸借対照表取込
                  </button>
                </div>
              </div>

              {/* 推定現在の財務状態 (BS連携時のみ表示) */}
              {estimatedBS && (
                <div className="mb-8 bg-gradient-to-r from-surface-highlight to-surface border border-border rounded-xl p-4 sm:p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="p-1.5 bg-primary/10 rounded-md mr-2">
                        <Target className="w-4 h-4 text-primary" />
                      </div>
                      <h3 className="text-sm font-bold text-text-main">
                        推定現在の財務状態 <span className="text-xs font-normal text-text-muted ml-1">({estimatedBS.baseYear}年度末BS ＋ 今期損益)</span>
                      </h3>
                    </div>
                    <div className="text-xs text-text-muted">
                      自動計算
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] sm:text-xs text-text-muted uppercase tracking-wider">推定残高（現金）</p>
                      <p className="text-lg sm:text-xl font-mono font-bold text-text-main">{formatCurrency(estimatedBS.cash)}</p>
                      <p className={`text-[10px] sm:text-xs flex items-center ${estimatedBS.cashChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {estimatedBS.cashChange >= 0 ? '+' : ''}{formatCurrency(estimatedBS.cashChange)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] sm:text-xs text-text-muted uppercase tracking-wider">推定利益剰余金</p>
                      <p className="text-lg sm:text-xl font-mono font-bold text-text-main">{formatCurrency(estimatedBS.retainedEarnings)}</p>
                      <p className="text-[10px] sm:text-xs text-text-muted">当期純利益を加算</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] sm:text-xs text-text-muted uppercase tracking-wider">自己資本比率</p>
                      <p className="text-lg sm:text-xl font-mono font-bold text-text-main">{estimatedBS.equityRatio.toFixed(1)}%</p>
                      <p className={`text-[10px] sm:text-xs flex items-center ${estimatedBS.equityRatioChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        前期比 {estimatedBS.equityRatioChange >= 0 ? '+' : ''}{estimatedBS.equityRatioChange.toFixed(1)}%
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] sm:text-xs text-text-muted uppercase tracking-wider">推定純資産</p>
                      <p className="text-lg sm:text-xl font-mono font-bold text-text-main">{formatCurrency(estimatedBS.netAssets)}</p>
                      <p className="text-[10px] sm:text-xs text-text-muted">企業の体力(蓄積)</p>
                    </div>
                  </div>
                </div>
              )}

              {/* サマリーカード */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
                <div className="bg-blue-500/10 rounded-lg p-4 sm:p-5 border border-blue-500/20 overflow-hidden">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-500/20 rounded-lg flex-shrink-0">
                      <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                    </div>
                    <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-text-muted">売上高</p>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-text-main truncate">{formatCurrency(totals.revenue)}</p>
                      <p className={`text-xs sm:text-sm flex items-center mt-1 ${comparison.revenue >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {comparison.revenue >= 0 ? <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" /> : <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />}
                        <span className="truncate">前期比 {comparison.revenue >= 0 ? '+' : ''}{comparison.revenue.toFixed(1)}%</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-red-500/10 rounded-lg p-4 sm:p-5 border border-red-500/20 overflow-hidden">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-500/20 rounded-lg flex-shrink-0">
                      <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                    </div>
                    <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-text-muted">経費</p>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-text-main truncate">{formatCurrency(totals.expense)}</p>
                      <p className={`text-xs sm:text-sm flex items-center mt-1 ${comparison.expense <= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {comparison.expense >= 0 ? <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" /> : <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />}
                        <span className="truncate">前期比 {comparison.expense >= 0 ? '+' : ''}{comparison.expense.toFixed(1)}%</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`${totals.profit >= 0 ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'} rounded-lg p-4 sm:p-5 border overflow-hidden`}>
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg flex-shrink-0 ${totals.profit >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                      <JapaneseYen className={`w-5 h-5 sm:w-6 sm:h-6 ${totals.profit >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                    </div>
                    <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-text-muted">利益</p>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-text-main truncate">{formatCurrency(totals.profit)}</p>
                      <p className={`text-xs sm:text-sm flex items-center mt-1 ${comparison.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {comparison.profit >= 0 ? <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" /> : <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />}
                        <span className="truncate">前期比 {comparison.profit >= 0 ? '+' : ''}{comparison.profit.toFixed(1)}%</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 月次チャート */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-surface border border-border rounded-lg p-5">
                  <h3 className="text-lg font-medium text-text-main mb-4">売上推移</h3>
                  <div className="h-64 flex items-end justify-between space-x-1">
                    {monthlyData.map((data, index) => (
                      <div key={index} className="flex flex-col items-center flex-1 group">
                        <div className="relative w-full">
                          <div
                            className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer"
                            style={{ height: `${(data.revenue / chartMax) * 200}px`, minHeight: data.revenue > 0 ? '4px' : '0' }}
                          />
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-highlight px-2 py-1 rounded text-xs text-text-main opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-lg">
                            {formatCurrency(data.revenue)}
                          </div>
                        </div>
                        <p className="text-xs text-text-muted mt-2">{data.month}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-surface border border-border rounded-lg p-5">
                  <h3 className="text-lg font-medium text-text-main mb-4">経費推移</h3>
                  <div className="h-64 flex items-end justify-between space-x-1">
                    {monthlyData.map((data, index) => (
                      <div key={index} className="flex flex-col items-center flex-1 group">
                        <div className="relative w-full">
                          <div
                            className="w-full bg-red-500 rounded-t hover:bg-red-600 transition-colors cursor-pointer"
                            style={{ height: `${(data.expense / chartMax) * 200}px`, minHeight: data.expense > 0 ? '4px' : '0' }}
                          />
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-highlight px-2 py-1 rounded text-xs text-text-main opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-lg">
                            {formatCurrency(data.expense)}
                          </div>
                        </div>
                        <p className="text-xs text-text-muted mt-2">{data.month}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 利益推移 */}
              <div className="mt-6 bg-surface border border-border rounded-lg p-5">
                <h3 className="text-lg font-medium text-text-main mb-4">利益推移</h3>
                <div className="h-64 flex items-end justify-between space-x-1">
                  {monthlyData.map((data, index) => {
                    const maxProfit = Math.max(...monthlyData.map(d => Math.abs(d.profit)), 1);
                    return (
                      <div key={index} className="flex flex-col items-center flex-1 group">
                        <div className="relative w-full">
                          <div
                            className={`w-full rounded-t hover:opacity-75 transition-opacity cursor-pointer ${data.profit >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ height: `${(Math.abs(data.profit) / maxProfit) * 200}px`, minHeight: data.profit !== 0 ? '4px' : '0' }}
                          />
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-highlight px-2 py-1 rounded text-xs text-text-main opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-lg">
                            {formatCurrency(data.profit)}
                          </div>
                        </div>
                        <p className="text-xs text-text-muted mt-2">{data.month}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* カテゴリ別業績 */}
            <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
              <h2 className="text-lg font-semibold text-text-main mb-4">カテゴリ別業績</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 売上カテゴリ */}
                <div>
                  <h3 className="text-md font-medium text-text-main mb-3 flex items-center">
                    <TrendingUp className="w-5 h-5 text-blue-500 mr-2" />
                    売上カテゴリ
                  </h3>
                  {categoryData.income.length > 0 ? (
                    <div className="space-y-3">
                      {categoryData.income.map((cat, index) => (
                        <div key={index} className="bg-surface-highlight rounded-lg p-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-text-main">{cat.category}</span>
                            <span className="text-text-main font-semibold">{formatCurrency(cat.amount)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-background rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-blue-500 h-full rounded-full transition-all duration-300"
                                style={{ width: `${cat.percentage}%` }}
                              />
                            </div>
                            <span className="text-xs text-text-muted w-12 text-right">{cat.percentage.toFixed(1)}%</span>
                          </div>
                          <p className="text-xs text-text-muted mt-1">{cat.count}件</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-text-muted text-sm">売上データがありません</p>
                  )}
                </div>

                {/* 経費カテゴリ */}
                <div>
                  <h3 className="text-md font-medium text-text-main mb-3 flex items-center">
                    <TrendingDown className="w-5 h-5 text-red-500 mr-2" />
                    経費カテゴリ
                  </h3>
                  {categoryData.expense.length > 0 ? (
                    <div className="space-y-3">
                      {categoryData.expense.map((cat, index) => (
                        <div key={index} className="bg-surface-highlight rounded-lg p-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-text-main">{cat.category}</span>
                            <span className="text-text-main font-semibold">{formatCurrency(cat.amount)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-background rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-red-500 h-full rounded-full transition-all duration-300"
                                style={{ width: `${cat.percentage}%` }}
                              />
                            </div>
                            <span className="text-xs text-text-muted w-12 text-right">{cat.percentage.toFixed(1)}%</span>
                          </div>
                          <p className="text-xs text-text-muted mt-1">{cat.count}件</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-text-muted text-sm">経費データがありません</p>
                  )}
                </div>
              </div>
            </div>

            {/* 取引件数サマリー */}
            <div className="mt-6 bg-surface rounded-xl shadow-sm border border-border p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-text-main mb-4">取引サマリー</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="text-center p-3 sm:p-4 bg-surface-highlight rounded-lg overflow-hidden">
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-main truncate">{filteredTransactions.length}</p>
                  <p className="text-xs sm:text-sm text-text-muted">総取引数</p>
                </div>
                <div className="text-center p-3 sm:p-4 bg-surface-highlight rounded-lg overflow-hidden">
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-500 truncate">{filteredTransactions.filter(t => t.type === 'income').length}</p>
                  <p className="text-xs sm:text-sm text-text-muted">売上件数</p>
                </div>
                <div className="text-center p-3 sm:p-4 bg-surface-highlight rounded-lg overflow-hidden">
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-500 truncate">{filteredTransactions.filter(t => t.type === 'expense').length}</p>
                  <p className="text-xs sm:text-sm text-text-muted">経費件数</p>
                </div>
                <div className="text-center p-3 sm:p-4 bg-surface-highlight rounded-lg overflow-hidden">
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-500 truncate">
                    {totals.revenue > 0 ? ((totals.profit / totals.revenue) * 100).toFixed(1) : '0'}%
                  </p>
                  <p className="text-xs sm:text-sm text-text-muted">利益率</p>
                </div>
              </div>
            </div>

            {/* ビジネス成長アドバイスセクション */}
            <BusinessGrowthAdviceSection
              businessType={businessType}
              totals={totals}
              transactionCount={filteredTransactions.length}
            />
          </>
        ) : (
          /* P&L タブの内容 */
          <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-bold text-text-main">
                {year}年度 損益計算書 (プレビュー)
              </h2>
              <p className="text-sm text-text-muted mt-1">
                現在の取引データから算出された見込み決算書です
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-highlight border-b border-border">
                    <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase w-1/3">項目</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase text-right w-1/5">当期金額 ({year})</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase text-right w-1/5">前期金額 ({parseInt(year) - 1})</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase text-right w-1/5">前年比</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {/* 売上高 */}
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-text-main">売上高</td>
                    <td className="px-6 py-4 text-sm font-bold text-text-main text-right">{formatCurrency(plData.current.revenue)}</td>
                    <td className="px-6 py-4 text-sm text-text-muted text-right">{formatCurrency(plData.prev?.revenue || 0)}</td>
                    <td className={`px-6 py-4 text-sm text-right font-medium ${calculatePercentageChange(plData.current.revenue, plData.prev?.revenue || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {calculatePercentageChange(plData.current.revenue, plData.prev?.revenue || 0).toFixed(1)}%
                    </td>
                  </tr>

                  {/* 売上原価 */}
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-sm text-text-main pl-8">売上原価</td>
                    <td className="px-6 py-4 text-sm text-text-main text-right">{formatCurrency(plData.current.costOfSales)}</td>
                    <td className="px-6 py-4 text-sm text-text-muted text-right">{formatCurrency(plData.prev?.costOfSales || 0)}</td>
                    <td className={`px-6 py-4 text-sm text-right font-medium ${calculatePercentageChange(plData.current.costOfSales, plData.prev?.costOfSales || 0) <= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {calculatePercentageChange(plData.current.costOfSales, plData.prev?.costOfSales || 0).toFixed(1)}%
                    </td>
                  </tr>

                  {/* 売上総利益 */}
                  <tr className="bg-surface-highlight/50 font-bold border-t-2 border-border/50">
                    <td className="px-6 py-4 text-sm text-text-main">売上総利益</td>
                    <td className="px-6 py-4 text-sm text-text-main text-right">{formatCurrency(plData.current.grossProfit)}</td>
                    <td className="px-6 py-4 text-sm text-text-muted text-right">{formatCurrency(plData.prev?.grossProfit || 0)}</td>
                    <td className={`px-6 py-4 text-sm text-right font-medium ${calculatePercentageChange(plData.current.grossProfit, plData.prev?.grossProfit || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {calculatePercentageChange(plData.current.grossProfit, plData.prev?.grossProfit || 0).toFixed(1)}%
                    </td>
                  </tr>

                  {/* 販管費 */}
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-sm text-text-main pl-8">販売費及び一般管理費</td>
                    <td className="px-6 py-4 text-sm text-text-main text-right">{formatCurrency(plData.current.operatingExpenses)}</td>
                    <td className="px-6 py-4 text-sm text-text-muted text-right">{formatCurrency(plData.prev?.operatingExpenses || 0)}</td>
                    <td className={`px-6 py-4 text-sm text-right font-medium ${calculatePercentageChange(plData.current.operatingExpenses, plData.prev?.operatingExpenses || 0) <= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {calculatePercentageChange(plData.current.operatingExpenses, plData.prev?.operatingExpenses || 0).toFixed(1)}%
                    </td>
                  </tr>

                  {/* 営業利益 */}
                  <tr className="bg-surface-highlight/50 font-bold border-t-2 border-border/50">
                    <td className="px-6 py-4 text-sm text-text-main">営業利益</td>
                    <td className="px-6 py-4 text-sm text-text-main text-right">{formatCurrency(plData.current.operatingProfit)}</td>
                    <td className="px-6 py-4 text-sm text-text-muted text-right">{formatCurrency(plData.prev?.operatingProfit || 0)}</td>
                    <td className={`px-6 py-4 text-sm text-right font-medium ${calculatePercentageChange(plData.current.operatingProfit, plData.prev?.operatingProfit || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {calculatePercentageChange(plData.current.operatingProfit, plData.prev?.operatingProfit || 0).toFixed(1)}%
                    </td>
                  </tr>

                  {/* 経常利益 (簡易計算: 営業外考慮せず) */}
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-sm text-text-main">経常利益</td>
                    <td className="px-6 py-4 text-sm text-text-main text-right">{formatCurrency(plData.current.ordinaryProfit)}</td>
                    <td className="px-6 py-4 text-sm text-text-muted text-right">{formatCurrency(plData.prev?.ordinaryProfit || 0)}</td>
                    <td className={`px-6 py-4 text-sm text-right font-medium ${calculatePercentageChange(plData.current.ordinaryProfit, plData.prev?.ordinaryProfit || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {calculatePercentageChange(plData.current.ordinaryProfit, plData.prev?.ordinaryProfit || 0).toFixed(1)}%
                    </td>
                  </tr>

                  {/* 税引前当期純利益 */}
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-sm text-text-main">税引前当期純利益</td>
                    <td className="px-6 py-4 text-sm text-text-main text-right">{formatCurrency(plData.current.incomeBeforeTax)}</td>
                    <td className="px-6 py-4 text-sm text-text-muted text-right">{formatCurrency(plData.prev?.incomeBeforeTax || 0)}</td>
                    <td className={`px-6 py-4 text-sm text-right font-medium ${calculatePercentageChange(plData.current.incomeBeforeTax, plData.prev?.incomeBeforeTax || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {calculatePercentageChange(plData.current.incomeBeforeTax, plData.prev?.incomeBeforeTax || 0).toFixed(1)}%
                    </td>
                  </tr>

                  {/* 当期純利益 */}
                  <tr className="bg-primary/5 font-bold border-t-2 border-primary/20">
                    <td className="px-6 py-4 text-base text-text-main">当期純利益</td>
                    <td className="px-6 py-4 text-base text-primary text-right">{formatCurrency(plData.current.netIncome)}</td>
                    <td className="px-6 py-4 text-base text-text-muted text-right">{formatCurrency(plData.prev?.netIncome || 0)}</td>
                    <td className={`px-6 py-4 text-sm text-right font-medium ${calculatePercentageChange(plData.current.netIncome, plData.prev?.netIncome || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {calculatePercentageChange(plData.current.netIncome, plData.prev?.netIncome || 0).toFixed(1)}%
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="p-4 bg-surface-highlight/30 text-xs text-text-muted border-t border-border mt-4">
                ※ 現在の取引データに基づく概算値です。決算整理仕訳や税金計算は含まれていません。
                <br />
                ※ 売上原価は「仕入」「原価」を含むカテゴリを集計し、それ以外を販管費として計算しています。
              </div>
            </div>
          </div>
        )}
      </main>

      {/* インポートモーダル */}
      {user?.id && (
        <PreviousYearImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          userId={user.id}
          businessType={businessType}
          onImportSuccess={fetchSettlements}
        />
      )}

      {user?.id && (
        <BalanceSheetImportModal
          isOpen={isBSModalOpen}
          onClose={() => setIsBSModalOpen(false)}
          userId={user.id}
          businessType={businessType}
          onImportSuccess={fetchSettlements}
        />
      )}
    </div>
  );
};



// ビジネス成長アドバイスセクションコンポーネント
const BusinessGrowthAdviceSection: React.FC<{
  businessType: string;
  totals: { revenue: number; expense: number; profit: number };
  transactionCount: number;
}> = ({ businessType, totals, transactionCount }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // 取引データがない場合は表示しない
  if (transactionCount === 0) {
    return null;
  }

  // 個人事業主向け: 法人化アドバイス
  const incorporationAdvice = {
    title: '法人化のメリット・検討ポイント',
    description: '事業規模の拡大に伴い、法人化を検討してみませんか？',
    benefits: [
      {
        title: '税制面のメリット',
        items: [
          '法人税率は最大23.2%（個人の最高税率45%より低い）',
          '役員報酬として給与所得控除が使える',
          '退職金の損金算入が可能',
          '家族を役員にして所得分散が可能',
        ]
      },
      {
        title: '社会的信用の向上',
        items: [
          '取引先への信用力アップ',
          '金融機関からの融資を受けやすい',
          '採用活動で有利になる',
        ]
      },
      {
        title: '事業継続性',
        items: [
          '法人は永続的に存続可能',
          '事業承継がスムーズ',
          '有限責任で個人資産を保護',
        ]
      }
    ],
    considerations: [
      { label: '法人化の目安年収', value: '所得が800万円〜1,000万円を超える場合' },
      { label: '設立費用', value: '約25万円〜30万円（株式会社の場合）' },
      { label: '維持費用', value: '税理士費用・社会保険料など年間50万円〜' },
      { label: '法人住民税', value: '赤字でも最低7万円/年が必要' },
    ],
    checkPoints: [
      '年間利益が500万円以上ある',
      '今後さらに事業を拡大したい',
      '社会的信用を高めたい',
      '従業員を雇用する予定がある',
      '事業を長期的に継続したい',
    ]
  };

  // 法人向け: 新規法人設立アドバイス
  const multiCompanyAdvice = {
    title: '新規法人設立のメリット・検討ポイント',
    description: '事業の多角化やリスク分散のために、新たな法人設立を検討してみませんか？',
    benefits: [
      {
        title: '節税効果',
        items: [
          '法人ごとに800万円までの軽減税率を適用',
          '中小企業の特例を複数活用',
          '消費税の免税事業者の特例を活用',
          '交際費の損金算入枠を複数確保',
        ]
      },
      {
        title: 'リスク分散',
        items: [
          '事業ごとの責任を分離',
          '一つの事業が不調でも他に影響しにくい',
          '事業売却がしやすい',
        ]
      },
      {
        title: '経営の効率化',
        items: [
          '事業別の収益管理がしやすい',
          '意思決定の迅速化',
          '事業特性に合った運営が可能',
        ]
      }
    ],
    considerations: [
      { label: '持株会社の活用', value: 'グループ全体の経営を効率化' },
      { label: '設立費用', value: '約25万円〜30万円/法人' },
      { label: '管理コスト', value: '法人ごとに決算・申告が必要' },
      { label: '注意点', value: '税務調査でグループ間取引が注目される' },
    ],
    checkPoints: [
      '新しい事業分野への進出を検討している',
      '現在の事業と異なるリスクプロファイルの事業がある',
      '将来的に事業の一部を売却する可能性がある',
      '消費税の免税期間を活用したい',
      '複数の拠点や地域で事業を展開したい',
    ]
  };

  const advice = businessType === 'individual' ? incorporationAdvice : multiCompanyAdvice;
  const iconColor = businessType === 'individual' ? 'text-indigo-500' : 'text-emerald-500';
  const bgGradient = businessType === 'individual'
    ? 'from-indigo-500/10 to-purple-500/10 border-indigo-500/20'
    : 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20';

  return (
    <div className={`mt-6 bg-gradient-to-br ${bgGradient} rounded-xl shadow-sm border p-6`}>
      {/* ヘッダー */}
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <Target className={`w-6 h-6 ${iconColor} mr-2`} />
          <div>
            <h2 className="text-lg font-semibold text-text-main">{advice.title}</h2>
            <p className="text-sm text-text-muted">{advice.description}</p>
          </div>
        </div>
        <button className="p-2 hover:bg-surface-highlight rounded-lg transition-colors">
          {isExpanded ? (
            <ArrowLeft className="w-5 h-5 text-text-muted rotate-90" />
          ) : (
            <ArrowLeft className="w-5 h-5 text-text-muted -rotate-90" />
          )}
        </button>
      </div>

      {/* 展開コンテンツ */}
      {isExpanded && (
        <div className="mt-6 space-y-6">
          {/* 現在の業績サマリー */}
          <div className="bg-surface/50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-text-muted mb-3">📊 あなたの現在の業績</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-text-muted">年間売上</p>
                <p className="text-lg font-bold text-text-main">
                  {formatCurrency(totals.revenue)}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted">年間経費</p>
                <p className="text-lg font-bold text-text-main">
                  {formatCurrency(totals.expense)}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted">年間利益</p>
                <p className={`text-lg font-bold ${totals.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(totals.profit)}
                </p>
              </div>
            </div>
          </div>

          {/* メリット */}
          <div>
            <h3 className="text-md font-medium text-text-main mb-3">✨ 主なメリット</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {advice.benefits.map((benefit, index) => (
                <div key={index} className="bg-surface/50 rounded-lg p-4 border border-border">
                  <h4 className="font-medium text-text-main mb-2">{benefit.title}</h4>
                  <ul className="space-y-1">
                    {benefit.items.map((item, i) => (
                      <li key={i} className="text-xs text-text-muted flex items-start">
                        <span className="text-primary mr-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* 検討ポイント */}
          <div>
            <h3 className="text-md font-medium text-text-main mb-3">📋 検討すべきポイント</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {advice.considerations.map((item, index) => (
                <div key={index} className="bg-surface/50 rounded-lg p-3 border border-border">
                  <p className="text-xs text-text-muted">{item.label}</p>
                  <p className="text-sm font-medium text-text-main mt-1">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* チェックリスト */}
          <div className="bg-surface/50 rounded-lg p-4 border border-border">
            <h3 className="text-md font-medium text-text-main mb-3">
              ✅ {businessType === 'individual' ? '法人化の検討チェックリスト' : '新規法人設立の検討チェックリスト'}
            </h3>
            <p className="text-sm text-text-muted mb-3">
              以下の項目に複数当てはまる場合は、{businessType === 'individual' ? '法人化' : '新規法人設立'}を検討してみましょう。
            </p>
            <div className="space-y-2">
              {advice.checkPoints.map((point, index) => (
                <label key={index} className="flex items-center text-sm text-text-main cursor-pointer hover:bg-surface-highlight p-2 rounded-lg transition-colors">
                  <input type="checkbox" className="w-4 h-4 text-primary rounded mr-3" />
                  {point}
                </label>
              ))}
            </div>
          </div>

          {/* 次のステップ */}
          <div className="bg-primary-light border border-primary/20 rounded-lg p-4">
            <h3 className="text-md font-medium text-text-main mb-2">🚀 次のステップ</h3>
            <p className="text-sm text-text-muted mb-3">
              {businessType === 'individual'
                ? '法人化をご検討の場合は、まず税理士にご相談ください。適切なタイミングと手続きをアドバイスしてもらえます。'
                : '新規法人の設立をご検討の場合は、税理士や司法書士にご相談ください。グループ経営の税務最適化をアドバイスしてもらえます。'
              }
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
            >
              専門家に相談する
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessAnalysis;