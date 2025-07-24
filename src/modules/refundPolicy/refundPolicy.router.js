const { Router } = require("express");
const {
  createRefundPolicy,
  getRefundPolicy,
  updateRefundPolicy,
} = require("./refundPolicy.controller");

const router = Router();

router.post("/create", createRefundPolicy);
router.get("/", getRefundPolicy);
router.put("/:id", updateRefundPolicy);

const refundPolicyRouter = router;
module.exports = refundPolicyRouter;
