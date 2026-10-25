import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthRequest } from "../middleware/auth";
import { prisma } from "../utils/prisma";
import { AppError } from "../utils/AppError";

export const getFocusStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const active = await prisma.focusSession.findFirst({ where: { userId: req.userId, isActive: true } });
  const history = await prisma.focusSession.findMany({ where: { userId: req.userId }, orderBy: { startedAt: "desc" }, take: 10 });
  res.json({ active, history });
});

export const startFocus = asyncHandler(async (req: AuthRequest, res: Response) => {
  await prisma.focusSession.updateMany({ where: { userId: req.userId, isActive: true }, data: { isActive: false, endedAt: new Date() } });
  const session = await prisma.focusSession.create({ data: { userId: req.userId!, isActive: true, reason: req.body.reason } });
  await prisma.activityLog.create({ data: { userId: req.userId!, type: "focus.enabled", message: "Focus Mode enabled" } });
  res.status(201).json({ session });
});

export const toggleFocus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const session = await prisma.focusSession.findFirst({ where: { id: req.params.id, userId: req.userId } });
  if (!session) throw new AppError("Focus session not found", 404);

  const updated = await prisma.focusSession.update({
    where: { id: session.id },
    data: session.isActive ? { isActive: false, endedAt: new Date() } : { isActive: true, endedAt: null },
  });

  await prisma.activityLog.create({
    data: { userId: req.userId!, type: updated.isActive ? "focus.enabled" : "focus.disabled", message: `Focus Mode ${updated.isActive ? "enabled" : "disabled"}` },
  });

  res.json({ session: updated });
});
