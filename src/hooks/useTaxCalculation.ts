import { useMemo } from 'react';
import { Transaction } from '../types/transaction';
import { Receipt } from '../services/receiptService';

export const useTaxCalculation = (transactions: Transaction[], receipts: Receipt[] = []) => {
    return useMemo(() => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        const yearTransactions = transactions.filter(t => {
            const d = new Date(t.date);
            return d.getFullYear() === currentYear && t.approval_status !== 'rejected';
        });

        const yearReceipts = receipts.filter(r => {
            const d = new Date(r.date);
            return d.getFullYear() === currentYear && r.status === 'pending';
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

        // Simplified Japanese Tax Estimation (Approximate)
        let incomeTax = 0;
        if (projectedAnnualProfit > 18000000) incomeTax = projectedAnnualProfit * 0.40 - 2796000;
        else if (projectedAnnualProfit > 9000000) incomeTax = projectedAnnualProfit * 0.33 - 1536000;
        else if (projectedAnnualProfit > 6950000) incomeTax = projectedAnnualProfit * 0.23 - 636000;
        else if (projectedAnnualProfit > 3300000) incomeTax = projectedAnnualProfit * 0.20 - 427500;
        else if (projectedAnnualProfit > 1950000) incomeTax = projectedAnnualProfit * 0.10 - 97500;
        else incomeTax = projectedAnnualProfit * 0.05;

        const residentTax = projectedAnnualProfit * 0.10;
        const businessTax = Math.max(0, projectedAnnualProfit - 2900000) * 0.05;
        const healthInsurance = Math.min(projectedAnnualProfit * 0.10, 800000);

        const totalTax = Math.max(0, incomeTax + residentTax + businessTax + healthInsurance);
        const monthlyTaxAru = totalTax / 12;

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
            chartData,
            breakdown: { incomeTax, residentTax, businessTax, healthInsurance },
            ytdIncome,
            ytdExpense
        };
    }, [transactions, receipts]);
};
