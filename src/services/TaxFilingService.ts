import { supabase } from '../lib/supabaseClient';

// 申告書データの型定義
export interface TaxDocument {
  id: string;
  userId: string;
  businessType: 'individual' | 'corporate';
  year: number;
  documentType: string;
  data: any;
  createdAt: string;
}

// 申告書テンプレートフィールドの型定義
export interface TaxDocumentTemplateField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'currency' | 'boolean';
  required: boolean;
  defaultValue?: string;
  description?: string;
}

// 申告書テンプレートの型定義
export interface TaxDocumentTemplate {
  id: string;
  name: string;
  businessType: 'individual' | 'corporate';
  documentType: string;
  fields: TaxDocumentTemplateField[];
  createdAt: string;
}

// 自動取り込みデータの型定義
export interface AutoImportData {
  field: string;
  value: string;
  status: 'success' | 'warning' | 'error';
  message?: string; // 検証メッセージ
}

// データ検証ルールの型定義
export interface ValidationRule {
  field: string;
  rule: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
  validator?: (value: any) => boolean; // カスタムバリデータ
}

// 取引データを申告書形式に変換
export const convertTransactionToTaxData = (transactions: any[], businessType: 'individual' | 'corporate') => {
  // 事業所得の計算
  const businessIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  
  // 必要経費の計算
  const necessaryExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  
  // 所得金額の計算
  const incomeAmount = businessIncome - necessaryExpenses;
  
  // 法人税の計算（簡略化した計算）
  const corporateTax = businessType === 'corporate' ? incomeAmount * 0.23 : 0;
  
  // 所得税の計算（簡略化した計算）
  const incomeTax = businessType === 'individual' ? incomeAmount * 0.05 : 0;
  
  return {
    businessIncome,
    necessaryExpenses,
    incomeAmount,
    corporateTax,
    incomeTax,
    transactions: transactions.map(t => ({
      id: t.id,
      item: t.item,
      amount: t.amount,
      date: t.date,
      category: t.category,
      type: t.type
    }))
  };
};

// 申告書データを保存
export const saveTaxDocument = async (taxData: any, userId: string, businessType: 'individual' | 'corporate', year: number, documentType: string) => {
  const { data, error } = await supabase
    .from('tax_documents')
    .insert([
      {
        user_id: userId,
        business_type: businessType,
        year: year,
        document_type: documentType,
        data: taxData,
        created_at: new Date().toISOString()
      }
    ]);
  
  if (error) {
    throw new Error(`申告書データの保存に失敗しました: ${error.message}`);
  }
  
  return data;
};

// 申告書データを取得
export const getTaxDocuments = async (userId: string, businessType: 'individual' | 'corporate', year: number) => {
  const { data, error } = await supabase
    .from('tax_documents')
    .select('*')
    .eq('user_id', userId)
    .eq('business_type', businessType)
    .eq('year', year)
    .order('created_at', { ascending: false });
  
  if (error) {
    throw new Error(`申告書データの取得に失敗しました: ${error.message}`);
  }
  
  return data;
};

// 申告書テンプレートを取得
export const getTaxDocumentTemplates = async (businessType: 'individual' | 'corporate') => {
  const { data, error } = await supabase
    .from('tax_document_templates')
    .select('*')
    .eq('business_type', businessType)
    .order('name');
  
  if (error) {
    throw new Error(`申告書テンプレートの取得に失敗しました: ${error.message}`);
  }
  
  return data;
};

// 特定の申告書テンプレートを取得
export const getTaxDocumentTemplateById = async (templateId: string) => {
  const { data, error } = await supabase
    .from('tax_document_templates')
    .select('*')
    .eq('id', templateId)
    .single();
  
  if (error) {
    throw new Error(`申告書テンプレートの取得に失敗しました: ${error.message}`);
  }
  
  return data;
};

// 申告書テンプレートを保存
export const saveTaxDocumentTemplate = async (template: Omit<TaxDocumentTemplate, 'id' | 'createdAt'>) => {
  const { data, error } = await supabase
    .from('tax_document_templates')
    .insert([
      {
        ...template,
        created_at: new Date().toISOString()
      }
    ]);
  
  if (error) {
    throw new Error(`申告書テンプレートの保存に失敗しました: ${error.message}`);
  }
  
  return data;
};

// 申告書テンプレートを削除
export const deleteTaxDocumentTemplate = async (templateId: string) => {
  const { data, error } = await supabase
    .from('tax_document_templates')
    .delete()
    .eq('id', templateId);
  
  if (error) {
    throw new Error(`申告書テンプレートの削除に失敗しました: ${error.message}`);
  }
  
  return data;
};

