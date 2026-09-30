const express = require("express");
const {
  listAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} = require("../controllers/address.controller");
const { authenticate } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const {
  validateCreateAddress,
  validateUpdateAddress,
  validateAddressId,
} = require("../validators/address.validators");

const router = express.Router();

router.use(authenticate);

router.get("/", listAddresses);
router.post("/", validateCreateAddress, validate, createAddress);
router.patch("/:id", validateUpdateAddress, validate, updateAddress);
router.delete("/:id", validateAddressId, validate, deleteAddress);
router.patch("/:id/default", validateAddressId, validate, setDefaultAddress);

module.exports = router;