-- yearly_settlementsテーブルの作成
CREATE TABLE IF NOT EXISTS yearly_settlements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  business_type VARCHAR(20) NOT NULL CHECK (business_type IN ('individual', 'corporation')),
  year INTEGER NOT NULL,
  revenue BIGINT DEFAULT 0,
  cost_of_sales BIGINT DEFAULT 0,
  operating_expenses BIGINT DEFAULT 0,
  non_operating_income BIGINT DEFAULT 0,
  non_operating_expenses BIGINT DEFAULT 0,
  extraordinary_income BIGINT DEFAULT 0,
  extraordinary_loss BIGINT DEFAULT 0,
  income_before_tax BIGINT DEFAULT 0,
  net_income BIGINT DEFAULT 0,
  category_breakdown JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- 同じユーザー・業態・年度のデータは1件のみ
  UNIQUE(user_id, business_type, year)
);

-- RLS設定
ALTER TABLE yearly_settlements ENABLE ROW LEVEL SECURITY;

-- ポリシー作成
CREATE POLICY "Users can view their own yearly settlements"
  ON yearly_settlements FOR SELECT
  USING (auth.uid()::text = user_id OR user_id = '00000000-0000-0000-0000-000000000000');

CREATE POLICY "Users can insert their own yearly settlements"
  ON yearly_settlements FOR INSERT
  WITH CHECK (auth.uid()::text = user_id OR user_id = '00000000-0000-0000-0000-000000000000');

CREATE POLICY "Users can update their own yearly settlements"
  ON yearly_settlements FOR UPDATE
  USING (auth.uid()::text = user_id OR user_id = '00000000-0000-0000-0000-000000000000');

CREATE POLICY "Users can delete their own yearly settlements"
  ON yearly_settlements FOR DELETE
  USING (auth.uid()::text = user_id OR user_id = '00000000-0000-0000-0000-000000000000');

-- インデックス作成
CREATE INDEX idx_yearly_settlements_user_id ON yearly_settlements(user_id);
CREATE INDEX idx_yearly_settlements_year ON yearly_settlements(year);
