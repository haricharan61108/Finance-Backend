import type { Request, Response } from "express";
import { prisma } from "../../config/db.ts";

type Params = {
    id: string;
  };
export const updateUserRole = async (req: Request<Params>, res: Response) => {
    const { id } = req.params;
    const { role } = req.body;
    if (!id || !role) {
      return res.status(400).json({ message: "User and role are required" });
    }
    const user = await prisma.user.update({
      where: { id },
      data: { role },
    });
  
    res.json(user);
 };

 export const updateUserStatus = async (req: Request<Params>, res: Response) => {
    const { id } = req.params;
    const { isActive } = req.body;
  
    const user = await prisma.user.update({
      where: { id },
      data: { isActive },
    });
  
    res.json(user);
  };