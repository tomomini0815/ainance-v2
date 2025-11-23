import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

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
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('creator', userId)
        .order('date', { ascending: false });

      if (error) throw error;

      setTransactions(data || []);
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
      // creatorが有効なUUIDであることを確認
      if (!isValidUUID(transaction.creator)) {
        console.warn('無効なcreator IDが検出されました。匿名ユーザーとして処理します。');
        transaction.creator = '00000000-0000-0000-0000-000000000000'; // ダミーのUUID
      }

      // creatorが空の場合、デフォルト値を設定
      const transactionWithCreator = {
        ...transaction,
        creator: transaction.creator || '00000000-0000-0000-0000-000000000000',
      };

      const tableName = getTableName();
      console.log('createTransaction - テーブル名:', tableName);
      console.log('createTransaction - 保存するデータ:', transactionWithCreator);
      
      const { data, error } = await supabase
        .from(tableName)
        .insert(transactionWithCreator)
        .select()
        .single();

      console.log('createTransaction - Supabaseからの応答:', { data, error });

      if (error) throw error;

      const newTransaction: Transaction = data;
      setTransactions(prev => [newTransaction, ...prev]);
      console.log('createTransaction - 新しい取引をローカル状態に追加しました:', newTransaction);
      return { data: newTransaction, error: null };
    } catch (error: any) {
      console.error('取引の作成に失敗しました:', error);
      // ネットワークエラーの場合、より具体的なメッセージを表示
      if (error.message && error.message.includes('Failed to fetch')) {
        return { data: null, error: new Error('ネットワークエラーが発生しました。インターネット接続を確認してください。') };
      }
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
      const { data, error } = await supabase
        .from(tableName)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedTransaction: Transaction = data;
      setTransactions(prev =>
        prev.map(transaction =>
          transaction.id === id ? updatedTransaction : transaction
        )
      );

      return { data: updatedTransaction, error: null };
    } catch (error) {
      console.error('取引の更新に失敗しました:', error);
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

      setTransactions(prev => prev.filter(transaction => transaction.id !== id));
      return { error: null };
    } catch (error) {
      console.error('取引の削除に失敗しました:', error);
      return { error: error as Error };
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
    deleteTransaction
  };
};