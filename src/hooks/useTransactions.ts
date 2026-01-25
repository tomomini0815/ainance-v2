import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

interface Transaction {
  id: string;
  item: string;
  amount: number;
  date: string;
  category: string;
  type: 'income' | 'expense';
  description?: string;
  receipt_url?: string;
  creator: string;
  created_at?: string;
  updated_at?: string;
  tags?: string[];
  location?: string;
  recurring?: boolean;
  recurring_frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurring_end_date?: string;
  // 法人用追加フィールド
  department?: string;
  project_code?: string;
  approval_status?: 'pending' | 'approved' | 'rejected';
}

interface CreateTransactionResult {
  data: Transaction | null;
  error: Error | null;
}

interface UpdateTransactionResult {
  data: Transaction | null;
  error: Error | null;
}

interface DeleteTransactionResult {
  error: Error | null;
}

interface UseTransactionsReturn {
  transactions: Transaction[];
  loading: boolean;
  fetchTransactions: () => Promise<void>;
  createTransaction: (transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => Promise<CreateTransactionResult>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<UpdateTransactionResult>;
  deleteTransaction: (id: string) => Promise<DeleteTransactionResult>;
  approveTransaction: (id: string) => Promise<UpdateTransactionResult>; // 承認処理を追加
}

// UUIDのバリデーション関数
const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const useTransactions = (userId?: string, businessType?: 'individual' | 'corporation') => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  // 業態形態に応じてテーブル名を決定
  const getTableName = useCallback(() => {
    return businessType === 'corporation' ? 'corporation_transactions' : 'individual_transactions';
  }, [businessType]);

  // 取引データをSupabaseから取得
  const fetchTransactions = useCallback(async () => {
    if (!userId || !businessType) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const tableName = getTableName();

    try {
      console.log('取引データを取得中:', { userId, businessType, tableName });
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('creator', userId)
        .order('date', { ascending: false });

      if (error) throw error;

      console.log('取引データ取得成功:', { count: data?.length, data, tableName });
      
      // データの正規化: amountを数値に変換し、descriptionをマッピング
      const normalizedTransactions = (data || []).map((t: any) => {
        let amount = t.amount;
        if (typeof amount === 'string') {
          // カンマを除去してパース
          amount = parseFloat(amount.replace(/,/g, ''));
        } else if (typeof amount === 'object' && amount !== null) {
          // オブジェクトの場合はvalueやamountプロパティを探す
          amount = parseFloat(String(amount.value || amount.amount || amount.number || 0).replace(/,/g, ''));
        }
        
        return {
          ...t,
          amount: isNaN(amount) ? 0 : amount,
          description: t.description || t.item
        };
      });
      
      setTransactions(normalizedTransactions);
      setLoading(false);
    } catch (error) {
      console.error(`取引データの取得に失敗しました: ${error}`);
      setTransactions([]);
      setLoading(false);
    }
  }, [userId, businessType, getTableName]);

