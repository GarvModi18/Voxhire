import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// 🛡️ Define a Custom User Payload Type
interface UserPayload {
  id: string;
  email: string;
}

// 🛡️ Extend Express Request Interface Properly
declare module "express-serve-static-core" {
  interface Request {
    user?: UserPayload; // ✅ Ensure `user` is always the same type
  }
}

// ✅ Middleware to Protect Routes
export const protect = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Unauthorized - No Token Provided" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as UserPayload;
    req.user = decoded; // ✅ TypeScript now recognizes `user`
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid Token" });
  }
};
