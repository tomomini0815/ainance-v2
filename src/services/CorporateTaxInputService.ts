import { CorporateTaxInputData, initialCorporateTaxInputData } from '../types/corporateTaxInput';
import { generateFinancialDataFromTransactions } from './CorporateTaxService';

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

        // FinancialData -> CorporateTaxInputData マッピング
        const directorsCompensation = financialData.expensesByCategory.find(c => c.category === '役員報酬')?.amount || 0;
        const rent = financialData.expensesByCategory.find(c => c.category === '地代家賃')?.amount || 0;
        const taxes = financialData.expensesByCategory.find(c => c.category === '租税公課')?.amount || 0;
        const entertainment = financialData.expensesByCategory.find(c => c.category === '交際費' || c.category === '接待交際費')?.amount || 0;
        const depreciation = financialData.expensesByCategory.find(c => c.category === '減価償却費')?.amount || 0;
        const salaries = financialData.expensesByCategory.find(c => c.category === '給料賃金' || c.category === '人件費')?.amount || 0;

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
                taxableIncome: financialData.incomeBeforeTax, // 初期値として設定
                additions: [
                    { id: '1', description: '法人税等の損金不算入額', amount: 0 }, // 本当はtaxesから計算すべきだが一旦0
                    { id: '2', description: '交際費等の損金不算入額', amount: 0 },
                    { id: '3', description: '役員給与の損金不算入額', amount: 0 },
                ]
            }
        };
    }
};
