import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthRequest } from "../middleware/auth";
import { prisma } from "../utils/prisma";
import { AppError } from "../utils/AppError";
import * as automationService from "../automation/automationService";

export const listTemplates = asyncHandler(async (req: AuthRequest, res: Response) => {
  const templates = await prisma.template.findMany({ orderBy: { createdAt: "asc" } });
  res.json({ templates });
});

export const useTemplate = asyncHandler(async (req: AuthRequest, res: Response) => {
  const template = await prisma.template.findUnique({ where: { id: req.params.id } });
  if (!template) throw new AppError("Template not found", 404);

  const subscription = await prisma.subscription.findUnique({ where: { userId: req.userId } });
  if (template.isPremium && subscription?.plan !== "PREMIUM") {
    throw new AppError("This template requires AutoFlow Premium.", 403);
  }

  const automation = await automationService.createAutomation(req.userId!, {
    name: template.name,
    description: template.description,
    trigger: { type: template.triggerType, config: (template.triggerConfig as Record<string, unknown>) ?? {} },
    conditions: (template.conditions as never[]) ?? [],
    actions: template.actions as never[],
  });

  await prisma.activityLog.create({ data: { userId: req.userId!, type: "template.used", message: `Used template "${template.name}"` } });
  res.status(201).json({ automation });
});
