import { createClient } from '@supabase/supabase-js'

// SupabaseのURLと匿名キーを環境変数から取得
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Supabaseクライアントの作成
export const supabase = createClient(supabaseUrl, supabaseAnonKey)