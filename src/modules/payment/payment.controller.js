const Stripe = require("stripe");
const User = require("../user/user.model");
const Payment = require("./payment.model");
const Product = require("../product/product.model");
const Order = require("../order/order.model");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-05-28.basil",
});

const createPaymentByProduct = async (req, res) => {
  try {
    const { email } = req.user;
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        code: 400,
        message: "Order id is required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        code: 404,
        message: "User not found",
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        code: 404,
        message: "Order not found",
      });
    }

    if (order.paymentMethod === "COD") {
      return res.status(400).json({
        success: false,
        code: 400,
        message: "You paid by cash on delivery",
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalAmount * 100),
      currency: "usd",
      metadata: {
        userId: user._id.toString(),
        orderId: order._id.toString(),
      },
    });

    const newPayment = new Payment({
      userId: user._id,
      orderId: order._id,
      quantity: order.quantity,
      amount: order.totalAmount,
      transactionId: paymentIntent.id,
    });

    await newPayment.save();

    return res.status(201).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      message:
        "PaymentIntent created. Use clientSecret in frontend Payment Element.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      code: 500,
      message: error.message,
    });
  }
};

const paymentController = {
  createPaymentByProduct,
};
module.exports = paymentController;
