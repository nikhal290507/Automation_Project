import { Response } from "express";
import { prisma } from "../utils/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthRequest } from "../middleware/auth";
import { AppError } from "../utils/AppError";

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    include: { subscription: true, connectedApps: true },
  });
  if (!user) throw new AppError("User not found", 404);
  const { passwordHash: _passwordHash, ...safeUser } = user;
  res.json({ user: safeUser });
});

export const updateMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.update({ where: { id: req.userId }, data: req.body });
  const { passwordHash: _passwordHash, ...safeUser } = user;
  res.json({ user: safeUser });
});
