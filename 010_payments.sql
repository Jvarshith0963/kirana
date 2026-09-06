CREATE TABLE IF NOT EXISTS payments (
    id BIGSERIAL PRIMARY KEY,

    order_id BIGINT NOT NULL UNIQUE,

    payment_method VARCHAR(30) NOT NULL,

    transaction_id VARCHAR(255),

    amount DECIMAL(10, 2) NOT NULL,

    status VARCHAR(30) NOT NULL DEFAULT 'pending',

    paid_at TIMESTAMP,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_payments_order
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE CASCADE,

    CONSTRAINT payments_method_check
        CHECK (
            payment_method IN (
                'cash_on_delivery',
                'upi',
                'card',
                'net_banking'
            )
        ),

    CONSTRAINT payments_status_check
        CHECK (
            status IN (
                'pending',
                'success',
                'failed',
                'refunded'
            )
        ),

    CONSTRAINT payments_amount_check
        CHECK (amount >= 0)
);