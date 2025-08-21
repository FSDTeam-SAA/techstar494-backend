const express = require("express");
const {
  createOrderByProduct,
  getUserOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
  getSaveBillingInfo,
  createOrderByCart,
  getAllOrders,
} = require("../../modules/order/order.controller");
const auth = require("../../middleware/auth");
const USER_ROLE = require("../user/user.constant");

const router = express.Router();

router.post(
  "/create-order",
  auth(USER_ROLE.user, USER_ROLE.admin),
  createOrderByProduct
);
router.post(
  "/create-order-by-cart",
  auth(USER_ROLE.user, USER_ROLE.admin),
  createOrderByCart
);

router.get("/my-order", auth(USER_ROLE.user, USER_ROLE.admin), getUserOrders);
router.get("/", getAllOrders);
router.get("/billing-info", auth(USER_ROLE.user, USER_ROLE.admin), getSaveBillingInfo);

router.get("/:orderId", getOrderById);

router.put(
  "/status/:orderId",
  auth(USER_ROLE.user, USER_ROLE.admin),
  updateOrderStatus
);

router.put(
  "/cancel/:orderId",
  auth(USER_ROLE.user, USER_ROLE.admin),
  cancelOrder
);

module.exports = router;
