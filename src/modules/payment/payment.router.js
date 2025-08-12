const { Router } = require("express");
const paymentController = require("./payment.controller");
const auth = require("../../middleware/auth");
const USER_ROLE = require("../user/user.constant");

const router = Router();

router.post(
  "/create-payment",
  auth(USER_ROLE.user),
  paymentController.createPaymentByProduct
);

const paymentRouter = router;
module.exports = paymentRouter;
