const express = require('express');
const {
    createOrder,
    getUserOrders,
    getOrderById,
    cancelOrder,
    updateOrderStatus
} = require('../../modules/order/order.controller');

const router = express.Router();

router.post('/', createOrder);
router.get('/', getUserOrders);
router.get('/:orderId', getOrderById);
router.put('/:orderId/cancel', cancelOrder);
router.put('/admin/:orderId', updateOrderStatus);

module.exports = router;