const { body, param } = require("express-validator");

// ============================================================
// POST /api/wishlist/items
// body: { product_id }
// ============================================================
const validateAddWishlistItem = [
  body("product_id")
    .notEmpty()
    .withMessage("Product ID is required")
    .isInt({ min: 1 })
    .withMessage("Product ID must be a positive integer"),
];

// ============================================================
// DELETE /api/wishlist/items/:id
// POST /api/wishlist/items/:id/move-to-cart
// ============================================================
const validateWishlistItemId = [
  param("id")
    .notEmpty()
    .withMessage("Wishlist item ID is required")
    .isInt({ min: 1 })
    .withMessage("Wishlist item ID must be a positive integer"),
];

module.exports = {
  validateAddWishlistItem,
  validateWishlistItemId,
};