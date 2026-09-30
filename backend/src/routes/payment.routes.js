const express = require("express");
const {
  createPaymentOrder,
  verifyPayment,
  handleWebhook,
  payWithCOD,
  initiateRefund,
} = require("../controllers/payment.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const {
  validateOrderId,
  validateVerifyPayment,
  validatePaymentId,
} = require("../validators/payment.validators");

const router = express.Router();

// No auth — this would be called by Razorpay's server directly, verified via signature
router.post("/webhook", handleWebhook);

router.post("/create-order", authenticate, validateOrderId, validate, createPaymentOrder);
router.post("/verify", authenticate, validateVerifyPayment, validate, verifyPayment);
router.post("/cod", authenticate, validateOrderId, validate, payWithCOD);
router.post("/:id/refund", authenticate, authorize("vendor", "admin"), validatePaymentId, validate, initiateRefund);

module.exports = router;