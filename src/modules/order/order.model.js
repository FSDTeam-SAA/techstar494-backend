const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    selectedPrice: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    shipping: { type: Number, required: true },
    total: { type: Number, required: true },
    billingInfo: {
      fullName: String,
      address: String,
      email: String,
      phone: String,
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
