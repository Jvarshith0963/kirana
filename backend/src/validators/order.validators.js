const { body, param } = require("express-validator");

const validateStatusUpdate = [
  param("id").isInt({ min: 1 }).withMessage("id must be a positive integer"),
  body("status")
    .isIn(["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"])
    .withMessage("Invalid status value"),
];

module.exports = { validateStatusUpdate };