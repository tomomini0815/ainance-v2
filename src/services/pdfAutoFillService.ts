/**
 * 確定申告書PDF自動転記サービス
 * 国税庁のテンプレートPDFにAinanceのデータを自動で入力
 */

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

// 確定申告書第一表・第二表の入力座標マッピング（令和7年分）
// 2026-02-06 キャリブレーション済み座標（座標キャリブレーターで調整）
// 座標は左下原点でpt単位、anchorX/Yは数値の最後尾（右端）の箱中央を指す
// boxSpacing: 14.2pt（公式枠の間隔に調整）
// fontSize: 11pt（書類の数字サイズに調整）

interface DigitFieldConfig {
  anchorX: number;      // 最後尾（右端）の箱の中央X座標
  anchorY: number;      // 箱の中央Y座標
  boxSpacing: number;   // 各桁の箱の間隔（左方向へ）
  fontSize: number;     // フォントサイズ
  maxDigits: number;    // 最大桁数
}

interface TextFieldConfig {
  x: number;
  y: number;
  fontSize: number;
}

// キャリブレーション済みデフォルト設定
// boxSpacing: 14.2pt = 文字間隔を詰めて枠に合わせる
// fontSize: 11pt = 書類のフォントサイズに合わせる
const CALIBRATED_BOX_SPACING = 14.2;
const CALIBRATED_FONT_SIZE = 11;
const DEFAULT_MAX_DIGITS = 12;

