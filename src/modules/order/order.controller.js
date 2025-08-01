const Order = require("../../modules/order/order.model");
const Cart = require("../../modules/cart/cart.model");
const Product = require("../../modules/product/product.model");
const User = require("../user/user.model");

const createOrder = async (req, res) => {
  try {
    const { userId } = req.user;
    const { billingInfo, paymentMethod } = req.body;

    if (!billingInfo || !paymentMethod) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified === false) {
      return res
        .status(400)
        .json({ message: "Please verify your email address first" });
    }

    if (user.ageVerification === false) {
      return res
        .status(400)
        .json({ message: "You are under 21, cannot place an order" });
    }

    const cart = await Cart.findOne({ userId }).populate({
      path: "items.product",
      select: "name prices",
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let subtotal = 0;
    const items = await Promise.all(
      cart.items.map(async (item) => {
        const product = item.product;
        const priceObj = product.prices.id(item.selectedPrice);

        if (!priceObj) {
          throw new Error(`Price not found for product ${product._id}`);
        }

        const itemTotal = priceObj.price * item.quantity;
        subtotal += itemTotal;

        return {
          product: product._id,
          selectedPrice: item.selectedPrice,
          quantity: item.quantity,
          unitPrice: priceObj.price,
          totalPrice: itemTotal,
        };
      })
    );

    const shipping = 5.99;
    const total = subtotal + shipping;

    const order = new Order({
      userId: req.user._id,
      items,
      subtotal,
      shipping,
      total,
      billingInfo,
      paymentMethod,
      paymentStatus: paymentMethod === "COD" ? "Unpaid" : "Pending",
    });

    await order.save();

    await Cart.findOneAndUpdate(
      { userId: req.user._id },
      { $set: { items: [] } }
    );

    res.status(201).json({ message: "Order created successfully", order });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating order", error: error.message });
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
