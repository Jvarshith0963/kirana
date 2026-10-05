const crypto = require("crypto");

const {
  createRazorpayOrder,
  verifyRazorpayPayment,
  createCodPayment,
  getPaymentById,
} = require("../services/payment.service");

const pool = require("../config/db");

const {
  createNotification,
} = require("../utils/notifications");

// ============================================================
// Error response helper
// ============================================================

const sendPaymentError = (
  res,
  error,
  fallbackMessage
) => {
  const message =
    error?.message || fallbackMessage;

  const notFoundMessages = [
    "Order not found",
    "Payment record not found",
    "Payment not found",
  ];

  const forbiddenMessages = [
    "This is not your order",
  ];

  const badRequestMessages = [
    "Payment already completed for this order",
    "Refunded payments cannot be paid again",
    "Cash on Delivery is already selected for this order",
    "Cancelled orders cannot be paid",
    "Order has already been delivered",
    "Order total does not match order items",
    "Order amount must be greater than zero",
    "Razorpay order ID does not match",
    "Missing Razorpay payment details",
    "Payment amount does not match order amount",
    "Invalid Razorpay payment signature",
    "RAZORPAY_KEY_SECRET is not configured",
    "This order has already been paid",
    "Refunded orders cannot use COD",
  ];

  if (
    notFoundMessages.includes(message)
  ) {
    return res.status(404).json({
      success: false,
      message,
    });
  }

  if (
    forbiddenMessages.includes(message)
  ) {
    return res.status(403).json({
      success: false,
      message,
    });
  }

  if (
    badRequestMessages.includes(message)
  ) {
    return res.status(400).json({
      success: false,
      message,
    });
  }

  console.error(
    "Payment controller error:",
    error
  );

  return res.status(500).json({
    success: false,
    message: fallbackMessage,
  });
};

// ============================================================
// POST /api/payments/create-order
// ============================================================

const createPaymentOrder = async (
  req,
  res
) => {
  try {
    const { order_id } = req.body;

    const customerId = req.user?.id;

    if (!customerId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const result =
      await createRazorpayOrder({
        orderId: order_id,
        customerId,
      });

    return res.status(200).json({
      success: true,
      data: {
        razorpay_order_id:
          result.razorpayOrder.id,

        amount:
          result.razorpayOrder.amount,

        currency:
          result.razorpayOrder.currency,

        key_id:
          process.env.RAZORPAY_KEY_ID,

        payment_record_id:
          result.payment.id,

        payment:
          result.payment,
      },
    });
  } catch (error) {
    return sendPaymentError(
      res,
      error,
      "Failed to create payment order"
    );
  }
};

// ============================================================
// POST /api/payments/verify
// ============================================================

const verifyPayment = async (
  req,
  res
) => {
  try {
    const {
      order_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const customerId = req.user?.id;

    if (!customerId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const result =
      await verifyRazorpayPayment({
        orderId: order_id,
        customerId,
        razorpayOrderId:
          razorpay_order_id,
        razorpayPaymentId:
          razorpay_payment_id,
        razorpaySignature:
          razorpay_signature,
      });

    // --------------------------------------------------------
    // Notify customer only when newly verified
    // --------------------------------------------------------

    if (!result.alreadyVerified) {
      await createNotification({
        userId: customerId,
        type: "payment_success",
        title: "Payment successful",
        message:
          `Payment for order #${order_id} was successful.`,
        relatedOrderId: order_id,
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Payment verified successfully",
      data: result,
    });
  } catch (error) {
    return sendPaymentError(
      res,
      error,
      "Failed to verify payment"
    );
  }
};

// ============================================================
// POST /api/payments/webhook
// ============================================================

const handleWebhook = async (
  req,
  res
) => {
  try {
    const webhookSignature =
      req.headers["x-razorpay-signature"];

    if (!webhookSignature) {
      return res.status(400).json({
        success: false,
        message:
          "Webhook signature is missing",
      });
    }

    const webhookSecret =
      process.env.RAZORPAY_WEBHOOK_SECRET ||
      process.env.RAZORPAY_KEY_SECRET;

    if (!webhookSecret) {
      return res.status(500).json({
        success: false,
        message:
          "Razorpay webhook secret is not configured",
      });
    }

    // --------------------------------------------------------
    // Use RAW request body whenever available.
    // This is required for real Razorpay webhooks.
    // --------------------------------------------------------

    let rawBody;

    if (Buffer.isBuffer(req.rawBody)) {
      rawBody = req.rawBody.toString(
        "utf8"
      );
    } else if (Buffer.isBuffer(req.body)) {
      rawBody = req.body.toString(
        "utf8"
      );
    } else {
      rawBody = JSON.stringify(
        req.body || {}
      );
    }

    const expectedSignature =
      crypto
        .createHmac(
          "sha256",
          webhookSecret
        )
        .update(rawBody)
        .digest("hex");

    const expectedBuffer =
      Buffer.from(
        expectedSignature,
        "utf8"
      );

    const receivedBuffer =
      Buffer.from(
        webhookSignature,
        "utf8"
      );

    if (
      expectedBuffer.length !==
      receivedBuffer.length
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid webhook signature",
      });
    }

    const signatureValid =
      crypto.timingSafeEqual(
        expectedBuffer,
        receivedBuffer
      );

    if (!signatureValid) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid webhook signature",
      });
    }

    // --------------------------------------------------------
    // Parse event
    // --------------------------------------------------------

    let eventBody;

    try {
      eventBody =
        typeof req.body === "object" &&
        !Buffer.isBuffer(req.body)
          ? req.body
          : JSON.parse(rawBody);
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid webhook JSON payload",
      });
    }

    const event =
      eventBody?.event;

    const paymentEntity =
      eventBody?.payload?.payment?.entity;

    if (!paymentEntity) {
      return res.status(200).json({
        success: true,
        message:
          "Webhook received without payment entity",
      });
    }

    // ========================================================
    // payment.captured
    // ========================================================

    if (
      event === "payment.captured"
    ) {
      const paymentOrderId =
        paymentEntity.order_id;

      const razorpayPaymentId =
        paymentEntity.id;

      const updatePaymentResult =
        await pool.query(
          `
            UPDATE payments
            SET
              status = 'success',
              transaction_id = $1,
              razorpay_payment_id = COALESCE(
                razorpay_payment_id,
                $1
              ),
              paid_at = COALESCE(
                paid_at,
                CURRENT_TIMESTAMP
              ),
              updated_at = CURRENT_TIMESTAMP
            WHERE razorpay_order_id = $2
              AND payment_method = 'razorpay'
            RETURNING *;
          `,
          [
            razorpayPaymentId,
            paymentOrderId,
          ]
        );

      if (
        updatePaymentResult.rows.length > 0
      ) {
        const payment =
          updatePaymentResult.rows[0];

        await pool.query(
          `
            UPDATE orders
            SET
              payment_status = 'paid',
              updated_at = CURRENT_TIMESTAMP
            WHERE id = $1;
          `,
          [payment.order_id]
        );

        await createNotification({
          userId:
            await getCustomerUserId(
              payment.order_id
            ),
          type: "payment_success",
          title:
            "Payment successful",
          message:
            `Payment for order #${payment.order_id} was successful.`,
          relatedOrderId:
            payment.order_id,
        }).catch((notificationError) => {
          console.error(
            "Webhook notification error:",
            notificationError
          );
        });
      }
    }

    // ========================================================
    // payment.failed
    // ========================================================

    if (
      event === "payment.failed"
    ) {
      const paymentOrderId =
        paymentEntity.order_id;

      await pool.query(
        `
          UPDATE payments
          SET
            status = 'failed',
            transaction_id = COALESCE(
              transaction_id,
              $1
            ),
            razorpay_payment_id =
              COALESCE(
                razorpay_payment_id,
                $1
              ),
            updated_at =
              CURRENT_TIMESTAMP
          WHERE razorpay_order_id = $2
            AND payment_method = 'razorpay';
        `,
        [
          paymentEntity.id,
          paymentOrderId,
        ]
      );
    }

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Webhook handler error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Webhook processing failed",
    });
  }
};

