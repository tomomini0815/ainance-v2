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
}

// UUIDのバリデーション関数
const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const useMySQLTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  // 取引データをSupabaseから取得
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    
    // ログインユーザーの取得
    const storedUser = localStorage.getItem('user');
    let userId = '00000000-0000-0000-0000-000000000000'; // デフォルトの匿名ユーザーID
    
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        if (isValidUUID(userData.id)) {
          userId = userData.id;
        }
      } catch (error) {
        console.error('ユーザー情報の解析に失敗しました:', error);
      }
    }
    
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('creator', userId)
        .order('date', { ascending: false });

      if (error) throw error;

      setTransactions(data || []);
      setLoading(false);
    } catch (error: any) {
      console.error(`取引データの取得に失敗しました: ${error.message}`);
      setTransactions([]);
      setLoading(false);
    }
  }, []);

  // 新しい取引をSupabaseに保存
  const createTransaction = async (transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => {
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

      console.log('取引データを保存中:', transactionWithCreator);
      const { data, error } = await supabase
        .from('transactions')
        .insert(transactionWithCreator)
        .select()
        .single();

      if (error) throw error;

      console.log('取引データ保存成功:', data.id);
      
      const newTransaction: Transaction = data;
      
      setTransactions(prev => [newTransaction, ...prev]);
      return data.id;
    } catch (error: any) {
      console.error('取引の作成に失敗しました:', error);
      // ネットワークエラーの場合、より具体的なメッセージを表示
      if (error.message && error.message.includes('Failed to fetch')) {
        throw new Error('ネットワークエラーが発生しました。インターネット接続を確認してください。');
      }
      throw error;
    }
  };

  // 取引を更新
  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update({ ...updates, updated_at: new Date().toISOString() })
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
    } catch (error) {
      console.error('取引の更新に失敗しました:', error);
      throw error;
    }
  };

  // 取引を削除
  const deleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setTransactions(prev => prev.filter(transaction => transaction.id !== id));
    } catch (error) {
      console.error('取引の削除に失敗しました:', error);
      throw error;
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