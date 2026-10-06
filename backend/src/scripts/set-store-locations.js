require("dotenv").config();
const pool = require("../config/db");

async function run() {
  await pool.query(
    "UPDATE stores SET latitude = $1, longitude = $2, pincode = $3 WHERE id = $4",
    [17.3850, 78.4867, "500001", 1]
  );

  await pool.query(
    "UPDATE stores SET latitude = $1, longitude = $2, pincode = $3 WHERE id = $4",
    [17.4400, 78.3489, "500018", 2]
  );

  await pool.query(
    "UPDATE stores SET latitude = $1, longitude = $2, pincode = $3 WHERE id = $4",
    [28.6139, 77.2090, "110001", 3]
  );

  console.log("all updated");
  await pool.end();
}

run();