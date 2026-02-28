/**
 * 日本語対応PDF生成サービス
 * 日本語フォント（Noto Sans CJK JP）を埋め込んで日本語テキストを正しく表示
 */

import { PDFDocument, rgb, PDFFont, PDFPage } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { TaxReturnInputData } from '../types/taxReturnInput';
import { CorporateTaxInputData } from '../types/corporateTaxInput';
import { ApplicationDraft } from './subsidyMatchingService';
import { fillTaxReturnB, TaxFormData } from './pdfAutoFillService';

// 経費カテゴリのマッピング（日本語）
export const EXPENSE_CATEGORIES_JP: { [key: string]: string } = {
  '交通費': '旅費交通費',
  '旅費交通費': '旅費交通費',
  '通信費': '通信費',
  '水道光熱費': '水道光熱費',
  '消耗品費': '消耗品費',
  '接待交際費': '接待交際費',
  '広告宣伝費': '広告宣伝費',
  '地代家賃': '地代家賃',
  '外注費': '外注工賃',
  '給与': '給料賃金',
  '雑費': '雑費',
  '減価償却費': '減価償却費',
  '修繕費': '修繕費',
  '保険料': '損害保険料',
  '福利厚生費': '福利厚生費',
  '支払利息': '支払利息',
  '租税公課': '租税公課',
  '荷造運賃': '荷造運賃',
  'その他': '雑費',
  '未分類': '雑費',
  // 英語カテゴリも対応
  'Travel & Transportation': '旅費交通費',
  'Communication': '通信費',
  'Utilities': '水道光熱費',
  'Supplies': '消耗品費',
  'Entertainment': '接待交際費',
  'Advertising': '広告宣伝費',
  'Rent': '地代家賃',
  'Outsourcing': '外注工賃',
  'Salaries': '給料賃金',
  'Miscellaneous': '雑費',
  'Depreciation': '減価償却費',
  'Repairs': '修繕費',
  'Insurance': '損害保険料',
  'Benefits': '福利厚生費',
  'Interest': '支払利息',
  'Taxes & Dues': '租税公課',
  'Shipping': '荷造運賃',
  'Other': '雑費',
  'Uncategorized': '雑費',
};

export interface JpTaxFormData {
  // 基本情報
  companyName?: string;
  fiscalYearStart?: string;
  fiscalYearEnd?: string;
  representativeName?: string;
  address?: string;
  phone?: string;
  name?: string;
  birthDate?: { year: number; month: number; day: number };
  occupation?: string;
  corporateNumber?: string;
  capital?: number;
  businessType?: 'individual' | 'corporation';
  tradeName?: string;

  // 財務データ
  revenue: number;
  expenses: number;
  netIncome: number;
  expensesByCategory: { category: string; amount: number }[];

  // 貸借対照表（B/S）および損益計算書（P/L）詳細
  costOfSales?: number;
  grossProfit?: number;
  operatingExpenses?: number;
  operatingIncome?: number;
  nonOperatingIncome?: number;
  nonOperatingExpenses?: number;
  ordinaryIncome?: number;
  netIncomeBeforeTax?: number;
  
  cash?: number;
  accountsReceivable?: number;
  inventory?: number;
  fixedAssets?: number;
  totalAssets?: number;
  accountsPayable?: number;
  shortTermLoans?: number;
  longTermLoans?: number;
  totalLiabilities?: number;
  estimatedCapital?: number;
  retainedEarnings?: number;
  beginningRetainedEarnings?: number;
  beginningCapital?: number;
  beginningCash?: number;
  beginningReceivable?: number;
  beginningInventory?: number;
  beginningFixedAssets?: number;
  beginningPayable?: number;
  beginningShortTermLoans?: number;
  beginningLongTermLoans?: number;
  depreciation?: number;

  // 税額
  taxableIncome: number;
  estimatedTax: number;

  // 控除
  deductions?: {
    basic?: number;
    blueReturn?: number;
    socialInsurance?: number;
    lifeInsurance?: number;
  };

  // その他
  fiscalYear: number;
  isBlueReturn?: boolean;

  // 手動入力データ (拡張)
  manualData?: TaxReturnInputData;
}

// Certainty-First: 監査レポート用
export interface ValidationReport {
  timestamp: string;
  template: string;
  loadSuccess: boolean;
  hasAcroForm: boolean;
  passedDataValidation: boolean;
  mappings: {
    key: string;
    value: any;
    method: 'AcroForm' | 'Anchor' | 'FixedCoord' | 'DigitBox' | 'Absolute';
    fieldId?: string;
    coordinate?: { x: number; y: number };
    offset?: { x: number; y: number };
  }[];
  errors: string[];
}

// 日本語フォントをロード
async function loadJapaneseFont(pdfDoc: PDFDocument): Promise<{ regular: PDFFont; bold: PDFFont }> {
  pdfDoc.registerFontkit(fontkit);

  try {
    // 日本語フォントをロード
    const regularFontBytes = await fetch('/fonts/NotoSansCJKjp-Regular.otf').then(r => r.arrayBuffer());
    const boldFontBytes = await fetch('/fonts/NotoSansCJKjp-Bold.otf').then(r => r.arrayBuffer());

    const regular = await pdfDoc.embedFont(regularFontBytes);
    const bold = await pdfDoc.embedFont(boldFontBytes);

    return { regular, bold };
  } catch (error) {
    console.error('日本語フォントのロードに失敗:', error);
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`日本語フォントのロードに失敗しました (${message})。public/fonts/にフォントファイルを正しく配置してください。`);
  }
}

// 金額をカンマ区切りでフォーマット
function formatCurrency(num: number): string {
  if (num === 0) return '0';
  return num.toLocaleString('ja-JP');
}

// 和暦を取得
function getJapaneseYear(year: number): string {
  const reiwaYear = year - 2018;
  return `令和${reiwaYear}年`;
}

/**
 * 法人税申告書PDFを生成（日本語）
 */