  // 新しい取引をSupabaseに保存
  const createTransaction = async (transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<CreateTransactionResult> => {
    console.log('createTransaction - 開始:', transaction);
    if (!userId || !businessType) {
      console.log('createTransaction - ユーザーIDまたはビジネスタイプがありません:', { userId, businessType });
      return { data: null, error: new Error('ユーザーIDと業態形態が必要です') };
    }

    try {
      // 数値化の確認
      const amountValue = typeof transaction.amount === 'string' 
        ? parseFloat((transaction.amount as string).replace(/,/g, '')) 
        : transaction.amount;

      // creatorが有効なUUIDであることを確認
      let creatorId = transaction.creator;
      if (!isValidUUID(creatorId)) {
        console.warn('無効なcreator IDが検出されました。匿名ユーザーとして処理します。');
        creatorId = '00000000-0000-0000-0000-000000000000'; // ダミーのUUID
      }

      const { recurring_end_date, ...restOfTransaction } = transaction;

      const transactionPayload = {
        ...restOfTransaction,
        amount: isNaN(amountValue) ? 0 : amountValue,
        creator: creatorId,
      };

      const tableName = getTableName();
      console.log('createTransaction - 保存するデータ:', transactionPayload);
      
      let createdData;
      
      if (transaction.recurring && transaction.recurring_end_date) {
        // 繰り返しデータの生成
        const bulkData = [transactionPayload];
        const startDate = new Date(transaction.date);
        const endDate = new Date(transaction.recurring_end_date);
        let nextDate = new Date(startDate);

        while (true) {
          if (transaction.recurring_frequency === 'daily') {
            nextDate.setDate(nextDate.getDate() + 1);
          } else if (transaction.recurring_frequency === 'weekly') {
            nextDate.setDate(nextDate.getDate() + 7);
          } else if (transaction.recurring_frequency === 'monthly') {
            nextDate.setMonth(nextDate.getMonth() + 1);
          } else if (transaction.recurring_frequency === 'yearly') {
            nextDate.setFullYear(nextDate.getFullYear() + 1);
          }

          if (nextDate > endDate) break;

          bulkData.push({
            ...transactionPayload,
            date: nextDate.toISOString().split('T')[0]
          });
        }

        console.log(`createTransaction - 一括保存実行 (${bulkData.length}件):`, bulkData);
        const { data, error } = await supabase
          .from(tableName)
          .insert(bulkData)
          .select();
        
        if (error) throw error;
        createdData = data;
        toast.success(`${bulkData.length}件の取引を記録しました`);
      } else {
        const { data, error } = await supabase
          .from(tableName)
          .insert(transactionPayload)
          .select()
          .single();

        if (error) throw error;
        createdData = [data]; // 配列に統一
        toast.success('取引を記録しました');
      }

      // ローカル状態も正規化して追加
      const normalizedNew = (createdData || []).map((d: any) => ({
        ...d,
        amount: Number(d.amount),
        description: d.description || d.item
      }));
      
      setTransactions(prev => [...normalizedNew, ...prev]);
      return { data: normalizedNew[0], error: null };
    } catch (error: any) {
      console.error('取引の作成に失敗しました:', error);
      toast.error('取引の作成に失敗しました');
      return { data: null, error };
    }
  };

  // 取引を更新
  const updateTransaction = async (id: string, updates: Partial<Transaction>): Promise<UpdateTransactionResult> => {
    if (!userId || !businessType) {
      return { data: null, error: new Error('ユーザーIDと業態形態が必要です') };
    }

    try {
      const tableName = getTableName();
      
      // creatorとrecurring_end_dateはDBカラムにないので除外
      const finalUpdates = { ...updates };
      if (finalUpdates.creator) {
        delete (finalUpdates as any).creator;
      }
      if ((finalUpdates as any).recurring_end_date) {
        delete (finalUpdates as any).recurring_end_date;
      }

      // 金額の正規化（もしあれば）
      if (finalUpdates.amount !== undefined) {
        if (typeof finalUpdates.amount === 'string') {
          finalUpdates.amount = parseFloat((finalUpdates.amount as string).replace(/,/g, ''));
        }
        if (isNaN(finalUpdates.amount as any)) finalUpdates.amount = 0;
      }

      const { data, error } = await supabase
        .from(tableName)
        .update(finalUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedTransaction: Transaction = data;
      setTransactions(prev =>
        prev.map(t => t.id === id ? { ...updatedTransaction, amount: Number(updatedTransaction.amount) } : t)
      );
      toast.success('取引を更新しました');
      return { data: updatedTransaction, error: null };
    } catch (error) {
      console.error('取引の更新に失敗しました:', error);
      toast.error('取引の更新に失敗しました');
      return { data: null, error: error as Error };
    }
  };

  // 取引を削除
  const deleteTransaction = async (id: string): Promise<DeleteTransactionResult> => {
    if (!userId || !businessType) {
      return { error: new Error('ユーザーIDと業態形態が必要です') };
    }

    try {
      const tableName = getTableName();
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTransactions(prev => prev.filter(t => t.id !== id));
      toast.success('取引を削除しました');
      return { error: null };
    } catch (error) {
      console.error('取引の削除に失敗しました:', error);
      toast.error('取引の削除に失敗しました');
      return { error: error as Error };
    }
  };

  // 取引を承認
  const approveTransaction = async (id: string): Promise<UpdateTransactionResult> => {
    if (!userId || !businessType) {
      return { data: null, error: new Error('ユーザーIDと業態形態が必要です') };
    }

    try {
      const tableName = getTableName();
      const { data, error } = await supabase
        .from(tableName)
        .update({ approval_status: 'approved', updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('creator', userId)
        .select()
        .single();

      if (error) throw error;

      const updatedTransaction: Transaction = data;
      setTransactions(prev =>
        prev.map(t => t.id === id ? { ...updatedTransaction, amount: Number(updatedTransaction.amount) } : t)
      );
      toast.success('取引を承認しました');
      return { data: updatedTransaction, error: null };
    } catch (error) {
      console.error('取引の承認に失敗しました:', error);
      toast.error('取引の承認に失敗しました');
      return { data: null, error: error as Error };
    }
  };

  // 初期読み込み
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions,
    loading,
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    approveTransaction
  };
};