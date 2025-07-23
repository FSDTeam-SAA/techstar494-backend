const express = require('express');
const {
    createFaq,
    getFaqs,
    getFaqById,
    updateFaq,
    deleteFaq
} = require('../../modules/faq/faq.controller');
// const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getFaqs);
router.get('/:id', getFaqById);

router.post('/', createFaq);
router.put('/:id', updateFaq);
router.delete('/:id', deleteFaq);

module.exports = router;