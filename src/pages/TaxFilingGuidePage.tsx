import React, { useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTransactions } from '../hooks/useTransactions';
import { useBusinessTypeContext } from '../context/BusinessTypeContext';
import { calculateTaxFilingData, generateInitialDeductions } from '../services/TaxFilingService';
import TaxFilingGuide from '../components/TaxFilingGuide';
import { Loader2 } from 'lucide-react';

const TaxFilingGuidePage: React.FC = () => {
    const { user } = useAuth();
    const { currentBusinessType } = useBusinessTypeContext();
    const businessType = currentBusinessType?.business_type || 'individual';
    const { transactions, loading } = useTransactions(user?.id, businessType);

    // 税務データを計算
    const { taxData, deductions, fiscalYear, isBlueReturn } = useMemo(() => {
        const year = new Date().getFullYear() - 1; // 前年度
        const blueReturn = true; // 青色申告を仮定

        // 控除を生成
        const initialDeductions = generateInitialDeductions(blueReturn);

        // calculateTaxFilingDataは transactions, fiscalYear, businessType, deductions を受け取る
        const data = calculateTaxFilingData(
            transactions,
            year,
            businessType as 'individual' | 'corporation',
            initialDeductions
        );

        return {
            taxData: data,
            deductions: initialDeductions,
            fiscalYear: year,
            isBlueReturn: blueReturn,
        };
    }, [transactions, businessType]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
                    <p className="mt-4 text-text-muted">データを読み込み中...</p>
                </div>
            </div>
        );
    }

    return (
        <TaxFilingGuide
            taxData={taxData}
            fiscalYear={fiscalYear}
            isBlueReturn={isBlueReturn}
            deductions={deductions}
        />
    );
};

export default TaxFilingGuidePage;
