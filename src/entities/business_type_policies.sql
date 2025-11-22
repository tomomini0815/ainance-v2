-- RLSを有効化
ALTER TABLE business_type ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除（重複防止）
DROP POLICY IF EXISTS "Users can view their own business types" ON business_type;
DROP POLICY IF EXISTS "Users can insert their own business types" ON business_type;
DROP POLICY IF EXISTS "Users can update their own business types" ON business_type;
DROP POLICY IF EXISTS "Users can delete their own business types" ON business_type;

-- SELECTポリシー
CREATE POLICY "Users can view their own business types"
ON business_type FOR SELECT
USING (auth.uid()::text = user_id);

-- INSERTポリシー
CREATE POLICY "Users can insert their own business types"
ON business_type FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

-- UPDATEポリシー
CREATE POLICY "Users can update their own business types"
ON business_type FOR UPDATE
USING (auth.uid()::text = user_id);

-- DELETEポリシー
CREATE POLICY "Users can delete their own business types"
ON business_type FOR DELETE
USING (auth.uid()::text = user_id);
