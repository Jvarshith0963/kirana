const express = require("express");
const { getNearbyStores, getStoreProfile } = require("../controllers/store.controller");
const validate = require("../middleware/validate.middleware");
const { validateNearbyStores, validateStoreId } = require("../validators/store.validators");

const router = express.Router();

router.get("/nearby", validateNearbyStores, validate, getNearbyStores);

router.get("/:id", validateStoreId, validate, getStoreProfile);

module.exports = router;