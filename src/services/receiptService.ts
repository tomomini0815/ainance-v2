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
    const { data, error } = await supabase
      .from('receipts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('レシート取得エラー:', error);
      throw error;
    }

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
  return updateReceipt(id, { status });
};
