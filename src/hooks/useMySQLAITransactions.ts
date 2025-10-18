import { useState, useEffect } from 'react';
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
  const fetchAITransactions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_transactions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw new Error(`AI取引データの取得に失敗しました: ${error.message}`);
      }
      
      setAiTransactions(data || []);
    } catch (error) {
      console.error('AI取引データの取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  // AI取引を確認（承認/却下）
  const verifyAITransaction = async (id: string, verified: boolean, feedback?: string) => {
    try {
      const { data, error } = await supabase
        .from('ai_transactions')
        .update({ manual_verified: verified, learning_feedback: feedback, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw new Error(`AI取引の確認に失敗しました: ${error.message}`);
      }
      
      if (data) {
        console.log(verified ? 'AI分類を承認しました' : 'AI分類を却下しました');
        
        // ローカルステートも更新
        setAiTransactions(prev => 
          prev.map(transaction => 
            transaction.id === id ? { ...transaction, manual_verified: verified } : transaction
          )
        );
      }
    } catch (error) {
      console.error('AI取引の確認に失敗しました:', error);
      throw error;
    }
  };

  // 初期読み込み
  useEffect(() => {
    fetchAITransactions();
  }, []);

  return {
    aiTransactions,
    loading,
    fetchAITransactions,
    verifyAITransaction
  };
};