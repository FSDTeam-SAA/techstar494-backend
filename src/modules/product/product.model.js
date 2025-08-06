const mongoose = require("mongoose");

const priceSchema = new mongoose.Schema(
  {
    unit: { type: String, enum: ["pc", "ct", "gm"], required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    slug: {
      type: String,
      unique: true,
      required: true,
    },
    batch: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    disclaimers: {
      type: String,
      trim: true,
    },
    benefits: [
      {
        type: String,
        trim: true,
      },
    ],
    prices: [priceSchema],
    photo: [{ type: String }],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
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
    restrictedStates: [String],
    expirationDate: { type: Date },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
productSchema.index({ name: "text", description: "text", category: "text" });
productSchema.index({ slug: 1 });
productSchema.index({ category: 1 });
productSchema.index({ "prices.price": 1 });

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

module.exports = Product;
