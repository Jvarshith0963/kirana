-- Up Migration
ALTER TABLE orders ADD CONSTRAINT chk_order_status
  CHECK (status IN ('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'));

-- Down Migration
ALTER TABLE orders DROP CONSTRAINT IF EXISTS chk_order_status;