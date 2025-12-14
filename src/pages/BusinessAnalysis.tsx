import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, JapaneseYen, Calendar, Filter, Download, AlertCircle, Loader2, Sparkles, CheckCircle, AlertTriangle, Info, Target, RefreshCw } from 'lucide-react';
import { useTransactions } from '../hooks/useTransactions';
import { useAuth } from '../hooks/useAuth';
import { useBusinessTypeContext } from '../context/BusinessTypeContext';
import { generateBusinessAdvice, isAIEnabled, BusinessAdvice } from '../services/geminiAIService';

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
  const businessType = currentBusinessType?.business_type || 'individual';

  const { transactions, loading } = useTransactions(user?.id, businessType);

  const [period, setPeriod] = useState('yearly');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));

  // 年の選択肢を生成（現在年から過去5年）
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  }, []);

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
    const prevRevenue = prevTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const prevExpense = prevTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const prevProfit = prevRevenue - prevExpense;

    return {
      revenue: calculatePercentageChange(totals.revenue, prevRevenue),
      expense: calculatePercentageChange(totals.expense, prevExpense),
      profit: calculatePercentageChange(totals.profit, prevProfit)
    };
  }, [transactions, totals, period, year, month]);

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
        <div className="flex items-center mb-6">
          <Link to="/dashboard" className="mr-4">
            <ArrowLeft className="w-6 h-6 text-text-muted hover:text-text-main" />
          </Link>
          <h1 className="text-2xl font-bold text-text-main">経営分析</h1>
        </div>

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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-lg font-semibold text-text-main mb-4 md:mb-0">財務状況</h2>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-text-muted mr-2" />
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="px-3 py-1 bg-background border border-border rounded-md text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="monthly">月次</option>
                  <option value="quarterly">四半期</option>
                  <option value="yearly">年次</option>
                </select>
              </div>
              <div className="flex items-center">
                <Filter className="w-4 h-4 text-text-muted mr-2" />
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="px-3 py-1 bg-background border border-border rounded-md text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {yearOptions.map(y => (
                    <option key={y} value={y.toString()}>{y}年</option>
                  ))}
                </select>
              </div>
              {period === 'monthly' && (
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="px-3 py-1 bg-background border border-border rounded-md text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                    <option key={m} value={m.toString().padStart(2, '0')}>{m}月</option>
                  ))}
                </select>
              )}
              <button
                onClick={exportReport}
                className="flex items-center px-3 py-1 bg-surface text-text-main border border-border rounded-md hover:bg-surface-highlight transition-colors text-sm"
              >
                <Download className="w-4 h-4 mr-1" />
                エクスポート
              </button>
            </div>
          </div>

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

        {/* AIアドバイスセクション */}
        <AIAdviceSection
          totals={totals}
          comparison={comparison}
          categoryData={categoryData}
          transactionCount={filteredTransactions.length}
          period={period === 'yearly' ? `${year}年` : `${year}年${month}月`}
        />
      </main>
    </div>
  );
};

