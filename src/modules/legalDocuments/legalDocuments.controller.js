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

const getPrivacyPolicy = async (req, res) => {
  try {
    const privacyPolicy = await LegalDocument.findOne({
      documentType: "privacy_policy",
    });

    res.status(200).json({
      success: true,
      message: "Privacy policy fetched successfully",
      data: privacyPolicy,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch privacy policy",
      error: error.message,
    });
  }
};

const termsConditions = async (req, res) => {
  try {
    const termsConditions = await LegalDocument.findOne({
      documentType: "terms_conditions",
    });

    res.status(200).json({
      success: true,
      message: "Terms and conditions fetched successfully",
      data: termsConditions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch terms and conditions",
      error: error.message,
    });
  }
};

const legality = async (req, res) => {
  try {
    const legality = await LegalDocument.findOne({
      documentType: "legality",
    });

    res.status(200).json({
      success: true,
      message: "Legality fetched successfully",
      data: legality,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch legality",
      error: error.message,
    });
  }
};

const refundPolicy = async (req, res) => {
  try {
    const refundPolicy = await LegalDocument.findOne({
      documentType: "refund_policy",
    });

    res.status(200).json({
      success: true,
      message: "Refund policy fetched successfully",
      data: refundPolicy,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch refund policy",
      error: error.message,
    });
  }
};

module.exports = {
  createDocument,
  getPrivacyPolicy,
  termsConditions,
  legality,
  refundPolicy,
};
