CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    email VARCHAR(255) UNIQUE NOT NULL,

    phone VARCHAR(15) UNIQUE,

    password_hash TEXT NOT NULL,

    role VARCHAR(20) NOT NULL DEFAULT 'customer',

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT users_role_check
        CHECK (role IN ('customer', 'vendor', 'admin'))
);