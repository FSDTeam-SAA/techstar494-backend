const Order = require("../../modules/order/order.model");
const Cart = require("../../modules/cart/cart.model");
const Product = require("../../modules/product/product.model");
const User = require("../user/user.model");
const couponMaking = require("../couponMaking/couponMaking.model");

const createOrderByProduct = async (req, res) => {
  try {
    const { email } = req.user;
    const {
      billingInfo,
      paymentMethod,
      productId,
      quantity,
      unit,
      couponCode,
    } = req.body;

    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found");

    const product = await Product.findById(productId);
    if (!product) throw new Error("Product not found");

    const priceEntry = product.prices.find((p) => p.unit === unit);
    if (!priceEntry) throw new Error(`No pricing available for unit: ${unit}`);

    if (priceEntry.quantity === 0) {
      throw new Error(`This ${unit} unit is not available for purchase`);
    }

    if (priceEntry.quantity < quantity) {
      throw new Error(
        `Only ${priceEntry.quantity} quantity available for ${unit} unit`
      );
    }

    const basePrice = priceEntry.price * quantity;
    let discount = 0;
    let finalAmount = basePrice;

    if (couponCode) {
      const coupon = await couponMaking.findOne({ couponCode });
      if (!coupon) throw new Error("coupon not valid");

      const now = new Date();
      if (new Date(coupon.timeValidation) < now) {
        throw new Error("Coupon has expired");
      }

      discount = (basePrice * coupon.discount) / 100;
      finalAmount = basePrice - discount;
    }

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
      couponUsed: couponCode || null,
    });

    await newOrder.save();

    // 4. Update product quantity
    priceEntry.quantity -= quantity;
    await product.save();

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

//TODO: there are some bugs don't change it.
const createOrderByCart = async (req, res) => {
  try {
    const { userId } = req.user;
    const { billingInfo, paymentMethod, couponCode, product, cartItems } =
      req.body;

    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    let baseAmount = 0;

    const orderData = {
      userId: user._id,
      billingInfo,
      paymentMethod,
      paymentStatus: "Unpaid",
      couponCode,
    };

    // ----- 1️⃣ If Single Product Purchase -----
    if (product) {
      const foundProduct = await Product.findById(product._id);
      if (!foundProduct) throw new Error("Product not found");

      orderData.product = product._id;
      orderData.unit = product.unit;
      orderData.quantity = product.quantity;
      orderData.pricePerUnit = product.pricePerUnit;

      baseAmount = product.quantity * product.pricePerUnit;
      orderData.totalAmount = baseAmount;

      // ----- 2️⃣ If Cart Purchase -----
    } else if (cartItems && cartItems.length > 0) {
      const fullCartItems = await Promise.all(
        cartItems.map(async (cartId) => {
          console.log(cartId, "cartId");
          console.log(userId, "userId");
          //there i get cart id 6893934f065e958af15b8c8e
          const item = await Cart.findOne({
            _id: cartId,
            userId,
          }).populate("product");
          console.log(item); // there come it null
          if (!item) throw new Error(`Cart item not found check again`);
          return item;
        })
      );

      const processedItems = [];

      for (const item of fullCartItems) {
        const itemTotal = item.quantity * item.pricePerUnit;
        baseAmount += itemTotal;

        processedItems.push({
          cartId: item._id,
        });
      }

      orderData.cardItems = processedItems;
      orderData.totalAmount = baseAmount;

      // Clear user cart after placing order
      await Cart.deleteMany({ _id: { $in: cartItems } });
    } else {
      throw new Error("Either product or cartItems must be provided.");
    }

    // ----- 3️⃣ Apply Coupon (If Exists) -----
    if (couponCode) {
      const coupon = await couponMaking.findOne({ couponCode });
      if (!coupon) throw new Error("Invalid coupon code");

      const now = new Date();
      if (new Date(coupon.timeValidation) < now) {
        throw new Error("Coupon has expired");
      }

      const discountAmount = (baseAmount * coupon.discount) / 100;
      const finalAmount = baseAmount - discountAmount;

      orderData.totalAmount = finalAmount;
    }

    // ----- 4️⃣ Create Order -----
    const newOrder = await Order.create(orderData);

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: newOrder,
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

const cancelOrder = async (req, res) => {
  try {
    const { email } = req.user;
    const { orderId } = req.params;

    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found");

    const order = await Order.findOne({ _id: orderId, userId: user._id });
    if (!order) throw new Error("Your order not found");

    if (order.status === "Cancelled") {
      throw new Error("Order already cancelled");
    } else if (order.status === "Delivered") {
      throw new Error("Order already delivered");
    }

    // 1. Update order status
    const result = await Order.findOneAndUpdate(
      { _id: orderId, userId: user._id },
      { status: "Cancelled" },
      { new: true }
    ).populate({
      path: "product",
      select: "name photo category",
    });

    // 2. Restore quantity in product.prices[]
    const product = await Product.findById(order.product);
    if (!product) throw new Error("Associated product not found");

    const priceEntry = product.prices.find((p) => p.unit === order.unit);
    if (!priceEntry) throw new Error(`Unit ${order.unit} not found in product`);

    priceEntry.quantity += order.quantity;

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
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

module.exports = {
  createOrderByProduct,
  createOrderByCart,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getSaveBillingInfo,
};
