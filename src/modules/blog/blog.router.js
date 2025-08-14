const express = require("express");
const router = express.Router();
const { upload } = require("../../utils/cloudnary");
const auth = require("../../middleware/auth");
const USER_ROLE = require("../user/user.constant");
const {
  createBlog,
  getAllBlog,
  getSingleBlog,
  deleteBlog,
  updateBlog,
} = require("./blog.controller");

router.post(
  "/create",
  upload.single("image"),
  auth(USER_ROLE.admin),
  createBlog
);

router.get(
  "/",
  // auth(USER_ROLE.admin, USER_ROLE.user),
  getAllBlog
);

router.get("/:id", getSingleBlog);

router.put("/:id", upload.single("image"), auth(USER_ROLE.admin), updateBlog);

router.delete("/:id", auth(USER_ROLE.admin), deleteBlog);

const blogRouter = router;
module.exports = blogRouter;
