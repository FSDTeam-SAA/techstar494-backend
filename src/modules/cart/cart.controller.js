const Cart = require("../../modules/cart/cart.model");
const Product = require("../../modules/product/product.model");
const User = require("../user/user.model");

const addToCart = async (req, res) => {
  try {
    const { email } = req.user;
    const { productId, unit, quantity, pricePerUnit } = req.body;

    // 1. Find user
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found");

    // 2. Find product
    const product = await Product.findById(productId);
    if (!product) throw new Error("Product not found");

    // 3. Validate unit and pricePerUnit
    const priceEntry = product.prices.find(
      (p) => p.unit === unit && p.price === pricePerUnit
    );
    if (!priceEntry) {
      throw new Error(
        `Price is not valid for unit ${unit} and price ${pricePerUnit}`
      );
    }

    // 4. Check quantity available
    if (priceEntry.quantity < quantity) {
      throw new Error(
        `Only ${priceEntry.quantity} quantity available for ${unit} unit`
      );
    }

    // 5. Check if same product + unit + price already exists
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

    // 6. Return all cart items
    const cart = await Cart.find({ userId: user._id })
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

    const cart = await Cart.findOne({ userId: existingUser._id })
      .populate({
        path: "items.product",
        select: "name prices photo",
      })
      .populate({
        path: "userId",
        select: "firstName lastName email",
      });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

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

const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    res.status(200).json({ message: "Cart item updated", cart });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating cart item", error: error.message });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { email } = req.user;
    const { itemId } = req.params;
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }
    const cart = await Cart.findOne({ userId: existingUser._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = Cart.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    await Cart.deleteOne({ _id: itemId });

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
    const cart = await Cart.findOneAndUpdate(
      { userId: req.user._id },
      { $set: { items: [] } },
      { new: true }
    );

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    res.status(200).json({ message: "Cart cleared", cart });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error clearing cart", error: error.message });
  }
};

module.exports = {
  getMyCartItems,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
