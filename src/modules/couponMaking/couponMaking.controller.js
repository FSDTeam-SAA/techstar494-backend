const couponMaking = require("./couponMaking.model");

const createCoupon = async (req, res) => {
  try {
    const result = await couponMaking.create(req.body);

    return res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      data: result,
    });
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, message: error.message, error });
  }
};

const getAllCoupon = async (req, res) => {
  try {
    const result = await couponMaking.find({});

    return res.status(200).json({
      success: true,
      message: "Coupon fetched successfully",
      data: result,
    });
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, message: error.message, error });
  }
};

const getSingleCoupon = async (req, res) => {
  try {
    const { couponId } = req.params;
    const coupon = await couponMaking.findById(couponId);
    if (!coupon) {
      throw new Error("Coupon not found");
    }

    const result = await couponMaking.findById(couponId);

    return res.status(200).json({
      success: true,
      message: "Coupon get successfully",
      data: result,
    });
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, message: error.message, error });
  }
};

const updateCoupon = async (req, res) => {
  try {
    const { couponId } = req.params;
    const coupon = await couponMaking.findById(couponId);
    if (!coupon) {
      throw new Error("Coupon not found");
    }
    const result = await couponMaking.findByIdAndUpdate(couponId, req.body, {
      new: true,
    });

    return res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
      data: result,
    });
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, message: error.message, error });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const { couponId } = req.params;
    const coupon = await couponMaking.findById(couponId);
    if (!coupon) {
      throw new Error("Coupon not found");
    }
    const result = await couponMaking.findByIdAndDelete(couponId);

    return res.status(200).json({
      success: true,
      message: "Coupon deleted successfully",
      data: result,
    });
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, message: error.message, error });
  }
};

const couponMakingController = {
  createCoupon,
  getAllCoupon,
  getSingleCoupon,
  updateCoupon,
  deleteCoupon,
};

module.exports = couponMakingController;
