/**
 * 日本語対応PDF生成サービス
 * 日本語フォント（Noto Sans CJK JP）を埋め込んで日本語テキストを正しく表示
 */

import { PDFDocument, rgb, PDFFont } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

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
  representativeName?: string;
  address?: string;
  corporateNumber?: string;
  capital?: number;
  businessType?: 'individual' | 'corporation';
  tradeName?: string;
  
  // 財務データ
  revenue: number;
  expenses: number;
  netIncome: number;
  expensesByCategory: { category: string; amount: number }[];
  
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
    throw new Error('日本語フォントのロードに失敗しました。public/fonts/にフォントファイルを配置してください。');
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
  
  const colors = {
    primary: rgb(0.4, 0.2, 0.6),
    text: rgb(0.1, 0.1, 0.1),
    muted: rgb(0.4, 0.4, 0.4),
    line: rgb(0.7, 0.7, 0.7),
    highlight: rgb(0.95, 0.95, 1),
    red: rgb(0.8, 0.2, 0.2),
  };
  
  const drawText = (text: string, x: number, y: number, options: { size?: number; font?: PDFFont; color?: typeof colors.text } = {}) => {
    page.drawText(text, {
      x,
      y,
      size: options.size || 10,
      font: options.font || regular,
      color: options.color || colors.text,
    });
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
    page.drawRectangle({ x, y, width: w, height: h, color });
  };
  
  // ヘッダー
  drawRect(0, height - 60, width, 60, colors.primary);
  drawText('法人税申告書', 50, height - 40, { size: 18, font: bold, color: rgb(1, 1, 1) });
  drawText('（参考資料）', 180, height - 40, { size: 12, font: regular, color: rgb(0.9, 0.9, 0.9) });
  
  let y = height - 85;
  
  // 会社情報
  drawText(`会社名: ${data.companyName || '―'}`, 50, y, { size: 12, font: bold });
  y -= 20;
  drawText(`事業年度: ${data.fiscalYear}年度（${getJapaneseYear(data.fiscalYear)}度）`, 50, y, { size: 10 });
  drawText(`作成日: ${new Date().toLocaleDateString('ja-JP')}`, 400, y, { size: 9, color: colors.muted });
  y -= 30;
  
  drawLine(50, y, 545, y, 1);
  y -= 25;
  
  // セクション1: 法人情報
  drawText('第1部　法人情報', 50, y, { size: 12, font: bold, color: colors.primary });
  y -= 25;
  
  const infoRows = [
    ['会社名（商号）', data.companyName || '―'],
    ['代表者氏名', data.representativeName || '―'],
    ['法人番号', data.corporateNumber || '―'],
    ['本店所在地', data.address || '―'],
    ['資本金', data.capital ? `${formatCurrency(data.capital)}円` : '―'],
  ];
  
  infoRows.forEach(([label, value]) => {
    drawLine(50, y - 5, 545, y - 5);
    drawText(label, 60, y);
    drawText(value, 200, y);
    y -= 20;
  });
  y -= 15;
  
  // セクション2: 損益
  drawText('第2部　損益の計算', 50, y, { size: 12, font: bold, color: colors.primary });
  y -= 25;
  
  drawRect(50, y - 5, 495, 20, colors.highlight);
  drawLine(50, y - 5, 545, y - 5);
  drawText('売上高', 60, y);
  drawText(`${formatCurrency(data.revenue)}円`, 450, y);
  y -= 20;
  
  drawLine(50, y - 5, 545, y - 5);
  drawText('売上原価・経費合計', 60, y);
  drawText(`${formatCurrency(data.expenses)}円`, 450, y);
  y -= 20;
  
  drawRect(50, y - 5, 495, 20, rgb(0.95, 1, 0.95));
  drawLine(50, y - 5, 545, y - 5);
  drawText('当期純利益', 60, y, { font: bold });
  drawText(`${formatCurrency(data.netIncome)}円`, 450, y, { font: bold });
  y -= 35;
  
  // セクション3: 税額計算
  drawText('第3部　税額の計算', 50, y, { size: 12, font: bold, color: colors.primary });
  y -= 25;
  
  const taxableIncome = data.taxableIncome;
  const corporateTaxRate = taxableIncome <= 8000000 ? 0.15 : 0.232;
  const corporateTax = Math.floor(taxableIncome * corporateTaxRate);
  const localCorporateTax = Math.floor(corporateTax * 0.103);
  const businessTax = Math.floor(taxableIncome * 0.07);
  const totalTax = corporateTax + localCorporateTax + businessTax;
  
  const taxRows = [
    ['課税所得金額', `${formatCurrency(taxableIncome)}円`],
    [`法人税額（税率${(corporateTaxRate * 100).toFixed(1)}%）`, `${formatCurrency(corporateTax)}円`],
    ['地方法人税（10.3%）', `${formatCurrency(localCorporateTax)}円`],
    ['事業税（概算7%）', `${formatCurrency(businessTax)}円`],
  ];
  
  taxRows.forEach(([label, value]) => {
    drawLine(50, y - 5, 545, y - 5);
    drawText(label, 60, y);
    drawText(value, 450, y);
    y -= 20;
  });
  
  // 合計
  drawRect(50, y - 8, 495, 28, rgb(1, 0.95, 0.95));
  drawLine(50, y - 8, 545, y - 8, 1);
  drawLine(50, y + 20, 545, y + 20, 1);
  drawText('税額合計（概算）', 60, y + 3, { font: bold });
  drawText(`${formatCurrency(totalTax)}円`, 450, y + 3, { font: bold, color: colors.red });
  
  // フッター
  drawLine(50, 60, 545, 60);
  drawText('※ この書類はAinanceで作成した参考資料です。', 50, 45, { size: 8, color: colors.muted });
  drawText('※ 正式な申告には税理士への相談またはe-Taxをご利用ください。', 50, 33, { size: 8, color: colors.muted });
  
  return pdfDoc.save();
}

