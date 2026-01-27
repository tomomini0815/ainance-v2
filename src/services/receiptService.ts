import { supabase } from '../lib/supabaseClient';

export interface Receipt {
  id?: string;
  user_id: string;
  date: string;
  merchant: string;
  amount: number;
  category: string;
  description: string;
  confidence: number;
  status: 'pending' | 'approved' | 'rejected';
  tax_rate?: number;
  confidence_scores?: {
    merchant?: number;
    date?: number;
    amount?: number;
  };
  created_at?: string;
  updated_at?: string;
}

/**
 * レシートをSupabaseに保存
 */
export const saveReceipt = async (receipt: Omit<Receipt, 'id' | 'created_at' | 'updated_at'>): Promise<Receipt | null> => {
  try {
    console.log('レシートを保存中:', receipt);
    const { data, error } = await supabase
      .from('receipts')
      .insert([receipt])
      .select()
      .single();

    if (error) {
      console.error('レシート保存エラー:', error);
      throw error;
    }

    console.log('レシート保存成功:', data);
    return data;
  } catch (error) {
    console.error('saveReceipt エラー:', error);
    return null;
  }
};

/**
 * ユーザーのレシート一覧を取得
 */
export const getReceipts = async (userId: string): Promise<Receipt[]> => {
  try {
    console.log('レシートを取得中:', { userId });
    const { data, error } = await supabase
      .from('receipts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('レシート取得エラー:', error);
      throw error;
    }

    console.log('レシート取得成功:', { count: data?.length, data });
    return data || [];
  } catch (error) {
    console.error('getReceipts エラー:', error);
    return [];
  }
};

/**
 * レシートを更新
 */
export const updateReceipt = async (id: string, updates: Partial<Receipt>): Promise<Receipt | null> => {
  try {
    console.log('レシートを更新中:', { id, updates });
    const { data, error } = await supabase
      .from('receipts')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('レシート更新エラー:', error);
      throw error;
    }

    console.log('レシート更新成功:', data);
    return data;
  } catch (error) {
    console.error('updateReceipt エラー:', error);
    return null;
  }
};

/**
 * レシートを削除
 */
export const deleteReceipt = async (id: string): Promise<boolean> => {
  try {
    console.log('レシートを削除中:', { id });
    const { error } = await supabase
      .from('receipts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('レシート削除エラー:', error);
      throw error;
    }

    console.log('レシート削除成功');
    return true;
  } catch (error) {
    console.error('deleteReceipt エラー:', error);
    return false;
  }
};

/**
 * レシートステータスを更新
 */
export const updateReceiptStatus = async (
  id: string,
  status: 'pending' | 'approved' | 'rejected'
): Promise<Receipt | null> => {
  console.log('レシートステータスを更新中:', { id, status });
  return updateReceipt(id, { status });
};

/**
 * レシートを承認して取引データを各テーブルに保存
 */
export const approveReceiptAndCreateTransaction = async (
  receiptId: string,
  receipt: Receipt,
  businessType: 'individual' | 'corporation',
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('レシート承認と取引作成を開始:', { receiptId, receipt, businessType, userId });
    
    // userIdが有効か確認
    if (!userId) {
      throw new Error('ユーザーIDが無効です');
    }
    
    // businessTypeが有効か確認
    if (!businessType) {
      throw new Error('業態情報が無効です');
    }
    
    // 1. レシートステータスを'approved'に更新
    const updatedReceipt = await updateReceiptStatus(receiptId, 'approved');
    if (!updatedReceipt) {
      throw new Error('レシートのステータス更新に失敗しました');
    }

    // 2. トランザクションデータの準備
    const transactionData = {
      item: receipt.merchant,
      amount: receipt.amount,
      date: receipt.date,
      category: receipt.category,
      type: 'expense', // 支出として記録
      description: receipt.description || `${receipt.merchant}でのレシート`,
      receipt_url: null, // 必要に応じて画像URLを設定
      creator: userId,
      tags: ['receipt_created'],
      location: null,
      recurring: false,
      recurring_frequency: null as any,
    };

    // 3. 事業タイプに応じて適切なテーブルに保存
    const tableName = businessType === 'individual' 
      ? 'individual_transactions' 
      : 'corporation_transactions';

    const transactionPayload = businessType === 'corporation'
      ? {
          ...transactionData,
          department: null,
          project_code: null,
          approval_status: 'approved' as const,
        }
      : transactionData;

    console.log('トランザクションを保存中:', { tableName, transactionPayload });
    
    // トランザクションを保存
    const { data: transactionResult, error: transactionError } = await supabase
      .from(tableName)
      .insert([transactionPayload])
      .select()
      .single();

    if (transactionError) {
      console.error('トランザクション保存エラー:', transactionError);
      console.error('テーブル名:', tableName);
      console.error('ペイロード:', transactionPayload);
      throw new Error(`${tableName}への保存に失敗しました: ${transactionError.message}`);
    }

    console.log(`${tableName}に保存成功:`, transactionResult);

    // 4. AI処理結果をai_transactionsテーブルに保存
    const aiTransactionData = {
      item: receipt.merchant,
      amount: receipt.amount,
      category: receipt.category,
      confidence: receipt.confidence,
      ai_category: mapToAiCategory(receipt.category),
      manual_verified: true, // 承認されたのでtrue
      original_text: receipt.description || '',
      receipt_url: null,
      location: null,
      creator: userId,
      ai_suggestions: [],
      learning_feedback: `承認済み: 信頼度${receipt.confidence}%`,
      processing_time: null,
    };

    console.log('AIトランザクションを保存中:', { aiTransactionData });
    const { data: aiResult, error: aiError } = await supabase
      .from('ai_transactions')
      .insert([aiTransactionData])
      .select()
      .single();

    if (aiError) {
      console.warn('AI トランザクション保存エラー（警告のみ）:', aiError);
      // AI保存は失敗してもメイン処理は継続
    } else {
      console.log('ai_transactionsに保存成功:', aiResult);
    }

    return { success: true };
  } catch (error) {
    console.error('approveReceiptAndCreateTransaction エラー:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '不明なエラーが発生しました',
    };
  }
};

/**
 * カテゴリをAIカテゴリにマッピング
 */
const mapToAiCategory = (category: string): '交通費' | '食費' | '消耗品費' | '通信費' | '光熱費' | 'その他' => {
  const categoryMap: Record<string, '交通費' | '食費' | '消耗品費' | '通信費' | '光熱費' | 'その他'> = {
    '旅費交通費': '交通費',
    '交通費': '交通費',
    '接待交際費': '食費',
    '食費': '食費',
    '消耗品費': '消耗品費',
    '通信費': '通信費',
    '水道光熱費': '光熱費',
    '光熱費': '光熱費',
  };

  return categoryMap[category] || 'その他';
};
