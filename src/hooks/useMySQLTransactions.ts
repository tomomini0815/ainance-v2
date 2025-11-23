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

export const useMySQLTransactions = (businessTypeId?: string) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  console.log('useMySQLTransactions - businessTypeId:', businessTypeId);

  // 業態形態情報を取得する関数
  const fetchBusinessType = useCallback(async () => {
    if (!businessTypeId) return null;

    try {
      const { data, error } = await supabase
        .from('business_type')
        .select('*')
        .eq('id', businessTypeId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('業態形態情報の取得に失敗しました:', error);
      return null;
    }
  }, [businessTypeId]);

  // 業態形態に応じてテーブル名を決定
  const getTableName = useCallback(async () => {
    // businessTypeIdがない場合はデフォルトのテーブル名を返す
    if (!businessTypeId) return 'individual_transactions';
    
    const businessTypeData = await fetchBusinessType();
    if (!businessTypeData) return 'individual_transactions'; // デフォルト
    
    return businessTypeData.business_type === 'corporation' ? 'corporation_transactions' : 'individual_transactions';
  }, [businessTypeId, fetchBusinessType]);

  // 取引データをSupabaseから取得
  const fetchTransactions = useCallback(async () => {
    // businessTypeIdがない場合は何もしない
    if (!businessTypeId) {
      console.log('businessTypeIdがありません。取引データをクリアします。');
      setTransactions([]);
      return;
    }

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
      const tableName = await getTableName();
      console.log('取引データを取得するテーブル:', tableName);
      console.log('ユーザーID:', userId);
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('creator', userId)
        .order('date', { ascending: false });

      if (error) {
        // テーブルが存在しない場合のエラー処理
        if (error.message && error.message.includes('not found')) {
          console.warn(`テーブル ${tableName} が存在しません。テーブルを作成するか、管理者に問い合わせてください。`);
          setTransactions([]);
        } else {
          throw error;
        }
      } else {
        console.log('取得した取引データ:', data);
        setTransactions(data || []);
      }
      setLoading(false);
    } catch (error: any) {
      console.error(`取引データの取得に失敗しました: ${error.message}`);
      setTransactions([]);
      setLoading(false);
    }
  }, [businessTypeId, getTableName]);

  // 新しい取引をSupabaseに保存
  const createTransaction = async (transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => {
    if (!businessTypeId) {
      throw new Error('業態形態が選択されていません');
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
        creator: transaction.creator || '00000000-0000-0000-0000-000000000000'
      };

      const tableName = await getTableName();
      console.log('取引データを保存中:', transactionWithCreator);
      console.log('保存するテーブル:', tableName);
      const { data, error } = await supabase
        .from(tableName)
        .insert(transactionWithCreator)
        .select()
        .single();

      if (error) {
        // テーブルが存在しない場合のエラー処理
        if (error.message && error.message.includes('not found')) {
          throw new Error(`テーブル ${tableName} が存在しません。テーブルを作成するか、管理者に問い合わせてください。`);
        } else {
          throw error;
        }
      }

      console.log('取引データ保存成功:', data.id);

      const newTransaction: Transaction = data;

      setTransactions(prev => [newTransaction, ...prev]);
      
      // データの再取得
      await fetchTransactions();
      
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
    if (!businessTypeId) {
      throw new Error('業態形態が選択されていません');
    }

    try {
      const tableName = await getTableName();
      const { data, error } = await supabase
        .from(tableName)
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
      
      // データの再取得
      await fetchTransactions();
    } catch (error) {
      console.error('取引の更新に失敗しました:', error);
      throw error;
    }
  };

  // 取引を削除
  const deleteTransaction = async (id: string) => {
    if (!businessTypeId) {
      throw new Error('業態形態が選択されていません');
    }

    try {
      const tableName = await getTableName();
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTransactions(prev => prev.filter(transaction => transaction.id !== id));
      
      // データの再取得
      await fetchTransactions();
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