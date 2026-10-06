require("dotenv").config();
const pool = require("../config/db");

async function run() {
  await pool.query(
    `INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, max_discount_amount, is_active)
     VALUES
     ('SAVE50', 'fixed', 50, 300, NULL, TRUE),
     ('TEN10', 'percent', 10, 500, 100, TRUE)
     ON CONFLICT (code) DO NOTHING`
  );

  console.log("Coupons seeded");
  await pool.end();
}

run();