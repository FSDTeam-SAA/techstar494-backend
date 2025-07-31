const mongoose = require("mongoose");

const priceSchema = new mongoose.Schema({
  unit: { type: String, required: true }, // e.g. "ct", "g", "ml"
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    batch: { type: String },
    description: { type: String },
    disclaimers: { type: String },
    benefits: [{ type: String }],
    prices: [priceSchema],
    photo: { type: String },
    category: {
      type: String,
      enum: ["Gummies", "Prerolls", "Edibles", "Vapes", "Flower", "Beverage"],
    },
    experiences: [
      {
        type: String,
        enum: [
          "Relaxing",
          "Energizing",
          "Creative",
          "Social",
          "Sleep",
          "Focus",
          "Happy",
        ],
      },
    ],
    dosage: {
      type: String,
      enum: ["Low Potency", "Medium Potency", "High Potency"],
    },
    coas: [{ type: String }],
    // certification: { type: String },
    restrictedStates: [
      {
        state: { type: String, required: true },
        expirationDate: { type: Date, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

module.exports = Product;
