/**
 * Digit-Box PDF Filling Service
 * 
 * Precision placement of individual digits into box-style form fields.
 * This is required for official Japanese tax forms (確定申告書) that use
 * individual boxes for each digit of monetary amounts.
 * 
 * Key Features:
 * - Right-to-left digit placement (right-justified)
 * - Configurable box width and spacing
 * - Center-aligned within each box
 * - Coordinate map for all form fields
 */

import { PDFDocument, PDFPage, PDFFont, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { CorporateTaxInputData } from '../types/corporateTaxInput';

// ===== COORDINATE CONFIGURATION =====

/**
 * Box configuration for digit placement
 * Values are in PDF points (1pt = 1/72 inch ≈ 0.35mm)
 */
export interface DigitBoxConfig {
    // Starting position of the rightmost digit box
    anchorX: number;
    anchorY: number;
    // Width of each digit box
    boxWidth: number;
    // Horizontal spacing between box centers (usually same as boxWidth)
    boxSpacing: number;
    // Font size for digits
    fontSize: number;
    // Number of digit boxes available
    maxDigits: number;
}

/**
 * Text field configuration for company info and other text data
 */
export interface TextFieldConfig {
    x: number;           // X coordinate (from left)
    y: number;           // Y coordinate (from bottom)
    fontSize: number;    // Font size
    maxWidth?: number;   // Maximum width before truncation
    align?: 'left' | 'center' | 'right';
}

/**
 * Text field positions for Beppyo1 header section
 * Calibrated based on visual form layout analysis
 */
export const BEPPYO1_TEXT_FIELDS: { [key: string]: TextFieldConfig } = {
    // ===== 申告書ヘッダー =====
    '税務署名': { x: 85, y: 795, fontSize: 9 },      // 〇〇税務署長殿
    '事業年度_自': { x: 300, y: 810, fontSize: 8 },   // 令和 年 月 日から
    '事業年度_至': { x: 410, y: 810, fontSize: 8 },   // 令和 年 月 日まで
    '法人番号': { x: 440, y: 795, fontSize: 8 },      // 13桁の法人番号

    // ===== 法人基本情報エリア =====
    '法人名': { x: 85, y: 755, fontSize: 10, maxWidth: 200 },
    '法人名カナ': { x: 85, y: 770, fontSize: 7 },
    '郵便番号': { x: 300, y: 770, fontSize: 8 },
    '納税地': { x: 300, y: 755, fontSize: 9, maxWidth: 250 },
    '電話番号': { x: 480, y: 755, fontSize: 8 },

    // ===== 代表者情報エリア =====
    '代表者氏名': { x: 85, y: 725, fontSize: 10, maxWidth: 150 },
    '代表者住所': { x: 250, y: 725, fontSize: 8, maxWidth: 200 },

    // ===== 事業情報 =====
    '事業種目': { x: 85, y: 695, fontSize: 9, maxWidth: 180 },
    '資本金': { x: 300, y: 695, fontSize: 9 },

    // ===== 申告日 =====
    '申告日': { x: 500, y: 780, fontSize: 8 },
};

/**
 * Field mapping for Beppyo1 (別表一)
 * 
 * Coordinates calibrated from actual PDF analysis:
 * - Page size: 595.32 x 841.92 points (A4)
 * - Origin: bottom-left corner (0, 0)
 * - Y increases upward
 * 
 * Final Calibration 2026-02-05:
 * - Shifted X right to 257pt to center digits in boxes
 * - Adjusted Y to align perfectly with row floors
 */
export const BEPPYO1_FIELDS: { [key: string]: DigitBoxConfig } = {
    // ===== 左側カラム (Left Column) =====

    // Row 1: 所得金額又は欠損金額 (別表四「52の①」)
    '所得金額_row1': {
        anchorX: 257.0,
        anchorY: 610.5,
        boxWidth: 16.15,
        boxSpacing: 16.15,
        fontSize: 10,
        maxDigits: 12
    },

    // Row 2: 法人税額 ((48)+(49)+(50))
    '法人税額_row2': {
        anchorX: 257.0,
        anchorY: 590.5,
        boxWidth: 16.15,
        boxSpacing: 16.15,
        fontSize: 10,
        maxDigits: 12
    },

    // Row 13: 差引所得に対する法人税額 ((9)-(10)-(11)-(12))
    '差引法人税額_row13': {
        anchorX: 257.0,
        anchorY: 375.5,
        boxWidth: 16.15,
        boxSpacing: 16.15,
        fontSize: 10,
        maxDigits: 12
    },

    // Row 18: 所得金額の計 (テスト対象: "0")
    '所得合計_row18': {
        anchorX: 257.0,
        anchorY: 278.5,
        boxWidth: 16.15,
        boxSpacing: 16.15,
        fontSize: 10,
        maxDigits: 12
    },

    // Row 28: 法人税額計 (テスト対象: "141940")
    '法人税額計_row28': {
        anchorX: 257.0,
        anchorY: 85.5,
        boxWidth: 16.15,
        boxSpacing: 16.15,
        fontSize: 10,
        maxDigits: 12
    },

    // ===== 右側カラム (Right Column) =====
    // Row 17: 復興特別法人税額
    '復興税額_row17': {
        anchorX: 527.0,
        anchorY: 296.0,
        boxWidth: 16.15,
        boxSpacing: 16.15,
        fontSize: 10,
        maxDigits: 12
    },

    // Row 19: 所得税額等の控除額 ((16)+(17))
    '控除税額_row19': {
        anchorX: 527.0,
        anchorY: 258.0,
        boxWidth: 16.15,
        boxSpacing: 16.15,
        fontSize: 10,
        maxDigits: 12
    },

    // Row 20: 控除しきれなかった金額
    '控除残_row20': {
        anchorX: 527.0,
        anchorY: 238.0,
        boxWidth: 16.15,
        boxSpacing: 16.15,
        fontSize: 10,
        maxDigits: 12
    },

    // Row 22: 中間納付額 ((14)-(13))
    '中間納付_row22': {
        anchorX: 527.0,
        anchorY: 198.5,
        boxWidth: 16.15,
        boxSpacing: 16.15,
        fontSize: 10,
        maxDigits: 12
    },
};

/**
 * Global calibration offsets
 * Adjust these if digits are consistently off-center
 */
export interface CalibrationOffsets {
    globalShiftX: number;  // Positive = move right
    globalShiftY: number;  // Positive = move up
    digitCenterOffsetX: number;  // Fine-tune within box
    digitCenterOffsetY: number;
}

const DEFAULT_CALIBRATION: CalibrationOffsets = {
    globalShiftX: 0,
    globalShiftY: 0,
    digitCenterOffsetX: -3,  // Nudge left to center
    digitCenterOffsetY: 2,   // Nudge up to center
};

// ===== CORE FUNCTIONS =====

/**
 * Load Japanese font for digit rendering
 */
async function loadFont(pdfDoc: PDFDocument): Promise<PDFFont> {
    pdfDoc.registerFontkit(fontkit);

    // Try to load Noto Sans JP for Japanese compatibility
    try {
        const fontUrl = 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-jp@4.5.0/files/noto-sans-jp-japanese-400-normal.woff';
        const fontBytes = await fetch(fontUrl).then(res => res.arrayBuffer());
        return await pdfDoc.embedFont(fontBytes);
    } catch (e) {
        console.warn('[DigitBox] Could not load Japanese font, falling back to Helvetica');
        const { StandardFonts } = await import('pdf-lib');
        return await pdfDoc.embedStandardFont(StandardFonts.Helvetica);
    }
}

/**
 * Fill a single digit box field with a numeric value
 * 
 * @param page - PDF page to draw on
 * @param value - Numeric value to fill
 * @param config - Box configuration for this field
 * @param font - Font to use for digits
 * @param calibration - Optional calibration offsets
 */
export function fillDigitBoxField(
    page: PDFPage,
    value: number,
    config: DigitBoxConfig,
    font: PDFFont,
    calibration: CalibrationOffsets = DEFAULT_CALIBRATION
): { success: boolean; digitsPlaced: number } {
    // Convert to string, remove decimals and negative sign
    const absValue = Math.abs(Math.floor(value));
    const digits = absValue === 0 ? ['0'] : String(absValue).split('');

    // Check if value fits in available boxes
    if (digits.length > config.maxDigits) {
        console.warn(`[DigitBox] Value ${value} exceeds max digits (${config.maxDigits})`);
        return { success: false, digitsPlaced: 0 };
    }

    // Place digits right-to-left (right-justified)
    const reversedDigits = [...digits].reverse();

    reversedDigits.forEach((digit, index) => {
        // Calculate X position (move left from anchor for each digit)
        const x = config.anchorX - (index * config.boxSpacing)
            + calibration.globalShiftX
            + calibration.digitCenterOffsetX;

        // Y position
        const y = config.anchorY
            + calibration.globalShiftY
            + calibration.digitCenterOffsetY;

        // Draw the digit
        page.drawText(digit, {
            x: x,
            y: y,
            size: config.fontSize,
            font: font,
            color: rgb(0, 0, 0.5)  // Dark blue for visibility
        });
    });

    console.log(`[DigitBox] Placed ${digits.length} digits for value ${value}`);
    return { success: true, digitsPlaced: digits.length };
}

/**
 * Fill a text field on the PDF
 * 
 * @param page - PDF page to draw on
 * @param text - Text to place
 * @param config - Text field configuration
 * @param font - Font to use
 * @param calibration - Optional calibration offsets
 */
export function fillTextField(
    page: PDFPage,
    text: string,
    config: TextFieldConfig,
    font: PDFFont,
    calibration: CalibrationOffsets = DEFAULT_CALIBRATION
): { success: boolean } {
    if (!text || text.trim() === '') {
        return { success: false };
    }

    // Apply calibration offsets
    const x = config.x + calibration.globalShiftX;
    const y = config.y + calibration.globalShiftY;

    // Truncate text if maxWidth is specified
    let displayText = text;
    if (config.maxWidth) {
        const charWidth = config.fontSize * 0.6; // Approximate character width
        const maxChars = Math.floor(config.maxWidth / charWidth);
        if (text.length > maxChars) {
            displayText = text.substring(0, maxChars - 1) + '…';
        }
    }

    // Draw the text
    page.drawText(displayText, {
        x: x,
        y: y,
        size: config.fontSize,
        font: font,
        color: rgb(0, 0, 0)  // Black for text
    });

    console.log(`[TextField] Placed text: "${displayText.substring(0, 20)}..." at (${x}, ${y})`);
    return { success: true };
}

/**
 * Format date for Japanese tax forms (令和X年Y月Z日)
 */
function formatJapaneseFiscalDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    const year = date.getFullYear();
    const reiwaYear = year - 2018; // 令和元年 = 2019
    const month = date.getMonth() + 1;
    const day = date.getDate();

    return `${reiwaYear}年${month}月${day}日`;
}

