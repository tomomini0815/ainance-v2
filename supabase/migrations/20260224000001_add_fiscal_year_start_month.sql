-- Add fiscal_year_start_month column to business_type table
ALTER TABLE business_type ADD COLUMN IF NOT EXISTS fiscal_year_start_month INT;

-- Set default values based on business_type
UPDATE business_type SET fiscal_year_start_month = 1 WHERE business_type = 'individual' AND fiscal_year_start_month IS NULL;
UPDATE business_type SET fiscal_year_start_month = 4 WHERE business_type = 'corporation' AND fiscal_year_start_month IS NULL;
