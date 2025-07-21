const express = require('express');
const {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
} = require('../product/products.controller');
const { upload } = require('../../utils/cloudnary');

const router = express.Router();

router.post('/', upload.single('photo'), createProduct);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.put('/:id', upload.single('photo'), updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;
