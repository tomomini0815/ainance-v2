import { PDFDocument, PDFFont, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { CorporateTaxInputData } from '../types/corporateTaxInput';

async function loadFont(pdfDoc: PDFDocument): Promise<PDFFont> {
    pdfDoc.registerFontkit(fontkit);

    const fontPaths = [
        '/fonts/NotoSansCJKjp-Regular.ttf',
        '/fonts/NotoSansCJKjp-Regular.otf',
        '/fonts/NotoSansJP-Regular.ttf'
    ];

    for (const url of fontPaths) {
        try {
            const resp = await fetch(url);
            if (!resp.ok) continue;
            const fontBytes = await resp.arrayBuffer();
            return await pdfDoc.embedFont(fontBytes);
        } catch (e) {
            console.warn(`[FinancialStatements] Failed to load font from ${url}:`, e);
            continue;
        }
    }

    console.warn('[FinancialStatements] All Japanese font loading attempts failed, falling back to Helvetica (Caution: Japanese characters will fail)');
    return await pdfDoc.embedStandardFont(StandardFonts.Helvetica);
}

export async function generateFinancialStatementsPDF(data: CorporateTaxInputData): Promise<Uint8Array> {
    const newPdfDoc = await PDFDocument.create();
    const font = await loadFont(newPdfDoc);
    const fontBold = font; // Use same Japanese font for simplicity, or load bold if available
    
    const page = newPdfDoc.addPage([595.28, 841.89]); // A4
    const { height } = page.getSize();
    
    let y = height - 50;
    
    // Title
    page.drawText('財務諸表 (Financial Statements)', { x: 50, y, size: 18, font: fontBold });
    y -= 30;
    
    page.drawText(`会社名: ${data.companyInfo.corporateName}`, { x: 50, y, size: 12, font });
    y -= 20;
    page.drawText(`期間: ${data.companyInfo.fiscalYearStart} - ${data.companyInfo.fiscalYearEnd}`, { x: 50, y, size: 12, font });
    y -= 40;
    
    // Balance Sheet
    page.drawText('貸借対照表 (Balance Sheet)', { x: 50, y, size: 14, font: fontBold });
    y -= 25;
    
    const bs = data.financialStatements.balanceSheet;
    const bsItems = [
        { label: '流動資産 (Current Assets)', value: bs.currentAssets },
        { label: '固定資産 (Fixed Assets)', value: bs.fixedAssets },
        { label: '繰延資産 (Deferred Assets)', value: bs.deferredAssets },
        { label: '資産合計 (Total Assets)', value: bs.totalAssets, isTotal: true },
        { label: '', value: null }, // spacer
        { label: '流動負債 (Current Liabilities)', value: bs.currentLiabilities },
        { label: '固定負債 (Fixed Liabilities)', value: bs.fixedLiabilities },
        { label: '負債合計 (Total Liabilities)', value: bs.totalLiabilities, isTotal: true },
        { label: '', value: null },
        { label: '純資産合計 (Net Assets)', value: bs.totalNetAssets, isTotal: true },
        { label: '負債純資産合計 (Total Liabilities and Net Assets)', value: bs.totalLiabilitiesAndNetAssets, isTotal: true },
    ];
    
    bsItems.forEach(item => {
        if (item.value === null) {
            y -= 10;
            return;
        }
        if (item.isTotal) {
            page.drawText(item.label, { x: 50, y, size: 11, font: fontBold });
        } else {
            page.drawText(item.label, { x: 50, y, size: 11, font });
        }
        const valStr = (item.value || 0).toLocaleString();
        page.drawText(valStr, { x: 250, y, size: 11, font });
        y -= 18;
    });
    
    y -= 35;
    
    // Income Statement
    page.drawText('損益計算書 (Income Statement)', { x: 50, y, size: 14, font: fontBold });
    y -= 25;
    
    const pl = data.financialStatements.incomeStatement;
    const isItems = [
        { label: '売上高 (Net Sales)', value: pl.netSales },
        { label: '売上原価 (Cost of Sales)', value: pl.costOfSales },
        { label: '売上総利益 (Gross Profit)', value: pl.grossProfit, isTotal: true },
        { label: '販売費及び一般管理費 (SGA Expenses)', value: pl.sellingGeneralAdminExpenses },
        { label: '営業利益 (Operating Income)', value: pl.operatingIncome, isTotal: true },
        { label: '営業外収益 (Non-Operating Income)', value: pl.nonOperatingIncome },
        { label: '営業外費用 (Non-Operating Expenses)', value: pl.nonOperatingExpenses },
        { label: '経常利益 (Ordinary Income)', value: pl.ordinaryIncome, isTotal: true },
        { label: '特別利益 (Extraordinary Income)', value: pl.extraordinaryIncome },
        { label: '特別損失 (Extraordinary Loss)', value: pl.extraordinaryLoss },
        { label: '税引前当期純利益 (Income Before Tax)', value: pl.incomeBeforeTax, isTotal: true },
        { label: '法人税、住民税及び事業税等 (Income Taxes)', value: pl.incomeTaxes },
        { label: '当期純利益 (Net Income)', value: pl.netIncome, isTotal: true },
    ];
    
    isItems.forEach(item => {
        if (item.isTotal) {
            page.drawText(item.label, { x: 50, y, size: 11, font: fontBold });
        } else {
            page.drawText(item.label, { x: 50, y, size: 11, font });
        }
        const valStr = (item.value || 0).toLocaleString();
        page.drawText(valStr, { x: 250, y, size: 11, font });
        y -= 18;
    });

    return await newPdfDoc.save();
}
