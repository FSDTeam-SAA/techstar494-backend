const { Schema, model } = require("mongoose");

const couponMakingSchema = new Schema({
  couponCode: {
    type: String,
    required: true,
  },
  discount: {
    type: Number,
    required: true,
  },
  timeValidation: {
    type: String,
    required: true,
  },
});

const couponMaking = model("CouponMaking", couponMakingSchema);
module.exports = couponMaking;
