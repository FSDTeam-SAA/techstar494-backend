const mongoose = require("mongoose");

const promotionSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const Promotion =
    mongoose.models.Promotion || mongoose.model("Promotion", promotionSchema);

module.exports = Promotion;
