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
      case "fda":
        message = "FDA created successfully";
        break;
      case "setPromotion":
        message = "Set promotion created successfully";
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

const getFda = async (req, res) => {
  try {
    const privacyPolicy = await LegalDocument.findOne({
      documentType: "fda",
    });

    res.status(200).json({
      success: true,
      message: "FDA fetched successfully",
      data: privacyPolicy,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch FDA",
      error: error.message,
    });
  }
};

const getLabs = async (req, res) => {
  try {
    const privacyPolicy = await LegalDocument.findOne({
      documentType: "labs",
    });

    res.status(200).json({
      success: true,
      message: "Labs fetched successfully",
      data: privacyPolicy,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch labs",
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

const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { documentType, content } = req.body;

    if (!documentType || !content) {
      return res.status(400).json({
        success: false,
        message: "Document type and content are required",
      });
    }

    const document = await LegalDocument.findByIdAndUpdate(
      id,
      { documentType, content },
      { new: true, runValidators: true }
    );

    let message = "";
    switch (documentType) {
      case "privacy_policy":
        message = "Privacy policy updated successfully";
        break;
      case "terms_conditions":
        message = "Terms and conditions updated successfully";
        break;
      case "legality":
        message = "Legality updated successfully";
        break;
      case "refund_policy":
        message = "Refund policy updated successfully";
        break;
      case "fda":
        message = "FDA updated successfully";
        break;
      case "setPromotion":
        message = "Set promotion updated successfully";
        break;
      default:
        message = "Document updated successfully";
    }

    res.status(200).json({
      success: true,
      message,
      data: document,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update document",
      error: error.message,
    });
  }
};

module.exports = {
  createDocument,
  getPrivacyPolicy,
  getFda,
  termsConditions,
  legality,
  refundPolicy,
  updateDocument,
  getLabs,
};
