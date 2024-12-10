import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

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
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "JWT secret is not defined" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as unknown as {
      userId: string;
      tenantId: string;
    };
    req.user = decoded;
    next();
  } catch (error) {
    res.clearCookie("authToken").status(403).json({ message: "Token is expired" });
  }
}
