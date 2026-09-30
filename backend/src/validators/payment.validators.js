const { body, param } = require("express-validator");

const validateOrderId = [
  body("order_id").isInt({ min: 1 }).withMessage("order_id must be a positive integer"),
];

const validateVerifyPayment = [
  body("razorpay_order_id").notEmpty().withMessage("razorpay_order_id is required"),
  body("razorpay_payment_id").notEmpty().withMessage("razorpay_payment_id is required"),
  body("razorpay_signature").notEmpty().withMessage("razorpay_signature is required"),
];

const validatePaymentId = [
  param("id").isInt({ min: 1 }).withMessage("id must be a positive integer"),
];

module.exports = { validateOrderId, validateVerifyPayment, validatePaymentId };