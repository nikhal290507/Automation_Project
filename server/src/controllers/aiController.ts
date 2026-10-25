import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthRequest } from "../middleware/auth";
import { classifyEmail, generateReply, generateAutomationFromText } from "../ai/aiService";
import { env } from "../utils/env";
import { prisma } from "../utils/prisma";
import { AppError } from "../utils/AppError";

async function requirePremium(userId: string) {
  const subscription = await prisma.subscription.findUnique({ where: { userId } });
  if (subscription?.plan !== "PREMIUM") {
    throw new AppError("This AI feature requires AutoFlow Premium.", 403);
  }
}

export const classify = asyncHandler(async (req: AuthRequest, res: Response) => {
  await requirePremium(req.userId!);
  const result = await classifyEmail(req.body);
  res.json({ classification: result, mode: env.anthropicApiKey ? "live" : "mock" });
});

export const reply = asyncHandler(async (req: AuthRequest, res: Response) => {
  await requirePremium(req.userId!);
  const result = await generateReply(req.body);
  res.json({ reply: result, mode: env.anthropicApiKey ? "live" : "mock" });
});

export const createAutomationFromPrompt = asyncHandler(async (req: AuthRequest, res: Response) => {
  await requirePremium(req.userId!);
  const result = await generateAutomationFromText(req.body.prompt);
  res.json({ automation: result, mode: env.anthropicApiKey ? "live" : "mock" });
});