/**
 * Format capital amount (円表記)
 */
function formatCapitalAmount(amount: number): string {
    if (amount >= 100000000) {
        return `${(amount / 100000000).toFixed(0)}億円`;
    } else if (amount >= 10000) {
        return `${(amount / 10000).toFixed(0)}万円`;
    }
    return `${amount.toLocaleString()}円`;
}

/**
 * Fill Beppyo1 form with corporate tax data
 */
export async function fillBeppyo1WithDigitBoxes(
    pdfBytes: Uint8Array,
    data: CorporateTaxInputData,
    calibration: CalibrationOffsets = DEFAULT_CALIBRATION,
    debugMode: boolean = false
): Promise<{ pdfBytes: Uint8Array; report: DigitBoxReport }> {
    const report: DigitBoxReport = {
        template: 'beppyo1',
        fieldsAttempted: 0,
        fieldsSucceeded: 0,
        fieldDetails: [],
        calibrationUsed: calibration
    };

    // Load PDF
    const pdfDoc = await PDFDocument.load(pdfBytes, {
        ignoreEncryption: true,
        throwOnInvalidObject: false
    } as any);

    const font = await loadFont(pdfDoc);
    const page = pdfDoc.getPages()[0];
    const { width, height } = page.getSize();

    console.log(`[DigitBox] Page size: ${width} x ${height}`);

    // Debug mode: Place test values
    if (debugMode) {
        // Test 1: Place "0" in row 18 (所得金額の計)
        const config18 = BEPPYO1_FIELDS['所得合計_row18'];
        const result0 = fillDigitBoxField(page, 0, config18, font, calibration);
        report.fieldDetails.push({
            fieldName: '所得合計_row18 (テスト: 0)',
            value: 0,
            success: result0.success,
            coordinates: { x: config18.anchorX, y: config18.anchorY }
        });

        // Test 2: Place "5000000" in row 1 (所得金額)
        const config1 = BEPPYO1_FIELDS['所得金額_row1'];
        const result5m = fillDigitBoxField(page, 5000000, config1, font, calibration);
        report.fieldDetails.push({
            fieldName: '所得金額_row1 (テスト: 5,000,000)',
            value: 5000000,
            success: result5m.success,
            coordinates: { x: config1.anchorX, y: config1.anchorY }
        });

        report.fieldsAttempted = 2;
        report.fieldsSucceeded = (result0.success ? 1 : 0) + (result5m.success ? 1 : 0);
    } else {
        // Production mode: Fill all fields from data

        // ===== PART 1: Fill numeric digit boxes =====
        const fieldMappings: { fieldKey: string; value: number }[] = [
            { fieldKey: '所得金額_row1', value: data.beppyo4.taxableIncome },
            { fieldKey: '法人税額_row2', value: data.beppyo1.corporateTaxAmount },
            { fieldKey: '差引法人税額_row13', value: data.beppyo1.corporateTaxAmount - data.beppyo1.specialTaxCredit - data.beppyo1.interimPayment },
            { fieldKey: '所得合計_row18', value: data.beppyo4.taxableIncome },
            { fieldKey: '控除税額_row19', value: data.beppyo1.specialTaxCredit },
            { fieldKey: '中間納付_row22', value: data.beppyo1.interimPayment },
        ];

        for (const mapping of fieldMappings) {
            const config = BEPPYO1_FIELDS[mapping.fieldKey];
            if (!config) {
                console.warn(`[DigitBox] Unknown field: ${mapping.fieldKey}`);
                continue;
            }

            report.fieldsAttempted++;
            const result = fillDigitBoxField(page, mapping.value, config, font, calibration);

            if (result.success) {
                report.fieldsSucceeded++;
            }

            report.fieldDetails.push({
                fieldName: mapping.fieldKey,
                value: mapping.value,
                success: result.success,
                coordinates: { x: config.anchorX, y: config.anchorY }
            });
        }

        // ===== PART 2: Fill company information text fields =====
        if (data.companyInfo) {
            console.log('[TextField] Filling company information...');
            const info = data.companyInfo;

            // Text field mappings
            const textMappings: { fieldKey: string; text: string }[] = [
                { fieldKey: '税務署名', text: info.taxOffice },
                { fieldKey: '法人番号', text: info.corporateNumber },
                { fieldKey: '事業年度_自', text: formatJapaneseFiscalDate(info.fiscalYearStart) },
                { fieldKey: '事業年度_至', text: formatJapaneseFiscalDate(info.fiscalYearEnd) },
                { fieldKey: '法人名', text: info.corporateName },
                { fieldKey: '法人名カナ', text: info.corporateNameKana },
                { fieldKey: '郵便番号', text: info.postalCode },
                { fieldKey: '納税地', text: info.address },
                { fieldKey: '電話番号', text: info.phoneNumber },
                { fieldKey: '代表者氏名', text: info.representativeName },
                { fieldKey: '代表者住所', text: info.representativeAddress },
                { fieldKey: '事業種目', text: info.businessType },
                { fieldKey: '資本金', text: formatCapitalAmount(info.capitalAmount) },
                { fieldKey: '申告日', text: formatJapaneseFiscalDate(info.filingDate) },
            ];

            for (const mapping of textMappings) {
                const config = BEPPYO1_TEXT_FIELDS[mapping.fieldKey];
                if (!config) {
                    console.warn(`[TextField] Unknown field: ${mapping.fieldKey}`);
                    continue;
                }

                if (mapping.text && mapping.text.trim() !== '') {
                    report.fieldsAttempted++;
                    const result = fillTextField(page, mapping.text, config, font, calibration);
                    if (result.success) {
                        report.fieldsSucceeded++;
                    }
                    report.fieldDetails.push({
                        fieldName: mapping.fieldKey,
                        value: 0, // Text field, not numeric
                        success: result.success,
                        coordinates: { x: config.x, y: config.y }
                    });
                }
            }
        }
    }

    // Generate output
    const outputBytes = await pdfDoc.save();

    // Log report
    console.log('\n===== DIGIT BOX FILLING REPORT =====');
    console.log(`Template: ${report.template}`);
    console.log(`Success: ${report.fieldsSucceeded}/${report.fieldsAttempted}`);
    console.table(report.fieldDetails);
    console.log('=====================================\n');

    return { pdfBytes: outputBytes, report };
}

