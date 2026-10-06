const pool = require("../config/db");
const { generateInvoicePDF } = require("../utils/invoice");

// GET /api/orders/:id/invoice
const downloadInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    // Confirm this order belongs to the requesting customer (or is an admin/the owning vendor)
    const ownerCheck = await pool.query(
      `SELECT c.user_id AS customer_user_id, v.user_id AS vendor_user_id
       FROM orders o
       JOIN customers c ON o.customer_id = c.id
       JOIN stores s ON o.store_id = s.id
       JOIN vendors v ON s.vendor_id = v.id
       WHERE o.id = $1`,
      [id]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const { customer_user_id, vendor_user_id } = ownerCheck.rows[0];
    const isAdmin = req.user.role === "admin";
    const isCustomer = String(customer_user_id) === String(req.user.id);
    const isVendor = String(vendor_user_id) === String(req.user.id);

    if (!isAdmin && !isCustomer && !isVendor) {
      return res.status(403).json({ success: false, message: "Not authorized to view this invoice" });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=invoice-order-${id}.pdf`);

    await generateInvoicePDF(id, res);
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    console.error("Invoice generation error:", error);
    return res.status(500).json({ success: false, message: "Failed to generate invoice" });
  }
};

module.exports = { downloadInvoice };