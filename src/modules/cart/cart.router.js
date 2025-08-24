const express = require("express");
const {
  // getCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  getMyCartItems,
  updateDecreaseCartItemQuantity,
} = require("../../modules/cart/cart.controller");
const auth = require("../../middleware/auth");
const USER_ROLE = require("../user/user.constant");

const router = express.Router();

router.post("/addToCart", auth(USER_ROLE.user, USER_ROLE.admin), addToCart);
router.get("/", auth(USER_ROLE.user, USER_ROLE.admin), getMyCartItems);
// router.get("/", getCart);
router.put(
  "/:cartId",
  auth(USER_ROLE.user, USER_ROLE.admin),
  updateCartItemQuantity
);

router.put(
  "/decrease/:cartId",
  auth(USER_ROLE.user, USER_ROLE.admin),
  updateDecreaseCartItemQuantity
);

router.delete(
  "/remove/:cartId",
  auth(USER_ROLE.user, USER_ROLE.admin),
  removeFromCart
);
router.delete("/all-clear", auth(USER_ROLE.user, USER_ROLE.admin), clearCart);

module.exports = router;
