CREATE TABLE IF NOT EXISTS stores (
    id BIGSERIAL PRIMARY KEY,

    vendor_id BIGINT NOT NULL,

    store_name VARCHAR(150) NOT NULL,

    description TEXT,

    address TEXT NOT NULL,

    city VARCHAR(100),

    state VARCHAR(100),

    pincode VARCHAR(10),

    latitude DECIMAL(10, 8),

    longitude DECIMAL(11, 8),

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_stores_vendor
        FOREIGN KEY (vendor_id)
        REFERENCES vendors(id)
        ON DELETE CASCADE
);