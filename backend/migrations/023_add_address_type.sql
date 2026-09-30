-- Up Migration
ALTER TABLE addresses ADD COLUMN address_type VARCHAR(20) NOT NULL DEFAULT 'home';
ALTER TABLE addresses ADD CONSTRAINT chk_address_type CHECK (address_type IN ('home', 'work', 'other'));
ALTER TABLE addresses ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT NOW();

-- Down Migration
ALTER TABLE addresses DROP CONSTRAINT IF EXISTS chk_address_type;
ALTER TABLE addresses DROP COLUMN IF EXISTS address_type;
ALTER TABLE addresses DROP COLUMN IF EXISTS updated_at;