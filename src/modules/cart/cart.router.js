const express = require('express');
const {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
} = require('../../modules/cart/cart.controller');

const router = express.Router();

router.get('/', getCart);
router.post('/', addToCart);
router.put('/:itemId', updateCartItem);
router.delete('/:itemId', removeFromCart);
router.delete('/', clearCart);

module.exports = router;