/**
 * 決算報告書（損益計算書・貸借対照表）PDFを生成（日本語）
 */
export async function generateFinancialStatementPDF(data: JpTaxFormData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  
  // ===== ページ1: 損益計算書 =====
  const page1 = pdfDoc.addPage([595.28, 841.89]);
  const { regular, bold } = await loadJapaneseFont(pdfDoc);
  const { width, height } = page1.getSize();
  
  const colors = {
    primary: rgb(0.4, 0.2, 0.6),
    text: rgb(0.1, 0.1, 0.1),
    muted: rgb(0.4, 0.4, 0.4),
    line: rgb(0.5, 0.5, 0.5),
    highlight: rgb(0.95, 0.95, 1),
    green: rgb(0.2, 0.6, 0.3),
    red: rgb(0.8, 0.2, 0.2),
  };
  
  // ページ1ヘルパー
  const draw1 = {
    text: (text: string, x: number, y: number, options: { size?: number; font?: PDFFont; color?: typeof colors.text } = {}) => {
      page1.drawText(text, { x, y, size: options.size || 10, font: options.font || regular, color: options.color || colors.text });
    },
    line: (x1: number, y1: number, x2: number, y2: number, thickness = 0.5) => {
      page1.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, thickness, color: colors.line });
    },
    rect: (x: number, y: number, w: number, h: number, color: typeof colors.highlight) => {
      page1.drawRectangle({ x, y, width: w, height: h, color });
    },
  };
  
  // P/L ヘッダー
  draw1.rect(0, height - 60, width, 60, colors.primary);
  draw1.text('損 益 計 算 書', 220, height - 40, { size: 20, font: bold, color: rgb(1, 1, 1) });
  
  let y = height - 85;
  draw1.text(`${data.companyName || '会社名'}`, 50, y, { size: 12, font: bold });
  draw1.text(`${data.fiscalYear}年度（${getJapaneseYear(data.fiscalYear)}度）`, 350, y, { size: 10 });
  y -= 15;
  draw1.text(`自　${data.fiscalYear}年4月1日　至　${data.fiscalYear + 1}年3月31日`, 350, y, { size: 9, color: colors.muted });
  y -= 20;
  
  draw1.line(50, y, 545, y, 1);
  y -= 5;
  
  // テーブルヘッダー
  draw1.rect(50, y - 18, 495, 18, rgb(0.9, 0.9, 0.9));
  draw1.line(50, y, 545, y);
  draw1.line(50, y - 18, 545, y - 18);
  draw1.text('勘定科目', 60, y - 13, { font: bold, size: 9 });
  draw1.text('金額（円）', 470, y - 13, { font: bold, size: 9 });
  y -= 23;
  
  // 売上高
  draw1.rect(50, y - 15, 495, 15, colors.highlight);
  draw1.line(50, y - 15, 545, y - 15);
  draw1.text('【売上高】', 55, y - 11, { font: bold, size: 10 });
  y -= 18;
  
  draw1.line(50, y - 15, 545, y - 15);
  draw1.text('　売上高', 60, y - 11);
  draw1.text(formatCurrency(data.revenue), 450, y - 11);
  y -= 18;
  
  draw1.rect(50, y - 15, 495, 15, rgb(0.98, 0.98, 0.98));
  draw1.line(50, y - 15, 545, y - 15);
  draw1.text('売上高合計', 70, y - 11, { font: bold });
  draw1.text(formatCurrency(data.revenue), 450, y - 11, { font: bold });
  y -= 23;
  
  // 経費
  draw1.rect(50, y - 15, 495, 15, colors.highlight);
  draw1.line(50, y - 15, 545, y - 15);
  draw1.text('【販売費及び一般管理費】', 55, y - 11, { font: bold, size: 10 });
  y -= 18;
  
  // 経費内訳
  let totalExpenses = 0;
  data.expensesByCategory.forEach((exp, index) => {
    const category = EXPENSE_CATEGORIES_JP[exp.category] || exp.category || '雑費';
    const isAlt = index % 2 === 0;
    if (isAlt) {
      draw1.rect(50, y - 15, 495, 15, rgb(0.98, 0.98, 0.98));
    }
    draw1.line(50, y - 15, 545, y - 15);
    draw1.text(`　${category}`, 60, y - 11, { size: 9 });
    draw1.text(formatCurrency(exp.amount), 450, y - 11, { size: 9 });
    totalExpenses += exp.amount;
    y -= 15;
    
    if (y < 150) return; // ページ下限
  });
  
  draw1.rect(50, y - 15, 495, 15, rgb(0.95, 0.95, 0.95));
  draw1.line(50, y - 15, 545, y - 15);
  draw1.text('販管費合計', 70, y - 11, { font: bold });
  draw1.text(formatCurrency(data.expenses), 450, y - 11, { font: bold });
  y -= 25;
  
  // 営業利益
  const operatingIncome = data.revenue - data.expenses;
  draw1.rect(50, y - 20, 495, 20, rgb(0.95, 1, 0.95));
  draw1.line(50, y - 20, 545, y - 20, 1);
  draw1.line(50, y, 545, y, 1);
  draw1.text('営業利益', 60, y - 14, { font: bold, size: 11 });
  draw1.text(formatCurrency(operatingIncome), 440, y - 14, { font: bold, size: 11, color: operatingIncome >= 0 ? colors.green : colors.red });
  y -= 35;
  
  // 当期純利益
  draw1.rect(50, y - 22, 495, 22, rgb(0.9, 0.95, 1));
  draw1.line(50, y - 22, 545, y - 22, 1.5);
  draw1.line(50, y, 545, y, 1.5);
  draw1.text('当期純利益', 60, y - 15, { font: bold, size: 12 });
  draw1.text(`${formatCurrency(data.netIncome)}円`, 430, y - 15, { font: bold, size: 12, color: data.netIncome >= 0 ? colors.green : colors.red });
  
  // P/Lフッター
  draw1.line(50, 55, 545, 55);
  draw1.text('※ この書類はAinanceで作成した参考資料です。', 50, 40, { size: 8, color: colors.muted });
  
  // ===== ページ2: 貸借対照表 =====
  const page2 = pdfDoc.addPage([595.28, 841.89]);
  
  const draw2 = {
    text: (text: string, x: number, y: number, options: { size?: number; font?: PDFFont; color?: typeof colors.text } = {}) => {
      page2.drawText(text, { x, y, size: options.size || 10, font: options.font || regular, color: options.color || colors.text });
    },
    line: (x1: number, y1: number, x2: number, y2: number, thickness = 0.5) => {
      page2.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, thickness, color: colors.line });
    },
    rect: (x: number, y: number, w: number, h: number, color: typeof colors.highlight) => {
      page2.drawRectangle({ x, y, width: w, height: h, color });
    },
  };
  
  // B/S ヘッダー
  draw2.rect(0, height - 60, width, 60, colors.primary);
  draw2.text('貸 借 対 照 表', 220, height - 40, { size: 20, font: bold, color: rgb(1, 1, 1) });
  
  y = height - 85;
  draw2.text(`${data.companyName || '会社名'}`, 50, y, { size: 12, font: bold });
  draw2.text(`${data.fiscalYear + 1}年3月31日現在`, 400, y, { size: 10 });
  y -= 25;
  
  draw2.line(50, y, 545, y, 1);
  y -= 10;
  
  // 簡易的なB/S（実際の資産・負債データがないため概算）
  const estimatedAssets = Math.floor(data.revenue * 0.5);
  const estimatedCash = Math.floor(data.revenue * 0.2);
  const estimatedReceivables = Math.floor(data.revenue * 0.15);
  const estimatedFixedAssets = Math.floor(data.revenue * 0.15);
  const estimatedLiabilities = Math.floor(data.expenses * 0.3);
  const estimatedPayables = Math.floor(data.expenses * 0.2);
  const estimatedLoans = Math.floor(data.expenses * 0.1);
  const estimatedEquity = estimatedAssets - estimatedLiabilities;
  const estimatedCapital = data.capital || 1000000;
  const estimatedRetainedEarnings = estimatedEquity - estimatedCapital + data.netIncome;
  
  // 左側：資産の部
  const leftX = 50;
  const rightX = 300;
  const colWidth = 240;
  
  // 資産の部ヘッダー
  draw2.rect(leftX, y - 18, colWidth, 18, rgb(0.85, 0.9, 0.95));
  draw2.line(leftX, y, leftX + colWidth, y);
  draw2.line(leftX, y - 18, leftX + colWidth, y - 18);
  draw2.text('【資産の部】', leftX + 5, y - 13, { font: bold, size: 10 });
  
  // 負債・純資産の部ヘッダー
  draw2.rect(rightX, y - 18, colWidth + 5, 18, rgb(0.95, 0.9, 0.85));
  draw2.line(rightX, y, rightX + colWidth + 5, y);
  draw2.line(rightX, y - 18, rightX + colWidth + 5, y - 18);
  draw2.text('【負債・純資産の部】', rightX + 5, y - 13, { font: bold, size: 10 });
  
  y -= 23;
  
  // 資産項目
  const assetItems = [
    { label: '流動資産', items: [
      { name: '現金及び預金', value: estimatedCash },
      { name: '売掛金', value: estimatedReceivables },
    ]},
    { label: '固定資産', items: [
      { name: '有形固定資産', value: estimatedFixedAssets },
    ]},
  ];
  
  // 負債・純資産項目
  const liabilityItems = [
    { label: '流動負債', items: [
      { name: '買掛金', value: estimatedPayables },
      { name: '短期借入金', value: estimatedLoans },
    ]},
    { label: '純資産', items: [
      { name: '資本金', value: estimatedCapital },
      { name: '繰越利益剰余金', value: estimatedRetainedEarnings },
    ]},
  ];
  
  let assetY = y;
  let liabilityY = y;
  
  // 資産を描画
  assetItems.forEach(section => {
    draw2.rect(leftX, assetY - 15, colWidth, 15, colors.highlight);
    draw2.line(leftX, assetY - 15, leftX + colWidth, assetY - 15);
    draw2.text(section.label, leftX + 5, assetY - 11, { font: bold, size: 9 });
    assetY -= 18;
    
    section.items.forEach(item => {
      draw2.line(leftX, assetY - 15, leftX + colWidth, assetY - 15);
      draw2.text(`　${item.name}`, leftX + 5, assetY - 11, { size: 9 });
      draw2.text(formatCurrency(item.value), leftX + 160, assetY - 11, { size: 9 });
      assetY -= 15;
    });
  });
  
  // 資産合計
  draw2.rect(leftX, assetY - 18, colWidth, 18, rgb(0.9, 0.95, 0.9));
  draw2.line(leftX, assetY - 18, leftX + colWidth, assetY - 18, 1);
  draw2.text('資産合計', leftX + 5, assetY - 13, { font: bold, size: 10 });
  draw2.text(formatCurrency(estimatedAssets), leftX + 160, assetY - 13, { font: bold, size: 10 });
  
  // 負債・純資産を描画
  liabilityItems.forEach(section => {
    draw2.rect(rightX, liabilityY - 15, colWidth + 5, 15, colors.highlight);
    draw2.line(rightX, liabilityY - 15, rightX + colWidth + 5, liabilityY - 15);
    draw2.text(section.label, rightX + 5, liabilityY - 11, { font: bold, size: 9 });
    liabilityY -= 18;
    
    section.items.forEach(item => {
      draw2.line(rightX, liabilityY - 15, rightX + colWidth + 5, liabilityY - 15);
      draw2.text(`　${item.name}`, rightX + 5, liabilityY - 11, { size: 9 });
      draw2.text(formatCurrency(item.value), rightX + 165, liabilityY - 11, { size: 9 });
      liabilityY -= 15;
    });
  });
  
  // 負債・純資産合計
  draw2.rect(rightX, liabilityY - 18, colWidth + 5, 18, rgb(0.9, 0.95, 0.9));
  draw2.line(rightX, liabilityY - 18, rightX + colWidth + 5, liabilityY - 18, 1);
  draw2.text('負債・純資産合計', rightX + 5, liabilityY - 13, { font: bold, size: 10 });
  draw2.text(formatCurrency(estimatedAssets), rightX + 165, liabilityY - 13, { font: bold, size: 10 });
  
  // B/Sフッター
  draw2.line(50, 80, 545, 80);
  draw2.text('※ この貸借対照表は売上・経費データから概算で作成しています。', 50, 65, { size: 8, color: colors.muted });
  draw2.text('※ 正確な財務諸表の作成には、実際の資産・負債データが必要です。', 50, 53, { size: 8, color: colors.muted });
  
  return pdfDoc.save();
}