export async function generateCorporateTaxPDF(data: JpTaxFormData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { regular, bold } = await loadJapaneseFont(pdfDoc);
  const { width, height } = page.getSize();

  // 紺色をメインカラーに
  const colors = {
    primary: rgb(0.1, 0.2, 0.4),    // 紺色
    secondary: rgb(0.15, 0.3, 0.5), // 濃い青
    text: rgb(0.1, 0.1, 0.1),
    muted: rgb(0.45, 0.45, 0.45),
    line: rgb(0.6, 0.6, 0.6),
    headerBg: rgb(0.92, 0.94, 0.98),
    highlight: rgb(0.94, 0.96, 1),
    green: rgb(0.15, 0.55, 0.25),
    red: rgb(0.75, 0.2, 0.2),
    lightGreen: rgb(0.88, 0.96, 0.88),
    lightRed: rgb(1, 0.93, 0.93),
  };

  // 行の高さ設定
  const ROW_HEIGHT = 18;
  const SECTION_TITLE_HEIGHT = 24;

  const draw = {
    text: (text: string, x: number, y: number, options: { size?: number; font?: PDFFont; color?: typeof colors.text } = {}) => {
      page.drawText(text, { x, y, size: options.size || 10, font: options.font || regular, color: options.color || colors.text });
    },
    line: (x1: number, y1: number, x2: number, y2: number, thickness = 0.5) => {
      page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, thickness, color: colors.line });
    },
    rect: (x: number, y: number, w: number, h: number, color: typeof colors.highlight) => {
      page.drawRectangle({ x, y, width: w, height: h, color });
    },
  };

  // ===== ヘッダー（紺色） =====
  draw.rect(0, height - 60, width, 60, colors.primary);
  draw.text('法 人 税 申 告 書', 190, height - 38, { size: 24, font: bold, color: rgb(1, 1, 1) });
  draw.text('（参考資料）', 390, height - 38, { size: 12, color: rgb(0.8, 0.85, 0.9) });

  let y = height - 78;
  draw.text(`${data.companyName || '会社名'}`, 50, y, { size: 13, font: bold });
  draw.text(`${data.fiscalYear}年度（${getJapaneseYear(data.fiscalYear)}度）`, 300, y, { size: 11 });
  draw.text(`作成日: ${new Date().toLocaleDateString('ja-JP')}`, 450, y, { size: 9, color: colors.muted });
  y -= 20;
  draw.line(40, y, 555, y, 1.5);
  y -= 15;

  // ===== セクション1: 法人情報 =====
  draw.rect(40, y - SECTION_TITLE_HEIGHT, 515, SECTION_TITLE_HEIGHT, colors.secondary);
  draw.text('第1部　法人情報', 50, y - 17, { size: 12, font: bold, color: rgb(1, 1, 1) });
  y -= SECTION_TITLE_HEIGHT + 8;

  const infoRows = [
    ['会社名（商号）', data.companyName || '―'],
    ['代表者氏名', data.representativeName || '―'],
    ['法人番号', data.corporateNumber || '―'],
    ['本店所在地', data.address || '―'],
    ['資本金', data.capital ? `${formatCurrency(data.capital)}円` : '―'],
  ];

  infoRows.forEach(([label, value], idx) => {
    const isAlt = idx % 2 === 0;
    if (isAlt) {
      draw.rect(40, y - ROW_HEIGHT, 515, ROW_HEIGHT, colors.highlight);
    }
    draw.line(40, y - ROW_HEIGHT, 555, y - ROW_HEIGHT);
    draw.text(label, 55, y - ROW_HEIGHT + 5, { size: 10 });
    draw.text(value, 200, y - ROW_HEIGHT + 5, { size: 10 });
    y -= ROW_HEIGHT;
  });
  y -= 15;

  // ===== セクション2: 損益の計算 =====
  draw.rect(40, y - SECTION_TITLE_HEIGHT, 515, SECTION_TITLE_HEIGHT, colors.secondary);
  draw.text('第2部　損益の計算', 50, y - 17, { size: 12, font: bold, color: rgb(1, 1, 1) });
  y -= SECTION_TITLE_HEIGHT + 8;

  // 売上高
  draw.rect(40, y - ROW_HEIGHT - 2, 515, ROW_HEIGHT + 2, colors.highlight);
  draw.line(40, y - ROW_HEIGHT - 2, 555, y - ROW_HEIGHT - 2);
  draw.text('売上高', 55, y - ROW_HEIGHT + 3, { size: 11 });
  draw.text(`${formatCurrency(data.revenue)}円`, 450, y - ROW_HEIGHT + 3, { size: 11 });
  y -= ROW_HEIGHT + 4;

  // 経費
  draw.line(40, y - ROW_HEIGHT, 555, y - ROW_HEIGHT);
  draw.text('売上原価・経費合計', 55, y - ROW_HEIGHT + 5, { size: 10 });
  draw.text(`${formatCurrency(data.expenses)}円`, 450, y - ROW_HEIGHT + 5, { size: 10 });
  y -= ROW_HEIGHT + 2;

  // 当期純利益
  draw.rect(40, y - ROW_HEIGHT - 4, 515, ROW_HEIGHT + 4, colors.lightGreen);
  draw.line(40, y - ROW_HEIGHT - 4, 555, y - ROW_HEIGHT - 4, 1);
  draw.line(40, y, 555, y, 1);
  draw.text('当期純利益', 55, y - ROW_HEIGHT + 1, { size: 12, font: bold });
  draw.text(`${formatCurrency(data.netIncome)}円`, 440, y - ROW_HEIGHT + 1, {
    size: 12,
    font: bold,
    color: data.netIncome >= 0 ? colors.green : colors.red
  });
  y -= ROW_HEIGHT + 20;

  // ===== セクション3: 税額の計算 =====
  draw.rect(40, y - SECTION_TITLE_HEIGHT, 515, SECTION_TITLE_HEIGHT, colors.secondary);
  draw.text('第3部　税額の計算', 50, y - 17, { size: 12, font: bold, color: rgb(1, 1, 1) });
  y -= SECTION_TITLE_HEIGHT + 8;

  const taxableIncome = data.taxableIncome;
  const corporateTaxRate = taxableIncome <= 8000000 ? 0.15 : 0.232;
  const corporateTax = Math.floor(taxableIncome * corporateTaxRate);
  const localCorporateTax = Math.floor(corporateTax * 0.103);
  const businessTax = Math.floor(taxableIncome * 0.07);
  const totalTax = corporateTax + localCorporateTax + businessTax;

  const taxRows = [
    { label: '課税所得金額', value: `${formatCurrency(taxableIncome)}円`, highlight: true },
    { label: `法人税額（税率${(corporateTaxRate * 100).toFixed(1)}%）`, value: `${formatCurrency(corporateTax)}円` },
    { label: '地方法人税（10.3%）', value: `${formatCurrency(localCorporateTax)}円` },
    { label: '事業税（概算7%）', value: `${formatCurrency(businessTax)}円` },
  ];

  taxRows.forEach((row, idx) => {
    if (row.highlight) {
      draw.rect(40, y - ROW_HEIGHT, 515, ROW_HEIGHT, colors.highlight);
    } else if (idx % 2 === 1) {
      draw.rect(40, y - ROW_HEIGHT, 515, ROW_HEIGHT, rgb(0.98, 0.98, 0.98));
    }
    draw.line(40, y - ROW_HEIGHT, 555, y - ROW_HEIGHT);
    draw.text(row.label, 55, y - ROW_HEIGHT + 5, { size: 10 });
    draw.text(row.value, 450, y - ROW_HEIGHT + 5, { size: 10 });
    y -= ROW_HEIGHT;
  });
  y -= 8;

  // 税額合計
  draw.rect(40, y - ROW_HEIGHT - 8, 515, ROW_HEIGHT + 8, colors.lightRed);
  draw.line(40, y - ROW_HEIGHT - 8, 555, y - ROW_HEIGHT - 8, 1.5);
  draw.line(40, y, 555, y, 1.5);
  draw.text('税額合計（概算）', 55, y - ROW_HEIGHT - 1, { size: 13, font: bold });
  draw.text(`${formatCurrency(totalTax)}円`, 430, y - ROW_HEIGHT - 1, { size: 13, font: bold, color: colors.red });
  y -= ROW_HEIGHT + 35;

  // ===== セクション4: 別表五(一)相当：利益積立金の計算 =====
  draw.rect(40, y - SECTION_TITLE_HEIGHT, 515, SECTION_TITLE_HEIGHT, colors.secondary);
  draw.text('第4部　別表五(一)相当：利益積立金の計算', 50, y - 17, { size: 12, font: bold, color: rgb(1, 1, 1) });
  y -= SECTION_TITLE_HEIGHT + 8;

  const beginningRetainedEarnings = data.beginningRetainedEarnings || 0;
  const currentNetIncome = data.netIncome;
  const endingRetainedEarnings = beginningRetainedEarnings + currentNetIncome;

  const retainedEarningsRows = [
    ['期首利益積立金（前期末残高）', formatCurrency(beginningRetainedEarnings) + '円'],
    ['当期の純利益（増加額）', formatCurrency(currentNetIncome) + '円'],
    ['期末利益積立金（当期末残高）', formatCurrency(endingRetainedEarnings) + '円'],
  ];

  retainedEarningsRows.forEach(([label, value], idx) => {
    const isTotal = idx === 2;
    if (isTotal) {
      draw.rect(40, y - ROW_HEIGHT - 2, 515, ROW_HEIGHT + 2, colors.highlight);
    } else if (idx % 2 === 0) {
      draw.rect(40, y - ROW_HEIGHT, 515, ROW_HEIGHT, rgb(0.98, 0.98, 0.98));
    }
    draw.line(40, y - ROW_HEIGHT, 555, y - ROW_HEIGHT);
    draw.text(label, 55, y - ROW_HEIGHT + 5, { size: 10, font: isTotal ? bold : regular });
    draw.text(value, 430, y - ROW_HEIGHT + 5, { size: 10, font: isTotal ? bold : regular });
    y -= ROW_HEIGHT + (isTotal ? 2 : 0);
  });
  y -= 10;
  draw.text('※ 利益剰余金（期末）＝ 期首残高 ＋ 当期純利益（税引後）', 55, y, { size: 8, color: colors.muted });

  // ===== フッター =====
  draw.line(40, 75, 555, 75);
  draw.text('※ この書類はAinanceで作成した参考資料です。', 45, 58, { size: 9, color: colors.muted });
  draw.text('※ 正式な申告には税理士への相談またはe-Taxをご利用ください。', 45, 44, { size: 9, color: colors.muted });

  return pdfDoc.save();
}

/**
 * 決算報告書（財務三表：損益計算書・貸借対照表・キャッシュフロー計算書）PDFを生成（日本語・1枚にまとめ）
 */
