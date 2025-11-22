-- business_typeテーブルの作成
CREATE TABLE business_type (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  business_type VARCHAR(20) NOT NULL CHECK (business_type IN ('individual', 'corporation')),
  company_name VARCHAR(255) NOT NULL,
  tax_number VARCHAR(255),
  address VARCHAR(500),
  phone VARCHAR(50),
  email VARCHAR(255),
  representative_name VARCHAR(255),
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- business_typeテーブルのインデックス作成
CREATE INDEX idx_business_type_user_id ON business_type(user_id);
CREATE INDEX idx_business_type_is_active ON business_type(is_active);
CREATE INDEX idx_business_type_created_at ON business_type(created_at);