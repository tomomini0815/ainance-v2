
import { PDFDocument, rgb, PDFFont, PDFPage } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { CorporateTaxInputData } from '../types/corporateTaxInput';

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
// IMPORTANT: Coordinates calibrated using drag-and-drop tool
// Digit boxes standardized to 16pt width/spacing and 10pt font size
// ===================================================================

export const BEPPYO1_FIELDS: { [key: string]: DigitBoxConfig } = {
    '所得金額_row1': { anchorX: 292.7, anchorY: 568.6, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '法人税額_row2': { anchorX: 293.3, anchorY: 549.9, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '特別控除額_row3': { anchorX: 293.3, anchorY: 533.3, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '税額控除_row4': { anchorX: 293.3, anchorY: 514.6, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '利子税_row5': { anchorX: 292, anchorY: 496.6, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '控除税額_row6': { anchorX: 292.7, anchorY: 479.3, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '留保金額_row7': { anchorX: 292.7, anchorY: 460.6, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '同上税額_row8': { anchorX: 292, anchorY: 441.9, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '法人税額計1_row9': { anchorX: 294.7, anchorY: 407.3, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    'row10': { anchorX: 294, anchorY: 386.6, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    'row11': { anchorX: 293.3, anchorY: 368.6, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    'row12': { anchorX: 292.7, anchorY: 351.3, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '差引法人税額_row13': { anchorX: 292.7, anchorY: 333.9, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '中間申告_row14': { anchorX: 294.7, anchorY: 316.8, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    'row15': { anchorX: 293.3, anchorY: 295.3, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '法人税額計_row28': { anchorX: 293.3, anchorY: 276.1, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    'row16': { anchorX: 560, anchorY: 565.3, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    'row17': { anchorX: 560, anchorY: 547.3, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '所得合計_row18': { anchorX: 560, anchorY: 527.3, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    'row19': { anchorX: 559.3, anchorY: 509.9, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    'row20': { anchorX: 560, anchorY: 492.1, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    'row21': { anchorX: 559.3, anchorY: 470.8, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    'row22': { anchorX: 560, anchorY: 447.5, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    'row23': { anchorX: 560, anchorY: 421.5, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    'row24': { anchorX: 560, anchorY: 394.1, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    'row25': { anchorX: 558.7, anchorY: 340.1, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    'row26': { anchorX: 558.7, anchorY: 316.8, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    'row27': { anchorX: 560, anchorY: 295.5, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
};

export const BEPPYO1_TEXT_FIELDS: { [key: string]: TextFieldConfig } = {
    '税務署名': { x: 85.3, y: 750.6, fontSize: 9 },
    '法人名': { x: 85.3, y: 716.1, fontSize: 9 },
    '法人番号': { x: 83.3, y: 695.3, fontSize: 9 },
    '納税地': { x: 84, y: 644.6, fontSize: 9 },
    '電話番号': { x: 170, y: 745.5, fontSize: 9 },
    '代表者氏名': { x: 85.3, y: 665.9, fontSize: 9 },
    '事業年度_年_自': { x: 106, y: 617.9, fontSize: 10 },
    '事業年度_月_自': { x: 158, y: 618.6, fontSize: 10 },
    '事業年度_日_自': { x: 208, y: 619.3, fontSize: 10 },
    '事業年度_年_至': { x: 106, y: 595.3, fontSize: 10 },
    '事業年度_月_至': { x: 158, y: 594.6, fontSize: 10 },
    '事業年度_日_至': { x: 208, y: 595.3, fontSize: 10 },
};

// ===== BEPPYO4 COORDINATE CONFIG =====
export const BEPPYO4_FIELDS: { [key: string]: DigitBoxConfig } = {
    '当期利益_row1': { anchorX: 318.7, anchorY: 723.3, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '損金算入法人税_row2': { anchorX: 318.7, anchorY: 703.3, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '損金算入住民税_row3': { anchorX: 318.7, anchorY: 689.3, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '交際費不算入額_row4': { anchorX: 318.7, anchorY: 621.9, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '減価償却超過額_row5': { anchorX: 317.3, anchorY: 648.6, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '法人税等還付金_row33': { anchorX: 320, anchorY: 348.6, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '支出事業税_row34': { anchorX: 321.3, anchorY: 205.9, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '所得金額_row52': { anchorX: 321.3, anchorY: 68.6, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
};

export const BEPPYO4_TEXT_FIELDS: { [key: string]: TextFieldConfig } = {
    '法人名': { x: 434.7, y: 788.6, fontSize: 9 },
};

// ===== BEPPYO5 (利益積立金) COORDINATE CONFIG =====
export const BEPPYO5_PAGE1_FIELDS: { [key: string]: DigitBoxConfig } = {
    '利益準備金_1': { anchorX: 400, anchorY: 650, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '利益準備金_2': { anchorX: 430, anchorY: 650, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '利益準備金_3': { anchorX: 460, anchorY: 650, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '利益準備金_4': { anchorX: 490, anchorY: 650, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '繰越損益金_1': { anchorX: 400, anchorY: 630, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '繰越損益金_2': { anchorX: 430, anchorY: 630, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '繰越損益金_3': { anchorX: 460, anchorY: 630, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '繰越損益金_4': { anchorX: 490, anchorY: 630, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '納税充当金_1': { anchorX: 400, anchorY: 400, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '納税充当金_2': { anchorX: 430, anchorY: 400, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '納税充当金_3': { anchorX: 460, anchorY: 400, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '納税充当金_4': { anchorX: 490, anchorY: 400, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '資本金_1': { anchorX: 400, anchorY: 200, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '資本金_4': { anchorX: 490, anchorY: 200, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
};

export const BEPPYO5_PAGE1_TEXT: { [key: string]: TextFieldConfig } = {
    '法人名': { x: 100, y: 780, fontSize: 9 },
};

// ===== BEPPYO5 (2) (租税公課) COORDINATE CONFIG =====
export const BEPPYO5_PAGE2_FIELDS: { [key: string]: DigitBoxConfig } = {
    '法人税_1': { anchorX: 400, anchorY: 650, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '法人税_2': { anchorX: 430, anchorY: 650, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '法人税_3': { anchorX: 460, anchorY: 650, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '法人税_4': { anchorX: 490, anchorY: 650, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '住民税_1': { anchorX: 400, anchorY: 600, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '住民税_2': { anchorX: 430, anchorY: 600, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '住民税_3': { anchorX: 460, anchorY: 600, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '住民税_4': { anchorX: 490, anchorY: 600, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '事業税_1': { anchorX: 400, anchorY: 550, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '事業税_2': { anchorX: 430, anchorY: 550, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '事業税_3': { anchorX: 460, anchorY: 550, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '事業税_4': { anchorX: 490, anchorY: 550, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '納税充当金_繰入': { anchorX: 400, anchorY: 300, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '納税充当金_取崩': { anchorX: 430, anchorY: 300, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
};
export const BEPPYO5_PAGE2_TEXT: { [key: string]: TextFieldConfig } = {
    '法人名': { x: 100, y: 780, fontSize: 9 },
};

// ===== BEPPYO15 (交際費) COORDINATE CONFIG =====
export const BEPPYO15_FIELDS: { [key: string]: DigitBoxConfig } = {
    '支出交際費等の額_row1': { anchorX: 450, anchorY: 650, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '接待飲食費の額_row2': { anchorX: 450, anchorY: 600, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '指定限度額_row17': { anchorX: 450, anchorY: 300, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '損金不算入額_row18': { anchorX: 450, anchorY: 250, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
};
export const BEPPYO15_TEXT: { [key: string]: TextFieldConfig } = {
    '法人名': { x: 100, y: 780, fontSize: 9 },
};

// ===== BEPPYO16 (1) (減価償却 定額法) COORDINATE CONFIG =====
export const BEPPYO16_1_FIELDS: { [key: string]: DigitBoxConfig } = {
    // Row 1
    '取得価額_row1': { anchorX: 200, anchorY: 700, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '期末帳簿価額_row1': { anchorX: 280, anchorY: 700, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '償却限度額_row1': { anchorX: 360, anchorY: 700, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '当期償却額_row1': { anchorX: 440, anchorY: 700, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '償却超過額_row1': { anchorX: 520, anchorY: 700, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    // Row 2
    '取得価額_row2': { anchorX: 200, anchorY: 676, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '期末帳簿価額_row2': { anchorX: 280, anchorY: 676, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '償却限度額_row2': { anchorX: 360, anchorY: 676, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '当期償却額_row2': { anchorX: 440, anchorY: 676, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '償却超過額_row2': { anchorX: 520, anchorY: 676, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    // Row 3
    '取得価額_row3': { anchorX: 200, anchorY: 652, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '期末帳簿価額_row3': { anchorX: 280, anchorY: 652, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '償却限度額_row3': { anchorX: 360, anchorY: 652, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '当期償却額_row3': { anchorX: 440, anchorY: 652, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '償却超過額_row3': { anchorX: 520, anchorY: 652, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    // Row 4
    '取得価額_row4': { anchorX: 200, anchorY: 628, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '期末帳簿価額_row4': { anchorX: 280, anchorY: 628, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '償却限度額_row4': { anchorX: 360, anchorY: 628, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '当期償却額_row4': { anchorX: 440, anchorY: 628, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '償却超過額_row4': { anchorX: 520, anchorY: 628, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    // Row 5
    '取得価額_row5': { anchorX: 200, anchorY: 604, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '期末帳簿価額_row5': { anchorX: 280, anchorY: 604, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '償却限度額_row5': { anchorX: 360, anchorY: 604, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '当期償却額_row5': { anchorX: 440, anchorY: 604, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '償却超過額_row5': { anchorX: 520, anchorY: 604, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    // Row 6
    '取得価額_row6': { anchorX: 200, anchorY: 580, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '期末帳簿価額_row6': { anchorX: 280, anchorY: 580, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '償却限度額_row6': { anchorX: 360, anchorY: 580, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '当期償却額_row6': { anchorX: 440, anchorY: 580, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '償却超過額_row6': { anchorX: 520, anchorY: 580, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
};
export const BEPPYO16_1_TEXT: { [key: string]: TextFieldConfig } = {
    '資産名_row1': { x: 100, y: 700, fontSize: 9 },
    '資産名_row2': { x: 100, y: 676, fontSize: 9 },
    '資産名_row3': { x: 100, y: 652, fontSize: 9 },
    '資産名_row4': { x: 100, y: 628, fontSize: 9 },
    '資産名_row5': { x: 100, y: 604, fontSize: 9 },
    '資産名_row6': { x: 100, y: 580, fontSize: 9 },
    '法人名': { x: 100, y: 780, fontSize: 9 },
};

// ===== BEPPYO16 (2) (減価償却 定率法) COORDINATE CONFIG =====
export const BEPPYO16_2_FIELDS: { [key: string]: DigitBoxConfig } = {
    // Row 1
    '取得価額_row1': { anchorX: 200, anchorY: 700, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '期末帳簿価額_row1': { anchorX: 280, anchorY: 700, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '償却限度額_row1': { anchorX: 360, anchorY: 700, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '当期償却額_row1': { anchorX: 440, anchorY: 700, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '償却超過額_row1': { anchorX: 520, anchorY: 700, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    // Row 2
    '取得価額_row2': { anchorX: 200, anchorY: 676, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '期末帳簿価額_row2': { anchorX: 280, anchorY: 676, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '償却限度額_row2': { anchorX: 360, anchorY: 676, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '当期償却額_row2': { anchorX: 440, anchorY: 676, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '償却超過額_row2': { anchorX: 520, anchorY: 676, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    // Row 3
    '取得価額_row3': { anchorX: 200, anchorY: 652, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '期末帳簿価額_row3': { anchorX: 280, anchorY: 652, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '償却限度額_row3': { anchorX: 360, anchorY: 652, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '当期償却額_row3': { anchorX: 440, anchorY: 652, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '償却超過額_row3': { anchorX: 520, anchorY: 652, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    // Row 4
    '取得価額_row4': { anchorX: 200, anchorY: 628, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '期末帳簿価額_row4': { anchorX: 280, anchorY: 628, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '償却限度額_row4': { anchorX: 360, anchorY: 628, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '当期償却額_row4': { anchorX: 440, anchorY: 628, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '償却超過額_row4': { anchorX: 520, anchorY: 628, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    // Row 5
    '取得価額_row5': { anchorX: 200, anchorY: 604, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '期末帳簿価額_row5': { anchorX: 280, anchorY: 604, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '償却限度額_row5': { anchorX: 360, anchorY: 604, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '当期償却額_row5': { anchorX: 440, anchorY: 604, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '償却超過額_row5': { anchorX: 520, anchorY: 604, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    // Row 6
    '取得価額_row6': { anchorX: 200, anchorY: 580, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '期末帳簿価額_row6': { anchorX: 280, anchorY: 580, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '償却限度額_row6': { anchorX: 360, anchorY: 580, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '当期償却額_row6': { anchorX: 440, anchorY: 580, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
    '償却超過額_row6': { anchorX: 520, anchorY: 580, boxWidth: 16, boxSpacing: 16, fontSize: 10, maxDigits: 12 },
};
export const BEPPYO16_2_TEXT: { [key: string]: TextFieldConfig } = {
    '資産名_row1': { x: 100, y: 700, fontSize: 9 },
    '資産名_row2': { x: 100, y: 676, fontSize: 9 },
    '資産名_row3': { x: 100, y: 652, fontSize: 9 },
    '資産名_row4': { x: 100, y: 628, fontSize: 9 },
    '資産名_row5': { x: 100, y: 604, fontSize: 9 },
    '資産名_row6': { x: 100, y: 580, fontSize: 9 },
    '法人名': { x: 100, y: 780, fontSize: 9 },
};

// ===== CALIBRATION OFFSETS =====

export interface CalibrationOffsets {
    globalShiftX: number;
    globalShiftY: number;
    digitCenterOffsetX: number;
    digitCenterOffsetY: number;
}

export const DEFAULT_CALIBRATION: CalibrationOffsets = {
    globalShiftX: 0,        // Offset to align with official PDF templates
    globalShiftY: 0,
    digitCenterOffsetX: -5,  // Center digit within box
    digitCenterOffsetY: 2,   // Baseline adjustment
};

// ===== CORE FUNCTIONS =====

async function loadFont(pdfDoc: PDFDocument): Promise<PDFFont> {
    pdfDoc.registerFontkit(fontkit);

    try {
        const fontUrl = '/fonts/NotoSansCJKjp-Regular.otf';
        const fontBytes = await fetch(fontUrl).then(res => res.arrayBuffer());
        return await pdfDoc.embedFont(fontBytes);
    } catch (e) {
        console.warn('[DigitBox] Could not load local Japanese font, falling back to Helvetica');
        const { StandardFonts } = await import('pdf-lib');
        return await pdfDoc.embedStandardFont(StandardFonts.Helvetica);
    }
}

/**
 * Fill a single digit box field (value -> multiple digits)
 */
export function fillDigitBoxField(
    page: PDFPage,
    value: number,
    config: DigitBoxConfig,
    font: PDFFont,
    calibration: CalibrationOffsets = DEFAULT_CALIBRATION
): { success: boolean, digitsPlaced: number } {
    if (value === undefined || value === null) {
        return { success: false, digitsPlaced: 0 };
    }

    // Convert value to string and pad/truncate
    const valueStr = Math.abs(Math.floor(value)).toString();
    const digits = valueStr.split('').reverse(); // Reverse to fill from right to left

    if (digits.length > config.maxDigits) {
        console.warn(`[DigitBox] Value ${value} exceeds max digits ${config.maxDigits}`);
    }

    // Apply calibration
    const calX = calibration.globalShiftX + calibration.digitCenterOffsetX;
    const calY = calibration.globalShiftY + calibration.digitCenterOffsetY;

    digits.forEach((digit, index) => {
        if (index >= config.maxDigits) return;

        // Calculate position for this digit (filling from right to left)
        // anchorX is the center of the rightmost box
        const x = config.anchorX - (index * config.boxSpacing) + calX;
        const y = config.anchorY + calY;

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

    console.log(`[TextField] Placed: "${displayText.substring(0, 20)}" at (${x}, ${y})`);
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
        // ... (debug logic skipped for brevity to avoid errors, assuming production use)
    } else {
        // Production mode: Fill from data

        // PART 1: Digit boxes
        const fieldMappings: { fieldKey: string; value: number }[] = [
            { fieldKey: '所得金額_row1', value: data.beppyo4.taxableIncome },
            { fieldKey: '法人税額_row2', value: data.beppyo1.corporateTaxAmount },
            { fieldKey: '差引法人税額_row13', value: data.beppyo1.nationalTaxPayable },
            { fieldKey: '所得合計_row18', value: data.beppyo4.taxableIncome },
            { fieldKey: 'row19', value: data.beppyo1.specialTaxCredit },
            { fieldKey: 'row22', value: data.beppyo1.nationalInterimPayment },
            { fieldKey: '法人税額計_row28', value: data.beppyo1.totalTaxAmount },
        ];

        for (const mapping of fieldMappings) {
            const config = BEPPYO1_FIELDS[mapping.fieldKey];
            if (!config) {
                console.warn(`[DigitBox] Unknown field: ${mapping.fieldKey}`);
                continue;
            }
            console.log(`[DigitBox] Filled ${mapping.fieldKey} at (${config.anchorX}, ${config.anchorY})`);

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
    // PART 2: Company info text fields
    if (data.companyInfo) {
        console.log('[TextField] Filling company information...', data.companyInfo);
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

    const outputBytes = await pdfDoc.save();

    console.log('\n===== DIGIT BOX FILLING REPORT =====');
    console.log(`Template: ${report.template}`);
    console.log(`Success: ${report.fieldsSucceeded}/${report.fieldsAttempted}`);
    console.table(report.fieldDetails);
    console.log('=====================================\n');

    return { pdfBytes: outputBytes, report };
}

/**
 * Fill Beppyo4 form with corporate tax data
 */
export async function fillBeppyo4WithDigitBoxes(
    pdfBytes: Uint8Array,
    data: CorporateTaxInputData,
    calibration: CalibrationOffsets = DEFAULT_CALIBRATION,
    debugMode: boolean = false
): Promise<{ pdfBytes: Uint8Array; report: DigitBoxReport }> {
    const report: DigitBoxReport = {
        template: 'beppyo4',
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

    if (debugMode) {
        // Debug mode logic omitted for brevity or implemented as needed
    } else {
        // PART 1: Digit boxes
        const fieldMappings: { fieldKey: string; value: number }[] = [
            { fieldKey: '当期利益_row1', value: data.beppyo4.netIncomeFromPL },
            { fieldKey: '加算_row2', value: (data.beppyo4.nonDeductibleTaxes + data.beppyo4.nonDeductibleEntertainment + data.beppyo4.excessDepreciation + (data.beppyo4.otherAdditions || []).reduce((sum: number, item: any) => sum + (item?.amount || 0), 0)) },
            { fieldKey: '減算_row3', value: (data.beppyo4.deductibleEnterpriseTax + data.beppyo4.dividendExclusion + (data.beppyo4.otherSubtractions || []).reduce((sum: number, item: any) => sum + (item?.amount || 0), 0)) },
            { fieldKey: '所得金額_row52', value: data.beppyo4.taxableIncome },
        ];

        for (const mapping of fieldMappings) {
            const config = BEPPYO4_FIELDS[mapping.fieldKey];
            if (!config) continue;

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
        if (data.companyInfo?.corporateName) {
            const config = BEPPYO4_TEXT_FIELDS['法人名'];
            if (config) {
                fillTextField(page, data.companyInfo.corporateName, config, font, calibration);
                report.fieldsSucceeded++;
            }
        }
    }

    const outputBytes = await pdfDoc.save();
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


// ============================================================================
// NEW IMPLEMENTATIONS FOR REMAINING TEMPLATES
// ============================================================================

/**
 * Fill Beppyo 5 (1) with digit boxes
 */
export async function fillBeppyo5_1WithDigitBoxes(
    bytes: Uint8Array,
    data: CorporateTaxInputData,
    calibration: any,
    debugMode: boolean
): Promise<{ pdfBytes: Uint8Array; report: DigitBoxReport }> {
    const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    pdfDoc.registerFontkit(fontkit);
    const font = await loadFont(pdfDoc);
    const page = pdfDoc.getPages()[0];

    // Initialize report
    const report: DigitBoxReport = {
        template: 'beppyo5_1',
        calibrationUsed: calibration,
        fieldsAttempted: 0,
        fieldsSucceeded: 0,
        fieldDetails: []
    };

    if (!debugMode) {
        // Map 5(1) data
        const items = data.beppyo5?.retainedEarningsItems || [];
        const getAmount = (id: string, prop: 'beginAmount' | 'increase' | 'decrease' | 'endAmount') => {
            const item = items.find(i => i.id === id);
            return item ? item[prop] : 0;
        };

        const fieldMappings: { fieldKey: string; value: number }[] = [
            // 利益準備金 (Row 1)
            { fieldKey: '利益準備金_1', value: getAmount('1', 'beginAmount') },
            { fieldKey: '利益準備金_2', value: getAmount('1', 'increase') },
            { fieldKey: '利益準備金_3', value: getAmount('1', 'decrease') },
            { fieldKey: '利益準備金_4', value: getAmount('1', 'endAmount') },

            // 繰越損益金 (Row 31 - mapped to id '3' 繰越利益剰余金)
            { fieldKey: '繰越損益金_1', value: getAmount('3', 'beginAmount') },
            { fieldKey: '繰越損益金_2', value: getAmount('3', 'increase') },
            { fieldKey: '繰越損益金_3', value: getAmount('3', 'decrease') },
            { fieldKey: '繰越損益金_4', value: getAmount('3', 'endAmount') },

            // 納税充当金 (Row 32 - mapped to id '4' 未払法人税等)
            { fieldKey: '納税充当金_1', value: getAmount('4', 'beginAmount') },
            { fieldKey: '納税充当金_2', value: getAmount('4', 'increase') },
            { fieldKey: '納税充当金_3', value: getAmount('4', 'decrease') },
            { fieldKey: '納税充当金_4', value: getAmount('4', 'endAmount') },

            // 資本金 (Row 33)
            { fieldKey: '資本金_1', value: data.beppyo5?.capitalBegin || 0 },
            { fieldKey: '資本金_4', value: data.beppyo5?.capitalEnd || 0 },
        ];

        for (const mapping of fieldMappings) {
            const config = BEPPYO5_PAGE1_FIELDS[mapping.fieldKey];
            if (!config) continue;

            report.fieldsAttempted++;
            const result = fillDigitBoxField(page, mapping.value, config, font, calibration);
            if (result.success) report.fieldsSucceeded++;

            report.fieldDetails.push({
                fieldName: mapping.fieldKey,
                value: mapping.value,
                success: result.success,
                coordinates: { x: config.anchorX, y: config.anchorY }
            });
        }

        // Text fields
        if (data.companyInfo?.corporateName) {
            const config = BEPPYO5_PAGE1_TEXT['法人名'];
            if (config) {
                fillTextField(page, data.companyInfo.corporateName, config, font, calibration);
                report.fieldsSucceeded++;
            }
        }
    }

    const outputBytes = await pdfDoc.save();
    return { pdfBytes: outputBytes, report };
}

/**
 * Fill Beppyo 5 (2) with digit boxes
 */
export async function fillBeppyo5_2WithDigitBoxes(
    bytes: Uint8Array,
    data: CorporateTaxInputData,
    calibration: any,
    debugMode: boolean
): Promise<{ pdfBytes: Uint8Array; report: DigitBoxReport }> {
    const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    pdfDoc.registerFontkit(fontkit);
    const font = await loadFont(pdfDoc);
    const page = pdfDoc.getPages()[0];

    // Initialize report
    const report: DigitBoxReport = {
        template: 'beppyo5_2',
        calibrationUsed: calibration,
        fieldsAttempted: 0,
        fieldsSucceeded: 0,
        fieldDetails: []
    };

    if (!debugMode) {
        const b52 = data.beppyo5_2 || { taxesPayable: { corporate: 0, inhabitant: 0, enterprise: 0 } };

        const fieldMappings: { fieldKey: string; value: number }[] = [
            // 法人税 (Row 1) - using taxesPayable.corporate for column 1?
            // Usually 5(2) is intricate. Simplified mapping for now:
            { fieldKey: '法人税_1', value: b52.taxesPayable?.corporate || 0 },
            // 住民税 (Row 2)
            { fieldKey: '住民税_1', value: b52.taxesPayable?.inhabitant || 0 },
            // 事業税 (Row 4)
            { fieldKey: '事業税_1', value: b52.taxesPayable?.enterprise || 0 },

            // 納税充当金
            // Need actual data source for these if available
        ];

        for (const mapping of fieldMappings) {
            const config = BEPPYO5_PAGE2_FIELDS[mapping.fieldKey];
            if (!config) continue;

            report.fieldsAttempted++;
            const result = fillDigitBoxField(page, mapping.value, config, font, calibration);
            if (result.success) report.fieldsSucceeded++;
            report.fieldDetails.push({
                fieldName: mapping.fieldKey,
                value: mapping.value,
                success: result.success,
                coordinates: { x: config.anchorX, y: config.anchorY }
            });
        }

        if (data.companyInfo?.corporateName) {
            const config = BEPPYO5_PAGE2_TEXT['法人名'];
            if (config) fillTextField(page, data.companyInfo.corporateName, config, font, calibration);
        }
    }

    const outputBytes = await pdfDoc.save();
    return { pdfBytes: outputBytes, report };
}

/**
 * Fill Beppyo 15 with digit boxes
 */
export async function fillBeppyo15WithDigitBoxes(
    bytes: Uint8Array,
    data: CorporateTaxInputData,
    calibration: any,
    debugMode: boolean
): Promise<{ pdfBytes: Uint8Array; report: DigitBoxReport }> {
    const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    pdfDoc.registerFontkit(fontkit);
    const font = await loadFont(pdfDoc);
    const page = pdfDoc.getPages()[0];

    const report: DigitBoxReport = {
        template: 'beppyo15',
        calibrationUsed: calibration,
        fieldsAttempted: 0,
        fieldsSucceeded: 0,
        fieldDetails: []
    };

    if (!debugMode) {
        const b15 = data.beppyo15 || { totalEntertainmentExpenses: 0, foodAndDrinkExpenses: 0, deductionLimit: 0, excessAmount: 0 };

        const fieldMappings: { fieldKey: string; value: number }[] = [
            { fieldKey: '支出交際費等の額_row1', value: b15.totalEntertainmentExpenses },
            // 接待飲食費の額_row2 is usually 50% of foodDrink or similar
            { fieldKey: '接待飲食費の額_row2', value: b15.foodAndDrinkExpenses },
            { fieldKey: '指定限度額_row17', value: b15.deductionLimit },
            { fieldKey: '損金不算入額_row18', value: b15.excessAmount },
        ];

        for (const mapping of fieldMappings) {
            const config = BEPPYO15_FIELDS[mapping.fieldKey];
            if (!config) continue;
            report.fieldsAttempted++;
            const result = fillDigitBoxField(page, mapping.value, config, font, calibration);
            if (result.success) report.fieldsSucceeded++;
            report.fieldDetails.push({
                fieldName: mapping.fieldKey,
                value: mapping.value,
                success: result.success,
                coordinates: { x: config.anchorX, y: config.anchorY }
            });
        }

        if (data.companyInfo?.corporateName) {
            const config = BEPPYO15_TEXT['法人名'];
            if (config) fillTextField(page, data.companyInfo.corporateName, config, font, calibration);
        }
    }

    const outputBytes = await pdfDoc.save();
    return { pdfBytes: outputBytes, report };
}

/**
 * Fill Beppyo 16 with digit boxes
 * Handles Page 1 (Straight Line) and Page 2 (Declining Balance)
 */
export async function fillBeppyo16WithDigitBoxes(
    bytes: Uint8Array,
    data: CorporateTaxInputData,
    calibration: any,
    debugMode: boolean
): Promise<{ pdfBytes: Uint8Array; report: DigitBoxReport }> {
    const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    pdfDoc.registerFontkit(fontkit);
    const font = await loadFont(pdfDoc);
    const pages = pdfDoc.getPages();

    // Page 1: Straight Line
    // Page 2: Declining Balance (if exists)

    const report: DigitBoxReport = {
        template: 'beppyo16',
        calibrationUsed: calibration,
        fieldsAttempted: 0,
        fieldsSucceeded: 0,
        fieldDetails: []
    };

    if (!debugMode) {
        // Simplified mapping logic:
        // Finds first regular/straight asset for Page 1
        // Finds first declining asset for Page 2
        // In reality, this form handles multiple assets in columns.
        // We'll just map one column for now as per current field definitions (row1).

        const assets = data.beppyo16?.assets || [];

        // Page 1: Straight Line
        const straightAssets = assets.filter(a => a.depreciationMethod === 'straight_line');
        if (straightAssets.length > 0 && pages.length > 0) {
            const page1 = pages[0];

            straightAssets.forEach((asset, index) => {
                const rowNum = index + 1;
                if (rowNum > 6) return; // Limit to 6 rows

                const items = [
                    { fieldKey: `取得価額_row${rowNum}`, value: asset.acquisitionCost },
                    { fieldKey: `期末帳簿価額_row${rowNum}`, value: asset.bookValueEnd },
                    { fieldKey: `償却限度額_row${rowNum}`, value: asset.allowableLimit },
                    { fieldKey: `当期償却額_row${rowNum}`, value: asset.currentDepreciation },
                    { fieldKey: `償却超過額_row${rowNum}`, value: Math.max(0, asset.currentDepreciation - asset.allowableLimit) }
                ];

                for (const item of items) {
                    const config = BEPPYO16_1_FIELDS[item.fieldKey];
                    if (config) {
                        report.fieldsAttempted++;
                        const result = fillDigitBoxField(page1, item.value, config, font, calibration);
                        if (result.success) report.fieldsSucceeded++;
                        report.fieldDetails.push({
                            fieldName: item.fieldKey,
                            value: item.value,
                            success: result.success,
                            coordinates: { x: config.anchorX, y: config.anchorY }
                        });
                    }
                }

                // Asset Name
                const nameConfig = BEPPYO16_1_TEXT[`資産名_row${rowNum}`];
                if (nameConfig) {
                    fillTextField(page1, asset.name, nameConfig, font, calibration);
                    report.fieldsSucceeded++;
                }
            });

            if (data.companyInfo?.corporateName) {
                const config = BEPPYO16_1_TEXT['法人名'];
                if (config) fillTextField(page1, data.companyInfo.corporateName, config, font, calibration);
            }
        }

        // Page 2: Declining Balance
        const decliningAssets = assets.filter(a => a.depreciationMethod === 'declining_balance');
        if (decliningAssets.length > 0 && pages.length > 1) {
            const page2 = pages[1];

            decliningAssets.forEach((asset, index) => {
                const rowNum = index + 1;
                if (rowNum > 6) return; // Limit to 6 rows

                const items = [
                    { fieldKey: `取得価額_row${rowNum}`, value: asset.acquisitionCost },
                    { fieldKey: `期末帳簿価額_row${rowNum}`, value: asset.bookValueEnd },
                    { fieldKey: `償却限度額_row${rowNum}`, value: asset.allowableLimit },
                    { fieldKey: `当期償却額_row${rowNum}`, value: asset.currentDepreciation },
                    { fieldKey: `償却超過額_row${rowNum}`, value: Math.max(0, asset.currentDepreciation - asset.allowableLimit) }
                ];

                for (const item of items) {
                    const config = BEPPYO16_2_FIELDS[item.fieldKey];
                    if (config) {
                        report.fieldsAttempted++;
                        const result = fillDigitBoxField(page2, item.value, config, font, calibration);
                        if (result.success) report.fieldsSucceeded++;
                        report.fieldDetails.push({
                            fieldName: item.fieldKey,
                            value: item.value,
                            success: result.success,
                            coordinates: { x: config.anchorX, y: config.anchorY }
                        });
                    }
                }

                // Asset Name
                const nameConfig = BEPPYO16_2_TEXT[`資産名_row${rowNum}`];
                if (nameConfig) {
                    fillTextField(page2, asset.name, nameConfig, font, calibration);
                    report.fieldsSucceeded++;
                }
            });

            if (data.companyInfo?.corporateName) {
                const config = BEPPYO16_2_TEXT['法人名'];
                if (config) fillTextField(page2, data.companyInfo.corporateName, config, font, calibration);
            }
        }
    }

    const outputBytes = await pdfDoc.save();
    return { pdfBytes: outputBytes, report };
}

export function getCoordinateMap(): { [fieldName: string]: { x: number; y: number; description: string } } {
    const map: { [fieldName: string]: { x: number; y: number; description: string } } = {};

    for (const [key, config] of Object.entries(BEPPYO1_FIELDS)) {
        map[key] = {
            x: config.anchorX,
            y: config.anchorY,
            description: `Beppyo 1 Row anchor at (${config.anchorX}, ${config.anchorY})`
        };
    }

    for (const [key, config] of Object.entries(BEPPYO4_FIELDS)) {
        map[`B4_${key}`] = {
            x: config.anchorX,
            y: config.anchorY,
            description: `Beppyo 4 Row anchor at (${config.anchorX}, ${config.anchorY})`
        };
    }

    for (const [key, config] of Object.entries(BEPPYO5_PAGE1_FIELDS)) {
        map[`B5_${key}`] = {
            x: config.anchorX,
            y: config.anchorY,
            description: `Beppyo 5 Row anchor at (${config.anchorX}, ${config.anchorY})`
        };
    }

    return map;
}