export async function generateFinancialStatementPDF(data: JpTaxFormData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { regular, bold } = await loadJapaneseFont(pdfDoc);
  const { width, height } = page.getSize();

  const colors = {
    primary: rgb(0.1, 0.2, 0.4),    // 紺色（法人税申告書と統一）
    secondary: rgb(0.15, 0.3, 0.5), // 濃い青
    text: rgb(0.1, 0.1, 0.1),
    muted: rgb(0.45, 0.45, 0.45),
    line: rgb(0.6, 0.6, 0.6),
    headerBg: rgb(0.92, 0.94, 0.98),
    highlight: rgb(0.94, 0.96, 1),
    green: rgb(0.15, 0.55, 0.25),
    red: rgb(0.75, 0.2, 0.2),
    lightGreen: rgb(0.88, 0.96, 0.88),
    lightBlue: rgb(0.88, 0.93, 1),
  };

  // 行の高さ設定
  const ROW_HEIGHT = 16;
  const HEADER_HEIGHT = 20;
  const SECTION_TITLE_HEIGHT = 22;

  const draw = {
    text: (text: string, x: number, y: number, options: { size?: number; font?: PDFFont; color?: typeof colors.text } = {}) => {
      page.drawText(text, { x, y, size: options.size || 9, font: options.font || regular, color: options.color || colors.text });
    },
    line: (x1: number, y1: number, x2: number, y2: number, thickness = 0.5) => {
      page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, thickness, color: colors.line });
    },
    rect: (x: number, y: number, w: number, h: number, color: typeof colors.highlight) => {
      page.drawRectangle({ x, y, width: w, height: h, color });
    },
  };

  // ===== ヘッダー =====
  draw.rect(0, height - 55, width, 55, colors.primary);
  draw.text('決 算 報 告 書', 210, height - 35, { size: 22, font: bold, color: rgb(1, 1, 1) });
  draw.text('（財務三表）', 360, height - 35, { size: 14, color: rgb(0.85, 0.85, 0.9) });

  let y = height - 72;
  draw.text(`${data.companyName || '会社名'}`, 50, y, { size: 12, font: bold });
  
  // 自 至 表示
  if (data.fiscalYearStart && data.fiscalYearEnd) {
    draw.text(`自 ${data.fiscalYearStart}　至 ${data.fiscalYearEnd}`, 210, y, { size: 10 });
  } else {
    draw.text(`${data.fiscalYear}年度（${getJapaneseYear(data.fiscalYear)}度）`, 280, y, { size: 10 });
  }
  
  draw.text(`（単位：円）`, 400, y, { size: 10 });
  draw.text(`作成日: ${new Date().toLocaleDateString('ja-JP')}`, 480, y, { size: 9, color: colors.muted });
  y -= 18;
  draw.line(40, y, 555, y, 1.5);
  y -= 12;

  // ===== 計算用データ =====
  const operatingIncome = data.operatingIncome ?? (data.revenue - data.expenses);
  const costOfSales = data.costOfSales ?? 0;
  const grossProfit = data.grossProfit ?? (data.revenue - costOfSales);
  const nonOperatingIncome = data.nonOperatingIncome ?? 0;
  const nonOperatingExpenses = data.nonOperatingExpenses ?? 0;
  const ordinaryIncome = data.ordinaryIncome ?? (operatingIncome + nonOperatingIncome - nonOperatingExpenses);

  // B/Sデータ (期首残高 + 今期増減)
  const estimatedCash = data.cash ?? (data.beginningCash ?? 0); 
  const estimatedReceivables = (data.accountsReceivable ?? 0) + (data.beginningReceivable ?? 0);
  const estimatedInventory = (data.inventory ?? 0) + (data.beginningInventory ?? 0);
  const estimatedFixedAssets = (data.fixedAssets ?? 0) + (data.beginningFixedAssets ?? 0);
  
  const totalAssets = data.totalAssets ?? (estimatedCash + estimatedReceivables + estimatedInventory + estimatedFixedAssets);
  
  const estimatedPayables = (data.accountsPayable ?? 0) + (data.beginningPayable ?? 0);
  const estimatedLoans = (data.shortTermLoans ?? 0) + (data.beginningShortTermLoans ?? 0);
  const longTermLoans = (data.longTermLoans ?? 0) + (data.beginningLongTermLoans ?? 0);
  
  const totalLiabilities = data.totalLiabilities ?? (estimatedPayables + estimatedLoans + longTermLoans);
  const estimatedCapital = data.capital || data.beginningCapital || data.estimatedCapital || 0;
  const beginningRetainedEarnings = data.beginningRetainedEarnings ?? 0;
  const retainedEarnings = data.retainedEarnings ?? (beginningRetainedEarnings + data.netIncome);

  // C/Fデータ
  const depreciation = data.depreciation ?? 0;
  const operatingCF = data.netIncome + depreciation;
  const investingCF = 0; // 実績データがないため0
  const financingCF = 0; // 実績データがないため0
  const netCashChange = operatingCF + investingCF + financingCF;

  // ===== セクション1: 損益計算書（左側） =====
  const plX = 40;
  const plWidth = 250;
  const section1Top = y;

  // P/L タイトル
  draw.rect(plX, y - SECTION_TITLE_HEIGHT, plWidth, SECTION_TITLE_HEIGHT, colors.secondary);
  draw.text('損益計算書（P/L）', plX + 70, y - 15, { size: 11, font: bold, color: rgb(1, 1, 1) });
  y -= SECTION_TITLE_HEIGHT + 4;

  // P/L 項目
  const plItems = [
    { label: '売上高', value: data.revenue, isHighlight: true },
    { label: '売上原価', value: costOfSales },
    { label: '売上総利益', value: grossProfit, isSubtotal: true },
    { label: '販売費及び一般管理費', value: data.operatingExpenses || (data.expenses - costOfSales) },
    { label: '営業利益', value: operatingIncome, isSubtotal: true, color: operatingIncome >= 0 ? colors.green : colors.red },
    { label: '営業外収益', value: nonOperatingIncome },
    { label: '営業外費用', value: nonOperatingExpenses },
    { label: '経常利益', value: ordinaryIncome, isSubtotal: true },
    { label: '当期純利益', value: data.netIncome, isTotal: true, color: data.netIncome >= 0 ? colors.green : colors.red },
  ];

  plItems.forEach(item => {
    const rowH = item.isTotal ? ROW_HEIGHT + 4 : ROW_HEIGHT;
    if (item.isTotal) {
      draw.rect(plX, y - rowH, plWidth, rowH, colors.lightGreen);
    } else if (item.isSubtotal) {
      draw.rect(plX, y - rowH, plWidth, rowH, colors.headerBg);
    } else if (item.isHighlight) {
      draw.rect(plX, y - rowH, plWidth, rowH, colors.highlight);
    }
    draw.line(plX, y - rowH, plX + plWidth, y - rowH);
    draw.text(item.label, plX + 8, y - rowH + 5, {
      size: item.isTotal ? 10 : 9,
      font: item.isSubtotal || item.isTotal ? bold : regular
    });
    draw.text(`${formatCurrency(item.value)}`, plX + plWidth - 60, y - rowH + 5, {
      size: item.isTotal ? 10 : 9,
      font: item.isSubtotal || item.isTotal ? bold : regular,
      color: item.color || colors.text
    });
    y -= rowH;
  });
  const plBottom = y;

  // ===== セクション2: 貸借対照表（右側） =====
  y = section1Top;
  const bsX = 305;
  const bsWidth = 250;
  const bsHalfWidth = 122;

  // B/S タイトル
  draw.rect(bsX, y - SECTION_TITLE_HEIGHT, bsWidth, SECTION_TITLE_HEIGHT, colors.secondary);
  draw.text('貸借対照表（B/S）', bsX + 70, y - 15, { size: 11, font: bold, color: rgb(1, 1, 1) });
  y -= SECTION_TITLE_HEIGHT + 4;

  // B/S 左右ヘッダー
  draw.rect(bsX, y - HEADER_HEIGHT, bsHalfWidth, HEADER_HEIGHT, rgb(0.85, 0.9, 0.95));
  draw.text('資産の部', bsX + 35, y - 14, { size: 10, font: bold });
  draw.rect(bsX + bsHalfWidth + 6, y - HEADER_HEIGHT, bsHalfWidth, HEADER_HEIGHT, rgb(0.95, 0.9, 0.88));
  draw.text('負債・純資産の部', bsX + bsHalfWidth + 15, y - 14, { size: 10, font: bold });
  y -= HEADER_HEIGHT + 2;

  // B/S 項目
  const bsLeftItems = [
    { label: '流動資産', isSection: true },
    { label: '　現金預金', value: estimatedCash },
    { label: '　売掛金', value: estimatedReceivables },
    { label: '　棚卸資産', value: estimatedInventory },
    { label: '固定資産', isSection: true },
    { label: '　有形固定資産', value: estimatedFixedAssets },
    { label: '資産合計', value: totalAssets, isTotal: true },
  ];

  const totalLiabilitiesAndNetAssets = totalLiabilities + estimatedCapital + retainedEarnings;

  const bsRightItems = [
    { label: '流動負債', isSection: true },
    { label: '　買掛金', value: estimatedPayables },
    { label: '　短期借入金', value: estimatedLoans },
    { label: '純資産の部', isSection: true },
    { label: '　資本金', value: estimatedCapital },
    { label: '　利益剰余金', value: retainedEarnings },
    { label: '負債純資産合計', value: totalLiabilitiesAndNetAssets, isTotal: true },
  ];

  let leftY = y;
  let rightY = y;

  bsLeftItems.forEach(item => {
    const rowH = item.isTotal ? ROW_HEIGHT + 2 : ROW_HEIGHT - 1;
    if (item.isTotal) {
      draw.rect(bsX, leftY - rowH, bsHalfWidth, rowH, colors.lightGreen);
    } else if (item.isSection) {
      draw.rect(bsX, leftY - rowH, bsHalfWidth, rowH, colors.highlight);
    }
    draw.line(bsX, leftY - rowH, bsX + bsHalfWidth, leftY - rowH);
    draw.text(item.label, bsX + 4, leftY - rowH + 4, {
      size: 8,
      font: item.isSection || item.isTotal ? bold : regular
    });
    if (item.value !== undefined) {
      draw.text(formatCurrency(item.value), bsX + bsHalfWidth - 45, leftY - rowH + 4, {
        size: 8,
        font: item.isTotal ? bold : regular
      });
    }
    leftY -= rowH;
  });

  bsRightItems.forEach(item => {
    const rowH = item.isTotal ? ROW_HEIGHT + 2 : ROW_HEIGHT - 1;
    const rightColX = bsX + bsHalfWidth + 6;
    if (item.isTotal) {
      draw.rect(rightColX, rightY - rowH, bsHalfWidth, rowH, colors.lightGreen);
    } else if (item.isSection) {
      draw.rect(rightColX, rightY - rowH, bsHalfWidth, rowH, colors.highlight);
    }
    draw.line(rightColX, rightY - rowH, rightColX + bsHalfWidth, rightY - rowH);
    draw.text(item.label, rightColX + 4, rightY - rowH + 4, {
      size: 8,
      font: item.isSection || item.isTotal ? bold : regular
    });
    if (item.value !== undefined) {
      draw.text(formatCurrency(item.value), rightColX + bsHalfWidth - 48, rightY - rowH + 4, {
        size: 8,
        font: item.isTotal ? bold : regular
      });
    }
    rightY -= rowH;
  });

  // ===== セクション3: キャッシュフロー計算書（下段） =====
  y = Math.min(plBottom, leftY, rightY) - 20;

  // C/F タイトル
  draw.rect(40, y - SECTION_TITLE_HEIGHT, width - 80, SECTION_TITLE_HEIGHT, colors.secondary);
  draw.text('キャッシュ・フロー計算書（C/F）', 200, y - 15, { size: 11, font: bold, color: rgb(1, 1, 1) });
  y -= SECTION_TITLE_HEIGHT + 6;

  // C/F 3列レイアウト
  const cfColWidth = 165;
  const cfGap = 10;
  const cfSections = [
    {
      title: '営業活動によるCF',
      items: [
        { label: '税引前当期純利益', value: data.netIncome },
        { label: '減価償却費', value: depreciation },
        { label: '売上債権の増減', value: -Math.floor(estimatedReceivables * 0.1) },
        { label: '仕入債務の増減', value: Math.floor(estimatedPayables * 0.1) },
      ],
      total: operatingCF,
    },
    {
      title: '投資活動によるCF',
      items: [
        { label: '固定資産の取得', value: investingCF },
        { label: '投資有価証券の取得', value: 0 },
      ],
      total: investingCF,
    },
    {
      title: '財務活動によるCF',
      items: [
        { label: '借入金の返済', value: financingCF },
        { label: '配当金の支払', value: 0 },
      ],
      total: financingCF,
    },
  ];

  cfSections.forEach((section, idx) => {
    const colX = 40 + idx * (cfColWidth + cfGap);
    let cfY = y;

    // セクションヘッダー
    draw.rect(colX, cfY - HEADER_HEIGHT, cfColWidth, HEADER_HEIGHT, colors.headerBg);
    draw.line(colX, cfY - HEADER_HEIGHT, colX + cfColWidth, cfY - HEADER_HEIGHT);
    draw.text(section.title, colX + 25, cfY - 14, { size: 9, font: bold });
    cfY -= HEADER_HEIGHT + 2;

    // 項目
    section.items.forEach(item => {
      draw.line(colX, cfY - ROW_HEIGHT, colX + cfColWidth, cfY - ROW_HEIGHT);
      draw.text(item.label, colX + 6, cfY - ROW_HEIGHT + 5, { size: 8 });
      draw.text(formatCurrency(item.value), colX + cfColWidth - 50, cfY - ROW_HEIGHT + 5, { size: 8 });
      cfY -= ROW_HEIGHT;
    });

    // 小計
    draw.rect(colX, cfY - ROW_HEIGHT - 2, cfColWidth, ROW_HEIGHT + 2, colors.lightBlue);
    draw.line(colX, cfY - ROW_HEIGHT - 2, colX + cfColWidth, cfY - ROW_HEIGHT - 2, 1);
    draw.text('小計', colX + 6, cfY - ROW_HEIGHT + 3, { size: 9, font: bold });
    draw.text(formatCurrency(section.total), colX + cfColWidth - 50, cfY - ROW_HEIGHT + 3, {
      size: 9,
      font: bold,
      color: section.total >= 0 ? colors.green : colors.red
    });
  });

  // 現金増減合計
  y = y - (HEADER_HEIGHT + ROW_HEIGHT * 4 + ROW_HEIGHT + 2 + 15);
  draw.rect(40, y - HEADER_HEIGHT, width - 80, HEADER_HEIGHT, colors.lightGreen);
  draw.line(40, y - HEADER_HEIGHT, 555, y - HEADER_HEIGHT, 1.5);
  draw.line(40, y, 555, y, 1.5);
  draw.text('現金及び現金同等物の増減額', 50, y - 14, { size: 11, font: bold });
  draw.text(`${formatCurrency(netCashChange)}円`, 440, y - 14, { size: 11, font: bold, color: netCashChange >= 0 ? colors.green : colors.red });

  // 期末残高
  y -= HEADER_HEIGHT + 5;
  draw.line(40, y - ROW_HEIGHT, 555, y - ROW_HEIGHT);
  draw.text('現金及び現金同等物の期末残高', 50, y - ROW_HEIGHT + 5, { size: 10 });
  draw.text(`${formatCurrency(estimatedCash + netCashChange)}円`, 440, y - ROW_HEIGHT + 5, { size: 10, font: bold });

  // ===== フッター =====
  draw.line(40, 70, 555, 70);
  draw.text('※ この決算報告書はAinanceで作成した参考資料です。', 45, 55, { size: 8, color: colors.muted });
  draw.text('※ 貸借対照表・キャッシュフロー計算書は売上・経費データからの概算です。正確な作成には税理士へご相談ください。', 45, 43, { size: 8, color: colors.muted });

  return pdfDoc.save();
}

