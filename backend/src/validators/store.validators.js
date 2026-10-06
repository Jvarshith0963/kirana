const { query, param } = require("express-validator");

const validateNearbyStores = [
  query("pincode").optional().isPostalCode("IN").withMessage("pincode must be a valid 6-digit Indian pincode"),
  query("lat").optional().isFloat({ min: -90, max: 90 }).withMessage("lat must be between -90 and 90"),
  query("lng").optional().isFloat({ min: -180, max: 180 }).withMessage("lng must be between -180 and 180"),
  query("radius_km").optional().isFloat({ min: 0.1, max: 50 }).withMessage("radius_km must be 0.1-50"),
];

const validateStoreId = [
  param("id").isInt({ min: 1 }).withMessage("id must be a positive integer"),
];

module.exports = { validateNearbyStores, validateStoreId };