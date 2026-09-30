const express = require("express");
const {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
} = require("../controllers/cart.controller");
const { authenticate } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const {
  validateAddCartItem,
  validateUpdateCartItem,
  validateCartItemId,
} = require("../validators/cart.validators");

const router = express.Router();

router.use(authenticate); // every cart route requires login

router.get("/", getCart);
router.post("/items", validateAddCartItem, validate, addCartItem);
router.patch("/items/:id", validateUpdateCartItem, validate, updateCartItem);
router.delete("/items/:id", validateCartItemId, validate, removeCartItem);

module.exports = router;