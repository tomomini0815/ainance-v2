import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

interface AITransaction {
  id: string;
  item: string;
  amount: number;
  category: string;
  confidence: number;
  ai_category: string;
  manual_verified: boolean;
  original_text?: string;
  receipt_url?: string;
  location?: string;
  creator: string;
  created_at?: string;
  updated_at?: string;
  ai_suggestions?: string[];
  learning_feedback?: string;
  processing_time?: number;
}

export const useMySQLAITransactions = () => {
  const [aiTransactions, setAiTransactions] = useState<AITransaction[]>([]);
  const [loading, setLoading] = useState(false);

  // AI取引データをSupabaseから取得
  const fetchAITransactions = useCallback(() => {
    setLoading(true);
    
    const subscription = supabase
      .from('ai_transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error(`AI取引データの取得に失敗しました: ${error.message}`);
          setAiTransactions([]);
        } else {
          setAiTransactions(data || []);
        }
        setLoading(false);
      });

    return () => {
      // Supabaseのサブスクリプションを解除する処理が必要な場合はここに記述
    };
  }, []);

  // AI取引を確認（承認/却下）
  const verifyAITransaction = async (id: string, verified: boolean, feedback?: string) => {
    try {
      const { data, error } = await supabase
        .from('ai_transactions')
        .update({ 
          manual_verified: verified, 
          learning_feedback: feedback, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      console.log(verified ? 'AI分類を承認しました' : 'AI分類を却下しました');

      // ローカルステートも更新
      setAiTransactions(prev =>
        prev.map(transaction =>
          transaction.id === id ? { ...transaction, manual_verified: verified } : transaction
        )
      );
    } catch (error) {
      console.error('AI取引の確認に失敗しました:', error);
      throw error;
    }
  };

  // 初期読み込み
  useEffect(() => {
    const unsubscribe = fetchAITransactions();
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [fetchAITransactions]);

  return {
    aiTransactions,
    loading,
    fetchAITransactions,
    verifyAITransaction
  };
};