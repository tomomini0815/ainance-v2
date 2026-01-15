/**
 * CSVインポートサービス
 * CSVファイルから取引データをインポートするための機能を提供
 */

// CSV行のデータ型
export interface CSVRow {
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  memo?: string;
  vendor?: string;
}

// インポート結果の型
export interface ImportResult {
  success: boolean;
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: { row: number; message: string }[];
  importedData: CSVRow[];
}

// バリデーションエラーの型
export interface ValidationError {
  row: number;
  column: string;
  message: string;
}

// カラムマッピングの型
export interface ColumnMapping {
  date: string;
  description: string;
  amount: string;
  type: string;
  category: string;
  memo?: string;
  vendor?: string;
}

// デフォルトのカラムマッピング
export const DEFAULT_COLUMN_MAPPING: ColumnMapping = {
  date: '日付',
  description: '摘要',
  amount: '金額',
  type: '種別',
  category: '勘定科目',
  memo: 'メモ',
  vendor: '取引先',
};

// 標準カテゴリ一覧
export const STANDARD_CATEGORIES = {
  income: [
    '売上高',
    '雑収入',
    '受取利息',
    '受取配当金',
  ],
  expense: [
    '仕入高',
    '消耗品費',
    '旅費交通費',
    '通信費',
    '広告宣伝費',
    '接待交際費',
    '水道光熱費',
    '地代家賃',
    '外注費',
    '減価償却費',
    '支払手数料',
    '保険料',
    '租税公課',
    '雑費',
  ],
};

/**
 * CSVテンプレートを生成
 */
export function generateCSVTemplate(): string {
  const headers = ['日付', '摘要', '金額', '種別', '勘定科目', 'メモ', '取引先'];
  const sampleRows = [
    ['2024/01/15', 'クライアントA 請求', '100000', '収入', '売上高', '1月分請求', 'クライアントA社'],
    ['2024/01/20', '電車代', '500', '支出', '旅費交通費', '打ち合わせ移動', ''],
    ['2024/01/25', 'オフィス用品購入', '3000', '支出', '消耗品費', 'コピー用紙等', 'アマゾン'],
  ];

  const csvContent = [
    headers.join(','),
    ...sampleRows.map(row => row.join(','))
  ].join('\n');

  return csvContent;
}

/**
 * CSVテンプレートをダウンロード
 */
export function downloadCSVTemplate(): void {
  const content = generateCSVTemplate();
  const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'ainance_import_template.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * CSVファイルを解析
 */
export function parseCSV(content: string): { headers: string[]; rows: string[][] } {
  const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');
  
  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  // ヘッダー行を解析
  const headers = parseCSVLine(lines[0]);
  
  // データ行を解析
  const rows = lines.slice(1).map(line => parseCSVLine(line));
  
  return { headers, rows };
}

/**
 * CSV行を解析（カンマ区切り、ダブルクォート対応）
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
  }
  
  result.push(current.trim());
  return result;
}

/**
 * 日付文字列を解析
 */
function parseDate(dateStr: string): Date | null {
  // 様々な日付フォーマットに対応
  const formats = [
    /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/,  // YYYY/MM/DD
    /^(\d{4})-(\d{1,2})-(\d{1,2})$/,    // YYYY-MM-DD
    /^(\d{4})\.(\d{1,2})\.(\d{1,2})$/,  // YYYY.MM.DD
  ];
  
  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      const [, year, month, day] = match;
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
  }
  
  return null;
}

/**
 * 金額文字列を解析
 */
function parseAmount(amountStr: string): number | null {
  // カンマ、円記号、スペースを除去
  const cleaned = amountStr.replace(/[,¥￥\s]/g, '');
  const amount = parseFloat(cleaned);
  
  return isNaN(amount) ? null : Math.abs(amount);
}

/**
 * 種別を解析
 */
function parseType(typeStr: string): 'income' | 'expense' | null {
  const normalized = typeStr.toLowerCase().trim();
  
  if (['収入', '入金', 'income', '売上'].includes(normalized)) {
    return 'income';
  }
  
  if (['支出', '出金', 'expense', '経費', '費用'].includes(normalized)) {
    return 'expense';
  }
  
  return null;
}

/**
 * CSVデータをバリデーション
 */
