import { RequestHandler } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

export const signup: RequestHandler = async (req, res) => {
  const { name, email, phone, dob, password } = req.body;
  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: "Email already exists" });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      phone,
      dob,
      password: hashedPassword,
      transactions: [],
    });
    const token = jwt.sign({ id: user.id }, JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(201).json({
      message: "User created",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        dob: user.dob,
      },
      token,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

export const login: RequestHandler = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const token = jwt.sign({ id: user.id }, JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        dob: user.dob,
      },
      token,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

export const changePassword: RequestHandler = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  try {
    // Verify token
    if (!token) {
      res.status(401).json({ error: "No token provided" });
      return;
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    } catch (error) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    const userId = decoded.id;

    // Validate input fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }

    if (newPassword !== confirmPassword) {
      res.status(400).json({ error: "New passwords do not match" });
      return;
    }

    if (newPassword.length < 6) {
      res
        .status(400)
        .json({ error: "New password must be at least 6 characters" });
      return;
    }

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      res.status(401).json({ error: "Current password is incorrect" });
      return;
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword });

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

export const editProfile: RequestHandler = async (req, res) => {
  const { name, phone, dob } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  try {
    // Verify token
    if (!token) {
      res.status(401).json({ error: "No token provided" });
      return;
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    } catch (error) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    const userId = decoded.id;

    // Validate input fields
    if (!name || !name.trim()) {
      res.status(400).json({ error: "Name is required" });
      return;
    }

    if (phone && !/^\+?[1-9]\d{1,14}$/.test(phone)) {
      res.status(400).json({ error: "Invalid phone number" });
      return;
    }

    if (dob && !/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
      res.status(400).json({ error: "Invalid date (YYYY-MM-DD)" });
      return;
    }

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Update user
    await user.update({
      name: name.trim(),
      phone: phone || null,
      dob: dob || null,
    });

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        dob: user.dob,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