/**
 * Report interface for digit box filling
 */
export interface DigitBoxReport {
    template: string;
    fieldsAttempted: number;
    fieldsSucceeded: number;
    fieldDetails: {
        fieldName: string;
        value: number;
        success: boolean;
        coordinates: { x: number; y: number };
    }[];
    calibrationUsed: CalibrationOffsets;
}

/**
 * Generate a test PDF with calibration markers
 * Useful for determining correct coordinates
 */
export async function generateCalibrationTestPDF(
    templateBytes: Uint8Array,
    testPositions: { x: number; y: number; label: string }[]
): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.load(templateBytes, {
        ignoreEncryption: true
    } as any);

    const font = await loadFont(pdfDoc);
    const page = pdfDoc.getPages()[0];

    // Draw markers at each test position
    for (const pos of testPositions) {
        // Draw crosshair
        page.drawLine({
            start: { x: pos.x - 10, y: pos.y },
            end: { x: pos.x + 10, y: pos.y },
            thickness: 0.5,
            color: rgb(1, 0, 0)
        });
        page.drawLine({
            start: { x: pos.x, y: pos.y - 10 },
            end: { x: pos.x, y: pos.y + 10 },
            thickness: 0.5,
            color: rgb(1, 0, 0)
        });

        // Draw label
        page.drawText(`${pos.label}\n(${pos.x}, ${pos.y})`, {
            x: pos.x + 15,
            y: pos.y,
            size: 6,
            font: font,
            color: rgb(1, 0, 0)
        });
    }

    return pdfDoc.save();
}

/**
 * Get coordinate map as exportable data
 */
export function getCoordinateMap(): { [fieldName: string]: { x: number; y: number; description: string } } {
    const map: { [fieldName: string]: { x: number; y: number; description: string } } = {};

    for (const [key, config] of Object.entries(BEPPYO1_FIELDS)) {
        map[key] = {
            x: config.anchorX,
            y: config.anchorY,
            description: `Rightmost digit at (${config.anchorX}, ${config.anchorY}), ${config.maxDigits} boxes, spacing ${config.boxSpacing}pt`
        };
    }

    return map;
}
