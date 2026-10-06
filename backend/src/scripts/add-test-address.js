require("dotenv").config();
const pool = require("../config/db");

async function run() {
  const customerResult = await pool.query(
    "SELECT id FROM customers WHERE user_id = $1",
    [15] // testcustomer1@kirana.local, user id 15
  );

  if (customerResult.rows.length === 0) {
    console.log("No customer found for user_id 15");
    await pool.end();
    return;
  }

  const customerId = customerResult.rows[0].id;

  const result = await pool.query(
    `INSERT INTO addresses
     (customer_id, address_line1, address_line2, city, state, pincode, landmark, is_default, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE, NOW())
     RETURNING *`,
    [
      customerId,
      "123 Test Street",
      "Near Test Park",
      "Hyderabad",
      "Telangana",
      "500001",
      "Opposite Test Mall",
    ]
  );

  console.log(result.rows[0]);
  await pool.end();
}

run();