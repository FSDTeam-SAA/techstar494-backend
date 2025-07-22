const express = require('express');
const {
    getAllDocuments,
    getDocumentByType,
    upsertDocument
} = require('../../modules/legalDocuments/legalDocuments.controller');
// const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getAllDocuments);
router.get('/:type', getDocumentByType);

router.post('/', upsertDocument);

module.exports = router;