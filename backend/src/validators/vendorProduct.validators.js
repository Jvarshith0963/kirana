const { body, param } = require("express-validator");

const validateCreateProduct = [
  body("name").trim().notEmpty().withMessage("name is required"),
  body("sku").trim().notEmpty().withMessage("sku is required"),
  body("price").isFloat({ min: 0 }).withMessage("price must be a positive number"),
  body("stock_quantity").isInt({ min: 0 }).withMessage("stock_quantity must be 0 or more"),
  body("unit").trim().notEmpty().withMessage("unit is required"),
  body("discount_percent").optional().isFloat({ min: 0, max: 100 }).withMessage("discount_percent must be 0-100"),
];

const validateUpdateProduct = [
  param("id").isInt({ min: 1 }).withMessage("id must be a positive integer"),
  body("price").optional().isFloat({ min: 0 }).withMessage("price must be a positive number"),
  body("discount_percent").optional().isFloat({ min: 0, max: 100 }).withMessage("discount_percent must be 0-100"),
];

const validateStockUpdate = [
  param("id").isInt({ min: 1 }).withMessage("id must be a positive integer"),
  body("stock_quantity").isInt({ min: 0 }).withMessage("stock_quantity must be 0 or more"),
];

const validateProductId = [
  param("id").isInt({ min: 1 }).withMessage("id must be a positive integer"),
];

module.exports = { validateCreateProduct, validateUpdateProduct, validateStockUpdate, validateProductId };