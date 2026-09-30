const crypto = require("crypto");
const pool = require("../config/db");
const razorpay = require("../config/razorpay");
const { createNotification } = require("../utils/notifications");

// ============================================================
// POST /api/payments/create-order
// body: { order_id }
// Amount comes from the orders row created at checkout — never
// accepted from the client.
// ============================================================
const createPaymentOrder = async (req, res) => {
  try {
    const { order_id } = req.body;

    const orderResult = await pool.query(
      `SELECT o.id, o.total_amount, o.payment_status, c.user_id
       FROM orders o
       JOIN customers c ON o.customer_id = c.id
       WHERE o.id = $1`,
      [order_id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const order = orderResult.rows[0];

    if (String(order.user_id) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: "This is not your order" });
    }

    if (order.payment_status === "paid") {
      return res.status(400).json({ success: false, message: "This order is already paid" });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(parseFloat(order.total_amount) * 100), // paise, server-computed only
      currency: "INR",
      receipt: `order_${order.id}`,
    });

    const paymentResult = await pool.query(
      `INSERT INTO payments (order_id, payment_method, transaction_id, amount, status, created_at)
       VALUES ($1, 'razorpay', $2, $3, 'created', NOW())
       RETURNING *`,
      [order.id, razorpayOrder.id, order.total_amount]
    );

    return res.status(200).json({
      success: true,
      data: {
        razorpay_order_id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key_id: process.env.RAZORPAY_KEY_ID,
        payment_record_id: paymentResult.rows[0].id,
      },
    });
  } catch (error) {
    console.error("Create payment order error:", error);
    return res.status(500).json({ success: false, message: "Failed to create payment order" });
  }
};

