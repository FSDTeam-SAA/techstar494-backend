const Cart = require("../../modules/cart/cart.model");
const Product = require("../../modules/product/product.model");
const User = require("../user/user.model");


const addToCart = async (req, res) => {
  try {
    const { email } = req.user;
    const { productId, quantity } = req.body;

    const existingUser = await User.findOne({ email });
    if (!existingUser) throw new Error("User not found");

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const selectedPrice = product.prices[0];
    if (!selectedPrice) {
      return res.status(400).json({ message: "No price available for this product" });
    }

    const isExistingCart = await Cart.findOne({ "items.product": productId });
    if (isExistingCart) {
      return res.status(400).json({ message: "Item already exists in cart" });
    }
    //TODO: 1 if quantity is add there some validation will be added. and also add in product model.
    const result = await Cart.create({
      userId: existingUser._id,
      items: [
        {
          product: productId,
          quantity: quantity || 1,
        },
      ],
    });
    const populatedCart = await Cart.findById(result._id)
      .populate({
        path: "userId",
        select: "firstName lastName email",
      })
      .populate({
        path: "items.product",
        select: "name prices photo",
      });

    res.status(201).json({
      success: true,
      message: "Item added to cart",
      cart: populatedCart,
    });

  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error adding item to cart", error: error.message });
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
}

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
