const Stripe = require("stripe");
const User = require("../user/user.model");
const Payment = require("./payment.model");
const Product = require("../product/product.model");



const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-05-28.basil",
});



const createPaymentByProduct = async (req, res) => {
    try {
        const { email } = req.user;
        const { productId, quantity, unit } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                code: 404,
                message: "User not found",
            });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                code: 404,
                message: "Product not found",
            });
        }

        const selectedPrice = product.prices.find(p => p.unit === unit);
        if (!selectedPrice) {
            return res.status(400).json({
                success: false,
                code: 400,
                message: "Please select a valid price unit",
            });
        }

        const totalAmount = selectedPrice.price * quantity;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalAmount,
            currency: "usd",
            metadata: {
                userId: user._id.toString(),
                productId: product._id.toString()
            }
        });

        const newPayment = new Payment({
            user: user._id,
            product: product._id,
            quantity,
            totalAmount,
            paymentIntentId: paymentIntent.id,
            status: "pending",
        });

        await newPayment.save();

        return res.status(201).json({
            success: true,
            code: 201,
            message: "Payment created successfully",
            data: newPayment,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            code: 500,
            message: error.message,
        });
    }
}


const createPaymentController = {
    createPaymentByProduct,
}
module.exports = createPaymentController;