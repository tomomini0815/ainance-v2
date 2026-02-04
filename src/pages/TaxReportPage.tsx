import React, { useMemo } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { useAuth } from '../hooks/useAuth';
import { useBusinessTypeContext } from '../context/BusinessTypeContext';
import { useTaxCalculation } from '../hooks/useTaxCalculation';
import { useCorporateTaxCalculation } from '../hooks/useCorporateTaxCalculation';
import { ArrowLeft, Download, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend
);

const TaxReportPage: React.FC = () => {
    const { currentBusinessType } = useBusinessTypeContext();
    const { user } = useAuth();
    const { transactions } = useTransactions(user?.id, currentBusinessType?.business_type);

    // State for Blue Return Toggle (only relevant for individuals)
    const [enableBlueReturn, setEnableBlueReturn] = React.useState(false);

    // State for Selected Year
    const [selectedYear, setSelectedYear] = React.useState<number | undefined>(undefined);

    const individualTaxData = useTaxCalculation(transactions, [], { enableBlueReturn, year: selectedYear });
    const corporateTaxData = useCorporateTaxCalculation(transactions, [], { year: selectedYear });
    const isCorporation = currentBusinessType?.business_type === 'corporation';
    const taxData = isCorporation ? corporateTaxData : individualTaxData;

    // Get available years from the active hook result
    // Using selectableYears (renamed from availableYears to ensure freshness)
    const availableYears = (taxData as any).selectableYears || [new Date().getFullYear(), new Date().getFullYear() - 1];

    console.log('[TaxReport] Available Years:', availableYears, 'Is Corp:', isCorporation);

    const chartData = useMemo(() => {
        const isZero = taxData.totalTax <= 0;
        if (isZero) {
            return {
                labels: ['納税・課税なし'],
                datasets: [{
                    data: [1],
                    backgroundColor: ['#e5e7eb'], // Gray for empty state
                    borderWidth: 0,
                }]
            };
        }

        if (isCorporation) {
            return {
                labels: ['法人税', '法人住民税', '法人事業税'],
                datasets: [{
                    data: [
                        (taxData.breakdown as any).corporateTax || 0,
                        taxData.breakdown.residentTax,
                        taxData.breakdown.businessTax
                    ],
                    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
                    borderWidth: 0,
                }]
            };
        } else {
            return {
                labels: ['所得税', '住民税', '事業税', '国民健康保険'],
                datasets: [{
                    data: [
                        (taxData.breakdown as any).incomeTax || 0,
                        taxData.breakdown.residentTax,
                        taxData.breakdown.businessTax,
                        (taxData.breakdown as any).healthInsurance || 0
                    ],
                    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
                    borderWidth: 0,
                }]
            };
        }
    }, [taxData, isCorporation]);

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'right' as const,
                labels: {
                    usePointStyle: true,
                    boxWidth: 8,
                    filter: (legendItem: any, data: any) => {
                        // Filter out the 'No Tax' label if we want, or just let it show 'No Tax' 
                        // For now, if it's the placeholder, we can hide the legend or show it.
                        // Let's show it so user knows why it's gray.
                        return true;
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label: (context: any) => {
                        if (taxData.totalTax <= 0) return '納税予測額なし';
                        const label = context.label || '';
                        const value = context.raw || 0;
                        return `${label}: ${Math.round(value).toLocaleString()}円`;
                    }
                }
            }
        }
    };

    return (
        <div className="min-h-screen pb-20 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                            <ArrowLeft className="w-6 h-6 text-text-muted" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-text-main">納税予測レポート</h1>
                            <p className="text-sm text-text-muted">{taxData.calculationYear}年度の推定納税額内訳</p>
                        </div>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-surface border border-border rounded-lg text-sm font-bold text-text-main hover:bg-gray-50 transition-colors shadow-sm">
                        <Download className="w-4 h-4" />
                        PDF出力
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white dark:bg-surface p-6 rounded-2xl border border-border shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-text-main">年間納税予測サマリー</h2>
                            <select
                                value={taxData.calculationYear}
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                                className="bg-gray-50 dark:bg-gray-800 border border-border text-text-main text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 pr-8"
                            >
                                {availableYears.map((year: number) => (
                                    <option key={year} value={year}>{year}年度</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-6">
                            <div className="flex items-end justify-between border-b border-border pb-4">
                                <span className="text-sm text-text-muted">年間納税総額 (予測)</span>
                                <span className="text-3xl font-bold text-text-main">{Math.round(taxData.totalTax).toLocaleString()}円</span>
                            </div>
                            <div className="flex items-end justify-between border-b border-border pb-4">
                                <span className="text-sm text-text-muted">月額積立目安</span>
                                <span className="text-3xl font-bold text-blue-500">{Math.round(taxData.monthlyTaxAru).toLocaleString()}円</span>
                            </div>
                            <div className="flex items-end justify-between">
                                <span className="text-xl font-bold text-text-main">{Math.round(taxData.projectedAnnualProfit).toLocaleString()}円</span>
                            </div>

                            {/* Deduction Breakdown for Individuals */}
                            {!isCorporation && (
                                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2 text-sm">
                                    <div className="flex justify-between items-center text-text-muted">
                                        <span>基礎控除</span>
                                        <span>-{(individualTaxData as any).deductions?.basicDeduction.toLocaleString() || 0}円</span>
                                    </div>
                                    <div className="flex justify-between items-center text-text-muted">
                                        <div className="flex items-center gap-2">
                                            <span>青色申告特別控除</span>
                                            {/* Toggle Switch */}
                                            <button
                                                onClick={() => setEnableBlueReturn(!enableBlueReturn)}
                                                className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${enableBlueReturn ? 'bg-blue-500' : 'bg-gray-300'}`}
                                            >
                                                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enableBlueReturn ? 'translate-x-4' : 'translate-x-0'}`} />
                                            </button>
                                        </div>
                                        <span>-{(individualTaxData as any).deductions?.blueReturnDeduction.toLocaleString() || 0}円</span>
                                    </div>
                                    <div className="border-t border-gray-200 dark:border-gray-700 my-2 pt-2 flex justify-between items-center font-bold text-text-main">
                                        <span>課税所得金額</span>
                                        <span>{Math.round((individualTaxData as any).taxableIncome || 0).toLocaleString()}円</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-surface p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-center">
                        <h2 className="text-lg font-bold text-text-main mb-4">税目別構成比</h2>
                        <div className="h-64 flex justify-center">
                            <Doughnut data={chartData} options={chartOptions} />
                        </div>
                    </div>
                </div>

                {/* Detailed Breakdown */}
                <div className="bg-white dark:bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-border">
                        <h2 className="text-lg font-bold text-text-main">税目別詳細内訳</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-surface-highlight">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-bold text-text-muted uppercase">税目</th>
                                    <th className="px-6 py-3 text-xs font-bold text-text-muted uppercase text-right">予測額</th>
                                    <th className="px-6 py-3 text-xs font-bold text-text-muted uppercase text-right">構成比</th>
                                    <th className="px-6 py-3 text-xs font-bold text-text-muted uppercase">備考</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {isCorporation ? (
                                    // Corporate Rows
                                    [
                                        { label: '法人税', value: (taxData.breakdown as any).corporateTax || 0, desc: '累進課税 (15% - 23.2%)' },
                                        { label: '法人住民税', value: taxData.breakdown.residentTax, desc: '法人税割 + 均等割(7万円)' },
                                        { label: '法人事業税', value: taxData.breakdown.businessTax, desc: '所得 x 税率 (約3.5% - 7%)' },
                                    ].map((row, i) => (
                                        <tr key={i} className="hover:bg-surface-highlight transition-colors">
                                            <td className="px-6 py-4 text-sm font-bold text-text-main whitespace-nowrap">{row.label}</td>
                                            <td className="px-6 py-4 text-sm font-bold text-text-main text-right whitespace-nowrap">
                                                {Math.round(row.value).toLocaleString()}円
                                            </td>
                                            <td className="px-6 py-4 text-sm text-text-muted text-right whitespace-nowrap">
                                                {taxData.totalTax > 0 ? ((row.value / taxData.totalTax) * 100).toFixed(1) : 0}%
                                            </td>
                                            <td className="px-6 py-4 text-xs text-text-muted">
                                                {row.desc}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    // Individual Rows
                                    [
                                        { label: '所得税', value: (taxData.breakdown as any).incomeTax || 0, desc: '累進課税 (5% - 45%)' },
                                        { label: '住民税', value: taxData.breakdown.residentTax, desc: '一律 10%' },
                                        { label: '個人事業税', value: taxData.breakdown.businessTax, desc: '業種により 3% - 5% (控除290万円)' },
                                        { label: '国民健康保険', value: (taxData.breakdown as any).healthInsurance || 0, desc: '所得割 + 均等割 (上限あり)' }
                                    ].map((row, i) => (
                                        <tr key={i} className="hover:bg-surface-highlight transition-colors">
                                            <td className="px-6 py-4 text-sm font-bold text-text-main whitespace-nowrap">{row.label}</td>
                                            <td className="px-6 py-4 text-sm font-bold text-text-main text-right whitespace-nowrap">
                                                {Math.round(row.value).toLocaleString()}円
                                            </td>
                                            <td className="px-6 py-4 text-sm text-text-muted text-right whitespace-nowrap">
                                                {taxData.totalTax > 0 ? ((row.value / taxData.totalTax) * 100).toFixed(1) : 0}%
                                            </td>
                                            <td className="px-6 py-4 text-xs text-text-muted">
                                                {row.desc}
                                            </td>
                                        </tr>
                                    ))
                                )}
                                <tr className="bg-surface-highlight font-bold">
                                    <td className="px-6 py-4 text-sm text-text-main whitespace-nowrap">合計</td>
                                    <td className="px-6 py-4 text-sm text-text-main text-right whitespace-nowrap">
                                        {Math.round(taxData.totalTax).toLocaleString()}円
                                    </td>
                                    <td className="px-6 py-4 text-right whitespace-nowrap">100%</td>
                                    <td className="px-6 py-4"></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 m-4 rounded-xl flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                        <div className="text-xs text-blue-600 dark:text-blue-300">
                            <strong>注記:</strong> この予測は現在の月次利益を年間換算した概算値です。実際の納税額は、確定申告時の控除（青色申告特別控除、基礎控除、扶養控除など）や経費の計上状況により変動します。正確な計算が必要な場合は税理士にご相談ください。
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaxReportPage;