export async function generateTaxReturnBPDF(data: JpTaxFormData): Promise<Uint8Array> {
  const fillData: TaxFormData = {
    name: data.name || '',
    address: data.address || '',
    phone: data.phone || '',
    tradeName: data.tradeName || '',
    revenue: data.revenue || 0,
    expenses: data.expenses || 0,
    netIncome: data.netIncome || 0,
    businessIncome: data.netIncome || 0,
    totalIncome: data.netIncome || 0,
    taxableIncome: data.taxableIncome || 0,
    estimatedTax: data.estimatedTax || 0,
    fiscalYear: data.fiscalYear || new Date().getFullYear() - 1,
    fiscalYearStart: data.fiscalYearStart,
    fiscalYearEnd: data.fiscalYearEnd,
    isBlueReturn: !!data.isBlueReturn,
    expensesByCategory: data.expensesByCategory || [],
    deductions: {
      basic: data.deductions?.basic || 0,
      blueReturn: data.deductions?.blueReturn || 0,
      socialInsurance: data.deductions?.socialInsurance || 0,
      lifeInsurance: data.deductions?.lifeInsurance || 0,
    },
    medicalExpenses: 0,
    blueReturnDeduction: data.deductions?.blueReturn || 0,
  };

  try {
    const url = '/templates/kakutei_1_2.pdf';
    const response = await fetch(`${url}?t=${Date.now()}`);
    
    // Check if the file is an actual PDF and not a fallback HTML page
    const contentType = response.headers.get('content-type');
    if (!response.ok || (contentType && !contentType.includes('pdf'))) {
      throw new Error(`Invalid PDF or fetch failed: ${response.status} ${contentType}`);
    }
    
    const templateBytes = await response.arrayBuffer();
    return await fillTaxReturnB(templateBytes, fillData);
  } catch (error) {
    console.warn('Failed to load official template, falling back to basic PDF generation:', error);
    // 依存関係である generateFilledTaxForm はここでは直接インポートせずに、エラーのままスローするかフォールバックを組み込む等対応可能です。
    // pdfAutoFillService側の generateFilledTaxForm 等と同じフォールバックが必要になりますが、現時点ではエラーをThrowするか、
    throw new Error(`PDF生成用テンプレート（kakutei_1_2.pdf）の読み込みに失敗しました。詳細: ${error}`);
  }
}

/**
 * 青色申告決算書 PDFを生成（日本語）
 */
export async function generateBlueReturnPDF(data: JpTaxFormData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]);
  const { regular, bold } = await loadJapaneseFont(pdfDoc);
  const { width, height } = page.getSize();

  const colors = {
    primary: rgb(0.2, 0.4, 0.8),
    text: rgb(0.1, 0.1, 0.1),
    muted: rgb(0.4, 0.4, 0.4),
    line: rgb(0.5, 0.5, 0.5),
    highlight: rgb(0.95, 0.95, 1),
    green: rgb(0.2, 0.6, 0.3),
  };

  const drawText = (text: string, x: number, y: number, options: { size?: number; font?: PDFFont; color?: typeof colors.text } = {}) => {
    page.drawText(text, { x, y, size: options.size || 10, font: options.font || regular, color: options.color || colors.text });
  };

  const drawLine = (x1: number, y1: number, x2: number, y2: number, thickness = 0.5) => {
    page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, thickness, color: colors.line });
  };

  const drawRect = (x: number, y: number, w: number, h: number, color: typeof colors.highlight) => {
    page.drawRectangle({ x, y, width: w, height: h, color });
  };

  // ヘッダー
  drawRect(0, height - 60, width, 60, colors.primary);
  drawText('青色申告決算書', 200, height - 40, { size: 20, font: bold, color: rgb(1, 1, 1) });
  drawText('（一般用）', 340, height - 40, { size: 12, color: rgb(0.9, 0.9, 0.9) });

  let y = height - 85;
  drawText(`${getJapaneseYear(data.fiscalYear)}分　所得税青色申告決算書`, 50, y, { size: 11, font: bold });
  if (data.tradeName) {
    drawText(`屋号: ${data.tradeName}`, 350, y, { size: 10 });
  }
  drawText(`作成日: ${new Date().toLocaleDateString('ja-JP')}`, 450, y, { size: 9, color: colors.muted });
  y -= 30;

  drawLine(50, y, 545, y, 1);
  y -= 25;

  // 損益計算
  drawText('損益計算書', 50, y, { size: 12, font: bold, color: colors.primary });
  y -= 20;

  // 売上
  drawRect(50, y - 5, 495, 20, colors.highlight);
  drawLine(50, y - 5, 545, y - 5);
  drawText('売上（収入）金額　①', 60, y, { font: bold });
  drawText(`${formatCurrency(data.revenue)}円`, 450, y, { font: bold });
  y -= 30;

  // 経費
  drawText('経費', 50, y, { size: 11, font: bold });
  y -= 20;

  // 経費内訳テーブル
  drawRect(50, y - 15, 495, 15, rgb(0.9, 0.9, 0.9));
  drawLine(50, y, 545, y);
  drawLine(50, y - 15, 545, y - 15);
  drawText('勘定科目', 60, y - 11, { font: bold, size: 9 });
  drawText('金額', 470, y - 11, { font: bold, size: 9 });
  y -= 18;

  data.expensesByCategory.forEach((exp, index) => {
    const category = EXPENSE_CATEGORIES_JP[exp.category] || exp.category || '雑費';
    const isAlt = index % 2 === 0;
    if (isAlt) {
      drawRect(50, y - 15, 495, 15, rgb(0.98, 0.98, 0.98));
    }
    drawLine(50, y - 15, 545, y - 15);
    drawText(category, 60, y - 11, { size: 9 });
    drawText(formatCurrency(exp.amount), 450, y - 11, { size: 9 });
    y -= 15;

    if (y < 200) return;
  });

  // 経費合計
  drawRect(50, y - 18, 495, 18, rgb(0.95, 0.95, 0.95));
  drawLine(50, y - 18, 545, y - 18);
  drawText('経費合計　㉑', 60, y - 13, { font: bold });
  drawText(`${formatCurrency(data.expenses)}円`, 445, y - 13, { font: bold });
  y -= 30;

  // 差引金額
  drawLine(50, y - 5, 545, y - 5);
  drawText('差引金額　① - ㉑', 60, y);
  drawText(`${formatCurrency(data.netIncome)}円`, 450, y);
  y -= 25;

  // 青色申告特別控除
  if (data.deductions?.blueReturn) {
    drawLine(50, y - 5, 545, y - 5);
    drawText('青色申告特別控除額', 60, y);
    drawText(`${formatCurrency(data.deductions.blueReturn)}円`, 450, y);
    y -= 25;

    const finalIncome = Math.max(0, data.netIncome - data.deductions.blueReturn);
    drawRect(50, y - 8, 495, 25, rgb(0.95, 1, 0.95));
    drawLine(50, y - 8, 545, y - 8, 1);
    drawLine(50, y + 17, 545, y + 17, 1);
    drawText('所得金額　㊸', 60, y + 2, { font: bold, size: 11 });
    drawText(`${formatCurrency(finalIncome)}円`, 440, y + 2, { font: bold, size: 11, color: colors.green });
  }

  // フッター
  drawLine(50, 60, 545, 60);
  drawText('※ この書類はAinanceで作成した参考資料です。', 50, 45, { size: 8, color: colors.muted });
  drawText('※ 正式な申告には国税庁「確定申告書等作成コーナー」をご利用ください。', 50, 33, { size: 8, color: colors.muted });

  return pdfDoc.save();
}

