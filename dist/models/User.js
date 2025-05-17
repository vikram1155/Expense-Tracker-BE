"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    dob: { type: String },
    transactions: [
        {
            type: { type: String, required: true },
            amount: { type: Number, required: true },
            name: { type: String, required: true },
            category: { type: String, required: true },
            date: { type: String, required: true },
            method: { type: String, required: true },
            comments: { type: String },
        },
    ],
});
exports.default = (0, mongoose_1.model)("User", userSchema);
