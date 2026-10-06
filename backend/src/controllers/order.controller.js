const { checkoutCart } = require("../utils/checkout");
const { createNotification } = require("../utils/notifications");
const { sendOrderDeliveredEmail } = require("../utils/mailer");
const pool = require("../config/db");
const { isValidTransition } = require("../utils/orderStatus");
const { getVendorStoreIds } = require("./vendorDashboard.controller");



// POST /api/orders/checkout
const checkout = async (req, res) => {
  try {
    const {
      coupon_code,
      address_id,
      delivery_type = "standard",
    } = req.body;

    if (!address_id || !/^\d+$/.test(String(address_id))) {
      return res.status(400).json({
        success: false,
        message: "address_id is required",
      });
    }

    const orders = await checkoutCart(
      req.user.id,
      address_id,
      delivery_type,
      coupon_code
    );

    return res.status(201).json({
      success: true,
      message: `${orders.length} order(s) created`,
      data: orders,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Checkout error:", error);

    return res.status(500).json({
      success: false,
      message: "Checkout failed",
    });
  }
};


// PATCH /api/orders/:id/status
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status: newStatus } = req.body;

    // ---------------------------------------------
    // Validate status
    // ---------------------------------------------

    if (!newStatus) {
      return res.status(400).json({
        success: false,
        message: "status is required",
      });
    }

    // ---------------------------------------------
    // Find order + store owner
    // ---------------------------------------------

    const orderResult = await pool.query(
      `SELECT 
         o.id,
         o.status,
         s.vendor_id,
         v.user_id AS owner_user_id
       FROM orders o
       JOIN stores s ON o.store_id = s.id
       JOIN vendors v ON s.vendor_id = v.id
       WHERE o.id = $1`,
      [id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const order = orderResult.rows[0];

    // ---------------------------------------------
    // Authorization
    // ---------------------------------------------

    const isAdmin = req.user.role === "admin";

    const isOwner =
      String(order.owner_user_id) === String(req.user.id);

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "You do not own this order",
      });
    }

    // ---------------------------------------------
    // Validate status transition
    // ---------------------------------------------

    if (!isValidTransition(order.status, newStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot move order from '${order.status}' to '${newStatus}'`,
      });
    }

    // ---------------------------------------------
    // Update order
    // ---------------------------------------------

    const result = await pool.query(
      `UPDATE orders
       SET status = $1,
           updated_at = NOW()
       WHERE id = $2
         AND status = $3
       RETURNING *`,
      [newStatus, id, order.status]
    );

    if (result.rows.length === 0) {
      return res.status(409).json({
        success: false,
        message: "Order status was changed by another request",
      });
    }

    // ---------------------------------------------
    // Find customer
    // ---------------------------------------------

    const customerUserResult = await pool.query(
      `SELECT c.user_id
       FROM orders o
       JOIN customers c ON o.customer_id = c.id
       WHERE o.id = $1`,
      [id]
    );

    // ---------------------------------------------
    // Customer notification
    // ---------------------------------------------

    const statusMessages = {
      confirmed: "Your order has been accepted by the store.",
      preparing: "Your order is being packed.",
      out_for_delivery: "Your order is out for delivery.",
      delivered: "Your order has been delivered.",
      cancelled: "Your order has been cancelled.",
    };

    if (customerUserResult.rows.length > 0) {
      const customerUserId =
        customerUserResult.rows[0].user_id;

      await createNotification({
        userId: customerUserId,
        type: `order_${newStatus}`,
        title: "Order update",
        message:
          statusMessages[newStatus] ||
          `Your order status changed to ${newStatus}.`,
        relatedOrderId: id,
      });

      // ---------------------------------------------
      // Delivered email
      // ---------------------------------------------

      if (newStatus === "delivered") {
        const emailResult = await pool.query(
          "SELECT email FROM users WHERE id = $1",
          [customerUserId]
        );

        if (
          emailResult.rows.length > 0 &&
          emailResult.rows[0].email
        ) {
          try {
            await sendOrderDeliveredEmail(
              emailResult.rows[0].email,
              { id }
            );
          } catch (err) {
            console.error(
              "Order delivered email failed:",
              err.message
            );
          }
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: "Order status updated",
      data: result.rows[0],
    });

  } catch (error) {
    console.error("Update order status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update order status",
    });
  }
};

// GET /api/vendor/orders
const listVendorOrders = async (req, res) => {
  try {
    const storeIds = await getVendorStoreIds(req.user.id);
    const { status, page = 1, limit = 20 } = req.query;

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const offset = (pageNumber - 1) * limitNumber;

    const values = [storeIds];
    let statusFilter = "";
    if (status) {
      values.push(status);
      statusFilter = `AND status = $${values.length}`;
    }
    values.push(limitNumber, offset);

    const result = await pool.query(
      `SELECT * FROM orders WHERE store_id = ANY($1) ${statusFilter}
       ORDER BY created_at DESC LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values
    );

    return res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    console.error("List vendor orders error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};

// PATCH /api/vendor/orders/:id/accept
const acceptOrder = async (req, res) => {
  req.body.status = "confirmed";
  return updateOrderStatus(req, res);
};

// PATCH /api/vendor/orders/:id/reject
const rejectOrder = async (req, res) => {
  req.body.status = "cancelled";
  return updateOrderStatus(req, res);
};

module.exports = { checkout, updateOrderStatus, listVendorOrders, acceptOrder, rejectOrder };

