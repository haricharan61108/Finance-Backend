import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.ts";
import type { UserPayload } from "../types/user.types.ts";
import { prisma } from "../config/db.ts";

export interface AuthRequest extends Request {
  user?: UserPayload;
}

export const authenticate = async (
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
    const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });
  
      if (!user || !user.isActive || !user.id) {
        return res.status(403).json({ message: "User inactive" });
      }

    req.user = decoded; 
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token provided" });
  }
};