/**
 * 補助金申請書ドラフトPDFを生成（日本語）
 */
export async function generateSubsidyApplicationPDF(draft: ApplicationDraft): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  // マージンとサイズの設定
  const margin = 50;
  const pageHeight = 841.89;
  const pageWidth = 595.28;

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  const { regular, bold } = await loadJapaneseFont(pdfDoc);

  const colors = {
    primary: rgb(0.1, 0.2, 0.4),
    text: rgb(0.1, 0.1, 0.1),
    muted: rgb(0.4, 0.4, 0.4),
    line: rgb(0.8, 0.8, 0.8),
    headerBg: rgb(0.95, 0.95, 0.98),
  };

  let y = pageHeight - margin;

  // テキスト描画ヘルパー
  const drawText = (text: string, x: number, py: number, size: number = 10, font: PDFFont = regular, color = colors.text) => {
    page.drawText(text, { x, y: py, size, font, color });
  };

  // テキスト折り返し処理ヘルパー
  const wrapText = (text: string, size: number, font: PDFFont, maxWidth: number): string[] => {
    if (!text) return [];
    // 改行で分割
    const chars = text.split('');
    const lines: string[] = [];
    let currentLine = '';

    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      const width = font.widthOfTextAtSize(currentLine + char, size);
      if (width < maxWidth) {
        currentLine += char;
      } else {
        lines.push(currentLine);
        currentLine = char;
      }
    }
    lines.push(currentLine);
    return lines;
  };

  // ページ追加判定
  const checkPageBreak = (heightNeeded: number) => {
    if (y - heightNeeded < margin) {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
      return true;
    }
    return false;
  };

  // === ヘッダー ===
  checkPageBreak(80);
  drawText('補 助 金 申 請 書 （案）', margin, y, 18, bold);
  y -= 30;

  drawText(`申請補助金: ${draft.subsidyName}`, margin, y, 12, bold, colors.primary);
  y -= 20;

  drawText(`作成日: ${new Date().toLocaleDateString('ja-JP')}`, margin, y, 10, regular, colors.muted);
  y -= 10;

  page.drawLine({
    start: { x: margin, y: y },
    end: { x: pageWidth - margin, y: y },
    thickness: 1,
    color: colors.primary
  });
  y -= 30;

  // === セクション出力 ===
  const contentWidth = pageWidth - (margin * 2);
  const fontSize = 10;
  const lineHeight = 16;

  for (const section of draft.sections) {
    // タイトルの出力
    checkPageBreak(40);
    page.drawRectangle({
      x: margin,
      y: y - 20,
      width: contentWidth,
      height: 24,
      color: colors.headerBg
    });
    drawText(section.title, margin + 10, y - 14, 11, bold, colors.primary);
    y -= 35;

    // 本文の出力
    const paragraphs = section.content.split('\n');

    for (const paragraph of paragraphs) {
      const lines = wrapText(paragraph, fontSize, regular, contentWidth);

      for (const line of lines) {
        checkPageBreak(lineHeight);
        drawText(line, margin, y, fontSize, regular);
        y -= lineHeight;
      }
      y -= 5; // 段落間のマージン
    }
    y -= 15; // セクション間のマージン
  }

  return pdfDoc.save();
}

// ===== 法人税申告書一式 PDF生成機能 =====

/**
 * 法人税申告書一式（別表各種）のPDFを生成
 */
