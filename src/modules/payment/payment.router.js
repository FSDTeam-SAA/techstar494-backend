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

router.post(
  "/confirm-payment",
  //   auth(USER_ROLE.user),
  paymentController.confirmPayment
);

router.get(
  "/my-payment",
  auth(USER_ROLE.user),
  paymentController.getMyPayments
);

router.get(
  "/all-payment",
  //   auth(USER_ROLE.admin),
  paymentController.getAllPayments
);

const paymentRouter = router;
module.exports = paymentRouter;
