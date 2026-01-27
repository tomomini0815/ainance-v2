import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Wallet } from 'lucide-react';
import { Transaction } from '../types/transaction';

interface MoneyFlowCardProps {
    transactions: Transaction[];
}

const MoneyFlowCard: React.FC<MoneyFlowCardProps> = ({ transactions }) => {
    const { income, profit, totalFlow, topExpenses } = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const currentMonthTransactions = transactions.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear && t.approval_status === 'approved';
        });

        const getAmount = (val: string | number) => typeof val === 'number' ? val : parseInt(val) || 0;

        const incomeTotal = currentMonthTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + getAmount(t.amount), 0);

        const expenseTransactions = currentMonthTransactions
            .filter(t => t.type === 'expense');

        const expenseTotal = expenseTransactions
            .reduce((sum, t) => sum + Math.abs(getAmount(t.amount)), 0);

        const profitTotal = incomeTotal - expenseTotal;

        // Group expenses by category for top 3
        const categoryTotals: { [key: string]: number } = {};
        expenseTransactions.forEach(t => {
            const amount = Math.abs(getAmount(t.amount));
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + amount;
        });

        const sortedExpenses = Object.entries(categoryTotals)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([name, amount]) => ({ name, amount }));

        // Add "Other" if there are more
        const top3Total = sortedExpenses.reduce((sum, e) => sum + e.amount, 0);
        const otherTotal = expenseTotal - top3Total;
        if (otherTotal > 0) {
            sortedExpenses.push({ name: 'その他', amount: otherTotal });
        }

        // Total flow volume for visualization scale (Income is usually the max width source)
        // If expense > income (deficit), we scale based on expense.
        const maxVolume = Math.max(incomeTotal, expenseTotal);

        return {
            income: incomeTotal,
            expenses: expenseTotal,
            profit: profitTotal,
            totalFlow: maxVolume || 1, // Avoid divide by zero
            topExpenses: sortedExpenses,
        };
    }, [transactions]);

    // SVG Configuration
    const width = 450;
    const height = 240;
    const sourceY = height / 2;
    const sourceX = 40;
    const targetX = width - 100;

    // Calculate nodes
    const nodes = [];
    let currentY = 40;
    const gap = 30;

    // 1. Profit Node (if positive)
    if (profit > 0) {
        const heightRatio = profit / totalFlow;
        const nodeHeight = Math.max(20, height * heightRatio * 0.8); // Scale height
        nodes.push({
            id: 'profit',
            name: '純利益',
            amount: profit,
            color: '#10b981', // emerald-500
            y: currentY,
            h: nodeHeight,
            type: 'profit'
        });
        currentY += nodeHeight + gap;
    }

    // 2. Expense Nodes
    topExpenses.forEach((exp, i) => {
        const heightRatio = exp.amount / totalFlow;
        const nodeHeight = Math.max(20, height * heightRatio * 0.8);
        // Gradient colors for expenses
        const colors = ['#f43f5e', '#f97316', '#eab308', '#64748b']; // rose, orange, yellow, slate
        nodes.push({
            id: `exp-${i}`,
            name: exp.name,
            amount: exp.amount,
            color: colors[i % colors.length],
            y: currentY,
            h: nodeHeight,
            type: 'expense'
        });
        currentY += nodeHeight + gap;
    });

    // Calculate Income Source Height based on total used height or total flow
    const sourceHeight = Math.max(40, height * (income / totalFlow) * 0.8);


    return (
        <div className="bg-white dark:bg-surface rounded-2xl p-6 border border-border shadow-sm h-full flex flex-col relative overflow-hidden">
            <div className="flex items-center justify-between mb-2 relative z-10">
                <h3 className="text-lg font-bold text-text-main flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Money Flow
                </h3>
                <span className="text-xs text-text-muted bg-surface-highlight px-2 py-1 rounded-full">今月</span>
            </div>

            <div className="flex-1 relative w-full h-full flex items-center justify-center">
                {totalFlow > 1 ? (
                    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
                        <defs>
                            <linearGradient id="gradient-income" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
                            </linearGradient>
                        </defs>

                        {/* Source Node (Income) */}
                        <g transform={`translate(${sourceX}, ${sourceY - sourceHeight / 2})`}>
                            <rect width="12" height={sourceHeight} rx="6" fill="#3b82f6" />
                            <text x="-15" y={sourceHeight / 2} dominantBaseline="middle" textAnchor="end" className="fill-text-main text-xs font-bold font-sans">
                                収入
                            </text>
                            <text x="-15" y={sourceHeight / 2 + 16} dominantBaseline="middle" textAnchor="end" className="fill-text-muted text-[10px] font-sans">
                                ¥{income.toLocaleString()}
                            </text>
                        </g>

                        {/* Flows and Target Nodes */}
                        {nodes.map((node, i) => {
                            // Bezier Curve Logic
                            const startX = sourceX + 12;
                            const startY = sourceY; // All flows start from center of income for simplicity, or we could distribute them
                            // Distributed start Y for better visual (fan out)
                            // Actually, simply center start is fine for a fan-out effect, or simple distribution:
                            // Let's try distributed start Y roughly within source height

                            const endX = targetX;
                            const endY = node.y + node.h / 2;

                            const controlPoint1X = startX + (endX - startX) * 0.5;
                            const controlPoint1Y = startY;
                            const controlPoint2X = startX + (endX - startX) * 0.5;
                            const controlPoint2Y = endY;

                            const pathDefinition = `M ${startX} ${startY} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${endX} ${endY}`;

                            return (
                                <g key={node.id}>
                                    {/* Flow Path */}
                                    <motion.path
                                        d={pathDefinition}
                                        fill="none"
                                        stroke={node.color}
                                        strokeWidth={Math.max(2, node.h * 0.6)} // Thickness based on amount
                                        strokeOpacity="0.2"
                                        initial={{ pathLength: 0, opacity: 0 }}
                                        animate={{ pathLength: 1, opacity: 0.2 }}
                                        transition={{ duration: 1.5, ease: "easeOut", delay: i * 0.2 }}
                                    />

                                    {/* Animated Particle (The "Fluid" effect) */}
                                    <motion.circle r="3" fill={node.color}>
                                        <animateMotion
                                            dur={`${2 + i * 0.5}s`}
                                            repeatCount="indefinite"
                                            path={pathDefinition}
                                        >
                                        </animateMotion>
                                    </motion.circle>

                                    {/* Target Node */}
                                    <g transform={`translate(${targetX}, ${node.y})`}>
                                        <rect width="12" height={node.h} rx="4" fill={node.color} />
                                        <text x="20" y={node.h / 2} dominantBaseline="middle" className="fill-text-main text-xs font-bold font-sans">
                                            {node.name}
                                        </text>
                                        <text x="20" y={node.h / 2 + 14} dominantBaseline="middle" className="fill-text-muted text-[10px] font-sans">
                                            ¥{node.amount.toLocaleString()}
                                        </text>
                                    </g>
                                </g>
                            );
                        })}
                    </svg>
                ) : (
                    <div className="flex flex-col items-center justify-center text-text-muted opacity-50">
                        <Wallet className="w-12 h-12 mb-2" />
                        <p className="text-sm">データがありません</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MoneyFlowCard;
