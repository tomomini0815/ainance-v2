/**
 * 確定申告書PDF自動転記サービス
 * 国税庁のテンプレートPDFにAinanceのデータを自動で入力
 */

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// 確定申告書第一表・第二表の入力座標マッピング（令和5年分）
// 2026-02-06 キャリブレーション済み座標（座標キャリブレーターで調整）
// 座標は左下原点でpt単位（1pt = 約0.35mm）
const TAX_RETURN_B_FIELDS: { [key: string]: { x: number; y: number; width: number } } = {
  // 第一表 - 収入金額等
  '事業収入_ア': { x: 286.7, y: 672.6, width: 80 },
  '給与収入_カ': { x: 286.7, y: 605.3, width: 80 },
  '雑収入_ク': { x: 286.7, y: 553.9, width: 80 },
  '収入合計_12': { x: 286.7, y: 292.6, width: 80 },
  // 第一表 - 所得金額等
  '事業所得_1': { x: 286, y: 483.9, width: 80 },
  '給与所得_6': { x: 286.7, y: 396.6, width: 80 },
  '所得合計_12': { x: 286, y: 292.1, width: 80 },
  // 第一表 - 所得控除
  '基礎控除_48': { x: 551.3, y: 570.6, width: 80 },
  '社会保険料控除_13': { x: 286.7, y: 274.8, width: 80 },
  '控除合計_25': { x: 287.3, y: 120.1, width: 80 },
  // 第一表 - 税額計算
  '課税所得_26': { x: 287.3, y: 102.8, width: 80 },
  '所得税額_27': { x: 286.7, y: 84.7, width: 80 },
  '申告納税額_51': { x: 552, y: 553.5, width: 80 },
  // 第一表 - 申告者情報
  '氏名': { x: 364.7, y: 738.8, width: 150 },
  '住所': { x: 89.3, y: 758.8, width: 200 },
  '税務署名': { x: 48, y: 818.1, width: 100 },
  '電話番号': { x: 350, y: 755, width: 100 },
  // 旧フィールド名との互換性
  '事業_営業等': { x: 286.7, y: 672.6, width: 80 },
  '給与': { x: 286.7, y: 605.3, width: 80 },
  '事業所得_営業等': { x: 286, y: 483.9, width: 80 },
  '総所得金額': { x: 286, y: 292.1, width: 80 },
  '社会保険料控除': { x: 286.7, y: 274.8, width: 80 },
  '小規模企業共済等掛金控除': { x: 286.7, y: 260, width: 80 },
  '生命保険料控除': { x: 286.7, y: 245, width: 80 },
  '地震保険料控除': { x: 286.7, y: 230, width: 80 },
  '配偶者控除': { x: 286.7, y: 200, width: 80 },
  '扶養控除': { x: 286.7, y: 185, width: 80 },
  '基礎控除': { x: 551.3, y: 570.6, width: 80 },
  '所得控除合計': { x: 287.3, y: 120.1, width: 80 },
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
 * 確定申告書BにAinanceのデータを自動転記
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

  // ヘルパー関数: 数値をフォーマット
  const formatNumber = (num: number) => num.toLocaleString('ja-JP');

  // ヘルパー関数: テキストを描画
  const drawText = (text: string, x: number, y: number, size = 9) => {
    firstPage.drawText(text, {
      x,
      y,
      size,
      font,
      color: rgb(0, 0, 0),
    });
  };

  // 収入金額 - 事業（営業等）
  drawText(formatNumber(data.revenue), TAX_RETURN_B_FIELDS.事業_営業等.x, TAX_RETURN_B_FIELDS.事業_営業等.y);

  // 所得金額 - 事業所得（営業等）
  drawText(formatNumber(data.netIncome), TAX_RETURN_B_FIELDS.事業所得_営業等.x, TAX_RETURN_B_FIELDS.事業所得_営業等.y);

  // 総所得金額
  drawText(formatNumber(data.netIncome), TAX_RETURN_B_FIELDS.総所得金額.x, TAX_RETURN_B_FIELDS.総所得金額.y);

  // 所得控除
  if (data.deductions.socialInsurance) {
    drawText(formatNumber(data.deductions.socialInsurance), TAX_RETURN_B_FIELDS.社会保険料控除.x, TAX_RETURN_B_FIELDS.社会保険料控除.y);
  }
  if (data.deductions.smallBusinessMutual) {
    drawText(formatNumber(data.deductions.smallBusinessMutual), TAX_RETURN_B_FIELDS.小規模企業共済等掛金控除.x, TAX_RETURN_B_FIELDS.小規模企業共済等掛金控除.y);
  }
  if (data.deductions.lifeInsurance) {
    drawText(formatNumber(data.deductions.lifeInsurance), TAX_RETURN_B_FIELDS.生命保険料控除.x, TAX_RETURN_B_FIELDS.生命保険料控除.y);
  }
  if (data.deductions.earthquakeInsurance) {
    drawText(formatNumber(data.deductions.earthquakeInsurance), TAX_RETURN_B_FIELDS.地震保険料控除.x, TAX_RETURN_B_FIELDS.地震保険料控除.y);
  }
  if (data.deductions.spouse) {
    drawText(formatNumber(data.deductions.spouse), TAX_RETURN_B_FIELDS.配偶者控除.x, TAX_RETURN_B_FIELDS.配偶者控除.y);
  }
  if (data.deductions.dependents) {
    drawText(formatNumber(data.deductions.dependents), TAX_RETURN_B_FIELDS.扶養控除.x, TAX_RETURN_B_FIELDS.扶養控除.y);
  }
  if (data.deductions.basic) {
    drawText(formatNumber(data.deductions.basic), TAX_RETURN_B_FIELDS.基礎控除.x, TAX_RETURN_B_FIELDS.基礎控除.y);
  }

  // 所得控除合計
  const totalDeductions = Object.values(data.deductions).reduce((sum: number, val) => sum + (val || 0), 0);
  drawText(formatNumber(totalDeductions), TAX_RETURN_B_FIELDS.所得控除合計.x, TAX_RETURN_B_FIELDS.所得控除合計.y);

  // 申告者情報
  if (data.address) {
    drawText(data.address, TAX_RETURN_B_FIELDS.住所.x, TAX_RETURN_B_FIELDS.住所.y, 8);
  }
  if (data.name) {
    drawText(data.name, TAX_RETURN_B_FIELDS.氏名.x, TAX_RETURN_B_FIELDS.氏名.y);
  }
  if (data.phone) {
    drawText(data.phone, TAX_RETURN_B_FIELDS.電話番号.x, TAX_RETURN_B_FIELDS.電話番号.y);
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
