const { Schema, model } = require("mongoose");

const paymentModel = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  orderId: {
    type: Schema.Types.ObjectId,
    ref: "Order",
  },
  quantity: { type: Number },
  amount: { type: Number },
  transactionId: { type: String },
  status: {
    type: String,
    enum: ["pending", "success", "failed"],
    default: "pending",
  },
});

const Payment = model("Payment", paymentModel);
module.exports = Payment;
