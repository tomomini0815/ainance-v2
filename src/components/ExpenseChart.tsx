import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Doughnut } from 'react-chartjs-2'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

interface ExpenseChartProps {
  transactions: any[];
}

const ExpenseChart: React.FC<ExpenseChartProps> = ({ transactions }) => {
  const calculateExpenseByCategory = () => {
    const expenseTransactions = transactions.filter(t => t.type === 'expense' && t.approval_status !== 'pending');
    // 保留中は除外
    const categoryTotals: { [key: string]: { amount: number; count: number } } = {};

    expenseTransactions.forEach(transaction => {
      const amount = Math.abs(typeof transaction.amount === 'string' ? parseFloat(transaction.amount) : transaction.amount);
      const category = transaction.category || 'その他';

      if (!categoryTotals[category]) {
        categoryTotals[category] = { amount: 0, count: 0 };
      }
      categoryTotals[category].amount += amount;
      categoryTotals[category].count += 1;
    });

    const totalAmount = Object.values(categoryTotals).reduce((sum, data) => sum + data.amount, 0);

    const percentages: { [key: string]: number } = {};
    Object.keys(categoryTotals).forEach(category => {
      percentages[category] = Math.round((categoryTotals[category].amount / totalAmount) * 100);
    });

    return { categoryTotals, percentages, totalAmount };
  };

  const { percentages, categoryTotals, totalAmount } = calculateExpenseByCategory();

  const labels = Object.keys(percentages);
  const percentageData = Object.values(percentages);
  const amountData = labels.map(label => categoryTotals[label].amount);

  // Ainanceのグラデーションから始まり、青系を中心に展開
  const colorPalette = [
    '#6366f1', // Indigo 500 (Primary)
    '#8b5cf6', // Violet 500 (Secondary)
    '#3b82f6', // Blue 500
    '#0ea5e9', // Sky 500
    '#06b6d4', // Cyan 500
    '#14b8a6', // Teal 500
    '#f59e0b', // Amber 500
    '#f97316', // Orange 500
    '#ef4444', // Red 500
    '#ec4899', // Pink 500
  ];

  const backgroundColors = labels.map((_, index) => colorPalette[index % colorPalette.length]);

  const data = {
    labels: labels,
    datasets: [
      {
        data: percentageData,
        backgroundColor: backgroundColors,
        borderWidth: 0,
        cutout: '75%',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Disable built-in legend to center the chart
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.label || '';
            const amount = amountData[context.dataIndex];
            return `${label}: ${context.parsed}% (${amount.toLocaleString()}円)`;
          },
        },
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#f8fafc',
        bodyColor: '#e2e8f0',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 10,
      },
    },
  }

  return (
    <div className="bg-white dark:bg-surface rounded-2xl p-6 border border-border shadow-sm transition-all duration-200 hover:shadow-md h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-text-main">支出カテゴリ</h3>
        <Link to="/expense-breakdown" className="flex items-center text-sm text-primary hover:text-primary/80 transition-colors">
          詳細を見る
          <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
      </div>

      <div className="chart-container h-64 w-full relative flex-shrink-0">
        <Doughnut data={data} options={options} />
        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-sm text-text-muted">総支出</p>
          <p className="text-2xl font-bold text-text-main">¥{totalAmount.toLocaleString()}</p>
        </div>
      </div>

      <div className="mt-8 flex-1 min-h-0 flex flex-col">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <h4 className="font-bold text-text-main text-sm">カテゴリ別支出内訳</h4>
        </div>

        <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar flex-1 -mr-2">
          <AnimatePresence mode="popLayout">
            {labels.map((label, index) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between group p-3 rounded-xl hover:bg-surface-highlight/80 border border-transparent hover:border-border/50 transition-all duration-300 backdrop-blur-sm"
              >
                <div className="flex items-center min-w-0">
                  <div
                    className="w-2 h-2 rounded-full mr-4 shadow-lg group-hover:scale-125 transition-transform"
                    style={{ backgroundColor: backgroundColors[index] }}
                  ></div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-text-main truncate group-hover:text-primary transition-colors">{label}</span>
                    <span className="text-[10px] text-text-muted">{categoryTotals[label].count || 0}件の取引</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-black text-text-main tracking-tight">¥{amountData[index].toLocaleString()}</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-12 bg-surface-highlight rounded-full h-1 overflow-hidden">
                        <div
                          className="h-full bg-current opacity-80"
                          style={{ width: `${percentageData[index]}%`, color: backgroundColors[index] }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-text-muted">{percentageData[index]}%</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default ExpenseChart