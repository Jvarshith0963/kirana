-- Up Migration
ALTER TABLE orders ADD COLUMN delivery_type VARCHAR(20) NOT NULL DEFAULT 'standard';
ALTER TABLE orders ADD CONSTRAINT chk_delivery_type CHECK (delivery_type IN ('standard', 'express', 'same_day', 'pickup'));
ALTER TABLE orders ADD COLUMN delivery_charge NUMERIC(10, 2) NOT NULL DEFAULT 0;

-- Down Migration
ALTER TABLE orders DROP CONSTRAINT IF EXISTS chk_delivery_type;
ALTER TABLE orders DROP COLUMN IF EXISTS delivery_type;
ALTER TABLE orders DROP COLUMN IF EXISTS delivery_charge;