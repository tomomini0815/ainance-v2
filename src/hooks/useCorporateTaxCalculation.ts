import { useMemo } from 'react';
import { Transaction } from '../types/transaction';
import { Receipt } from '../services/receiptService';

export const useCorporateTaxCalculation = (transactions: Transaction[], receipts: Receipt[] = [], options: { year?: number } = {}) => {
    return useMemo(() => {
        const now = new Date();
        const currentYear = now.getFullYear();

        // Auto-detect fiscal year: Use current year if data exists, otherwise use latest available year
        // This mirrors the logic in useTaxCalculation for consistency
        const availableYears = Array.from(new Set([
            currentYear,
            currentYear - 1,
            ...transactions.map(t => new Date(t.date).getFullYear()),
            ...receipts.map(r => new Date(r.date).getFullYear())
        ])).sort((a, b) => b - a);

        const defaultYear = availableYears.includes(currentYear) ? currentYear : (availableYears[0] || currentYear);
        const targetYear = options.year || defaultYear;

        const currentMonth = targetYear === currentYear ? now.getMonth() : 11;

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
                const isNegative = /^-|▲/.test(val);
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
            return t.type === 'income' || (t.type !== 'expense' && amount > 0);
        }).reduce((sum, t) => sum + getAmount(t.amount), 0);

        const ytdExpenseFromTx = yearTransactions.filter(t => {
            const amount = parseAmount(t.amount);
            return t.type === 'expense' || (t.type !== 'income' && amount < 0);
        }).reduce((sum, t) => {
            let amount = getAmount(t.amount);

            // 減価償却資産の場合、全額ではなく「今期償却額」を加算する
            if (t.tags?.includes('depreciation_asset')) {
                const depMatch = t.description?.match(/今期\(\d+年\)償却額:¥([\d,]+)/);
                if (depMatch) {
                    amount = parseInt(depMatch[1].replace(/,/g, ''), 10);
                } else {
                    const oldMatch = t.description?.match(/年間償却費: ¥([\d,]+)/);
                    if (oldMatch) {
                        amount = parseInt(oldMatch[1].replace(/,/g, ''), 10);
                    }
                }
            }

            return sum + amount;
        }, 0);

        const ytdExpenseFromReceipts = yearReceipts.reduce((sum, r) => sum + getAmount(r.amount), 0);

        const ytdExpense = ytdExpenseFromTx + ytdExpenseFromReceipts;
        const ytdProfit = Math.max(0, ytdIncome - ytdExpense);

        const monthsPassed = currentMonth + 1;
        const projectedAnnualProfit = (ytdProfit / monthsPassed) * 12;

        console.log('[CorporateTaxDebug] Calculation:', {
            targetYear,
            ytdIncome,
            ytdExpense,
            ytdProfit,
            projectedAnnualProfit
        });

        // --- Simplified Japanese Corporate Tax Estimation ---

        // 1. Corporate Tax (法人税)
        // Profit <= 8M: ~15%
        // Profit > 8M: ~23.2%
        let corporateTax = 0;
        if (projectedAnnualProfit <= 0) {
            corporateTax = 0;
        } else if (projectedAnnualProfit <= 8000000) {
            corporateTax = projectedAnnualProfit * 0.15;
        } else {
            corporateTax = (8000000 * 0.15) + ((projectedAnnualProfit - 8000000) * 0.232);
        }

        // 2. Corporate Inhabitant Tax (法人住民税)
        // Corporation Tax Discount (法人税割): ~12.9% of Corporate Tax (varies, simplified to 12.9%)
        // Per Capita (均等割): ~70,000 JPY (min for SME)
        const inhabitantTaxDiscount = corporateTax * 0.129;
        const inhabitantTaxPerCapita = 70000;
        const residentTax = inhabitantTaxDiscount + inhabitantTaxPerCapita;

        // 3. Enterprise Tax (法人事業税)
        // Simplified tier (approx 3.5% - 7%)
        // For simplicity in forecast: ~3.5% of taxable income + Special Local Corp Tax etc.
        // Let's use a flat simplified effective rate around 5% for safety, or tiered.
        // <= 4M: 3.5%
        // > 4M <= 8M: 5.3%
        // > 8M: 7.0%
        let businessTax = 0;
        if (projectedAnnualProfit > 0) {
            if (projectedAnnualProfit <= 4000000) {
                businessTax = projectedAnnualProfit * 0.035;
            } else if (projectedAnnualProfit <= 8000000) {
                businessTax = (4000000 * 0.035) + ((projectedAnnualProfit - 4000000) * 0.053);
            } else {
                businessTax = (4000000 * 0.035) + (4000000 * 0.053) + ((projectedAnnualProfit - 8000000) * 0.070);
            }
        }

        // 4. Consumption Tax (消費税) could be added here if we track taxable sales, but omitted for now as it matches "Income Tax" scope.
        // Assuming user acts as Tax Collector for consumption tax, but this is "Tax Forecast" for the entity's cost.
        // Usually Consumption Tax is separate. We'll stick to income-based taxes for consistency with Individual mode.

        const totalTax = corporateTax + residentTax + businessTax;
        const monthlyTaxAru = totalTax / 12;

        console.log('[CorporateTaxDebug] Result:', { totalTax, breakdown: { corporateTax, residentTax, businessTax } });

        const chartData = {
            labels: ['法人税', '法人住民税', '法人事業税'],
            datasets: [{
                data: [corporateTax, residentTax, businessTax],
                backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'], // Blue, Emerald, Amber
                borderWidth: 0,
            }]
        };

        return {
            totalTax,
            monthlyTaxAru,
            ytdProfit,
            projectedAnnualProfit,
            chartData,
            breakdown: {
                corporateTax, // Income Tax equivalent
                residentTax,  // Resident Tax equivalent
                businessTax,  // Business Tax equivalent
                healthInsurance: 0 // Not applicable in the same way (Social Insurance is expense usually)
            },
            ytdIncome,
            ytdExpense,
            calculationYear: targetYear,
            selectableYears: availableYears
        };
    }, [transactions, receipts, options.year]);
};
