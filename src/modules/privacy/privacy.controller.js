const Privacy = require("./privacy.model");

const createPrivacy = async (req, res) => {
  try {
    const result = await Privacy.create(req.body);

    return res.status(201).json({
      success: true,
      message: "Privacy created successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getPrivacy = async (req, res) => {
  try {
    const result = await Privacy.findOne({});

    return res.status(200).json({
      success: true,
      message: "Privacy fetched successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const updatePrivacy = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Privacy.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: "Privacy updated successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const privacyController = {
  createPrivacy,
  getPrivacy,
  updatePrivacy,
};
module.exports = privacyController;
