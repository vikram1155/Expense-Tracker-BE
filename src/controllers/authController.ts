import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import crypto from "crypto";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// Signup
export const signup: RequestHandler = async (req, res) => {
  const { name, email, password, phone, dob } = req.body;

  try {
    if (!name || !email || !password) {
      res.status(400).json({ error: "Name, email, and password are required" });
      return;
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: "User already exists" });
      return;
    }
    // SHA-256
    const user = new User({
      name,
      email,
      password,
      phone: phone || undefined,
      dob: dob || undefined,
      transactions: [],
    });
    await user.save();

    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: "1000h",
    });
    res.status(201).json({ user: { name, email, phone, dob }, token });
  } catch (err) {
    console.error("Error in signup:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Login
export const login: RequestHandler = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    // SHA-256 hashed password
    if (password !== user.password) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: "1000h",
    });
    res.json({
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        dob: user.dob,
      },
      token,
    });
  } catch (err) {
    console.error("Error in login:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Edit Profile
export const editProfile: RequestHandler = async (req, res) => {
  const { name, phone, dob } = req.body;
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

    if (!name || !name.trim()) {
      res.status(400).json({ error: "Name is required" });
      return;
    }
    if (phone && !/^\+?[1-9]\d{1,14}$/.test(phone)) {
      res.status(400).json({ error: "Invalid phone number" });
      return;
    }
    if (phone && phone.length !== 10) {
      res.status(400).json({ error: "Invalid phone number" });
      return;
    }
    if (dob && !/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
      res.status(400).json({ error: "Invalid date (YYYY-MM-DD)" });
      return;
    }

    const user: IUser | null = await User.findById(decoded.id);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    user.name = name.trim();
    user.phone = phone || undefined;
    user.dob = dob || undefined;
    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        dob: user.dob,
      },
    });
  } catch (err) {
    console.error("Error in editProfile:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Change Password
export const changePassword: RequestHandler = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
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

    if (!currentPassword) {
      res.status(400).json({ error: "Current password is required" });
      return;
    }
    if (!newPassword || newPassword.length !== 64) {
      res.status(400).json({
        error:
          "Invalid new password format (must be a 64-character SHA-256 hash)",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      res.status(400).json({ error: "Passwords do not match" });
      return;
    }

    const user: IUser | null = await User.findById(decoded.id);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    let isMatch = false;
    if (user.password.startsWith("$2b$")) {
      isMatch = await bcrypt.compare(currentPassword, user.password);
    } else {
      isMatch = currentPassword === user.password;
    }

    if (!isMatch) {
      console.log(
        "Password mismatch:",
        { currentPassword },
        { storedPassword: user.password }
      );
      res.status(401).json({ error: "Current password is incorrect" });
      return;
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Error in changePassword:", err);
    res.status(500).json({ error: "Server error" });
  }
};
