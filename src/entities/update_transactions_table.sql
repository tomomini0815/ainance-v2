-- transactionsテーブルにbusiness_type_idカラムを追加
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS business_type_id UUID REFERENCES business_type(id);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_transactions_business_type_id ON transactions(business_type_id);
