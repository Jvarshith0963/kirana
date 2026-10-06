const express = require("express");

const {
  getProducts,
  getProductById,
  uploadProductImage,
} = require("../controllers/product.controller");

const upload = require("../middleware/upload.middleware");
const { authenticate, authorize } = require("../middleware/auth.middleware");
const { writeLimiter } = require("../middleware/rateLimiter.middleware");
const validate = require("../middleware/validate.middleware");
const { validateProductList, validateProductId } = require("../validators/product.validators");

const router = express.Router();

router.get("/", validateProductList, validate, getProducts);

router.get("/:id", validateProductId, validate, getProductById);

router.post(
  "/:id/image",
  writeLimiter,
  authenticate,
  authorize("vendor", "admin"),
  validateProductId,
  validate,
  upload.single("image"),
  uploadProductImage
);

module.exports = router;