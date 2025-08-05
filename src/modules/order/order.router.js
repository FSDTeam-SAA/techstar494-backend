const express = require("express");
const {
  createOrderByProduct,
  getUserOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
  getSaveBillingInfo,
} = require("../../modules/order/order.controller");
const auth = require("../../middleware/auth");
const USER_ROLE = require("../user/user.constant");

const router = express.Router();

router.post("/create-order", auth(USER_ROLE.user), createOrderByProduct);
router.get("/", auth(USER_ROLE.user), getUserOrders);
router.get("/billing-info", auth(USER_ROLE.user), getSaveBillingInfo);

router.get("/:orderId", getOrderById);
router.put("/:orderId/cancel", cancelOrder);

router.put(
  "/status/:orderId",
  auth(USER_ROLE.user, USER_ROLE.admin),
  updateOrderStatus
);

module.exports = router;
