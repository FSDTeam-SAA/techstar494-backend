const { Router } = require("express");
const faqController = require("./faq.controller");
const auth = require("../../middleware/auth");
const USER_ROLE = require("../user/user.constant");

const router = Router();

router.post("/create", auth(USER_ROLE.admin), faqController.createFaq);
router.get("/", faqController.getFaqs);
router.get("/:id", faqController.getFaqById);
router.put("/update/:id", auth(USER_ROLE.admin), faqController.updateFaq);
router.delete("/:id", auth(USER_ROLE.admin), faqController.deleteFaq);

const FaqRouter = router;
module.exports = FaqRouter;
