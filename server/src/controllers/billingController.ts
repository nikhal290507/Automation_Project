import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthRequest } from "../middleware/auth";
import { prisma } from "../utils/prisma";

export const getBilling = asyncHandler(async (req: AuthRequest, res: Response) => {
  const subscription = await prisma.subscription.findUnique({ where: { userId: req.userId } });
  res.json({ subscription });
});

// NOTE: no real payment processor is wired up here (see README). This flips
// the plan flag directly so the Premium feature gates can be demoed end to end.
export const upgrade = asyncHandler(async (req: AuthRequest, res: Response) => {
  const subscription = await prisma.subscription.upsert({
    where: { userId: req.userId },
    update: { plan: "PREMIUM", status: "ACTIVE", currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    create: { userId: req.userId!, plan: "PREMIUM", status: "ACTIVE", currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
  });
  await prisma.activityLog.create({ data: { userId: req.userId!, type: "billing.upgraded", message: "Upgraded to Premium" } });
  res.json({ subscription });
});

export const downgrade = asyncHandler(async (req: AuthRequest, res: Response) => {
  const subscription = await prisma.subscription.update({ where: { userId: req.userId }, data: { plan: "FREE", status: "ACTIVE" } });
  res.json({ subscription });
});
