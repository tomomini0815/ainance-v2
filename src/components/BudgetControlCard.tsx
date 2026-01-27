import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Target, CheckCircle2, Search, ArrowRight, Settings } from 'lucide-react';
import { Transaction } from '../types/transaction';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface BudgetControlCardProps {
    transactions: Transaction[];
}

const BudgetControlCard: React.FC<BudgetControlCardProps> = ({ transactions }) => {
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

    const { totalExpense, projectedExpense, progress, topCategory, chartData, maxY } = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const currentDay = now.getDate();

        const currentMonthExpenses = transactions.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === currentMonth &&
                d.getFullYear() === currentYear &&
                (t.type === 'expense' || (t.type !== 'income' && typeof t.amount === 'number' && t.amount < 0));
        });

        const getAmount = (val: string | number) => typeof val === 'number' ? Math.abs(val) : Math.abs(parseInt(val) || 0);

        const total = currentMonthExpenses.reduce((sum, t) => sum + getAmount(t.amount), 0);

        // Simple linear projection
        const projected = currentDay > 0 ? (total / currentDay) * daysInMonth : total;

        const prog = Math.min((total / budget) * 100, 100);

        // Variance analysis & Chart Data
        const categoryTotals: { [key: string]: number } = {};
        currentMonthExpenses.forEach(t => {
            const amount = getAmount(t.amount);
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + amount;
        });

        const sortedCats = Object.entries(categoryTotals)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 7); // Top 7 for compact chart

        const maxY = sortedCats.length > 0 ? sortedCats[0][1] : 0;
        const top = sortedCats.length > 0 ? { name: sortedCats[0][0], amount: sortedCats[0][1] } : null;

        const data = {
            labels: sortedCats.map(([name]) => name.length > 4 ? name.substring(0, 4) + '..' : name),
            datasets: [
                {
                    label: '実績',
                    data: sortedCats.map(([, amount]) => amount),
                    backgroundColor: '#3b82f6',
                    borderRadius: 4,
                    barThickness: 10,
                },
                {
                    label: '予算目安',
                    data: sortedCats.map(() => budget * 0.15), // Mock budget line
                    backgroundColor: '#e5e7eb',
                    borderRadius: 4,
                    barThickness: 10,
                }
            ]
        };

        return {
            totalExpense: total,
            projectedExpense: projected,
            progress: prog,
            topCategory: top,
            chartData: data,
            maxY
        };
    }, [transactions, budget]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                grid: { display: false },
                ticks: { font: { size: 10 } }
            },
            y: {
                display: false,
                beginAtZero: true,
                suggestedMax: maxY ? maxY * 1.3 : undefined // 30% headroom
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
        <div className="bg-white dark:bg-surface rounded-2xl p-5 border border-border shadow-sm h-full flex flex-col relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-lg">
                        <Target className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-text-main leading-tight">経営管理コックピット</h3>
                        <p className="text-[10px] text-text-muted">リアルタイム予実管理</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-text-muted hover:text-primary transition-colors"
                    title="予算設定"
                >
                    <Settings className="w-4 h-4" />
                </button>
            </div>

            <div className="flex-1 flex flex-col gap-3">
                {/* Budget Progress */}
                <div className="mb-1">
                    <div className="flex justify-between items-end mb-1">
                        <span className="text-xs font-medium text-text-muted">今月の予算 vs 実績</span>
                        <div className="text-right">
                            {isEditing ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        className="w-20 px-1 py-0.5 text-right border rounded text-xs"
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                    />
                                    <button onClick={saveBudget} className="text-xs bg-primary text-white px-2 py-0.5 rounded">保存</button>
                                </div>
                            ) : (
                                <span className="text-sm font-bold text-text-main">¥{budget.toLocaleString()}</span>
                            )}
                        </div>
                    </div>
                    <div className="relative h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${projectedExpense > budget ? 'bg-red-500' : 'bg-primary'
                                }`}
                            style={{ width: `${progress}%` }}
                        />
                        <div
                            className="absolute top-0 bottom-0 w-0.5 bg-black/20 dark:bg-white/50 z-10"
                            style={{ left: `${Math.min((projectedExpense / budget) * 100, 100)}%` }}
                        />
                    </div>
                    <div className="flex justify-between mt-1 text-[10px]">
                        <span className="font-bold text-primary">実績: ¥{totalExpense.toLocaleString()}</span>
                        <span className={`font-bold ${projectedExpense > budget ? 'text-red-500' : 'text-text-muted'}`}>
                            着地予想: ¥{Math.round(projectedExpense).toLocaleString()}
                        </span>
                    </div>
                </div>

                {/* Chart Section */}
                <div className="flex-1 min-h-0 bg-surface-highlight/30 rounded-xl p-3 border border-border/50 flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="text-xs font-bold text-text-main">支出TOP7 カテゴリ予実</h4>
                        <div className="flex gap-2 text-[10px]">
                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-blue-500"></div>実績</div>
                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-gray-300"></div>目安</div>
                        </div>
                    </div>
                    <div className="flex-1 min-h-0 relative">
                        <Bar data={chartData} options={chartOptions} />
                    </div>
                </div>

                {/* Insight & Link */}
                <div className="bg-surface-highlight/50 rounded-lg p-2.5 flex items-center justify-between gap-3 border border-border/50">
                    <div className="flex items-center gap-2 min-w-0">
                        {projectedExpense > budget ? (
                            <Search className="w-4 h-4 text-red-500 shrink-0" />
                        ) : (
                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                        )}
                        <p className="text-xs text-text-main truncate">
                            {projectedExpense > budget
                                ? <span className="font-bold">予算超過注意</span>
                                : <span className="font-bold">予算内順調</span>}
                            <span className="text-text-muted text-[10px] ml-1 hidden sm:inline">
                                {topCategory && `(最大要因: ${topCategory.name})`}
                            </span>
                        </p>
                    </div>
                    <Link to="/budget-analysis" className="flex items-center gap-1 text-[10px] text-primary font-bold hover:underline whitespace-nowrap">
                        詳細 <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default BudgetControlCard;
