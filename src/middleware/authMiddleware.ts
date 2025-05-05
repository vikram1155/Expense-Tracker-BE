import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};
