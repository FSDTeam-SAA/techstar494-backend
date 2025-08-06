const Faq = require("./faq.model");

// Create FAQ
const createFaq = async (req, res) => {
  try {
    const { question, answer } = req.body;

    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        message: "Both question and answer are required",
      });
    }

    const newFaq = await Faq.create({ question, answer });

    res.status(201).json({
      success: true,
      message: "FAQ created successfully",
      data: newFaq,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create FAQ",
      error: error.message,
    });
  }
};

// Get All FAQs
const getFaqs = async (req, res) => {
  try {
    const faqs = await Faq.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "FAQs fetched successfully",
      count: faqs.length,
      data: faqs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch FAQs",
      error: error.message,
    });
  }
};

// Get Single FAQ
const getFaqById = async (req, res) => {
  try {
    const faq = await Faq.findById(req.params.id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "FAQ fetched successfully",
      data: faq,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch FAQ",
      error: error.message,
    });
  }
};

// Update FAQ
const updateFaq = async (req, res) => {
  try {
    const { question, answer } = req.body;

    const faq = await Faq.findByIdAndUpdate(
      req.params.id,
      { question, answer },
      { new: true, runValidators: true }
    );

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "FAQ updated successfully",
      data: faq,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update FAQ",
      error: error.message,
    });
  }
};

// Delete FAQ
const deleteFaq = async (req, res) => {
  try {
    const faq = await Faq.findByIdAndDelete(req.params.id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "FAQ deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete FAQ",
      error: error.message,
    });
  }
};

const faqController = {
  createFaq,
  getFaqs,
  getFaqById,
  updateFaq,
  deleteFaq,
};

module.exports = faqController;
