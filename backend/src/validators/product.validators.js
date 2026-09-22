const { query, param } = require("express-validator");

const validateProductList = [
  query("page").optional().isInt({ min: 1 }).withMessage("page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit must be 1-100"),
  query("sort_by").optional().isIn(["name", "price", "created_at", "updated_at"]).withMessage("invalid sort_by value"),
  query("order").optional().isIn(["asc", "desc"]).withMessage("order must be asc or desc"),
  query("min_price").optional().isFloat({ min: 0 }).withMessage("min_price must be a positive number"),
  query("max_price").optional().isFloat({ min: 0 }).withMessage("max_price must be a positive number"),
];

const validateProductId = [
  param("id").isInt({ min: 1 }).withMessage("id must be a positive integer"),
];

module.exports = { validateProductList, validateProductId };