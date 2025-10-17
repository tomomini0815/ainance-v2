import React from 'react'
import { Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const ExpenseChart: React.FC = () => {
  const data = {
    labels: ['交通費', '食費', '消耗品費', '広告費', 'その他'],
    datasets: [
      {
        data: [31, 23, 23, 15, 8],
        backgroundColor: [
          'rgb(99, 102, 241)',
          'rgb(139, 92, 246)',
          'rgb(168, 85, 247)',
          'rgb(192, 132, 252)',
          'rgb(221, 214, 254)',
        ],
        borderWidth: 0,
        cutout: '60%',
      },
    ],
  }

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
            return `${context.label}: ${context.parsed}%`
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
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">交通費</span>
            </div>
            <span className="text-sm font-medium">¥15,500</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">食費</span>
            </div>
            <span className="text-sm font-medium">¥11,500</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-600 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">消耗品費</span>
            </div>
            <span className="text-sm font-medium">¥11,500</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-300 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">広告費</span>
            </div>
            <span className="text-sm font-medium">¥7,500</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-100 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">その他</span>
            </div>
            <span className="text-sm font-medium">¥4,000</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExpenseChart