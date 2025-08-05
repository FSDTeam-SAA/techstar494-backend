const mongoose = require("mongoose");

const priceSchema = new mongoose.Schema(
  {
    unit: { type: String, enum: ["pc", "ct", "gm"], required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const restrictedStateSchema = new mongoose.Schema(
  {
    state: { type: String, required: true },
    expirationDate: { type: Date, required: true },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    batch: { type: String },
    description: { type: String },
    disclaimers: { type: String },
    benefits: [{ type: String }],
    prices: [priceSchema],
    photo: [{ type: String }],
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
    restrictedStates: [restrictedStateSchema],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

module.exports = Product;
