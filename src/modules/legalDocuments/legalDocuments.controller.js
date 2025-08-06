const LegalDocument = require("../../modules/legalDocuments/legalDocuments.model");

const getAllDocuments = async (req, res) => {
  try {
    const documents = await LegalDocument.find();
    res.status(200).json({
      success: true,
      data: documents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch legal documents",
      error: error.message,
    });
  }
};

const getDocumentByType = async (req, res) => {
  try {
    const document = await LegalDocument.findOne({
      documentType: req.params.type,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    res.status(200).json({
      success: true,
      data: document,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch document",
      error: error.message,
    });
  }
};

const upsertDocument = async (req, res) => {
  try {
    const { documentType, content } = req.body;

    if (!documentType || !content) {
      return res.status(400).json({
        success: false,
        message: "Document type and content are required",
      });
    }

    const document = await LegalDocument.findOneAndUpdate(
      { documentType },
      { content, lastUpdated: Date.now() },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    const { privacy_policy, terms_conditions, legality, refund_policy } =
      document;

    if (privacy_policy) {
      res.status(200).json({
        success: true,
        message: "Privacy policy updated successfully",
        data: privacy_policy,
      });
    } else if (terms_conditions) {
      res.status(200).json({
        success: true,
        message: "Terms and conditions updated successfully",
        data: terms_conditions,
      });
    } else if (legality) {
      res.status(200).json({
        success: true,
        message: "Legality updated successfully",
        data: legality,
      });
    } else if (refund_policy) {
      res.status(200).json({
        success: true,
        message: "Refund policy updated successfully",
        data: refund_policy,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update legal document",
      error: error.message,
    });
  }
};

module.exports = {
  getAllDocuments,
  getDocumentByType,
  upsertDocument,
};
