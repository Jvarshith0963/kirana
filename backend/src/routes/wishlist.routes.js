const express = require("express");
const {
  getWishlist,
  addWishlistItem,
  removeWishlistItem,
  moveToCart,
} = require("../controllers/wishlist.controller");
const { authenticate } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const {
  validateAddWishlistItem,
  validateWishlistItemId,
} = require("../validators/wishlist.validators");

const router = express.Router();

router.use(authenticate);

router.get("/", getWishlist);
router.post("/items", validateAddWishlistItem, validate, addWishlistItem);
router.delete("/items/:id", validateWishlistItemId, validate, removeWishlistItem);
router.post("/items/:id/move-to-cart", validateWishlistItemId, validate, moveToCart);

module.exports = router;