// ============================================================
// Helper: customer user ID
// ============================================================

const getCustomerUserId =
  async (orderId) => {
    const result =
      await pool.query(
        `
          SELECT c.user_id
          FROM orders o
          JOIN customers c
            ON o.customer_id = c.id
          WHERE o.id = $1;
        `,
        [orderId]
      );

    return result.rows[0]?.user_id;
  };

// ============================================================
// POST /api/payments/cod
// ============================================================

const payWithCOD = async (
  req,
  res
) => {
  try {
    const { order_id } = req.body;

    const customerId = req.user?.id;

    if (!customerId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const payment =
      await createCodPayment({
        orderId: order_id,
        customerId,
      });

    await createNotification({
      userId: customerId,
      type: "payment_cod_selected",
      title:
        "Cash on Delivery selected",
      message:
        `You chose Cash on Delivery for order #${order_id}.`,
      relatedOrderId: order_id,
    });

    return res.status(200).json({
      success: true,
      message:
        "Cash on Delivery selected",
      data: payment,
    });
  } catch (error) {
    return sendPaymentError(
      res,
      error,
      "Failed to set COD payment"
    );
  }
};

// ============================================================
// POST /api/payments/:id/refund
// ============================================================

const initiateRefund = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const paymentResult =
      await pool.query(
        `
          SELECT
            p.id,
            p.status,
            p.order_id,
            p.payment_method,
            s.vendor_id,
            v.user_id AS owner_user_id
          FROM payments p
          JOIN orders o
            ON p.order_id = o.id
          JOIN stores s
            ON o.store_id = s.id
          JOIN vendors v
            ON s.vendor_id = v.id
          WHERE p.id = $1;
        `,
        [id]
      );

    if (
      paymentResult.rows.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    const payment =
      paymentResult.rows[0];

    const isAdmin =
      req.user.role === "admin";

    const isOwner =
      String(
        payment.owner_user_id
      ) === String(req.user.id);

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message:
          "Not authorized to refund this payment",
      });
    }

    // --------------------------------------------------------
    // Only successful online payments can be refunded.
    // COD should not use a Razorpay refund endpoint.
    // --------------------------------------------------------

    if (
      payment.payment_method !==
      "razorpay"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Only Razorpay payments can be refunded",
      });
    }

    if (
      payment.status !== "success"
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Cannot refund a payment with status '${payment.status}'`,
      });
    }

    // --------------------------------------------------------
    // STUB: no real Razorpay refund call yet.
    // --------------------------------------------------------

    const result =
      await pool.query(
        `
          UPDATE payments
          SET
            status = 'refund_pending',
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
          RETURNING *;
        `,
        [id]
      );

    const refundCustomerResult =
      await pool.query(
        `
          SELECT c.user_id
          FROM orders o
          JOIN customers c
            ON o.customer_id = c.id
          WHERE o.id = $1;
        `,
        [payment.order_id]
      );

    if (
      refundCustomerResult.rows.length > 0
    ) {
      await createNotification({
        userId:
          refundCustomerResult.rows[0]
            .user_id,
        type: "refund_initiated",
        title: "Refund initiated",
        message:
          `A refund for order #${payment.order_id} has been initiated.`,
        relatedOrderId:
          payment.order_id,
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Refund initiated (stub)",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Refund error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to initiate refund",
    });
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  handleWebhook,
  payWithCOD,
  initiateRefund,
};