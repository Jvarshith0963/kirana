CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,

    store_id BIGINT NOT NULL,

    category_id BIGINT,

    name VARCHAR(200) NOT NULL,

    description TEXT,

    sku VARCHAR(100),

    price DECIMAL(10, 2) NOT NULL,

    stock_quantity INTEGER NOT NULL DEFAULT 0,

    unit VARCHAR(30) DEFAULT 'piece',

    image_url TEXT,

    is_available BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_products_store
        FOREIGN KEY (store_id)
        REFERENCES stores(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_products_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE SET NULL,

    CONSTRAINT products_price_check
        CHECK (price >= 0),

    CONSTRAINT products_stock_check
        CHECK (stock_quantity >= 0)
);