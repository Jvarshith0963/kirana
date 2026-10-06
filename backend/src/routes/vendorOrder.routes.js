const express = require("express");
const { listVendorOrders, acceptOrder, rejectOrder, updateOrderStatus } = require("../controllers/order.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authenticate, authorize("vendor"));

router.get("/", listVendorOrders);
router.patch("/:id/accept", acceptOrder);
router.patch("/:id/reject", rejectOrder);
router.patch("/:id/status", updateOrderStatus);

module.exports = router;