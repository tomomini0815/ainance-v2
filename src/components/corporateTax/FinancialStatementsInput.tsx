import React, { useState } from 'react';
import { CorporateTaxInputData } from '../../types/corporateTaxInput';

interface Props {
    data: CorporateTaxInputData;
    onChange: (data: CorporateTaxInputData) => void;
}

export const FinancialStatementsInput: React.FC<Props> = ({ data, onChange }) => {
    const [subTab, setSubTab] = useState<'bs' | 'pl'>('bs');

    const handleBsChange = (field: keyof CorporateTaxInputData['financialStatements']['balanceSheet'], value: number) => {
        const newBs = { ...data.financialStatements.balanceSheet, [field]: value };

        // Auto-calculate totals
        newBs.totalAssets = newBs.currentAssets + newBs.fixedAssets + newBs.deferredAssets;
        newBs.totalLiabilities = newBs.currentLiabilities + newBs.fixedLiabilities;
        newBs.totalNetAssets = newBs.capitalStock + newBs.capitalSurplus + newBs.retainedEarnings - newBs.treasuryStock;
        newBs.totalLiabilitiesAndNetAssets = newBs.totalLiabilities + newBs.totalNetAssets;

        onChange({
            ...data,
            financialStatements: {
                ...data.financialStatements,
                balanceSheet: newBs
            }
        });
    };

    const handlePlChange = (field: keyof CorporateTaxInputData['financialStatements']['incomeStatement'], value: number) => {
        const newPl = { ...data.financialStatements.incomeStatement, [field]: value };

        // Auto-calculate totals
        newPl.grossProfit = newPl.netSales - newPl.costOfSales;
        newPl.operatingIncome = newPl.grossProfit - newPl.sellingGeneralAdminExpenses;
        newPl.ordinaryIncome = newPl.operatingIncome + newPl.nonOperatingIncome - newPl.nonOperatingExpenses;
        newPl.incomeBeforeTax = newPl.ordinaryIncome + newPl.extraordinaryIncome - newPl.extraordinaryLoss;
        newPl.netIncome = newPl.incomeBeforeTax - newPl.incomeTaxes;

        onChange({
            ...data,
            financialStatements: {
                ...data.financialStatements,
                incomeStatement: newPl
            }
        });
    };

    const bs = data.financialStatements.balanceSheet;
    const pl = data.financialStatements.incomeStatement;

    const renderInputRow = (label: string, field: string, value: number, onChangeHandler: (f: any, v: number) => void, isTotal = false) => (
        <tr className={isTotal ? "bg-surface-highlight/10 font-bold" : ""}>
            <td className="p-3 border-b border-border">{label}</td>
            <td className="p-3 border-b border-border">
                {isTotal ? (
                    <div className="text-right pr-3">{value.toLocaleString()}</div>
                ) : (
                    <input
                        type="number"
                        className="w-full bg-surface border border-border text-text-main rounded p-2 text-right focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        value={value === 0 ? '' : value}
                        onChange={(e) => onChangeHandler(field, Number(e.target.value) || 0)}
                        placeholder="0"
                    />
                )}
            </td>
        </tr>
    );

    return (
        <div className="space-y-6">
            <div className="bg-surface p-6 rounded-xl border border-border">
                <div className="flex border-b border-border mb-6">
                    <button
                        className={`py-2 px-4 font-bold border-b-2 transition-colors ${subTab === 'bs' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-main'}`}
                        onClick={() => setSubTab('bs')}
                    >
                        貸借対照表 (B/S)
                    </button>
                    <button
                        className={`py-2 px-4 font-bold border-b-2 transition-colors ${subTab === 'pl' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-main'}`}
                        onClick={() => setSubTab('pl')}
                    >
                        損益計算書 (P/L)
                    </button>
                </div>

                {subTab === 'bs' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* 資産の部 */}
                        <div>
                            <h3 className="font-bold text-text-main mb-3 bg-surface-highlight p-2 rounded">資産の部</h3>
                            <table className="w-full text-sm text-left text-text-main">
                                <tbody>
                                    {renderInputRow('流動資産', 'currentAssets', bs.currentAssets, handleBsChange)}
                                    {renderInputRow('固定資産', 'fixedAssets', bs.fixedAssets, handleBsChange)}
                                    {renderInputRow('繰延資産', 'deferredAssets', bs.deferredAssets, handleBsChange)}
                                    {renderInputRow('資産合計', 'totalAssets', bs.totalAssets, handleBsChange, true)}
                                </tbody>
                            </table>
                        </div>

                        {/* 負債・純資産の部 */}
                        <div>
                            <h3 className="font-bold text-text-main mb-3 bg-surface-highlight p-2 rounded">負債の部</h3>
                            <table className="w-full text-sm text-left text-text-main mb-6">
                                <tbody>
                                    {renderInputRow('流動負債', 'currentLiabilities', bs.currentLiabilities, handleBsChange)}
                                    {renderInputRow('固定負債', 'fixedLiabilities', bs.fixedLiabilities, handleBsChange)}
                                    {renderInputRow('負債合計', 'totalLiabilities', bs.totalLiabilities, handleBsChange, true)}
                                </tbody>
                            </table>

                            <h3 className="font-bold text-text-main mb-3 bg-surface-highlight p-2 rounded">純資産の部</h3>
                            <table className="w-full text-sm text-left text-text-main">
                                <tbody>
                                    {renderInputRow('資本金', 'capitalStock', bs.capitalStock, handleBsChange)}
                                    {renderInputRow('資本剰余金', 'capitalSurplus', bs.capitalSurplus, handleBsChange)}
                                    {renderInputRow('利益剰余金', 'retainedEarnings', bs.retainedEarnings, handleBsChange)}
                                    {renderInputRow('自己株式 (控除)', 'treasuryStock', bs.treasuryStock, handleBsChange)}
                                    {renderInputRow('純資産合計', 'totalNetAssets', bs.totalNetAssets, handleBsChange, true)}
                                    {renderInputRow('負債純資産合計', 'totalLiabilitiesAndNetAssets', bs.totalLiabilitiesAndNetAssets, handleBsChange, true)}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {subTab === 'pl' && (
                    <div className="max-w-2xl mx-auto">
                        <h3 className="font-bold text-text-main mb-3 bg-surface-highlight p-2 rounded">損益計算書科目</h3>
                        <table className="w-full text-sm text-left text-text-main">
                            <tbody>
                                {renderInputRow('売上高', 'netSales', pl.netSales, handlePlChange)}
                                {renderInputRow('売上原価', 'costOfSales', pl.costOfSales, handlePlChange)}
                                {renderInputRow('売上総利益', 'grossProfit', pl.grossProfit, handlePlChange, true)}
                                <tr><td colSpan={2} className="h-4"></td></tr>
                                {renderInputRow('販売費及び一般管理費', 'sellingGeneralAdminExpenses', pl.sellingGeneralAdminExpenses, handlePlChange)}
                                {renderInputRow('営業利益', 'operatingIncome', pl.operatingIncome, handlePlChange, true)}
                                <tr><td colSpan={2} className="h-4"></td></tr>
                                {renderInputRow('営業外収益', 'nonOperatingIncome', pl.nonOperatingIncome, handlePlChange)}
                                {renderInputRow('営業外費用', 'nonOperatingExpenses', pl.nonOperatingExpenses, handlePlChange)}
                                {renderInputRow('経常利益', 'ordinaryIncome', pl.ordinaryIncome, handlePlChange, true)}
                                <tr><td colSpan={2} className="h-4"></td></tr>
                                {renderInputRow('特別利益', 'extraordinaryIncome', pl.extraordinaryIncome, handlePlChange)}
                                {renderInputRow('特別損失', 'extraordinaryLoss', pl.extraordinaryLoss, handlePlChange)}
                                {renderInputRow('税引前当期純利益', 'incomeBeforeTax', pl.incomeBeforeTax, handlePlChange, true)}
                                <tr><td colSpan={2} className="h-4"></td></tr>
                                {renderInputRow('法人税、住民税及び事業税等', 'incomeTaxes', pl.incomeTaxes, handlePlChange)}
                                {renderInputRow('当期純利益', 'netIncome', pl.netIncome, handlePlChange, true)}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {(bs.totalAssets !== bs.totalLiabilitiesAndNetAssets) && subTab === 'bs' && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg">
                    <strong>警告:</strong> 資産合計（{bs.totalAssets.toLocaleString()}円）と負債純資産合計（{bs.totalLiabilitiesAndNetAssets.toLocaleString()}円）が一致していません。
                    差額: {Math.abs(bs.totalAssets - bs.totalLiabilitiesAndNetAssets).toLocaleString()}円
                </div>
            )}
        </div>
    );
};
