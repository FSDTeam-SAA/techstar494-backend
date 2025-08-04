const express = require("express");
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getMyCartItems,
} = require("../../modules/cart/cart.controller");
const auth = require("../../middleware/auth");
const USER_ROLE = require("../user/user.constant");

const router = express.Router();

router.post("/addToCart", auth(USER_ROLE.user), addToCart);
router.get("/", auth(USER_ROLE.user), getMyCartItems);
// router.get("/", getCart);
router.put("/:itemId", updateCartItem);
router.delete("/:itemId", auth(USER_ROLE.user), removeFromCart);
router.delete("/", clearCart);

module.exports = router;
