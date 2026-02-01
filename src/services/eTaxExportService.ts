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
 * 注意: これは簡易版です。完全なe-Tax対応には追加の項目が必要です。
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

  // 経費内訳をXML要素に変換
  const expenseElements = info.expensesByCategory.map((exp, index) => {
    const code = categoryToCode[exp.category] || `AC${200 + index}`;
    return `    <${code}>${exp.amount}</${code}>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!--
  Ainance e-Tax Export File
  生成日時: ${now.toLocaleString('ja-JP')}
  対象年度: ${info.fiscalYear}年度
  申告区分: ${info.filingType === 'blue' ? '青色申告' : '白色申告'}
-->
<申告書等送信票等>
  <作成日時>${timestamp}</作成日時>
  <ファイル種別>青色申告決算書</ファイル種別>
  
  <申告者情報>
    <氏名>${info.name || '（要入力）'}</氏名>
    <フリガナ>${info.furigana || '（要入力）'}</フリガナ>
    <郵便番号>${info.postalCode || ''}</郵便番号>
    <住所>${info.address || '（要入力）'}</住所>
    <電話番号>${info.phoneNumber || ''}</電話番号>
    <生年月日>${info.birthDate || ''}</生年月日>
  </申告者情報>
  
  <青色申告決算書>
    <対象年度>${info.fiscalYear}</対象年度>
    <申告区分>${info.filingType === 'blue' ? '1' : '2'}</申告区分>
    
    <!-- 損益計算書 -->
    <損益計算書>
      <売上金額>
        <AA100>${info.revenue}</AA100>
      </売上金額>
      
      <必要経費>
${expenseElements}
        <経費合計>${info.expenses}</経費合計>
      </必要経費>
      
      <差引金額>${info.netIncome}</差引金額>
      
      <各種引当金>
        <繰戻額>0</繰戻額>
        <繰入額>0</繰入額>
      </各種引当金>
      
      <青色申告特別控除前所得>${info.netIncome}</青色申告特別控除前所得>
      <青色申告特別控除額>${info.filingType === 'blue' ? 650000 : 0}</青色申告特別控除額>
      <所得金額>${info.netIncome - (info.filingType === 'blue' ? 650000 : 0)}</所得金額>
    </損益計算書>
    
    <!-- 控除情報 -->
    <所得控除>
${info.deductions.map(d => `      <${d.type}>${d.amount}</${d.type}>`).join('\n')}
      <控除合計>${info.totalDeductions}</控除合計>
    </所得控除>
    
    <!-- 税額計算 -->
    <税額計算>
      <課税所得金額>${info.taxableIncome}</課税所得金額>
      <算出税額>${info.estimatedTax}</算出税額>
    </税額計算>
  </青色申告決算書>
  
  <備考>
    このファイルはAinanceで生成されました。
    正式な申告にはe-Tax確定申告書等作成コーナーでの確認・修正が必要な場合があります。
  </備考>
</申告書等送信票等>`;

  return xml;
}

/**
 * 収支内訳書（白色申告用）のXML形式を生成
 */
export function generateIncomeStatementXML(info: TaxFilingInfo): string {
  const now = new Date();
  
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!--
  Ainance e-Tax Export File - 収支内訳書
  生成日時: ${now.toLocaleString('ja-JP')}
  対象年度: ${info.fiscalYear}年度
-->
<収支内訳書>
  <対象年度>${info.fiscalYear}</対象年度>
  
  <収入金額>
    <売上金額>${info.revenue}</売上金額>
  </収入金額>
  
  <必要経費>
${info.expensesByCategory.map(exp => `    <${exp.category.replace(/\s/g, '')}>${exp.amount}</${exp.category.replace(/\s/g, '')}>`).join('\n')}
    <経費合計>${info.expenses}</経費合計>
  </必要経費>
  
  <差引金額>${info.netIncome}</差引金額>
</収支内訳書>`;

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
 * xtxファイルをダウンロード
 */
export function downloadXTXFile(content: string, filename: string): void {
  const blob = new Blob(['\ufeff' + content], { type: 'application/xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