// OCR結果をテンプレートフィールドにマッピング
export const mapOcrResultsToTemplate = (ocrResults: any[], template: TaxDocumentTemplate) => {
  const mappedData: AutoImportData[] = [];
  
  // テンプレートの各フィールドに対してマッピングを試行
  template.fields.forEach(field => {
    // OCR結果から該当するフィールドを検索
    const matchingResult = ocrResults.find(result => 
      result.text.toLowerCase().includes(field.name.toLowerCase()) ||
      result.text.toLowerCase().includes(field.description?.toLowerCase() || '')
    );
    
    if (matchingResult) {
      // フィールドが見つかった場合
      mappedData.push({
        field: field.name,
        value: extractValueFromText(matchingResult.text, field.type),
        status: 'success'
      });
    } else if (field.required) {
      // 必須フィールドが見つからなかった場合
      mappedData.push({
        field: field.name,
        value: field.defaultValue || '',
        status: 'warning',
        message: '必須フィールドが見つかりませんでした'
      });
    } else if (field.defaultValue) {
      // デフォルト値がある場合
      mappedData.push({
        field: field.name,
        value: field.defaultValue,
        status: 'success'
      });
    }
  });
  
  return mappedData;
};

// テキストから値を抽出するヘルパー関数
const extractValueFromText = (text: string, fieldType: string) => {
  switch (fieldType) {
    case 'number':
    case 'currency':
      // 数値または通貨を抽出
      const numberMatch = text.match(/[\d,]+\.?\d*/);
      return numberMatch ? numberMatch[0] : '';
    case 'date':
      // 日付を抽出
      const dateMatch = text.match(/\d{4}[年\/\-\.]?\d{1,2}[月\/\-\.]?\d{1,2}/);
      return dateMatch ? dateMatch[0] : '';
    case 'boolean':
      // 真偽値を抽出
      return text.toLowerCase().includes('はい') || text.toLowerCase().includes('yes') ? 'true' : 'false';
    default:
      // テキストの場合、フィールド名以降のテキストを返す
      return text;
  }
};

// データを検証する関数
export const validateImportData = (data: AutoImportData[], rules: ValidationRule[]): AutoImportData[] => {
  return data.map(item => {
    // このフィールドに対する検証ルールを取得
    const fieldRules = rules.filter(rule => rule.field === item.field);
    
    // 各ルールを適用
    for (const rule of fieldRules) {
      let isValid = true;
      let message = rule.message;
      
      switch (rule.rule) {
        case 'required':
          if (!item.value || item.value.toString().trim() === '') {
            isValid = false;
            message = message || `${item.field}は必須項目です`;
          }
          break;
        case 'min':
          if (typeof rule.value === 'number' && parseFloat(item.value) < rule.value) {
            isValid = false;
            message = message || `${item.field}は${rule.value}以上である必要があります`;
          }
          break;
        case 'max':
          if (typeof rule.value === 'number' && parseFloat(item.value) > rule.value) {
            isValid = false;
            message = message || `${item.field}は${rule.value}以下である必要があります`;
          }
          break;
        case 'pattern':
          if (rule.value instanceof RegExp && !rule.value.test(item.value)) {
            isValid = false;
            message = message || `${item.field}の形式が正しくありません`;
          }
          break;
        case 'custom':
          if (rule.validator && !rule.validator(item.value)) {
            isValid = false;
            message = message || `${item.field}の値がカスタムルールに合いません`;
          }
          break;
      }
      
      // 検証に失敗した場合
      if (!isValid) {
        return {
          ...item,
          status: item.status === 'success' ? 'warning' : item.status, // 成功ステータスのみを警告に変更
          message: item.message ? `${item.message}, ${message}` : message
        };
      }
    }
    
    // 検証に成功した場合
    return item;
  });
};

// 自動取り込みデータを処理
export const processAutoImportData = async (importResults: AutoImportData[], userId: string) => {
  // 成功したデータのみを抽出
  const successfulData = importResults.filter(result => result.status === 'success');
  
  // データを取引履歴に変換
  const transactions = successfulData.map((data, index) => ({
    id: `${userId}-${Date.now()}-${index}`,
    item: data.field,
    amount: parseFloat(data.value.replace(/[^0-9.-]+/g, "")) || 0,
    date: new Date().toISOString().split('T')[0],
    category: '自動取り込み',
    type: parseFloat(data.value.replace(/[^0-9.-]+/g, "")) >= 0 ? 'income' : 'expense',
    description: `自動取り込みデータ: ${data.field}`,
    creator: userId,
    created_at: new Date().toISOString()
  }));
  
  // 取引履歴に保存
  const savedTransactions = [];
  for (const transaction of transactions) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([transaction]);
      
      if (error) {
        console.error(`取引データの保存に失敗しました: ${error.message}`);
      } else {
        savedTransactions.push(data);
      }
    } catch (error) {
      console.error(`取引データの保存中にエラーが発生しました: ${error}`);
    }
  }
  
  return savedTransactions;
};

// インポート履歴を保存
export const saveImportHistory = async (userId: string, fileName: string, status: 'success' | 'failed', details: any) => {
  const { data, error } = await supabase
    .from('import_history')
    .insert([
      {
        user_id: userId,
        file_name: fileName,
        status: status,
        details: details,
        created_at: new Date().toISOString()
      }
    ]);
  
  if (error) {
    throw new Error(`インポート履歴の保存に失敗しました: ${error.message}`);
  }
  
  return data;
};

// インポート履歴を取得
export const getImportHistory = async (userId: string) => {
  const { data, error } = await supabase
    .from('import_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50); // 最新50件のみ取得
  
  if (error) {
    throw new Error(`インポート履歴の取得に失敗しました: ${error.message}`);
  }
  
  return data;
};