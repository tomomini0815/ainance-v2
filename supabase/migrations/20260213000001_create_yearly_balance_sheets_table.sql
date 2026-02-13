-- yearly_balance_sheetsテーブルの作成
CREATE TABLE IF NOT EXISTS yearly_balance_sheets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  business_type VARCHAR(20) NOT NULL CHECK (business_type IN ('individual', 'corporation')),
  year INTEGER NOT NULL,
  
  -- 資産の部
  assets_current_cash BIGINT DEFAULT 0, -- 現金及び預金
  assets_current_total BIGINT DEFAULT 0, -- 流動資産合計
  assets_total BIGINT DEFAULT 0, -- 資産の部合計
  
  -- 負債の部
  liabilities_total BIGINT DEFAULT 0, -- 負債の部合計 (流動+固定)
  
  -- 純資産の部
  net_assets_capital BIGINT DEFAULT 0, -- 資本金
  net_assets_retained_earnings BIGINT DEFAULT 0, -- 繰越利益剰余金
  net_assets_retained_earnings_total BIGINT DEFAULT 0, -- 利益剰余金合計/その他利益剰余金合計
  net_assets_shareholders_equity BIGINT DEFAULT 0, -- 株主資本合計
  net_assets_total BIGINT DEFAULT 0, -- 純資産の部合計
  
  -- 負債及び純資産の部
  liabilities_and_net_assets_total BIGINT DEFAULT 0, -- 負債及び純資産の部合計
  
  -- 管理情報
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 同じユーザー・業態・年度のデータは1件のみ
  UNIQUE(user_id, business_type, year)
);

-- RLS設定
ALTER TABLE yearly_balance_sheets ENABLE ROW LEVEL SECURITY;

-- ポリシー作成
CREATE POLICY "Users can view their own yearly balance sheets"
  ON yearly_balance_sheets FOR SELECT
  USING (auth.uid()::text = user_id OR user_id = '00000000-0000-0000-0000-000000000000');

CREATE POLICY "Users can insert their own yearly balance sheets"
  ON yearly_balance_sheets FOR INSERT
  WITH CHECK (auth.uid()::text = user_id OR user_id = '00000000-0000-0000-0000-000000000000');

CREATE POLICY "Users can update their own yearly balance sheets"
  ON yearly_balance_sheets FOR UPDATE
  USING (auth.uid()::text = user_id OR user_id = '00000000-0000-0000-0000-000000000000');

CREATE POLICY "Users can delete their own yearly balance sheets"
  ON yearly_balance_sheets FOR DELETE
  USING (auth.uid()::text = user_id OR user_id = '00000000-0000-0000-0000-000000000000');

-- インデックス作成
CREATE INDEX idx_yearly_balance_sheets_user_id ON yearly_balance_sheets(user_id);
CREATE INDEX idx_yearly_balance_sheets_year ON yearly_balance_sheets(year);
