import { Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../utils/prisma";
import { signToken } from "../utils/jwt";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthRequest } from "../middleware/auth";

const publicUser = (u: { id: string; email: string; name: string; roleType: string; onboarded: boolean; avatarUrl: string | null }) => ({
  id: u.id,
  email: u.email,
  name: u.name,
  roleType: u.roleType,
  onboarded: u.onboarded,
  avatarUrl: u.avatarUrl,
});

export const register = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, email, password } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) throw new AppError("An account with this email already exists", 409);

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email: normalizedEmail,
      passwordHash,
      subscription: { create: { plan: "FREE", status: "ACTIVE" } },
    },
  });

  await prisma.activityLog.create({ data: { userId: user.id, type: "user.registered", message: "Account created" } });

  const token = signToken({ userId: user.id, email: user.email });
  res.status(201).json({ token, user: publicUser(user) });
});

export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user) throw new AppError("Invalid email or password", 401);

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new AppError("Invalid email or password", 401);

  const token = signToken({ userId: user.id, email: user.email });
  res.json({ token, user: publicUser(user) });
});

export const me = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) throw new AppError("User not found", 404);
  res.json({ user: publicUser(user) });
});
