-- individual_transactionsテーブルのRLSを有効化
ALTER TABLE individual_transactions ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除（重複防止）
DROP POLICY IF EXISTS "Users can view their own individual transactions" ON individual_transactions;
DROP POLICY IF EXISTS "Users can insert their own individual transactions" ON individual_transactions;
DROP POLICY IF EXISTS "Users can update their own individual transactions" ON individual_transactions;
DROP POLICY IF EXISTS "Users can delete their own individual transactions" ON individual_transactions;

-- SELECTポリシー
CREATE POLICY "Users can view their own individual transactions"
ON individual_transactions FOR SELECT
USING (auth.uid()::text = creator);

-- INSERTポリシー
CREATE POLICY "Users can insert their own individual transactions"
ON individual_transactions FOR INSERT
WITH CHECK (auth.uid()::text = creator);

-- UPDATEポリシー
CREATE POLICY "Users can update their own individual transactions"
ON individual_transactions FOR UPDATE
USING (auth.uid()::text = creator);

-- DELETEポリシー
CREATE POLICY "Users can delete their own individual transactions"
ON individual_transactions FOR DELETE
USING (auth.uid()::text = creator);

-- corporation_transactionsテーブルのRLSを有効化
ALTER TABLE corporation_transactions ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除（重複防止）
DROP POLICY IF EXISTS "Users can view their own corporation transactions" ON corporation_transactions;
DROP POLICY IF EXISTS "Users can insert their own corporation transactions" ON corporation_transactions;
DROP POLICY IF EXISTS "Users can update their own corporation transactions" ON corporation_transactions;
DROP POLICY IF EXISTS "Users can delete their own corporation transactions" ON corporation_transactions;

-- SELECTポリシー
CREATE POLICY "Users can view their own corporation transactions"
ON corporation_transactions FOR SELECT
USING (auth.uid()::text = creator);

-- INSERTポリシー
CREATE POLICY "Users can insert their own corporation transactions"
ON corporation_transactions FOR INSERT
WITH CHECK (auth.uid()::text = creator);

-- UPDATEポリシー
CREATE POLICY "Users can update their own corporation transactions"
ON corporation_transactions FOR UPDATE
USING (auth.uid()::text = creator);

-- DELETEポリシー
CREATE POLICY "Users can delete their own corporation transactions"
ON corporation_transactions FOR DELETE
USING (auth.uid()::text = creator);