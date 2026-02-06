/**
 * 確定申告書PDF自動転記サービス
 * 国税庁のテンプレートPDFにAinanceのデータを自動で入力
 */

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// 確定申告書第一表・第二表の入力座標マッピング（令和7年分）
// 2026-02-06 キャリブレーション済み座標（座標キャリブレーターで調整）
// 座標は左下原点でpt単位、anchorX/Yは数値の最後尾（右端）の箱中央を指す
// boxSpacing: 16pt（キャリブレーション済み）
// fontSize: 10pt（キャリブレーション済み）

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
const CALIBRATED_BOX_SPACING = 16;
const CALIBRATED_FONT_SIZE = 10;
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
  '控除_18_勤労学生障害者': { anchorX: 227.3, anchorY: 207, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '控除_19_配偶者': { anchorX: 227.3, anchorY: 189.6, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '控除_20_配偶者特別': { anchorX: 228, anchorY: 189.6, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '控除_21_扶養': { anchorX: 228.7, anchorY: 171.6, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '控除_22_基礎控除': { anchorX: 229.3, anchorY: 171.6, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '控除_23_雑損': { anchorX: 227.3, anchorY: 155.6, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '控除_24_医療費': { anchorX: 228, anchorY: 137.6, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '控除_25_寄附金': { anchorX: 228, anchorY: 119.6, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '控除_26_合計': { anchorX: 286, anchorY: 101, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },

  // ============================================
  // 左側下部 - 課税所得・税額
  // ============================================
  '税額_27_課税所得': { anchorX: 286.7, anchorY: 84.3, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '税額_28_上の税額': { anchorX: 287.3, anchorY: 66.3, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '税額_29_配当控除': { anchorX: 286, anchorY: 50.3, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },

  // ============================================
  // 右側 - 税金の計算
  // ============================================
  '税額_38_住宅控除': { anchorX: 550.7, anchorY: 569, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '税額_43_災害減免額': { anchorX: 550.7, anchorY: 537.5, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '税額_44_再差引所得税': { anchorX: 552, anchorY: 520.8, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '税額_45_復興特別所得税': { anchorX: 551.3, anchorY: 500.8, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '税額_46_所得税復興税合計': { anchorX: 552, anchorY: 484.8, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '税額_47_外国税額控除等': { anchorX: 552, anchorY: 466.1, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '税額_48_源泉徴収税額': { anchorX: 551.3, anchorY: 466.8, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '税額_49_申告納税額': { anchorX: 551.3, anchorY: 450.1, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '税額_50_予定納税額': { anchorX: 553.3, anchorY: 432.8, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '税額_51_納める税金': { anchorX: 552, anchorY: 414.3, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '税額_52_還付される税金': { anchorX: 522, anchorY: 396.1, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },

  // ============================================
  // 右側 - その他
  // ============================================
  '他_56_公的年金以外': { anchorX: 551.3, anchorY: 327.6, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '他_57_配偶者合計': { anchorX: 551.3, anchorY: 311, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '他_58_専従者給与': { anchorX: 551.3, anchorY: 293.6, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
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

// ===== 確定申告書第二表 - 数値フィールド（キャリブレーション済み） =====
const TAX_RETURN_B_PAGE2_FIELDS: { [key: string]: DigitFieldConfig } = {
  '源泉_給与': { anchorX: 236.7, anchorY: 581.3, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '源泉_年金': { anchorX: 237.3, anchorY: 555.3, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '社保_国民健康': { anchorX: 486, anchorY: 769.3, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '社保_国民年金': { anchorX: 486, anchorY: 747.9, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '生命保険_一般': { anchorX: 486, anchorY: 667.9, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
  '生命保険_個人年金': { anchorX: 484.7, anchorY: 708.6, boxSpacing: CALIBRATED_BOX_SPACING, fontSize: CALIBRATED_FONT_SIZE, maxDigits: DEFAULT_MAX_DIGITS },
};

// ===== 確定申告書第二表 - テキストフィールド =====
const TAX_RETURN_B_PAGE2_TEXT: { [key: string]: TextFieldConfig } = {
  '氏名_2表': { x: 100, y: 682.1, fontSize: 9 },
};

// 青色申告決算書の入力座標マッピング（令和5年分）
const BLUE_RETURN_FIELDS = {
  // 損益計算書
  売上金額: { x: 430, y: 680, width: 100 },
  売上原価: { x: 430, y: 640, width: 100 },
  差引金額: { x: 430, y: 600, width: 100 },

  // 経費
  租税公課: { x: 430, y: 540, width: 80 },
  荷造運賃: { x: 430, y: 520, width: 80 },
  水道光熱費: { x: 430, y: 500, width: 80 },
  旅費交通費: { x: 430, y: 480, width: 80 },
  通信費: { x: 430, y: 460, width: 80 },
  広告宣伝費: { x: 430, y: 440, width: 80 },
  接待交際費: { x: 430, y: 420, width: 80 },
  損害保険料: { x: 430, y: 400, width: 80 },
  修繕費: { x: 430, y: 380, width: 80 },
  消耗品費: { x: 430, y: 360, width: 80 },
  減価償却費: { x: 430, y: 340, width: 80 },
  福利厚生費: { x: 430, y: 320, width: 80 },
  給料賃金: { x: 430, y: 300, width: 80 },
  外注工賃: { x: 430, y: 280, width: 80 },
  地代家賃: { x: 430, y: 260, width: 80 },
  支払利息: { x: 430, y: 240, width: 80 },
  雑費: { x: 430, y: 220, width: 80 },
  経費計: { x: 430, y: 180, width: 100 },

  // 所得金額
  青色申告特別控除前の所得金額: { x: 430, y: 140, width: 100 },
  青色申告特別控除額: { x: 430, y: 120, width: 100 },
  所得金額: { x: 430, y: 80, width: 100 },

  // 申告者情報
  屋号: { x: 100, y: 750, width: 150 },
  住所: { x: 100, y: 720, width: 200 },
  氏名: { x: 100, y: 690, width: 150 },
};

// Ainanceのカテゴリを確定申告の勘定科目にマッピング（英語版：PDF用）
const CATEGORY_TO_ACCOUNT_MAP: { [key: string]: string } = {
  '交通費': 'Travel & Transportation',
  '旅費交通費': 'Travel & Transportation',
  '通信費': 'Communication',
  '水道光熱費': 'Utilities',
  '消耗品費': 'Supplies',
  '接待交際費': 'Entertainment',
  '広告宣伝費': 'Advertising',
  '地代家賃': 'Rent',
  '外注費': 'Outsourcing',
  '給与': 'Salaries',
  '雑費': 'Miscellaneous',
  '減価償却費': 'Depreciation',
  '修繕費': 'Repairs',
  '保険料': 'Insurance',
  '福利厚生費': 'Benefits',
  '支払利息': 'Interest',
  '租税公課': 'Taxes & Dues',
  '荷造運賃': 'Shipping',
  'その他': 'Other',
  '未分類': 'Uncategorized',
};

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
  isBlueReturn: boolean;
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
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];

  // フォントを埋め込み
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // DigitBox方式: 数値を右端から左へ1桁ずつ配置
  const fillDigitBox = (value: number, config: DigitFieldConfig) => {
    if (value === 0 || value === undefined || value === null) return;

    const absValue = Math.abs(Math.floor(value));
    const digits = String(absValue).split('');
    const reversedDigits = [...digits].reverse();

    reversedDigits.forEach((digit, index) => {
      // 右端から左へ配置（indexが増えるごとにX座標が減る）
      const textWidth = font.widthOfTextAtSize(digit, config.fontSize);
      const x = config.anchorX - (index * config.boxSpacing) - (textWidth / 2);
      const y = config.anchorY;

      firstPage.drawText(digit, {
        x,
        y,
        size: config.fontSize,
        font,
        color: rgb(0, 0, 0),
      });
    });
  };

  // テキスト描画
  const drawText = (text: string, config: TextFieldConfig) => {
    if (!text) return;
    firstPage.drawText(text, {
      x: config.x,
      y: config.y,
      size: config.fontSize,
      font,
      color: rgb(0, 0, 0),
    });
  };

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
  if (data.deductions.socialInsurance) {
    fillDigitBox(data.deductions.socialInsurance, TAX_RETURN_B_DIGIT_FIELDS['控除_13_社会保険料']);
  }
  if (data.deductions.smallBusinessMutual) {
    fillDigitBox(data.deductions.smallBusinessMutual, TAX_RETURN_B_DIGIT_FIELDS['控除_14_小規模企業共済']);
  }
  if (data.deductions.lifeInsurance) {
    fillDigitBox(data.deductions.lifeInsurance, TAX_RETURN_B_DIGIT_FIELDS['控除_15_生命保険料']);
  }
  if (data.deductions.earthquakeInsurance) {
    fillDigitBox(data.deductions.earthquakeInsurance, TAX_RETURN_B_DIGIT_FIELDS['控除_16_地震保険料']);
  }
  if (data.deductions.spouse) {
    fillDigitBox(data.deductions.spouse, TAX_RETURN_B_DIGIT_FIELDS['控除_19_配偶者']);
  }
  if (data.deductions.dependents) {
    fillDigitBox(data.deductions.dependents, TAX_RETURN_B_DIGIT_FIELDS['控除_21_扶養']);
  }
  if (data.deductions.basic) {
    fillDigitBox(data.deductions.basic, TAX_RETURN_B_DIGIT_FIELDS['控除_22_基礎控除']);
  }
  if (data.medicalExpenses) {
    fillDigitBox(data.medicalExpenses, TAX_RETURN_B_DIGIT_FIELDS['控除_24_医療費']);
  }

  // 所得控除合計
  const totalDeductions = Object.values(data.deductions).reduce((sum: number, val) => sum + (val || 0), 0);
  fillDigitBox(totalDeductions, TAX_RETURN_B_DIGIT_FIELDS['控除_26_合計']);

  // === 税金の計算 ===
  fillDigitBox(data.taxableIncome, TAX_RETURN_B_DIGIT_FIELDS['税額_27_課税所得']);
  fillDigitBox(data.estimatedTax, TAX_RETURN_B_DIGIT_FIELDS['税額_28_上の税額']);

  // 青色申告特別控除（青色申告の場合）
  if (data.isBlueReturn && data.blueReturnDeduction) {
    fillDigitBox(data.blueReturnDeduction, TAX_RETURN_B_DIGIT_FIELDS['他_59_青色申告特別控除']);
  }

  // === 申告者情報（テキスト） ===
  drawText(data.name || '', TAX_RETURN_B_TEXT_FIELDS['氏名']);
  drawText(data.address || '', TAX_RETURN_B_TEXT_FIELDS['住所']);
  if (data.tradeName) {
    drawText(data.tradeName, TAX_RETURN_B_TEXT_FIELDS['屋号']);
  }

  return pdfDoc.save();
}

/**
 * 青色申告決算書にAinanceのデータを自動転記
 */
export async function fillBlueReturnForm(
  templateBytes: ArrayBuffer,
  data: TaxFormData
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(templateBytes, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];

  // フォントを埋め込み
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // ヘルパー関数
  const formatNumber = (num: number) => num.toLocaleString('ja-JP');

  const drawText = (text: string, x: number, y: number, size = 9) => {
    firstPage.drawText(text, {
      x,
      y,
      size,
      font,
      color: rgb(0, 0, 0),
    });
  };

  // 売上金額
  drawText(formatNumber(data.revenue), BLUE_RETURN_FIELDS.売上金額.x, BLUE_RETURN_FIELDS.売上金額.y);

  // 経費内訳をマッピング
  const accountTotals: { [key: string]: number } = {};
  data.expensesByCategory.forEach(exp => {
    const account = CATEGORY_TO_ACCOUNT_MAP[exp.category] || '雑費';
    accountTotals[account] = (accountTotals[account] || 0) + exp.amount;
  });

  // 各経費項目を描画
  Object.entries(accountTotals).forEach(([account, amount]) => {
    const field = BLUE_RETURN_FIELDS[account as keyof typeof BLUE_RETURN_FIELDS];
    if (field) {
      drawText(formatNumber(amount), field.x, field.y);
    }
  });

  // 経費計
  drawText(formatNumber(data.expenses), BLUE_RETURN_FIELDS.経費計.x, BLUE_RETURN_FIELDS.経費計.y);

  // 差引金額（売上 - 経費）
  drawText(formatNumber(data.revenue - data.expenses), BLUE_RETURN_FIELDS.差引金額.x, BLUE_RETURN_FIELDS.差引金額.y);

  // 青色申告特別控除前の所得金額
  drawText(formatNumber(data.netIncome), BLUE_RETURN_FIELDS.青色申告特別控除前の所得金額.x, BLUE_RETURN_FIELDS.青色申告特別控除前の所得金額.y);

  // 青色申告特別控除額
  if (data.isBlueReturn && data.deductions.blueReturn) {
    drawText(formatNumber(data.deductions.blueReturn), BLUE_RETURN_FIELDS.青色申告特別控除額.x, BLUE_RETURN_FIELDS.青色申告特別控除額.y);
  }

  // 所得金額
  const finalIncome = data.netIncome - (data.deductions.blueReturn || 0);
  drawText(formatNumber(Math.max(0, finalIncome)), BLUE_RETURN_FIELDS.所得金額.x, BLUE_RETURN_FIELDS.所得金額.y);

  // 申告者情報
  if (data.tradeName) {
    drawText(data.tradeName, BLUE_RETURN_FIELDS.屋号.x, BLUE_RETURN_FIELDS.屋号.y);
  }
  if (data.address) {
    drawText(data.address, BLUE_RETURN_FIELDS.住所.x, BLUE_RETURN_FIELDS.住所.y, 8);
  }
  if (data.name) {
    drawText(data.name, BLUE_RETURN_FIELDS.氏名.x, BLUE_RETURN_FIELDS.氏名.y);
  }

  return pdfDoc.save();
}

/**
 * テンプレートを読み込んでデータを自動転記
 * テンプレート読み込みに失敗した場合は白紙から生成
 */
export async function generateFilledTaxForm(
  formType: 'tax_return_b' | 'blue_return' | 'corporate_tax' | 'financial_statement',
  data: TaxFormData
): Promise<{ pdfBytes: Uint8Array; filename: string }> {
  // 法人向けは常にフォールバック（自作PDF）を使用
  if (formType === 'corporate_tax' || formType === 'financial_statement') {
    const pdfBytes = await generateFallbackPDF(formType, data);
    const filename = formType === 'corporate_tax'
      ? `法人税申告書_${data.fiscalYear}年度_入力済み.pdf`
      : `決算報告書_${data.fiscalYear}年度_入力済み.pdf`;
    return { pdfBytes, filename };
  }

  const templatePath = formType === 'tax_return_b'
    ? '/templates/kakutei1&2.pdf'
    : '/templates/aoirokessansyo.pdf';

  let pdfBytes: Uint8Array;

  try {
    const response = await fetch(templatePath);
    if (!response.ok) {
      throw new Error(`テンプレートの読み込みに失敗: ${response.statusText}`);
    }

    const templateBytes = await response.arrayBuffer();

    pdfBytes = formType === 'tax_return_b'
      ? await fillTaxReturnB(templateBytes, data)
      : await fillBlueReturnForm(templateBytes, data);
  } catch (error) {
    console.warn('テンプレート読み込み失敗、白紙から生成します:', error);
    // フォールバック: 白紙からPDFを生成
    pdfBytes = await generateFallbackPDF(formType, data);
  }

  const filename = formType === 'tax_return_b'
    ? `確定申告書B_${data.fiscalYear}年度_入力済み.pdf`
    : `青色申告決算書_${data.fiscalYear}年度_入力済み.pdf`;

  return { pdfBytes, filename };
}

/**
 * 白紙からPDFを生成（フォールバック用）
 * 確定申告書のレイアウトを再現
 */
async function generateFallbackPDF(
  formType: 'tax_return_b' | 'blue_return' | 'corporate_tax' | 'financial_statement',
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
      const account = CATEGORY_TO_ACCOUNT_MAP[exp.category] || 'Other';
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
      const account = CATEGORY_TO_ACCOUNT_MAP[exp.category] || 'Other';
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
  const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * PDFをプレビュー（新しいタブで開く）
 */
export function previewPDF(pdfBytes: Uint8Array): void {
  const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}
