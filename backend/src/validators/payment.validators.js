const {
  body,
  param,
} = require("express-validator");

// ============================================================
// Order ID validator
// ============================================================

const validateOrderId = [
  body("order_id")
    .isInt({ min: 1 })
    .withMessage(
      "order_id must be a positive integer"
    ),
];

// ============================================================
// Razorpay verification validator
// ============================================================

const validateVerifyPayment = [
  body("order_id")
    .isInt({ min: 1 })
    .withMessage(
      "order_id must be a positive integer"
    ),

  body("razorpay_order_id")
    .trim()
    .notEmpty()
    .withMessage(
      "razorpay_order_id is required"
    ),

  body("razorpay_payment_id")
    .trim()
    .notEmpty()
    .withMessage(
      "razorpay_payment_id is required"
    ),

  body("razorpay_signature")
    .trim()
    .notEmpty()
    .withMessage(
      "razorpay_signature is required"
    ),
];

// ============================================================
// Payment ID validator
// ============================================================

const validatePaymentId = [
  param("id")
    .isInt({ min: 1 })
    .withMessage(
      "id must be a positive integer"
    ),
];

module.exports = {
  validateOrderId,
  validateVerifyPayment,
  validatePaymentId,
};