const express = require('express');
const {
    createFaq,
    getFaqs,
    getFaqById,
    updateFaq,
    deleteFaq
} = require('../controllers/faqController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', getFaqs);
router.get('/:id', getFaqById);

// Protected admin routes
router.post('/', protect, admin, createFaq);
router.put('/:id', protect, admin, updateFaq);
router.delete('/:id', protect, admin, deleteFaq);

module.exports = router;