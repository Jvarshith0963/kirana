const pool = require("../config/db");

// GET /api/notifications
const listNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unread_only } = req.query;
    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const offset = (pageNumber - 1) * limitNumber;

    const values = [req.user.id];
    let unreadFilter = "";
    if (unread_only === "true") {
      unreadFilter = "AND is_read = FALSE";
    }

    values.push(limitNumber, offset);

    const result = await pool.query(
      `SELECT * FROM notifications WHERE user_id = $1 ${unreadFilter}
       ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      values
    );

    const countResult = await pool.query(
      `SELECT COUNT(*) AS total FROM notifications WHERE user_id = $1 ${unreadFilter}`,
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      data: result.rows,
      pagination: { page: pageNumber, limit: limitNumber, total: parseInt(countResult.rows[0].total, 10) },
    });
  } catch (error) {
    console.error("List notifications error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch notifications" });
  }
};

// PATCH /api/notifications/:id/read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Mark as read error:", error);
    return res.status(500).json({ success: false, message: "Failed to update notification" });
  }
};

// PATCH /api/notifications/read-all
const markAllAsRead = async (req, res) => {
  try {
    await pool.query("UPDATE notifications SET is_read = TRUE WHERE user_id = $1", [req.user.id]);
    return res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    console.error("Mark all as read error:", error);
    return res.status(500).json({ success: false, message: "Failed to update notifications" });
  }
};

module.exports = { listNotifications, markAsRead, markAllAsRead };