/**
 * 確定申告書B PDFを生成（日本語・個人事業主用）
 */
export async function generateTaxReturnBPDF(data: JpTaxFormData): Promise<Uint8Array> {
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
    red: rgb(0.8, 0.2, 0.2),
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
  drawText('確 定 申 告 書 B', 200, height - 40, { size: 20, font: bold, color: rgb(1, 1, 1) });
  
  let y = height - 85;
  drawText(`${getJapaneseYear(data.fiscalYear)}分の所得税及び復興特別所得税の申告書`, 50, y, { size: 11, font: bold });
  drawText(`作成日: ${new Date().toLocaleDateString('ja-JP')}`, 400, y, { size: 9, color: colors.muted });
  y -= 30;
  
  drawLine(50, y, 545, y, 1);
  y -= 25;
  
  // 収入金額等
  drawText('第1部　収入金額等', 50, y, { size: 12, font: bold, color: colors.primary });
  y -= 25;
  
  drawRect(50, y - 5, 495, 20, colors.highlight);
  drawLine(50, y - 5, 545, y - 5);
  drawText('事業所得（営業等）　ア', 60, y);
  drawText(`${formatCurrency(data.revenue)}円`, 450, y);
  y -= 30;
  
  // 所得金額等
  drawText('第2部　所得金額等', 50, y, { size: 12, font: bold, color: colors.primary });
  y -= 25;
  
  drawLine(50, y - 5, 545, y - 5);
  drawText('事業所得　①', 60, y);
  drawText(`${formatCurrency(data.netIncome)}円`, 450, y);
  y -= 20;
  
  drawRect(50, y - 5, 495, 20, colors.highlight);
  drawLine(50, y - 5, 545, y - 5);
  drawText('合計（総所得金額）　⑫', 60, y, { font: bold });
  drawText(`${formatCurrency(data.netIncome)}円`, 450, y, { font: bold });
  y -= 35;
  
  // 所得控除
  drawText('第3部　所得から差し引かれる金額', 50, y, { size: 12, font: bold, color: colors.primary });
  y -= 25;
  
  let totalDeductions = 0;
  
  if (data.deductions?.basic) {
    drawLine(50, y - 5, 545, y - 5);
    drawText('基礎控除　㉔', 60, y);
    drawText(`${formatCurrency(data.deductions.basic)}円`, 450, y);
    totalDeductions += data.deductions.basic;
    y -= 20;
  }
  
  if (data.deductions?.blueReturn) {
    drawLine(50, y - 5, 545, y - 5);
    drawText('青色申告特別控除', 60, y);
    drawText(`${formatCurrency(data.deductions.blueReturn)}円`, 450, y);
    totalDeductions += data.deductions.blueReturn;
    y -= 20;
  }
  
  if (data.deductions?.socialInsurance) {
    drawLine(50, y - 5, 545, y - 5);
    drawText('社会保険料控除　⑬', 60, y);
    drawText(`${formatCurrency(data.deductions.socialInsurance)}円`, 450, y);
    totalDeductions += data.deductions.socialInsurance;
    y -= 20;
  }
  
  drawRect(50, y - 5, 495, 20, colors.highlight);
  drawLine(50, y - 5, 545, y - 5);
  drawText('所得控除合計　㉕', 60, y, { font: bold });
  drawText(`${formatCurrency(totalDeductions)}円`, 450, y, { font: bold });
  y -= 35;
  
  // 税額計算
  drawText('第4部　税額の計算', 50, y, { size: 12, font: bold, color: colors.primary });
  y -= 25;
  
  drawLine(50, y - 5, 545, y - 5);
  drawText('課税される所得金額　㉖', 60, y);
  drawText(`${formatCurrency(data.taxableIncome)}円`, 450, y);
  y -= 25;
  
  // 所得税額
  drawRect(50, y - 8, 495, 28, rgb(1, 0.95, 0.95));
  drawLine(50, y - 8, 545, y - 8, 1);
  drawLine(50, y + 20, 545, y + 20, 1);
  drawText('所得税額（概算）　㉗', 60, y + 3, { font: bold, size: 11 });
  drawText(`${formatCurrency(data.estimatedTax)}円`, 440, y + 3, { font: bold, size: 11, color: colors.red });
  
  // フッター
  drawLine(50, 60, 545, 60);
  drawText('※ この書類はAinanceで作成した参考資料です。', 50, 45, { size: 8, color: colors.muted });
  drawText('※ 正式な申告には国税庁「確定申告書等作成コーナー」をご利用ください。', 50, 33, { size: 8, color: colors.muted });
  
  return pdfDoc.save();
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
