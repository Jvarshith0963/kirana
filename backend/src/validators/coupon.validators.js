const { body } = require("express-validator");

const validateCouponRequest = [
  body("items").isArray({ min: 1 }).withMessage("items must be a non-empty array"),
  body("items.*.product_id").isInt({ min: 1 }).withMessage("each item needs a valid product_id"),
  body("items.*.quantity").isInt({ min: 1, max: 100 }).withMessage("each item needs quantity 1-100"),
  body("coupon_code").optional().isString().trim(),
];

module.exports = { validateCouponRequest };