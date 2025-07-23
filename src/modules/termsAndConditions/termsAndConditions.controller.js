const TermsAndConditions = require("./termsAndConditions.model");

const createTermsAndConditions = async (req, res) => {
  try {
    const result = await TermsAndConditions.create(req.body);

    return res.status(201).json({
      success: true,
      message: "Terms and conditions created successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const tramsAndConditionsController = {
  createTermsAndConditions,
};

module.exports = tramsAndConditionsController;
