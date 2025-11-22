import React from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface RevenueChartProps {
  transactions: any[];
}

const RevenueChart: React.FC<RevenueChartProps> = ({ transactions }) => {
  const calculateMonthlyData = () => {
    const monthlyData: { [key: string]: { revenue: number; expense: number } } = {};

    const months = [];
    const now = new Date();
    const startYear = now.getMonth() >= 2 ? now.getFullYear() : now.getFullYear() - 1;
    const startMonth = now.getMonth() >= 2 ? 2 : 2;

    for (let i = 0; i < 12; i++) {
      const year = startMonth + i <= 11 ? startYear : startYear + 1;
      const month = (startMonth + i) % 12;
      const date = new Date(year, month, 1);
      const monthKey = `${date.getFullYear()}年${date.getMonth() + 1}月`;
      months.push(monthKey);
      monthlyData[monthKey] = { revenue: 0, expense: 0 };
    }

    transactions.forEach(transaction => {
      const amount = typeof transaction.amount === 'string' ? parseFloat(transaction.amount) : transaction.amount;
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}年${date.getMonth() + 1}月`;

      if (monthlyData[monthKey]) {
        if (transaction.type === 'income') {
          monthlyData[monthKey].revenue += amount;
        } else if (transaction.type === 'expense') {
          monthlyData[monthKey].expense += amount;
        }
      }
    });

    const profitData = months.map(month =>
      monthlyData[month].revenue - monthlyData[month].expense
    );

    return {
      labels: months,
      revenue: months.map(month => monthlyData[month].revenue),
      expense: months.map(month => monthlyData[month].expense),
      profit: profitData
    };
  };

  const { labels, revenue, expense, profit } = calculateMonthlyData();

  const totalRevenue = revenue.reduce((sum, amount) => sum + amount, 0);
  const totalExpense = expense.reduce((sum, amount) => sum + amount, 0);
  const totalProfit = totalRevenue - totalExpense;

  const data = {
    labels: labels,
    datasets: [
      {
        label: '収益',
        data: revenue,
        borderColor: '#06b6d4', // Cyan 500
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        tension: 0.4,
        pointBackgroundColor: '#06b6d4',
        pointBorderColor: '#06b6d4',
        pointRadius: 0,
        pointHoverRadius: 6,
        fill: true,
      },
      {
        label: '支出',
        data: expense,
        borderColor: '#f472b6', // Pink 400
        backgroundColor: 'rgba(244, 114, 182, 0.1)',
        tension: 0.4,
        pointBackgroundColor: '#f472b6',
        pointBorderColor: '#f472b6',
        pointRadius: 0,
        pointHoverRadius: 6,
        fill: true,
      },
      {
        label: '利益',
        data: profit,
        borderColor: '#10b981', // Emerald 500
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#10b981',
        pointRadius: 0,
        pointHoverRadius: 6,
        fill: true,
        borderDash: [5, 5],
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          color: '#94a3b8', // Slate 400
          font: {
            size: 12,
            family: 'Inter',
          },
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#f8fafc',
        bodyColor: '#e2e8f0',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toLocaleString() + '円';
            }
            return label;
          }
        }
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#64748b',
          font: {
            size: 11,
          },
        },
      },
      y: {
        display: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#64748b',
          font: {
            size: 11,
          },
          callback: function (value: any) {
            if (value >= 1000000) return value / 1000000 + 'M';
            if (value >= 1000) return value / 1000 + 'k';
            return value;
          },
        },
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-border shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-text-main">収益・支出・利益推移</h3>
        <div className="flex space-x-1 bg-surface-highlight/50 rounded-lg p-1">
          <button className="text-xs bg-primary/20 text-primary px-3 py-1.5 rounded-md font-medium transition-colors">月次</button>
          <button className="text-xs text-text-muted hover:text-text-main px-3 py-1.5 rounded-md transition-colors">四半期</button>
          <button className="text-xs text-text-muted hover:text-text-main px-3 py-1.5 rounded-md transition-colors">年次</button>
        </div>
      </div>

      <div className="chart-container h-72 w-full">
        <Line data={data} options={options} />
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="card-metric border-l-secondary bg-surface p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <p className="text-xs text-text-muted font-medium">総収益</p>
          </div>
          <p className="text-xl font-bold text-text-main mb-1">¥{totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-success flex items-center gap-1">
            <span>↑</span> 12.5% vs 先月
          </p>
        </div>
        <div className="card-metric border-l-accent bg-surface p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
            <p className="text-xs text-text-muted font-medium">総支出</p>
          </div>
          <p className="text-xl font-bold text-text-main mb-1">¥{totalExpense.toLocaleString()}</p>
          <p className="text-xs text-success flex items-center gap-1">
            <span>↓</span> 3.2% vs 先月
          </p>
        </div>
        <div className="card-metric border-l-success bg-surface p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-text-muted font-medium">純利益</p>
          </div>
          <p className="text-xl font-bold text-text-main mb-1">¥{totalProfit.toLocaleString()}</p>
          <p className="text-xs text-success flex items-center gap-1">
            <span>↑</span> 8.7% vs 先月
          </p>
        </div>
      </div>
    </div>
  )
}

export default RevenueChart