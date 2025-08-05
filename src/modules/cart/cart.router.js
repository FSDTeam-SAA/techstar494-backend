const express = require("express");
const {
  // getCart,
  addToCart,
  updateCartItemQuantity,
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
router.put("/:cartId", auth(USER_ROLE.user), updateCartItemQuantity);
router.delete("/remove/:cartId", auth(USER_ROLE.user), removeFromCart);
router.delete("/all-clear", auth(USER_ROLE.user), clearCart);

module.exports = router;
