import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthRequest } from "../middleware/auth";
import * as automationService from "../automation/automationService";
import { prisma } from "../utils/prisma";
import { AppError } from "../utils/AppError";

const FREE_AUTOMATION_LIMIT = 5;

export const listAutomations = asyncHandler(async (req: AuthRequest, res: Response) => {
  const automations = await automationService.listAutomations(req.userId!);
  res.json({ automations });
});

export const getAutomation = asyncHandler(async (req: AuthRequest, res: Response) => {
  const automation = await automationService.getAutomation(req.userId!, req.params.id);
  res.json({ automation });
});

export const createAutomation = asyncHandler(async (req: AuthRequest, res: Response) => {
  const subscription = await prisma.subscription.findUnique({ where: { userId: req.userId } });
  if (subscription?.plan !== "PREMIUM") {
    const count = await prisma.automation.count({ where: { userId: req.userId } });
    if (count >= FREE_AUTOMATION_LIMIT) {
      throw new AppError(`Free plan is limited to ${FREE_AUTOMATION_LIMIT} automations. Upgrade to Premium for unlimited automations.`, 403);
    }
  }

  const automation = await automationService.createAutomation(req.userId!, req.body);
  await prisma.activityLog.create({ data: { userId: req.userId!, type: "automation.created", message: `Created "${automation.name}"` } });
  res.status(201).json({ automation });
});

export const updateAutomation = asyncHandler(async (req: AuthRequest, res: Response) => {
  const automation = await automationService.updateAutomation(req.userId!, req.params.id, req.body);
  res.json({ automation });
});

export const deleteAutomation = asyncHandler(async (req: AuthRequest, res: Response) => {
  await automationService.deleteAutomation(req.userId!, req.params.id);
  res.status(204).send();
});

export const toggleAutomation = asyncHandler(async (req: AuthRequest, res: Response) => {
  const automation = await automationService.toggleAutomation(req.userId!, req.params.id);
  res.json({ automation });
});

export const runAutomation = asyncHandler(async (req: AuthRequest, res: Response) => {
  const execution = await automationService.runAutomation(req.userId!, req.params.id, req.body.context ?? {});
  res.status(201).json({ execution });
});
