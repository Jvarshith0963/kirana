const pool = require("../config/db");

async function getVendorStoreIds(userId) {
  const result = await pool.query(
    `SELECT s.id FROM stores s
     JOIN vendors v ON s.vendor_id = v.id
     WHERE v.user_id = $1`,
    [userId]
  );
  if (result.rows.length === 0) {
    const err = new Error("No store found for this vendor");
    err.statusCode = 400;
    throw err;
  }
  return result.rows.map((r) => r.id);
}

// ============================================================
// GET /api/vendor/dashboard
// Today's sales, order count, product count, low stock, pending orders
// ============================================================
const getDashboardSummary = async (req, res) => {
  try {
    const storeIds = await getVendorStoreIds(req.user.id);

    const todaySalesResult = await pool.query(
      `SELECT COALESCE(SUM(total_amount), 0) AS total_sales, COUNT(*) AS order_count
       FROM orders
       WHERE store_id = ANY($1)
         AND created_at >= CURRENT_DATE
         AND payment_status = 'paid'`,
      [storeIds]
    );

    const productCountResult = await pool.query(
      `SELECT COUNT(*) AS total FROM products WHERE store_id = ANY($1) AND is_available = TRUE`,
      [storeIds]
    );

    const lowStockResult = await pool.query(
      `SELECT COUNT(*) AS total FROM products
       WHERE store_id = ANY($1) AND stock_quantity > 0 AND stock_quantity <= 10`,
      [storeIds]
    );

    const outOfStockResult = await pool.query(
      `SELECT COUNT(*) AS total FROM products WHERE store_id = ANY($1) AND stock_quantity = 0`,
      [storeIds]
    );

    const pendingOrdersResult = await pool.query(
      `SELECT COUNT(*) AS total FROM orders
       WHERE store_id = ANY($1) AND status IN ('pending', 'confirmed', 'preparing')`,
      [storeIds]
    );

    return res.status(200).json({
      success: true,
      data: {
        todays_sales: parseFloat(todaySalesResult.rows[0].total_sales),
        todays_order_count: parseInt(todaySalesResult.rows[0].order_count, 10),
        total_products: parseInt(productCountResult.rows[0].total, 10),
        low_stock_products: parseInt(lowStockResult.rows[0].total, 10),
        out_of_stock_products: parseInt(outOfStockResult.rows[0].total, 10),
        pending_orders: parseInt(pendingOrdersResult.rows[0].total, 10),
      },
    });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    console.error("Vendor dashboard error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch dashboard summary" });
  }
};

module.exports = { getDashboardSummary, getVendorStoreIds };