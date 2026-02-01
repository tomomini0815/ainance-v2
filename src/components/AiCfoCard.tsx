import React, { useMemo } from 'react';
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, Wallet } from 'lucide-react';
import { Transaction } from '../types/transaction';

interface AiCfoCardProps {
    transactions: Transaction[];
}

const AiCfoCard: React.FC<AiCfoCardProps> = ({ transactions }) => {
    const analysis = useMemo(() => {
        // Current date setup
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Filter transactions for current month
        const currentMonthTransactions = transactions.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear && t.approval_status === 'approved';
        });

        // Helper to safely get amount
        const getAmount = (val: string | number) => typeof val === 'number' ? val : parseInt(val) || 0;

        // Calculate totals
        const income = currentMonthTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + getAmount(t.amount), 0);
        const expense = currentMonthTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Math.abs(getAmount(t.amount)), 0);

        const profit = income - expense;
        const profitMargin = income > 0 ? (profit / income) * 100 : 0;

        // Detect high expense categories
        const categoryTotals: { [key: string]: number } = {};
        currentMonthTransactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                const amount = Math.abs(typeof t.amount === 'number' ? t.amount : parseInt(t.amount));
                categoryTotals[t.category] = (categoryTotals[t.category] || 0) + amount;
            });

        const sortedCategories = Object.entries(categoryTotals).sort(([, a], [, b]) => b - a);
        const topCategory = sortedCategories[0];

        // --- Heuristic Logic for "AI CFO" Advice ---

        // 1. Deficit Warning
        if (profit < 0) {
            return {
                type: 'warning',
                icon: AlertTriangle,
                title: '今月の収支が赤字傾向です',
                message: `現在、支出が収益を上回っています。特に「${topCategory ? topCategory[0] : '諸経費'}」の支出がかさんでいます。来週は支出を抑制しましょう。`,
                color: 'text-red-500',
                bgColor: 'bg-red-500/10',
                borderColor: 'border-red-500/20'
            };
        }

        // 2. High Profitability / Tax Saving
        if (profitMargin > 30 && profit > 500000) {
            return {
                type: 'success',
                icon: TrendingUp,
                title: '高収益を維持しています',
                message: `利益率が${Math.round(profitMargin)}%と非常に好調です。節税対策として、30万円未満の少額減価償却資産の購入や、小規模企業共済への増額を検討しても良い時期です。`,
                color: 'text-emerald-500',
                bgColor: 'bg-emerald-500/10',
                borderColor: 'border-emerald-500/20'
            };
        }

        // 3. Cash Flow / Investment (profit exists but small)
        if (profit > 0) {
            return {
                type: 'info',
                icon: Lightbulb,
                title: '安定した黒字経営です',
                message: `今月は${profit.toLocaleString()}円の黒字見込みです。将来の投資のために、売上の5%を積立口座に回すことを推奨します。`,
                color: 'text-blue-500',
                bgColor: 'bg-blue-500/10',
                borderColor: 'border-blue-500/20'
            };
        }

        // Default (e.g. no data)
        return {
            type: 'neutral',
            icon: Wallet,
            title: 'データが集まり次第、分析を開始します',
            message: '取引データを入力すると、AI CFOがあなたの経営状況を分析し、最適なアドバイスを提供します。',
            color: 'text-gray-500',
            bgColor: 'bg-gray-100 dark:bg-gray-800',
            borderColor: 'border-gray-200 dark:border-gray-700'
        };
    }, [transactions]);

    return (
        <div className={`rounded-2xl p-6 border shadow-sm transition-all duration-200 hover:shadow-md h-full flex flex-col relative overflow-hidden group ${analysis.bgColor} ${analysis.borderColor}`}>
            {/* Background decoration */}
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                <analysis.icon className="w-32 h-32" />
            </div>

            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-white/50 dark:bg-black/20 backdrop-blur-sm shadow-sm`}>
                        <Sparkles className={`w-5 h-5 ${analysis.color}`} />
                    </div>
                    <h3 className="text-lg font-bold text-text-main flex items-center gap-2">
                        AI CFO
                        <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-white/50 dark:bg-black/20 border border-black/5 text-text-muted">Beta</span>
                    </h3>
                </div>
            </div>

            <div className="flex-1 relative z-10 flex flex-col justify-center">
                <h4 className={`text-xl font-bold mb-3 ${analysis.color}`}>
                    {analysis.title}
                </h4>
                <p className="text-text-main/80 leading-relaxed font-medium">
                    {analysis.message}
                </p>

                {/* Action Button (Mock) */}
                <div className="mt-6">
                    <button className={`text-sm font-bold bg-white dark:bg-surface text-text-main px-4 py-2 rounded-lg shadow-sm border border-border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors inline-flex items-center gap-2 group-hover:scale-105 duration-200`}>
                        詳しく見る
                        <TrendingUp className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AiCfoCard;
