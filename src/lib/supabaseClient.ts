import { createClient } from '@supabase/supabase-js'

// SupabaseプロジェクトのURLとanonキー
const supabaseUrl = 'https://naglswzaljvnoazkasfr.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hZ2xzd3phbGp2bm9hemthc2ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NjQyMjgsImV4cCI6MjA3NjI0MDIyOH0.uZC9KmpavWV3GC4hyVUn5ndfDoxGU8LDplxQNnKEgv0'

// Supabaseクライアントの作成
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// データベース接続テスト関数
export const testDatabaseConnection = async () => {
  try {
    console.log('データベース接続テストを開始します...');
    
    // 現在のセッションを取得
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('セッション取得エラー:', sessionError);
      return { success: false, error: sessionError.message };
    }
    
    console.log('セッション情報:', session);
    
    // ユーザーが認証されているか確認
    if (!session?.user) {
      console.error('ユーザーが認証されていません');
      return { success: false, error: 'ユーザーが認証されていません' };
    }
    
    const userId = session.user.id;
    console.log('ユーザーID:', userId);
    
    // テスト用の簡単なクエリを実行
    const { data, error } = await supabase
      .from('individual_transactions')
      .select('id')
      .eq('creator', userId)
      .limit(1);
    
    if (error) {
      console.error('テストクエリエラー:', error);
      return { success: false, error: error.message };
    }
    
    console.log('テストクエリ成功:', data);
    return { success: true, data };
  } catch (error) {
    console.error('データベース接続テストエラー:', error);
    return { success: false, error: error instanceof Error ? error.message : '不明なエラー' };
  }
};