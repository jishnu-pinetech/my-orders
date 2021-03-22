const mongoose = require("../connectors/mongo");
const Schema = mongoose.Schema;


const Orders = Schema(
    {
        id_user: { type: Schema.Types.ObjectId, ref: 'users' },
        id_product: { type: Schema.Types.ObjectId, ref: 'products' },
        quantity: {
            desc: "The quantity.",
            type: Number,
            required: true,
            select: true,
        },
        reduction: {
            desc: 'reduction',
            type: String,
            default: 0,
            required: true,
            select: true,
        },
        discount: {
            desc: "discount.",
            type: Number,
            default: 0,
            select: true,
            required: true,
        },
        sub_total: {
            desc: "Sub total.",
            type: Number,
            default: 0,
            select: true,
            required: true,
        },
        grand_total: {
            desc: "Grand total.",
            type: Number,
            default: 0,
            select: true,
            required: true,
        }
    },
    {
        strict: true,
        versionKey: false,
        timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    }
);

module.exports = mongoose.model("orders", Orders);
