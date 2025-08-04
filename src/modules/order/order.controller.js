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

    // 4. Reduce stock AFTER order saved
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

// Get user's orders
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: "items.product",
        select: "name photo",
      });

    res.status(200).json(orders);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching orders", error: error.message });
  }
};

// Get order by ID
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      userId: req.user._id,
    }).populate({
      path: "items.product",
      select: "name photo category",
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching order", error: error.message });
  }
};

// Update order status (admin only)
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

    res.status(200).json({ message: "Order status updated", order });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating order status", error: error.message });
  }
};

// Cancel order
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
};
