-- Add capital_amount and fiscal_year_start_month columns to business_type table
ALTER TABLE business_type ADD COLUMN IF NOT EXISTS capital_amount BIGINT;
ALTER TABLE business_type ADD COLUMN IF NOT EXISTS fiscal_year_start_month INT;

-- Set default values based on business_type
UPDATE business_type SET fiscal_year_start_month = 1 WHERE business_type = 'individual' AND fiscal_year_start_month IS NULL;
UPDATE business_type SET fiscal_year_start_month = 4 WHERE business_type = 'corporation' AND fiscal_year_start_month IS NULL;

-- Set default capital if needed (e.g., 0 or the current default in app)
UPDATE business_type SET capital_amount = 0 WHERE capital_amount IS NULL;
