-- Add status and document_path columns to yearly_settlements and yearly_balance_sheets
ALTER TABLE yearly_settlements ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed'));
ALTER TABLE yearly_settlements ADD COLUMN IF NOT EXISTS document_path TEXT;

ALTER TABLE yearly_balance_sheets ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed'));
ALTER TABLE yearly_balance_sheets ADD COLUMN IF NOT EXISTS document_path TEXT;
