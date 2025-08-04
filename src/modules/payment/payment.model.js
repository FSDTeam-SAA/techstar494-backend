const { Schema } = require("mongoose");

const paymentModel = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    cartId: {
        type: Schema.Types.ObjectId,
        ref: "Cart",
    },
    productId: {
        type: Schema.Types.ObjectId,
        ref: "Product",
    },
    quantity: { type: Number },
    amount: { type: Number },
    transactionId: { type: String },
    status: {
        type: String,
        enum: ["pending", "success", "failed"],
        default: "pending",
    },
})

const Payment = mongoose.model("Payment", paymentModel);
module.exports = Payment;