CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,

    customer_id BIGINT NOT NULL,

    store_id BIGINT NOT NULL,

    address_id BIGINT NOT NULL,

    status VARCHAR(30) NOT NULL DEFAULT 'pending',

    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,

    payment_status VARCHAR(30) NOT NULL DEFAULT 'pending',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_orders_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(id),

    CONSTRAINT fk_orders_store
        FOREIGN KEY (store_id)
        REFERENCES stores(id),

    CONSTRAINT fk_orders_address
        FOREIGN KEY (address_id)
        REFERENCES addresses(id),

    CONSTRAINT orders_status_check
        CHECK (
            status IN (
                'pending',
                'confirmed',
                'processing',
                'out_for_delivery',
                'delivered',
                'cancelled'
            )
        ),

    CONSTRAINT orders_payment_status_check
        CHECK (
            payment_status IN (
                'pending',
                'paid',
                'failed',
                'refunded'
            )
        )
);