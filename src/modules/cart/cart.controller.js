const Cart = require("../../modules/cart/cart.model");
const Product = require("../../modules/product/product.model");
const User = require("../user/user.model");

const addToCart = async (req, res) => {
  try {
    const { email } = req.user;
    const { productId, unit, quantity, pricePerUnit } = req.body;

    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found");

    const product = await Product.findById(productId);
    if (!product) throw new Error("Product not found");

    const priceEntry = product.prices.find(
      (p) => p.unit === unit && p.price === pricePerUnit
    );
    if (!priceEntry) {
      throw new Error(
        `Price is not valid for unit ${unit} and price ${pricePerUnit}`
      );
    }

    if (priceEntry.quantity < quantity) {
      throw new Error(
        `Only ${priceEntry.quantity} quantity available for ${unit} unit`
      );
    }

    const existingCartItem = await Cart.findOne({
      userId: user._id,
      product: productId,
      unit,
      pricePerUnit,
    });

    if (existingCartItem) {
      existingCartItem.quantity += quantity;
      await existingCartItem.save();
    } else {
      await Cart.create({
        userId: user._id,
        product: productId,
        unit,
        quantity,
        pricePerUnit,
      });
    }

    const cart = await Cart.find({ userId: user._id })
      .populate({
        path: "product",
        select: "name photo slug",
      })
      .populate({
        path: "userId",
        select: "firstName lastName email",
      });

    return res.status(200).json({
      success: true,
      message: "Item added to cart successfully",
      data: cart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMyCartItems = async (req, res) => {
  try {
    const { email } = req.user;
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const cart = await Cart.find({ userId: existingUser._id })
      .populate({
        path: "product",
        select: "name photo",
      })
      .populate({
        path: "userId",
        select: "firstName lastName email",
      });

    res.status(200).json({
      success: true,
      message: "Cart items fetched successfully",
      cart,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching cart items", error: error.message });
  }
};

const updateCartItemQuantity = async (req, res) => {
  try {
    const { email } = req.user;
    const { cartId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res
        .status(400)
        .json({ message: "Quantity must be greater than 0" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const cart = await Cart.findById(cartId);
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const cartItem = await Cart.findOneAndUpdate(
      { _id: cartId, userId: user._id },
      { $inc: { quantity: quantity } },
      { new: true }
    )
      .populate({
        path: "product",
        select: "name photo",
      })
      .populate({
        path: "userId",
        select: "firstName lastName email",
      });

    return res.status(200).json({
      success: true,
      message: "Quantity updated successfully",
      data: cartItem,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { email } = req.user;
    const { cartId } = req.params;

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }
    const cart = await Cart.findOne({ userId: existingUser._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = Cart.findById(cartId);
    if (!item) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    await Cart.deleteOne({ _id: cartId });

    res.status(200).json({
      success: true,
      message: "Item removed from cart",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error removing item from cart", error: error.message });
  }
};

const clearCart = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const result = await Cart.deleteMany({ userId: user._id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "No cart items found to delete" });
    }

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      deletedItems: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error clearing cart",
      error: error.message,
    });
  }
};

module.exports = {
  getMyCartItems,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
};
