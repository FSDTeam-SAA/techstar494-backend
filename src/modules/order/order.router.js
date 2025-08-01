const express = require("express");
const {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
} = require("../../modules/order/order.controller");
const auth = require("../../middleware/auth");
const USER_ROLE = require("../user/user.constant");

const router = express.Router();

router.post("/create-order", auth(USER_ROLE.user), createOrder);
router.get("/", getUserOrders);
router.get("/:orderId", getOrderById);
router.put("/:orderId/cancel", cancelOrder);
router.put("/admin/:orderId", updateOrderStatus);

module.exports = router;
