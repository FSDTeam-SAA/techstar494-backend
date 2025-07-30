const { Router } = require("express");
const couponMakingController = require("./couponMaking.controller");

const router = Router();

router.post("/create", couponMakingController.createCoupon);
router.get("/", couponMakingController.getAllCoupon);
router.get("/:couponId", couponMakingController.getSingleCoupon);

router.put("/update/:couponId", couponMakingController.updateCoupon);

router.delete("/delete/:couponId", couponMakingController.deleteCoupon);

const couponMakingRouter = router;
module.exports = couponMakingRouter;