// AIアドバイスセクションコンポーネント
const AIAdviceSection: React.FC<{
  totals: { revenue: number; expense: number; profit: number };
  comparison: { revenue: number; expense: number; profit: number };
  categoryData: { income: { category: string; amount: number; percentage: number }[]; expense: { category: string; amount: number; percentage: number }[] };
  transactionCount: number;
  period: string;
}> = ({ totals, comparison, categoryData, transactionCount, period }) => {
  const [advice, setAdvice] = useState<BusinessAdvice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const aiEnabled = isAIEnabled();

  const fetchAdvice = async () => {
    if (!aiEnabled || transactionCount === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await generateBusinessAdvice({
        revenue: totals.revenue,
        expense: totals.expense,
        profit: totals.profit,
        revenueChange: comparison.revenue,
        expenseChange: comparison.expense,
        profitChange: comparison.profit,
        topExpenseCategories: categoryData.expense.slice(0, 5),
        topIncomeCategories: categoryData.income.slice(0, 5),
        transactionCount,
        period
      });

      if (result) {
        setAdvice(result);
      } else {
        setError('アドバイスの生成に失敗しました');
      }
    } catch (err) {
      setError('アドバイスの生成中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const getInsightIcon = (type: 'positive' | 'warning' | 'info') => {
    switch (type) {
      case 'positive':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getInsightBg = (type: 'positive' | 'warning' | 'info') => {
    switch (type) {
      case 'positive':
        return 'bg-green-500/10 border-green-500/20';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/20';
      case 'info':
        return 'bg-blue-500/10 border-blue-500/20';
    }
  };

  if (!aiEnabled) {
    return (
      <div className="mt-6 bg-surface rounded-xl shadow-sm border border-border p-6">
        <div className="flex items-center mb-4">
          <Sparkles className="w-6 h-6 text-purple-500 mr-2" />
          <h2 className="text-lg font-semibold text-text-main">AIアドバイス</h2>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <p className="text-yellow-400 text-sm">
            AIアドバイス機能を使用するには、Gemini API Keyを設定してください。
          </p>
        </div>
      </div>
    );
  }

  if (transactionCount === 0) {
    return (
      <div className="mt-6 bg-surface rounded-xl shadow-sm border border-border p-6">
        <div className="flex items-center mb-4">
          <Sparkles className="w-6 h-6 text-purple-500 mr-2" />
          <h2 className="text-lg font-semibold text-text-main">AIアドバイス</h2>
        </div>
        <p className="text-text-muted text-sm">
          取引データを登録すると、AIがあなたの経営状況を分析してアドバイスを提供します。
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-xl shadow-sm border border-purple-500/20 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Sparkles className="w-6 h-6 text-purple-500 mr-2" />
          <h2 className="text-lg font-semibold text-text-main">AIアドバイス</h2>
          <span className="ml-2 px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full">Gemini AI</span>
        </div>
        <button
          onClick={fetchAdvice}
          disabled={isLoading}
          className="flex items-center px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> 分析中...</>
          ) : (
            <><RefreshCw className="w-4 h-4 mr-1" /> {advice ? '再分析' : 'アドバイスを取得'}</>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {!advice && !isLoading && !error && (
        <p className="text-text-muted text-sm">
          「アドバイスを取得」ボタンをクリックすると、AIがあなたの財務データを分析し、具体的なアドバイスを提供します。
        </p>
      )}

      {advice && (
        <div className="space-y-6">
          {/* サマリー */}
          <div className="bg-surface/50 rounded-lg p-4">
            <p className="text-text-main">{advice.summary}</p>
          </div>

          {/* インサイト */}
          {advice.insights && advice.insights.length > 0 && (
            <div>
              <h3 className="text-md font-medium text-text-main mb-3">📊 分析結果</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {advice.insights.map((insight, index) => (
                  <div key={index} className={`rounded-lg p-3 border ${getInsightBg(insight.type)}`}>
                    <div className="flex items-center mb-1">
                      {getInsightIcon(insight.type)}
                      <span className="ml-2 font-medium text-text-main text-sm">{insight.title}</span>
                    </div>
                    <p className="text-text-muted text-xs">{insight.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 提案 */}
          {advice.recommendations && advice.recommendations.length > 0 && (
            <div>
              <h3 className="text-md font-medium text-text-main mb-3">💡 改善提案</h3>
              <div className="space-y-2">
                {advice.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start bg-surface/50 rounded-lg p-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-sm font-medium mr-3">
                      {index + 1}
                    </span>
                    <p className="text-text-main text-sm">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 目標 */}
          {advice.goals && (
            <div>
              <h3 className="text-md font-medium text-text-main mb-3 flex items-center">
                <Target className="w-5 h-5 text-primary mr-2" />
                目標設定
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-surface/50 rounded-lg p-4 border border-border">
                  <p className="text-xs text-text-muted mb-1">短期目標（1-3ヶ月）</p>
                  <p className="text-text-main text-sm">{advice.goals.shortTerm}</p>
                </div>
                <div className="bg-surface/50 rounded-lg p-4 border border-border">
                  <p className="text-xs text-text-muted mb-1">長期目標（6-12ヶ月）</p>
                  <p className="text-text-main text-sm">{advice.goals.longTerm}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BusinessAnalysis;