import { CorporateTaxInputData } from '../types/corporateTaxInput';

/**
 * e-Tax用ファイル生成サービス
 * 国税庁のe-Taxに直接インポート可能なxtx形式ファイルを生成
 */

export interface TaxFilingInfo {
  // 基本情報
  fiscalYear: number;
  filingType: 'blue' | 'white'; // 青色申告 or 白色申告

  // 申告者情報
  name?: string;
  furigana?: string;
  postalCode?: string;
  address?: string;
  phoneNumber?: string;
  birthDate?: string;

  // 収支データ
  revenue: number;          // 売上高
  expenses: number;         // 経費合計
  netIncome: number;        // 事業所得

  // 経費内訳
  expensesByCategory: {
    category: string;
    amount: number;
  }[];

  // 控除
  deductions: {
    type: string;
    name: string;
    amount: number;
  }[];
  totalDeductions: number;

  // 税額計算
  taxableIncome: number;    // 課税所得
  estimatedTax: number;     // 予想税額
}

/**
 * 青色申告決算書（一般用）のXTX/XML形式を生成
 */
export function generateBlueReturnXTX(info: TaxFilingInfo): string {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:]/g, '').split('.')[0];

  // 勘定科目のマッピング
  const categoryToCode: { [key: string]: string } = {
    '売上高': 'AA100',
    '仕入高': 'AB100',
    '消耗品費': 'AC100',
    '旅費交通費': 'AC110',
    '通信費': 'AC120',
    '広告宣伝費': 'AC130',
    '接待交際費': 'AC140',
    '水道光熱費': 'AC150',
    '地代家賃': 'AC160',
    '外注費': 'AC170',
    '減価償却費': 'AC180',
    '雑費': 'AC190',
  };

  const expenseElements = info.expensesByCategory.map((exp, index) => {
    const code = categoryToCode[exp.category] || `AC${200 + index}`;
    return `    <${code}>${exp.amount}</${code}>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<申告書等送信票等>
  <作成日時>${timestamp}</作成日時>
  <ファイル種別>青色申告決算書</ファイル種別>
  <申告者情報>
    <氏名>${info.name || ''}</氏名>
    <住所>${info.address || ''}</住所>
  </申告者情報>
  <青色申告決算書>
    <損益計算書>
      <売上金額><AA100>${info.revenue}</AA100></売上金額>
      <必要経費>${expenseElements}</必要経費>
      <所得金額>${info.netIncome}</所得金額>
    </損益計算書>
  </青色申告決算書>
</申告書等送信票等>`;
}

/**
 * 収支内訳書（白色申告用）のXML形式を生成
 */
export function generateIncomeStatementXML(info: TaxFilingInfo): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<収支内訳書>
  <対象年度>${info.fiscalYear}</対象年度>
  <収入金額><売上金額>${info.revenue}</売上金額></収入金額>
  <差引金額>${info.netIncome}</差引金額>
</収支内訳書>`;
}

/**
 * 法人税申告書（別表一、四、十五、十六）のXTX形式を生成
 */
export function generateCorporateTaxXTX(data: CorporateTaxInputData): string {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:]/g, '').split('.')[0];

  const formatItems = (items: { description: string, amount: number }[]) => {
    if (items.length === 0) return '';
    return '\n' + items.map(item => `      <項目>\n        <摘要>${item.description}</摘要>\n        <金額>${item.amount}</金額>\n      </項目>`).join('\n') + '\n    ';
  };

  const formatAssets = (assets: { name: string, acquisitionCost: number, currentDepreciation: number }[]) => {
    if (assets.length === 0) return '';
    return '\n' + assets.map(asset => `      <資産>\n        <名称>${asset.name}</名称>\n        <取得価額>${asset.acquisitionCost}</取得価額>\n        <当期償却額>${asset.currentDepreciation}</当期償却額>\n      </資産>`).join('\n') + '\n    ';
  };

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<法人税申告書等データ>
  <作成日時>${timestamp}</作成日時>
  <ファイル種別>法人税申告書</ファイル種別>
  
  <別表一>
    <課税標準額>${data.beppyo1.taxableIncome}</課税標準額>
    <法人税額>${data.beppyo1.corporateTaxAmount}</法人税額>
    <特別控除額>${data.beppyo1.specialTaxCredit}</特別控除額>
    <中間納付額>${data.beppyo1.interimPayment}</中間納付額>
    <差引確定法人税額>${data.beppyo1.corporateTaxAmount - data.beppyo1.specialTaxCredit - data.beppyo1.interimPayment}</差引確定法人税額>
  </別表一>

  <別表四>
    <当期純利益>${data.beppyo4.netIncomeFromPL}</当期純利益>
    <加算項目>${formatItems(data.beppyo4.additions)}</加算項目>
    <減算項目>${formatItems(data.beppyo4.subtractions)}</減算項目>
    <所得金額>${data.beppyo4.taxableIncome}</所得金額>
  </別表四>

  <別表十五>
    <交際費等の支出額>${data.beppyo15.socialExpenses}</交際費等の支出額>
    <接待飲食費の額>${data.beppyo15.deductibleExpenses}</接待飲食費の額>
    <損金不算入額>${data.beppyo15.excessAmount}</損金不算入額>
  </別表十五>

  <別表十六>
    <資産一覧>${formatAssets(data.beppyo16.assets)}</資産一覧>
    <償却超過額>${data.beppyo16.excessAmount}</償却超過額>
  </別表十六>

  <財務諸表>
    <貸借対照表>
      <流動資産>${data.financialStatements.balanceSheet.currentAssets}</流動資産>
      <固定資産>${data.financialStatements.balanceSheet.fixedAssets}</固定資産>
      <繰延資産>${data.financialStatements.balanceSheet.deferredAssets}</繰延資産>
      <資産合計>${data.financialStatements.balanceSheet.totalAssets}</資産合計>
      <流動負債>${data.financialStatements.balanceSheet.currentLiabilities}</流動負債>
      <固定負債>${data.financialStatements.balanceSheet.fixedLiabilities}</固定負債>
      <負債合計>${data.financialStatements.balanceSheet.totalLiabilities}</負債合計>
      <資本金>${data.financialStatements.balanceSheet.capitalStock}</資本金>
      <資本剰余金>${data.financialStatements.balanceSheet.capitalSurplus}</資本剰余金>
      <利益剰余金>${data.financialStatements.balanceSheet.retainedEarnings}</利益剰余金>
      <自己株式>${data.financialStatements.balanceSheet.treasuryStock}</自己株式>
      <純資産合計>${data.financialStatements.balanceSheet.totalNetAssets}</純資産合計>
      <負債純資産合計>${data.financialStatements.balanceSheet.totalLiabilitiesAndNetAssets}</負債純資産合計>
    </貸借対照表>
    <損益計算書>
      <売上高>${data.financialStatements.incomeStatement.netSales}</売上高>
      <売上原価>${data.financialStatements.incomeStatement.costOfSales}</売上原価>
      <売上総利益>${data.financialStatements.incomeStatement.grossProfit}</売上総利益>
      <販売費及び一般管理費>${data.financialStatements.incomeStatement.sellingGeneralAdminExpenses}</販売費及び一般管理費>
      <営業利益>${data.financialStatements.incomeStatement.operatingIncome}</営業利益>
      <営業外収益>${data.financialStatements.incomeStatement.nonOperatingIncome}</営業外収益>
      <営業外費用>${data.financialStatements.incomeStatement.nonOperatingExpenses}</営業外費用>
      <経常利益>${data.financialStatements.incomeStatement.ordinaryIncome}</経常利益>
      <特別利益>${data.financialStatements.incomeStatement.extraordinaryIncome}</特別利益>
      <特別損失>${data.financialStatements.incomeStatement.extraordinaryLoss}</特別損失>
      <税引前当期純利益>${data.financialStatements.incomeStatement.incomeBeforeTax}</税引前当期純利益>
      <法人税住民税及事業税>${data.financialStatements.incomeStatement.incomeTaxes}</法人税住民税及事業税>
      <当期純利益>${data.financialStatements.incomeStatement.netIncome}</当期純利益>
    </損益計算書>
  </財務諸表>
  
  <備考>Ainanceにて生成 (Corporate Tax Return Draft)</備考>
</法人税申告書等データ>`;

  return xml;
}

