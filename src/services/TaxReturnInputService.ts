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

    calculateDataFromTransactions: (transactions: any[]): Partial<TaxReturnInputData> => {
        const result: Partial<TaxReturnInputData> = {
            income: { ...initialTaxReturnInputData.income },
            deductions: { ...initialTaxReturnInputData.deductions },
            withholding_tax_details: [],
            insurance_premium_details: {
                social_insurance: [],
                life_insurance: [],
                earthquake_insurance: [],
            },
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

        // 2. 控除の計算（カテゴリ名による簡易マッチング）と第二表の明細の抽出
        transactions.filter(t => t.type === 'expense').forEach((t, i) => {
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
                    result.insurance_premium_details?.social_insurance.push({
                        id: `soc-${i}`,
                        type: textToSearch.includes('年金') ? '国民年金' : (textToSearch.includes('健康保険') ? '国民健康保険' : '社会保険料'),
                        amount: amount
                    });
                } else if (textToSearch.includes('生命保険')) {
                    result.deductions.life_insurance += amount;
                    result.insurance_premium_details?.life_insurance.push({
                        id: `life-${i}`,
                        insurance_company: description || '生命保険会社',
                        payment_amount: amount,
                        insurance_type: '一般',
                        term: '',
                        beneficiary: '',
                        classification: 'general'
                    });
                } else if (textToSearch.includes('地震保険')) {
                    result.deductions.earthquake_insurance += amount;
                    result.insurance_premium_details?.earthquake_insurance.push({
                        id: `eq-${i}`,
                        insurance_company: description || '損害保険会社',
                        payment_amount: amount,
                        insurance_type: '地震',
                        term: '',
                        beneficiary: '',
                        classification: 'earthquake'
                    });
                } else if (textToSearch.includes('寄付') || textToSearch.includes('ふるさと納税')) {
                    result.deductions.donation += amount;
                }
            }
        });

        // 3. 源泉徴収税額の抽出 (売上から引かれている、または「源泉」というキーワードがある場合)
        transactions.filter(t => t.type === 'income').forEach((t, i) => {
            const amount = getAmount(t);
            const category = (t.category || '').toString();
            const item = (t.item || '').toString();
            const description = (t.description || '').toString();
            const textToSearch = `${category} ${item} ${description}`;

            // 源泉徴収の記録がある、または摘要に「源泉」などが含まれる場合
            // Note: 実際のデータ構造に依存しますが、ここでは簡易的にキーワード判定または税額フィールドがあるかチェックします
            const withholdingTax = t.withholdingTax || t.taxAmount || 0;
            if (withholdingTax > 0 || textToSearch.includes('源泉') || textToSearch.includes('報酬')) {
                // 文字列から税額を推定する簡易ロジック（実際は明示的な入力欄が必要）
                const estimatedTax = withholdingTax > 0 ? withholdingTax : Math.floor(amount * 0.1021); 
                
                if (estimatedTax > 0) {
                     result.withholding_tax_details?.push({
                        id: `withhold-${i}`,
                        income_category: '事業', // または報酬など
                        payer_name: description || '支払者',
                        revenue_amount: amount,
                        tax_amount: estimatedTax,
                     });
                     
                     // 第一表の源泉徴収税額にも加算
                     if (!result.tax_calculation) {
                         result.tax_calculation = { ...initialTaxReturnInputData.tax_calculation };
                     }
                     result.tax_calculation.withholding_tax = (result.tax_calculation.withholding_tax || 0) + estimatedTax;
                }
            }
        });

        return result;
    }
};
