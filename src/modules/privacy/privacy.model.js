const { Schema, model } = require("mongoose");

const privacyModel = new Schema({
  description: {
    type: String,
    required: true,
  },
});

const Privacy = model("Privacy", privacyModel);
module.exports = Privacy;
