const { body, param } = require("express-validator");

const validateAddCartItem = [
  body("product_id").isInt({ min: 1 }).withMessage("product_id must be a positive integer"),
  body("quantity").optional().isInt({ min: 1, max: 100 }).withMessage("quantity must be 1-100"),
];

const validateUpdateCartItem = [
  param("id").isInt({ min: 1 }).withMessage("id must be a positive integer"),
  body("quantity").isInt({ min: 1, max: 100 }).withMessage("quantity must be 1-100"),
];

const validateCartItemId = [
  param("id").isInt({ min: 1 }).withMessage("id must be a positive integer"),
];

module.exports = { validateAddCartItem, validateUpdateCartItem, validateCartItemId };