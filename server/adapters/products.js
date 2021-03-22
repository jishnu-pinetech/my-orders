const mongoose = require("../connectors/mongo");


const ProductsSchema = new mongoose.Schema(
    {
        name: {
            desc: "product name",
            type: String,
            required: true,
            select: true,
        },
        price: {
            desc: "unit price",
            type: Number,
            required: true,
            default: 0,
            select: true,
        },
        quantity: {
            desc: "quantity",
            type: Number,
            required: true,
            default: 0,
            select: true,
        }
    },
    {
        strict: true,
        versionKey: false,
        timestamps: { createdAt: "createdAt" },
    }
);

module.exports = mongoose.model("products", ProductsSchema);
