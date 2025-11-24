-- 取引テーブルの作成
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item VARCHAR(255) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  date DATE NOT NULL,
  category VARCHAR(100) NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
  description TEXT,
  creator UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 取引テーブルのインデックス作成
CREATE INDEX idx_transactions_creator ON transactions(creator);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_category ON transactions(category);
CREATE INDEX idx_transactions_type ON transactions(type);

-- レシートテーブルの作成
CREATE TABLE receipts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  merchant VARCHAR(255) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  confidence INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  tax_rate DECIMAL(5, 2),
  confidence_scores JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- レシートテーブルのインデックス作成
CREATE INDEX idx_receipts_user_id ON receipts(user_id);
CREATE INDEX idx_receipts_date ON receipts(date);
CREATE INDEX idx_receipts_category ON receipts(category);
CREATE INDEX idx_receipts_status ON receipts(status);

-- 個人用取引テーブルの作成
CREATE TABLE individual_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item VARCHAR(255) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  date DATE NOT NULL,
  category VARCHAR(100) NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
  description TEXT,
  receipt_url TEXT,
  creator UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tags TEXT[],
  location TEXT,
  recurring BOOLEAN DEFAULT false,
  recurring_frequency VARCHAR(10) CHECK (recurring_frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
  approval_status VARCHAR(20) CHECK (approval_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 個人用取引テーブルのインデックス作成
CREATE INDEX idx_individual_transactions_creator ON individual_transactions(creator);
CREATE INDEX idx_individual_transactions_date ON individual_transactions(date);
CREATE INDEX idx_individual_transactions_category ON individual_transactions(category);
CREATE INDEX idx_individual_transactions_type ON individual_transactions(type);
CREATE INDEX idx_individual_transactions_approval_status ON individual_transactions(approval_status);

-- 法人用取引テーブルの作成
CREATE TABLE corporation_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item VARCHAR(255) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  date DATE NOT NULL,
  category VARCHAR(100) NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
  description TEXT,
  receipt_url TEXT,
  creator UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tags TEXT[],
  location TEXT,
  recurring BOOLEAN DEFAULT false,
  recurring_frequency VARCHAR(10) CHECK (recurring_frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
  department VARCHAR(100),
  project_code VARCHAR(50),
  approval_status VARCHAR(20) CHECK (approval_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 法人用取引テーブルのインデックス作成
CREATE INDEX idx_corporation_transactions_creator ON corporation_transactions(creator);
CREATE INDEX idx_corporation_transactions_date ON corporation_transactions(date);
CREATE INDEX idx_corporation_transactions_category ON corporation_transactions(category);
CREATE INDEX idx_corporation_transactions_type ON corporation_transactions(type);
CREATE INDEX idx_corporation_transactions_approval_status ON corporation_transactions(approval_status);

-- AI取引テーブルの作成
CREATE TABLE ai_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item VARCHAR(255) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  confidence INTEGER NOT NULL,
  ai_category VARCHAR(100) NOT NULL,
  manual_verified BOOLEAN DEFAULT false,
  original_text TEXT,
  receipt_url TEXT,
  location TEXT,
  creator UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ai_suggestions JSONB,
  learning_feedback TEXT,
  processing_time INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI取引テーブルのインデックス作成
CREATE INDEX idx_ai_transactions_creator ON ai_transactions(creator);
CREATE INDEX idx_ai_transactions_category ON ai_transactions(category);
CREATE INDEX idx_ai_transactions_manual_verified ON ai_transactions(manual_verified);