export async function generateCompleteCorporateTaxPDF(data: CorporateTaxInputData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  // フォントロード
  const { regular, bold } = await loadJapaneseFont(pdfDoc);

  // 共通設定
  const colors = {
    primary: rgb(0.1, 0.2, 0.4),    // 紺色
    secondary: rgb(0.15, 0.3, 0.5), // 濃い青
    text: rgb(0.1, 0.1, 0.1),
    muted: rgb(0.45, 0.45, 0.45),
    line: rgb(0.6, 0.6, 0.6),
    headerBg: rgb(0.92, 0.94, 0.98),
    highlight: rgb(0.94, 0.96, 1),
    lightGreen: rgb(0.88, 0.96, 0.88),
    lightRed: rgb(1, 0.93, 0.93),
  };

  // 描画ヘルパー
  const createDrawHelper = (page: PDFPage) => ({
    text: (text: string, x: number, y: number, options: { size?: number; font?: PDFFont; color?: typeof colors.text; align?: 'left' | 'right' | 'center' } = {}) => {
      const size = options.size || 10;
      const font = options.font || regular;
      const color = options.color || colors.text;

      let xPos = x;
      if (options.align === 'right') {
        const width = font.widthOfTextAtSize(text, size);
        xPos -= width;
      } else if (options.align === 'center') {
        const width = font.widthOfTextAtSize(text, size);
        xPos -= width / 2;
      }

      page.drawText(text, { x: xPos, y, size, font, color });
    },
    line: (x1: number, y1: number, x2: number, y2: number, thickness = 0.5) => {
      page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, thickness, color: colors.line });
    },
    rect: (x: number, y: number, w: number, h: number, color: typeof colors.highlight) => {
      page.drawRectangle({ x, y, width: w, height: h, color });
    },
    currency: (amount: number, x: number, y: number, size: number = 10) => {
      const text = formatCurrency(amount);
      const font = regular;
      const width = font.widthOfTextAtSize(text, size);
      page.drawText(text, { x: x - width, y, size, font, color: colors.text });
    }
  });

  // ========== ページ生成処理 ==========

  // 1. 表紙・会社情報
  const coverPage = pdfDoc.addPage([595.28, 841.89]);
  const drawCover = createDrawHelper(coverPage);
  const { width: pageWidth, height: pageHeight } = coverPage.getSize();

  drawCover.rect(0, pageHeight - 150, pageWidth, 150, colors.primary);
  drawCover.text('法人税申告書報告書', pageWidth / 2, pageHeight - 80, { size: 28, font: bold, color: rgb(1, 1, 1), align: 'center' });
  drawCover.text(`${getJapaneseYear(new Date().getFullYear())}度版`, pageWidth / 2, pageHeight - 120, { size: 14, color: rgb(0.9, 0.9, 1), align: 'center' });

  // 会社名は現在のデータ構造に含まれていないため、プレースホルダーまたは事業概況などから取得
  // ここでは汎用的に表示
  drawCover.text('会社名:', 100, pageHeight - 300, { size: 14, color: colors.muted });
  // NOTE: 将来的にCorporateTaxInputDataに会社名フィールドを追加することを推奨
  drawCover.text('（会社名未設定）', 200, pageHeight - 300, { size: 18, font: bold });

  drawCover.text('作成日:', 100, pageHeight - 350, { size: 14, color: colors.muted });
  drawCover.text(new Date().toLocaleDateString('ja-JP'), 200, pageHeight - 350, { size: 18 });

  drawCover.text('※ 本資料はAinanceで作成された参考資料です。', pageWidth / 2, 100, { size: 10, color: colors.muted, align: 'center' });
  drawCover.text('正式な税務申告には、税理士の確認またはe-Taxをご利用ください。', pageWidth / 2, 80, { size: 10, color: colors.muted, align: 'center' });


  // 2. 別表一（各事業年度の所得に係る申告書）
  const p1 = pdfDoc.addPage([595.28, 841.89]);
  const d1 = createDrawHelper(p1);
  drawPageHeader(d1, '別表一（一）', '各事業年度の所得に係る申告書', pageHeight, pageWidth, colors, bold);

  let y = pageHeight - 100;
  drawSectionBox(d1, '申告額の計算', y, pageWidth, colors, bold);
  y -= 25;

  // 簡易グリッド描画
  const drawGridRow = (d: any, label: string, val: number | string, yPos: number, isHeader = false) => {
    d.rect(50, yPos - 20, 300, 20, isHeader ? colors.headerBg : rgb(1, 1, 1)); // ラベルセル
    d.rect(350, yPos - 20, 195, 20, isHeader ? colors.headerBg : rgb(1, 1, 1)); // 値セル
    d.line(50, yPos - 20, 545, yPos - 20); // 下線
    d.line(50, yPos, 545, yPos); // 上線
    d.line(50, yPos, 50, yPos - 20); // 左縦
    d.line(350, yPos, 350, yPos - 20); // 中縦
    d.line(545, yPos, 545, yPos - 20); // 右縦

    d.text(label, 60, yPos - 14, { size: 10, font: isHeader ? bold : regular });
    if (typeof val === 'number') {
      d.currency(val, 535, yPos - 14, 10);
    } else {
      d.text(val, 360, yPos - 14, { size: 10 });
    }
  };

  drawGridRow(d1, '1. 別表四の所得金額又は欠損金額', data.beppyo4.taxableIncome, y); y -= 20;
  drawGridRow(d1, '2. 欠損金又は災害損失金の控除額', 0, y); y -= 20;
  drawGridRow(d1, '3. 翌期へ繰り越す欠損金又は災害損失金', 0, y); y -= 20;
  drawGridRow(d1, '4. 課税標準額 (1-2)', Math.max(0, data.beppyo1.taxableIncome), y); y -= 20;

  y -= 10;
  drawGridRow(d1, '5. 課税標準額に対する法人税額', data.beppyo1.corporateTaxAmount, y); y -= 20;
  drawGridRow(d1, '6. 控除税額（所得税額等）', data.beppyo1.specialTaxCredit, y); y -= 20;
  drawGridRow(d1, '7. 差引所得に対する法人税額 (5-6)', Math.max(0, data.beppyo1.corporateTaxAmount - data.beppyo1.specialTaxCredit), y); y -= 20;

  // 地方法人税
  const localCorpTax = Math.floor(data.beppyo1.corporateTaxAmount * 0.103);
  drawGridRow(d1, '8. 地方法人税額（課税標準法人税額 × 10.3%）', localCorpTax, y); y -= 20;
  drawGridRow(d1, '9. 中間申告分の法人税額', data.beppyo1.interimPayment, y); y -= 20;

  const finalTax = Math.max(0, (data.beppyo1.corporateTaxAmount - data.beppyo1.specialTaxCredit + localCorpTax) - data.beppyo1.interimPayment);
  drawGridRow(d1, '10. 差引確定法人税額', finalTax, y, true); y -= 20;

  // 3. 別表四（所得の金額の計算に関する明細書）
  const p4 = pdfDoc.addPage([595.28, 841.89]);
  const d4 = createDrawHelper(p4);
  drawPageHeader(d4, '別表四', '所得の金額の計算に関する明細書', pageHeight, pageWidth, colors, bold);

  y = pageHeight - 100;
  drawSectionBox(d4, '損益の計算', y, pageWidth, colors, bold);
  y -= 25;

  // ヘッダー
  d4.rect(50, y - 20, 250, 20, colors.headerBg);
  d4.rect(300, y - 20, 120, 20, colors.headerBg);
  d4.rect(420, y - 20, 125, 20, colors.headerBg);
  d4.text('区分', 150, y - 14, { size: 10, font: bold, align: 'center' });
  d4.text('総額', 360, y - 14, { size: 10, font: bold, align: 'center' });
  d4.text('処分（留保）', 480, y - 14, { size: 10, font: bold, align: 'center' });
  d4.line(50, y, 545, y); d4.line(50, y - 20, 545, y - 20);
  d4.line(50, y, 50, y - 20); d4.line(300, y, 300, y - 20); d4.line(420, y, 420, y - 20); d4.line(545, y, 545, y - 20);
  y -= 20;

  const drawTable4Row = (label: string, total: number, retained: number) => {
    d4.line(50, y - 20, 545, y - 20);
    d4.line(50, y, 50, y - 20); d4.line(300, y, 300, y - 20); d4.line(420, y, 420, y - 20); d4.line(545, y, 545, y - 20);
    d4.text(label, 60, y - 14, { size: 9 });
    d4.currency(total, 410, y - 14, 9);
    d4.currency(retained, 535, y - 14, 9);
    y -= 20;
  };

  drawTable4Row('1. 当期純利益', data.beppyo4.netIncomeFromPL, data.beppyo4.netIncomeFromPL);

  data.beppyo4.additions.forEach(item => {
    drawTable4Row(`(加) ${item.description}`, item.amount, item.amount); // 簡易的に全て留保扱い
  });

  data.beppyo4.subtractions.forEach(item => {
    drawTable4Row(`(減) ${item.description}`, item.amount, item.amount); // 簡易的に全て留保扱い
  });

  // 合計行
  d4.rect(50, y - 20, 545 - 50, 20, colors.highlight);
  drawTable4Row('所得金額 (総額 + 加算 - 減算)', data.beppyo4.taxableIncome, data.beppyo4.taxableIncome);

  // 4. 別表五(一)（利益積立金額の計算に関する明細書）
  const p51 = pdfDoc.addPage([595.28, 841.89]);
  const d51 = createDrawHelper(p51);
  drawPageHeader(d51, '別表五(一)', '利益積立金額の計算に関する明細書', pageHeight, pageWidth, colors, bold);

  y = pageHeight - 100;
  const rowH = 20;

  drawSectionBox(d51, '利益積立金額', y, pageWidth, colors, bold);
  y -= 25;

  const drawGridRow51 = (label: string, val: number, yPos: number, isHeader = false) => {
    d51.rect(50, yPos - 20, 250, 20, isHeader ? colors.headerBg : rgb(1, 1, 1));
    d51.rect(300, yPos - 20, 245, 20, isHeader ? colors.headerBg : rgb(1, 1, 1));
    d51.line(50, yPos - 20, 545, yPos - 20); d51.line(50, yPos, 545, yPos);
    d51.line(50, yPos, 50, yPos - 20); d51.line(300, yPos, 300, yPos - 20); d51.line(545, yPos, 545, yPos - 20);
    d51.text(label, 60, yPos - 14, { size: 10, font: isHeader ? bold : regular });
    d51.currency(val, 535, yPos - 14, 10);
  };

  drawGridRow51('期首利益積立金額', data.beppyo5.retainedEarningsBegin, y); y -= 20;
  drawGridRow51('当期増加額', data.beppyo5.currentIncrease, y); y -= 20;
  drawGridRow51('当期減少額', data.beppyo5.currentDecrease, y); y -= 20;
  drawGridRow51('期末利益積立金額', data.beppyo5.totalRetainedEarningsEnd, y, true); y -= 20;

  y -= 20;
  drawSectionBox(d51, '資本金等の額', y, pageWidth, colors, bold);
  y -= 25;
  drawGridRow51('期首資本金等の額', data.beppyo5.capitalBegin, y); y -= 20;
  drawGridRow51('期末資本金等の額', data.beppyo5.capitalEnd, y, true); y -= 20;

  // 5. 別表五(二)（租税公課の納付状況等に関する明細書）
  const p52 = pdfDoc.addPage([595.28, 841.89]);
  const d52 = createDrawHelper(p52);
  drawPageHeader(d52, '別表五(二)', '租税公課の納付状況等に関する明細書', pageHeight, pageWidth, colors, bold);

  y = pageHeight - 100;
  drawSectionBox(d52, '納付状況', y, pageWidth, colors, bold);
  y -= 25;

  // 当期納付税額計 (Grid style)
  d52.rect(50, y - 20, 300, 20, rgb(1, 1, 1)); d52.rect(350, y - 20, 195, 20, rgb(1, 1, 1));
  d52.line(50, y, 545, y); d52.line(50, y - 20, 545, y - 20);
  d52.line(50, y, 50, y - 20); d52.line(350, y, 350, y - 20); d52.line(545, y, 545, y - 20);
  d52.text('当期納付税額計', 60, y - 14, { size: 10 });
  d52.currency(data.beppyo5_2.totalPaid, 535, y - 14, 10);
  y -= 20;

  y -= 10;
  // ヘッダー
  d52.rect(50, y - 20, 190, 20, colors.headerBg);
  d52.rect(240, y - 20, 150, 20, colors.headerBg);
  d52.rect(390, y - 20, 155, 20, colors.headerBg);
  d52.line(50, y, 545, y); d52.line(50, y - 20, 545, y - 20);
  d52.line(50, y, 50, y - 20); d52.line(240, y, 240, y - 20); d52.line(390, y, 390, y - 20); d52.line(545, y, 545, y - 20);

  d52.text('税目', 110, y - 15, { size: 9, font: bold, align: 'center' });
  d52.text('納付日', 315, y - 15, { size: 9, font: bold, align: 'center' });
  d52.text('金額', 460, y - 15, { size: 9, font: bold, align: 'center' });
  y -= 20;

  data.beppyo5_2.items.forEach((item) => {
    d52.rect(50, y - 20, 190, 20, rgb(1, 1, 1));
    d52.rect(240, y - 20, 150, 20, rgb(1, 1, 1));
    d52.rect(390, y - 20, 155, 20, rgb(1, 1, 1));
    d52.line(50, y, 545, y); d52.line(50, y - 20, 545, y - 20);
    d52.line(50, y, 50, y - 20); d52.line(240, y, 240, y - 20); d52.line(390, y, 390, y - 20); d52.line(545, y, 545, y - 20);

    d52.text(item.description, 60, y - 15, { size: 9 });
    d52.text(item.paymentDate, 315, y - 15, { size: 9, align: 'center' });
    d52.currency(item.amount, 535, y - 15, 9);
    y -= 20;
  });

  // 6. 別表二（同族会社等の判定に関する明細書）
  const p2 = pdfDoc.addPage([595.28, 841.89]);
  const d2 = createDrawHelper(p2);
  drawPageHeader(d2, '別表二', '同族会社等の判定に関する明細書', pageHeight, pageWidth, colors, bold);

  y = pageHeight - 100;
  drawSectionBox(d2, '基本情報', y, pageWidth, colors, bold);
  y -= 25;

  // Basic info grid
  d2.rect(50, y - 20, 300, 20, colors.headerBg); d2.rect(350, y - 20, 195, 20, rgb(1, 1, 1));
  d2.line(50, y, 545, y); d2.line(50, y - 20, 545, y - 20);
  d2.line(50, y, 50, y - 20); d2.line(350, y, 350, y - 20); d2.line(545, y, 545, y - 20);
  d2.text('発行済株式総数', 60, y - 14, { size: 10, font: bold });
  d2.currency(data.beppyo2.totalShares, 535, y - 14, 10);
  y -= 20;

  d2.rect(50, y - 20, 300, 20, colors.headerBg); d2.rect(350, y - 20, 195, 20, rgb(1, 1, 1));
  d2.line(50, y, 545, y); d2.line(50, y - 20, 545, y - 20);
  d2.line(50, y, 50, y - 20); d2.line(350, y, 350, y - 20); d2.line(545, y, 545, y - 20);
  d2.text('同族会社判定', 60, y - 14, { size: 10, font: bold });
  d2.text(data.beppyo2.isFamilyCompany ? '該当' : '非該当', 360, y - 14, { size: 10 });
  y -= 40;

  drawSectionBox(d2, '株主一覧', y, pageWidth, colors, bold);
  y -= 25;

  // 株主ヘッダー
  d2.rect(50, y - 20, 190, 20, colors.headerBg);
  d2.rect(240, y - 20, 100, 20, colors.headerBg);
  d2.rect(340, y - 20, 100, 20, colors.headerBg);
  d2.rect(440, y - 20, 105, 20, colors.headerBg);
  d2.line(50, y, 545, y); d2.line(50, y - 20, 545, y - 20);
  d2.line(50, y, 50, y - 20); d2.line(240, y, 240, y - 20); d2.line(340, y, 340, y - 20); d2.line(440, y, 440, y - 20); d2.line(545, y, 545, y - 20);

  d2.text('株主名', 60, y - 15, { size: 9, font: bold });
  d2.text('持株数', 320, y - 15, { size: 9, font: bold, align: 'right' });
  d2.text('割合', 420, y - 15, { size: 9, font: bold, align: 'right' });
  d2.text('関係', 450, y - 15, { size: 9, font: bold });
  y -= 20;

  data.beppyo2.shareholders.forEach((sh) => {
    d2.rect(50, y - 20, 190, 20, rgb(1, 1, 1));
    d2.rect(240, y - 20, 100, 20, rgb(1, 1, 1));
    d2.rect(340, y - 20, 100, 20, rgb(1, 1, 1));
    d2.rect(440, y - 20, 105, 20, rgb(1, 1, 1));
    d2.line(50, y, 545, y); d2.line(50, y - 20, 545, y - 20);
    d2.line(50, y, 50, y - 20); d2.line(240, y, 240, y - 20); d2.line(340, y, 340, y - 20); d2.line(440, y, 440, y - 20); d2.line(545, y, 545, y - 20);

    d2.text(sh.name, 60, y - 15, { size: 9 });
    d2.currency(sh.shares, 330, y - 15, 9);
    const ratio = data.beppyo2.totalShares > 0 ? (sh.shares / data.beppyo2.totalShares * 100).toFixed(1) + '%' : '-';
    d2.text(ratio, 430, y - 15, { size: 9, align: 'right' });
    d2.text(sh.relationship, 450, y - 15, { size: 9 });
    y -= 20;
  });

  // 7. 別表十五（交際費等の損金算入に関する明細書）
  const p15 = pdfDoc.addPage([595.28, 841.89]);
  const d15 = createDrawHelper(p15);
  drawPageHeader(d15, '別表十五', '交際費等の損金算入に関する明細書', pageHeight, pageWidth, colors, bold);

  y = pageHeight - 100;
  drawRow(d15, '1. 交際費等の支出額', data.beppyo15.socialExpenses, y, pageWidth, colors, rowH); y -= rowH;
  drawRow(d15, '2. うち接待飲食費', data.beppyo15.deductibleExpenses, y, pageWidth, colors, rowH); y -= rowH;
  drawRow(d15, '3. 損金算入限度額', data.beppyo15.deductionLimit, y, pageWidth, colors, rowH, true); y -= rowH;
  drawRow(d15, '4. 損金不算入額', data.beppyo15.excessAmount, y, pageWidth, colors, rowH, true); y -= rowH;

  // 7. 別表十六（減価償却資産の償却額の計算に関する明細書）
  const p16 = pdfDoc.addPage([595.28, 841.89]);
  const d16 = createDrawHelper(p16);
  drawPageHeader(d16, '別表十六', '減価償却資産の償却額の計算に関する明細書', pageHeight, pageWidth, colors, bold);

  y = pageHeight - 100;
  drawRow(d16, '当期償却実施額計', data.beppyo16.totalDepreciation, y, pageWidth, colors, rowH); y -= rowH;
  drawRow(d16, '償却限度額計', data.beppyo16.totalAllowable, y, pageWidth, colors, rowH); y -= rowH;
  drawRow(d16, '償却超過額', data.beppyo16.excessAmount, y, pageWidth, colors, rowH, true); y -= rowH;

  y -= 20;
  d16.rect(50, y - 20, pageWidth - 100, 20, colors.headerBg);
  d16.text('資産名', 60, y - 15, { size: 9, font: bold });
  d16.text('取得価額', 250, y - 15, { size: 9, font: bold });
  d16.text('期末帳簿価額', 380, y - 15, { size: 9, font: bold });
  y -= 20;

  data.beppyo16.assets.forEach((asset) => {
    d16.line(50, y, pageWidth - 50, y);
    d16.text(asset.name, 60, y - 15, { size: 9 });
    d16.currency(asset.acquisitionCost, 320, y - 15, 9);
    d16.currency(asset.bookValueEnd, 450, y - 15, 9);
    y -= 20;
  });

  return pdfDoc.save();
}

