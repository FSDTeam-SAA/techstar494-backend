const Order = require("../../modules/order/order.model");
const Cart = require("../../modules/cart/cart.model");
const Product = require("../../modules/product/product.model");
const User = require("../user/user.model");
const couponMaking = require("../couponMaking/couponMaking.model");
const { default: mongoose } = require("mongoose");

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

    if (!paymentMethod) {
      throw new Error("Select payment method first");
    }

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

    console.log("Final amount after discount:", finalAmount);

    // Handle Points Payment
    let pointsUsed = 0; // track points spent
    if (paymentMethod === "Points") {
      if (user.points < 200) {
        throw new Error("You need at least 200 points to pay with points");
      }

      const pointsNeeded = Math.ceil(finalAmount / 0.1);

      if (user.points < pointsNeeded) {
        throw new Error(
          `You need at least ${pointsNeeded} points to pay with points`
        );
      }

      user.points -= pointsNeeded;
      await user.save();

      pointsUsed = pointsNeeded; // store in order
      finalAmount = 0; // no cash since points covered it
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
      totalAmount: Math.ceil(finalAmount),
      discountAmount: discount,
      couponUsed: couponCode || null,
      pointsUsed,
      paymentDate: Date.now(),
    });

    await newOrder.save();

    // 4. Update product quantity
    priceEntry.quantity -= quantity;
    await product.save();

    // const pointToAdd = Math.ceil(finalAmount);

    // await user.findByIdAndUpdate(
    //   { _id: user._id },
    //   { $inc: { points: Math.max(pointToAdd, 0) } },
    //   { new: true }
    // );

    const result = await Order.findById(newOrder._id)
      .populate({
        path: "product",
        select: "name photo category slug",
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

const createOrderByCart = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { userId } = req.user;
    const { billingInfo, paymentMethod, couponCode, cartItems } = req.body;
    

    // Validate request body
    if (
      !billingInfo ||
      !paymentMethod ||
      !cartItems ||
      !Array.isArray(cartItems) ||
      cartItems.length === 0
    ) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: billingInfo, paymentMethod, or cartItems",
      });
    }

    // Verify user exists
    const user = await User.findById(userId).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prepare order data
    const orderData = {
      userId: user._id,
      billingInfo,
      paymentMethod,
      paymentStatus: "Unpaid",
      couponCode,
      totalAmount: 0,
      cartItems: [],
      purchaseDate: Date.now(),
    };

    let baseAmount = 0;
    const processedCartIds = [];

    // Process each cart item
    for (const cartItemId of cartItems) {
      try {
        const cart = await Cart.findOne({
          _id: cartItemId,
          userId: user._id,
        })
          .populate("product")
          .session(session);

        if (!cart) throw new Error(`Cart item not found`);
        const itemTotal = parseFloat(
          (cart.pricePerUnit * cart.quantity).toFixed(2)
        );
        baseAmount += itemTotal;

        // Push product reference and details directly into order
        orderData.cartItems.push({
          cartId: cart.product._id,
          slug: cart.product.slug,
          name: cart.product.name,
          pricePerUnit: cart.pricePerUnit,
          quantity: cart.quantity,
          unit: cart.unit,
        });

        // Update product quantity
        const product = await Product.findById(cart.product._id).session(
          session
        );
        if (!product) throw new Error("Product not found");

        // Find the matching price object in the product
        const priceIndex = product.prices.findIndex(
          (p) => p.unit === cart.unit && p.price === cart.pricePerUnit
        );

        if (priceIndex === -1) {
          throw new Error("Matching product price/unit combination not found");
        }

        // Check if enough quantity is available
        if (product.prices[priceIndex].quantity < cart.quantity) {
          throw new Error(
            `Not enough quantity available for ${product.name} (${cart.unit})`
          );
        }

        // Deduct the ordered quantity
        product.prices[priceIndex].quantity -= cart.quantity;

        // Save the updated product
        await product.save({ session });

        processedCartIds.push(cart._id);
      } catch (itemError) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: itemError.message,
        });
      }
    }

    // Apply coupon if provided
    let finalAmount = baseAmount;
    if (couponCode) {
      const coupon = await couponMaking
        .findOne({ couponCode })
        .session(session);
      if (!coupon) throw new Error("Invalid coupon code");
      if (new Date(coupon.timeValidation) < new Date())
        throw new Error("Coupon expired");

      const discountAmount = parseFloat(
        ((baseAmount * coupon.discount) / 100).toFixed(2)
      );
      finalAmount = parseFloat((baseAmount - discountAmount).toFixed(2));
    }

    orderData.totalAmount = parseFloat(finalAmount.toFixed(2));

    // Handle Points Payment
    let pointsUsed = 0; // track points spent
    if (paymentMethod === "Points") {
      if (user.points < 200) {
        throw new Error("You need at least 200 points to pay with points");
      }

      const pointsNeeded = Math.ceil(finalAmount / 0.1);

      if (user.points < pointsNeeded) {
        throw new Error(
          `You need at least ${pointsNeeded} points to pay with points`
        );
      }

      user.points -= pointsNeeded;
      await user.save();

      pointsUsed = pointsNeeded; // store in order
      finalAmount = 0; // no cash since points covered it
    }

    orderData.pointsUsed = pointsUsed;

    // Create order
    const newOrderArr = await Order.create([orderData], {
      session,
    });
    const newOrder = newOrderArr[0];

    // Remove processed cart items
    await Cart.deleteMany({
      _id: { $in: processedCartIds },
    }).session(session);

    // Populate products in response
    const populatedOrder = await Order.findById(newOrder._id)
      .populate("cartItems.cartId")
      .session(session);

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: populatedOrder,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const { email } = req.user;
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found");

    const orders = await Order.find({ userId: user._id })
      .populate({
        path: "product",
        select: "name photo category slug",
      })
      .populate({
        path: "userId",
        select: "firstName lastName userName email",
      });

    return res.status(200).json({
      success: true,
      message: "Orders fetched successfully....",
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

const getAllOrders = async (req, res) => {
  try {
    const { search, status, productName, page = 1, limit = 10 } = req.query;

    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const pipeline = [
      // Lookup user
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },

      // Lookup single product orders
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },

      // Lookup products from cartItems
      {
        $lookup: {
          from: "carts",
          localField: "cartItems.cartId",
          foreignField: "_id",
          as: "cartDetails",
        },
      },
      {
        $unwind: {
          path: "$cartDetails",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Lookup products for those cartDetails
      {
        $lookup: {
          from: "products",
          localField: "cartDetails.product",
          foreignField: "_id",
          as: "cartProduct",
        },
      },

      // Group back cart products
      {
        $group: {
          _id: "$_id",
          doc: { $first: "$$ROOT" },
          cartProducts: { $push: { $arrayElemAt: ["$cartProduct", 0] } },
        },
      },

      // Merge cartProducts into the root document
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ["$doc", { cartProducts: "$cartProducts" }],
          },
        },
      },

      // ✅ Apply filters (search, status, productName)
      {
        $match: {
          ...(search && search.trim() !== ""
            ? {
                $or: [
                  { "user.firstName": { $regex: search, $options: "i" } },
                  { "user.lastName": { $regex: search, $options: "i" } },
                  { "user.userName": { $regex: search, $options: "i" } },
                ],
              }
            : {}),
          ...(status ? { status } : {}),
          ...(productName && productName.trim() !== ""
            ? {
                $or: [
                  { "product.name": { $regex: productName, $options: "i" } },
                  {
                    "cartProducts.name": { $regex: productName, $options: "i" },
                  },
                ],
              }
            : {}),
        },
      },

      // Final projection
      {
        $project: {
          _id: 1,
          user: {
            firstName: 1,
            lastName: 1,
            userName: 1,
            email: 1,
          },
          product: { name: 1, photo: 1, category: 1 },
          cartProducts: { name: 1, photo: 1, category: 1 },
          cartItems: 1,
          totalAmount: 1,
          status: 1,
          paymentMethod: 1,
          paymentStatus: 1,
          purchaseDate: 1,
        },
      },
    ];

    // Apply pagination with $facet
    const ordersResult = await Order.aggregate([
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [...pipeline, { $skip: skip }, { $limit: limitNumber }],
        },
      },
      {
        $project: {
          data: 1,
          total: { $arrayElemAt: ["$metadata.total", 0] },
        },
      },
    ]);

    const orders = ordersResult[0]?.data || [];
    const total = ordersResult[0]?.total || 0;

    res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      data: orders,
      meta: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
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

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const user = await User.findById(order.userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (order.status === "Delivered") {
      return res.status(400).json({ message: "Order already delivered" });
    }
    if (order.status === "Cancelled") {
      return res.status(400).json({ message: "Order already cancelled" });
    }

    if (order.paymentMethod === "Stripe" && status === "Cancelled") {
      return res
        .status(400)
        .json({ message: "You can't cancel online payment order" });
    }

    // 👉 Restore stock only if admin cancels the order
    if (status === "Cancelled") {
      if (order.product && order.quantity) {
        // Single product order
        const product = await Product.findById(order.product);
        if (product) {
          const priceEntry = product.prices.find((p) => p.unit === order.unit);
          if (priceEntry) {
            priceEntry.quantity += order.quantity;
            await product.save();
          }
        }
      } else if (order.cartItems && order.cartItems.length > 0) {
        // Multiple cart items
        for (const item of order.cartItems) {
          const product = await Product.findById(item.cartId);
          if (product) {
            const priceEntry = product.prices.find((p) => p.unit === item.unit);
            if (priceEntry) {
              priceEntry.quantity += item.quantity;
              await product.save();
            }
          }
        }
      }
    }

    if (status === "Delivered") {
      await User.findByIdAndUpdate(user._id, {
        $inc: { points: Math.ceil(order.totalAmount) },
      });
    }

    await Order.findByIdAndUpdate(orderId, { status }, { new: true });

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
    });
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

    if (order.paymentMethod === "Stripe") {
      throw new Error("You can't cancel online payment order");
    }

    if (order.status === "Cancelled") {
      throw new Error("Order already cancelled");
    } else if (order.status === "Delivered") {
      throw new Error("Order already delivered");
    }

    // 1. Update order status
    await Order.findOneAndUpdate(
      { _id: orderId, userId: user._id },
      { status: "Cancelled" },
      { new: true }
    ).populate({
      path: "product",
      select: "name photo category",
    });

    // 2. Restore product quantities
    if (order.product && order.quantity) {
      // Single product order
      const product = await Product.findById(order.product);
      if (product) {
        const priceEntry = product.prices.find((p) => p.unit === order.unit);
        if (priceEntry) {
          priceEntry.quantity += order.quantity;
          await product.save();
        }
      }

      if (order.paymentMethod === "Points" && order.pointsUsed > 0) {
        user.points += order.pointsUsed;
        await user.save();
      }
    } else if (order.cartItems && order.cartItems.length > 0) {
      // Multiple cart items
      for (const item of order.cartItems) {
        const product = await Product.findById(item.cartId);
        if (product) {
          const priceEntry = product.prices.find((p) => p.unit === item.unit);
          if (priceEntry) {
            priceEntry.quantity += item.quantity;
            await product.save();
          }
        }
      }

      if (order.paymentMethod === "Points" && order.pointsUsed > 0) {
        user.points += order.pointsUsed;
        await user.save();
      }
    }

    // Remove the order after restoring stock
    await Order.findOneAndDelete({ _id: orderId, userId: user._id });

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
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
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  getSaveBillingInfo,
};
