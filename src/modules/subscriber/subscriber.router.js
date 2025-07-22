const express = require('express');
const {
    subscribe,
    unsubscribe,
    getSubscribers,
    sendEmailToSubscribers
} = require('../../modules/subscriber/subscriber.controller');
// const { authenticateAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/subscribe', subscribe);
router.post('/unsubscribe', unsubscribe);

router.get('/admin/subscribers', getSubscribers);
router.post('/admin/send-email', sendEmailToSubscribers);

module.exports = router;