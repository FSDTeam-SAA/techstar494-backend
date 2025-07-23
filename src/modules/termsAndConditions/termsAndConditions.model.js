const { Schema, model } = require("mongoose");

const termsAndConditions = new Schema({
  description: {
    type: String,
    required: true,
  },
});

const TermsAndConditions = model("TermsAndConditions", termsAndConditions);
module.exports = TermsAndConditions;
