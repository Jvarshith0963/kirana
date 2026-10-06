require("dotenv").config();
const pool = require("../config/db");

async function run() {
  const tables = process.argv[2]
    ? process.argv[2].split(",")
    : ["carts", "cart_items"];

  const result = await pool.query(
    `SELECT table_name, column_name, data_type
     FROM information_schema.columns
     WHERE table_name = ANY($1)
     ORDER BY table_name, ordinal_position`,
    [tables]
  );

  console.log(result.rows);
  await pool.end();
}

run();