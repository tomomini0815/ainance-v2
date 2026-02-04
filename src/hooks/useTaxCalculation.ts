import { useMemo } from 'react';
import { Transaction } from '../types/transaction';
import { Receipt } from '../services/receiptService';

export const useTaxCalculation = (transactions: Transaction[], receipts: Receipt[] = [], options: { enableBlueReturn?: boolean, year?: number } = {}) => {
    return useMemo(() => {
        const now = new Date();
        const currentYear = now.getFullYear();

        // Auto-detect fiscal year: Use current year if data exists, otherwise use latest available year
        // ALWAYS include current year and previous year to allow selection even if no data
        const availableYears = Array.from(new Set([
            currentYear,
            currentYear - 1,
            ...transactions.map(t => new Date(t.date).getFullYear()),
            ...receipts.map(r => new Date(r.date).getFullYear())
        ])).sort((a, b) => b - a); // Descending order

        // If options.year is provided, use it. Otherwise auto-detect.
        const defaultYear = availableYears.includes(currentYear) ? currentYear : (availableYears[0] || currentYear);
        const targetYear = options.year || defaultYear;

        const currentMonth = targetYear === currentYear ? now.getMonth() : 11; // If past year, assume full year (Dec)

        const yearTransactions = transactions.filter(t => {
            const d = new Date(t.date);
            return d.getFullYear() === targetYear && t.approval_status !== 'rejected';
        });

        const yearReceipts = receipts.filter(r => {
            const d = new Date(r.date);
            return d.getFullYear() === targetYear && r.status === 'pending';
        });

        const parseAmount = (val: any): number => {
            if (typeof val === 'number') return val;
            if (typeof val === 'string') {
                // Determine if it's a negative formatted string (e.g. "-1,000" or "▲1000")
                const isNegative = /^-|▲/.test(val);
                // Extract numbers and dots
                const normalized = val.replace(/[^\d.-]/g, '');
                let parsed = parseFloat(normalized);
                if (isNaN(parsed)) return 0;

                return isNegative ? -Math.abs(parsed) : parsed;
            }
            if (typeof val === 'object' && val !== null) {
                const objValue = val.value ?? val.amount ?? val.number ?? 0;
                return parseAmount(objValue);
            }
            return 0;
        };

        const getAmount = (val: any) => Math.abs(parseAmount(val));

        const ytdIncome = yearTransactions.filter(t => {
            const amount = parseAmount(t.amount);
            // Income is type 'income' OR (not expense AND amount > 0)
            return t.type === 'income' || (t.type !== 'expense' && amount > 0);
        }).reduce((sum, t) => sum + getAmount(t.amount), 0);

        const ytdExpenseFromTx = yearTransactions.filter(t => {
            const amount = parseAmount(t.amount);
            // Expense is type 'expense' OR (not income AND amount < 0)
            return t.type === 'expense' || (t.type !== 'income' && amount < 0);
        }).reduce((sum, t) => sum + getAmount(t.amount), 0);

        const ytdExpenseFromReceipts = yearReceipts.reduce((sum, r) => sum + getAmount(r.amount), 0);

        const ytdExpense = ytdExpenseFromTx + ytdExpenseFromReceipts;
        const ytdProfit = Math.max(0, ytdIncome - ytdExpense);

        const monthsPassed = currentMonth + 1;
        const projectedAnnualProfit = (ytdProfit / monthsPassed) * 12;

        // Deduction Logic
        const basicDeduction = 480000;
        const blueReturnDeduction = options.enableBlueReturn ? 650000 : 0;
        const totalDeduction = basicDeduction + blueReturnDeduction;

        // Taxable Income (cannot be negative)
        const taxableIncome = Math.max(0, projectedAnnualProfit - totalDeduction);

        console.log('[TaxDebug] Calculation:', {
            yearTransactionsLen: yearTransactions.length,
            yearReceiptsLen: yearReceipts.length,
            ytdIncome,
            ytdExpense,
            ytdProfit,
            monthsPassed,
            projectedAnnualProfit,
            deductions: { basicDeduction, blueReturnDeduction },
            taxableIncome
        });

        // Simplified Japanese Tax Estimation (Approximate)
        // Use Taxable Income for Income Tax calculation
        let incomeTax = 0;
        if (taxableIncome > 18000000) incomeTax = taxableIncome * 0.40 - 2796000;
        else if (taxableIncome > 9000000) incomeTax = taxableIncome * 0.33 - 1536000;
        else if (taxableIncome > 6950000) incomeTax = taxableIncome * 0.23 - 636000;
        else if (taxableIncome > 3300000) incomeTax = taxableIncome * 0.20 - 427500;
        else if (taxableIncome > 1950000) incomeTax = taxableIncome * 0.10 - 97500;
        else incomeTax = taxableIncome * 0.05;

        // Ensure tax is not calculated for negative profit
        if (taxableIncome <= 0) {
            incomeTax = 0;
        }

        // Resident Tax (approx 10% of Taxable Income)
        const residentTax = taxableIncome * 0.10;

        // Business Tax (Use Profit - 2.9M deduction, not Taxable Income for this specific calc usually, but simplifying here or sticking to profit)
        // Strictly speaking, Business Tax uses "Income for Business Tax purposes" which allows the 2.9M deduction.
        // It does NOT apply the Basic Deduction or Blue Return Deduction in the same way (Blue Return deduction of 650k applies to Income Tax).
        // For simplicity providing a "deduction applied" view, we might keep Business Tax based on Profit - 2.9M as before,
        // OR applying the logic consistent with user expectation of "Deductions applied". 
        // Typically, Blue Return 650k allows deduction from Business Tax income too. Basic deduction (480k) does NOT apply to Business Tax.
        // Let's implement: Business Tax Base = Profit - 2.9M (Basic Deduction doesn't apply). 
        // Blue Return deduction DOES apply to Business Tax income? actually Blue Return 650k is for Income Tax.
        // For Business Tax, there is a separate "Blue Return Deduction" but it's not the 650k one usually.
        // Wait, "Blue Return Special Deduction" (650k) is for Income Tax.
        // For Business Tax, you get a 2.9M deduction (Proprietor Deduction). 
        // Let's leave Business Tax as based on (Profit - 2.9M) to be safe/accurate, ignoring the Basic/Blue toggle for this specific tax line unless requested.
        // User requested comparison, primarily for Income Tax context.
        const businessTax = Math.max(0, projectedAnnualProfit - 2900000) * 0.05;

        // Health Insurance (Based on Profit/Income, usually capped)
        // Health Insurance base is closer to (Profit - Basic Deduction 430k) in some contexts, but sticking to Profit * 10% simplification.
        const healthInsurance = Math.min(projectedAnnualProfit * 0.10, 800000);

        const totalTax = Math.max(0, incomeTax + residentTax + businessTax + healthInsurance);
        const monthlyTaxAru = totalTax / 12;

        console.log('[TaxDebug] Result:', { totalTax, breakdown: { incomeTax, residentTax, businessTax, healthInsurance } });

        const chartData = {
            labels: ['所得税', '住民税', '事業税', '国民健康保険'],
            datasets: [{
                data: [incomeTax, residentTax, businessTax, healthInsurance],
                backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
                borderWidth: 0,
            }]
        };

        return {
            totalTax,
            monthlyTaxAru,
            ytdProfit,
            projectedAnnualProfit,
            taxableIncome,
            deductions: {
                basicDeduction,
                blueReturnDeduction,
                total: totalDeduction
            },
            chartData,
            breakdown: { incomeTax, residentTax, businessTax, healthInsurance },
            ytdIncome,
            ytdExpense,
            calculationYear: targetYear
        };
    }, [transactions, receipts, options.enableBlueReturn, options.year]);
};
