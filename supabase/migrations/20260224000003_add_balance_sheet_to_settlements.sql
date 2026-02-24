-- Add balance_sheet column to yearly_settlements to store AI-extracted summary data
ALTER TABLE yearly_settlements ADD COLUMN IF NOT EXISTS balance_sheet JSONB DEFAULT '{}'::jsonb;
