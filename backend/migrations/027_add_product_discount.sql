-- Up Migration
ALTER TABLE products ADD COLUMN discount_percent NUMERIC(5,2) NOT NULL DEFAULT 0;

-- Down Migration
ALTER TABLE products DROP COLUMN IF EXISTS discount_percent;