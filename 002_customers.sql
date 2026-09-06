CREATE TABLE IF NOT EXISTS customers (
    id BIGSERIAL PRIMARY KEY,

    user_id BIGINT NOT NULL UNIQUE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_customers_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);