const mongoose = require("mongoose");

// const cartItemSchema = new mongoose.Schema(
//   {
//     product: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Product",
//       required: true,
//     },
//     quantity: {
//       type: Number,
//       required: true,
//       default: 1,
//       min: 1,
//     },
//     unit: {
//       type: String,
//       required: true,
//       enum: ["pc", "ct", "gm"],
//     },
//   },
//   { _id: false }
// );

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    unit: {
      type: String,
      required: true,
      enum: ["pc", "ct", "gm"],
    },
    pricePerUnit: {
      type: Number,
      required: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Cart = mongoose.models.Cart || mongoose.model("Cart", cartSchema);

module.exports = Cart;
