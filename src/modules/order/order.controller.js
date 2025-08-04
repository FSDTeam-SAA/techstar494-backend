const Order = require("../../modules/order/order.model");
const Cart = require("../../modules/cart/cart.model");
const Product = require("../../modules/product/product.model");
const User = require("../user/user.model");
const couponMaking = require("../couponMaking/couponMaking.model");

const createOrder = async (req, res) => {
  try {
    const { email } = req.user;
    const { billingInfo, paymentMethod, productId, quantity, unit, couponId } =
      req.body;

    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found");

    const product = await Product.findById(productId);
    if (!product) throw new Error("Product not found");

    // 1. Get and validate price
    const priceEntry = product.prices.find((p) => p.unit === unit);
    if (!priceEntry) throw new Error(`No pricing available for unit: ${unit}`);

    if (priceEntry.quantity < quantity) {
      throw new Error(
        `Only ${priceEntry.quantity} units available for unit: ${unit}`
      );
    }

    const basePrice = priceEntry.price * quantity;
    let discount = 0;
    let finalAmount = basePrice;

    // 2. Validate coupon (if given)
    if (couponId) {
      const coupon = await couponMaking.findById(couponId);
      if (!coupon) throw new Error("Coupon not found");

      const now = new Date();
      if (new Date(coupon.timeValidation) < now) {
        throw new Error("Coupon has expired");
      }

      discount = (basePrice * coupon.discount) / 100;
      finalAmount = basePrice - discount;
    }

    // 3. Create order
    const newOrder = new Order({
      userId: user._id,
      product: product._id,
      unit,
      quantity,
      pricePerUnit: priceEntry.price,
      billingInfo,
      paymentMethod,
      paymentStatus: "Unpaid",
      totalAmount: finalAmount,
      discountAmount: discount,
      couponUsed: couponId || null,
    });

    await newOrder.save();

    // TODO: there i add a function when my order quantity 0 then i removed from product price. If you want to remove it then you have to change the code here.
    //TODO: OR you can also update the quantity when you update product. It will be easy to manage.[It's depends on frontend developers]
    priceEntry.quantity -= quantity;
    if (priceEntry.quantity === 0) {
      const indexToRemove = product.prices.findIndex((p) => p.unit === unit);
      product.prices.splice(indexToRemove, 1);
    }
    await product.save();

    // 5. Populate and return
    const result = await Order.findById(newOrder._id)
      .populate({
        path: "product",
        select: "name photo category",
      })
      .populate({
        path: "userId",
        select: "firstName lastName email",
      });

    return res.status(200).json({
      success: true,
      message: "Order processed successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      error,
    });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const { email } = req.user;
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found");

    const orders = await Order.find({ userId: user._id }).populate({
      path: "product",
      select: "name photo category",
    });

    return res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      data: orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      error,
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate({
      path: "product",
      select: "name photo category",
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Order fetched successfully",
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      error,
    });
  }
};

const getSaveBillingInfo = async (req, res) => {
  try {
    const { email } = req.user;
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found");

    const billingInfoOrder = await Order.findOne({
      userId: user._id,
      "billingInfo.isSaved": true,
    }).populate({
      path: "userId",
      select: "firstName lastName email",
    });

    return res.status(200).json({
      success: true,
      message: "Billing info fetched successfully",
      data: {
        billingInfo: billingInfoOrder.billingInfo,
        user: billingInfoOrder.userId,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      error,
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Order status updated", order });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      error,
    });
  }
};

//TODO: IT's NOT do form my side because i don't have any idea about it. After discussion i will do it
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      userId: req.user._id,
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "Pending") {
      return res.status(400).json({
        message: "Order can only be cancelled if it's in Pending status",
      });
    }

    order.status = "Cancelled";
    await order.save();

    res.status(200).json({ message: "Order cancelled successfully", order });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error cancelling order", error: error.message });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getSaveBillingInfo,
};
