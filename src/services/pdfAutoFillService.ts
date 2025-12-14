/**
 * 確定申告書PDF自動転記サービス
 * 国税庁のテンプレートPDFにAinanceのデータを自動で入力
 */

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// 確定申告書Bの入力座標マッピング（令和5年分）
// 座標は左下原点でpt単位（1pt = 約0.35mm）
const TAX_RETURN_B_FIELDS = {
  // 第一表
  // 収入金額等
  事業_営業等: { x: 475, y: 648, width: 80 },
  事業_農業: { x: 475, y: 628, width: 80 },
  不動産: { x: 475, y: 608, width: 80 },
  利子: { x: 475, y: 588, width: 80 },
  配当: { x: 475, y: 568, width: 80 },
  給与: { x: 475, y: 548, width: 80 },
  雑_公的年金等: { x: 475, y: 528, width: 80 },
  雑_その他: { x: 475, y: 508, width: 80 },
  
  // 所得金額等
  事業所得_営業等: { x: 475, y: 458, width: 80 },
  事業所得_農業: { x: 475, y: 438, width: 80 },
  不動産所得: { x: 475, y: 418, width: 80 },
  給与所得: { x: 475, y: 378, width: 80 },
  総所得金額: { x: 475, y: 318, width: 80 },
  
  // 所得控除
  社会保険料控除: { x: 475, y: 268, width: 80 },
  小規模企業共済等掛金控除: { x: 475, y: 248, width: 80 },
  生命保険料控除: { x: 475, y: 228, width: 80 },
  地震保険料控除: { x: 475, y: 208, width: 80 },
  配偶者控除: { x: 475, y: 168, width: 80 },
  扶養控除: { x: 475, y: 148, width: 80 },
  基礎控除: { x: 475, y: 128, width: 80 },
  所得控除合計: { x: 475, y: 88, width: 80 },
  
  // 申告者情報
  住所: { x: 120, y: 780, width: 200 },
  氏名: { x: 120, y: 755, width: 150 },
  フリガナ: { x: 120, y: 770, width: 150 },
  電話番号: { x: 350, y: 755, width: 100 },
  生年月日_年: { x: 280, y: 755, width: 30 },
  生年月日_月: { x: 315, y: 755, width: 20 },
  生年月日_日: { x: 340, y: 755, width: 20 },
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

// Ainanceのカテゴリを確定申告の勘定科目にマッピング
const CATEGORY_TO_ACCOUNT_MAP: { [key: string]: string } = {
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
};

export interface TaxFormData {
  // 申告者情報
  name?: string;
  furigana?: string;
  address?: string;
  phone?: string;
  birthDate?: { year: number; month: number; day: number };
  tradeName?: string; // 屋号
  
  // 収支データ
  revenue: number;
  expenses: number;
  netIncome: number;
  
  // 経費内訳
  expensesByCategory: { category: string; amount: number }[];
  
  // 控除
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
  formType: 'tax_return_b' | 'blue_return',
  data: TaxFormData
): Promise<{ pdfBytes: Uint8Array; filename: string }> {
  const templatePath = formType === 'tax_return_b'
    ? '/templates/tax_return_r05.pdf'
    : '/templates/blue_return_r05.pdf';
  
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
 */
async function generateFallbackPDF(
  formType: 'tax_return_b' | 'blue_return',
  data: TaxFormData
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4サイズ
  
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const { height } = page.getSize();
  
  const formatNumber = (num: number) => num.toLocaleString('ja-JP');
  
  const drawText = (text: string, x: number, y: number, size = 10, color = rgb(0, 0, 0)) => {
    page.drawText(text, { x, y: height - y, size, font, color });
  };
  
  const drawLine = (x1: number, y1: number, x2: number, y2: number) => {
    page.drawLine({
      start: { x: x1, y: height - y1 },
      end: { x: x2, y: height - y2 },
      thickness: 0.5,
      color: rgb(0.5, 0.5, 0.5),
    });
  };
  
  // ヘッダー
  drawText(formType === 'tax_return_b' ? 'Shinkou-sho B (Tax Return Form B)' : 'Aoiro Shinkoku Kessan-sho (Blue Return)', 50, 50, 16);
  drawText(`Fiscal Year: ${data.fiscalYear}`, 50, 75, 12);
  drawText(`Generated by Ainance - ${new Date().toLocaleDateString('ja-JP')}`, 50, 95, 9, rgb(0.5, 0.5, 0.5));
  
  drawLine(50, 110, 545, 110);
  
  let y = 140;
  
  if (formType === 'tax_return_b') {
    // 確定申告書B
    drawText('=== Income (Shuunyu) ===', 50, y, 12);
    y += 25;
    
    drawText('Business Income (Jigyo Shotoku):', 60, y);
    drawText(formatNumber(data.revenue) + ' JPY', 350, y);
    y += 20;
    
    drawLine(50, y, 545, y);
    y += 25;
    
    drawText('=== Deductions (Shotoku) ===', 50, y, 12);
    y += 25;
    
    drawText('Business Income (Net):', 60, y);
    drawText(formatNumber(data.netIncome) + ' JPY', 350, y);
    y += 20;
    
    drawText('Total Income:', 60, y);
    drawText(formatNumber(data.netIncome) + ' JPY', 350, y);
    y += 30;
    
    drawLine(50, y, 545, y);
    y += 25;
    
    drawText('=== Tax Deductions (Shotoku Koujo) ===', 50, y, 12);
    y += 25;
    
    if (data.deductions.basic) {
      drawText('Basic Deduction (Kiso Koujo):', 60, y);
      drawText(formatNumber(data.deductions.basic) + ' JPY', 350, y);
      y += 20;
    }
    
    if (data.deductions.blueReturn) {
      drawText('Blue Return Deduction (Aoiro):', 60, y);
      drawText(formatNumber(data.deductions.blueReturn) + ' JPY', 350, y);
      y += 20;
    }
    
    const totalDeductions = Object.values(data.deductions).reduce((sum: number, val) => sum + (val || 0), 0);
    drawText('Total Deductions:', 60, y);
    drawText(formatNumber(totalDeductions) + ' JPY', 350, y);
    y += 30;
    
    drawLine(50, y, 545, y);
    y += 25;
    
    drawText('=== Tax Calculation ===', 50, y, 12);
    y += 25;
    
    drawText('Taxable Income:', 60, y);
    drawText(formatNumber(data.taxableIncome) + ' JPY', 350, y);
    y += 25;
    
    drawText('Estimated Tax:', 60, y, 12);
    drawText(formatNumber(data.estimatedTax) + ' JPY', 350, y, 12, rgb(0.8, 0, 0));
    
  } else {
    // 青色申告決算書
    drawText('=== Profit & Loss Statement ===', 50, y, 12);
    y += 25;
    
    drawText('Revenue (Uriage):', 60, y);
    drawText(formatNumber(data.revenue) + ' JPY', 350, y);
    y += 30;
    
    drawLine(50, y, 545, y);
    y += 25;
    
    drawText('=== Expenses (Keihi) ===', 50, y, 12);
    y += 25;
    
    // 経費内訳
    data.expensesByCategory.forEach(exp => {
      const account = CATEGORY_TO_ACCOUNT_MAP[exp.category] || exp.category;
      drawText(`${account}:`, 60, y);
      drawText(formatNumber(exp.amount) + ' JPY', 350, y);
      y += 18;
    });
    
    y += 10;
    drawText('Total Expenses:', 60, y);
    drawText(formatNumber(data.expenses) + ' JPY', 350, y);
    y += 30;
    
    drawLine(50, y, 545, y);
    y += 25;
    
    drawText('=== Income Calculation ===', 50, y, 12);
    y += 25;
    
    drawText('Gross Profit (Revenue - Expenses):', 60, y);
    drawText(formatNumber(data.netIncome) + ' JPY', 350, y);
    y += 25;
    
    if (data.isBlueReturn && data.deductions.blueReturn) {
      drawText('Blue Return Deduction:', 60, y);
      drawText('-' + formatNumber(data.deductions.blueReturn) + ' JPY', 350, y);
      y += 25;
      
      const finalIncome = Math.max(0, data.netIncome - data.deductions.blueReturn);
      drawText('Final Income:', 60, y, 12);
      drawText(formatNumber(finalIncome) + ' JPY', 350, y, 12, rgb(0, 0.6, 0));
    }
  }
  
  // フッター
  drawLine(50, 780, 545, 780);
  drawText('* This document is generated by Ainance for reference purposes.', 50, 800, 8, rgb(0.5, 0.5, 0.5));
  drawText('* For official tax filing, please use the NTA e-Tax system.', 50, 815, 8, rgb(0.5, 0.5, 0.5));
  
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
