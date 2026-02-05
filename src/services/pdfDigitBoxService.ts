/**
 * Digit-Box PDF Filling Service
 * 
 * CRITICAL UPDATE 2026-02-05: Complete coordinate recalibration
 * Based on deep analysis of official 別表一 form structure.
 * 
 * Key Insights:
 * - PDF is A4 (595.32 x 841.92pt), origin at BOTTOM-LEFT
 * - Form has 28 rows in left column, 24 rows in right column
 * - Digit boxes are ~16pt wide with uniform spacing
 * - Row height is ~19.4pt
 * - Each column has a fixed right-edge X coordinate
 * 
 * Measurement Approach:
 * - Measured from user's screenshot relative to page dimensions
 * - Used proportional calculation based on form structure
 */

import { PDFDocument, PDFPage, PDFFont, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { CorporateTaxInputData, CompanyInfo } from '../types/corporateTaxInput';

// ===== COORDINATE CONFIGURATION =====

/**
 * Box configuration for digit placement
 * Values are in PDF points (1pt = 1/72 inch ≈ 0.35mm)
 */
export interface DigitBoxConfig {
    anchorX: number;      // Rightmost digit box center X
    anchorY: number;      // Text baseline Y
    boxWidth: number;     // Width of each digit box
    boxSpacing: number;   // Center-to-center spacing
    fontSize: number;     // Font size for digits
    maxDigits: number;    // Maximum digits
}

/**
 * Text field configuration for company info
 */
export interface TextFieldConfig {
    x: number;
    y: number;
    fontSize: number;
    maxWidth?: number;
    align?: 'left' | 'center' | 'right';
}

// ===================================================================
// IMPORTANT: These coordinates were recalibrated on 2026-02-05
// based on proportional analysis of the official form structure.
// 
// Form Layout Analysis:
// - Page: 595.32 x 841.92 pt (A4)
// - Data area starts at ~Y=640 and ends at ~Y=80
// - Total height of data area: ~560pt for 28 rows = ~20pt per row
// - Left column digit boxes right edge: ~X=256
// - Right column digit boxes right edge: ~X=526
// ===================================================================

/**
 * BEPPYO1 Row Positions (Calibrated from form structure)
 * 
 * The form data area spans approximately:
 * - Top (Row 1): Y ≈ 628
 * - Bottom (Row 28): Y ≈ 88
 * - Row spacing: ~20pt
 */

// Calculate Y position for a given row number (1-28 for left column)
function getRowY(rowNumber: number): number {
    const topRowY = 628;      // Y position of Row 1
    const rowSpacing = 20;    // Spacing between rows
    return topRowY - ((rowNumber - 1) * rowSpacing);
}

// Calculate Y for right column (rows 16-44)
function getRightRowY(rowNumber: number): number {
    const topRowY = 568;      // Y position of first right column row (around row 16 equivalent)
    const rowSpacing = 20;
    const localRow = rowNumber - 16;  // Convert to local row number
    return topRowY - (localRow * rowSpacing);
}

export const BEPPYO1_FIELDS: { [key: string]: DigitBoxConfig } = {
    // ===== LEFT COLUMN (Rows 1-28) =====
    // Anchor X = 256 (right edge of leftmost digit box)
    // Each row is 20pt apart, starting from Y=628 for Row 1

    '所得金額_row1': {
        anchorX: 256,
        anchorY: getRowY(1),  // 628
        boxWidth: 16,
        boxSpacing: 16,
        fontSize: 10,
        maxDigits: 12
    },

    '法人税額_row2': {
        anchorX: 256,
        anchorY: getRowY(2),  // 608
        boxWidth: 16,
        boxSpacing: 16,
        fontSize: 10,
        maxDigits: 12
    },

    '特別控除額_row3': {
        anchorX: 256,
        anchorY: getRowY(3),  // 588
        boxWidth: 16,
        boxSpacing: 16,
        fontSize: 10,
        maxDigits: 12
    },

    '税額控除_row4': {
        anchorX: 256,
        anchorY: getRowY(4),  // 568
        boxWidth: 16,
        boxSpacing: 16,
        fontSize: 10,
        maxDigits: 12
    },

    '利子税_row5': {
        anchorX: 256,
        anchorY: getRowY(5),  // 548
        boxWidth: 16,
        boxSpacing: 16,
        fontSize: 10,
        maxDigits: 12
    },

    '控除税額_row6': {
        anchorX: 256,
        anchorY: getRowY(6),  // 528
        boxWidth: 16,
        boxSpacing: 16,
        fontSize: 10,
        maxDigits: 12
    },

    '留保金額_row7': {
        anchorX: 256,
        anchorY: getRowY(7),  // 508
        boxWidth: 16,
        boxSpacing: 16,
        fontSize: 10,
        maxDigits: 12
    },

    '同上税額_row8': {
        anchorX: 256,
        anchorY: getRowY(8),  // 488
        boxWidth: 16,
        boxSpacing: 16,
        fontSize: 10,
        maxDigits: 12
    },

    '法人税額計1_row9': {
        anchorX: 256,
        anchorY: getRowY(9),  // 468
        boxWidth: 16,
        boxSpacing: 16,
        fontSize: 10,
        maxDigits: 12
    },

    'row10': {
        anchorX: 256,
        anchorY: getRowY(10),  // 448
        boxWidth: 16,
        boxSpacing: 16,
        fontSize: 10,
        maxDigits: 12
    },

    'row11': {
        anchorX: 256,
        anchorY: getRowY(11),  // 428
        boxWidth: 16,
        boxSpacing: 16,
        fontSize: 10,
        maxDigits: 12
    },

    'row12': {
        anchorX: 256,
        anchorY: getRowY(12),  // 408
        boxWidth: 16,
        boxSpacing: 16,
        fontSize: 10,
        maxDigits: 12
    },

    '差引法人税額_row13': {
        anchorX: 256,
        anchorY: getRowY(13),  // 388
        boxWidth: 16,
        boxSpacing: 16,
        fontSize: 10,
        maxDigits: 12
    },

    '中間申告_row14': {
        anchorX: 256,
        anchorY: getRowY(14),  // 368
        boxWidth: 16,
        boxSpacing: 16,
        fontSize: 10,
        maxDigits: 12
    },

    'row15': {
        anchorX: 256,
        anchorY: getRowY(15),  // 348
        boxWidth: 16,
        boxSpacing: 16,
        fontSize: 10,
        maxDigits: 12
    },

    // Row 28 - 法人税額計 (user's image shows 141940 here)
    '法人税額計_row28': {
        anchorX: 256,
        anchorY: getRowY(28),  // 88
        boxWidth: 16,
        boxSpacing: 16,
        fontSize: 10,
        maxDigits: 12
    },

    // ===== RIGHT COLUMN =====
    // Right column starts around equivalent of row 16
    // Anchor X = 526 (right edge)

    '所得税額_row16': {
        anchorX: 526,
        anchorY: 568,
        boxWidth: 16,
        boxSpacing: 16,
        fontSize: 10,
        maxDigits: 12
    },

    '復興税額_row17': {
        anchorX: 526,
        anchorY: 548,
        boxWidth: 16,
        boxSpacing: 16,
        fontSize: 10,
        maxDigits: 12
    },

    '所得合計_row18': {
        anchorX: 256,  // This is actually left column based on user's image
        anchorY: getRowY(18),  // ~290  (user says "0" should be here)
        boxWidth: 16,
        boxSpacing: 16,
        fontSize: 10,
        maxDigits: 12
    },

    '控除税額_row19': {
        anchorX: 526,
        anchorY: 508,
        boxWidth: 16,
        boxSpacing: 16,
        fontSize: 10,
        maxDigits: 12
    },

    '控除残_row20': {
        anchorX: 526,
        anchorY: 488,
        boxWidth: 16,
        boxSpacing: 16,
        fontSize: 10,
        maxDigits: 12
    },

    '差引計_row21': {
        anchorX: 526,
        anchorY: 468,
        boxWidth: 16,
        boxSpacing: 16,
        fontSize: 10,
        maxDigits: 12
    },

    '中間納付_row22': {
        anchorX: 526,
        anchorY: 448,
        boxWidth: 16,
        boxSpacing: 16,
        fontSize: 10,
        maxDigits: 12
    },
};

// ===== TEXT FIELDS FOR COMPANY INFO =====
// These are positioned based on the header section of the form

export const BEPPYO1_TEXT_FIELDS: { [key: string]: TextFieldConfig } = {
    // Header section (top of form)
    '税務署名': { x: 95, y: 805, fontSize: 9 },
    '事業年度_年_自': { x: 68, y: 742, fontSize: 9 },
    '事業年度_月_自': { x: 90, y: 742, fontSize: 9 },
    '事業年度_日_自': { x: 110, y: 742, fontSize: 9 },
    '事業年度_年_至': { x: 68, y: 727, fontSize: 9 },
    '事業年度_月_至': { x: 90, y: 727, fontSize: 9 },
    '事業年度_日_至': { x: 110, y: 727, fontSize: 9 },

    // Company info section
    '法人名': { x: 68, y: 780, fontSize: 10, maxWidth: 180 },
    '法人番号': { x: 360, y: 820, fontSize: 8 },
    '郵便番号': { x: 180, y: 695, fontSize: 8 },
    '納税地': { x: 68, y: 695, fontSize: 9, maxWidth: 100 },
    '電話番号': { x: 240, y: 695, fontSize: 8 },
    '代表者氏名': { x: 68, y: 665, fontSize: 10, maxWidth: 120 },
    '事業種目': { x: 68, y: 780, fontSize: 9, maxWidth: 150 },
};

// ===== CALIBRATION OFFSETS =====

export interface CalibrationOffsets {
    globalShiftX: number;
    globalShiftY: number;
    digitCenterOffsetX: number;
    digitCenterOffsetY: number;
}

const DEFAULT_CALIBRATION: CalibrationOffsets = {
    globalShiftX: 0,
    globalShiftY: 0,
    digitCenterOffsetX: -5,  // Center digit within 16pt box
    digitCenterOffsetY: 2,   // Baseline adjustment
};

// ===== CORE FUNCTIONS =====

async function loadFont(pdfDoc: PDFDocument): Promise<PDFFont> {
    pdfDoc.registerFontkit(fontkit);

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
 * Fill a single digit box field with precise centering
 */
export function fillDigitBoxField(
    page: PDFPage,
    value: number,
    config: DigitBoxConfig,
    font: PDFFont,
    calibration: CalibrationOffsets = DEFAULT_CALIBRATION
): { success: boolean; digitsPlaced: number } {
    const absValue = Math.abs(Math.floor(value));
    const digits = absValue === 0 ? ['0'] : String(absValue).split('');

    if (digits.length > config.maxDigits) {
        console.warn(`[DigitBox] Value ${value} exceeds max digits (${config.maxDigits})`);
        return { success: false, digitsPlaced: 0 };
    }

    const reversedDigits = [...digits].reverse();

    reversedDigits.forEach((digit, index) => {
        // Calculate box center position
        const boxCenterX = config.anchorX - (index * config.boxSpacing);

        // Get actual text width for precise centering
        const textWidth = font.widthOfTextAtSize(digit, config.fontSize);

        // Calculate X to center digit in box
        const x = boxCenterX - (textWidth / 2) + calibration.globalShiftX;
        const y = config.anchorY + calibration.globalShiftY + calibration.digitCenterOffsetY;

        page.drawText(digit, {
            x: x,
            y: y,
            size: config.fontSize,
            font: font,
            color: rgb(0, 0, 0)  // Black
        });
    });

    console.log(`[DigitBox] Placed ${digits.length} digits for value ${value}`);
    return { success: true, digitsPlaced: digits.length };
}

/**
 * Fill a text field
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

    const x = config.x + calibration.globalShiftX;
    const y = config.y + calibration.globalShiftY;

    let displayText = text;
    if (config.maxWidth) {
        const charWidth = config.fontSize * 0.6;
        const maxChars = Math.floor(config.maxWidth / charWidth);
        if (text.length > maxChars) {
            displayText = text.substring(0, maxChars - 1) + '…';
        }
    }

    page.drawText(displayText, {
        x: x,
        y: y,
        size: config.fontSize,
        font: font,
        color: rgb(0, 0, 0)
    });

    console.log(`[TextField] Placed: "${displayText.substring(0, 20)}"`);
    return { success: true };
}

function formatJapaneseFiscalDate(dateStr: string): { year: number; month: number; day: number } | null {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;

    const year = date.getFullYear();
    const reiwaYear = year - 2018;
    return {
        year: reiwaYear,
        month: date.getMonth() + 1,
        day: date.getDate()
    };
}

function formatCapitalAmount(amount: number): string {
    if (amount >= 100000000) {
        return `${(amount / 100000000).toFixed(0)}億円`;
    } else if (amount >= 10000) {
        return `${(amount / 10000).toFixed(0)}万円`;
    }
    return `${amount.toLocaleString()}円`;
}

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

    const pdfDoc = await PDFDocument.load(pdfBytes, {
        ignoreEncryption: true,
        throwOnInvalidObject: false
    } as any);

    const font = await loadFont(pdfDoc);
    const page = pdfDoc.getPages()[0];
    const { width, height } = page.getSize();

    console.log(`[DigitBox] Page size: ${width} x ${height}`);

    if (debugMode) {
        // Debug mode: Draw test pattern for calibration
        console.log('[DigitBox] DEBUG MODE - Drawing calibration marks');

        // Draw reference grid
        for (let y = 100; y <= 700; y += 100) {
            page.drawLine({
                start: { x: 0, y },
                end: { x: width, y },
                thickness: 0.5,
                color: rgb(1, 0, 0)
            });
            page.drawText(`Y=${y}`, { x: 5, y: y + 2, size: 6, font, color: rgb(1, 0, 0) });
        }

        for (let x = 100; x <= 500; x += 100) {
            page.drawLine({
                start: { x, y: 0 },
                end: { x, y: height },
                thickness: 0.5,
                color: rgb(0, 0, 1)
            });
            page.drawText(`X=${x}`, { x: x + 2, y: 5, size: 6, font, color: rgb(0, 0, 1) });
        }

        // Draw test digit at Row 18
        const config18 = BEPPYO1_FIELDS['所得合計_row18'];
        if (config18) {
            fillDigitBoxField(page, 0, config18, font, calibration);
            report.fieldDetails.push({
                fieldName: '所得合計_row18 (test: 0)',
                value: 0,
                success: true,
                coordinates: { x: config18.anchorX, y: config18.anchorY }
            });
        }

        // Draw test digit at Row 1
        const config1 = BEPPYO1_FIELDS['所得金額_row1'];
        if (config1) {
            fillDigitBoxField(page, 5000000, config1, font, calibration);
            report.fieldDetails.push({
                fieldName: '所得金額_row1 (test: 5000000)',
                value: 5000000,
                success: true,
                coordinates: { x: config1.anchorX, y: config1.anchorY }
            });
        }

        // Draw test digit at Row 28
        const config28 = BEPPYO1_FIELDS['法人税額計_row28'];
        if (config28) {
            fillDigitBoxField(page, 141940, config28, font, calibration);
            report.fieldDetails.push({
                fieldName: '法人税額計_row28 (test: 141940)',
                value: 141940,
                success: true,
                coordinates: { x: config28.anchorX, y: config28.anchorY }
            });
        }

        report.fieldsAttempted = 3;
        report.fieldsSucceeded = 3;
    } else {
        // Production mode: Fill from data

        // PART 1: Digit boxes
        const fieldMappings: { fieldKey: string; value: number }[] = [
            { fieldKey: '所得金額_row1', value: data.beppyo4.taxableIncome },
            { fieldKey: '法人税額_row2', value: data.beppyo1.corporateTaxAmount },
            { fieldKey: '差引法人税額_row13', value: data.beppyo1.corporateTaxAmount - data.beppyo1.specialTaxCredit - data.beppyo1.interimPayment },
            { fieldKey: '所得合計_row18', value: data.beppyo4.taxableIncome },
            { fieldKey: '控除税額_row19', value: data.beppyo1.specialTaxCredit },
            { fieldKey: '中間納付_row22', value: data.beppyo1.interimPayment },
            { fieldKey: '法人税額計_row28', value: data.beppyo1.totalTaxAmount },
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

        // PART 2: Company info text fields
        if (data.companyInfo) {
            console.log('[TextField] Filling company information...');
            const info = data.companyInfo;

            // Fill company name
            if (info.corporateName) {
                const config = BEPPYO1_TEXT_FIELDS['法人名'];
                if (config) {
                    fillTextField(page, info.corporateName, config, font, calibration);
                    report.fieldsSucceeded++;
                }
            }

            // Fill tax office
            if (info.taxOffice) {
                const config = BEPPYO1_TEXT_FIELDS['税務署名'];
                if (config) {
                    fillTextField(page, info.taxOffice, config, font, calibration);
                    report.fieldsSucceeded++;
                }
            }

            // Fill representative name
            if (info.representativeName) {
                const config = BEPPYO1_TEXT_FIELDS['代表者氏名'];
                if (config) {
                    fillTextField(page, info.representativeName, config, font, calibration);
                    report.fieldsSucceeded++;
                }
            }

            // Fill address
            if (info.address) {
                const config = BEPPYO1_TEXT_FIELDS['納税地'];
                if (config) {
                    fillTextField(page, info.address, config, font, calibration);
                    report.fieldsSucceeded++;
                }
            }

            // Fill phone
            if (info.phoneNumber) {
                const config = BEPPYO1_TEXT_FIELDS['電話番号'];
                if (config) {
                    fillTextField(page, info.phoneNumber, config, font, calibration);
                    report.fieldsSucceeded++;
                }
            }

            // Fill fiscal year dates
            const startDate = formatJapaneseFiscalDate(info.fiscalYearStart);
            if (startDate) {
                fillTextField(page, String(startDate.year), BEPPYO1_TEXT_FIELDS['事業年度_年_自'], font, calibration);
                fillTextField(page, String(startDate.month), BEPPYO1_TEXT_FIELDS['事業年度_月_自'], font, calibration);
                fillTextField(page, String(startDate.day), BEPPYO1_TEXT_FIELDS['事業年度_日_自'], font, calibration);
            }

            const endDate = formatJapaneseFiscalDate(info.fiscalYearEnd);
            if (endDate) {
                fillTextField(page, String(endDate.year), BEPPYO1_TEXT_FIELDS['事業年度_年_至'], font, calibration);
                fillTextField(page, String(endDate.month), BEPPYO1_TEXT_FIELDS['事業年度_月_至'], font, calibration);
                fillTextField(page, String(endDate.day), BEPPYO1_TEXT_FIELDS['事業年度_日_至'], font, calibration);
            }

            // Fill corporate number
            if (info.corporateNumber) {
                fillTextField(page, info.corporateNumber, BEPPYO1_TEXT_FIELDS['法人番号'], font, calibration);
            }
        }
    }

    const outputBytes = await pdfDoc.save();

    console.log('\n===== DIGIT BOX FILLING REPORT =====');
    console.log(`Template: ${report.template}`);
    console.log(`Success: ${report.fieldsSucceeded}/${report.fieldsAttempted}`);
    console.table(report.fieldDetails);
    console.log('=====================================\n');

    return { pdfBytes: outputBytes, report };
}

/**
 * Generate calibration test PDF with grid and test values
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

    for (const pos of testPositions) {
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

export function getCoordinateMap(): { [fieldName: string]: { x: number; y: number; description: string } } {
    const map: { [fieldName: string]: { x: number; y: number; description: string } } = {};

    for (const [key, config] of Object.entries(BEPPYO1_FIELDS)) {
        map[key] = {
            x: config.anchorX,
            y: config.anchorY,
            description: `Row anchor at (${config.anchorX}, ${config.anchorY})`
        };
    }

    return map;
}
