const pool = require("../config/db");
const crypto = require("crypto");
const razorpay = require("../config/razorpay");

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
        THEN CURRENT_TIMESTAMP
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
//update razorpay details after payment verification
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

const createCodPayment = async ({
  orderId,
  customerId,
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Get the order belonging to the authenticated customer
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

    // 2. Validate order status
    if (order.status === "cancelled") {
      throw new Error(
        "Cancelled orders cannot be paid"
      );
    }

    if (order.status === "delivered") {
      throw new Error(
        "Order has already been delivered"
      );
    }

    // 3. Check whether payment already exists
    const existingPaymentQuery = `
      SELECT id
      FROM payments
      WHERE order_id = $1
      FOR UPDATE;
    `;

    const existingPaymentResult = await client.query(
      existingPaymentQuery,
      [orderId]
    );

    if (existingPaymentResult.rows.length > 0) {
      throw new Error(
        "Payment already exists for this order"
      );
    }

    // 4. Recalculate total from order items
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

    // 5. Verify order total
    if (
      Math.abs(
        calculatedAmount - orderAmount
      ) > 0.01
    ) {
      throw new Error(
        "Order total does not match order items"
      );
    }

    // 6. Ensure amount is valid
    if (calculatedAmount <= 0) {
      throw new Error(
        "Order amount must be greater than zero"
      );
    }

    // 7. Create COD payment
    const paymentQuery = `
      INSERT INTO payments (
        order_id,
        payment_method,
        amount,
        status
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;

    const paymentResult = await client.query(
      paymentQuery,
      [
        orderId,
        "cash_on_delivery",
        calculatedAmount,
        "cod_pending",
      ]
    );

    // 8. Keep order payment status pending
    const updateOrderQuery = `
      UPDATE orders
      SET
        payment_status = 'pending',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1;
    `;

    await client.query(
      updateOrderQuery,
      [orderId]
    );

    await client.query("COMMIT");

    return paymentResult.rows[0];
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
};



//verify razorpay payment
const verifyRazorpayPayment = async ({
  orderId,
  customerId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}) => {
  if (
    !razorpayOrderId ||
    !razorpayPaymentId ||
    !razorpaySignature
  ) {
    throw new Error("Missing Razorpay payment details");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    /*
     * 1. Get the order belonging to the authenticated customer
     */
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

    /*
     * 2. Get the local payment
     */
    const paymentQuery = `
      SELECT *
      FROM payments
      WHERE order_id = $1
        AND payment_method = 'razorpay'
      FOR UPDATE;
    `;

    const paymentResult = await client.query(
      paymentQuery,
      [orderId]
    );

    if (paymentResult.rows.length === 0) {
      throw new Error("Payment record not found");
    }

    const payment = paymentResult.rows[0];

    /*
     * 3. Make sure the Razorpay order belongs
     *    to our local payment record.
     */
    if (
      payment.razorpay_order_id !== razorpayOrderId
    ) {
      throw new Error(
        "Razorpay order ID does not match"
      );
    }

    /*
     * 4. Prevent payment from being verified twice
     */
    if (payment.status === "success") {
      throw new Error(
        "Payment has already been verified"
      );
    }

    /*
     * 5. Recalculate the order amount from
     *    order_items.
     *
     *    NEVER trust amount from frontend.
     */
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

    const orderAmount = Number(
      order.total_amount
    );

    const paymentAmount = Number(
      payment.amount
    );

    /*
     * 6. Verify order total
     */
    if (
      Math.abs(
        calculatedAmount - orderAmount
      ) > 0.01
    ) {
      throw new Error(
        "Order total does not match order items"
      );
    }

    /*
     * 7. Verify payment amount
     */
    if (
      Math.abs(
        calculatedAmount - paymentAmount
      ) > 0.01
    ) {
      throw new Error(
        "Payment amount does not match order amount"
      );
    }

    /*
     * 8. Generate expected Razorpay signature
     *
     * Razorpay signature:
     *
     * HMAC_SHA256(
     *   razorpay_order_id + "|" + razorpay_payment_id,
     *   RAZORPAY_KEY_SECRET
     * )
     */
    const body =
      `${razorpayOrderId}|${razorpayPaymentId}`;

    const expectedSignature =
      crypto
        .createHmac(
          "sha256",
          process.env.RAZORPAY_KEY_SECRET
        )
        .update(body)
        .digest("hex");

    /*
     * 9. Safely compare signatures
     */
    const expectedBuffer =
      Buffer.from(expectedSignature, "utf8");

    const receivedBuffer =
      Buffer.from(razorpaySignature, "utf8");

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

    /*
     * 10. Save Razorpay payment details
     */
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

    /*
     * 11. Mark the order as paid
     */
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
      payment: updatedPaymentResult.rows[0],
      order: updatedOrderResult.rows[0],
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

//create razorpay order

const createRazorpayOrder = async ({
  orderId,
  customerId,
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Get order belonging to authenticated customer
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
      throw new Error(
        "Cancelled orders cannot be paid"
      );
    }

    if (order.status === "delivered") {
      throw new Error(
        "Order has already been delivered"
      );
    }

    // Prevent duplicate payment
    const existingPaymentQuery = `
      SELECT id
      FROM payments
      WHERE order_id = $1
      FOR UPDATE;
    `;

    const existingPaymentResult = await client.query(
      existingPaymentQuery,
      [orderId]
    );

    if (existingPaymentResult.rows.length > 0) {
      throw new Error(
        "Payment already exists for this order"
      );
    }

    // Calculate amount from order items
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

    const orderAmount = Number(
      order.total_amount
    );

    // Verify order total
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

    // Razorpay requires paise
    const amountInPaise = Math.round(
      calculatedAmount * 100
    );

    // Create Razorpay order
    const razorpayOrder =
      await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: `order_${orderId}`,
      });

    // Create local payment
    const paymentQuery = `
      INSERT INTO payments (
        order_id,
        payment_method,
        amount,
        status,
        razorpay_order_id
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    const paymentResult = await client.query(
      paymentQuery,
      [
        orderId,
        "razorpay",
        calculatedAmount,
        "pending",
        razorpayOrder.id,
      ]
    );

    await client.query("COMMIT");

    return {
      payment: paymentResult.rows[0],
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