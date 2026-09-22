ALTER TABLE products
ADD COLUMN IF NOT EXISTS brand_id BIGINT;

ALTER TABLE products
ADD CONSTRAINT fk_products_brand
    FOREIGN KEY (brand_id)
    REFERENCES brands(id)
    ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_products_brand_id
    ON products(brand_id);