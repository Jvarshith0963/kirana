-- =========================================================
-- USERS TABLE
-- =========================================================

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


-- =========================================================
-- CUSTOMERS TABLE
-- =========================================================

CREATE TABLE IF NOT EXISTS customers (
    id BIGSERIAL PRIMARY KEY,

    user_id BIGINT NOT NULL UNIQUE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_customers_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- =========================================================
-- VENDORS TABLE
-- =========================================================

CREATE TABLE IF NOT EXISTS vendors (
    id BIGSERIAL PRIMARY KEY,

    user_id BIGINT NOT NULL UNIQUE,

    business_name VARCHAR(150) NOT NULL,

    business_phone VARCHAR(15),

    is_verified BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_vendors_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- =========================================================
-- ADMINS TABLE
-- =========================================================

CREATE TABLE IF NOT EXISTS admins (
    id BIGSERIAL PRIMARY KEY,

    user_id BIGINT NOT NULL UNIQUE,

    admin_level VARCHAR(30) NOT NULL DEFAULT 'admin',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_admins_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- =========================================================
-- MAKE YOUR EXISTING USER AN ADMIN
-- CHANGE THIS EMAIL
-- =========================================================

UPDATE users
SET
    role = 'admin',
    updated_at = CURRENT_TIMESTAMP
WHERE email = 'your-email@example.com';


-- =========================================================
-- CREATE ADMIN PROFILE FOR THAT USER
-- =========================================================

INSERT INTO admins (user_id, admin_level)
SELECT id, 'admin'
FROM users
WHERE email = 'your-email@example.com'
ON CONFLICT (user_id)
DO UPDATE SET admin_level = 'admin';


-- =========================================================
-- VERIFY ADMIN ACCOUNT
-- =========================================================

SELECT
    u.id,
    u.name,
    u.email,
    u.role,
    u.is_active,
    a.admin_level
FROM users u
LEFT JOIN admins a
    ON a.user_id = u.id
WHERE u.email = 'your-email@example.com';