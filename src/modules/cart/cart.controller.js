const Cart = require("../../modules/cart/cart.model");
const Product = require("../../modules/product/product.model");

// Get user's cart
const getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user._id }).populate({
            path: "items.product",
            select: "name photo category prices",
        });

        if (!cart) {
            return res.status(200).json({ items: [] });
        }

        const items = cart.items.map((item) => {
            const product = item.product;
            const priceObj = product.prices.id(item.selectedPrice);
            return {
                _id: item._id,
                product: {
                    _id: product._id,
                    name: product.name,
                    photo: product.photo,
                    category: product.category,
                },
                selectedPrice: {
                    _id: priceObj._id,
                    unit: priceObj.unit,
                    quantity: priceObj.quantity,
                    price: priceObj.price,
                },
                quantity: item.quantity,
                total: priceObj.price * item.quantity,
            };
        });

        const total = items.reduce((sum, item) => sum + item.total, 0);

        res.status(200).json({ items, total });
    } catch (error) {
        res.status(500).json({ message: "Error fetching cart", error: error.message });
    }
};

// Add item to cart
const addToCart = async (req, res) => {
    try {
        const { productId, priceId, quantity } = req.body;

        if (!productId || !priceId || !quantity) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const priceObj = product.prices.id(priceId);
        if (!priceObj) {
            return res.status(404).json({ message: "Price option not found" });
        }

        let cart = await Cart.findOne({ userId: req.user._id });

        if (!cart) {
            cart = new Cart({ userId: req.user._id, items: [] });
        }

        const existingItemIndex = cart.items.findIndex(
            (item) =>
                item.product.toString() === productId &&
                item.selectedPrice.toString() === priceId
        );

        if (existingItemIndex >= 0) {
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            cart.items.push({
                product: productId,
                selectedPrice: priceId,
                quantity,
            });
        }

        await cart.save();
        res.status(200).json({ message: "Item added to cart", cart });
    } catch (error) {
        res.status(500).json({ message: "Error adding to cart", error: error.message });
    }
};

// Update cart item quantity
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
        res.status(500).json({ message: "Error updating cart item", error: error.message });
    }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
    try {
        const { itemId } = req.params;

        const cart = await Cart.findOne({ userId: req.user._id });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
        await cart.save();

        res.status(200).json({ message: "Item removed from cart", cart });
    } catch (error) {
        res.status(500).json({ message: "Error removing item from cart", error: error.message });
    }
};

// Clear cart
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
        res.status(500).json({ message: "Error clearing cart", error: error.message });
    }
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
};