// ===== 確定申告書第一表 - 数値フィールド（キャリブレーション済み） =====
const TAX_RETURN_B_DIGIT_FIELDS: { [key: string]: DigitFieldConfig } = {
  // ============================================
  // 左側 - 収入金額等
  // ============================================
  '収入_ア_営業等': { anchorX: 286.7, anchorY: 672.6, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '収入_イ_農業': { anchorX: 286.7, anchorY: 655.8, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '収入_ウ_不動産': { anchorX: 286.7, anchorY: 639.2, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '収入_エ_給与': { anchorX: 286.7, anchorY: 621.8, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '収入_オ_公的年金等': { anchorX: 287.3, anchorY: 604.5, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '収入_カ_業務': { anchorX: 286.7, anchorY: 587.2, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '収入_キ_その他': { anchorX: 287.3, anchorY: 569.8, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '収入_ク_短期': { anchorX: 287.3, anchorY: 553.2, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '収入_ケ_長期': { anchorX: 286, anchorY: 535.2, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '収入_コ_一時': { anchorX: 286, anchorY: 519.2, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },

  // ============================================
  // 左側 - 所得金額等
  // ============================================
  '所得_1_営業等': { anchorX: 287.3, anchorY: 483.6, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '所得_2_農業': { anchorX: 287.3, anchorY: 465.6, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '所得_3_不動産': { anchorX: 286.7, anchorY: 449.6, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '所得_4_利子': { anchorX: 286.7, anchorY: 432.3, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '所得_5_配当': { anchorX: 288, anchorY: 414.3, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '所得_6_給与': { anchorX: 286, anchorY: 397, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '所得_7_公的年金等': { anchorX: 286.7, anchorY: 379.6, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '所得_8_業務': { anchorX: 286, anchorY: 363, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '所得_9_その他': { anchorX: 286.7, anchorY: 345.6, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '所得_10_小計': { anchorX: 287.3, anchorY: 327.6, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '所得_11_総合課税': { anchorX: 286.7, anchorY: 311, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '所得_12_合計': { anchorX: 286.7, anchorY: 294.3, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },

  // ============================================
  // 左側 - 所得から差し引かれる金額（所得控除）
  // ============================================
  '控除_13_社会保険料': { anchorX: 286, anchorY: 275.6, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '控除_14_小規模企業共済': { anchorX: 286, anchorY: 258.3, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '控除_15_生命保険料': { anchorX: 286, anchorY: 241.6, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '控除_16_地震保険料': { anchorX: 286.7, anchorY: 225, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '控除_17_寡婦ひとり親': { anchorX: 227.3, anchorY: 207, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '控除_18_勤労学生障害者': { anchorX: 286.0, anchorY: 207, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '控除_19_配偶者': { anchorX: 227.3, anchorY: 189.6, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '控除_20_配偶者特別': { anchorX: 286.0, anchorY: 189.6, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '控除_21_扶養': { anchorX: 286.0, anchorY: 171.6, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '控除_23_扶養': { anchorX: 286.0, anchorY: 153.6, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS }, // 旧 21
  '控除_25_基礎控除': { anchorX: 286.0, anchorY: 117.6, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS }, // 旧 22
  '控除_26_合計': { anchorX: 286, anchorY: 99.6, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS }, // 修正：Row 25の次
  '控除_27_雑損': { anchorX: 286.0, anchorY: 81.6, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '控除_28_医療費': { anchorX: 286.0, anchorY: 63.6, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS }, // 旧 24
  '控除_29_寄附金': { anchorX: 286.0, anchorY: 45.6, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS }, // 旧 25

  // ============================================
  // 右側上部 - 税金の計算 (31番以降)
  // ============================================
  '税額_31_課税所得': { anchorX: 552.7, anchorY: 672.6, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '税額_32_上の税額': { anchorX: 552.7, anchorY: 655.2, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '税額_33_配当控除': { anchorX: 552.7, anchorY: 638, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '税額_42_差引所得税額': { anchorX: 551.3, anchorY: 550, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },

  // ============================================
  // 右側中段 - 復興・源泉・納税額
  // ============================================
  '税額_43_災害減免額': { anchorX: 550.7, anchorY: 537.5, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '税額_44_再差引所得税': { anchorX: 552, anchorY: 520.8, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '税額_45_復興特別所得税': { anchorX: 551.3, anchorY: 500.8, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '税額_46_所得税復興税合計': { anchorX: 552, anchorY: 484.8, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '税額_48_源泉徴収税額': { anchorX: 551.3, anchorY: 466.8, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '税額_51_納める税金': { anchorX: 552, anchorY: 414.3, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '税額_52_還付される税金': { anchorX: 522, anchorY: 396.1, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },

  // ============================================
  // 右側下部 - その他
  // ============================================
  '他_56_公的年金以外': { anchorX: 551.3, anchorY: 327.6, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '他_59_青色申告特別控除': { anchorX: 550.7, anchorY: 275, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '他_66_延納届出額': { anchorX: 506.7, anchorY: 153.6, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
};

// ===== 確定申告書第一表 - テキストフィールド（キャリブレーション済み） =====
const TAX_RETURN_B_TEXT_FIELDS: { [key: string]: TextFieldConfig } = {
  '氏名': { x: 364.7, y: 738.8, fontSize: 9 },
  '住所': { x: 89.3, y: 758.8, fontSize: 9 },
  '税務署名': { x: 48, y: 818.1, fontSize: 9 },
  '職業': { x: 294, y: 711.9, fontSize: 9 },
  '屋号': { x: 373.3, y: 712.6, fontSize: 9 },
  '電話番号': { x: 480, y: 692.6, fontSize: 9 },
};

// ===== 確定申告書第二表 - テキストフィールド =====
// 第二表はテキスト中心のフォーム（自由記入欄が多い）
// ページサイズはA4 (595x842pt)、座標は左下原点

// 第二表ヘッダー
const TAX_RETURN_TABLE2_TEXT_FIELDS: { [key: string]: TextFieldConfig } = {
  '住所': { x: 89, y: 787, fontSize: 8 },
  '氏名': { x: 340, y: 787, fontSize: 8 },
};

// 第二表「所得の内訳」エリア（最大4行）
// 各行: 所得の種類(x:46), 種目・所得の生ずる場所(x:110), 給与などの収入金額(x:310), 源泉徴収税額(x:460)
interface Table2IncomeRowConfig {
  categoryX: number;
  payerX: number;
  amountX: number;
  taxX: number;
  y: number;
  fontSize: number;
}

const TABLE2_INCOME_ROWS: Table2IncomeRowConfig[] = [
  { categoryX: 46, payerX: 135, amountX: 330, taxX: 478, y: 693, fontSize: 7 },
  { categoryX: 46, payerX: 135, amountX: 330, taxX: 478, y: 679, fontSize: 7 },
  { categoryX: 46, payerX: 135, amountX: 330, taxX: 478, y: 665, fontSize: 7 },
  { categoryX: 46, payerX: 135, amountX: 330, taxX: 478, y: 651, fontSize: 7 },
];

// 第二表「所得の内訳」合計行の座標
const TABLE2_INCOME_TOTAL: DigitFieldConfig = {
  anchorX: 540, anchorY: 625, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: 9, maxDigits: 10,
};

// 第二表「社会保険料控除」エリア（最大3行）
// 各行: 社会保険の種類(x:46), 支払保険料(x:200)
interface Table2InsuranceRowConfig {
  typeX: number;
  amountX: number;
  y: number;
  fontSize: number;
}

const TABLE2_SOCIAL_INSURANCE_ROWS: Table2InsuranceRowConfig[] = [
  { typeX: 46, amountX: 220, y: 509, fontSize: 7 },
  { typeX: 46, amountX: 220, y: 496, fontSize: 7 },
  { typeX: 46, amountX: 220, y: 483, fontSize: 7 },
];

// 第二表「生命保険料控除」エリア（最大2行）
// 各行: 保険会社名(x:300), 保険料種別(x:380), 支払金額(x:510)
const TABLE2_LIFE_INSURANCE_ROWS: Table2InsuranceRowConfig[] = [
  { typeX: 300, amountX: 510, y: 509, fontSize: 7 },
  { typeX: 300, amountX: 510, y: 496, fontSize: 7 },
];

// 第二表「地震保険料控除」エリア（最大1行）
const TABLE2_EARTHQUAKE_INSURANCE_ROWS: Table2InsuranceRowConfig[] = [
  { typeX: 300, amountX: 510, y: 460, fontSize: 7 },
];

// 第二表「配偶者・扶養親族」テキスト座標
const TABLE2_SPOUSE_FIELD: TextFieldConfig = { x: 60, y: 355, fontSize: 7 };
const TABLE2_DEPENDENT_ROWS: TextFieldConfig[] = [
  { x: 60, y: 322, fontSize: 7 },
  { x: 60, y: 309, fontSize: 7 },
  { x: 60, y: 296, fontSize: 7 },
];

// 第二表「住民税」徴収方法チェック座標
const TABLE2_RESIDENT_TAX_SPECIAL: TextFieldConfig = { x: 91, y: 176, fontSize: 9 };
const TABLE2_RESIDENT_TAX_ORDINARY: TextFieldConfig = { x: 176, y: 176, fontSize: 9 };


// ===== 青色申告決算書 - 数値フィールド =====
const BLUE_RETURN_DIGIT_FIELDS: { [key: string]: DigitFieldConfig } = {
  '売上金額': { anchorX: 436.7, anchorY: 676.1, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '売上原価': { anchorX: 436.7, anchorY: 636, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '経費合計': { anchorX: 436.7, anchorY: 396.6, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '青色申告特別控除': { anchorX: 436.7, anchorY: 196.6, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '所得金額': { anchorX: 436.7, anchorY: 146.6, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
};

const BLUE_RETURN_TEXT_FIELDS: { [key: string]: TextFieldConfig } = {
  '屋号': { x: 100, y: 746, fontSize: 9 },
  '住所': { x: 100, y: 716, fontSize: 9 },
  '氏名': { x: 100, y: 686, fontSize: 9 },
};

// ===== 収支内訳書 - 数値フィールド =====
const INCOME_STATEMENT_DIGIT_FIELDS: { [key: string]: DigitFieldConfig } = {
  '売上金額': { anchorX: 436.7, anchorY: 696.1, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '経費合計': { anchorX: 436.7, anchorY: 396.6, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '小計17': { anchorX: 550, anchorY: 147, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '所得金額21': { anchorX: 550, anchorY: 87, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
};

const INCOME_STATEMENT_TEXT_FIELDS: { [key: string]: TextFieldConfig } = {
  '屋号': { x: 452.7, y: 728.8, fontSize: 9 },
  '住所': { x: 89, y: 742, fontSize: 9 },
  '氏名': { x: 100, y: 686, fontSize: 9 },
};

/**
 * 日本語フォントをロードしてPDFDocumentに登録
 */
async function loadNotoSans(pdfDoc: PDFDocument) {
  try {
    const fontUrl = '/fonts/NotoSansCJKjp-Regular.otf';
    const fontBytes = await fetch(fontUrl).then(res => {
      if (!res.ok) throw new Error(`Font fetch failed: ${res.status}`);
      return res.arrayBuffer();
    });
    pdfDoc.registerFontkit(fontkit);
    return await pdfDoc.embedFont(fontBytes);
  } catch (e) {
    console.warn('[PDF] Failed to load NotoSans font, falling back to Helvetica:', e);
    return await pdfDoc.embedFont(StandardFonts.Helvetica);
  }
}

/**
 * 数値を1桁ずつ枠に充填する共通ロジック
 */
function drawDigitInBox(
  page: any,
  font: any,
  value: any,
  config: DigitFieldConfig
) {
  if (value === undefined || value === null || value === '') return;
  const numValue = Number(value);
  if (isNaN(numValue) || numValue === 0) return;

  const absValue = Math.abs(Math.floor(numValue));
  const digits = String(absValue).split('');
  const reversedDigits = [...digits].reverse();

  reversedDigits.forEach((digit, index) => {
    // === 特殊対応：下位桁の表示抑制（ユーザー要望） ===
    // 判定精度を上げるため、座標のわずかな誤差を許容する (±2.0pt)
    // 1. 基礎控除 (Row 25, Y=117.6)
    // 左側カラム (anchorX < 300) で、基礎控除周辺の場合、下4桁を空欄にする。
    // ※ ⑬から㉕までの計 (Row 26, Y=99.6) は、ゼロが必要なため対象外。
    const isBasicDeductionRow = config.anchorX < 300 && Math.abs(config.anchorY - 117.6) < 2.0;
    if (isBasicDeductionRow && index < 4 && digit === '0') {
      return;
    }

    // 2. 課税所得 (Row 31, Y=672.6)
    // 右側カラム (anchorX > 500) で、課税所得周辺の場合、下3桁を空欄にする。
    const isTaxableIncomeRow = config.anchorX > 500 && Math.abs(config.anchorY - 672.6) < 2.0;
    if (isTaxableIncomeRow && index < 3 && digit === '0') {
      return;
    }

    const textWidth = font.widthOfTextAtSize(digit, config.fontSize);
    // 右端から左へ配置
    const x = config.anchorX - (index * config.boxSpacing) - (textWidth / 2);
    const y = config.anchorY;

    page.drawText(digit, {
      x,
      y,
      size: config.fontSize,
      font,
      color: rgb(0, 0, 0),
    });
  });
}

/**
 * テキストを描画する共通ロジック
 */
function drawLabel(
  page: any,
  font: any,
  text: string,
  config: TextFieldConfig
) {
  if (!text) return;
  page.drawText(text, {
    x: config.x,
    y: config.y,
    size: config.fontSize,
    font,
    color: rgb(0, 0, 0),
  });
}

// 削除：BLUE_RETURN_FIELDS, CATEGORY_TO_ACCOUNT_MAPなどは不要になったため整理

export interface TaxFormData {
  // 申告者情報（個人）
  name?: string;
  furigana?: string;
  address?: string;
  phone?: string;
  birthDate?: { year: number; month: number; day: number };
  tradeName?: string; // 屋号

  // 法人情報
  companyName?: string;           // 会社名
  representativeName?: string;    // 代表者名
  corporateNumber?: string;       // 法人番号
  capital?: number;               // 資本金
  businessType?: 'individual' | 'corporation';

  // 収支データ
  revenue: number;
  expenses: number;
  netIncome: number;

  // 収入金額等（個人用）
  businessIncome?: number;        // 事業所得
  salaryIncome?: number;          // 給与収入
  totalIncome?: number;           // 合計所得

  // 経費内訳
  expensesByCategory: { category: string; amount: number }[];

  // 控除（個人用）
  deductions: {
    socialInsurance?: number;
    smallBusinessMutual?: number;
    lifeInsurance?: number;
    earthquakeInsurance?: number;
    spouse?: number;
    dependents?: number;
    basic?: number;
    blueReturn?: number;
    withholdingTax?: number;  // 源泉徴収税額
  };

  // 医療費控除等（個人用追加）
  medicalExpenses?: number;
  blueReturnDeduction?: number;   // 青色申告特別控除額

  // 法人用追加項目
  corporateTax?: {
    taxableIncome?: number;       // 課税所得
    corporateTaxAmount?: number;  // 法人税額
    localCorporateTax?: number;   // 地方法人税
    prefecturalTax?: number;      // 都道府県民税
    municipalTax?: number;        // 市町村民税
    businessTax?: number;         // 事業税
    totalTax?: number;            // 税金合計
  };

  // 税額
  taxableIncome: number;
  estimatedTax: number;

  // 年度
  fiscalYear: number;
  fiscalYearStart?: string;
  fiscalYearEnd?: string;
  isBlueReturn: boolean;

  // 第二表：所得の内訳（源泉徴収税額に関する事項）
  withholdingTaxDetails?: {
    incomeCategory: string; // 所得の種類
    payerName: string;      // 種目・所得の生ずる場所
    revenueAmount: number;  // 収入金額
    taxAmount: number;      // 源泉徴収税額
  }[];

  // 第二表：社会保険料控除の明細
  socialInsuranceDetails?: {
    type: string;   // 社会保険の種類
    amount: number; // 支払金額
  }[];

  // 第二表：生命保険料控除の明細
  lifeInsuranceDetails?: {
    companyName: string;    // 保険会社名
    paymentAmount: number;  // 支払金額
  }[];

  // 第二表：地震保険料控除の明細
  earthquakeInsuranceDetails?: {
    companyName: string;
    paymentAmount: number;
  }[];

  // 第二表：配偶者・扶養情報
  spouseName?: string;
  dependentNames?: string[];

  // 第二表：住民税徴収方法
  residentTaxMethod?: 'special' | 'ordinary';

  // 青色申告：給与の内訳等
  employeeSalaries?: {
    name: string;
    monthsWorked: number;
    salaryAmount: number;
    bonusAmount: number;
    withholdingTax: number;
  }[];
}

/**
 * 確定申告書BにAinanceのデータを自動転記（DigitBox方式）
 * 数値は1桁ずつ右から左へ四角い枠に配置
 */
export async function fillTaxReturnB(
  templateBytes: ArrayBuffer,
  data: TaxFormData
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(templateBytes, { ignoreEncryption: true });
  const font = await loadNotoSans(pdfDoc);
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];

  // ヘルパー関数のマッピング
  const fillDigitBox = (val: any, cfg: DigitFieldConfig) => drawDigitInBox(firstPage, font, val, cfg);
  const drawText = (val: string, cfg: TextFieldConfig) => drawLabel(firstPage, font, val, cfg);

  // === 第一表 - 収入金額等 ===
  fillDigitBox(data.revenue, TAX_RETURN_B_DIGIT_FIELDS['収入_ア_営業等']);
  if (data.salaryIncome) {
    fillDigitBox(data.salaryIncome, TAX_RETURN_B_DIGIT_FIELDS['収入_エ_給与']);
  }

  // === 第一表 - 所得金額等 ===
  fillDigitBox(data.businessIncome || data.netIncome, TAX_RETURN_B_DIGIT_FIELDS['所得_1_営業等']);
  if (data.salaryIncome) {
    fillDigitBox(data.salaryIncome, TAX_RETURN_B_DIGIT_FIELDS['所得_6_給与']);
  }
  fillDigitBox(data.totalIncome || data.netIncome, TAX_RETURN_B_DIGIT_FIELDS['所得_12_合計']);

  // === 第一表 - 所得控除 ===
  if (data.deductions?.socialInsurance) {
    fillDigitBox(data.deductions.socialInsurance, TAX_RETURN_B_DIGIT_FIELDS['控除_13_社会保険料']);
  }
  if (data.deductions?.smallBusinessMutual) {
    fillDigitBox(data.deductions.smallBusinessMutual, TAX_RETURN_B_DIGIT_FIELDS['控除_14_小規模企業共済']);
  }
  if (data.deductions?.lifeInsurance) {
    fillDigitBox(data.deductions.lifeInsurance, TAX_RETURN_B_DIGIT_FIELDS['控除_15_生命保険料']);
  }
  if (data.deductions?.earthquakeInsurance) {
    fillDigitBox(data.deductions.earthquakeInsurance, TAX_RETURN_B_DIGIT_FIELDS['控除_16_地震保険料']);
  }

  if ((data.deductions as any)?.widow) {
    fillDigitBox((data.deductions as any).widow, TAX_RETURN_B_DIGIT_FIELDS['控除_17_寡婦ひとり親']);
  }
  if ((data.deductions as any)?.workingStudent) {
    fillDigitBox((data.deductions as any).workingStudent, TAX_RETURN_B_DIGIT_FIELDS['控除_18_勤労学生障害者']);
  }
  if (data.deductions?.spouse) {
    fillDigitBox(data.deductions.spouse, TAX_RETURN_B_DIGIT_FIELDS['控除_19_配偶者']);
  }
  if (data.deductions?.dependents) {
    fillDigitBox(data.deductions.dependents, TAX_RETURN_B_DIGIT_FIELDS['控除_23_扶養']);
  }
  if (data.deductions?.basic) {
    fillDigitBox(data.deductions.basic, TAX_RETURN_B_DIGIT_FIELDS['控除_25_基礎控除']);
  }
  if (data.medicalExpenses) {
    fillDigitBox(data.medicalExpenses, TAX_RETURN_B_DIGIT_FIELDS['控除_28_医療費']);
  }

  // 所得控除合計 (26)
  const deductionEntries = Object.entries(data.deductions || {}).filter(([key]) => key !== 'withholdingTax');
  const totalDeductions = deductionEntries.reduce((sum, [_, val]) => sum + (Number(val) || 0), 0);
  fillDigitBox(totalDeductions, TAX_RETURN_B_DIGIT_FIELDS['控除_26_合計']);

  // === 税金の計算 ===
  // 課税される所得金額 (31): 1,000円未満切捨て
  const truncatedTaxableIncome = Math.floor((data.taxableIncome || 0) / 1000) * 1000;
  fillDigitBox(truncatedTaxableIncome, TAX_RETURN_B_DIGIT_FIELDS['税額_31_課税所得']);
  fillDigitBox(data.estimatedTax, TAX_RETURN_B_DIGIT_FIELDS['税額_32_上の税額']);
  fillDigitBox(data.estimatedTax, TAX_RETURN_B_DIGIT_FIELDS['税額_42_差引所得税額']);
  fillDigitBox(data.estimatedTax, TAX_RETURN_B_DIGIT_FIELDS['税額_44_再差引所得税']);

  // 復興、合計、源泉
  const reconstructionTax = Math.floor(data.estimatedTax * 0.021);
  fillDigitBox(reconstructionTax, TAX_RETURN_B_DIGIT_FIELDS['税額_45_復興特別所得税']);
  const totalTax = data.estimatedTax + reconstructionTax;
  fillDigitBox(totalTax, TAX_RETURN_B_DIGIT_FIELDS['税額_46_所得税復興税合計']);

  const withholdingTax = data.deductions?.withholdingTax || 0;
  if (withholdingTax > 0) {
    fillDigitBox(withholdingTax, TAX_RETURN_B_DIGIT_FIELDS['税額_48_源泉徴収税額']);
  }

  // 納める税金 / 還付
  const taxPayable = totalTax - withholdingTax;
  if (taxPayable > 0) {
    fillDigitBox(taxPayable, TAX_RETURN_B_DIGIT_FIELDS['税額_51_納める税金']);
  } else if (taxPayable < 0) {
    fillDigitBox(Math.abs(taxPayable), TAX_RETURN_B_DIGIT_FIELDS['税額_52_還付される税金']);
  }

  if (data.isBlueReturn && data.blueReturnDeduction) {
    fillDigitBox(data.blueReturnDeduction, TAX_RETURN_B_DIGIT_FIELDS['他_59_青色申告特別控除']);
  }

  // === テキスト転記 ===
  drawText(data.name || '', TAX_RETURN_B_TEXT_FIELDS['氏名']);
  drawText(data.address || '', TAX_RETURN_B_TEXT_FIELDS['住所']);
  if (data.tradeName) drawText(data.tradeName, TAX_RETURN_B_TEXT_FIELDS['屋号']);
  if (data.phone) drawText(data.phone, TAX_RETURN_B_TEXT_FIELDS['電話番号']);

  // ================================================
  // === 第二表（ページ2）への転記 ===
  // ================================================
  if (pages.length >= 2) {
    const secondPage = pages[1];
    const drawText2 = (val: string, cfg: TextFieldConfig) => drawLabel(secondPage, font, val, cfg);
    const fillDigitBox2 = (val: any, cfg: DigitFieldConfig) => drawDigitInBox(secondPage, font, val, cfg);

    // --- ヘッダー（住所・氏名） ---
    drawText2(data.address || '', TAX_RETURN_TABLE2_TEXT_FIELDS['住所']);
    drawText2(data.name || '', TAX_RETURN_TABLE2_TEXT_FIELDS['氏名']);

    // --- 所得の内訳（源泉徴収税額に関する事項） ---
    if (data.withholdingTaxDetails && data.withholdingTaxDetails.length > 0) {
      let totalWithholdingTax = 0;
      data.withholdingTaxDetails.slice(0, TABLE2_INCOME_ROWS.length).forEach((detail, i) => {
        const row = TABLE2_INCOME_ROWS[i];
        drawLabel(secondPage, font, detail.incomeCategory, { x: row.categoryX, y: row.y, fontSize: row.fontSize });
        drawLabel(secondPage, font, detail.payerName, { x: row.payerX, y: row.y, fontSize: row.fontSize });
        if (detail.revenueAmount > 0) {
          drawLabel(secondPage, font, detail.revenueAmount.toLocaleString(), { x: row.amountX, y: row.y, fontSize: row.fontSize });
        }
        if (detail.taxAmount > 0) {
          drawLabel(secondPage, font, detail.taxAmount.toLocaleString(), { x: row.taxX, y: row.y, fontSize: row.fontSize });
        }
        totalWithholdingTax += detail.taxAmount || 0;
      });
      // 合計行
      if (totalWithholdingTax > 0) {
        fillDigitBox2(totalWithholdingTax, TABLE2_INCOME_TOTAL);
      }
    }

    // --- 社会保険料控除の内訳 ---
    if (data.socialInsuranceDetails && data.socialInsuranceDetails.length > 0) {
      data.socialInsuranceDetails.slice(0, TABLE2_SOCIAL_INSURANCE_ROWS.length).forEach((detail, i) => {
        const row = TABLE2_SOCIAL_INSURANCE_ROWS[i];
        drawLabel(secondPage, font, detail.type, { x: row.typeX, y: row.y, fontSize: row.fontSize });
        if (detail.amount > 0) {
          drawLabel(secondPage, font, detail.amount.toLocaleString(), { x: row.amountX, y: row.y, fontSize: row.fontSize });
        }
      });
    }

    // --- 生命保険料控除の内訳 ---
    if (data.lifeInsuranceDetails && data.lifeInsuranceDetails.length > 0) {
      data.lifeInsuranceDetails.slice(0, TABLE2_LIFE_INSURANCE_ROWS.length).forEach((detail, i) => {
        const row = TABLE2_LIFE_INSURANCE_ROWS[i];
        drawLabel(secondPage, font, detail.companyName, { x: row.typeX, y: row.y, fontSize: row.fontSize });
        if (detail.paymentAmount > 0) {
          drawLabel(secondPage, font, detail.paymentAmount.toLocaleString(), { x: row.amountX, y: row.y, fontSize: row.fontSize });
        }
      });
    }

    // --- 地震保険料控除の内訳 ---
    if (data.earthquakeInsuranceDetails && data.earthquakeInsuranceDetails.length > 0) {
      data.earthquakeInsuranceDetails.slice(0, TABLE2_EARTHQUAKE_INSURANCE_ROWS.length).forEach((detail, i) => {
        const row = TABLE2_EARTHQUAKE_INSURANCE_ROWS[i];
        drawLabel(secondPage, font, detail.companyName, { x: row.typeX, y: row.y, fontSize: row.fontSize });
        if (detail.paymentAmount > 0) {
          drawLabel(secondPage, font, detail.paymentAmount.toLocaleString(), { x: row.amountX, y: row.y, fontSize: row.fontSize });
        }
      });
    }

    // --- 配偶者に関する事項 ---
    if (data.spouseName) {
      drawText2(data.spouseName, TABLE2_SPOUSE_FIELD);
    }

    // --- 扶養親族に関する事項 ---
    if (data.dependentNames && data.dependentNames.length > 0) {
      data.dependentNames.slice(0, TABLE2_DEPENDENT_ROWS.length).forEach((name, i) => {
        drawText2(name, TABLE2_DEPENDENT_ROWS[i]);
      });
    }

    // --- 住民税徴収方法 ---
    if (data.residentTaxMethod === 'special') {
      drawText2('○', TABLE2_RESIDENT_TAX_SPECIAL);
    } else if (data.residentTaxMethod === 'ordinary') {
      drawText2('○', TABLE2_RESIDENT_TAX_ORDINARY);
    }
  }

  return pdfDoc.save();
}

// 青色申告：給料賃金の内訳テーブル座標 (Page 2 & Page 4)
const BLUE_RETURN_SALARY_ROWS = [
  { y: 569, nameX: 95, monthsX: 205, salaryBox: { anchorX: 412, anchorY: 569, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: 10, maxDigits: 10 }, bonusBox: { anchorX: 495, anchorY: 569, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: 10, maxDigits: 10 }, taxBox: { anchorX: 565, anchorY: 569, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: 10, maxDigits: 10 } },
  { y: 554, nameX: 95, monthsX: 205, salaryBox: { anchorX: 412, anchorY: 554, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: 10, maxDigits: 10 }, bonusBox: { anchorX: 495, anchorY: 554, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: 10, maxDigits: 10 }, taxBox: { anchorX: 565, anchorY: 554, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: 10, maxDigits: 10 } },
  { y: 539, nameX: 95, monthsX: 205, salaryBox: { anchorX: 412, anchorY: 539, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: 10, maxDigits: 10 }, bonusBox: { anchorX: 495, anchorY: 539, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: 10, maxDigits: 10 }, taxBox: { anchorX: 565, anchorY: 539, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: 10, maxDigits: 10 } },
];

/**
 * 青色申告決算書にAinanceのデータを自動転記
 */
// 新機能：青色申告決算書への転記
export async function fillBlueReturnForm(
  templateBytes: ArrayBuffer,
  data: TaxFormData
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(templateBytes, { ignoreEncryption: true });
  const font = await loadNotoSans(pdfDoc);
  const pages = pdfDoc.getPages();

  // Page 1とPage 3 (提出用と控用) に損益表を描画
  const fillPage1 = (page: any) => {
    drawDigitInBox(page, font, data.revenue, BLUE_RETURN_DIGIT_FIELDS['売上金額']);
    drawDigitInBox(page, font, data.expenses, BLUE_RETURN_DIGIT_FIELDS['経費合計']);
    if (data.deductions?.blueReturn) {
      drawDigitInBox(page, font, data.deductions.blueReturn, BLUE_RETURN_DIGIT_FIELDS['青色申告特別控除']);
    }
    drawDigitInBox(page, font, data.netIncome, BLUE_RETURN_DIGIT_FIELDS['所得金額']);

    drawLabel(page, font, data.name || '', BLUE_RETURN_TEXT_FIELDS['氏名']);
    drawLabel(page, font, data.address || '', BLUE_RETURN_TEXT_FIELDS['住所']);
    if (data.tradeName) drawLabel(page, font, data.tradeName, BLUE_RETURN_TEXT_FIELDS['屋号']);
  };

  // Page 2とPage 4 (提出用と控用) に給料テーブルを描画
  const fillPage2 = (page: any) => {
    if (data.employeeSalaries && data.employeeSalaries.length > 0) {
      data.employeeSalaries.slice(0, BLUE_RETURN_SALARY_ROWS.length).forEach((emp, i) => {
        const row = BLUE_RETURN_SALARY_ROWS[i];
        drawLabel(page, font, emp.name, { x: row.nameX, y: row.y, fontSize: 9 });
        drawLabel(page, font, emp.monthsWorked.toString(), { x: row.monthsX, y: row.y, fontSize: 9 });
        drawDigitInBox(page, font, emp.salaryAmount, row.salaryBox);
        if (emp.bonusAmount) drawDigitInBox(page, font, emp.bonusAmount, row.bonusBox);
        if (emp.withholdingTax) drawDigitInBox(page, font, emp.withholdingTax, row.taxBox);
      });

      // 合計を算出して一番下の計(y: 494くらい)に入れる簡易対応
      const totalSal = data.employeeSalaries.reduce((sum, e) => sum + (e.salaryAmount || 0), 0);
      const totalBonus = data.employeeSalaries.reduce((sum, e) => sum + (e.bonusAmount || 0), 0);
      const totalTax = data.employeeSalaries.reduce((sum, e) => sum + (e.withholdingTax || 0), 0);
      
      const totalRow = { y: 494, salaryBox: { anchorX: 412, anchorY: 494, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: 10, maxDigits: 10 }, bonusBox: { anchorX: 495, anchorY: 494, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: 10, maxDigits: 10 }, taxBox: { anchorX: 565, anchorY: 494, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: 10, maxDigits: 10 } };
      if (totalSal > 0) drawDigitInBox(page, font, totalSal, totalRow.salaryBox);
      if (totalBonus > 0) drawDigitInBox(page, font, totalBonus, totalRow.bonusBox);
      if (totalTax > 0) drawDigitInBox(page, font, totalTax, totalRow.taxBox);
    }
  };

  if (pages.length > 0) fillPage1(pages[0]);          // Page 1: 提出用 (事業/不動産)
  if (pages.length > 1) fillPage2(pages[1]);          // Page 2: 提出用 (内訳)
  if (pages.length > 2) fillPage1(pages[2]);          // Page 3: 控用   (事業/不動産)
  if (pages.length > 3) fillPage2(pages[3]);          // Page 4: 控用   (内訳)

  return pdfDoc.save();
}

// 新機能：収支内訳書への転記
export async function fillIncomeStatementForm(
  templateBytes: ArrayBuffer,
  data: TaxFormData
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(templateBytes, { ignoreEncryption: true });
  const font = await loadNotoSans(pdfDoc);
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];

  drawDigitInBox(firstPage, font, data.revenue, INCOME_STATEMENT_DIGIT_FIELDS['売上金額']);
  drawDigitInBox(firstPage, font, data.expenses, INCOME_STATEMENT_DIGIT_FIELDS['経費合計']);
  drawDigitInBox(firstPage, font, data.expenses, INCOME_STATEMENT_DIGIT_FIELDS['小計17']);
  drawDigitInBox(firstPage, font, data.netIncome, INCOME_STATEMENT_DIGIT_FIELDS['所得金額21']);

  drawLabel(firstPage, font, data.name || '', INCOME_STATEMENT_TEXT_FIELDS['氏名']);
  drawLabel(firstPage, font, data.address || '', INCOME_STATEMENT_TEXT_FIELDS['住所']);
  if (data.tradeName) drawLabel(firstPage, font, data.tradeName, INCOME_STATEMENT_TEXT_FIELDS['屋号']);

  return pdfDoc.save();
}

/**
 * テンプレートを読み込んでデータを自動転記
 * テンプレート読み込みに失敗した場合は白紙から生成
 */
export async function generateFilledTaxForm(
  formType: 'tax_return_b' | 'blue_return' | 'income_statement' | 'corporate_tax' | 'financial_statement',
  data: TaxFormData
): Promise<{ pdfBytes: Uint8Array; filename: string }> {
  // 法人用は従来通り
  if (formType === 'corporate_tax' || formType === 'financial_statement') {
    const pdfBytes = await generateFallbackPDF(formType, data);
    const filename = formType === 'corporate_tax'
      ? `法人税申告書_${data.fiscalYear}年度_入力済み.pdf`
      : `決算報告書_${data.fiscalYear}年度_入力済み.pdf`;
    return { pdfBytes, filename };
  }

  const templatePath = formType === 'tax_return_b'
    ? '/templates/kakutei_1_2.pdf'
    : formType === 'blue_return'
      ? '/templates/aoirokessansyo.pdf'
      : '/templates/syotokuuchiwakesyo.pdf';

  let pdfBytes: Uint8Array;

  try {
    const response = await fetch(templatePath);
    if (!response.ok) throw new Error(`Template load failed: ${response.statusText}`);
    const templateBytes = await response.arrayBuffer();

    if (formType === 'tax_return_b') {
      pdfBytes = await fillTaxReturnB(templateBytes, data);
    } else if (formType === 'blue_return') {
      pdfBytes = await fillBlueReturnForm(templateBytes, data);
    } else {
      pdfBytes = await fillIncomeStatementForm(templateBytes, data);
    }
  } catch (error) {
    console.warn('Using fallback PDF generation:', error);
    pdfBytes = await generateFallbackPDF(formType, data);
  }

  const filename = formType === 'tax_return_b'
    ? `確定申告書B_${data.fiscalYear}年度_入力済み.pdf`
    : formType === 'blue_return'
      ? `青色申告決算書_${data.fiscalYear}年度_入力済み.pdf`
      : `収支内訳書_${data.fiscalYear}年度_入力済み.pdf`;

  return { pdfBytes, filename };
}

/**
 * 白紙からPDFを生成（フォールバック用）
 * 確定申告書のレイアウトを再現
 */
async function generateFallbackPDF(
  formType: 'tax_return_b' | 'blue_return' | 'income_statement' | 'corporate_tax' | 'financial_statement',
  data: TaxFormData
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4サイズ

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const { width, height } = page.getSize();

  // 日本語をASCII互換に変換（pdf-libの標準フォントは日本語未対応）
  const safeText = (text: string | undefined): string => {
    if (!text) return '';
    // 非ASCII文字が含まれているかチェック
    // eslint-disable-next-line no-control-regex
    if (/[^\x00-\x7F]/.test(text)) {
      // 日本語の会社名などは英語プレースホルダーに変換
      if (text.includes('株式会社') || text.includes('合同会社')) {
        return '[Corporation]';
      }
      // 一般的な日本語はプレースホルダーに
      return '[See Ainance App]';
    }
    return text;
  };

  const formatNumber = (num: number) => {
    if (num === 0) return '0';
    // 数字をカンマ区切りで表示（標準ASCII数字のみ使用）
    return num.toLocaleString('en-US');
  };

  // 色定義
  const colors = {
    primary: rgb(0.2, 0.4, 0.8),
    corporate: rgb(0.4, 0.2, 0.6), // 法人用 紫
    header: rgb(0.15, 0.15, 0.15),
    text: rgb(0.1, 0.1, 0.1),
    muted: rgb(0.4, 0.4, 0.4),
    line: rgb(0.7, 0.7, 0.7),
    highlight: rgb(0.95, 0.95, 1),
    red: rgb(0.8, 0.2, 0.2),
    green: rgb(0.2, 0.6, 0.3),
  };

  // 法人向けはプライマリーカラーを変更
  const headerColor = (formType === 'corporate_tax' || formType === 'financial_statement')
    ? colors.corporate
    : colors.primary;

  // ヘルパー関数
  const drawText = (text: string, x: number, y: number, options: { size?: number; font?: typeof font; color?: typeof colors.text; align?: 'left' | 'right' } = {}) => {
    const size = options.size || 10;
    const textFont = options.font || font;
    const color = options.color || colors.text;

    let xPos = x;
    if (options.align === 'right') {
      const textWidth = textFont.widthOfTextAtSize(text, size);
      xPos = x - textWidth;
    }

    page.drawText(text, { x: xPos, y, size, font: textFont, color });
  };

  const drawLine = (x1: number, y1: number, x2: number, y2: number, thickness = 0.5) => {
    page.drawLine({
      start: { x: x1, y: y1 },
      end: { x: x2, y: y2 },
      thickness,
      color: colors.line,
    });
  };

  const drawRect = (x: number, y: number, w: number, h: number, color: typeof colors.highlight) => {
    page.drawRectangle({
      x,
      y,
      width: w,
      height: h,
      color,
    });
  };

  const drawTableRow = (label: string, value: string, y: number, isHighlight = false) => {
    if (isHighlight) {
      drawRect(50, y - 5, 495, 20, colors.highlight);
    }
    drawLine(50, y - 5, 545, y - 5);
    drawText(label, 60, y);
    drawText(value, 530, y, { align: 'right' });
  };

  // ===================
  // ヘッダー
  // ===================
  const titles: Record<typeof formType, string> = {
    'tax_return_b': 'Kakutei Shinkokusho B (Tax Return Form B)',
    'blue_return': 'Aoiro Shinkoku Kessansho (Blue Return Statement)',
    'income_statement': 'Shushi Uchiwake-sho (Income Statement)',
    'corporate_tax': 'Houjinzei Shinkokusho (Corporate Tax Return)',
    'financial_statement': 'Kessan Houkokusho (Financial Statement)',
  };

  // タイトル背景
  drawRect(0, height - 60, width, 60, headerColor);
  drawText(titles[formType], 50, height - 40, { size: 14, font: boldFont, color: rgb(1, 1, 1) });

  // 年度・日付情報
  let y = height - 85;

  if (formType === 'corporate_tax' || formType === 'financial_statement') {
    if (data.companyName) {
      drawText(`Company: ${safeText(data.companyName)}`, 50, y, { size: 11, font: boldFont });
    }
    y -= 20;
    drawText(`Fiscal Year: ${data.fiscalYear}`, 50, y, { size: 10 });
    if (data.representativeName) {
      drawText(`Representative: ${safeText(data.representativeName)}`, 300, y, { size: 10 });
    }
  } else {
    drawText(`Fiscal Year: ${data.fiscalYear} (Reiwa ${data.fiscalYear - 2018})`, 50, y, { size: 11 });
  }
  drawText(`Generated: ${new Date().toLocaleDateString('ja-JP')}`, 400, y, { size: 9, color: colors.muted });

  y -= 30;
  drawLine(50, y, 545, y, 1);
  y -= 25;

  // ===================
  // 法人税申告書
  // ===================
  if (formType === 'corporate_tax') {
    // 会社情報
    drawText('SECTION 1: Houjin Joho (Corporate Information)', 50, y, { size: 12, font: boldFont, color: headerColor });
    y -= 25;

    if (data.companyName) drawTableRow('Company Name (Kaisha Mei)', safeText(data.companyName), y);
    y -= 20;
    if (data.corporateNumber) drawTableRow('Corporate Number (Houjin Bangou)', safeText(data.corporateNumber), y);
    y -= 20;
    if (data.capital) drawTableRow('Capital (Shihonkin)', formatNumber(data.capital) + ' JPY', y);
    y -= 20;
    if (data.address) drawTableRow('Address (Juusho)', safeText(data.address), y);
    y -= 30;

    // 損益
    drawText('SECTION 2: Son\'eki Keisan (Profit & Loss)', 50, y, { size: 12, font: boldFont, color: headerColor });
    y -= 25;

    drawTableRow('Revenue (Uriage)', formatNumber(data.revenue) + ' JPY', y, true);
    y -= 20;
    drawTableRow('Expenses (Keihi)', formatNumber(data.expenses) + ' JPY', y);
    y -= 20;
    drawTableRow('Net Income (Junrieki)', formatNumber(data.netIncome) + ' JPY', y, true);
    y -= 35;

    // 税額計算
    drawText('SECTION 3: Zeigaku Keisan (Tax Calculation)', 50, y, { size: 12, font: boldFont, color: headerColor });
    y -= 25;

    const taxableIncome = data.corporateTax?.taxableIncome || data.taxableIncome;
    drawTableRow('Taxable Income (Kazei Shotoku)', formatNumber(taxableIncome) + ' JPY', y);
    y -= 20;

    // 法人税率（中小企業: 15%/23.2%）
    const corporateTaxRate = taxableIncome <= 8000000 ? 0.15 : 0.232;
    const corporateTaxAmount = data.corporateTax?.corporateTaxAmount || Math.floor(taxableIncome * corporateTaxRate);
    drawTableRow('Corporate Tax Rate', `${(corporateTaxRate * 100).toFixed(1)}%`, y);
    y -= 20;

    drawTableRow('Corporate Tax (Houjinzei)', formatNumber(corporateTaxAmount) + ' JPY', y);
    y -= 20;

    // 地方法人税 (10.3%)
    const localCorporateTax = data.corporateTax?.localCorporateTax || Math.floor(corporateTaxAmount * 0.103);
    drawTableRow('Local Corporate Tax (Chihou Houjinzei)', formatNumber(localCorporateTax) + ' JPY', y);
    y -= 20;

    // 事業税 (概算 7%)
    const businessTax = data.corporateTax?.businessTax || Math.floor(taxableIncome * 0.07);
    drawTableRow('Business Tax (Jigyouzei)', formatNumber(businessTax) + ' JPY', y);
    y -= 25;

    // 合計
    const totalTax = data.corporateTax?.totalTax || (corporateTaxAmount + localCorporateTax + businessTax);
    drawRect(50, y - 8, 495, 30, rgb(1, 0.95, 0.95));
    drawLine(50, y - 8, 545, y - 8, 1);
    drawLine(50, y + 22, 545, y + 22, 1);
    drawText('Total Tax (Zeigaku Goukei) - ESTIMATED', 60, y + 5, { font: boldFont });
    drawText(formatNumber(totalTax) + ' JPY', 530, y + 5, { align: 'right', font: boldFont, color: colors.red });

    // ===================
    // 決算報告書
    // ===================
  } else if (formType === 'financial_statement') {
    // 損益計算書（P/L）
    drawText('SECTION 1: Son\'eki Keisansho (P/L Statement)', 50, y, { size: 12, font: boldFont, color: headerColor });
    y -= 25;

    drawRect(50, y - 5, 495, 18, rgb(0.9, 0.9, 0.9));
    drawLine(50, y - 5, 545, y - 5);
    drawLine(50, y + 13, 545, y + 13);
    drawText('Item', 60, y, { font: boldFont, size: 9 });
    drawText('Amount', 530, y, { align: 'right', font: boldFont, size: 9 });
    y -= 22;

    drawTableRow('Sales Revenue (Uriage Takadaka)', formatNumber(data.revenue) + ' JPY', y, true);
    y -= 20;

    // 経費内訳
    data.expensesByCategory.forEach((exp, index) => {
      const account = exp.category || 'Other';
      const isAlt = index % 2 === 0;
      if (isAlt) {
        drawRect(50, y - 5, 495, 18, rgb(0.98, 0.98, 0.98));
      }
      drawLine(50, y - 5, 545, y - 5);
      drawText(account, 70, y, { size: 9 });
      drawText(formatNumber(exp.amount) + ' JPY', 530, y, { align: 'right', size: 9 });
      y -= 18;
    });

    y -= 5;
    drawTableRow('Total Expenses (Keihi Goukei)', formatNumber(data.expenses) + ' JPY', y);
    y -= 25;

    // 営業利益
    drawRect(50, y - 8, 495, 26, rgb(0.95, 1, 0.95));
    drawLine(50, y - 8, 545, y - 8, 1);
    drawLine(50, y + 18, 545, y + 18, 1);
    drawText('Operating Income (Eigyo Rieki)', 60, y + 2, { font: boldFont });
    drawText(formatNumber(data.netIncome) + ' JPY', 530, y + 2, { align: 'right', font: boldFont, color: data.netIncome >= 0 ? colors.green : colors.red });
    y -= 45;

    // 簡易貸借対照表
    drawText('SECTION 2: Taisyaku Taishouhyo (Balance Sheet Summary)', 50, y, { size: 12, font: boldFont, color: headerColor });
    y -= 25;

    drawTableRow('Assets (Shisan) - Estimated', formatNumber(data.revenue * 0.4) + ' JPY', y);
    y -= 20;
    drawTableRow('Liabilities (Fusai) - Estimated', formatNumber(data.expenses * 0.3) + ' JPY', y);
    y -= 20;
    drawTableRow('Equity (Junshisan) - Estimated', formatNumber((data.revenue * 0.4) - (data.expenses * 0.3)) + ' JPY', y, true);

    // ===================
    // 確定申告書B（個人）
    // ===================
  } else if (formType === 'tax_return_b') {
    // セクション1: 収入金額等
    drawText('SECTION 1: Shuunyu Kingaku (Income)', 50, y, { size: 12, font: boldFont, color: colors.primary });
    y -= 25;

    drawTableRow('A. Jigyo (Business) - Eigyo (Sales/Services)', formatNumber(data.revenue) + ' JPY', y, true);
    y -= 25;

    // セクション2: 所得金額等
    y -= 15;
    drawText('SECTION 2: Shotoku Kingaku (Net Income)', 50, y, { size: 12, font: boldFont, color: colors.primary });
    y -= 25;

    drawTableRow('A. Jigyo Shotoku (Business Income)', formatNumber(data.netIncome) + ' JPY', y);
    y -= 20;
    drawTableRow('Total Income', formatNumber(data.netIncome) + ' JPY', y, true);
    y -= 30;

    // セクション3: 所得控除
    y -= 15;
    drawText('SECTION 3: Shotoku Koujo (Deductions)', 50, y, { size: 12, font: boldFont, color: colors.primary });
    y -= 25;

    if (data.deductions.basic) {
      drawTableRow('Kiso Koujo (Basic Deduction)', formatNumber(data.deductions.basic) + ' JPY', y);
      y -= 20;
    }

    if (data.deductions.blueReturn && data.deductions.blueReturn > 0) {
      drawTableRow('Aoiro Shinkoku Tokubetsu Koujo (Blue Return Special)', formatNumber(data.deductions.blueReturn) + ' JPY', y);
      y -= 20;
    }

    if (data.deductions.socialInsurance) {
      drawTableRow('Shakai Hoken (Social Insurance)', formatNumber(data.deductions.socialInsurance) + ' JPY', y);
      y -= 20;
    }

    if (data.deductions.lifeInsurance) {
      drawTableRow('Seimei Hoken (Life Insurance)', formatNumber(data.deductions.lifeInsurance) + ' JPY', y);
      y -= 20;
    }

    const totalDeductions = Object.values(data.deductions).reduce((sum: number, val) => sum + (val || 0), 0);
    drawTableRow('Total Deductions', formatNumber(totalDeductions) + ' JPY', y, true);
    y -= 35;

    // セクション4: 税額計算
    y -= 15;
    drawText('SECTION 4: Zeigaku Keisan (Tax Calculation)', 50, y, { size: 12, font: boldFont, color: colors.primary });
    y -= 25;

    drawTableRow('Kazei Shotoku (Taxable Income)', formatNumber(data.taxableIncome) + ' JPY', y);
    y -= 25;

    // ハイライト: 所得税額
    drawRect(50, y - 8, 495, 30, rgb(1, 0.95, 0.95));
    drawLine(50, y - 8, 545, y - 8, 1);
    drawLine(50, y + 22, 545, y + 22, 1);
    drawText('Shotokuzei (Income Tax) - ESTIMATED', 60, y + 5, { font: boldFont });
    drawText(formatNumber(data.estimatedTax) + ' JPY', 530, y + 5, { align: 'right', font: boldFont, color: colors.red });

    // ===================
    // 青色申告決算書
    // ===================
  } else {
    // セクション1: 売上
    drawText('SECTION 1: Uriage (Revenue)', 50, y, { size: 12, font: boldFont, color: colors.primary });
    y -= 25;

    drawTableRow('A. Uriage (Sales Revenue)', formatNumber(data.revenue) + ' JPY', y, true);
    y -= 30;

    // セクション2: 経費
    y -= 15;
    drawText('SECTION 2: Keihi (Expenses)', 50, y, { size: 12, font: boldFont, color: colors.primary });
    y -= 25;

    // 経費内訳テーブルヘッダー
    drawRect(50, y - 5, 495, 18, rgb(0.9, 0.9, 0.9));
    drawLine(50, y - 5, 545, y - 5);
    drawLine(50, y + 13, 545, y + 13);
    drawText('Category', 60, y, { font: boldFont, size: 9 });
    drawText('Amount', 530, y, { align: 'right', font: boldFont, size: 9 });
    y -= 22;

    // 経費内訳
    data.expensesByCategory.forEach((exp, index) => {
      const account = exp.category || 'Other';
      const isAlt = index % 2 === 0;
      if (isAlt) {
        drawRect(50, y - 5, 495, 18, rgb(0.98, 0.98, 0.98));
      }
      drawLine(50, y - 5, 545, y - 5);
      drawText(account, 60, y, { size: 9 });
      drawText(formatNumber(exp.amount) + ' JPY', 530, y, { align: 'right', size: 9 });
      y -= 18;
    });

    // 経費合計
    y -= 5;
    drawTableRow('Total Expenses', formatNumber(data.expenses) + ' JPY', y, true);
    y -= 35;

    // セクション3: 所得計算
    y -= 15;
    drawText('SECTION 3: Shotoku Keisan (Income Calculation)', 50, y, { size: 12, font: boldFont, color: colors.primary });
    y -= 25;

    drawTableRow('Uriage - Keihi (Gross Profit)', formatNumber(data.netIncome) + ' JPY', y);
    y -= 20;

    if (data.isBlueReturn && data.deductions.blueReturn) {
      drawTableRow('Aoiro Tokubetsu Koujo (Blue Return Deduction)', '-' + formatNumber(data.deductions.blueReturn) + ' JPY', y);
      y -= 25;

      const finalIncome = Math.max(0, data.netIncome - data.deductions.blueReturn);

      // ハイライト: 最終所得
      drawRect(50, y - 8, 495, 30, rgb(0.95, 1, 0.95));
      drawLine(50, y - 8, 545, y - 8, 1);
      drawLine(50, y + 22, 545, y + 22, 1);
      drawText('Final Business Income (Shotoku Kingaku)', 60, y + 5, { font: boldFont });
      drawText(formatNumber(finalIncome) + ' JPY', 530, y + 5, { align: 'right', font: boldFont, color: colors.green });
    }
  }

  // ===================
  // フッター
  // ===================
  drawLine(50, 60, 545, 60);

  if (formType === 'corporate_tax' || formType === 'financial_statement') {
    drawText('* This document is generated by Ainance for reference purposes only.', 50, 45, { size: 7, color: colors.muted });
    drawText('* For official corporate tax filing, please consult a certified tax accountant or use e-Tax.', 50, 35, { size: 7, color: colors.muted });
    drawText('* Visit: https://www.e-tax.nta.go.jp/', 50, 25, { size: 7, color: headerColor });
  } else {
    drawText('* This document is generated by Ainance for reference purposes only.', 50, 45, { size: 7, color: colors.muted });
    drawText('* For official tax filing, please use the National Tax Agency e-Tax system.', 50, 35, { size: 7, color: colors.muted });
    drawText('* Visit: https://www.keisan.nta.go.jp/', 50, 25, { size: 7, color: colors.primary });
  }

  return pdfDoc.save();
}

/**
 * PDFをダウンロード
 */
export function downloadPDF(pdfBytes: Uint8Array, filename: string): void {
  // `application/pdf` の代わりに `application/octet-stream` を使用することで、
  // ブラウザのPDFビューアプラグインや外部PDFツールが `blob:` URLを傍受して
  // 中身が見れないエラーを起こすのを防ぎ、強制的にダウンロードさせます。
  const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // URLはすぐに破棄せず、ユーザーが「名前を付けて保存」ダイアログを操作する時間を確保する
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

/**
 * PDFをプレビュー（新しいタブで開く）
 */
export function previewPDF(pdfBytes: Uint8Array): void {
  const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}
