const { Router } = require("express");
const {
  createFadDisclaimer,
  getFadDisclaimer,
  updateFadDisclaimer,
} = require("./fdaDisclaimer.controller");
const auth = require("../../middleware/auth");
const USER_ROLE = require("../user/user.constant");

const router = Router();

router.post("/create", auth(USER_ROLE.admin), createFadDisclaimer);
router.get("/",  getFadDisclaimer);
router.put("/:id", auth(USER_ROLE.admin), updateFadDisclaimer);

const fdaDisclaimerRouter = router;
module.exports = fdaDisclaimerRouter;
