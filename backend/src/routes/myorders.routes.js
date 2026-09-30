const express = require("express");
const { listMyOrders, getMyOrderDetail } = require("../controllers/myorders.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authenticate, authorize("customer"));

router.get("/", listMyOrders);
router.get("/:id", getMyOrderDetail);

module.exports = router;