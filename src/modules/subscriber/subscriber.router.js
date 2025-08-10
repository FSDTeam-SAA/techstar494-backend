const express = require("express");
const {
  subscribe,
  unsubscribe,
  getSubscribers,
  sendEmailToSubscribers,
} = require("../../modules/subscriber/subscriber.controller");

const router = express.Router();

router.post("/create-subscribe", subscribe);
router.post("/unsubscribe", unsubscribe);

router.get("/all", getSubscribers);
router.post("/admin/send-email", sendEmailToSubscribers);

const subscriberRouter = router;
module.exports = subscriberRouter;
