import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import User, { IUser, ITransaction } from "../models/User";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// Create Transaction
export const createTransaction: RequestHandler = async (req, res) => {
  const { type, amount, name, category, date, method, comments } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  try {
    if (!token) {
      res.status(401).json({ error: "No token provided" });
      return;
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    } catch (error) {
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
    if (
      !method ||
      !["upi", "card", "cash", "net banking"].includes(method.toLowerCase())
    ) {
      res.status(400).json({
        error: 'Method must be "upi", "card", "cash", or "net banking"',
      });
      return;
    }

    const user: IUser | null = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const newTransaction: ITransaction & { id: string } = {
      id: uuidv4(),
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
  } catch (err) {
    console.error("Error in createTransaction:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Read Transactions
export const getTransactions: RequestHandler = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  try {
    if (!token) {
      res.status(401).json({ error: "No token provided" });
      return;
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    } catch (error) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    const userId = decoded.id;

    const user: IUser | null = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({
      transactions: user.transactions,
    });
  } catch (err) {
    console.error("Error in getTransactions:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Read transaction - id
export const getTransaction: RequestHandler = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const transactionId = req.params.id;

  try {
    if (!token) {
      res.status(401).json({ error: "No token provided" });
      return;
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    } catch (error) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    const userId = decoded.id;

    const user: IUser | null = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const transaction = user.transactions.find(
      (t) => t.id.toString() === transactionId
    );
    if (!transaction) {
      res.status(404).json({ error: "Transaction not found" });
      return;
    }

    res.json({
      transaction,
    });
  } catch (err) {
    console.error("Error in getTransaction:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Update Transaction
export const updateTransaction: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const { type, amount, name, category, date, method, comments } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  try {
    if (!token) {
      res.status(401).json({ error: "No token provided" });
      return;
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    } catch (error) {
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
    if (
      !method ||
      !["upi", "card", "cash", "net banking"].includes(method.toLowerCase())
    ) {
      res.status(400).json({
        error: 'Method must be "upi", "card", "cash", or "net banking"',
      });
      return;
    }

    const user: IUser | null = await User.findById(userId);
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
  } catch (err) {
    console.error("Error in updateTransaction:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete Transaction
export const deleteTransaction: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const token = req.headers.authorization?.split(" ")[1];

  try {
    if (!token) {
      res.status(401).json({ error: "No token provided" });
      return;
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    } catch (error) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    const userId = decoded.id;

    const user: IUser | null = await User.findById(userId);
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
  } catch (err) {
    console.error("Error in deleteTransaction:", err);
    res.status(500).json({ error: "Server error" });
  }
};
