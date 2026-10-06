const pool = require("../config/db");

// Creates a notification row for a user. Never throws to the caller's
// main flow — a notification failure shouldn't break an order/payment update.
async function createNotification({ userId, type, title, message, relatedOrderId = null }) {
  try {
    const result = await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, related_order_id, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [userId, type, title, message, relatedOrderId]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Failed to create notification:", error);
    return null;
  }
}

module.exports = { createNotification };