// ============================================================
// POST /api/payments/verify
// body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
// Recomputes the HMAC signature server-side — this is what actually
// proves the payment is genuine.
// ============================================================
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification fields",
      });
    }

    // Generate expected signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    // Verify signature
    if (expectedSignature !== razorpay_signature) {
      await pool.query(
        `UPDATE payments
         SET status = 'failed', updated_at = NOW()
         WHERE razorpay_order_id = $1`,
        [razorpay_order_id]
      );

      return res.status(400).json({
        success: false,
        message: "Payment signature verification failed",
      });
    }

    // Update payment record
    const paymentResult = await pool.query(
      `UPDATE payments
       SET status = 'success',
           razorpay_payment_id = $1,
           razorpay_signature = $2,
           updated_at = NOW(),
           paid_at = NOW()
       WHERE razorpay_order_id = $3
       RETURNING *`,
      [
        razorpay_payment_id,
        razorpay_signature,
        razorpay_order_id,
      ]
    );

    // Check payment record
    if (paymentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found",
      });
    }

    const payment = paymentResult.rows[0];

    // Mark order as paid
    await pool.query(
      `UPDATE orders
       SET payment_status = 'paid',
           updated_at = NOW()
       WHERE id = $1`,
      [payment.order_id]
    );

    // Get customer user ID
    const customerResult = await pool.query(
      `SELECT c.user_id
       FROM orders o
       JOIN customers c ON o.customer_id = c.id
       WHERE o.id = $1`,
      [payment.order_id]
    );

    // Notify customer
    if (customerResult.rows.length > 0) {
      await createNotification({
        userId: customerResult.rows[0].user_id,
        type: "payment_success",
        title: "Payment successful",
        message: `Payment for order #${payment.order_id} was successful.`,
        relatedOrderId: payment.order_id,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      data: payment,
    });
  } catch (error) {
    console.error("Verify payment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to verify payment",
    });
  }
};
// ============================================================
// POST /api/payments/webhook
// Simulates Razorpay calling your server directly with payment events.
// Verified using a separate WEBHOOK secret.
// ============================================================
const handleWebhook = async (req, res) => {
  try {
    const webhookSignature = req.headers["x-razorpay-signature"];

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (expectedSignature !== webhookSignature) {
      return res.status(400).json({ success: false, message: "Invalid webhook signature" });
    }

    const event = req.body.event;
    const paymentEntity = req.body.payload?.payment?.entity;

    if (event === "payment.captured" && paymentEntity) {
      await pool.query(
        `UPDATE payments SET status = 'paid', transaction_id = $1, paid_at = NOW()
         WHERE transaction_id = $2`,
        [paymentEntity.id, paymentEntity.order_id]
      );

      const paymentRow = await pool.query(
        "SELECT order_id FROM payments WHERE transaction_id = $1",
        [paymentEntity.id]
      );
      if (paymentRow.rows.length > 0) {
        await pool.query(
          "UPDATE orders SET payment_status = 'paid', updated_at = NOW() WHERE id = $1",
          [paymentRow.rows[0].order_id]
        );
      }
    }

    if (event === "payment.failed" && paymentEntity) {
      await pool.query(
        "UPDATE payments SET status = 'failed' WHERE transaction_id = $1",
        [paymentEntity.order_id]
      );
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return res.status(500).json({ success: false });
  }
};

// ============================================================
// POST /api/payments/cod
// body: { order_id }
// No gateway call — just records COD as the chosen method.
// ============================================================
const payWithCOD = async (req, res) => {
  try {
    const { order_id } = req.body;

    if (!order_id) {
      return res.status(400).json({
        success: false,
        message: "order_id is required",
      });
    }

    const orderResult = await pool.query(
      `SELECT o.id, o.total_amount, o.payment_status, c.user_id
       FROM orders o
       JOIN customers c ON o.customer_id = c.id
       WHERE o.id = $1`,
      [order_id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const order = orderResult.rows[0];

    // Make sure the logged-in customer owns this order
    if (String(order.user_id) !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "This is not your order",
      });
    }

    // Don't allow COD on an already paid order
    if (order.payment_status === "paid") {
      return res.status(400).json({
        success: false,
        message: "This order is already paid",
      });
    }

    // Create COD payment
    const result = await pool.query(
      `INSERT INTO payments
       (order_id, payment_method, amount, status, created_at)
       VALUES ($1, 'cash_on_delivery', $2, 'cod_pending', NOW())
       RETURNING *`,
      [order.id, order.total_amount]
    );

    // Update order payment status
    await pool.query(
      `UPDATE orders
       SET payment_status = 'pending',
           updated_at = NOW()
       WHERE id = $1`,
      [order.id]
    );

    // Notify customer
    await createNotification({
      userId: req.user.id,
      type: "payment_cod_selected",
      title: "Cash on Delivery selected",
      message: `You chose Cash on Delivery for order #${order.id}.`,
      relatedOrderId: order.id,
    });

    return res.status(200).json({
      success: true,
      message: "Cash on Delivery selected",
      data: result.rows[0],
    });

  } catch (error) {
    console.error("COD payment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to set COD payment",
    });
  }
};
// ============================================================
// POST /api/payments/:id/refund
// Admin or the vendor who owns the order can initiate.
// STUB — no real gateway refund call, just marks status.
// ============================================================
const initiateRefund = async (req, res) => {
  try {
    const { id } = req.params;

    const paymentResult = await pool.query(
      `SELECT p.id, p.status, p.order_id, s.vendor_id, v.user_id AS owner_user_id
       FROM payments p
       JOIN orders o ON p.order_id = o.id
       JOIN stores s ON o.store_id = s.id
       JOIN vendors v ON s.vendor_id = v.id
       WHERE p.id = $1`,
      [id]
    );

    if (paymentResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    const payment = paymentResult.rows[0];

    const isAdmin = req.user.role === "admin";
    const isOwner = String(payment.owner_user_id) === String(req.user.id);

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false, message: "Not authorized to refund this payment" });
    }

    if (payment.status !== "paid" && payment.status !== "COD-pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot refund a payment with status '${payment.status}'`,
      });
    }

    const result = await pool.query(
      "UPDATE payments SET status = 'refunded' WHERE id = $1 RETURNING *",
      [id]
    );
    const refundCustomerResult = await pool.query(
  `SELECT c.user_id FROM orders o JOIN customers c ON o.customer_id = c.id WHERE o.id = $1`,
  [payment.order_id]
);
if (refundCustomerResult.rows.length > 0) {
  await createNotification({
    userId: refundCustomerResult.rows[0].user_id,
    type: "refund_initiated",
    title: "Refund initiated",
    message: `A refund for order #${payment.order_id} has been initiated.`,
    relatedOrderId: payment.order_id,
  });
}

    await pool.query(
      "UPDATE orders SET payment_status = 'refunded', updated_at = NOW() WHERE id = $1",
      [payment.order_id]
    );

    return res.status(200).json({ success: true, message: "Refund initiated (stub)", data: result.rows[0] });
  } catch (error) {
    console.error("Refund error:", error);
    return res.status(500).json({ success: false, message: "Failed to initiate refund" });
  }
};

module.exports = { createPaymentOrder, verifyPayment, handleWebhook, payWithCOD, initiateRefund };


