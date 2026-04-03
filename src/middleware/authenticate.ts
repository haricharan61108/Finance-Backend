import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import type { UserPayload } from "../types/user.types";

export interface AuthRequest extends Request {
  user?: UserPayload;
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const token = authHeader.split(" ")[1];
    if(!token) {    
      return res.status(401).json({ message: "Invalid token" });
    }
    const decoded = verifyToken(token);

    req.user = decoded; 
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token provided" });
  }
};