/**
 * データの妥当性チェック
 */
function validateData(data: CorporateTaxInputData): string[] {
  const errors: string[] = [];

  // 基本的な型と範囲のチェック (Pythonのサンプルに基づき実装)
  if (typeof data.beppyo4.taxableIncome !== 'number') errors.push('所得金額が数値ではありません');
  if (data.beppyo1.corporateTaxAmount < 0) errors.push('法人税額が負数です');
  if (data.beppyo4.taxableIncome > 999999999999) errors.push('所得金額が桁あふれしています(上限12桁)');

  return errors;
}



/**
 * 個別の公式様式PDFを生成する
 * 
 * For Beppyo1: Uses digit-box placement (individual digit boxes)
 * For others: Uses 3-tier approach (AcroForm → Anchor → Fixed Coordinates)
 */
export async function fillSingleOfficialCorporateTaxPDF(data: CorporateTaxInputData, templateType: string): Promise<Uint8Array> {
  const pureType = templateType.replace('_debug', '');
  const isDebugMode = templateType.includes('_debug');

  // Beppyo1, 4, 2, 5, 15, 16, business_overview use digit-box method
  const digitBoxTemplates = ['beppyo1', 'beppyo4', 'beppyo2', 'beppyo5_1', 'beppyo5_2', 'beppyo15', 'beppyo16', 'business_overview'];
  if (digitBoxTemplates.includes(pureType)) {
    const digitBoxModule = await import('./pdfDigitBoxService');
    const {
      fillBeppyo1WithDigitBoxes,
      fillBeppyo4WithDigitBoxes,
      fillBeppyo2WithDigitBoxes,
      fillBeppyo5_1WithDigitBoxes,
      fillBeppyo5_2WithDigitBoxes,
      fillBeppyo15WithDigitBoxes,
      fillBeppyo16WithDigitBoxes,
      fillBusinessOverviewWithDigitBoxes,
    } = digitBoxModule;
    
    // Use the imported constant or a safe fallback to prevent crashes
    const defaultCalibration: {
        globalShiftX: number;
        globalShiftY: number;
        digitCenterOffsetX: number;
        digitCenterOffsetY: number;
    } = (digitBoxModule as any).DEFAULT_CALIBRATION || {
        globalShiftX: 0,
        globalShiftY: 0,
        digitCenterOffsetX: -5,
        digitCenterOffsetY: 2
    };

    const templates: { [key: string]: string } = {
      'beppyo1': '/templates/beppyo1_official.pdf',
      'beppyo4': '/templates/beppyo4_official.pdf',
      'beppyo2': '/templates/beppyo2_official_v2.pdf',
      'beppyo5_1': '/templates/beppyo5_1_official.pdf',
      'beppyo5_2': '/templates/beppyo5_2_official.pdf',
      'beppyo15': '/templates/beppyo15_official.pdf',
      'beppyo16': '/templates/beppyo16_official.pdf',
      'business_overview': '/templates/hojin_gaikyo_v2.pdf',
    };

    const url = templates[pureType];
    let bytes: Uint8Array;
    try {
      const resp = await fetch(`${url}?t=${Date.now()}`);
      if (!resp.ok) throw new Error(`Template not found: ${url}`);
      bytes = new Uint8Array(await resp.arrayBuffer());
    } catch (e) {
      console.warn(`[${pureType}] Official template not found at ${url}, generating basic version from scratch.`);
      // If template is missing, generate a blank-ish PDF or just report failure gracefully
      // For now, let's try to load a "safe" template or create a new one
      const newPdfDoc = await PDFDocument.create();
      newPdfDoc.addPage([595.28, 841.89]);
      bytes = await newPdfDoc.save();
    }

    const calibration = {
      globalShiftX: data.calibration?.globalShiftX || defaultCalibration.globalShiftX,
      globalShiftY: data.calibration?.globalShiftY || defaultCalibration.globalShiftY,
      digitCenterOffsetX: data.calibration?.digitCenterOffsetX ?? defaultCalibration.digitCenterOffsetX,
      digitCenterOffsetY: data.calibration?.digitCenterOffsetY ?? defaultCalibration.digitCenterOffsetY,
    };

    let result;
    if (pureType === 'beppyo1') {
      result = await fillBeppyo1WithDigitBoxes(bytes, data, calibration, isDebugMode);
    } else if (pureType === 'beppyo4') {
      result = await fillBeppyo4WithDigitBoxes(bytes, data, calibration, isDebugMode);
    } else if (pureType === 'beppyo2') {
      result = await fillBeppyo2WithDigitBoxes(bytes, data, calibration, isDebugMode);
    } else if (pureType === 'beppyo5_1') {
      result = await fillBeppyo5_1WithDigitBoxes(bytes, data, calibration, isDebugMode);
    } else if (pureType === 'beppyo5_2') {
      result = await fillBeppyo5_2WithDigitBoxes(bytes, data, calibration, isDebugMode);
    } else if (pureType === 'beppyo15') {
      result = await fillBeppyo15WithDigitBoxes(bytes, data, calibration, isDebugMode);
    } else if (pureType === 'beppyo16') {
      result = await fillBeppyo16WithDigitBoxes(bytes, data, calibration, isDebugMode);
    } else if (pureType === 'business_overview') {
      result = await fillBusinessOverviewWithDigitBoxes(bytes, data, calibration, isDebugMode);
    }

    if (result) {
      console.log(`[${pureType}] Digit-box filling complete:`, result.report);
      return result.pdfBytes;
    }
  }

  // 他の別表は3層アプローチ
  const { fillAcroFormFields, hasAcroFormFields, formatTaxNumber } = await import('./pdfFormFillerService');
  const { fillByTextAnchors } = await import('./pdfAnchorDetector');
  const { getTemplateCoordinates, getFieldMappingsForTemplate } = await import('./pdfTemplateRegistry');

  const report: ValidationReport = {
    timestamp: new Date().toISOString(),
    template: templateType,
    loadSuccess: false,
    hasAcroForm: false,
    passedDataValidation: false,
    mappings: [],
    errors: []
  };

  // 1. データ検証
  const dataErrors = validateData(data);
  if (dataErrors.length > 0) {
    report.errors.push(...dataErrors);
    console.warn('[PDF Validation] Pre-fill check failed:', dataErrors);
  } else {
    report.passedDataValidation = true;
  }

  const templates: { [key: string]: string } = {
    'beppyo1': '/templates/beppyo1_official.pdf',
    'beppyo4': '/templates/beppyo4_official.pdf',
    'beppyo5_1': '/templates/beppyo5_1_official.pdf',
    'beppyo5_2': '/templates/beppyo5_2_official.pdf',
    'beppyo15': '/templates/beppyo15_official.pdf',
    'beppyo16': '/templates/beppyo16_official.pdf',
  };

  const url = templates[pureType];
  if (!url) {
    throw new Error(`Unknown template type: ${pureType}`);
  }

  const bytes = await fetch(`${url}?t=${Date.now()}`).then(r => r.arrayBuffer()).then(ab => new Uint8Array(ab));

  // 2. PDFロード
  let pdfDoc: PDFDocument;
  try {
    pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true, throwOnInvalidObject: false } as any);
    report.loadSuccess = true;
  } catch (e: any) {
    // フォールバック
    if (pureType === 'beppyo1') {
      const fb = await fetch('/templates/beppyo1_official.pdf').then(r => r.arrayBuffer());
      pdfDoc = await PDFDocument.load(new Uint8Array(fb), { ignoreEncryption: true, throwOnInvalidObject: false } as any);
      report.loadSuccess = true;
    } else {
      throw e;
    }
  }

  pdfDoc.registerFontkit(fontkit);
  const { regular } = await loadJapaneseFont(pdfDoc);
  const templatePage = pdfDoc.getPages()[0];

  // ===== 3層アプローチ =====

  console.log(`\n[PDF Filling] Starting 3-tier approach for ${pureType}`);

  // Tier 1: AcroForm フィールド
  let tier1Result = null;
  if (hasAcroFormFields(pdfDoc)) {
    console.log('[Tier 1] AcroForm fields detected, attempting to fill...');
    report.hasAcroForm = true;
    tier1Result = await fillAcroFormFields(pdfDoc, data, pureType);

    if (tier1Result.success && tier1Result.filledFields.length > 0) {
      console.log(`[Tier 1] ✓ SUCCESS: Filled ${tier1Result.filledFields.length} fields via AcroForm`);
      report.mappings.push(...tier1Result.filledFields.map(f => ({
        key: f,
        value: 'filled',
        method: 'AcroForm' as const
      })));

      // AcroFormで成功したら終了
      return pdfDoc.save();
    } else {
      console.log(`[Tier 1] ✗ FAILED: ${tier1Result.errors.join(', ')}`);
      report.errors.push(...tier1Result.errors);
    }
  } else {
    console.log('[Tier 1] No AcroForm fields found, skipping to Tier 2');
  }

  // Tier 2: テキストアンカー
  console.log('[Tier 2] Attempting text anchor-based filling...');
  try {
    const tier2Result = await fillByTextAnchors(templatePage, data, pureType, regular);

    if (tier2Result.success && tier2Result.filledFields.length > 0) {
      console.log(`[Tier 2] ✓ SUCCESS: Filled ${tier2Result.filledFields.length} fields via anchors`);
      report.mappings.push(...tier2Result.filledFields.map(f => ({
        key: f,
        value: 'filled',
        method: 'Anchor' as const
      })));

      return pdfDoc.save();
    } else {
      console.log(`[Tier 2] ✗ FAILED: ${tier2Result.errors.join(', ')}`);
      report.errors.push(...tier2Result.errors);
    }
  } catch (e: any) {
    console.log(`[Tier 2] ✗ ERROR: ${e.message}`);
    report.errors.push(`Tier 2 error: ${e.message}`);
  }

  // Tier 3: 固定座標
  console.log('[Tier 3] Attempting fixed coordinate filling...');
  const templateCoords = getTemplateCoordinates(pureType);

  if (templateCoords) {
    const fieldMappings = getFieldMappingsForTemplate(pureType, data);
    let filledCount = 0;

    for (const [fieldName, value] of fieldMappings.entries()) {
      const coord = templateCoords.fields.get(fieldName);
      if (!coord) {
        report.errors.push(`No coordinates for field: ${fieldName}`);
        continue;
      }

      try {
        const formattedValue = typeof value === 'number' ? formatTaxNumber(value) : String(value);
        const fontSize = 10;

        let xPos = coord.x;
        if (coord.align === 'right') {
          const textWidth = regular.widthOfTextAtSize(formattedValue, fontSize);
          xPos -= textWidth;
        } else if (coord.align === 'center') {
          const textWidth = regular.widthOfTextAtSize(formattedValue, fontSize);
          xPos -= textWidth / 2;
        }

        templatePage.drawText(formattedValue, {
          x: xPos,
          y: coord.y,
          size: fontSize,
          font: regular,
          color: rgb(0, 0, 0.5)
        });

        filledCount++;
        report.mappings.push({
          key: fieldName,
          value: value,
          method: 'FixedCoord' as const,
          coordinate: { x: coord.x, y: coord.y }
        });

        console.log(`[Tier 3] ✓ Filled "${fieldName}" = "${formattedValue}" at (${coord.x}, ${coord.y})`);
      } catch (e: any) {
        report.errors.push(`Failed to fill ${fieldName}: ${e.message}`);
      }
    }

    if (filledCount > 0) {
      console.log(`[Tier 3] ✓ SUCCESS: Filled ${filledCount} fields via fixed coordinates`);
      return pdfDoc.save();
    } else {
      console.log('[Tier 3] ✗ FAILED: No fields filled');
    }
  } else {
    console.log(`[Tier 3] ✗ No template coordinates found for ${pureType}`);
    report.errors.push(`No template coordinates for ${pureType}`);
  }

  // すべて失敗した場合
  console.error('[PDF Filling] All tiers failed!');
  console.table(report.mappings);
  console.error('Errors:', report.errors);

  // 空のPDFでも返す（エラーよりはマシ）
  return pdfDoc.save();
}

