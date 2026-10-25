import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthRequest } from "../middleware/auth";
import { prisma } from "../utils/prisma";

export const listActivity = asyncHandler(async (req: AuthRequest, res: Response) => {
  const limit = Math.min(Number(req.query.limit ?? 50), 200);
  const logs = await prisma.activityLog.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  res.json({ logs });
});
