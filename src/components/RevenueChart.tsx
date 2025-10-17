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

const RevenueChart: React.FC = () => {
  const data = {
    labels: ['4月', '5月', '6月', '7月', '8月', '9月'],
    datasets: [
      {
        label: '収益',
        data: [4000, 3000, 2000, 2800, 1900, 2400],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
        pointBackgroundColor: 'rgb(99, 102, 241)',
        pointBorderColor: 'rgb(99, 102, 241)',
        pointRadius: 4,
      },
      {
        label: '支出',
        data: [1600, 1500, 200, 800, 400, 600],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        pointBackgroundColor: 'rgb(34, 197, 94)',
        pointBorderColor: 'rgb(34, 197, 94)',
        pointRadius: 4,
      },
      {
        label: '利益',
        data: [2400, 1500, 1800, 2000, 1500, 1800],
        borderColor: 'rgb(168, 162, 158)',
        backgroundColor: 'rgba(168, 162, 158, 0.1)',
        tension: 0.4,
        pointBackgroundColor: 'rgb(168, 162, 158)',
        pointBorderColor: 'rgb(168, 162, 158)',
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
            return value.toLocaleString()
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
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600">総収益</p>
          <p className="text-lg font-bold text-blue-600">¥1.43M</p>
          <p className="text-xs text-green-600">↑ 12.5%</p>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600">総支出</p>
          <p className="text-lg font-bold text-green-600">¥510K</p>
          <p className="text-xs text-red-600">↓ 3.2%</p>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600">純利益</p>
          <p className="text-lg font-bold text-purple-600">¥920K</p>
          <p className="text-xs text-green-600">↑ 8.7%</p>
        </div>
      </div>
    </div>
  )
}

export default RevenueChart