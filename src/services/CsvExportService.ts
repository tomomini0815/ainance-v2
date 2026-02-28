import { CorporateTaxInputData } from '../types/corporateTaxInput';
import { JpTaxFormData } from './pdfJapaneseService';

/**
 * e-Tax提出用CSV生成サービス
 * 
 * (A) 勘定科目内訳明細書CSV — e-Taxソフトに直接組み込み可能なCSV
 *     ファイル名: HOI010_4.0.csv 等（様式ID_バージョン.csv）
 *     フォーマット: 行区分,集計区分,勘定科目,相手先,住所,期末残高,摘要
 *     文字コード: Shift_JIS（ブラウザの Blob では UTF-8 BOM 付きで代替）
 *     金額: カンマなし半角数字、負の値は先頭に -
 * 
 * (B) 財務諸表CSV — 会計ソフト参照用（e-Tax提出は .xtx で行う）
 */
export const CsvExportService = {

    // ==========================================================
    // (A) 勘定科目内訳明細書CSV — e-Tax HOIフォーマット
    // ==========================================================

    /**
     * 預貯金等の内訳書 (HOI010)
     * レコード: 行区分,集計区分,勘定科目,金融機関名,支店名,預金種類,口座番号,期末残高,摘要
     */
    generateDepositMeisaiCSV: (_data: CorporateTaxInputData): string => {
        const rows: string[] = [];
        // 合計行を1行だけ出力（詳細がない場合）
        rows.push(`3,1,預貯金,,,,,0,`);
        return rows.join('\r\n');
    },

    /**
     * 売掛金（未収入金）の内訳書 (HOI030)
     * レコード: 行区分,集計区分,勘定科目,相手先名称,住所,期末残高,摘要
     */
    generateReceivableMeisaiCSV: (_data: CorporateTaxInputData): string => {
        const rows: string[] = [];
        rows.push(`3,1,売掛金,,,,`);
        return rows.join('\r\n');
    },

    /**
     * 全ての勘定科目内訳明細書をまとめてダウンロード
     * 各内訳書を個別CSVファイルとして生成
     */
    generateAllMeisaiFiles: (data: CorporateTaxInputData): { fileName: string; content: string }[] => {
        return [
            { fileName: 'HOI010_4.0.csv', content: CsvExportService.generateDepositMeisaiCSV(data) },
            { fileName: 'HOI030_4.0.csv', content: CsvExportService.generateReceivableMeisaiCSV(data) },
        ];
    },

    // ==========================================================
    // (B) 財務諸表CSV — 会計ソフト参照用
    //     ※ e-Taxへの財務諸表提出は .xtx (XBRL) で行う
    // ==========================================================

    generateFinancialStatementCSV: (data: CorporateTaxInputData | JpTaxFormData): string => {
        const isInputData = (d: any): d is CorporateTaxInputData => 'financialStatements' in d;

        const rows: string[][] = [];
        
        // ヘッダー
        rows.push(['帳票区分', '科目コード', '科目名', '期末残高', '貸借区分', '備考']);

        if (isInputData(data)) {
            const bs = data.financialStatements.balanceSheet;
            const bo = data.businessOverview;

            // financialStatements.incomeStatement が未入力（全て0）の場合は businessOverview から自動反映
            const fspl = data.financialStatements.incomeStatement;
            const plHasData = fspl.netSales !== 0 || fspl.costOfSales !== 0 || fspl.sellingGeneralAdminExpenses !== 0;

            const pl = plHasData ? {
                netSales: fspl.netSales,
                costOfSales: fspl.costOfSales,
                grossProfit: fspl.grossProfit,
                sellingGeneralAdminExpenses: fspl.sellingGeneralAdminExpenses,
                operatingIncome: fspl.operatingIncome,
                nonOperatingIncome: fspl.nonOperatingIncome,
                nonOperatingExpenses: fspl.nonOperatingExpenses,
                ordinaryIncome: fspl.ordinaryIncome,
                extraordinaryIncome: fspl.extraordinaryIncome,
                extraordinaryLoss: fspl.extraordinaryLoss,
                incomeBeforeTax: fspl.incomeBeforeTax,
                incomeTaxes: fspl.incomeTaxes,
                netIncome: fspl.netIncome,
            } : {
                // businessOverview からフォールバック
                netSales: bo.sales,
                costOfSales: bo.costOfSales,
                grossProfit: bo.grossProfit,
                sellingGeneralAdminExpenses: bo.operatingExpenses,
                operatingIncome: bo.operatingIncome,
                nonOperatingIncome: 0,
                nonOperatingExpenses: 0,
                ordinaryIncome: bo.ordinaryIncome,
                extraordinaryIncome: 0,
                extraordinaryLoss: 0,
                incomeBeforeTax: bo.netIncome,
                incomeTaxes: 0,
                netIncome: bo.netIncome,
            };

            // B/S が未入力の場合は資本金だけ反映
            const bsHasData = bs.currentAssets !== 0 || bs.fixedAssets !== 0 || bs.currentLiabilities !== 0;
            const bsData = bsHasData ? bs : {
                ...bs,
                capitalStock: data.companyInfo?.capitalAmount || bs.capitalStock,
                totalNetAssets: data.companyInfo?.capitalAmount || bs.capitalStock,
                totalLiabilitiesAndNetAssets: data.companyInfo?.capitalAmount || bs.capitalStock,
            };

            // 貸借対照表 (B/S)
            rows.push(['BS', 'BS100', '流動資産合計', String(bsData.currentAssets), '借方', '']);
            rows.push(['BS', 'BS200', '固定資産合計', String(bsData.fixedAssets), '借方', '']);
            rows.push(['BS', 'BS300', '繰延資産合計', String(bsData.deferredAssets), '借方', '']);
            rows.push(['BS', 'BS999', '資産合計', String(bsData.totalAssets), '借方', '']);
            rows.push(['BS', 'BS400', '流動負債合計', String(bsData.currentLiabilities), '貸方', '']);
            rows.push(['BS', 'BS500', '固定負債合計', String(bsData.fixedLiabilities), '貸方', '']);
            rows.push(['BS', 'BS599', '負債合計', String(bsData.totalLiabilities), '貸方', '']);
            rows.push(['BS', 'BS600', '資本金', String(bsData.capitalStock), '貸方', '']);
            rows.push(['BS', 'BS610', '資本剰余金', String(bsData.capitalSurplus), '貸方', '']);
            rows.push(['BS', 'BS620', '利益剰余金', String(bsData.retainedEarnings), '貸方', '']);
            rows.push(['BS', 'BS630', '自己株式', String(bsData.treasuryStock), '借方', '控除項目']);
            rows.push(['BS', 'BS699', '純資産合計', String(bsData.totalNetAssets), '貸方', '']);
            rows.push(['BS', 'BS799', '負債純資産合計', String(bsData.totalLiabilitiesAndNetAssets), '貸方', '']);

            // 損益計算書 (P/L)
            rows.push(['PL', 'PL100', '売上高', String(pl.netSales), '貸方', '']);
            rows.push(['PL', 'PL200', '売上原価', String(pl.costOfSales), '借方', '']);
            rows.push(['PL', 'PL300', '売上総利益', String(pl.grossProfit), '貸方', '自動計算']);
            rows.push(['PL', 'PL400', '販売費及び一般管理費', String(pl.sellingGeneralAdminExpenses), '借方', '']);

            // 販管費の内訳（businessOverviewから）
            if (!plHasData && bo.directorsCompensation > 0) rows.push(['PL', 'PL410', '　役員報酬', String(bo.directorsCompensation), '借方', '内訳']);
            if (!plHasData && bo.employeesSalary > 0) rows.push(['PL', 'PL411', '　給料賃金', String(bo.employeesSalary), '借方', '内訳']);
            if (!plHasData && bo.rent > 0) rows.push(['PL', 'PL412', '　地代家賃', String(bo.rent), '借方', '内訳']);
            if (!plHasData && bo.taxesAndDues > 0) rows.push(['PL', 'PL413', '　租税公課', String(bo.taxesAndDues), '借方', '内訳']);
            if (!plHasData && bo.entertainmentExpenses > 0) rows.push(['PL', 'PL414', '　交際費', String(bo.entertainmentExpenses), '借方', '内訳']);
            if (!plHasData && bo.depreciation > 0) rows.push(['PL', 'PL415', '　減価償却費', String(bo.depreciation), '借方', '内訳']);

            rows.push(['PL', 'PL500', '営業利益', String(pl.operatingIncome), '貸方', '自動計算']);
            rows.push(['PL', 'PL510', '営業外収益', String(pl.nonOperatingIncome), '貸方', '']);
            rows.push(['PL', 'PL520', '営業外費用', String(pl.nonOperatingExpenses), '借方', '']);
            rows.push(['PL', 'PL600', '経常利益', String(pl.ordinaryIncome), '貸方', '自動計算']);
            rows.push(['PL', 'PL610', '特別利益', String(pl.extraordinaryIncome), '貸方', '']);
            rows.push(['PL', 'PL620', '特別損失', String(pl.extraordinaryLoss), '借方', '']);
            rows.push(['PL', 'PL700', '税引前当期純利益', String(pl.incomeBeforeTax), '貸方', '自動計算']);
            rows.push(['PL', 'PL800', '法人税住民税及び事業税', String(pl.incomeTaxes), '借方', '']);
            rows.push(['PL', 'PL900', '当期純利益', String(pl.netIncome), '貸方', '自動計算']);
        } else {
            // JpTaxFormData (legacy)
            rows.push(['PL', 'PL100', '売上高', String(data.revenue), '貸方', '']);
            rows.push(['PL', 'PL400', '費用合計', String(data.expenses), '借方', '']);
            data.expensesByCategory.forEach(exp => {
                 rows.push(['PL', '', `　${exp.category}`, String(exp.amount), '借方', '']);
            });
            rows.push(['PL', 'PL900', '当期純利益', String(data.netIncome), '貸方', '']);
        }

        return rows.map(row => row.join(',')).join('\r\n');
    },

    // ==========================================================
    // ダウンロードユーティリティ
    // ==========================================================

    downloadCSV: (csvContent: string, fileName: string) => {
        const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
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
    },

    /**
     * 複数のCSVファイルを個別にダウンロード（ZIPライブラリなしの簡易実装）
     */
    downloadAllMeisaiCSVs: (data: CorporateTaxInputData) => {
        const files = CsvExportService.generateAllMeisaiFiles(data);
        files.forEach((file, index) => {
            setTimeout(() => {
                CsvExportService.downloadCSV(file.content, file.fileName);
            }, index * 500); // ブラウザの同時ダウンロード制限回避
        });
    }
};
