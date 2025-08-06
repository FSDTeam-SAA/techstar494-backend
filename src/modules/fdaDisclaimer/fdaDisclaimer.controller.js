const FadDisclaimer = require("./fdaDisclaimer.model");

const createFadDisclaimer = async (req, res) => {
  try {
    const result = await FadDisclaimer.create(req.body);

    return res.status(201).json({
      success: true,
      message: "FDA Disclaimer created successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getFadDisclaimer = async (req, res) => {
  try {
    const result = await FadDisclaimer.findOne({});

    return res.status(200).json({
      success: true,
      message: "FDA Disclaimer fetched successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const updateFadDisclaimer = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await FadDisclaimer.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: "FDA Disclaimer updated successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const fadDisclaimerController = {
  createFadDisclaimer,
  getFadDisclaimer,
  updateFadDisclaimer,
};
module.exports = fadDisclaimerController;
