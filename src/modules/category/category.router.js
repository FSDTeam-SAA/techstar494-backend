const express = require("express");
const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../category/category.controller");
const { upload } = require("../../utils/cloudnary");
const auth = require("../../middleware/auth");
const USER_ROLE = require("../user/user.constant");

const router = express.Router();

// Upload multiple fields: one for image, one for optional categoryIcon
router.post(
  "/",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "categoryIcon", maxCount: 1 },
  ]),
  auth(USER_ROLE.admin),
  createCategory
);

router.get("/", getCategories);
router.get("/:id", getCategoryById);

router.put(
  "/:id",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "categoryIcon", maxCount: 1 },
  ]),
  auth(USER_ROLE.admin),
  updateCategory
);

router.delete("/:id", auth(USER_ROLE.admin), deleteCategory);

module.exports = router;
