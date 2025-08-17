const Product = require("../product/product.model");
const Category = require("../category/category.model");
const { sendImageToCloudinary, deleteFileFromCloudinary } = require("../../utils/cloudnary");

exports.getAllCategoriesWithCoas = async (req, res) => {
    try {
        const categories = await Category.find().lean();

        const result = await Promise.all(
            categories.map(async (category) => {
                const products = await Product.find({ category: category._id })
                    .select("name batch description coas")
                    .lean();

                // Flatten coas for UI
                const coas = [];
                products.forEach((product) => {
                    product.coas.forEach((url, index) => {
                        coas.push({
                            productId: product._id,
                            productName: product.name,
                            batch: product.batch,
                            description: product.description,
                            index,
                            url,
                        });
                    });
                });

                return {
                    _id: category._id,
                    categoryName: category.categoryName,
                    coas,
                };
            })
        );

        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch categories with COAs",
            error: error.message,
        });
    }
};

exports.reuploadCoa = async (req, res) => {
    try {
        const { productId, coaIndex } = req.params;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        if (product.coas[coaIndex]) {
            await deleteFileFromCloudinary(product.coas[coaIndex]);
        }

        // Upload new file
        const uploaded = await sendImageToCloudinary(file.originalname, file.path);

        product.coas[coaIndex] = uploaded.secure_url;
        await product.save();

        res.json({ success: true, message: "COA re-uploaded successfully", coas: product.coas });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to re-upload COA", error: error.message });
    }
};

exports.deleteCoa = async (req, res) => {
    try {
        const { productId, coaIndex } = req.params;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const fileUrl = product.coas[coaIndex];
        if (!fileUrl) {
            return res.status(404).json({ success: false, message: "COA not found" });
        }

        await deleteFileFromCloudinary(fileUrl);

        product.coas.splice(coaIndex, 1);
        await product.save();

        res.json({ success: true, message: "COA deleted successfully", coas: product.coas });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to delete COA", error: error.message });
    }
};
