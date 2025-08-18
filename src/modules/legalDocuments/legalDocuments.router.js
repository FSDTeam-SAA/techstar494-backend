const express = require("express");
const {
  createDocument,
  getPrivacyPolicy,
  termsConditions,
  refundPolicy,
  legality,
  updateDocument,
  getFda,
  getLabs,
} = require("../../modules/legalDocuments/legalDocuments.controller");
const auth = require("../../middleware/auth");
const USER_ROLE = require("../user/user.constant");

const router = express.Router();

router.post("/create", auth(USER_ROLE.admin), createDocument);
router.get("/privacy-policy", getPrivacyPolicy);
router.get("/terms-conditions", termsConditions);
router.get("/legality", legality);
router.get("/refund-policy", refundPolicy);
router.get("/fda", getFda);
router.get("/labs", getLabs);
router.put("/update/:id", auth(USER_ROLE.admin), updateDocument);

const legalDocumentsRouter = router;
module.exports = legalDocumentsRouter;