/**
 * 複数枚を結合
 */
export async function fillOfficialCorporateTaxPDF(data: CorporateTaxInputData): Promise<{ pdfBytes: Uint8Array, errors: string[], successes: string[] }> {
  const mergedPdf = await PDFDocument.create();
  mergedPdf.registerFontkit(fontkit);
  const types = [
    { type: 'beppyo1', name: '別表一' },
    { type: 'beppyo4', name: '別表四' },
    { type: 'beppyo5_1', name: '別表五一' },
    { type: 'beppyo15', name: '別表十五' },
    { type: 'beppyo16', name: '別表十六' }
  ];
  const errors: string[] = [];
  const successes: string[] = [];

  for (const item of types) {
    try {
      const bytes = await fillSingleOfficialCorporateTaxPDF(data, item.type);
      const doc = await PDFDocument.load(bytes);
      const [page] = await mergedPdf.copyPages(doc, [0]);
      mergedPdf.addPage(page);
      successes.push(item.name);
    } catch (e: any) {
      errors.push(`${item.name}: ${e.message}`);
    }
  }

  if (successes.length === 0) throw new Error(`公式テンプレートの読み込みにすべて失敗しました。\n詳細:\n${errors.join('\n')}`);
  return { pdfBytes: await mergedPdf.save(), errors, successes };
}

// 共通描画関数
function drawPageHeader(d: any, titleInfo: string, subTitle: string, pageHeight: number, pageWidth: number, colors: any, boldFont: any) {
  d.rect(0, pageHeight - 70, pageWidth, 70, colors.primary);
  d.text(titleInfo, 50, pageHeight - 45, { size: 24, font: boldFont, color: rgb(1, 1, 1) });
  d.text(subTitle, 200, pageHeight - 45, { size: 12, color: rgb(0.9, 0.9, 1) });
}

function drawSectionBox(d: any, title: string, y: number, pageWidth: number, colors: any, boldFont: any) {
  d.rect(50, y - 20, pageWidth - 100, 20, colors.secondary);
  d.text(title, 60, y - 15, { size: 10, font: boldFont, color: rgb(1, 1, 1) });
}

function drawRow(d: any, label: string, amount: number, y: number, pageWidth: number, colors: any, height: number, isHighlight = false) {
  if (isHighlight) d.rect(50, y - height, pageWidth - 100, height, colors.highlight);
  d.line(50, y - height, pageWidth - 50, y - height);
  d.text(label, 60, y - height + 6, { size: 10 });
  d.currency(amount, pageWidth - 60, y - height + 6, 10);
  d.line(50, y, 50, y - height);
  d.line(pageWidth - 50, y, pageWidth - 50, y - height);
}
