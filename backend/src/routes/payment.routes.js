const express = require("express");

const {
  createPaymentOrder,
  verifyPayment,
  handleWebhook,
  payWithCOD,
  initiateRefund,
} = require("../controllers/payment.controller");

const {
  authenticate,
  authorize,
} = require("../middleware/auth.middleware");

const validate = require("../middleware/validate.middleware");

const {
  validateOrderId,
  validateVerifyPayment,
  validatePaymentId,
} = require("../validators/payment.validators");

const router = express.Router();

// ============================================================
// Razorpay Webhook
// ============================================================
//
// NOTE:
// The application must preserve req.rawBody before express.json()
// parses the request. See the app.js change below.
//
// ============================================================

router.post(
  "/webhook",
  handleWebhook
);

// ============================================================
// Create Razorpay order
// ============================================================

router.post(
  "/create-order",
  authenticate,
  validateOrderId,
  validate,
  createPaymentOrder
);

// ============================================================
// Verify Razorpay payment
// ============================================================

router.post(
  "/verify",
  authenticate,
  validateVerifyPayment,
  validate,
  verifyPayment
);

// ============================================================
// Cash on Delivery
// ============================================================

router.post(
  "/cod",
  authenticate,
  validateOrderId,
  validate,
  payWithCOD
);

// ============================================================
// Refund
// ============================================================

router.post(
  "/:id/refund",
  authenticate,
  authorize("vendor", "admin"),
  validatePaymentId,
  validate,
  initiateRefund
);

module.exports = router;