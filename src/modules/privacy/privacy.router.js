const { Router } = require("express");
const {
  createPrivacy,
  getPrivacy,
  updatePrivacy,
} = require("./privacy.controller");

const router = Router();

router.post("/create", createPrivacy);
router.get("/", getPrivacy);
router.put("/:id", updatePrivacy);

const privacyRouter = router;
module.exports = privacyRouter;
