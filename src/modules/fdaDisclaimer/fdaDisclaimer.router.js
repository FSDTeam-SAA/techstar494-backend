const { Router } = require("express");
const {
  createFadDisclaimer,
  getFadDisclaimer,
  updateFadDisclaimer,
} = require("./fdaDisclaimer.controller");

const router = Router();

router.post("/create", createFadDisclaimer);
router.get("/", getFadDisclaimer);
router.put("/:id", updateFadDisclaimer);

const fdaDisclaimerRouter = router;
module.exports = fdaDisclaimerRouter;
