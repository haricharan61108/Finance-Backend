import type { Request, Response } from "express";
import { prisma } from "../../config/db.ts";

type Params = {
  id: string;
};

export const updateUserRole = async (req: Request<Params>, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (!role) {
      return res.status(400).json({ message: "Role is required" });
    }

    if (role !== "VIEWER" && role !== "ANALYST" && role !== "ADMIN") {
      return res.status(400).json({ message: "Invalid role. Must be VIEWER, ANALYST, or ADMIN" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return res.json(user);
  } catch (error) {
    console.error("Update user role error:", error);
    return res.status(500).json({ message: "Failed to update user role" });
  }
};

export const updateUserStatus = async (req: Request<Params>, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (isActive === undefined || isActive === null) {
      return res.status(400).json({ message: "isActive is required" });
    }

    if (typeof isActive !== "boolean") {
      return res.status(400).json({ message: "isActive must be a boolean" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return res.json(user);
  } catch (error) {
    console.error("Update user status error:", error);
    return res.status(500).json({ message: "Failed to update user status" });
  }
};