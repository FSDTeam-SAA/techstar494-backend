const mongoose = require("mongoose");

const legalDocumentSchema = new mongoose.Schema({
  documentType: {
    type: String,
    required: true,
    enum: ["privacy_policy", "terms_conditions", "legality", "refund_policy"],
    unique: true,
  },
  content: {
    type: String,
    required: true,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

const LegalDocument =
  mongoose.models.LegalDocument ||
  mongoose.model("LegalDocument", legalDocumentSchema);

module.exports = LegalDocument;
