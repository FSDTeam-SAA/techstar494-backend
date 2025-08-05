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
    cartId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cart",
    },
    couponCode: {
      type: String,
    },
    unit: {
      type: String,
      required: true,
      enum: ["pc", "ct", "gm"],
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    pricePerUnit: {
      type: Number,
      required: true,
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
  },
  { timestamps: true, versionKey: false }
);

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

module.exports = Order;
