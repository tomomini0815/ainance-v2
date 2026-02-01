import { TaxReturnInputData, initialTaxReturnInputData } from '../types/taxReturnInput';

const STORAGE_KEY = 'ainance_tax_return_input_data';

export const TaxReturnInputService = {
    // データを保存
    saveData: (data: TaxReturnInputData): void => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save tax return input data:', error);
        }
    },

    // データを取得
    getData: (): TaxReturnInputData => {
        try {
            const storedData = localStorage.getItem(STORAGE_KEY);
            if (storedData) {
                const parsed = JSON.parse(storedData);
                // マージして新しいフィールドがあれば初期値で補完
                return { ...initialTaxReturnInputData, ...parsed };
            }
        } catch (error) {
            console.error('Failed to load tax return input data:', error);
        }
        return initialTaxReturnInputData;
    },

    // データをリセット
    resetData: (): void => {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.error('Failed to reset tax return input data:', error);
        }
    },

    // 特定のフィールドを更新 (Deep Merge的な簡易実装)
    updateData: (updates: Partial<TaxReturnInputData>): TaxReturnInputData => {
        const currentData = TaxReturnInputService.getData();
        const newData = { ...currentData, ...updates };
        TaxReturnInputService.saveData(newData);
        return newData;
    },

    // 取引データから申告書データを計算
    calculateDataFromTransactions: (transactions: any[]): Partial<TaxReturnInputData> => {
        const result: Partial<TaxReturnInputData> = {
            income: { ...initialTaxReturnInputData.income },
            deductions: { ...initialTaxReturnInputData.deductions }
        };

        // 金額のパース用ヘルパー
        const getAmount = (t: any) => {
            if (typeof t.amount === 'number') return t.amount;
            if (typeof t.amount === 'string') return parseFloat(t.amount.replace(/,/g, ''));
            return 0;
        };

        // 1. 事業収入の計算
        const businessIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + getAmount(t), 0);
        
        if (result.income) {
            result.income.business_agriculture = businessIncome;
        }

        // 2. 控除の計算（カテゴリ名による簡易マッチング）
        transactions.filter(t => t.type === 'expense').forEach(t => {
            const amount = getAmount(t);
            const category = (t.category || '').toString();
            const item = (t.item || '').toString();
            const description = (t.description || '').toString();
            const textToSearch = `${category} ${item} ${description}`;

            if (result.deductions) {
                if (textToSearch.includes('医療費')) {
                    result.deductions.medical_expenses += amount;
                } else if (textToSearch.includes('社会保険') || textToSearch.includes('年金') || textToSearch.includes('健康保険')) {
                    result.deductions.social_insurance += amount;
                } else if (textToSearch.includes('生命保険')) {
                    result.deductions.life_insurance += amount;
                } else if (textToSearch.includes('地震保険')) {
                    result.deductions.earthquake_insurance += amount;
                } else if (textToSearch.includes('寄付') || textToSearch.includes('ふるさと納税')) {
                    result.deductions.donation += amount;
                }
            }
        });

        return result;
    }
};
