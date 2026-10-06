CREATE TABLE IF NOT EXISTS brands (
    id BIGSERIAL PRIMARY KEY,

    name VARCHAR(100) NOT NULL UNIQUE,

    description TEXT,

    image_url TEXT,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS inventory (
    id BIGSERIAL PRIMARY KEY,

    product_id BIGINT NOT NULL UNIQUE,

    quantity INTEGER NOT NULL DEFAULT 0,

    reserved_quantity INTEGER NOT NULL DEFAULT 0,

    low_stock_threshold INTEGER NOT NULL DEFAULT 5,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_inventory_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE,

    CONSTRAINT inventory_quantity_check
        CHECK (quantity >= 0),

    CONSTRAINT inventory_reserved_quantity_check
        CHECK (reserved_quantity >= 0),

    CONSTRAINT inventory_low_stock_check
        CHECK (low_stock_threshold >= 0),

    CONSTRAINT inventory_reserved_limit_check
        CHECK (reserved_quantity <= quantity)
);