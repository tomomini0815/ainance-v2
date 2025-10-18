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
  transactions: any[]; // 取引データをpropsとして受け取る
}

const ExpenseChart: React.FC<ExpenseChartProps> = ({ transactions }) => {
  // 取引データから支出カテゴリ別の合計を計算
  const calculateExpenseByCategory = () => {
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const categoryTotals: { [key: string]: number } = {};
    
    expenseTransactions.forEach(transaction => {
      // 金額を数値に変換
      const amount = typeof transaction.amount === 'string' ? parseFloat(transaction.amount) : transaction.amount;
      
      if (categoryTotals[transaction.category]) {
        categoryTotals[transaction.category] += amount;
      } else {
        categoryTotals[transaction.category] = amount;
      }
    });
    
    // 合計金額を計算
    const totalAmount = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
    
    // パーセンテージを計算
    const percentages: { [key: string]: number } = {};
    Object.keys(categoryTotals).forEach(category => {
      percentages[category] = Math.round((categoryTotals[category] / totalAmount) * 100);
    });
    
    return { categoryTotals, percentages, totalAmount };
  };

  const { percentages, categoryTotals, totalAmount } = calculateExpenseByCategory();
  
  // チャートデータの準備
  const labels = Object.keys(percentages);
  const percentageData = Object.values(percentages);
  const amountData = Object.values(categoryTotals);

  // カラーパレットの定義
  const colorPalette = [
    'rgb(99, 102, 241)',
    'rgb(139, 92, 246)',
    'rgb(168, 85, 247)',
    'rgb(192, 132, 252)',
    'rgb(221, 214, 254)',
    'rgb(124, 58, 237)',
    'rgb(109, 40, 217)',
    'rgb(79, 70, 229)',
    'rgb(67, 56, 202)',
    'rgb(55, 48, 163)',
  ];

  const backgroundColors = labels.map((_, index) => colorPalette[index % colorPalette.length]);

  const data = {
    labels: labels,
    datasets: [
      {
        data: percentageData,
        backgroundColor: backgroundColors,
        borderWidth: 0,
        cutout: '60%',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
          },
          generateLabels: function(chart: any) {
            const data = chart.data
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label: string, index: number) => {
                const value = data.datasets[0].data[index]
                return {
                  text: `${label} ${value}%`,
                  fillStyle: data.datasets[0].backgroundColor[index],
                  strokeStyle: data.datasets[0].backgroundColor[index],
                  lineWidth: 0,
                  pointStyle: 'circle',
                  hidden: false,
                  index: index
                }
              })
            }
            return []
          }
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const amount = amountData[context.dataIndex];
            return `${label}: ${context.parsed}% (${amount.toLocaleString()}円)`;
          },
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
      },
    },
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">支出カテゴリ</h3>
        <button className="text-sm text-blue-600 hover:text-blue-800">詳細を見る</button>
      </div>
      <div className="chart-container h-80">
        <Doughnut data={data} options={options} />
      </div>
      <div className="mt-4">
        <h4 className="font-medium text-gray-900 mb-2">カテゴリ別支出内訳</h4>
        <div className="space-y-2">
          {labels.map((label, index) => (
            <div key={label} className="flex items-center justify-between">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: backgroundColors[index] }}
                ></div>
                <span className="text-sm text-gray-600">{label}</span>
              </div>
              <span className="text-sm font-medium">¥{amountData[index].toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ExpenseChart