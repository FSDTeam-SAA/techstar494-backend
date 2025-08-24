const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    categoryName: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
      maxlength: [50, "Category name cannot exceed 50 characters"],
    },
    image: {
      type: String,
      required: [true, "Category image is required"],
    },
    categoryIcon: {
      type: String, // Optional icon URL
      required: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

categorySchema.index({ categoryName: 1 });

const Category =
  mongoose.models.Category || mongoose.model("Category", categorySchema);

module.exports = Category;
