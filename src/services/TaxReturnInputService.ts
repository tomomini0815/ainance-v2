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
    }
};
