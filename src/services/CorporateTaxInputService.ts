import { CorporateTaxInputData, initialCorporateTaxInputData } from '../types/corporateTaxInput';
import { generateFinancialDataFromTransactions, calculateEntertainmentAdjustment } from './CorporateTaxService';

const STORAGE_KEY = 'ainance_corporate_tax_input_data';

export const CorporateTaxInputService = {
    // データをローカルストレージに保存
    saveData: (data: CorporateTaxInputData): void => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save corporate tax input data:', error);
        }
    },

    // データをローカルストレージから取得
    getData: (): CorporateTaxInputData => {
        try {
            const storedData = localStorage.getItem(STORAGE_KEY);
            if (storedData) {
                return JSON.parse(storedData);
            }
        } catch (error) {
            console.error('Failed to load corporate tax input data:', error);
        }
        return initialCorporateTaxInputData;
    },

    // データをリセット
    resetData: (): void => {
        localStorage.removeItem(STORAGE_KEY);
    },

    // 取引データから自動計算（転記）
    calculateDataFromTransactions: (transactions: any[]): Partial<CorporateTaxInputData> => {
        const currentYear = new Date().getFullYear();
        // 前年度をデフォルトとする（申告年度）
        const fiscalYear = currentYear - 1;

        // 共通の計算ロジックを使用
        const financialData = generateFinancialDataFromTransactions(transactions, fiscalYear);

        // 資本金の取得（デフォルト100万円、既存データがあればそれを使用）
        const existingData = CorporateTaxInputService.getData();
        const capital = existingData.beppyo15.capitalAmount || 1000000;

        // FinancialData -> CorporateTaxInputData マッピング
        const directorsCompensation = financialData.expensesByCategory.find(c => c.category === '役員報酬')?.amount || 0;
        const rent = financialData.expensesByCategory.find(c => c.category === '地代家賃')?.amount || 0;
        const taxes = financialData.expensesByCategory.find(c => c.category === '租税公課')?.amount || 0;
        const entertainment = financialData.expensesByCategory.find(c => c.category === '交際費' || c.category === '接待交際費')?.amount || 0;
        const depreciation = financialData.expensesByCategory.find(c => c.category === '減価償却費')?.amount || 0;
        const salaries = financialData.expensesByCategory.find(c => c.category === '給料賃金' || c.category === '人件費')?.amount || 0;

        // 交際費の損金不算入額計算
        const nonDeductibleEntertainment = calculateEntertainmentAdjustment(entertainment, capital);

        // 減価償却資産の抽出（タグベース）
        const depAssets = transactions
            .filter(t => t.tags?.includes('depreciation_asset') && new Date(t.date).getFullYear() === fiscalYear)
            .map(t => ({
                id: t.id,
                name: t.description?.split(' ')[0] || '固定資産',
                acquisitionDate: t.date,
                acquisitionCost: Math.abs(Number(t.amount) || 0), // 取得時の金額想定
                usefulLife: 5, // デフォルト
                depreciationMethod: 'straightLine',
                currentDepreciation: Math.abs(Number(t.amount) || 0) / 5, // 簡易計算
                allowableLimit: Math.abs(Number(t.amount) || 0) / 5,
                bookValueEnd: Math.abs(Number(t.amount) || 0) * 0.8
            }));

        return {
            businessOverview: {
                sales: financialData.revenue,
                costOfSales: financialData.costOfSales,
                grossProfit: financialData.grossProfit,
                operatingExpenses: financialData.operatingExpenses,
                operatingIncome: financialData.operatingIncome,
                ordinaryIncome: financialData.ordinaryIncome,
                netIncome: financialData.incomeBeforeTax, // 税引前を一旦セット
                directorsCompensation,
                employeesSalary: salaries,
                rent,
                taxesAndDues: taxes,
                entertainmentExpenses: entertainment,
                depreciation,
            },
            beppyo4: {
                ...initialCorporateTaxInputData.beppyo4,
                netIncomeFromPL: financialData.incomeBeforeTax,
                taxableIncome: financialData.incomeBeforeTax + nonDeductibleEntertainment,
                additions: [
                    { id: '1', description: '法人税等の損金不算入額', amount: taxes }, // 租税公課を一旦全額加算（住民税等は不算入のため）
                    { id: '2', description: '交際費等の損金不算入額', amount: nonDeductibleEntertainment },
                    { id: '3', description: '役員給与の損金不算入額', amount: 0 },
                ]
            },
            beppyo15: {
                ...initialCorporateTaxInputData.beppyo15,
                socialExpenses: entertainment,
                capitalAmount: capital,
                excessAmount: nonDeductibleEntertainment
            },
            beppyo16: {
                ...initialCorporateTaxInputData.beppyo16,
                assets: depAssets.length > 0 ? depAssets : initialCorporateTaxInputData.beppyo16.assets,
                totalDepreciation: depAssets.reduce((sum, a) => sum + a.currentDepreciation, 0),
                totalAllowable: depAssets.reduce((sum, a) => sum + a.allowableLimit, 0)
            }
        };
    }
};
