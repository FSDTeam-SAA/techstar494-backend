const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    cartItems: [
      {
        cartId: { type: mongoose.Schema.Types.ObjectId, ref: "Cart" },
        slug: { type: String },
        name: { type: String },
        pricePerUnit: { type: Number },
        quantity: { type: Number },
        unit: { type: String },
      },
      { _id: false },
    ],
    couponCode: {
      type: String,
    },
    unit: {
      type: String,

      enum: ["pc", "ct", "gm"],
    },
    quantity: {
      type: Number,
      min: 1,
    },
    pricePerUnit: {
      type: Number,
    },
    totalAmount: {
      type: Number,
    },
    billingInfo: {
      fullName: String,
      address: String,
      email: String,
      phone: String,
      isSaved: Boolean,
    },
    status: {
      type: String,
      enum: ["Pending", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    paymentMethod: {
      type: String,
      enum: ["Stripe", "COD"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Unpaid", "Paid", "Failed"],
      default: "Unpaid",
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true, versionKey: false }
);

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

module.exports = Order;
