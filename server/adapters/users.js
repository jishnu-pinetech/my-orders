const mongoose = require("../connectors/mongo");


const UsersSchema = new mongoose.Schema(
    {
        name: {
            desc: "user name",
            type: String,
            required: true,
            select: true,
        },
    },
    {
        strict: true,
        versionKey: false,
        timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    }
);

module.exports = mongoose.model("users", UsersSchema);
