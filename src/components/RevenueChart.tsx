import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
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
import { Calendar, PieChart, Activity } from 'lucide-react'

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

type Period = 'monthly' | 'quarterly' | 'yearly';

const RevenueChart: React.FC<RevenueChartProps> = ({ transactions }) => {
  const [period, setPeriod] = useState<Period>('monthly');

  const chartData = useMemo(() => {
    const data: { [key: string]: { revenue: number; expense: number; count: number } } = {};
    let labels: string[] = [];

    const now = new Date();
    const currentYear = now.getFullYear();

    if (period === 'monthly') {
      // 過去13ヶ月 (前年同月を含むため)
      // 今日が2026年1月の場合、2025年1月〜2026年1月を表示
      const startYear = now.getMonth() >= 12 ? currentYear : currentYear - 1;
      const startMonth = now.getMonth(); // 現在の月に合わせる。12ヶ月前 = 同じ月

      for (let i = 0; i < 13; i++) {
        const d = new Date(startYear, startMonth + i, 1);
        const key = `${d.getFullYear()}年${d.getMonth() + 1}月`;
        labels.push(key);
        data[key] = { revenue: 0, expense: 0, count: 0 };
      }
    } else if (period === 'quarterly') {
      // 過去4四半期 (例: 2024 Q1, 2024 Q2...)
      // 現在の四半期を含めて過去4つ
      const currentQ = Math.floor(now.getMonth() / 3) + 1;

      for (let i = 3; i >= 0; i--) {
        let y = currentYear;
        let q = currentQ - i;
        if (q <= 0) {
          y -= 1;
          q += 4;
        }
        const key = `${y}年 Q${q}`;
        labels.push(key);
        data[key] = { revenue: 0, expense: 0, count: 0 };
      }
    } else if (period === 'yearly') {
      // 過去5年
      for (let i = 4; i >= 0; i--) {
        const y = currentYear - i;
        const key = `${y}年`;
        labels.push(key);
        data[key] = { revenue: 0, expense: 0, count: 0 };
      }
    }

    // トランザクション集計
    transactions.forEach(transaction => {
      // 集計対象のフィルタリング（必要に応じて拡張）

      const amount = typeof transaction.amount === 'string' ? parseFloat(transaction.amount) : transaction.amount;
      const date = new Date(transaction.date);
      const tYear = date.getFullYear();
      const tMonth = date.getMonth() + 1;
      let key = '';

      if (period === 'monthly') {
        key = `${tYear}年${tMonth}月`;
      } else if (period === 'quarterly') {
        const q = Math.ceil(tMonth / 3);
        key = `${tYear}年 Q${q}`;
      } else if (period === 'yearly') {
        key = `${tYear}年`;
      }

      if (data[key]) {
        data[key].count += 1;
        if (transaction.type === 'income') {
          data[key].revenue += Math.abs(amount);
        } else if (transaction.type === 'expense') {
          data[key].expense += Math.abs(amount);
        } else if (amount > 0) {
          data[key].revenue += amount;
        } else if (amount < 0) {
          data[key].expense += Math.abs(amount);
        }
      }
    });

    const revenueData = labels.map(label => data[label].revenue);
    const expenseData = labels.map(label => data[label].expense);
    const profitData = labels.map(label => data[label].revenue - data[label].expense);
    const countData = labels.map(label => data[label].count);

    return {
      labels,
      revenue: revenueData,
      expense: expenseData,
      profit: profitData,
      count: countData
    };
  }, [transactions, period]);

  const { labels, revenue, expense, profit, count } = chartData;

  const totalRevenue = revenue.reduce((sum: number, amount: number) => sum + amount, 0);
  const totalExpense = expense.reduce((sum: number, amount: number) => sum + amount, 0);
  const totalProfit = totalRevenue - totalExpense;
  const totalCount = count.reduce((sum: number, c: number) => sum + c, 0);

  const data = {
    labels,
    datasets: [
      {
        label: '収益',
        data: revenue,
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.15)',
        tension: 0.4,
        pointBackgroundColor: '#06b6d4',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBorderWidth: 3,
        fill: true,
      },
      {
        label: '支出',
        data: expense,
        borderColor: '#f472b6',
        backgroundColor: 'rgba(244, 114, 182, 0.15)',
        tension: 0.4,
        pointBackgroundColor: '#f472b6',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBorderWidth: 3,
        fill: true,
      },
      {
        label: '利益',
        data: profit,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        tension: 0.4,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBorderWidth: 3,
        fill: true,
        borderDash: [5, 5],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          boxWidth: 9, // 12pxと6pxの中間
          boxHeight: 9, // 12pxと6pxの中間
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
    <div className="bg-white dark:bg-surface rounded-2xl p-5 border border-border shadow-sm transition-all duration-200 hover:shadow-md h-full flex flex-col">
      <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
        <h3 className="text-sm sm:text-lg font-semibold text-text-main whitespace-nowrap">収益・支出・利益推移</h3>
        <div className="flex p-1 bg-surface-highlight rounded-xl w-fit">
          <button
            onClick={() => setPeriod('monthly')}
            className={`whitespace-nowrap text-xs px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${period === 'monthly' ? 'bg-white dark:bg-surface text-primary shadow-sm' : 'text-text-muted hover:text-text-main'}`}
          >
            <Calendar className="w-3.5 h-3.5" />
            月次
          </button>
          <button
            onClick={() => setPeriod('quarterly')}
            className={`whitespace-nowrap text-xs px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${period === 'quarterly' ? 'bg-white dark:bg-surface text-primary shadow-sm' : 'text-text-muted hover:text-text-main'}`}
          >
            <PieChart className="w-3.5 h-3.5" />
            四半期
          </button>
          <button
            onClick={() => setPeriod('yearly')}
            className={`whitespace-nowrap text-xs px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${period === 'yearly' ? 'bg-white dark:bg-surface text-primary shadow-sm' : 'text-text-muted hover:text-text-main'}`}
          >
            <Activity className="w-3.5 h-3.5" />
            年次
          </button>
        </div>
      </div>

      <div className="chart-container h-64 w-full flex-shrink-0">
        <Line data={data} options={options} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {[
          {
            id: 'count',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            ),
            label: '総取引数',
            period: period === 'yearly' ? '過去5年' : '過去1年',
            value: `${totalCount}件`,
            color: 'from-blue-500/10 to-indigo-500/10',
            iconColor: 'bg-blue-500/15 text-blue-500',
            borderColor: 'border-blue-500/20'
          },
          {
            id: 'revenue',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            ),
            label: '総収益',
            period: period === 'yearly' ? '過去5年' : '過去1年',
            value: `¥${totalRevenue.toLocaleString()}`,
            color: 'from-cyan-500/10 to-blue-500/10',
            iconColor: 'bg-cyan-500/15 text-cyan-500',
            borderColor: 'border-cyan-500/20'
          },
          {
            id: 'expense',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
            ),
            label: '総支出',
            period: period === 'yearly' ? '過去5年' : '過去1年',
            value: `¥${totalExpense.toLocaleString()}`,
            color: 'from-pink-500/10 to-red-500/10',
            iconColor: 'bg-pink-500/15 text-pink-500',
            borderColor: 'border-pink-500/20'
          },
          {
            id: 'profit',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 9.5V17" />
                <path d="M12 9.5 8 5" />
                <path d="M12 9.5 16 5" />
                <path d="M9 12h6" />
                <path d="M9 15h6" />
              </svg>
            ),
            label: '純利益',
            period: period === 'yearly' ? '過去5年' : '過去1年',
            value: `¥${totalProfit.toLocaleString()}`,
            color: 'from-emerald-500/10 to-green-500/10',
            iconColor: 'bg-emerald-500/15 text-emerald-500',
            borderColor: 'border-emerald-500/20'
          }
        ].map((metric, index) => (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative overflow-hidden bg-gradient-to-br ${metric.color} p-2.5 rounded-xl border ${metric.borderColor} shadow-sm backdrop-blur-sm group hover:scale-[1.02] transition-transform flex flex-col justify-between min-h-[84px]`}
          >
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1.5">
                <div className={`p-1.5 rounded-lg ${metric.iconColor} shrink-0`}>
                  {React.cloneElement(metric.icon as React.ReactElement, { className: 'w-3.5 h-3.5' })}
                </div>
                <div className="flex flex-col min-w-0">
                  <p className="text-[10px] text-slate-900 dark:text-white font-bold truncate leading-tight">{metric.label}</p>
                  <p className="text-[8px] text-gray-400 truncate uppercase tracking-tighter">{metric.period}</p>
                </div>
              </div>
              <p className="text-base font-black text-text-main truncate tracking-tight">{metric.value}</p>
            </div>
            {/* Background design elements */}
            <div className={`absolute -right-3 -bottom-3 w-10 h-10 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500 ${metric.id === 'revenue' ? 'bg-cyan-500' : metric.id === 'expense' ? 'bg-pink-500' : metric.id === 'profit' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default RevenueChart