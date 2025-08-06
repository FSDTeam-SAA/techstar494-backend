const { Router } = require("express");
const faqController = require("./faq.controller");

const router = Router();

router.post("/create", faqController.createFaq);
router.get("/", faqController.getFaqs);
router.get("/:id", faqController.getFaqById);
router.put("/update/:id", faqController.updateFaq);
router.delete("/:id", faqController.deleteFaq);

const FaqRouter = router;
module.exports = FaqRouter;