/**
 * クリップボードにコピーするためのフォーマット済みテキストを生成
 */
export function generateCopyableText(info: TaxFilingInfo): {
  summary: string;
  revenue: string;
  expenses: string;
  netIncome: string;
  taxableIncome: string;
  estimatedTax: string;
  expensesByCategory: { category: string; amount: string }[];
  deductions: { name: string; amount: string }[];
} {
  const formatCurrency = (amount: number) => amount.toLocaleString('ja-JP');

  return {
    summary: `
【${info.fiscalYear}年度 確定申告データ】
売上高: ¥${formatCurrency(info.revenue)}
経費合計: ¥${formatCurrency(info.expenses)}
事業所得: ¥${formatCurrency(info.netIncome)}
控除合計: ¥${formatCurrency(info.totalDeductions)}
課税所得: ¥${formatCurrency(info.taxableIncome)}
所得税額: ¥${formatCurrency(info.estimatedTax)}
`.trim(),
    revenue: formatCurrency(info.revenue),
    expenses: formatCurrency(info.expenses),
    netIncome: formatCurrency(info.netIncome),
    taxableIncome: formatCurrency(info.taxableIncome),
    estimatedTax: formatCurrency(info.estimatedTax),
    expensesByCategory: info.expensesByCategory.map(exp => ({
      category: exp.category,
      amount: formatCurrency(exp.amount)
    })),
    deductions: info.deductions.map(d => ({
      name: d.name,
      amount: formatCurrency(d.amount)
    }))
  };
}

/**
 * ファイルを強制ダウンロード
 */
export function downloadFile(content: string, filename: string, type: string = 'application/octet-stream'): void {
  // \ufeff はUTF-8 BOM。これと application/octet-stream を組み合わせることで文字化けせずに強制ダウンロードさせる
  const blob = new Blob(['\ufeff' + content], { type });
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
 * 旧関数名との互換性のために残す（必要に応じて）
 */
export const downloadXTXFile = downloadFile;
