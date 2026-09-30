const { body, param } = require("express-validator");

const validateCreateAddress = [
  body("address_type").optional().isIn(["home", "work", "other"]).withMessage("address_type must be home, work, or other"),
  body("address_line1").trim().notEmpty().withMessage("address_line1 is required"),
  body("city").trim().notEmpty().withMessage("city is required"),
  body("state").trim().notEmpty().withMessage("state is required"),
  body("pincode").matches(/^\d{6}$/).withMessage("pincode must be a 6-digit number"),
  body("is_default").optional().isBoolean().withMessage("is_default must be true or false"),
];

const validateUpdateAddress = [
  param("id").isInt({ min: 1 }).withMessage("id must be a positive integer"),
  body("address_type").optional().isIn(["home", "work", "other"]).withMessage("address_type must be home, work, or other"),
  body("pincode").optional().matches(/^\d{6}$/).withMessage("pincode must be a 6-digit number"),
  body("is_default").optional().isBoolean().withMessage("is_default must be true or false"),
];

const validateAddressId = [
  param("id").isInt({ min: 1 }).withMessage("id must be a positive integer"),
];

module.exports = { validateCreateAddress, validateUpdateAddress, validateAddressId };