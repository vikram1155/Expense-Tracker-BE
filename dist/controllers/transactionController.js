"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTransaction = exports.updateTransaction = exports.getTransaction = exports.getTransactions = exports.createTransaction = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const dotenv_1 = __importDefault(require("dotenv"));
const uuid_1 = require("uuid");
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
// Create Transaction
const createTransaction = async (req, res) => {
    var _a;
    const { type, amount, name, category, date, method, comments } = req.body;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    try {
        if (!token) {
            res.status(401).json({ error: "No token provided" });
            return;
        }
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        }
        catch (error) {
            res.status(401).json({ error: "Invalid token" });
            return;
        }
        const userId = decoded.id;
        console.log("Decoded userId:", userId);
        if (!type || !["debit", "credit"].includes(type.toLowerCase())) {
            res.status(400).json({ error: 'Type must be "debit" or "credit"' });
            return;
        }
        if (!amount || amount <= 0) {
            res.status(400).json({ error: "Amount must be greater than 0" });
            return;
        }
        if (!name || !name.trim()) {
            res.status(400).json({ error: "Name is required" });
            return;
        }
        if (!category || !category.trim()) {
            res.status(400).json({ error: "Category is required" });
            return;
        }
        if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            res.status(400).json({ error: "Date is required (YYYY-MM-DD)" });
            return;
        }
        if (!method ||
            !["upi", "card", "cash", "net banking"].includes(method.toLowerCase())) {
            res.status(400).json({
                error: 'Method must be "upi", "card", "cash", or "net banking"',
            });
            return;
        }
        const user = await User_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        const newTransaction = {
            id: (0, uuid_1.v4)(),
            type: type.toLowerCase(),
            amount,
            name: name.trim(),
            category: category.trim(),
            date,
            method: method.toLowerCase(),
            comments: comments ? comments.trim() : undefined,
        };
        user.transactions.push(newTransaction);
        await user.save();
        console.log("Saved transaction:", newTransaction);
        res.status(201).json({
            message: "Transaction created successfully",
            transaction: newTransaction,
        });
    }
    catch (err) {
        console.error("Error in createTransaction:", err);
        res.status(500).json({ error: "Server error" });
    }
};
exports.createTransaction = createTransaction;
// Read Transactions
const getTransactions = async (req, res) => {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    try {
        if (!token) {
            res.status(401).json({ error: "No token provided" });
            return;
        }
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        }
        catch (error) {
            res.status(401).json({ error: "Invalid token" });
            return;
        }
        const userId = decoded.id;
        const user = await User_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        res.json({
            transactions: user.transactions,
        });
    }
    catch (err) {
        console.error("Error in getTransactions:", err);
        res.status(500).json({ error: "Server error" });
    }
};
exports.getTransactions = getTransactions;
// Read transaction - id
const getTransaction = async (req, res) => {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    const transactionId = req.params.id;
    try {
        if (!token) {
            res.status(401).json({ error: "No token provided" });
            return;
        }
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        }
        catch (error) {
            res.status(401).json({ error: "Invalid token" });
            return;
        }
        const userId = decoded.id;
        const user = await User_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        const transaction = user.transactions.find((t) => t.id.toString() === transactionId);
        if (!transaction) {
            res.status(404).json({ error: "Transaction not found" });
            return;
        }
        res.json({
            transaction,
        });
    }
    catch (err) {
        console.error("Error in getTransaction:", err);
        res.status(500).json({ error: "Server error" });
    }
};
exports.getTransaction = getTransaction;
// Update Transaction
const updateTransaction = async (req, res) => {
    var _a;
    const { id } = req.params;
    const { type, amount, name, category, date, method, comments } = req.body;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    try {
        if (!token) {
            res.status(401).json({ error: "No token provided" });
            return;
        }
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        }
        catch (error) {
            res.status(401).json({ error: "Invalid token" });
            return;
        }
        const userId = decoded.id;
        if (!type || !["debit", "credit"].includes(type.toLowerCase())) {
            res.status(400).json({ error: 'Type must be "debit" or "credit"' });
            return;
        }
        if (!amount || amount <= 0) {
            res.status(400).json({ error: "Amount must be greater than 0" });
            return;
        }
        if (!name || !name.trim()) {
            res.status(400).json({ error: "Name is required" });
            return;
        }
        if (!category || !category.trim()) {
            res.status(400).json({ error: "Category is required" });
            return;
        }
        if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            res.status(400).json({ error: "Date is required (YYYY-MM-DD)" });
            return;
        }
        if (!method ||
            !["upi", "card", "cash", "net banking"].includes(method.toLowerCase())) {
            res.status(400).json({
                error: 'Method must be "upi", "card", "cash", or "net banking"',
            });
            return;
        }
        const user = await User_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        const transaction = user.transactions.find((t) => t.id === id);
        if (!transaction) {
            res.status(404).json({ error: "Transaction not found" });
            return;
        }
        transaction.type = type.toLowerCase();
        transaction.amount = amount;
        transaction.name = name.trim();
        transaction.category = category.trim();
        transaction.date = date;
        transaction.method = method.toLowerCase();
        transaction.comments = comments ? comments.trim() : undefined;
        await user.save();
        res.json({
            message: "Transaction updated successfully",
            transaction,
        });
    }
    catch (err) {
        console.error("Error in updateTransaction:", err);
        res.status(500).json({ error: "Server error" });
    }
};
exports.updateTransaction = updateTransaction;
// Delete Transaction
const deleteTransaction = async (req, res) => {
    var _a;
    const { id } = req.params;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    try {
        if (!token) {
            res.status(401).json({ error: "No token provided" });
            return;
        }
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        }
        catch (error) {
            res.status(401).json({ error: "Invalid token" });
            return;
        }
        const userId = decoded.id;
        const user = await User_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        const transactionIndex = user.transactions.findIndex((t) => t.id === id);
        if (transactionIndex === -1) {
            res.status(404).json({ error: "Transaction not found" });
            return;
        }
        user.transactions.splice(transactionIndex, 1);
        await user.save();
        res.json({ message: "Transaction deleted successfully" });
    }
    catch (err) {
        console.error("Error in deleteTransaction:", err);
        res.status(500).json({ error: "Server error" });
    }
};
exports.deleteTransaction = deleteTransaction;
