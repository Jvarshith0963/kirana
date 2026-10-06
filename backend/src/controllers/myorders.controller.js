const pool = require("../config/db");

async function getCustomerId(userId) {
  const result = await pool.query("SELECT id FROM customers WHERE user_id = $1", [userId]);
  if (result.rows.length === 0) {
    const err = new Error("No customer profile found for this user");
    err.statusCode = 400;
    throw err;
  }
  return result.rows[0].id;
}

// ============================================================
// GET /api/my-orders
// List all orders for the logged-in customer, newest first
// ============================================================
const listMyOrders = async (req, res) => {
  try {
    const customerId = await getCustomerId(req.user.id);
    const { page = 1, limit = 10, status } = req.query;

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
    const offset = (pageNumber - 1) * limitNumber;

    const values = [customerId];
    let statusFilter = "";
    if (status) {
      values.push(status);
      statusFilter = `AND o.status = $${values.length}`;
    }

    values.push(limitNumber);
    const limitIndex = values.length;
    values.push(offset);
    const offsetIndex = values.length;

    const result = await pool.query(
      `
      SELECT
        o.id, o.status, o.total_amount, o.payment_status,
        o.delivery_type, o.delivery_charge, o.created_at, o.updated_at,
        s.id AS store_id, s.store_name
      FROM orders o
      JOIN stores s ON o.store_id = s.id
      WHERE o.customer_id = $1 ${statusFilter}
      ORDER BY o.created_at DESC
      LIMIT $${limitIndex}
      OFFSET $${offsetIndex}
      `,
      values
    );

    const countValues = statusFilter ? [customerId, status] : [customerId];
    const countResult = await pool.query(
      `SELECT COUNT(*) AS total FROM orders o WHERE o.customer_id = $1 ${statusFilter}`,
      countValues
    );
    const total = parseInt(countResult.rows[0].total, 10);

    return res.status(200).json({
      success: true,
      data: result.rows,
      pagination: { page: pageNumber, limit: limitNumber, total, total_pages: Math.ceil(total / limitNumber) },
    });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    console.error("List my orders error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};

// ============================================================
// GET /api/my-orders/:id
// Full detail — items, store, address, live status
// ============================================================
const getMyOrderDetail = async (req, res) => {
  try {
    const customerId = await getCustomerId(req.user.id);
    const { id } = req.params;

    const orderResult = await pool.query(
      `
      SELECT
        o.id, o.status, o.total_amount, o.payment_status,
        o.delivery_type, o.delivery_charge, o.created_at, o.updated_at,
        s.id AS store_id, s.store_name,
        a.address_line1, a.address_line2, a.city, a.state, a.pincode, a.landmark
      FROM orders o
      JOIN stores s ON o.store_id = s.id
      JOIN addresses a ON o.address_id = a.id
      WHERE o.id = $1 AND o.customer_id = $2
      `,
      [id, customerId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const order = orderResult.rows[0];

    const itemsResult = await pool.query(
      `
      SELECT oi.id, oi.product_id, oi.quantity, oi.unit_price, oi.subtotal, p.name, p.image_url
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
      `,
      [id]
    );

    const paymentResult = await pool.query(
      "SELECT payment_method, status AS payment_gateway_status, paid_at FROM payments WHERE order_id = $1 ORDER BY created_at DESC LIMIT 1",
      [id]
    );

    return res.status(200).json({
      success: true,
      data: {
        ...order,
        items: itemsResult.rows,
        payment: paymentResult.rows[0] || null,
      },
    });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    console.error("Get my order detail error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch order detail" });
  }
};

module.exports = { listMyOrders, getMyOrderDetail };