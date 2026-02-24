-- Add detailed Balance Sheet columns to yearly_balance_sheets
ALTER TABLE yearly_balance_sheets 
  ADD COLUMN IF NOT EXISTS assets_current_receivable BIGINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS assets_current_inventory BIGINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS assets_fixed_total BIGINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS liabilities_current_payable BIGINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS liabilities_short_term_loans BIGINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS liabilities_long_term_loans BIGINT DEFAULT 0;

-- Also add to yearly_settlements for consistency in extracted data
ALTER TABLE yearly_settlements
  DROP COLUMN IF EXISTS balance_sheet;

ALTER TABLE yearly_settlements
  ADD COLUMN IF NOT EXISTS balance_sheet JSONB DEFAULT '{}'::jsonb;
