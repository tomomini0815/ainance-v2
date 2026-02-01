-- individual_transactionsテーブルのRLSポリシー
ALTER TABLE individual_transactions ENABLE ROW LEVEL SECURITY;

-- 個人ユーザーが自分の取引データのみを操作できるようにする
CREATE POLICY "個人ユーザーは自分の取引データを操作可能" 
ON individual_transactions 
FOR ALL 
USING (auth.uid()::text = creator)
WITH CHECK (auth.uid()::text = creator);

-- corporation_transactionsテーブルのRLSポリシー
ALTER TABLE corporation_transactions ENABLE ROW LEVEL SECURITY;

-- 法人ユーザーが自分の取引データのみを操作できるようにする
CREATE POLICY "法人ユーザーは自分の取引データを操作可能" 
ON corporation_transactions 
FOR ALL 
USING (auth.uid()::text = creator)
WITH CHECK (auth.uid()::text = creator);

-- ai_transactionsテーブルのRLSポリシー
ALTER TABLE ai_transactions ENABLE ROW LEVEL SECURITY;

-- ユーザーが自分のAI取引データのみを操作できるようにする
CREATE POLICY "ユーザーは自分のAI取引データを操作可能" 
ON ai_transactions 
FOR ALL 
USING (auth.uid()::text = creator)
WITH CHECK (auth.uid()::text = creator);
