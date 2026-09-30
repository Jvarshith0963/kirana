const { calculateOrderTotals } = require("../utils/pricing");

// ============================================================
// POST /api/coupons/validate
// body: { items: [{ product_id, quantity }], coupon_code }
// Returns the real, server-calculated totals — client totals are ignored.
// ============================================================
const validateCoupon = async (req, res) => {
  try {
    const { items, coupon_code } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "items array is required" });
    }

    const totals = await calculateOrderTotals(items, coupon_code);

    return res.status(200).json({ success: true, data: totals });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    console.error("Validate coupon error:", error);
    return res.status(500).json({ success: false, message: "Failed to validate coupon" });
  }
};

module.exports = { validateCoupon };