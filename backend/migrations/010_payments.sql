CREATE TABLE IF NOT EXISTS payments (
    id BIGSERIAL PRIMARY KEY,

    order_id BIGINT NOT NULL UNIQUE,

    payment_method VARCHAR(30) NOT NULL,

    transaction_id VARCHAR(255),

    amount DECIMAL(10, 2) NOT NULL,

    status VARCHAR(30) NOT NULL DEFAULT 'pending',

    paid_at TIMESTAMP,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Razorpay details
    razorpay_order_id VARCHAR(255),

    razorpay_payment_id VARCHAR(255),

    razorpay_signature VARCHAR(255),

    CONSTRAINT fk_payments_order
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE CASCADE,

    CONSTRAINT payments_method_check
        CHECK (
            payment_method IN (
                'cash_on_delivery',
                'razorpay'
            )
        ),

    CONSTRAINT payments_status_check
        CHECK (
            status IN (
                'pending',
                'cod_pending',
                'success',
                'failed',
                'refund_pending',
                'refunded'
            )
        ),

    CONSTRAINT payments_amount_check
        CHECK (amount > 0)
);

CREATE INDEX IF NOT EXISTS idx_payments_razorpay_order_id
    ON payments(razorpay_order_id);

CREATE INDEX IF NOT EXISTS idx_payments_razorpay_payment_id
    ON payments(razorpay_payment_id);