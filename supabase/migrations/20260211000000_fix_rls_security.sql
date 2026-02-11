-- 型の不一致(UUID vs Text)を修正した最終版SQLです。
-- カラムの型に合わせて比較方法を最適化しています。

-- 1. transactions (creator: UUID)
DO $$ BEGIN IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename  = 'transactions') THEN
    ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
    DROP POLICY IF EXISTS "Users can insert their own transactions" ON transactions;
    DROP POLICY IF EXISTS "Users can update their own transactions" ON transactions;
    DROP POLICY IF EXISTS "Users can delete their own transactions" ON transactions;
    CREATE POLICY "Users can view their own transactions" ON transactions FOR SELECT USING (auth.uid() = creator);
    CREATE POLICY "Users can insert their own transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() = creator);
    CREATE POLICY "Users can update their own transactions" ON transactions FOR UPDATE USING (auth.uid() = creator);
    CREATE POLICY "Users can delete their own transactions" ON transactions FOR DELETE USING (auth.uid() = creator);
END IF; END $$;

-- 2. individual_transactions (creator: UUID)
DO $$ BEGIN IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename  = 'individual_transactions') THEN
    ALTER TABLE individual_transactions ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can manage their own individual transactions" ON individual_transactions;
    CREATE POLICY "Users can manage their own individual transactions" ON individual_transactions FOR ALL USING (auth.uid() = creator) WITH CHECK (auth.uid() = creator);
END IF; END $$;

-- 3. corporation_transactions (creator: UUID)
DO $$ BEGIN IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename  = 'corporation_transactions') THEN
    ALTER TABLE corporation_transactions ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can manage their own corporation transactions" ON corporation_transactions;
    CREATE POLICY "Users can manage their own corporation transactions" ON corporation_transactions FOR ALL USING (auth.uid() = creator) WITH CHECK (auth.uid() = creator);
END IF; END $$;

-- 4. receipts (user_id: UUID)
DO $$ BEGIN IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename  = 'receipts') THEN
    ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can view their own receipts" ON receipts;
    DROP POLICY IF EXISTS "Users can insert their own receipts" ON receipts;
    DROP POLICY IF EXISTS "Users can update their own receipts" ON receipts;
    DROP POLICY IF EXISTS "Users can delete their own receipts" ON receipts;
    CREATE POLICY "Users can view their own receipts" ON receipts FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can insert their own receipts" ON receipts FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can update their own receipts" ON receipts FOR UPDATE USING (auth.uid() = user_id);
    CREATE POLICY "Users can delete their own receipts" ON receipts FOR DELETE USING (auth.uid() = user_id);
END IF; END $$;

-- 5. ai_transactions (creator: UUID)
DO $$ BEGIN IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename  = 'ai_transactions') THEN
    ALTER TABLE ai_transactions ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can manage their own ai transactions" ON ai_transactions;
    CREATE POLICY "Users can manage their own ai transactions" ON ai_transactions FOR ALL USING (auth.uid() = creator) WITH CHECK (auth.uid() = creator);
END IF; END $$;

-- 6. profiles (id: UUID)
DO $$ BEGIN IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename  = 'profiles') THEN
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can manage their own profiles" ON profiles;
    CREATE POLICY "Users can manage their own profiles" ON profiles FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
END IF; END $$;

-- 7. business_type (user_id: VARCHAR) -> textへのキャストが必要
DO $$ BEGIN IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename  = 'business_type') THEN
    ALTER TABLE business_type ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can manage their own business type" ON business_type;
    CREATE POLICY "Users can manage their own business type" ON business_type FOR ALL USING (auth.uid()::text = user_id::text) WITH CHECK (auth.uid()::text = user_id::text);
END IF; END $$;

-- 8. individual_invoices (user_id: VARCHAR) -> textへのキャストが必要
DO $$ BEGIN IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename  = 'individual_invoices') THEN
    ALTER TABLE individual_invoices ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can manage their own individual invoices" ON individual_invoices;
    CREATE POLICY "Users can manage their own individual invoices" ON individual_invoices FOR ALL USING (auth.uid()::text = user_id::text) WITH CHECK (auth.uid()::text = user_id::text);
END IF; END $$;

-- 9. corporation_invoices (user_id: VARCHAR) -> textへのキャストが必要
DO $$ BEGIN IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename  = 'corporation_invoices') THEN
    ALTER TABLE corporation_invoices ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can manage their own corporation invoices" ON corporation_invoices;
    CREATE POLICY "Users can manage their own corporation invoices" ON corporation_invoices FOR ALL USING (auth.uid()::text = user_id::text) WITH CHECK (auth.uid()::text = user_id::text);
END IF; END $$;
