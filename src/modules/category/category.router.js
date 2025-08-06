const express = require("express");
const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../category/category.controller");
const { upload } = require("../../utils/cloudnary");

const router = express.Router();

router.post(
  "/",
  upload.single("image"), // Single image upload
  createCategory
);

router.get("/", getCategories);
router.get("/:id", getCategoryById);

router.put(
  "/:id",
  upload.single("image"), // Single image upload for update
  updateCategory
);

router.delete("/:id", deleteCategory);

module.exports = router;
