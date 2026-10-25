import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthRequest } from "../middleware/auth";
import { prisma } from "../utils/prisma";
import { AppError } from "../utils/AppError";

export const listApps = asyncHandler(async (req: AuthRequest, res: Response) => {
  const apps = await prisma.connectedApp.findMany({ where: { userId: req.userId }, orderBy: { connectedAt: "asc" } });
  res.json({ apps });
});

export const connectApp = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { provider, accountLabel } = req.body;

  // All providers currently run in MOCK mode until real OAuth credentials are
  // configured server-side (see /server/.env.example and each integrations/* file).
  const app = await prisma.connectedApp.upsert({
    where: { userId_provider: { userId: req.userId!, provider } },
    update: { status: "MOCK", accountLabel },
    create: { userId: req.userId!, provider, accountLabel, status: "MOCK" },
  });

  await prisma.activityLog.create({ data: { userId: req.userId!, type: "app.connected", message: `Connected ${provider} (mock)` } });
  res.status(201).json({ app });
});

export const disconnectApp = asyncHandler(async (req: AuthRequest, res: Response) => {
  const app = await prisma.connectedApp.findFirst({ where: { id: req.params.id, userId: req.userId } });
  if (!app) throw new AppError("Connected app not found", 404);
  await prisma.connectedApp.delete({ where: { id: app.id } });
  res.status(204).send();
});
