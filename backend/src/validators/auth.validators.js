const { body } = require("express-validator");

const validateRegister = [
  body("name").trim().notEmpty().withMessage("name is required"),
  body("email").isEmail().withMessage("valid email is required").normalizeEmail(),
  body("password").isLength({ min: 8 }).withMessage("password must be at least 8 characters"),
  body("role").isIn(["customer", "vendor"]).withMessage("role must be customer or vendor"),
  body("phone").optional().isMobilePhone("en-IN").withMessage("invalid phone number"),
  body("storeName").if(body("role").equals("vendor")).notEmpty().withMessage("storeName is required for vendors"),
  body("address").if(body("role").equals("vendor")).notEmpty().withMessage("address is required for vendors"),
];

const validateLogin = [
  body("email").isEmail().withMessage("valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("password is required"),
];

module.exports = { validateRegister, validateLogin };