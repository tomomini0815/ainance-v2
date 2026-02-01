import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Filter, Download } from 'lucide-react';
import { useTransactions } from '../hooks/useTransactions';
import { useAuth } from '../hooks/useAuth';
import { useBusinessTypeContext } from '../context/BusinessTypeContext';
import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';
import TransactionIcon from '../components/TransactionIcon';

ChartJS.register(ArcElement, Tooltip, Legend);

const ExpenseCategoryDetailsPage: React.FC = () => {
    const { currentBusinessType } = useBusinessTypeContext();
    const { user } = useAuth();
    const { transactions, loading } = useTransactions(user?.id, currentBusinessType?.business_type);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // Filter only valid expenses
    const expenseTransactions = useMemo(() => {
        return transactions.filter(t =>
            t.type === 'expense' &&
            t.approval_status !== 'pending' &&
            typeof t.amount === 'number' // Ensure valid amount
        );
    }, [transactions]);

    // Calculate Category Data
    const categoryData = useMemo(() => {
        const totals: { [key: string]: number } = {};
        expenseTransactions.forEach(t => {
            const amount = Math.abs(t.amount);
            totals[t.category] = (totals[t.category] || 0) + amount;
        });

        const totalExpense = Object.values(totals).reduce((a, b) => a + b, 0);

        return Object.entries(totals)
            .map(([name, value]) => ({
                name,
                value,
                percentage: totalExpense > 0 ? (value / totalExpense) * 100 : 0
            }))
            .sort((a, b) => b.value - a.value);
    }, [expenseTransactions]);

    // Chart Data
    const chartData = useMemo(() => {
        const colorPalette = [
            '#6366f1', '#8b5cf6', '#3b82f6', '#0ea5e9', '#06b6d4',
            '#14b8a6', '#f59e0b', '#f97316', '#ef4444', '#ec4899',
        ];

        return {
            labels: categoryData.map(c => c.name),
            datasets: [{
                data: categoryData.map(c => c.percentage),
                backgroundColor: categoryData.map((_, i) => colorPalette[i % colorPalette.length]),
                borderWidth: 0,
                cutout: '75%',
            }]
        };
    }, [categoryData]);

    // Filtered Transactions for Table
    const tableTransactions = useMemo(() => {
        if (!selectedCategory) return expenseTransactions;
        return expenseTransactions.filter(t => t.category === selectedCategory);
    }, [expenseTransactions, selectedCategory]);

    const totalAmount = categoryData.reduce((sum, cat) => sum + cat.value, 0);

    return (
        <div className="min-h-screen bg-background pb-20">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link to="/dashboard" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                            <ArrowLeft className="w-6 h-6 text-text-muted" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-text-main">支出カテゴリ詳細</h1>
                            <p className="text-sm text-text-muted">カテゴリ別の支出内訳と詳細分析</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Chart & Category List */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Donut Chart Card */}
                        <div className="bg-white dark:bg-surface p-6 rounded-2xl border border-border shadow-sm">
                            <h3 className="text-lg font-bold text-text-main mb-6">支出構成比</h3>
                            <div className="relative h-64 mb-6">
                                <Doughnut
                                    data={chartData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: { legend: { display: false } },
                                        onClick: (_, elements) => {
                                            if (elements.length > 0) {
                                                const index = elements[0].index;
                                                setSelectedCategory(categoryData[index].name);
                                            }
                                        }
                                    }}
                                />
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <p className="text-sm text-text-muted">総支出</p>
                                    <p className="text-2xl font-bold text-text-main">¥{totalAmount.toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="space-y-3 overflow-y-auto max-h-96 pr-2 custom-scrollbar">
                                <div
                                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${!selectedCategory ? 'bg-primary/10 border border-primary/20' : 'hover:bg-surface-highlight border border-transparent'}`}
                                    onClick={() => setSelectedCategory(null)}
                                >
                                    <span className="font-bold text-text-main text-sm">すべて</span>
                                    <span className="font-bold text-text-main">¥{totalAmount.toLocaleString()}</span>
                                </div>
                                {categoryData.map((cat, i) => (
                                    <div
                                        key={i}
                                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${selectedCategory === cat.name ? 'bg-primary/10 border border-primary/20' : 'hover:bg-surface-highlight border border-transparent'}`}
                                        onClick={() => setSelectedCategory(cat.name === selectedCategory ? null : cat.name)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: chartData.datasets[0].backgroundColor[i] }}></div>
                                            <div className="font-medium text-text-main text-sm">{cat.name}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-text-main">¥{cat.value.toLocaleString()}</div>
                                            <div className="text-xs text-text-muted">{cat.percentage.toFixed(1)}%</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Transaction List */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-border flex justify-between items-center">
                                <h3 className="text-lg font-bold text-text-main">
                                    {selectedCategory ? `${selectedCategory} の取引一覧` : 'すべての支出取引'}
                                </h3>
                                <span className="bg-surface-highlight px-3 py-1 rounded-full text-xs font-medium text-text-muted">
                                    {tableTransactions.length}件
                                </span>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-surface-highlight">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">日付</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">内容</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">カテゴリ</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">金額</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {tableTransactions.map((t) => (
                                            <tr key={t.id} className="hover:bg-surface-highlight transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">
                                                    {new Date(t.date).toLocaleDateString('ja-JP')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <TransactionIcon item={t.item} category={t.category} size="sm" />
                                                        <span className="text-sm font-medium text-text-main">{t.item}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 py-1 text-xs rounded-full bg-surface-highlight text-text-secondary border border-border">
                                                        {t.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-white">
                                                    ¥{Math.abs(t.amount).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                        {tableTransactions.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-12 text-center text-text-muted">
                                                    該当する取引がありません
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ExpenseCategoryDetailsPage;
