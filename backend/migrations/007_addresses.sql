CREATE TABLE IF NOT EXISTS addresses (
    id BIGSERIAL PRIMARY KEY,

    customer_id BIGINT NOT NULL,

    address_line1 VARCHAR(255) NOT NULL,

    address_line2 VARCHAR(255),

    city VARCHAR(100) NOT NULL,

    state VARCHAR(100) NOT NULL,

    pincode VARCHAR(10) NOT NULL,

    landmark VARCHAR(255),

    is_default BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_addresses_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(id)
        ON DELETE CASCADE
);