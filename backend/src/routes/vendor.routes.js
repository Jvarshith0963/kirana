const express = require("express");
const { getDashboardSummary } = require("../controllers/vendorDashboard.controller");
const { getSalesReport } = require("../controllers/vendorSales.controller");
const {
  listVendorProducts, createVendorProduct, updateVendorProduct,
  deleteVendorProduct, updateStock, toggleAvailability,
} = require("../controllers/vendorProduct.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const {
  validateCreateProduct, validateUpdateProduct, validateStockUpdate, validateProductId,
} = require("../validators/vendorProduct.validators");

const router = express.Router();

router.use(authenticate, authorize("vendor", "admin"));

router.get("/dashboard", getDashboardSummary);
router.get("/sales", getSalesReport);

router.get("/products", listVendorProducts);
router.post("/products", validateCreateProduct, validate, createVendorProduct);
router.patch("/products/:id", validateUpdateProduct, validate, updateVendorProduct);
router.delete("/products/:id", validateProductId, validate, deleteVendorProduct);
router.patch("/products/:id/stock", validateStockUpdate, validate, updateStock);
router.patch("/products/:id/toggle", validateProductId, validate, toggleAvailability);

module.exports = router;