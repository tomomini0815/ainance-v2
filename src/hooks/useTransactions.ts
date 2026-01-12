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
      // DBのitemフィールドをdescriptionにマッピング（UIとの互換性のため）
      const transactionsWithDescription = (data || []).map((t: Transaction) => ({
        ...t,
        description: t.description || t.item  // descriptionがなければitemをdescriptionとして使用
      }));
      setTransactions(transactionsWithDescription);
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
      console.log('取引を更新中:', { id, updates, tableName });
      
      // creatorが無効な場合はエラーを表示
      if (updates.creator && updates.creator === '00000000-0000-0000-0000-000000000000') {
        console.error('無効なcreator IDが検出されました。');
        return { data: null, error: new Error('無効なユーザーIDです。ログインしていることを確認してください。') };
      }

      // creatorが既に設定されている場合は更新しない
      if (updates.creator) {
        delete updates.creator;
      }

      const { data, error } = await supabase
        .from(tableName)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedTransaction: Transaction = data;
      console.log('取引更新成功:', updatedTransaction);
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
      console.log('取引を削除中:', { id, tableName });
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;

      console.log('取引削除成功:', id);
      setTransactions(prev => prev.filter(transaction => transaction.id !== id));
      return { error: null };
    } catch (error) {
      console.error('取引の削除に失敗しました:', error);
      return { error: error as Error };
    }
  };

  // 取引を承認
  const approveTransaction = async (id: string): Promise<UpdateTransactionResult> => {
    if (!userId || !businessType) {
      console.error('取引承認エラー: ユーザーIDまたは業態形態が不足しています', { userId, businessType });
      return { data: null, error: new Error('ユーザーIDと業態形態が必要です') };
    }

    try {
      const tableName = getTableName();
      console.log('取引を承認中:', { id, tableName, userId, businessType });
      
      // まず、更新対象の取引が存在するか確認
      const { data: existingData, error: existingError } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .eq('creator', userId)
        .single();

      if (existingError) {
        console.error('取引検索エラー:', existingError);
        throw existingError;
      }

      if (!existingData) {
        console.error('取引が見つかりません:', { id, tableName, userId });
        throw new Error('取引が見つかりません');
      }

      console.log('更新対象の取引データ:', existingData);

      // 取引を承認状態に更新
      const { data, error } = await supabase
        .from(tableName)
        .update({ approval_status: 'approved', updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('creator', userId) // creatorも条件に追加してセキュリティを強化
        .select()
        .single();

      if (error) {
        console.error('取引承認エラー:', error);
        throw error;
      }

      const updatedTransaction: Transaction = data;
      console.log('取引承認成功:', updatedTransaction);
      
      // ローカル状態も更新
      setTransactions(prev =>
        prev.map(transaction =>
          transaction.id === id ? updatedTransaction : transaction
        )
      );

      // データの再取得を実行
      await fetchTransactions();

      return { data: updatedTransaction, error: null };
    } catch (error) {
      console.error('取引の承認に失敗しました:', error);
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
    approveTransaction // 承認処理を追加
  };
};