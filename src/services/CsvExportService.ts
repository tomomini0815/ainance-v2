import { CorporateTaxInputData } from '../types/corporateTaxInput';
import { JpTaxFormData } from './pdfJapaneseService';

/**
 * 財務諸表（損益計算書・貸借対照表）をCSV形式で生成する
 * e-Taxソフトや会計ソフトでのインポートを想定した標準的な形式
 */
export const CsvExportService = {
    generateFinancialStatementCSV: (data: CorporateTaxInputData | JpTaxFormData): string => {
        // データ識別（型ガード的な簡易チェック）
        const isInputData = (d: any): d is CorporateTaxInputData => 'businessOverview' in d;
        
        let companyName = '';
        let fiscalYear = 0;
        let revenue = 0;
        let expenses = 0;
        
        // データの正規化
        if (isInputData(data)) {
            // CorporateTaxInputDataの場合
            companyName = ''; // データに含まれていないため空
            fiscalYear = new Date().getFullYear() - 1; // 簡易的に前年
            revenue = data.businessOverview.sales;
            expenses = data.businessOverview.operatingExpenses + data.businessOverview.costOfSales;
        } else {
            // JpTaxFormDataの場合
            companyName = data.companyName || '';
            fiscalYear = data.fiscalYear;
            revenue = data.revenue;
            expenses = data.expenses;
        }

        const rows: string[][] = [];
        
        // ヘッダー
        rows.push(['識別番号', '会社名', '年度', '帳票区分', '科目名', '金額', '貸借区分']);

        // 共通情報
        const baseRow = ['', companyName, `${fiscalYear}年度`];

        // 損益計算書 (P/L)
        // 収益の部
        rows.push([...baseRow, '損益計算書', '売上高', String(revenue), '貸方']);
        
        // 費用の部
        if (isInputData(data)) {
            const bo = data.businessOverview;
            rows.push([...baseRow, '損益計算書', '売上原価', String(bo.costOfSales), '借方']);
            rows.push([...baseRow, '損益計算書', '販売費及び一般管理費計', String(bo.operatingExpenses), '借方']);
            rows.push([...baseRow, '損益計算書', '　役員報酬', String(bo.directorsCompensation), '借方']);
            rows.push([...baseRow, '損益計算書', '　給料賃金', String(bo.employeesSalary), '借方']);
            rows.push([...baseRow, '損益計算書', '　地代家賃', String(bo.rent), '借方']);
            rows.push([...baseRow, '損益計算書', '　租税公課', String(bo.taxesAndDues), '借方']);
            rows.push([...baseRow, '損益計算書', '　交際費', String(bo.entertainmentExpenses), '借方']);
            rows.push([...baseRow, '損益計算書', '　減価償却費', String(bo.depreciation), '借方']);
            
            // 利益
            rows.push([...baseRow, '損益計算書', '営業利益', String(bo.operatingIncome), '貸方']);
            rows.push([...baseRow, '損益計算書', '経常利益', String(bo.ordinaryIncome), '貸方']);
            rows.push([...baseRow, '損益計算書', '税引前当期純利益', String(bo.netIncome), '貸方']); // InputDataではnetIncomeは税引前を指すことが多い
        } else {
            // JpTaxFormData
            rows.push([...baseRow, '損益計算書', '費用合計', String(expenses), '借方']);
            data.expensesByCategory.forEach(exp => {
                 rows.push([...baseRow, '損益計算書', `　${exp.category}`, String(exp.amount), '借方']);
            });
            rows.push([...baseRow, '損益計算書', '当期純利益', String(data.netIncome), '貸方']);
        }

        // CSV文字列に変換
        return rows.map(row => row.join(',')).join('\r\n');
    },

    downloadCSV: (csvContent: string, fileName: string) => {
        const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' }); // BOM付き
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', fileName);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
};
