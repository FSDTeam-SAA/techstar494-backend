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

const couponMakingController = {
  createCoupon,
};

module.exports = couponMakingController;
