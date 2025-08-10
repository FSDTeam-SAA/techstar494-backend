const { Router } = require("express");
const couponMakingController = require("./couponMaking.controller");
const auth = require("../../middleware/auth");
const USER_ROLE = require("../user/user.constant");

const router = Router();

router.post(
  "/create",
  auth(USER_ROLE.admin),
  couponMakingController.createCoupon
);
router.get("/", couponMakingController.getAllCoupon);
router.get("/:couponId", couponMakingController.getSingleCoupon);

router.put(
  "/update/:couponId",
  auth(USER_ROLE.admin),
  couponMakingController.updateCoupon
);

router.delete(
  "/delete/:couponId",
  auth(USER_ROLE.admin),
  couponMakingController.deleteCoupon
);

const couponMakingRouter = router;
module.exports = couponMakingRouter;
