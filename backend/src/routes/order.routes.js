const express = require("express");
const { checkout, updateOrderStatus } = require("../controllers/order.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const { validateStatusUpdate } = require("../validators/order.validators");
const { downloadInvoice } = require("../controllers/invoice.controller");

const router = express.Router();

router.get("/:id/invoice", authenticate, downloadInvoice);

router.post("/checkout", authenticate, authorize("customer"), checkout);
router.patch(
  "/:id/status",
  authenticate,
  authorize("vendor", "admin"),
  validateStatusUpdate,
  validate,
  updateOrderStatus
);

module.exports = router;