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
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface RevenueChartProps {
  transactions: any[]; // 取引データをpropsとして受け取る
}

const RevenueChart: React.FC<RevenueChartProps> = ({ transactions }) => {
  // 月ごとの収益、支出、利益を計算
  const calculateMonthlyData = () => {
    // 月ごとのデータを初期化
    const monthlyData: { [key: string]: { revenue: number; expense: number } } = {};
    
    // 3月から1年分の月を生成
    const months = [];
    const now = new Date();
    const startYear = now.getMonth() >= 2 ? now.getFullYear() : now.getFullYear() - 1;
    const startMonth = now.getMonth() >= 2 ? 2 : 2; // 3月 (0-basedなので2)
    
    for (let i = 0; i < 12; i++) {
      const year = startMonth + i <= 11 ? startYear : startYear + 1;
      const month = (startMonth + i) % 12;
      const date = new Date(year, month, 1);
      const monthKey = `${date.getFullYear()}年${date.getMonth() + 1}月`;
      months.push(monthKey);
      monthlyData[monthKey] = { revenue: 0, expense: 0 };
    }
    
    // 取引データを集計
    transactions.forEach(transaction => {
      // 金額を数値に変換
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
    
    // 利益を計算
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

  // 総収益、総支出、純利益を計算
  const totalRevenue = revenue.reduce((sum, amount) => sum + amount, 0);
  const totalExpense = expense.reduce((sum, amount) => sum + amount, 0);
  const totalProfit = totalRevenue - totalExpense;

  const data = {
    labels: labels,
    datasets: [
      {
        label: '収益',
        data: revenue,
        borderColor: 'rgb(59, 130, 246)', // 青色 (blue-500)
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: 'rgb(59, 130, 246)',
        pointRadius: 4,
      },
      {
        label: '支出',
        data: expense,
        borderColor: 'rgb(239, 68, 68)', // 赤色 (red-500)
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        pointBackgroundColor: 'rgb(239, 68, 68)',
        pointBorderColor: 'rgb(239, 68, 68)',
        pointRadius: 4,
      },
      {
        label: '利益',
        data: profit,
        borderColor: 'rgb(34, 197, 94)', // 緑色 (green-500)
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        pointBackgroundColor: 'rgb(34, 197, 94)',
        pointBorderColor: 'rgb(34, 197, 94)',
        pointRadius: 4,
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
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
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
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
      y: {
        display: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          font: {
            size: 11,
          },
          callback: function(value: any) {
            return value.toLocaleString() + '円';
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
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">収益・支出・利益推移</h3>
        <div className="flex space-x-2">
          <button className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">月次</button>
          <button className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">四半期</button>
          <button className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">年次</button>
        </div>
      </div>
      <div className="chart-container h-80">
        <Line data={data} options={options} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="bg-blue-50 p-2 rounded-lg flex flex-col items-center">
          <p className="text-xs text-gray-600">総収益</p>
          <p className="text-sm font-bold text-blue-600">¥{totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-green-600">↑ 12.5%</p>
        </div>
        <div className="bg-red-50 p-2 rounded-lg flex flex-col items-center">
          <p className="text-xs text-gray-600">総支出</p>
          <p className="text-sm font-bold text-red-600">¥{totalExpense.toLocaleString()}</p>
          <p className="text-xs text-red-600">↓ 3.2%</p>
        </div>
        <div className="bg-green-50 p-2 rounded-lg flex flex-col items-center">
          <p className="text-xs text-gray-600">純利益</p>
          <p className="text-sm font-bold text-green-600">¥{totalProfit.toLocaleString()}</p>
          <p className="text-xs text-green-600">↑ 8.7%</p>
        </div>
      </div>
    </div>
  )
}

export default RevenueChart