export function validateCSVData(
  headers: string[],
  rows: string[][],
  mapping: ColumnMapping
): { isValid: boolean; errors: ValidationError[]; data: CSVRow[] } {
  const errors: ValidationError[] = [];
  const data: CSVRow[] = [];
  
  // 必須カラムの存在チェック
  const requiredColumns = ['date', 'description', 'amount', 'type', 'category'] as const;
  const headerIndexMap: Record<string, number> = {};
  
  for (const [key, value] of Object.entries(mapping)) {
    const index = headers.findIndex(h => h === value);
    if (index !== -1) {
      headerIndexMap[key] = index;
    }
  }
  
  for (const col of requiredColumns) {
    if (headerIndexMap[col] === undefined) {
      errors.push({
        row: 0,
        column: mapping[col],
        message: `必須カラム「${mapping[col]}」が見つかりません`,
      });
    }
  }
  
  if (errors.length > 0) {
    return { isValid: false, errors, data: [] };
  }
  
  // 各行をバリデーション
  rows.forEach((row, rowIndex) => {
    const rowNum = rowIndex + 2; // 1-indexed, header is row 1
    
    // 日付
    const dateStr = row[headerIndexMap.date] || '';
    const parsedDate = parseDate(dateStr);
    if (!parsedDate) {
      errors.push({
        row: rowNum,
        column: mapping.date,
        message: `無効な日付形式: "${dateStr}"`,
      });
    }
    
    // 金額
    const amountStr = row[headerIndexMap.amount] || '';
    const parsedAmount = parseAmount(amountStr);
    if (parsedAmount === null) {
      errors.push({
        row: rowNum,
        column: mapping.amount,
        message: `無効な金額: "${amountStr}"`,
      });
    }
    
    // 種別
    const typeStr = row[headerIndexMap.type] || '';
    const parsedType = parseType(typeStr);
    if (!parsedType) {
      errors.push({
        row: rowNum,
        column: mapping.type,
        message: `無効な種別: "${typeStr}"（収入/支出のいずれかを指定）`,
      });
    }
    
    // 摘要
    const description = row[headerIndexMap.description] || '';
    if (!description.trim()) {
      errors.push({
        row: rowNum,
        column: mapping.description,
        message: '摘要は必須です',
      });
    }
    
    // 勘定科目
    const category = row[headerIndexMap.category] || '';
    if (!category.trim()) {
      errors.push({
        row: rowNum,
        column: mapping.category,
        message: '勘定科目は必須です',
      });
    }
    
    // エラーがなければデータを追加
    if (parsedDate && parsedAmount !== null && parsedType && description.trim() && category.trim()) {
      data.push({
        date: parsedDate.toISOString().split('T')[0],
        description: description.trim(),
        amount: parsedAmount,
        type: parsedType,
        category: category.trim(),
        memo: headerIndexMap.memo !== undefined ? row[headerIndexMap.memo] || '' : '',
        vendor: headerIndexMap.vendor !== undefined ? row[headerIndexMap.vendor] || '' : '',
      });
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    data,
  };
}

/**
 * CSVファイルをインポート
 */
export async function importCSVFile(
  file: File,
  mapping: ColumnMapping = DEFAULT_COLUMN_MAPPING
): Promise<ImportResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const { headers, rows } = parseCSV(content);
        
        if (headers.length === 0) {
          resolve({
            success: false,
            totalRows: 0,
            successCount: 0,
            errorCount: 1,
            errors: [{ row: 0, message: 'CSVファイルが空です' }],
            importedData: [],
          });
          return;
        }
        
        const { isValid, errors, data } = validateCSVData(headers, rows, mapping);
        
        resolve({
          success: isValid,
          totalRows: rows.length,
          successCount: data.length,
          errorCount: errors.length,
          errors: errors.map(e => ({ row: e.row, message: `${e.column}: ${e.message}` })),
          importedData: data,
        });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('ファイルの読み込みに失敗しました'));
    };
    
    reader.readAsText(file, 'UTF-8');
  });
}

/**
 * インポートしたデータを取引形式に変換
 */
export function convertToTransactions(csvRows: CSVRow[]): any[] {
  return csvRows.map((row, index) => ({
    id: `import_${Date.now()}_${index}`,
    date: row.date,
    description: row.description,
    amount: row.type === 'expense' ? -row.amount : row.amount,
    type: row.type,
    category: row.category,
    memo: row.memo || '',
    vendor: row.vendor || '',
    status: 'pending',
    source: 'csv_import',
    createdAt: new Date().toISOString(),
  }));
}
