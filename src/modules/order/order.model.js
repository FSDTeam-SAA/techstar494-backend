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
    couponId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CouponMaking",
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
      enum: ["Pending", "Paid", "Shipped", "Delivered", "Cancelled"],
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
