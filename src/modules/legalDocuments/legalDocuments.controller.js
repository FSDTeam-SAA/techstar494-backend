const LegalDocument = require("../../modules/legalDocuments/legalDocuments.model");

const createDocument = async (req, res) => {
  try {
    const { documentType, content } = req.body;

    if (!documentType || !content) {
      return res.status(400).json({
        success: false,
        message: "Document type and content are required",
      });
    }

    const document = await LegalDocument.create({ documentType, content });

    let message = "";
    switch (documentType) {
      case "privacy_policy":
        message = "Privacy policy created successfully";
        break;
      case "terms_conditions":
        message = "Terms and conditions created successfully";
        break;
      case "legality":
        message = "Legality created successfully";
        break;
      case "refund_policy":
        message = "Refund policy created successfully";
        break;
      default:
        message = "Document created successfully";
    }

    res.status(201).json({
      success: true,
      message,
      data: document,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create document",
      error: error.message,
    });
  }
};


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

module.exports = {
  createDocument,
  getAllDocuments,
  getDocumentByType,
};
