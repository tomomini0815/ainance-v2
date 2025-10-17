-- transactionsテーブルの作成
CREATE TABLE transactions (
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

-- ai_transactionsテーブルの作成
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

-- transactionsテーブルのインデックス作成
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_category ON transactions(category);
CREATE INDEX idx_transactions_creator ON transactions(creator);

-- ai_transactionsテーブルのインデックス作成
CREATE INDEX idx_ai_transactions_created_at ON ai_transactions(created_at);
CREATE INDEX idx_ai_transactions_confidence ON ai_transactions(confidence);
CREATE INDEX idx_ai_transactions_manual_verified ON ai_transactions(manual_verified);
CREATE INDEX idx_ai_transactions_creator ON ai_transactions(creator);