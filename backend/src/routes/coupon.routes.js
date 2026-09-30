
const express = require("express");
const { validateCoupon } = require("../controllers/coupon.controller");
const { authenticate } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const { validateCouponRequest } = require("../validators/coupon.validators");

const router = express.Router();

router.post("/validate", authenticate, validateCouponRequest, validate, validateCoupon);

module.exports = router;