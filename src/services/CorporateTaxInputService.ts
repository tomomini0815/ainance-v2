import { CorporateTaxInputData, initialCorporateTaxInputData } from '../types/corporateTaxInput';
import { generateFinancialDataFromTransactions, calculateAllCorporateTaxes } from './CorporateTaxService';

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
                const parsed = JSON.parse(storedData);
                return {
                    ...initialCorporateTaxInputData,
                    ...parsed,
                    companyInfo: { ...initialCorporateTaxInputData.companyInfo, ...(parsed.companyInfo || {}) },
                    beppyo1: { ...initialCorporateTaxInputData.beppyo1, ...(parsed.beppyo1 || {}) },
                    beppyo4: { ...initialCorporateTaxInputData.beppyo4, ...(parsed.beppyo4 || {}) },
                    beppyo5: { ...initialCorporateTaxInputData.beppyo5, ...(parsed.beppyo5 || {}) },
                    beppyo5_2: { ...initialCorporateTaxInputData.beppyo5_2, ...(parsed.beppyo5_2 || {}) },
                    beppyo16: { ...initialCorporateTaxInputData.beppyo16, ...(parsed.beppyo16 || {}) },
                    beppyo15: { ...initialCorporateTaxInputData.beppyo15, ...(parsed.beppyo15 || {}) },
                    beppyo2: { ...initialCorporateTaxInputData.beppyo2, ...(parsed.beppyo2 || {}) },
                    businessOverview: { ...initialCorporateTaxInputData.businessOverview, ...(parsed.businessOverview || {}) },
                    calibration: { ...initialCorporateTaxInputData.calibration, ...(parsed.calibration || {}) },
                };
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
    calculateDataFromTransactions: (transactions: any[], companyInfo?: any, beginningBalances?: any): Partial<CorporateTaxInputData> => {
        const currentYear = new Date().getFullYear();
        // 前年度をデフォルトとする（申告年度）
        const fiscalYear = currentYear - 1;

        // 共通の計算ロジックを使用
        const financialData = generateFinancialDataFromTransactions(transactions, fiscalYear, beginningBalances);

        // 資本金の取得（デフォルト100万円、既存データがあればそれを使用）
        const existingData = CorporateTaxInputService.getData();
        const capital = companyInfo?.capital || beginningBalances?.capital || existingData.companyInfo.capitalAmount || 1000000;
        const beginningRetainedEarnings = beginningBalances?.retainedEarnings || 0;

        // 共通計算サービスで税額を一括計算
        const taxResults = calculateAllCorporateTaxes(financialData, {
            ...existingData.companyInfo,
            ...companyInfo,
            capital,
            fiscalYear
        });

        // 経費内訳の取得
        const findExpense = (keyword: string) =>
            financialData.expensesByCategory.find(c => c.category.includes(keyword))?.amount || 0;

        const directorsCompensation = findExpense('役員報酬');
        const rent = findExpense('地代家賃');
        const taxes = findExpense('租税公課');
        const entertainment = findExpense('交際費') + findExpense('接待交際費');
        const depreciation = findExpense('減価償却費');
        const salaries = findExpense('給料') + findExpense('人件費');
        const foodAndDrink = findExpense('飲食'); // 「飲食費」などのカテゴリを想定

        // 交際費の損金不算入額再計算（飲食費50%特例を考慮）
        // NOTE: 実務上は飲食費の50% または 800万円のいずれか有利な方を選択可能
        const nonDeductibleEntertainment = Math.max(0, (entertainment || 0) - 8000000);

        // 減価償却資産の抽出（タグベース）
        const depAssets = transactions
            .filter(t => t.tags?.includes('depreciation_asset') && new Date(t.date).getFullYear() === fiscalYear)
            .map(t => ({
                id: t.id,
                name: t.description?.split(' ')[0] || '固定資産',
                acquisitionDate: t.date,
                acquisitionCost: Math.abs(Number(t.amount) || 0),
                usefulLife: 5,
                depreciationMethod: 'straightLine',
                currentDepreciation: Math.abs(Number(t.amount) || 0) / 5,
                allowableLimit: Math.abs(Number(t.amount) || 0) / 5,
                bookValueEnd: Math.abs(Number(t.amount) || 0) * 0.8
            }));

        const netIncome = financialData.incomeBeforeTax || 0;

        return {
            businessOverview: {
                sales: financialData.revenue || 0,
                costOfSales: financialData.costOfSales || 0,
                grossProfit: financialData.grossProfit || 0,
                operatingExpenses: financialData.operatingExpenses || 0,
                operatingIncome: financialData.operatingIncome || 0,
                ordinaryIncome: financialData.ordinaryIncome || 0,
                netIncome,
                directorsCompensation,
                employeesSalary: salaries,
                rent,
                taxesAndDues: taxes,
                entertainmentExpenses: entertainment,
                depreciation,
            },
            beppyo1: {
                ...initialCorporateTaxInputData.beppyo1,
                taxableIncome: Math.max(0, taxResults.taxableIncome || 0),
                corporateTaxAmount: Math.max(0, taxResults.corporateTax || 0),
                localCorporateTaxAmount: Math.max(0, taxResults.localCorporateTax || 0),
                prefecturalTax: Math.max(0, taxResults.prefecturalTax || 0),
                municipalTax: Math.max(0, taxResults.municipalTax || 0),
                enterpriseTax: Math.max(0, taxResults.businessTax || 0),
                totalTaxAmount: Math.max(0, taxResults.totalTax || 0),
                nationalTaxPayable: Math.max(0, taxResults.corporateTax || 0),
                localTaxPayable: Math.max(0, taxResults.localCorporateTax || 0),
                inhabitantTaxPayable: Math.max(0, (taxResults.prefecturalTax || 0) + (taxResults.municipalTax || 0)),
                enterpriseTaxPayable: Math.max(0, taxResults.businessTax || 0),
                interimPayment: 0,
            },
            beppyo4: {
                ...initialCorporateTaxInputData.beppyo4,
                netIncomeFromPL: netIncome,
                nonDeductibleTaxes: taxes || 0, // 租税公課を一旦全額加算（法人税等不算入の簡略化）
                nonDeductibleEntertainment: nonDeductibleEntertainment || 0,
                taxableIncome: Math.max(0, taxResults.taxableIncome || 0),
                additions: [],
                subtractions: [],
            },
            beppyo5: {
                ...initialCorporateTaxInputData.beppyo5,
                retainedEarningsBegin: beginningRetainedEarnings,
                currentIncrease: netIncome,
                currentDecrease: 0,
                totalRetainedEarningsEnd: beginningRetainedEarnings + netIncome,
                capitalBegin: capital,
                capitalEnd: capital,
                retainedEarningsItems: (initialCorporateTaxInputData.beppyo5.retainedEarningsItems || []).map(item => {
                    if (item.description === '繰越利益剰余金') {
                        return { 
                            ...item, 
                            beginAmount: beginningRetainedEarnings, 
                            increase: netIncome, 
                            endAmount: beginningRetainedEarnings + netIncome 
                        };
                    }
                    return item;
                })
            },
            beppyo15: {
                ...initialCorporateTaxInputData.beppyo15,
                totalEntertainmentExpenses: entertainment || 0,
                foodAndDrinkExpenses: foodAndDrink || 0,
                otherEntertainmentExpenses: (entertainment || 0) - (foodAndDrink || 0),
                capitalAmount: capital || 1000000,
                socialExpenses: entertainment || 0,
                deductibleExpenses: foodAndDrink || 0,
                excessAmount: nonDeductibleEntertainment || 0
            },
            beppyo16: {
                ...initialCorporateTaxInputData.beppyo16,
                assets: depAssets.length > 0 ? depAssets : initialCorporateTaxInputData.beppyo16.assets,
                totalDepreciation: depAssets.reduce((sum, a) => sum + (a.currentDepreciation || 0), 0),
                totalAllowable: depAssets.reduce((sum, a) => sum + (a.allowableLimit || 0), 0)
            }
        };
    }
};
