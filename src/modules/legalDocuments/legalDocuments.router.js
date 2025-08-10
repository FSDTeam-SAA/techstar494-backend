const express = require("express");
const {
  createDocument,
  getPrivacyPolicy,
  termsConditions,
  refundPolicy,
  legality,
} = require("../../modules/legalDocuments/legalDocuments.controller");

const router = express.Router();

router.post("/create", createDocument);
router.get("/privacy-policy", getPrivacyPolicy);
router.get("/terms-conditions", termsConditions);
router.get("/legality", legality);
router.get("/refund-policy", refundPolicy);

const legalDocumentsRouter = router;
module.exports = legalDocumentsRouter;
