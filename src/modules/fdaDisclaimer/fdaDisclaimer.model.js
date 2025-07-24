const { Schema, model } = require("mongoose");

const fdaDisclaimerModel = new Schema({
  description: {
    type: String,
    required: true,
  },
});

const FadDisclaimer = model("FadDisclaimer", fdaDisclaimerModel);
module.exports = FadDisclaimer;
