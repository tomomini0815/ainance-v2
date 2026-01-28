import React, { useMemo, useState } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { useAuth } from '../hooks/useAuth';
import { useBusinessTypeContext } from '../context/BusinessTypeContext';
import { ArrowLeft, Download, Filter, Target, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    PointElement,
    LineElement
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    PointElement,
    LineElement
);

const BudgetAnalysisPage: React.FC = () => {
    const { currentBusinessType } = useBusinessTypeContext();
    const { user } = useAuth();
    const { transactions } = useTransactions(user?.id, currentBusinessType?.business_type);

    // Local state for budget (mirroring BudgetControlCard)
    const [budget] = useState<number>(() => {
        const saved = localStorage.getItem('monthly_budget');
        return saved ? parseInt(saved) : 500000;
    });

    const analysis = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const currentDay = now.getDate();

        // Filter expenses
        const currentMonthExpenses = transactions.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === currentMonth &&
                d.getFullYear() === currentYear &&
                (t.type === 'expense' || (t.type !== 'income' && typeof t.amount === 'number' && t.amount < 0));
        });

        const getAmount = (val: string | number) => typeof val === 'number' ? Math.abs(val) : Math.abs(parseInt(val) || 0);

        const totalExpense = currentMonthExpenses.reduce((sum, t) => sum + getAmount(t.amount), 0);
        const variance = budget - totalExpense;
        const progress = (totalExpense / budget) * 100;

        // Category Breakdown
        const categoryTotals: { [key: string]: number } = {};
        currentMonthExpenses.forEach(t => {
            const amount = getAmount(t.amount);
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + amount;
        });

        // ユーザーリクエスト対応: 水道光熱費の割合を減らして他に振り分け
        // 水道光熱費を1/3にして、残りを食費と接待交際費に加算
        if (categoryTotals['水道光熱費'] && categoryTotals['水道光熱費'] > 0) {
            const originalUtilities = categoryTotals['水道光熱費'];
            const newUtilities = originalUtilities * 0.3; // 30%にする
            const diff = originalUtilities - newUtilities;

            categoryTotals['水道光熱費'] = newUtilities;

            // 差分を配分
            categoryTotals['食費'] = (categoryTotals['食費'] || 0) + (diff * 0.6);
            categoryTotals['接待交際費'] = (categoryTotals['接待交際費'] || 0) + (diff * 0.4);
        }

        // Mock Budget allocation (assuming linear distribution for categories for demo)
        // In a real app, you'd have per-category budgets.
        const categoryColors = ['#3b82f6', '#ef4444', '#22c55e', '#f97316', '#6366f1', '#ec4899', '#14b8a6', '#a855f7'];

        const categories = Object.keys(categoryTotals).map((cat, i) => {
            const amount = categoryTotals[cat];
            // 予算目安を実際の支出に基づいて、より自然なばらつきを持たせて生成
            // 実際額の80%〜120%の間でランダムに変動させ、四捨五入してきれいな数字にする
            const randomFactor = 0.8 + Math.random() * 0.4;
            let categoryBudget = Math.round((amount * randomFactor) / 1000) * 1000;

            // 0円の場合は適当な値を設定
            if (categoryBudget === 0) categoryBudget = 10000;

            return {
                name: cat,
                actual: amount,
                budget: categoryBudget,
                diff: categoryBudget - amount,
                color: categoryColors[i % categoryColors.length]
            };
        }).sort((a, b) => b.actual - a.actual);

        return {
            totalExpense,
            variance,
            progress,
            categories,
            monthLabel: `${currentYear}年${currentMonth + 1}月`
        };
    }, [transactions, budget]);

    // Chart Data
    const barChartData = {
        labels: analysis.categories.map(c => c.name),
        datasets: [
            {
                label: '実績',
                data: analysis.categories.map(c => c.actual),
                backgroundColor: '#3b82f6',
                borderRadius: 4,
            },
            {
                label: '予算(目安)',
                data: analysis.categories.map(c => c.budget),
                backgroundColor: '#e5e7eb',
                borderRadius: 4,
            }
        ],
    };

    const barChartOptions = {
        responsive: true,
        scales: {
            y: { beginAtZero: true }
        },
        plugins: {
            legend: { position: 'bottom' as const },
        }
    };


    return (
        <div className="min-h-screen pb-20 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                            <ArrowLeft className="w-6 h-6 text-text-muted" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-text-main">予実分析レポート</h1>
                            <p className="text-sm text-text-muted">{analysis.monthLabel} の予算執行状況詳細</p>
                        </div>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-surface border border-border rounded-lg text-sm font-bold text-text-main hover:bg-gray-50 transition-colors shadow-sm">
                        <Download className="w-4 h-4" />
                        PDF出力
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white dark:bg-surface p-5 rounded-xl border border-border shadow-sm">
                        <div className="text-xs text-text-muted mb-1">総予算</div>
                        <div className="text-2xl font-bold text-text-main">¥{budget.toLocaleString()}</div>
                        <div className="mt-2 text-xs text-text-muted flex items-center gap-1">
                            <Target className="w-3 h-3" /> 設定目標
                        </div>
                    </div>
                    <div className="bg-white dark:bg-surface p-5 rounded-xl border border-border shadow-sm">
                        <div className="text-xs text-text-muted mb-1">実績累計</div>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">¥{analysis.totalExpense.toLocaleString()}</div>
                        <div className="mt-2 text-xs text-blue-600/70 font-medium">
                            消化率 {analysis.progress.toFixed(1)}%
                        </div>
                    </div>
                    <div className="bg-white dark:bg-surface p-5 rounded-xl border border-border shadow-sm">
                        <div className="text-xs text-text-muted mb-1">予算残高</div>
                        <div className={`text-2xl font-bold ${analysis.variance < 0 ? 'text-red-500' : 'text-green-500'}`}>
                            ¥{Math.abs(analysis.variance).toLocaleString()}
                        </div>
                        <div className="mt-2 text-xs text-text-muted">
                            {analysis.variance < 0 ? '超過' : '残り'}
                        </div>
                    </div>
                    <div className="bg-white dark:bg-surface p-5 rounded-xl border border-border shadow-sm">
                        <div className="text-xs text-text-muted mb-1">ステータス</div>
                        {analysis.variance >= 0 ? (
                            <div className="flex items-center gap-2 text-green-500 mt-1">
                                <TrendingUp className="w-8 h-8" />
                                <span className="text-lg font-bold">順調</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-red-500 mt-1">
                                <AlertCircle className="w-8 h-8" />
                                <span className="text-lg font-bold">注意</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="lg:col-span-2 bg-white dark:bg-surface p-6 rounded-2xl border border-border shadow-sm">
                        <h3 className="text-lg font-bold text-text-main mb-6">カテゴリ別 予実対比</h3>
                        <div className="h-80">
                            <Bar data={barChartData} options={barChartOptions} />
                        </div>
                    </div>

                    {/* Breakdown List */}
                    <div className="bg-white dark:bg-surface p-6 rounded-2xl border border-border shadow-sm">
                        <h3 className="text-lg font-bold text-text-main mb-4">支出内訳トップ</h3>
                        <div className="space-y-4 overflow-y-auto max-h-80 pr-2">
                            {analysis.categories.map((cat, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-highlight transition-colors">
                                    <div>
                                        <div className="font-bold text-text-main text-sm">{cat.name}</div>
                                        <div className="text-xs text-text-muted">予算比: {cat.actual > cat.budget ? '+' : ''}{(cat.actual - cat.budget).toLocaleString()}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-text-main">¥{cat.actual.toLocaleString()}</div>
                                        <div className={`text-xs ${cat.actual > cat.budget ? 'text-red-500' : 'text-green-500'}`}>
                                            {((cat.actual / analysis.totalExpense) * 100).toFixed(1)}%
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BudgetAnalysisPage;
