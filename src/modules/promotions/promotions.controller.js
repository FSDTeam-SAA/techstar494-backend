const Promotion = require("./promotions.model");

// Create Promotion
const createPromotion = async (req, res) => {
    try {
        const { title } = req.body;

        if (!title) {
            return res.status(400).json({
                success: false,
                message: "Title is required",
            });
        }

        const newPromotion = await Promotion.create({ title });

        res.status(201).json({
            success: true,
            message: "Promotion created successfully",
            data: newPromotion,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create promotion",
            error: error.message,
        });
    }
};

// Get All Promotions
const getPromotions = async (req, res) => {
    try {
        const promotions = await Promotion.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: "Promotions fetched successfully",
            count: promotions.length,
            data: promotions,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch promotions",
            error: error.message,
        });
    }
};

// Get Single Promotion
const getPromotionById = async (req, res) => {
    try {
        const promotion = await Promotion.findById(req.params.id);

        if (!promotion) {
            return res.status(404).json({
                success: false,
                message: "Promotion not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Promotion fetched successfully",
            data: promotion,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch promotion",
            error: error.message,
        });
    }
};

// Update Promotion
const updatePromotion = async (req, res) => {
    try {
        const { title } = req.body;

        const promotion = await Promotion.findByIdAndUpdate(
            req.params.id,
            { title },
            { new: true, runValidators: true }
        );

        if (!promotion) {
            return res.status(404).json({
                success: false,
                message: "Promotion not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Promotion updated successfully",
            data: promotion,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update promotion",
            error: error.message,
        });
    }
};

// Delete Promotion
const deletePromotion = async (req, res) => {
    try {
        const promotion = await Promotion.findByIdAndDelete(req.params.id);

        if (!promotion) {
            return res.status(404).json({
                success: false,
                message: "Promotion not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Promotion deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete promotion",
            error: error.message,
        });
    }
};

const promotionController = {
    createPromotion,
    getPromotions,
    getPromotionById,
    updatePromotion,
    deletePromotion,
};

module.exports = promotionController;
