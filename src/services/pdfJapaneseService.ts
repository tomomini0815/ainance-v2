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
 * 決算報告書（財務三表：損益計算書・貸借対照表・キャッシュフロー計算書）PDFを生成（日本語・1枚にまとめ）
 */
export async function generateFinancialStatementPDF(data: JpTaxFormData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { regular, bold } = await loadJapaneseFont(pdfDoc);
  const { width, height } = page.getSize();
  
  const colors = {
    primary: rgb(0.4, 0.2, 0.6),
    secondary: rgb(0.2, 0.4, 0.6),
    text: rgb(0.1, 0.1, 0.1),
    muted: rgb(0.4, 0.4, 0.4),
    line: rgb(0.5, 0.5, 0.5),
    highlight: rgb(0.95, 0.95, 1),
    green: rgb(0.2, 0.6, 0.3),
    red: rgb(0.8, 0.2, 0.2),
    lightGreen: rgb(0.9, 1, 0.9),
    lightRed: rgb(1, 0.95, 0.95),
    lightBlue: rgb(0.9, 0.95, 1),
  };
  
  const draw = {
    text: (text: string, x: number, y: number, options: { size?: number; font?: PDFFont; color?: typeof colors.text } = {}) => {
      page.drawText(text, { x, y, size: options.size || 8, font: options.font || regular, color: options.color || colors.text });
    },
    line: (x1: number, y1: number, x2: number, y2: number, thickness = 0.5) => {
      page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, thickness, color: colors.line });
    },
    rect: (x: number, y: number, w: number, h: number, color: typeof colors.highlight) => {
      page.drawRectangle({ x, y, width: w, height: h, color });
    },
  };
  
  // ===== ヘッダー =====
  draw.rect(0, height - 45, width, 45, colors.primary);
  draw.text('決 算 報 告 書（財務三表）', 180, height - 30, { size: 16, font: bold, color: rgb(1, 1, 1) });
  
  let y = height - 60;
  draw.text(`${data.companyName || '会社名'}`, 50, y, { size: 10, font: bold });
  draw.text(`${data.fiscalYear}年度（${getJapaneseYear(data.fiscalYear)}度）`, 300, y, { size: 9 });
  draw.text(`作成日: ${new Date().toLocaleDateString('ja-JP')}`, 450, y, { size: 7, color: colors.muted });
  y -= 15;
  draw.line(50, y, 545, y, 1);
  y -= 10;
  
  // ===== 計算用データ =====
  const operatingIncome = data.revenue - data.expenses;
  // 概算B/Sデータ
  const estimatedCash = Math.floor(data.revenue * 0.2);
  const estimatedReceivables = Math.floor(data.revenue * 0.15);
  const estimatedInventory = Math.floor(data.revenue * 0.1);
  const estimatedFixedAssets = Math.floor(data.revenue * 0.2);
  const totalAssets = estimatedCash + estimatedReceivables + estimatedInventory + estimatedFixedAssets;
  const estimatedPayables = Math.floor(data.expenses * 0.2);
  const estimatedLoans = Math.floor(data.expenses * 0.15);
  const totalLiabilities = estimatedPayables + estimatedLoans;
  const estimatedCapital = data.capital || 1000000;
  const retainedEarnings = totalAssets - totalLiabilities - estimatedCapital;
  // 概算C/Fデータ
  const operatingCF = data.netIncome + Math.floor(data.expenses * 0.1); // 減価償却費を加算
  const investingCF = -Math.floor(data.revenue * 0.05); // 設備投資
  const financingCF = -Math.floor(estimatedLoans * 0.1); // 借入返済
  const netCashChange = operatingCF + investingCF + financingCF;
  
  // ===== セクション1: 損益計算書 =====
  const section1Top = y;
  draw.rect(50, y - 12, 200, 12, colors.secondary);
  draw.text('損益計算書（P/L）', 55, y - 9, { size: 9, font: bold, color: rgb(1, 1, 1) });
  y -= 18;
  
  // P/L項目（コンパクト）
  const plItems = [
    { label: '売上高', value: data.revenue, highlight: true },
    { label: '売上原価', value: Math.floor(data.expenses * 0.4), highlight: false },
    { label: '売上総利益', value: data.revenue - Math.floor(data.expenses * 0.4), highlight: false },
    { label: '販売費及び一般管理費', value: Math.floor(data.expenses * 0.6), highlight: false },
    { label: '営業利益', value: operatingIncome, highlight: true, color: operatingIncome >= 0 ? colors.green : colors.red },
    { label: '営業外収益', value: Math.floor(data.revenue * 0.01), highlight: false },
    { label: '営業外費用', value: Math.floor(data.expenses * 0.02), highlight: false },
    { label: '経常利益', value: operatingIncome + Math.floor(data.revenue * 0.01) - Math.floor(data.expenses * 0.02), highlight: false },
    { label: '当期純利益', value: data.netIncome, highlight: true, bold: true, color: data.netIncome >= 0 ? colors.green : colors.red },
  ];
  
  plItems.forEach(item => {
    if (item.highlight) {
      draw.rect(50, y - 11, 200, 11, item.bold ? colors.lightGreen : colors.highlight);
    }
    draw.line(50, y - 11, 250, y - 11);
    draw.text(item.label, 55, y - 8, { size: 7, font: item.bold ? bold : regular });
    draw.text(`${formatCurrency(item.value)}`, 190, y - 8, { size: 7, font: item.bold ? bold : regular, color: item.color || colors.text });
    y -= 11;
  });
  
  // ===== セクション2: 貸借対照表 =====
  y = section1Top;
  const bsX = 265;
  draw.rect(bsX, y - 12, 280, 12, colors.secondary);
  draw.text('貸借対照表（B/S）', bsX + 5, y - 9, { size: 9, font: bold, color: rgb(1, 1, 1) });
  y -= 18;
  
  // B/S 左右分割
  const leftColX = bsX;
  const rightColX = bsX + 140;
  const colWidth = 135;
  
  // 資産ヘッダー
  draw.rect(leftColX, y - 10, colWidth, 10, rgb(0.85, 0.9, 0.95));
  draw.text('【資産の部】', leftColX + 3, y - 8, { size: 7, font: bold });
  // 負債・純資産ヘッダー
  draw.rect(rightColX, y - 10, colWidth + 5, 10, rgb(0.95, 0.9, 0.85));
  draw.text('【負債・純資産の部】', rightColX + 3, y - 8, { size: 7, font: bold });
  y -= 12;
  
  // 資産項目
  const assetItems = [
    { label: '流動資産', isHeader: true },
    { label: '　現金及び預金', value: estimatedCash },
    { label: '　売掛金', value: estimatedReceivables },
    { label: '　棚卸資産', value: estimatedInventory },
    { label: '固定資産', isHeader: true },
    { label: '　有形固定資産', value: estimatedFixedAssets },
    { label: '資産合計', value: totalAssets, isTotal: true },
  ];
  
  // 負債・純資産項目
  const liabilityItems = [
    { label: '流動負債', isHeader: true },
    { label: '　買掛金', value: estimatedPayables },
    { label: '　短期借入金', value: estimatedLoans },
    { label: '純資産の部', isHeader: true },
    { label: '　資本金', value: estimatedCapital },
    { label: '　繰越利益剰余金', value: retainedEarnings },
    { label: '負債・純資産合計', value: totalAssets, isTotal: true },
  ];
  
  let assetY = y;
  let liabilityY = y;
  
  assetItems.forEach(item => {
    if (item.isTotal) {
      draw.rect(leftColX, assetY - 10, colWidth, 10, colors.lightGreen);
    } else if (item.isHeader) {
      draw.rect(leftColX, assetY - 10, colWidth, 10, colors.highlight);
    }
    draw.line(leftColX, assetY - 10, leftColX + colWidth, assetY - 10);
    draw.text(item.label, leftColX + 3, assetY - 8, { size: 6, font: item.isHeader || item.isTotal ? bold : regular });
    if (item.value !== undefined) {
      draw.text(formatCurrency(item.value), leftColX + 85, assetY - 8, { size: 6, font: item.isTotal ? bold : regular });
    }
    assetY -= 10;
  });
  
  liabilityItems.forEach(item => {
    if (item.isTotal) {
      draw.rect(rightColX, liabilityY - 10, colWidth + 5, 10, colors.lightGreen);
    } else if (item.isHeader) {
      draw.rect(rightColX, liabilityY - 10, colWidth + 5, 10, colors.highlight);
    }
    draw.line(rightColX, liabilityY - 10, rightColX + colWidth + 5, liabilityY - 10);
    draw.text(item.label, rightColX + 3, liabilityY - 8, { size: 6, font: item.isHeader || item.isTotal ? bold : regular });
    if (item.value !== undefined) {
      draw.text(formatCurrency(item.value), rightColX + 90, liabilityY - 8, { size: 6, font: item.isTotal ? bold : regular });
    }
    liabilityY -= 10;
  });
  
  // ===== セクション3: キャッシュフロー計算書 =====
  y = Math.min(assetY, liabilityY) - 15;
  draw.rect(50, y - 12, width - 100, 12, colors.secondary);
  draw.text('キャッシュ・フロー計算書（C/F）', 55, y - 9, { size: 9, font: bold, color: rgb(1, 1, 1) });
  y -= 18;
  
  // C/F 3列レイアウト
  const cfColWidth = 160;
  const cfItems = [
    {
      title: '営業活動によるCF',
      items: [
        { label: '税引前当期純利益', value: data.netIncome },
        { label: '減価償却費', value: Math.floor(data.expenses * 0.1) },
        { label: '売上債権の増減', value: -Math.floor(estimatedReceivables * 0.1) },
        { label: '仕入債務の増減', value: Math.floor(estimatedPayables * 0.1) },
      ],
      total: operatingCF,
      color: operatingCF >= 0 ? colors.green : colors.red,
    },
    {
      title: '投資活動によるCF',
      items: [
        { label: '固定資産の取得', value: investingCF },
      ],
      total: investingCF,
      color: investingCF >= 0 ? colors.green : colors.red,
    },
    {
      title: '財務活動によるCF',
      items: [
        { label: '借入金の返済', value: financingCF },
      ],
      total: financingCF,
      color: financingCF >= 0 ? colors.green : colors.red,
    },
  ];
  
  cfItems.forEach((section, idx) => {
    const colX = 50 + idx * cfColWidth + idx * 10;
    let cfY = y;
    
    // セクションヘッダー
    draw.rect(colX, cfY - 10, cfColWidth, 10, colors.highlight);
    draw.line(colX, cfY - 10, colX + cfColWidth, cfY - 10);
    draw.text(section.title, colX + 3, cfY - 8, { size: 7, font: bold });
    cfY -= 12;
    
    // 項目
    section.items.forEach(item => {
      draw.line(colX, cfY - 9, colX + cfColWidth, cfY - 9);
      draw.text(item.label, colX + 3, cfY - 7, { size: 6 });
      draw.text(formatCurrency(item.value), colX + 105, cfY - 7, { size: 6 });
      cfY -= 9;
    });
    
    // 小計
    draw.rect(colX, cfY - 10, cfColWidth, 10, colors.lightBlue);
    draw.line(colX, cfY - 10, colX + cfColWidth, cfY - 10, 1);
    draw.text('小計', colX + 3, cfY - 8, { size: 7, font: bold });
    draw.text(formatCurrency(section.total), colX + 105, cfY - 8, { size: 7, font: bold, color: section.color });
  });
  
  // 現金増減合計
  y = y - 60;
  draw.rect(50, y - 14, width - 100, 14, colors.lightGreen);
  draw.line(50, y - 14, 545, y - 14, 1);
  draw.line(50, y, 545, y, 1);
  draw.text('現金及び現金同等物の増減額', 55, y - 10, { size: 9, font: bold });
  draw.text(`${formatCurrency(netCashChange)}円`, 430, y - 10, { size: 9, font: bold, color: netCashChange >= 0 ? colors.green : colors.red });
  
  // 期末残高
  y -= 18;
  draw.line(50, y - 5, 545, y - 5);
  draw.text('現金及び現金同等物の期末残高', 55, y - 2, { size: 8 });
  draw.text(`${formatCurrency(estimatedCash + netCashChange)}円`, 430, y - 2, { size: 8, font: bold });
  
  // ===== フッター =====
  draw.line(50, 60, 545, 60);
  draw.text('※ この決算報告書はAinanceで作成した参考資料です。', 50, 48, { size: 7, color: colors.muted });
  draw.text('※ 貸借対照表・キャッシュフロー計算書は売上・経費データから概算で作成しています。', 50, 38, { size: 7, color: colors.muted });
  draw.text('※ 正確な財務諸表の作成には、税理士への相談をお勧めします。', 50, 28, { size: 7, color: colors.muted });
  
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
