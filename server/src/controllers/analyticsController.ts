import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthRequest } from "../middleware/auth";
import { prisma } from "../utils/prisma";

export const getAnalytics = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  const executions = await prisma.automationExecution.findMany({
    where: { userId, createdAt: { gte: since } },
    include: { automation: { select: { name: true } } },
    orderBy: { createdAt: "asc" },
  });

  const byDay = new Map<string, { date: string; success: number; failed: number; skipped: number }>();
  for (const e of executions) {
    const key = e.createdAt.toISOString().slice(0, 10);
    if (!byDay.has(key)) byDay.set(key, { date: key, success: 0, failed: 0, skipped: 0 });
    const bucket = byDay.get(key)!;
    if (e.status === "SUCCESS" || e.status === "PARTIAL") bucket.success += 1;
    else if (e.status === "FAILED") bucket.failed += 1;
    else bucket.skipped += 1;
  }

  const byAutomation = new Map<string, number>();
  for (const e of executions) {
    byAutomation.set(e.automation.name, (byAutomation.get(e.automation.name) ?? 0) + 1);
  }

  res.json({
    timeline: Array.from(byDay.values()),
    topAutomations: Array.from(byAutomation.entries()).map(([name, runs]) => ({ name, runs })).sort((a, b) => b.runs - a.runs).slice(0, 5),
    totalRuns: executions.length,
    successRate: executions.length ? Math.round((executions.filter((e) => e.status === "SUCCESS").length / executions.length) * 100) : 100,
  });
});
