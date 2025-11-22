-- individual_transactionsテーブルの作成
CREATE TABLE individual_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  date DATE NOT NULL,
  category VARCHAR(100) NOT NULL,
  type VARCHAR(100) NOT NULL,
  description TEXT,
  receipt_url VARCHAR(500),
  creator VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tags TEXT[],
  location VARCHAR(255),
  recurring BOOLEAN DEFAULT FALSE,
  recurring_frequency VARCHAR(20) CHECK (recurring_frequency IN ('daily', 'weekly', 'monthly', 'yearly'))
);

-- corporation_transactionsテーブルの作成
CREATE TABLE corporation_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  date DATE NOT NULL,
  category VARCHAR(100) NOT NULL,
  type VARCHAR(100) NOT NULL,
  description TEXT,
  receipt_url VARCHAR(500),
  creator VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tags TEXT[],
  location VARCHAR(255),
  recurring BOOLEAN DEFAULT FALSE,
  recurring_frequency VARCHAR(20) CHECK (recurring_frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
  department VARCHAR(255),
  project_code VARCHAR(100),
  approval_status VARCHAR(20) CHECK (approval_status IN ('pending', 'approved', 'rejected'))
);

-- ai_transactionsテーブルの作成（共通）
CREATE TABLE ai_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100),
  ai_category VARCHAR(100) CHECK (ai_category IN ('交通費', '食費', '消耗品費', '通信費', '光熱費', 'その他')),
  manual_verified BOOLEAN DEFAULT FALSE,
  original_text TEXT,
  receipt_url VARCHAR(500),
  location VARCHAR(255),
  creator VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ai_suggestions TEXT[],
  learning_feedback TEXT,
  processing_time DECIMAL(5, 2)
);

-- individual_transactionsテーブルのインデックス作成
CREATE INDEX idx_individual_transactions_date ON individual_transactions(date);
CREATE INDEX idx_individual_transactions_category ON individual_transactions(category);
CREATE INDEX idx_individual_transactions_creator ON individual_transactions(creator);

-- corporation_transactionsテーブルのインデックス作成
CREATE INDEX idx_corporation_transactions_date ON corporation_transactions(date);
CREATE INDEX idx_corporation_transactions_category ON corporation_transactions(category);
CREATE INDEX idx_corporation_transactions_creator ON corporation_transactions(creator);
CREATE INDEX idx_corporation_transactions_department ON corporation_transactions(department);
CREATE INDEX idx_corporation_transactions_approval_status ON corporation_transactions(approval_status);

-- ai_transactionsテーブルのインデックス作成
CREATE INDEX idx_ai_transactions_created_at ON ai_transactions(created_at);
CREATE INDEX idx_ai_transactions_confidence ON ai_transactions(confidence);
CREATE INDEX idx_ai_transactions_manual_verified ON ai_transactions(manual_verified);
CREATE INDEX idx_ai_transactions_creator ON ai_transactions(creator);