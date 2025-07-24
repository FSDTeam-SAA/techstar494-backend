const RefundPolicy = require("./refundPolicy.model");

const createRefundPolicy = async (req, res) => {
  try {
    const result = await RefundPolicy.create(req.body);

    return res.status(201).json({
      success: true,
      message: "Refund policy created successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getRefundPolicy = async (req, res) => {
  try {
    const result = await RefundPolicy.findOne({});

    return res.status(200).json({
      success: true,
      message: "Refund policy fetched successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const updateRefundPolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await RefundPolicy.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: "Refund policy updated successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const refundPolicyController = {
  createRefundPolicy,
  getRefundPolicy,
  updateRefundPolicy,
};
module.exports = refundPolicyController;
