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
 * Field mapping for Beppyo1 (別表一)
 * 
 * Coordinates calibrated from actual PDF analysis:
 * - Page size: 595.32 x 841.92 points (A4)
 * - Origin: bottom-left corner (0, 0)
 * - Y increases upward
 * 
 * Layout Analysis (from user's image):
 * - Form header takes ~200pt from top
 * - Each row is ~19.5pt high
 * - Left column boxes end at X ≈ 244pt
 * - Right column boxes end at X ≈ 514pt
 * - Each digit box is ~16.15pt wide
 */
export const BEPPYO1_FIELDS: { [key: string]: DigitBoxConfig } = {
    // ===== 左側カラム (Left Column) =====
    // Row 1: 所得金額又は欠損金額 (別表四「52の①」)
    '所得金額_row1': {
        anchorX: 244,
        anchorY: 622,   // 用紙上部から約220ptの位置
        boxWidth: 16.15,
        boxSpacing: 16.15,
        fontSize: 10,
        maxDigits: 12
    },

    // Row 2: 法人税額 ((48)+(49)+(50))
    '法人税額_row2': {
        anchorX: 244,
        anchorY: 602,
        boxWidth: 16.15,
        boxSpacing: 16.15,
        fontSize: 10,
        maxDigits: 12
    },

    // Row 13: 差引所得に対する法人税額 ((9)-(10)-(11)-(12))
    '差引法人税額_row13': {
        anchorX: 244,
        anchorY: 387,
        boxWidth: 16.15,
        boxSpacing: 16.15,
        fontSize: 10,
        maxDigits: 12
    },

    // Row 18: 所得金額の計 (これがテスト対象)
    '所得合計_row18': {
        anchorX: 244,
        anchorY: 290,   // ※ユーザー画像で「0」が入っている行
        boxWidth: 16.15,
        boxSpacing: 16.15,
        fontSize: 10,
        maxDigits: 12
    },

    // Row 28: 法人税額計 (ユーザー画像で「141940」が入っている行)
    '法人税額計_row28': {
        anchorX: 244,
        anchorY: 95,
        boxWidth: 16.15,
        boxSpacing: 16.15,
        fontSize: 10,
        maxDigits: 12
    },

    // ===== 右側カラム (Right Column) =====
    // Row 17: 復興特別法人税額
    '復興税額_row17': {
        anchorX: 514,
        anchorY: 310,
        boxWidth: 16.15,
        boxSpacing: 16.15,
        fontSize: 10,
        maxDigits: 12
    },

    // Row 19: 所得税額等の控除額 ((16)+(17))
    '控除税額_row19': {
        anchorX: 514,
        anchorY: 270,
        boxWidth: 16.15,
        boxSpacing: 16.15,
        fontSize: 10,
        maxDigits: 12
    },

    // Row 20: 控除しきれなかった金額
    '控除残_row20': {
        anchorX: 514,
        anchorY: 250,
        boxWidth: 16.15,
        boxSpacing: 16.15,
        fontSize: 10,
        maxDigits: 12
    },

    // Row 22: 中間納付額 ((14)-(13))
    '中間納付_row22': {
        anchorX: 514,
        anchorY: 210,
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
