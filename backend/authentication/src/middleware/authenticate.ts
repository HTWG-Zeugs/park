import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";

export interface AuthRequest extends Request {
  user?: { userId: string; tenantId: string };
}

export function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const token = req.cookies?.authToken;

  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as {
      userId: string;
      tenantId: string;
    };
    req.user = decoded;
    next();
  } catch (error) {
    res.clearCookie("authToken").status(403).json({ message: "Token is expired" });
  }
}
