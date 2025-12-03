import React from 'react'
import { Doughnut } from 'react-chartjs-2'
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
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const categoryTotals: { [key: string]: number } = {};

    expenseTransactions.forEach(transaction => {
      // 金額を絶対値として計算（支出は正の値として扱う）
      const amount = Math.abs(typeof transaction.amount === 'string' ? parseFloat(transaction.amount) : transaction.amount);

      if (categoryTotals[transaction.category]) {
        categoryTotals[transaction.category] += amount;
      } else {
        categoryTotals[transaction.category] = amount;
      }
    });

    const totalAmount = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);

    const percentages: { [key: string]: number } = {};
    Object.keys(categoryTotals).forEach(category => {
      percentages[category] = Math.round((categoryTotals[category] / totalAmount) * 100);
    });

    return { categoryTotals, percentages, totalAmount };
  };

  const { percentages, categoryTotals, totalAmount } = calculateExpenseByCategory();

  const labels = Object.keys(percentages);
  const percentageData = Object.values(percentages);
  const amountData = Object.values(categoryTotals);

  const colorPalette = [
    '#6366f1', // Indigo 500
    '#8b5cf6', // Violet 500
    '#a855f7', // Purple 500
    '#d946ef', // Fuchsia 500
    '#ec4899', // Pink 500
    '#f43f5e', // Rose 500
    '#06b6d4', // Cyan 500
    '#0ea5e9', // Sky 500
    '#3b82f6', // Blue 500
    '#64748b', // Slate 500
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
        <button className="text-sm text-primary hover:text-primary/80 transition-colors">詳細を見る</button>
      </div>

      <div className="chart-container h-64 w-full relative flex-shrink-0">
        <Doughnut data={data} options={options} />
        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-sm text-text-muted">総支出</p>
          <p className="text-2xl font-bold text-text-main">¥{totalAmount.toLocaleString()}</p>
        </div>
      </div>

      <div className="mt-6 flex-1 min-h-0 flex flex-col">
        <h4 className="font-medium text-text-secondary mb-3 text-sm flex-shrink-0">カテゴリ別支出内訳</h4>
        <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
          {labels.map((label, index) => (
            <div key={label} className="flex items-center justify-between group p-2 rounded-lg hover:bg-surface-highlight transition-colors">
              <div className="flex items-center">
                <div
                  className="w-[9px] h-[9px] rounded-full mr-3 shadow-sm"
                  style={{ backgroundColor: backgroundColors[index] }}
                ></div>
                <span className="text-sm text-text-secondary group-hover:text-text-main transition-colors">{label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-text-muted bg-surface-highlight px-2 py-1 rounded-full">{percentageData[index]}%</span>
                <span className="text-sm font-bold text-text-main">¥{amountData[index].toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ExpenseChart