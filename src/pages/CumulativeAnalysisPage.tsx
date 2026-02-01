import React, { useMemo, useState } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { useAuth } from '../hooks/useAuth';
import { useBusinessTypeContext } from '../context/BusinessTypeContext';
import { ArrowLeft, Download, Target, TrendingUp, AlertCircle, TrendingDown, History } from 'lucide-react';
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
import { Bar } from 'react-chartjs-2';

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

const CumulativeAnalysisPage: React.FC = () => {
    const { currentBusinessType } = useBusinessTypeContext();
    const { user } = useAuth();
    const { transactions } = useTransactions(user?.id, currentBusinessType?.business_type);

    // Local state for budget (mirroring BudgetControlCard)
    const [budget] = useState<number>(() => {
        const saved = localStorage.getItem('monthly_budget');
        return saved ? parseInt(saved) : 500000;
    });

    const analysis = useMemo(() => {
        const getAmount = (val: any) => {
            if (typeof val === 'number') return Math.abs(val);
            if (typeof val === 'string') return Math.abs(parseInt(val.replace(/,/g, '')) || 0);
            return 0;
        };

        // Filter all expenses across all time
        const allExpenses = transactions.filter(t => {
            const rawAmount = t.amount as any;
            const amountStr = typeof rawAmount === 'string' ? rawAmount : String(rawAmount || 0);
            const amount = parseFloat(amountStr.replace(/,/g, ''));
            const isExpense = t.type === 'expense' || (t.type !== 'income' && amount < 0);
            return isExpense && t.approval_status !== 'rejected';
        });

        const totalExpense = allExpenses.reduce((sum, t) => sum + getAmount(t.amount), 0);

        // Calculate unique months for cumulative budget
        const uniqueMonths = new Set(allExpenses.map(t => {
            const d = new Date(t.date);
            return `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
        }));
        const monthCount = Math.max(1, uniqueMonths.size);
        const cumulativeBudget = budget * monthCount;

        const variance = cumulativeBudget - totalExpense;
        const progress = (totalExpense / cumulativeBudget) * 100;

        // Category Breakdown
        const categoryTotals: { [key: string]: number } = {};
        allExpenses.forEach(t => {
            const amount = getAmount(t.amount);
            const cat = t.category || '未分類';
            categoryTotals[cat] = (categoryTotals[cat] || 0) + amount;
        });

        const categoryColors = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899', '#14b8a6', '#06b6d4'];

        const categories = Object.keys(categoryTotals).map((cat, i) => {
            const amount = categoryTotals[cat];
            // Mock individual category budgets for display consistency
            const averageBudgetPerCat = cumulativeBudget / Math.max(Object.keys(categoryTotals).length, 1);

            return {
                name: cat,
                actual: amount,
                budget: averageBudgetPerCat,
                diff: averageBudgetPerCat - amount,
                color: categoryColors[i % categoryColors.length]
            };
        }).sort((a, b) => b.actual - a.actual);

        return {
            totalExpense,
            cumulativeBudget,
            variance,
            progress,
            categories,
            monthCount
        };
    }, [transactions, budget]);

    const barChartData = {
        labels: analysis.categories.map(c => c.name),
        datasets: [
            {
                label: '累計実績',
                data: analysis.categories.map(c => c.actual),
                backgroundColor: '#10b981',
                borderRadius: 4,
            }
        ],
    };

    const barChartOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
        },
        scales: {
            y: { beginAtZero: true }
        }
    };

    return (
        <div className="min-h-screen pb-20 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="p-2 hover:bg-surface-highlight rounded-full transition-colors border border-border">
                            <ArrowLeft className="w-6 h-6 text-text-muted" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-text-main">累計予算分析レポート</h1>
                            <p className="text-sm text-text-muted">全期間（{analysis.monthCount}ヶ月分）の累計予実状況</p>
                        </div>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-surface border border-border rounded-lg text-sm font-bold text-text-main hover:bg-gray-50 transition-colors shadow-sm">
                        <Download className="w-4 h-4" />
                        レポート出力
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                    <div className="bg-white dark:bg-surface p-3 rounded-xl border border-border shadow-sm">
                        <div className="text-[10px] text-text-muted mb-0.5">累計予算合計</div>
                        <div className="text-lg font-bold text-text-main">{analysis.cumulativeBudget.toLocaleString()}円</div>
                        <div className="mt-1 text-[10px] text-text-muted flex items-center gap-1">
                            <Target className="w-3 h-3" /> {analysis.monthCount}ヶ月分
                        </div>
                    </div>
                    <div className="bg-white dark:bg-surface p-3 rounded-xl border border-border shadow-sm">
                        <div className="text-[10px] text-text-muted mb-0.5">累計支出実績</div>
                        <div className="text-lg font-bold text-emerald-500">{analysis.totalExpense.toLocaleString()}円</div>
                        <div className="mt-1 text-[10px] text-emerald-500/70 font-medium">
                            消化率 {analysis.progress.toFixed(1)}%
                        </div>
                    </div>
                    <div className="bg-white dark:bg-surface p-3 rounded-xl border border-border shadow-sm">
                        <div className="text-[10px] text-text-muted mb-0.5">累計予算残高</div>
                        <div className={`text-lg font-bold ${analysis.variance < 0 ? 'text-red-500' : 'text-green-500'}`}>
                            {Math.abs(analysis.variance).toLocaleString()}円
                        </div>
                        <div className="mt-1 text-[10px] text-text-muted">
                            {analysis.variance < 0 ? '超過' : '残り'}
                        </div>
                    </div>
                    <div className="bg-white dark:bg-surface p-3 rounded-xl border border-border shadow-sm">
                        <div className="text-[10px] text-text-muted mb-0.5">総合状況</div>
                        {analysis.variance >= 0 ? (
                            <div className="flex items-center gap-1.5 text-green-500 mt-0.5">
                                <TrendingUp className="w-5 h-5" />
                                <span className="text-base font-bold">予算内</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 text-red-500 mt-0.5">
                                <AlertCircle className="w-5 h-5" />
                                <span className="text-base font-bold">警告</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="lg:col-span-2 bg-white dark:bg-surface p-6 rounded-2xl border border-border shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-text-main">累計支出内訳（カテゴリ別）</h3>
                            <History className="w-5 h-5 text-text-muted" />
                        </div>
                        <div className="h-80">
                            <Bar data={barChartData} options={barChartOptions} />
                        </div>
                    </div>

                    {/* Breakdown List */}
                    <div className="bg-white dark:bg-surface p-6 rounded-2xl border border-border shadow-sm flex flex-col">
                        <h3 className="text-lg font-bold text-text-main mb-4">累計ランキング</h3>
                        <div className="space-y-4 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                            {analysis.categories.map((cat, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-highlight transition-colors border border-transparent hover:border-border">
                                    <div className="min-w-0">
                                        <div className="font-bold text-text-main text-sm truncate">{cat.name}</div>
                                        <div className="text-[10px] text-text-muted">累計割合</div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <div className="font-bold text-text-main">{cat.actual.toLocaleString()}円</div>
                                        <div className="text-xs text-emerald-500">
                                            {((cat.actual / analysis.totalExpense) * 100).toFixed(1)}%
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tips Card */}
                <div className="bg-primary/5 rounded-2xl p-6 border border-primary/20">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-white dark:bg-surface rounded-xl shadow-sm">
                            <TrendingDown className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-text-main mb-1">累計分析のアドバイス</h4>
                            <p className="text-sm text-text-muted leading-relaxed">
                                全期間（{analysis.monthCount}ヶ月）の累計支出は、月ごとの変動を吸収した長期的な財務健全性を示します。
                                {analysis.variance >= 0
                                    ? `現在、累計予算（${analysis.cumulativeBudget.toLocaleString()}円）に対して${Math.abs(analysis.variance).toLocaleString()}円の余裕があります。長期的な投資や節税対策などを検討する余地があります。`
                                    : `累計予算を${Math.abs(analysis.variance).toLocaleString()}円超過しています。固定費の見直しや、大きな支出が発生した月の原因を特定することで、将来的な改善が期待できます。`}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CumulativeAnalysisPage;
