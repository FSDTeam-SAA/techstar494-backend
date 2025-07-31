const express = require("express");
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../product/products.controller");
const { upload } = require("../../utils/cloudnary");

const router = express.Router();

router.post(
  "/create",
  upload.fields([
    { name: "photo", maxCount: 5 },
    { name: "coas", maxCount: 5 },
  ]),
  createProduct
);

router.get("/", getProducts);
router.get("/:id", getProductById);
router.put("/:id", upload.single("photo"), updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;
