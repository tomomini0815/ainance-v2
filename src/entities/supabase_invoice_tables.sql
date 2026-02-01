-- individual_invoicesテーブルの作成
CREATE TABLE individual_invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  invoice_number VARCHAR(100) NOT NULL,
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  customer_info JSONB,
  items JSONB[],
  subtotal DECIMAL(12, 2),
  tax_amount DECIMAL(12, 2),
  total_amount DECIMAL(12, 2) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('draft', 'sent', 'paid', 'overdue')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- corporation_invoicesテーブルの作成
CREATE TABLE corporation_invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  invoice_number VARCHAR(100) NOT NULL,
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  customer_info JSONB,
  items JSONB[],
  subtotal DECIMAL(12, 2),
  tax_amount DECIMAL(12, 2),
  total_amount DECIMAL(12, 2) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('draft', 'sent', 'paid', 'overdue')),
  approval_status VARCHAR(20) NOT NULL CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  approved_by VARCHAR(255),
  approved_at TIMESTAMP WITH TIME ZONE,
  department VARCHAR(255),
  project_code VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- individual_invoicesテーブルのインデックス作成
CREATE INDEX idx_individual_invoices_user_id ON individual_invoices(user_id);
CREATE INDEX idx_individual_invoices_status ON individual_invoices(status);
CREATE INDEX idx_individual_invoices_created_at ON individual_invoices(created_at);

-- corporation_invoicesテーブルのインデックス作成
CREATE INDEX idx_corporation_invoices_user_id ON corporation_invoices(user_id);
CREATE INDEX idx_corporation_invoices_status ON corporation_invoices(status);
CREATE INDEX idx_corporation_invoices_approval_status ON corporation_invoices(approval_status);
CREATE INDEX idx_corporation_invoices_created_at ON corporation_invoices(created_at);