import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthRequest } from "../middleware/auth";
import { prisma } from "../utils/prisma";
import { gmailProvider, calendarProvider } from "../integrations";

// Aggregates everything the Dashboard page needs into a single round trip
// instead of forcing the client to make 7 separate requests on load.
export const getDashboard = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;

  const [user, automations, recentActivity, focusSession, connectedApps, emails, events, executionsLast7Days] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.automation.findMany({ where: { userId }, include: { triggers: true, actions: true }, orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.activityLog.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.focusSession.findFirst({ where: { userId, isActive: true } }),
    prisma.connectedApp.findMany({ where: { userId } }),
    gmailProvider.fetchRecentEmails("me"),
    calendarProvider.fetchUpcomingEvents(),
    prisma.automationExecution.findMany({ where: { userId, createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
  ]);

  const successCount = executionsLast7Days.filter((e) => e.status === "SUCCESS").length;
  const productivityScore = Math.min(100, 55 + successCount * 4 + (focusSession ? 5 : 0) + Math.min(automations.length, 5) * 3);

  res.json({
    greetingName: user?.name.split(" ")[0] ?? "there",
    productivityScore,
    importantEmails: emails.filter((e) => e.importance === "high"),
    meetingsToday: events,
    activeAutomations: automations.filter((a) => a.isEnabled),
    automations,
    focusSession,
    recentActivity,
    connectedApps,
    dailySummary: {
      emailsProcessed: emails.length,
      automationsRun: executionsLast7Days.length,
      successRate: executionsLast7Days.length ? Math.round((successCount / executionsLast7Days.length) * 100) : 100,
    },
  });
});
