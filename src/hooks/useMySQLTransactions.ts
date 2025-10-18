import { useState, useEffect } from 'react';
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
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) {
        throw new Error(`取引データの取得に失敗しました: ${error.message}`);
      }
      
      setTransactions(data || []);
    } catch (error) {
      console.error('取引データの取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('transactions')
        .insert([transactionWithCreator])
        .select()
        .single();
      
      if (error) {
        throw new Error(`取引の作成に失敗しました: ${error.message}`);
      }
      
      if (data) {
        setTransactions(prev => [data, ...prev]);
        return data.id;
      }
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
      
      if (error) {
        throw new Error(`取引の更新に失敗しました: ${error.message}`);
      }
      
      if (data) {
        setTransactions(prev => 
          prev.map(transaction => 
            transaction.id === id ? { ...transaction, ...data } : transaction
          )
        );
      }
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
      
      if (error) {
        throw new Error(`取引の削除に失敗しました: ${error.message}`);
      }
      
      setTransactions(prev => prev.filter(transaction => transaction.id !== id));
    } catch (error) {
      console.error('取引の削除に失敗しました:', error);
      throw error;
    }
  };

  // 初期読み込み
  useEffect(() => {
    fetchTransactions();
  }, []);

  return {
    transactions,
    loading,
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction
  };
};