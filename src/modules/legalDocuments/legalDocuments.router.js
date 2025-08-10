const express = require("express");
const {
  getAllDocuments,
  getDocumentByType,
  createDocument,
} = require("../../modules/legalDocuments/legalDocuments.controller");

const router = express.Router();

router.post("/create", createDocument);

router.get("/", getAllDocuments);
router.get("/:type", getDocumentByType);

const legalDocumentsRouter = router;
module.exports = legalDocumentsRouter;
