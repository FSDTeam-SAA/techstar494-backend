const { Router } = require("express");
const couponMakingController = require("./couponMaking.controller");

const router = Router();

router.post("/create", couponMakingController.createCoupon);

const couponMakingRouter = router;
module.exports = couponMakingRouter;
