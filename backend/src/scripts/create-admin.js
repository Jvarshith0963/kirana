require("dotenv").config();
const pool = require("../config/db");
const { hashPassword } = require("../utils/password");

async function run() {
  const email = "admin@kirana.local";
  const password = "AdminPass123";

  const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
  if (existing.rows.length > 0) {
    console.log("Admin already exists:", existing.rows[0]);
    await pool.end();
    return;
  }

  const passwordHash = await hashPassword(password);

  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash, role, is_active, created_at, updated_at)
     VALUES ($1, $2, $3, 'admin', TRUE, NOW(), NOW())
     RETURNING id, name, email, role`,
    ["Admin", email, passwordHash]
  );

  console.log("Admin created:", result.rows[0]);
  console.log("Login with:", email, "/", password);
  await pool.end();
}

run();