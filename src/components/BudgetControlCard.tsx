import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Search, ArrowRight, Settings, TrendingUp, BarChart3, Info, Sparkles, TrendingDown } from 'lucide-react';
import { Transaction } from '../types/transaction';
import { Receipt } from '../services/receiptService';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

interface BudgetControlCardProps {
    transactions: Transaction[];
    receipts?: Receipt[];
}

const BudgetControlCard: React.FC<BudgetControlCardProps> = ({ transactions, receipts = [] }) => {
    const [activeTab, setActiveTab] = useState<'month' | 'total' | 'tax'>('month');
    // Simple budget state (persisted in local storage for demo)
    const [budget, setBudget] = useState<number>(() => {
        const saved = localStorage.getItem('monthly_budget');
        return saved ? parseInt(saved) : 500000; // Default 500k
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(budget.toString());

    const saveBudget = () => {
        const newVal = parseInt(editValue);
        if (!isNaN(newVal)) {
            setBudget(newVal);
            localStorage.setItem('monthly_budget', newVal.toString());
        }
        setIsEditing(false);
    };

    const parseAmount = (val: any): number => {
        if (typeof val === 'number') return val;
        if (typeof val === 'string') {
            const parsed = parseFloat(val.replace(/,/g, ''));
            return isNaN(parsed) ? 0 : parsed;
        }
        if (typeof val === 'object' && val !== null) {
            // Handle structured amount objects (value, amount, or number)
            const objValue = val.value ?? val.amount ?? val.number ?? 0;
            return parseAmount(objValue);
        }
        return 0;
    };

    const getAmount = (val: any) => Math.abs(parseAmount(val));

    // --- Budget Logic ---
    const budgetData = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const currentDay = now.getDate();

        // transactionsから今月の支出を取得（pending含む）
        const currentMonthExpensesFromTx = transactions.filter(t => {
            const d = new Date(t.date);
            const isThisMonth = d.getMonth() === currentMonth && d.getFullYear() === currentYear;

            const amount = parseAmount(t.amount);
            // 支出判定:
            // 1. 明示的に 'expense' である
            // 2. 'income' ではなく、かつ金額が負である、または金額が正でも 'expense' 扱いである場合を考慮
            // ダッシュボードと一貫性を持たせる: typeがない場合、amount > 0 は収入、amount < 0 は支出
            // ただし、多くのレシート等は type='expense' かつ amount > 0 である
            const isExpense = t.type === 'expense' || (t.type !== 'income' && amount < 0);

            return isThisMonth && isExpense && t.approval_status !== 'rejected';
        });

        // receiptsから今月の支出を取得（status='pending'のもの。approvedはtransactions側に移行しているはず）
        const currentMonthExpensesFromReceipts = receipts.filter(r => {
            const d = new Date(r.date);
            const isThisMonth = d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            return isThisMonth && r.status === 'pending';
        }).map(r => ({
            id: r.id || 'temp',
            item: r.merchant,
            amount: r.amount,
            category: r.category,
            date: r.date,
            type: 'expense' as const
        }));

        const allExpenses = [...currentMonthExpensesFromTx, ...currentMonthExpensesFromReceipts];

        const total = allExpenses.reduce((sum, t) => sum + getAmount(t.amount), 0);
        const daysPassed = currentDay || 1;
        const projected = (total / daysPassed) * daysInMonth;
        const progress = Math.min((total / budget) * 100, 100);

        const categoryTotals: { [key: string]: number } = {};
        allExpenses.forEach(t => {
            const amount = getAmount(t.amount);
            const cat = t.category || '未分類';
            categoryTotals[cat] = (categoryTotals[cat] || 0) + amount;
        });

        const sortedCats = Object.entries(categoryTotals)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 7);

        const totalActualSpent = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);
        const budgetEstimates = sortedCats.map(([, amount]) => {
            if (totalActualSpent === 0) return Math.round(budget / Math.max(sortedCats.length, 1));
            return Math.round(budget * (amount / totalActualSpent));
        });

        const chartData = {
            labels: sortedCats.map(([name]) => name),
            datasets: [
                {
                    label: '実績',
                    data: sortedCats.map(([, amount]) => amount),
                    backgroundColor: '#3b82f6',
                    borderRadius: 4,
                    barThickness: 10,
                    maxBarThickness: 12,
                },
                {
                    label: '目安',
                    data: budgetEstimates,
                    backgroundColor: 'rgba(156, 163, 175, 0.3)',
                    borderRadius: 4,
                    barThickness: 10,
                    maxBarThickness: 12,
                }
            ]
        };

        return { total, projected, progress, topCategory: sortedCats[0] ? { name: sortedCats[0][0] } : null, chartData };
    }, [transactions, receipts, budget]);

    // --- All-time Budget Logic ---
    const totalBudgetData = useMemo(() => {
        // 全期間の支出を取得（pending含む）
        const allExpensesFromTx = transactions.filter(t => {
            const amount = parseAmount(t.amount);
            const isExpense = t.type === 'expense' || (t.type !== 'income' && amount < 0);
            return isExpense && t.approval_status !== 'rejected';
        });

        const allExpensesFromReceipts = receipts.filter(r => r.status === 'pending').map(r => ({
            id: r.id || 'temp',
            item: r.merchant,
            amount: r.amount,
            category: r.category,
            date: r.date,
            type: 'expense' as const
        }));

        const allExpensesList = [...allExpensesFromTx, ...allExpensesFromReceipts];
        const total = allExpensesList.reduce((sum, t) => sum + getAmount(t.amount), 0);

        // データのユニークな月数を計算して、予算を倍数にする
        const uniqueMonths = new Set(allExpensesList.map(t => {
            const d = new Date(t.date);
            return `${d.getFullYear()}-${d.getUTCMonth()}`;
        }));
        const monthCount = Math.max(1, uniqueMonths.size);
        const cumulativeBudget = budget * monthCount;

        const progress = Math.min((total / cumulativeBudget) * 100, 100);

        const categoryTotals: { [key: string]: number } = {};
        allExpensesList.forEach(t => {
            const amount = getAmount(t.amount);
            const cat = t.category || '未分類';
            categoryTotals[cat] = (categoryTotals[cat] || 0) + amount;
        });

        const sortedCats = Object.entries(categoryTotals)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 7);

        const chartData = {
            labels: sortedCats.map(([name]) => name),
            datasets: [
                {
                    label: '実績',
                    data: sortedCats.map(([, amount]) => amount),
                    backgroundColor: '#10b981', // 緑色
                    borderRadius: 4,
                    barThickness: 10,
                    maxBarThickness: 12,
                }
            ]
        };

        return { total, cumulativeBudget, progress, topCategory: sortedCats[0] ? { name: sortedCats[0][0] } : null, chartData, monthCount };
    }, [transactions, receipts, budget]);

    // --- Tax Logic ---
    const taxData = useMemo(() => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        const yearTransactions = transactions.filter(t => {
            const d = new Date(t.date);
            return d.getFullYear() === currentYear && t.approval_status !== 'rejected';
        });

        const yearReceipts = receipts.filter(r => {
            const d = new Date(r.date);
            return d.getFullYear() === currentYear && r.status === 'pending';
        });

        const ytdIncome = yearTransactions.filter(t => {
            const amount = parseAmount(t.amount);
            return t.type === 'income' || (t.type !== 'expense' && amount > 0);
        }).reduce((sum, t) => sum + getAmount(t.amount), 0);

        const ytdExpenseFromTx = yearTransactions.filter(t => {
            const amount = parseAmount(t.amount);
            return t.type === 'expense' || (t.type !== 'income' && amount < 0);
        }).reduce((sum, t) => sum + getAmount(t.amount), 0);
        const ytdExpenseFromReceipts = yearReceipts.reduce((sum, r) => sum + getAmount(r.amount), 0);

        const ytdExpense = ytdExpenseFromTx + ytdExpenseFromReceipts;
        const ytdProfit = Math.max(0, ytdIncome - ytdExpense);

        const monthsPassed = currentMonth + 1;
        const projectedAnnualProfit = (ytdProfit / monthsPassed) * 12;

        // Simplified Japanese Tax Estimation (Approximate)
        let incomeTax = 0;
        if (projectedAnnualProfit > 18000000) incomeTax = projectedAnnualProfit * 0.40 - 2796000;
        else if (projectedAnnualProfit > 9000000) incomeTax = projectedAnnualProfit * 0.33 - 1536000;
        else if (projectedAnnualProfit > 6950000) incomeTax = projectedAnnualProfit * 0.23 - 636000;
        else if (projectedAnnualProfit > 3300000) incomeTax = projectedAnnualProfit * 0.20 - 427500;
        else if (projectedAnnualProfit > 1950000) incomeTax = projectedAnnualProfit * 0.10 - 97500;
        else incomeTax = projectedAnnualProfit * 0.05;

        const residentTax = projectedAnnualProfit * 0.10;
        const businessTax = Math.max(0, projectedAnnualProfit - 2900000) * 0.05;
        const healthInsurance = Math.min(projectedAnnualProfit * 0.10, 800000);

        const totalTax = Math.max(0, incomeTax + residentTax + businessTax + healthInsurance);
        const monthlyTaxAru = totalTax / 12;

        const chartData = {
            labels: ['所得税', '住民税', '事業税', '国保'],
            datasets: [{
                data: [incomeTax, residentTax, businessTax, healthInsurance],
                backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
                borderWidth: 0,
            }]
        };

        return { totalTax, monthlyTaxAru, ytdProfit, projectedAnnualProfit, chartData, breakdown: { incomeTax, residentTax, businessTax, healthInsurance } };
    }, [transactions]);

    const chartOptions = {
        indexAxis: 'y' as const,
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: { display: false, grid: { display: false }, border: { display: false } },
            y: {
                grid: { display: false },
                border: { display: false },
                ticks: { font: { size: 9 }, color: '#9ca3af' }
            }
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(0,0,0,0.8)',
                padding: 8,
                cornerRadius: 4,
                titleFont: { size: 10 },
                bodyFont: { size: 10 }
            }
        }
    };

    return (
        <div className="bg-white dark:bg-surface rounded-2xl p-4 border border-border shadow-sm h-full flex flex-col relative overflow-hidden">
            {/* Header & Tabs */}
            <div className="flex flex-col gap-3 mb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-bold text-text-main leading-tight">経営管理コックピット</h3>
                        <p className="text-[10px] text-text-muted">財務状況をリアルタイムに把握</p>
                    </div>
                    {activeTab !== 'tax' && (
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="p-1.5 text-text-muted hover:text-primary transition-colors hover:bg-surface-highlight rounded-lg"
                        >
                            <Settings className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <div className="flex p-1 bg-surface-highlight rounded-xl w-fit">
                    <button
                        onClick={() => setActiveTab('month')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'month'
                            ? 'bg-white dark:bg-surface text-primary shadow-sm'
                            : 'text-text-muted hover:text-text-main'
                            }`}
                    >
                        <BarChart3 className="w-3.5 h-3.5" />
                        今月
                    </button>
                    <button
                        onClick={() => setActiveTab('total')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'total'
                            ? 'bg-white dark:bg-surface text-primary shadow-sm'
                            : 'text-text-muted hover:text-text-main'
                            }`}
                    >
                        <TrendingDown className="w-3.5 h-3.5" />
                        すべて
                    </button>
                    <button
                        onClick={() => setActiveTab('tax')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'tax'
                            ? 'bg-white dark:bg-surface text-primary shadow-sm'
                            : 'text-text-muted hover:text-text-main'
                            }`}
                    >
                        <TrendingUp className="w-3.5 h-3.5" />
                        納税予測
                    </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col gap-3">
                {activeTab === 'month' ? (
                    <>
                        {/* Budget Progress */}
                        <div>
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-xs font-medium text-text-muted">今月の予算進捗</span>
                                <div className="text-right">
                                    {isEditing ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                className="w-20 px-1 py-0.5 text-right border rounded text-xs bg-background"
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                            />
                                            <button onClick={saveBudget} className="text-xs bg-primary text-white border border-primary px-2 py-0.5 rounded">保存</button>
                                        </div>
                                    ) : (
                                        <div className="text-xl font-bold text-text-main">{budget.toLocaleString()}円</div>
                                    )}
                                </div>
                            </div>
                            <div className="relative h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div
                                    className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${budgetData.projected > budget ? 'bg-red-500' : 'bg-primary'
                                        }`}
                                    style={{ width: `${budgetData.progress}%` }}
                                />
                                <div
                                    className="absolute top-0 bottom-0 w-0.5 bg-black/20 dark:bg-white/50 z-10"
                                    style={{ left: `${Math.min((budgetData.projected / budget) * 100, 100)}%` }}
                                />
                            </div>
                            <div className="flex justify-between mt-1 text-[10px]">
                                <span className="font-bold text-primary">支払済: {budgetData.total.toLocaleString()}円</span>
                                <span className={`font-bold ${budgetData.projected > budget ? 'text-red-500' : 'text-text-muted'}`}>
                                    着地: {Math.round(budgetData.projected).toLocaleString()}円
                                </span>
                            </div>
                        </div>

                        {/* Chart Section */}
                        <div className="flex-1 min-h-0 bg-surface-highlight/30 rounded-xl p-3 border border-border/50 flex flex-col">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-[10px] font-bold text-text-main">支出TOPカテゴリ 予実</h4>
                                <div className="flex gap-2 text-[8px]">
                                    <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded bg-blue-500"></div>実績</div>
                                    <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded bg-gray-300"></div>目安</div>
                                </div>
                            </div>
                            <div className="flex-1 min-h-0 relative">
                                <Bar data={budgetData.chartData} options={chartOptions} />
                            </div>
                        </div>
                    </>
                ) : activeTab === 'total' ? (
                    <>
                        {/* Cumulative Budget Progress */}
                        <div>
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-xs font-medium text-text-muted">全期間の累計予実 ({totalBudgetData.monthCount}ヶ月分)</span>
                                <div className="text-right">
                                    <span className="text-base font-bold text-text-main">￥{totalBudgetData.total.toLocaleString()}<span className="text-[10px] text-text-muted font-normal ml-1">/ ￥{totalBudgetData.cumulativeBudget.toLocaleString()}</span></span>
                                </div>
                            </div>
                            <div className="h-1.5 bg-surface-highlight rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-1000 ${totalBudgetData.progress > 90 ? 'bg-red-500' : totalBudgetData.progress > 70 ? 'bg-orange-400' : 'bg-emerald-500'}`}
                                    style={{ width: `${totalBudgetData.progress}%` }}
                                />
                            </div>
                            <div className="flex justify-between mt-1 text-[10px]">
                                <span className="font-bold text-emerald-500">合計支出: {totalBudgetData.total.toLocaleString()}円</span>
                                <span className="font-bold text-text-muted">対象月数: {totalBudgetData.monthCount}ヶ月</span>
                            </div>
                        </div>

                        {/* Chart Section */}
                        <div className="flex-1 min-h-0 bg-surface-highlight/30 rounded-xl p-3 border border-border/50 flex flex-col">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-[10px] font-bold text-text-main">累計支出内訳</h4>
                                <div className="flex gap-2 text-[8px]">
                                    <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded bg-emerald-500"></div>累計実績</div>
                                </div>
                            </div>
                            <div className="flex-1 min-h-0 relative">
                                <Bar data={totalBudgetData.chartData} options={chartOptions} />
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Tax Prediction Header */}
                        <div>
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-xs font-medium text-text-muted">年間納税予測額</span>
                                <div className="text-right">
                                    <div className="text-xl font-bold text-text-main">
                                        <span className="text-xs mr-1">約</span>
                                        {Math.round(taxData.totalTax).toLocaleString()}円
                                    </div>
                                </div>
                            </div>
                            <div className="relative h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex">
                                {taxData.chartData.datasets[0].data.map((val, idx) => (
                                    <div
                                        key={idx}
                                        style={{ width: `${(val / taxData.totalTax) * 100}%`, backgroundColor: taxData.chartData.datasets[0].backgroundColor[idx] }}
                                        className="h-full"
                                    />
                                ))}
                            </div>
                            <div className="flex justify-between mt-1 text-[10px]">
                                <span className="font-bold text-blue-500">所得税: {Math.round(taxData.breakdown.incomeTax).toLocaleString()}円</span>
                                <span className="font-bold text-text-muted">月平均: {Math.round(taxData.monthlyTaxAru).toLocaleString()}円</span>
                            </div>
                        </div>

                        {/* Tax Breakdown Detail */}
                        <div className="flex-1 min-h-0 bg-surface-highlight/30 rounded-xl p-3 border border-border/50 flex flex-col">
                            <h4 className="text-[10px] font-bold text-text-main mb-2">税目別内訳（着地予想）</h4>
                            <div className="space-y-2.5 flex-1 overflow-auto">
                                {[
                                    { label: '所得税', value: taxData.breakdown.incomeTax, color: 'bg-blue-500' },
                                    { label: '住民税', value: taxData.breakdown.residentTax, color: 'bg-emerald-500' },
                                    { label: '個人事業税', value: taxData.breakdown.businessTax, color: 'bg-amber-500' },
                                    { label: '国民健康保険', value: taxData.breakdown.healthInsurance, color: 'bg-purple-500' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
                                            <span className="text-[10px] text-text-main">{item.label}</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-text-main">{Math.round(item.value).toLocaleString()}円</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* Insight & Link */}
                <div className="bg-surface-highlight/50 rounded-lg p-2.5 flex items-center justify-between gap-3 border border-border/50">
                    <div className="flex items-center gap-2 min-w-0">
                        {activeTab === 'month' ? (
                            budgetData.projected > budget ? (
                                <Search className="w-4 h-4 text-red-500 shrink-0" />
                            ) : (
                                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                            )
                        ) : activeTab === 'total' ? (
                            totalBudgetData.progress > 90 ? (
                                <TrendingDown className="w-4 h-4 text-red-500 shrink-0" />
                            ) : (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            )
                        ) : (
                            <Info className="w-4 h-4 text-primary shrink-0" />
                        )}
                        <div className="flex flex-col min-w-0">
                            <p className="text-[10px] text-text-main truncate font-bold">
                                {activeTab === 'month' ? (
                                    budgetData.projected > budget ? "予算超過に注意が必要です" : "予算内で推移しています"
                                ) : activeTab === 'total' ? (
                                    totalBudgetData.progress > 100 ? "累計予算を超過しています" : `${totalBudgetData.monthCount}ヶ月間の累計予算内です`
                                ) : (
                                    `利益: ${Math.round(taxData.ytdProfit).toLocaleString()}円から算出`
                                )}
                            </p>
                            <p className="text-[9px] text-text-muted truncate">
                                {activeTab === 'month' ? (
                                    budgetData.topCategory && `最大支出: ${budgetData.topCategory.name}`
                                ) : activeTab === 'total' ? (
                                    totalBudgetData.topCategory && `累計最大支出: ${totalBudgetData.topCategory.name}`
                                ) : (
                                    `年間納税予測: 約${Math.round(taxData.totalTax).toLocaleString()}円`
                                )}
                            </p>
                        </div>
                    </div>
                    <Link
                        to={activeTab === 'month' ? "/budget-analysis" : activeTab === 'total' ? "/cumulative-analysis" : "/tax-report"}
                        className="flex items-center gap-1 text-[10px] text-primary font-bold hover:underline whitespace-nowrap"
                    >
                        詳細 <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
            </div>
            {/* Real-time sync indicator */}
            {(receipts.length > 0) && (
                <div className="absolute top-0 right-10 flex items-center gap-1 text-[8px] text-text-muted mt-5 animate-pulse">
                    <Sparkles className="w-2.5 h-2.5 text-primary" />
                    <span>リアルタイム同期中</span>
                </div>
            )}
        </div>
    );
};

export default BudgetControlCard;
