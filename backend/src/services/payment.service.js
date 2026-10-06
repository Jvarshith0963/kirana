const crypto = require("crypto");

const pool = require("../config/db");
const razorpay = require("../config/razorpay");

// ============================================================
// Generic payment helpers
// ============================================================

const createPayment = async ({
  orderId,
  paymentMethod,
  amount,
  status = "pending",
}) => {
  const query = `
    INSERT INTO payments (
      order_id,
      payment_method,
      amount,
      status
    )
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;

  const values = [
    orderId,
    paymentMethod,
    amount,
    status,
  ];

  const { rows } = await pool.query(query, values);

  return rows[0];
};

const getPaymentByOrderId = async (orderId) => {
  const query = `
    SELECT *
    FROM payments
    WHERE order_id = $1;
  `;

  const { rows } = await pool.query(query, [orderId]);

  return rows[0] || null;
};

const getPaymentById = async (paymentId) => {
  const query = `
    SELECT *
    FROM payments
    WHERE id = $1;
  `;

  const { rows } = await pool.query(query, [paymentId]);

  return rows[0] || null;
};

const updatePaymentStatus = async ({
  paymentId,
  status,
}) => {
  const query = `
    UPDATE payments
    SET
      status = $1,
      updated_at = CURRENT_TIMESTAMP,
      paid_at = CASE
        WHEN $1 = 'success'
          THEN COALESCE(paid_at, CURRENT_TIMESTAMP)
        ELSE paid_at
      END
    WHERE id = $2
    RETURNING *;
  `;

  const { rows } = await pool.query(query, [
    status,
    paymentId,
  ]);

  return rows[0] || null;
};

const updateRazorpayDetails = async ({
  paymentId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}) => {
  const query = `
    UPDATE payments
    SET
      razorpay_order_id = $1,
      razorpay_payment_id = $2,
      razorpay_signature = $3,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $4
    RETURNING *;
  `;

  const values = [
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    paymentId,
  ];

  const { rows } = await pool.query(query, values);

  return rows[0] || null;
};

// ============================================================
// Order + amount validation helper
// ============================================================

const getValidatedOrder = async (
  client,
  orderId,
  customerId
) => {
  const orderQuery = `
    SELECT
      id,
      customer_id,
      total_amount,
      status,
      payment_status
    FROM orders
    WHERE id = $1
      AND customer_id = $2
    FOR UPDATE;
  `;

  const orderResult = await client.query(
    orderQuery,
    [orderId, customerId]
  );

  if (orderResult.rows.length === 0) {
    throw new Error("Order not found");
  }

  const order = orderResult.rows[0];

  if (order.status === "cancelled") {
    throw new Error("Cancelled orders cannot be paid");
  }

  if (order.status === "delivered") {
    throw new Error("Order has already been delivered");
  }

  const amountQuery = `
    SELECT
      COALESCE(
        SUM(quantity * unit_price),
        0
      ) AS calculated_amount
    FROM order_items
    WHERE order_id = $1;
  `;

  const amountResult = await client.query(
    amountQuery,
    [orderId]
  );

  const calculatedAmount = Number(
    amountResult.rows[0].calculated_amount
  );

  const orderAmount = Number(order.total_amount);

  if (
    Math.abs(
      calculatedAmount - orderAmount
    ) > 0.01
  ) {
    throw new Error(
      "Order total does not match order items"
    );
  }

  if (calculatedAmount <= 0) {
    throw new Error(
      "Order amount must be greater than zero"
    );
  }

  return {
    order,
    calculatedAmount,
  };
};

// ============================================================
// CREATE RAZORPAY ORDER
// ============================================================

const createRazorpayOrder = async ({
  orderId,
  customerId,
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const {
      order,
      calculatedAmount,
    } = await getValidatedOrder(
      client,
      orderId,
      customerId
    );

    // --------------------------------------------------------
    // Check existing payment
    // --------------------------------------------------------

    const existingPaymentQuery = `
      SELECT *
      FROM payments
      WHERE order_id = $1
      FOR UPDATE;
    `;

    const existingPaymentResult =
      await client.query(
        existingPaymentQuery,
        [orderId]
      );

    const existingPayment =
      existingPaymentResult.rows[0] || null;

    if (
      existingPayment &&
      existingPayment.status === "success"
    ) {
      throw new Error(
        "Payment already completed for this order"
      );
    }

    if (
      existingPayment &&
      existingPayment.status === "refunded"
    ) {
      throw new Error(
        "Refunded payments cannot be paid again"
      );
    }

    if (
      existingPayment &&
      existingPayment.payment_method ===
        "cash_on_delivery"
    ) {
      throw new Error(
        "Cash on Delivery is already selected for this order"
      );
    }

    // --------------------------------------------------------
    // Razorpay amount must be in paise
    // --------------------------------------------------------

    const amountInPaise = Math.round(
      calculatedAmount * 100
    );

    // --------------------------------------------------------
    // Create Razorpay order
    // --------------------------------------------------------

    const razorpayOrder =
      await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: `order_${orderId}`,
      });

    let payment;

    // --------------------------------------------------------
    // Retry an existing failed/pending payment
    // --------------------------------------------------------

    if (existingPayment) {
      const updatePaymentQuery = `
        UPDATE payments
        SET
          payment_method = 'razorpay',
          amount = $1,
          status = 'pending',
          transaction_id = NULL,
          razorpay_order_id = $2,
          razorpay_payment_id = NULL,
          razorpay_signature = NULL,
          paid_at = NULL,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *;
      `;

      const updatedResult =
        await client.query(
          updatePaymentQuery,
          [
            calculatedAmount,
            razorpayOrder.id,
            existingPayment.id,
          ]
        );

      payment = updatedResult.rows[0];
    } else {
      // ------------------------------------------------------
      // First Razorpay payment attempt
      // ------------------------------------------------------

      const paymentQuery = `
        INSERT INTO payments (
          order_id,
          payment_method,
          amount,
          status,
          razorpay_order_id
        )
        VALUES (
          $1,
          'razorpay',
          $2,
          'pending',
          $3
        )
        RETURNING *;
      `;

      const paymentResult =
        await client.query(
          paymentQuery,
          [
            order.id,
            calculatedAmount,
            razorpayOrder.id,
          ]
        );

      payment = paymentResult.rows[0];
    }

    await client.query("COMMIT");

    return {
      payment,
      razorpayOrder: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// ============================================================
// VERIFY RAZORPAY PAYMENT
// ============================================================

const verifyRazorpayPayment = async ({
  orderId,
  customerId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}) => {
  if (
    !orderId ||
    !razorpayOrderId ||
    !razorpayPaymentId ||
    !razorpaySignature
  ) {
    throw new Error(
      "Missing Razorpay payment details"
    );
  }

  if (!process.env.RAZORPAY_KEY_SECRET) {
    throw new Error(
      "RAZORPAY_KEY_SECRET is not configured"
    );
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // --------------------------------------------------------
    // 1. Verify order ownership
    // --------------------------------------------------------

    const {
      order,
      calculatedAmount,
    } = await getValidatedOrder(
      client,
      orderId,
      customerId
    );

    // --------------------------------------------------------
    // 2. Find local payment
    // --------------------------------------------------------

    const paymentQuery = `
      SELECT *
      FROM payments
      WHERE order_id = $1
        AND payment_method = 'razorpay'
      FOR UPDATE;
    `;

    const paymentResult =
      await client.query(
        paymentQuery,
        [orderId]
      );

    if (paymentResult.rows.length === 0) {
      throw new Error(
        "Payment record not found"
      );
    }

    const payment =
      paymentResult.rows[0];

    // --------------------------------------------------------
    // 3. Verify Razorpay order ID
    // --------------------------------------------------------

    if (
      payment.razorpay_order_id !==
      razorpayOrderId
    ) {
      throw new Error(
        "Razorpay order ID does not match"
      );
    }

    // --------------------------------------------------------
    // 4. Idempotency
    // --------------------------------------------------------

    if (payment.status === "success") {
      await client.query("COMMIT");

      return {
        payment,
        order: {
          id: order.id,
          total_amount: order.total_amount,
          payment_status:
            order.payment_status,
          status: order.status,
        },
        alreadyVerified: true,
      };
    }

    // --------------------------------------------------------
    // 5. Verify amounts server-side
    // --------------------------------------------------------

    const paymentAmount = Number(
      payment.amount
    );

    const orderAmount = Number(
      order.total_amount
    );

    if (
      Math.abs(
        calculatedAmount - orderAmount
      ) > 0.01
    ) {
      throw new Error(
        "Order total does not match order items"
      );
    }

    if (
      Math.abs(
        calculatedAmount - paymentAmount
      ) > 0.01
    ) {
      throw new Error(
        "Payment amount does not match order amount"
      );
    }

    // --------------------------------------------------------
    // 6. Generate expected signature
    // --------------------------------------------------------

    const signatureBody =
      `${razorpayOrderId}|${razorpayPaymentId}`;

    const expectedSignature =
      crypto
        .createHmac(
          "sha256",
          process.env.RAZORPAY_KEY_SECRET
        )
        .update(signatureBody)
        .digest("hex");

    // --------------------------------------------------------
    // 7. Timing-safe comparison
    // --------------------------------------------------------

    const expectedBuffer =
      Buffer.from(
        expectedSignature,
        "utf8"
      );

    const receivedBuffer =
      Buffer.from(
        razorpaySignature,
        "utf8"
      );

    if (
      expectedBuffer.length !==
      receivedBuffer.length
    ) {
      throw new Error(
        "Invalid Razorpay payment signature"
      );
    }

    const signatureValid =
      crypto.timingSafeEqual(
        expectedBuffer,
        receivedBuffer
      );

    if (!signatureValid) {
      throw new Error(
        "Invalid Razorpay payment signature"
      );
    }

    // --------------------------------------------------------
    // 8. Mark payment successful
    // --------------------------------------------------------

    const updatePaymentQuery = `
      UPDATE payments
      SET
        razorpay_payment_id = $1,
        razorpay_signature = $2,
        transaction_id = $3,
        status = 'success',
        paid_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *;
    `;

    const updatedPaymentResult =
      await client.query(
        updatePaymentQuery,
        [
          razorpayPaymentId,
          razorpaySignature,
          razorpayPaymentId,
          payment.id,
        ]
      );

    // --------------------------------------------------------
    // 9. Mark order paid
    // --------------------------------------------------------

    const updateOrderQuery = `
      UPDATE orders
      SET
        payment_status = 'paid',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING
        id,
        total_amount,
        payment_status,
        status,
        updated_at;
    `;

    const updatedOrderResult =
      await client.query(
        updateOrderQuery,
        [orderId]
      );

    await client.query("COMMIT");

    return {
      payment:
        updatedPaymentResult.rows[0],
      order:
        updatedOrderResult.rows[0],
      alreadyVerified: false,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// ============================================================
// CREATE COD PAYMENT
// ============================================================

const createCodPayment = async ({
  orderId,
  customerId,
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const {
      order,
      calculatedAmount,
    } = await getValidatedOrder(
      client,
      orderId,
      customerId
    );

    // --------------------------------------------------------
    // Existing payment
    // --------------------------------------------------------

    const existingPaymentQuery = `
      SELECT *
      FROM payments
      WHERE order_id = $1
      FOR UPDATE;
    `;

    const existingPaymentResult =
      await client.query(
        existingPaymentQuery,
        [orderId]
      );

    const existingPayment =
      existingPaymentResult.rows[0] || null;

    if (
      existingPayment &&
      existingPayment.status === "success"
    ) {
      throw new Error(
        "This order has already been paid"
      );
    }

    if (
      existingPayment &&
      existingPayment.status === "refunded"
    ) {
      throw new Error(
        "Refunded orders cannot use COD"
      );
    }

    let payment;

    if (
      existingPayment &&
      existingPayment.payment_method ===
        "cash_on_delivery" &&
      existingPayment.status === "cod_pending"
    ) {
      payment = existingPayment;
    } else if (existingPayment) {
      // Allow switching from a failed/pending
      // Razorpay attempt to COD.
      const updatePaymentQuery = `
        UPDATE payments
        SET
          payment_method = 'cash_on_delivery',
          amount = $1,
          status = 'cod_pending',
          transaction_id = NULL,
          razorpay_order_id = NULL,
          razorpay_payment_id = NULL,
          razorpay_signature = NULL,
          paid_at = NULL,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *;
      `;

      const updateResult =
        await client.query(
          updatePaymentQuery,
          [
            calculatedAmount,
            existingPayment.id,
          ]
        );

      payment = updateResult.rows[0];
    } else {
      const paymentQuery = `
        INSERT INTO payments (
          order_id,
          payment_method,
          amount,
          status
        )
        VALUES (
          $1,
          'cash_on_delivery',
          $2,
          'cod_pending'
        )
        RETURNING *;
      `;

      const paymentResult =
        await client.query(
          paymentQuery,
          [
            orderId,
            calculatedAmount,
          ]
        );

      payment = paymentResult.rows[0];
    }

    // --------------------------------------------------------
    // Keep order payment status pending
    // --------------------------------------------------------

    await client.query(
      `
        UPDATE orders
        SET
          payment_status = 'pending',
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1;
      `,
      [orderId]
    );

    await client.query("COMMIT");

    return payment;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  createPayment,
  getPaymentByOrderId,
  getPaymentById,
  updatePaymentStatus,
  updateRazorpayDetails,
  createCodPayment,
  createRazorpayOrder,
  verifyRazorpayPayment,
};