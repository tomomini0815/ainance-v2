import { createClient } from '@supabase/supabase-js'

// SupabaseプロジェクトのURLとanonキー
const supabaseUrl = 'https://naglswzaljvnoazkasfr.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hZ2xzd3phbGp2bm9hemthc2ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NjQyMjgsImV4cCI6MjA3NjI0MDIyOH0.uZC9KmpavWV3GC4hyVUn5ndfDoxGU8LDplxQNnKEgv0'

// Supabaseクライアントの作成
export const supabase = createClient(supabaseUrl, supabaseAnonKey)