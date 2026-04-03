import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../../config/db.ts";
import { generateToken } from "../../utils/jwt.ts";


export const register = async (req: Request, res: Response) => {
    const { email, password, name, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name,
            role,
          },
    });
    res.json(user);
}

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  if (!user.isActive) {
    return res.status(403).json({ message: "User disabled" });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const token = generateToken({
    id: user.id,
    role: user.role,
    name: user.name,
  });

  res.json({ token });
}