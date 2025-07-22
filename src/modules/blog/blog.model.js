const { Schema, model } = require("mongoose");

const blogSchema = new Schema(
  {
    blogTitle: {
      type: String,
      required: true,
      trim: true,
    },
    blogDescription: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Blog = model("Blog", blogSchema);
module.exports = Blog;
