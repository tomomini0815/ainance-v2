import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BarChart3, TrendingUp, TrendingDown, JapaneseYen, Users, Calendar, Filter, Download } from 'lucide-react';
// HeaderコンポーネントはApp.tsxでレンダリングされるため、ここでは削除

const BusinessAnalysis: React.FC = () => {
  const [period, setPeriod] = useState('monthly');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));

  // ダミーデータ
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [expenseData, setExpenseData] = useState<any[]>([]);
  const [profitData, setProfitData] = useState<any[]>([]);

  useEffect(() => {
    // ダミーデータの生成
    const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    const revenue = [1200000, 1500000, 1800000, 2200000, 2500000, 2800000, 3200000, 3500000, 3800000, 4200000, 4500000, 4800000];
    const expense = [800000, 900000, 1100000, 1300000, 1500000, 1700000, 1900000, 2100000, 2300000, 2500000, 2700000, 2900000];

    setRevenueData(months.map((month, index) => ({
      month,
      amount: revenue[index]
    })));

    setExpenseData(months.map((month, index) => ({
      month,
      amount: expense[index]
    })));

    setProfitData(months.map((month, index) => ({
      month,
      amount: revenue[index] - expense[index]
    })));
  }, []);

  const exportReport = () => {
    // レポートエクスポートロジック
    console.log('レポートをエクスポートしました');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* HeaderコンポーネントはApp.tsxでレンダリングされるため、ここでは削除 */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center mb-6">
          <Link to="/dashboard" className="mr-4">
            <ArrowLeft className="w-6 h-6 text-text-muted hover:text-text-main" />
          </Link>
          <h1 className="text-2xl font-bold text-text-main">経営分析</h1>
        </div>

        <div className="bg-surface rounded-xl shadow-sm border border-border p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-lg font-semibold text-text-main mb-4 md:mb-0">財務状況</h2>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-text-muted mr-2" />
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="px-3 py-1 bg-background border border-border rounded-md text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="monthly">月次</option>
                  <option value="quarterly">四半期</option>
                  <option value="yearly">年次</option>
                </select>
              </div>
              <div className="flex items-center">
                <Filter className="w-4 h-4 text-text-muted mr-2" />
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="px-3 py-1 bg-background border border-border rounded-md text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="2023">2023年</option>
                  <option value="2024">2024年</option>
                  <option value="2025">2025年</option>
                </select>
              </div>
              {period === 'monthly' && (
                <div className="flex items-center">
                  <select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="px-3 py-1 bg-background border border-border rounded-md text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="01">1月</option>
                    <option value="02">2月</option>
                    <option value="03">3月</option>
                    <option value="04">4月</option>
                    <option value="05">5月</option>
                    <option value="06">6月</option>
                    <option value="07">7月</option>
                    <option value="08">8月</option>
                    <option value="09">9月</option>
                    <option value="10">10月</option>
                    <option value="11">11月</option>
                    <option value="12">12月</option>
                  </select>
                </div>
              )}
              <button
                onClick={exportReport}
                className="flex items-center px-3 py-1 bg-surface text-text-main border border-border rounded-md hover:bg-surface-highlight transition-colors text-sm"
              >
                <Download className="w-4 h-4 mr-1" />
                エクスポート
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-500/10 rounded-lg p-5 border border-blue-500/20">
              <div className="flex items-center">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-text-muted">売上高</p>
                  <p className="text-2xl font-bold text-text-main">¥4,800,000</p>
                  <p className="text-sm text-green-500 flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span>前月比 12.5%</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-red-500/10 rounded-lg p-5 border border-red-500/20">
              <div className="flex items-center">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <TrendingDown className="w-6 h-6 text-red-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-text-muted">経費</p>
                  <p className="text-2xl font-bold text-text-main">¥2,900,000</p>
                  <p className="text-sm text-green-500 flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span>前月比 8.2%</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-500/10 rounded-lg p-5 border border-green-500/20">
              <div className="flex items-center">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <JapaneseYen className="w-6 h-6 text-green-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-text-muted">利益</p>
                  <p className="text-2xl font-bold text-text-main">¥1,900,000</p>
                  <p className="text-sm text-green-500 flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span>前月比 18.3%</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface border border-border rounded-lg p-5">
              <h3 className="text-lg font-medium text-text-main mb-4">売上推移</h3>
              <div className="h-64 flex items-end justify-between space-x-2">
                {revenueData.map((data, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div
                      className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
                      style={{ height: `${(data.amount / 5000000) * 200}px` }}
                    ></div>
                    <p className="text-xs text-text-muted mt-2">{data.month}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface border border-border rounded-lg p-5">
              <h3 className="text-lg font-medium text-text-main mb-4">経費推移</h3>
              <div className="h-64 flex items-end justify-between space-x-2">
                {expenseData.map((data, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div
                      className="w-full bg-red-500 rounded-t hover:bg-red-600 transition-colors"
                      style={{ height: `${(data.amount / 5000000) * 200}px` }}
                    ></div>
                    <p className="text-xs text-text-muted mt-2">{data.month}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 bg-surface border border-border rounded-lg p-5">
            <h3 className="text-lg font-medium text-text-main mb-4">利益推移</h3>
            <div className="h-64 flex items-end justify-between space-x-2">
              {profitData.map((data, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-full rounded-t hover:opacity-75 transition-opacity ${data.amount >= 0 ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    style={{ height: `${Math.abs(data.amount) / 5000000 * 200}px` }}
                  ></div>
                  <p className="text-xs text-text-muted mt-2">{data.month}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
          <h2 className="text-lg font-semibold text-text-main mb-4">部門別業績</h2>
          <div className="block md:hidden space-y-4">
            <div className="bg-surface p-4 rounded-lg shadow-sm border border-border">
              <div className="flex justify-between items-start mb-2">
                <div className="font-medium text-text-main">製品A</div>
                <div className="text-right">
                  <div className="font-medium text-text-main">¥2,400,000</div>
                  <div className="text-xs text-text-muted">売上高</div>
                </div>
              </div>
              <div className="space-y-2 text-sm border-t border-border pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-text-muted">目標比:</span>
                  <span className="text-green-500 font-medium">120%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">前年比:</span>
                  <span className="text-green-500 font-medium">+15%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">利益:</span>
                  <span className="text-text-main font-medium">¥800,000</span>
                </div>
              </div>
            </div>

            <div className="bg-surface p-4 rounded-lg shadow-sm border border-border">
              <div className="flex justify-between items-start mb-2">
                <div className="font-medium text-text-main">製品B</div>
                <div className="text-right">
                  <div className="font-medium text-text-main">¥1,800,000</div>
                  <div className="text-xs text-text-muted">売上高</div>
                </div>
              </div>
              <div className="space-y-2 text-sm border-t border-border pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-text-muted">目標比:</span>
                  <span className="text-green-500 font-medium">90%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">前年比:</span>
                  <span className="text-red-500 font-medium">-5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">利益:</span>
                  <span className="text-text-main font-medium">¥600,000</span>
                </div>
              </div>
            </div>

            <div className="bg-surface p-4 rounded-lg shadow-sm border border-border">
              <div className="flex justify-between items-start mb-2">
                <div className="font-medium text-text-main">サービス</div>
                <div className="text-right">
                  <div className="font-medium text-text-main">¥600,000</div>
                  <div className="text-xs text-text-muted">売上高</div>
                </div>
              </div>
              <div className="space-y-2 text-sm border-t border-border pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-text-muted">目標比:</span>
                  <span className="text-green-500 font-medium">150%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">前年比:</span>
                  <span className="text-green-500 font-medium">+25%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">利益:</span>
                  <span className="text-text-main font-medium">¥300,000</span>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-highlight">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">部門</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">売上高</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">目標比</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">前年比</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">利益</th>
                </tr>
              </thead>
              <tbody className="bg-surface divide-y divide-border">
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-text-main">製品A</td>
                  <td className="px-4 py-3 text-sm text-text-main">¥2,400,000</td>
                  <td className="px-4 py-3 text-sm text-green-500">120%</td>
                  <td className="px-4 py-3 text-sm text-green-500">+15%</td>
                  <td className="px-4 py-3 text-sm text-text-main">¥800,000</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-text-main">製品B</td>
                  <td className="px-4 py-3 text-sm text-text-main">¥1,800,000</td>
                  <td className="px-4 py-3 text-sm text-green-500">90%</td>
                  <td className="px-4 py-3 text-sm text-red-500">-5%</td>
                  <td className="px-4 py-3 text-sm text-text-main">¥600,000</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-text-main">サービス</td>
                  <td className="px-4 py-3 text-sm text-text-main">¥600,000</td>
                  <td className="px-4 py-3 text-sm text-green-500">150%</td>
                  <td className="px-4 py-3 text-sm text-green-500">+25%</td>
                  <td className="px-4 py-3 text-sm text-text-main">¥300,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BusinessAnalysis;