const pool = require("../config/db");
const { getVendorStoreIds } = require("./vendorDashboard.controller");

// GET /api/vendor/sales?period=daily|weekly|monthly
const getSalesReport = async (req, res) => {
  try {
    const storeIds = await getVendorStoreIds(req.user.id);
    const { period = "daily" } = req.query;

    const intervalMap = { daily: "1 day", weekly: "7 days", monthly: "30 days" };
    const interval = intervalMap[period];
    if (!interval) {
      return res.status(400).json({ success: false, message: "period must be daily, weekly, or monthly" });
    }

    const salesResult = await pool.query(
      `SELECT COALESCE(SUM(total_amount), 0) AS total_sales, COUNT(*) AS order_count
       FROM orders
       WHERE store_id = ANY($1)
         AND payment_status = 'paid'
         AND created_at >= NOW() - $2::interval`,
      [storeIds, interval]
    );

    const totalSales = parseFloat(salesResult.rows[0].total_sales);
    const orderCount = parseInt(salesResult.rows[0].order_count, 10);
    const avgOrderValue = orderCount > 0 ? totalSales / orderCount : 0;

    const bestSellersResult = await pool.query(
      `SELECT p.id, p.name, SUM(oi.quantity) AS units_sold, SUM(oi.subtotal) AS revenue
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       JOIN orders o ON oi.order_id = o.id
       WHERE o.store_id = ANY($1) AND o.payment_status = 'paid' AND o.created_at >= NOW() - $2::interval
       GROUP BY p.id, p.name
       ORDER BY units_sold DESC
       LIMIT 5`,
      [storeIds, interval]
    );

    const lowSellersResult = await pool.query(
      `SELECT p.id, p.name, COALESCE(SUM(oi.quantity), 0) AS units_sold
       FROM products p
       LEFT JOIN order_items oi ON oi.product_id = p.id
       LEFT JOIN orders o ON oi.order_id = o.id AND o.payment_status = 'paid' AND o.created_at >= NOW() - $2::interval
       WHERE p.store_id = ANY($1)
       GROUP BY p.id, p.name
       ORDER BY units_sold ASC
       LIMIT 5`,
      [storeIds, interval]
    );

    return res.status(200).json({
      success: true,
      data: {
        period,
        total_sales: totalSales,
        order_count: orderCount,
        average_order_value: Math.round(avgOrderValue * 100) / 100,
        best_sellers: bestSellersResult.rows,
        low_sellers: lowSellersResult.rows,
      },
    });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    console.error("Vendor sales report error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch sales report" });
  }
};

module.exports = { getSalesReport };