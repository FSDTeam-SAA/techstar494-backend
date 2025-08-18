const { Router } = require("express");
const promotionController = require("./promotions.controller");

const router = Router();

router.post("/", promotionController.createPromotion);
router.get("/", promotionController.getPromotions);
router.get("/:id", promotionController.getPromotionById);
router.put("/:id", promotionController.updatePromotion);
router.delete("/:id", promotionController.deletePromotion);

const PromotionRouter = router;
module.exports = PromotionRouter;
