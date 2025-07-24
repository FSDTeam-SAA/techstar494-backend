const { Schema, model } = require("mongoose");

const refundPolicyModel = new Schema({
  description: {
    type: String,
    required: true,
  },
});

const RefundPolicy = model("RefundPolicy", refundPolicyModel);
module.exports = RefundPolicy;
