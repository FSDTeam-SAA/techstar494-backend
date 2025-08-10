const express = require("express");
const {
  subscribe,
  unsubscribe,
  getSubscribers,
  sendEmailToSubscribers,
} = require("../../modules/subscriber/subscriber.controller");
const auth = require("../../middleware/auth");
const USER_ROLE = require("../user/user.constant");

const router = express.Router();

router.post("/create-subscribe", subscribe);
router.post("/unsubscribe", unsubscribe);

router.get("/all", auth(USER_ROLE.admin), getSubscribers);
router.post("/admin/send-email", auth(USER_ROLE.admin), sendEmailToSubscribers);

const subscriberRouter = router;
module.exports = subscriberRouter;
